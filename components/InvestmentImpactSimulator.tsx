import React, { useState, useMemo } from 'react';
import type { UserFinancialProfile, InvestmentRecommendation } from '../types';
import { SparklesIcon, ArrowTrendingUpIcon, ClockIcon } from './icons/Icons';

// --- HELPER FUNCTIONS ---
const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
}).format(value);

const calculateProjection = (monthlySavings: number, years: number, growthRate: number): number => {
    if (years <= 0) return 0;
    let fv = 0;
    const monthlyRate = growthRate / 100 / 12;
    const totalMonths = years * 12;

    for (let i = 0; i < totalMonths; i++) {
        fv = (fv + monthlySavings) * (1 + monthlyRate);
    }
    return fv;
};

const getAssetClassReturn = (assetClass: string): number => {
    const lower = assetClass.toLowerCase();
    if (lower.includes('equity') || lower.includes('stock')) return 12;
    if (lower.includes('crypto')) return 20;
    if (lower.includes('reit') || lower.includes('real estate')) return 8;
    if (lower.includes('gold')) return 6;
    if (lower.includes('fixed') || lower.includes('bond') || lower.includes('ppf') || lower.includes('liquid') || lower.includes('deposit')) return 7;
    return 10;
};

const calculateWeightedAverageReturn = (recommendations: InvestmentRecommendation[]): number => {
    if (!recommendations || recommendations.length === 0) return 10;
    const totalReturn = recommendations.reduce((acc, rec) => {
        const expectedReturn = getAssetClassReturn(rec.assetClass);
        return acc + (rec.allocationPercentage / 100) * expectedReturn;
    }, 0);
    return Math.round(totalReturn);
};

// --- MAIN COMPONENT ---
interface InvestmentImpactSimulatorProps {
    userProfile: UserFinancialProfile;
    recommendations: InvestmentRecommendation[];
}

const InvestmentImpactSimulator: React.FC<InvestmentImpactSimulatorProps> = ({ userProfile, recommendations }) => {
    const [extraInvestment, setExtraInvestment] = useState(2000);
    const [delayYears, setDelayYears] = useState(3);
    
    const timeHorizon = 15; // A fixed medium-term horizon for consistent comparison
    const growthRate = useMemo(() => calculateWeightedAverageReturn(recommendations), [recommendations]);

    const { additionalWealth, costOfDelay } = useMemo(() => {
        const baseProjection = calculateProjection(userProfile.monthlySavings, timeHorizon, growthRate);
        
        // Scenario 1: Boost SIP
        const boostedProjection = calculateProjection(userProfile.monthlySavings + extraInvestment, timeHorizon, growthRate);
        const additionalWealth = boostedProjection - baseProjection;
        
        // Scenario 2: Cost of Delay
        const delayedProjection = calculateProjection(userProfile.monthlySavings, timeHorizon - delayYears, growthRate);
        const costOfDelay = baseProjection - delayedProjection;

        return { additionalWealth, costOfDelay };
    }, [userProfile.monthlySavings, extraInvestment, delayYears, timeHorizon, growthRate]);

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-8">
            <div className="text-center">
                <h3 className="text-xl font-bold text-slate-800 flex items-center justify-center gap-2">
                    <SparklesIcon className="h-6 w-6 text-blue-500" />
                    Investment Impact Simulator
                </h3>
                <p className="text-sm text-slate-500 mt-1">See how small changes can make a big difference.</p>
            </div>

            {/* Scenario 1: Boost Your SIP */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex-shrink-0 bg-green-100 text-green-600 rounded-full p-2">
                        <ArrowTrendingUpIcon className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-slate-800">The Power of More</h4>
                </div>
                <p className="text-sm text-center text-slate-600 mb-3">
                    Investing an extra <span className="font-bold text-green-600">{formatCurrency(extraInvestment)}/month</span> for {timeHorizon} years could add an extra...
                </p>
                <p key={additionalWealth} className="text-3xl font-bold text-center text-green-600 animate-pop-in">
                    {formatCurrency(additionalWealth)}
                </p>
                <div className="mt-4">
                    <input
                        id="extraInvestment"
                        type="range"
                        min="500"
                        max="10000"
                        step="500"
                        value={extraInvestment}
                        onChange={(e) => setExtraInvestment(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                </div>
            </div>

            {/* Scenario 2: The Cost of Delay */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                 <div className="flex items-center gap-3 mb-3">
                    <div className="flex-shrink-0 bg-orange-100 text-orange-600 rounded-full p-2">
                        <ClockIcon className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-slate-800">The Cost of Delay</h4>
                </div>
                <p className="text-sm text-center text-slate-600 mb-3">
                    Waiting <span className="font-bold text-orange-600">{delayYears} {delayYears > 1 ? 'years' : 'year'}</span> to start investing could mean missing out on...
                </p>
                <p key={costOfDelay} className="text-3xl font-bold text-center text-orange-600 animate-pop-in">
                    {formatCurrency(costOfDelay)}
                </p>
                <div className="mt-4">
                     <input
                        id="delayYears"
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={delayYears}
                        onChange={(e) => setDelayYears(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                </div>
            </div>
        </div>
    );
};

export default InvestmentImpactSimulator;