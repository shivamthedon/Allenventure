import React from 'react';
import type { RecommendedTopic } from '../types';
import {
    SipIcon,
    MutualFundsIcon,
    AssetAllocationIcon,
    TaxSavingIcon,
    PpfIcon,
    CompoundingIcon,
    StarIcon,
} from './icons/Icons';

interface RecommendedTopicsProps {
    topics: RecommendedTopic[];
    onTopicClick: (title: string) => void;
}

const iconMap = {
    SipIcon,
    MutualFundsIcon,
    AssetAllocationIcon,
    TaxSavingIcon,
    PpfIcon,
    CompoundingIcon,
};

const RecommendedTopics: React.FC<RecommendedTopicsProps> = ({ topics, onTopicClick }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 animate-slide-in-up">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                    <StarIcon className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Recommended for You</h2>
                    <p className="text-sm text-slate-500">Based on your profile, these topics are a great place to start.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topics.map((topic, index) => {
                    const Icon = iconMap[topic.iconName] || StarIcon;
                    return (
                        <button 
                            key={topic.title}
                            onClick={() => onTopicClick(topic.title)}
                            className="text-left p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <Icon className="h-5 w-5 text-blue-600" />
                                <h4 className="font-semibold text-sm text-slate-800">{topic.title}</h4>
                            </div>
                            <p className="text-xs text-slate-600">{topic.reason}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default RecommendedTopics;