import React, { useState, useEffect } from 'react';
import { Code2, Table, Info, Zap, Globe, BookOpen } from 'lucide-react';
import CodeEditor from './components/CodeEditor';
import SymbolTable from './components/SymbolTable';
import LanguageSelector from './components/LanguageSelector';
import { parseCode } from './utils/parser';
import type { Symbol, SupportedLanguage } from './types/symbol';
import { languageConfigs } from './utils/languageConfigs';

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('javascript');
  const [code, setCode] = useState('');
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Update code when language changes
  useEffect(() => {
    setCode('');
  }, [selectedLanguage]);

  useEffect(() => {
    const analyzeCode = () => {
      setIsAnalyzing(true);
      // Simulate analysis delay for better UX
      setTimeout(() => {
        const parsedSymbols = parseCode(code, selectedLanguage);
        setSymbols(parsedSymbols);
        setIsAnalyzing(false);
      }, 300);
    };

    analyzeCode();
  }, [code, selectedLanguage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Multi-Language Symbol Table Generator</h1>
              <p className="text-slate-400 text-sm">Understand how compilers analyze code across different programming languages</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Language Selector */}
        <div className="mb-8 max-w-xs">
          <LanguageSelector 
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Code Input Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Code2 className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold">Source Code</h2>
              <div className="group relative">
                <Info className="w-4 h-4 text-slate-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20">
                  Enter JavaScript-like code with variables and functions
                </div>
              </div>
            </div>
            <CodeEditor 
              value={code} 
              onChange={setCode} 
              language={selectedLanguage}
            />
            
            {/* Stats */}
            <div className="flex gap-4 text-sm text-slate-400">
              <span>Lines: {code.split('\n').length}</span>
              <span>Characters: {code.length}</span>
              <span>Symbols: {symbols.length}</span>
              <span>Language: {languageConfigs[selectedLanguage].name}</span>
            </div>
          </div>

          {/* Symbol Table Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Table className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-semibold">Symbol Table</h2>
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-blue-400">
                  <Zap className="w-4 h-4 animate-pulse" />
                  <span className="text-sm">Analyzing...</span>
                </div>
              )}
            </div>
            <SymbolTable symbols={symbols} isLoading={isAnalyzing} />
          </div>
        </div>

        {/* Educational Content */}
        <div className="mt-12 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            How Symbol Tables Work Across Languages
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-slate-300">
            <div>
              <h4 className="font-semibold text-white mb-2">What is a Symbol Table?</h4>
              <p className="text-sm leading-relaxed">
                A symbol table is a data structure used by compilers to store information about 
                identifiers in your code. Every programming language uses symbol tables during 
                compilation or interpretation to track variables, functions, classes, and other symbols.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Information Tracked</h4>
              <ul className="text-sm space-y-1">
                <li><span className="text-blue-400">Name:</span> The identifier's name</li>
                <li><span className="text-green-400">Type:</span> Variable, Function, Class, etc.</li>
                <li><span className="text-orange-400">Data Type:</span> int, string, etc.</li>
                <li><span className="text-purple-400">Scope:</span> Where it's accessible</li>
                <li><span className="text-cyan-400">Line:</span> Where it's declared</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Language Differences</h4>
              <p className="text-sm leading-relaxed">
                Different languages have unique syntax and semantics. This tool demonstrates 
                how symbol tables adapt to handle language-specific features like Python's 
                dynamic typing, Java's access modifiers, or C++'s templates.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/80 border-t border-slate-700 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-slate-400">
          <p className="text-sm">
            Multi-Language Symbol Table Generator • Supporting {Object.keys(languageConfigs).length}+ Programming Languages
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;