
"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { format, startOfDay, isBefore } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, History, Calendar as CalendarIcon, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EventHistory() {
  const [activeSection, setActiveSection] = useState('history');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);
  
  const firestore = useFirestore();
  const { user } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  const allEventsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'division_events'),
      orderBy('date', 'desc')
    );
  }, [firestore, user]);

  const { data: allEvents, isLoading } = useCollection(allEventsQuery);

  const pastEvents = React.useMemo(() => {
    if (!allEvents) return [];
    const today = startOfDay(new Date());
    return allEvents.filter(ev => {
      const eventDate = new Date(ev.date);
      const isPast = isBefore(eventDate, today);
      const matchesSearch = ev.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (ev.description && ev.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return isPast && matchesSearch;
    });
  }, [allEvents, searchTerm]);

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-x-hidden" suppressHydrationWarning>
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        isExpanded={isSidebarExpanded} 
        setIsExpanded={setIsSidebarExpanded} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 w-full min-w-0",
        "md:ml-20",
        isSidebarExpanded ? "md:ml-64" : "md:ml-20",
        "ml-0"
      )}>
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-10 max-w-[1600px] mx-auto w-full">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <History size={20} />
                </div>
                <h1 className="text-xl sm:text-3xl font-black text-foreground tracking-tight uppercase">Event History Log</h1>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Archived record of all completed activities.</p>
            </div>
            
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                placeholder="Search history..." 
                className="h-12 pl-12 bg-secondary/30 rounded-xl border-border focus:ring-primary/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-x-auto shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 no-scrollbar">
            <div className="min-w-[800px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                  <Loader2 className="animate-spin text-primary" size={48} />
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Retrieving Archives</p>
                </div>
              ) : pastEvents.length > 0 ? (
                <Table>
                  <TableHeader className="bg-secondary/30 border-b border-border">
                    <TableRow>
                      <TableHead className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Activity & Context</TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Completed On</TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</TableHead>
                      <TableHead className="px-8 py-6 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">Reference ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border">
                    {pastEvents.map((ev) => (
                      <TableRow key={ev.id} className="hover:bg-primary/[0.02] transition-colors border-none group">
                        <TableCell className="px-8 py-8">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
                              <CalendarIcon size={18} className="text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors mb-1">{ev.title}</p>
                              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed max-w-md">{ev.description || 'No description.'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-8">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-primary/60" />
                            <span className="text-xs font-bold text-foreground">{mounted ? format(new Date(ev.date), 'PPPP') : '...'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-8">
                          <Badge variant="outline" className="text-[10px] font-black uppercase px-3 py-1 bg-emerald-500/5 text-emerald-500 border-emerald-500/20">
                            Completed
                          </Badge>
                        </TableCell>
                        <TableCell className="px-8 py-8 text-right">
                          <code className="text-[9px] font-black bg-secondary/50 px-2 py-1 rounded text-muted-foreground uppercase">{ev.id.substring(0, 8)}</code>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-32 text-center bg-secondary/10 flex flex-col items-center">
                  <History size={48} className="text-muted-foreground/30 mb-6" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">No Archived Events</h3>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

