import React, { useState } from 'react';
import { FilterState } from '../types';

interface Props {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
}

const FilterPanel: React.FC<Props> = ({ filters, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (key: keyof FilterState) => {
    onChange({ ...filters, [key]: !filters[key] });
  };

  return (
    <div className="mb-6 border border-slate-700 rounded-xl bg-cardBg overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex justify-between items-center text-slate-300 font-medium hover:bg-slate-700/50 transition"
      >
        <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            智能選股條件 ({Object.values(filters).filter(Boolean).length})
        </span>
        <span>{isOpen ? '收起' : '展開'}</span>
      </button>
      
      {isOpen && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-800/30">
            
            {/* Trend */}
            <div className="space-y-2">
                <h4 className="text-twRed text-xs font-bold uppercase tracking-wider mb-2">趨勢 & 排列</h4>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={filters.trend_bullish} onChange={() => handleChange('trend_bullish')} className="rounded border-slate-600 bg-slate-700 text-twRed focus:ring-0" />
                    <span className="text-sm text-slate-300">均線多頭排列 (MA20>60>120)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={filters.trend_long_bullish} onChange={() => handleChange('trend_long_bullish')} className="rounded border-slate-600 bg-slate-700 text-twRed focus:ring-0" />
                    <span className="text-sm text-slate-300">長期多頭趨勢 (價>MA60)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={filters.price_box_breakout} onChange={() => handleChange('price_box_breakout')} className="rounded border-slate-600 bg-slate-700 text-twRed focus:ring-0" />
                    <span className="text-sm text-slate-300">突破箱型 / 創新高</span>
                </label>
            </div>

            {/* Momentum */}
            <div className="space-y-2">
                <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">動能 & 心理</h4>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={filters.momentum_strong_20} onChange={() => handleChange('momentum_strong_20')} className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-0" />
                    <span className="text-sm text-slate-300">動能強勁 (MOM20 > 10%)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={filters.rsi_bullish} onChange={() => handleChange('rsi_bullish')} className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-0" />
                    <span className="text-sm text-slate-300">RSI 健康多頭 (50-70)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={filters.psy_hot} onChange={() => handleChange('psy_hot')} className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-0" />
                    <span className="text-sm text-slate-300">心理線過熱 (PSY > 70)</span>
                </label>
            </div>

            {/* Volume & Risk */}
            <div className="space-y-2">
                <h4 className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2">量能 & 風險</h4>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={filters.volume_surge} onChange={() => handleChange('volume_surge')} className="rounded border-slate-600 bg-slate-700 text-yellow-500 focus:ring-0" />
                    <span className="text-sm text-slate-300">爆量長紅 (>1.5倍均量)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={filters.volatility_high} onChange={() => handleChange('volatility_high')} className="rounded border-slate-600 bg-slate-700 text-yellow-500 focus:ring-0" />
                    <span className="text-sm text-slate-300">波動放大 (ATR上升)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={filters.psy_cold} onChange={() => handleChange('psy_cold')} className="rounded border-slate-600 bg-slate-700 text-yellow-500 focus:ring-0" />
                    <span className="text-sm text-slate-300">抄底機會? (PSY &lt; 30)</span>
                </label>
            </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
