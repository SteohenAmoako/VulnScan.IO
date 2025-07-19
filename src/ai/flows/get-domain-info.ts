
'use server';
/**
 * @fileOverview Fetches domain information from API-Ninjas.
 *
 * - getDomainInfo - A function that handles fetching domain metadata.
 * - DomainInfoInput - The input type for the getDomainInfo function.
 * - DomainInfo - The output type for the getDomainInfo function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { lookupDomain } from '@/services/apininjas';

const DomainInfoInputSchema = z.object({
  domain: z.string().describe('The domain name to lookup.'),
});
export type DomainInfoInput = z.infer<typeof DomainInfoInputSchema>;

const DomainInfoSchema = z.object({
  domain_age: z.string().optional(),
  registrar: z.string().optional(),
  country: z.string().optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
  expired: z.string().optional(),
  error: z.string().optional(),
}).describe("An object containing metadata about a domain.");
export type DomainInfo = z.infer<typeof DomainInfoSchema>;

export async function getDomainInfo(input: DomainInfoInput): Promise<DomainInfo> {
  return getDomainInfoFlow(input);
}

const getDomainInfoFlow = ai.defineFlow(
  {
    name: 'getDomainInfoFlow',
    inputSchema: DomainInfoInputSchema,
    outputSchema: DomainInfoSchema,
  },
  async ({ domain }) => {
    try {
      const domainInfo = await lookupDomain(domain);
      return domainInfo;
    } catch (e: any) {
      console.error("Error in getDomainInfoFlow:", e);
      return { error: e.message || 'Failed to fetch domain info.' };
    }
  }
);
