
import React from 'react';
import { TrendingUp, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AnalyticsCenter() {
  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-3">
          <TrendingUp size={18} className="text-emerald-500" /> Data & Analytics Center
        </h3>
      </div>
      
      <div className="space-y-10 flex-1 flex flex-col justify-around">
        <div className="w-full">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-6 text-center">Projected Learner Population Trend (P&R)</p>
          <div className="h-40 flex items-end justify-between px-2 gap-3">
            {[40, 65, 45, 90, 75, 95].map((h, i) => (
              <div key={i} className="flex-1 bg-secondary/20 rounded-t-lg relative group overflow-hidden">
                <div 
                  className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-lg transition-all duration-1000 ease-out" 
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-foreground/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
            <span>2019</span>
            <span className="text-primary font-black">2024 PROJ.</span>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Feeding Program Impact (SHN)</p>
            <Activity size={14} className="text-emerald-500" />
          </div>
          <div className="space-y-6">
            <ImpactBar label="Baseline (2023)" value="12% Malnourished" color="destructive" percent={60} />
            <ImpactBar label="Endline (Current)" value="4% Malnourished" color="emerald" percent={20} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ImpactBar({ label, value, color, percent }: { label: string, value: string, color: string, percent: number }) {
  const barColors: Record<string, string> = {
    destructive: 'bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.2)]',
    emerald: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    primary: 'bg-primary shadow-[0_0_10px_rgba(51,133,255,0.2)]'
  };

  const textColors: Record<string, string> = {
    destructive: 'text-destructive',
    emerald: 'text-emerald-500',
    primary: 'text-primary'
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-black", textColors[color])}>{value}</span>
      </div>
      <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000", barColors[color])} 
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
}
