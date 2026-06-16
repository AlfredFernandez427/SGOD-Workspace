"use client";

import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Clock, 
  Loader2, 
  CheckCircle2, 
  Eye, 
  MessageSquare,
  User as UserIcon,
  ShieldCheck,
  Phone,
  HelpCircle,
  X,
  UserX,
  Calendar,
  Mail
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  useCollection, 
  useFirestore, 
  useMemoFirebase, 
  useUser, 
  updateDocumentNonBlocking, 
  useDoc 
} from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { format, formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface TicketListProps {
  small?: boolean;
  unitId?: string;
  hideIncidentReports?: boolean;
}

export function TicketList({ small, unitId, hideIncidentReports }: TicketListProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [viewingTicket, setViewingTicket] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const profileRef = useMemoFirebase(() => {
    if (!user || !firestore || user.isAnonymous) return null;
    return doc(firestore, 'user_profiles', user.uid);
  }, [user, firestore]);
  const { data: profile } = useDoc(profileRef);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'user_profiles'));
  }, [firestore, user]);
  const { data: allUsers } = useCollection(usersQuery);

  const isAuthorizedStaff = user?.email === 'admin@admin.com' || (profile && profile.isActive === true);

  // FETCH STRATEGY: Retrieve all missions and filter in-memory.
  const ticketsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'public_assistance_tickets');
  }, [firestore, user]);
  
  const { data: rawTickets, isLoading } = useCollection(ticketsQuery);

  const tickets = React.useMemo(() => {
    if (!rawTickets) return [];
    
    const isYouthLegalStaff = profile?.unitId === 'Youth Formation' || profile?.unitId === 'Learner Rights';
    
    // TACTICAL FILTERING: Executed in-memory to bypass index constraints.
    let filtered = rawTickets;

    // 1. Filter out Resolved missions from active lists
    filtered = filtered.filter(t => t.status !== 'Resolved');

    // 2. Dashboard Confidentiality: Hide Incident Reports from general dashboard and specific tabs
    if (hideIncidentReports || !unitId) {
      filtered = filtered.filter(t => t.serviceType !== 'Incident Reporting');
    }

    // 3. Performance Tab Routing: Filter by technical unit
    if (unitId) {
      const targetUnits = (unitId === 'Youth Formation' || unitId === 'Learner Rights' || isYouthLegalStaff)
        ? ['Youth Formation', 'Learner Rights']
        : [unitId];
        
      filtered = filtered.filter(t => targetUnits.includes(t.targetUnitId));
    }

    // 4. Sort: Newest First
    return [...filtered].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [rawTickets, hideIncidentReports, unitId, profile?.unitId]);

  const handleResolve = (ticketId: string) => {
    if (!firestore) return;
    updateDocumentNonBlocking(doc(firestore, 'public_assistance_tickets', ticketId), {
      status: 'Resolved',
      resolvedAt: new Date().toISOString(),
      resolvedBy: user?.uid
    });
    toast({ title: "Appointment Completed" });
    setViewingTicket(null);
  };

  const handleAcknowledge = (ticketId: string) => {
    if (!firestore) return;
    updateDocumentNonBlocking(doc(firestore, 'public_assistance_tickets', ticketId), {
      status: 'Noted',
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: user?.uid
    });
    toast({ title: "Appointment Noted" });
  };

  const handleUnavailable = (ticketId: string) => {
    if (!firestore) return;
    updateDocumentNonBlocking(doc(firestore, 'public_assistance_tickets', ticketId), {
      status: 'Unavailable',
      updatedAt: new Date().toISOString(),
      updatedBy: user?.uid
    });
    toast({ title: "Specialist Unavailable" });
  };

  const getStaffName = (uid: string) => {
    if (!uid || uid === 'all') return null;
    const found = allUsers?.find(u => u.id === uid);
    return found ? `${found.firstName} ${found.lastName}` : "Unknown Staff";
  };

  if (small) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 shadow-lg transition-all hover:border-primary/30 group relative overflow-hidden h-fit">
        <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 relative z-10">Appointment Registry</p>
        <div className="flex items-baseline gap-3 mb-8 relative z-10">
          <h3 className="text-3xl font-black text-foreground tracking-tighter">{isLoading ? '--' : (tickets?.length || 0)}</h3>
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight">Active Appointments</span>
        </div>
        <div className="pt-2 relative z-10">
           <Badge variant="outline" className="text-[10px] font-black uppercase bg-primary/5 text-primary border-primary/20">
             {isAuthorizedStaff ? 'Specialist Sync Active' : 'Registry Active'}
           </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-xl flex flex-col overflow-hidden h-[450px] w-full">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-3">
          <Activity size={18} className="text-primary" /> 
          Appointment Schedule {unitId && <span className="opacity-40 ml-1">({unitId})</span>}
        </h3>
        <Badge variant="outline" className="text-[10px] font-black uppercase bg-primary/5 text-primary">
          {tickets?.length || 0} Open
        </Badge>
      </div>
      
      <div className="space-y-4 flex-1 overflow-y-auto pr-1 no-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={24} /></div>
        ) : tickets && tickets.length > 0 ? (
          tickets.map((ticket: any) => {
            const preferredName = getStaffName(ticket.preferredStaffId);
            return (
              <div key={ticket.id} className="p-5 rounded-2xl bg-secondary/20 border border-border hover:border-primary/40 transition-all group relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    #{ticket.id.substring(0, 8).toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase">
                    <Clock size={10} />
                    <span>{mounted && ticket.createdAt ? formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true }) : '...'}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-start mb-4 min-h-[40px] gap-4">
                  <p className="text-lg font-black text-primary group-hover:text-foreground transition-colors leading-tight flex-1 min-w-0 line-clamp-2">
                    {ticket.title}
                  </p>
                  
                  {isAuthorizedStaff && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                      {ticket.status === 'Pending' && (
                        <button 
                          onClick={() => handleAcknowledge(ticket.id)}
                          className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                          title="Acknowledge assignment"
                        >
                          <MessageSquare size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => setViewingTicket(ticket)}
                        className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                        title="View Intelligence"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleUnavailable(ticket.id)}
                        className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
                        title="Flag as unavailable"
                      >
                        <UserX size={16} />
                      </button>
                      <button 
                        onClick={() => handleResolve(ticket.id)}
                        className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                        title="Mark appointment resolved"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="h-px w-full bg-border/50 mb-4" />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 divide-x divide-border">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tight">
                      {ticket.targetUnitId}
                    </span>
                    {preferredName && (
                      <span className="text-[10px] font-black text-primary uppercase tracking-tight pl-2">
                        {preferredName}
                      </span>
                    )}
                  </div>
                  
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em]",
                    (ticket.status === 'Resolved' || ticket.status === 'Noted') ? 'text-emerald-500' : 
                    ticket.status === 'Unavailable' ? 'text-destructive' : 'text-amber-500'
                  )}>
                    {ticket.status === 'Noted' ? 'NOTED' : 
                     ticket.status === 'Unavailable' ? 'UNAVAILABLE' :
                     (ticket.status || 'PENDING').toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-10 opacity-50 border border-dashed border-border rounded-xl">
            <Activity size={32} className="text-muted-foreground/30 mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registry Clear</p>
          </div>
        )}
      </div>

      <Dialog open={!!viewingTicket} onOpenChange={(open) => !open && setViewingTicket(null)}>
        <DialogContent className="max-w-2xl bg-card border-border rounded-3xl p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-8 border-b border-border bg-secondary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Calendar size={24} />
                </div>
                <div>
                  <DialogTitle className="text-xl font-black uppercase tracking-tight">Appointment Intelligence</DialogTitle>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Ref: #{viewingTicket?.id.substring(0, 8).toUpperCase()}</p>
                </div>
              </div>
              <Badge className={cn(
                "text-[10px] font-black uppercase px-3 py-1",
                (viewingTicket?.status === 'Noted' || viewingTicket?.status === 'Resolved') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                viewingTicket?.status === 'Unavailable' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                'bg-amber-500/10 text-amber-500 border-amber-500/20'
              )} variant="outline">
                {(viewingTicket?.status || 'PENDING').toUpperCase()}
              </Badge>
            </div>
          </DialogHeader>

          <div className="p-8 space-y-8 overflow-y-auto max-h-[60vh] no-scrollbar">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase text-muted-foreground">Subject</p>
                 <p className="text-lg font-bold text-foreground leading-snug">{viewingTicket?.title}</p>
               </div>
               <div className="space-y-1 text-left md:text-right">
                 <p className="text-[10px] font-black uppercase text-muted-foreground">Service Category</p>
                 <Badge variant="outline" className="bg-secondary text-foreground border-none font-bold uppercase">{viewingTicket?.serviceType}</Badge>
               </div>
             </div>

             {viewingTicket?.meetingDate && (
               <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase text-primary tracking-widest mb-1">Target Schedule</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-primary" />
                        <span className="text-sm font-bold">{viewingTicket.meetingDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-primary" />
                        <span className="text-sm font-bold">{viewingTicket.meetingTime || 'TBA'}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-primary text-white font-black uppercase text-[8px]">SCHEDULE REQUEST</Badge>
               </div>
             )}

             <div className="p-6 rounded-2xl bg-secondary/30 border border-border">
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-3">Context Description</p>
                <p className="text-sm font-medium leading-relaxed text-foreground/90 whitespace-pre-wrap">{viewingTicket?.description}</p>
             </div>

             <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/20">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary"><Phone size={18} /></div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-muted-foreground">Contact Phone</p>
                    <p className="text-sm font-bold">{viewingTicket?.inquirerPhone || 'N/A'}</p>
                  </div>
                </div>
             </div>
          </div>

          <DialogFooter className="p-6 border-t border-border bg-secondary/10">
             <Button variant="outline" onClick={() => setViewingTicket(null)} className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest">
               Close Intelligence View
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
