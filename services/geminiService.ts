import { GoogleGenAI, Type, GenerateContentResponse, GenerateImagesResponse, Modality } from "@google/genai";
import type { UserFinancialProfile, InvestmentRecommendation, InvestmentPlan, AssessmentResponse, VisualLearningContent, InstrumentDetails, RecommendedTopic, Quiz, Transaction, BudgetAnalysisResponse } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Reliability Enhancements for Exhibition ---

// 1. In-memory cache to reduce redundant API calls for static content.
const contentCache = new Map<string, Promise<any>>();

// 2. Automatic retry mechanism with exponential backoff for handling API rate limits.
const withRetry = async <T>(apiCall: () => Promise<T>, retries: number = 3, delay: number = 1000): Promise<T> => {
    let lastError: Error | unknown;
    for (let i = 0; i < retries; i++) {
        try {
            return await apiCall();
        } catch (error) {
            lastError = error;
            console.warn(`API call failed. Attempt ${i + 1} of ${retries}. Retrying in ${delay * Math.pow(2, i)}ms...`);
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
            }
        }
    }
    throw lastError;
};

// --- API Schemas ---

const assessmentResponseSchema = {
    type: Type.OBJECT,
    properties: {
        nextQuestion: {
            type: Type.STRING,
            description: "The next question to ask the user, or a concluding remark if the assessment is complete."
        },
        options: {
            type: Type.ARRAY,
            nullable: true,
            items: { type: Type.STRING },
            description: "A list of suggested options for the user to select from, if applicable (e.g., for goals or risk tolerance). Keep options concise (2-4 words max). If the question requires free-form text input (like name or income), this MUST be null or an empty array."
        },
        isComplete: {
            type: Type.BOOLEAN,
            description: "Set to true only when all required information has been collected."
        },
        profile: {
            type: Type.OBJECT,
            nullable: true,
            description: "The completed user profile. This should only be populated when isComplete is true.",
            properties: {
                name: { type: Type.STRING },
                age: { type: Type.NUMBER },
                annualIncome: { type: Type.NUMBER },
                monthlySavings: { type: Type.NUMBER, description: "The user's total monthly savings for investment in INR." },
                riskProfile: { type: Type.STRING, enum: ['Conservative', 'Moderate', 'Aggressive'] },
                goals: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        }
    },
    required: ["nextQuestion", "isComplete", "profile"]
};

const planSummarySchema = {
    type: Type.OBJECT,
    properties: {
        insights: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 2-3 concise, encouraging, and insightful bullet points summarizing the investment plan's strategy and why it's suitable for the user."
        }
    },
    required: ["insights"]
};

const visualLearningContentSchema = {
    type: Type.OBJECT,
    properties: {
        topic: { type: Type.STRING, description: "The financial topic being explained (e.g., 'Mutual Funds')." },
        explanation: { type: Type.STRING, description: "A clear, concise explanation of the topic in 2-3 sentences, suitable for a beginner." },
        keyTakeaways: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 2-3 crucial bullet points or takeaways about the topic."
        },
        analogy: { type: Type.STRING, description: "A simple, relatable analogy to help understand the concept (e.g., comparing a mutual fund to a thali meal)." },
        actionableTip: { type: Type.STRING, description: "A single, practical tip the user can apply." },
        iconName: {
            type: Type.STRING,
            enum: ['Lightbulb', 'Key', 'Target', 'BookOpen'],
            description: "The most suitable icon for the topic. 'Lightbulb' for concepts, 'Key' for important info, 'Target' for goals, 'BookOpen' for general knowledge."
        },
        faqs: {
            type: Type.ARRAY,
            description: "A list of 2-3 frequently asked questions about the topic, with clear answers.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING }
                },
                required: ["question", "answer"]
            }
        },
        imagePrompt: {
            type: Type.STRING,
            description: "A short, descriptive prompt for a simple, metaphorical, and illustrative image that visually represents the topic in a clean, modern, vector style. Example for 'SIP': 'A person watering a small money plant that is growing steadily inside a glass jar, showing coins in the soil.'"
        }
    },
    required: ["topic", "explanation", "keyTakeaways", "analogy", "actionableTip", "iconName", "faqs", "imagePrompt"]
};

const instrumentDetailsSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        introduction: { type: Type.STRING, description: "A 2-3 sentence paragraph explaining what the instrument is in simple terms." },
        keyFeatures: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "A list of 3-4 bullet points highlighting its main features (e.g., risk level, tax benefits, lock-in period)."
        },
        typicalReturnRate: { 
            type: Type.NUMBER, 
            description: "A reasonable, estimated average annual return rate as a single number (e.g., 12 for 12%)." 
        },
    },
    required: ["name", "introduction", "keyFeatures", "typicalReturnRate"],
};

const recommendedTopicsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "The title of the recommended topic." },
            reason: { type: Type.STRING, description: "A short, personalized reason (max 15 words) why this topic is relevant for the user." },
            iconName: { type: Type.STRING, enum: ['SipIcon', 'MutualFundsIcon', 'AssetAllocationIcon', 'TaxSavingIcon', 'PpfIcon', 'CompoundingIcon'] },
        },
        required: ['title', 'reason', 'iconName']
    }
};

const quizSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    questionText: { type: Type.STRING, description: "The text of the quiz question." },
                    options: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                text: { type: Type.STRING },
                                isCorrect: { type: Type.BOOLEAN }
                            },
                            required: ['text', 'isCorrect']
                        },
                        description: "An array of 4 possible answers. Exactly one MUST be correct."
                    },
                    explanation: { type: Type.STRING, description: "A brief explanation of why the correct answer is right." }
                },
                required: ['questionText', 'options', 'explanation']
            }
        }
    },
    required: ['questions']
};

const budgetAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        overallFeedback: {
            type: Type.STRING,
            description: "A brief (1-2 sentence), encouraging, and friendly summary of the user's spending habits based on the 50/30/20 rule."
        },
        insights: {
            type: Type.ARRAY,
            description: "A list of 2-3 specific insights, one for each category that needs attention. Prioritize the category that deviates most from the 50/30/20 ideal.",
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING, enum: ['Needs', 'Wants', 'Savings'], description: "The budget category this insight pertains to." },
                    message: { type: Type.STRING, description: "A specific observation about this category's spending (e.g., 'Your spending on Wants is a bit high this month')." },
                    suggestion: { type: Type.STRING, description: "A single, actionable, and friendly tip to help the user improve in this category (e.g., 'Try setting a small weekly budget for dining out to see a big difference!')." }
                },
                required: ['category', 'message', 'suggestion']
            }
        }
    },
    required: ['overallFeedback', 'insights']
};


// --- Service Functions ---

export const getAssessmentResponse = async (history: { sender: 'user' | 'bot', text: string }[]): Promise<AssessmentResponse> => {
    const formattedHistory = history.map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`).join('\n');

    const prompt = `
        You are an AI financial assistant conducting a profile assessment for a user in India. Your goal is to collect information by asking questions ONE AT A TIME.
        The required information is: Name, Age, Annual Income (INR), Monthly Savings (INR), Financial Goals, and Risk Tolerance.

        Analyze the conversation history to see what information you already have. Based on that, determine the next question to ask.

        **Instructions for your response:**
        1.  **Ask One Question at a Time:** Focus on gathering one piece of information per turn.
        2.  **Use Options Where Possible:**
            -   For questions about **Financial Goals**, provide options like "Wealth Creation", "Buy a House", "Retirement Planning", "Car Purchase", "Child's Education", "Wedding Fund".
            -   For determining **Risk Tolerance**, ask a question and provide options like "Low Risk, Low Return", "Balanced", "High Risk, High Return".
            -   For all other questions (Name, Age, Income, Savings), these require typed input. Therefore, the \`options\` field in your response MUST be null or an empty array.
        3.  **Keep it Conversational:** Maintain a friendly and encouraging tone.
        4.  **Complete the Profile:** Once all information is gathered, set "isComplete" to true and populate the "profile" object. Do not set "isComplete" to true until every piece of information is collected.

        Conversation History:
        ${formattedHistory}
    `;
    try {
        const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: assessmentResponseSchema,
                temperature: 0.2,
                maxOutputTokens: 1024,
                thinkingConfig: { thinkingBudget: 256 },
            }
        }));

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as AssessmentResponse;
    } catch (error) {
        console.error("Error in conversational assessment:", error);
        throw new Error("The AI assistant is experiencing high demand right now. Please try again in a moment.");
    }
};


