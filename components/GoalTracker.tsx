import React from 'react';
import type { Goal } from '../types';
import { TrophyIcon } from './icons/Icons';

interface GoalTrackerProps {
    goals: Goal[] | null;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
}).format(value);

const GoalCard: React.FC<{ goal: Goal, index: number }> = ({ goal, index }) => {
    const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    const timeLeft = new Date(goal.targetDate).getFullYear() - new Date().getFullYear();

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 animate-fade-in-slight" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-slate-800 text-sm">{goal.name}</p>
                <p className="text-xs font-medium text-slate-500">{timeLeft} years left</p>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div 
                    className="bg-gradient-to-r from-blue-500 to-sky-500 h-2.5 rounded-full" 
                    style={{ width: `${progress}%`, transition: 'width 0.5s ease-out' }}
                ></div>
            </div>
            <div className="flex justify-between items-center mt-1.5 text-xs">
                <span className="font-medium text-slate-600">{formatCurrency(goal.currentAmount)}</span>
                <span className="font-semibold text-slate-800">{formatCurrency(goal.targetAmount)}</span>
            </div>
        </div>
    );
};

const GoalTracker: React.FC<GoalTrackerProps> = ({ goals }) => {
    if (!goals || goals.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in stagger-3" style={{ opacity: 0 }}>
             <div className="flex items-center gap-3 mb-4">
                <div className="bg-amber-100 text-amber-600 p-2 rounded-full"><TrophyIcon className="h-6 w-6"/></div>
                <h3 className="font-bold text-lg text-slate-800">My Goals</h3>
            </div>
            <div className="space-y-4">
                {goals.map((goal, index) => (
                    <GoalCard key={goal.id} goal={goal} index={index} />
                ))}
            </div>
        </div>
    );
};

export default GoalTracker;