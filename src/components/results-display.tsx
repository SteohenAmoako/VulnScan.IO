
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, ShieldQuestion, FileText, Bot, ShieldAlert, ShieldCheck, ShieldClose, Info, ChevronRight, AlertTriangle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { ReportActions } from "./report-actions";
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

interface Vulnerability {
    vulnerabilityName: string;
    severity: "Critical" | "High" | "Medium" | "Low" | "Informational";
    description: string;
    evidence: string;
    remediation: string;
}

interface ResultsDisplayProps {
    url: string;
    report: string;
    summary: string;
}

const severityConfig = {
    "Critical": { icon: <ShieldAlert className="w-5 h-5 text-red-700" />, badgeClass: "bg-red-700 hover:bg-red-800 text-white border-red-800" },
    "High": { icon: <ShieldClose className="w-5 h-5 text-red-500" />, badgeClass: "bg-red-500 hover:bg-red-600 text-white border-red-600" },
    "Medium": { icon: <ShieldQuestion className="w-5 h-5 text-amber-500" />, badgeClass: "bg-amber-500 hover:bg-amber-600 text-white border-amber-600" },
    "Low": { icon: <ShieldCheck className="w-5 h-5 text-blue-500" />, badgeClass: "bg-blue-500 hover:bg-blue-600 text-white border-blue-600" },
    "Informational": { icon: <Info className="w-5 h-5 text-gray-500" />, badgeClass: "bg-gray-500 hover:bg-gray-600 text-white border-gray-600" },
};

function FeedbackSuccessMessage() {
     return (
        <div className="text-center p-3 sm:p-4 md:p-5 lg:p-6 my-4 sm:my-5 md:my-6 bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-lg mx-auto max-w-full">
            <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mx-auto text-green-600 dark:text-green-400 mb-2" />
            <p className="font-semibold text-sm sm:text-base md:text-lg text-green-800 dark:text-green-200 break-words">Thank you for your feedback!</p>
            <p className="text-xs sm:text-sm md:text-base text-green-700 dark:text-green-300 break-words">Your insights help improve the scanner.</p>
        </div>
    );
}

export function ResultsDisplay({ url, report, summary }: ResultsDisplayProps) {
    const searchParams = useSearchParams();
    const { toast } = useToast();
    
    const [isFeedbackVisible, setIsFeedbackVisible] = useState(searchParams.get('feedback_submitted') === 'true');

    useEffect(() => {
        if (searchParams.get('feedback_submitted') === 'true') {
            setIsFeedbackVisible(true);
            toast({
                title: "Feedback Submitted",
                description: "Thank you for helping us improve our scanner.",
                variant: "default"
            });
            const timer = setTimeout(() => {
                setIsFeedbackVisible(false);
            }, 120000); 
            return () => clearTimeout(timer);
        }
    }, [searchParams, toast]);
    
    let parsedReport: Vulnerability[] = [];
    try {
        parsedReport = JSON.parse(report);
        if (!Array.isArray(parsedReport)) {
            throw new Error("Report is not an array");
        }
    } catch (e) {
        console.error("Failed to parse scan report JSON:", e);
        // Create a fallback entry if parsing fails
        parsedReport.push({
            vulnerabilityName: "Report Generation Error",
            severity: "High",
            description: "The AI model returned a malformed report that could not be displayed properly.",
            evidence: "The raw report data was not in the expected JSON array format.",
            remediation: "This may be a temporary issue with the AI service. Please try rescanning the URL. If the problem persists, consider submitting feedback."
        });
    }

    return (
        <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-7 xl:space-y-8 w-full max-w-full px-2 sm:px-3 md:px-4 lg:px-0">
            <div className="text-center space-y-2 sm:space-y-3 md:space-y-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter font-headline break-words px-2 sm:px-0">
                    Scan Complete
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground break-all px-2 sm:px-4 md:px-0 mt-1 sm:mt-2">
                    Results for: <span className="font-medium text-primary">{url}</span>
                </p>
            </div>
            
            <div className="w-full overflow-hidden">
                <ReportActions url={url} report={report} summary={summary} showFeedbackSuccess={isFeedbackVisible} />
            </div>

            {isFeedbackVisible && <FeedbackSuccessMessage />}

            <Card className="w-full max-w-full overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl break-words">
                        <Bot className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-accent flex-shrink-0" />
                        <span>Executive Summary</span>
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm md:text-base break-words">
                        A high-level overview of the security assessment.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-xs sm:text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
                        {summary}
                    </p>
                </CardContent>
            </Card>

            <Card className="w-full max-w-full overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl break-words">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary flex-shrink-0" />
                        <span>Detailed Vulnerability Findings</span>
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm md:text-base break-words">
                        A breakdown of all identified security issues and recommendations.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {parsedReport.length > 0 ? (
                        <div className="space-y-6">
                            {parsedReport.map((vuln, index) => {
                                const config = severityConfig[vuln.severity] || severityConfig.Informational;
                                return (
                                    <div key={index} className="border-l-4 rounded-r-md p-4 bg-card" style={{ borderColor: config.badgeClass.match(/bg-([a-z]+)-(\d+)/)?.[0].replace('bg-', 'hsl(var(--')) || 'hsl(var(--border))' }}>
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-grow">
                                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                                    {config.icon} {vuln.vulnerabilityName}
                                                </h3>
                                            </div>
                                            <Badge className={config.badgeClass}>{vuln.severity}</Badge>
                                        </div>
                                        <Separator className="my-3" />
                                        <div className="space-y-4 text-sm text-muted-foreground">
                                            <div>
                                                <h4 className="font-semibold text-foreground mb-1">Description</h4>
                                                <p className="whitespace-pre-wrap">{vuln.description}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-foreground mb-1">Evidence</h4>
                                                <p className="font-mono text-xs bg-muted p-2 rounded-md break-all">{vuln.evidence}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-foreground mb-1">Remediation</h4>
                                                <p className="whitespace-pre-wrap">{vuln.remediation}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-6 sm:py-7 md:py-8 lg:py-10 text-muted-foreground">
                            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 mx-auto mb-3 sm:mb-4 text-green-500" />
                            <p className="text-sm sm:text-base md:text-lg break-words px-4 sm:px-6 md:px-8">
                                Congratulations! No vulnerabilities were identified in the scan.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
