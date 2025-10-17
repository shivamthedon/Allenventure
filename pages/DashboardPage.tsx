import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { UserFinancialProfile, InvestmentRecommendation, AssessmentResponse, Goal, RecommendedTopic } from '../types';
import { getInvestmentRecommendations, getAssessmentResponse, getRecommendedTopics } from '../services/geminiService';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import FinancialHealthScore from '../components/FinancialHealthScore';
import GoalTracker from '../components/GoalTracker';
import RecommendedTopics from '../components/RecommendedTopics';
import BudgetAnalysis from '../components/BudgetAnalysis';
import { 
    ArrowRightIcon, 
    SparklesIcon, 
    BookOpenIcon,
    PaperAirplaneIcon, 
    UserCircleIcon,
    CakeIcon,
    CurrencyRupeeIcon,
    FlagIcon,
    ScaleIcon,
    ArrowPathIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon
} from '../components/icons/Icons';


// --- TYPE DEFINITIONS ---
interface DashboardPageProps {
  userProfile: UserFinancialProfile | null;
  recommendations: InvestmentRecommendation[] | null;
  onComplete: (profile: UserFinancialProfile, recommendations: InvestmentRecommendation[]) => void;
  onReset: () => void;
  onUpdateProfile: (updatedProfile: Partial<UserFinancialProfile>) => void;
}

type Message = {
    sender: 'user' | 'bot';
    text: string;
};