export const getInvestmentRecommendations = async (profile: UserFinancialProfile): Promise<InvestmentPlan> => {
    const prompt = `
        You are an expert financial advisor for young Indian professionals (age 22-35).
        A user has provided their financial profile. Your task is to generate a personalized, diversified investment portfolio based on their risk profile and current market conditions in India.

        **CRITICAL INSTRUCTION:** You MUST use your search capabilities to find up-to-date information. Based on your search, create a well-diversified investment plan. The plan MUST include a mix of asset classes: Equity (e.g., Mutual Funds), Debt (e.g., PPF, Bonds), Gold (e.g., SGBs), and Real Estate (e.g., REITs). It is very important to not focus only on stocks. The final allocation must be balanced and appropriate for the user's risk profile.

        User Profile:
        - Name: ${profile.name}
        - Age: ${profile.age}
        - Monthly Income: ₹${(profile.annualIncome / 12).toLocaleString('en-IN')}
        - Monthly Savings for Investment: ₹${profile.monthlySavings.toLocaleString('en-IN')}
        - Financial Goals: ${profile.goals.join(', ')}
        - Calculated Risk Profile: ${profile.riskProfile}

        Task:
        Generate a diversified investment portfolio. For each recommended asset class:
        1.  Provide a clear percentage allocation. The total must sum to 100%.
        2.  Provide a simple, relatable rationale for why it fits the user's profile and current market conditions, referencing your search findings if applicable.
        3.  List specific and concrete examples of suitable instruments available in India.

        Investment Options to Consider (use a mix based on risk profile):
        -   **Equity Mutual Funds:** Specify the type (e.g., Nifty 50 Index Fund, Flexi-cap Fund, ELSS Tax Saver Fund). Provide popular real-world examples.
        -   **Debt Instruments:** Include options like Public Provident Fund (PPF), Fixed Deposits (FDs), and Government Bonds.
        -   **Gold:** Suggest investment via "Sovereign Gold Bonds (SGBs)" or "Gold ETFs".
        -   **Real Estate:** Suggest "Real Estate Investment Trusts (REITs)" for smaller investments. Give examples.
        -   **Cryptocurrency (High Risk):** For **Aggressive** profiles ONLY, allocate a very small percentage (1-5%). Include a strong risk warning.
        -   **Emergency Fund:** Suggest a "Liquid Fund" or "High-Yield Savings Account".

        Your response format MUST be a valid JSON array of objects.
        CRITICAL: Your entire response must be ONLY the raw JSON array, starting with \`[\` and ending with \`]\`. Do not include \`\`\`json markdown wrappers or any other explanatory text.

        The structure for each object in the array must be:
        {
            "assetClass": "string",
            "allocationPercentage": "number",
            "rationale": "string",
            "suitableInstruments": ["string", "string", ...]
        }
    `;

    try {
        const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
                temperature: 0.5,
                maxOutputTokens: 2048,
                thinkingConfig: { thinkingBudget: 512 },
            },
        }));
        
        let jsonText = response.text.trim();
        // The model might wrap the JSON in markdown, so we extract it.
        const jsonMatch = jsonText.match(/```(?:json)?\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
            jsonText = jsonMatch[1];
        }

        const recommendations = JSON.parse(jsonText);
        
        if (Array.isArray(recommendations)) {
            return { recommendations: recommendations as InvestmentRecommendation[] };
        }
        throw new Error("Invalid response format from Gemini API");

    } catch (error) {
        console.error("Error fetching investment recommendations:", error);
        if (error instanceof SyntaxError) {
             throw new Error("The AI returned a non-JSON response. Please try again.");
        }
        throw new Error("The AI is experiencing high demand and could not generate recommendations. Please try again in a moment.");
    }
};

export const getPlanSummary = async (profile: UserFinancialProfile, recommendations: InvestmentRecommendation[]): Promise<string[]> => {
    const recommendationsText = recommendations.map(r => `- ${r.assetClass}: ${r.allocationPercentage}%`).join('\n');
    const prompt = `
        You are an expert financial advisor with a talent for clear and encouraging communication.
        A user has just received a personalized investment plan. Your task is to provide 2-3 key insights that summarize the plan's strategy in simple terms.

        User Profile:
        - Risk Profile: ${profile.riskProfile}
        - Key Goal: ${profile.goals[0] || 'long-term growth'}

        Generated Plan:
        ${recommendationsText}

        Task:
        Generate a JSON object with a key "insights" containing an array of 2-3 strings. Each string should be a single, encouraging bullet point.
        - Start each insight with a positive framing (e.g., "This plan smartly balances...", "Your portfolio is well-positioned for...", "By focusing on...").
        - Connect the strategy to the user's risk profile (e.g., for an Aggressive profile, mention growth potential; for Conservative, mention stability).
        - Keep the language simple and jargon-free.
    `;

    try {
        const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: planSummarySchema,
                temperature: 0.4,
            }
        }));

        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return parsed.insights as string[];
    } catch (error) {
        console.error("Error fetching plan summary:", error);
        // Return a generic fallback insight
        return ["This balanced plan is designed to help you achieve your financial goals over time."];
    }
};


export const getVisualEducationalContent = async (history: { sender: 'user' | 'bot', content: string | VisualLearningContent }[]): Promise<VisualLearningContent> => {
    const userQuery = history.filter(m => m.sender === 'user').slice(-1)[0].content as string;
    const cacheKey = `learn:${userQuery}`;

    if (contentCache.has(cacheKey)) {
        return contentCache.get(cacheKey)!;
    }

    const promise = (async (): Promise<VisualLearningContent> => {
        const prompt = `
            You are a financial literacy educator who excels at breaking down complex financial topics for young Indian professionals.
            The user wants to learn about: "${userQuery}".

            Based on their request, generate a structured, visually engaging response. The response must be tailored for a 25-year-old Indian who is new to investing.
            Use a friendly, encouraging tone and a relatable Indian analogy (e.g., comparing SIPs to a tiffin service subscription). Avoid jargon or explain it simply.
            Your response must include a list of 2-3 common frequently asked questions (FAQs) with simple answers.
            Crucially, also provide a short, descriptive prompt for a simple, metaphorical, and illustrative image that visually represents the topic in a clean, modern, vector style.
        `;
        
        try {
            const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: visualLearningContentSchema,
                    maxOutputTokens: 1024,
                    thinkingConfig: { thinkingBudget: 256 },
                }
            }));
            const jsonText = response.text.trim();
            return JSON.parse(jsonText) as VisualLearningContent;
        } catch (error) {
            contentCache.delete(cacheKey);
            console.error("Error fetching visual educational content:", error);
            throw new Error("Our AI is experiencing high traffic. Please try again shortly.");
        }
    })();
    
    contentCache.set(cacheKey, promise);
    return promise;
};

export const getSimplerEducationalContent = async (originalContent: VisualLearningContent): Promise<VisualLearningContent> => {
    const cacheKey = `simplify:${originalContent.topic}`;

    if (contentCache.has(cacheKey)) {
        return contentCache.get(cacheKey)!;
    }

    const promise = (async (): Promise<VisualLearningContent> => {
        const prompt = `
            You are a master financial educator renowned for making complex topics incredibly simple for absolute beginners.
            A user found the following explanation of "${originalContent.topic}" confusing.

            Original confusing explanation:
            - Explanation: ${originalContent.explanation}
            - Analogy: ${originalContent.analogy}
            - Key Takeaways: ${originalContent.keyTakeaways.join('; ')}
            - Actionable Tip: ${originalContent.actionableTip}

            Your task is to re-explain this topic in a much simpler, more detailed, and friendlier way. Break it down even further. Use an even more basic, relatable analogy for a young Indian professional. Make the key takeaways and actionable tip extremely clear and direct. Assume zero prior knowledge.
            The response must also include 2-3 very simple FAQs with easy-to-understand answers.
            Crucially, also provide a new, even simpler descriptive prompt for a metaphorical image that represents the topic.
        `;

        try {
            const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: visualLearningContentSchema,
                    maxOutputTokens: 1024,
                    thinkingConfig: { thinkingBudget: 256 },
                }
            }));
            const jsonText = response.text.trim();
            return JSON.parse(jsonText) as VisualLearningContent;
        } catch (error) {
            contentCache.delete(cacheKey);
            console.error("Error fetching simpler educational content:", error);
            throw new Error("Our AI is currently busy and couldn't simplify the content. Please try again.");
        }
    })();
    
    contentCache.set(cacheKey, promise);
    return promise;
};

export const getChatbotResponse = async (history: { sender: 'user' | 'bot', text: string }[]): Promise<string> => {
    const formattedHistory = history.map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`).join('\n');

    const prompt = `
        You are the "Allen Venture Assistant", a friendly, empathetic, and encouraging AI guide for a financial advisory app called Allen Venture.
        Your persona is that of a knowledgeable, approachable, and supportive friend who's great with money. Your goal is to make finance feel less intimidating for young Indian professionals (age 22-35) who are new to investing.

        Core Instructions:
        1.  **Empathetic & Encouraging Tone:** Always be positive and validate the user's questions. Start responses with phrases like "That's a really great question!", "It's super smart that you're thinking about this.", "I can definitely help clear that up!", or "Let's break that down together."
        2.  **Simple & Relatable Language:** Explain concepts clearly and concisely (2-4 sentences is ideal). Avoid jargon. If you must use a technical term, explain it immediately in a simple way. Use analogies related to Indian contexts, like chai expenses, OTT subscriptions (Hotstar, Zomato Gold), or saving for a trip to Goa.
        3.  **Use Emojis:** Sprinkle in relevant emojis (like 👍, 💡, 📈, 💰, ✅) to maintain a friendly, modern, and engaging tone.
        4.  **Stay on Topic:** Gently guide the conversation back to finance if the user strays too far off-topic.
        5.  **Use Search for Current Info:** If a user's question seems to require real-time or very recent information (e.g., 'What are the latest repo rates?', 'How did the stock market perform today?'), use your search tool. Do not show any URLs or citation markers like [1].
        6.  **CRITICAL DISCLAIMER:** Your role is purely educational. You MUST NOT give personalized financial advice ("you should do X"). End EVERY single response with a clear, friendly disclaimer.
            - Good Example: "Remember, this is just for informational purposes! For advice tailored to your specific situation, it's always best to chat with a SEBI-registered financial advisor. 👍"
            - Another Good Example: "Just a heads-up, I'm an AI, so this isn't official financial advice. A human expert can help you with your personal goals! ✅"

        Current conversation:
        ${formattedHistory}
        Assistant:
    `;

    try {
        const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
                temperature: 0.7,
                maxOutputTokens: 512,
                thinkingConfig: { thinkingBudget: 128 },
            }
        }));
        
        return response.text.replace(/\[\d+\]/g, '').trim();
    } catch (error) {
        console.error("Error fetching chatbot response:", error);
        throw new Error("I'm experiencing a lot of traffic right now! Please try asking again in a moment. 🤖");
    }
};

