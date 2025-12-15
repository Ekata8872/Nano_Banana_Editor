import React from 'react';
import { MagicWandIcon } from './Icons';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = "Processing..." }) => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl transition-all duration-300">
      <div className="relative">
        <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-20 animate-pulse"></div>
        <MagicWandIcon className="w-12 h-12 text-yellow-400 animate-bounce relative z-10" />
      </div>
      <p className="mt-6 text-xl font-bold text-yellow-100 animate-pulse tracking-wide text-center px-4 drop-shadow-md">
        {message}
      </p>
    </div>
  );
};