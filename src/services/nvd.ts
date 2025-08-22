
'use server';

import fetch from 'node-fetch';

const NVD_API_URL = 'https://services.nvd.nist.gov/rest/json/cves/2.0';

export interface CveItem {
    cve: {
        id: string;
        descriptions: { lang: string; value: string }[];
        metrics: {
            cvssMetricV31?: {
                cvssData: {
                    baseScore: number;
                    baseSeverity: string;
                };
            }[];
        };
        weaknesses?: {
            description: { lang: string, value: string }[];
        }[];
        published: string;
    };
}

export interface NvdApiResponse {
    resultsPerPage: number;
    startIndex: number;
    totalResults: number;
    vulnerabilities: CveItem[];
    error?: string;
}

export async function searchNvdByKeyword(keyword: string): Promise<NvdApiResponse> {
    const apiKey = process.env.NVD_API_KEY;
    const headers: { [key: string]: string } = {
        'Accept': 'application/json'
    };

    if (apiKey) {
        headers['apiKey'] = apiKey;
    } else {
        console.warn('NVD_API_KEY is not set. Using lower rate limit.');
    }

    // Search for critical and high vulnerabilities matching the keyword
    const searchParams = new URLSearchParams({
        keywordSearch: keyword,
        cvssV3Severity: 'CRITICAL,HIGH',
        resultsPerPage: '10' // Limit to 10 results per keyword for this prototype
    });

    try {
        const response = await fetch(`${NVD_API_URL}?${searchParams.toString()}`, { headers });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`NVD API request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json() as NvdApiResponse;
        return data;

    } catch (error: any) {
        return { error: `Failed to communicate with NVD API: ${error.message}`, resultsPerPage: 0, startIndex: 0, totalResults: 0, vulnerabilities: [] };
    }
}
