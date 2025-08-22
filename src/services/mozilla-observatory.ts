
import fetch from 'node-fetch';

const OBSERVATORY_API_URL = 'https://observatory-api.mdn.mozilla.net/api/v2';
const MAX_RETRIES = 10;
const RETRY_DELAY = 5000; // 5 seconds

// Initiates a scan and returns the scan ID
async function initiateScan(host: string): Promise<any> {
    try {
        const response = await fetch(`${OBSERVATORY_API_URL}/scan?host=${host}`, {
            method: 'POST',
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Mozilla Observatory API initiate scan failed with status ${response.status}: ${errorText}`);
        }
        const text = await response.text();
        // The API might return an empty response in some cases, so we check for that.
        if (!text) {
          return {};
        }
        return JSON.parse(text);
    } catch (error: any) {
        console.error('Error during initiateScan:', error);
        throw new Error(`Failed to initiate Mozilla Observatory scan: ${error.message}`);
    }
}

// Retrieves the results for a given scan ID, polling until complete
async function getScanResults(scanId: number): Promise<any> {
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            const response = await fetch(`${OBSERVATORY_API_URL}/getScanResults?scan=${scanId}`);
            if (!response.ok) {
                console.warn(`Polling Mozilla Observatory: Status ${response.status}`);
                continue;
            }
            const data = await response.json();

            if (data.state === 'FINISHED') {
                return data;
            } else if (data.state === 'FAILED') {
                throw new Error('Mozilla Observatory scan failed to complete.');
            }
            console.log(`Mozilla Observatory scan state: ${data.state}. Retrying...`);
        } catch (error: any) {
             console.error('Error polling Mozilla Observatory:', error);
        }
    }
    throw new Error('Mozilla Observatory scan timed out after maximum retries.');
}


// Main function to get the analysis for a host
export async function getMozillaObservatoryAnalysis(host: string): Promise<any> {
    console.log("Requesting new Mozilla Observatory scan for:", host);
    try {
        const initialResponse = await initiateScan(host);

        if (initialResponse && initialResponse.state === 'FINISHED') {
            console.log("Mozilla Observatory returned a cached report immediately.");
            return initialResponse;
        }

        if (initialResponse && initialResponse.error) {
            console.error("Mozilla Observatory API returned an error on initiation:", initialResponse.error);
            return { error: initialResponse.error };
        }
        
        const scanId = initialResponse?.scan_id;
        if (!scanId) {
             console.error("Unexpected response from Mozilla Observatory:", initialResponse);
             throw new Error('No scan_id returned from Mozilla Observatory and no finished state or error was found.');
        }

        console.log(`Polling for Mozilla Observatory results for scan ID: ${scanId}`);
        return await getScanResults(scanId);
        
    } catch (error: any) {
        console.error('Error during getMozillaObservatoryAnalysis:', error);
        return { error: `Failed to get Mozilla Observatory report: ${error.message}` };
    }
}
