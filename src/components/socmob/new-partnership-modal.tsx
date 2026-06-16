"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Handshake, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';

const formSchema = z.object({
  donorName: z.string().min(2, "Partner name is required"),
  type: z.string().min(1, "Please select a resource type"),
  description: z.string().optional(),
  beneficiarySchoolId: z.string().min(2, "School name is required"),
  amountValue: z.coerce.number().min(1, "Value must be greater than 0"),
});

interface NewPartnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewPartnershipModal({ isOpen, onClose }: NewPartnershipModalProps) {
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      donorName: "",
      type: "In-kind",
      description: "",
      beneficiarySchoolId: "",
      amountValue: 0,
    },
  });

  // Watch the type field to conditionally render specification
  const resourceType = form.watch('type');

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user) return;

    // Direct write to Firestore donations collection
    addDocumentNonBlocking(collection(firestore, 'donations'), {
      ...values,
      id: `DON-${Math.floor(Math.random() * 100000)}`,
      currency: "PHP",
      receivedAt: new Date().toISOString(),
      recordedByUserId: user.uid,
      relatedToUnitId: "SocMob"
    });

    form.reset();
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border shadow-2xl p-8">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Handshake size={24} />
            </div>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-foreground">Register New Partnership</DialogTitle>
          </div>
          <DialogDescription className="text-sm font-medium text-muted-foreground mt-2">
            Complete the details below to record a new stakeholder donation or partnership agreement. This data persists in the SGOD Firestore cluster.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="donorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Partner / Organization Name</FormLabel>
                  <FormControl>
                    <Input suppressHydrationWarning placeholder="e.g., Rotary Club Digos City" {...field} className="bg-secondary/30 h-14 rounded-xl text-foreground font-bold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resource Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger suppressHydrationWarning className="bg-secondary/30 h-14 rounded-xl text-foreground font-bold">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="In-kind">In-kind</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Service">Service</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {resourceType !== 'Cash' && (
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Specification</FormLabel>
                      <FormControl>
                        <Input suppressHydrationWarning placeholder="e.g., 5 Laptops" {...field} className="bg-secondary/30 h-14 rounded-xl text-foreground font-bold" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="beneficiarySchoolId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Beneficiary School</FormLabel>
                  <FormControl>
                    <Input suppressHydrationWarning placeholder="e.g., Aplaya Elementary School" {...field} className="bg-secondary/30 h-14 rounded-xl text-foreground font-bold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amountValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estimated Value (PHP)</FormLabel>
                  <FormControl>
                    <Input suppressHydrationWarning type="number" placeholder="0.00" {...field} className="bg-secondary/30 h-14 rounded-xl text-foreground font-black text-lg" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-6">
              <Button suppressHydrationWarning type="button" variant="outline" onClick={onClose} className="flex-1 h-14 rounded-xl text-xs font-black uppercase tracking-widest text-foreground">
                Cancel
              </Button>
              <Button suppressHydrationWarning type="submit" className="flex-1 h-14 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                Finalize Registry
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
