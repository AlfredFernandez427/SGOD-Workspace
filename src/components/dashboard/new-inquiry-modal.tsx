"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, Clock, Loader2, Send, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useUser, addDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { UNITS } from '@/lib/constants';

const SERVICE_OPTIONS: Record<string, string[]> = {
  'SGOD': [
    'Division Chief Office', 
    'Education Program Supervisor', 
    'Receiving & Releasing Staff'
  ],
  'Education Facilities': [
    'Others'
  ],
  'HRDD': [
    'Others'
  ],
  'SocMob & DPDS': [
    'Others'
  ],
  'DRRM': [
    'Others'
  ],
  'Health': [
    'Others'
  ],
  'SMME': [
    'Issuance of Govt Permit/Renewal/Recognition',
    'Issuance of Special Orders (Graduation)',
    'Application for Summer Permit',
    'Application for No Increase of Tuition Fee',
    'Application for Increase of Tuition Fee',
    'Application for SHS additional Track/Strand',
    'Others'
  ],
  'Planning & Research': [
    'Basic Education Data (External)',
    'Basic Education Data (Internal)',
    'Request for data EBIS/LIS/NAT & Indicators',
    'Others'
  ],
  'Youth Formation': ['Others'],
  'Learner Rights': ['Others'],
  'Sports': ['Others'],
  'GAD': ['Others'],
};

const formSchema = z.object({
  targetUnitId: z.string().min(1, "Please select a target unit"),
  serviceType: z.string().min(1, "Please select a service type"),
  preferredStaffId: z.string().min(1, "Selection required"),
  inquirerPhone: z.string().length(11, "Phone number must be exactly 11 digits"),
  inquirerEmail: z.string().email("Invalid email address"),
  title: z.string().min(5, "Summary must be at least 5 characters"),
  description: z.string().min(10, "Details must be at least 10 characters"),
  meetingDate: z.string().min(1, "Please select a date"),
  meetingTime: z.string().min(1, "Please select a time"),
});

interface NewInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewInquiryModal({ isOpen, onClose }: NewInquiryModalProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetUnitId: "",
      serviceType: "",
      preferredStaffId: "all",
      inquirerPhone: "",
      inquirerEmail: "",
      title: "",
      description: "",
      meetingDate: "",
      meetingTime: "",
    },
  });

  const targetUnitId = form.watch("targetUnitId");
  const serviceOptions = targetUnitId ? (SERVICE_OPTIONS[targetUnitId] || ['Others']) : [];

  useEffect(() => {
    if (isOpen && targetUnitId) {
      form.setValue("serviceType", "");
      form.setValue("preferredStaffId", "all");
    }
  }, [targetUnitId, form, isOpen]);

  const staffQuery = useMemoFirebase(() => {
    if (!firestore || !targetUnitId) return null;
    return query(
      collection(firestore, 'user_profiles'), 
      where('unitId', '==', targetUnitId),
      where('isActive', '==', true)
    );
  }, [firestore, targetUnitId]);
  const { data: unitStaff } = useCollection(staffQuery);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore || !user) return;
    setIsSubmitting(true);

    try {
      const docRef = await addDocumentNonBlocking(collection(firestore, 'public_assistance_tickets'), {
        ...values,
        status: "Pending",
        submittedBy: user.uid,
        createdAt: new Date().toISOString()
      });

      toast({ 
        title: "Appointment Registered",
        description: `Reference ID: #${docRef?.id?.substring(0, 8).toUpperCase()}. The mission has been synchronized with the Division Calendar.`
      });
      
      form.reset();
      onClose();
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Protocol Error", description: "Failed to dispatch appointment request." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border shadow-2xl p-0 overflow-hidden rounded-2xl md:rounded-3xl max-h-[95vh] flex flex-col">
        <DialogHeader className="p-6 md:p-10 border-b border-border bg-secondary/10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Calendar className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <DialogTitle className="text-xl md:text-2xl font-black uppercase tracking-tight">Appointment Booking Hub</DialogTitle>
              <DialogDescription className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase mt-1">Schedule a Technical Appointment with a Specialist</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="targetUnitId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest">Target Division Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 md:h-14 bg-secondary/30 rounded-xl"><SelectValue placeholder="Select target unit" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {UNITS.map(unit => (
                            <SelectItem key={unit.id} value={unit.id} className="text-xs font-bold uppercase">{unit.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest">Service Protocol</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!targetUnitId}>
                        <FormControl>
                          <SelectTrigger className="h-12 md:h-14 bg-secondary/30 rounded-xl"><SelectValue placeholder="Select service category" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {serviceOptions.map(opt => (
                            <SelectItem key={opt} value={opt} className="text-xs font-bold uppercase whitespace-normal text-left h-auto py-2">{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="preferredStaffId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest">Book With Specialist</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!targetUnitId}>
                        <FormControl>
                          <SelectTrigger className="h-12 md:h-14 bg-secondary/30 rounded-xl"><SelectValue placeholder="Select specialist" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all" className="text-xs font-bold uppercase">Any Available Specialist</SelectItem>
                          {unitStaff?.map(staff => (
                            <SelectItem key={staff.id} value={staff.id} className="text-xs font-bold uppercase">{staff.firstName} {staff.lastName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-6">
                   <FormField
                    control={form.control}
                    name="inquirerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest">Contact Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="09XXXXXXXXX" {...field} className="h-12 md:h-14 bg-secondary/30 rounded-xl font-bold" maxLength={11} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="inquirerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <Mail size={12} className="text-primary" /> Notification Email
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="stakeholder@email.com" {...field} className="h-12 md:h-14 bg-secondary/30 rounded-xl font-bold" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6 rounded-2xl bg-primary/5 border border-primary/10">
                <FormField
                  control={form.control}
                  name="meetingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase flex items-center gap-2 tracking-widest">
                        <Calendar size={12} className="text-primary" /> Target Date
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="h-10 md:h-12 bg-white/50 rounded-xl border-none font-bold text-xs" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="meetingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase flex items-center gap-2 tracking-widest">
                        <Clock size={12} className="text-primary" /> Target Time
                      </FormLabel>
                      <FormControl>
                        <Input type="time" {...field} className="h-10 md:h-12 bg-white/50 rounded-xl border-none font-bold text-xs" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest">Appointment Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter brief subject" {...field} className="h-12 md:h-14 bg-secondary/30 rounded-xl font-bold" />
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
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest">Technical Context</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Provide details for the specialist..." {...field} className="min-h-[100px] md:min-h-[120px] bg-secondary/30 rounded-xl font-medium leading-relaxed" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting} className="w-full h-14 md:h-16 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.01] transition-all">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18} className="mr-2" /> Confirm Appointment Request</>}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}