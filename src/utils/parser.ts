import type { Symbol, SupportedLanguage } from '../types/symbol';

interface BuiltInObject {
  type: string;
  methods: string[];
}

type BuiltInObjects = {
  [key: string]: BuiltInObject;
};

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

// Built-in JavaScript objects and their methods
const JS_BUILTINS: BuiltInObjects = {
  'console': {
    type: 'builtin',
    methods: ['log', 'warn', 'error', 'info', 'debug', 'assert', 'clear', 'count', 'dir', 'dirxml', 'group', 'groupCollapsed', 'groupEnd', 'table', 'time', 'timeEnd', 'timeLog', 'trace']
  },
  'Math': {
    type: 'builtin',
    methods: ['abs', 'acos', 'acosh', 'asin', 'asinh', 'atan', 'atan2', 'atanh', 'cbrt', 'ceil', 'clz32', 'cos', 'cosh', 'exp', 'expm1', 'floor', 'fround', 'hypot', 'imul', 'log', 'log10', 'log1p', 'log2', 'max', 'min', 'pow', 'random', 'round', 'sign', 'sin', 'sinh', 'sqrt', 'tan', 'tanh', 'trunc']
  },
  'Array': {
    type: 'builtin',
    methods: ['from', 'isArray', 'of']
  },
  'Object': {
    type: 'builtin',
    methods: ['keys', 'values', 'entries', 'fromEntries', 'assign', 'create', 'defineProperty', 'defineProperties', 'getOwnPropertyDescriptor', 'getOwnPropertyDescriptors', 'getOwnPropertyNames', 'getOwnPropertySymbols', 'getPrototypeOf', 'setPrototypeOf', 'is', 'preventExtensions', 'isExtensible', 'seal', 'isSealed', 'freeze', 'isFrozen']
  },
  'Map': {
    type: 'builtin',
    methods: ['set', 'get', 'has', 'delete', 'clear', 'entries', 'forEach', 'keys', 'values', 'size']
  },
  'Set': {
    type: 'builtin',
    methods: ['add', 'clear', 'delete', 'entries', 'forEach', 'has', 'values', 'size']
  },
  'Date': {
    type: 'builtin',
    methods: ['now', 'parse', 'UTC', 'prototype.getDate', 'prototype.getDay', 'prototype.getFullYear', 'prototype.getHours', 'prototype.getMilliseconds', 'prototype.getMinutes', 'prototype.getMonth', 'prototype.getSeconds', 'prototype.getTime', 'prototype.getTimezoneOffset', 'prototype.getUTCDate', 'prototype.getUTCDay', 'prototype.getUTCFullYear', 'prototype.getUTCHours', 'prototype.getUTCMilliseconds', 'prototype.getUTCMinutes', 'prototype.getUTCMonth', 'prototype.getUTCSeconds', 'prototype.setDate', 'prototype.setFullYear', 'prototype.setHours', 'prototype.setMilliseconds', 'prototype.setMinutes', 'prototype.setMonth', 'prototype.setSeconds', 'prototype.setTime', 'prototype.setUTCDate', 'prototype.setUTCFullYear', 'prototype.setUTCHours', 'prototype.setUTCMilliseconds', 'prototype.setUTCMinutes', 'prototype.setUTCMonth', 'prototype.setUTCSeconds', 'prototype.toDateString', 'prototype.toISOString', 'prototype.toJSON', 'prototype.toLocaleDateString', 'prototype.toLocaleString', 'prototype.toLocaleTimeString', 'prototype.toString', 'prototype.toTimeString', 'prototype.toUTCString', 'prototype.valueOf']
  },
  'JSON': {
    type: 'builtin',
    methods: ['parse', 'stringify']
  },
  'Promise': {
    type: 'builtin',
    methods: ['all', 'allSettled', 'any', 'race', 'reject', 'resolve']
  },
  'String': {
    type: 'builtin',
    methods: ['fromCharCode', 'fromCodePoint', 'raw', 'prototype.charAt', 'prototype.charCodeAt', 'prototype.codePointAt', 'prototype.concat', 'prototype.endsWith', 'prototype.includes', 'prototype.indexOf', 'prototype.lastIndexOf', 'prototype.localeCompare', 'prototype.match', 'prototype.matchAll', 'prototype.normalize', 'prototype.padEnd', 'prototype.padStart', 'prototype.repeat', 'prototype.replace', 'prototype.search', 'prototype.slice', 'prototype.split', 'prototype.startsWith', 'prototype.substring', 'prototype.toLocaleLowerCase', 'prototype.toLocaleUpperCase', 'prototype.toLowerCase', 'prototype.toString', 'prototype.toUpperCase', 'prototype.trim', 'prototype.trimEnd', 'prototype.trimStart', 'prototype.valueOf']
  },
  'Number': {
    type: 'builtin',
    methods: ['isFinite', 'isInteger', 'isNaN', 'isSafeInteger', 'parseFloat', 'parseInt', 'prototype.toExponential', 'prototype.toFixed', 'prototype.toLocaleString', 'prototype.toPrecision', 'prototype.toString', 'prototype.valueOf']
  },
  'Array.prototype': {
    type: 'builtin',
    methods: ['concat', 'copyWithin', 'entries', 'every', 'fill', 'filter', 'find', 'findIndex', 'flat', 'flatMap', 'forEach', 'includes', 'indexOf', 'join', 'keys', 'lastIndexOf', 'map', 'pop', 'push', 'reduce', 'reduceRight', 'reverse', 'shift', 'slice', 'some', 'sort', 'splice', 'toLocaleString', 'toString', 'unshift', 'values']
  }
};

