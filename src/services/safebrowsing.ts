
'use server';

import fetch from 'node-fetch';

const SAFE_BROWSING_API_URL = 'https://safebrowsing.googleapis.com/v4/threatMatches:find';

export interface SafeBrowsingMatch {
    threatType: string;
    platformType: string;
    threat: {
        url: string;
    };
    cacheDuration: string;
    threatEntryType: string;
}

export interface SafeBrowsingResponse {
    matches?: SafeBrowsingMatch[];
    error?: {
        message: string;
    };
}

export async function checkUrlWithSafeBrowsing(url: string): Promise<SafeBrowsingResponse> {
    const apiKey = process.env.GEMINI_API_KEY; // Using GEMINI_API_KEY as it's the Google Cloud key
    if (!apiKey) {
        console.warn('GEMINI_API_KEY is not set. Skipping Safe Browsing check.');
        return { error: { message: 'SAFE_BROWSING_API_KEY is not configured on the server.' } };
    }

    const requestBody = {
        client: {
            clientId: "vulnscan-io",
            clientVersion: "1.0.0"
        },
        threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url: url }]
        }
    };

    try {
        const response = await fetch(`${SAFE_BROWSING_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json() as any;

        if (!response.ok) {
            const errorMessage = data?.error?.message || `Safe Browsing API request failed with status ${response.status}`;
            return { error: { message: errorMessage } };
        }

        return data;
    } catch (error: any) {
        return { error: { message: `Failed to communicate with Safe Browsing API: ${error.message}` } };
    }
}
