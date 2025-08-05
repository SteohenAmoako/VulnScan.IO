'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertCircle, CheckCircle2, ShieldQuestion, FileText, Bot } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

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
    let parsedData;
    try {
        parsedData = JSON.parse(content);
    } catch (e) {
        // If it's not valid JSON, render as plain text.
        return (
            <div className="p-4 bg-muted rounded-md text-sm text-foreground overflow-x-auto font-code whitespace-pre-wrap">
                {content}
            </div>
        );
    }

    // It is JSON, so we format it as a key-value list.
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
}

export function ResultsDisplay({ url, report, summary }: ResultsDisplayProps) {
    const reportSections = parseReport(report);

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">Scan Complete</h1>
                <p className="text-muted-foreground md:text-xl mt-2">
                    Results for: <span className="font-medium text-primary break-all">{url}</span>
                </p>
            </div>

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
