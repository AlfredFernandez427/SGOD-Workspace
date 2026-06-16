
"use client";

import React, { useState, useEffect } from 'react';
import { Database, Search, Loader2, MapPin, Calendar, HardHat, Info, ChevronLeft, ChevronRight, Filter, Edit, Save, X as CloseIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCollection, useFirestore, useMemoFirebase, useUser, updateDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { format, parseISO, getMonth } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MONTHS = [
  { id: 'all', label: 'All Months' },
  { id: '0', label: 'January' },
  { id: '1', label: 'February' },
  { id: '2', label: 'March' },
  { id: '3', label: 'April' },
  { id: '4', label: 'May' },
  { id: '5', label: 'June' },
  { id: '6', label: 'July' },
  { id: '7', label: 'August' },
  { id: '8', label: 'September' },
  { id: '9', label: 'October' },
  { id: '10', label: 'November' },
  { id: '11', label: 'December' },
];

const editFormSchema = z.object({
  projectId: z.string().min(2, "Project ID is required"),
  schoolName: z.string().min(2, "School name is required"),
  municipality: z.string().min(2, "Municipality is required"),
  scopeOfWork: z.string().min(5, "Detailed scope is required"),
  projectCost: z.string().optional().or(z.literal('')),
  contractorName: z.string().optional().or(z.literal('')),
  targetCompletionDate: z.string().optional().or(z.literal('')),
  latestAccomplishment: z.string().min(1, "Accomplishment is required"),
  status: z.string().min(1, "Status is required"),
});

export function InfraDatabase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const itemsPerPage = 5;

  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const profileRef = useMemoFirebase(() => {
    if (!user || !firestore || user.isAnonymous) return null;
    return doc(firestore, 'user_profiles', user.uid);
  }, [user, firestore]);
  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  const infraQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    // Newest to oldest order
    return query(collection(firestore, 'school_infrastructure'), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: infrastructure, isLoading } = useCollection(infraQuery);

  const isAuthorizedToEdit = user?.email === 'admin@admin.com' || (profile && (
    profile.isActive === true || 
    profile.role === 'Admin' || 
    profile.role === 'SGOD Chief' || 
    profile.unitId === 'SGOD' ||
    profile.unitId === 'Education Facilities'
  ));

  const filteredData = React.useMemo(() => {
    if (!infrastructure) return [];
    return infrastructure.filter(item => {
      const matchesSearch = item.schoolName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.projectId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.municipality?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMonth = selectedMonth === 'all' || (item.createdAt && getMonth(parseISO(item.createdAt)).toString() === selectedMonth);

      return matchesSearch && matchesMonth;
    });
  }, [infrastructure, searchTerm, selectedMonth]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedMonth]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const formatCost = (cost: string) => {
    if (!cost || cost === '0' || cost.toLowerCase() === 'n/a') return 'N/A';
    if (cost.startsWith('₱')) return cost;
    return `₱ ${cost}`;
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);
  };

  const handleUpdate = (values: z.infer<typeof editFormSchema>) => {
    if (!firestore || !editingProject) return;

    let cost = values.projectCost?.trim() || "";
    if (cost === "" || cost === "0") {
      cost = "N/A";
    } else if (!cost.startsWith('₱') && cost !== "N/A") {
      cost = `₱ ${cost}`;
    }

    const contractor = values.contractorName?.trim() || "N/A";
    const targetDate = values.targetCompletionDate?.trim() || "N/A";

    let acc = values.latestAccomplishment.replace(/[^0-9.]/g, '');
    if (acc) {
      const num = parseFloat(acc);
      if (!isNaN(num)) {
        acc = (num % 1 === 0 ? num.toFixed(0) : num.toString()) + '%';
      } else {
        acc = "0%";
      }
    } else {
      acc = "0%";
    }

    const updatedData = {
      ...values,
      projectCost: cost,
      contractorName: contractor,
      targetCompletionDate: targetDate,
      latestAccomplishment: acc,
      updatedAt: new Date().toISOString(),
    };

    updateDocumentNonBlocking(doc(firestore, 'school_infrastructure', editingProject.id), updatedData);

    toast({
      title: "Registry Updated",
      description: `Project ${values.projectId} has been updated in the database.`,
    });

    setEditingProject(null);
  };

  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl no-scrollbar flex flex-col w-full" suppressHydrationWarning>
      <div className="px-8 py-6 border-b border-border flex flex-col xl:flex-row items-center justify-between gap-6 bg-secondary/10">
        <div className="flex items-center gap-3 shrink-0">
          <Database size={18} className="text-primary" />
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Project Registry</h3>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <Input 
              placeholder="Search school or project ID..." 
              className="h-10 pl-9 text-xs bg-background/50 border-border rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter size={14} className="text-muted-foreground hidden sm:block" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="h-10 w-full sm:w-48 bg-background/50 border-border rounded-xl text-xs font-bold uppercase">
                <SelectValue placeholder="Filter by Month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="text-xs font-bold uppercase">
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto no-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Querying Dataset</p>
          </div>
        ) : filteredData.length > 0 ? (
          <TooltipProvider>
            <Table className="min-w-[1200px]">
              <TableHeader className="bg-secondary/30 border-b border-border">
                <TableRow>
                  <TableHead className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Project ID & School</TableHead>
                  <TableHead className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Municipality</TableHead>
                  <TableHead className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Scope of Work</TableHead>
                  <TableHead className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Project Cost</TableHead>
                  <TableHead className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Contractor</TableHead>
                  <TableHead className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Accomplishment</TableHead>
                  <TableHead className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Status</TableHead>
                  <TableHead className="px-6 py-5 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {paginatedData.map((item: any) => (
                  <TableRow key={item.id} className="hover:bg-primary/[0.02] transition-colors border-none group">
                    <TableCell className="px-6 py-6">
                      <code className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded mb-1.5 block w-fit">{item.projectId}</code>
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.schoolName}</p>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-xs font-semibold text-muted-foreground">
                      {item.municipality || 'N/A'}
                    </TableCell>
                    <TableCell className="px-6 py-6 max-w-[220px]">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-xs font-medium text-muted-foreground leading-snug line-clamp-2 cursor-help">
                            {item.scopeOfWork}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-md p-4 bg-card border-border shadow-2xl z-[100]">
                          <p className="text-xs font-medium text-foreground">{item.scopeOfWork || "No detailed scope provided."}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-xs font-black text-primary whitespace-nowrap">
                      {formatCost(item.projectCost)}
                    </TableCell>
                    <TableCell className="px-6 py-6 text-xs font-bold text-foreground">
                      {item.contractorName || 'N/A'}
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <span className="text-xs font-black text-emerald-500">{item.latestAccomplishment || '0'}</span>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-center">
                      <Badge className={cn(
                        "text-[10px] font-black px-3 py-1 rounded-full whitespace-nowrap",
                        item.status?.toUpperCase().includes('COMPLETED') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                        item.status?.toUpperCase().includes('ON-GOING') ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                        'bg-primary/10 text-primary border-primary/20'
                      )} variant="outline">{item.status?.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-right">
                      {isAuthorizedToEdit && (
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all">
                          <Edit size={14} />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TooltipProvider>
        ) : (
          <div className="py-24 text-center border-t border-border bg-secondary/5">
            <Database size={48} className="text-muted-foreground/10 mx-auto mb-4" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No infrastructure records found.</p>
          </div>
        )}
      </div>

      <div className="px-8 py-4 border-t border-border bg-secondary/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
          Showing Page {currentPage} of {totalPages || 1} <span className="mx-2 text-border">•</span> {filteredData.length} Records
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1} className="h-8 rounded-lg bg-background text-[10px] font-black uppercase">
            <ChevronLeft size={14} /> Prev
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0} className="h-8 rounded-lg bg-background text-[10px] font-black uppercase">
            Next <ChevronRight size={14} />
          </Button>
        </div>
      </div>

      {editingProject && (
        <EditProjectDialog 
          project={editingProject} 
          onClose={() => setEditingProject(null)} 
          onSave={handleUpdate} 
        />
      )}
    </div>
  );
}

