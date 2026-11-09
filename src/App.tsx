import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { NewVerificationPage } from './pages/NewVerificationPage.tsx';
import { ProcessingPage } from './pages/ProcessingPage.tsx';
import { ResultsPage } from './pages/ResultsPage.tsx';
import { HistoryPage } from './pages/HistoryPage.tsx';
import { ReportsPage } from './pages/ReportsPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { HelpAboutPage } from './pages/HelpAboutPage.tsx';

export default function App() {
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('trustx_theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-[#080D18] text-[#F3F7FC] flex flex-col font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/new-verification" element={<NewVerificationPage />} />
              <Route path="/processing" element={<ProcessingPage />} />
              <Route path="/results/:id" element={<ResultsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<HelpAboutPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
