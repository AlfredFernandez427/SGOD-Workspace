
"use client";

import React, { useState, useMemo } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Briefcase, 
  HardHat, 
  Construction, 
  Building2,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VendorDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractors: Array<{ name: string; projectCount: number }>;
  infrastructure: any[] | null;
}

export function VendorDirectoryModal({ isOpen, onClose, contractors, infrastructure }: VendorDirectoryModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContractor, setSelectedContractor] = useState<string | null>(null);

  const filteredContractors = useMemo(() => {
    return contractors.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contractors, searchTerm]);

  const contractorProjects = useMemo(() => {
    if (!selectedContractor || !infrastructure) return [];
    return infrastructure.filter(i => i.contractorName === selectedContractor);
  }, [selectedContractor, infrastructure]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl bg-card border-border shadow-2xl p-0 overflow-hidden h-[80vh] flex flex-col">
        <DialogHeader className="p-8 border-b border-border bg-secondary/10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Briefcase size={24} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Vetted Vendor Directory</DialogTitle>
                <DialogDescription className="text-xs font-bold text-muted-foreground uppercase mt-1">Master Registry of Infrastructure Partners</DialogDescription>
              </div>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input 
                placeholder="Search contractors..." 
                className="h-10 pl-9 bg-background/50 rounded-xl border-border text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Contractors List */}
          <div className="w-1/3 border-r border-border bg-secondary/5 flex flex-col">
            <div className="p-4 border-b border-border bg-secondary/10">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Select Vendor</p>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredContractors.length > 0 ? (
                  filteredContractors.map((vendor) => (
                    <button
                      key={vendor.name}
                      onClick={() => setSelectedContractor(vendor.name)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl transition-all group flex items-center justify-between",
                        selectedContractor === vendor.name 
                          ? "bg-primary text-white shadow-lg shadow-primary/20" 
                          : "hover:bg-primary/5 text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <HardHat size={16} className={cn(selectedContractor === vendor.name ? "text-white" : "text-primary")} />
                        <span className="text-sm font-bold truncate max-w-[150px]">{vendor.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn(
                          "text-[10px] font-black",
                          selectedContractor === vendor.name ? "border-white/20 text-white" : "border-primary/20 text-primary"
                        )}>
                          {vendor.projectCount}
                        </Badge>
                        <ChevronRight size={14} className={cn(
                          "transition-transform",
                          selectedContractor === vendor.name ? "translate-x-1" : "opacity-0 group-hover:opacity-100"
                        )} />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase">No results</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Details View */}
          <div className="flex-1 bg-background flex flex-col">
            {selectedContractor ? (
              <>
                <div className="p-8 border-b border-border bg-secondary/5 shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-foreground uppercase tracking-tight">{selectedContractor}</h3>
                      <p className="text-xs font-bold text-muted-foreground uppercase mt-1">Operational Project History</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-primary">{contractorProjects.length}</p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Projects</p>
                    </div>
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-8">
                    <Table>
                      <TableHeader className="bg-secondary/30 border-b border-border">
                        <TableRow>
                          <TableHead className="px-4 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">School & Project ID</TableHead>
                          <TableHead className="px-4 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Scope / Completion</TableHead>
                          <TableHead className="px-4 py-4 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contractorProjects.map((project) => (
                          <TableRow key={project.id} className="hover:bg-primary/[0.02] border-none group">
                            <TableCell className="px-4 py-5">
                              <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{project.schoolName}</p>
                              <code className="text-[10px] font-black text-muted-foreground mt-1 block">{project.projectId}</code>
                            </TableCell>
                            <TableCell className="px-4 py-5">
                              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                <Construction size={12} />
                                <span className="truncate max-w-[200px]">{project.scopeOfWork}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground mt-1">
                                <Calendar size={10} />
                                <span>Target: {project.targetCompletionDate || 'N/A'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-5 text-right">
                              <Badge className={cn(
                                "text-[10px] font-black uppercase px-2 py-0.5",
                                project.status?.toLowerCase().includes('completed') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                project.status?.toLowerCase().includes('ongoing') ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                'bg-primary/10 text-primary border-primary/20'
                              )} variant="outline">{project.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                <div className="w-20 h-20 rounded-3xl bg-secondary/50 flex items-center justify-center mb-6">
                  <Building2 size={40} className="text-muted-foreground/30" />
                </div>
                <h4 className="text-sm font-black uppercase text-foreground tracking-widest">Vendor Intelligence</h4>
                <p className="text-xs text-muted-foreground mt-2 max-w-xs font-medium">Select a contractor from the directory to view detailed project allocation and technical status.</p>
              </div>
            )}
          </div>
        </div>

        <div className="px-8 py-4 border-t border-border bg-secondary/20 flex items-center justify-between shrink-0">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            {contractors.length} Vetted Partners Identified
          </p>
          <p className="text-[10px] font-black text-primary uppercase tracking-widest">
            Real-time Division Records
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
