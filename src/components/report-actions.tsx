
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, Repeat, Search, MessageSquareWarning, Send, CheckCircle2, Loader2 } from 'lucide-react';
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
    const [feedback, setFeedback] = useState('');
    const { toast } = useToast();
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!feedback.trim()) {
            toast({
                title: "Feedback Required",
                description: "Please enter your feedback before submitting.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('_subject', `Feedback for Scan: ${url}`);
        formData.append('_next', `${window.location.origin}${window.location.pathname}?url=${encodeURIComponent(url)}&feedback_submitted=true`);
        formData.append('_captcha', 'false');
        formData.append('Scanned URL', url);
        formData.append('AI Summary', summary);
        formData.append('Feedback', feedback);
        formData.append('Timestamp', new Date().toISOString());

        // Fire-and-forget the submission. We don't need to await the response
        // because formsubmit.co handles the redirect, which can cause fetch to error.
        fetch('https://formsubmit.co/lilmeech0011@icloud.com', {
            method: 'POST',
            body: formData,
        });

        // Optimistically show success and update the UI.
        toast({
            title: "Feedback Submitted",
            description: "Thank you for your feedback! Redirecting...",
        });
        
        // Small delay to allow the user to see the "Submitting..." state
        setTimeout(() => {
            // Update URL to show success state, which will trigger the parent component to re-render
            const nextUrl = new URL(window.location.href);
            nextUrl.searchParams.set('feedback_submitted', 'true');
            window.location.href = nextUrl.toString(); // Use full navigation to ensure state is updated
        }, 1500);
    };

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
                    <div className="space-y-2">
                        <label htmlFor="feedback" className="text-sm font-medium">
                            What's wrong with this report?
                        </label>
                        <Textarea
                            id="feedback"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Please describe the issues you found with the report (e.g., false positives, missing vulnerabilities, incorrect severity ratings, etc.)"
                            rows={5}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    <div className="flex gap-2">
                        <Button 
                            type="submit" 
                            variant="destructive" 
                            disabled={isSubmitting || !feedback.trim()}
                            className="flex-1"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Submit Feedback
                                </>
                            )}
                        </Button>
                    </div>
                </form>
                
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                        Your feedback helps us improve our vulnerability detection. 
                        We review all submissions to enhance our scanning accuracy.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

