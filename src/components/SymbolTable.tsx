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
        {filteredSymbols.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            {symbols.length === 0 ? (
              <>
                <div className="text-4xl mb-2">📝</div>
                <p>No symbols found in your code</p>
                <p className="text-sm mt-1">Try adding some variable declarations or functions</p>
              </>
            ) : (
              <p>No symbols match your search criteria</p>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Identifier
                    {getSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600 transition-colors"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center gap-2">
                    Type
                    {getSortIcon('type')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600 transition-colors"
                  onClick={() => handleSort('scope')}
                >
                  <div className="flex items-center gap-2">
                    Scope
                    {getSortIcon('scope')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600 transition-colors"
                  onClick={() => handleSort('dataType')}
                >
                  <div className="flex items-center gap-2">
                    Value / Description
                    {getSortIcon('dataType')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredSymbols.map((symbol, index) => {
                // Format the description based on symbol type
                const getDescription = () => {
                  if (symbol.type === 'builtin') {
                    return symbol.dataType || 'Built-in function';
                  } else if (symbol.type === 'variable') {
                    return symbol.dataType ? `Stores ${symbol.dataType} value` : 'Variable';
                  } else if (symbol.type === 'import') {
                    return 'Imported module or function';
                  } else if (symbol.type === 'function') {
                    return `Defined at line ${symbol.line}`;
                  }
                  return symbol.dataType || 'Symbol';
                };

                // Format the display name
                const displayName = symbol.name.startsWith('__') && symbol.name.endsWith('__') 
                  ? `\`${symbol.name}\`` 
                  : symbol.name;

                return (
                  <tr key={index} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-sm text-white font-medium">
                      <code>{displayName}</code>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(symbol.type)}`}>
                        {symbol.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getScopeColor(symbol.scope)}`}>
                        {symbol.scope === 'builtins' ? 'Built-in' : symbol.scope}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {getDescription()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
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