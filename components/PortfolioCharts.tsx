
import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { CHART_COLORS } from '../constants';

/**
 * Hook customizado para medir as dimensões reais de um elemento.
 */
function useElementDimensions() {
  const ref = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const observeTarget = ref.current;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(observeTarget);
    
    const initialRect = observeTarget.getBoundingClientRect();
    if (initialRect.width > 0 && initialRect.height > 0) {
      setDimensions({ width: initialRect.width, height: initialRect.height });
    }

    return () => resizeObserver.unobserve(observeTarget);
  }, []);

  return { ref, dimensions };
}

interface DonutChartProps {
  data: { name: string; value: number }[];
}

export const AllocationDonut: React.FC<DonutChartProps> = ({ data }) => {
  const { ref, dimensions } = useElementDimensions();

  if (!data || data.length === 0) return <div className="h-[280px] flex items-center justify-center text-[#86868B]">Sem dados</div>;

  return (
    <div ref={ref} className="h-[280px] w-full relative min-w-0 overflow-hidden">
      {dimensions.width > 0 && dimensions.height > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <PieChart width={dimensions.width} height={dimensions.height}>
            <Tooltip 
              separator=""
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/90 dark:bg-black/40 backdrop-blur-xl p-3 px-5 rounded-2xl text-center border border-[#D2D2D7] dark:border-white/10 shadow-2xl">
                      <p className="text-[10px] font-semibold text-[#86868B] dark:text-[#8E8E93] uppercase tracking-[0.1em] mb-1">
                        {payload[0].name}
                      </p>
                      <p className="text-lg font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                        R$ {Number(payload[0].value).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={data}
              innerRadius="68%"
              outerRadius="92%"
              paddingAngle={2}
              dataKey="value"
              animationBegin={0}
              animationDuration={1000}
              stroke="none"
              isAnimationActive={true}
              cx="50%"
              cy="50%"
            >
              {data.map((_entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={CHART_COLORS[index % CHART_COLORS.length]} 
                  className="outline-none"
                />
              ))}
            </Pie>
          </PieChart>
        </div>
      )}
    </div>
  );
};

export const EvolutionArea: React.FC<{ data: any[] }> = ({ data }) => {
  const { ref, dimensions } = useElementDimensions();

  if (!data || data.length === 0) return <div className="h-[300px] flex items-center justify-center text-[#86868B]">Sem dados</div>;

  return (
    <div ref={ref} className="h-[300px] w-full relative min-w-0 overflow-hidden">
      {dimensions.width > 0 && dimensions.height > 0 && (
        <div className="absolute inset-0">
          <AreaChart 
            width={dimensions.width} 
            height={dimensions.height} 
            data={data} 
            margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#007AFF" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#86868B', fontSize: 11, fontWeight: 600 }}
              dy={10}
            />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip 
               separator=""
               content={({ active, payload, label }) => {
                 if (active && payload && payload.length) {
                   const { value, gain } = payload[0].payload;
                   const isPositive = gain >= 0;
                   return (
                    <div className="bg-white/90 dark:bg-black/40 backdrop-blur-xl p-4 px-6 rounded-[24px] text-center border border-[#D2D2D7] dark:border-white/10 shadow-3xl min-w-[160px]">
                      <p className="text-[9px] font-bold text-[#86868B] dark:text-[#8E8E93] uppercase tracking-[0.15em] mb-2">
                        {label}
                      </p>
                      
                      <div className="mb-2">
                        <p className="text-[10px] text-[#86868B] dark:text-[#8E8E93] font-normal mb-0.5">Patrimônio</p>
                        <p className="text-xl font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                          R$ {Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#E5E5E7] dark:border-white/5">
                        <p className="text-[10px] text-[#86868B] dark:text-[#8E8E93] font-normal mb-0.5">Ganho no mês</p>
                        <p 
                          className={`text-sm font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
                        >
                          {isPositive ? '+' : ''} R$ {Number(gain).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </div>
                   );
                 }
                 return null;
               }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#007AFF" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorValue)" 
              animationDuration={1200}
            />
          </AreaChart>
        </div>
      )}
    </div>
  );
};
