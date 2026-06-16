"use client";

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  ExternalLink, 
  ShieldCheck,
  Zap,
  Download
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LDMViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LDMViewerModal({ isOpen, onClose }: LDMViewerModalProps) {
  /**
   * TACTICAL NOTE:
   * Place the PDF file in the "public" folder of the project.
   * Path: public/ldm.pdf
   */
  const LDM_PDF_URL = "/ldm.pdf"; 

  const handleOpenExternal = () => {
    window.open(LDM_PDF_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-card border-border shadow-3xl p-0 overflow-hidden rounded-[2.5rem] h-[90vh] flex flex-col w-[95vw]">
        <DialogHeader className="p-8 border-b border-border bg-background shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[1.25rem] bg-amber-400/10 flex items-center justify-center text-amber-600 shadow-sm border border-amber-400/5">
                <BookOpen size={32} />
              </div>
              <div>
                <DialogTitle className="text-3xl font-black uppercase tracking-tight text-foreground">LDM Hub</DialogTitle>
                <DialogDescription className="text-xs font-black text-muted-foreground uppercase mt-1 tracking-[0.2em]">
                  LEARNER DISCIPLINE MANUAL
                </DialogDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 font-black uppercase text-[10px] tracking-widest h-9 px-4 rounded-xl">
                Official Registry
              </Badge>
              <Button 
                onClick={handleOpenExternal}
                variant="outline" 
                size="icon" 
                className="h-9 w-9 rounded-xl border-border text-muted-foreground hover:text-primary transition-all"
              >
                <ExternalLink size={16} />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-secondary/5 relative">
          <iframe 
            src={`${LDM_PDF_URL}#toolbar=0`}
            className="w-full h-full border-none"
            title="LDM Viewer"
          />
        </div>

        <DialogFooter className="px-10 py-6 border-t border-border bg-secondary/10 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 text-center sm:text-left">
            <Zap size={14} className="text-amber-500 animate-pulse" /> Unified Discipline Protocols Enabled
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
             <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest">
               Close Manual
             </Button>
             <Button onClick={handleOpenExternal} className="flex-1 sm:flex-none h-12 px-8 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">
               <Download size={14} className="mr-2" /> Download Copy
             </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
