"use client";

import React from 'react';
import { Sparkles, X, Loader2, Zap, ShieldAlert, ListChecks } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface IntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  context: string;
  data: {
    briefing?: string;
    risks?: string[];
    actions?: string[];
    abstract?: string;
  } | null;
}

export function IntelligenceModal({ isOpen, onClose, isLoading, context, data }: IntelligenceModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-primary/20 p-0 overflow-hidden shadow-[0_0_50px_rgba(51,133,255,0.15)]">
        <DialogHeader className="px-6 py-4 border-b border-border bg-secondary/40">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="text-primary animate-pulse" size={20} />
              </div>
              <div>
                <DialogTitle className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Unified Intelligence</DialogTitle>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{context}</p>
              </div>
            </div>
          </div>
          <DialogDescription className="sr-only">Gemini-powered operational synthesis and strategic analysis based on current dataset.</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="p-8">
            {isLoading ? (
              <div className="flex flex-col items-center py-16 space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                  <Zap className="absolute inset-0 m-auto text-primary animate-pulse" size={32} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-foreground uppercase tracking-[0.2em]">Synthesizing Engine Data</p>
                  <p className="text-[10px] text-muted-foreground mt-2 italic font-medium">Gemini 2.5 Flash is processing complex datasets...</p>
                </div>
              </div>
            ) : data ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {data.briefing && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                      <Zap size={12} /> Strategic Synthesis
                    </h4>
                    <p className="text-sm leading-relaxed text-foreground/90 font-medium whitespace-pre-wrap">{data.briefing}</p>
                  </div>
                )}
                
                {data.risks && data.risks.length > 0 && (
                  <div className="space-y-4 bg-destructive/5 border border-destructive/10 p-5 rounded-xl">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive flex items-center gap-2">
                      <ShieldAlert size={12} /> Identified Vulnerabilities
                    </h4>
                    <ul className="space-y-3">
                      {data.risks.map((risk, i) => (
                        <li key={i} className="text-xs text-destructive/80 font-semibold flex gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0"></span>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {data.actions && data.actions.length > 0 && (
                  <div className="space-y-4 bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-xl">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
                      <ListChecks size={12} /> Priority Operations (48h)
                    </h4>
                    <ul className="space-y-3">
                      {data.actions.map((action, i) => (
                        <li key={i} className="text-xs text-emerald-500/80 font-semibold flex gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {data.abstract && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                      <Zap size={12} /> Research Abstract
                    </h4>
                    <div className="bg-secondary/30 border border-border p-6 rounded-xl relative">
                       <p className="text-sm leading-relaxed text-foreground font-medium italic">"{data.abstract}"</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-sm text-muted-foreground font-medium">Failed to retrieve intelligence. Please try again.</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="px-8 py-6 border-t border-border flex items-center justify-between bg-secondary/20">
          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Quantum Engine: Gemini ✨</span>
          <Button 
            onClick={onClose}
            className="text-[10px] font-black uppercase tracking-[0.15em] h-9 px-6 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all"
          >
            Acknowledge & Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
