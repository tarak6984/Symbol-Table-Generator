import type { Symbol, SupportedLanguage } from '../types/symbol';

export function parseCode(code: string, language: SupportedLanguage): Symbol[] {
  const symbols: Symbol[] = [];
  const lines = code.split('\n');
  let currentScope = 'global';
  const scopeStack: string[] = ['global'];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (!trimmedLine || isComment(trimmedLine, language)) {
      return;
    }

    // Parse based on language
    switch (language) {
      case 'javascript':
        parseJavaScript(trimmedLine, lineNumber, currentScope, scopeStack, symbols, language);
        break;
      case 'python':
        parsePython(trimmedLine, lineNumber, currentScope, scopeStack, symbols, language);
        break;
      case 'java':
        parseJava(trimmedLine, lineNumber, currentScope, scopeStack, symbols, language);
        break;
      case 'c':
        parseC(trimmedLine, lineNumber, currentScope, scopeStack, symbols, language);
        break;
      case 'cpp':
        parseCpp(trimmedLine, lineNumber, currentScope, scopeStack, symbols, language);
        break;
      case 'csharp':
        parseCSharp(trimmedLine, lineNumber, currentScope, scopeStack, symbols, language);
        break;
      case 'go':
        parseGo(trimmedLine, lineNumber, currentScope, scopeStack, symbols, language);
        break;
      case 'rust':
        parseRust(trimmedLine, lineNumber, currentScope, scopeStack, symbols, language);
        break;
    }

    // Update scope based on braces
    updateScope(trimmedLine, scopeStack, (newScope) => {
      currentScope = newScope;
    });
  });

  // Remove duplicates
  return removeDuplicates(symbols);
}

