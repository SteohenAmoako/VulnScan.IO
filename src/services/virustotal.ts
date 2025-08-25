
import fetch, { RequestInit } from 'node-fetch';

const VIRUSTOTAL_API_URL = 'https://www.virustotal.com/api/v3';
const MAX_POLL_ATTEMPTS = 10;
const POLL_INTERVAL = 7000; // 7 seconds

// Simple in-memory cache to avoid re-scanning the same URL within a short time.
const cache = new Map<string, any>();

async function fetchWithApiKey(endpoint: string, options: RequestInit = {}) {
    const apiKey = process.env.VIRUSTOTAL_API_KEY;
    if (!apiKey) {
        return { error: { message: 'VIRUSTOTAL_API_KEY is not set in the environment variables.' } };
    }

    const headers = {
        ...options.headers,
        'x-apikey': apiKey,
        'Accept': 'application/json'
    };
    
    if (options.method === 'POST') {
        (headers as any)['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    try {
        const response = await fetch(`${VIRUSTOTAL_API_URL}${endpoint}`, { ...options, headers });
        
        if (!response.ok) {
            const errorText = await response.text();
            // Return a structured error instead of throwing.
            try {
                // Try to parse the error from VirusTotal, which is usually JSON.
                const errorJson = JSON.parse(errorText);
                return { error: { message: errorJson.error.message || `VirusTotal API request failed with status ${response.status}`, code: errorJson.error.code }};
            } catch {
                // If parsing fails, return a generic error.
                return { error: { message: `VirusTotal API request failed with status ${response.status}: ${errorText}` } };
            }
        }
        
        // Handle cases where response is OK but body is empty
        const text = await response.text();
        return text ? JSON.parse(text) : {};

    } catch(error: any) {
        // Return a structured error for network or other unexpected issues.
        return { error: { message: `Failed to communicate with VirusTotal API: ${error.message}` } };
    }
}

// Submits a URL for analysis and returns the analysis ID or an error.
async function submitUrlForAnalysis(url: string): Promise<{analysisId?: string, error?: any}> {
    const response: any = await fetchWithApiKey('/urls', {
        method: 'POST',
        body: `url=${encodeURIComponent(url)}`,
    });
    
    if (response.error) {
        return { error: response.error };
    }

    const analysisId = response.data?.id;
    if (!analysisId) {
        return { error: { message: 'Analysis ID was not found in the VirusTotal response.' } };
    }
    return { analysisId };
}

// Retrieves the full analysis report for a given analysis ID
async function getUrlAnalysisReport(analysisId: string): Promise<any> {
    return await fetchWithApiKey(`/analyses/${analysisId}`);
}

// Main function to get the analysis for a URL
export async function getUrlAnalysis(url: string) {
    if (cache.has(url)) {
        return cache.get(url);
    }
    
    const { analysisId, error: submitError } = await submitUrlForAnalysis(url);

    if (submitError) {
        return { error: submitError };
    }
    
    if (!analysisId) {
        return { error: { message: 'No analysis ID returned from VirusTotal.'} };
    }

    // Poll the analysis endpoint until the status is 'completed'
    for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));

        const report = await getUrlAnalysisReport(analysisId);

        if (report.error) {
            // Stop polling if there's an unrecoverable error fetching the report
            return report;
        }

        const status = report.data?.attributes?.status;

        if (status === 'completed') {
            cache.set(url, report);
            return report;
        }
        
        // Continue polling if status is 'queued' or 'in-progress'
    }

    // If the loop finishes without a completed report, return a timeout error.
    return { error: { message: 'VirusTotal scan timed out. The analysis took too long to complete.' } };
}
