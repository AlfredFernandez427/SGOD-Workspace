"use client";

import React, { useMemo } from 'react';
import { Clock, Calendar as CalendarIcon, Loader2, User, HelpCircle, Activity } from 'lucide-react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface AppointmentScheduleProps {
  unitId: string;
}

/**
 * AppointmentSchedule Component
 * Specialized filtered view for the Performance Tab.
 * Consolidates Youth Formation and Learner Rights missions into a single feed.
 */
export function AppointmentSchedule({ unitId }: AppointmentScheduleProps) {
  const firestore = useFirestore();
  const { user } = useUser();

  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user || !unitId) return null;

    // Consolidated routing: Youth Formation AND Learner Rights personnel manage both units' missions
    const isYouthLegalStaff = unitId === 'Youth Formation' || unitId === 'Learner Rights';

    const targetUnits = isYouthLegalStaff
      ? ['Youth Formation', 'Learner Rights']
      : [unitId];

    return query(
      collection(firestore, 'public_assistance_tickets'),
      where('targetUnitId', 'in', targetUnits),
      where('status', '!=', 'Resolved'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }, [firestore, user, unitId]);

  const { data: appointments, isLoading } = useCollection(appointmentsQuery);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'noted': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'unavailable': return 'text-destructive bg-destructive/10 border-destructive/20';
      default: return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    }
  };

  return (
    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl flex flex-col h-full min-h-[400px]">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Activity size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Mission Schedule</h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">Active Unit Operations</p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] font-black uppercase bg-primary/5 text-primary">
          {appointments?.length || 0} Open
        </Badge>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full opacity-40">
            <Loader2 className="animate-spin text-primary mb-4" size={32} />
            <p className="text-[9px] font-black uppercase tracking-widest">Querying Unit Registry</p>
          </div>
        ) : appointments && appointments.length > 0 ? (
          <ScrollArea className="h-[450px] pr-4">
            <div className="space-y-4">
              {appointments.map((appt: any) => (
                <div key={appt.id} className="p-5 rounded-2xl bg-secondary/20 border border-border/50 hover:border-primary/30 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">#{appt.id.substring(0, 8).toUpperCase()}</span>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase">
                      <Clock size={10} />
                      <span>{appt.createdAt ? formatDistanceToNow(new Date(appt.createdAt), { addSuffix: true }) : 'Pending'}</span>
                    </div>
                  </div>

                  <p className="text-sm font-black text-primary group-hover:text-foreground transition-colors leading-tight mb-4">
                    {appt.title}
                  </p>

                  <div className="h-px w-full bg-border/50 mb-4" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Badge variant="outline" className="text-[8px] font-black uppercase bg-background px-2 border-border/50">
                         {appt.targetUnitId}
                       </Badge>
                    </div>
                    <Badge variant="outline" className={cn("text-[9px] font-black uppercase border-none px-2 py-0.5", getStatusColor(appt.status))}>
                      {appt.status || 'PENDING'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 border-2 border-dashed border-border rounded-[2rem] bg-secondary/5 opacity-50">
            <HelpCircle size={48} className="text-muted-foreground/20 mb-4" />
            <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Registry Clear</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-2">No active missions for this tactical segment.</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-border flex items-center justify-between shrink-0">
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Consolidated Unit Intelligence</p>
        <Badge className="bg-primary text-white text-[8px] font-black uppercase">LIVE SYNC</Badge>
      </div>
    </div>
  );
}
