
'use server';
/**
 * @fileOverview Fetches threat analysis from Google Safe Browsing API.
 *
 * - getSafeBrowsingInfo - A function that handles fetching the analysis.
 * - SafeBrowsingInput - The input type for the getSafeBrowsingInfo function.
 * - SafeBrowsingInfo - The output type for the getSafeBrowsingInfo function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { checkUrlWithSafeBrowsing, type SafeBrowsingMatch } from '@/services/safebrowsing';

const SafeBrowsingInputSchema = z.object({
  url: z.string().describe('The URL to check with Google Safe Browsing.'),
});
export type SafeBrowsingInput = z.infer<typeof SafeBrowsingInputSchema>;

const MatchSchema = z.object({
    threatType: z.string(),
    platformType: z.string(),
    threat: z.object({
        url: z.string(),
    }),
});

const SafeBrowsingInfoSchema = z.object({
  matches: z.array(MatchSchema).optional(),
  error: z.string().optional(),
}).describe("An object containing the Google Safe Browsing scan results for a URL.");
export type SafeBrowsingInfo = z.infer<typeof SafeBrowsingInfoSchema>;

export async function getSafeBrowsingInfo(input: SafeBrowsingInput): Promise<SafeBrowsingInfo> {
  return getSafeBrowsingInfoFlow(input);
}

const getSafeBrowsingInfoFlow = ai.defineFlow(
  {
    name: 'getSafeBrowsingInfoFlow',
    inputSchema: SafeBrowsingInputSchema,
    outputSchema: SafeBrowsingInfoSchema,
  },
  async ({ url }) => {
    try {
      const result = await checkUrlWithSafeBrowsing(url);

      if (result.error) {
          return { error: result.error.message };
      }
      
      return {
        matches: result.matches,
      };

    } catch (e: any) {
      return { error: e.message || 'Failed to fetch Google Safe Browsing info.' };
    }
  }
);
