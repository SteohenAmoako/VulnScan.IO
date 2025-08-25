
'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, BarChart2, PieChart as PieChartIcon, Shield, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

interface SeverityChartProps {
    data: { name: string; value: number; fill: string }[];
    totalIssues: number;
}

// Custom label function for pie chart
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }: any) => {
    if (value === 0 || percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px" fontWeight="bold">
            {`${value}`}
        </text>
    );
};


// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div className="bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-border">
                <div className="flex items-center gap-2 mb-1">
                    <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: data.payload.fill }}
                    />
                    <span className="font-semibold text-sm text-foreground">{data.payload.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                    Issues Found: <span className="font-medium text-foreground">{data.value}</span>
                </p>
            </div>
        );
    }
    return null;
};

// Summary stats component
const SeverityStats = ({ data, totalIssues }: { data: any[], totalIssues: number }) => {
    const criticalCount = data.find(item => item.name === 'Critical')?.value || 0;
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-muted/50 p-3 sm:p-4 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">Total Issues</span>
                </div>
                <span className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{totalIssues}</span>
            </div>
            
            <div className="bg-muted/50 p-3 sm:p-4 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
                    <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">Critical</span>
                </div>
                <span className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">{criticalCount}</span>
            </div>
            
            <div className="bg-muted/50 p-3 sm:p-4 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">Posture</span>
                </div>
                <span className={`text-sm sm:text-base font-semibold ${totalIssues > 5 ? 'text-red-600' : totalIssues > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                    {totalIssues > 5 ? 'Weak' : totalIssues > 0 ? 'Moderate' : 'Strong'}
                </span>
            </div>
        </div>
    );
};

export function SeverityChart({ data, totalIssues }: SeverityChartProps) {
    const hasData = data.some(item => item.value > 0);
    const chartData = data.filter(d => d.value > 0);

    return (
        <Card className="w-full max-w-full overflow-hidden sticky top-20 sm:top-24" id="severity-chart-card">
            <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl lg:text-2xl break-words">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                    <span>Overall Severity Analysis</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base break-words">
                    A visual summary of all identified security issues.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {hasData ? (
                    <div className="w-full">
                        <SeverityStats data={data} totalIssues={totalIssues}/>
                        
                        <Tabs defaultValue="pie" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 h-auto p-1">
                                <TabsTrigger value="pie" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
                                    <PieChartIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden xs:inline">Donut Chart</span>
                                    <span className="xs:hidden">Chart</span>
                                </TabsTrigger>
                                <TabsTrigger value="bar" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
                                    <BarChart2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden xs:inline">Bar Graph</span>
                                    <span className="xs:hidden">Graph</span>
                                </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="pie" className="mt-3 sm:mt-4 md:mt-6">
                                <div className="w-full h-64 sm:h-72 md:h-80 lg:h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={renderCustomLabel}
                                                outerRadius="80%"
                                                innerRadius="50%"
                                                dataKey="value"
                                                nameKey="name"
                                                paddingAngle={3}
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={entry.fill}
                                                        strokeWidth={0}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend 
                                                wrapperStyle={{ paddingTop: '20px' }}
                                                iconType="circle"
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="bar" className="mt-3 sm:mt-4 md:mt-6">
                                <div className="w-full h-64 sm:h-72 md:h-80 lg:h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={chartData}
                                            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                                        >
                                            <CartesianGrid 
                                                strokeDasharray="3 3" 
                                                className="opacity-30"
                                            />
                                            <XAxis 
                                                dataKey="name"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis 
                                                allowDecimals={false}
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar 
                                                dataKey="value" 
                                                radius={[4, 4, 0, 0]}
                                                name="Vulnerabilities"
                                                maxBarSize={40}
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                ) : (
                    <div className="text-center py-8 sm:py-10 md:py-12 text-muted-foreground">
                        <Shield className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-green-500 opacity-50" />
                        <p className="text-sm sm:text-base md:text-lg font-medium">No vulnerabilities detected</p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-2">Your security scan shows a clean result</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
