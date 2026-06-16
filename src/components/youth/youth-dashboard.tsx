
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Sparkles, 
  ExternalLink,
  Globe,
  Facebook,
  Database,
  Megaphone,
  Plus,
  Loader2,
  Clock,
  Calendar,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  useCollection, 
  useFirestore, 
  useMemoFirebase, 
  useUser, 
  addDocumentNonBlocking,
  deleteDocumentNonBlocking 
} from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TicketList } from '@/components/dashboard/ticket-list';

/**
 * Operational Clock Component
 * Real-time time and date display with hydration protection.
 */
function OperationalClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return (
    <div className="h-24 bg-card border border-border rounded-2xl animate-pulse flex items-center justify-center">
      <Loader2 className="animate-spin text-primary/20" size={20} />
    </div>
  );

  return (
    <Card className="p-6 rounded-2xl bg-slate-900 border-primary/20 shadow-xl flex items-center justify-between group overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Clock size={80} className="text-white" />
      </div>
      <div className="relative z-10">
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Operational Time</p>
        <h3 className="text-3xl font-black text-white tracking-tighter tabular-nums">
          {format(time, 'HH:mm:ss')}
        </h3>
      </div>
      <div className="text-right relative z-10">
        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Current Date</p>
        <p className="text-xs font-bold text-white uppercase tracking-tight">
          {format(time, 'MMMM dd, yyyy')}
        </p>
      </div>
    </Card>
  );
}

