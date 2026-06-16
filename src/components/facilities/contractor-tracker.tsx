
"use client";

import React, { useMemo, useState } from 'react';
import { Briefcase, ChevronRight, Loader2, HardHat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { VendorDirectoryModal } from './vendor-directory-modal';

export function ContractorTracker() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const firestore = useFirestore();
  const { user } = useUser();

  // Fetch all infrastructure records to aggregate contractor data
  const infraQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'school_infrastructure'));
  }, [firestore, user]);

  const { data: infrastructure, isLoading } = useCollection(infraQuery);

  // Aggregate project counts by contractor name
  const contractors = useMemo(() => {
    if (!infrastructure) return [];
    
    const map: Record<string, { name: string, projectCount: number }> = {};
    
    infrastructure.forEach((item: any) => {
      const name = item.contractorName || 'Unknown Contractor';
      if (!map[name]) {
        map[name] = { name, projectCount: 0 };
      }
      map[name].projectCount++;
    });

    // Convert to array and sort by most projects
    return Object.values(map).sort((a, b) => b.projectCount - a.projectCount);
  }, [infrastructure]);

  return (
    <>
      <div className="bg-card border border-border rounded-2xl p-8 shadow-xl flex flex-col h-[450px]">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-3">
            <Briefcase size={18} className="text-primary" /> Contractor Monitoring
          </h3>
          <Badge variant="outline" className="text-[10px] font-black uppercase border-primary/20 text-primary bg-primary/5">Active Registry</Badge>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Loader2 className="animate-spin text-primary" size={24} />
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Compiling Vendor Data</p>
            </div>
          ) : contractors.length > 0 ? (
            <div className="h-full overflow-y-auto no-scrollbar space-y-3 pr-1">
              {contractors.map((contractor, index) => (
                <div 
                  key={index} 
                  className="p-4 rounded-xl bg-secondary/20 border border-border hover:border-primary/40 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                        <HardHat size={16} />
                      </div>
                      <div className="max-w-[140px]">
                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{contractor.name}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1 tracking-tight">Vetted Vendor</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-primary">{contractor.projectCount}</p>
                      <p className="text-[9px] text-muted-foreground font-black uppercase">Projects</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-xl bg-secondary/5">
               <Briefcase size={32} className="text-muted-foreground/20 mb-4" />
               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No Active Contractors</p>
               <p className="text-[10px] text-muted-foreground mt-2 font-medium">Data will appear as records are imported.</p>
            </div>
          )}
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full mt-6 py-4 text-xs font-bold text-primary hover:text-primary/80 transition-all border-t border-border pt-6 flex items-center justify-center gap-2 uppercase tracking-widest group"
        >
          Full Vendor Directory <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <VendorDirectoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        contractors={contractors} 
        infrastructure={infrastructure} 
      />
    </>
  );
}
