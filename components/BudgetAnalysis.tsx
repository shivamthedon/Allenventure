import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { UserFinancialProfile, Transaction, BudgetAnalysisResponse } from '../types';
import { getBudgetAnalysisInsights } from '../services/geminiService';
import { 
    SparklesIcon, 
    LightbulbIcon,
    BanknotesIcon,
    ShoppingCartIcon,
    BuildingStorefrontIcon
} from './icons/Icons';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
}).format(value);

const COLORS = {
    Needs: '#3b82f6', // blue-500
    Wants: '#f97316', // orange-500
    Savings: '#10b981', // emerald-500
};
const RADIAN = Math.PI / 180;

interface CustomizedLabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    index: number;
}

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: CustomizedLabelProps) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    if (percent < 0.05) return null; // Don't render label for very small slices

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
};

const getCategoryIcon = (category: 'Needs' | 'Wants' | 'Savings') => {
    const props = { className: "h-5 w-5" };
    switch (category) {
        case 'Needs':
            return <BuildingStorefrontIcon {...props} />;
        case 'Wants':
            return <ShoppingCartIcon {...props} />;
        case 'Savings':
            return <BanknotesIcon {...props} />;
        default:
            return null;
    }
};


const BudgetAnalysis: React.FC<{ userProfile: UserFinancialProfile }> = ({ userProfile }) => {
    const [insights, setInsights] = useState<BudgetAnalysisResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const monthlyIncome = userProfile.annualIncome / 12;
    
    const mockTransactions: Transaction[] = useMemo(() => {
        // Create mock data that is realistic but slightly off the 50/30/20 ideal to give the AI something to analyze.
        const spendable = monthlyIncome - userProfile.monthlySavings;
        const needsAmount = monthlyIncome * 0.48; // 48%
        const wantsAmount = spendable - needsAmount; // ~34%
        
        return [
            { id: 't1', description: 'Apartment Rent', amount: needsAmount * 0.5, category: 'Needs', date: '2023-10-01' },
            { id: 't2', description: 'Groceries', amount: needsAmount * 0.2, category: 'Needs', date: '2023-10-05' },
            { id: 't3', description: 'Dining Out & Cafes', amount: wantsAmount * 0.4, category: 'Wants', date: '2023-10-08' },
            { id: 't4', description: 'Electricity Bill', amount: needsAmount * 0.1, category: 'Needs', date: '2023-10-10' },
            { id: 't5', description: 'Weekend Shopping', amount: wantsAmount * 0.35, category: 'Wants', date: '2023-10-14' },
            { id: 't6', description: 'Transport (Metro)', amount: needsAmount * 0.1, category: 'Needs', date: '2023-10-15' },
            { id: 't7', description: 'Movie Tickets', amount: wantsAmount * 0.1, category: 'Wants', date: '2023-10-18' },
            { id: 't8', description: 'Internet & Phone', amount: needsAmount * 0.1, category: 'Needs', date: '2023-10-20' },
            { id: 't9', description: 'Streaming Subscriptions', amount: wantsAmount * 0.15, category: 'Wants', date: '2023-10-25' },
        ];
    }, [monthlyIncome, userProfile.monthlySavings]);

    const budgetData = useMemo(() => {
        const needsTotal = mockTransactions.filter(t => t.category === 'Needs').reduce((acc, t) => acc + t.amount, 0);
        const wantsTotal = mockTransactions.filter(t => t.category === 'Wants').reduce((acc, t) => acc + t.amount, 0);

        return [
            { name: 'Needs', value: needsTotal, percentage: (needsTotal / monthlyIncome * 100) },
            { name: 'Wants', value: wantsTotal, percentage: (wantsTotal / monthlyIncome * 100) },
            { name: 'Savings', value: userProfile.monthlySavings, percentage: (userProfile.monthlySavings / monthlyIncome * 100) },
        ];
    }, [mockTransactions, userProfile.monthlySavings, monthlyIncome]);

    const totalExpenses = budgetData.find(d => d.name === 'Needs')!.value + budgetData.find(d => d.name === 'Wants')!.value;

    useEffect(() => {
        const fetchInsights = async () => {
            setIsLoading(true);
            try {
                const result = await getBudgetAnalysisInsights(userProfile, mockTransactions);
                setInsights(result);
            } catch (error) {
                console.error("Failed to get budget insights:", error);
                setInsights({
                    overallFeedback: "There was an issue analyzing your budget, but a good rule of thumb is the 50/30/20 rule: 50% on needs, 30% on wants, and 20% on savings.",
                    insights: []
                });
            }
            setIsLoading(false);
        };
        fetchInsights();
    }, [userProfile, mockTransactions]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Monthly Budget Analysis</h2>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Chart */}
                <div className="lg:col-span-2 relative h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={budgetData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={85}
                                fill="#8884d8"
                                paddingAngle={5}
                                labelLine={false}
                                label={renderCustomizedLabel}
                            >
                                {budgetData.map((entry) => <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name as keyof typeof COLORS]} />)}
                            </Pie>
                            <Tooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-xs text-slate-500">Spent</span>
                        <span className="text-2xl font-bold text-slate-800">{formatCurrency(totalExpenses)}</span>
                    </div>
                </div>

                {/* Legend and Summary */}
                <div className="lg:col-span-3 space-y-3">
                    {budgetData.map(item => (
                        <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[item.name as keyof typeof COLORS] }}></span>
                                <span className="font-semibold text-slate-700">{item.name}</span>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-slate-800">{formatCurrency(item.value)}</span>
                                <span className="text-xs text-slate-500 ml-2">({item.percentage.toFixed(1)}%)</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-200">
                {/* AI Insights */}
                <div className="space-y-3">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <SparklesIcon className="h-5 w-5 text-blue-500" />
                        AI Financial Coach
                    </h3>
                    {isLoading ? (
                        <div className="p-4 bg-slate-100 rounded-lg space-y-2 animate-pulse">
                           <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                           <div className="h-4 bg-slate-200 rounded w-full"></div>
                           <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                        </div>
                    ) : (
                        <div className="p-4 bg-blue-50/70 border-l-4 border-blue-400 rounded-r-lg text-sm text-slate-700 italic">
                            "{insights?.overallFeedback}"
                        </div>
                    )}
                    <div className="space-y-2">
                        {isLoading ? Array.from({length: 2}).map((_, i) => (
                             <div key={i} className="p-3 bg-slate-100 rounded-lg space-y-2 animate-pulse">
                                <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                                <div className="h-3 bg-slate-200 rounded w-full"></div>
                            </div>
                        )) : insights?.insights.map(insight => (
                             <div key={insight.category} className="p-3 bg-slate-100/70 rounded-lg">
                                <p className="font-semibold text-sm text-slate-800 mb-1" style={{color: COLORS[insight.category as keyof typeof COLORS]}}>{insight.category} Insight:</p>
                                <p className="text-xs text-slate-600"><strong>Observation:</strong> {insight.message}</p>
                                <p className="text-xs text-slate-600 mt-1"><strong>💡 Suggestion:</strong> {insight.suggestion}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Transactions */}
                <div className="space-y-3">
                     <h3 className="font-bold text-slate-800">Recent Transactions (Sample)</h3>
                     <div className="space-y-2">
                        {mockTransactions.map(t => (
                            <div key={t.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg text-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full" style={{ backgroundColor: `${COLORS[t.category]}20`, color: COLORS[t.category]}}>
                                        {getCategoryIcon(t.category)}
                                    </div>
                                    <span className="text-slate-700">{t.description}</span>
                                </div>
                                <span className="font-semibold text-slate-800">{formatCurrency(t.amount)}</span>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetAnalysis;
