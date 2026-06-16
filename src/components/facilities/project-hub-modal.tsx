"use client";

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layers, Edit3, FileText } from 'lucide-react';
import { AIPdfExtractor } from './ai-pdf-extractor';
import { ManualInfraEntry } from './manual-infra-entry';

interface ProjectHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectHubModal({ isOpen, onClose }: ProjectHubModalProps) {
  const [pendingRecords, setPendingRecords] = useState<any[]>([]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-card border-border shadow-2xl p-0 overflow-hidden h-[85vh] flex flex-col rounded-[2rem]">
        <DialogHeader className="p-8 border-b border-border bg-secondary/10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Layers size={32} />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black uppercase tracking-tight text-foreground">Infrastructure Hub</DialogTitle>
              <DialogDescription className="text-xs font-bold text-muted-foreground uppercase mt-1">Registry Management & AI Extraction Services</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto flex flex-col">
          <Tabs defaultValue="ai" className="flex-1 flex flex-col">
            <div className="px-8 pt-6 border-b border-border bg-secondary/5">
              <TabsList className="bg-transparent gap-4 h-auto p-0 flex-wrap sm:flex-nowrap">
                <TabsTrigger 
                  value="ai" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 pb-4 text-[10px] font-black uppercase tracking-widest transition-all text-muted-foreground data-[state=active]:text-primary"
                >
                  <FileText size={14} className="mr-2" /> AI Document Scanner (PDF/IMG)
                </TabsTrigger>
                <TabsTrigger 
                  value="manual" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 pb-4 text-[10px] font-black uppercase tracking-widest transition-all text-muted-foreground data-[state=active]:text-primary"
                >
                  <Edit3 size={14} className="mr-2" /> Manual Entry
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-8 bg-secondary/5">
              <TabsContent value="ai" className="m-0 mt-0 focus-visible:outline-none">
                <div className="max-w-3xl mx-auto">
                  <AIPdfExtractor 
                    onRecordsExtracted={setPendingRecords} 
                    pendingRecords={pendingRecords} 
                  />
                </div>
              </TabsContent>
              <TabsContent value="manual" className="m-0 mt-0 focus-visible:outline-none">
                <div className="max-w-4xl mx-auto">
                  <ManualInfraEntry />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="px-8 py-4 border-t border-border bg-secondary/10 flex items-center justify-between shrink-0">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            SGOD Infrastructure Tactical Interface
          </p>
          <p className="text-[10px] font-black text-primary uppercase tracking-widest">
            Div. of Davao del Sur
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
