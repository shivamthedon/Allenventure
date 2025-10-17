import React, { useState, useEffect } from 'react';

const AdminPage: React.FC = () => {
    const [content, setContent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        fetch('http://localhost:3001/api/content')
            .then(res => res.json())
            .then(data => {
                setContent(data.learnPage);
                setIsLoading(false);
            })
            .catch(err => {
                setError('Failed to load content');
                setIsLoading(false);
            });
    }, []);

    const handleContentChange = (sectionIndex: number, field: string, value: string) => {
        const newContent = { ...content };
        newContent.sections[sectionIndex][field] = value;
        setContent(newContent);
    };

    const handleTitleChange = (value: string) => {
        const newContent = { ...content };
        newContent.title = value;
        setContent(newContent);
    };

    const handleSaveChanges = () => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        fetch('http://localhost:3001/api/content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ page: 'learnPage', content: content }),
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to save content');
                }
                return res.text();
            })
            .then(message => {
                setSuccess(message);
                setIsLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setIsLoading(false);
            });
    };

    return (
        <div className="container mx-auto max-w-5xl space-y-8 p-8">
            <h1 className="text-3xl font-bold text-slate-800">Admin - Edit Learn Page Content</h1>
            {isLoading && !content && <div className="text-center p-8">Loading...</div>}
            {error && <div className="text-center p-8 text-red-500">{error}</div>}
            {content && (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Page Title</label>
                        <input
                            type="text"
                            value={content.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>
                    {content.sections.map((section: any, index: number) => (
                        <div key={index} className="space-y-4 rounded-lg border border-slate-200 p-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Section Title</label>
                                <input
                                    type="text"
                                    value={section.title}
                                    onChange={(e) => handleContentChange(index, 'title', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Section Content</label>
                                <textarea
                                    value={section.content}
                                    onChange={(e) => handleContentChange(index, 'content', e.target.value)}
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex justify-end space-x-4">
                <button
                    onClick={handleSaveChanges}
                    disabled={isLoading}
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
            {success && <div className="text-center p-4 text-green-500 bg-green-50 rounded-lg">{success}</div>}
        </div>
    );
};

export default AdminPage;