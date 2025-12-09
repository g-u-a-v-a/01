
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './Layout';
import Dashboard from './components/Dashboard';
import FilterPanel from './components/FilterPanel';
import StockCard from './components/StockCard';
import { getMockStocks, createMockStock, searchStockSuggestions } from './services/stockService';
import { StockData, FilterState } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'search'>('home');
  
  // Data
  const [allStocks, setAllStocks] = useState<StockData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<StockData[]>([]);
  const [suggestions, setSuggestions] = useState<{code: string, name: string}[]>([]);

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    trend_bullish: true,
    trend_long_bullish: false,
    momentum_strong_20: false,
    rsi_bullish: false,
    psy_hot: false,
    psy_cold: false,
    volume_surge: false,
    price_box_breakout: false,
    volatility_high: false,
  });

  // Init Data
  useEffect(() => {
    const data = getMockStocks(30); // Generate 30 random stocks
    setAllStocks(data);
  }, []);

  // Filtering Logic
  const displayedStocks = useMemo(() => {
    if (activeTab === 'search') {
      return searchResult;
    }

    return allStocks.filter(stock => {
      const last = stock.data[stock.data.length - 1];
      
      if (filters.trend_bullish) {
        // Simple check for tags or recalculate. Tags are populated by logic already.
        if (!stock.tags.includes('多頭排列')) return false;
      }
      if (filters.rsi_bullish) {
        if (!last.rsi14 || last.rsi14 <= 50 || last.rsi14 >= 70) return false;
      }
      if (filters.psy_hot) {
        if (!last.psy12 || last.psy12 <= 70) return false;
      }
      if (filters.psy_cold) {
        if (!last.psy12 || last.psy12 >= 30) return false;
      }
      if (filters.price_box_breakout) {
         if (!stock.tags.includes('突破上軌') && !stock.tags.includes('布林壓縮')) return false;
      }
      
      return true;
    });
  }, [allStocks, filters, activeTab, searchResult]);

  // Handle Autocomplete Input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    
    // If typing multiple, only suggest for the last one? 
    // For simplicity, let's support single search or comma separated.
    // If contains comma, get the last part
    const lastPart = val.split(',').pop()?.trim() || '';
    if (lastPart.length >= 1) {
        setSuggestions(searchStockSuggestions(lastPart));
    } else {
        setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (s: {code: string, name: string}) => {
      // Replace the last part with the selected code
      const parts = searchTerm.split(',');
      parts.pop(); // remove partial
      parts.push(s.code);
      setSearchTerm(parts.join(', '));
      setSuggestions([]);
      
      // Optional: Auto-trigger search or just focus back
      // document.getElementById('search-btn')?.click();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestions([]); // Close dropdown
    if (!searchTerm.trim()) return;

    const codes = searchTerm.split(/[, ]+/).map(s => s.trim().toUpperCase()).filter(s => s.length > 0);
    
    // Generate or find results for EACH code
    const results: StockData[] = [];

    codes.forEach(code => {
       // 1. Check existing Home list
       let stock = allStocks.find(s => s.code.includes(code));
       
       // 2. If not found, Create NEW Specific Mock
       if (!stock) {
         stock = createMockStock(code);
       }
       results.push(stock);
    });

    setSearchResult(results);
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      
      {activeTab === 'home' && (
        <>
          <Dashboard />
          <FilterPanel filters={filters} onChange={setFilters} />
          
          <div className="space-y-4">
             <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <span className="w-1.5 h-6 bg-twRed mr-3 rounded-full"></span>
                AI 嚴選標的 ({displayedStocks.length})
             </h3>
             
             {displayedStocks.length === 0 ? (
                <div className="text-center py-20 text-slate-500 bg-cardBg rounded-xl border border-slate-800 border-dashed">
                    沒有符合當前篩選條件的股票
                </div>
             ) : (
                 displayedStocks.map(stock => (
                    <StockCard key={stock.code} stock={stock} />
                 ))
             )}
          </div>
        </>
      )}

      {activeTab === 'search' && (
        <div className="min-h-[60vh]">
           <div className="max-w-xl mx-auto mb-10">
              <form onSubmit={handleSearch} className="relative z-30">
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="輸入代號 (例如: 2330, 2603)..." 
                    className="w-full bg-slate-800 border border-slate-600 text-white px-6 py-4 rounded-full shadow-xl focus:ring-2 focus:ring-twRed focus:outline-none text-lg placeholder-slate-500"
                    autoComplete="off"
                  />
                  <button id="search-btn" type="submit" className="absolute right-2 top-2 bottom-2 bg-twRed text-white px-6 rounded-full font-bold hover:bg-red-600 transition">
                    查詢
                  </button>
                  
                  {/* Autocomplete Dropdown */}
                  {suggestions.length > 0 && (
                      <ul className="absolute top-full left-4 right-4 mt-2 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                          {suggestions.map((s) => (
                              <li 
                                key={s.code}
                                onClick={() => handleSelectSuggestion(s)}
                                className="px-4 py-3 hover:bg-slate-700 cursor-pointer flex justify-between border-b border-slate-700 last:border-0"
                              >
                                  <span className="font-bold text-white">{s.code}</span>
                                  <span className="text-slate-300">{s.name}</span>
                              </li>
                          ))}
                      </ul>
                  )}
              </form>
              
              <p className="text-center text-slate-500 text-sm mt-4">
                支援多檔查詢，請用逗號分隔
              </p>
           </div>

           {searchResult.length > 0 && (
              <div className="space-y-6">
                  {searchResult.map(stock => (
                    <StockCard key={stock.code} stock={stock} />
                  ))}
              </div>
           )}
        </div>
      )}

    </Layout>
  );
};

export default App;
