import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { UserFinancialProfile, InvestmentRecommendation } from '../types';
import { ShieldCheckIcon, ScaleIcon, ArrowTrendingUpIcon, LightbulbIcon } from '../components/icons/Icons';

// --- HELPER FUNCTIONS ---
const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
}).format(value);

const formatCompactCurrency = (value: number) => `₹${new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    compactDisplay: 'short'
}).format(value)}`;

const getAssetClassReturn = (assetClass: string): number => {
    const lower = assetClass.toLowerCase();
    if (lower.includes('equity') || lower.includes('stock')) return 12;
    if (lower.includes('crypto')) return 20;
    if (lower.includes('reit') || lower.includes('real estate')) return 8;
    if (lower.includes('gold')) return 6;
    if (lower.includes('fixed') || lower.includes('bond') || lower.includes('ppf') || lower.includes('liquid') || lower.includes('deposit')) return 7;
    return 10; // Default for mixed/unknown
};

const calculateWeightedAverageReturn = (recommendations: InvestmentRecommendation[]): number => {
    if (!recommendations || recommendations.length === 0) return 10;
    const totalReturn = recommendations.reduce((acc, rec) => {
        const expectedReturn = getAssetClassReturn(rec.assetClass);
        return acc + (rec.allocationPercentage / 100) * expectedReturn;
    }, 0);
    return Math.round(totalReturn);
};

const calculateProjection = (monthlySavings: number, years: number, growthRate: number, annualIncrease: number): number => {
    let fv = 0;
    let monthly = monthlySavings;
    const monthlyGrowthRate = growthRate / 100 / 12;

    for (let i = 1; i <= years; i++) {
        for (let j = 0; j < 12; j++) {
            fv = fv * (1 + monthlyGrowthRate) + monthly;
        }
        monthly *= (1 + annualIncrease / 100);
    }
    return Math.round(fv);
};

// --- SUB-COMPONENTS ---
const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const principal = payload.find((p: any) => p.dataKey === 'principal')?.value || 0;
        const gains = payload.find((p: any) => p.dataKey === 'gains')?.value || 0;
        const total = principal + gains;
        return (
            <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-xl animate-fade-in text-sm">
                <p className="font-bold text-slate-800 mb-2">{label}</p>
                <p className="text-slate-600 flex items-center"><span className="inline-block w-3 h-3 rounded-full mr-2 bg-slate-400"></span>Total Invested: {formatCurrency(principal)}</p>
                <p className="text-slate-600 flex items-center"><span className="inline-block w-3 h-3 rounded-full mr-2" style={{backgroundColor: '#4ade80'}}></span>Wealth Gained: {formatCurrency(gains)}</p>
                <p className="font-bold text-slate-800 mt-2 border-t pt-2">Total Value: {formatCurrency(total)}</p>
            </div>
        );
    }
    return null;
};

// --- DATA & TYPES ---
const timeHorizons = [10, 15, 20, 30];
type InvestmentStyle = 'Steady' | 'Balanced' | 'Ambitious';

// --- MAIN COMPONENT ---
interface PortfolioProjectionCalculatorProps {
    userProfile: UserFinancialProfile;
    recommendations: InvestmentRecommendation[];
}

