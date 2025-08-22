
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, Repeat, Search, MessageSquareWarning } from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';

interface ReportActionsProps {
    url: string;
    report: string;
    summary: string;
}

export function ReportActions({ url, report, summary }: ReportActionsProps) {
    const router = useRouter();
    const { toast } = useToast();

    const handleDownload = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 25; // 2.5 cm
        const maxLineWidth = pageWidth - margin * 2;
        const lineSpacing = 1.5;

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text(`Vulnerability Scan Report`, pageWidth / 2, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`URL: ${url}`, pageWidth / 2, 28, { align: 'center' });
        doc.text(`Generated on: ${new Date().toUTCString()}`, pageWidth / 2, 34, { align: 'center' });

        let y = 50;

        // AI Summary Section
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('AI-Generated Summary', margin, y);
        y += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const summaryLines = doc.splitTextToSize(summary, maxLineWidth);
        doc.text(summaryLines, margin, y, { lineHeightFactor: lineSpacing });
        y += (summaryLines.length * 5 * lineSpacing) + 10;

        // Separator
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
        
        // Detailed Report Section
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Detailed Vulnerability Report', margin, y);
        y += 8;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        // Simple parsing of the report text
        const sections = report.split('**').map(s => s.trim()).filter(Boolean);
        for (let i = 0; i < sections.length; i += 2) {
            const title = sections[i].replace(/:$/, '');
            const content = sections[i + 1] || 'No details provided.';

            if (y > 270) { // Check for page break
                doc.addPage();
                y = 20;
            }

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(title, margin, y);
            y += 6;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            const contentLines = doc.splitTextToSize(content.replace(/<br\s*\/?>/gi, '\n'), maxLineWidth);
            doc.text(contentLines, margin, y, { lineHeightFactor: lineSpacing });
            y += (contentLines.length * 5 * lineSpacing) + 8;
        }

        doc.save(`VulnScan-Report-${new URL(url).hostname}.pdf`);
    };
    
    const handleRescan = () => {
        // Add a random query param to force a full reload, triggering Suspense
        const randomQuery = `&t=${new Date().getTime()}`;
        router.push(`/scan?url=${encodeURIComponent(url)}${randomQuery}`);
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
                Download Report (PDF)
            </Button>
            <Button variant="destructive" onClick={handleReportIncorrect}>
                <MessageSquareWarning className="mr-2 h-4 w-4" />
                Report Incorrect Results
            </Button>
        </div>
    );
}
