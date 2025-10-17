import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { UserFinancialProfile, InvestmentRecommendation, InstrumentDetails } from '../types';
import { getInstrumentDetails, getInstrumentChatResponse } from '../services/geminiService';
import { 
    XMarkIcon, 
    ArrowLeftIcon, 
    ChevronRightIcon, 
    CheckCircleIcon,
    PaperAirplaneIcon
} from './icons/Icons';

// --- TYPE DEFINITIONS ---
type Message = {
    sender: 'user' | 'bot';
    text: string;
};

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

// --- SUB-COMPONENTS ---

const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const principal = payload.find((p: any) => p.dataKey === 'principal')?.value || 0;
        const gains = payload.find((p: any) => p.dataKey === 'gains')?.value || 0;
        const total = principal + gains;
        return (
            <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-xl animate-fade-in text-sm">
                <p className="font-bold text-slate-800 mb-2">{label}</p>
                <p className="text-slate-600 flex items-center"><span className="inline-block w-3 h-3 rounded-full mr-2 bg-slate-400"></span>Principal: {formatCurrency(principal)}</p>
                <p className="text-slate-600 flex items-center"><span className="inline-block w-3 h-3 rounded-full mr-2 bg-green-400"></span>Gains: {formatCurrency(gains)}</p>
                <p className="font-bold text-slate-800 mt-2 border-t pt-2">Total: {formatCurrency(total)}</p>
            </div>
        );
    }
    return null;
};

const ProjectionCalculator: React.FC<{
    initialGrowthRate: number;
    userProfile: UserFinancialProfile;
    recommendation: InvestmentRecommendation;
}> = ({ initialGrowthRate, userProfile, recommendation }) => {
    const [years, setYears] = useState(10);
    const [growthRate, setGrowthRate] = useState(initialGrowthRate);
    const [annualIncrease, setAnnualIncrease] = useState(5);

    useEffect(() => {
        setGrowthRate(initialGrowthRate);
    }, [initialGrowthRate]);

    const projectionData = useMemo(() => {
        const data = [];
        let fv = 0;
        let principal = 0;
        let monthly = userProfile.monthlySavings * (recommendation.allocationPercentage / 100);
        const monthlyGrowthRate = growthRate / 100 / 12;

        for (let i = 1; i <= years; i++) {
            for (let j = 0; j < 12; j++) {
                fv += monthly;
                principal += monthly;
                fv *= (1 + monthlyGrowthRate);
            }
            data.push({
                year: `Yr ${i}`,
                principal: Math.round(principal),
                gains: Math.round(fv - principal),
            });
            monthly *= (1 + annualIncrease / 100);
        }
        return data;
    }, [years, growthRate, annualIncrease, userProfile, recommendation]);

    const finalValue = (projectionData[projectionData.length - 1]?.principal || 0) + (projectionData[projectionData.length - 1]?.gains || 0);
    
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-3">Wealth Projection</h3>
            <div className="text-center mb-4">
                <p className="text-sm text-slate-500">In {years} years, you could have</p>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(finalValue)}</p>
            </div>
             <div className="flex-grow" style={{ minHeight: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                        <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis tickFormatter={formatCompactCurrency} tick={{ fill: '#64748b', fontSize: 12 }} width={50}/>
                        <Tooltip content={<CustomTooltipContent />} />
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                        <Area type="monotone" dataKey="principal" stackId="1" stroke="#a1a1aa" fill="#d4d4d8" name="Invested" />
                        <Area type="monotone" dataKey="gains" stackId="1" stroke="#22c55e" fill="#86efac" name="Gained" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200/60 text-sm">
                <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                        <label htmlFor="years" className="font-medium text-slate-600">Time Horizon</label>
                        <span className="font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{years} yrs</span>
                    </div>
                    <input 
                        id="years" 
                        type="range" 
                        min="1" 
                        max="30" 
                        value={years} 
                        onChange={e => setYears(parseInt(e.target.value))} 
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>
                <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                        <label htmlFor="growth" className="font-medium text-slate-600">Est. Growth</label>
                        <span className="font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">{growthRate}%</span>
                    </div>
                    <input 
                        id="growth" 
                        type="range" 
                        min="1" 
                        max="30" 
                        value={growthRate} 
                        onChange={e => setGrowthRate(parseInt(e.target.value))} 
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                </div>
                <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                        <label htmlFor="increase" className="font-medium text-slate-600">Savings Hike</label>
                        <span className="font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">{annualIncrease}%</span>
                    </div>
                    <input 
                        id="increase" 
                        type="range" 
                        min="0" 
                        max="15" 
                        value={annualIncrease} 
                        onChange={e => setAnnualIncrease(parseInt(e.target.value))} 
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                </div>
            </div>
        </div>
    );
};


