import React, { useState } from 'react';

const Layout: React.FC<{ children: React.ReactNode; activeTab: 'home' | 'search'; onTabChange: (t: 'home' | 'search') => void }> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="min-h-screen bg-darkBg text-slate-200 font-sans selection:bg-twRed selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
             <div className="w-8 h-8 bg-twRed rounded flex items-center justify-center font-bold text-white">TW</div>
             <h1 className="text-xl font-bold text-white tracking-tight">勳-技術分析測試</h1>
          </div>
          
          <nav className="flex space-x-1">
            <button 
                onClick={() => onTabChange('home')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'home' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                策略推薦
            </button>
            <button 
                onClick={() => onTabChange('search')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'search' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                個股查詢
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 pb-20">
        {children}
      </main>
      
      {/* Mobile Floating Action Button (Optional visual aid) */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth'})} className="bg-twRed text-white p-3 rounded-full shadow-lg shadow-red-900/50">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
        </button>
      </div>
    </div>
  );
};

export default Layout;