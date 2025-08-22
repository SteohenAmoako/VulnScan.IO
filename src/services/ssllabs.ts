
import fetch from 'node-fetch';

const SSLLABS_API_URL = 'https://api.ssllabs.com/api/v3/analyze';

// Simple in-memory cache to avoid re-scanning the same host repeatedly.
const cache = new Map<string, any>();

export async function getSslLabsAnalysis(host: string): Promise<any> {
    if (cache.has(host)) {
        return cache.get(host);
    }
    
    // The `all=done` parameter makes this a blocking call that waits for the results.
    // This can take a minute or two. For a production app, a non-blocking approach with polling is better.
    const apiUrl = `${SSLLABS_API_URL}?host=${host}&all=done`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`SSL Labs API request failed with status ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'ERROR') {
            return { error: data.statusMessage || 'SSL Labs scan failed to complete.' };
        }

        cache.set(host, data);
        return data;

    } catch (error: any) {
        // Return an error object that flows can handle gracefully
        return { error: `Failed to communicate with SSL Labs API: ${error.message}` };
    }
}
