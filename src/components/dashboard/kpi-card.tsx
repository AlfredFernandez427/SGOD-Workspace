
import React from 'react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  label: string;
  value: string;
  subValue?: string;
  color?: 'primary' | 'destructive' | 'emerald' | 'amber' | 'accent';
  small?: boolean;
  className?: string;
  onClick?: () => void;
}

export function KPICard({ label, value, subValue, color = 'primary', small, className, onClick }: KPICardProps) {
  const accentColors = {
    primary: 'bg-primary shadow-primary/20',
    destructive: 'bg-destructive shadow-destructive/20',
    emerald: 'bg-emerald-500 shadow-emerald-500/20',
    amber: 'bg-amber-500 shadow-amber-500/20',
    accent: 'bg-accent shadow-accent/20'
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-2xl shadow-lg transition-all group relative overflow-hidden",
        small ? 'p-6' : 'p-8',
        onClick && "cursor-pointer hover:border-primary/30",
        className
      )}
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <div className={cn("w-24 h-24 rounded-full blur-3xl", accentColors[color])}></div>
      </div>
      
      <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 relative z-10">{label}</p>
      
      <div className="flex items-baseline gap-3 relative z-10">
        <h3 className="text-3xl font-black text-foreground tracking-tighter">{value}</h3>
        {subValue && <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight">{subValue}</span>}
      </div>
    </div>
  );
}
