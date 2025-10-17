import type { FC } from 'react';

export enum RiskProfile {
  CONSERVATIVE = 'Conservative',
  MODERATE = 'Moderate',
  AGGRESSIVE = 'Aggressive',
}

export interface Question {
  id: string;
  text: string;
  options: { text: string; value: number }[];
}

export interface UserFinancialProfile {
  name: string;
  age: number;
  annualIncome: number;
  monthlySavings: number;
  riskProfile: RiskProfile;
  goals: string[];
}

export interface InvestmentRecommendation {
    assetClass: string;
    allocationPercentage: number;
    rationale: string;
    suitableInstruments: string[];
}

export interface InvestmentPlan {
  recommendations: InvestmentRecommendation[];
}

export interface AssessmentResponse {
  nextQuestion: string;
  isComplete: boolean;
  profile: UserFinancialProfile | null;
  options?: string[];
}

export interface VisualLearningContent {
    topic: string;
    explanation: string;
    keyTakeaways: string[];
    analogy: string;
    actionableTip: string;
    iconName: 'Lightbulb' | 'Key' | 'Target' | 'BookOpen';
    faqs: { question: string; answer: string }[];
    imagePrompt: string;
}

export interface EducationalTopic {
    title: string;
    description: string;
    icon: FC<{ className?: string }>;
}

export interface InstrumentDetails {
    name: string;
    introduction: string;
    keyFeatures: string[];
    typicalReturnRate: number;
}

export interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
}

export interface LearningPathway {
    id: 'p1' | 'p2';
    title: string;
    description: string;
    modules: {
        title: string;
        description: string;
        icon: FC<{ className?: string }>;
    }[];
}

export interface QuizQuestion {
    questionText: string;
    options: {
        text: string;
        isCorrect: boolean;
    }[];
    explanation: string;
}

export interface Quiz {
    questions: QuizQuestion[];
}

export interface RecommendedTopic {
    title: string;
    reason: string;
    iconName: 'SipIcon' | 'MutualFundsIcon' | 'AssetAllocationIcon' | 'TaxSavingIcon' | 'PpfIcon' | 'CompoundingIcon';
}

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    category: 'Needs' | 'Wants' | 'Savings';
    date: string;
}

export interface BudgetInsight {
    category: 'Needs' | 'Wants' | 'Savings';
    message: string;
    suggestion: string;
}

export interface BudgetAnalysisResponse {
    overallFeedback: string;
    insights: BudgetInsight[];
}
