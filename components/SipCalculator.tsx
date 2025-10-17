import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CurrencyRupeeIcon, CalendarDaysIcon, ArrowTrendingUpIcon } from './icons/Icons';

// --- HELPER FUNCTIONS ---
const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
}).format(value);

// --- MAIN COMPONENT ---
const SipCalculator: React.FC = () => {
    const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
    const [returnRate, setReturnRate] = useState(12);
    const [timePeriod, setTimePeriod] = useState(10);

    const results = useMemo(() => {
        const totalMonths = timePeriod * 12;
        const monthlyRate = returnRate / 100 / 12;
        
        // M = P × ({[1 + i]^n – 1} / i) × (1 + i)
        // This is a formula for SIP with contributions at the beginning of the period.
        const futureValue = monthlyInvestment * ( (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate ) * (1 + monthlyRate);

        const investedAmount = monthlyInvestment * totalMonths;
        const estReturns = futureValue - investedAmount;

        return {
            investedAmount,
            estReturns,
            totalValue: futureValue,
        };
    }, [monthlyInvestment, returnRate, timePeriod]);

    const pieData = [
        { name: 'Invested Amount', value: results.investedAmount },
        { name: 'Est. Returns', value: results.estReturns },
    ];
    
    const COLORS = ['#64748b', '#22c55e']; // Slate, Green

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left Side: Sliders & Inputs */}
                <div className="p-6 md:p-8 space-y-8">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="monthlyInvestment" className="font-semibold text-slate-700 flex items-center gap-2">
                                <CurrencyRupeeIcon className="h-5 w-5 text-slate-500" />
                                Monthly Investment
                            </label>
                            <span className="px-3 py-1 text-sm font-bold text-blue-700 bg-blue-100 rounded-full">
                                {formatCurrency(monthlyInvestment)}
                            </span>
                        </div>
                        <input
                            id="monthlyInvestment"
                            type="range"
                            min="500"
                            max="100000"
                            step="500"
                            value={monthlyInvestment}
                            onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="returnRate" className="font-semibold text-slate-700 flex items-center gap-2">
                                <ArrowTrendingUpIcon className="h-5 w-5 text-slate-500" />
                                Expected Return Rate (p.a.)
                            </label>
                            <span className="px-3 py-1 text-sm font-bold text-blue-700 bg-blue-100 rounded-full">
                                {returnRate}%
                            </span>
                        </div>
                        <input
                            id="returnRate"
                            type="range"
                            min="1"
                            max="30"
                            step="1"
                            value={returnRate}
                            onChange={(e) => setReturnRate(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                    <div>
                         <div className="flex justify-between items-center mb-2">
                            <label htmlFor="timePeriod" className="font-semibold text-slate-700 flex items-center gap-2">
                                <CalendarDaysIcon className="h-5 w-5 text-slate-500" />
                                Time Period (Years)
                            </label>
                            <span className="px-3 py-1 text-sm font-bold text-blue-700 bg-blue-100 rounded-full">
                                {timePeriod}
                            </span>
                        </div>
                        <input
                            id="timePeriod"
                            type="range"
                            min="1"
                            max="40"
                            step="1"
                            value={timePeriod}
                            onChange={(e) => setTimePeriod(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                </div>

                {/* Right Side: Chart & Results */}
                <div className="bg-slate-50 p-6 md:p-8 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-200">
                    <div className="w-full h-48 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    innerRadius={50}
                                    fill="#8884d8"
                                    dataKey="value"
                                    strokeWidth={3}
                                    stroke="white"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-center w-full space-y-2">
                        <div className="text-sm text-slate-500">
                            Invested Amount: <span className="font-semibold text-slate-700">{formatCurrency(results.investedAmount)}</span>
                        </div>
                        <div className="text-sm text-slate-500">
                            Est. Returns: <span className="font-semibold text-green-600">{formatCurrency(results.estReturns)}</span>
                        </div>
                        <div className="text-lg font-bold text-slate-800 border-t pt-2 mt-2">
                            Total Value: <span className="text-blue-600">{formatCurrency(results.totalValue)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SipCalculator;
