import React from 'react';
import type { LearningPathway } from '../types';
import { CheckBadgeIcon } from './icons/Icons';

interface LearningPathwayCardProps {
    pathway: LearningPathway;
    onModuleClick: (title: string) => void;
}

const gradientClasses = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-green-600',
];

const LearningPathwayCard: React.FC<LearningPathwayCardProps> = ({ pathway, onModuleClick }) => {
    const completedModules = 1; // Mocked for UI
    const totalModules = pathway.modules.length;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className={`p-6 bg-gradient-to-br text-white ${pathway.id === 'p1' ? gradientClasses[0] : gradientClasses[1]}`}>
                <h3 className="text-xl font-bold">{pathway.title}</h3>
                <p className="text-sm text-white/80 mt-1">{pathway.description}</p>
                <div className="mt-4 flex items-center gap-3 text-sm">
                    <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                            className="bg-white h-2 rounded-full" 
                            style={{ width: `${(completedModules / totalModules) * 100}%`}}
                        ></div>
                    </div>
                    <span className="font-semibold whitespace-nowrap">{completedModules} / {totalModules}</span>
                </div>
            </div>
            <div className="p-4 space-y-2 bg-slate-50">
                {pathway.modules.map((module, index) => (
                    <button 
                        key={module.title}
                        onClick={() => onModuleClick(module.title)}
                        className="w-full text-left p-3 rounded-lg flex items-center gap-4 group transition-colors hover:bg-slate-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <div className={`flex-shrink-0 p-2 rounded-full ${index < completedModules ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                            {index < completedModules ? <CheckBadgeIcon className="h-5 w-5"/> : <module.icon className="h-5 w-5" />}
                        </div>
                        <div>
                            <p className="font-semibold text-sm text-slate-800">{module.title}</p>
                            <p className="text-xs text-slate-500">{module.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LearningPathwayCard;
