"use client";

import React, { useState, useEffect, Suspense, lazy, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { AuthPortal } from '@/components/auth/auth-portal';

import { 
  Loader2, 
  Megaphone, 
  Calendar as CalendarIcon,
  Save,
  Construction,
  ShieldAlert,
  Plus,
  Target,
  Clock,
  ShieldCheck,
  HelpCircle,
  Smile,
  Users,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  useFirestore, 
  useUser, 
  useAuth,
  useCollection, 
  useMemoFirebase, 
  useDoc,
  addDocumentNonBlocking
} from '@/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, orderBy, doc, where } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { KPICard } from '@/components/dashboard/kpi-card';
import { TicketList } from '@/components/dashboard/ticket-list';
import { PersonnelDirectory } from '@/components/dashboard/personnel-directory';
import { format, parseISO, isValid } from 'date-fns';
import { UNITS } from '@/lib/constants';
import { UnitPerformanceCard } from '@/components/dashboard/unit-performance-card';

// Dynamic Imports for Unit Dashboards
const AdminPanel = lazy(() => import('@/components/admin/admin-panel').then(m => ({ default: m.AdminPanel })));
const SocMobDashboard = lazy(() => import('@/components/socmob/socmob-dashboard').then(m => ({ default: m.SocMobDashboard })));
const FacilitiesDashboard = lazy(() => import('@/components/facilities/facilities-dashboard').then(m => ({ default: m.FacilitiesDashboard })));
const ResearchRepository = lazy(() => import('@/components/planning/research-repository').then(m => ({ default: m.ResearchRepository })));
const KabataangLegalPortal = lazy(() => import('@/components/learner-rights/kabataang-legal-portal').then(m => ({ default: m.KabataangLegalPortal })));
const HealthDashboard = lazy(() => import('@/components/health/health-dashboard').then(m => ({ default: m.HealthDashboard })));
const DRRMDashboard = lazy(() => import('@/components/drrm/drrm-dashboard').then(m => ({ default: m.DRRMDashboard })));
const YouthDashboard = lazy(() => import('@/components/youth/youth-dashboard').then(m => ({ default: m.YouthDashboard })));
const SportsDashboard = lazy(() => import('@/components/sports/sports-dashboard').then(m => ({ default: m.SportsDashboard })));
const GADDashboard = lazy(() => import('@/components/gad/gad-dashboard').then(m => ({ default: m.GADDashboard })));
const HRDDDashboard = lazy(() => import('@/components/hrdd/hrdd-dashboard').then(m => ({ default: m.HRDDDashboard })));
const SMMEDashboard = lazy(() => import('@/components/smme/smme-dashboard').then(m => ({ default: m.SMMEDashboard })));

// Modals
const NewPartnershipModal = lazy(() => import('@/components/socmob/new-partnership-modal').then(m => ({ default: m.NewPartnershipModal })));
const NewInquiryModal = lazy(() => import('@/components/dashboard/new-inquiry-modal').then(m => ({ default: m.NewInquiryModal })));
const ProjectHubModal = lazy(() => import('@/components/facilities/project-hub-modal').then(m => ({ default: m.ProjectHubModal })));

function PrimaryDashboardView({ isGuestUser, onOpenInquiryModal }: { isGuestUser: boolean, onOpenInquiryModal: () => void }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [calendarFilter, setCalendarFilter] = useState<'all' | 'events' | 'appointments'>('all');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', description: '', type: 'Event', date: '', endDate: '' });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsHydrated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const schedulesQuery = useMemoFirebase(() => {
    if (!firestore || !user || !isHydrated) return null;
    return collection(firestore, 'division_events');
  }, [firestore, user, isHydrated]);
  const { data: allSchedules } = useCollection(schedulesQuery);

  const ticketsQuery = useMemoFirebase(() => {
    if (!firestore || !user || !isHydrated) return null;
    return collection(firestore, 'public_assistance_tickets');
  }, [firestore, user, isHydrated]);
  const { data: allTickets } = useCollection(ticketsQuery);

  const donationsQuery = useMemoFirebase(() => {
    if (!firestore || !user || !isHydrated) return null;
    return collection(firestore, 'donations');
  }, [firestore, user, isHydrated]);
  const { data: allDonations } = useCollection(donationsQuery);

  const infraQuery = useMemoFirebase(() => {
    if (!firestore || !user || !isHydrated) return null;
    return collection(firestore, 'school_infrastructure');
  }, [firestore, user, isHydrated]);
  const { data: allInfrastructure } = useCollection(infraQuery);

  const mergedCalendarEvents = useMemo(() => {
    const baseEvents = allSchedules?.map(ev => ({ ...ev, source: 'event' })) || [];
    const ticketEvents = (allTickets || [])
      .filter(t => t.serviceType !== 'Incident Reporting')
      .map(t => ({
        id: t.id,
        title: t.title,
        date: t.meetingDate || t.createdAt,
        time: t.meetingTime,
        type: 'Appointment',
        status: t.status || 'Pending',
        description: t.description,
        source: 'ticket'
      }));
    return [...baseEvents, ...ticketEvents];
  }, [allSchedules, allTickets]);

  const filteredCalendarEvents = useMemo(() => {
    if (calendarFilter === 'all') return mergedCalendarEvents;
    if (calendarFilter === 'events') return mergedCalendarEvents.filter(ev => ev.type !== 'Appointment');
    if (calendarFilter === 'appointments') return mergedCalendarEvents.filter(ev => ev.type === 'Appointment');
    return mergedCalendarEvents;
  }, [mergedCalendarEvents, calendarFilter]);

  const totalDonationsValue = useMemo(() => {
    if (!allDonations) return 0;
    return allDonations.reduce((sum, d) => sum + (Number(d.amountValue) || 0), 0);
  }, [allDonations]);

  const displayedEvents = useMemo(() => {
    if (!filteredCalendarEvents) return [];
    const refMonth = currentMonth.getMonth();
    const refYear = currentMonth.getFullYear();
    return filteredCalendarEvents.filter(ev => {
      if (ev.type === 'Task' && isGuestUser) return false;
      try {
        const eventStart = parseISO(ev.date);
        const eventEnd = ev.endDate ? parseISO(ev.endDate) : eventStart;
        if (!isValid(eventStart) || !isValid(eventEnd)) return false;
        const startInMonth = eventStart.getMonth() === refMonth && eventStart.getFullYear() === refYear;
        const endInMonth = eventEnd.getMonth() === refMonth && eventEnd.getFullYear() === refYear;
        return startInMonth || endInMonth;
      } catch (e) { return false; }
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredCalendarEvents, currentMonth, isGuestUser]);

  const formatCurrency = (value: number) => {
    if (!value || value === 0) return "₱ 0.0";
    if (value >= 1000000000) return `₱ ${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `₱ ${(value / 1000000).toFixed(1)}M`;
    return `₱ ${value.toLocaleString()}`;
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !eventForm.title || !eventForm.date) return;
    addDocumentNonBlocking(collection(firestore, 'division_events'), {
      ...eventForm,
      createdAt: new Date().toISOString(),
      recordedBy: user.uid
    });
    setEventForm({ title: '', description: '', type: 'Event', date: '', endDate: '' });
    setIsEventModalOpen(false);
    toast({ title: "Activity Scheduled" });
  };

  if (!isHydrated) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4 opacity-50">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest">Optimizing Viewport...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">SGOD <span className="text-accent">Chief</span> Office</h1>
          <p className="text-[15px] text-muted-foreground mt-2 font-medium">Monitoring and Administrative Operations for SGOD Davao del Sur.</p>
        </div>
        {isGuestUser && (
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Button 
              onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSdOdg9EZn5TsRGzNCFJIxRm277PSjyMddowNmPBI9361T9N2w/viewform', '_blank')}
              className="h-14 px-8 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[11px] font-black uppercase shadow-lg shadow-amber-500/20 flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] w-full sm:w-auto"
            >
              <Smile size={18} /> Submit CSM Form
            </Button>
            <Button 
              onClick={onOpenInquiryModal} 
              className="h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black uppercase shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] w-full sm:w-auto"
            >
              <HelpCircle size={18} /> Book an Appointment
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <KPICard label="Partnership Resources" value={formatCurrency(totalDonationsValue)} color="primary" />
        <TicketList small hideIncidentReports />
        <KPICard label="Infrastructure Registry" value={(allInfrastructure?.length || 0).toString()} subValue="Active Projects" color="emerald" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start">
        <div className="xl:col-span-2 flex flex-col gap-8">
          <TicketList hideIncidentReports />
          <PersonnelDirectory />
        </div>
        <div className="xl:col-span-3">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl flex flex-col h-fit">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-3">
                <CalendarIcon size={18} className="text-primary" />
                <h3 className="font-bold text-sm uppercase tracking-widest">Division Calendar</h3>
              </div>
              <div className="flex items-center gap-2 p-1 bg-secondary/30 rounded-xl border border-border w-fit">
                 <Button onClick={() => setCalendarFilter('all')} variant={calendarFilter === 'all' ? 'default' : 'ghost'} className={cn("h-8 px-4 text-[9px] font-black uppercase rounded-lg", calendarFilter === 'all' && "bg-primary text-white")}>All</Button>
                 <Button onClick={() => setCalendarFilter('events')} variant={calendarFilter === 'events' ? 'default' : 'ghost'} className={cn("h-8 px-4 text-[9px] font-black uppercase rounded-lg", calendarFilter === 'events' && "bg-primary text-white")}>Events</Button>
                 <Button onClick={() => setCalendarFilter('appointments')} variant={calendarFilter === 'appointments' ? 'default' : 'ghost'} className={cn("h-8 px-4 text-[9px] font-black uppercase rounded-lg", calendarFilter === 'appointments' && "bg-primary text-white")}>Appointments</Button>
                 {!isGuestUser && <Button variant="ghost" size="icon" onClick={() => setIsEventModalOpen(true)} className="h-8 w-8 rounded-lg text-primary ml-2 border-l border-border pl-2"><Plus size={16} /></Button>}
              </div>
            </div>
            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} month={currentMonth} onMonthChange={setCurrentMonth} events={filteredCalendarEvents} isStaff={!isGuestUser} className="w-full h-fit" />
            <div className="mt-10 border-t border-border pt-10 space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground"><Target size={18} /></div><div><h4 className="text-sm font-black uppercase tracking-widest">Monthly Overview</h4><p className="text-[10px] font-bold text-muted-foreground uppercase">{format(currentMonth, 'MMMM yyyy')}</p></div></div>
                 <Badge variant="outline" className="text-[10px] font-black uppercase">{displayedEvents.length} Activities</Badge>
              </div>
              <ScrollArea className="h-[400px] pr-2">
                <div className="space-y-3">
                  {displayedEvents.length > 0 ? displayedEvents.map((ev: any) => (
                    <div key={ev.id} className="p-5 rounded-2xl bg-secondary/20 border border-border hover:border-primary/30 transition-all group flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                         <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", ev.type === 'Task' ? "bg-destructive/10 text-destructive" : ev.type === 'Appointment' ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-500")}>
                           {ev.type === 'Task' ? <Clock size={18} /> : ev.type === 'Appointment' ? <Users size={18} /> : <CalendarIcon size={18} />}
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded shrink-0">{format(parseISO(ev.date), 'MMM dd')}{ev.endDate && ev.endDate !== ev.date && <span className="opacity-60 ml-1">- {format(parseISO(ev.endDate), 'MMM dd')}</span>}</p>
                              <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors truncate">{ev.title}</p>
                            </div>
                            <p className="text-[11px] text-muted-foreground font-medium mt-1 leading-relaxed max-w-lg line-clamp-1">{ev.time ? `Schedule: ${ev.time} — ` : ''}{ev.type === 'Appointment' ? `Reference: #${ev.id.substring(0, 8).toUpperCase()}` : (ev.description || 'Standard administrative activity.')}</p>
                         </div>
                      </div>
                      <Badge variant="outline" className={cn("text-[10px] font-black uppercase px-2 py-0.5", ev.type === 'Task' ? "text-destructive border-destructive/20" : ev.type === 'Appointment' ? (ev.status === 'Unavailable' ? "text-destructive border-destructive/20" : (ev.status === 'Noted' || ev.status === 'Resolved') ? "text-emerald-500 border-emerald-500/20" : "text-amber-500 border-amber-500/20") : "text-amber-500 border-amber-500/20")}>{ev.type === 'Appointment' ? (ev.status || 'Appointment') : ev.type}</Badge>
                    </div>
                  )) : (
                    <div className="py-20 text-center border-2 border-dashed border-border rounded-[2rem] opacity-50 flex flex-col items-center">
                       <Target size={32} className="text-muted-foreground/30 mb-4" />
                       <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">No Activities Recorded</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl p-0 overflow-hidden rounded-3xl">
          <DialogHeader className="p-8 border-b border-border bg-secondary/10"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><CalendarIcon size={24} /></div><DialogTitle className="text-2xl font-black uppercase tracking-tight">Schedule Activity</DialogTitle></div></DialogHeader>
          <form onSubmit={handleCreateEvent} className="p-8 space-y-6">
            <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-muted-foreground">Title</Label><Input value={eventForm.title} onChange={(e) => setEventForm({...eventForm, title: e.target.value})} className="h-12 bg-secondary/30 rounded-xl" required /></div>
            <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-muted-foreground">Description</Label><Textarea value={eventForm.description} onChange={(e) => setEventForm({...eventForm, description: e.target.value})} className="min-h-[100px] bg-secondary/30 rounded-xl resize-none" /></div>
            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label className="text-[10px] font-black uppercase text-muted-foreground">Start Date</Label><Input type="date" value={eventForm.date} onChange={(e) => setEventForm({...eventForm, date: e.target.value})} className="h-12 bg-secondary/30 rounded-xl" required /></div><div className="space-y-2"><Label className="text-[10px] font-black uppercase text-muted-foreground">End Date (Optional)</Label><Input type="date" value={eventForm.endDate} onChange={(e) => setEventForm({...eventForm, endDate: e.target.value})} className="h-12 bg-secondary/30 rounded-xl" /></div></div>
            <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-muted-foreground">Type</Label><Select value={eventForm.type} onValueChange={(v) => setEventForm({...eventForm, type: v})}><SelectTrigger className="h-12 bg-secondary/30 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Event">Event</SelectItem><SelectItem value="Task">Task</SelectItem></SelectContent></Select></div>
            <Button type="submit" className="w-full h-14 bg-primary text-white font-black uppercase rounded-xl shadow-xl mt-4"><Save size={18} className="mr-2" /> Save Activity</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DashboardContent() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [showLoginManual, setShowLoginManual] = useState(false);
  
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  
  const [partnershipModalOpen, setPartnershipModalOpen] = useState(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isProjectHubOpen, setIsProjectHubOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const unitParam = searchParams.get('unit');
    if (unitParam) setActiveSection(unitParam);
  }, [searchParams]);

  const profileRef = useMemoFirebase(() => {
    if (!user || !firestore || user.isAnonymous) return null;
    return doc(firestore, 'user_profiles', user.uid);
  }, [user, firestore]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  const maintenanceRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'global_config', 'maintenance');
  }, [firestore]);
  const { data: maintenanceConfig } = useDoc(maintenanceRef);

  const broadcastQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'broadcasts'), where('audience', '==', 'Staff Only'), orderBy('createdAt', 'desc'));
  }, [firestore]);
  const { data: latestBroadcasts } = useCollection(broadcastQuery);

  const donationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'donations'), orderBy('receivedAt', 'desc'));
  }, [firestore, user]);
  const { data: allDonations } = useCollection(donationsQuery);

  const totalDonationsValue = useMemo(() => {
    if (!allDonations) return 0;
    return allDonations.reduce((sum, d) => sum + (Number(d.amountValue) || 0), 0);
  }, [allDonations]);

  const uniquePartnersCount = useMemo(() => {
    if (!allDonations) return 0;
    const uniqueNames = new Set(allDonations.map(d => d.donorName?.toLowerCase().trim()));
    return uniqueNames.size;
  }, [allDonations]);

  const isAdmin = user?.email === 'admin@admin.com' || profile?.unitId === 'SGOD' || profile?.isAdmin || profile?.role === 'Admin' || profile?.role === 'SGOD Chief';
  const isAuthorizedStaff = user?.email === 'admin@admin.com' || profile?.isActive === true || isAdmin || profile?.unitId === 'Youth Formation' || profile?.unitId === 'Learner Rights';
  const isGuestUser = user?.isAnonymous || !isAuthorizedStaff;

  const activeBroadcast = useMemo(() => latestBroadcasts?.[0] || null, [latestBroadcasts]);
  const isUnitInMaintenance = maintenanceConfig?.[activeSection] === true && !isAdmin;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Failure:", error);
    }
  };

  if (!mounted || isUserLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-6">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Initializing Command Bridge...</p>
      </div>
    );
  }

  if (showLoginManual || (!user && mounted)) {
    return <AuthPortal onAuthenticated={() => setShowLoginManual(false)} />;
  }

  if (isAdminView && isAdmin) {
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={48} /></div>}>
        <AdminPanel onToggleView={() => setIsAdminView(false)} />
      </Suspense>
    );
  }

  if (mounted && user && !user.isAnonymous && !isAuthorizedStaff && !isUserLoading && !isProfileLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-10">
         <div className="w-24 h-24 rounded-[2.5rem] bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-2xl"><ShieldCheck size={48} className="animate-pulse" /></div>
         <div className="space-y-4 max-w-lg">
            <h1 className="text-4xl font-black uppercase tracking-tight text-foreground">Account Verification Pending</h1>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed">Welcome, <span className="text-primary font-black">{profile?.firstName || 'Personnel'}</span>. Your profile has been registered, but your access level has not yet been verified.</p>
            <div className="pt-6"><Badge variant="outline" className="px-6 py-3 rounded-full border-amber-500/30 bg-amber-500/5 text-amber-600 font-black uppercase text-[10px] tracking-widest">Status: Under Review</Badge></div>
         </div>
         <div className="flex flex-col sm:flex-row items-center gap-4 pt-10">
            <Button asChild variant="outline" className="h-14 px-10 rounded-xl font-black uppercase tracking-widest text-[10px] border-border w-full sm:w-auto"><a href="/">Exit to Portal</a></Button>
            <Button onClick={() => window.location.reload()} className="h-14 px-10 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 w-full sm:w-auto">Refresh Status</Button>
            <Button variant="ghost" onClick={handleSignOut} className="h-14 px-10 rounded-xl font-black uppercase tracking-widest text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-2 w-full sm:w-auto">
              <LogOut size={16} /> Sign Out
            </Button>
         </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden" suppressHydrationWarning>
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        isExpanded={isSidebarExpanded} 
        setIsExpanded={setIsSidebarExpanded} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
        onShowLogin={() => setShowLoginManual(true)} 
      />
      <div className={cn("flex-1 flex flex-col transition-all duration-300 w-full min-w-0", isSidebarExpanded ? "md:ml-64" : "md:ml-20", "ml-0")}>
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} isAdminView={isAdminView} onToggleView={() => setIsAdminView(!isAdminView)} onShowLogin={() => setShowLoginManual(true)} />
        <main className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-10 max-w-[1600px] mx-auto w-full">
          {activeBroadcast && !isGuestUser && (activeSection === 'dashboard') && (
            <div className="bg-primary/10 border border-primary/20 rounded-[2.5rem] p-10 flex items-start gap-8 animate-in fade-in slide-in-from-top-4 duration-1000 relative overflow-hidden mb-8">
              <div className="w-16 h-16 rounded-[1.25rem] bg-primary flex items-center justify-center text-white shrink-0 shadow-2xl relative z-10"><Megaphone size={32} /></div>
              <div className="flex-1 relative z-10"><div className="flex items-center gap-3 mb-3"><h4 className="text-2xl font-black uppercase tracking-tight text-primary">{activeBroadcast.title}</h4><Badge variant="outline" className="text-[10px] font-black uppercase bg-primary/5 text-primary border-primary/20">{activeBroadcast.audience}</Badge></div><p className="text-lg md:text-xl font-medium text-foreground/80 leading-relaxed max-w-5xl">{activeBroadcast.message}</p></div>
            </div>
          )}

          {isUnitInMaintenance ? (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-8 text-center animate-in zoom-in-95 duration-700 bg-secondary/5 border-2 border-dashed border-border rounded-[3rem] p-12">
               <div className="w-24 h-24 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/5"><Construction size={48} className="animate-bounce" /></div>
               <div className="space-y-4"><h2 className="text-4xl font-black uppercase tracking-tighter text-foreground">Unit Maintenance</h2><p className="text-muted-foreground max-w-lg mx-auto font-medium text-lg leading-relaxed">The <span className="text-primary font-bold">"{activeSection}"</span> module is currently undergoing updates. Access will be restored shortly.</p><div className="pt-4"><Badge variant="outline" className="px-4 py-2 rounded-full border-amber-500/20 bg-amber-500/5 text-amber-600 flex items-center gap-2 mx-auto w-fit"><ShieldAlert size={14} /> System Maintenance Active</Badge></div></div>
            </div>
          ) : (
            <Suspense fallback={<div className="h-[60vh] flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-primary" size={48} /><p className="text-[10px] font-black uppercase tracking-widest opacity-40">Streaming Sector Data</p></div>}>
              <>
                {activeSection === 'dashboard' && <PrimaryDashboardView isGuestUser={isGuestUser} onOpenInquiryModal={() => setIsInquiryModalOpen(true)} />}
                {activeSection === 'performance' && isAuthorizedStaff && !isAdmin && (
                  <div className="space-y-12 animate-in fade-in duration-1000 max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div>
                        <h1 className="text-4xl font-black uppercase tracking-tight text-foreground">Personnel Performance</h1>
                        <p className="text-[11px] font-black text-muted-foreground uppercase mt-2 tracking-[0.3em]">Unit Resolution & Efficiency Metrics</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                      <div className="lg:col-span-7">
                        <UnitPerformanceCard unitId={profile?.unitId || 'SocMob & DPDS'} unitLabel={UNITS.find(u => u.id === (profile?.unitId || 'SocMob & DPDS'))?.label || 'Assigned Unit'} className="h-auto" />
                      </div>
                      <div className="lg:col-span-5">
                        <TicketList unitId={profile?.unitId} />
                      </div>
                    </div>
                  </div>
                )}
                {activeSection === 'SocMob & DPDS' && <SocMobDashboard totalDonationsValue={totalDonationsValue} totalDonationsCount={allDonations?.length || 0} uniquePartnersCount={uniquePartnersCount} isGuestUser={isGuestUser} onOpenPartnershipModal={() => setPartnershipModalOpen(true)} />}
                {activeSection === 'Education Facilities' && <FacilitiesDashboard isGuestUser={isGuestUser} onOpenProjectHub={() => setIsProjectHubOpen(true)} />}
                {activeSection === 'Planning & Research' && <ResearchRepository />}
                {activeSection === 'Health' && <HealthDashboard />}
                {activeSection === 'DRRM' && <DRRMDashboard />}
                {activeSection === 'Youth Formation' && <YouthDashboard />}
                {activeSection === 'Sports' && <SportsDashboard />}
                {activeSection === 'GAD' && <GADDashboard />}
                {activeSection === 'HRDD' && <HRDDDashboard />}
                {activeSection === 'SMME' && <SMMEDashboard />}
                {activeSection === 'Learner Rights' && <KabataangLegalPortal />}
              </>
            </Suspense>
          )}
        </main>
      </div>
      <Suspense fallback={null}>
        <NewPartnershipModal isOpen={partnershipModalOpen} onClose={() => setPartnershipModalOpen(false)} />
        <NewInquiryModal isOpen={isInquiryModalOpen} onClose={() => setIsInquiryModalOpen(false)} />
        <ProjectHubModal isOpen={isProjectHubOpen} onClose={() => setIsProjectHubOpen(false)} />
      </Suspense>
    </div>
  );
}

export default function SGODWorkspace() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex flex-col items-center justify-center"><Loader2 className="animate-spin text-primary" size={48} /><p className="mt-4 text-[10px] font-black uppercase tracking-widest">Waking Quantum Engine...</p></div>}>
      <DashboardContent />
    </Suspense>
  );
}