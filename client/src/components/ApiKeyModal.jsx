import React, { useState, useEffect } from 'react';
import { Key, Sparkles, Check, X, ShieldAlert } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(localStorage.getItem('openai_api_key') || '');
      setSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openai_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('openai_api_key');
    }
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey('');
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-left">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">OpenAI API Key Settings</h3>
            <p className="text-xs text-slate-400">Power AI writing suggestions with your OpenAI credentials</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 mb-4 leading-relaxed flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <span>
            <strong>Smart Built-in Fallback Active:</strong> If no OpenAI key is supplied or your key runs out of quota, NovaBlog automatically uses its offline generative engine so all AI tools continue working flawlessly.
          </span>
        </div>

        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Your OpenAI Key (sk-...):
        </label>
        <input
          type="password"
          placeholder="sk-proj-..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono mb-2"
        />
        <p className="text-[11px] text-slate-500 mb-6">
          Your key is saved locally in your browser storage and never stored on third-party servers.
        </p>

        {saved && (
          <div className="mb-4 text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4" /> Preferences saved successfully!
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleClear}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
          >
            Clear Key (Use Fallback)
          </button>
          
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            Save Key
          </button>
        </div>

      </div>
    </div>
  );
}
