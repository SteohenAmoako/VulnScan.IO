
'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface SeverityChartProps {
    data: { name: string; value: number; fill: string }[];
}

export function SeverityChart({ data }: SeverityChartProps) {
    const hasData = data.some(item => item.value > 0);

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
                    <div className="w-full h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No data to display for the severity chart.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
