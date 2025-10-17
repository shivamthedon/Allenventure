import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvestmentRecommendations, getAssessmentResponse, getRecommendedTopics } from '../services/geminiService';
import type { UserFinancialProfile, InvestmentRecommendation, AssessmentResponse, RecommendedTopic } from '../types';
import { RiskProfile } from '../types';
import FinancialHealthScore from '../components/FinancialHealthScore';
import RecommendedTopics from '../components/RecommendedTopics';
import { 
    PaperAirplaneIcon, 
    UserCircleIcon,
    CakeIcon,
    CurrencyRupeeIcon,
    FlagIcon,
    ScaleIcon,
    SparklesIcon,
    ArrowTrendingUpIcon,
    ShieldCheckIcon,
    ArrowPathIcon
} from '../components/icons/Icons';

// --- TYPE DEFINITIONS ---
type Message = {
    sender: 'user' | 'bot';
    text: string;
};

interface ProfilePageProps {
  userProfile: UserFinancialProfile | null;
  onComplete: (profile: UserFinancialProfile, recommendations: InvestmentRecommendation[]) => void;
  onReset: () => void;
}

// --- SUB-COMPONENTS for PROFILE VIEW ---

const ProfileInfoCard: React.FC<{ userProfile: UserFinancialProfile }> = ({ userProfile }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                <UserCircleIcon className="h-12 w-12 text-slate-500" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-800">{userProfile.name}</h2>
                <p className="text-slate-500 text-base">Here's your financial snapshot.</p>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 text-base">
            <div className="flex items-center gap-3">
                <CakeIcon className="h-6 w-6 text-slate-400" />
                <div>
                    <span className="text-slate-500 block">Age</span>
                    <span className="font-semibold text-slate-700">{userProfile.age}</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <CurrencyRupeeIcon className="h-6 w-6 text-slate-400" />
                <div>
                    <span className="text-slate-500 block">Income (p.a.)</span>
                    <span className="font-semibold text-slate-700">₹{userProfile.annualIncome.toLocaleString('en-IN')}</span>
                </div>
            </div>
             <div className="flex items-center gap-3 col-span-2">
                <CurrencyRupeeIcon className="h-6 w-6 text-slate-400" />
                <div>
                    <span className="text-slate-500 block">Monthly Savings for Investment</span>
                    <span className="font-semibold text-slate-700">₹{userProfile.monthlySavings.toLocaleString('en-IN')}</span>
                </div>
            </div>
        </div>
    </div>
);

