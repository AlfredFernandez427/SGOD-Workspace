"use client";

import React from 'react';
import { 
  Plus, 
  Send, 
  ExternalLink, 
  Globe, 
  FileText, 
  HeartHandshake,
  ChevronDown,
  MessageSquare,
  Zap,
  CalendarCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { KPICard } from '@/components/dashboard/kpi-card';
import { TransactionRegistry } from './transaction-registry';

interface SocMobDashboardProps {
  totalDonationsValue: number;
  totalDonationsCount: number;
  uniquePartnersCount: number;
  isGuestUser: boolean;
  onOpenPartnershipModal: () => void;
}

export function SocMobDashboard({
  totalDonationsValue,
  totalDonationsCount,
  uniquePartnersCount,
  isGuestUser,
  onOpenPartnershipModal
}: SocMobDashboardProps) {
  
  const formatCurrency = (value: number) => {
    if (!value || value === 0) return "₱ 0.0";
    if (value >= 1000000000) return `₱ ${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `₱ ${(value / 1000000).toFixed(1)}M`;
    return `₱ ${value.toLocaleString()}`;
  };

  const submissionLinks = [
    { label: "School MOA/MOU/DOD/AR/MOVs", href: "https://docs.google.com/forms/d/e/1FAIpQLSe_j6E3M2q5IYGK6SM_ppK56rJIh-OVWHVcaPXNBjUViaEdGA/viewform" },
    { label: "2026 Project Handa", href: "https://docs.google.com/forms/d/e/1FAIpQLSeYp2p5dH_GWIdtLHGx7dmL4Bo-aZUzhE3a4aU5XpguWpDXpw/viewform" },
    { label: "School PTA Financial Report", href: "https://docs.google.com/forms/d/e/1FAIpQLSe67Ie4hPPHoH3Nejka1r4Wbuz6NnGo9PBUv0WIcozV0ITKkg/viewform?usp=send_form" },
    { label: "DPDS School Monthly Transmittal", href: "https://docs.google.com/forms/d/e/1FAIpQLSfwsAoaD_R2odwklix9l6VDhMrHzRC-UbwncJWjU68R_HMf1w/viewform" },
    { label: "2025 BE Schools Needs Assessment", href: "https://docs.google.com/forms/d/e/1FAIpQLScZN9pTyhQ6zGsMbFcGFPBf7xOQ2qzVMB06p21jMMOIZ4pM4A/viewform" },
    { label: "Daily Accomplishment (DARF)", href: "https://docs.google.com/forms/d/e/1FAIpQLScZM87S5L4zTyZrXr7p2HUl56PudnQkL0Lpsv0l0gXB3zYWWg/viewform" },
    { label: "School CART", href: "https://forms.office.com/pages/responsepage.aspx?id=DQSIkWdsW0yxEjajBLZtrQAAAAAAAAAAAANAAcdHuUhUQzBQMEpUQklaS1hQMUE0NkNCWFI1Uks4Qy4u&route=shorturl&fswReload=1&fswNavStart=1777277879135" },
    { label: "FPTA Officers Submission", href: "https://docs.google.com/forms/d/e/1FAIpQLSe1T-jYGfSwBOlXSSvy20k5dswHlqSvyHoSX3i7ofqaOzEeKw/viewform" },
    { label: "School Brigada Submission", href: "https://docs.google.com/forms/d/e/1FAIpQLSf_bcwCpfKAf0B25M3MYH6gKWoHOcKvRh5Uv0usPXY5DGvTSQ/viewform" },
  ];

  const clientLinks = [
    { label: "Division Office CSM Form", href: "https://docs.google.com/forms/d/e/1FAIpQLSdOdg9EZn5TsRGzNCFJIxRm277PSjyMddowNmPBI9361T9N2w/viewform" },
    { label: "CSM Form 2025 (PDF Download)", href: "https://drive.google.com/file/d/1TSbi8RDIm87sG-KSmgMLoBImVQH5yzop/view" },
    { label: "CSM Form for Schools & Districts", href: "https://docs.google.com/forms/d/e/1FAIpQLScM6QIptXJxAAHXi25tm8Dvepd7Cgcy21S9W-RLm9IjM4fgQA/viewform" },
    { label: "Client Connect Portal", href: "https://sites.google.com/view/deped-davsur-clientservice/home" },
  ];

  const handleExecuteLink = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-8 sm:space-y-10 h-fit">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="max-w-4xl">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">SocMob <span className="text-accent">& DPDS</span></h1>
          <p className="text-[14px] text-muted-foreground mt-2 font-medium leading-relaxed">
            Social Mobilization (SocMob) Unit Website – a dashboard that supports partnership building and stakeholder engagement to strengthen learner-centered programs, school improvement, and resource mobilization. It facilitates the management of initiatives such as Brigada Eskwela and the Adopt-a-School Program and ensures proper coordination, documentation, and reporting of partnerships. It also supports public assistance and feedback mechanisms to promote responsive, transparent, and community-driven education services.
          </p>
        </div>
        {!isGuestUser && (
          <Button onClick={onOpenPartnershipModal} className="h-12 bg-primary text-white font-black uppercase rounded-xl px-8 shadow-xl flex items-center gap-3 hover:scale-[1.02] transition-transform shrink-0">
            <Plus size={18} /> Register Partnership
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard label="Cumulative Resources" value={formatCurrency(totalDonationsValue)} color="primary" className="h-fit" />
        <KPICard label="Total Contributions" value={totalDonationsCount.toString()} subValue="Live Registry" color="emerald" className="h-fit" />
        <KPICard label="Vetted Partners" value={uniquePartnersCount.toString()} subValue="Organizations" color="amber" className="h-fit" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        <Card className="p-8 rounded-[2.5rem] bg-secondary/5 border-border flex flex-col justify-between group hover:border-primary/20 transition-all shadow-lg overflow-hidden relative min-h-[320px]">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <Globe size={120} />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Globe size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black uppercase tracking-tight text-foreground">Partnership Database</h4>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Core DPDS Site</p>
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              Access the official DPDS website for global stakeholder intelligence and unit announcements.
            </p>
          </div>
          <div className="relative z-10 pt-4">
            <Button 
              onClick={() => handleExecuteLink('https://partnershipsdatabase.deped.gov.ph')}
              className="w-full h-12 bg-primary text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2 group/btn"
            >
              Launch DPDS Website <ExternalLink size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </Card>

        <Card className="p-8 rounded-[2.5rem] bg-secondary/5 border-border flex flex-col justify-between group hover:border-amber-500/20 transition-all shadow-lg overflow-hidden relative min-h-[320px]">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <FileText size={120} />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner">
                <CalendarCheck size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black uppercase tracking-tight text-foreground">Reporting Hub</h4>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Submission Protocols</p>
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              Execute mandatory school and district reporting submissions via our synchronized digital channels.
            </p>
          </div>
          <div className="relative z-10 pt-4">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-amber-500/20 flex items-center justify-between group/btn">
                  <span className="flex items-center gap-2"><Send size={14} /> Mission Submissions</span>
                  <ChevronDown size={14} className="group-data-[state=open]:rotate-180 transition-transform" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 p-2 bg-card border-border rounded-xl shadow-2xl z-[100]">
                {submissionLinks.map((link) => (
                  <DropdownMenuItem 
                    key={link.label} 
                    onClick={() => handleExecuteLink(link.href)}
                    className="p-3 rounded-lg focus:bg-amber-500/10 focus:text-amber-600 cursor-pointer text-[10px] font-black uppercase tracking-tight"
                  >
                    {link.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>

        <Card className="p-8 rounded-[2.5rem] bg-secondary/5 border-border flex flex-col justify-between group hover:border-emerald-500/20 transition-all shadow-lg overflow-hidden relative min-h-[320px]">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <HeartHandshake size={120} />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
                <MessageSquare size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black uppercase tracking-tight text-foreground">Client Intel</h4>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">CSM & Portal Services</p>
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              Monitor client satisfaction and facilitate stakeholder connections through the Client Connect Portal.
            </p>
          </div>
          <div className="relative z-10 pt-4">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20 flex items-center justify-between group/btn">
                  <span className="flex items-center gap-2"><Zap size={14} /> Service Portals</span>
                  <ChevronDown size={14} className="group-data-[state=open]:rotate-180 transition-transform" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 p-2 bg-card border-border rounded-xl shadow-2xl z-[100]">
                {clientLinks.map((link) => (
                  <DropdownMenuItem 
                    key={link.label} 
                    onClick={() => handleExecuteLink(link.href)}
                    className="p-3 rounded-lg focus:bg-emerald-500/10 focus:text-emerald-600 cursor-pointer text-[10px] font-black uppercase tracking-tight"
                  >
                    {link.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>

      </div>

      <div className="mt-8 sm:mt-10">
        <TransactionRegistry />
      </div>
    </div>
  );
}
