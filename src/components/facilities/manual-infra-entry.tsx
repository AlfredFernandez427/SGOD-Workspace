
"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Save, Edit3, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
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

export function ManualInfraEntry() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: "",
      schoolName: "",
      municipality: "",
      scopeOfWork: "",
      projectCost: "",
      contractorName: "",
      targetCompletionDate: "",
      latestAccomplishment: "0",
      status: "ON-GOING",
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user) return;
    setIsSubmitting(true);

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
        const formatted = num % 1 === 0 ? num.toFixed(0) : num.toString();
        acc = formatted + '%';
      } else {
        acc = "0%";
      }
    } else {
      acc = "0%";
    }

    addDocumentNonBlocking(collection(firestore, 'school_infrastructure'), {
      ...values,
      projectCost: cost,
      contractorName: contractor,
      targetCompletionDate: targetDate,
      latestAccomplishment: acc,
      status: values.status.toUpperCase(),
      createdAt: new Date().toISOString(),
      recordedByUserId: user.uid,
    });

    toast({
      title: "Registry Updated",
      description: `Project ${values.projectId} has been manually added to the database.`,
    });

    form.reset();
    setIsSubmitting(false);
  }

  return (
    <div className="bg-background border border-border rounded-2xl p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center text-primary">
          <Database size={24} />
        </div>
        <div>
          <h3 className="font-bold text-lg text-foreground tracking-tight">Manual Registry Protocol</h3>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Direct Master Database Entry</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Project ID</FormLabel>
                  <FormControl>
                    <Input placeholder="PRJ-000" {...field} className="bg-secondary/20 h-12 text-sm rounded-xl font-bold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="schoolName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">School Name</FormLabel>
                  <FormControl>
                    <Input placeholder="School Name" {...field} className="bg-secondary/20 h-12 text-sm rounded-xl font-bold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="municipality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Municipality</FormLabel>
                  <FormControl>
                    <Input placeholder="Town" {...field} className="bg-secondary/20 h-12 text-sm rounded-xl font-bold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projectCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Project Cost (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 5,000,000" {...field} className="bg-secondary/20 h-12 text-sm rounded-xl font-black text-primary" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contractorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Contractor (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Vendor Name" {...field} className="bg-secondary/20 h-12 text-sm rounded-xl font-bold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="scopeOfWork"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Scope of Work</FormLabel>
                <FormControl>
                  <Textarea placeholder="Detailed technical scope..." {...field} className="bg-secondary/20 min-h-[100px] text-sm rounded-xl resize-none font-medium leading-relaxed" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="targetCompletionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Target Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="bg-secondary/20 h-12 text-sm rounded-xl font-bold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="latestAccomplishment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Accomplishment (%)</FormLabel>
                  <FormControl>
                    <Input placeholder="75" {...field} className="bg-secondary/20 h-12 text-sm rounded-xl font-black text-emerald-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-secondary/20 h-12 text-sm rounded-xl font-bold">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ON-GOING" className="text-sm font-bold">ON-GOING</SelectItem>
                      <SelectItem value="COMPLETED" className="text-sm font-bold">COMPLETED</SelectItem>
                      <SelectItem value="SUSPENDED" className="text-sm font-bold">SUSPENDED</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full h-14 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all mt-4"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={18} className="mr-2" />}
            Commit Project to Master Registry
          </Button>
        </form>
      </Form>
    </div>
  );
}
