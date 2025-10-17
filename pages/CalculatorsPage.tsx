import React from 'react';
import SipCalculator from '../components/SipCalculator';

const CalculatorsPage: React.FC = () => {
    return (
        <div className="container mx-auto max-w-5xl space-y-12">
            <div className="text-center animate-slide-in-up">
                <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Financial Tools & Calculators</h1>
                <p className="text-lg text-slate-600 mt-3 max-w-3xl mx-auto">
                    Use these simple tools to plan your investments and visualize your financial future.
                </p>
            </div>

            <div className="animate-fade-in stagger-1" style={{opacity: 0}}>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">SIP Calculator</h2>
                <SipCalculator />
            </div>
            
            {/* Future calculators can be added here */}

        </div>
    );
};

export default CalculatorsPage;
