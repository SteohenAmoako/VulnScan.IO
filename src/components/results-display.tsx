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
    const sections = reportText.split('\n\n').map(section => {
        const lines = section.split('\n');
        const title = lines[0].replace(/:\s*$/, '').trim();
        const content = lines.slice(1).join('\n').trim();
        return { title, content };
    }).filter(s => s.title && s.content);
    
    if (sections.length === 0 && reportText.trim()) {
        return [{ title: "Full Report", content: reportText }];
    }
    return sections;
}

function getSeverityInfo(title: string): { icon: React.ReactNode; variant: "destructive" | "secondary" | "default"; level: string } {
    const lowerCaseTitle = title.toLowerCase();
    if (lowerCaseTitle.includes('high') || lowerCaseTitle.includes('critical')) {
        return { icon: <AlertCircle className="w-5 h-5 text-destructive" />, variant: 'destructive', level: "High" };
    }
    if (lowerCaseTitle.includes('medium') || lowerCaseTitle.includes('moderate')) {
        return { icon: <ShieldQuestion className="w-5 h-5 text-yellow-500" />, variant: 'secondary', level: 'Medium' };
    }
    if (lowerCaseTitle.includes('low') || lowerCaseTitle.includes('informational') || lowerCaseTitle.includes('no threats')) {
        return { icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, variant: 'default', level: 'Low' };
    }
    return { icon: <FileText className="w-5 h-5 text-muted-foreground" />, variant: 'default', level: 'Info' };
}

export function ResultsDisplay({ url, report, summary }: ResultsDisplayProps) {
    const reportSections = parseReport(report);

    return (
        <div className="container px-4 md:px-6 py-12">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">Scan Complete</h1>
                <p className="text-muted-foreground md:text-xl mt-2">
                    Results for: <span className="font-medium text-primary break-all">{url}</span>
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-6 h-6 text-primary" />
                                Detailed Vulnerability Report
                            </CardTitle>
                            <CardDescription>
                                A breakdown of potential vulnerabilities found on the website.
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
                                                    <pre className="p-4 bg-muted rounded-md text-sm text-foreground overflow-x-auto font-code whitespace-pre-wrap">
                                                        {section.content}
                                                    </pre>
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

                <div className="lg:col-span-1">
                    <Card className="sticky top-24">
                         <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="w-6 h-6 text-accent" />
                                AI Summary
                            </CardTitle>
                            <CardDescription>
                                A quick, easy-to-understand summary of the findings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{summary}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
