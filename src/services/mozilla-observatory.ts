
import fetch from 'node-fetch';

const OBSERVATORY_API_URL = 'https://observatory-api.mdn.mozilla.net/api/v2';
const MAX_RETRIES = 10;
const RETRY_DELAY = 5000; // 5 seconds

// Initiates a scan and returns the scan ID
async function initiateScan(host: string): Promise<any> {
    const response = await fetch(`${OBSERVATORY_API_URL}/scan?host=${host}&hidden=true`, {
        method: 'POST',
    });
    if (!response.ok) {
        const errorText = await response.text();
        // This is a special case for invalid hostnames. We want to return a structured error.
        if (response.status === 422) {
            try {
                const errorJson = JSON.parse(errorText);
                return { error: errorJson.message || 'Invalid hostname provided.' };
            } catch {
                return { error: 'Invalid hostname provided.' };
            }
        }
        throw new Error(`Mozilla Observatory API initiate scan failed with status ${response.status}: ${errorText}`);
    }
    const text = await response.text();
    // The API might return an empty response in some cases, so we check for that.
    if (!text) {
      return {};
    }
    return JSON.parse(text);
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
                return { error: 'Mozilla Observatory scan failed to complete.' };
            }
            console.log(`Mozilla Observatory scan state: ${data.state}. Retrying...`);
        } catch (error: any) {
             console.error('Error polling Mozilla Observatory:', error);
        }
    }
    return { error: 'Mozilla Observatory scan timed out after maximum retries.' };
}


// Main function to get the analysis for a host
export async function getMozillaObservatoryAnalysis(host: string): Promise<any> {
    console.log("Requesting new Mozilla Observatory scan for:", host);
    try {
        const initialResponse = await initiateScan(host);

        // Handle immediate error from initiateScan (e.g., invalid hostname)
        if (initialResponse.error) {
            return { error: initialResponse.error };
        }
        
        // Handle immediate successful (cached) report
        if (initialResponse.state === 'FINISHED') {
            console.log("Mozilla Observatory returned a report immediately.");
            return initialResponse;
        }

        const scanId = initialResponse?.scan_id;
        if (!scanId) {
             console.error("Unexpected response from Mozilla Observatory:", initialResponse);
             return { error: 'No scan_id returned from Mozilla Observatory and no finished state or error was found.' };
        }

        console.log(`Polling for Mozilla Observatory results for scan ID: ${scanId}`);
        return await getScanResults(scanId);
        
    } catch (error: any) {
        console.error('Error during getMozillaObservatoryAnalysis:', error);
        return { error: `Failed to get Mozilla Observatory report: ${error.message}` };
    }
}
