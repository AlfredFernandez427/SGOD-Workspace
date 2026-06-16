
"use client";

import React from 'react';
import { BarChart3, ExternalLink, Send, HelpCircle, Info, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function ResearchRepository() {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">Planning & Research</h1>
          <p className="text-[11px] font-bold text-muted-foreground uppercase mt-2 tracking-widest">BERF Research & Strategic Data Hub</p>
        </div>
        
        <button 
          className="h-14 px-10 bg-primary text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 flex items-center gap-3 transition-transform hover:scale-[1.02]"
          onClick={() => window.open('https://sites.google.com/deped.gov.ph/sdoddsplanning/home', '_blank')}
        >
          <HelpCircle size={18} /> Launch Help Desk Portal
        </button>
       
      </div>

      {/* Broadcast-style Help Desk Section */}
      <div className="bg-primary/10 border border-primary/20 rounded-[2.5rem] p-10 flex items-start gap-8 animate-in fade-in slide-in-from-top-4 duration-1000 relative overflow-hidden">
        <div className="w-16 h-16 rounded-[1.25rem] bg-primary flex items-center justify-center text-white shrink-0 shadow-2xl relative z-10">
          <Send size={32} />
        </div>
        <div className="flex-1 relative z-10">
          <h4 className="text-2xl font-black uppercase tracking-tight text-primary mb-3">research related submissions</h4>
          <p className="text-base font-medium text-foreground/80 leading-relaxed max-w-5xl mb-6">
            Access the official Planning & Research Management site for Research submissions.
          </p>
          <Button 
            onClick={() => window.open('https://sites.google.com/deped.gov.ph/research-management/home', '_blank')}
            className="h-12 px-8 bg-primary text-white rounded-xl font-black uppercase text-[10px] tracking-[0.15em] shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            Submit Research Proposal <ExternalLink size={14} />
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[70vh]">
        <div className="px-8 py-6 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-secondary/10 shrink-0">
          <div className="flex items-center gap-3">
             <BarChart3 size={18} className="text-primary" />
             <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">BERF Research Master Database</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-black uppercase bg-emerald-500/5 text-emerald-500 border-emerald-500/20">Live Sync Enabled</Badge>
            <a 
              href="https://docs.google.com/spreadsheets/d/1Gpt4ZfcBSq9_isBzkwdOBoVpfxHHcGi4BLmnYKMohuI" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
        
        <div className="flex-1 w-full bg-white relative">
          <iframe 
            src="https://docs.google.com/spreadsheets/d/1Gpt4ZfcBSq9_isBzkwdOBoVpfxHHcGi4BLmnYKMohuI/preview" 
            className="w-full h-full border-none"
            title="BERF Research Database"
          />
        </div>

        <div className="px-8 py-4 border-t border-border bg-secondary/5 shrink-0 flex items-center justify-between">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Davao del Sur Tactical Research Unit</p>
          <p className="text-[10px] font-bold text-primary uppercase">Standard Operating Procedure: Sync Every 5 Minutes</p>
        </div>
      </div>
    </div>
  );
}