// --- MAIN MODAL COMPONENT ---

interface InvestmentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    recommendation: InvestmentRecommendation;
    userProfile: UserFinancialProfile;
    color: string;
}

const InvestmentDetailModal: React.FC<InvestmentDetailModalProps> = ({ isOpen, onClose, recommendation, userProfile, color }) => {
    const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);
    const [instrumentDetails, setInstrumentDetails] = useState<InstrumentDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'askAI'>('overview');

    // Chat state
    const [chatHistory, setChatHistory] = useState<Message[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatMessagesEndRef = useRef<HTMLDivElement>(null);

    const handleSelectInstrument = async (instrumentName: string) => {
        setSelectedInstrument(instrumentName);
        setIsLoading(true);
        setError(null);
        setInstrumentDetails(null);
        try {
            const details = await getInstrumentDetails(instrumentName, userProfile);
            setInstrumentDetails(details);
        } catch (e) {
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleBack = () => {
        setSelectedInstrument(null);
        setInstrumentDetails(null);
        setError(null);
    };
    
    useEffect(() => {
        if(isOpen) {
            handleBack();
            setActiveTab('overview');
            setChatHistory([
                { sender: 'bot', text: `I'm here to help with your questions about ${recommendation.assetClass}. What's on your mind? 💡` }
            ]);
            setChatInput('');
            setIsChatLoading(false);
        }
    }, [isOpen, recommendation.assetClass]);

    useEffect(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);
    
    const handleSendChatMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || isChatLoading) return;

        const userMessage: Message = { sender: 'user', text: chatInput };
        const newHistory = [...chatHistory, userMessage];
        setChatHistory(newHistory);
        setChatInput('');
        setIsChatLoading(true);

        try {
            const botResponseText = await getInstrumentChatResponse(
                newHistory,
                selectedInstrument || 'This asset class in general',
                recommendation.assetClass,
                recommendation.rationale
            );
            const botMessage: Message = { sender: 'bot', text: botResponseText };
            setChatHistory(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage: Message = { sender: 'bot', text: error instanceof Error ? error.message : "An unexpected error occurred." };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsChatLoading(false);
        }
    };

    if (!isOpen) return null;

    const renderInstrumentListView = () => (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h3 className="font-semibold text-slate-700">Why this asset class?</h3>
                <p className="text-sm text-slate-600 bg-white p-4 rounded-lg border border-slate-200">{recommendation.rationale}</p>
            </div>
            <div className="space-y-4">
                <h3 className="font-semibold text-slate-700">Explore Example Instruments</h3>
                <div className="space-y-2">
                    {recommendation.suitableInstruments.map(instrument => (
                        <button key={instrument} onClick={() => handleSelectInstrument(instrument)} className="w-full text-left group flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <span className="font-medium text-slate-800 text-sm">{instrument}</span>
                            <ChevronRightIcon className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
    
    const renderInstrumentDetailView = () => (
         <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading && (
                <div className="lg:col-span-2 flex justify-center items-center h-96">
                    <div className="flex items-center space-x-2 text-slate-500">
                        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-lg font-medium">Fetching details...</span>
                    </div>
                </div>
            )}
            {error && (
                <div className="lg:col-span-2 text-center p-8">
                    <h3 className="text-lg font-semibold text-red-600">Oops! Could not load details.</h3>
                    <p className="text-slate-600 mt-2">{error}</p>
                </div>
            )}
            {instrumentDetails && (
                <>
                    <div className="space-y-4">
                         <div>
                            <h3 className="font-semibold text-slate-700 mb-2">Introduction</h3>
                            <p className="text-sm text-slate-600 bg-white p-4 rounded-lg border border-slate-200">{instrumentDetails.introduction}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-700 mb-2">Key Features</h3>
                            <ul className="space-y-2">
                                {instrumentDetails.keyFeatures.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm p-3 bg-white rounded-lg border border-slate-200">
                                        <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <ProjectionCalculator 
                        initialGrowthRate={instrumentDetails.typicalReturnRate}
                        userProfile={userProfile}
                        recommendation={recommendation}
                    />
                </>
            )}
        </div>
    );

     const renderChatView = () => (
        <div className="p-4 h-full flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in-up`} style={{ animationDuration: '0.3s' }}>
                        <div className={`max-w-[85%] p-3 rounded-xl ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-800'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isChatLoading && (
                    <div className="flex justify-start animate-slide-in-up">
                        <div className="max-w-[85%] p-3 rounded-xl bg-slate-200 text-slate-800">
                            <div className="flex items-center space-x-2">
                                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatMessagesEndRef} />
            </div>
            <form onSubmit={handleSendChatMessage} className="mt-4 flex-shrink-0">
                <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={`Ask about ${recommendation.assetClass}...`}
                        className="flex-1 p-2 bg-transparent border-none rounded-lg focus:ring-0 w-full text-sm"
                        disabled={isChatLoading}
                        aria-label="Chat input"
                    />
                    <button type="submit" disabled={!chatInput.trim() || isChatLoading} className="p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors" aria-label="Send message">
                        <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                </div>
            </form>
        </div>
    );


    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-30 flex justify-center items-center p-4 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="relative w-full max-w-5xl max-h-[90vh] bg-slate-50 rounded-2xl shadow-2xl flex flex-col animate-pop-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-shrink-0 p-5 border-b border-slate-200 flex justify-between items-center relative">
                    <div className="absolute top-0 left-0 h-1.5 w-full rounded-t-2xl" style={{ background: color }}></div>
                    <div className="flex items-center gap-3">
                        {selectedInstrument && activeTab === 'overview' && (
                             <button
                                onClick={handleBack}
                                className="p-2 text-slate-500 bg-slate-100 rounded-full hover:bg-slate-200 hover:text-slate-800"
                                aria-label="Back"
                            >
                                <ArrowLeftIcon className="h-5 w-5" />
                            </button>
                        )}
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">
                                {selectedInstrument && activeTab === 'overview' ? instrumentDetails?.name || selectedInstrument : recommendation.assetClass}
                            </h2>
                            <p className="text-sm font-semibold" style={{ color: color }}>
                                {recommendation.allocationPercentage}% Allocation
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-500 bg-slate-100 rounded-full hover:bg-slate-200 hover:text-slate-800"
                        aria-label="Close"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-shrink-0 border-b border-slate-200 px-6">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                        >
                            Overview & Projection
                        </button>
                        <button
                            onClick={() => setActiveTab('askAI')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'askAI' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                        >
                            Ask AI Assistant
                        </button>
                    </nav>
                </div>


                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'overview' && (
                        <div key={selectedInstrument || 'list'} className="animate-fade-in-slight">
                            {selectedInstrument ? renderInstrumentDetailView() : renderInstrumentListView()}
                        </div>
                    )}
                     {activeTab === 'askAI' && (
                        renderChatView()
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvestmentDetailModal;