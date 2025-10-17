import React from 'react';
import type { UserFinancialProfile } from '../types';
import {
    FlagIcon,
    HomeIcon,
    UserCircleIcon,
    WalletIcon,
    SipIcon,
    CalendarDaysIcon,
    ArrowTrendingUpIcon,
    KeyIcon
} from './icons/Icons';

interface NextStepsAndGoalAlignmentProps {
    userProfile: UserFinancialProfile;
}

const getGoalInfo = (goal: string): { icon: React.FC<{className?: string}>, text: string } => {
    const lowerGoal = goal.toLowerCase();
    let Icon = FlagIcon;
    let text = `Your portfolio is diversified for long-term growth, helping you work towards your goal of ${goal}.`;

    if (lowerGoal.includes('house') || lowerGoal.includes('home')) {
        Icon = HomeIcon;
        text = `By balancing growth assets with stable ones, this plan is designed to help you build a solid down payment for your future home.`;
    } else if (lowerGoal.includes('retirement')) {
        Icon = CalendarDaysIcon;
        text = `With a long-term focus on compounding, this portfolio is structured to build a substantial corpus for a comfortable retirement.`;
    } else if (lowerGoal.includes('wealth')) {
        Icon = ArrowTrendingUpIcon;
        text = `The aggressive tilt in your portfolio is aimed at maximizing returns over the long run to significantly grow your wealth.`;
    } else if (lowerGoal.includes('car')) {
        Icon = KeyIcon;
        text = `This plan's moderate timeline and growth potential are well-suited for accumulating funds for a significant purchase like a new car.`;
    }

    return { icon: Icon, text };
};

const ActionStep: React.FC<{ icon: React.FC<{className?: string}>, title: string, children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-slate-200 text-slate-600 rounded-full p-3 mt-1">
            <Icon className="h-5 w-5" />
        </div>
        <div>
            <h4 className="font-bold text-slate-800">{title}</h4>
            <p className="text-sm text-slate-600 mt-1">{children}</p>
        </div>
    </div>
);


const NextStepsAndGoalAlignment: React.FC<NextStepsAndGoalAlignmentProps> = ({ userProfile }) => {
    const primaryGoal = userProfile.goals[0] || 'Wealth Creation';
    const goalInfo = getGoalInfo(primaryGoal);
    const GoalIcon = goalInfo.icon;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-8">
            {/* Goal Alignment Section */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Aligning with Your Goal</h3>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-4">
                    <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full p-3">
                        <GoalIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800">Primary Goal: {primaryGoal}</p>
                        <p className="text-sm text-slate-600 mt-1">{goalInfo.text}</p>
                    </div>
                </div>
            </div>

            {/* Action Plan Section */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Your Action Plan</h3>
                <div className="space-y-6">
                    <ActionStep icon={WalletIcon} title="1. Open a Demat & Trading Account">
                        This is your gateway to investing in stocks and mutual funds. Choose a reputable broker to get started.
                    </ActionStep>
                    <ActionStep icon={UserCircleIcon} title="2. Complete Your KYC">
                        Finish your 'Know Your Customer' process. It's a one-time mandatory step to verify your identity.
                    </ActionStep>
                    <ActionStep icon={SipIcon} title="3. Start Your First SIP">
                        Automate your investments by setting up Systematic Investment Plans for the recommended mutual funds.
                    </ActionStep>
                    <ActionStep icon={CalendarDaysIcon} title="4. Review Annually">
                        Check on your portfolio at least once a year to ensure it's still aligned with your goals and make adjustments if needed.
                    </ActionStep>
                </div>
            </div>
        </div>
    );
};

export default NextStepsAndGoalAlignment;