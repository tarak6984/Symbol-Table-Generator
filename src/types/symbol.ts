export interface Symbol {
  name: string;
  type: 'variable' | 'function' | 'class' | 'method' | 'parameter' | 'constant' | 'import' | 'builtin' | 'property' | 'constructor';
  scope: string;
  line: number;
  dataType?: string;
  language: string;
  description?: string;
}

export type SupportedLanguage = 'javascript' | 'python' | 'java' | 'c' | 'cpp' | 'csharp' | 'go' | 'rust';

export interface LanguageConfig {
  name: string;
  extension: string;
  example: string;
  keywords: string[];
}