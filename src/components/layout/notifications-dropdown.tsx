"use client";

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Megaphone, 
  Calendar as CalendarIcon, 
  Clock
} from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, orderBy, limit, where, doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function NotificationsDropdown() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const profileRef = useMemoFirebase(() => {
    if (!user || !firestore || user.isAnonymous) return null;
    return doc(firestore, 'user_profiles', user.uid);
  }, [user, firestore]);
  const { data: profile } = useDoc(profileRef);

  const isAdmin = user?.email === 'admin@admin.com' || profile?.unitId === 'SGOD' || profile?.isAdmin || profile?.role === 'Admin' || profile?.role === 'SGOD Chief';
  const isAuthorizedStaff = user?.email === 'admin@admin.com' || profile?.isActive === true || isAdmin;

  // Fetch Latest Broadcasts (Restrict to Staff Only context)
  const broadcastsQuery = useMemoFirebase(() => {
    if (!firestore || !isAuthorizedStaff) return null;
    
    return query(
      collection(firestore, 'broadcasts'),
      where('audience', '==', 'Staff Only'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
  }, [firestore, isAuthorizedStaff]);

  const { data: broadcasts } = useCollection(broadcastsQuery);

  // Fetch Upcoming Events
  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user || user.isAnonymous) return null;
    const today = new Date().toISOString();
    return query(
      collection(firestore, 'division_events'),
      where('date', '>=', today),
      orderBy('date', 'asc'),
      limit(3)
    );
  }, [firestore, user]);

  const { data: events } = useCollection(eventsQuery);

  const totalCount = (broadcasts?.length || 0) + (events?.length || 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 text-muted-foreground hover:text-foreground bg-secondary/30 rounded-full w-10 h-10 flex items-center justify-center">
          <Bell size={18} />
          {totalCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background"></span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 bg-card border-border shadow-2xl rounded-2xl overflow-hidden z-[100]" align="end" sideOffset={8}>
        <div className="p-4 border-b border-border bg-secondary/10 flex items-center justify-between">
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-foreground">Intelligence Queue</h3>
            <p className="text-[11px] text-muted-foreground font-bold uppercase mt-0.5">Staff-Only Updates</p>
          </div>
          <Badge variant="outline" className="text-[10px] font-black uppercase bg-primary/5 text-primary border-primary/20">
            {totalCount} Active
          </Badge>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="p-2 space-y-1">
            {broadcasts && broadcasts.length > 0 && (
              <div className="pb-2">
                <div className="px-3 py-2 flex items-center gap-2 mb-1">
                  <Megaphone size={12} className="text-primary" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Internal Broadcasts</span>
                </div>
                {broadcasts.map((b) => (
                  <div key={b.id} className="p-3 rounded-xl hover:bg-secondary/30 transition-all border border-transparent hover:border-border cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[15px] font-bold text-foreground">{b.title}</p>
                      <Badge variant="outline" className="text-[8px] font-black uppercase px-1.5 text-amber-500 border-amber-500/20">{b.audience}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{b.message}</p>
                    <div className="flex items-center gap-2 mt-2 opacity-60">
                      <Clock size={10} />
                      <span className="text-[11px] font-black uppercase">{mounted ? format(new Date(b.createdAt), 'MMM dd, p') : '...'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {events && events.length > 0 && (
              <div className="pt-2 border-t border-border/50">
                <div className="px-3 py-2 flex items-center gap-2 mb-1">
                  <CalendarIcon size={12} className="text-amber-500" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Operational Schedule</span>
                </div>
                {events.map((e) => (
                  <div key={e.id} className="p-3 rounded-xl hover:bg-secondary/30 transition-all border border-transparent hover:border-border cursor-pointer">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-1.5 h-1.5 rounded-full", e.type === 'Task' ? "bg-destructive" : "bg-amber-500")} />
                        <p className="text-[15px] font-bold text-foreground">{e.title}</p>
                      </div>
                      <Badge variant="outline" className="text-[11px] font-black uppercase px-1.5 bg-background/50">{e.type}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2 opacity-60">
                      <Clock size={10} />
                      <span className="text-[11px] font-black uppercase tracking-widest">{mounted ? format(new Date(e.date), 'PPPP') : '...'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalCount === 0 && (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <Bell size={24} className="text-muted-foreground/30 mb-4" />
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">No Priority Alerts</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
