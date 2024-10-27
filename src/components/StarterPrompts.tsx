import React from 'react';
import { STARTER_PROMPTS } from '../config/constants';
import { TrendingUp, ChevronRight } from 'lucide-react';

interface StarterPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

export default function StarterPrompts({ onSelectPrompt }: StarterPromptsProps) {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
            <TrendingUp size={32} className="text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Terminal of Trade AI
        </h2>
        <p className="text-slate-400">Advanced Trading Analysis & Market Intelligence</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STARTER_PROMPTS.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(prompt)}
            className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all duration-200 text-left border border-slate-700 hover:border-blue-500 group shadow-lg hover:shadow-xl shadow-slate-900/50"
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-100">{prompt}</span>
              <ChevronRight size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}