export const getLearningChatResponse = async (
    history: { sender: 'user' | 'bot', text: string }[],
    context: VisualLearningContent
): Promise<string> => {
    const formattedHistory = history.map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`).join('\n');

    const prompt = `
        You are the "Allen Venture Assistant", a friendly, expert financial educator.
        You are helping a user understand a specific financial topic.
        Use ONLY the information provided below in the "TOPIC CONTEXT" to answer the user's question. Do not use outside knowledge or your search tool. If the question cannot be answered from the context, politely say so and suggest asking a more general question.

        **TOPIC CONTEXT:**
        - Topic: ${context.topic}
        - Explanation: ${context.explanation}
        - Key Takeaways: ${context.keyTakeaways.join('; ')}
        - Analogy: ${context.analogy}
        - Actionable Tip: ${context.actionableTip}
        - FAQs: ${context.faqs.map(f => `Q: ${f.question} A: ${f.answer}`).join('\n')}

        **INSTRUCTIONS:**
        1.  **Stay Focused:** Answer the user's question directly based on the context above.
        2.  **Simple & Clear:** Keep your language simple, clear, and encouraging.
        3.  **Use Emojis:** Add relevant emojis (💡, ✅, 👍) to maintain a friendly tone.
        4.  **Disclaimer:** As always, end EVERY response with the standard disclaimer: "Remember, this is just for informational purposes! For advice tailored to your specific situation, it's always best to chat with a SEBI-registered financial advisor. 👍"

        Current conversation:
        ${formattedHistory}
        Assistant:
    `;

    try {
        const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.6,
                maxOutputTokens: 512,
                thinkingConfig: { thinkingBudget: 128 },
            }
        }));
        
        return response.text.trim();
    } catch (error) {
        console.error("Error fetching learning chat response:", error);
        throw new Error("I'm having a little trouble thinking right now! Please try asking again in a moment. 🤖");
    }
};

export const generateImageFromPrompt = async (prompt: string): Promise<string> => {
    const cacheKey = `image:${prompt}`;

    if (contentCache.has(cacheKey)) {
        return contentCache.get(cacheKey)!;
    }

    const promise = (async (): Promise<string> => {
        try {
            const response: GenerateImagesResponse = await withRetry(() => ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: `${prompt}, vector art, simple, clean, financial concept`,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '16:9',
                },
            }));

            if (response.generatedImages && response.generatedImages.length > 0) {
                const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
                return `data:image/jpeg;base64,${base64ImageBytes}`;
            }
            throw new Error("No image was generated.");

        } catch (error) {
            contentCache.delete(cacheKey);
            console.error("Error generating image:", error);
            throw new Error("The AI image generator is busy. Could not create an illustration.");
        }
    })();

    contentCache.set(cacheKey, promise);
    return promise;
};

export const getInstrumentDetails = async (instrumentName: string, userProfile: UserFinancialProfile): Promise<InstrumentDetails> => {
    const cacheKey = `details:${instrumentName}`;

    if (contentCache.has(cacheKey)) {
        return contentCache.get(cacheKey)!;
    }

    const promise = (async (): Promise<InstrumentDetails> => {
        const prompt = `
            You are a financial educator for young Indian investors. The user, ${userProfile.name}, who has a ${userProfile.riskProfile} risk profile, wants to know more about a specific financial instrument.

            Instrument Name: "${instrumentName}"

            Task:
            Provide a simple, clear, and concise breakdown of this instrument, suitable for a beginner. Your response must follow the specified JSON schema.
            1.  **name**: The name of the instrument.
            2.  **introduction**: A 2-3 sentence paragraph explaining what it is. Keep the tone encouraging and easy to understand.
            3.  **keyFeatures**: A list of 3-4 crucial bullet points highlighting its main features. Examples include risk level, tax benefits, lock-in period, or who it's best suited for.
            4.  **typicalReturnRate**: A realistic, estimated average annual return rate as a single number. 
                - For government schemes (like PPF, SGBs), use the current or recent historical rate.
                - For market-linked equity instruments (like Index Funds, Flexi-cap), use a conservative long-term average (e.g., 10-14).
                - For REITs, use a moderate estimate (e.g., 7-9).
                - For Gold, use a long-term inflation-adjusted estimate (e.g., 5-7).
                - For FDs, use a typical current rate from major banks (e.g., 6-7).
                - For Cryptocurrency, use a high but cautious number and emphasize risk in the features (e.g., 20-25).
        `;

        try {
            const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: instrumentDetailsSchema,
                    maxOutputTokens: 1024,
                    thinkingConfig: { thinkingBudget: 256 },
                }
            }));
            const jsonText = response.text.trim();
            return JSON.parse(jsonText) as InstrumentDetails;
        } catch (error) {
            contentCache.delete(cacheKey);
            console.error(`Error fetching details for ${instrumentName}:`, error);
            throw new Error(`Our AI is facing high traffic while fetching details for ${instrumentName}. Please try again shortly.`);
        }
    })();

    contentCache.set(cacheKey, promise);
    return promise;
};

export const getInstrumentChatResponse = async (
    history: { sender: 'user' | 'bot', text: string }[],
    instrumentContext: string,
    assetClass: string,
    rationale: string
): Promise<string> => {
    const formattedHistory = history.map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`).join('\n');

    const prompt = `
        You are the "Allen Venture Assistant", a friendly, empathetic, and specialized AI guide for a financial advisory app.
        Your persona is that of a knowledgeable, approachable, and supportive friend who's great with money. Your goal is to make finance feel less intimidating for young Indian professionals.

        The user is currently viewing their personalized investment plan and has a question about a specific recommendation.

        **Context of the Query:**
        - Asset Class: "${assetClass}"
        - Specific Instrument Context: "${instrumentContext}"
        - Rationale for Recommendation: "${rationale}"

        **Core Instructions:**
        1.  **Answer Directly & Stay Focused:** Your primary goal is to answer the user's question about the provided financial instrument or asset class. Use the context above to tailor your response.
        2.  **Use Search for Current Info:** If the user asks about recent performance, news, or any up-to-date information, use your search tool to find the answer. Do not show any URLs or citation markers like [1].
        3.  **Empathetic & Encouraging Tone:** Always be positive. Start responses with phrases like "That's a great question about ${assetClass}!", "Let's dive into that.", or "I can definitely clarify that for you."
        4.  **Simple & Relatable Language:** Explain concepts clearly and concisely (2-4 sentences is ideal). Avoid jargon. If you must use a technical term, explain it immediately in a simple way. Use analogies related to Indian contexts.
        5.  **Use Emojis:** Sprinkle in relevant emojis (like 💡, 📈, 💰, ✅) to maintain a friendly, modern, and engaging tone.
        6.  **CRITICAL DISCLAIMER:** Your role is purely educational. You MUST NOT give personalized financial advice ("you should do X"). End EVERY single response with a clear, friendly disclaimer.
            - Good Example: "Remember, this is just for informational purposes! For advice tailored to your specific situation, it's always best to chat with a SEBI-registered financial advisor. 👍"

        Current conversation about this instrument:
        ${formattedHistory}
        Assistant:
    `;

    try {
        const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
                temperature: 0.7,
                maxOutputTokens: 512,
                thinkingConfig: { thinkingBudget: 128 },
            }
        }));
        
        return response.text.replace(/\[\d+\]/g, '').trim();
    } catch (error) {
        console.error("Error fetching instrument chat response:", error);
        throw new Error("I'm experiencing a lot of traffic right now! Please try asking again in a moment. 🤖");
    }
};

