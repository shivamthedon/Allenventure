import React, { useMemo } from 'react';
import type { UserFinancialProfile } from '../types';
import { ShieldCheckIcon } from './icons/Icons';

interface FinancialHealthScoreProps {
    userProfile: UserFinancialProfile;
}

const getScoreDetails = (score: number): { text: string; ringColor: string; bgColor: string; textColor: string } => {
    if (score >= 80) return { text: 'Excellent', ringColor: 'text-emerald-500', bgColor: 'bg-emerald-100', textColor: 'text-emerald-600' };
    if (score >= 60) return { text: 'Good', ringColor: 'text-sky-500', bgColor: 'bg-sky-100', textColor: 'text-sky-600' };
    if (score >= 40) return { text: 'Fair', ringColor: 'text-amber-500', bgColor: 'bg-amber-100', textColor: 'text-amber-600' };
    return { text: 'Needs Attention', ringColor: 'text-red-500', bgColor: 'bg-red-100', textColor: 'text-red-600' };
};

const FinancialHealthScore: React.FC<FinancialHealthScoreProps> = ({ userProfile }) => {
    const score = useMemo(() => {
        const monthlyIncome = userProfile.annualIncome / 12;
        if (monthlyIncome <= 0) return 0;
        
        const savingsRate = (userProfile.monthlySavings / monthlyIncome) * 100;
        
        let savingsScore = 0;
        if (savingsRate >= 25) savingsScore = 95;
        else if (savingsRate >= 20) savingsScore = 85;
        else if (savingsRate >= 15) savingsScore = 75;
        else if (savingsRate >= 10) savingsScore = 60;
        else if (savingsRate >= 5) savingsScore = 45;
        else savingsScore = 30;

        // Simple score based primarily on savings rate
        return Math.round(savingsScore);
    }, [userProfile]);

    const scoreDetails = getScoreDetails(score);
    const circumference = 2 * Math.PI * 45; // 2 * pi * radius
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 text-blue-500 p-2 rounded-full"><ShieldCheckIcon className="h-6 w-6"/></div>
                <h3 className="font-bold text-lg text-slate-800">Financial Health Score</h3>
            </div>
            
            <div className="flex flex-col items-center">
                <div className="relative w-40 h-40">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle className="text-slate-200" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                        <circle
                            className={scoreDetails.ringColor}
                            strokeWidth="10"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s ease-out' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-5xl font-bold ${scoreDetails.ringColor}`}>{score}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${scoreDetails.ringColor.replace('text-', 'bg-')}`}>{scoreDetails.text}</span>
                    </div>
                </div>
                <p className="text-sm text-slate-600 mt-4 text-center max-w-xs">
                    This score reflects your savings habits. A higher score indicates a strong financial foundation for future investments.
                </p>
            </div>
        </div>
    );
};

export default FinancialHealthScore;
