
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, Repeat, Search, MessageSquareWarning, Send } from 'lucide-react';
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // This will redirect the user back to the current page with a success query param
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('feedback_submitted', 'true');

    return (
        <Card className="mt-6 border-destructive/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <MessageSquareWarning className="w-6 h-6" />
                    Report Incorrect Results
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form
                    action="https://formsubmit.co/lilmeech0011@icloud.com"
                    method="POST"
                    onSubmit={() => setIsSubmitting(true)}
                    className="space-y-4"
                >
                    {/* FormSubmit specific hidden inputs */}
                    <input type="hidden" name="_subject" value={`Feedback for Scan: ${url}`} />
                    <input type="hidden" name="_next" value={nextUrl.toString()} />
                    
                    {/* Hidden fields with our data */}
                    <input type="hidden" name="Scanned URL" value={url} />
                    <input type="hidden" name="AI Summary" value={summary} />
                    
                    <Textarea
                        id="feedback"
                        name="Feedback"
                        placeholder="Please tell us what's wrong with the report..."
                        rows={5}
                        required
                    />
                    <Button type="submit" variant="destructive" disabled={isSubmitting}>
                         {isSubmitting ? (
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
    const searchParams = useSearchParams();
    const [isReporting, setIsReporting] = useState(false);
    const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(searchParams.get('feedback_submitted') === 'true');

    useEffect(() => {
        if (searchParams.get('feedback_submitted') === 'true') {
            setShowFeedbackSuccess(true);
            const timer = setTimeout(() => {
                setShowFeedbackSuccess(false);
            }, 10000); // Hide after 10 seconds
            return () => clearTimeout(timer);
        }
    }, [searchParams]);

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
    
        toast({
            title: "Generating PDF...",
            description: "Please wait while your report is being prepared.",
        });
    
        try {
            const severityCanvas = await html2canvas(severityChartElement, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const mozillaCanvas = await html2canvas(mozillaChartElement, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            
            const severityImgData = severityCanvas.toDataURL('image/png');
            const mozillaImgData = mozillaCanvas.toDataURL('image/png');
    
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 15;
            const maxLineWidth = pageWidth - margin * 2;
            let currentY = margin;

            const addText = (text: string, size: number, style: 'normal' | 'bold' = 'normal', color: string | number[] = '#000000', options: { align?: 'center' | 'left' | 'right', lineSpacing?: number } = {}) => {
                if (currentY > doc.internal.pageSize.getHeight() - margin) {
                    doc.addPage();
                    currentY = margin;
                }
                doc.setFontSize(size);
                doc.setFont('helvetica', style);
                if (Array.isArray(color)) {
                    doc.setTextColor(color[0], color[1], color[2]);
                } else {
                    doc.setTextColor(color);
                }

                const lines = doc.splitTextToSize(text, maxLineWidth);
                const align = options.align || 'left';
                const xPos = align === 'center' ? pageWidth / 2 : margin;
                
                doc.text(lines, xPos, currentY, { align, lineHeightFactor: options.lineSpacing || 1.15 });
                currentY += (lines.length * size * 0.35 * (options.lineSpacing || 1.15)) + 3; // Approximate height of text block
            };

            // Header
            addText('Vulnerability Scan Report', 18, 'bold', '#673AB7', { align: 'center' });
            currentY += 5;
            
            // URL and Date
            addText(`Target: ${url}`, 10, 'normal', '#333333');
            addText(`Report Generated: ${new Date().toLocaleString()}`, 8, 'normal', '#666666');
            currentY += 5;

            // Summary
            addText('Executive Summary', 14, 'bold', '#009688');
            doc.setDrawColor('#009688');
            doc.line(margin, currentY, maxLineWidth + margin, currentY);
            currentY += 5;
            addText(summary.replace(/\*\*/g, ''), 10);
            currentY += 10;
            
            // Charts
            const chartWidth = (maxLineWidth / 2) - 5;
            const severityHeight = (severityCanvas.height * chartWidth) / severityCanvas.width;
            const mozillaHeight = (mozillaCanvas.height * chartWidth) / mozillaCanvas.width;
            const chartSectionHeight = Math.max(severityHeight, mozillaHeight) + 20;

            if (currentY + chartSectionHeight > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                currentY = margin;
            }
            addText('Security Metrics', 14, 'bold', '#009688');
            doc.line(margin, currentY, maxLineWidth + margin, currentY);
            currentY += 5;
            doc.addImage(severityImgData, 'PNG', margin, currentY, chartWidth, severityHeight);
            doc.addImage(mozillaImgData, 'PNG', margin + chartWidth + 10, currentY, chartWidth, mozillaHeight);
            currentY += chartSectionHeight;

            // Detailed Findings
            addText('Detailed Vulnerability Findings', 14, 'bold', '#009688');
            doc.line(margin, currentY, maxLineWidth + margin, currentY);
            currentY += 5;
            
            const parsedReport = JSON.parse(report);
            if(Array.isArray(parsedReport)) {
                parsedReport.forEach(vuln => {
                     const vulnerabilityText = `Vulnerability: ${vuln.vulnerabilityName} (Severity: ${vuln.severity})\nDescription: ${vuln.description}\nEvidence: ${vuln.evidence}\nRemediation: ${vuln.remediation}`;
                     const textLines = doc.splitTextToSize(vulnerabilityText, maxLineWidth);
                     const textHeight = (textLines.length * 10 * 0.35 * 1.15) + 20;

                    if (currentY + textHeight > doc.internal.pageSize.getHeight() - margin) { 
                        doc.addPage();
                        currentY = margin;
                    }
                    
                    doc.setFillColor(245, 245, 245);
                    doc.rect(margin - 2, currentY - 5, maxLineWidth + 4, textHeight, 'F');
                    
                    addText(`${vuln.vulnerabilityName} (${vuln.severity})`, 12, 'bold');
                    
                    addText('Description:', 10, 'bold');
                    addText(vuln.description, 9);
                    
                    addText('Evidence:', 10, 'bold');
                    addText(vuln.evidence, 9);

                    addText('Remediation:', 10, 'bold');
                    addText(vuln.remediation, 9);
                    currentY += 5;
                });
            }

            const urlHostname = new URL(url).hostname;
            const filename = `VulnScan-Report-${urlHostname}-${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);
    
            toast({
                title: "PDF Generated Successfully",
                description: `Report saved as ${filename}`,
            });
    
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast({
                title: "Error Generating PDF",
                description: "There was an issue creating the PDF report. Please try again.",
                variant: "destructive"
            });
        }
    };
    const handleRescan = () => {
        const randomQuery = `&t=${new Date().getTime()}`;
        router.push(`/scan?url=${encodeURIComponent(url)}${randomQuery}`);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
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
                    Download PDF
                </Button>
                {!showFeedbackSuccess && (
                     <Button variant="destructive" onClick={() => setIsReporting(!isReporting)}>
                        <MessageSquareWarning className="mr-2 h-4 w-4" />
                        {isReporting ? 'Cancel' : 'Report Issue'}
                    </Button>
                )}
            </div>
            {isReporting && !showFeedbackSuccess && <ReportFeedback url={url} summary={summary} />}
        </div>
    );
}
