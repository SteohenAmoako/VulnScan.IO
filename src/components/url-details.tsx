
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, ShieldCheck, Search, Info, Lock } from "lucide-react";
import type { DomainInfo } from "@/ai/flows/get-domain-info";
import type { SslLabsInfo } from "@/ai/flows/get-ssl-info";
import { Badge } from "@/components/ui/badge";


interface URLDetailsProps {
    url: string;
    domainInfo: DomainInfo | null;
    sslInfo: SslLabsInfo | null;
    urlParamAnalysis: {
        hasParams: boolean;
        findings: {
            key: string;
            value: string;
            matches: string[];
        }[];
    }
}

const getGradeVariant = (grade: string | undefined) => {
    if (!grade) return 'secondary';
    if (['A+', 'A'].includes(grade)) return 'default';
    if (['B', 'C'].includes(grade)) return 'secondary';
    return 'destructive';
}

export function URLDetails({ url, domainInfo, sslInfo, urlParamAnalysis }: URLDetailsProps) {
    const isHttps = new URL(url).protocol === 'https:';
    const { hasParams, findings } = urlParamAnalysis;

    return (
        <div className="container px-4 md:px-6 py-12">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
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
                            <Lock className="w-6 h-6 text-primary" />
                            SSL/TLS Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {sslInfo && !sslInfo.error ? (
                             <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">Grade:</span>
                                    <Badge variant={getGradeVariant(sslInfo.grade)}>{sslInfo.grade || 'N/A'}</Badge>
                                </div>
                                {sslInfo.protocols && sslInfo.protocols.length > 0 && (
                                    <div>
                                        <span className="font-semibold">Protocols:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {sslInfo.protocols.map((p, i) => <Badge key={i} variant="outline">{p}</Badge>)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                             <p className="text-sm text-muted-foreground">{sslInfo?.error || 'SSL/TLS information could not be retrieved.'}</p>
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
