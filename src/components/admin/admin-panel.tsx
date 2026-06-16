
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard,
  Users, 
  Megaphone, 
  ShieldCheck, 
  Zap, 
  Search, 
  Trash2,
  Power,
  Edit,
  Clock,
  Crown,
  Plus,
  UserCheck,
  Settings,
  Construction,
  BarChart3,
  CheckCircle2,
  FileCheck,
  ChevronRight,
  User as UserIcon,
  Eye,
  HelpCircle,
  Phone,
  Save,
  X as CloseIcon,
  Calendar,
  AlertTriangle,
  Menu,
  Fingerprint,
  Contact
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  useAuth, 
  useUser, 
  useFirestore, 
  useCollection, 
  useMemoFirebase, 
  useDoc,
  updateDocumentNonBlocking, 
  deleteDocumentNonBlocking,
  addDocumentNonBlocking,
  setDocumentNonBlocking
} from '@/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, orderBy, doc, where } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/header';
import { format } from 'date-fns';
import { UNITS } from '@/lib/constants';

/**
 * HELPER COMPONENTS
 */

function AdminNavItem({ active, onClick, icon: Icon, label, badgeCount }: { active: boolean, onClick: () => void, icon: any, label: string, badgeCount?: number }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between h-12 px-4 rounded-xl transition-all duration-200 group relative",
        active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-foreground/[0.03] hover:text-foreground"
      )}
    >
      <div className="flex items-center gap-4">
        <Icon size={20} className={cn("shrink-0", active && "text-white")} />
        <span className={cn("text-[11px] font-black uppercase tracking-widest truncate", active ? "text-white" : "text-inherit")}>
          {label}
        </span>
      </div>
      {badgeCount !== undefined && badgeCount > 0 && (
        <Badge className={cn("h-5 px-1.5 rounded-md text-[10px] font-black", active ? "bg-white text-primary" : "bg-destructive text-white")}>
          {badgeCount}
        </Badge>
      )}
      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.4)]" />}
    </button>
  );
}

function KPIStatCard({ label, value, icon: Icon, color, subValue }: { label: string, value: string, icon: any, color: string, subValue?: string }) {
  const colors = {
    primary: 'bg-primary/10 text-primary',
    amber: 'bg-amber-500/10 text-amber-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    destructive: 'bg-destructive/10 text-destructive',
  };
  
  return (
    <Card className="p-6 rounded-3xl border-border bg-card shadow-lg hover:border-primary/20 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colors[color as keyof typeof colors] || colors.primary)}>
          <Icon size={20} />
        </div>
        {subValue && <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest">{subValue}</Badge>}
      </div>
      <div>
        <h4 className="text-3xl font-black text-foreground tracking-tighter">{value}</h4>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{label}</p>
      </div>
    </Card>
  );
}

const editUserSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  position: z.string().min(2, "Position is required"),
  unitId: z.string().min(1, "Unit is required"),
  isActive: z.boolean().default(false),
  role: z.string().optional(),
});

function EditUserDialog({ user, onClose, onSave }: { user: any, onClose: () => void, onSave: (values: any) => void }) {
  const form = useForm<z.infer<typeof editUserSchema>>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      position: user.position || "",
      unitId: user.unitId || "",
      isActive: user.isActive || false,
      role: user.role || "Staff",
    },
  });

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-card rounded-3xl p-0 overflow-hidden shadow-2xl border-border w-[95vw]">
        <DialogHeader className="p-8 border-b border-border bg-secondary/10">
          <DialogTitle className="text-xl font-black uppercase tracking-tight">Edit Personnel Profile</DialogTitle>
          <DialogDescription className="sr-only">Update specific registry details for this personnel record.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="p-8 space-y-4">
            <FormField control={form.control} name="firstName" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest">First Name</FormLabel><FormControl><Input {...field} className="rounded-xl bg-secondary/20 border-border" /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="lastName" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest">Last Name</FormLabel><FormControl><Input {...field} className="rounded-xl bg-secondary/20 border-border" /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="position" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest">Position</FormLabel><FormControl><Input {...field} className="rounded-xl bg-secondary/20 border-border" /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="unitId" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest">Unit</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger className="rounded-xl bg-secondary/20 border-border"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>{UNITS.map(u => <SelectItem key={u.id} value={u.id}>{u.label}</SelectItem>)}</SelectContent>
                </Select>
              </FormItem>
            )} />
            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest">Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger className="rounded-xl bg-secondary/20 border-border"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Staff">Staff</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="SGOD Chief">SGOD Chief</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
            <FormField control={form.control} name="isActive" render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-xl border border-border p-4 bg-secondary/10">
                <div className="space-y-0.5"><FormLabel className="text-[10px] font-black uppercase tracking-widest">Verified Access</FormLabel></div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )} />
            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-3">
              <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl uppercase text-[10px] font-black tracking-widest w-full sm:flex-1">Cancel</Button>
              <Button type="submit" className="rounded-xl uppercase text-[10px] font-black tracking-widest px-8 bg-primary text-white w-full sm:flex-1 shadow-lg shadow-primary/20">Save Profile</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * MAIN ADMIN PANEL COMPONENT
 */

