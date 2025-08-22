
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
    
    // Even if response.ok is false, the body might contain a valid report or error message.
    // So we try to parse it regardless of status code.
    try {
        const data = JSON.parse(text);
        
        // Handle specific API error format, but only if it's a real error.
        if (data.error && data.message) {
             return { error: data.message };
        }

        return data;

    } catch (e) {
        // This handles cases where the response is not valid JSON.
        if (!response.ok) {
            return { error: `Mozilla Observatory API request failed with status ${response.status} and non-JSON response: ${text}` };
        }
        // If it was a 2xx response but not JSON, it's an issue.
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

        // Handle immediate error from initiateScan (e.g., invalid hostname or API error)
        if (initialResponse.error) {
            return { error: initialResponse.error };
        }
        
        // Handle immediate successful (cached) report
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