// --- REVISED LOGGED IN DASHBOARD VIEW ---
const LoggedInDashboard: React.FC<{ 
    userProfile: UserFinancialProfile; 
    recommendations: InvestmentRecommendation[];
    onReset: () => void; 
}> = ({ userProfile, recommendations, onReset }) => {
    const navigate = useNavigate();
    const [topics, setTopics] = useState<RecommendedTopic[] | null>(null);

    useEffect(() => {
        const fetchTopics = async () => {
            if (userProfile) {
                const recommended = await getRecommendedTopics(userProfile);
                setTopics(recommended);
            }
        };
        fetchTopics();
    }, [userProfile]);
    
    // Mocked data for demonstration purposes
    const mockGoals: Goal[] = useMemo(() => [
        {
            id: 'g1',
            name: userProfile.goals[0] || 'Wealth Creation',
            targetAmount: 5000000,
            currentAmount: 350000,
            targetDate: '2034-12-31',
        },
        {
            id: 'g2',
            name: 'Emergency Fund',
            targetAmount: 300000,
            currentAmount: 120000,
            targetDate: '2026-12-31',
        },
    ], [userProfile.goals]);

    const portfolioSummary = useMemo(() => {
        const investedAmount = 470000; // Mocked current total investment
        const growth = 55000; // Mocked growth
        const currentValue = investedAmount + growth;
        const pnlPercent = (growth / investedAmount) * 100;
        return { currentValue, growth, pnlPercent };
    }, []);
    
    const pieData = useMemo(() => recommendations.map(rec => ({ name: rec.assetClass, value: rec.allocationPercentage })), [recommendations]);
    const COLORS = ['#0ea5e9', '#10b981', '#f97316', '#8b5cf6', '#ec4899'];

    return (
      <div className="container mx-auto max-w-7xl space-y-8">
        <div className="animate-slide-in-up">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
              Welcome back, {userProfile.name}!
            </h1>
            <p className="text-slate-600 mt-2">Here’s a summary of your investment portfolio and financial health.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
                 {/* Portfolio Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in stagger-1">
                        <h3 className="font-bold text-lg text-slate-800 mb-2">Portfolio Value</h3>
                        <p className="text-4xl font-bold text-slate-800">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(portfolioSummary.currentValue)}</p>
                    </div>
                     <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in stagger-2">
                        <h3 className="font-bold text-lg text-slate-800 mb-2">Total P/L</h3>
                        <div className={`flex items-center gap-2 text-4xl font-bold ${portfolioSummary.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                           {portfolioSummary.growth > 0 ? <ArrowTrendingUpIcon className="h-8 w-8"/> : <ArrowTrendingDownIcon className="h-8 w-8"/>}
                           {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(portfolioSummary.growth)}
                        </div>
                        <span className={`text-sm font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${portfolioSummary.growth > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {portfolioSummary.growth > 0 ? '+' : ''}{portfolioSummary.pnlPercent.toFixed(2)}%
                        </span>
                    </div>
                </div>

                {/* Asset Allocation & Goal Tracker */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in stagger-3">
                        <h3 className="font-bold text-lg text-slate-800 mb-4">Asset Allocation</h3>
                        <div className="w-full h-52">
                             <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                         <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
                            {pieData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center text-xs">
                                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </div>
                    <GoalTracker goals={mockGoals} />
                </div>
                
                {/* Budget Analysis Component */}
                <div className="animate-fade-in stagger-5">
                   <BudgetAnalysis userProfile={userProfile} />
                </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
                <FinancialHealthScore userProfile={userProfile} />
                {topics && topics.length > 0 && (
                    <div className="animate-fade-in stagger-4">
                        <RecommendedTopics topics={topics} onTopicClick={(title) => navigate('/learn')} />
                    </div>
                )}
            </div>
        </div>

        <div className="mt-8 text-center">
            <div className="flex flex-wrap justify-center items-center gap-4">
                 <button
                    onClick={() => navigate('/results')}
                    className="group inline-flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-md"
                >
                    View Full Plan
                    <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                    onClick={onReset}
                    className="group inline-flex items-center justify-center bg-white text-slate-700 font-semibold text-base py-3 px-6 rounded-full hover:bg-slate-100 transition-colors shadow-md border border-slate-200"
                >
                    <ArrowPathIcon className="mr-2 h-5 w-5 text-slate-500 transition-transform group-hover:rotate-180" />
                    Update Profile
                </button>
            </div>
        </div>
      </div>
    );
};


// --- ASSESSMENT FLOW COMPONENT (WIZARD REFACTOR) ---
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
    // Artificial delay for better UX
    await new Promise(res => setTimeout(res, 500)); 

    try {
      const response: AssessmentResponse = await getAssessmentResponse(currentHistory);
      
      // Don't add bot's "thinking" message to history, just the question
      if (!response.isComplete) {
          setHistory(prev => [...prev, { sender: 'bot', text: response.nextQuestion }]);
      }
      
      setCurrentQuestion(response.nextQuestion);
      setOptions(response.options || []);

      if (response.isComplete && response.profile) {
        setIsComplete(true);
        setCurrentStep(TOTAL_STEPS); // Mark final step as complete
        const profileWithGoals = {
            ...response.profile,
            goals: response.profile.goals?.length ? response.profile.goals : ['Long-term wealth creation']
        };
        setFinalProfile(profileWithGoals);
      } else {
        // Find which step we are on based on what info is still needed.
        // This is a simple approximation.
        const nextStepIndex = currentHistory.filter(m => m.sender === 'user').length;
        setCurrentStep(nextStepIndex);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Start the assessment on mount
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
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 animate-slide-in-up stagger-1 border border-slate-200/50">
            <div className="p-6 border-b border-slate-200">
                <div className="flex items-center">
                    {assessmentSteps.map((step, index) => {
                        const isCompleted = currentStep > index;
                        const isCurrent = currentStep === index;
                        return (
                            <React.Fragment key={step.key}>
                                <div className="flex flex-col items-center text-center w-16 z-10">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-blue-600 text-white' : isCurrent ? 'bg-blue-100 text-blue-600 ring-4 ring-blue-200 shadow-md' : 'bg-slate-200 text-slate-500'}`}>
                                        <step.icon className="h-5 w-5" />
                                    </div>
                                    <p className={`mt-2 text-xs font-semibold transition-colors duration-300 ${isCurrent || isCompleted ? 'text-blue-600' : 'text-slate-500'}`}>{step.label}</p>
                                </div>
                                {index < assessmentSteps.length - 1 && (
                                    <div className={`flex-1 h-1 transition-colors duration-500 ${isCompleted ? 'bg-blue-500' : 'bg-slate-200'}`}></div>
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
                    <div className="w-full text-center">
                         {isLoading ? (
                            <div className="flex justify-center items-center space-x-2 text-slate-500">
                                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-lg font-medium">Thinking...</span>
                            </div>
                        ) : currentQuestion ? (
                            <div key={currentStep} className="animate-slide-in-up">
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
                        ) : null}
                         {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};


// --- LOGGED OUT WELCOME VIEW ---
const LoggedOutWelcome: React.FC<{ onStartAssessment: () => void }> = ({ onStartAssessment }) => (
  <div className="container mx-auto max-w-6xl space-y-8">
    <div className="bg-white rounded-xl shadow-lg p-8 border-b-4 border-blue-500 animate-slide-in-up">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">
          Welcome to Allen Venture
        </h1>
        <p style={{ animationDelay: '100ms', opacity: 0 }} className="text-slate-600 mb-6 max-w-2xl mx-auto animate-slide-in-up stagger-1">
          Your guide to financial literacy and smart investing. Let's build your future, together.
        </p>
        <div style={{ animationDelay: '200ms', opacity: 0 }} className="animate-slide-in-up stagger-2">
          <button
            onClick={onStartAssessment}
            className="group inline-flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
          >
            Create My Financial Profile
            <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in stagger-1">
            <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-full"><SparklesIcon className="h-6 w-6" /></div>
                <h3 className="font-bold text-lg text-slate-800">Why Allen Venture?</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li>Personalized investment plans powered by AI.</li>
                <li>Simple, visual explanations of complex topics.</li>
                <li>Tools to track goals and project your wealth.</li>
                <li>A friendly chatbot to answer your questions.</li>
            </ul>
        </div>
        <Link to="/learn" className="block group animate-fade-in stagger-2">
            <div className="bg-gradient-to-br from-indigo-500 to-blue-500 text-white p-6 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all h-full flex flex-col justify-between">
                 <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-white/20 p-3 rounded-full"><BookOpenIcon className="h-6 w-6" /></div>
                        <h3 className="font-bold text-lg">Start Learning</h3>
                    </div>
                    <p className="text-sm text-white/80">Explore foundational investing topics to build your financial knowledge from the ground up.</p>
                </div>
                <p className="font-semibold mt-4 group-hover:underline">Explore Topics →</p>
            </div>
        </Link>
    </div>
  </div>
);


// --- MAIN DASHBOARD PAGE COMPONENT ---
const DashboardPage: React.FC<DashboardPageProps> = ({ userProfile, recommendations, onComplete, onReset, onUpdateProfile }) => {
  const [isAssessing, setIsAssessing] = useState(false);

  const handleStartAssessment = () => {
    onReset();
    setIsAssessing(true);
  };
  
  const handleAssessmentComplete = (profile: UserFinancialProfile, recs: InvestmentRecommendation[]) => {
    onComplete(profile, recs);
    setIsAssessing(false);
  };
  
  // If the assessment flow was triggered for an update or initial setup, show it.
  if (isAssessing) {
    return <AssessmentFlow onComplete={handleAssessmentComplete} />;
  }

  // If a profile exists, show the logged-in dashboard.
  if (userProfile && recommendations) {
    return <LoggedInDashboard userProfile={userProfile} recommendations={recommendations} onReset={handleStartAssessment} />;
  }
  
  // Otherwise, show the welcome screen to start the assessment.
  return <LoggedOutWelcome onStartAssessment={handleStartAssessment} />;
};

export default DashboardPage;