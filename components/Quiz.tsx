import React, { useState } from 'react';
import type { Quiz as QuizType } from '../types';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon, TrophyIcon, CheckBadgeIcon } from './icons/Icons';

interface QuizProps {
    quiz: QuizType;
}

const Quiz: React.FC<QuizProps> = ({ quiz }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [animationClass, setAnimationClass] = useState<{ [key: number]: string }>({});

    const currentQuestion = quiz.questions[currentQuestionIndex];

    const handleOptionSelect = (optionIndex: number) => {
        if (isAnswered) return;

        setSelectedOption(optionIndex);
        setIsAnswered(true);
        
        const isCorrect = currentQuestion.options[optionIndex].isCorrect;
        if (isCorrect) {
            setScore(prev => prev + 1);
            setAnimationClass({ [optionIndex]: 'animate-flash-green' });
        } else {
            setAnimationClass({ [optionIndex]: 'animate-flash-red' });
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
            setAnimationClass({});
        } else {
            setShowResults(true);
        }
    };

    const handleRestart = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setShowResults(false);
        setAnimationClass({});
    };

    if (showResults) {
        const totalQuestions = quiz.questions.length;
        const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
        
        let resultMessage = "Good effort!";
        let ResultIcon = CheckBadgeIcon;
        let iconColorClass = 'text-sky-500';
        let bgColorClass = 'bg-sky-100';

        if (percentage === 100) {
            resultMessage = "Excellent! You've mastered this topic.";
            ResultIcon = TrophyIcon;
            iconColorClass = 'text-amber-500';
            bgColorClass = 'bg-amber-100';
        } else if (percentage >= 70) {
            resultMessage = "Great job! You have a solid understanding.";
            ResultIcon = CheckBadgeIcon;
            iconColorClass = 'text-green-500';
            bgColorClass = 'bg-green-100';
        } else {
             resultMessage = "Good effort! Review the explanations to improve.";
             ResultIcon = CheckBadgeIcon;
             iconColorClass = 'text-sky-500';
             bgColorClass = 'bg-sky-100';
        }

        const renderConfetti = () => {
            if (percentage !== 100) return null;
            return Array.from({ length: 20 }).map((_, i) => {
                const style = {
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 1.5}s`,
                    backgroundColor: ['#0ea5e9', '#10b981', '#f97316', '#8b5cf6'][i % 4]
                };
                return <div key={i} className="confetti" style={style}></div>;
            });
        };

        return (
            <div className="relative text-center p-6 bg-slate-100 rounded-lg animate-fade-in overflow-hidden">
                {renderConfetti()}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${bgColorClass}`}>
                     <ResultIcon className={`h-8 w-8 ${iconColorClass}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">{resultMessage}</h3>
                <p className="text-slate-600 mt-2">Your score:</p>
                <p className={`text-4xl font-bold my-2 ${percentage >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
                    {score} / {totalQuestions}
                </p>
                <button 
                    onClick={handleRestart}
                    className="mt-4 flex items-center justify-center mx-auto gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <ArrowPathIcon className="h-4 w-4" />
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center text-sm">
                <p className="font-semibold text-slate-700">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
                {isAnswered && (
                     <p className="font-bold text-slate-700">Score: {score}</p>
                )}
            </div>
            
            <p className="font-bold text-slate-800 text-md">{currentQuestion.questionText}</p>
            
            <div className="space-y-2">
                {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedOption === index;
                    const isCorrect = option.isCorrect;
                    
                    let buttonClass = 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100';
                    if (isAnswered) {
                        if (isCorrect) {
                            buttonClass = 'bg-green-100 border-green-400 text-green-800';
                        } else if (isSelected && !isCorrect) {
                            buttonClass = 'bg-red-100 border-red-400 text-red-800';
                        } else {
                            buttonClass = 'bg-slate-100 border-slate-300 text-slate-500 opacity-70';
                        }
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => handleOptionSelect(index)}
                            disabled={isAnswered}
                            className={`w-full text-left p-3 rounded-lg border flex items-center justify-between text-sm font-medium transition-all ${buttonClass} ${animationClass[index] || ''}`}
                        >
                            <span>{option.text}</span>
                            {isAnswered && isCorrect && <CheckCircleIcon className="h-5 w-5 text-green-600" />}
                            {isAnswered && isSelected && !isCorrect && <XCircleIcon className="h-5 w-5 text-red-600" />}
                        </button>
                    );
                })}
            </div>

            {isAnswered && (
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-slate-700 animate-fade-in-slight">
                    <p><span className="font-bold text-blue-800">Explanation:</span> {currentQuestion.explanation}</p>
                </div>
            )}
            
            {isAnswered && (
                 <button 
                    onClick={handleNextQuestion}
                    className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </button>
            )}
        </div>
    );
};

export default Quiz;