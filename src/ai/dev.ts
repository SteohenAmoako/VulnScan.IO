import { config } from 'dotenv';
config();

import '@/ai/flows/scan-website-vulnerability.ts';
import '@/ai/flows/summarize-vulnerability-report.ts';
import '@/ai/flows/get-domain-info.ts';
import '@/ai/flows/get-ssl-info.ts';
import '@/ai/flows/get-mozilla-observatory-info.ts';
import '@/ai/flows/get-nvd-vulnerabilities.ts';
