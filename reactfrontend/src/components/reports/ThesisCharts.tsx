import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    LineChart, Line
} from 'recharts';

interface ComparisonData {
    metric: string;
    pre: number;
    post: number;
    unit: string;
}

interface ThesisChartProps {
    data: ComparisonData[];
    title: string;
    description?: string;
}

export const ComparisonBarChart: React.FC<ThesisChartProps> = ({ data, title, description }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
                {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
            </div>
            <div className="h-80 min-h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="metric" stroke="#888888" fontSize={12} />
                        <YAxis stroke="#888888" fontSize={12} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{ fill: 'transparent' }}
                        />
                        <Legend />
                        <Bar dataKey="pre" name="Pre-Test (Manual)" fill="#EF4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="post" name="Post-Test (Sistema Web)" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const HypothesisRadarChart: React.FC<{ data: any[], title: string }> = ({ data, title }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">{title}</h3>
            <div className="h-80 min-h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid opacity={0.2} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#888888', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} />
                        <Radar
                            name="Pre-Test"
                            dataKey="A"
                            stroke="#EF4444"
                            fill="#EF4444"
                            fillOpacity={0.3}
                        />
                        <Radar
                            name="Post-Test"
                            dataKey="B"
                            stroke="#10B981"
                            fill="#10B981"
                            fillOpacity={0.3}
                        />
                        <Legend />
                        <Tooltip />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const TrendLineChart: React.FC<{ data: any[], title: string, dataKey: string, color: string }> = ({ data, title, dataKey, color }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">{title}</h3>
            <div className="h-80 min-h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                        <YAxis stroke="#888888" fontSize={12} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
