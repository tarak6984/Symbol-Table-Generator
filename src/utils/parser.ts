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

  // Function declarations with parameters
  const functionMatch = line.match(/function\s+(\w+)\s*\(([^)]*)\)/);
  if (functionMatch) {
    const funcName = functionMatch[1];
    const params = functionMatch[2];
    
    addSymbol(symbols, funcName, 'function', scope, lineNumber, language, 'Function definition', 'function');
    
    // Parse function parameters
    if (params.trim()) {
      const paramList = params.split(',').map(p => p.trim());
      paramList.forEach(param => {
        const paramMatch = param.match(/(\w+)(?:\s*:\s*(\w+))?/);
        if (paramMatch) {
          const paramName = paramMatch[1];
          const paramType = paramMatch[2] || 'any';
          addSymbol(symbols, paramName, 'parameter', 'local', lineNumber, language, `Parameter of type ${paramType}`, paramType);
        }
      });
    }
    
    scopeStack.push(funcName);
    return;
  }

  // Variable declarations (const, let, var) with type inference
  const variableMatch = line.match(/(?:const|let|var)\s+(\w+)(?:\s*:\s*(\w+))?\s*=?\s*([^;,\n]*)/);
  if (variableMatch) {
    const varName = variableMatch[1];
    const explicitType = variableMatch[2];
    const assignment = variableMatch[3]?.trim();
    const isConst = line.includes('const');
    const symbolType = isConst ? 'constant' : 'variable';
    
    let inferredType = explicitType || 'any';
    
    // Type inference from assignment if no explicit type
    if (!explicitType && assignment) {
      if (/^["'`].*["'`]$/.test(assignment)) {
        inferredType = 'string';
      } else if (/^\d+$/.test(assignment)) {
        inferredType = 'number';
      } else if (/^\d+\.\d+$/.test(assignment)) {
        inferredType = 'number';
      } else if (/^(true|false)$/.test(assignment)) {
        inferredType = 'boolean';
      } else if (/^\[.*\]$/.test(assignment)) {
        inferredType = 'Array';
      } else if (/^\{.*\}$/.test(assignment)) {
        inferredType = 'Object';
      } else if (/^new\s+(\w+)/.test(assignment)) {
        const classMatch = assignment.match(/^new\s+(\w+)/);
        inferredType = classMatch ? classMatch[1] : 'Object';
      }
    }
    
    const description = isConst ? 'Constant value' : `Variable of type ${inferredType}`;
    addSymbol(symbols, varName, symbolType, scope, lineNumber, language, description, inferredType);
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
  // Function definitions with parameters and return type annotation
  const functionMatch = line.match(/def\s+(\w+)\s*\(([^)]*)\)\s*(?:->\s*(\w+))?/);
  if (functionMatch) {
    const funcName = functionMatch[1];
    const params = functionMatch[2];
    const returnType = functionMatch[3] || 'Any';
    
    // Determine if it's a method or function based on scope
    const isMethod = scopeStack.length > 1 && scopeStack[scopeStack.length - 1] !== 'global';
    const symbolType = isMethod ? 'method' : 'function';
    
    addSymbol(symbols, funcName, symbolType, scope, lineNumber, language, `${isMethod ? 'Method' : 'Function'} returning ${returnType}`, returnType);
    
    // Parse function parameters
    if (params.trim()) {
      const paramList = params.split(',').map(p => p.trim());
      paramList.forEach(param => {
        // Skip 'self' parameter for methods
        if (param === 'self') return;
        
        const paramMatch = param.match(/(\w+)(?:\s*:\s*(\w+))?/);
        if (paramMatch) {
          const paramName = paramMatch[1];
          const paramType = paramMatch[2] || 'Any';
          addSymbol(symbols, paramName, 'parameter', 'local', lineNumber, language, `Parameter of type ${paramType}`, paramType);
        }
      });
    }
    
    scopeStack.push(funcName);
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
    addSymbol(symbols, varName, 'variable', scope, lineNumber, language, `Variable of type ${varType}`, varType);
    return;
  }

  // Simple variable assignments with type inference
  const variableMatch = line.match(/^(\w+)\s*=\s*(.+)/);
  if (variableMatch && !line.includes('def ') && !line.includes('class ')) {
    const varName = variableMatch[1];
    const assignment = variableMatch[2].trim();
    // Allow variables with built-in names when they are being assigned (shadowing the built-in)
    // Always allow variable assignments, even if they shadow built-ins
    if (true) {
      let inferredType = 'unknown';
      let description = 'Variable of type ';
      
      // Enhanced type inference with value information
      if (/^["'][^"']*["']/.test(assignment)) {
        inferredType = 'str';
        description += `str, initialized to ${assignment}`;
      } else if (/^\d+$/.test(assignment)) {
        inferredType = 'int';
        description += `int, initialized to ${assignment}`;
      } else if (/^\d+\.\d+$/.test(assignment)) {
        inferredType = 'float';
        description += `float, initialized to ${assignment}`;
      } else if (/^(True|False)$/.test(assignment)) {
        inferredType = 'bool';
        description += `bool, initialized to ${assignment}`;
      } else if (/^\[.*\]$/.test(assignment)) {
        inferredType = 'list';
        description += `list, initialized to ${assignment}`;
      } else if (/^\{.*\}$/.test(assignment)) {
        inferredType = 'dict';
        description += `dict, initialized to ${assignment}`;
      } else if (/^range\(/.test(assignment)) {
        inferredType = 'range';
        description += `range, initialized to ${assignment}`;
      } else {
        // Handle expressions like 'a + b'
        inferredType = 'int'; // Default assumption for arithmetic expressions
        description += `int, result of ${assignment}`;
      }
      
      // Determine proper scope - if we're inside a function/method, it's local
      const actualScope = (scopeStack.length > 1) ? 'local' : 'global';
      addSymbol(symbols, varName, 'variable', actualScope, lineNumber, language, description, inferredType);
    }
    return;
  }

  // F-string detection
  const fStringMatch = line.match(/f["'][^"']*\{([^}]+)\}[^"']*["']/);
  if (fStringMatch) {
    // f-string found - this is a string literal with embedded expressions
    const actualScope = (scopeStack.length > 1) ? 'local' : 'global';
    addSymbol(symbols, 'f-string', 'string literal', actualScope, lineNumber, language, 'Formats and interpolates values of variables', 'str');
  }
  
  // Function calls (to detect built-ins)
  const functionCallMatch = line.match(/(\w+)\s*\(/g);
  if (functionCallMatch) {
    functionCallMatch.forEach(match => {
      const funcName = match.split('(')[0].trim();
      if (PYTHON_BUILTINS.has(funcName) && !symbols.some(s => s.name === funcName)) {
        let builtinType = 'builtin';
        // Determine specific builtin type
        if (['int', 'str', 'float', 'bool', 'list', 'dict', 'set', 'tuple'].includes(funcName)) {
          builtinType = 'type';
        }
        addSymbol(symbols, funcName, 'builtin', 'global', lineNumber, language, 'Built-in function or type', builtinType);
      }
    });
  }

  // Instance attribute assignments (self.attribute = value)
  const selfAttrMatch = line.match(/self\.(\w+)\s*=\s*(.*)/);
  if (selfAttrMatch && scopeStack.length > 1) {
    const attrName = selfAttrMatch[1];
    const assignment = selfAttrMatch[2].trim();
    
    let inferredType = 'Any';
    // Simple type inference for Python
    if (/^["'][^"']*["']/.test(assignment)) {
      inferredType = 'str';
    } else if (/^\d+$/.test(assignment)) {
      inferredType = 'int';
    } else if (/^\d+\.\d+$/.test(assignment)) {
      inferredType = 'float';
    } else if (/^(True|False)$/.test(assignment)) {
      inferredType = 'bool';
    }
    
    addSymbol(symbols, attrName, 'property', 'local', lineNumber, language, `Instance attribute of type ${inferredType}`, inferredType);
    return;
  }

  // Import statements
  const importMatch = line.match(/(?:import\s+(\w+)|from\s+(\w+)\s+import\s+([^#\n]+))/);
  if (importMatch) {
    if (importMatch[1]) {
      // Simple import
      const moduleName = importMatch[1];
      addSymbol(symbols, moduleName, 'import', 'global', lineNumber, language, 'Imported module', 'module');
    } else if (importMatch[2] && importMatch[3]) {
      // From ... import ...
      const importedItems = importMatch[3].split(',').map(s => s.trim().split(' as ')[0]);
      importedItems.forEach(item => {
        if (item) {
          addSymbol(symbols, item, 'import', 'global', lineNumber, language, 'Imported item', 'module');
        }
      });
    }
  }
}

function parseJava(line: string, lineNumber: number, scope: string, scopeStack: string[], symbols: Symbol[], language: string) {
  // Class declarations
  const classMatch = line.match(/(?:public\s+)?class\s+(\w+)/);
  if (classMatch) {
    const className = classMatch[1];
    addSymbol(symbols, className, 'class', 'global', lineNumber, language, 'Class definition', 'class');
    scopeStack.push(className);
    return;
  }

  // Method declarations with proper return type extraction
  const methodMatch = line.match(/(?:public|private|protected)?\s*(?:static\s+)?(\w+(?:\[\])?(?:<[^>]+>)?)\s+(\w+)\s*\(([^)]*)\)\s*\{?/);
  if (methodMatch && !line.includes('class ') && !line.includes('import ') && !line.includes(' = ') && !line.includes('new ')) {
    const returnType = methodMatch[1];
    const methodName = methodMatch[2];
    const params = methodMatch[3];
    
    addSymbol(symbols, methodName, 'method', 'global', lineNumber, language, `Method returning ${returnType}`, returnType);
    
    // Parse method parameters
    if (params.trim()) {
      const paramList = params.split(',').map(p => p.trim());
      paramList.forEach(param => {
        const paramMatch = param.match(/(\w+(?:\[\])?(?:<[^>]+>)?)\s+(\w+)/);
        if (paramMatch) {
          const paramType = paramMatch[1];
          const paramName = paramMatch[2];
          addSymbol(symbols, paramName, 'parameter', 'local', lineNumber, language, `Parameter of type ${paramType}`, paramType);
        }
      });
    }
    
    scopeStack.push(methodName);
    return;
  }

  // Determine current scope - if we're inside a method/class, variables should be local
  const currentScope = scopeStack.length > 1 ? 'local' : 'global';

  // Local variable declarations inside methods (int a = 5;)
  const localVarMatch = line.match(/^\s*(\w+)\s+(\w+)\s*=\s*([^;]+);?/);
  if (localVarMatch && scopeStack.length > 1 && !line.includes('public') && !line.includes('private') && !line.includes('protected') && !line.includes('static')) {
    const dataType = localVarMatch[1];
    const varName = localVarMatch[2];
    
    // Verify it's a valid data type (not a method call or other construct)
    const javaTypes = ['int', 'double', 'float', 'boolean', 'char', 'byte', 'short', 'long', 'String', 'Scanner'];
    if (javaTypes.includes(dataType) || /^[A-Z]/.test(dataType)) {
      addSymbol(symbols, varName, 'variable', 'local', lineNumber, language, `Variable of type ${dataType}`, dataType);
      return;
    }
  }

  // Variable declarations with proper data type extraction (class-level or method-level)
  const variableMatch = line.match(/(?:public|private|protected)?\s*(?:static\s+)?(?:final\s+)?(\w+(?:\[\])?(?:<[^>]+>)?)\s+(\w+)(?:\s*[=;]|\s*=\s*new\s+\w+)/);
  if (variableMatch && !line.includes('(') && !line.includes('class ') && !line.includes('import ')) {
    const dataType = variableMatch[1];
    const varName = variableMatch[2];
    const symbolType = line.includes('final') ? 'constant' : 'variable';
    
    addSymbol(symbols, varName, symbolType, currentScope, lineNumber, language, `${symbolType === 'constant' ? 'Constant' : 'Variable'} of type ${dataType}`, dataType);
    return;
  }

  // Constructor detection (for main method and other constructors)
  const constructorMatch = line.match(/(?:public|private|protected)?\s*(?:static\s+)?void\s+main\s*\(\s*String\[\]\s+(\w+)\s*\)/);
  if (constructorMatch) {
    const paramName = constructorMatch[1];
    addSymbol(symbols, 'main', 'method', 'global', lineNumber, language, 'Main method', 'void');
    addSymbol(symbols, paramName, 'parameter', 'local', lineNumber, language, 'Main method parameter', 'String[]');
    return;
  }

  // Object instantiation (new ClassName())
  const newObjectMatch = line.match(/(\w+)\s+(\w+)\s*=\s*new\s+(\w+)\s*\(/);
  if (newObjectMatch) {
    const varType = newObjectMatch[1];
    const varName = newObjectMatch[2];
    const className = newObjectMatch[3];
    
    addSymbol(symbols, varName, 'variable', currentScope, lineNumber, language, `Variable of type ${varType}`, varType);
    return;
  }
  
  // Simple variable assignments (String name = scanner.nextLine())
  const simpleVarMatch = line.match(/(\w+)\s+(\w+)\s*=\s*([^;]+)/);
  if (simpleVarMatch && !line.includes('class ') && !line.includes('import ') && !line.includes('new ') && !line.includes('public ') && !line.includes('static ')) {
    const varType = simpleVarMatch[1];
    const varName = simpleVarMatch[2];
    
    // Skip if the varType looks like it might be a method (e.g., contains parentheses in the full match)
    if (!['public', 'private', 'protected', 'static', 'final', 'void'].includes(varType)) {
      addSymbol(symbols, varName, 'variable', currentScope, lineNumber, language, `Variable of type ${varType}`, varType);
      return;
    }
  }

  // Method calls like System.out.println()
  const methodCallMatch = line.match(/(\w+)\.(\w+)\.(\w+)\s*\(/);
  if (methodCallMatch) {
    const obj1 = methodCallMatch[1]; // System
    const obj2 = methodCallMatch[2]; // out
    const method = methodCallMatch[3]; // println
    
    // Add System as a class from Java standard library
    if (!symbols.some(s => s.name === obj1)) {
      addSymbol(symbols, obj1, 'class', 'global', lineNumber, language, 'Java standard library class', 'class');
    }
    // Add out as an object/field
    if (!symbols.some(s => s.name === obj2)) {
      addSymbol(symbols, obj2, 'property', 'global', lineNumber, language, `Static field of ${obj1}`, 'PrintStream');
    }
    // Add println as a method
    if (!symbols.some(s => s.name === method)) {
      addSymbol(symbols, method, 'method', 'global', lineNumber, language, `Method of ${obj2}`, 'void');
    }
  }

  // Two-level method calls like object.method()
  const simpleMethodCallMatch = line.match(/(\w+)\.(\w+)\s*\(/);
  if (simpleMethodCallMatch && !methodCallMatch) {
    const object = simpleMethodCallMatch[1];
    const method = simpleMethodCallMatch[2];
    
    // Only add if we haven't already detected this pattern and it's not a built-in
    if (!['System'].includes(object) && !symbols.some(s => s.name === method && s.line === lineNumber)) {
      addSymbol(symbols, method, 'method', 'global', lineNumber, language, `Method called on ${object}`, 'unknown');
    }
  }

  // Import statements with proper module type
  const importMatch = line.match(/import\s+(?:static\s+)?([^;]+)/);
  if (importMatch) {
    const fullImport = importMatch[1];
    const imported = fullImport.split('.').pop();
    if (imported && imported !== '*') {
      // Determine if it's a class, package, or module
      let importType = 'module';
      if (/^[A-Z]/.test(imported)) {
        importType = 'class';
      } else if (fullImport.includes('*')) {
        importType = 'package';
      }
      
      addSymbol(symbols, imported, 'import', 'global', lineNumber, language, `Imported ${importType}`, importType);
    }
    return;
  }
}

function parseC(line: string, lineNumber: number, scope: string, scopeStack: string[], symbols: Symbol[], language: string) {
  // Function declarations with return type and parameters
  const functionMatch = line.match(/(\w+)\s+(\w+)\s*\(([^)]*)\)\s*(?:\{|;)/);
  if (functionMatch && !line.includes('#define') && !line.includes('#include')) {
    const returnType = functionMatch[1];
    const funcName = functionMatch[2];
    const params = functionMatch[3];
    
    addSymbol(symbols, funcName, 'function', scope, lineNumber, language, `Function returning ${returnType}`, returnType);
    
    // Parse function parameters
    if (params.trim()) {
      const paramList = params.split(',').map(p => p.trim());
      paramList.forEach(param => {
        const paramMatch = param.match(/(\w+)\s+(\w+)/);
        if (paramMatch) {
          const paramType = paramMatch[1];
          const paramName = paramMatch[2];
          addSymbol(symbols, paramName, 'parameter', 'local', lineNumber, language, `Parameter of type ${paramType}`, paramType);
        }
      });
    }
    
    if (line.includes('{')) {
      scopeStack.push(funcName);
    }
    return;
  }

  // Variable declarations with proper type extraction
  const variableMatch = line.match(/(?:static\s+)?(?:const\s+)?(\w+)\s+(\w+)(?:\[([^\]]*)\])?\s*[=;]/);
  if (variableMatch && !line.includes('(') && !line.includes('#')) {
    const dataType = variableMatch[1];
    const varName = variableMatch[2];
    const arraySize = variableMatch[3];
    
    let finalType = dataType;
    if (arraySize !== undefined) {
      finalType = `${dataType}[${arraySize || ''}]`;
    }
    
    const symbolType = line.includes('const') ? 'constant' : 'variable';
    addSymbol(symbols, varName, symbolType, scope, lineNumber, language, `${symbolType} of type ${finalType}`, finalType);
    return;
  }

  // #define macros
  const defineMatch = line.match(/#define\s+(\w+)\s*(.*)/);
  if (defineMatch) {
    const macroName = defineMatch[1];
    const macroValue = defineMatch[2].trim();
    let macroType = 'macro';
    
    // Try to infer macro type from value
    if (/^\d+$/.test(macroValue)) {
      macroType = 'int';
    } else if (/^\d+\.\d+$/.test(macroValue)) {
      macroType = 'double';
    } else if (/^".*"$/.test(macroValue)) {
      macroType = 'string';
    }
    
    addSymbol(symbols, macroName, 'constant', scope, lineNumber, language, `Macro definition`, macroType);
    return;
  }

  // Struct definitions
  const structMatch = line.match(/(?:typedef\s+)?struct\s+(\w+)/);
  if (structMatch) {
    addSymbol(symbols, structMatch[1], 'class', scope, lineNumber, language, 'Struct definition', 'struct');
    return;
  }
  
  // Include statements
  const includeMatch = line.match(/#include\s*[<"]([^>"]+)[>"]/);
  if (includeMatch) {
    const headerName = includeMatch[1].replace(/\.(h|hpp)$/, '');
    addSymbol(symbols, headerName, 'import', 'global', lineNumber, language, 'Header file inclusion', 'header');
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
    // Determine the actual scope (global or local)
    let actualScope = scope;
    if (scope !== 'global') {
      actualScope = 'local';
    }
    
    // Process the data type from description if not explicitly provided
    let finalDataType = dataType;
    if (!finalDataType && description) {
      if (description.includes('type ')) {
        finalDataType = description.split('type ')[1];
      } else if (description === 'Function definition') {
        finalDataType = 'function';
      } else if (description === 'builtin_function_or_method') {
        finalDataType = 'builtin';
      }
    }

    symbols.push({ 
      name: cleanName, 
      type, 
      scope: actualScope, 
      line, 
      language, 
      dataType: finalDataType || (type === 'function' ? 'function' : type === 'builtin' ? 'builtin' : undefined),
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