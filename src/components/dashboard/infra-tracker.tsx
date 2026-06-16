
"use client";

import React from 'react';
import { MapPin, Handshake, ChevronRight, Loader2 } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

export function InfraTracker() {
  const firestore = useFirestore();
  const { user } = useUser();

  const donationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'donations'),
      orderBy('receivedAt', 'desc'),
      limit(4)
    );
  }, [firestore, user]);

  const { data: donations, isLoading } = useCollection(donationsQuery);

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-3">
          <MapPin size={18} className="text-destructive" /> Active Infrastructure (EF)
        </h3>
      </div>
      
      <div className="w-full h-48 bg-secondary/20 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group border border-border mb-8">
         <div className="absolute inset-0 opacity-10 bg-[radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:16px_16px]"></div>
         <div className="flex gap-16 relative z-10 scale-125">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20"></div>
              <MapPin size={24} className="text-emerald-500 relative z-10" />
            </div>
            <MapPin size={24} className="text-amber-500 relative z-10" />
         </div>
         <span className="mt-6 px-4 py-1.5 bg-background/60 border border-border rounded-full text-[10px] font-black text-foreground uppercase tracking-widest z-10 backdrop-blur-sm">Live Division Map</span>
      </div>
      
      <div className="space-y-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Recent DPDS Entries (SocMob)</p>
          <Handshake size={14} className="text-primary" />
        </div>
        
        <div className="space-y-2 flex-1">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : donations && donations.length > 0 ? (
            donations.map((donation: any) => (
              <DonationItem 
                key={donation.id}
                title={donation.donorName} 
                desc={`${donation.type} • ${donation.description}`} 
                amount={`₱ ${donation.amountValue?.toLocaleString()}`} 
              />
            ))
          ) : (
            <div className="text-center py-10 border border-dashed border-border rounded-xl flex flex-col items-center justify-center">
               <Handshake size={24} className="text-muted-foreground/30 mb-2" />
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No Recent Donations</p>
            </div>
          )}
        </div>
      </div>
      
      <button suppressHydrationWarning className="w-full mt-6 py-4 text-xs font-bold text-primary hover:text-primary/80 transition-all flex items-center justify-center gap-2 group border-t border-border pt-6">
        Infrastructure Portal <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}

function DonationItem({ title, desc, amount }: { title: string, desc: string, amount: string }) {
  return (
    <div className="flex justify-between items-center group cursor-pointer p-3 rounded-xl hover:bg-secondary/20 transition-all border border-transparent hover:border-border">
      <div className="max-w-[70%]">
        <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">{title}</p>
        <p className="text-[9px] text-muted-foreground font-bold uppercase mt-1 truncate">{desc}</p>
      </div>
      <div className="text-right shrink-0">
        <span className="text-xs font-black text-emerald-500">{amount}</span>
      </div>
    </div>
  );
}
