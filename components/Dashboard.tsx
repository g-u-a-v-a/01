import React from 'react';
import { MarketSentiment } from '../types';

const Dashboard: React.FC = () => {
  // Mock Data
  const sentiment: MarketSentiment = {
    vix: 14.5,
    fearGreed: 65,
    etfFlow: 2, // Moderate inflow
    marketTrend: 'Bull',
    twii: 20123.45,
    twiiChange: 1.2
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* VIX */}
      <div className="bg-cardBg p-4 rounded-xl border border-slate-700 shadow-lg">
        <div className="text-slate-400 text-xs uppercase font-bold mb-1">VIX 恐慌指數</div>
        <div className="text-2xl font-bold text-white">{sentiment.vix}</div>
        <div className="text-xs text-slate-500 mt-1">低於 20 (平穩)</div>
      </div>

      {/* Fear & Greed */}
      <div className="bg-cardBg p-4 rounded-xl border border-slate-700 shadow-lg">
        <div className="text-slate-400 text-xs uppercase font-bold mb-1">恐慌 / 貪婪</div>
        <div className="text-2xl font-bold text-yellow-400">{sentiment.fearGreed}</div>
        <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2">
          <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${sentiment.fearGreed}%` }}></div>
        </div>
      </div>

      {/* ETF Flow */}
      <div className="bg-cardBg p-4 rounded-xl border border-slate-700 shadow-lg">
        <div className="text-slate-400 text-xs uppercase font-bold mb-1">ETF 資金流向 (0050/56)</div>
        <div className="flex items-center space-x-2">
           <span className={`text-2xl font-bold ${sentiment.etfFlow > 1 ? 'text-twRed' : 'text-slate-300'}`}>
             {sentiment.etfFlow > 1 ? '淨流入' : '淨流出'}
           </span>
        </div>
        <div className="text-xs text-slate-500 mt-1">外資/投信 動向積極</div>
      </div>

      {/* TWII */}
      <div className="bg-cardBg p-4 rounded-xl border border-slate-700 shadow-lg">
        <div className="text-slate-400 text-xs uppercase font-bold mb-1">加權指數 ^TWII</div>
        <div className={`text-2xl font-bold ${sentiment.twiiChange > 0 ? 'text-twRed' : 'text-twGreen'}`}>
          {sentiment.twii.toLocaleString()}
        </div>
        <div className={`text-xs font-semibold mt-1 ${sentiment.twiiChange > 0 ? 'text-twRed' : 'text-twGreen'}`}>
          {sentiment.twiiChange > 0 ? '▲' : '▼'} {Math.abs(sentiment.twiiChange)}%
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
