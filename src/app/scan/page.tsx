import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { scanWebsite } from '@/ai/flows/scan-website-vulnerability';
import { summarizeVulnerabilityReport } from '@/ai/flows/summarize-vulnerability-report';
import { getDomainInfo } from '@/ai/flows/get-domain-info';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ResultsDisplay } from '@/components/results-display';
import { URLDetails, analyzeUrlParameters } from '@/components/url-details';
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

// Helper to get stats from the raw report text. This is a bit brittle but works for this use case.
function getStatsFromReport(report: string): { malicious: number; suspicious: number; harmless: number } {
    const stats = { malicious: 0, suspicious: 0, harmless: 0 };
    const maliciousMatch = report.match(/(\d+)\s+engines\s+flagged\s+this\s+URL\s+as\s+malicious/i);
    const suspiciousMatch = report.match(/(\d+)\s+as\s+suspicious/i);
    const harmlessMatch = report.match(/(\d+)\s+as\s+harmless/i);

    if (maliciousMatch) stats.malicious = parseInt(maliciousMatch[1], 10);
    if (suspiciousMatch) stats.suspicious = parseInt(suspiciousMatch[1], 10);
    if (harmlessMatch) stats.harmless = parseInt(harmlessMatch[1], 10);
    
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
    
    const scanPromise = scanWebsite({ url: decodedUrl });
    const domainInfoPromise = getDomainInfo({ domain });

    const [scanResult, domainInfo] = await Promise.all([
        scanPromise,
        domainInfoPromise
    ]);

    const summaryContext = {
        report: scanResult.scanReport,
        isHttps,
        urlParamFindings: urlParamAnalysis.findings,
    };

    const summaryResult = await summarizeVulnerabilityReport(summaryContext);

    // Calculate Severity
    const stats = getStatsFromReport(scanResult.scanReport);
    let highSeverity = stats.malicious;
    let mediumSeverity = stats.suspicious;
    let lowSeverity = 0;

    if (!isHttps) {
        highSeverity++;
    }
    urlParamAnalysis.findings.forEach(finding => {
        if (finding.matches.length > 0) {
            mediumSeverity += finding.matches.length;
        }
    });

    const totalIssues = highSeverity + mediumSeverity + lowSeverity;
    const secureCount = totalIssues > 0 ? 0 : 1;

    const severityData = [
        { name: 'High', value: highSeverity, fill: 'hsl(var(--destructive))' },
        { name: 'Medium', value: mediumSeverity, fill: 'hsl(var(--chart-4))' },
        { name: 'Low', value: lowSeverity, fill: 'hsl(var(--chart-2))' },
        { name: 'Secure', value: secureCount, fill: 'hsl(var(--chart-3))' }
    ].filter(item => item.value > 0);


    return (
      <>
        <URLDetails url={decodedUrl} domainInfo={domainInfo} urlParamAnalysis={urlParamAnalysis} />
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
    console.error("Scanning failed:", error);
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
