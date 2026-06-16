
"use client";

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileWarning, Send, Paperclip, Loader2, X, FileText, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useUser, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { sendPortalEmail } from '@/app/actions/email';

const formSchema = z.object({
  schoolName: z.string().min(2, "School name is required"),
  district: z.string().min(2, "District is required"),
  schoolId: z.string().min(2, "School ID is required"),
  fullName: z.string().min(2, "Full name is required"),
  lrn: z.string().length(12, "LRN must be exactly 12 digits").regex(/^\d+$/, "LRN must contain only numbers"),
  inquirerEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  concern: z.string().min(10, "Please provide details of your concern"),
  witnessName: z.string().optional(),
  contactNumber: z.string().length(11, "Must be exactly 11 digits"),
});

interface ReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportFormModal({ isOpen, onClose }: ReportFormModalProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schoolName: "",
      district: "",
      schoolId: "",
      fullName: "",
      lrn: "",
      inquirerEmail: "",
      concern: "",
      witnessName: "",
      contactNumber: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user) return;
    setIsSubmitting(true);

    try {
      /**
       * CLOUDINARY MISSION PROTOCOL
       * IMPORTANT: Replace these strings with your actual Cloudinary credentials.
       */
      const CLOUDINARY_CLOUD_NAME = "dx3fpsgou"; 
      const CLOUDINARY_UPLOAD_PRESET = "Evidences";

      // 1. Parallel Uploads to Cloudinary
      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Cloudinary upload failed');
        }
        
        const data = await response.json();
        return data.secure_url;
      });

      const evidenceUrls = await Promise.all(uploadPromises);

      // 2. Log to Master Registry (Firestore)
      const reportId = doc(collection(firestore, 'learner_rights_reports')).id;
      setDocumentNonBlocking(doc(firestore, 'learner_rights_reports', reportId), {
        ...values,
        id: reportId,
        evidenceUrls,
        status: "Pending",
        submittedBy: user.uid,
        createdAt: new Date().toISOString(),
      }, { merge: true });

      // 3. Create a Schedule Entry in the Unified Mission Registry
      addDocumentNonBlocking(collection(firestore, 'public_assistance_tickets'), {
        title: `Incident Report: ${values.fullName}`,
        description: `Source: ${values.schoolName}. LRN: ${values.lrn}. Concern excerpt: ${values.concern.substring(0, 100)}...`,
        targetUnitId: 'Learner Rights',
        serviceType: 'Incident Reporting',
        status: 'Pending',
        inquirerPhone: values.contactNumber,
        inquirerEmail: values.inquirerEmail || 'N/A',
        createdAt: new Date().toISOString(),
        submittedBy: user.uid,
        relatedReportId: reportId
      });

      // 4. Dispatch Priority Intelligence Alert (Email)
      const evidenceListHtml = evidenceUrls.length > 0 
        ? `<div style="margin-top: 20px; padding: 15px; background: #f1f5f9; border-radius: 8px;">
            <h4 style="margin-top: 0; color: #475569;">Technical Evidence (Cloudinary):</h4>
            <ul style="padding-left: 20px;">
              ${evidenceUrls.map((url, i) => `<li><a href="${url}" style="color: #2563eb; text-decoration: none;">Download Evidence ${i + 1}</a></li>`).join('')}
            </ul>
           </div>`
        : '<p style="color: #64748b; font-style: italic;">No technical evidence attached.</p>';

      sendPortalEmail({
        to: 'norgaly.onutan@deped.gov.ph',
        subject: `[ALERT] New Learner Rights Report: ${values.fullName}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #e11d48; border-bottom: 2px solid #e11d48; padding-bottom: 10px;">Kabataang LEGAL: Priority Incident Report</h2>
            <p><strong>Status:</strong> <span style="background: #fff1f2; color: #e11d48; padding: 2px 8px; border-radius: 4px;">UNRESOLVED - NEW</span></p>
            <p><strong>Registry Ref:</strong> ${reportId}</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr style="background: #f8fafc;">
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; width: 30%;">Full Name</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${values.fullName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">LRN</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${values.lrn}</td>
              </tr>
              <tr style="background: #f8fafc;">
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">School / ID</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${values.schoolName} (ID: ${values.schoolId})</td>
              </tr>
            </table>

            <div style="margin-top: 30px; padding: 20px; background: #fff1f2; border-radius: 12px; border-left: 5px solid #e11d48;">
              <h3 style="margin-top: 0; color: #e11d48;">Technical Context:</h3>
              <p style="white-space: pre-wrap; font-size: 16px; line-height: 1.6;">${values.concern}</p>
            </div>

            ${evidenceListHtml}
          </div>
        `
      });

      toast({
        title: "Report Synchronized",
        description: "Your report has been logged and legal specialists have been alerted.",
      });
      
      form.reset();
      setSelectedFiles([]);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Transmission Error",
        description: err.message || "Failed to process report. Check your network connection."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-card border-border shadow-2xl p-0 overflow-hidden rounded-[2rem] max-h-[90vh] flex flex-col">
        <DialogHeader className="p-10 border-b border-border bg-[#e11d48]/5 flex flex-row items-center gap-6 shrink-0">
          <div className="w-16 h-16 rounded-[1.25rem] bg-[#e11d48]/10 flex items-center justify-center text-[#e11d48]">
            <FileWarning size={32} />
          </div>
          <div>
            <DialogTitle className="text-4xl font-black uppercase tracking-tight text-foreground">Report Form</DialogTitle>
            <DialogDescription className="text-xs font-bold text-[#e11d48] uppercase tracking-widest mt-1">Kabataang LEGAL Operational Registry</DialogDescription>
          </div>
        </DialogHeader>

        <div className="p-10 flex-1 overflow-y-auto no-scrollbar">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Name of School</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter School Name" {...field} className="h-14 bg-secondary/30 rounded-xl font-bold border-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">District</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter District" {...field} className="h-14 bg-secondary/30 rounded-xl font-bold border-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="schoolId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">School ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter ID" {...field} className="h-14 bg-secondary/30 rounded-xl font-bold border-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last, First, Middle" {...field} className="h-14 bg-secondary/30 rounded-xl font-bold border-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lrn"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">LRN</FormLabel>
                      <FormControl>
                        <Input placeholder="12-digit LRN" {...field} className="h-14 bg-secondary/30 rounded-xl font-bold border-none" maxLength={12} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inquirerEmail"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Mail size={12} className="text-[#e11d48]" /> Email (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="contact@email.com" {...field} className="h-14 bg-secondary/30 rounded-xl font-bold border-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="concern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Report / Concern</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter text..." {...field} className="min-h-[150px] bg-secondary/30 rounded-2xl p-6 font-medium border-none resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Evidence Box (Cloudinary Upload)</Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-10 border-2 border-dashed border-border rounded-2xl bg-secondary/10 flex flex-col items-center justify-center text-center group hover:border-primary/50 transition-all cursor-pointer relative"
                >
                  <input 
                    type="file" 
                    multiple 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                  />
                  <Paperclip size={32} className="text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                  <p className="text-sm font-bold text-foreground">Attach Technical Evidence</p>
                  <span className="text-[9px] font-black text-muted-foreground/60 uppercase mt-2 tracking-widest">
                    Images or PDF • Dispatched to Cloudinary Registry
                  </span>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-background border border-border rounded-xl group hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-emerald-500 transition-colors">
                            <FileText size={16} />
                          </div>
                          <span className="text-xs font-bold truncate max-w-[150px]">{file.name}</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeFile(index)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="witnessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Witness Name (If applicable)</FormLabel>
                      <FormControl>
                        <Input placeholder="Full Name of Witness" {...field} className="h-14 bg-secondary/30 rounded-xl font-bold border-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact Number</FormLabel>
                      <FormControl>
                        <Input placeholder="09XXXXXXXXX" {...field} className="h-14 bg-secondary/30 rounded-xl font-bold border-none" maxLength={11} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="h-16 flex-1 rounded-2xl font-black uppercase tracking-widest border-border">Discard</Button>
                <Button type="submit" disabled={isSubmitting} className="h-16 flex-1 bg-[#e11d48] hover:bg-[#be123c] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all">
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={18} />
                      <span>Transmitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send size={18} />
                      <span>Submit Report</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
