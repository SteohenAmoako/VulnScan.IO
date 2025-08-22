
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, ValidationError } from '@formspree/react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, Repeat, Search, MessageSquareWarning, Send, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReportActionsProps {
    url: string;
    report: string;
    summary: string;
}

function ReportFeedback({ url, summary }: { url: string, summary: string }) {
    const [state, handleSubmit] = useForm("xjkonyne");
    
    if (state.succeeded) {
      return (
        <div className="flex flex-col items-center text-center p-4 border rounded-lg bg-secondary">
          <CheckCircle2 className="w-12 h-12 text-green-500 mb-2" />
          <h3 className="font-bold">Thank you for your feedback!</h3>
          <p className="text-sm text-muted-foreground">We'll use it to improve our scanner.</p>
        </div>
      );
    }

    return (
        <Card className="mt-6 border-destructive/50 w-full max-w-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <MessageSquareWarning className="w-6 h-6" />
                    Report Incorrect Results
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="hidden" name="Scanned URL" value={url} />
                    <input type="hidden" name="AI Summary" value={summary} />
                    <Textarea
                        id="feedback"
                        name="Feedback"
                        placeholder="Please tell us what's wrong with the report..."
                        rows={5}
                        required
                    />
                    <ValidationError 
                        prefix="Feedback" 
                        field="Feedback"
                        errors={state.errors}
                        className="text-destructive text-sm"
                    />
                    <Button type="submit" variant="destructive" disabled={state.submitting}>
                         {state.submitting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                         ) : (
                             <Send className="mr-2 h-4 w-4" />
                         )}
                        Submit Feedback
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

export function ReportActions({ url, report, summary }: ReportActionsProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isReporting, setIsReporting] = useState(false);

    const handleDownload = async () => {
        const severityChartElement = document.getElementById('severity-chart-card');
        const mozillaChartElement = document.getElementById('mozilla-chart-card');
        
        if (!severityChartElement || !mozillaChartElement) {
            toast({
                title: "Error",
                description: "Could not find chart elements to generate PDF.",
                variant: "destructive"
            });
            return;
        }

        const severityCanvas = await html2canvas(severityChartElement, { backgroundColor: null });
        const mozillaCanvas = await html2canvas(mozillaChartElement, { backgroundColor: null });
        const severityImgData = severityCanvas.toDataURL('image/png');
        const mozillaImgData = mozillaCanvas.toDataURL('image/png');

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 25;
        const maxLineWidth = pageWidth - margin * 2;
        const lineSpacing = 1.5;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text(`Vulnerability Scan Report`, pageWidth / 2, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`URL: ${url}`, pageWidth / 2, 28, { align: 'center' });
        doc.text(`Generated on: ${new Date().toUTCString()}`, pageWidth / 2, 34, { align: 'center' });

        let y = 50;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('AI-Generated Summary', margin, y);
        y += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const summaryLines = doc.splitTextToSize(summary, maxLineWidth);
        doc.text(summaryLines, margin, y, { lineHeightFactor: lineSpacing });
        y += (summaryLines.length * 5 * lineSpacing) + 10;
        
        if (y > 250) { 
            doc.addPage();
            y = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Visual Summaries', margin, y);
        y += 10;
        
        const chartWidth = (pageWidth - (margin * 3)) / 2;
        const severityImgHeight = (severityCanvas.height * chartWidth) / severityCanvas.width;
        const mozillaImgHeight = (mozillaCanvas.height * chartWidth) / mozillaCanvas.width;

        doc.addImage(severityImgData, 'PNG', margin, y, chartWidth, severityImgHeight);
        doc.addImage(mozillaImgData, 'PNG', margin + chartWidth + 10, y, chartWidth, mozillaImgHeight);
        y += Math.max(severityImgHeight, mozillaImgHeight) + 10;

        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Detailed Vulnerability Report', margin, y);
        y += 8;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        const sections = report.split('**').map(s => s.trim()).filter(Boolean);
        for (let i = 0; i < sections.length; i += 2) {
            const title = sections[i].replace(/:$/, '');
            const content = sections[i + 1] || 'No details provided.';

            if (y > 270) {
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
        const randomQuery = `&t=${new Date().getTime()}`;
        router.push(`/scan?url=${encodeURIComponent(url)}${randomQuery}`);
    };

    return (
        <div className="flex flex-col items-center gap-4 w-full">
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
                <Button variant="destructive" onClick={() => setIsReporting(!isReporting)}>
                    <MessageSquareWarning className="mr-2 h-4 w-4" />
                    {isReporting ? 'Cancel Feedback' : 'Report Incorrect Results'}
                </Button>
            </div>
            {isReporting && <ReportFeedback url={url} summary={summary} />}
        </div>
    );
}
