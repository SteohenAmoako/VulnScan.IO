
'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, BarChart2, PieChart as PieChartIcon } from 'lucide-react';

interface SeverityChartProps {
    data: { name: string; value: number; fill: string }[];
}

export function SeverityChart({ data }: SeverityChartProps) {
    const hasData = data.some(item => item.value > 0);
    const chartData = data.filter(d => d.name !== 'Secure');

    return (
        <Card className="sticky top-24">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    Overall Severity
                </CardTitle>
                <CardDescription>
                    A visual summary of the detected vulnerability levels.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {hasData ? (
                   <Tabs defaultValue="pie" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="pie"><PieChartIcon className="w-4 h-4 mr-2" />Donut</TabsTrigger>
                            <TabsTrigger value="bar"><BarChart2 className="w-4 h-4 mr-2" />Bar</TabsTrigger>
                        </TabsList>
                        <TabsContent value="pie">
                             <div className="w-full h-64 mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.filter(item => item.value > 0)}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            innerRadius={60}
                                            fill="#8884d8"
                                            dataKey="value"
                                            nameKey="name"
                                            paddingAngle={5}
                                        >
                                            {data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                        formatter={(value, name) => [`${value} issues`, name]}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </TabsContent>
                        <TabsContent value="bar">
                             <div className="w-full h-64 mt-4">
                                 <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={chartData}
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                        >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip 
                                            formatter={(value, name) => [`${value} issues`, name]}
                                        />
                                        <Legend />
                                        <Bar dataKey="value" fill="#8884d8">
                                             {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No data to display for the severity chart.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
