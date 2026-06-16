"use client";

import React from 'react';
import { GraduationCap, Globe, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HRDDDashboard() {
  const HRDD_PORTAL_URL = "https://sites.google.com/view/learninganddevelopmentportal/home";

  const handleLaunchPortal = () => {
    window.open(HRDD_PORTAL_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 h-full flex flex-col pt-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">HR & Development</h1>
          <p className="text-[11px] font-bold text-muted-foreground uppercase mt-2 tracking-widest">Human Resource Development Division</p>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-[3rem] p-12 sm:p-24 text-center bg-secondary/5 relative w-full shadow-3xl overflow-hidden min-h-[500px] flex flex-col items-center justify-center">
        {/* Background Watermark */}
        <div className="absolute top-1/2 -right-20 -translate-y-1/2 opacity-[0.03] pointer-events-none">
           <GraduationCap size={480} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
           <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary mx-auto shadow-inner">
              <GraduationCap size={48} />
           </div>
           
           <div className="space-y-4">
              <h3 className="text-3xl font-black uppercase tracking-tighter">HRD Learning & Development Hub</h3>
              <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                Human Resource and Development (HRD) Unit Portal – provides services focused on professional development, career progression, capacity-building initiatives, scholarship opportunities, and CPD unit accreditation in partnership with the Professional Regulation Commission. It aims to enhance the knowledge, skills, and competencies of teaching, related-teaching, and non-teaching personnel through relevant, accessible, and needs-based development programs grounded on equal opportunity. The portal supports the implementation of policies, frameworks, and systems that promote continuous professional growth and learning. Overall, it helps build a competent, adaptive, and high-performing workforce aligned with organizational goals and improved learner outcomes.
              </p>
           </div>
           
           <Button 
             onClick={handleLaunchPortal}
             className="h-16 px-16 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-3 mx-auto"
           >
             <Globe size={18} /> Launch HRD Portal <ExternalLink size={14} className="opacity-50" />
           </Button>
        </div>
      </div>
    </div>
  );
}