export const getRecommendedTopics = async (profile: UserFinancialProfile): Promise<RecommendedTopic[]> => {
    const availableTopics = [
        { name: 'The Power of Compounding', icon: 'CompoundingIcon' },
        { name: 'Systematic Investment Plan (SIP)', icon: 'SipIcon' },
        { name: 'Mutual Funds', icon: 'MutualFundsIcon' },
        { name: 'Asset Allocation', icon: 'AssetAllocationIcon' },
        { name: 'Tax Saving (ELSS)', icon: 'TaxSavingIcon' },
        { name: 'Public Provident Fund (PPF)', icon: 'PpfIcon' },
    ];
    const prompt = `
        You are an AI financial coach. A user has provided their financial profile. Your task is to recommend the 3 most relevant financial learning topics for them from a predefined list.

        User Profile:
        - Risk Profile: ${profile.riskProfile}
        - Financial Goals: ${profile.goals.join(', ')}

        Available Topics:
        ${availableTopics.map(t => `- ${t.name}`).join('\n')}

        Task:
        Select the 3 most suitable topics for this user. For each topic, provide a short, personalized reason (max 15 words) explaining why it's a good starting point for them.
        For example, if the user has an Aggressive profile, "Asset Allocation" is a good recommendation. If their goal is long-term, "The Power of Compounding" is highly relevant. If they are new, "SIP" is fundamental.

        Your response must be a valid JSON array of objects, with each object containing "title", "reason", and the corresponding "iconName" from the provided list.
    `;
    try {
        const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recommendedTopicsSchema,
                temperature: 0.3,
            }
        }));
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as RecommendedTopic[];
    } catch (error) {
        console.error("Error fetching recommended topics:", error);
        return []; // Return empty array on error
    }
};

