import React, { useState, useCallback, useRef } from 'react';
import { generateAspirationalImage } from '../services/geminiService';
import { SparklesIcon, XCircleIcon, ArrowPathIcon } from '../components/icons/Icons';

// Helper function to convert a File object to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // remove the "data:image/jpeg;base64," part
            resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};


const VisualizePage: React.FC = () => {
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [sourceImageFile, setSourceImageFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        if (!sourceImageFile || !prompt.trim()) {
            setError('Please upload an image and describe your goal.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const base64Data = await fileToBase64(sourceImageFile);
            const resultImageUrl = await generateAspirationalImage(base64Data, sourceImageFile.type, prompt);
            setGeneratedImage(resultImageUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [sourceImageFile, prompt]);
    
    const handleReset = () => {
        setSourceImage(null);
        setSourceImageFile(null);
        setPrompt('');
        setGeneratedImage(null);
        setError(null);
        setIsLoading(false);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const isGenerateDisabled = !sourceImageFile || !prompt.trim() || isLoading;

    return (
        <div className="container mx-auto max-w-5xl space-y-8">
            <div className="text-center animate-slide-in-up">
                <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Visualize Your Future</h1>
                <p className="text-lg text-slate-600 mt-3 max-w-3xl mx-auto">
                    Turn your financial goals into reality. Upload a photo, describe your dream, and let our AI create an inspirational image of your future.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left Column: Input and Controls */}
                <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in stagger-1" style={{opacity: 0}}>
                    <div className="space-y-6">
                        <div>
                            <label className="text-lg font-semibold text-slate-800 block mb-2">1. Upload Your Photo</label>
                            <div 
                                className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                                {sourceImage ? (
                                    <img src={sourceImage} alt="Uploaded preview" className="max-h-48 mx-auto rounded-md" />
                                ) : (
                                    <p className="text-slate-500">Click to upload or drag & drop</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="prompt" className="text-lg font-semibold text-slate-800 block mb-2">2. Describe Your Goal</label>
                            <textarea
                                id="prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., 'My dream vacation in Japan', 'Standing in front of my first home', 'Celebrating retirement on a sunny beach'"
                                rows={3}
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div>
                             <button
                                onClick={handleGenerate}
                                disabled={isGenerateDisabled}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-700 transition-all shadow-lg transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8
 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="h-6 w-6" />
                                        Visualize My Future
                                    </>
                                )}
                            </button>
                            {sourceImageFile && (
                                <button onClick={handleReset} className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-slate-600 font-semibold hover:text-slate-800">
                                    <ArrowPathIcon className="h-4 w-4" />
                                    Start Over
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Output */}
                <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in stagger-2" style={{opacity: 0}}>
                     <h2 className="text-lg font-semibold text-slate-800 mb-4 text-center">Your Generated Image</h2>
                     <div className="relative w-full aspect-square bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">
                        {isLoading && (
                             <div className="w-full h-full bg-slate-200 animate-pulse"></div>
                        )}
                        {error && !isLoading && (
                            <div className="p-4 text-center">
                                <XCircleIcon className="h-10 w-10 text-red-400 mx-auto mb-2" />
                                <p className="text-red-600 font-semibold">Generation Failed</p>
                                <p className="text-sm text-slate-600 mt-1">{error}</p>
                            </div>
                        )}
                        {generatedImage && !isLoading && (
                            <img src={generatedImage} alt="AI generated aspirational" className="w-full h-full object-cover animate-fade-in" />
                        )}
                        {!generatedImage && !isLoading && !error && (
                            <p className="text-slate-500">Your vision will appear here</p>
                        )}
                     </div>
                      <div className="text-xs text-slate-500 mt-3 text-center">
                         <p>AI image generation is experimental. Results may vary. Feel free to try again with a different prompt for a new result!</p>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default VisualizePage;
