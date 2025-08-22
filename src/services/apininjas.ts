
import fetch from 'node-fetch';
import type { DomainInfo } from '@/ai/flows/get-domain-info';

const API_NINJAS_URL = 'https://api.api-ninjas.com/v1/whois?domain=';

export async function lookupDomain(domain: string): Promise<DomainInfo> {
    const apiKey = process.env.API_NINJAS_KEY;
    if (!apiKey) {
        console.warn('API_NINJAS_KEY is not set. Skipping domain lookup.');
        return { error: 'API_NINJAS_KEY is not set.' };
    }

    try {
        const response = await fetch(`${API_NINJAS_URL}${domain}`, {
            headers: { 'X-Api-Key': apiKey }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Ninjas request failed with status ${response.status}: ${errorText}`);
        }
        
        const data = await response.json() as DomainInfo;
        return data || { error: 'No data returned from API.' };

    } catch (error: any) {
        throw new Error(`Failed to communicate with API Ninjas: ${error.message}`);
    }
}
