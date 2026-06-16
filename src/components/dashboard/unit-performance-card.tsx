"use client";

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  ChevronRight, 
  Loader2, 
  FileCheck, 
  User as UserIcon, 
  Clock,
  Search,
  Eye,
  Phone,
  HelpCircle,
  X
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface UnitPerformanceCardProps {
  unitId: string;
  unitLabel: string;
  className?: string;
}

export function UnitPerformanceCard({ unitId, unitLabel, className }: UnitPerformanceCardProps) {
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingTicket, setViewingTicket] = useState<any>(null);
  
  const firestore = useFirestore();
  const { user } = useUser();

  // Fetch all personnel to cross-reference resolution IDs
  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'user_profiles'));
  }, [firestore, user]);
  const { data: allUsers } = useCollection(usersQuery);

  // Fetch resolved tickets specifically for this unit
  const resolvedQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'public_assistance_tickets'),
      where('status', '==', 'Resolved'),
      where('targetUnitId', '==', unitId),
      orderBy('resolvedAt', 'desc')
    );
  }, [firestore, user, unitId]);

  const { data: resolvedTickets, isLoading } = useCollection(resolvedQuery);

  const filteredTickets = useMemo(() => {
    if (!resolvedTickets) return [];
    return resolvedTickets.filter(t => 
      t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [resolvedTickets, searchTerm]);

  const getUserName = (uid: string) => {
    if (!uid) return "System";
    const found = allUsers?.find(u => u.id === uid);
    return found ? `${found.firstName} ${found.lastName}` : "Unknown Staff";
  };

  const getStaffName = (uid: string) => {
    if (!uid || uid === 'all') return null;
    const found = allUsers?.find(u => u.id === uid);
    return found ? `${found.firstName} ${found.lastName}` : null;
  };

  return (
    <>
      <Card className={cn("p-10 rounded-[2.5rem] bg-card border-border hover:border-primary/20 transition-all group flex flex-col justify-between h-72 shadow-2xl relative overflow-hidden", className)}>
        {/* Background Watermark */}
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
          <BarChart3 size={160} />
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <BarChart3 size={24} />
            </div>
            <Badge variant="outline" className="text-[9px] font-black uppercase bg-emerald-500/5 text-emerald-600 border-emerald-500/20 px-3 py-1 rounded-full">Resolution Hub</Badge>
          </div>
          <h4 className="text-xl font-black uppercase tracking-tight text-foreground">{unitLabel}</h4>
          <p className="text-[10px] text-muted-foreground font-black uppercase mt-1 tracking-widest opacity-60">Performance Intelligence Engine</p>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-8 relative z-10 mt-auto">
           {isLoading ? (
             <div className="h-10 flex items-center"><Loader2 size={20} className="animate-spin text-primary" /></div>
           ) : (
             <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                   <p className="text-4xl font-black text-primary tracking-tighter leading-none">{resolvedTickets?.length || 0}</p>
                   <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Missions</p>
                </div>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">Operational Registry</p>
             </div>
           )}
           <Button 
             onClick={() => setIsArchiveOpen(true)}
             disabled={isLoading || !resolvedTickets?.length}
             className="h-11 px-5 bg-secondary/80 hover:bg-primary hover:text-white text-foreground rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 group/btn border border-border"
           >
             Access <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
           </Button>
        </div>
      </Card>

      {/* Archive Table Dialog */}
      <Dialog open={isArchiveOpen} onOpenChange={setIsArchiveOpen}>
        <DialogContent className="max-w-5xl bg-card border-border rounded-[2.5rem] p-0 overflow-hidden flex flex-col h-[85vh] shadow-3xl">
          <DialogHeader className="p-10 border-b border-border bg-secondary/10 shrink-0">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[1.25rem] bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                    <FileCheck size={32} />
                  </div>
                  <div>
                    <DialogTitle className="text-3xl font-black uppercase tracking-tight">{unitLabel} Archive</DialogTitle>
                    <p className="text-[10px] font-black text-muted-foreground uppercase mt-2 tracking-[0.2em]">Operational Resolution Registry</p>
                  </div>
                </div>
                <div className="relative w-80 hidden sm:block">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input 
                    placeholder="Search archives..." 
                    className="h-12 pl-11 bg-background/50 text-xs rounded-xl font-bold border-border"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
             </div>
             <DialogDescription className="sr-only">Historical registry of all resolved inquiries and appointments for this specific unit.</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1">
               <div className="p-10">
                  {filteredTickets.length > 0 ? (
                    <Table>
                      <TableHeader className="bg-secondary/30">
                        <TableRow className="border-none">
                          <TableHead className="px-6 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Inquiry Context</TableHead>
                          <TableHead className="px-6 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Staff Performance</TableHead>
                          <TableHead className="px-6 py-5 text-right text-[10px] font-black uppercase text-muted-foreground tracking-widest">Resolution Date</TableHead>
                          <TableHead className="px-6 py-5 text-right text-[10px] font-black uppercase text-muted-foreground tracking-widest">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTickets.map((ticket: any) => {
                          const assignedName = getStaffName(ticket.preferredStaffId);
                          return (
                            <TableRow key={ticket.id} className="border-b border-border/50 hover:bg-primary/[0.03] transition-all group">
                              <TableCell className="px-6 py-8">
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">#{ticket.id.substring(0, 8).toUpperCase()}</span>
                                    <Badge className="text-[8px] font-black bg-emerald-500/10 text-emerald-600 border-none px-2 py-0 rounded-full">RESOLVED</Badge>
                                  </div>
                                  <p className="text-[15px] font-bold text-foreground group-hover:text-primary transition-colors leading-tight">{ticket.title}</p>
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-8">
                                 <div className="space-y-2">
                                    {assignedName && (
                                      <Badge variant="outline" className="text-[8px] font-black uppercase bg-primary/5 text-primary border-primary/20 mb-1">
                                        Assigned: {assignedName}
                                      </Badge>
                                    )}
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                        <UserIcon size={14} />
                                      </div>
                                      <p className="text-xs font-bold text-foreground leading-none">{getUserName(ticket.resolvedBy)}</p>
                                    </div>
                                 </div>
                              </TableCell>
                              <TableCell className="px-6 py-8 text-right">
                                 <div className="flex flex-col items-end gap-1.5">
                                   <div className="flex items-center gap-2 text-[11px] font-black text-foreground uppercase">
                                     <Clock size={10} className="text-primary" />
                                     <span>{format(new Date(ticket.resolvedAt), 'MMM dd, yyyy')}</span>
                                   </div>
                                   <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                      Resolved at {format(new Date(ticket.resolvedAt), 'p')}
                                   </span>
                                 </div>
                              </TableCell>
                              <TableCell className="px-6 py-8 text-right">
                                 <Button 
                                   variant="ghost" 
                                   size="icon" 
                                   onClick={() => setViewingTicket(ticket)}
                                   className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                                 >
                                   <Eye size={18} />
                                 </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="py-24 text-center border-2 border-dashed border-border rounded-[3rem] bg-secondary/5 opacity-50">
                       <FileCheck size={64} className="mx-auto mb-6 text-muted-foreground/20" />
                       <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em]">Unit Registry Clear</p>
                    </div>
                  )}
               </div>
            </ScrollArea>
          </div>

          <DialogFooter className="p-8 border-t border-border bg-secondary/10 shrink-0">
             <Button 
               onClick={() => setIsArchiveOpen(false)}
               className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.01] transition-all"
             >
               Confirm & Close
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket Detail Modal */}
      <Dialog open={!!viewingTicket} onOpenChange={(open) => !open && setViewingTicket(null)}>
        <DialogContent className="max-w-2xl bg-card border-border rounded-[2.5rem] p-0 overflow-hidden shadow-4xl z-[200]">
          <DialogHeader className="p-8 border-b border-border bg-emerald-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm">
                  <HelpCircle size={28} />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight">Archived Resolution</DialogTitle>
                  <p className="text-[10px] font-black text-muted-foreground uppercase mt-1 tracking-widest">Ref: #{viewingTicket?.id.substring(0, 8).toUpperCase()}</p>
                </div>
              </div>
              <Badge className="text-[10px] font-black uppercase px-4 py-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-full" variant="outline">
                RESOLVED
              </Badge>
            </div>
            <DialogDescription className="sr-only">Detailed contextual analysis of a resolved operational mission record.</DialogDescription>
          </DialogHeader>

          <div className="p-10 space-y-10">
             <div className="grid grid-cols-1 gap-6">
               <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Mission Title</p>
                 <p className="text-2xl font-black text-foreground leading-tight tracking-tight">{viewingTicket?.title}</p>
                 <div className="flex items-center gap-2 mt-4">
                    <Badge variant="outline" className="bg-secondary/50 text-foreground border-border font-black uppercase text-[9px]">{viewingTicket?.serviceType}</Badge>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black uppercase text-[9px]">{viewingTicket?.targetUnitId}</Badge>
                 </div>
               </div>
             </div>

             <div className="p-8 rounded-[2rem] bg-secondary/20 border border-border shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                  <HelpCircle size={80} />
                </div>
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-4 flex items-center gap-2 relative z-10">
                   <Clock size={12} className="text-primary" /> Technical Description
                </p>
                <p className="text-[15px] font-medium leading-relaxed text-foreground/90 whitespace-pre-wrap relative z-10 italic">
                  "{viewingTicket?.description}"
                </p>
             </div>

             <div className="grid grid-cols-2 gap-10 pt-6 border-t border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-sm"><Phone size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Inquirer Phone</p>
                    <p className="text-base font-black text-foreground tracking-tighter">{viewingTicket?.inquirerPhone || 'PRIVATE'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 justify-end">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Final Resolution By</p>
                    <p className="text-base font-black text-foreground tracking-tight">{getUserName(viewingTicket?.resolvedBy)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center text-emerald-600 shadow-sm"><UserIcon size={20} /></div>
                </div>
             </div>
          </div>

          <DialogFooter className="p-8 border-t border-border bg-secondary/10">
             <Button onClick={() => setViewingTicket(null)} className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:scale-[1.01] transition-all">
               Close Detailed View
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}