import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { UserFinancialProfile, InvestmentRecommendation } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import { getPlanSummary, generateAspirationalImage } from '../services/geminiService';
import { 
    ArrowTrendingUpIcon, 
    ShieldCheckIcon, 
    BuildingOfficeIcon, 
    SparklesIcon, 
    CryptoIcon, 
    WalletIcon, 
    CheckCircleIcon, 
    HomeIcon,
    XCircleIcon,
    ArrowPathIcon,
    UserCircleIcon,
    CakeIcon,
    CurrencyRupeeIcon
} from '../components/icons/Icons';
import InvestmentDetailModal from '../components/InvestmentDetailModal';
import PortfolioProjectionCalculator from '../components/PortfolioProjectionCalculator';
import InvestmentImpactSimulator from '../components/InvestmentImpactSimulator';
import FinancialHealthScore from '../components/FinancialHealthScore';
import NextStepsAndGoalAlignment from '../components/NextStepsAndGoalAlignment';

// --- HELPER FUNCTIONS ---
const COLORS = ['#0ea5e9', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#facc15']; // sky, emerald, orange, violet, pink, amber

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
}).format(value);

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};

const generateVisionPrompt = (profile: UserFinancialProfile): string => {
    const primaryGoal = profile.goals[0]?.toLowerCase() || 'achieving financial freedom';
    const sharedKeywords = "photorealistic, cinematic lighting, high detail, inspirational, successful";

    if (primaryGoal.includes('house') || primaryGoal.includes('home')) {
        return `Me, looking proud and happy, standing in front of my beautiful new dream house with a modern design and a beautiful garden, bright sunny day. ${sharedKeywords}`;
    }
    if (primaryGoal.includes('retirement')) {
        return `Me, looking relaxed, healthy and happy, enjoying a luxurious retirement on a serene tropical beach with crystal clear water. ${sharedKeywords}`;
    }
    if (primaryGoal.includes('car')) {
        return `Me, smiling confidently, holding the keys to my brand new luxury car parked on a scenic road. ${sharedKeywords}`;
    }
    if (primaryGoal.includes('education')) {
        return `Me, at a graduation ceremony, celebrating achieving a higher education degree from a top university, looking accomplished. ${sharedKeywords}`;
    }
    if (primaryGoal.includes('wedding')) {
        return `A beautiful, grand, and elegant wedding celebration scene with me at the center, looking joyful. ${sharedKeywords}`;
    }
     if (primaryGoal.includes('wealth')) {
        return `Me, looking confident and successful in a modern, stylish office with a city skyline in the background, symbolizing financial achievement. ${sharedKeywords}`;
    }
    return `Me, looking successful and confident, surrounded by symbols of wealth and financial freedom, living a fulfilling life. ${sharedKeywords}`;
};


