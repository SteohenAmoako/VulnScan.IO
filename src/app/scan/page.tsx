
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { scanWebsite } from '@/ai/flows/scan-website-vulnerability';
import { summarizeVulnerabilityReport } from '@/ai/flows/summarize-vulnerability-report';
import { getDomainInfo } from '@/ai/flows/get-domain-info';
import { getSslInfo } from '@/ai/flows/get-ssl-info';
import { getMozillaObservatoryInfo } from '@/ai/flows/get-mozilla-observatory-info';
import { getNvdVulnerabilities } from '@/ai/flows/get-nvd-vulnerabilities';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ResultsDisplay } from '@/components/results-display';
import { URLDetails } from '@/components/url-details';
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

const getMozillaGradeInfo = (grade: string | undefined) => {
    if (!grade) return { variant: 'secondary' as const, description: 'The grade could not be determined.' };
    switch (grade) {
        case 'A+': return { variant: 'default' as const, description: 'It got the highest possible grade (A+). That means the website is configured with excellent security headers (like HSTS, CSP, X-Frame-Options, etc.).' };
        case 'A':
        case 'A-':
            return { variant: 'default' as const, description: 'This is a good grade. The website has implemented strong security headers, providing a solid defense against common web attacks.' };
        case 'B+':
        case 'B':
        case 'B-':
            return { variant: 'secondary' as const, description: 'This is an average grade. The website is missing some important security headers, leaving it partially exposed to attacks like clickjacking or cross-site scripting.' };
        case 'C+':
        case 'C':
        case 'C-':
            return { variant: 'destructive' as const, description: 'This grade indicates a significant lack of security headers. The website is likely vulnerable to a variety of common and easily preventable attacks.' };
        case 'D': return { variant: 'destructive' as const, description: 'This grade is a cause for concern, indicating very poor security header configuration and high risk of attack.' };
        case 'F': return { variant: 'destructive' as const, description: 'This is a failing grade. The website has made little to no effort to implement basic security headers, leaving it highly vulnerable.' };
        default: return { variant: 'secondary' as const, description: 'An unrecognized grade was returned by the scan.' };
    }
};

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
    const technologiesToScan = ['apache', 'nginx', 'openssl', 'react'];
    const [domainInfo, sslInfo, mozillaInfo, ...nvdResults] = await Promise.all([
        getDomainInfo({ domain }),
        isHttps ? getSslInfo({ host: domain }) : Promise.resolve(null),
        getMozillaObservatoryInfo({ host: domain }),
        ...technologiesToScan.map(tech => getNvdVulnerabilities({ technology: tech }))
    ]);

    const mozillaGradeInfo = getMozillaGradeInfo(mozillaInfo?.grade);
    const relevantNvdResults = nvdResults.filter(r => r && r.totalResults > 0);
    const scanResult = await scanWebsite({
      url: decodedUrl,
      sslInfo: sslInfo ?? undefined,
      mozillaInfo: mozillaInfo ? {
          ...mozillaInfo,
          description: mozillaGradeInfo.description
      } : undefined,
      nvdResults: relevantNvdResults,
    });

    const summaryContext = {
        report: scanResult.scanReport,
        isHttps,
        urlParamFindings: urlParamAnalysis.findings,
    };

    const summaryResult = await summarizeVulnerabilityReport(summaryContext);

    let parsedReport = [];
    try {
        parsedReport = JSON.parse(scanResult.scanReport);
    } catch(e) {
        console.error("Failed to parse scan report JSON:", e);
        // If parsing fails, we can create a fallback report entry
        parsedReport.push({
            vulnerabilityName: "Report Generation Error",
            severity: "High",
            description: "The AI model returned a malformed report that could not be displayed.",
            evidence: "The raw report data was not valid JSON.",
            remediation: "This may be a temporary issue with the AI service. Please try rescanning."
        });
    }

    const severityCounts = {
        'Critical': 0,
        'High': 0,
        'Medium': 0,
        'Low': 0,
        'Informational': 0,
    };

    parsedReport.forEach((vuln: { severity: string }) => {
        if (vuln.severity in severityCounts) {
            (severityCounts as any)[vuln.severity]++;
        }
    });

    const severityData = [
        { name: 'Critical', value: severityCounts.Critical, fill: 'hsl(var(--destructive))' },
        { name: 'High', value: severityCounts.High, fill: 'hsl(var(--chart-1))' },
        { name: 'Medium', value: severityCounts.Medium, fill: 'hsl(var(--chart-4))' },
        { name: 'Low', value: severityCounts.Low, fill: 'hsl(var(--chart-2))' },
        { name: 'Informational', value: severityCounts.Informational, fill: 'hsl(var(--chart-3))' },
    ];
    
    const totalIssues = Object.values(severityCounts).reduce((acc, count) => acc + count, 0);

    return (
      <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8 py-6 w-full max-w-7xl mx-auto">
        <div className="w-full">
          <URLDetails 
            url={decodedUrl} 
            domainInfo={domainInfo} 
            urlParamAnalysis={urlParamAnalysis} 
            sslInfo={sslInfo} 
            mozillaInfo={mozillaInfo} 
            mozillaGradeInfo={mozillaGradeInfo} 
          />
        </div>
        <div className="flex flex-col lg:flex-row gap-6 w-full">
          <div className="lg:w-2/3 w-full">
            <ResultsDisplay 
              url={decodedUrl} 
              report={scanResult.scanReport} 
              summary={summaryResult.summary} 
            />
          </div>
          <div className="lg:w-1/3 w-full">
            <SeverityChart data={severityData} totalIssues={totalIssues} />
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    let message = "We couldn't scan the provided URL. It might be offline, or an unexpected error occurred. Please try again later.";
    const errorMessage = error.message || '';

    if (errorMessage.includes('VIRUSTOTAL_API_KEY is not set')) {
        message = "The VirusTotal API key is not configured. Please set the VIRUSTOTAL_API_KEY in your .env file to enable live scanning.";
    } else if (errorMessage.includes('429') || errorMessage.includes('quota')) {
        message = "You have exceeded the API rate limit for one of the scanning services (e.g., Google AI). Please check your plan and billing details or wait for the quota to reset.";
    } else if (errorMessage) {
        message = `An unexpected error occurred: ${errorMessage}. Please try again later.`;
    }
    return <ErrorState message={message} />;
  }
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-4 sm:px-6 lg:px-8 py-12 w-full max-w-lg mx-auto">
      <Alert variant="destructive" className="w-full">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="text-lg font-semibold">Scan Failed</AlertTitle>
        <AlertDescription className="text-sm">
          {message}
        </AlertDescription>
      </Alert>
      <Button asChild variant="outline" className="w-full sm:w-auto">
        <Link href="/" className="flex items-center gap-2">
          <Home className="h-4 w-4" />
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
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <main className="flex-grow w-full flex justify-center">
        <Suspense fallback={<Loading />}>
          <ScanResults url={url} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
