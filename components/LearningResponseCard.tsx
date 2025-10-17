import React, { useState } from 'react';
import type { VisualLearningContent, Quiz as QuizType } from '../types';
import { 
    getIconByName, 
    KeyIcon, 
    LightbulbIcon, 
    TargetIcon, 
    QuestionMarkCircleIcon,
    SparklesIcon,
    ArrowPathIcon,
    ChevronDownIcon,
} from './icons/Icons';
import Quiz from './Quiz';

interface LearningResponseCardProps {
    content: VisualLearningContent;
    imageUrl?: string | null;
    isGeneratingImage?: boolean;
    isSimplified: boolean;
    onSimplify: () => void;
    onReset: () => void;
    quiz: QuizType | null;
    isQuizLoading: boolean;
    onGetQuiz: () => void;
}


export const LearningResponseCard: React.FC<LearningResponseCardProps> = ({ 
    content, 
    imageUrl, 
    isGeneratingImage, 
    isSimplified, 
    onSimplify, 
    onReset,
    quiz,
    isQuizLoading,
    onGetQuiz
}) => {
    const MainIcon = getIconByName(content.iconName);
    const [isQuizOpen, setIsQuizOpen] = useState(false);

    const handleToggleQuiz = () => {
        const newQuizState = !isQuizOpen;
        setIsQuizOpen(newQuizState);
        // Fetch quiz only when opening and if not already loaded
        if (newQuizState && !quiz) {
            onGetQuiz();
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 w-full animate-fade-in">
            {/* Image Section */}
            <div className="relative w-full h-48 bg-slate-200 rounded-t-xl overflow-hidden">
                {isGeneratingImage && (
                    <div className="w-full h-full animate-pulse bg-slate-300"></div>
                )}
                {!isGeneratingImage && imageUrl && (
                    <img src={imageUrl} alt={content.topic} className="w-full h-full object-cover" />
                )}
                 {isSimplified && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pop-in">
                        SIMPLIFIED
                    </div>
                )}
            </div>

            {/* Header */}
            <div className="flex items-center justify-between gap-4 p-4 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 bg-blue-500 text-white rounded-full p-3">
                        <MainIcon className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">{content.topic}</h2>
                </div>
                {isSimplified ? (
                     <button onClick={onReset} className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors">
                        <ArrowPathIcon className="h-4 w-4" />
                        Reset
                    </button>
                ) : (
                    <button onClick={onSimplify} className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1.5 rounded-full hover:bg-blue-200 transition-colors">
                        <SparklesIcon className="h-4 w-4" />
                        Simplify
                    </button>
                )}
            </div>
            
            {/* Body */}
            <div className="p-5 space-y-5">
                {/* Explanation */}
                <p className="text-slate-700 leading-relaxed">{content.explanation}</p>

                {/* Key Takeaways */}
                <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-2">
                        <KeyIcon className="h-5 w-5"/>
                        Key Takeaways
                    </h3>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-700 text-sm">
                        {content.keyTakeaways.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>

                {/* Analogy */}
                <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                     <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
                        <LightbulbIcon className="h-5 w-5"/>
                        Simple Analogy
                    </h3>
                    <p className="text-slate-700 italic">"{content.analogy}"</p>
                </div>

                {/* Actionable Tip */}
                 <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-bold text-green-800 flex items-center gap-2 mb-2">
                        <TargetIcon className="h-5 w-5"/>
                        Actionable Tip
                    </h3>
                    <p className="text-slate-700 text-sm">{content.actionableTip}</p>
                </div>

                {/* FAQs */}
                {content.faqs && content.faqs.length > 0 && (
                    <div className="p-4 bg-indigo-50 rounded-lg">
                        <h3 className="font-bold text-indigo-800 flex items-center gap-2 mb-3">
                            <QuestionMarkCircleIcon className="h-5 w-5"/>
                            Frequently Asked Questions
                        </h3>
                        <div className="space-y-4">
                            {content.faqs.map((faq, index) => (
                                <div key={index}>
                                    <p className="font-semibold text-indigo-900 text-sm">{faq.question}</p>
                                    <p className="text-slate-700 text-sm mt-1">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Interactive Quiz */}
            <div className="border-t border-slate-200 bg-slate-50 rounded-b-xl">
                <button 
                    onClick={handleToggleQuiz}
                    className="w-full flex justify-between items-center p-4 text-left font-semibold text-slate-700 hover:bg-slate-100"
                >
                    <span>Test Your Knowledge</span>
                    <ChevronDownIcon className={`h-5 w-5 transition-transform ${isQuizOpen ? 'rotate-180' : ''}`} />
                </button>
                {isQuizOpen && (
                    <div className="p-4 border-t border-slate-200">
                        {isQuizLoading && (
                            <div className="flex items-center justify-center space-x-2 text-slate-500 py-4">
                               <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Generating Quiz...</span>
                            </div>
                        )}
                        {quiz && !isQuizLoading && <Quiz quiz={quiz} />}
                    </div>
                )}
            </div>
        </div>
    );
};