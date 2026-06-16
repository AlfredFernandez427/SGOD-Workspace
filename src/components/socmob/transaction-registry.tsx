"use client";

import React, { useState, useEffect } from 'react';
import { Handshake, Search, Loader2, ChevronLeft, ChevronRight, Edit, Trash2, Save, X } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser, updateDocumentNonBlocking, deleteDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const editFormSchema = z.object({
  donorName: z.string().min(2, "Partner name is required"),
  type: z.string().min(1, "Please select a resource type"),
  description: z.string().optional(),
  beneficiarySchoolId: z.string().min(2, "School name is required"),
  amountValue: z.coerce.number().min(1, "Value must be greater than 0"),
});

export function TransactionRegistry() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingDonation, setEditingDonation] = useState<any>(null);
  const itemsPerPage = 5;
  
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const profileRef = useMemoFirebase(() => {
    if (!user || !firestore || user.isAnonymous) return null;
    return doc(firestore, 'user_profiles', user.uid);
  }, [user, firestore]);
  const { data: profile } = useDoc(profileRef);

  const isAuthorized = user?.email === 'admin@admin.com' || (profile && (profile.isActive === true || profile.isAdmin === true || profile.unitId === 'SocMob & DPDS' || profile.unitId === 'SGOD'));

  const donationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'donations'), orderBy('receivedAt', 'desc'));
  }, [firestore, user]);

  const { data: donations, isLoading } = useCollection(donationsQuery);

  const filteredDonations = React.useMemo(() => {
    if (!donations) return [];
    return donations.filter(d => 
      d.donorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.beneficiarySchoolId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [donations, searchTerm]);

  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDonations.slice(start, start + itemsPerPage);
  }, [filteredDonations, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleUpdate = (values: z.infer<typeof editFormSchema>) => {
    if (!firestore || !editingDonation) return;
    updateDocumentNonBlocking(doc(firestore, 'donations', editingDonation.id), {
      ...values,
      updatedAt: new Date().toISOString()
    });
    toast({ title: "Registry Updated" });
    setEditingDonation(null);
  };

  const handleDelete = (id: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'donations', id));
    toast({ title: "Record Purged" });
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[400px]">
      <div className="px-8 py-6 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-secondary/10 shrink-0">
        <div className="flex items-center gap-3">
           <Handshake size={18} className="text-primary" />
           <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Registry of Transactions</h3>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <Input 
            placeholder="Search donors or schools..." 
            className="h-10 pl-9 text-xs bg-background/50 border-border rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-x-auto no-scrollbar relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/50 backdrop-blur-sm z-10">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-[10px] font-black text-muted-foreground uppercase mt-4 tracking-widest">Retrieving Transaction Logs</p>
          </div>
        ) : filteredDonations.length > 0 ? (
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Partner & School</TableHead>
                <TableHead className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Resource Type</TableHead>
                <TableHead className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Value (PHP)</TableHead>
                <TableHead className="px-8 py-5 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date Received</TableHead>
                {isAuthorized && <TableHead className="px-8 py-5 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {paginatedData.map((donation: any) => (
                <TableRow key={donation.id} className="hover:bg-primary/[0.02] transition-colors border-none group">
                  <TableCell className="px-8 py-6">
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{donation.donorName}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">To: {donation.beneficiarySchoolId}</p>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <Badge variant="outline" className="text-[9px] font-black uppercase px-2 py-0.5 border-primary/20 text-primary bg-primary/5">
                      {donation.type}
                    </Badge>
                    {donation.description && (
                      <p className="text-[9px] text-muted-foreground mt-1 truncate max-w-[150px]">{donation.description}</p>
                    )}
                  </TableCell>
                  <TableCell className="px-8 py-6 text-right">
                    <span className="text-sm font-black text-emerald-500">₱ {donation.amountValue?.toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-right text-[10px] font-bold text-muted-foreground uppercase">
                    {donation.receivedAt ? format(new Date(donation.receivedAt), 'MMM dd, yyyy') : 'N/A'}
                  </TableCell>
                  {isAuthorized && (
                    <TableCell className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => setEditingDonation(donation)} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"><Edit size={14} /></button>
                         <button onClick={() => handleDelete(donation.id)} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"><Trash2 size={14} /></button>
                       </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center h-full">
            <Handshake size={48} className="text-muted-foreground/10 mb-4" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No transactions recorded.</p>
          </div>
        )}
      </div>

      <div className="px-8 py-4 border-t border-border bg-secondary/10 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
          Showing Page {currentPage} of {totalPages || 1} <span className="mx-2 text-border">•</span> {filteredDonations.length} Logs
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="h-8 rounded-lg bg-background text-[10px] font-black uppercase px-3"><ChevronLeft size={14} className="mr-1" /> Prev</Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || totalPages === 0} className="h-8 rounded-lg bg-background text-[10px] font-black uppercase px-3">Next <ChevronRight size={14} className="ml-1" /></Button>
        </div>
      </div>

      {editingDonation && (
        <EditDonationDialog 
          donation={editingDonation} 
          onClose={() => setEditingDonation(null)} 
          onSave={handleUpdate} 
        />
      )}
    </div>
  );
}

function EditDonationDialog({ donation, onClose, onSave }: { donation: any, onClose: () => void, onSave: (values: any) => void }) {
  const form = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      donorName: donation.donorName || "",
      type: donation.type || "In-kind",
      description: donation.description || "",
      beneficiarySchoolId: donation.beneficiarySchoolId || "",
      amountValue: donation.amountValue || 0,
    },
  });

  const resourceType = form.watch('type');

  return (
    <Dialog open={!!donation} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-card border-border shadow-2xl p-0 overflow-hidden rounded-3xl">
        <DialogHeader className="p-8 border-b border-border bg-secondary/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Edit size={24} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Edit Transaction</DialogTitle>
              <DialogDescription className="text-xs font-bold text-muted-foreground uppercase mt-1">Modify registry parameters for {donation.donorName}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="p-8 space-y-6">
            <FormField control={form.control} name="donorName" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest">Partner Organization</FormLabel><FormControl><Input {...field} className="bg-secondary/30 h-12 rounded-xl font-bold" /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-6">
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest">Resource Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="bg-secondary/30 h-12 rounded-xl font-bold"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="In-kind">In-kind</SelectItem><SelectItem value="Cash">Cash</SelectItem><SelectItem value="Service">Service</SelectItem></SelectContent></Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="amountValue" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest">Value (PHP)</FormLabel><FormControl><Input type="number" {...field} className="bg-secondary/30 h-12 rounded-xl font-black" /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="beneficiarySchoolId" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest">Beneficiary School</FormLabel><FormControl><Input {...field} className="bg-secondary/30 h-12 rounded-xl font-bold" /></FormControl><FormMessage /></FormItem>
            )} />
            {resourceType !== 'Cash' && (
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest">Specification</FormLabel><FormControl><Input {...field} className="bg-secondary/30 h-12 rounded-xl" /></FormControl><FormMessage /></FormItem>
              )} />
            )}
            <DialogFooter className="pt-4 flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl uppercase text-[10px] font-black">Cancel</Button>
              <Button type="submit" className="flex-1 h-12 bg-primary text-white rounded-xl uppercase text-[10px] font-black shadow-lg shadow-primary/20">Commit Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
