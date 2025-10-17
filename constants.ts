import type { EducationalTopic, LearningPathway } from './types';
import {
    SipIcon,
    MutualFundsIcon,
    AssetAllocationIcon,
    TaxSavingIcon,
    PpfIcon,
    CompoundingIcon,
    ScaleIcon,
    ShieldCheckIcon,
    QuestionMarkCircleIcon,
    ArrowTrendingUpIcon,
    ChartPieIcon,
    HeartIcon,
} from './components/icons/Icons';

export const LEARNING_TOPICS: EducationalTopic[] = [
    {
        title: 'Systematic Investment Plan (SIP)',
        description: 'Learn how to invest small amounts regularly.',
        icon: SipIcon,
    },
    {
        title: 'Mutual Funds',
        description: 'Discover how to invest in a diversified portfolio.',
        icon: MutualFundsIcon,
    },
    {
        title: 'Asset Allocation',
        description: 'Understand the strategy of balancing risk and reward.',
        icon: AssetAllocationIcon,
    },
    {
        title: 'Tax Saving (ELSS)',
        description: 'Explore how to save on taxes through investments.',
        icon: TaxSavingIcon,
    },
    {
        title: 'Public Provident Fund (PPF)',
        description: 'A government-backed long-term savings scheme.',
        icon: PpfIcon,
    },
    {
        title: 'The Power of Compounding',
        description: 'See how your money can grow exponentially over time.',
        icon: CompoundingIcon,
    },
    {
        title: 'Stocks vs. Bonds',
        description: 'Learn the core differences between owning and loaning.',
        icon: ScaleIcon,
    },
    {
        title: 'Emergency Fund',
        description: 'Why you need a financial safety net before investing.',
        icon: ShieldCheckIcon,
    },
    {
        title: 'Understanding Risk',
        description: 'Discover your comfort with investment fluctuations.',
        icon: QuestionMarkCircleIcon,
    },
    {
        title: 'Understanding Inflation',
        description: 'Learn how rising prices can affect your savings and investments.',
        icon: ArrowTrendingUpIcon,
    },
    {
        title: 'ETFs Explained',
        description: 'Explore Exchange-Traded Funds, a flexible and popular choice.',
        icon: ChartPieIcon,
    },
    {
        title: 'Behavioral Finance',
        description: 'Understand the psychology of investing to avoid common biases.',
        icon: HeartIcon,
    },
];

export const LEARNING_PATHWAYS: LearningPathway[] = [
    {
        id: 'p1',
        title: "The Beginner's Journey",
        description: 'Start here to build a strong foundation in investing concepts.',
        modules: [
            LEARNING_TOPICS[7], // Emergency Fund
            LEARNING_TOPICS[0], // SIP
            LEARNING_TOPICS[1], // Mutual Funds
            LEARNING_TOPICS[5], // Compounding
        ]
    },
    {
        id: 'p2',
        title: 'Portfolio Building Blocks',
        description: 'Learn how to construct and balance your investment portfolio.',
        modules: [
            LEARNING_TOPICS[8], // Understanding Risk
            LEARNING_TOPICS[6], // Stocks vs Bonds
            LEARNING_TOPICS[2], // Asset Allocation
            LEARNING_TOPICS[10], // ETFs
        ]
    }
];