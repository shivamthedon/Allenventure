import React, { useState, useCallback } from 'react';
import { LEARNING_TOPICS } from '../constants';
import { getVisualEducationalContent, generateImageFromPrompt, getSimplerEducationalContent, getQuizForTopic } from '../services/geminiService';
import type { VisualLearningContent, UserFinancialProfile, Quiz } from '../types';
import { LearningResponseCard } from '../components/LearningResponseCard';

interface LearnPageProps {
    userProfile: UserFinancialProfile | null;
}

const LearnPage: React.FC<LearnPageProps> = ({ userProfile }) => {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [content, setContent] = useState<VisualLearningContent | null>(null);
    const [originalContent, setOriginalContent] = useState<VisualLearningContent | null>(null);
    const [isSimplified, setIsSimplified] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    
    // State for quiz
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [isQuizLoading, setIsQuizLoading] = useState(false);

    const handleModuleClick = useCallback(async (title: string) => {
        if (selectedTopic === title && content) {
            document.getElementById('content-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        setSelectedTopic(title);
        setIsLoading(true);
        setError(null);
        setContent(null);
        setImageUrl(null);
        setIsGeneratingImage(false);
        setOriginalContent(null);
        setIsSimplified(false);
        setQuiz(null);
        
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
             contentArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
       
        try {
            const result = await getVisualEducationalContent([{ sender: 'user', content: title }]);
            setContent(result);

            if (result.imagePrompt) {
                setIsGeneratingImage(true);
                try {
                    const generatedUrl = await generateImageFromPrompt(result.imagePrompt);
                    setImageUrl(generatedUrl);
                } catch (imgError) {
                    console.error("Image generation failed:", imgError);
                } finally {
                    setIsGeneratingImage(false);
                }
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Failed to load content for "${title}". ${errorMessage}`);
            setContent(null);
        } finally {
            setIsLoading(false);
        }
    }, [selectedTopic, content]);
    
    const handleSimplifyContent = useCallback(async () => {
        if (!content) return;
        
        setIsLoading(true);
        setOriginalContent(content); // Save the original content
        
        try {
            const simplerContent = await getSimplerEducationalContent(content);
            setContent(simplerContent);
            setIsSimplified(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not simplify content.");
        } finally {
            setIsLoading(false);
        }
    }, [content]);

    const handleResetContent = useCallback(() => {
        if (originalContent) {
            setContent(originalContent);
            setOriginalContent(null);
            setIsSimplified(false);
        }
    }, [originalContent]);

    const handleGetQuiz = useCallback(async () => {
        if (!content) return;
        setIsQuizLoading(true);
        setQuiz(null);
        try {
            const quizData = await getQuizForTopic(content.topic, content.explanation);
            setQuiz(quizData);
        } catch (error) {
            console.error("Failed to get quiz:", error);
            // You might want to show an error message to the user here
        } finally {
            setIsQuizLoading(false);
        }
    }, [content]);

    return (
        <div className="container mx-auto max-w-5xl space-y-12">
            <div className="text-center animate-slide-in-up">
                <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Learn the Basics</h1>
                <p className="text-lg text-slate-600 mt-3 max-w-3xl mx-auto">
                    Explore foundational investing topics to build your financial knowledge. Click any topic to get a simple, visual explanation.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {LEARNING_TOPICS.map((topic, index) => {
                    const Icon = topic.icon;
                    return (
                        <button
                            key={topic.title}
                            onClick={() => handleModuleClick(topic.title)}
                            className="bg-white rounded-xl shadow-lg p-6 text-center group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 animate-fade-in"
                            style={{ animationDelay: `${index * 75}ms`, opacity: 0 }}
                        >
                            <div className="w-16 h-16 bg-blue-100/50 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors group-hover:bg-blue-100">
                                <Icon className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-slate-800">{topic.title}</h3>
                            <p className="text-sm text-slate-500 mt-1">{topic.description}</p>
                        </button>
                    );
                })}
            </div>

            <div id="content-area" className="relative pt-8 min-h-[10rem]">
                {isLoading && (
                    <div className="flex justify-center items-center py-16">
                        <div className="flex items-center space-x-2 text-slate-500">
                            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-lg font-medium">Loading knowledge...</span>
                        </div>
                    </div>
                )}
                {error && !isLoading && (
                    <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg max-w-4xl mx-auto">
                        <h3 className="text-lg font-semibold text-red-600">Oops! Something went wrong.</h3>
                        <p className="text-slate-600 mt-2 text-sm">{error}</p>
                    </div>
                )}
                {content && !isLoading && (
                    <div className="max-w-4xl mx-auto">
                         <LearningResponseCard 
                            content={content} 
                            imageUrl={imageUrl} 
                            isGeneratingImage={isGeneratingImage}
                            isSimplified={isSimplified}
                            onSimplify={handleSimplifyContent}
                            onReset={handleResetContent}
                            quiz={quiz}
                            isQuizLoading={isQuizLoading}
                            onGetQuiz={handleGetQuiz}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default LearnPage;
