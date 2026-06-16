"use client";

import React, { useState } from 'react';
import { Users, Mail, Loader2, Search, User, Building2, Phone, Calendar as CalendarIcon, Clock, Edit3, Save } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser, updateDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format, differenceInDays, parseISO, isAfter, startOfDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export function PersonnelDirectory() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [editingPerson, setEditingPerson] = useState<any>(null);
  const firestore = useFirestore();
  const { user } = useUser();

  const profileRef = useMemoFirebase(() => {
    if (!user || !firestore || user.isAnonymous) return null;
    return doc(firestore, 'user_profiles', user.uid);
  }, [user, firestore]);
  const { data: currentUserProfile } = useDoc(profileRef);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'user_profiles'), orderBy('lastName', 'asc'));
  }, [firestore, user]);

  const { data: staff, isLoading } = useCollection(usersQuery);

  const getStatusDisplay = (person: any) => {
    const status = person.status || 'On Duty';
    const start = person.statusStartDate;
    const end = person.statusEndDate;
    const today = startOfDay(new Date());
    
    let effectiveStatus = status;
    let isScheduledChange = false;

    if (start && status !== 'On Duty') {
      const startDate = startOfDay(parseISO(start));
      if (isAfter(startDate, today)) {
        effectiveStatus = 'On Duty';
        isScheduledChange = true;
      }
    }

    let color = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    let durationLabel = null;

    if (effectiveStatus === 'On Leave') {
      color = 'bg-destructive/10 text-destructive border-destructive/20';
    } else if (effectiveStatus === 'On Official Business') {
      color = 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    } else if (effectiveStatus === 'Absent') {
      color = 'bg-muted/50 text-muted-foreground border-border';
    }

    if (end && (effectiveStatus === 'On Leave' || effectiveStatus === 'On Official Business')) {
      const endDate = parseISO(end);
      if (isAfter(endDate, today)) {
        const daysRemaining = differenceInDays(endDate, today);
        durationLabel = daysRemaining === 0 ? "Ends Today" : `${daysRemaining} days left`;
      } else {
        durationLabel = "Completed";
      }
    }

    return { label: effectiveStatus, color, durationLabel, isScheduledChange, actualIntendedStatus: status };
  };

  const filteredStaff = React.useMemo(() => {
    if (!staff) return [];
    return staff.filter(s => 
      `${s.firstName} ${s.lastName} ${s.middleName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.employeeId && s.employeeId.includes(searchTerm)) ||
      (s.phoneNumber && s.phoneNumber.includes(searchTerm))
    );
  }, [staff, searchTerm]);

  const isAdmin = currentUserProfile?.isAdmin || currentUserProfile?.role === 'Admin' || currentUserProfile?.role === 'SGOD Chief' || currentUserProfile?.unitId === 'SGOD';

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

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-xl flex flex-col h-fit overflow-hidden">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-3">
          <Users size={18} className="text-primary" /> Personnel Registry
        </h3>
        <Badge variant="outline" className="text-[11px] font-black uppercase bg-primary/5 text-primary border-primary/20">
          {staff?.length || 0} Records
        </Badge>
      </div>

      <div className="relative mb-6 shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
        <Input 
          placeholder="Search personnel or phone..." 
          className="h-10 pl-9 bg-secondary/20 border-border rounded-xl text-[15px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 max-h-[520px] pr-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : filteredStaff.map((person) => {
          const fullName = `${person.firstName} ${person.middleName ? person.middleName + ' ' : ''}${person.lastName} ${person.suffix || ''}`.trim();
          const displayPositionUnit = `${person.position || 'Personnel'} — ${person.unitId || 'Unassigned'}`;
          const statusInfo = getStatusDisplay(person);
          const isMe = user?.uid === person.id;
          const canEditStatus = isMe || isAdmin;

          return (
            <div key={person.id} className="p-5 rounded-xl bg-secondary/10 border border-border/50 group hover:border-primary/30 transition-all">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 rounded-xl shrink-0 border border-primary/5 overflow-hidden">
                       <AvatarImage 
                         src={person.profilePicture || `https://picsum.photos/seed/${person.id}/100`} 
                         style={renderPfpStyle(person, 40)}
                       />
                       <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">{person.firstName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[15px] font-black text-foreground group-hover:text-primary transition-colors">{fullName}</p>
                        {isMe && <Badge className="text-[8px] font-black uppercase bg-primary/10 text-primary border-none">You</Badge>}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="outline" className={cn(
                          "text-[9px] font-black uppercase px-2 py-0.5 border-none",
                          statusInfo.color
                        )}>
                          {statusInfo.label}
                        </Badge>
                        {statusInfo.isScheduledChange && (
                          <Badge variant="outline" className="text-[8px] font-black uppercase px-2 py-0.5 border-amber-500/20 text-amber-600 bg-amber-500/5">
                            Upcoming: {statusInfo.actualIntendedStatus}
                          </Badge>
                        )}
                        {statusInfo.durationLabel && (
                          <span className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                            <Clock size={8} /> {statusInfo.durationLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {canEditStatus && (
                    <button 
                      onClick={() => setEditingPerson(person)}
                      className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                    >
                      <Edit3 size={14} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-2 pl-[52px] pt-1">
                  <div className="flex items-center gap-2 text-[13px] text-muted-foreground font-bold">
                    <Building2 size={13} className="text-primary/60 shrink-0" />
                    <span>{displayPositionUnit}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-muted-foreground font-medium">
                    <Mail size={13} className="text-primary/60 shrink-0" />
                    <span className="truncate">{person.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-muted-foreground font-medium">
                    <Phone size={13} className="text-primary/60 shrink-0" />
                    <span className="font-bold text-foreground tracking-tight">{person.phoneNumber || 'No contact recorded'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {!isLoading && filteredStaff.length === 0 && (
          <div className="py-20 text-center opacity-50 flex flex-col items-center">
            <Users size={32} className="mb-2 text-muted-foreground/30" />
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">No matching personnel</p>
          </div>
        )}
      </div>

      {editingPerson && (
        <EditStatusDialog 
          person={editingPerson} 
          onClose={() => setEditingPerson(null)} 
        />
      )}
    </div>
  );
}

function EditStatusDialog({ person, onClose }: { person: any, onClose: () => void }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [status, setStatus] = useState(person.status || 'On Duty');
  const [startDate, setStartDate] = useState(person.statusStartDate || '');
  const [endDate, setEndDate] = useState(person.statusEndDate || '');

  const handleSave = () => {
    if (!firestore) return;
    
    updateDocumentNonBlocking(doc(firestore, 'user_profiles', person.id), {
      status,
      statusStartDate: (status === 'On Leave' || status === 'On Official Business') ? startDate : null,
      statusEndDate: (status === 'On Leave' || status === 'On Official Business') ? endDate : null,
      statusUpdatedAt: new Date().toISOString()
    });

    toast({
      title: "Registry Change Logged",
      description: `Registry change for ${person.firstName} has been recorded.`
    });
    onClose();
  };

  return (
    <Dialog open={!!person} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-card border-border shadow-2xl p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-8 border-b border-border bg-secondary/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Clock size={24} />
            </div>
            <div>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">Edit Availability</DialogTitle>
              <DialogDescription className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Registry Update: {person.firstName} {person.lastName}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Proposed Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-12 bg-secondary/30 rounded-xl font-bold">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="On Duty" className="font-bold">On Duty</SelectItem>
                <SelectItem value="On Leave" className="font-bold">On Leave</SelectItem>
                <SelectItem value="On Official Business" className="font-bold">On Official Business</SelectItem>
                <SelectItem value="Absent" className="font-bold">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(status === 'On Leave' || status === 'On Official Business') && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Activation Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-12 bg-secondary/30 rounded-xl font-medium" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Expected Return</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-12 bg-secondary/30 rounded-xl font-medium" />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-8 border-t border-border bg-secondary/10 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest">Discard</Button>
          <Button onClick={handleSave} className="flex-1 h-12 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">
            <Save size={14} className="mr-2" /> Commit to Registry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}