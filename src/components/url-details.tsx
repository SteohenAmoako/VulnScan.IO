
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, ShieldCheck, Search, Info } from "lucide-react";
import type { DomainInfo } from "@/ai/flows/get-domain-info";

interface URLDetailsProps {
    url: string;
    domainInfo: DomainInfo | null;
}

const MALICIOUS_PATTERNS = [
  { label: 'XSS: <script>', regex: /<script.?>.?<\/script>/i },
  { label: 'JavaScript URI', regex: /javascript:/i },
  { label: 'XSS: onerror/onload', regex: /on(error|load)\s*=/i },
  { label: 'SQLi: UNION SELECT', regex: /union\s+select/i },
  { label: 'SQLi: OR 1=1', regex: /(['"`])?\s*or\s*1\s*=\s*1/i },
  { label: 'SQL Comment (--)', regex: /--/ },
  { label: 'SQL: DROP TABLE', regex: /drop\s+table/i }
];

function analyzeUrlParameters(inputUrl: string) {
    try {
        const url = new URL(inputUrl);
        const searchParams = new URLSearchParams(url.search);
        const findings = [];

        if (searchParams.entries().next().done) {
            return { hasParams: false, findings: [] };
        }

        for (const [key, value] of searchParams.entries()) {
            const matches = MALICIOUS_PATTERNS
                .filter(({ regex }) => regex.test(value))
                .map(({ label }) => label);

            findings.push({ key, value, matches });
        }
        return { hasParams: true, findings };
    } catch (error) {
        return { hasParams: false, findings: [{ key: 'Error', value: (error as Error).message, matches: [] }] };
    }
}

export function URLDetails({ url, domainInfo }: URLDetailsProps) {
    const isHttps = new URL(url).protocol === 'https:';
    const { hasParams, findings } = analyzeUrlParameters(url);

    return (
        <div className="container px-4 md:px-6 py-12">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                            HTTPS Check
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-2">
                        {isHttps ? (
                            <>
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <span className="font-medium text-green-500">Secure: Using HTTPS</span>
                            </>
                        ) : (
                            <>
                                <AlertTriangle className="w-5 h-5 text-destructive" />
                                <span className="font-medium text-destructive">Not Secure: Using HTTP</span>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="w-6 h-6 text-primary" />
                            URL Parameter Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!hasParams ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <CheckCircle2 className="w-5 h-5" />
                                <span>No URL parameters to analyze.</span>
                            </div>
                        ) : (
                            <ul className="space-y-2 text-sm">
                                {findings.map(({ key, value, matches }, index) => (
                                    <li key={index} className="flex flex-col">
                                        <div>
                                            <strong className="font-semibold">{key}:</strong> <code className="text-muted-foreground break-all">{value}</code>
                                        </div>
                                        {matches.length > 0 ? (
                                            <div className="flex items-center gap-2 text-destructive">
                                                <AlertTriangle className="w-4 h-4" />
                                                <span className="font-medium">Potential Issues: {matches.join(', ')}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-green-500">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>No malicious patterns found.</span>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Info className="w-6 h-6 text-primary" />
                            Domain Info
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {domainInfo && !domainInfo.error ? (
                            <ul className="space-y-1 text-sm">
                                {domainInfo.domain_age && <li><strong>Domain Age:</strong> {domainInfo.domain_age}</li>}
                                {domainInfo.registrar && <li><strong>Registrar:</strong> {domainInfo.registrar}</li>}
                                {domainInfo.country && <li><strong>Country:</strong> {domainInfo.country}</li>}
                                {domainInfo.created && <li><strong>Created:</strong> {domainInfo.created}</li>}
                                {domainInfo.updated && <li><strong>Updated:</strong> {domainInfo.updated}</li>}
                                {domainInfo.expired && <li><strong>Expires:</strong> {domainInfo.expired}</li>}
                            </ul>
                        ) : (
                             <p className="text-sm text-muted-foreground">Domain information could not be retrieved. The API key may be missing or invalid.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
