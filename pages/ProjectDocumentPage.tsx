import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { 
    BookOpenIcon, 
    SparklesIcon, 
    ChartPieIcon, 
    UserCircleIcon,
    ShieldCheckIcon,
    CpuChipIcon,
    ArrowTrendingUpIcon,
    EyeIcon,
    RocketLaunchIcon,
    UsersIcon,
    ChartBarIcon,
    BuildingStorefrontIcon,
    AcademicCapIcon,
    BeakerIcon,
    QuestionMarkCircleIcon,
    ClipboardDocumentListIcon,
    CloudIcon,
    CodeBracketSquareIcon,
    ChevronDownIcon,
} from '../components/icons/Icons';

const Section: React.FC<{
    icon: React.FC<{ className?: string }>;
    title: string;
    children: React.ReactNode;
}> = ({ icon: Icon, title, children }) => (
    <section className="mb-12 animate-fade-in-slight">
        <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                <Icon className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        </div>
        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4">
            {children}
        </div>
    </section>
);

const FeatureCard: React.FC<{
    icon: React.FC<{ className?: string }>;
    title: string;
    children: React.ReactNode;
    className?: string;
}> = ({ icon: Icon, title, children, className }) => (
     <div className={`bg-slate-50 border border-slate-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3 mb-2">
            <Icon className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <h4 className="font-bold text-slate-800">{title}</h4>
        </div>
        <p className="text-sm text-slate-600">{children}</p>
    </div>
);

const FlowStep: React.FC<{
    icon: React.FC<{className?: string}>;
    title: string;
    description: string;
}> = ({ icon: Icon, title, description }) => (
    <div className="flex flex-col items-center text-center">
        <div className="bg-slate-200 text-slate-600 rounded-full p-3 ring-4 ring-white">
            <Icon className="h-6 w-6"/>
        </div>
        <h4 className="font-bold text-sm mt-2 text-slate-700">{title}</h4>
        <p className="text-xs text-slate-500 max-w-[150px]">{description}</p>
    </div>
);

const FAQItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-slate-200 rounded-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left p-4 font-semibold text-slate-800 hover:bg-slate-50"
            >
                <span>{question}</span>
                <ChevronDownIcon className={`h-5 w-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                    <div className="prose prose-sm max-w-none text-slate-600">{children}</div>
                </div>
            )}
        </div>
    );
};