export function YouthDashboard() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', message: '' });

  const FB_PAGE_URL = "https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fyouthformationdavaodelsur&tabs=timeline&width=500&height=800&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId";
  const DRIVE_URL = "https://drive.google.com/drive/folders/1HE1SKNZ8bu99uJZaUZIami0UVSeBqWmV";

  const announcementsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'youth_announcements'), orderBy('createdAt', 'desc'), limit(10));
  }, [firestore, user]);

  const { data: announcements, isLoading } = useCollection(announcementsQuery);

  const handleLaunchDrive = () => {
    window.open(DRIVE_URL, '_blank', 'noopener,noreferrer');
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !form.message) return;
    setIsSubmitting(true);

    try {
      await addDocumentNonBlocking(collection(firestore, 'youth_announcements'), {
        message: form.message,
        authorName: user.displayName || user.email?.split('@')[0] || 'Personnel',
        createdAt: new Date().toISOString(),
      });
      toast({ title: "Bulletin Posted" });
      setForm({ title: '', message: '' });
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (!firestore || !id) return;
    deleteDocumentNonBlocking(doc(firestore, 'youth_announcements', id));
    toast({
      title: "Announcement Removed",
      description: "Bulletin entry has been permanently deleted."
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 w-full">
      
      {/* Hero Section */}
      <div className="relative w-full rounded-[3rem] overflow-hidden bg-slate-200 aspect-[16/9] sm:aspect-[21/6] shadow-2xl group border-4 border-white dark:border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-400/20 to-slate-900/90 z-10"></div>
        <Image 
          src="https://lh3.googleusercontent.com/d/1HE1SKNZ8bu99uJZaUZIami0UVSeBqWmV" 
          alt="Youth Formation" 
          fill
          sizes="100vw"
          className="object-cover group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 sm:p-14 flex items-end justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-24 sm:h-24 rounded-[1.5rem] sm:rounded-[2.5rem] bg-amber-500 flex items-center justify-center text-slate-900 shadow-2xl border-4 border-white/20">
                <Sparkles size={28} className="sm:size-12" />
              </div>
              <div className="space-y-0.5">
                <h1 className="text-3xl sm:text-6xl font-black text-white tracking-tighter uppercase drop-shadow-lg">Youth Formation</h1>
                <p className="text-white/80 font-bold uppercase tracking-[0.4em] text-[8px] sm:text-sm">Division of Davao del Sur</p>
              </div>
            </div>
          </div>
          <Badge className="bg-amber-500 text-slate-900 font-black uppercase text-[10px] tracking-widest px-6 py-2.5 rounded-full hidden lg:block border-none shadow-xl">
            Operational Hub Active
          </Badge>
        </div>
      </div>

      {/* TACTICAL 3-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMN 1 (Left): Bulletins + Google Drive Link */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-[2.5rem] bg-card border-border shadow-2xl flex flex-col h-[500px] overflow-hidden">
            <div className="px-8 py-6 border-b border-border bg-secondary/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <Megaphone size={20} className="text-primary" />
                <h3 className="text-lg font-black uppercase tracking-tight">Staff bulletins</h3>
              </div>
              {!user?.isAnonymous && (
                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(true)} className="h-9 w-9 rounded-xl bg-primary/10 text-primary">
                  <Plus size={18} />
                </Button>
              )}
            </div>
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
                ) : announcements && announcements.length > 0 ? (
                  announcements.map((a) => (
                    <div key={a.id} className="p-5 rounded-2xl bg-secondary/10 border border-border/50 group hover:border-primary/20 transition-all relative overflow-hidden">
                      {/* Delete Action */}
                      {!user?.isAnonymous && (
                        <button 
                          onClick={() => handleDeleteAnnouncement(a.id)}
                          className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <p className="text-sm font-medium text-foreground/80 leading-relaxed mb-4 pr-6">{a.message}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">{a.authorName}</span>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase">
                          <Clock size={10} />
                          <span>{format(new Date(a.createdAt), 'MMM dd')}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center opacity-30 flex flex-col items-center">
                    <Megaphone size={48} className="mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Registry Clear</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* GOOGLE DRIVE DIRECT LINK */}
          <Card className="p-8 rounded-[2.5rem] bg-emerald-500/5 border-emerald-500/20 shadow-xl flex flex-col justify-between group hover:bg-emerald-500/10 transition-all cursor-pointer" onClick={handleLaunchDrive}>
             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-inner">
                   <Database size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-black uppercase tracking-tight text-foreground">Technical archives</h4>
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Google Drive Portal</p>
                </div>
             </div>
             <p className="text-sm font-medium text-muted-foreground leading-relaxed mb-8">
               Access shared folders, documentation, and technical archives for the Youth Formation unit.
             </p>
             <Button 
               className="h-14 w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 group/btn"
             >
               Launch Archive Portal <ExternalLink size={14} className="group-hover/btn:translate-x-1 transition-transform" />
             </Button>
          </Card>
        </div>

        {/* COLUMN 2 (Middle): Clock + Appointments */}
        <div className="lg:col-span-4 space-y-6">
          <OperationalClock />
          <TicketList unitId="Youth Formation" hideIncidentReports />
        </div>

        {/* COLUMN 3 (Right): Native Size FB Feed */}
        <div className="lg:col-span-4 flex justify-center lg:justify-end">
          <Card className="rounded-[2.5rem] bg-card border-border shadow-2xl overflow-hidden flex flex-col h-[850px] w-full max-w-[500px]">
            <div className="px-8 py-6 border-b border-border bg-slate-900 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2]">
                   <Facebook size={22} />
                 </div>
                 <div>
                   <h3 className="text-lg font-black text-white uppercase tracking-tight">Social Stream</h3>
                   <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Integrated Timeline</p>
                 </div>
               </div>
               <Button 
                 variant="ghost" 
                 size="icon" 
                 onClick={() => window.open("https://www.facebook.com/youthformationdavaodelsur", '_blank')}
                 className="h-10 w-10 bg-white/5 text-white hover:bg-white/20 rounded-xl"
               >
                 <ExternalLink size={16} />
               </Button>
            </div>
            
            <div className="flex-1 w-full bg-white overflow-hidden relative">
              <iframe 
                src={FB_PAGE_URL}
                className="w-full h-full border-none"
                scrolling="no"
                allowFullScreen={true}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                title="Youth Formation Social Feed"
              />
            </div>

            <div className="px-8 py-5 border-t border-border bg-secondary/5 shrink-0 flex items-center justify-between">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Globe size={12} className="text-primary" /> Global Interface
              </p>
            </div>
          </Card>
        </div>

      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-card border-border rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-8 border-b border-border bg-secondary/10">
            <DialogTitle className="text-xl font-black uppercase tracking-tight">New Internal Bulletin</DialogTitle>
            <DialogDescription className="text-xs font-bold text-muted-foreground uppercase mt-1">Post a secure update to the Youth Hub</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAnnouncement} className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase ml-1">Message Content</Label>
              <Textarea 
                value={form.message} 
                onChange={(e) => setForm({...form, message: e.target.value})} 
                className="min-h-[150px] bg-secondary/30 rounded-xl resize-none" 
                placeholder="Enter bulletin text..."
                required 
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-primary text-white font-black uppercase rounded-xl shadow-xl">
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Post to Bulletin"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
