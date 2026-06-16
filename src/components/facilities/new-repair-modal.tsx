
"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Wrench, Send, Loader2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  schoolName: z.string().min(2, "School name is required"),
  description: z.string().min(10, "Details must be at least 10 characters"),
  urgency: z.enum(["High", "Medium", "Low"]),
  contactNumber: z.string().length(11, "Must be 11 digits"),
});

interface NewRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewRepairModal({ isOpen, onClose }: NewRepairModalProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schoolName: "",
      description: "",
      urgency: "Medium",
      contactNumber: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore || !user) return;
    setIsSubmitting(true);

    try {
      // 1. Log to Repair Registry
      await addDocumentNonBlocking(collection(firestore, 'repair_requests'), {
        ...values,
        status: "Pending",
        submittedBy: user.uid,
        createdAt: new Date().toISOString()
      });

      toast({
        title: "Maintenance Alert Dispatched",
        description: "Report has been successfully logged in the Facilities Registry."
      });
      
      form.reset();
      onClose();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "System Error", description: "Failed to dispatch alert." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border shadow-2xl p-0 overflow-hidden rounded-3xl">
        <DialogHeader className="p-10 border-b border-border bg-amber-500/5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Wrench size={32} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Facility Maintenance Report</DialogTitle>
              <DialogDescription className="text-xs font-bold text-muted-foreground uppercase mt-1">Submit Request to Education Facilities Registry</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Source School / Office</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter location name" {...field} className="h-14 bg-secondary/30 rounded-xl font-bold" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="urgency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Urgency Protocol</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 bg-secondary/30 rounded-xl font-bold">
                            <SelectValue placeholder="Select urgency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="High" className="font-bold text-destructive">HIGH (Immediate Action)</SelectItem>
                          <SelectItem value="Medium" className="font-bold">MEDIUM (Standard)</SelectItem>
                          <SelectItem value="Low" className="font-bold">LOW (Routine)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Reporter Contact (11 Digits)</FormLabel>
                    <FormControl>
                      <Input placeholder="09XXXXXXXXX" {...field} className="h-14 bg-secondary/30 rounded-xl font-bold" maxLength={11} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Technical Issue Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Provide specific details of the facility issue..." {...field} className="min-h-[120px] bg-secondary/30 rounded-xl resize-none font-medium p-4" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting} className="w-full h-16 bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.01] transition-all">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18} className="mr-2" /> Dispatch Maintenance Report</>}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
