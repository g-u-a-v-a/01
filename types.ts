
export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  // Pre-calculated Indicators
  ma5?: number;
  ma10?: number;
  ma20?: number;
  ma60?: number;
  ma120?: number;
  ma240?: number;
  ema12?: number;
  ema26?: number;
  upperBand?: number; // BB
  lowerBand?: number; // BB
  middleBand?: number; // BB
  rsi6?: number;
  rsi14?: number;
  psy12?: number;
  psy24?: number;
  macd?: number;
  signal?: number;
  hist?: number;
  k?: number; // KD
  d?: number; // KD
  atr?: number;
  obv?: number;
  mfi?: number;
  momentum?: number;
}

export type Timeframe = '1m' | '5m' | '10m' | '15m' | '30m' | '60m' | 'D' | 'W' | 'M';

export interface SwingAnalysis {
  mainForceSentiment: 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell'; // 主力動向
  mainForceScore: number; // 0-100
  entryPrice: number; // 最佳進場
  targetPrice: number; // 主力目標
  stopLossPrice: number; // 停損價
  strategyText: string; // 波段契機說明
}

export interface InstitutionalDaily {
  date: string;
  foreign: number; // 外資
  trust: number;   // 投信
  dealer: number;  // 自營商
  total: number;
}

export interface ValuationData {
  eps: number;
  pe: number;
  yield: number;
  levels: {
    name: string;
    multiple: number;
    price: number;
    color: string; // class name part
  }[];
}

export interface AnalysisReport {
  highlights: string; // 投資亮點
  fundamentals: string; // 基本面體質
  techAnalysis: string; // 技術面解析
  chipsAnalysis: string; // 籌碼與消息
  bullStrategy: string; // 多頭策略
  bearStrategy: string; // 空頭策略
  keySupport: number;
  keyResistance: number;
}

export interface StockData {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  data: Candle[]; // History
  tags: string[];
  techScore: number;
  fundScore: number;
  totalScore: number;
  aiSummary: string;
  aiRecommendation: 'BUY' | 'NEUTRAL' | 'SELL';
  aiAction: string;
  swing: SwingAnalysis; 
  institutional: InstitutionalDaily[]; // Recent 5 days
  valuation: ValuationData;
  report: AnalysisReport;
}

export interface FilterState {
  trend_bullish: boolean; // MA20 > MA60 > MA120
  trend_long_bullish: boolean; // Price > MA60 > MA120
  momentum_strong_20: boolean; // MOM20 > 10%
  rsi_bullish: boolean; // 50 < RSI < 70
  psy_hot: boolean; // PSY > 70
  psy_cold: boolean; // PSY < 30
  volume_surge: boolean; // Vol > 1.5x MA20 Vol
  price_box_breakout: boolean; // Breakout N days
  volatility_high: boolean; // High ATR
}

export interface MarketSentiment {
  vix: number;
  fearGreed: number; // 0-100
  etfFlow: number; // 0-3
  marketTrend: 'Bull' | 'Bear' | 'Neutral';
  twii: number;
  twiiChange: number;
}
