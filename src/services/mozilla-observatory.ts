
import fetch from 'node-fetch';

const OBSERVATORY_API_URL = 'https://observatory-api.mdn.mozilla.net/api/v2';
const MAX_RETRIES = 10;
const RETRY_DELAY = 5000; // 5 seconds

// Initiates a scan and returns the scan ID
async function initiateScan(host: string): Promise<any> {
    const response = await fetch(`${OBSERVATORY_API_URL}/scan?host=${host}&hidden=true`, {
        method: 'POST',
    });

    const text = await response.text();
    
    try {
        const data = JSON.parse(text);
        
        if (data.error && data.message) {
             return { error: data.message };
        }

        return data;

    } catch (e) {
        if (!response.ok) {
            return { error: `Mozilla Observatory API request failed with status ${response.status} and non-JSON response: ${text}` };
        }
        return { error: 'Received an empty or invalid response from Mozilla Observatory.' };
    }
}


// Retrieves the results for a given scan ID, polling until complete
async function getScanResults(scanId: number): Promise<any> {
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            const response = await fetch(`${OBSERVATORY_API_URL}/getScanResults?scan=${scanId}`);
            if (!response.ok) {
                continue;
            }
            const data = await response.json();

            if (data.state === 'FINISHED') {
                return data;
            } else if (data.state === 'FAILED') {
                return { error: 'Mozilla Observatory scan failed to complete.' };
            }
        } catch (error: any) {
             // Let the loop continue on intermittent failures.
        }
    }
    return { error: 'Mozilla Observatory scan timed out after maximum retries.' };
}


// Main function to get the analysis for a host
export async function getMozillaObservatoryAnalysis(host: string): Promise<any> {
    try {
        const initialResponse = await initiateScan(host);

        if (initialResponse.error) {
            return { error: initialResponse.error };
        }
        
        if (initialResponse.state === 'FINISHED' || initialResponse.grade) {
            return initialResponse;
        }

        const scanId = initialResponse?.scan_id;
        if (!scanId) {
             return { error: 'No scan_id returned from Mozilla Observatory and no finished state or error was found.' };
        }

        return await getScanResults(scanId);
        
    } catch (error: any) {
        return { error: `Failed to get Mozilla Observatory report: ${error.message}` };
    }
}
