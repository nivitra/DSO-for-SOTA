import React, { useState } from 'react';
import { PipelineDashboard } from './components/PipelineDashboard';
import { Documentation } from './components/Documentation';
import { BookOpen, Terminal } from 'lucide-react';
import { Logo } from './components/Logo';

type View = 'console' | 'docs';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('console');

  return (
    <div className="min-h-screen flex flex-col bg-aws-light text-aws-dark font-sans">
      {/* Global Header (AWS Style) */}
      <header className="bg-aws-nav text-white h-[50px] flex items-center justify-between px-4 shrink-0 z-50 shadow-md">
        <div className="flex items-center gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-auto flex items-center justify-center">
               <Logo className="h-full w-auto" />
            </div>
            <div className="h-6 w-px bg-slate-600 mx-1"></div>
            <span className="font-bold text-lg tracking-tight flex items-center gap-2">
              DSO 
              <span className="font-normal text-slate-300 text-sm bg-slate-700/50 px-1.5 py-0.5 rounded-sm border border-slate-600">Console</span>
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center h-full ml-6">
            <button 
              onClick={() => setCurrentView('console')}
              className={`h-[50px] px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                currentView === 'console' 
                  ? 'border-aws-orange text-white bg-[#16191f]' 
                  : 'border-transparent text-slate-300 hover:text-white hover:bg-[#35414d]'
              }`}
            >
              <Terminal size={14} />
              Pipeline
            </button>
            <button 
              onClick={() => setCurrentView('docs')}
              className={`h-[50px] px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                currentView === 'docs' 
                  ? 'border-aws-orange text-white bg-[#16191f]' 
                  : 'border-transparent text-slate-300 hover:text-white hover:bg-[#35414d]'
              }`}
            >
              <BookOpen size={14} />
              Documentation
            </button>
          </nav>
        </div>

        {/* Right Side: User / Branding */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex flex-col items-end leading-tight">
            <span className="font-bold text-slate-200">learnapart.online</span>
            <span className="text-[10px] text-aws-orange font-medium tracking-wider">ENTERPRISE</span>
          </div>
          <div className="h-6 w-px bg-slate-600"></div>
          <div className="flex items-center gap-2 text-slate-300">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-aws-orange to-red-600 flex items-center justify-center text-[10px] font-bold text-white border border-white/20">
              NS
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Shell */}
      <main className="flex-1 overflow-hidden relative">
        {currentView === 'console' ? <PipelineDashboard /> : <Documentation />}
      </main>
    </div>
  );
};

export default App;