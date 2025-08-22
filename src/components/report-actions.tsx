
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, Repeat, Search, MessageSquareWarning } from 'lucide-react';
import Link from 'next/link';

interface ReportActionsProps {
    url: string;
    report: string;
    summary: string;
}

export function ReportActions({ url, report, summary }: ReportActionsProps) {
    const router = useRouter();
    const { toast } = useToast();

    const handleDownload = () => {
        const fullReport = `
Vulnerability Scan Report for: ${url}
Generated on: ${new Date().toUTCString()}
========================================

AI-Generated Summary:
---------------------
${summary}

========================================

Detailed Vulnerability Report:
------------------------------
${report.replace(/<br\s*\/?>/gi, '\n')}
`;

        const blob = new Blob([fullReport], { type: 'text/plain' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        const filename = `VulnScan-Report-${new URL(url).hostname}.txt`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    };
    
    const handleRescan = () => {
        router.push(`/scan?url=${encodeURIComponent(url)}`);
        router.refresh();
    };
    
    const handleReportIncorrect = () => {
        toast({
            title: "Thank You!",
            description: "Your feedback helps us improve our scanning engine.",
        });
    };

    return (
        <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild variant="outline">
                <Link href="/">
                    <Search className="mr-2 h-4 w-4" />
                    New Scan
                </Link>
            </Button>
            <Button variant="outline" onClick={handleRescan}>
                <Repeat className="mr-2 h-4 w-4" />
                Rescan
            </Button>
             <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download Report
            </Button>
            <Button variant="destructive" onClick={handleReportIncorrect}>
                <MessageSquareWarning className="mr-2 h-4 w-4" />
                Report Incorrect Results
            </Button>
        </div>
    );
}