interface AdminPanelProps {
  onToggleView?: () => void;
}

export function AdminPanel({ onToggleView }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [mounted, setMounted] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [performanceSearch, setPerformanceSearch] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [selectedUnitForTickets, setSelectedUnitForTickets] = useState<any>(null);
  const [viewingTicket, setViewingTicket] = useState<any>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  const [isBroadcastDialogOpen, setIsBroadcastDialogOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastAudience, setBroadcastAudience] = useState<'All Users' | 'Staff Only'>('All Users');

  const auth = useAuth();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'user_profiles'), orderBy('lastName', 'asc'));
  }, [firestore, user]);
  const { data: allUsers } = useCollection(usersQuery);

  const broadcastsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'broadcasts'), orderBy('createdAt', 'desc'));
  }, [firestore, user]);
  const { data: allBroadcasts } = useCollection(broadcastsQuery);

  const resolvedTicketsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'public_assistance_tickets'), 
      where('status', '==', 'Resolved'),
      orderBy('resolvedAt', 'desc')
    );
  }, [firestore, user]);
  const { data: resolvedTickets } = useCollection(resolvedTicketsQuery);

  const maintenanceRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'global_config', 'maintenance');
  }, [firestore]);
  const { data: maintenanceConfig } = useDoc(maintenanceRef);

  const stats = useMemo(() => {
    if (!allUsers) return { total: 0, pending: 0, admin: 0, online: 0 };
    return {
      total: allUsers.length,
      pending: allUsers.filter(u => !u.isActive).length,
      admin: allUsers.filter(u => u.unitId === 'SGOD' || u.isAdmin).length,
      online: allUsers.filter(u => u.status === 'On Duty' && u.isActive).length
    };
  }, [allUsers]);

  const unitPerformance = useMemo(() => {
    if (!resolvedTickets) return [];
    
    const unitMap: Record<string, any[]> = {};
    resolvedTickets.forEach(ticket => {
      const unitId = ticket.targetUnitId || 'SGOD';
      if (!unitMap[unitId]) unitMap[unitId] = [];
      unitMap[unitId].push(ticket);
    });

    return UNITS.map(unit => ({
      ...unit,
      resolvedCount: unitMap[unit.id]?.length || 0,
      tickets: unitMap[unit.id] || []
    })).filter(u => u.label.toLowerCase().includes(performanceSearch.toLowerCase()));
  }, [resolvedTickets, performanceSearch]);

  const handleSignOut = () => { if (auth) signOut(auth); };

  const toggleUserStatus = (userId: string, currentStatus: boolean) => {
    if (!firestore) return;
    updateDocumentNonBlocking(doc(firestore, 'user_profiles', userId), {
      isActive: !currentStatus,
      updatedAt: new Date().toISOString()
    });
    toast({ title: !currentStatus ? "Personnel Verified" : "Access Suspended" });
  };

  const handleDeleteUser = () => {
    if (!firestore || !deletingUserId) return;
    deleteDocumentNonBlocking(doc(firestore, 'user_profiles', deletingUserId));
    toast({ title: "Account Purged" });
    setDeletingUserId(null);
  };

  const handleUpdateUser = (values: z.infer<typeof editUserSchema>) => {
    if (!firestore || !editingUser) return;
    updateDocumentNonBlocking(doc(firestore, 'user_profiles', editingUser.id), {
      ...values,
      updatedAt: new Date().toISOString()
    });
    setEditingUser(null);
    toast({ title: "Account Updated" });
  };

  const handleSendBroadcast = () => {
    if (!firestore || !user || !broadcastTitle || !broadcastMessage) return;
    addDocumentNonBlocking(collection(firestore, 'broadcasts'), {
      title: broadcastTitle,
      message: broadcastMessage,
      audience: broadcastAudience,
      senderId: user.uid,
      createdAt: new Date().toISOString()
    });
    toast({ title: "Announcement Dispatched" });
    setIsBroadcastDialogOpen(false);
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  const handleDeleteBroadcast = (id: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'broadcasts', id));
    toast({ title: "Announcement Removed" });
  };

  const toggleMaintenanceMode = (unitId: string) => {
    if (!firestore) return;
    const currentVal = maintenanceConfig?.[unitId] || false;
    setDocumentNonBlocking(doc(firestore, 'global_config', 'maintenance'), {
      [unitId]: !currentVal
    }, { merge: true });
    
    toast({ 
      title: !currentVal ? "Unit Maintenance Mode Active" : "Unit Restored",
      description: `Target Unit: ${unitId}`
    });
  };

  const getUserName = (uid: string) => {
    if (!uid) return "System";
    const found = allUsers?.find(u => u.id === uid);
    return found ? `${found.firstName} ${found.lastName}` : "Unknown Staff";
  };

  const renderPfpStyle = (person: any, containerSize: number) => {
    if (!person.profilePicture) return undefined;
    const posX = (person.profilePosX || 0) * containerSize;
    const posY = (person.profilePosY || 0) * containerSize;
    const scale = person.profileScale || 1;
    return {
      transform: `translate(${posX}px, ${posY}px) scale(${scale})`,
      transformOrigin: 'center center',
      objectFit: 'cover' as const,
    };
  };

  const SidebarContent = () => (
    <>
      <div className="p-8 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20"><ShieldCheck className="text-white" size={24} /></div>
          <div><h1 className="text-sm font-black uppercase tracking-tighter">Admin Panel</h1><p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">SGOD Administration</p></div>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
        <AdminNavItem active={activeTab === 'DASHBOARD'} onClick={() => { setActiveTab('DASHBOARD'); setIsMobileNavOpen(false); }} icon={LayoutDashboard} label="DASHBOARD" />
        <AdminNavItem active={activeTab === 'USER MANAGEMENT'} onClick={() => { setActiveTab('USER MANAGEMENT'); setIsMobileNavOpen(false); }} icon={Users} label="USER REGISTRY" badgeCount={stats.pending} />
        <AdminNavItem active={activeTab === 'STAFF PERFORMANCE'} onClick={() => { setActiveTab('STAFF PERFORMANCE'); setIsMobileNavOpen(false); }} icon={BarChart3} label="STAFF PERFORMANCE" />
        <AdminNavItem active={activeTab === 'BROADCASTS'} onClick={() => { setActiveTab('BROADCASTS'); setIsMobileNavOpen(false); }} icon={Megaphone} label="ANNOUNCEMENTS" />
        <AdminNavItem active={activeTab === 'SYSTEM SETTINGS'} onClick={() => { setActiveTab('SYSTEM SETTINGS'); setIsMobileNavOpen(false); }} icon={Settings} label="SYSTEM SETTINGS" />
      </nav>
      <div className="p-6 border-t border-sidebar-border space-y-2">
        {onToggleView && (<button onClick={onToggleView} className="flex items-center gap-4 px-4 py-3 w-full rounded-xl text-primary hover:bg-primary/5 transition-all"><LayoutDashboard size={20} /><span className="text-[11px] font-black uppercase tracking-widest">Exit Admin</span></button>)}
        <button onClick={handleSignOut} className="flex items-center gap-4 px-4 py-3 w-full rounded-xl text-muted-foreground hover:text-destructive transition-all"><Power size={20} /><span className="text-[11px] font-black uppercase tracking-widest">Sign Out</span></button>
      </div>
    </>
  );

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-sidebar border-r border-sidebar-border flex-col shrink-0 shadow-2xl z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-sidebar border-r border-sidebar-border flex flex-col">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <main className="flex-1 flex flex-col min-w-0">
        <Header isAdminView onToggleView={onToggleView} onOpenMobileMenu={() => setIsMobileNavOpen(true)} />
        <div className="p-4 sm:p-6 lg:p-10 space-y-8 lg:space-y-10 overflow-y-auto h-[calc(100vh-5rem)] no-scrollbar bg-secondary/5">
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-8 lg:space-y-10 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                <KPIStatCard label="Total Personnel" value={stats.total.toString()} icon={Users} color="primary" subValue="Profiles" />
                <KPIStatCard label="Pending Approval" value={stats.pending.toString()} icon={ShieldCheck} color="amber" subValue="Queue" />
                <KPIStatCard label="Admin Users" value={stats.admin.toString()} icon={Crown} color="primary" subValue="SGOD" />
                <KPIStatCard label="Active Sessions" value={stats.online.toString()} icon={Zap} color="emerald" subValue="Online" />
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10">
                <div className="space-y-6">
                  <h3 className="text-lg lg:text-xl font-black uppercase tracking-tight flex items-center justify-between">
                    <div className="flex items-center gap-3"><ShieldCheck className="text-amber-500" size={20} /> User Approvals</div>
                    {stats.pending > 0 && <Badge className="bg-amber-500 text-white font-black">{stats.pending} PENDING</Badge>}
                  </h3>
                  <div className="space-y-4">
                    {allUsers?.filter(u => !u.isActive).slice(0, 5).map((u) => (
                      <Card key={u.id} className="bg-card border-border p-4 sm:p-6 rounded-[2rem] flex flex-col items-start gap-6 group hover:border-primary/30 transition-all shadow-lg">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-14 w-14 rounded-2xl">
                              <AvatarImage src={u.profilePicture} style={renderPfpStyle(u, 56)} />
                              <AvatarFallback className="text-lg font-black">{u.firstName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-[17px] font-black text-foreground leading-none">{u.firstName} {u.lastName}</p>
                              <p className="text-[11px] text-primary font-black uppercase tracking-widest mt-1.5">{u.position} — {u.unitId}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-amber-500/5 text-amber-600 border-amber-500/20 font-black text-[9px] uppercase tracking-widest">Verification Pending</Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full p-4 rounded-2xl bg-secondary/30 border border-border">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground"><Fingerprint size={14} /></div>
                              <div><p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">DepEd ID</p><p className="text-xs font-black text-foreground mt-0.5">{u.employeeId || 'N/A'}</p></div>
                           </div>
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground"><Contact size={14} /></div>
                              <div><p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">Contact</p><p className="text-xs font-black text-foreground mt-0.5">{u.phoneNumber || 'N/A'}</p></div>
                           </div>
                        </div>

                        <div className="flex items-center gap-3 w-full">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setEditingUser(u)} 
                            className="flex-1 rounded-xl text-[10px] font-black uppercase border-border h-11"
                          >
                            <Edit size={14} className="mr-2" /> Review Profile
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => toggleUserStatus(u.id, false)} 
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase h-11 shadow-lg shadow-emerald-500/20"
                          >
                            <UserCheck size={14} className="mr-2" /> Verify Personnel
                          </Button>
                        </div>
                      </Card>
                    ))}
                    {(!allUsers || allUsers.filter(u => !u.isActive).length === 0) && (
                      <div className="py-16 sm:py-20 text-center bg-white/50 border-2 border-dashed border-border rounded-[2rem] opacity-50 flex flex-col items-center">
                         <ShieldCheck size={48} className="text-muted-foreground/20 mb-4" />
                         <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registry Verification Clear</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-lg lg:text-xl font-black uppercase tracking-tight flex items-center gap-3"><Zap className="text-emerald-500" size={20} /> Personnel Active Now</h3>
                  <div className="space-y-4">
                    {allUsers?.filter(u => u.status === 'On Duty' && u.isActive).slice(0, 5).map((u) => (
                      <Card key={u.id} className="bg-card border-border p-4 sm:p-6 rounded-3xl flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center gap-4"><div className="relative"><Avatar className="h-12 w-12"><AvatarImage src={u.profilePicture} style={renderPfpStyle(u, 48)} /><AvatarFallback>{u.firstName?.[0]}</AvatarFallback></Avatar><div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-background rounded-full animate-pulse shadow-sm"></div></div><div><p className="text-[15px] font-black">{u.firstName} {u.lastName}</p><p className="text-[11px] text-muted-foreground font-bold uppercase">{u.position} — {u.unitId}</p></div></div>
                        <Badge className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase">Active</Badge>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'USER MANAGEMENT' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div><h3 className="text-xl font-black uppercase tracking-tight text-center lg:text-left">Personnel Registry</h3></div>
                <div className="relative w-full lg:w-80">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                   <Input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search registry..." className="h-12 w-full bg-card rounded-xl pl-10" />
                </div>
              </div>
              <div className="bg-card border border-border rounded-3xl overflow-x-auto shadow-xl no-scrollbar">
                <Table className="min-w-[700px]">
                  <TableHeader className="bg-secondary/20"><TableRow><TableHead className="px-8 py-6 text-[11px] font-black uppercase text-muted-foreground">Personnel</TableHead><TableHead className="px-8 py-6 text-[11px] font-black uppercase text-muted-foreground">Unit & ID</TableHead><TableHead className="px-8 py-6 text-[11px] font-black uppercase text-muted-foreground">Status</TableHead><TableHead className="px-8 py-6 text-right text-[11px] font-black uppercase text-muted-foreground">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {allUsers?.filter(u => `${u.firstName} ${u.lastName}`.toLowerCase().includes(userSearch.toLowerCase())).map((u) => (
                      <TableRow key={u.id} className="border-b border-border hover:bg-secondary/10 transition-colors">
                        <TableCell className="px-8 py-6"><div className="flex items-center gap-4"><Avatar className="h-10 w-10"><AvatarImage src={u.profilePicture} style={renderPfpStyle(u, 40)} /><AvatarFallback>{u.firstName?.[0]}</AvatarFallback></Avatar><div><p className="text-sm font-bold">{u.firstName} {u.lastName}</p><p className="text-[10px] text-muted-foreground uppercase">{u.email}</p></div></div></TableCell>
                        <TableCell className="px-8 py-6">
                           <Badge variant="outline" className="text-[10px] font-black uppercase mb-1">{u.unitId}</Badge>
                           <p className="text-[10px] font-bold text-muted-foreground">ID: {u.employeeId || 'N/A'}</p>
                        </TableCell>
                        <TableCell className="px-8 py-6"><Badge className={cn("text-[10px] font-black uppercase", u.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600")} variant="outline">{u.isActive ? 'Verified' : 'Pending'}</Badge></TableCell>
                        <TableCell className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setEditingUser(u)} className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-primary transition-all"><Edit size={16} /></button>
                            <Button variant="outline" size="sm" onClick={() => toggleUserStatus(u.id, !!u.isActive)} className={cn("h-9 px-4 rounded-xl text-[10px] font-black uppercase transition-all", u.isActive ? "hover:bg-destructive hover:text-white border-destructive/20 text-destructive" : "bg-emerald-500 text-white border-none")}>
                              {u.isActive ? 'Suspend' : 'Verify'}
                            </Button>
                            <button onClick={() => setDeletingUserId(u.id)} className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-destructive transition-all"><Trash2 size={16} /></button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {activeTab === 'STAFF PERFORMANCE' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="text-center lg:text-left">
                  <h3 className="text-xl font-black uppercase tracking-tight">Staff Performance Tracking</h3>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Resolution Metrics by Functional Unit</p>
                </div>
                <div className="relative w-full lg:w-80">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                   <Input value={performanceSearch} onChange={(e) => setPerformanceSearch(e.target.value)} placeholder="Filter units..." className="h-12 w-full bg-card rounded-xl pl-10" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unitPerformance.map((unit) => (
                  <Card key={unit.id} className="p-8 lg:p-10 rounded-[2.5rem] bg-card border-border hover:border-primary/20 transition-all group flex flex-col justify-between h-72 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                      <BarChart3 size={160} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <CheckCircle2 size={24} />
                        </div>
                        <Badge variant="outline" className="text-[9px] font-black uppercase bg-emerald-500/5 text-emerald-600 border-emerald-500/20 px-3 py-1 rounded-full">Unit Archive</Badge>
                      </div>
                      <h4 className="text-xl font-black uppercase tracking-tight text-foreground">{unit.label}</h4>
                      <p className="text-[10px] text-muted-foreground font-black uppercase mt-1 tracking-widest opacity-60">Service Resolution</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-8 relative z-10 mt-auto">
                       <div className="space-y-1">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-4xl font-black text-primary tracking-tighter leading-none">{unit.resolvedCount}</span>
                            <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Inquiries</span>
                          </div>
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Total Resolved</p>
                       </div>
                       <Button 
                         onClick={() => setSelectedUnitForTickets(unit)}
                         disabled={!unit.resolvedCount}
                         className="h-11 px-5 bg-secondary/80 hover:bg-primary hover:text-white text-foreground rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 group/btn border border-border"
                       >
                         View <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                       </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'BROADCASTS' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div><h3 className="text-xl font-black uppercase tracking-tight text-center lg:text-left">Announcements</h3></div>
                <Button onClick={() => setIsBroadcastDialogOpen(true)} className="h-12 px-8 bg-primary text-white rounded-xl font-black uppercase text-[10px] w-full lg:w-auto"><Plus size={16} className="mr-2" /> New Announcement</Button>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {allBroadcasts?.map((b) => (
                  <Card key={b.id} className="bg-card border-border p-6 lg:p-8 rounded-3xl shadow-lg relative group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Megaphone size={20} /></div><div><h4 className="text-lg font-black uppercase tracking-tight">{b.title}</h4><p className="text-[10px] text-muted-foreground font-bold uppercase">Audience: {b.audience}</p></div></div>
                      <button onClick={() => handleDeleteBroadcast(b.id)} className="text-muted-foreground hover:text-destructive opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all p-2"><Trash2 size={18} /></button>
                    </div>
                    <p className="text-sm font-medium text-foreground/80 mb-6 leading-relaxed">{b.message}</p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-6 border-t border-border/50 text-[10px] font-black uppercase text-muted-foreground gap-4">
                      <span>Ref: {b.id.substring(0, 8)}</span><div className="flex items-center gap-2"><Clock size={12} /><span>{format(new Date(b.createdAt), 'PPP p')}</span></div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'SYSTEM SETTINGS' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="max-w-4xl text-center lg:text-left mx-auto lg:mx-0">
                 <h3 className="text-xl font-black uppercase tracking-tight flex items-center justify-center lg:justify-start gap-3">
                   <Settings className="text-primary" size={24} /> System Maintenance Controls
                 </h3>
                 <p className="text-muted-foreground text-sm font-medium mt-2 leading-relaxed">
                   Manage functional unit visibility. Enabling maintenance mode will hide unit content for standard users.
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 max-w-7xl mx-auto lg:mx-0">
                {UNITS.filter(u => u.id !== 'SGOD').map((unit) => {
                  const isMaintenance = maintenanceConfig?.[unit.id] || false;
                  return (
                    <Card key={unit.id} className={cn(
                      "p-6 rounded-3xl border transition-all flex items-center justify-between group",
                      isMaintenance ? "bg-amber-500/5 border-amber-500/20" : "bg-card border-border hover:border-primary/20"
                    )}>
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0",
                          isMaintenance ? "bg-amber-500 text-white" : "bg-primary/10 text-primary"
                        )}>
                          {isMaintenance ? <Construction size={24} /> : <Zap size={24} />}
                        </div>
                        <div>
                          <p className="text-[14px] lg:text-[15px] font-black text-foreground">{unit.label}</p>
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">
                            {isMaintenance ? "Status: Maintenance" : "Status: Active"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label htmlFor={`maintenance-${unit.id}`} className="text-[9px] font-black uppercase text-muted-foreground tracking-widest hidden sm:block">Maintenance</Label>
                        <Switch 
                          id={`maintenance-${unit.id}`} 
                          checked={isMaintenance} 
                          onCheckedChange={() => toggleMaintenanceMode(unit.id)} 
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Dialog open={isBroadcastDialogOpen} onOpenChange={setIsBroadcastDialogOpen}>
        <DialogContent className="max-w-2xl bg-card rounded-3xl p-0 overflow-hidden animate-in zoom-in-95 duration-300 w-[95vw]">
          <DialogHeader className="p-8 border-b border-border bg-secondary/10">
            <DialogTitle className="text-2xl font-black uppercase">Announcement Dispatch</DialogTitle>
            <DialogDescription className="sr-only">Draft and deploy a division-wide announcement to specific audiences.</DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase">Announcement Title</Label>
                 <Input value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} className="h-12 rounded-xl" placeholder="Update Title" />
              </div>
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase">Target Audience</Label>
                 <Select value={broadcastAudience} onValueChange={(v: any) => setBroadcastAudience(v)}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                       <SelectItem value="All Users">All Users (Public)</SelectItem>
                       <SelectItem value="Staff Only">Staff Only (Internal)</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
            </div>
            <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase">Message Content</Label>
               <Textarea value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} className="min-h-[150px] rounded-xl" placeholder="Enter announcement details..." />
            </div>
          </div>
          <DialogFooter className="p-8 border-t border-border flex flex-col sm:flex-row gap-4"><Button variant="outline" onClick={() => setIsBroadcastDialogOpen(false)} className="flex-1 rounded-xl uppercase text-[10px]">Cancel</Button><Button onClick={handleSendBroadcast} className="flex-1 bg-primary text-white rounded-xl uppercase text-[10px]">Post Announcement</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingUserId} onOpenChange={(open) => !open && setDeletingUserId(null)}>
        <AlertDialogContent className="rounded-3xl border-border bg-card shadow-2xl w-[95vw] max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive"><AlertTriangle size={24} /></div>
              <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight">Purge Personnel Record?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm font-medium leading-relaxed">
              This action will permanently remove the profile from the SGOD master registry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6 flex flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="rounded-xl uppercase text-[10px] font-black tracking-widest border-border w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="rounded-xl uppercase text-[10px] font-black tracking-widest bg-destructive text-white hover:bg-destructive/90 shadow-xl shadow-destructive/20 w-full sm:w-auto">Confirm Purge</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!selectedUnitForTickets} onOpenChange={(open) => !open && setSelectedUnitForTickets(null)}>
        <DialogContent className="max-w-5xl bg-card border-border rounded-[2.5rem] p-0 overflow-hidden flex flex-col h-[85vh] shadow-3xl w-[95vw]">
          <DialogHeader className="p-6 lg:p-10 border-b border-border bg-secondary/10 shrink-0">
             <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-[1.25rem] bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                    <FileCheck size={28} />
                  </div>
                  <div>
                    <DialogTitle className="text-xl lg:text-3xl font-black uppercase tracking-tight">{selectedUnitForTickets?.label} Records</DialogTitle>
                    <p className="text-[10px] font-black text-muted-foreground uppercase mt-1 lg:mt-2 tracking-[0.2em]">Service Resolution History</p>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                   <p className="text-3xl lg:text-4xl font-black text-primary tracking-tighter leading-none">{selectedUnitForTickets?.resolvedCount}</p>
                   <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">Total Resolved</p>
                </div>
             </div>
             <DialogDescription className="sr-only">Historical registry of all resolved inquiries and appointments for this unit.</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1">
               <div className="p-6 lg:p-10">
                  {selectedUnitForTickets?.resolvedCount > 0 ? (
                    <div className="overflow-x-auto no-scrollbar">
                      <Table className="min-w-[800px]">
                        <TableHeader className="bg-secondary/30">
                          <TableRow className="border-none">
                            <TableHead className="px-6 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Inquiry Details</TableHead>
                            <TableHead className="px-6 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Resolved By</TableHead>
                            <TableHead className="px-6 py-5 text-right text-[10px] font-black uppercase text-muted-foreground tracking-widest">Date</TableHead>
                            <TableHead className="px-6 py-5 text-right text-[10px] font-black uppercase text-muted-foreground tracking-widest">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedUnitForTickets.tickets.map((ticket: any) => (
                            <TableRow key={ticket.id} className="border-b border-border/50 hover:bg-primary/[0.03] transition-all group">
                              <TableCell className="px-6 py-8">
                                <div className="flex flex-col gap-2">
                                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">#{ticket.id.substring(0, 8).toUpperCase()}</span>
                                  <p className="text-[15px] font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{ticket.title}</p>
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-8">
                                 <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                        <UserIcon size={14} />
                                      </div>
                                      <p className="text-xs font-bold text-foreground">{getUserName(ticket.resolvedBy)}</p>
                                    </div>
                                 </div>
                              </TableCell>
                              <TableCell className="px-6 py-8 text-right">
                                 <div className="inline-flex flex-col items-end gap-1.5">
                                    <span className="text-[11px] font-black text-foreground uppercase">{format(new Date(ticket.resolvedAt), 'MMM dd, yyyy')}</span>
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">{format(new Date(ticket.resolvedAt), 'p')}</span>
                                 </div>
                              </TableCell>
                              <TableCell className="px-6 py-8 text-right">
                                 <button 
                                   onClick={() => setViewingTicket(ticket)}
                                   className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all ml-auto"
                                 >
                                   <Eye size={18} />
                                 </button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="py-24 text-center border-2 border-dashed border-border rounded-[3rem] bg-secondary/5 opacity-50">
                       <FileCheck size={64} className="mx-auto mb-6 text-muted-foreground/30" />
                       <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.3em]">No archived records</p>
                    </div>
                  )}
               </div>
            </ScrollArea>
          </div>

          <DialogFooter className="p-8 border-t border-border bg-secondary/10 shrink-0">
             <Button 
               onClick={() => setSelectedUnitForTickets(null)}
               className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-3xl shadow-primary/20 hover:scale-[1.01] transition-all"
             >
               Close Archive
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingTicket} onOpenChange={(open) => !open && setViewingTicket(null)}>
        <DialogContent className="max-w-2xl bg-card border-border rounded-[2.5rem] p-0 overflow-hidden shadow-3xl z-[200] w-[95vw]">
          <DialogHeader className="p-8 border-b border-border bg-emerald-500/5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm">
                  <HelpCircle size={28} />
                </div>
                <div>
                  <DialogTitle className="text-xl lg:text-2xl font-black uppercase tracking-tight text-center sm:text-left">Inquiry Archive</DialogTitle>
                  <p className="text-[10px] font-black text-muted-foreground uppercase mt-1 tracking-widest text-center sm:text-left">Ref: #{viewingTicket?.id.substring(0, 8).toUpperCase()}</p>
                </div>
              </div>
              <Badge className="text-[10px] font-black uppercase px-4 py-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-full" variant="outline">
                RESOLVED
              </Badge>
            </div>
            <DialogDescription className="sr-only">Detailed view of a resolved public assistance ticket or appointment.</DialogDescription>
          </DialogHeader>

          <div className="p-6 lg:p-10 space-y-8 lg:space-y-10">
             <div className="grid grid-cols-1 gap-6">
               <div className="space-y-1.5">
                 <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Subject</p>
                 <p className="text-xl lg:text-2xl font-black text-foreground leading-tight tracking-tight">{viewingTicket?.title}</p>
                 <Badge variant="outline" className="bg-secondary/50 text-foreground border-border font-black uppercase text-[9px] mt-3">{viewingTicket?.serviceType}</Badge>
               </div>
             </div>

             {viewingTicket?.meetingDate && (
               <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-[9px] font-black uppercase text-primary tracking-widest mb-1">Requested Meeting</p>
                    <div className="flex items-center justify-center sm:justify-start gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-primary" />
                        <span className="text-sm font-bold">{viewingTicket.meetingDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-primary" />
                        <span className="text-sm font-bold">{viewingTicket.meetingTime || 'TBA'}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-primary text-white font-black uppercase text-[8px]">SCHEDULE REQUEST</Badge>
               </div>
             )}

             <div className="p-6 lg:p-8 rounded-[2rem] bg-secondary/30 border border-border shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                  <HelpCircle size={80} />
                </div>
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-4 flex items-center gap-2 relative z-10">
                   <Clock size={12} className="text-primary" /> Description
                </p>
                <p className="text-sm lg:text-[15px] font-medium leading-relaxed text-foreground/90 whitespace-pre-wrap relative z-10 italic">
                  "{viewingTicket?.description}"
                </p>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 pt-4 border-t border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-sm"><Phone size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Contact Number</p>
                    <p className="text-base font-black text-foreground">{viewingTicket?.inquirerPhone || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 justify-center sm:justify-end">
                  <div className="text-center sm:text-right">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Resolved By</p>
                    <p className="text-base font-black text-foreground">{getUserName(viewingTicket?.resolvedBy)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center text-emerald-600 shadow-sm"><UserIcon size={20} /></div>
                </div>
             </div>
          </div>

          <DialogFooter className="p-8 border-t border-border bg-secondary/10">
             <Button onClick={() => setViewingTicket(null)} className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl">
               Dismiss
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingUser && <EditUserDialog user={editingUser} onClose={() => setEditingUser(null)} onSave={handleUpdateUser} />}
    </div>
  );
}
