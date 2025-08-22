
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, ShieldCheck, Info, Lock, Microscope } from "lucide-react";
import type { DomainInfo } from "@/ai/flows/get-domain-info";
import type { SslLabsInfo } from "@/ai/flows/get-ssl-info";
import type { MozillaObservatoryInfo } from "@/ai/flows/get-mozilla-observatory-info";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';


interface URLDetailsProps {
    url: string;
    domainInfo: DomainInfo | null;
    sslInfo: SslLabsInfo | null;
    mozillaInfo: MozillaObservatoryInfo | null;
    urlParamAnalysis: {
        hasParams: boolean;
        findings: {
            key: string;
            value: string;
            matches: string[];
        }[];
    }
}

const getSslGradeVariant = (grade: string | undefined) => {
    if (!grade) return 'secondary';
    if (['A+', 'A'].includes(grade)) return 'default';
    if (['B', 'C'].includes(grade)) return 'secondary';
    return 'destructive';
}

const getMozillaGradeVariant = (grade: string | undefined) => {
    if (!grade) return 'secondary';
    if (['A+', 'A', 'A-'].includes(grade)) return 'default';
    if (['B+', 'B', 'B-'].includes(grade)) return 'secondary';
    return 'destructive';
};


export function URLDetails({ url, domainInfo, sslInfo, mozillaInfo, urlParamAnalysis }: URLDetailsProps) {
    const isHttps = new URL(url).protocol === 'https:';

    const mozillaScore = mozillaInfo?.score ?? 0;
    const mozillaChartData = [
        { name: 'Score', value: mozillaScore, fill: 'hsl(var(--primary))' },
        { name: 'Remaining', value: Math.max(100 - mozillaScore, 0), fill: 'hsl(var(--muted))' }
    ];

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
                                    <Badge variant={getSslGradeVariant(sslInfo.grade)}>{sslInfo.grade || 'N/A'}</Badge>
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
                <Card className="lg:col-span-1 xl:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Microscope className="w-6 h-6 text-primary" />
                            Mozilla Observatory
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {mozillaInfo && !mozillaInfo.error ? (
                            <div className="grid grid-cols-2 gap-4 items-center">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">Grade:</span>
                                        <Badge variant={getMozillaGradeVariant(mozillaInfo.grade)}>{mozillaInfo.grade || 'N/A'}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">Score:</span>
                                        <span className="font-bold">{mozillaInfo.score} / 100</span>
                                    </div>
                                </div>
                                <div className="w-full h-24">
                                     <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={mozillaChartData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                innerRadius={25}
                                                outerRadius={40}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {mozillaChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                                                formatter={(value, name) => [value, name]}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ) : (
                             <p className="text-sm text-muted-foreground">{mozillaInfo?.error || 'Mozilla Observatory scan could not be completed.'}</p>
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
