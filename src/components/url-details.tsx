
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, ShieldCheck, Search, Info } from "lucide-react";
import type { DomainInfo } from "@/ai/flows/get-domain-info";

interface URLDetailsProps {
    url: string;
    domainInfo: DomainInfo | null;
    urlParamAnalysis: {
        hasParams: boolean;
        findings: {
            key: string;
            value: string;
            matches: string[];
        }[];
    }
}

const MALICIOUS_PATTERNS = [
  // 🔥 XSS (Cross-Site Scripting)
  { label: 'XSS: <script> Tag', regex: /<script\b[^>]*>(.*?)<\/script>/i },
  { label: 'XSS: JavaScript URI', regex: /javascript:[^"'\s]*/i },
  { label: 'XSS: Event Handlers (onerror, onload, etc.)', regex: /on(?:error|load|mouseover|focus|click|submit|blur)\s*=/i },
  { label: 'XSS: iframe Injection', regex: /<iframe\b[^>]*>(.*?)<\/iframe>/i },
  { label: 'XSS: img with onerror', regex: /<img\b[^>]*onerror\s*=\s*["'][^"']*["']/i },
  { label: 'XSS: Object/embed injection', regex: /<(object|embed|applet)[^>]*>/i },
  { label: 'XSS: SVG Injection', regex: /<svg\b[^>]*on\w+\s*=/i },

  // 🛢️ SQL Injection (SQLi)
  { label: 'SQLi: UNION SELECT', regex: /union\s+select/i },
  { label: 'SQLi: OR 1=1', regex: /(['"`])?\s*or\s+1\s*=\s*1/i },
  { label: 'SQLi: AND 1=1', regex: /(['"`])?\s*and\s+1\s*=\s*1/i },
  { label: 'SQLi: Tautology Attack', regex: /(['"`])\s*=\s*\1/i },
  { label: 'SQLi: SQL Comment (-- or #)', regex: /(--|#)/ },
  { label: 'SQLi: DROP TABLE', regex: /drop\s+table/i },
  { label: 'SQLi: INSERT INTO', regex: /insert\s+into/i },
  { label: 'SQLi: SELECT * FROM', regex: /select\s+\*\s+from/i },
  { label: 'SQLi: UPDATE Statement', regex: /update\s+\w+\s+set/i },
  { label: 'SQLi: xp_cmdshell (SQL Server)', regex: /xp_cmdshell/i },

  // 🐚 Command Injection
  { label: 'CMDi: Semicolon Injection', regex: /;[\s\S]*\b(sh|bash|cmd|powershell)\b/i },
  { label: 'CMDi: Pipe Injection', regex: /\|\s*(ls|cat|whoami|nc|curl|wget|rm|touch)/i },
  { label: 'CMDi: Backtick Execution', regex: /`.*`/ },
  { label: 'CMDi: Subshell $(...)', regex: /\$\((.*?)\)/ },

  // 🗂️ Path Traversal
  { label: 'Path Traversal: ../', regex: /(\.\.\/)+/ },
  { label: 'Path Traversal: Windows-style', regex: /(\.\.\\)+/ },
  { label: 'Path Traversal: Double Encoded', regex: /%252e%252e%252f/i },

  // 🛡️ Local File Inclusion (LFI)
  { label: 'LFI: /etc/passwd', regex: /\/etc\/passwd/i },
  { label: 'LFI: boot.ini', regex: /boot\.ini/i },
  { label: 'LFI: Windows win.ini', regex: /win\.ini/i },

  // 🧬 LDAP Injection
  { label: 'LDAPi: Always True Filter', regex: /\(\|\)/ },
  { label: 'LDAPi: Wildcard Injection', regex: /\*\)|\(|\*/ },

  // 💥 Shellshock
  { label: 'Shellshock: Bash function definition', regex: /\(\)\s*\{\s*:\s*;\s*\};/ },

  // 🕸️ Other Suspicious Patterns
  { label: 'Base64-like payload', regex: /([A-Za-z0-9+/]{20,}={0,2})/ },
  { label: 'Suspicious Query Parameter Key (e.g. token, auth)', regex: /\b(token|auth|password|passwd|secret)\b/i },
  { label: 'Encoded <script> tag (%3Cscript)', regex: /%3Cscript/i },
  { label: 'Encoded ../ (%2e%2e)', regex: /%2e%2e/i }
];


export function analyzeUrlParameters(inputUrl: string) {
    try {
        const url = new URL(inputUrl);
        const searchParams = new URLSearchParams(url.search);
        const findings = [];

        if (searchParams.entries().next().done) {
            return { hasParams: false, findings: [] };
        }

        for (const [key, value] of searchParams.entries()) {
            const matches = MALICIOUS_PATTERNS
                .filter(({ regex }) => regex.test(value) || regex.test(key))
                .map(({ label }) => label);

            findings.push({ key, value, matches });
        }
        return { hasParams: true, findings };
    } catch (error) {
        return { hasParams: false, findings: [{ key: 'Error', value: (error as Error).message, matches: [] }] };
    }
}

export function URLDetails({ url, domainInfo, urlParamAnalysis }: URLDetailsProps) {
    const isHttps = new URL(url).protocol === 'https:';
    const { hasParams, findings } = urlParamAnalysis;

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
                            <ul className="space-y-2 text-sm max-h-40 overflow-y-auto">
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
