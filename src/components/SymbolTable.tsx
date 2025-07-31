import React, { useState } from 'react';
import { Search, SortAsc, SortDesc, Filter, Code2 } from 'lucide-react';
import type { Symbol } from '../types/symbol';

interface SymbolTableProps {
  symbols: Symbol[];
  isLoading: boolean;
}

const SymbolTable: React.FC<SymbolTableProps> = ({ symbols, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof Symbol>('line');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterType, setFilterType] = useState<'all' | 'variable' | 'function' | 'class' | 'method' | 'constant' | 'import'>('all');

  const filteredSymbols = symbols
    .filter(symbol => {
      const matchesSearch = symbol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           symbol.scope.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || symbol.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1; // undefined values go to the end
      if (bValue === undefined) return -1; // undefined values go to the end
      
      // For string or number comparison
      const comparison = String(aValue).localeCompare(String(bValue));
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSort = (key: keyof Symbol) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (key: keyof Symbol) => {
    if (sortBy !== key) return null;
    return sortOrder === 'asc' ? 
      <SortAsc className="w-4 h-4" /> : 
      <SortDesc className="w-4 h-4" />;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'variable': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'function': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'class': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'method': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'constant': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'import': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      case 'parameter': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'builtin': return 'text-pink-400 bg-pink-400/10 border-pink-400/20';
      case 'property': return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
      case 'constructor': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'global': return 'text-purple-400 bg-purple-400/10';
      case 'builtins': return 'text-pink-400 bg-pink-400/10';
      case 'local': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-orange-400 bg-orange-400/10';
    }
  };

  const headers = [
    { key: 'name', label: 'Identifier', className: 'w-1/6' },
    { key: 'type', label: 'Type', className: 'w-1/6' },
    { key: 'scope', label: 'Scope', className: 'w-1/6' },
    { key: 'dataType', label: 'Data Type', className: 'w-1/6' },
    { key: 'description', label: 'Description', className: 'w-1/3' },
  ];

  const getTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      'variable': 'Variable',
      'function': 'Function',
      'class': 'Class',
      'method': 'Method',
      'constant': 'Constant',
      'import': 'Import',
      'parameter': 'Parameter',
      'builtin': 'Built-in',
      'property': 'Property',
      'constructor': 'Constructor',
      'prototype': 'Prototype'
    };
    return typeMap[type] || type.split('.').map(t => 
      t === 'prototype' ? 'Prototype' : 
      t.charAt(0).toUpperCase() + t.slice(1)
    ).join('.');
  };

  const getSymbolDescription = (symbol: Symbol): string => {
    switch (symbol.type) {
      case 'class':
        return 'Class definition';
      case 'constructor':
        return 'Constructor method';
      case 'method':
        return 'Instance method';
      case 'function':
        return 'Function definition';
      case 'variable':
        return `Variable of type ${symbol.dataType || 'unknown'}`;
      case 'constant':
        return `Constant value`;
      case 'import':
        return 'Imported module or member';
      case 'builtin':
        return 'Built-in language feature';
      case 'property':
        return `Property of type ${symbol.dataType || 'unknown'}`;
      default:
        return '';
    }
  };

  const renderTableRows = () => {
    if (filteredSymbols.length === 0) {
      return (
        <tr>
          <td colSpan={headers.length} className="px-6 py-4 text-center text-slate-400">
            {symbols.length === 0 ? 'No symbols found in the code' : 'No symbols match your search/filter criteria'}
          </td>
        </tr>
      );
    }

    return filteredSymbols.map((symbol, index) => {
      const typeColor = getTypeColor(symbol.type);
      const scopeColor = getScopeColor(symbol.scope);
      const description = symbol.description || getSymbolDescription(symbol);
      
      // Format the symbol name for display
      const displayName = symbol.name.includes('.') 
        ? <span><span className="text-slate-400">{symbol.name.split('.')[0]}.</span>{symbol.name.split('.').slice(1).join('.')}</span>
        : symbol.name;
      
      return (
        <tr 
          key={`${symbol.name}-${symbol.scope}-${symbol.line}-${index}`} 
          className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
        >
          <td className="px-4 py-3">
            <div className="flex items-center">
              <Code2 className={`w-4 h-4 mr-2 flex-shrink-0 ${typeColor.replace('bg-', 'text-').split('/')[0]}`} />
              <code className="text-sm font-mono text-white break-all">
                {displayName}
              </code>
            </div>
          </td>
          <td className="px-4 py-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${typeColor}`}>
              {getTypeName(symbol.type)}
            </span>
          </td>
          <td className="px-4 py-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${scopeColor}`}>
              {symbol.scope === 'global' ? 'Global' : 
               symbol.scope === 'local' ? 'Local' : 
               symbol.scope.charAt(0).toUpperCase() + symbol.scope.slice(1)}
            </span>
          </td>
          <td className="px-4 py-3 text-sm text-slate-300 font-mono">
            {symbol.dataType || '-'}
          </td>
          <td className="px-4 py-3 text-sm text-slate-400">
            {description}
            {symbol.line && (
              <span className="text-xs text-slate-500 ml-2">(line {symbol.line})</span>
            )}
          </td>
        </tr>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-slate-400">Analyzing code...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      {/* Controls */}
      <div className="p-4 border-b border-slate-700 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search symbols..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
              setFilterType(e.target.value as 'all' | 'variable' | 'function' | 'class' | 'method' | 'constant' | 'import')
            }
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">All Types</option>
            <option value="variable">Variables</option>
            <option value="function">Functions</option>
            <option value="class">Classes</option>
            <option value="method">Methods</option>
            <option value="constant">Constants</option>
            <option value="import">Imports</option>
          </select>
          <span className="text-slate-400 text-sm ml-auto">
            {filteredSymbols.length} of {symbols.length} symbols
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              {headers.map((header) => (
                <th
                  key={header.key}
                  onClick={() => header.key !== 'description' ? handleSort(header.key as keyof Symbol) : null}
                  className={`px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider ${header.key !== 'description' ? 'cursor-pointer hover:bg-slate-700/50 transition-colors' : ''} ${header.className || ''}`}
                >
                  <div className="flex items-center">
                    {header.label}
                    {header.key !== 'description' && getSortIcon(header.key as keyof Symbol)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {renderTableRows()}
          </tbody>
        </table>
      </div>
      
      {/* Language Statistics */}
      {symbols.length > 0 && (
        <div className="p-4 border-t border-slate-700 bg-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Code2 className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Statistics</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {getTypeStats(symbols).map(({ type, count, color }) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${color}`}></div>
                <span className="text-slate-400">{type}:</span>
                <span className="text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function getTypeStats(symbols: Symbol[]) {
  const stats = symbols.reduce((acc, symbol) => {
    acc[symbol.type] = (acc[symbol.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const colorMap: Record<string, string> = {
    variable: 'bg-blue-400',
    function: 'bg-green-400',
    class: 'bg-purple-400',
    method: 'bg-emerald-400',
    constant: 'bg-orange-400',
    import: 'bg-cyan-400',
    parameter: 'bg-yellow-400',
  };

  return Object.entries(stats).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1) + 's',
    count,
    color: colorMap[type] || 'bg-slate-400'
  }));
}

export default SymbolTable;