
"use client";

import React, { useState } from 'react';
import { Table as TableIcon, FileUp, Loader2, Database, AlertCircle, CheckCircle2, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import * as XLSX from 'xlsx';

interface ExcelImporterProps {
  onDataExtracted?: (records: any[]) => void;
}

export function ExcelImporter({ onDataExtracted }: ExcelImporterProps) {
  const [loading, setLoading] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        if (data.length < 2) {
          throw new Error("The file appears to be empty or missing headers.");
        }

        const headers = data[0].map(h => String(h).toLowerCase().trim());
        const rows = data.slice(1);

        const findIndex = (searchTerms: string[]) => 
          headers.findIndex(h => searchTerms.some(term => h.includes(term)));

        const indices = {
          projectId: findIndex(['id', 'project id', 'ref']),
          schoolName: findIndex(['school', 'name']),
          municipality: findIndex(['municipality', 'town', 'district']),
          projectCost: findIndex(['cost', 'amount', 'budget', 'value']),
          contractorName: findIndex(['contractor', 'vendor']),
          scopeOfWork: findIndex(['scope', 'work', 'description']),
          targetCompletionDate: findIndex(['target', 'completion', 'deadline']),
          latestAccomplishment: findIndex(['accomplishment', '%', 'progress', 'percent']),
          status: findIndex(['status', 'state'])
        };

        const extracted = rows.map((row, index) => {
          const getVal = (idx: number) => row[idx] !== undefined ? String(row[idx]).trim() : "";
          
          return {
            projectId: getVal(indices.projectId) || `ROW-${index + 1}`,
            schoolName: getVal(indices.schoolName) || "Unknown School",
            municipality: getVal(indices.municipality) || "Unknown",
            projectCost: getVal(indices.projectCost) || "N/A",
            contractorName: getVal(indices.contractorName) || "N/A",
            scopeOfWork: getVal(indices.scopeOfWork) || "N/A",
            targetCompletionDate: getVal(indices.targetCompletionDate) || "N/A",
            latestAccomplishment: getVal(indices.latestAccomplishment) || "0%",
            status: getVal(indices.status) || "ON-GOING"
          };
        }).filter(r => r.schoolName !== "Unknown School");

        setRecords(extracted);
        if (onDataExtracted) onDataExtracted(extracted);
        
        toast({
          title: "Spreadsheet Parsed",
          description: `Extracted ${extracted.length} records successfully.`
        });
      } catch (err: any) {
        setError(err.message || "Failed to parse Excel file.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleCommit = async () => {
    if (!firestore || records.length === 0) return;
    setIsCommitting(true);

    try {
      const colRef = collection(firestore, 'school_infrastructure');
      for (const record of records) {
        // Clean accomplishment data
        let acc = record.latestAccomplishment.replace(/[^0-9.]/g, '');
        if (acc) {
          const num = parseFloat(acc);
          acc = (isNaN(num) ? "0" : (num % 1 === 0 ? num.toFixed(0) : num.toString())) + '%';
        } else {
          acc = "0%";
        }

        // Clean cost
        let cost = record.projectCost;
        if (cost !== "N/A" && !cost.startsWith('₱')) {
          cost = `₱ ${cost}`;
        }

        await addDocumentNonBlocking(colRef, {
          ...record,
          latestAccomplishment: acc,
          projectCost: cost,
          createdAt: new Date().toISOString(),
          source: "Excel Import Protocol"
        });
      }

      toast({
        title: "Registry Synchronized",
        description: `Committed ${records.length} records to the Master Database.`
      });
      setRecords([]);
    } catch (err) {
      toast({ variant: "destructive", title: "Protocol Error", description: "Failed to sync with registry." });
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-background border border-border rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm">
            <TableIcon size={28} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-foreground tracking-tight leading-none">Excel Importer</h3>
            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em] mt-2">Spreadsheet Extraction Hub</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-destructive/5 border-destructive/20 rounded-xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-[10px] font-black uppercase">Import Error</AlertTitle>
            <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
          </Alert>
        )}

        <div className="p-10 border-2 border-dashed border-border rounded-2xl bg-secondary/10 flex flex-col items-center justify-center text-center group hover:border-emerald-500/50 transition-all cursor-pointer relative">
          <input 
            type="file" 
            accept=".xlsx,.xls,.csv" 
            className="absolute inset-0 opacity-0 cursor-pointer" 
            onChange={handleFileUpload}
            disabled={loading || isCommitting}
          />
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            {loading ? <Loader2 className="animate-spin text-emerald-500" size={32} /> : <FileUp className="text-emerald-500" size={32} />}
          </div>
          <p className="text-sm font-bold text-foreground">Upload Project Spreadsheet</p>
          <p className="text-[10px] text-muted-foreground uppercase font-black mt-2">Supports XLSX, XLS, and CSV Formats</p>
        </div>
      </div>

      {records.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-border bg-secondary/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <List size={16} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">Extraction Preview</span>
              </div>
              <Badge className="bg-emerald-500 text-white font-black uppercase text-[10px]">{records.length} Records Detected</Badge>
            </div>
            <div className="max-h-[400px] overflow-auto no-scrollbar">
              <Table>
                <TableHeader className="bg-secondary/30 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="px-6 py-4 text-[9px] font-black uppercase">Project & School</TableHead>
                    <TableHead className="px-6 py-4 text-[9px] font-black uppercase">Municipality</TableHead>
                    <TableHead className="px-6 py-4 text-[9px] font-black uppercase">Contractor</TableHead>
                    <TableHead className="px-6 py-4 text-[9px] font-black uppercase text-right">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.slice(0, 10).map((r, i) => (
                    <TableRow key={i} className="border-b border-border/50">
                      <TableCell className="px-6 py-4">
                        <p className="text-xs font-bold text-foreground">{r.schoolName}</p>
                        <code className="text-[8px] text-primary">{r.projectId}</code>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-[10px] font-medium">{r.municipality}</TableCell>
                      <TableCell className="px-6 py-4 text-[10px] font-medium">{r.contractorName}</TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <span className="text-xs font-black text-emerald-500">{r.latestAccomplishment}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {records.length > 10 && (
                <div className="p-4 text-center bg-secondary/5 border-t border-border">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">...and {records.length - 10} more records</p>
                </div>
              )}
            </div>
          </div>

          <Button 
            onClick={handleCommit}
            disabled={isCommitting}
            className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-3"
          >
            {isCommitting ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
            Commit Extraction to Master Registry
          </Button>
        </div>
      )}
    </div>
  );
}
