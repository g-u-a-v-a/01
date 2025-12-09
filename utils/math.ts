
import { Candle } from '../types';

// Simple Moving Average
export const calculateSMA = (data: Candle[], period: number): number[] => {
  const results: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      results.push(NaN);
      continue;
    }
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    results.push(sum / period);
  }
  return results;
};

// Exponential Moving Average
export const calculateEMA = (data: Candle[], period: number): number[] => {
  const results: number[] = [];
  const k = 2 / (period + 1);
  let prevEma = data[0].close; // Initialize with first close
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      results.push(prevEma);
    } else {
      const ema = (data[i].close * k) + (prevEma * (1 - k));
      results.push(ema);
      prevEma = ema;
    }
  }
  return results;
};

// RSI
export const calculateRSI = (data: Candle[], period: number): number[] => {
  const results: number[] = [];
  let gains = 0;
  let losses = 0;

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      results.push(NaN);
      continue;
    }

    const change = data[i].close - data[i - 1].close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    if (i < period) {
      gains += gain;
      losses += loss;
      results.push(NaN);
    } else if (i === period) {
      gains += gain;
      losses += loss;
      let avgGain = gains / period;
      let avgLoss = losses / period;
      let rs = avgGain / avgLoss;
      results.push(100 - (100 / (1 + rs)));
    } else {
      // Simple smoothing
      let sumGain = 0;
      let sumLoss = 0;
      for(let k=0; k<period; k++) {
         const c = data[i-k].close - data[i-k-1].close;
         if(c > 0) sumGain += c;
         else sumLoss += Math.abs(c);
      }
      const rs = sumLoss === 0 ? 100 : (sumGain/period) / (sumLoss/period);
      results.push(100 - (100 / (1 + rs)));
    }
  }
  return results;
};

// KD (Stochastic Oscillator)
export const calculateKD = (data: Candle[], period: number = 9) => {
  const kValues: number[] = [];
  const dValues: number[] = [];
  
  let prevK = 50;
  let prevD = 50;

  for(let i=0; i < data.length; i++) {
    if (i < period - 1) {
      kValues.push(NaN);
      dValues.push(NaN);
      continue;
    }

    // Find Highest High and Lowest Low in last N days
    let highest = -Infinity;
    let lowest = Infinity;
    for(let j=0; j<period; j++) {
      if(data[i-j].high > highest) highest = data[i-j].high;
      if(data[i-j].low < lowest) lowest = data[i-j].low;
    }

    const rsv = (highest === lowest) ? 50 : ((data[i].close - lowest) / (highest - lowest)) * 100;
    
    // K = 2/3 * prevK + 1/3 * RSV
    const k = (2/3) * prevK + (1/3) * rsv;
    // D = 2/3 * prevD + 1/3 * K
    const d = (2/3) * prevD + (1/3) * k;

    kValues.push(k);
    dValues.push(d);
    
    prevK = k;
    prevD = d;
  }
  return { k: kValues, d: dValues };
};

// PSY (Psychological Line)
export const calculatePSY = (data: Candle[], period: number): number[] => {
  const results: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      results.push(NaN);
      continue;
    }
    let upDays = 0;
    for (let j = 0; j < period; j++) {
      if ((i - j) > 0) {
        if (data[i - j].close > data[i - j - 1].close) {
          upDays++;
        }
      }
    }
    results.push((upDays / period) * 100);
  }
  return results;
};

// Bollinger Bands
export const calculateBollinger = (data: Candle[], period: number, multiplier: number) => {
  const sma = calculateSMA(data, period);
  const upper: number[] = [];
  const lower: number[] = [];
  const bandwidth: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(NaN);
      lower.push(NaN);
      bandwidth.push(NaN);
      continue;
    }
    let sumSqDiff = 0;
    const mean = sma[i];
    for (let j = 0; j < period; j++) {
      const diff = data[i - j].close - mean;
      sumSqDiff += diff * diff;
    }
    const stdDev = Math.sqrt(sumSqDiff / period);
    upper.push(mean + (multiplier * stdDev));
    lower.push(mean - (multiplier * stdDev));
    bandwidth.push(((mean + (multiplier * stdDev)) - (mean - (multiplier * stdDev))) / mean);
  }
  return { sma, upper, lower, bandwidth };
};

// MACD (12, 26, 9)
export const calculateMACD = (data: Candle[]) => {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  const macdLine: number[] = [];
  
  for(let i=0; i<data.length; i++) {
    macdLine.push(ema12[i] - ema26[i]);
  }

  const signalLine: number[] = [];
  const validMacdData = macdLine.filter(n => !isNaN(n));
  const signalValues: number[] = [];
  if (validMacdData.length > 0) {
      const k = 2 / (9 + 1);
      let prev = validMacdData[0];
      signalValues.push(prev);
      for(let j=1; j<validMacdData.length; j++){
          const val = (validMacdData[j] * k) + (prev * (1-k));
          signalValues.push(val);
          prev = val;
      }
  }

  const offset = macdLine.length - signalValues.length;
  const finalSignal = new Array(offset).fill(NaN).concat(signalValues);
  const hist = macdLine.map((v, i) => v - finalSignal[i]);

  return { macdLine, signalLine: finalSignal, hist };
};

export const calculateATR = (data: Candle[], period: number): number[] => {
    const trs: number[] = [];
    for(let i=0; i<data.length; i++) {
        if (i===0) {
            trs.push(data[i].high - data[i].low);
            continue;
        }
        const h_l = data[i].high - data[i].low;
        const h_pc = Math.abs(data[i].high - data[i-1].close);
        const l_pc = Math.abs(data[i].low - data[i-1].close);
        trs.push(Math.max(h_l, h_pc, l_pc));
    }

    const atr: number[] = [];
    for(let i=0; i<trs.length; i++) {
        if(i < period -1) {
            atr.push(NaN);
            continue;
        }
        let sum = 0;
        for(let j=0; j<period; j++) sum += trs[i-j];
        atr.push(sum/period);
    }
    return atr;
};

// Momentum (Close - Close N days ago)
export const calculateMomentum = (data: Candle[], period: number): number[] => {
  const results: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      results.push(NaN);
    } else {
      results.push(data[i].close - data[i - period].close);
    }
  }
  return results;
};