const PortfolioProjectionCalculator: React.FC<PortfolioProjectionCalculatorProps> = ({ userProfile, recommendations }) => {
    const initialGrowthRate = useMemo(() => calculateWeightedAverageReturn(recommendations), [recommendations]);
    
    const investmentStyles = useMemo(() => ({
      Steady: { name: 'Steady', growthRate: 8, savingsHike: 5, icon: ShieldCheckIcon, description: "Lower risk, consistent growth." },
      Balanced: { name: 'Balanced', growthRate: initialGrowthRate, savingsHike: 7, icon: ScaleIcon, description: "A moderate, balanced approach." },
      Ambitious: { name: 'Ambitious', growthRate: 14, savingsHike: 10, icon: ArrowTrendingUpIcon, description: "Higher growth potential." },
    }), [initialGrowthRate]);

    const [years, setYears] = useState(15);
    const [style, setStyle] = useState<InvestmentStyle>('Balanced');

    const { growthRate, savingsHike } = investmentStyles[style];

    const projectionData = useMemo(() => {
        const data = [];
        let futureValue = 0;
        let totalInvestment = 0;
        let currentMonthlyInvestment = userProfile.monthlySavings;
        const monthlyReturnRate = growthRate / 100 / 12;

        for (let i = 1; i <= years; i++) {
            for (let month = 0; month < 12; month++) {
                totalInvestment += currentMonthlyInvestment;
                futureValue = futureValue * (1 + monthlyReturnRate) + currentMonthlyInvestment;
            }
            data.push({
                year: `Year ${i}`,
                principal: Math.round(totalInvestment),
                gains: Math.max(0, Math.round(futureValue - totalInvestment)),
            });
            currentMonthlyInvestment *= (1 + savingsHike / 100);
        }
        return data;
    }, [years, growthRate, savingsHike, userProfile.monthlySavings]);
    
    const finalValue = (projectionData[projectionData.length - 1]?.principal || 0) + (projectionData[projectionData.length - 1]?.gains || 0);

    const insightText = useMemo(() => {
        const steadyValue = calculateProjection(userProfile.monthlySavings, years, investmentStyles.Steady.growthRate, investmentStyles.Steady.savingsHike);
        const ambitiousValue = calculateProjection(userProfile.monthlySavings, years, investmentStyles.Ambitious.growthRate, investmentStyles.Ambitious.savingsHike);
        const difference = ambitiousValue - steadyValue;

        if (difference <= 0 || style !== 'Ambitious') {
            return "Each investment style offers a different balance of potential growth and risk. Adjust the settings to see what fits you best!";
        }
        return `Over ${years} years, an 'Ambitious' strategy could potentially add ${formatCurrency(difference)} more to your portfolio compared to a 'Steady' approach.`;
    }, [years, userProfile.monthlySavings, investmentStyles, style]);
    
    return (
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-xl shadow-lg flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Portfolio Growth Projection</h2>
            <div className="text-center mb-4">
                <p className="text-sm text-slate-500">In {years} years, you could have</p>
                <p key={finalValue} className="text-4xl font-bold text-blue-600 animate-pop-in">{formatCurrency(finalValue)}</p>
            </div>
            
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="gainsGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.7}/>
                                <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="principalGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.6}/>
                                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                        <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis tickFormatter={formatCompactCurrency} tick={{ fill: '#64748b', fontSize: 12 }} width={50}/>
                        <Tooltip content={<CustomTooltipContent />} />
                        <Area type="monotone" dataKey="principal" stackId="1" stroke="#94a3b8" fill="url(#principalGradient)" name="Total Invested" />
                        <Area type="monotone" dataKey="gains" stackId="1" stroke="#4ade80" fill="url(#gainsGradient)" name="Wealth Gained" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="space-y-5 mt-6 pt-5 border-t border-slate-200">
                <div>
                    <label className="font-semibold text-slate-700 text-sm block mb-2">Time Horizon</label>
                    <div className="grid grid-cols-4 gap-2">
                        {timeHorizons.map(y => (
                            <button key={y} onClick={() => setYears(y)} className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${years === y ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100'}`}>
                                {y} Yrs
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <label className="font-semibold text-slate-700 text-sm block mb-2">Investment Style</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(Object.keys(investmentStyles) as InvestmentStyle[]).map(styleKey => {
                            const currentStyle = investmentStyles[styleKey];
                            const isActive = style === styleKey;
                            return (
                                <button key={styleKey} onClick={() => setStyle(styleKey)} className={`text-left p-3 rounded-lg transition-all duration-200 border-2 ${isActive ? 'bg-blue-50 border-blue-500' : 'bg-white border-transparent hover:bg-slate-100'}`}>
                                    <div className="flex items-center gap-2">
                                        <currentStyle.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                                        <span className={`font-semibold text-sm ${isActive ? 'text-blue-700' : 'text-slate-800'}`}>{currentStyle.name}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="mt-6 p-3 bg-blue-100/50 border-l-4 border-blue-400 rounded-r-lg">
                <div className="flex items-start gap-3">
                    <LightbulbIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700">{insightText}</p>
                </div>
            </div>
        </div>
    );
};

export default PortfolioProjectionCalculator;