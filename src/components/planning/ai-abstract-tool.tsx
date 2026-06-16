"use client";

import React, { useState } from 'react';
import { Sparkles, ChevronRight, Activity, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { generateResearchAbstract } from '@/ai/flows/research-abstract-generation';
import { IntelligenceModal } from '@/components/ai/intelligence-modal';

export function AIAbstractTool() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState<{ abstract: string } | null>(null);
  const [form, setForm] = useState({
    problem: '',
    participants: '',
    intervention: ''
  });

  const handleGenerate = async () => {
    if (!form.problem || !form.participants || !form.intervention) return;
    
    setLoading(true);
    setShowModal(true);
    setResult(null);

    try {
      const output = await generateResearchAbstract({
        problem: form.problem,
        participants: form.participants,
        intervention: form.intervention
      });
      setResult(output);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-card border border-primary/20 rounded-2xl p-8 shadow-[0_0_50px_rgba(51,133,255,0.05)] h-fit sticky top-32">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-xl shadow-primary/40 group relative overflow-hidden">
            <Sparkles size={28} className="relative z-10 transition-transform group-hover:scale-125 duration-500" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          </div>
          <div>
            <h3 className="font-bold text-xl text-foreground tracking-tight leading-none">AI Abstract Generator</h3>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-2">Academic Research Engine</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Problem Statement</Label>
            <Textarea 
              value={form.problem}
              onChange={(e) => setForm({...form, problem: e.target.value})}
              className="w-full bg-background/50 border-border rounded-xl p-4 text-sm text-foreground focus:ring-1 focus:ring-primary/50 outline-none h-32 resize-none placeholder:text-muted-foreground/30 font-medium" 
              placeholder="e.g., Low reading comprehension among Grade 7 students due to..."
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Target Participants</Label>
            <Input 
              value={form.participants}
              onChange={(e) => setForm({...form, participants: e.target.value})}
              className="w-full bg-background/50 border-border rounded-xl px-4 h-12 text-sm text-foreground focus:ring-1 focus:ring-primary/50" 
              placeholder="e.g., 45 Grade 7 students at Digos City NHS" 
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Proposed Intervention</Label>
            <Input 
              value={form.intervention}
              onChange={(e) => setForm({...form, intervention: e.target.value})}
              className="w-full bg-background/50 border-border rounded-xl px-4 h-12 text-sm text-foreground focus:ring-1 focus:ring-primary/50" 
              placeholder="e.g., Gamified contextualized reading modules..." 
            />
          </div>
        </div>

        <Button 
          onClick={handleGenerate}
          disabled={loading || !form.problem || !form.participants || !form.intervention}
          className="w-full mt-10 h-14 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-black uppercase tracking-[0.15em] shadow-xl transition-all flex items-center justify-center gap-3 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={16} />}
          Draft Research Abstract <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Button>
        
        <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-secondary/30 p-3 rounded-lg border border-border">
          <Activity size={12} className="text-primary" /> Recent: Gamified Math Impact (2H Ago)
        </div>
      </div>

      <IntelligenceModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        isLoading={loading}
        context="Academic Engine: BERF Abstract Generator"
        data={result ? { abstract: result.abstract } : null}
      />
    </>
  );
}