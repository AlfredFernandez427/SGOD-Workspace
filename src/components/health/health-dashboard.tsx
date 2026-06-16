"use client";

import React, { useEffect } from 'react';
import { HeartPulse, Globe, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HealthDashboard() {
  const HEALTH_PORTAL_URL = "https://sites.google.com/view/okdportal";

  const handleLaunchPortal = () => {
    window.open(HEALTH_PORTAL_URL, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    handleLaunchPortal();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 h-full flex flex-col pt-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">Health & <span className="text-accent">Nutrition</span></h1>
          <p className="text-[11px] font-bold text-muted-foreground uppercase mt-2 tracking-widest">School Health Division & Nutrition Registry</p>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-[3rem] p-12 sm:p-24 text-center bg-secondary/5 relative w-full shadow-3xl overflow-hidden min-h-[500px] flex flex-col items-center justify-center">
        {/* Background Watermark */}
        <div className="absolute top-1/2 -right-20 -translate-y-1/2 opacity-[0.03] pointer-events-none">
           <HeartPulse size={480} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
           <div className="w-24 h-24 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto shadow-inner">
              <HeartPulse size={48} />
           </div>
           
           <div className="space-y-4">
              <h3 className="text-3xl font-black uppercase tracking-tighter">OKD Health & Nutrition Hub</h3>
              <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                School Health and Nutrition Unit Portal – a centralized platform designed to monitor and manage health-related programs and services within the Schools Division of Davao del Sur. It facilitates the implementation of the Oplan Kalusugan sa DepEd (OKD) flagship programs, including medical, dental, and nursing services, water, sanitation, and hygiene (WASH) in schools, and the school-based feeding program. The portal aims to ensure that every learner is healthy, nourished, and ready to learn by providing real-time data, resources, and coordination tools for health personnel and school coordinators. Overall, it promotes a culture of health and wellness, ensuring a safe and supportive environment for the holistic development of all students.
              </p>
           </div>
           
           <Button 
             onClick={handleLaunchPortal}
             className="h-16 px-16 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-3 mx-auto"
           >
             <Globe size={18} /> Launch Health Portal <ExternalLink size={14} className="opacity-50" />
           </Button>
        </div>
      </div>
    </div>
  );
}
