import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import ResultsPage from './pages/ResultsPage';
import LearnPage from './pages/LearnPage';
import DashboardPage from './pages/DashboardPage';
import Header from './components/Header';
import Chatbot from './components/Chatbot';
import type { UserFinancialProfile, InvestmentRecommendation } from './types';
import ProjectDocumentPage from './pages/ProjectDocumentPage';
import AdminPage from './pages/AdminPage';

function App() {
  const [userProfile, setUserProfile] = useState<UserFinancialProfile | null>(() => {
    try {
        const storedProfile = localStorage.getItem('userProfile');
        return storedProfile ? JSON.parse(storedProfile) : null;
    } catch (error) {
        console.error("Failed to parse user profile from localStorage", error);
        return null;
    }
  });
  const [recommendations, setRecommendations] = useState<InvestmentRecommendation[] | null>(() => {
     try {
        const storedRecs = localStorage.getItem('recommendations');
        return storedRecs ? JSON.parse(storedRecs) : null;
    } catch (error) {
        console.error("Failed to parse recommendations from localStorage", error);
        return null;
    }
  });

  useEffect(() => {
    try {
        if (userProfile) {
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
        } else {
            localStorage.removeItem('userProfile');
        }
    } catch (error) {
        console.error("Failed to save user profile to localStorage", error);
    }
  }, [userProfile]);

  useEffect(() => {
     try {
        if (recommendations) {
            localStorage.setItem('recommendations', JSON.stringify(recommendations));
        } else {
            localStorage.removeItem('recommendations');
        }
    } catch (error) {
        console.error("Failed to save recommendations to localStorage", error);
    }
  }, [recommendations]);


  const handleAssessmentComplete = useCallback((profile: UserFinancialProfile, recs: InvestmentRecommendation[]) => {
    setUserProfile(profile);
    setRecommendations(recs);
  }, []);

  const handleProfileUpdate = useCallback((updatedProfileFields: Partial<UserFinancialProfile>) => {
    setUserProfile(currentProfile => {
        if (!currentProfile) return null;
        return { ...currentProfile, ...updatedProfileFields };
    });
  }, []);

  const handleProfileReset = useCallback(() => {
    setUserProfile(null);
    setRecommendations(null);
    localStorage.removeItem('userProfile');
    localStorage.removeItem('recommendations');
  }, []);

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
        <Header />
        <main className="p-4 sm:p-6 md:p-8">
          <Routes>
            <Route 
              path="/" 
              element={
                <DashboardPage 
                  userProfile={userProfile} 
                  recommendations={recommendations}
                  onComplete={handleAssessmentComplete}
                  onReset={handleProfileReset}
                  onUpdateProfile={handleProfileUpdate}
                />
              } 
            />
            <Route 
              path="/results" 
              element={
                userProfile && recommendations ? (
                  <ResultsPage userProfile={userProfile} recommendations={recommendations} />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route path="/learn" element={<LearnPage userProfile={userProfile} />} />
            <Route path="/project-document" element={<ProjectDocumentPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Chatbot />
      </div>
    </HashRouter>
  );
}

export default App;