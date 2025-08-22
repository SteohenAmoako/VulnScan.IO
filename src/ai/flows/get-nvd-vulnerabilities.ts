
'use server';
/**
 * @fileOverview Fetches known vulnerabilities from the NVD API.
 *
 * - getNvdVulnerabilities - A function that fetches CVEs for a given technology.
 * - NvdInput - The input type for the function.
 * - NvdOutput - The output type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { searchNvdByKeyword, type CveItem } from '@/services/nvd';

const NvdInputSchema = z.object({
  technology: z.string().describe('The software or technology keyword to search for (e.g., "apache").'),
});
export type NvdInput = z.infer<typeof NvdInputSchema>;

const CveSchema = z.object({
    id: z.string(),
    description: z.string(),
    score: z.number().optional(),
    severity: z.string().optional(),
    published: z.string(),
});

const NvdOutputSchema = z.object({
  technology: z.string(),
  totalResults: z.number(),
  vulnerabilities: z.array(CveSchema).optional(),
  error: z.string().optional(),
}).describe("An object containing vulnerabilities from the NVD for a given technology.");
export type NvdOutput = z.infer<typeof NvdOutputSchema>;

export async function getNvdVulnerabilities(input: NvdInput): Promise<NvdOutput> {
  return getNvdVulnerabilitiesFlow(input);
}

function transformCve(cveItem: CveItem): z.infer<typeof CveSchema> {
    const description = cveItem.cve.descriptions.find(d => d.lang === 'en')?.value || 'No description available.';
    const cvssMetric = cveItem.cve.metrics?.cvssMetricV31?.[0];

    return {
        id: cveItem.cve.id,
        description,
        score: cvssMetric?.cvssData.baseScore,
        severity: cvssMetric?.cvssData.baseSeverity,
        published: cveItem.cve.published,
    };
}

const getNvdVulnerabilitiesFlow = ai.defineFlow(
  {
    name: 'getNvdVulnerabilitiesFlow',
    inputSchema: NvdInputSchema,
    outputSchema: NvdOutputSchema,
  },
  async ({ technology }) => {
    try {
      const nvdData = await searchNvdByKeyword(technology);
      
      if (nvdData.error) {
        return { technology, totalResults: 0, error: nvdData.error };
      }

      return {
        technology,
        totalResults: nvdData.totalResults,
        vulnerabilities: nvdData.vulnerabilities.map(transformCve),
      };

    } catch (e: any) {
      return { technology, totalResults: 0, error: e.message || `Failed to fetch NVD data for ${technology}.` };
    }
  }
);
