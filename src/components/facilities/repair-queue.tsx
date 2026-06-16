
"use client";

import React from 'react';
import { Wrench, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase, useUser, updateDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, query, orderBy, doc, where } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export function RepairQueue({ dashboard }: { dashboard?: boolean }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const profileRef = useMemoFirebase(() => {
    if (!user || !firestore || user.isAnonymous) return null;
    return doc(firestore, 'user_profiles', user.uid);
  }, [user, firestore]);
  const { data: profile } = useDoc(profileRef);

  // Verified staff or SGOD Admins can read the registry
  const isAuthorized = user?.email === 'admin@admin.com' || (profile && (
    profile.isActive === true ||
    profile.unitId === 'SGOD' || 
    profile.isAdmin === true || 
    profile.role === 'Admin' ||
    profile.role === 'SGOD Chief'
  ));

  const repairQuery = useMemoFirebase(() => {
    if (!firestore || !user || user.isAnonymous || (!profile && user?.email !== 'admin@admin.com') || !isAuthorized) return null;
    
    return query(
      collection(firestore, 'repair_requests'), 
      where('status', '!=', 'Completed'),
      orderBy('status', 'asc'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user, profile, isAuthorized]);

  const { data: repairs, isLoading } = useCollection(repairQuery);

  const canResolve = user?.email === 'admin@admin.com' || profile?.unitId === 'SGOD' || profile?.unitId === 'Education Facilities' || profile?.isAdmin || profile?.role === 'Admin';

  if (!user || user.isAnonymous || (!profile && user?.email !== 'admin@admin.com') || !isAuthorized) return null;

  const handleComplete = (id: string) => {
    if (!firestore) return;
    updateDocumentNonBlocking(doc(firestore, 'repair_requests', id), {
      status: 'Completed',
      completedAt: new Date().toISOString(),
      completedBy: user?.uid
    });
    toast({
      title: "Repair Finalized",
      description: "Request has been removed from the active registry."
    });
  };

  if (dashboard) {
    return (
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" size={20} /></div>
        ) : repairs && repairs.length > 0 ? (
          repairs.map((repair: any) => (
            <div key={repair.id} className="p-4 rounded-xl bg-secondary/20 border border-border hover:border-amber-500/40 transition-all group relative">
              <div className="flex justify-between items-start mb-2">
                 <Badge className={cn(
                    "text-[8px] font-black uppercase px-2 py-0.5 border-none",
                    repair.urgency === 'High' ? 'bg-destructive/10 text-destructive' : 
                    repair.urgency === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 
                    'bg-secondary text-muted-foreground'
                  )} variant="outline">{repair.urgency}</Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold">
                    <Clock size={10} /> {repair.createdAt ? formatDistanceToNow(new Date(repair.createdAt), { addSuffix: true }) : '...'}
                  </span>
              </div>
              <p className="text-sm font-bold text-foreground group-hover:text-amber-600 transition-colors truncate">{repair.schoolName}</p>
              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{repair.description}</p>
              
              {canResolve && (
                <Button 
                  onClick={() => handleComplete(repair.id)}
                  size="icon" 
                  variant="ghost" 
                  className="absolute bottom-4 right-4 h-7 w-7 text-muted-foreground hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <CheckCircle2 size={14} />
                </Button>
              )}
            </div>
          ))
        ) : (
          <div className="py-10 text-center opacity-50 border border-dashed border-border rounded-xl">
             <p className="text-[10px] font-black uppercase tracking-widest">Registry Clear</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl h-[450px] flex flex-col">
      <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-secondary/10 shrink-0">
        <div className="flex items-center gap-3">
          <Wrench size={18} className="text-amber-500" />
          <h3 className="font-bold text-sm text-foreground uppercase tracking-widest">Maintenance Registry</h3>
        </div>
        <Badge variant="outline" className="text-[10px] font-black uppercase border-amber-500/30 text-amber-500 bg-amber-500/5">Active Queue</Badge>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : repairs && repairs.length > 0 ? (
          <Table>
            <TableHeader className="bg-secondary/30 sticky top-0 z-10">
              <TableRow>
                <TableHead className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase">Context</TableHead>
                <TableHead className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase">Urgency</TableHead>
                <TableHead className="px-8 py-4 text-right text-[10px] font-black text-muted-foreground uppercase">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repairs.map((repair: any) => (
                <TableRow key={repair.id} className="hover:bg-primary/[0.02] border-none group">
                  <TableCell className="px-8 py-6">
                    <p className="text-sm font-bold text-foreground">{repair.schoolName}</p>
                    <p className="text-[10px] text-muted-foreground font-medium line-clamp-1">{repair.description}</p>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <Badge className={cn(
                      "text-[9px] font-black uppercase px-2 py-0.5 border-none",
                      repair.urgency === 'High' ? 'bg-destructive/10 text-destructive' : 
                      repair.urgency === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 
                      'bg-secondary text-muted-foreground'
                    )} variant="outline">{repair.urgency}</Badge>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-wider",
                        repair.status === 'Completed' ? 'text-emerald-500' : 
                        repair.status === 'In Progress' ? 'text-primary' : 'text-amber-500'
                      )}>{repair.status}</span>
                      {canResolve && (
                        <Button 
                          onClick={() => handleComplete(repair.id)}
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-muted-foreground hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <CheckCircle2 size={14} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-50">
            <Wrench size={48} className="text-muted-foreground/10 mb-4" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Registry Clear</p>
          </div>
        )}
      </div>
    </div>
  );
}
