import React from 'react';
import { Code, ChevronDown } from 'lucide-react';
import type { SupportedLanguage } from '../types/symbol';
import { languageConfigs } from '../utils/languageConfigs';

interface LanguageSelectorProps {
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
}) => {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 text-white mb-2">
        <Code className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-medium">Language</span>
      </div>
      
      <div className="relative">
        <select
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none cursor-pointer pr-8"
        >
          {Object.entries(languageConfigs).map(([key, config]) => (
            <option key={key} value={key}>
              {config.name}
            </option>
          ))}
        </select>
        
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
      
      <div className="mt-1 text-xs text-slate-400">
        File: example{languageConfigs[selectedLanguage].extension}
      </div>
    </div>
  );
};

export default LanguageSelector;