// --- SUB-COMPONENTS ---
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
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 pt-4 text-base">
            <div className="flex items-center gap-3">
                <CakeIcon className="h-6 w-6 text-slate-400" />
                <div>
                    <span className="text-slate-500 block text-sm">Age</span>
                    <span className="font-semibold text-slate-700">{userProfile.age}</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <CurrencyRupeeIcon className="h-6 w-6 text-slate-400" />
                <div>
                    <span className="text-slate-500 block text-sm">Income (p.a.)</span>
                    <span className="font-semibold text-slate-700">₹{userProfile.annualIncome.toLocaleString('en-IN')}</span>
                </div>
            </div>
             <div className="flex items-center gap-3 col-span-2">
                <ArrowTrendingUpIcon className="h-6 w-6 text-slate-400" />
                <div>
                    <span className="text-slate-500 block text-sm">Monthly Savings</span>
                    <span className="font-semibold text-slate-700">₹{userProfile.monthlySavings.toLocaleString('en-IN')}</span>
                </div>
            </div>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg animate-fade-in">
          <p className="font-bold text-slate-800">{`${payload[0].name}`}</p>
          <p className="text-sm text-slate-600">{`Allocation: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
};

const getIconForAssetClass = (assetClass: string) => {
    const className = "h-6 w-6";
    const lowerAssetClass = assetClass.toLowerCase();
    if (lowerAssetClass.includes('equity') || lowerAssetClass.includes('stock')) {
        return <ArrowTrendingUpIcon className={className} />;
    }
    if (lowerAssetClass.includes('fixed') || lowerAssetClass.includes('bond') || lowerAssetClass.includes('deposit') || lowerAssetClass.includes('ppf') || lowerAssetClass.includes('liquid')) {
        return <ShieldCheckIcon className={className} />;
    }
    if (lowerAssetClass.includes('reit') || lowerAssetClass.includes('real estate')) {
        return <BuildingOfficeIcon className={className} />;
    }
    if (lowerAssetClass.includes('gold')) {
        return <SparklesIcon className={className} />;
    }
    if (lowerAssetClass.includes('crypto') || lowerAssetClass.includes('bitcoin')) {
        return <CryptoIcon className={className} />;
    }
    return <SparklesIcon className={className} />;
};


// --- VISUALIZE GOAL COMPONENT ---
interface VisualizeGoalCardProps {
    userProfile: UserFinancialProfile;
}

const VisualizeGoalCard: React.FC<VisualizeGoalCardProps> = ({ userProfile }) => {
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [sourceImageFile, setSourceImageFile] = useState<File | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const visionPrompt = useMemo(() => generateVisionPrompt(userProfile), [userProfile]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSourceImageFile(file);
            setSourceImage(URL.createObjectURL(file));
            setGeneratedImage(null);
            setError(null);
        } else {
            setError('Please select a valid image file (JPEG, PNG, etc.).');
        }
    };

    const handleGenerate = useCallback(async () => {
        if (!sourceImageFile) {
            setError('Please upload a photo first.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const base64Data = await fileToBase64(sourceImageFile);
            const resultImageUrl = await generateAspirationalImage(base64Data, sourceImageFile.type, visionPrompt);
            setGeneratedImage(resultImageUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [sourceImageFile, visionPrompt]);

    const handleReset = () => {
        setSourceImage(null);
        setSourceImageFile(null);
        setGeneratedImage(null);
        setError(null);
        setIsLoading(false);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <div className="text-center">
                <h3 className="text-xl font-bold text-slate-800 flex items-center justify-center gap-2">
                    <SparklesIcon className="h-6 w-6 text-indigo-500" />
                    Visualize Your Success
                </h3>
                <p className="text-sm text-slate-500 mt-1 max-w-lg mx-auto">Upload your photo to see an AI-generated vision of you achieving your goal: "{userProfile.goals[0] || 'Financial Freedom'}"!</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                    <div 
                        className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                        {sourceImage ? (
                            <img src={sourceImage} alt="Uploaded preview" className="max-h-40 mx-auto rounded-md" />
                        ) : (
                            <p className="text-slate-500 py-12">Click to upload a photo</p>
                        )}
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={!sourceImageFile || isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-full hover:bg-indigo-700 transition-all shadow-lg transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Creating Vision...
                            </>
                        ) : (
                           "Generate My Vision"
                        )}
                    </button>
                    {sourceImageFile && (
                        <button onClick={handleReset} className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center justify-center gap-1">
                            <ArrowPathIcon className="h-3 w-3" />
                            Start Over
                        </button>
                    )}
                </div>
                <div className="relative w-full aspect-square bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">
                    {isLoading && <div className="w-full h-full bg-slate-200 animate-pulse"></div>}
                    {error && !isLoading && (
                        <div className="p-4 text-center">
                            <XCircleIcon className="h-8 w-8 text-red-400 mx-auto mb-2" />
                            <p className="text-red-600 text-sm font-semibold">Generation Failed</p>
                            <p className="text-xs text-slate-600 mt-1">{error}</p>
                        </div>
                    )}
                    {generatedImage && !isLoading && <img src={generatedImage} alt="AI generated vision" className="w-full h-full object-cover animate-fade-in" />}
                    {!generatedImage && !isLoading && !error && <p className="text-slate-500 text-sm p-4 text-center">Your vision will appear here</p>}
                </div>
            </div>
        </div>
    );
};


// --- MAIN RESULTS PAGE COMPONENT ---
const ResultsPage: React.FC<{ userProfile: UserFinancialProfile; recommendations: InvestmentRecommendation[]; }> = ({ userProfile, recommendations }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedData, setSelectedData] = useState<{ recommendation: InvestmentRecommendation, color: string } | null>(null);
    const [insights, setInsights] = useState<string[] | null>(null);
    const [isLoadingInsights, setIsLoadingInsights] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            setIsLoadingInsights(true);
            try {
                const summaryInsights = await getPlanSummary(userProfile, recommendations);
                setInsights(summaryInsights);
            } catch (error) {
                console.error("Failed to load insights", error);
                setInsights(["This plan is diversified to balance risk and reward, aligning with your goals."]); // Fallback
            }
            setIsLoadingInsights(false);
        };
        fetchSummary();
    }, [userProfile, recommendations]);

    const onPieEnter = useCallback((_: any, index: number) => {
        setActiveIndex(index);
    }, [setActiveIndex]);
    
    const totalMonthlyInvestment = userProfile.monthlySavings;

    const renderActiveShape = useCallback((props: any) => {
      const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
      return (
        <g>
          <text x={cx} y={cy - 20} dy={8} textAnchor="middle" fill="#475569" className="text-sm font-medium">
            {payload.name}
          </text>
           <text x={cx} y={cy + 4} dy={8} textAnchor="middle" fill={fill} className="text-3xl font-bold">
            {`${payload.value}%`}
          </text>
          <text x={cx} y={cy + 30} dy={8} textAnchor="middle" fill="#475569" className="text-sm font-medium">
            SIP: {formatCurrency(totalMonthlyInvestment * (payload.value / 100))}
          </text>
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius + 8}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
            style={{ filter: `drop-shadow(0px 6px 12px ${fill}99)` }}
          />
        </g>
      );
    }, [totalMonthlyInvestment]);

  const pieData = useMemo(() => recommendations.map(rec => ({ name: rec.assetClass, value: rec.allocationPercentage })), [recommendations]);
  
  const renderInsightsCard = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Key Insights from Your Plan</h2>
        {isLoadingInsights ? (
            <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded animate-pulse w-5/6"></div>
                <div className="h-4 bg-slate-200 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-slate-200 rounded animate-pulse w-4/6"></div>
            </div>
        ) : (
            <ul className="space-y-3">
                {insights?.map((insight, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">{insight}</span>
                    </li>
                ))}
            </ul>
        )}
    </div>
  );

  return (
    <>
    <div className="container mx-auto max-w-7xl space-y-8">
      <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-xl p-8 text-center animate-slide-in-up overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
        <div className="relative z-10">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Your Personalized Investment Plan</h1>
            <p className="mt-4 text-lg text-indigo-200">
                Hi {userProfile.name}, this plan is for your <span className="font-bold text-white bg-white/20 px-2 py-1 rounded-md">{userProfile.riskProfile}</span> profile.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Allocation & Breakdown */}
        <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in stagger-1 flex flex-col" style={{ opacity: 0 }}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">Asset Allocation</h2>
                    <div className="flex items-center gap-2 text-sm font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full">
                        <WalletIcon className="h-5 w-5" />
                        <span>Total SIP: {formatCurrency(totalMonthlyInvestment)}/month</span>
                    </div>
                </div>
                <div className="flex-grow w-full h-[350px]">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                                onMouseEnter={onPieEnter}
                            >
                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none stroke-white stroke-2"/>)}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 animate-fade-in" style={{animationDelay: '200ms', opacity: 0}}>Breakdown & Rationale</h2>
                {recommendations.map((rec, index) => {
                    const color = COLORS[index % COLORS.length];
                    return (
                    <button key={index} 
                          onClick={() => setSelectedData({ recommendation: rec, color: color })}
                          className="w-full text-left bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in flex focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" 
                          style={{ animationDelay: `${300 + index * 100}ms`, opacity: 0 }}>
                        <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: color }}></div>
                        <div className="p-4 flex-grow">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full" style={{ backgroundColor: `${color}20`, color: color }}>
                                        {getIconForAssetClass(rec.assetClass)}
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800">{rec.assetClass}</h3>
                                </div>
                                <span className="text-xl font-bold" style={{ color: color }}>{rec.allocationPercentage}%</span>
                            </div>
                            <p className="text-sm text-slate-600 mb-3 leading-relaxed">{rec.rationale}</p>
                            <div className="flex flex-wrap gap-2">
                                {rec.suitableInstruments.slice(0, 2).map(instrument => (
                                    <span key={instrument} className="text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-full border border-slate-200">
                                        {instrument}
                                    </span>
                                ))}
                                {rec.suitableInstruments.length > 2 && <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-full border border-slate-200">+{rec.suitableInstruments.length - 2} more</span>}
                            </div>
                        </div>
                    </button>
                )})}
            </div>
        </div>

        {/* Right Column: Insights, Growth Projection, and Next Steps */}
        <div className="space-y-8">
            <div className="animate-fade-in stagger-1" style={{opacity: 0}}>
                <ProfileInfoCard userProfile={userProfile} />
            </div>
            <div className="animate-fade-in stagger-2" style={{opacity: 0}}>
                 <FinancialHealthScore userProfile={userProfile} />
            </div>
            <div className="animate-fade-in stagger-3" style={{opacity: 0}}>
                {renderInsightsCard()}
            </div>
            <div className="animate-fade-in stagger-4" style={{opacity: 0}}>
                <PortfolioProjectionCalculator 
                    userProfile={userProfile}
                    recommendations={recommendations}
                />
            </div>
            <div className="animate-fade-in stagger-5" style={{opacity: 0}}>
                <InvestmentImpactSimulator 
                    userProfile={userProfile}
                    recommendations={recommendations}
                />
            </div>
        </div>
      </div>
      
      <div className="mt-8 animate-fade-in" style={{opacity: 0, animationDelay: '600ms'}}>
        <NextStepsAndGoalAlignment userProfile={userProfile} />
      </div>

       <div className="mt-8 animate-fade-in" style={{opacity: 0, animationDelay: '700ms'}}>
         <VisualizeGoalCard userProfile={userProfile} />
       </div>
      
      <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 mt-8 max-w-3xl mx-auto animate-fade-in" style={{opacity: 0, animationDelay: '800ms'}}>
        <p className="text-xs text-slate-600 text-center">
            This is an educational guide, not official financial advice. The instruments shown are examples. Always consult a SEBI-registered advisor for personal investment decisions.
        </p>
      </div>

       <div className="text-center mt-8 pb-8 animate-fade-in" style={{opacity: 0, animationDelay: '900ms'}}>
            <Link
                to="/"
                className="group inline-flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
            >
                <HomeIcon className="mr-2 h-5 w-5" />
                Go to My Dashboard
            </Link>
        </div>
    </div>
     {selectedData && (
        <InvestmentDetailModal
            isOpen={!!selectedData}
            onClose={() => setSelectedData(null)}
            recommendation={selectedData.recommendation}
            userProfile={userProfile}
            color={selectedData.color}
        />
    )}
    </>
  );
};

export default ResultsPage;