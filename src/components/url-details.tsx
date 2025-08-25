'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, ShieldCheck, Info, Lock, Microscope, Globe, Calendar, User } from "lucide-react";
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
    };
    mozillaGradeInfo: {
        variant: "default" | "secondary" | "destructive";
        description: string;
    };
}

const getSslGradeVariant = (grade: string | undefined) => {
    if (!grade) return 'secondary';
    if (['A+', 'A'].includes(grade)) return 'default';
    if (['B', 'C'].includes(grade)) return 'secondary';
    return 'destructive';
}

// Custom tooltip for Mozilla Observatory chart
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        if (data.payload.name === 'Score') {
            return (
                <div className="bg-background border border-border rounded-md p-2 shadow-md">
                    <p className="text-sm font-medium">Security Score</p>
                    <p className="text-xs text-muted-foreground">{data.value} out of 100</p>
                </div>
            );
        }
    }
    return null;
};

export function URLDetails({ url, domainInfo, sslInfo, mozillaInfo, urlParamAnalysis, mozillaGradeInfo }: URLDetailsProps) {
    const isHttps = new URL(url).protocol === 'https:';

    const mozillaScore = mozillaInfo?.score ?? 0;
    const mozillaChartData = [
        { name: 'Score', value: mozillaScore, fill: 'hsl(var(--primary))' },
        { name: 'Remaining', value: Math.max(100 - mozillaScore, 0), fill: 'hsl(var(--muted))' }
    ];
    
    return (
        <div className="w-full max-w-full px-2 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10 lg:py-12">
            <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
                
                {/* HTTPS Check Card */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg">
                            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary flex-shrink-0" />
                            <span>HTTPS Security</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                            {isHttps ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <span className="font-medium text-green-600 text-sm sm:text-base block break-words">Secure Connection</span>
                                        <span className="text-xs sm:text-sm text-muted-foreground">Using HTTPS protocol</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive flex-shrink-0" />
                                    <div className="min-w-0">
                                        <span className="font-medium text-destructive text-sm sm:text-base block break-words">Not Secure</span>
                                        <span className="text-xs sm:text-sm text-muted-foreground">Using HTTP protocol</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* SSL/TLS Analysis Card */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg">
                            <Lock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary flex-shrink-0" />
                            <span>SSL/TLS Analysis</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {sslInfo && !sslInfo.error ? (
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex flex-col xs:flex-row items-start xs:items-center gap-1 xs:gap-2">
                                    <span className="font-semibold text-xs sm:text-sm">Grade:</span>
                                    <Badge variant={getSslGradeVariant(sslInfo.grade)} className="text-xs">
                                        {sslInfo.grade || 'N/A'}
                                    </Badge>
                                </div>
                                {sslInfo.protocols && sslInfo.protocols.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="font-semibold text-xs sm:text-sm">Protocols:</span>
                                        <div className="flex flex-wrap gap-1">
                                            {sslInfo.protocols.map((p, i) => (
                                                <Badge key={i} variant="outline" className="text-xs px-2 py-1">
                                                    {p}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs sm:text-sm text-muted-foreground break-words">
                                    {sslInfo?.error || 'SSL/TLS information could not be retrieved.'}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Mozilla Observatory Card - spans 2 columns on larger screens */}
                <Card className="w-full sm:col-span-2 lg:col-span-1 xl:col-span-2" id="mozilla-chart-card">
                    <CardHeader>
                        <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg">
                            <Microscope className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary flex-shrink-0" />
                            <span>Mozilla Observatory</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {mozillaInfo && !mozillaInfo.error ? (
                            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                                <div className="flex-grow space-y-2 sm:space-y-3 min-w-0">
                                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
                                        <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2">
                                            <span className="font-semibold text-xs sm:text-sm">Grade:</span>
                                            <Badge variant={mozillaGradeInfo.variant} className="text-xs w-fit">
                                                {mozillaInfo.grade || 'N/A'}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2">
                                            <span className="font-semibold text-xs sm:text-sm">Score:</span>
                                            <span className="font-bold text-sm sm:text-base">{mozillaInfo.score} / 100</span>
                                        </div>
                                    </div>
                                    <p className="text-xs sm:text-sm text-muted-foreground break-words leading-relaxed">
                                        {mozillaGradeInfo.description}
                                    </p>
                                </div>
                                <div className="w-full lg:w-24 xl:w-32 h-20 sm:h-24 lg:h-24 xl:h-32 flex-shrink-0 mx-auto lg:mx-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={mozillaChartData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                innerRadius="60%"
                                                outerRadius="85%"
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {mozillaChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs sm:text-sm text-muted-foreground break-words">
                                    {mozillaInfo?.error || 'Mozilla Observatory scan could not be completed.'}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Domain Info Card */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg">
                            <Info className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary flex-shrink-0" />
                            <span>Domain Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {domainInfo && !domainInfo.error ? (
                            <div className="space-y-2 sm:space-y-3">
                                {domainInfo.domain_age && (
                                    <div className="flex items-start gap-2">
                                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                        <div className="min-w-0">
                                            <span className="text-xs sm:text-sm font-medium">Domain Age</span>
                                            <p className="text-xs text-muted-foreground break-words">{domainInfo.domain_age}</p>
                                        </div>
                                    </div>
                                )}
                                {domainInfo.registrar && (
                                    <div className="flex items-start gap-2">
                                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                        <div className="min-w-0">
                                            <span className="text-xs sm:text-sm font-medium">Registrar</span>
                                            <p className="text-xs text-muted-foreground break-words">{domainInfo.registrar}</p>
                                        </div>
                                    </div>
                                )}
                                {domainInfo.country && (
                                    <div className="flex items-start gap-2">
                                        <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                        <div className="min-w-0">
                                            <span className="text-xs sm:text-sm font-medium">Country</span>
                                            <p className="text-xs text-muted-foreground break-words">{domainInfo.country}</p>
                                        </div>
                                    </div>
                                )}
                                {(domainInfo.created || domainInfo.updated || domainInfo.expired) && (
                                    <div className="pt-2 border-t border-border/50">
                                        <div className="grid gap-1.5 text-xs">
                                            {domainInfo.created && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Created:</span>
                                                    <span className="font-mono break-words text-right">{domainInfo.created}</span>
                                                </div>
                                            )}
                                            {domainInfo.updated && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Updated:</span>
                                                    <span className="font-mono break-words text-right">{domainInfo.updated}</span>
                                                </div>
                                            )}
                                            {domainInfo.expired && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Expires:</span>
                                                    <span className="font-mono break-words text-right">{domainInfo.expired}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs sm:text-sm text-muted-foreground break-words leading-relaxed">
                                    Domain information could not be retrieved. The API key may be missing or invalid.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}