export const getQuizForTopic = async (topic: string, context: string): Promise<Quiz> => {
    const cacheKey = `quiz:${topic}`;
    if (contentCache.has(cacheKey)) {
        return contentCache.get(cacheKey)!;
    }

    const promise = (async (): Promise<Quiz> => {
        const prompt = `
            You are an expert quiz creator for financial literacy.
            A user has just learned about the topic: "${topic}".
            
            Here is the content they read:
            "${context}"

            Task:
            Create a short, engaging 3-question multiple-choice quiz based ONLY on the provided content. The questions should test the key concepts from the text.
            - Each question must have exactly 4 options.
            - Exactly one option must be correct.
            - Provide a brief (1-2 sentence) explanation for the correct answer.

            Your response MUST be in the specified JSON format.
        `;
        try {
            const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: quizSchema,
                }
            }));
            const jsonText = response.text.trim();
            return JSON.parse(jsonText) as Quiz;
        } catch (error) {
            contentCache.delete(cacheKey);
            console.error("Error fetching quiz:", error);
            throw new Error(`Could not generate a quiz for ${topic}. Please try again.`);
        }
    })();

    contentCache.set(cacheKey, promise);
    return promise;
};

export const generateAspirationalImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    const fullPrompt = `User's goal: "${prompt}". Edit the user's photo to creatively visualize this goal. The person in the photo should be clearly visible and central to the theme. Also, subtly and naturally place the 'Allen Venture' brand logo somewhere in the image, like on a book, a laptop screen, or a small sign. The final image should be inspirational and high-quality.`;

    try {
        const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: fullPrompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        }));

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        throw new Error("The AI did not return an image. It might have responded with text only.");

    } catch (error) {
        console.error("Error generating aspirational image:", error);
        throw new Error("The AI image generator is currently busy. Please try again in a moment.");
    }
};

