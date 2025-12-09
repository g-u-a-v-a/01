
import React, { useState } from 'react';
import { StockData, Timeframe } from '../types';
import StockChart from './StockChart';
import { getMockDataForTimeframe } from '../services/stockService';

interface Props {
  stock: StockData;
}

const TIME_FRAMES: Timeframe[] = ['1m', '5m', '10m', '15m', '30m', '60m', 'D', 'W', 'M'];

const StockCard: React.FC<Props> = ({ stock }) => {
  // State for timeframe data override
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('D');
  const [displayStock, setDisplayStock] = useState<StockData>(stock);

  const [indicators, setIndicators] = useState({
    ma5: true,
    ma10: false,
    ma20: true,
    ma60: false,
    bb: true,
    rsi: false,
    psy: false,
    kd: false,
    macd: true,
    vol: true,
    mom: false
  });

  const toggleIndicator = (key: keyof typeof indicators) => {
    setIndicators(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTimeframeChange = (tf: Timeframe) => {
      setActiveTimeframe(tf);
      // In real app, fetch API. Here, simulate data gen.
      if (tf === 'D' && stock.data.length > 0) {
          setDisplayStock(stock); // Use original if Daily
      } else {
          const newData = getMockDataForTimeframe(stock.code, stock.name, tf);
          // Merge simulated data with current swing/ai info (preserving the "Strategy" context of the daily view)
          setDisplayStock({
              ...stock,
              data: newData.data,
              price: newData.price,
              change: newData.change,
              changePercent: newData.changePercent
          });
      }
  };

  const fmtNum = (num: number) => num.toLocaleString();

  return (
    <div className="bg-cardBg rounded-2xl border border-slate-700 overflow-hidden shadow-xl mb-6">
      {/* Header */}
      <div className="p-4 flex justify-between items-start bg-slate-800/50">
        <div>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-2xl font-bold text-white">{displayStock.code}</h2>
            <span className="text-lg text-slate-300">{displayStock.name}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {displayStock.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-slate-700 text-blue-300 text-xs rounded-full border border-slate-600">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${displayStock.change > 0 ? 'text-twRed' : 'text-twGreen'}`}>
            {displayStock.price.toFixed(2)}
          </div>
          <div className={`text-sm font-medium ${displayStock.change > 0 ? 'text-twRed' : 'text-twGreen'}`}>
            {displayStock.change > 0 ? '+' : ''}{displayStock.change} ({displayStock.change > 0 ? '+' : ''}{displayStock.changePercent}%)
          </div>
          <div className="mt-1 text-xs text-slate-400">技術分: <span className="text-yellow-400 font-bold">{stock.techScore}</span></div>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="px-4 pt-2 bg-slate-900/30 border-b border-slate-800 flex space-x-1 overflow-x-auto">
          {TIME_FRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => handleTimeframeChange(tf)}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                    activeTimeframe === tf 
                    ? 'text-white border-twRed bg-slate-800' 
                    : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                  {tf === 'D' ? '日K' : tf === 'W' ? '週K' : tf === 'M' ? '月K' : tf}
              </button>
          ))}
      </div>

      {/* Chart Controls */}
      <div className="px-4 py-2 border-b border-slate-700 bg-slate-900/30 flex flex-col md:flex-row md:items-center gap-4 overflow-x-auto">
        <div className="flex items-center gap-2 flex-shrink-0">
             <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">主圖</div>
             <div className="flex gap-1">
                <button onClick={() => toggleIndicator('ma5')} className={`px-2 py-1 text-xs rounded border transition-colors ${indicators.ma5 ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>MA5</button>
                <button onClick={() => toggleIndicator('ma10')} className={`px-2 py-1 text-xs rounded border transition-colors ${indicators.ma10 ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>MA10</button>
                <button onClick={() => toggleIndicator('ma20')} className={`px-2 py-1 text-xs rounded border transition-colors ${indicators.ma20 ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>MA20</button>
                <button onClick={() => toggleIndicator('ma60')} className={`px-2 py-1 text-xs rounded border transition-colors ${indicators.ma60 ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>MA60</button>
                <button onClick={() => toggleIndicator('bb')} className={`px-2 py-1 text-xs rounded border transition-colors ${indicators.bb ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>布林</button>
            </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
             <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">副圖</div>
             <div className="flex gap-1">
                <button onClick={() => toggleIndicator('vol')} className={`px-2 py-1 text-xs rounded border transition-colors ${indicators.vol ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>成交量</button>
                <button onClick={() => toggleIndicator('macd')} className={`px-2 py-1 text-xs rounded border transition-colors ${indicators.macd ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>MACD</button>
                <button onClick={() => toggleIndicator('mom')} className={`px-2 py-1 text-xs rounded border transition-colors ${indicators.mom ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>動能</button>
                <button onClick={() => toggleIndicator('kd')} className={`px-2 py-1 text-xs rounded border transition-colors ${indicators.kd ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>KD</button>
                <button onClick={() => toggleIndicator('rsi')} className={`px-2 py-1 text-xs rounded border transition-colors ${indicators.rsi ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>RSI</button>
             </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-4 bg-slate-900/50 min-h-[300px]">
        <StockChart code={displayStock.code} data={displayStock.data} indicators={indicators} />
      </div>

      {/* --- Detailed Analysis Sections --- */}
      <div className="bg-slate-900/30 p-4 space-y-8">

        {/* 1. Gemini Long Term Report */}
        <div>
            <div className="flex items-center gap-2 mb-4">
                <span className="text-yellow-400">⚡</span>
                <h3 className="text-lg font-bold text-white">Gemini 長線趨勢報告</h3>
            </div>
            <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50">
                <div className="mb-4">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-blue-300 mb-2">
                        <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                        投資亮點
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed text-justify">{stock.report.highlights}</p>
                </div>
                <div>
                    <h4 className="flex items-center gap-2 text-sm font-bold text-purple-300 mb-2">
                        <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                        基本面體質
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed text-justify mb-4">{stock.report.fundamentals}</p>
                    <div className="grid grid-cols-3 gap-4 bg-slate-900/50 p-3 rounded-lg">
                        <div className="text-center">
                            <div className="text-xs text-slate-500 mb-1">EPS (TTM)</div>
                            <div className="text-white font-mono font-bold">{stock.valuation.eps} 元</div>
                        </div>
                        <div className="text-center border-l border-slate-700">
                            <div className="text-xs text-slate-500 mb-1">本益比 (PE)</div>
                            <div className="text-white font-mono font-bold">{stock.valuation.pe} 倍</div>
                        </div>
                         <div className="text-center border-l border-slate-700">
                            <div className="text-xs text-slate-500 mb-1">殖利率</div>
                            <div className="text-yellow-400 font-mono font-bold">{stock.valuation.yield}%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 2. Strategy & Technical */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Strategy Advice */}
             <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <span className="bg-twRed w-2 h-2 rounded-full"></span>
                    操作建議
                </h3>
                <div className="space-y-4">
                     <div>
                        <span className="text-twRed font-bold text-sm block mb-1">● 多頭策略</span>
                        <p className="text-xs text-slate-400 leading-relaxed">{stock.report.bullStrategy}</p>
                     </div>
                     <div>
                        <span className="text-twGreen font-bold text-sm block mb-1">● 空頭策略 / 風險控制</span>
                        <p className="text-xs text-slate-400 leading-relaxed">{stock.report.bearStrategy}</p>
                     </div>
                     <div className="pt-3 border-t border-slate-700 grid grid-cols-2 gap-4">
                        <div>
                             <div className="text-[10px] text-slate-500 uppercase">關鍵支撐</div>
                             <div className="text-twRed font-bold text-lg">{stock.report.keySupport}</div>
                        </div>
                        <div>
                             <div className="text-[10px] text-slate-500 uppercase">上檔壓力</div>
                             <div className="text-twGreen font-bold text-lg">{stock.report.keyResistance}</div>
                        </div>
                     </div>
                </div>
             </div>

             {/* PE Valuation Card */}
             <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span className="bg-blue-500 w-2 h-2 rounded-full"></span>
                        本益比估價
                     </h3>
                     <span className="text-xs text-slate-500">目前 PE: <span className="text-white font-bold">{stock.valuation.pe}x</span></span>
                </div>
                
                <div className="flex-1 flex flex-col justify-center space-y-3">
                    {stock.valuation.levels.map((level) => {
                        // Determine if current price is around this level
                        const isClosest = Math.abs(stock.price - level.price) < (stock.price * 0.05);
                        
                        return (
                            <div key={level.name} className="flex items-center justify-between text-sm py-1 border-b border-slate-700/30 last:border-0">
                                <span className={`${level.color} font-bold w-16`}>{level.name}</span>
                                <span className="text-slate-500 text-xs w-10">{level.multiple}x</span>
                                <div className="flex-1 mx-3 h-1 bg-slate-700 rounded-full relative">
                                    {isClosest && (
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg border-2 border-slate-900 animate-pulse"></div>
                                    )}
                                </div>
                                <span className="font-mono text-slate-300 w-16 text-right">{level.price}</span>
                            </div>
                        )
                    })}
                </div>
                <div className="mt-3 text-[10px] text-slate-500 text-center">
                    * 目標價 = 近四季累積 EPS × 本益比倍數
                </div>
             </div>
        </div>

        {/* 3. Institutional Tracking */}
        <div>
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <span className="bg-purple-500 w-2 h-2 rounded-full"></span>
                三大法人買賣超追蹤 (張)
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-700">
                <table className="w-full text-sm text-right">
                    <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3 text-left">日期</th>
                            <th className="px-4 py-3">外資</th>
                            <th className="px-4 py-3">投信</th>
                            <th className="px-4 py-3">自營商</th>
                            <th className="px-4 py-3">合計</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 bg-slate-900/50">
                        {stock.institutional.map((day) => (
                            <tr key={day.date} className="hover:bg-slate-800/30 transition">
                                <td className="px-4 py-3 text-left font-mono text-slate-300">{day.date}</td>
                                <td className={`px-4 py-3 font-mono font-bold ${day.foreign > 0 ? 'text-twRed' : 'text-twGreen'}`}>{fmtNum(day.foreign)}</td>
                                <td className={`px-4 py-3 font-mono font-bold ${day.trust > 0 ? 'text-twRed' : 'text-twGreen'}`}>{fmtNum(day.trust)}</td>
                                <td className={`px-4 py-3 font-mono font-bold ${day.dealer > 0 ? 'text-twRed' : 'text-twGreen'}`}>{fmtNum(day.dealer)}</td>
                                <td className={`px-4 py-3 font-mono font-bold ${day.total > 0 ? 'text-twRed' : 'text-twGreen'}`}>{fmtNum(day.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        
      </div>

    </div>
  );
};

export default StockCard;
