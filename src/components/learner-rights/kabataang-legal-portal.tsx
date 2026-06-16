"use client";

import React, { useState } from 'react';
import { Scale, Gavel, PhoneCall, BookOpen, Facebook, Instagram, ChevronRight, Mail, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ReportFormModal } from './report-form-modal';
import { LegalOrdersModal } from './legal-orders-modal';
import { DisciplinaryActionsModal } from './disciplinary-actions-modal';
import { EmergencyHotlinesModal } from './emergency-hotlines-modal';
import { LDMViewerModal } from './ldm-viewer-modal';
import { cn } from '@/lib/utils';

export function KabataangLegalPortal() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLegalOrdersOpen, setIsLegalOrdersOpen] = useState(false);
  const [isDisciplinaryModalOpen, setIsDisciplinaryModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isLDMModalOpen, setIsLDMModalOpen] = useState(false);

  const categories = [
    { id: 'laws', label: 'Legal Orders', icon: Scale, color: 'bg-amber-400' },
    { id: 'disciplinary', label: 'Disciplinary Administrative Actions', icon: Gavel, color: 'bg-amber-400' },
    { id: 'emergency', label: 'Emergency Hotlines', icon: PhoneCall, color: 'bg-amber-400' },
    { id: 'ldm', label: 'LDM', icon: BookOpen, color: 'bg-amber-400' },
  ];

  const handleCategoryClick = (id: string) => {
    if (id === 'laws') setIsLegalOrdersOpen(true);
    if (id === 'disciplinary') setIsDisciplinaryModalOpen(true);
    if (id === 'emergency') setIsEmergencyModalOpen(true);
    if (id === 'ldm') setIsLDMModalOpen(true);
  };

  return (
    <div className="w-full space-y-12 sm:space-y-16 animate-in fade-in duration-700 pb-20">
      <div className="relative w-full rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-slate-200 aspect-[16/9] sm:aspect-[21/5.5] shadow-2xl group border-4 border-white">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-500/80 via-slate-900/40 to-transparent z-10"></div>
        <img 
          src="https://lh3.googleusercontent.com/d/1rXNjVq9TKBfhd8fWek-sqb8FHNMLZwt-" 
          alt="Legal Background" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 sm:px-20 lg:px-32">
          <div className="space-y-2 animate-in slide-in-from-left-8 duration-1000">
            <Badge className="bg-amber-400 text-slate-900 font-black uppercase tracking-[0.3em] px-3 sm:px-4 py-1 sm:py-1.5 border-none rounded-full text-[8px] sm:text-xs">
              Project Kabataang
            </Badge>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl">
              LEGAL
            </h1>
            <p className="text-white/80 font-bold uppercase tracking-[0.2em] sm:tracking-[0.4em] mt-2 text-[10px] sm:text-base md:text-xl drop-shadow-md max-w-2xl">
              Learners Empowered and Guarded Against Violence
            </p>
          </div>
        </div>
        <div className="absolute bottom-10 right-12 z-20 hidden lg:block opacity-40">
           <Scale size={180} className="text-white" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 space-y-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              onClick={() => handleCategoryClick(cat.id)}
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              <div className={cn(
                "w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center text-slate-900 shadow-xl mb-4 sm:mb-6 transition-all group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-amber-400/20",
                cat.color
              )}>
                <cat.icon size={32} className="sm:size-[42px]" />
              </div>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{cat.label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-7 py-12 border-y border-border/50">
          <p className="text-[10px] sm:text-xs font-black uppercase text-muted-foreground tracking-[0.3em]">Operational Reporting Protocol</p>
          <Button 
            onClick={() => setIsReportModalOpen(true)}
            className="h-16 sm:h-24 px-12 sm:px-24 bg-[#e11d48] hover:bg-[#be123c] text-white rounded-full text-xl sm:text-3xl font-black uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(225,29,72,0.4)] hover:scale-[1.05] active:scale-95 transition-all group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            Report
          </Button>
          <p className="text-[8px] sm:text-[10px] font-bold text-muted-foreground uppercase mt-2">Secure & Confidential Transmission Synchronized with Backend</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <Card className="lg:col-span-5 bg-card border-border rounded-[2.5rem] p-8 sm:p-10 shadow-xl flex flex-col justify-between group hover:border-primary/20 transition-all">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-foreground">Contact Us</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Davao del Sur</p>
                </div>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                 <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/20 border border-transparent group-hover:border-border transition-all">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><Mail size={18} /></div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-muted-foreground">Email</p>
                      <p className="text-xs sm:text-sm font-bold truncate max-w-[180px] sm:max-w-none">norgaly.onutan@deped.gov.ph</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/20 border border-transparent group-hover:border-border transition-all">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><Phone size={18} /></div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-muted-foreground">Hotline</p>
                      <p className="text-sm font-bold">0998 741 2461</p>
                    </div>
                 </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-border/50 flex items-center justify-between">
              <div className="flex gap-3">
                 <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all cursor-pointer">
                    <Facebook size={18} />
                 </div>
                 <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all cursor-pointer">
                    <Instagram size={18} />
                 </div>
                 <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all cursor-pointer">
                    <span className="font-black text-[10px]">Tik</span>
                 </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-black uppercase border-primary/20 text-primary">
                LearnCon2025
              </Badge>
            </div>
          </Card>

          <Card className="lg:col-span-7 bg-secondary/20 border-border rounded-[2.5rem] p-8 sm:p-12 shadow-inner relative overflow-hidden flex flex-col justify-center">
             <div className="absolute top-0 right-0 p-8 opacity-5">
               <Scale size={160} />
             </div>
             
             <div className="relative z-10 space-y-6">
                <h4 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-foreground leading-tight">
                  Protecting Rights through <span className="text-primary">Digital Intelligence</span>.
                </h4>
                <p className="text-base sm:text-lg leading-relaxed text-muted-foreground font-medium max-w-xl">
                  Project Kabataang LEGAL (Learners Empowered and Guarded Against VioLence) - a learner-led webpage that serves as a one-stop hub for school policies, relevant laws, and the Learners’ Discipline Manual, helping students understand their rights and responsibilities. It also provides emergency hotlines and a confidential reporting system for the safe and anonymous reporting of abuse, violence, or injustice in school. Overall, it promotes awareness, accountability, and a safe environment where every learner feels informed, heard, and protected.
                </p>
             </div>
          </Card>
        </div>
      </div>

      <ReportFormModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
      <LegalOrdersModal isOpen={isLegalOrdersOpen} onClose={() => setIsLegalOrdersOpen(false)} />
      <DisciplinaryActionsModal isOpen={isDisciplinaryModalOpen} onClose={() => setIsDisciplinaryModalOpen(false)} />
      <EmergencyHotlinesModal isOpen={isEmergencyModalOpen} onClose={() => setIsEmergencyModalOpen(false)} />
      <LDMViewerModal isOpen={isLDMModalOpen} onClose={() => setIsLDMModalOpen(false)} />
    </div>
  );
}
