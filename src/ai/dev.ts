import { config } from 'dotenv';
config();

import '@/ai/flows/scan-website-vulnerability.ts';
import '@/ai/flows/summarize-vulnerability-report.ts';