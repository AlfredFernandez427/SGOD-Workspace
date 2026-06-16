"use client";

import React from 'react';
import { 
  BookOpen, 
  LayoutTemplate, 
  Download, 
  ExternalLink, 
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export function GADDashboard() {
  const MANUAL_URL = "https://drive.google.com/file/d/1GtqrKWQCeXLfzZ3_WJQ45KiyhK7QCGeN/view";
  const TEMPLATES_URL = "https://drive.google.com/drive/folders/1ko6qhzYFiJe2X72ZaC2MwUJGDQtRZXcP";

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">Gender & <span className="text-accent">Development</span></h1>
          <p className="text-[11px] font-bold text-muted-foreground uppercase mt-2 tracking-widest">GAD Planning & Compliance Unit</p>
        </div>
        <Badge variant="outline" className="h-8 px-4 rounded-xl border-primary/20 bg-primary/5 text-primary font-black uppercase text-[10px] tracking-widest">
          Unit Registry Active
        </Badge>
      </div>

      <div className="relative w-full rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-slate-200 aspect-[16/9] sm:aspect-[21/6] shadow-2xl group border-4 border-white">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent z-10"></div>
        <Image 
          src="https://picsum.photos/seed/gadhero/1200/400" 
          alt="GAD Contextual Background" 
          fill
          sizes="100vw"
          className="object-cover group-hover:scale-105 transition-transform duration-1000"
          data-ai-hint="community diversity"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 sm:px-20">
          <div className="space-y-4 animate-in slide-in-from-left-8 duration-1000">
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl uppercase">
              Equality in <br/>Operation
            </h2>
            <p className="text-white/90 font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-lg max-w-xl leading-relaxed">
              Mainstreaming gender perspectives across the Division of Davao del Sur.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <Card className="lg:col-span-7 bg-card border-border rounded-[2.5rem] p-8 sm:p-10 shadow-xl relative overflow-hidden group hover:border-primary/30 transition-all flex flex-col justify-between min-h-[350px] sm:min-h-[400px]">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <BookOpen size={240} />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <BookOpen size={32} />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-foreground">GAD Portal Registry</h3>
              <p className="text-base sm:text-lg text-muted-foreground font-medium leading-relaxed mt-4 max-w-lg">
                Gender and Development (GAD) Portal – serves as a centralized platform for the consolidation and submission of the Gender Mainstreaming Evaluation Framework (GMEF), GAD Plan and Budget, and Accomplishment Reports within the Schools Division of Davao del Sur. It also provides updates and monitoring of Gender and Development (GAD)-related programs, projects, and activities (PPAs).
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-10">
            <Button 
              onClick={() => window.open(MANUAL_URL, '_blank')}
              className="h-14 sm:h-16 px-8 sm:px-12 bg-primary text-white rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-3"
            >
              <Download size={18} /> Access Manual <ExternalLink size={14} className="opacity-50" />
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-5 bg-secondary/5 border-border rounded-[2.5rem] p-8 sm:p-10 shadow-xl flex flex-col justify-between group hover:border-accent/30 transition-all relative overflow-hidden">
          <div className="absolute -bottom-10 -left-10 p-4 opacity-[0.03]">
             <LayoutTemplate size={200} />
          </div>

          <div className="space-y-8 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shadow-inner">
              <LayoutTemplate size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">Unit Mission</h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed mt-2">
                Overall, the portal strengthens coordination, compliance, and data-driven implementation of GAD programs across the division, ensuring organized, timely, and accurate reporting.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border group-hover:border-accent/20 transition-all">
                <FileText size={16} className="text-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">GAD Accomplishment Report</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border group-hover:border-accent/20 transition-all">
                <FileText size={16} className="text-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">GAD Plan & Budget</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border group-hover:border-accent/20 transition-all">
                <FileText size={16} className="text-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">HGDG Generic Checklist</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border group-hover:border-accent/20 transition-all">
                <FileText size={16} className="text-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">GMEF Scoresheet</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8">
            <Button 
              onClick={() => window.open(TEMPLATES_URL, '_blank')}
              variant="outline"
              className="w-full h-14 border-accent/20 text-accent hover:bg-accent hover:text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2"
            >
              Browse Template Hub <ChevronRight size={14} />
            </Button>
          </div>
        </Card>

      </div>
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
