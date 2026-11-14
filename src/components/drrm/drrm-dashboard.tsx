"use client";

import React from 'react';
import { Shield, Globe, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DRRMDashboard() {
  const DRRM_PORTAL_URL = "https://drrm.sdodavsur.com/";

  const handleLaunchPortal = () => {
    window.open(DRRM_PORTAL_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 h-full flex flex-col pt-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">DRRMC Portal</h1>
          <p className="text-[11px] font-bold text-muted-foreground uppercase mt-2 tracking-widest">Disaster Risk Reduction & Management</p>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-[3rem] p-12 sm:p-24 text-center bg-secondary/5 relative w-full shadow-3xl overflow-hidden min-h-[500px] flex flex-col items-center justify-center">
        {/* Background Watermark */}
        <div className="absolute top-1/2 -right-20 -translate-y-1/2 opacity-[0.03] pointer-events-none">
           <Shield size={480} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-10">
           <div className="w-24 h-24 rounded-[2rem] bg-destructive/10 flex items-center justify-center text-destructive mx-auto shadow-inner">
              <Shield size={48} />
           </div>
           
           <div className="space-y-4">
              <h3 className="text-3xl font-black uppercase tracking-tighter">DRRMC Emergency Command Bridge</h3>
              <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                DRRM e-Desk – an online platform that improves communication and coordination among DRRM personnel, school coordinators, and stakeholders during emergencies and disaster-related activities. It enables real-time submission and access to reports, assessments, and other DRRM documents to support faster and more organized response and recovery. It also serves as a repository of DRRM policies, plans, templates, and learning resources for disaster preparedness and compliance. Overall, it promotes data-driven decision-making, collaboration, and the use of digital tools to strengthen safe and resilient learning environments.
              </p>
           </div>
           
           <Button 
             onClick={handleLaunchPortal}
             className="h-16 px-16 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-3 mx-auto"
           >
             <Globe size={18} /> Launch DRRM Site <ExternalLink size={14} className="opacity-50" />
           </Button>
        </div>
      </div>
    </div>
  );
}
