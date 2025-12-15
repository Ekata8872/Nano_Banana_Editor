import React from 'react';
import { BananaEditor } from './components/BananaEditor';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0f0f11] text-gray-200 selection:bg-yellow-400/30 selection:text-yellow-100">
      <header className="border-b border-gray-800 bg-[#0f0f11]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-black font-bold text-2xl shadow-lg shadow-yellow-400/20 rotate-3 hover:rotate-12 transition-transform duration-300 cursor-default">
               🍌
             </div>
             <div>
               <h1 className="font-black text-xl tracking-tight text-white leading-none">Nano Banana</h1>
               <p className="text-xs font-medium text-yellow-400/80 tracking-wide mt-0.5">High Potassium Intelligence</p>
             </div>
          </div>
          <div className="text-xs font-mono text-gray-600 hidden sm:block bg-gray-900 px-3 py-1.5 rounded-full border border-gray-800">
            Powered by gemini-2.5-flash-image
          </div>
        </div>
      </header>

      <main className="py-8">
        <BananaEditor />
      </main>

      <footer className="border-t border-gray-900 mt-auto py-12 text-center text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} Nano Banana Powered App.</p>
        <p className="mt-2 text-xs opacity-50">No actual bananas were harmed in the making of these pixels.</p>
      </footer>
    </div>
  );
};

export default App;