function EditProjectDialog({ project, onClose, onSave }: { project: any, onClose: () => void, onSave: (values: any) => void }) {
  const form = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      projectId: project.projectId || "",
      schoolName: project.schoolName || "",
      municipality: project.municipality || "",
      scopeOfWork: project.scopeOfWork || "",
      projectCost: project.projectCost?.replace('₱ ', '') || "",
      contractorName: project.contractorName || "",
      targetCompletionDate: project.targetCompletionDate || "",
      latestAccomplishment: project.latestAccomplishment || "0",
      status: project.status || "ON-GOING",
    },
  });

  return (
    <Dialog open={!!project} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-card border-border shadow-2xl p-0 overflow-hidden h-[90vh] sm:h-auto flex flex-col rounded-2xl">
        <DialogHeader className="p-8 border-b border-border bg-secondary/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Edit size={24} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Edit Project Record</DialogTitle>
              <DialogDescription className="text-xs font-bold text-muted-foreground uppercase mt-2">Update parameters for {project.projectId}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 overflow-y-auto max-h-[60vh] no-scrollbar">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} id="edit-project-form" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="projectId" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Project ID</FormLabel><FormControl><Input {...field} className="bg-secondary/20 h-12 text-sm rounded-xl font-bold" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="schoolName" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase text-muted-foreground">School Name</FormLabel><FormControl><Input {...field} className="bg-secondary/20 h-12 text-sm rounded-xl font-bold" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="municipality" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Municipality</FormLabel><FormControl><Input {...field} className="bg-secondary/20 h-12 text-sm rounded-xl font-bold" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="projectCost" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Project Cost</FormLabel><FormControl><Input {...field} className="bg-secondary/20 h-12 text-sm rounded-xl font-black text-primary" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="contractorName" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Contractor</FormLabel><FormControl><Input {...field} className="bg-secondary/20 h-12 text-sm rounded-xl font-bold" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="scopeOfWork" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Scope of Work</FormLabel><FormControl><Textarea {...field} className="bg-secondary/20 min-h-[100px] text-sm rounded-xl resize-none" /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="targetCompletionDate" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Target Date</FormLabel><FormControl><Input type="date" {...field} className="bg-secondary/20 h-12 text-sm rounded-xl font-bold" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="latestAccomplishment" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Accomplishment (%)</FormLabel><FormControl><Input {...field} className="bg-secondary/20 h-12 text-sm rounded-xl font-black text-emerald-500" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="bg-secondary/20 h-12 text-sm rounded-xl font-bold"><SelectValue placeholder="Select Status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="ON-GOING">ON-GOING</SelectItem><SelectItem value="COMPLETED">COMPLETED</SelectItem><SelectItem value="SUSPENDED">SUSPENDED</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="p-8 border-t border-border bg-secondary/10 flex flex-col sm:flex-row gap-4">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto h-12 px-8 rounded-xl text-[10px] font-black uppercase">Discard</Button>
          <Button form="edit-project-form" type="submit" className="w-full sm:w-auto h-12 px-8 bg-primary text-white rounded-xl text-[10px] font-black uppercase shadow-xl">Commit Updates</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
