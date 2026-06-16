"use client";

import React, { useState } from 'react';
import { Sparkles, FileUp, Loader2, List, AlertCircle, Info, Database, FileText, CheckCircle2 } from 'lucide-react';
import { extractFacilityData } from '@/ai/flows/extract-facility-data';
import { IntelligenceModal } from '@/components/ai/intelligence-modal';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';

interface AIPdfExtractorProps {
  onRecordsExtracted: (records: any[]) => void;
  pendingRecords: any[];
}

export function AIPdfExtractor({ onRecordsExtracted, pendingRecords }: AIPdfExtractorProps) {
  const [loading, setLoading] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const supportedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!supportedTypes.includes(file.type)) {
      setError("Unsupported file format. Please upload a PDF or high-resolution image.");
      return;
    }

    setLoading(true);
    setError(null);
    setShowModal(true);
    onRecordsExtracted([]);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const result = await extractFacilityData({ documentDataUri: base64 });
        onRecordsExtracted(result.records || []);
        toast({
          title: "Technical Cleanse Complete",
          description: `Identified ${result.records.length} clean project records. Junk data has been discarded.`,
        });
      } catch (err: any) {
        const message = err.message || "Failed to identify records. Ensure the document contains a clear project table.";
        setError(message);
        toast({ title: "Extraction Issue", variant: "destructive", description: message });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCommitToRegistry = async () => {
    if (!firestore || pendingRecords.length === 0) return;
    setIsCommitting(true);

    try {
      const colRef = collection(firestore, 'school_infrastructure');
      for (const record of pendingRecords) {
        addDocumentNonBlocking(colRef, {
          ...record,
          createdAt: new Date().toISOString(),
          source: "AI Precision Scan"
        });
      }

      toast({
        title: "Registry Synchronized",
        description: `${pendingRecords.length} records have been committed to the master database.`,
      });
      onRecordsExtracted([]);
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Error", description: "Failed to commit records." });
    } finally {
      setIsCommitting(false);
    }
  };

  const summaryText = pendingRecords.length > 0 
    ? `Intelligence Synthesis Complete:\n\nDetected ${pendingRecords.length} unique project records.\n\nSummary of found schools:\n${pendingRecords.map(r => `• ${r.schoolName} (${r.projectId})`).join('\n')}\n\nProceed to commit these records to the master registry.`
    : error ? `Analysis Issue: ${error}` : "Scanning document for technical metadata...";

  return (
    <>
      <div className="bg-background border border-border rounded-2xl p-8 shadow-sm h-fit">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-xl shadow-primary/40 group">
            <FileText size={28} className="group-hover:rotate-12 transition-transform" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-foreground tracking-tight leading-none">AI Document Scanner</h3>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-2">Technical Intelligence Layer</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-destructive/5 border-destructive/20 rounded-xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-[10px] font-black uppercase">Scanning Failed</AlertTitle>
            <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div className="p-10 border-2 border-dashed border-border rounded-2xl bg-secondary/10 flex flex-col items-center justify-center text-center group hover:border-primary/50 transition-all cursor-pointer relative">
            <input 
              type="file" 
              accept=".pdf,.png,.jpg,.jpeg" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleFileChange}
              disabled={loading || isCommitting}
            />
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              {loading ? <Loader2 className="animate-spin text-primary" size={32} /> : <FileUp className="text-primary" size={32} />}
            </div>
            <p className="text-sm font-bold text-foreground">Upload Technical Report (PDF/IMG)</p>
            <p className="text-[10px] text-muted-foreground uppercase font-black mt-2">AI Precision Cleaning Protocol Active</p>
          </div>

          <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-xl border border-border">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-foreground">Clean Data Guarantee</p>
              <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                The engine automatically filters out noisy headers, footers, and summary totals from the extracted dataset.
              </p>
            </div>
          </div>
        </div>

        {pendingRecords.length > 0 && (
          <div className="mt-8 space-y-4 animate-in slide-in-from-top-4 duration-500">
             <div className="flex items-center justify-between px-2 mb-4">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                   <List size={12} /> Extraction Queue:
                </span>
                <Badge variant="outline" className="text-[10px] font-black bg-emerald-500/5 text-emerald-500 border-emerald-500/20">{pendingRecords.length} Records</Badge>
             </div>
             
             <Button 
               onClick={handleCommitToRegistry}
               disabled={isCommitting}
               className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-3"
             >
               {isCommitting ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
               Commit Verified Registry
             </Button>
          </div>
        )}
      </div>

      <IntelligenceModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        isLoading={loading}
        context="AI Intelligence: Precision Technical Scan"
        data={pendingRecords.length > 0 ? { briefing: summaryText } : error ? { briefing: `Scan Error: ${error}` } : null}
      />
    </>
  );
}