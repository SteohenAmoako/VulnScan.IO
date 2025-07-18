import fetch, { RequestInit } from 'node-fetch';

const VIRUSTOTAL_API_URL = 'https://www.virustotal.com/api/v3';

// Simple in-memory cache to avoid re-scanning the same URL within a short time.
const cache = new Map<string, any>();

async function fetchWithApiKey(endpoint: string, options: RequestInit = {}) {
    const apiKey = process.env.VIRUSTOTAL_API_KEY;
    if (!apiKey) {
        throw new Error('VIRUSTOTAL_API_KEY is not set in the environment variables.');
    }

    const headers = {
        ...options.headers,
        'x-apikey': apiKey,
        'Accept': 'application/json'
    };
    
    // The VirusTotal API for submitting a URL for analysis requires a 'application/x-www-form-urlencoded' Content-Type
    // but the GET request for the report does not.
    if (options.method === 'POST') {
        (headers as any)['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    const response = await fetch(`${VIRUSTOTAL_API_URL}${endpoint}`, { ...options, headers });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`VirusTotal API Error (${response.status}): ${errorText}`);
        throw new Error(`Failed to fetch from VirusTotal API. Status: ${response.status}`);
    }
    
    return response.json();
}

// Submits a URL for analysis and returns the analysis ID.
async function submitUrlForAnalysis(url: string): Promise<string> {
    const response: any = await fetchWithApiKey('/urls', {
        method: 'POST',
        body: `url=${encodeURIComponent(url)}`,
    });
    // The ID for the analysis is what we need to fetch the report later.
    const analysisId = response.data.id;
    return analysisId;
}

// Retrieves the full analysis report for a given analysis ID
async function getUrlAnalysisReport(analysisId: string): Promise<any> {
    return await fetchWithApiKey(`/analyses/${analysisId}`);
}

// Main function to get the analysis for a URL
export async function getUrlAnalysis(url: string) {
    if (cache.has(url)) {
        console.log("Returning cached VirusTotal report for:", url);
        return cache.get(url);
    }
    
    console.log("Requesting new VirusTotal scan for:", url);
    const analysisId = await submitUrlForAnalysis(url);

    // VirusTotal needs a few seconds to process the URL.
    // In a production app, you might implement a polling mechanism.
    // For this educational app, a simple delay is sufficient.
    console.log(`Waiting for VirusTotal to analyze... (ID: ${analysisId})`);
    await new Promise(resolve => setTimeout(resolve, 15000)); // Increased delay for better reliability

    console.log("Fetching VirusTotal report for:", url);
    const report = await getUrlAnalysisReport(analysisId);
    
    cache.set(url, report);
    
    return report;
}
