
'use server';
/**
 * @fileOverview Fetches SSL/TLS information from the SSL Labs API.
 *
 * - getSslInfo - A function that handles fetching SSL Labs analysis.
 * - SslInfoInput - The input type for the getSslInfo function.
 * - SslLabsInfo - The output type for the getSslInfo function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getSslLabsAnalysis } from '@/services/ssllabs';

const SslInfoInputSchema = z.object({
  host: z.string().describe('The host to analyze (e.g., example.com).'),
});
export type SslInfoInput = z.infer<typeof SslInfoInputSchema>;

const ProtocolSchema = z.object({
    name: z.string(),
    version: z.string(),
});

const EndpointSchema = z.object({
    grade: z.string().optional(),
    details: z.object({
        protocols: z.array(ProtocolSchema),
    }),
});

const SslLabsInfoSchema = z.object({
  grade: z.string().optional(),
  protocols: z.array(z.string()).optional(),
  error: z.string().optional(),
}).describe("An object containing SSL/TLS information for a host.");
export type SslLabsInfo = z.infer<typeof SslLabsInfoSchema>;

export async function getSslInfo(input: SslInfoInput): Promise<SslLabsInfo> {
  return getSslInfoFlow(input);
}

const getSslInfoFlow = ai.defineFlow(
  {
    name: 'getSslInfoFlow',
    inputSchema: SslInfoInputSchema,
    outputSchema: SslLabsInfoSchema,
  },
  async ({ host }) => {
    try {
      const sslData = await getSslLabsAnalysis(host);

      if (sslData.error) {
          return { error: sslData.error };
      }

      const endpoint = sslData.endpoints?.[0];
      if (endpoint) {
        return {
          grade: endpoint.grade,
          protocols: endpoint.details?.protocols?.map(p => `${p.name} ${p.version}`) ?? [],
        };
      }
      return { error: 'No endpoint data found in SSL Labs response.' };
    } catch (e: any) {
      return { error: e.message || 'Failed to fetch SSL Labs info.' };
    }
  }
);