function FeedbackSuccess() {
    return (
        <Card className="mt-6 border-green-500/50 w-full max-w-lg">
            <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-green-600">
                    <CheckCircle2 className="w-6 h-6" />
                    <div>
                        <h3 className="font-semibold">Feedback Submitted Successfully</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Thank you for helping us improve our vulnerability detection.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function ReportActions({ url, report, summary }: ReportActionsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [isReporting, setIsReporting] = useState(false);
    const [isRescanning, setIsRescanning] = useState(false);
    
    const feedbackSubmitted = searchParams.get('feedback_submitted') === 'true';

    useEffect(() => {
        if (feedbackSubmitted) {
            setIsReporting(false); // Close the feedback form if it was open
        }
    }, [feedbackSubmitted]);
    
    const handleRescan = async () => {
        setIsRescanning(true);
        
        toast({
            title: "Initiating Rescan",
            description: "Starting a fresh vulnerability scan...",
        });

        try {
            const timestamp = new Date().getTime();
            const randomId = Math.random().toString(36).substring(7);
            const scanUrl = `/scan?url=${encodeURIComponent(url)}&rescan=true&t=${timestamp}&id=${randomId}`;
            await new Promise(resolve => setTimeout(resolve, 500));
            router.push(scanUrl);
        } catch (error) {
            console.error('Error initiating rescan:', error);
            toast({
                title: "Rescan Failed",
                description: "Failed to initiate rescan. Please try again.",
                variant: "destructive"
            });
            setIsRescanning(false);
        }
    };

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
            const severityCanvas = await html2canvas(severityChartElement, { 
                scale: 2, 
                useCORS: true, 
                backgroundColor: '#ffffff',
                logging: false 
            });
            const mozillaCanvas = await html2canvas(mozillaChartElement, { 
                scale: 2, 
                useCORS: true, 
                backgroundColor: '#ffffff',
                logging: false 
            });
            
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
                currentY += (lines.length * size * 0.35 * (options.lineSpacing || 1.15)) + 3;
            };

            // Header
            addText('Vulnerability Scan Report', 18, 'bold', [103, 58, 183], { align: 'center' });
            currentY += 5;
            
            // URL and Date
            addText(`Target: ${url}`, 10, 'normal', '#333333');
            addText(`Report Generated: ${new Date().toLocaleString()}`, 8, 'normal', '#666666');
            currentY += 5;

            // Summary
            addText('Executive Summary', 14, 'bold', [0, 150, 136]);
            doc.setDrawColor(0, 150, 136);
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
            addText('Security Metrics', 14, 'bold', [0, 150, 136]);
            doc.line(margin, currentY, maxLineWidth + margin, currentY);
            currentY += 5;
            doc.addImage(severityImgData, 'PNG', margin, currentY, chartWidth, severityHeight);
            doc.addImage(mozillaImgData, 'PNG', margin + chartWidth + 10, currentY, chartWidth, mozillaHeight);
            currentY += chartSectionHeight;

            // Detailed Findings
            addText('Detailed Vulnerability Findings', 14, 'bold', [0, 150, 136]);
            doc.line(margin, currentY, maxLineWidth + margin, currentY);
            currentY += 5;
            
            let parsedReport = [];
            try {
                parsedReport = JSON.parse(report);
            } catch(e) {
                addText('Report data could not be parsed for detailed view.', 10);
            }
            
            if (Array.isArray(parsedReport)) {
                parsedReport.forEach(vuln => {
                    const vulnContent = [
                        { title: 'Description', text: (vuln as any).description || 'No description available' },
                        { title: 'Evidence', text: (vuln as any).evidence || 'No evidence provided' },
                        { title: 'Remediation', text: (vuln as any).remediation || 'No remediation steps provided' },
                    ];

                    const getSectionHeight = (title: string, text: string) => {
                        const titleLines = doc.splitTextToSize(title, maxLineWidth);
                        const textLines = doc.splitTextToSize(text, maxLineWidth);
                        return (titleLines.length * 10 * 0.35 * 1.15) + (textLines.length * 9 * 0.35 * 1.15) + 4;
                    }
                    
                    const titleHeight = (doc.splitTextToSize(`${(vuln as any).vulnerabilityName || 'Unknown Vulnerability'} (${(vuln as any).severity || 'Unknown'})`, maxLineWidth).length * 12 * 0.35 * 1.15) + 5;
                    let totalHeight = titleHeight;
                    vulnContent.forEach(item => totalHeight += getSectionHeight(item.title, item.text));
                    totalHeight += 5;

                    if (currentY + totalHeight > doc.internal.pageSize.getHeight() - margin) { 
                        doc.addPage();
                        currentY = margin;
                    }
                    
                    doc.setFillColor(245, 245, 245);
                    doc.rect(margin - 2, currentY - 5, maxLineWidth + 4, totalHeight, 'F');
                    
                    addText(`${(vuln as any).vulnerabilityName || 'Unknown Vulnerability'} (${(vuln as any).severity || 'Unknown'})`, 12, 'bold');
                    
                    vulnContent.forEach(item => {
                        addText(item.title, 10, 'bold');
                        addText(item.text, 9);
                    });
                    
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

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex flex-wrap items-center justify-center gap-2">
                <Button asChild variant="outline">
                    <Link href="/">
                        <Search className="mr-2 h-4 w-4" />
                        New Scan
                    </Link>
                </Button>
                <Button 
                    variant="outline" 
                    onClick={handleRescan}
                    disabled={isRescanning}
                >
                    {isRescanning ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Rescanning...
                        </>
                    ) : (
                        <>
                            <Repeat className="mr-2 h-4 w-4" />
                            Rescan
                        </>
                    )}
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                </Button>
                {!feedbackSubmitted && (
                    <Button 
                        variant="destructive" 
                        onClick={() => setIsReporting(!isReporting)}
                    >
                        <MessageSquareWarning className="mr-2 h-4 w-4" />
                        {isReporting ? 'Cancel' : 'Report Issue'}
                    </Button>
                )}
            </div>
            
            {isReporting && !feedbackSubmitted && (
                <ReportFeedback url={url} summary={summary} />
            )}
            
            {feedbackSubmitted && (
                <FeedbackSuccess />
            )}
        </div>
    );
}

    