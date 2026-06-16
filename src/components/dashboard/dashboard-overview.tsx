"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Target,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { KPICard } from './kpi-card';
import { TicketList } from './ticket-list';
import { PersonnelDirectory } from './personnel-directory';
import { format, parseISO, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface DashboardOverviewProps {
  allInfrastructure: any[];
  totalDonationsValue: number;
  allSchedules: any[];
  isGuestUser: boolean;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  onOpenEventModal: () => void;
  onOpenInquiryModal: () => void;
}

export function DashboardOverview({
  allInfrastructure,
  totalDonationsValue,
  allSchedules,
  isGuestUser,
  selectedDate,
  setSelectedDate,
  onOpenEventModal,
  onOpenInquiryModal
}: DashboardOverviewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const displayedEvents = React.useMemo(() => {
    if (!allSchedules) return [];
    const targetDate = selectedDate ? startOfDay(selectedDate) : startOfDay(new Date());
    return allSchedules.filter(ev => {
      if (ev.type === 'Task' && isGuestUser) return false;
      const eventStart = startOfDay(parseISO(ev.date));
      const eventEnd = ev.endDate ? startOfDay(parseISO(ev.endDate)) : eventStart;
      return targetDate >= eventStart && targetDate <= eventEnd;
    });
  }, [allSchedules, selectedDate, isGuestUser]);

  const formatCurrency = (value: number) => {
    if (!value || value === 0) return "₱ 0.0";
    if (value >= 1000000000) return `₱ ${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `₱ ${(value / 1000000).toFixed(1)}M`;
    return `₱ ${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">SGOD <span className="text-accent">One-Stop Service</span> Portal</h1>
          <p className="text-[15px] text-muted-foreground mt-2 font-medium">Monitoring and Strategic Operations for SGOD Davao del Sur.</p>
        </div>
        {isGuestUser && (
          <Button onClick={onOpenInquiryModal} className="h-12 px-6 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-xl text-[11px] font-black uppercase">
            Submit Public Inquiry
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <KPICard label="Partnership Resources" value={formatCurrency(totalDonationsValue)} color="primary" />
        <TicketList small />
        <KPICard label="Infrastructure Registry" value={(allInfrastructure?.length || 0).toString()} subValue="Active Projects" color="emerald" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        <div className="xl:col-span-2 flex flex-col gap-8">
          {!isGuestUser && <TicketList />}
          <PersonnelDirectory />
        </div>
        <div className="xl:col-span-3">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl flex flex-col h-full min-h-[600px]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3"><CalendarIcon size={18} className="text-primary" /><h3 className="font-bold text-sm uppercase tracking-widest">DIVISION Calendar</h3></div>
              {!isGuestUser && <Button variant="ghost" size="icon" onClick={onOpenEventModal} className="h-10 w-10 rounded-full bg-primary/10 text-primary"><Plus size={20} /></Button>}
            </div>
            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} events={allSchedules} isStaff={!isGuestUser} className="w-full h-fit" />
            
            <div className="mt-10 border-t border-border pt-10 space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground"><Target size={18} /></div>
                    <div>
                       <h4 className="text-sm font-black uppercase tracking-widest">{selectedDate ? 'Selected Date Protocol' : "Today's Tactical Protocol"}</h4>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase">{mounted ? (selectedDate ? format(selectedDate, 'PPPP') : format(new Date(), 'PPPP')) : '...'}</p>
                    </div>
                 </div>
                 <Badge variant="outline" className="text-[10px] font-black uppercase">{displayedEvents.length} Active</Badge>
              </div>

              <div className="space-y-3">
                {displayedEvents.length > 0 ? (
                  displayedEvents.map((ev: any) => (
                    <div key={ev.id} className="p-5 rounded-2xl bg-secondary/20 border border-border hover:border-primary/30 transition-all group flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                         <div className={cn(
                           "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                           ev.type === 'Task' ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-500"
                         )}>
                           {ev.type === 'Task' ? <Clock size={18} /> : <CalendarIcon size={18} />}
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors truncate">{ev.title}</p>
                            </div>
                            <p className="text-[11px] text-muted-foreground font-medium mt-1 leading-relaxed max-w-lg">
                              {ev.description || 'Standard tactical operating procedure.'}
                            </p>
                         </div>
                      </div>
                      <Badge variant="outline" className={cn(
                        "text-[10px] font-black uppercase px-2 py-0.5",
                        ev.type === 'Task' ? "text-destructive border-destructive/20" : "text-amber-500 border-amber-500/20"
                      )}>{ev.type}</Badge>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center border-2 border-dashed border-border rounded-[2rem] opacity-50 flex flex-col items-center">
                     <Target size={32} className="text-muted-foreground/30 mb-4" />
                     <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">No Activities Scheduled</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
