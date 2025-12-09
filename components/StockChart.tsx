
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  Area,
  ReferenceLine
} from 'recharts';
import { Candle } from '../types';

interface Props {
  code: string;
  data: Candle[];
  indicators: {
    ma5: boolean;
    ma10: boolean;
    ma20: boolean;
    ma60: boolean;
    bb: boolean;
    rsi: boolean;
    psy: boolean;
    kd: boolean;
    macd: boolean;
    vol: boolean;
    mom: boolean;
  };
}

// Constants
const MAIN_CHART_HEIGHT = 320;
const VOL_CHART_HEIGHT = 80;
const MOM_CHART_HEIGHT = 80;
const MACD_CHART_HEIGHT = 100;
const OSC_CHART_HEIGHT = 120;

const MAIN_CHART_MARGIN = {top: 30, right: 45, left: 0, bottom: 5}; 
const SUB_CHART_MARGIN = {top: 5, right: 45, left: 0, bottom: 0};
const TOOLTIP_CURSOR = { stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' };

// === HUD Component (Fixed Info Board) ===
const StockInfoBoard: React.FC<{ data: Candle; indicators: Props['indicators'] }> = ({ data, indicators }) => {
  if (!data) return null;
  
  const isUp = data.close > data.open;
  const colorClass = isUp ? 'text-twRed' : 'text-twGreen';

  const fmt = (val: number | undefined) => val !== undefined ? val.toFixed(2) : '-';
  const fmtVol = (val: number | undefined) => val !== undefined ? Math.round(val).toLocaleString() : '-';

  return (
    <div className="absolute top-0 left-0 right-12 h-[24px] flex items-center space-x-4 px-2 text-[10px] md:text-xs bg-slate-900/80 border-b border-slate-800 z-20 overflow-hidden whitespace-nowrap pointer-events-none select-none font-mono">
        <span className="text-slate-400 font-bold">{data.date}</span>
        
        <span className="text-slate-400">O:<span className={colorClass}>{fmt(data.open)}</span></span>
        <span className="text-slate-400">H:<span className={colorClass}>{fmt(data.high)}</span></span>
        <span className="text-slate-400">L:<span className={colorClass}>{fmt(data.low)}</span></span>
        <span className="text-slate-400">C:<span className={colorClass}>{fmt(data.close)}</span></span>
        <span className="text-slate-400">V:<span className="text-yellow-400">{fmtVol(data.volume)}</span></span>
        
        {/* Dynamic Indicators */}
        {indicators.ma5 && <span className="text-yellow-400">MA5:{fmt(data.ma5)}</span>}
        {indicators.ma10 && <span className="text-orange-400">MA10:{fmt(data.ma10)}</span>}
        {indicators.ma20 && <span className="text-purple-400">MA20:{fmt(data.ma20)}</span>}
        {indicators.ma60 && <span className="text-blue-400">MA60:{fmt(data.ma60)}</span>}
        
        {indicators.bb && (
           <span className="text-sky-300">BB:{fmt(data.upperBand)}/{fmt(data.lowerBand)}</span>
        )}
        {indicators.kd && <span className="text-pink-300">K:{fmt(data.k)} D:{fmt(data.d)}</span>}
        {indicators.rsi && <span className="text-cyan-300">RSI:{fmt(data.rsi14)}</span>}
        {indicators.mom && <span className="text-cyan-300">MOM:{fmt(data.momentum)}</span>}
        {indicators.macd && <span className="text-orange-300">MACD:{fmt(data.macd)}</span>}
    </div>
  );
};

// === Shapes ===
const WickBarShape = (props: any) => {
  const { x, y, height, payload, bandwidth } = props;
  return <rect x={x + (bandwidth || 0)/2 - 0.5} y={y} width={1} height={height} fill={payload.color} />;
};

const BodyBarShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  const finalHeight = height < 1 ? 1 : height; 
  return <rect x={x} y={y} width={width} height={finalHeight} fill={payload.color} />;
};

const VolumeBarShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  return <rect x={x} y={y} width={width} height={height} fill={payload.color} opacity={0.8} />;
};

const MacdHistShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  const fill = payload.hist > 0 ? '#ef4444' : '#10b981';
  return <rect x={x} y={y} width={width} height={height} fill={fill} opacity={0.8} />;
};

