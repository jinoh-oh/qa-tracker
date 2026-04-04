import React, { useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import Dashboard from './pages/Dashboard'
import TestCaseView from './pages/TestCaseView'
import ScreenRuleView from './pages/ScreenRuleView'
import DefectTrackerView from './pages/DefectTrackerView'
import LoginView from './pages/LoginView'
import SettingsView from './pages/SettingsView'
import { AppProvider, AppContext } from './context/AppContext'

import { ArrowUp } from 'lucide-react';

function AppContent() {
  const { user, isLoaded } = useContext(AppContext);
  const mainRef = React.useRef(null);

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', flexDirection: 'column' }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #3182ce', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '16px', color: '#64748b', fontWeight: '500' }}>네트워크 데이터를 불러오는 중...</p>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // 추가 대비책
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <div className="main-content" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100vh' }}>
          <Header />
          <main ref={mainRef} style={{ padding: '24px', flex: 1, overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/module/SCREEN_RULE" element={<ScreenRuleView />} />
              <Route path="/defects" element={<DefectTrackerView />} />
              <Route path="/module/ADMIN" element={<SettingsView />} />
              <Route path="/settings" element={<SettingsView />} />
              <Route path="/module/:moduleName" element={<TestCaseView />} />
            </Routes>
            
            <button 
              onClick={scrollToTop}
              className="scroll-to-top-btn"
              style={{
                position: 'fixed',
                bottom: '40px',
                right: '40px',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                transition: 'transform 0.2s, background-color 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.backgroundColor = 'var(--primary-dark)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.backgroundColor = 'var(--primary)'; }}
              title="맨 위로 가기"
            >
              <ArrowUp size={24} />
            </button>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