const ProjectDocumentPage: React.FC = () => {
    return (
        <div className="bg-white max-w-4xl mx-auto p-8 sm:p-12 rounded-xl shadow-lg border border-slate-200 animate-slide-in-up">
            <style>
                {`
                    .prose ul { list-style-type: '✓ '; padding-left: 1.5rem; }
                    .prose ul li::marker { color: #3b82f6; }
                    .prose ul li { padding-left: 0.5rem; margin-bottom: 0.5rem; }
                    .prose p { margin-bottom: 1rem; }
                    .prose h3, .prose h4 { margin-top: 1.5rem; margin-bottom: 0.75rem; color: #1e293b; }
                    .prose blockquote { border-left: 4px solid #94a3b8; padding-left: 1rem; font-style: italic; color: #475569; }
                `}
            </style>
            <header className="text-center border-b pb-8 mb-8">
                <Logo className="h-20 w-auto mx-auto mb-4" />
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    Allen Venture: AI-Powered Financial Literacy
                </h1>
                <p className="mt-4 text-lg text-slate-600">
                    An Entrepreneurial Project for the Science Exhibition
                </p>
            </header>

            <main>
                <Section icon={EyeIcon} title="The Big Idea: Problem & Solution">
                    <h4>The Problem: A Generation at Financial Risk</h4>
                    <p>
                        A large and growing number of young Indians are earning money for the first time, but lack the financial knowledge to manage it effectively. They face "investment paralysis"—the fear and confusion caused by complex financial products and risky social media advice. This creates a critical gap between earning and wealth creation.
                    </p>
                    <h4>Our Solution: A Personal AI Financial Coach</h4>
                    <p>
                        Allen Venture is a mobile-first web application that acts as a friendly, intelligent guide to personal finance. It uses the power of Google's Gemini AI to make financial literacy accessible, engaging, and deeply personal. We turn confusion into confidence, enabling young users to take the first step towards a secure financial future.
                    </p>
                </Section>
                
                <Section icon={CpuChipIcon} title="How Our AI Works: A Simple Guide">
                    <p>For students in commerce, think of our AI integration like this: our app is the 'business manager', and Google Gemini is our 'team of expert consultants'. We need a way to communicate with them.</p>

                    <h4>What is an API? The Restaurant Analogy</h4>
                    <p>
                       An <strong>API (Application Programming Interface)</strong> is like a waiter in a restaurant.
                    </p>
                     <blockquote>
                        You (the user in our app) decide what you want to order (e.g., you ask a question). You give this order to the waiter (the API). The waiter takes the order to the kitchen (Google's Gemini AI), which prepares your dish (the answer). The waiter then brings the finished dish back to your table. You don't need to know how the kitchen works, you just need the waiter to get your results!
                     </blockquote>
                     
                     <h4>The AI Interaction Flow</h4>
                     <p>Every time a user interacts with an AI feature, a similar process happens in the background. It's a rapid, structured conversation between our app and the Gemini AI.</p>
                     
                     <div className="bg-slate-100 rounded-lg p-6 mt-6">
                        <div className="flex items-center justify-between">
                            <FlowStep icon={UserCircleIcon} title="User Input" description="User types a message or clicks a button."/>
                            <div className="text-slate-300 font-mono">&gt;&gt;</div>
                            <FlowStep icon={ClipboardDocumentListIcon} title="App Prepares" description="Our app formats the input into a detailed 'prompt' for the AI."/>
                            <div className="text-slate-300 font-mono">&gt;&gt;</div>
                            <FlowStep icon={CloudIcon} title="Gemini AI Processes" description="The AI analyzes the prompt and generates a response."/>
                            <div className="text-slate-300 font-mono">&gt;&gt;</div>
                             <FlowStep icon={CodeBracketSquareIcon} title="Structured Data" description="The AI sends back a perfectly formatted JSON object (like a digital invoice)."/>
                             <div className="text-slate-300 font-mono">&gt;&gt;</div>
                            <FlowStep icon={SparklesIcon} title="Display Result" description="Our app reads the data and displays it beautifully to the user."/>
                        </div>
                     </div>
                </Section>

                <Section icon={SparklesIcon} title="Core AI-Powered Features Explained">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                        <FeatureCard icon={UserCircleIcon} title="1. The Smart Conversation (Assessment)">
                            Instead of a boring form, users chat with an AI. The AI asks one question at a time, making the process of building a financial profile feel natural and easy. It knows when to offer multiple-choice options and when to ask for typed input.
                        </FeatureCard>
                        <FeatureCard icon={ChartPieIcon} title="2. The Personalized Plan (Recommendations)">
                            This is our most powerful feature. The AI takes the user's profile and uses Google Search grounding to access up-to-date market information. It then generates a diversified, actionable investment plan with clear rationales.
                        </FeatureCard>
                        <FeatureCard icon={BookOpenIcon} title="3. The Visual Learning Center">
                            When a user wants to learn about a topic like "Mutual Funds," the AI generates a complete, structured lesson on the fly—including simple explanations, analogies, FAQs, and even a prompt to create a unique illustrative image.
                        </FeatureCard>
                         <FeatureCard icon={EyeIcon} title="4. The Dream Visualizer (Image Editing)">
                            To make goals feel real, this feature uses a multimodal AI (gemini-2.5-flash-image). It takes a user's photo and their goal (e.g., "my first home") and edits the image to create a powerful, inspirational vision of their future success.
                        </FeatureCard>
                    </div>
                </Section>
                
                <Section icon={BuildingStorefrontIcon} title="Entrepreneurial Vision & Social Impact">
                    <h4>Business Model (Freemium)</h4>
                    <p>Our strategy is to attract a large user base with high-value free features. Revenue can be generated later through a 'Pro' subscription that unlocks advanced analytics, "what-if" simulators, and multi-goal tracking—perfect for users as they become more financially savvy.</p>

                    <h4>Social Impact: Empowering India's Youth</h4>
                    <p>Allen Venture is more than an app; it's a tool for social empowerment. By improving financial literacy, we aim to:</p>
                    <ul>
                        <li><strong>Promote Financial Inclusion:</strong> Help young people participate in the economy with confidence.</li>
                        <li><strong>Reduce Financial Anxiety:</strong> Provide a clear path forward, reducing the stress associated with money management.</li>
                        <li><strong>Foster a Culture of Saving & Investing:</strong> Encourage long-term wealth creation from an early age, contributing to national economic stability.</li>
                    </ul>
                </Section>
                
                 <Section icon={QuestionMarkCircleIcon} title="Q&A for the Judges">
                    <div className="space-y-4">
                        <FAQItem question="How does your project promote innovation?">
                            <p>Our innovation lies in the <strong>application and integration</strong> of advanced AI. Instead of using AI for a single gimmick, we've built an entire user journey powered by different capabilities of the Gemini API:</p>
                            <ul>
                                <li><strong>Conversational AI</strong> for user-friendly data collection.</li>
                                <li><strong>AI with Search Grounding</strong> for real-time, relevant financial planning.</li>
                                <li><strong>Generative AI</strong> for creating dynamic, personalized educational content.</li>
                                <li><strong>Multimodal AI</strong> for creating powerful, emotional connections to financial goals.</li>
                            </ul>
                            <p>This holistic approach makes sophisticated financial guidance accessible to everyone.</p>
                        </FAQItem>
                        <FAQItem question="Is the financial advice safe and trustworthy?">
                            <p>This is a critical point we've addressed in three ways:</p>
                            <ol className="list-decimal ml-6">
                                <li><strong>Educational Focus:</strong> The app's primary goal is to educate, not to be a trading platform. It teaches principles like diversification and long-term thinking.</li>
                                <li><strong>AI Grounding:</strong> For investment recommendations, we use Google Search grounding. This forces the AI to base its suggestions on current, publicly available information rather than just its training data.</li>
                                <li><strong>Clear Disclaimers:</strong> Every piece of advice is accompanied by a disclaimer stating that this is an educational tool and users should consult a SEBI-registered financial advisor for official advice. We empower users to learn, not to follow blindly.</li>
                            </ol>
                        </FAQItem>
                        <FAQItem question="Is the AI learning from my personal financial data?">
                             <p><strong>No, it is not.</strong> This is a key technical and ethical point. The Gemini API, in this implementation, is "stateless." This means the AI has no memory of past conversations. Each time we send a request, we include the relevant history of that specific chat, but the AI model itself doesn't store any user's personal data or learn from it. User privacy is paramount.</p>
                        </FAQItem>
                         <FAQItem question="Why did you choose Google Gemini over other AI models?">
                            <p>We chose Google Gemini for several key reasons:</p>
                             <ul>
                                 <li><strong>Multimodality:</strong> Gemini's ability to handle text, search, and images within a single ecosystem was perfect for our vision (e.g., generating content and then creating an image for it).</li>
                                 <li><strong>Performance & Speed:</strong> The `gemini-2.5-flash` model provides an excellent balance of speed and intelligence, crucial for a responsive user experience.</li>
                                 <li><strong>Structured Data Output:</strong> Gemini's strong adherence to JSON schema is the backbone of our app's reliability. It ensures we always get data back in a predictable format we can work with.</li>
                             </ul>
                        </FAQItem>
                    </div>
                </Section>

                <Section icon={BeakerIcon} title="Technology Stack">
                    <p>The application is built with a modern, efficient, and AI-first architecture.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <FeatureCard icon={CpuChipIcon} title="Frontend Framework">
                            <strong>React with TypeScript:</strong> A powerful combination for building fast, reliable, and scalable user interfaces.
                        </FeatureCard>
                         <FeatureCard icon={SparklesIcon} title="AI Engine & Backend">
                            <strong>Google Gemini API:</strong> The entire backend logic, content generation, and personalization is handled by various Gemini models. This is a "serverless" approach where the AI is our backend.
                        </FeatureCard>
                    </div>
                </Section>

                <Section icon={RocketLaunchIcon} title="Future Scope">
                     <p>
                        The Allen Venture platform is built to be extensible. Future enhancements could include:
                    </p>
                    <ul>
                        <li><strong>Live Voice Conversations:</strong> Integrating the Gemini Live API for real-time, spoken conversations with the financial assistant.</li>
                        <li><strong>Gamified Learning:</strong> Adding interactive stock market simulation games to teach investing principles in a fun, risk-free environment.</li>
                        <li><strong>AI-Powered News Summary:</strong> A dedicated section where the AI summarizes the day's key financial news in simple terms for beginners.</li>
                    </ul>
                </Section>

                 <div className="text-center mt-12 pt-8 border-t">
                     <p className="text-base font-semibold text-slate-800">Presented for the Science Exhibition by</p>
                     <p className="mt-2 text-slate-600">Allenhouse Public School Rooma</p>
                 </div>
            </main>
        </div>
    );
};

export default ProjectDocumentPage;