export const getBudgetAnalysisInsights = async (profile: UserFinancialProfile, transactions: Transaction[]): Promise<BudgetAnalysisResponse> => {
    const cacheKey = `budget:${profile.name}`;
    if (contentCache.has(cacheKey)) {
        return contentCache.get(cacheKey)!;
    }
    
    const promise = (async (): Promise<BudgetAnalysisResponse> => {
        const monthlyIncome = profile.annualIncome / 12;
        const needsTotal = transactions.filter(t => t.category === 'Needs').reduce((acc, t) => acc + t.amount, 0);
        const wantsTotal = transactions.filter(t => t.category === 'Wants').reduce((acc, t) => acc + t.amount, 0);
        const savingsTotal = profile.monthlySavings;

        const needsPct = (needsTotal / monthlyIncome) * 100;
        const wantsPct = (wantsTotal / monthlyIncome) * 100;
        const savingsPct = (savingsTotal / monthlyIncome) * 100;

        const prompt = `
            You are an AI Financial Coach named Allen. Your tone is encouraging, friendly, and helpful. You are analyzing the monthly budget of a young professional in India.

            User's Profile:
            - Monthly Income: ₹${monthlyIncome.toFixed(0)}

            This Month's Spending Breakdown:
            - Needs: ₹${needsTotal.toFixed(0)} (${needsPct.toFixed(1)}%)
            - Wants: ₹${wantsTotal.toFixed(0)} (${wantsPct.toFixed(1)}%)
            - Savings: ₹${savingsTotal.toFixed(0)} (${savingsPct.toFixed(1)}%)

            Your Task:
            Analyze this budget using the 50/30/20 rule (50% Needs, 30% Wants, 20% Savings).
            1.  Provide a brief, positive, and encouraging 'overallFeedback' (1-2 sentences).
            2.  Identify the 2-3 most important areas for improvement and create a list of 'insights'.
            3.  For each insight, provide a 'category', a 'message' (what you observe), and a friendly, actionable 'suggestion'.
            
            Example Suggestion: "Try the 'cool-off' rule: wait 24 hours before making a non-essential purchase over ₹1000. It's a great way to curb impulse buys!"
            Keep all text concise and easy to understand for a beginner.
        `;

        try {
            const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: budgetAnalysisSchema,
                    temperature: 0.5,
                }
            }));
            const jsonText = response.text.trim();
            return JSON.parse(jsonText) as BudgetAnalysisResponse;
        } catch (error) {
            contentCache.delete(cacheKey);
            console.error("Error fetching budget analysis insights:", error);
            throw new Error("Our AI is currently busy and couldn't analyze the budget. Please try again.");
        }
    })();
    
    contentCache.set(cacheKey, promise);
    return promise;
};
