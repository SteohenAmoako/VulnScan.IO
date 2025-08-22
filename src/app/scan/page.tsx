
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { scanWebsite } from '@/ai/flows/scan-website-vulnerability';
import { summarizeVulnerabilityReport } from '@/ai/flows/summarize-vulnerability-report';
import { getDomainInfo } from '@/ai/flows/get-domain-info';
import { getSslInfo } from '@/ai/flows/get-ssl-info';
import { getMozillaObservatoryInfo } from '@/ai/flows/get-mozilla-observatory-info';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ResultsDisplay } from '@/components/results-display';
import { URLDetails, getMozillaGradeInfo } from '@/components/url-details';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Home } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Loading from './loading';
import { SeverityChart } from '@/components/severity-chart';

export const metadata: Metadata = {
    title: 'Scan Results | VulnScan.IO',
    description: 'Vulnerability scan results for your website.',
};

interface ScanPageProps {
  searchParams: {
    url?: string;
  };
}

const MALICIOUS_PATTERNS = [
  // 🔥 XSS (Cross-Site Scripting)
  { label: 'XSS: <script> Tag', regex: /<script\b[^>]*>(.*?)<\/script>/i },
  { label: 'XSS: JavaScript URI', regex: /javascript:[^"'\s]*/i },
  { label: 'XSS: Event Handlers (onerror, onload, etc.)', regex: /on(?:error|load|mouseover|focus|click|submit|blur)\s*=/i },
  { label: 'XSS: iframe Injection', regex: /<iframe\b[^>]*>(.*?)<\/iframe>/i },
  { label: 'XSS: img with onerror', regex: /<img\b[^>]*onerror\s*=\s*["'][^"']*["']/i },
  { label: 'XSS: Object/embed injection', regex: /<(object|embed|applet)[^>]*>/i },
  { label: 'XSS: SVG Injection', regex: /<svg\b[^>]*on\w+\s*=/i },

  // 🛢️ SQL Injection (SQLi)
  { label: 'SQLi: UNION SELECT', regex: /union\s+select/i },
  { label: 'SQLi: OR 1=1', regex: /(['"`])?\s*or\s+1\s*=\s*1/i },
  { label: 'SQLi: AND 1=1', regex: /(['"`])?\s*and\s+1\s*=\s*1/i },
  { label: 'SQLi: Tautology Attack', regex: /(['"`])\s*=\s*\1/i },
  { label: 'SQLi: SQL Comment (-- or #)', regex: /(--|#)/ },
  { label: 'SQLi: DROP TABLE', regex: /drop\s+table/i },
  { label: 'SQLi: INSERT INTO', regex: /insert\s+into/i },
  { label: 'SQLi: SELECT * FROM', regex: /select\s+\*\s+from/i },
  { label: 'SQLi: UPDATE Statement', regex: /update\s+\w+\s+set/i },
  { label: 'SQLi: xp_cmdshell (SQL Server)', regex: /xp_cmdshell/i },

  // 🐚 Command Injection
  { label: 'CMDi: Semicolon Injection', regex: /;[\s\S]*\b(sh|bash|cmd|powershell)\b/i },
  { label: 'CMDi: Pipe Injection', regex: /\|\s*(ls|cat|whoami|nc|curl|wget|rm|touch)/i },
  { label: 'CMDi: Backtick Execution', regex: /`.*`/ },
  { label: 'CMDi: Subshell $(...)', regex: /\$\((.*?)\)/ },

  // 🗂️ Path Traversal
  { label: 'Path Traversal: ../', regex: /(\.\.\/)+/ },
  { label: 'Path Traversal: Windows-style', regex: /(\.\.\\)+/ },
  { label: 'Path Traversal: Double Encoded', regex: /%252e%252e%252f/i },

  // 🛡️ Local File Inclusion (LFI)
  { label: 'LFI: /etc/passwd', regex: /\/etc\/passwd/i },
  { label: 'LFI: boot.ini', regex: /boot\.ini/i },
  { label: 'LFI: Windows win.ini', regex: /win\.ini/i },

  // 🧬 LDAP Injection
  { label: 'LDAPi: Always True Filter', regex: /\(\|\)/ },
  { label: 'LDAPi: Wildcard Injection', regex: /\*\)|\(|\*/ },

  // 💥 Shellshock
  { label: 'Shellshock: Bash function definition', regex: /\(\)\s*\{\s*:\s*;\s*\};/ },

  // 🕸️ Other Suspicious Patterns
  { label: 'Base64-like payload', regex: /([A-Za-z0-9+/]{20,}={0,2})/ },
  { label: 'Suspicious Query Parameter Key (e.g. token, auth)', regex: /\b(token|auth|password|passwd|secret)\b/i },
  { label: 'Encoded <script> tag (%3Cscript)', regex: /%3Cscript/i },
  { label: 'Encoded ../ (%2e%2e)', regex: /%2e%2e/i }
];


function analyzeUrlParameters(inputUrl: string) {
    try {
        const url = new URL(inputUrl);
        const searchParams = new URLSearchParams(url.search);
        const findings = [];

        if (searchParams.entries().next().done) {
            return { hasParams: false, findings: [] };
        }

        for (const [key, value] of searchParams.entries()) {
            const matches = MALICIOUS_PATTERNS
                .filter(({ regex }) => regex.test(value) || regex.test(key))
                .map(({ label }) => label);

            if (matches.length > 0) {
              findings.push({ key, value, matches });
            }
        }
        return { hasParams: true, findings };
    } catch (error) {
        return { hasParams: false, findings: [] };
    }
}

// Helper to get stats from the raw report text. This is a bit brittle but works for this use case.
function getStatsFromReport(report: string): { malicious: number; suspicious: number; harmless: number } {
    const stats = { malicious: 0, suspicious: 0, harmless: 0 };
    try {
        const maliciousMatch = report.match(/(\d+)\s+engines\s+flagged\s+this\s+URL\s+as\s+malicious/i);
        const suspiciousMatch = report.match(/(\d+)\s+as\s+suspicious/i);
        const harmlessMatch = report.match(/(\d+)\s+as\s+harmless/i);
    
        if (maliciousMatch) stats.malicious = parseInt(maliciousMatch[1], 10);
        if (suspiciousMatch) stats.suspicious = parseInt(suspiciousMatch[1], 10);
        if (harmlessMatch) stats.harmless = parseInt(harmlessMatch[1], 10);
    } catch (e) {
        // Ignore if report format is not as expected
    }
    return stats;
}


async function ScanResults({ url }: { url: string }) {
  let decodedUrl: string;
  let domain: string;

  try {
    decodedUrl = decodeURIComponent(url);
    if (!/^https?:\/\//i.test(decodedUrl)) {
        decodedUrl = 'http://' + decodedUrl;
    }
    const urlObject = new URL(decodedUrl);
    domain = urlObject.hostname;
  } catch (error) {
    return <ErrorState message="The provided URL is invalid. Please go back and try again with a valid URL." />;
  }

  try {
    const isHttps = new URL(decodedUrl).protocol === 'https:';
    const urlParamAnalysis = analyzeUrlParameters(decodedUrl);
    
    // Fetch all data in parallel
    const [domainInfo, sslInfo, mozillaInfo] = await Promise.all([
        getDomainInfo({ domain }),
        isHttps ? getSslInfo({ host: domain }) : Promise.resolve(null),
        getMozillaObservatoryInfo({ host: domain }),
    ]);
    
    const mozillaGradeInfo = getMozillaGradeInfo(mozillaInfo?.grade);

    // VirusTotal scan depends on the URL, other data can be passed to it
    const scanResult = await scanWebsite({ 
      url: decodedUrl, 
      sslInfo: sslInfo ?? undefined, 
      mozillaInfo: mozillaInfo ? { 
          ...mozillaInfo, 
          description: mozillaGradeInfo.description 
      } : undefined
    });

    // Now, create the summary with all the data gathered
    const summaryContext = {
        report: scanResult.scanReport,
        isHttps,
        urlParamFindings: urlParamAnalysis.findings,
        sslInfo: sslInfo ?? undefined,
        mozillaInfo: mozillaInfo ? {
            ...mozillaInfo,
            description: mozillaGradeInfo.description
        } : undefined,
    };

    const summaryResult = await summarizeVulnerabilityReport(summaryContext);

    // Calculate Severity with a weighted approach
    const stats = getStatsFromReport(scanResult.scanReport);
    let highSeverity = (stats.malicious * 3) + (!isHttps ? 2 : 0);
    let mediumSeverity = stats.suspicious * 2;
    let lowSeverity = 0; // For informational items

    urlParamAnalysis.findings.forEach(finding => {
        if (finding.matches.length > 0) {
            mediumSeverity += finding.matches.length;
        }
    });

    if (sslInfo && !sslInfo.error && sslInfo.grade) {
        if (['A+', 'A'].includes(sslInfo.grade)) {
           // Good grade, no severity increase
        } else if (['B', 'C'].includes(sslInfo.grade)) {
            mediumSeverity += 1;
        } else {
            highSeverity += 1; // F, T, etc.
        }
    }
    
    if (mozillaInfo && !mozillaInfo.error && mozillaInfo.grade) {
        if (['A+', 'A', 'A-'].includes(mozillaInfo.grade)) {
            // Good grade
        } else if (['B+', 'B', 'B-'].includes(mozillaInfo.grade)) {
            mediumSeverity +=1;
        } else { // C, D, F grades
            highSeverity +=1;
        }
    }


    if (domainInfo && !domainInfo.error && (domainInfo.domain_age || domainInfo.registrar)) {
        lowSeverity = 1; // Count domain info as one low-severity informational item.
    }

    const totalIssues = highSeverity + mediumSeverity + lowSeverity;
    const secureCount = totalIssues === 0 ? 1 : 0;

    const severityData = [
        { name: 'High', value: highSeverity, fill: 'hsl(var(--destructive))' },
        { name: 'Medium', value: mediumSeverity, fill: 'hsl(var(--chart-4))' },
        { name: 'Low/Info', value: lowSeverity, fill: 'hsl(var(--chart-2))' },
        { name: 'Secure', value: secureCount, fill: 'hsl(var(--chart-3))' }
    ];


    return (
      <>
        <URLDetails url={decodedUrl} domainInfo={domainInfo} urlParamAnalysis={urlParamAnalysis} sslInfo={sslInfo} mozillaInfo={mozillaInfo} />
        <div className="container px-4 md:px-6 py-12">
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <ResultsDisplay url={decodedUrl} report={scanResult.scanReport} summary={summaryResult.summary} />
                </div>
                <div className="lg:col-span-1">
                    <SeverityChart data={severityData} />
                </div>
            </div>
        </div>
      </>
    );
  } catch (error: any) {
    let message = "We couldn't scan the provided URL. It might be offline, or an unexpected error occurred. Please try again later.";
    if (error.message && error.message.includes('VIRUSTOTAL_API_KEY is not set')) {
        message = "The VirusTotal API key is not configured. Please set the VIRUSTOTAL_API_KEY in your .env file to enable live scanning.";
    } else if (error.message) {
        message = `An unexpected error occurred: ${error.message}. Please try again later.`;
    }
    return <ErrorState message={message} />;
  }
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="container px-4 md:px-6 py-12 flex flex-col items-center text-center">
      <Alert variant="destructive" className="max-w-lg">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Scan Failed</AlertTitle>
        <AlertDescription>
          {message}
        </AlertDescription>
      </Alert>
      <Button asChild variant="outline" className="mt-6">
        <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
        </Link>
      </Button>
    </div>
  );
}


export default function ScanPage({ searchParams }: ScanPageProps) {
  const { url } = searchParams;

  if (!url) {
    redirect('/');
  }

  return (
    <div className="flex flex-col min-h-screen ">
      <Header />
      <main className="flex-grow mx-auto">
        <Suspense fallback={<Loading />}>
          <ScanResults url={url} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