function isComment(line: string, language: SupportedLanguage): boolean {
  const commentPatterns: Record<SupportedLanguage, RegExp[]> = {
    javascript: [/^\/\//, /^\/\*/, /^\*/],
    python: [/^#/],
    java: [/^\/\//, /^\/\*/, /^\*/],
    c: [/^\/\//, /^\/\*/, /^\*/, /^#/],
    cpp: [/^\/\//, /^\/\*/, /^\*/, /^#/],
    csharp: [/^\/\//, /^\/\*/, /^\*/],
    go: [/^\/\//, /^\/\*/, /^\*/],
    rust: [/^\/\//, /^\/\*/, /^\*/]
  };

  return commentPatterns[language]?.some(pattern => pattern.test(line)) || false;
}

function parseJavaScript(line: string, lineNumber: number, scope: string, scopeStack: string[], symbols: Symbol[], language: string) {
  // Function declarations
  const functionMatch = line.match(/function\s+(\w+)\s*\(/);
  if (functionMatch) {
    addSymbol(symbols, functionMatch[1], 'function', scope, lineNumber, language);
    scopeStack.push(functionMatch[1]);
    return;
  }

  // Class declarations
  const classMatch = line.match(/class\s+(\w+)/);
  if (classMatch) {
    addSymbol(symbols, classMatch[1], 'class', scope, lineNumber, language);
    scopeStack.push(classMatch[1]);
    return;
  }

  // Variable declarations
  const variableMatch = line.match(/(?:let|const|var)\s+(\w+)/);
  if (variableMatch) {
    const type = line.includes('const') ? 'constant' : 'variable';
    addSymbol(symbols, variableMatch[1], type, scope, lineNumber, language);
    return;
  }

  // Import statements
  const importMatch = line.match(/import\s+(?:\{([^}]+)\}|\*\s+as\s+(\w+)|(\w+))/);
  if (importMatch) {
    const imported = importMatch[1] || importMatch[2] || importMatch[3];
    if (imported) {
      imported.split(',').forEach(name => {
        const cleanName = name.trim();
        if (cleanName) {
          addSymbol(symbols, cleanName, 'import', scope, lineNumber, language);
        }
      });
    }
  }
}

// Built-in Python functions and types
const PYTHON_BUILTINS = new Set([
  'abs', 'all', 'any', 'ascii', 'bin', 'bool', 'bytearray', 'bytes', 'callable', 'chr',
  'classmethod', 'compile', 'complex', 'delattr', 'dict', 'dir', 'divmod', 'enumerate',
  'eval', 'exec', 'filter', 'float', 'format', 'frozenset', 'getattr', 'globals', 'hasattr',
  'hash', 'help', 'hex', 'id', 'input', 'int', 'isinstance', 'issubclass', 'iter', 'len',
  'list', 'locals', 'map', 'max', 'memoryview', 'min', 'next', 'object', 'oct', 'open',
  'ord', 'pow', 'print', 'property', 'range', 'repr', 'reversed', 'round', 'set', 'setattr',
  'slice', 'sorted', 'staticmethod', 'str', 'sum', 'super', 'tuple', 'type', 'vars', 'zip',
  '__import__', 'None', 'True', 'False', 'NotImplemented', 'Ellipsis'
]);

function parsePython(line: string, lineNumber: number, scope: string, scopeStack: string[], symbols: Symbol[], language: string) {
  // Function definitions
  const functionMatch = line.match(/def\s+(\w+)\s*\(/);
  if (functionMatch) {
    addSymbol(symbols, functionMatch[1], 'function', scope, lineNumber, language);
    scopeStack.push(functionMatch[1]);
    return;
  }

  // Class definitions
  const classMatch = line.match(/class\s+(\w+)/);
  if (classMatch) {
    addSymbol(symbols, classMatch[1], 'class', scope, lineNumber, language);
    scopeStack.push(classMatch[1]);
    return;
  }

  // Variable assignments with type hints
  const typedVarMatch = line.match(/^(\w+)\s*:\s*(\w+)\s*(?:=\s*[^\s,]+)?/);
  if (typedVarMatch) {
    const varName = typedVarMatch[1];
    const varType = typedVarMatch[2];
    addSymbol(symbols, varName, 'variable', scope, lineNumber, language, varType);
    return;
  }

  // Simple variable assignments
  const variableMatch = line.match(/^(\w+)\s*=/);
  if (variableMatch && !line.includes('def ') && !line.includes('class ')) {
    const varName = variableMatch[1];
    // Don't add built-ins as variables
    if (!PYTHON_BUILTINS.has(varName)) {
      addSymbol(symbols, varName, 'variable', scope, lineNumber, language);
    }
    return;
  }

  // Function calls (to detect built-ins)
  const functionCallMatch = line.match(/(\w+)\s*\(/g);
  if (functionCallMatch) {
    functionCallMatch.forEach(match => {
      const funcName = match.split('(')[0].trim();
      if (PYTHON_BUILTINS.has(funcName) && !symbols.some(s => s.name === funcName)) {
        addSymbol(symbols, funcName, 'builtin', 'builtins', lineNumber, language, 'builtin_function_or_method');
      }
    });
  }

  // Import statements
  const importMatch = line.match(/(?:import\s+(\w+)|from\s+(\w+)\s+import\s+([^#\n]+))/);
  if (importMatch) {
    if (importMatch[1]) {
      // Simple import
      const moduleName = importMatch[1];
      addSymbol(symbols, moduleName, 'import', 'global', lineNumber, language, 'module');
    } else if (importMatch[2] && importMatch[3]) {
      // From ... import ...
      const importedItems = importMatch[3].split(',').map(s => s.trim().split(' as ')[0]);
      importedItems.forEach(item => {
        if (item) {
          addSymbol(symbols, item, 'import', 'global', lineNumber, language, 'module');
        }
      });
    }
  }
}

function parseJava(line: string, lineNumber: number, scope: string, scopeStack: string[], symbols: Symbol[], language: string) {
  // Class declarations
  const classMatch = line.match(/(?:public\s+)?class\s+(\w+)/);
  if (classMatch) {
    addSymbol(symbols, classMatch[1], 'class', scope, lineNumber, language);
    scopeStack.push(classMatch[1]);
    return;
  }

  // Method declarations
  const methodMatch = line.match(/(?:public|private|protected)?\s*(?:static\s+)?(?:\w+\s+)+(\w+)\s*\(/);
  if (methodMatch && !line.includes('class ')) {
    addSymbol(symbols, methodMatch[1], 'method', scope, lineNumber, language);
    scopeStack.push(methodMatch[1]);
    return;
  }

  // Variable declarations
  const variableMatch = line.match(/(?:public|private|protected)?\s*(?:static\s+)?(?:final\s+)?(\w+)\s+(\w+)/);
  if (variableMatch && !line.includes('(') && !line.includes('class ')) {
    const type = line.includes('final') ? 'constant' : 'variable';
    addSymbol(symbols, variableMatch[2], type, scope, lineNumber, language, variableMatch[1]);
    return;
  }

  // Import statements
  const importMatch = line.match(/import\s+(?:static\s+)?([^;]+)/);
  if (importMatch) {
    const imported = importMatch[1].split('.').pop();
    if (imported && imported !== '*') {
      addSymbol(symbols, imported, 'import', scope, lineNumber, language);
    }
  }
}

function parseC(line: string, lineNumber: number, scope: string, scopeStack: string[], symbols: Symbol[], language: string) {
  // Function declarations
  const functionMatch = line.match(/(?:\w+\s+)+(\w+)\s*\([^)]*\)\s*(?:\{|;)/);
  if (functionMatch && !line.includes('#define')) {
    addSymbol(symbols, functionMatch[1], 'function', scope, lineNumber, language);
    if (line.includes('{')) {
      scopeStack.push(functionMatch[1]);
    }
    return;
  }

  // Variable declarations
  const variableMatch = line.match(/(?:static\s+)?(?:const\s+)?(\w+)\s+(\w+)(?:\[.*?\])?\s*[=;]/);
  if (variableMatch && !line.includes('(')) {
    const type = line.includes('const') ? 'constant' : 'variable';
    addSymbol(symbols, variableMatch[2], type, scope, lineNumber, language, variableMatch[1]);
    return;
  }

  // #define macros
  const defineMatch = line.match(/#define\s+(\w+)/);
  if (defineMatch) {
    addSymbol(symbols, defineMatch[1], 'constant', scope, lineNumber, language);
    return;
  }

  // Struct definitions
  const structMatch = line.match(/struct\s+(\w+)/);
  if (structMatch) {
    addSymbol(symbols, structMatch[1], 'class', scope, lineNumber, language);
    return;
  }
}

function parseCpp(line: string, lineNumber: number, scope: string, scopeStack: string[], symbols: Symbol[], language: string) {
  // Class declarations
  const classMatch = line.match(/class\s+(\w+)/);
  if (classMatch) {
    addSymbol(symbols, classMatch[1], 'class', scope, lineNumber, language);
    scopeStack.push(classMatch[1]);
    return;
  }

  // Function/method declarations
  const functionMatch = line.match(/(?:\w+\s+)*(\w+)\s*\([^)]*\)\s*(?:\{|;|:)/);
  if (functionMatch && !line.includes('class ') && !line.includes('#include')) {
    addSymbol(symbols, functionMatch[1], scope === 'global' ? 'function' : 'method', scope, lineNumber, language);
    if (line.includes('{')) {
      scopeStack.push(functionMatch[1]);
    }
    return;
  }

  // Variable declarations
  const variableMatch = line.match(/(?:static\s+)?(?:const\s+)?(\w+(?:::\w+)?)\s+(\w+)(?:\[.*?\])?\s*[=;(]/);
  if (variableMatch && !line.includes('(') && !line.includes('class ')) {
    const type = line.includes('const') ? 'constant' : 'variable';
    addSymbol(symbols, variableMatch[2], type, scope, lineNumber, language, variableMatch[1]);
    return;
  }
}

function parseCSharp(line: string, lineNumber: number, scope: string, scopeStack: string[], symbols: Symbol[], language: string) {
  // Class declarations
  const classMatch = line.match(/(?:public\s+)?class\s+(\w+)/);
  if (classMatch) {
    addSymbol(symbols, classMatch[1], 'class', scope, lineNumber, language);
    scopeStack.push(classMatch[1]);
    return;
  }

  // Method declarations
  const methodMatch = line.match(/(?:public|private|protected)?\s*(?:static\s+)?(?:\w+\s+)+(\w+)\s*\(/);
  if (methodMatch && !line.includes('class ')) {
    addSymbol(symbols, methodMatch[1], 'method', scope, lineNumber, language);
    scopeStack.push(methodMatch[1]);
    return;
  }

  // Variable declarations
  const variableMatch = line.match(/(?:public|private|protected)?\s*(?:static\s+)?(?:const\s+)?(\w+)\s+(\w+)/);
  if (variableMatch && !line.includes('(') && !line.includes('class ')) {
    const type = line.includes('const') ? 'constant' : 'variable';
    addSymbol(symbols, variableMatch[2], type, scope, lineNumber, language, variableMatch[1]);
    return;
  }

  // Using statements
  const usingMatch = line.match(/using\s+([^;]+)/);
  if (usingMatch) {
    const imported = usingMatch[1].split('.').pop();
    if (imported) {
      addSymbol(symbols, imported, 'import', scope, lineNumber, language);
    }
  }
}

function parseGo(line: string, lineNumber: number, scope: string, scopeStack: string[], symbols: Symbol[], language: string) {
  // Function declarations
  const functionMatch = line.match(/func\s+(?:\([^)]*\)\s+)?(\w+)\s*\(/);
  if (functionMatch) {
    addSymbol(symbols, functionMatch[1], 'function', scope, lineNumber, language);
    scopeStack.push(functionMatch[1]);
    return;
  }

  // Type declarations (struct)
  const typeMatch = line.match(/type\s+(\w+)\s+struct/);
  if (typeMatch) {
    addSymbol(symbols, typeMatch[1], 'class', scope, lineNumber, language);
    scopeStack.push(typeMatch[1]);
    return;
  }

  // Variable declarations
  const varMatch = line.match(/(?:var\s+(\w+)|(\w+)\s*:=)/);
  if (varMatch) {
    const varName = varMatch[1] || varMatch[2];
    addSymbol(symbols, varName, 'variable', scope, lineNumber, language);
    return;
  }

  // Constant declarations
  const constMatch = line.match(/const\s+(\w+)/);
  if (constMatch) {
    addSymbol(symbols, constMatch[1], 'constant', scope, lineNumber, language);
    return;
  }

  // Import statements
  const importMatch = line.match(/import\s+(?:"([^"]+)"|(\w+))/);
  if (importMatch) {
    const imported = importMatch[2] || importMatch[1].split('/').pop();
    if (imported) {
      addSymbol(symbols, imported, 'import', scope, lineNumber, language);
    }
  }
}

function parseRust(line: string, lineNumber: number, scope: string, scopeStack: string[], symbols: Symbol[], language: string) {
  // Function declarations
  const functionMatch = line.match(/fn\s+(\w+)\s*\(/);
  if (functionMatch) {
    addSymbol(symbols, functionMatch[1], 'function', scope, lineNumber, language);
    scopeStack.push(functionMatch[1]);
    return;
  }

  // Struct declarations
  const structMatch = line.match(/struct\s+(\w+)/);
  if (structMatch) {
    addSymbol(symbols, structMatch[1], 'class', scope, lineNumber, language);
    scopeStack.push(structMatch[1]);
    return;
  }

  // Variable declarations
  const letMatch = line.match(/let\s+(?:mut\s+)?(\w+)/);
  if (letMatch) {
    addSymbol(symbols, letMatch[1], 'variable', scope, lineNumber, language);
    return;
  }

  // Static/const declarations
  const staticMatch = line.match(/(?:static|const)\s+(?:mut\s+)?(\w+)/);
  if (staticMatch) {
    addSymbol(symbols, staticMatch[1], 'constant', scope, lineNumber, language);
    return;
  }

  // Use statements
  const useMatch = line.match(/use\s+(?:[^:]+::)?(\w+)/);
  if (useMatch) {
    addSymbol(symbols, useMatch[1], 'import', scope, lineNumber, language);
    return;
  }
}

function addSymbol(symbols: Symbol[], name: string, type: Symbol['type'], scope: string, line: number, language: string, dataType?: string) {
  symbols.push({
    name,
    type,
    scope,
    line,
    dataType,
    language
  });
}

function updateScope(line: string, scopeStack: string[], updateCurrentScope: (scope: string) => void) {
  if (line.includes('{')) {
    // Scope opening is handled in individual parsers
  }
  
  if (line === '}' && scopeStack.length > 1) {
    scopeStack.pop();
    updateCurrentScope(scopeStack[scopeStack.length - 1]);
  }
}

function removeDuplicates(symbols: Symbol[]): Symbol[] {
  return symbols.filter((symbol, index, array) => {
    return array.findIndex(s => 
      s.name === symbol.name && 
      s.scope === symbol.scope && 
      s.type === symbol.type
    ) === index;
  });
}