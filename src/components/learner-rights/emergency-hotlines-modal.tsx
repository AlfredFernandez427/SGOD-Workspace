"use client";

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  PhoneCall, 
  MapPin, 
  Shield, 
  Flame, 
  Phone, 
  Building2,
  ChevronRight,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HotlineItemProps {
  title: string;
  subtitle?: string;
  landline?: string;
  mobile?: string;
  mobileLabel?: string;
  police?: string;
  icon: any;
  color?: string;
}

function HotlineCard({ title, subtitle, landline, mobile, mobileLabel, police, icon: Icon, color }: HotlineItemProps) {
  const handleDial = (num: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `tel:${num.replace(/[^0-9]/g, '')}`;
    }
  };

  return (
    <div className="p-6 rounded-[2rem] bg-card border border-border hover:border-primary/30 transition-all group flex flex-col justify-between shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        <Icon size={100} />
      </div>
      
      <div className="space-y-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm", color || "bg-primary/10 text-primary")}>
            <Icon size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-tight text-foreground">{title}</h4>
            {subtitle && <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{subtitle}</p>}
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {landline && (
            <div className="space-y-1.5">
               <p className="text-[8px] font-black uppercase text-muted-foreground ml-1">Landline</p>
               <button 
                onClick={() => handleDial(landline)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-primary/10 transition-colors group/btn"
              >
                <div className="flex items-center gap-2">
                  <Building2 size={12} className="text-muted-foreground" />
                  <span className="text-xs font-bold text-foreground">{landline}</span>
                </div>
                <span className="text-[8px] font-black text-primary uppercase opacity-0 group-hover/btn:opacity-100 transition-opacity">Dial</span>
              </button>
            </div>
          )}
          
          {mobile && (
            <div className="space-y-1.5">
               <p className="text-[8px] font-black uppercase text-muted-foreground ml-1">{mobileLabel || "Mobile / Alternative"}</p>
               {mobile.split('/').map((num, i) => (
                 <button 
                  key={i}
                  onClick={() => handleDial(num.trim())}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500 hover:text-white transition-all group/btn"
                >
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-emerald-600 group-hover/btn:text-white" />
                    <span className="text-xs font-black tracking-tight">{num.trim()}</span>
                  </div>
                  <ChevronRight size={14} className="text-emerald-600 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                </button>
               ))}
            </div>
          )}

          {police && (
            <div className="space-y-1.5">
               <p className="text-[8px] font-black uppercase text-muted-foreground ml-1">Police</p>
               <button 
                onClick={() => handleDial(police)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary hover:text-white transition-all group/btn"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert size={12} className="text-primary group-hover/btn:text-white" />
                  <span className="text-xs font-black tracking-tight">{police}</span>
                </div>
                <ChevronRight size={14} className="text-primary group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface EmergencyHotlinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmergencyHotlinesModal({ isOpen, onClose }: EmergencyHotlinesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-background border-border shadow-3xl p-0 overflow-hidden rounded-[2.5rem] h-[90vh] flex flex-col w-[95vw]">
        <DialogHeader className="p-8 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[1.25rem] bg-destructive/10 flex items-center justify-center text-destructive shadow-sm animate-pulse">
              <PhoneCall size={32} />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black uppercase tracking-tight text-foreground">Emergency Command</DialogTitle>
              <DialogDescription className="text-xs font-black text-muted-foreground uppercase mt-1 tracking-[0.2em]">
                DAVAO DEL SUR HOTLINE REGISTRY
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-secondary/5">
          <ScrollArea className="h-full">
            <div className="p-10 space-y-16">
              
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border"></div>
                  <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-slate-900 text-white shadow-xl">
                    <MapPin size={14} className="text-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Provincial and Regional Hub (Digos City)</span>
                  </div>
                  <div className="h-px flex-1 bg-border"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <HotlineCard title="PDRRMO" subtitle="Provincial Operations" landline="(082) 553-9620" mobile="0918-450-7413 / 0917-477-8200" icon={Shield} color="bg-emerald-500/10 text-emerald-600" />
                  <HotlineCard title="Digos CDRRMO" subtitle="City Operations" landline="(082) 284-8211" mobile="0946-695-7777 / 0905-428-7002" icon={Shield} />
                  <HotlineCard title="Digos Fire" subtitle="BFP Digos City" landline="(082) 553-1160" mobile="0919-858-8656 / 0977-088-4819" icon={Flame} color="bg-destructive/10 text-destructive" />
                  <HotlineCard title="Digos Police" subtitle="PNP Digos City" landline="(082) 553-1166" mobile="0939-924-0779" icon={Shield} />
                </div>
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border"></div>
                  <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-secondary text-foreground border border-border shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Municipal Emergency Network</span>
                  </div>
                  <div className="h-px flex-1 bg-border"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  <HotlineCard title="Bansalan" mobileLabel="MDRRMO / LGU Hotline" mobile="0909-514-4114" police="0998-598-7065" icon={MapPin} />
                  <HotlineCard title="Hagonoy" mobileLabel="MDRRMO / LGU Hotline" mobile="0930-802-1596" police="0998-598-7067" icon={MapPin} />
                  <HotlineCard title="Magsaysay" mobileLabel="MDRRMO / LGU Hotline" mobile="0910-885-8406" police="0998-598-7071" icon={MapPin} />
                  <HotlineCard title="Matanao" mobileLabel="MDRRMO / LGU Hotline" mobile="0948-693-0177" police="0998-598-7073" icon={MapPin} />
                  <HotlineCard title="Santa Cruz" mobileLabel="MDRRMO / LGU Hotline" mobile="0930-927-4638" police="0998-598-7076" icon={MapPin} />
                  <HotlineCard title="Kiblawan" mobileLabel="MDRRMO / LGU Hotline" mobile="0912-701-8742" police="0998-598-7068" icon={MapPin} />
                  <HotlineCard title="Malalag" mobileLabel="MDRRMO / LGU Hotline" mobile="0912-872-9694" police="0998-598-7070" icon={MapPin} />
                  <HotlineCard title="Padada" mobileLabel="MDRRMO / LGU Hotline" mobile="0946-681-3067" police="0998-598-7074" icon={MapPin} />
                  <HotlineCard title="Sulop" mobileLabel="MDRRMO / LGU Hotline" mobile="0930-610-8878" police="0998-598-7078" icon={MapPin} />
                  <HotlineCard title="Santa Maria" mobileLabel="MDRRMO / LGU Hotline" mobile="0910-441-2469" police="0998-598-7077" icon={MapPin} />
                </div>
              </section>

            </div>
          </ScrollArea>
        </div>

        <div className="px-10 py-6 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Zap size={14} className="text-primary animate-pulse" /> Immediate Response Protocol Enabled
          </p>
          <Button onClick={onClose} className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black uppercase text-[10px] tracking-widest px-10 h-12 shadow-xl">
            Close Command Center
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
