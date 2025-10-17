import React, { useState, useRef, useEffect } from 'react';
import { getChatbotResponse } from '../services/geminiService';
import { ChatBubbleOvalLeftEllipsisIcon, PaperAirplaneIcon, XMarkIcon } from './icons/Icons';

type Message = {
    sender: 'user' | 'bot';
    text: string;
};

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', text: "Hey there! I'm your Allen Venture Assistant. Think of me as your friendly guide to investing. It can all seem a bit much at first, but I'm here to help break things down. No question is too small! What's on your mind? 💡" }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleToggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        
        try {
            const botResponseText = await getChatbotResponse([...messages, userMessage]);
            const botMessage: Message = { sender: 'bot', text: botResponseText };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage: Message = { sender: 'bot', text: error instanceof Error ? error.message : "An unexpected error occurred." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Chat Window */}
            <div className={`fixed bottom-24 right-4 sm:right-6 md:right-8 w-[calc(100%-2rem)] max-w-sm h-[60vh] max-h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-20 origin-bottom-right transition-all duration-300 ease-in-out ${isOpen ? 'transform opacity-100 scale-100' : 'transform opacity-0 scale-95 pointer-events-none'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-t-2xl flex-shrink-0">
                    <h3 className="font-bold text-lg">Allen Venture Assistant</h3>
                    <button onClick={handleToggleChat} className="p-1 rounded-full hover:bg-blue-700 transition-colors" aria-label="Close chat">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in-up`} style={{ animationDuration: '0.3s' }}>
                                <div className={`max-w-[80%] p-3 rounded-xl ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-800'}`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%] p-3 rounded-xl bg-slate-200 text-slate-800">
                                    <div className="flex items-center space-x-2">
                                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white rounded-b-2xl">
                    <div className="flex items-center bg-slate-100 rounded-lg">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask a question..."
                            className="flex-1 p-3 bg-transparent border-none rounded-lg focus:ring-0 w-full"
                            disabled={isLoading}
                            aria-label="Chat input"
                        />
                        <button type="submit" disabled={!inputValue.trim() || isLoading} className="p-3 text-blue-600 disabled:text-slate-400 transition-colors" aria-label="Send message">
                            <PaperAirplaneIcon className="h-6 w-6" />
                        </button>
                    </div>
                </form>
            </div>

            {/* FAB */}
            <button
                onClick={handleToggleChat}
                className={`fixed bottom-4 right-4 sm:right-6 md:right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-20 transition-transform transform hover:scale-110 ${!isOpen ? 'animate-pulse-slow' : ''}`}
                aria-label="Open financial assistant chat"
            >
                <ChatBubbleOvalLeftEllipsisIcon className="h-7 w-7" />
            </button>
        </>
    );
};

export default Chatbot;