const RiskProfileCard: React.FC<{ riskProfile: RiskProfile }> = ({ riskProfile }) => {
    const riskInfoMap = {
        [RiskProfile.CONSERVATIVE]: { icon: ShieldCheckIcon, color: 'blue', text: 'Conservative', description: 'Focuses on capital preservation with minimal risk.' },
        [RiskProfile.MODERATE]: { icon: ScaleIcon, color: 'amber', text: 'Moderate', description: 'Seeks a balance between growth and risk.' },
        [RiskProfile.AGGRESSIVE]: { icon: ArrowTrendingUpIcon, color: 'red', text: 'Aggressive', description: 'Aims for high growth, accepting higher risk.' },
    };
    const riskInfo = riskInfoMap[riskProfile];
    const colorClasses = {
        bg: `bg-${riskInfo.color}-100`,
        text: `text-${riskInfo.color}-600`,
        border: `border-${riskInfo.color}-500`,
    };

    return (
        <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${colorClasses.border}`}>
            <div className="flex items-start gap-5">
                <div className={`p-4 rounded-full ${colorClasses.bg}`}>
                    <riskInfo.icon className={`h-8 w-8 ${colorClasses.text}`} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-lg">Your Risk Profile</h3>
                    <p className={`font-semibold text-lg ${colorClasses.text}`}>{riskInfo.text}</p>
                    <p className="text-base text-slate-500 mt-1">{riskInfo.description}</p>
                </div>
            </div>
        </div>
    );
};

const GoalsCard: React.FC<{ goals: string[] }> = ({ goals }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="font-bold text-slate-800 text-lg mb-3 flex items-center gap-2">
            <FlagIcon className="h-6 w-6 text-slate-500" />
            Your Financial Goals
        </h3>
        <div className="flex flex-wrap gap-2">
            {goals.map(goal => (
                <span key={goal} className="text-base font-medium bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full">
                    {goal}
                </span>
            ))}
        </div>
    </div>
);

/**
 * Renders the user's profile dashboard.
 * This view is shown when a user profile already exists.
 */
const ProfileView: React.FC<{ userProfile: UserFinancialProfile; onReset: () => void }> = ({ userProfile, onReset }) => {
    return (
        <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-8 animate-slide-in-up">
                <h1 className="text-4xl font-bold text-slate-800 tracking-tight">My Financial Profile</h1>
                <p className="text-lg text-slate-600 mt-2">Your personalized financial hub for tracking progress and learning.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <ProfileInfoCard userProfile={userProfile} />
                    <RiskProfileCard riskProfile={userProfile.riskProfile} />
                    <GoalsCard goals={userProfile.goals} />
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <FinancialHealthScore userProfile={userProfile} />
                </div>
            </div>

            {/* Action Button */}
            <div className="mt-8 text-center">
                <button
                    onClick={onReset}
                    className="group inline-flex items-center justify-center bg-white text-slate-700 font-semibold text-base py-3 px-6 rounded-full hover:bg-slate-100 transition-colors shadow-md border border-slate-200"
                >
                    <ArrowPathIcon className="mr-2 h-6 w-6 text-slate-500 transition-transform group-hover:rotate-180" />
                    Update My Profile
                </button>
            </div>
        </div>
    );
};


/**
 * Renders the conversational assessment flow.
 * This view is shown when no user profile exists.
 */
const AssessmentFlow: React.FC<{ onComplete: (profile: UserFinancialProfile, recommendations: InvestmentRecommendation[]) => void }> = ({ onComplete }) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [finalProfile, setFinalProfile] = useState<UserFinancialProfile | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const assessmentSteps = [
    { icon: UserCircleIcon, key: 'name', label: 'Name' },
    { icon: CakeIcon, key: 'age', label: 'Age' },
    { icon: CurrencyRupeeIcon, key: 'income', label: 'Income' },
    { icon: ArrowTrendingUpIcon, key: 'savings', label: 'Savings' },
    { icon: FlagIcon, key: 'goals', label: 'Goals' },
    { icon: ScaleIcon, key: 'risk', label: 'Risk' },
  ];
  const TOTAL_STEPS = assessmentSteps.length;

  const callAssessmentApi = async (currentHistory: Message[]) => {
    setIsLoading(true);
    setError(null);
    await new Promise(res => setTimeout(res, 300));

    try {
      const response: AssessmentResponse = await getAssessmentResponse(currentHistory);
      setCurrentQuestion(response.nextQuestion);
      setOptions(response.options || []);
      setHistory(prev => [...prev, { sender: 'bot', text: response.nextQuestion }]);

      if (response.isComplete && response.profile) {
        setIsComplete(true);
        setCurrentStep(TOTAL_STEPS + 1);
        const profileWithGoals = {
            ...response.profile,
            goals: response.profile.goals?.length ? response.profile.goals : ['Long-term wealth creation']
        };
        setFinalProfile(profileWithGoals);
      } else {
        setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    callAssessmentApi([]);
  }, []);

  const handleSendAnswer = async (answer: string) => {
    if (!answer.trim() || isLoading || isComplete) return;
    const userMessage: Message = { sender: 'user', text: answer };
    const newHistory = [...history, userMessage];
    setHistory(newHistory);
    setInputValue('');
    setOptions([]);
    setCurrentQuestion('');
    await callAssessmentApi(newHistory);
  };
  
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendAnswer(inputValue);
  };
  
  const handleGetRecommendations = async () => {
    if (!finalProfile) return;
    setIsFinalizing(true);
    setError(null);
    try {
        const plan = await getInvestmentRecommendations(finalProfile);
        onComplete(finalProfile, plan.recommendations);
        navigate('/results');
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsFinalizing(false);
    }
  };

  const renderSummaryItem = (IconComponent: React.FC<{className?:string}>, label: string, value: any) => (
    <div>
        <dt className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <IconComponent className="h-4 w-4" />
            {label}
        </dt>
        <dd className="mt-1 text-base font-semibold text-slate-800">{value}</dd>
    </div>
  );

  return (
    <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-8 animate-slide-in-up">
            <h1 className="text-3xl font-bold text-slate-800">Create Your Financial Profile</h1>
            <p className="text-slate-500 mt-2">A few simple questions to create your tailored plan.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 animate-slide-in-up stagger-1 border border-slate-200/50">
            <div className="p-6 border-b border-slate-200">
                <div className="flex items-center">
                    {assessmentSteps.map((step, index) => {
                        const stepIndex = index + 1;
                        const isCompleted = currentStep > stepIndex;
                        const isCurrent = currentStep === stepIndex;
                        return (
                            <React.Fragment key={step.label}>
                                <div className="flex flex-col items-center text-center w-16">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-blue-600 text-white' : isCurrent ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500 shadow-md' : 'bg-slate-200 text-slate-500'}`}>
                                        <step.icon className="h-5 w-5" />
                                    </div>
                                    <p className={`mt-2 text-xs font-semibold transition-colors duration-300 ${isCurrent || isCompleted ? 'text-blue-600' : 'text-slate-500'}`}>{step.label}</p>
                                </div>
                                {index < assessmentSteps.length - 1 && (
                                    <div className={`flex-1 h-1 rounded-full ${isCompleted ? 'bg-blue-500' : 'bg-slate-200'}`}></div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-[400px] flex flex-col justify-center items-center p-8">
                {isComplete ? (
                    <div className="w-full">
                        <div className="text-center animate-pop-in">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center ring-4 ring-white shadow-lg">
                                <SparklesIcon className="h-8 w-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mt-4">All Set, {finalProfile?.name}!</h2>
                            <p className="text-slate-500 mt-2 mb-6">Here's a summary of your profile. Let's generate your investment plan!</p>
                        </div>
                        {finalProfile && (
                            <div className="bg-white rounded-xl shadow-md border p-6 animate-slide-in-up" style={{ animationDelay: '200ms' }}>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                                    {renderSummaryItem(UserCircleIcon, "Name", finalProfile.name)}
                                    {renderSummaryItem(CakeIcon, "Age", finalProfile.age)}
                                    {renderSummaryItem(CurrencyRupeeIcon, "Annual Income", `₹${finalProfile.annualIncome.toLocaleString('en-IN')}`)}
                                    {renderSummaryItem(ArrowTrendingUpIcon, "Monthly Savings", `₹${finalProfile.monthlySavings.toLocaleString('en-IN')}`)}
                                    {renderSummaryItem(FlagIcon, "Financial Goals", finalProfile.goals.join(', '))}
                                    {renderSummaryItem(ScaleIcon, "Risk Profile", finalProfile.riskProfile)}
                                </div>
                            </div>
                        )}
                        <div className="mt-8 text-center animate-slide-in-up" style={{ animationDelay: '400ms' }}>
                            <button onClick={handleGetRecommendations} disabled={isFinalizing} className="bg-green-500 text-white font-bold py-3 px-8 rounded-full hover:bg-green-600 transition-transform transform hover:scale-105 shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center w-full sm:w-auto mx-auto">
                                {isFinalizing ? 'Generating Plan...' : 'See My Personalized Plan'}
                            </button>
                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        </div>
                    </div>
                ) : (
                    <div key={currentQuestion} className="w-full text-center">
                        {currentQuestion ? (
                            <div className="animate-slide-in-up">
                                <h2 className="text-xl font-semibold text-slate-800 mb-8">{currentQuestion}</h2>
                                {options.length > 0 ? (
                                    <div className="mt-4 grid grid-cols-2 gap-4 max-w-md mx-auto">
                                        {options.map((option, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSendAnswer(option)}
                                                disabled={isLoading}
                                                className="bg-white/80 backdrop-blur-sm border border-slate-300 text-slate-700 font-medium py-4 px-4 rounded-lg hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 transition-all transform hover:scale-105 shadow-sm disabled:opacity-50 disabled:cursor-wait animate-pop-in"
                                                style={{ animationDelay: `${index * 100}ms` }}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmitForm} className="max-w-md mx-auto">
                                        <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-full p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-shadow">
                                            <input
                                                type="text"
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                placeholder="Type your answer here..."
                                                className="flex-1 px-4 py-2 bg-transparent border-none focus:outline-none w-full text-base text-slate-800"
                                                disabled={isLoading}
                                                autoFocus
                                            />
                                            <button type="submit" disabled={!inputValue.trim() || isLoading} className="flex-shrink-0 p-3 text-white bg-blue-600 rounded-full hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-wait transition-colors">
                                                <PaperAirplaneIcon className="h-6 w-6" />
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        ) : (
                            <div className="flex justify-center items-center space-x-2 text-slate-500">
                                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-lg font-medium">Thinking...</span>
                            </div>
                        )}
                         {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

/**
 * Main component that decides whether to show the profile view or the assessment flow.
 */
const AssessmentPage: React.FC<ProfilePageProps> = ({ userProfile, onComplete, onReset }) => {
    if (userProfile) {
        return <ProfileView userProfile={userProfile} onReset={onReset} />;
    }
    return <AssessmentFlow onComplete={onComplete} />;
};

export default AssessmentPage;