const StockChart: React.FC<Props> = ({ code, data, indicators }) => {
  // 1. Zoom State
  const [windowRange, setWindowRange] = useState(() => ({ 
      start: Math.max(0, data.length - 60), 
      end: data.length 
  }));
  
  // 2. Hover State for HUD
  const [hoverData, setHoverData] = useState<Candle | null>(null);
  
  // 3. Crosshair State (Which chart + Y position)
  const [activeCrosshair, setActiveCrosshair] = useState<{ id: string; y: number } | null>(null);
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const ticking = useRef(false);

  // Reset on data change
  useEffect(() => {
     const targetStart = Math.max(0, data.length - 60);
     const targetEnd = data.length;
     setWindowRange(prev => {
       if (prev.start === targetStart && prev.end === targetEnd) return prev;
       return { start: targetStart, end: targetEnd };
     });
     setHoverData(null);
     setActiveCrosshair(null);
  }, [data.length, code]);

  // Wheel Event
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          setWindowRange(prev => {
            const MIN_ZOOM = 15;
            const currentLength = prev.end - prev.start;
            const zoomSpeed = Math.max(1, Math.floor(currentLength * 0.1));
            
            let newStart = prev.start;
            const newEnd = prev.end; 

            if (e.deltaY > 0) {
              newStart = Math.max(0, newStart - zoomSpeed);
            } else {
              if (currentLength > MIN_ZOOM) {
                newStart = Math.min(newEnd - MIN_ZOOM, newStart + zoomSpeed);
              }
            }
            newStart = Math.round(newStart);
            if (newStart === prev.start && newEnd === prev.end) return prev;
            return { start: newStart, end: newEnd };
          });
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // View Data
  const viewData = useMemo(() => {
    return data.slice(windowRange.start, windowRange.end).map(d => ({
      ...d,
      wick: [d.low, d.high], 
      body: [Math.min(d.open, d.close), Math.max(d.open, d.close)],
      isUp: d.close > d.open,
      color: d.close > d.open ? '#ef4444' : '#10b981'
    }));
  }, [data, windowRange]);

  // Domain Calculations for All Charts
  const domains = useMemo(() => {
    let minP = 0, maxP = 100;
    let maxV = 0;
    let minMom = -1, maxMom = 1;
    let minMacd = -1, maxMacd = 1;

    if (viewData.length > 0) {
        // Price
        const lows = viewData.map(d => d.low).filter(v => !isNaN(v));
        const highs = viewData.map(d => d.high).filter(v => !isNaN(v));
        if (lows.length > 0) {
            minP = Math.min(...lows) * 0.99;
            maxP = Math.max(...highs) * 1.01;
            if (Math.abs(maxP - minP) < 0.01) { minP -= 1; maxP += 1; }
        }
        minP = Number(minP.toFixed(2));
        maxP = Number(maxP.toFixed(2));

        // Volume
        const vols = viewData.map(d => d.volume).filter(v => !isNaN(v));
        if(vols.length > 0) maxV = Math.max(...vols) * 1.05;

        // Momentum
        const moms = viewData.map(d => d.momentum || 0).filter(v => !isNaN(v));
        if(moms.length > 0) {
            minMom = Math.min(...moms);
            maxMom = Math.max(...moms);
            const padding = Math.max(Math.abs(minMom), Math.abs(maxMom)) * 0.1;
            minMom -= padding;
            maxMom += padding;
        }

        // MACD
        const macdVals = viewData.flatMap(d => [d.macd, d.signal, d.hist]).filter(v => typeof v === 'number' && !isNaN(v)) as number[];
        if(macdVals.length > 0) {
            minMacd = Math.min(...macdVals);
            maxMacd = Math.max(...macdVals);
            const padding = Math.max(Math.abs(minMacd), Math.abs(maxMacd)) * 0.1;
            minMacd -= padding;
            maxMacd += padding;
        }
    }
    return { 
        price: [minP, maxP], 
        vol: [0, maxV],
        mom: [minMom, maxMom],
        macd: [minMacd, maxMacd],
        osc: [0, 100]
    };
  }, [viewData]);

  const syncId = `chart-sync-${code}`;
  
  // Handlers
  const handleMouseMove = (nextState: any) => {
      if (nextState && nextState.activePayload && nextState.activePayload.length > 0) {
          setHoverData(nextState.activePayload[0].payload);
      }
  };

  const handleChartMouseMove = (id: string, nextState: any) => {
    handleMouseMove(nextState);
    if (nextState && nextState.activeCoordinate) {
        setActiveCrosshair({ id, y: nextState.activeCoordinate.y });
    }
  };
  
  const handleMouseLeave = () => {
      setHoverData(null);
      setActiveCrosshair(null);
  };

  // Generic Calculator for Value from Y pixel
  const calcValueFromY = (y: number, height: number, margin: any, domain: number[]) => {
      const plotHeight = height - margin.top - margin.bottom;
      const relativeY = y - margin.top;
      
      // Clamp
      if (relativeY < 0) return domain[1];
      if (relativeY > plotHeight) return domain[0];

      // Recharts: Top(0) = Max, Bottom(Height) = Min
      const ratio = relativeY / plotHeight;
      const range = domain[1] - domain[0];
      return domain[1] - (ratio * range);
  };

  // Crosshair Overlay Component
  const CrosshairOverlay = ({ chartId, height, margin, domain, format }: any) => {
      if (!activeCrosshair || activeCrosshair.id !== chartId) return null;
      
      const val = calcValueFromY(activeCrosshair.y, height, margin, domain);
      
      return (
        <>
            <div 
                className="absolute left-0 right-[45px] border-t border-dashed border-slate-400/60 z-10 pointer-events-none"
                style={{ top: activeCrosshair.y }}
            />
            <div 
                className="absolute right-0 w-[45px] flex justify-center items-center z-10 pointer-events-none"
                style={{ top: activeCrosshair.y - 10 }}
            >
                <span className="bg-slate-700 text-white text-[10px] font-mono px-1 py-0.5 rounded shadow-sm">
                    {format(val)}
                </span>
            </div>
        </>
      );
  };
  
  // Data to show in HUD (Hover or Last)
  const currentDisplayData = hoverData || (viewData.length > 0 ? viewData[viewData.length - 1] : null);

  if (!viewData || viewData.length === 0) return <div className="h-[320px] flex items-center justify-center text-slate-500">No Data</div>;

  // Construct Oscillator Label
  const oscLabels = [];
  if (indicators.kd) oscLabels.push('KD');
  if (indicators.rsi) oscLabels.push('RSI');
  if (indicators.psy) oscLabels.push('PSY');
  const oscTitle = oscLabels.join(' / ');

  return (
    <div 
      ref={chartContainerRef}
      className="flex flex-col select-none relative group bg-slate-900/50 rounded-lg overflow-hidden"
      style={{ touchAction: 'none' }}
      onMouseLeave={handleMouseLeave}
    >
      {/* Fixed HUD Info Board */}
      {currentDisplayData && <StockInfoBoard data={currentDisplayData} indicators={indicators} />}

      {/* === MAIN CHART: Price === */}
      <div className="w-full border-slate-800 border-b-0 relative" style={{ height: MAIN_CHART_HEIGHT }}>
        <CrosshairOverlay 
            chartId="main" 
            height={MAIN_CHART_HEIGHT} 
            margin={MAIN_CHART_MARGIN} 
            domain={domains.price} 
            format={(v: number) => v.toFixed(2)} 
        />

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={viewData} 
            syncId={syncId}
            margin={MAIN_CHART_MARGIN}
            barGap={0}
            onMouseMove={(e) => handleChartMouseMove('main', e)}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id="bullishGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={true} opacity={0.2} />
            
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#64748b', fontSize: 10 }} 
              tickFormatter={(str) => {
                  if(!str) return '';
                  if(str.includes(':')) return str.split(' ')[1]; 
                  return str.substring(5);
              }} 
              minTickGap={50}
              axisLine={false}
            />
            
            <YAxis 
              domain={domains.price} 
              orientation="right"
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
              tickCount={6}
              width={45}
              axisLine={false}
              tickFormatter={(val) => Number(val).toFixed(2)}
              allowDecimals={true}
            />

            <Tooltip content={<></>} cursor={TOOLTIP_CURSOR} isAnimationActive={false} filterNull={true} />

            <Bar dataKey="wick" barSize={1} shape={WickBarShape} isAnimationActive={false} />
            <Bar dataKey="body" barSize={8} shape={BodyBarShape} isAnimationActive={false} />

            {indicators.ma5 && <Line type="monotone" dataKey="ma5" stroke="#facc15" dot={false} strokeWidth={1} isAnimationActive={false} connectNulls />}
            {indicators.ma10 && <Line type="monotone" dataKey="ma10" stroke="#fb923c" dot={false} strokeWidth={1} isAnimationActive={false} connectNulls />}
            {indicators.ma20 && <Line type="monotone" dataKey="ma20" stroke="#a855f7" dot={false} strokeWidth={1} isAnimationActive={false} connectNulls />}
            {indicators.ma60 && <Line type="monotone" dataKey="ma60" stroke="#3b82f6" dot={false} strokeWidth={2} isAnimationActive={false} connectNulls />}
            
            {indicators.bb && (
              <>
                <Area type="monotone" dataKey="upperBand" stroke="none" fill="#60a5fa" fillOpacity={0.05} isAnimationActive={false} connectNulls />
                <Area type="monotone" dataKey="lowerBand" stroke="none" fill="#60a5fa" fillOpacity={0.05} isAnimationActive={false} connectNulls />
                <Line type="monotone" dataKey="upperBand" stroke="#60a5fa" strokeDasharray="3 3" dot={false} strokeWidth={1} isAnimationActive={false} connectNulls />
                <Line type="monotone" dataKey="lowerBand" stroke="#60a5fa" strokeDasharray="3 3" dot={false} strokeWidth={1} isAnimationActive={false} connectNulls />
                <Line type="monotone" dataKey="middleBand" stroke="#60a5fa" strokeOpacity={0} dot={false} strokeWidth={0} isAnimationActive={false} connectNulls />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* === SUB CHART: VOLUME === */}
      {indicators.vol && (
        <div className="w-full border border-slate-800 border-t-0 border-x-0 relative" style={{ height: VOL_CHART_HEIGHT }}>
           <div className="absolute top-1 left-2 text-[10px] font-bold text-slate-500 select-none pointer-events-none">
              成交量
           </div>
           <CrosshairOverlay 
                chartId="vol" 
                height={VOL_CHART_HEIGHT} 
                margin={SUB_CHART_MARGIN} 
                domain={domains.vol} 
                format={(v: number) => (v/1000).toFixed(1) + 'k'} 
           />
           <ResponsiveContainer width="100%" height="100%">
             <ComposedChart 
                data={viewData} 
                syncId={syncId}
                margin={SUB_CHART_MARGIN}
                onMouseMove={(e) => handleChartMouseMove('vol', e)}
                onMouseLeave={handleMouseLeave}
             >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={true} opacity={0.2} />
                <YAxis domain={domains.vol} orientation="right" tick={{ fill: '#64748b', fontSize: 9 }} width={45} axisLine={false} tickCount={3} tickFormatter={(val) => `${(val/1000).toFixed(0)}k`}/>
                <XAxis dataKey="date" hide />
                <Tooltip content={<></>} cursor={TOOLTIP_CURSOR} isAnimationActive={false} />
                <Bar dataKey="volume" barSize={6} shape={VolumeBarShape} isAnimationActive={false} />
             </ComposedChart>
           </ResponsiveContainer>
        </div>
      )}

      {/* === SUB CHART: MOMENTUM === */}
      {indicators.mom && (
        <div className="w-full border border-slate-800 border-t-0 border-x-0 relative" style={{ height: MOM_CHART_HEIGHT }}>
           <div className="absolute top-1 left-2 text-[10px] font-bold text-slate-500 select-none pointer-events-none">
              動能 (Momentum)
           </div>
           <CrosshairOverlay 
                chartId="mom" 
                height={MOM_CHART_HEIGHT} 
                margin={SUB_CHART_MARGIN} 
                domain={domains.mom} 
                format={(v: number) => v.toFixed(2)} 
           />
           <ResponsiveContainer width="100%" height="100%">
             <ComposedChart 
                data={viewData} 
                syncId={syncId}
                margin={SUB_CHART_MARGIN}
                onMouseMove={(e) => handleChartMouseMove('mom', e)}
                onMouseLeave={handleMouseLeave}
             >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={true} opacity={0.2} />
                <YAxis domain={domains.mom} orientation="right" tick={{ fill: '#64748b', fontSize: 9 }} width={45} axisLine={false} tickCount={3} tickFormatter={(val) => Number(val).toFixed(2)}/>
                <XAxis dataKey="date" hide />
                <Tooltip content={<></>} cursor={TOOLTIP_CURSOR} isAnimationActive={false} />
                <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="momentum" stroke="#22d3ee" dot={false} strokeWidth={1.5} isAnimationActive={false} connectNulls />
             </ComposedChart>
           </ResponsiveContainer>
        </div>
      )}

      {/* === SUB CHART: MACD === */}
      {indicators.macd && (
        <div className="w-full border border-slate-800 border-t-0 border-x-0 relative" style={{ height: MACD_CHART_HEIGHT }}>
           <div className="absolute top-1 left-2 text-[10px] font-bold text-slate-500 select-none pointer-events-none">
              MACD
           </div>
           <CrosshairOverlay 
                chartId="macd" 
                height={MACD_CHART_HEIGHT} 
                margin={SUB_CHART_MARGIN} 
                domain={domains.macd} 
                format={(v: number) => v.toFixed(2)} 
           />
           <ResponsiveContainer width="100%" height="100%">
             <ComposedChart 
                data={viewData} 
                syncId={syncId}
                margin={SUB_CHART_MARGIN}
                onMouseMove={(e) => handleChartMouseMove('macd', e)}
                onMouseLeave={handleMouseLeave}
             >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={true} opacity={0.2} />
                <YAxis domain={domains.macd} orientation="right" tick={{ fill: '#64748b', fontSize: 9 }} width={45} axisLine={false} tickCount={3} tickFormatter={(val) => Number(val).toFixed(2)}/>
                <XAxis dataKey="date" hide />
                <Tooltip content={<></>} cursor={TOOLTIP_CURSOR} isAnimationActive={false} />
                <ReferenceLine y={0} stroke="#475569" />
                <Bar dataKey="hist" fill="#94a3b8" barSize={4} shape={MacdHistShape} isAnimationActive={false} />
                <Line type="monotone" dataKey="macd" stroke="#f59e0b" dot={false} strokeWidth={1} isAnimationActive={false} connectNulls />
                <Line type="monotone" dataKey="signal" stroke="#3b82f6" dot={false} strokeWidth={1} isAnimationActive={false} connectNulls />
             </ComposedChart>
           </ResponsiveContainer>
        </div>
      )}

      {/* === SUB CHART: OSCILLATORS === */}
      {(indicators.rsi || indicators.psy || indicators.kd) && (
        <div className="w-full border border-slate-800 border-t-0 border-x-0 relative rounded-b" style={{ height: OSC_CHART_HEIGHT }}>
           <div className="absolute top-1 left-2 text-[10px] font-bold text-slate-500 select-none pointer-events-none">
              {oscTitle}
           </div>
           <CrosshairOverlay 
                chartId="osc" 
                height={OSC_CHART_HEIGHT} 
                margin={SUB_CHART_MARGIN} 
                domain={domains.osc} 
                format={(v: number) => v.toFixed(0)} 
           />
           <ResponsiveContainer width="100%" height="100%">
             <ComposedChart 
                data={viewData} 
                syncId={syncId}
                margin={SUB_CHART_MARGIN}
                onMouseMove={(e) => handleChartMouseMove('osc', e)}
                onMouseLeave={handleMouseLeave}
             >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={true} opacity={0.2} />
                <YAxis domain={domains.osc} orientation="right" tick={{ fill: '#64748b', fontSize: 9 }} ticks={[20, 50, 80]} width={45} axisLine={false} tickFormatter={(val) => Number(val).toFixed(0)} />
                <XAxis dataKey="date" hide />
                <Tooltip content={<></>} cursor={TOOLTIP_CURSOR} isAnimationActive={false} />

                <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="2 2" strokeOpacity={0.3} />
                <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="2 2" strokeOpacity={0.2} />
                <ReferenceLine y={20} stroke="#10b981" strokeDasharray="2 2" strokeOpacity={0.3} />
                
                {indicators.kd && <Line type="monotone" dataKey="k" stroke="#fbbf24" dot={false} strokeWidth={1} isAnimationActive={false} connectNulls />}
                {indicators.kd && <Line type="monotone" dataKey="d" stroke="#a855f7" dot={false} strokeWidth={1} isAnimationActive={false} connectNulls />}
                {indicators.rsi && <Line type="monotone" dataKey="rsi14" stroke="#38bdf8" dot={false} strokeWidth={1.5} isAnimationActive={false} connectNulls />}
                {indicators.psy && <Line type="monotone" dataKey="psy12" stroke="#f472b6" dot={false} strokeWidth={1.5} isAnimationActive={false} connectNulls />}
             </ComposedChart>
           </ResponsiveContainer>
        </div>
      )}

    </div>
  );
};

export default React.memo(StockChart);
