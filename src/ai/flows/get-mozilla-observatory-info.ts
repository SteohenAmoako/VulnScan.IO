
'use server';
/**
 * @fileOverview Fetches HTTP security header analysis from the Mozilla Observatory.
 *
 * - getMozillaObservatoryInfo - A function that handles fetching the analysis.
 * - MozillaObservatoryInput - The input type for the getMozillaObservatoryInfo function.
 * - MozillaObservatoryInfo - The output type for the getMozillaObservatoryInfo function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getMozillaObservatoryAnalysis } from '@/services/mozilla-observatory';

const MozillaObservatoryInputSchema = z.object({
  host: z.string().describe('The host to analyze (e.g., example.com).'),
});
export type MozillaObservatoryInput = z.infer<typeof MozillaObservatoryInputSchema>;

const MozillaObservatoryInfoSchema = z.object({
  grade: z.string().optional(),
  score: z.number().optional(),
  error: z.string().optional(),
}).describe("An object containing the Mozilla Observatory scan results for a host.");
export type MozillaObservatoryInfo = z.infer<typeof MozillaObservatoryInfoSchema>;

export async function getMozillaObservatoryInfo(input: MozillaObservatoryInput): Promise<MozillaObservatoryInfo> {
  return getMozillaObservatoryInfoFlow(input);
}

const getMozillaObservatoryInfoFlow = ai.defineFlow(
  {
    name: 'getMozillaObservatoryInfoFlow',
    inputSchema: MozillaObservatoryInputSchema,
    outputSchema: MozillaObservatoryInfoSchema,
  },
  async ({ host }) => {
    try {
      const report = await getMozillaObservatoryAnalysis(host);

      if (report.error) {
          return { error: report.error };
      }
      
      return {
        grade: report.grade,
        score: report.score,
      };

    } catch (e: any) {
      console.error("Error in getMozillaObservatoryInfoFlow:", e);
      return { error: e.message || 'Failed to fetch Mozilla Observatory info.' };
    }
  }
);
