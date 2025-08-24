
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertCircle, CheckCircle2, ShieldQuestion, FileText, Bot } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { ReportActions } from "./report-actions";
import { useToast } from '@/hooks/use-toast';

interface ResultsDisplayProps {
    url: string;
    report: string;
    summary: string;
}

function parseReport(reportText: string) {
    const sections = reportText.split('**').map(s => s.trim()).filter(Boolean);
    const result = [];
    for (let i = 0; i < sections.length; i += 2) {
        const title = sections[i].replace(/:$/, '');
        const content = sections[i + 1];
        if (title && content) {
            result.push({ title, content });
        }
    }

    if (result.length === 0 && reportText.trim()) {
        return [{ title: "Full Report", content: reportText }];
    }
    return result;
}

function getSeverityInfo(title: string): { icon: React.ReactNode; variant: "destructive" | "secondary" | "default"; level: string } {
    const lowerCaseTitle = title.toLowerCase();
    if (lowerCaseTitle.includes('high') || lowerCaseTitle.includes('critical') || lowerCaseTitle.includes('detected threats')) {
        return { icon: <AlertCircle className="w-5 h-5 text-destructive" />, variant: 'destructive', level: "High" };
    }
    if (lowerCaseTitle.includes('medium') || lowerCaseTitle.includes('moderate')) {
        return { icon: <ShieldQuestion className="w-5 h-5 text-yellow-500" />, variant: 'secondary', level: 'Medium' };
    }
    if (lowerCaseTitle.includes('low') || lowerCaseTitle.includes('informational') || lowerCaseTitle.includes('no threats') || lowerCaseTitle.includes('overall status')) {
        return { icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, variant: 'default', level: 'Info' };
    }
    return { icon: <FileText className="w-5 h-5 text-muted-foreground" />, variant: 'default', level: 'Info' };
}

function ReportContent({ content }: { content: string }) {
    try {
        if (!content.trim().startsWith('{') && !content.trim().startsWith('[')) {
            throw new Error("Not a JSON object or array.");
        }
        const parsedData = JSON.parse(content);
        return (
            <div className="p-4 bg-muted rounded-md text-sm text-foreground">
                <ul className="space-y-2 font-code">
                    {Object.entries(parsedData).map(([key, value]) => (
                        <li key={key} className="flex flex-col">
                            <span className="font-semibold text-primary">{key}:</span>
                            <span className="pl-4 text-foreground break-words">{String(value)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    } catch (e) {
        return (
            <div className="p-4 bg-muted rounded-md text-sm text-foreground overflow-x-auto font-code whitespace-pre-wrap">
                {content}
            </div>
        );
    }
}

function FeedbackSuccessMessage() {
     return (
        <div className="text-center p-4 my-6 bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle2 className="w-8 h-8 mx-auto text-green-600 dark:text-green-400 mb-2" />
            <p className="font-semibold text-green-800 dark:text-green-200">Thank you for your feedback!</p>
            <p className="text-sm text-green-700 dark:text-green-300">Your insights help improve the scanner.</p>
        </div>
    );
}


export function ResultsDisplay({ url, report, summary }: ResultsDisplayProps) {
    const reportSections = parseReport(report);
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


    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">Scan Complete</h1>
                <p className="text-muted-foreground md:text-xl mt-2">
                    Results for: <span className="font-medium text-primary break-all">{url}</span>
                </p>
            </div>
            
            <ReportActions url={url} report={report} summary={summary} showFeedbackSuccess={isFeedbackVisible} />

            {isFeedbackVisible && <FeedbackSuccessMessage />}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="w-6 h-6 text-accent" />
                        AI Summary
                    </CardTitle>
                    <CardDescription>
                        A quick, easy-to-understand summary of all findings.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{summary}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-6 h-6 text-primary" />
                        Detailed Vulnerability Report
                    </CardTitle>
                    <CardDescription>
                        A breakdown of potential vulnerabilities found by the scanner.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {reportSections.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                            {reportSections.map((section, index) => {
                                const { icon, variant, level } = getSeverityInfo(section.title);
                                return (
                                    <AccordionItem value={`item-${index}`} key={index}>
                                        <AccordionTrigger className="text-left hover:no-underline gap-3">
                                            <div className="flex items-center gap-3 flex-grow">
                                                {icon}
                                                <span className="font-semibold">{section.title}</span>
                                            </div>
                                            <Badge variant={variant}>{level}</Badge>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <ReportContent content={section.content} />
                                        </AccordionContent>
                                    </AccordionItem>
                                )
                            })}
                        </Accordion>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                            <p>No vulnerabilities were detailed in the report.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