function parseJavaScript(line: string, lineNumber: number, scope: string, scopeStack: string[], symbols: Symbol[], language: SupportedLanguage) {
  // Skip comments and empty lines
  if (isComment(line, language) || !line.trim()) {
    return;
  }

  // Class declarations
  const classMatch = line.match(/class\s+(\w+)/);
  if (classMatch) {
    const className = classMatch[1];
    addSymbol(symbols, className, 'class', scope, lineNumber, language, 'Class definition');
    scopeStack.push(className);
    return;
  }

  // Constructor method
  const constructorMatch = line.match(/constructor\s*\(/);
  if (constructorMatch && scopeStack[scopeStack.length - 1] !== 'global') {
    addSymbol(symbols, 'constructor', 'constructor', scope, lineNumber, language, 'Constructor method');
    return;
  }

  // Method definitions (class methods)
  const methodMatch = line.match(/(\w+)\s*\([^)]*\)\s*\{/);
  if (methodMatch && scopeStack[scopeStack.length - 1] !== 'global') {
    const methodName = methodMatch[1];
    // Skip if it's a built-in method
    if (!['if', 'for', 'while', 'switch', 'catch', 'function', 'class'].includes(methodName)) {
      addSymbol(symbols, methodName, 'method', scope, lineNumber, language, 'Instance method');
    }
    return;
  }

  // Class property (this.property = value)
  const propertyMatch = line.match(/this\.(\w+)\s*[=;]/);
  if (propertyMatch && scopeStack[scopeStack.length - 1] !== 'global') {
    const propName = propertyMatch[1];
    addSymbol(symbols, propName, 'property', scope, lineNumber, language, 'Instance property');
    return;
  }

  // Static class property (Class.property = value)
  const staticPropMatch = line.match(/(\w+)\.(\w+)\s*=/);
  if (staticPropMatch) {
    const className = staticPropMatch[1];
    const propName = staticPropMatch[2];
    // Check if the class is in our current scope
    if (scopeStack.includes(className)) {
      addSymbol(symbols, `${className}.${propName}`, 'property', className, lineNumber, language, 'Static class property');
    }
  }

  // Function declarations
  const functionMatch = line.match(/function\s+(\w+)\s*\(/);
  if (functionMatch) {
    const funcName = functionMatch[1];
    addSymbol(symbols, funcName, 'function', scope, lineNumber, language, 'Function definition');
    scopeStack.push(funcName);
    return;
  }

  // Variable declarations (const, let, var)
  const variableMatch = line.match(/(?:const|let|var)\s+(\w+)(?:\s*:\s*(\w+))?/);
  if (variableMatch) {
    const varName = variableMatch[1];
    const varType = variableMatch[2] || 'any';
    const isConst = line.includes('const');
    const symbolType = isConst ? 'constant' : 'variable';
    const description = isConst ? 'Constant value' : `Variable of type ${varType}`;
    
    addSymbol(symbols, varName, symbolType, scope, lineNumber, language, description, varType);
    return;
  }

  // This assignment (this.x = value)
  const thisAssignmentMatch = line.match(/this\.(\w+)\s*=\s*[^;]+/);
  if (thisAssignmentMatch) {
    const propName = thisAssignmentMatch[1];
    addSymbol(symbols, propName, 'property', scope, lineNumber, language, 'Instance property');
    return;
  }

  // Class instance creation (new Class())
  const newInstanceMatch = line.match(/new\s+(\w+)\s*\(/);
  if (newInstanceMatch) {
    const className = newInstanceMatch[1];
    // Only add if it's not a built-in and we haven't seen it before
    if (!(className in JS_BUILTINS) && !symbols.some(s => s.name === className && s.type === 'class')) {
      addSymbol(symbols, className, 'class', 'global', lineNumber, language, 'Class instantiation');
    }
  }

  // Method calls (object.method())
  const methodCallMatch = line.match(/(\w+)\.(\w+)\s*\(/);
  if (methodCallMatch) {
    const objectName = methodCallMatch[1];
    const methodName = methodCallMatch[2];
    
    // Type-safe check for built-in methods
    const builtIn = JS_BUILTINS[objectName as keyof typeof JS_BUILTINS];
    if (builtIn?.methods.includes(methodName)) {
      addSymbol(
        symbols, 
        `${objectName}.${methodName}`, 
        'builtin', 
        'global', 
        lineNumber, 
        language, 
        'Built-in method'
      );
    }
  }

  // Import statements
  const importMatch = line.match(/import\s+(?:\{([^}]+)\}|\*\s+as\s+(\w+)|(\w+))/);
  if (importMatch) {
    const imported = importMatch[1] || importMatch[2] || importMatch[3];
    if (imported) {
      imported.split(',').forEach(name => {
        const cleanName = name.trim().replace(/\s+as\s+\w+$/, ''); // Remove 'as' alias
        if (cleanName) {
          addSymbol(symbols, cleanName, 'import', scope, lineNumber, language, 'Imported module or member');
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



function addSymbol(symbols: Symbol[], name: string, type: Symbol['type'], scope: string, line: number, language: string, description?: string, dataType?: string) {
  // Skip empty names
  if (!name) return;

  // Clean up the name (remove quotes, trim)
  const cleanName = name.replace(/['"]/g, '').trim();
  if (!cleanName) return;

  // Skip if symbol already exists with the same scope and line
  const exists = symbols.some(s => 
    s.name === cleanName && s.scope === scope && s.line === line
  );
  
  if (!exists) {
    symbols.push({ 
      name: cleanName, 
      type, 
      scope, 
      line, 
      language, 
      dataType: dataType || (description && description.includes('type') ? description.split('type ')[1] : undefined),
      description: description || ''
    });
  }
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