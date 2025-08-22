
import fetch, { RequestInit } from 'node-fetch';

const VIRUSTOTAL_API_URL = 'https://www.virustotal.com/api/v3';

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
        
        return response.json();
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

    const analysisId = response.data.id;
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

    // VirusTotal needs a few seconds to process the URL.
    await new Promise(resolve => setTimeout(resolve, 15000));

    const report = await getUrlAnalysisReport(analysisId);
    
    if (!report.error) {
        cache.set(url, report);
    }
    
    return report;
}
