import React, { useState, useRef, useCallback } from 'react';
import { ImageData, AppState } from '../types';
import { editImageWithGemini } from '../services/gemini';
import { LoadingOverlay } from './LoadingOverlay';
import { DownloadIcon, MagicWandIcon, PhotoIcon, UploadIcon, XMarkIcon } from './Icons';

const SUGGESTED_PROMPTS = [
  "Add a retro filter",
  "Turn this into a sketch",
  "Make it look like a cyberpunk city",
  "Remove the person in the background",
  "Change the sky to sunset",
  "Add a banana hat to the subject"
];

const LOADING_MESSAGES = [
  "Peeling pixels...",
  "Injecting high levels of potassium...",
  "Consulting the Monkey Council...",
  "Ripening your image...",
  "Splitting the difference...",
  "Going bananas on the GPU...",
  "Synthesizing sweet vibes..."
];

export const BananaEditor: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [sourceImage, setSourceImage] = useState<ImageData | null>(null);
  const [resultImage, setResultImage] = useState<ImageData | null>(null);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState("Processing...");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getRandomLoadingMessage = () => {
    return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Hey! That's not a photo. I only eat images (PNG, JPG).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit check
       setError("Whoa, that file is huge! Keep it under 10MB, please.");
       return;
    }

    setAppState(AppState.UPLOADING);
    setError(null);
    setResultImage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // split base64 string to get content type and raw data
      const parts = result.split(',');
      const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
      const base64 = parts[1];

      setSourceImage({
        url: result,
        base64,
        mimeType
      });
      setAppState(AppState.IDLE);
    };
    reader.onerror = () => {
      setError("Oops! Dropped the file. Try picking it again.");
      setAppState(AppState.IDLE);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!sourceImage || !prompt.trim()) return;

    setLoadingMsg(getRandomLoadingMessage());
    setAppState(AppState.GENERATING);
    setError(null);

    try {
      const newImage = await editImageWithGemini(sourceImage, prompt);
      setResultImage(newImage);
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      setError(err.message || "I slipped on a peel! Something went wrong generating the image.");
      setAppState(AppState.ERROR);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage.url;
    link.download = `nano-banana-fresh-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetEditor = () => {
    setSourceImage(null);
    setResultImage(null);
    setPrompt('');
    setAppState(AppState.IDLE);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onPromptKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 flex flex-col gap-6">
      
      {/* Upload Area (Visible if no image) */}
      {!sourceImage && (
        <div 
          className="border-2 border-dashed border-gray-700 bg-gray-900/50 hover:bg-gray-800/50 hover:border-yellow-400/50 transition-all rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer min-h-[400px] group relative overflow-hidden"
          onClick={() => fileInputRef.current?.click()}
        >
          {/* Subtle background flair */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <div className="bg-yellow-400/10 p-6 rounded-full group-hover:scale-110 group-hover:bg-yellow-400/20 group-hover:rotate-12 transition-all duration-300 mb-6 relative z-10">
            <UploadIcon className="w-12 h-12 text-yellow-400" />
          </div>
          <h3 className="text-3xl font-black text-white mb-3 tracking-tight relative z-10">Feed Nano a Photo!</h3>
          <p className="text-gray-400 text-center max-w-md text-lg relative z-10">
            Drop an image here to get started. <br/>
            <span className="text-yellow-400/70 text-sm italic">I promise I won't eat it.</span>
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
            accept="image/*"
          />
        </div>
      )}

      {/* Editor Interface (Visible if image exists) */}
      {sourceImage && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
             <button 
              onClick={resetEditor}
              className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors hover:bg-gray-800 px-3 py-1.5 rounded-lg"
             >
               <XMarkIcon className="w-5 h-5" /> Start Fresh
             </button>
             {appState === AppState.SUCCESS && (
               <button 
                 onClick={handleDownload}
                 className="bg-yellow-400 hover:bg-yellow-300 text-black px-5 py-2.5 rounded-xl font-black flex items-center gap-2 transition-all shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 hover:-translate-y-0.5"
               >
                 <DownloadIcon className="w-5 h-5" /> Save It!
               </button>
             )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Source Image */}
            <div className="relative group rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 aspect-square md:aspect-[4/3] shadow-2xl">
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-gray-300 z-10 border border-white/10">THE RAW MATERIAL</div>
              <img 
                src={sourceImage.url} 
                alt="Source" 
                className="w-full h-full object-contain"
              />
            </div>

            {/* Result Image */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 aspect-square md:aspect-[4/3] shadow-2xl flex items-center justify-center">
              <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-yellow-500 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-black z-10 shadow-lg">NANO'S MASTERPIECE</div>
              
              {resultImage ? (
                <img 
                  src={resultImage.url} 
                  alt="Generated" 
                  className="w-full h-full object-contain animate-in fade-in duration-700"
                />
              ) : (
                <div className="text-gray-600 flex flex-col items-center p-8 text-center">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <PhotoIcon className="w-10 h-10 opacity-30" />
                  </div>
                  <p className="text-xl font-medium text-gray-500">Waiting for inspiration...</p>
                  <p className="text-sm text-gray-600 mt-2">Tell me what to do below!</p>
                </div>
              )}

              {appState === AppState.GENERATING && <LoadingOverlay message={loadingMsg} />}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
             {/* Gradient glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none transition-opacity group-hover:bg-yellow-400/10"></div>

            <div className="flex flex-col gap-4 relative z-10">
              <label className="text-sm font-bold text-yellow-400 uppercase tracking-widest">Nano's Instructions</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={onPromptKeyDown}
                  placeholder="Tell me how to ripen this image... (e.g. 'Make it look 8-bit')"
                  className="flex-1 bg-black/40 border border-gray-700 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all font-medium"
                  disabled={appState === AppState.GENERATING}
                />
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || appState === AppState.GENERATING}
                  className="bg-yellow-400 text-black font-black rounded-xl px-8 py-4 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-yellow-400/10 hover:shadow-yellow-400/30 hover:scale-105 active:scale-95 whitespace-nowrap"
                >
                  {appState === AppState.GENERATING ? 'Cooking...' : (
                    <>
                      <MagicWandIcon className="w-6 h-6" />
                      GO BANANAS!
                    </>
                  )}
                </button>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap gap-2 mt-2">
                {SUGGESTED_PROMPTS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setPrompt(suggestion)}
                    className="text-xs font-medium bg-gray-800 hover:bg-gray-700 hover:text-yellow-200 text-gray-400 px-4 py-2 rounded-full transition-all border border-gray-700 hover:border-yellow-400/30"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              {error && (
                <div className="mt-4 text-red-200 text-sm bg-red-900/30 border border-red-500/30 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                  <span className="text-xl">🍌</span>
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};