import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { scanWebsite } from '@/ai/flows/scan-website-vulnerability';
import { summarizeVulnerabilityReport } from '@/ai/flows/summarize-vulnerability-report';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ResultsDisplay } from '@/components/results-display';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Home } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Loading from './loading';

export const metadata: Metadata = {
    title: 'Scan Results | VulnScan.IO',
    description: 'Vulnerability scan results for your website.',
};

interface ScanPageProps {
  searchParams: {
    url?: string;
  };
}

async function ScanResults({ url }: { url: string }) {
  let decodedUrl: string;
  try {
    decodedUrl = decodeURIComponent(url);
    if (!/^https?:\/\//i.test(decodedUrl)) {
        decodedUrl = 'http://' + decodedUrl;
    }
    new URL(decodedUrl); // This will throw an error if the URL is invalid
  } catch (error) {
    return <ErrorState message="The provided URL is invalid. Please go back and try again with a valid URL." />;
  }

  try {
    const scanResult = await scanWebsite({ url: decodedUrl });
    const summaryResult = await summarizeVulnerabilityReport({ report: scanResult.scanReport });

    return <ResultsDisplay url={decodedUrl} report={scanResult.scanReport} summary={summaryResult.summary} />;
  } catch (error) {
    console.error("Scanning failed:", error);
    return <ErrorState message="We couldn't scan the provided URL. It might be offline, or an unexpected error occurred. Please try again later." />;
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
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Suspense fallback={<Loading />}>
          <ScanResults url={url} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
