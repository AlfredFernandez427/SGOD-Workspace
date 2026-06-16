"use client";

import React from 'react';
import { 
  ExternalLink, 
  Globe, 
  ShieldCheck,
  BookMarked,
  LayoutGrid,
  Zap,
  Users,
  ClipboardCheck,
  BarChart,
  School,
  ChevronRight,
  FileText,
  Search,
  Briefcase,
  Target,
  FileSearch
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

/**
 * SMME Operational Dashboard
 * Header-style horizontal navigation for a streamlined registry experience.
 * Full-width expansion for an immersive administrative environment.
 */
export function SMMEDashboard() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'smme-hero');

  const handleLinkClick = (href: string) => {
    if (!href || href === '#') return;
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const registryData = [
    {
      id: "profile",
      label: "Profile",
      icon: Users,
      links: [
        { label: "IPC", href: "#" },
        { label: "IPCR", href: "#" },
        { label: "AIP", href: "#" },
        { label: "Client Satisfaction", href: "#" },
      ]
    },
    {
      id: "resources",
      label: "Resources",
      icon: BookMarked,
      links: [
        { label: "Memorandum from Region and Central Office", href: "#" },
        { label: "Division Memo Issuance", href: "#" },
      ]
    },
    {
      id: "private-schools",
      label: "Private Schools",
      icon: School,
      links: [
        { label: "Voluntary Closure", href: "#" },
        { label: "Approve School Permit", href: "#" },
        { label: "Activities Conducted", href: "#" },
        { label: "Private School Directory", href: "#" },
        { label: "Confirmation of Fees", href: "#" },
        { label: "Special Order", href: "#" },
        { label: "Technical Assistance", href: "#" },
        { label: "Communication to Private Schools", href: "#" },
      ]
    },
    {
      id: "mea",
      label: "MEA",
      icon: BarChart,
      links: [
        { label: "FY 2025", href: "#" },
      ]
    },
    {
      id: "assessment",
      label: "Assessment",
      icon: ClipboardCheck,
      links: [
        { label: "NAT Result", href: "#" },
        { label: "RAT Result", href: "#" },
      ]
    },
    {
      id: "qame",
      label: "QAME",
      icon: ShieldCheck,
      links: [
        { 
          label: "QAME Report", 
          subItems: [
            { label: "2025", href: "#" }
          ]
        },
        { label: "Level 3 QAME Conducted", href: "#" },
      ]
    },
    {
      id: "sbm",
      label: "SBM",
      icon: LayoutGrid,
      links: [
        { 
          label: "Self-Assessment Checklist", 
          subItems: [
            { label: "Elementary", href: "#" },
            { label: "Junior Highschool", href: "#" },
            { label: "Senior Highschool", href: "#" }
          ]
        },
        { label: "DO 7 s.2024", href: "#" },
        { label: "Activities Conducted", href: "#" },
      ]
    },
    {
      id: "qms",
      label: "QMS",
      icon: Zap,
      links: [
        { label: "Quality Control Plan", href: "#" },
        { label: "Opportunity & Risk Registry", href: "#" },
        { label: "SWOT", href: "#" },
      ]
    },
    {
      id: "parties",
      label: "Interested Parties",
      icon: Users,
      links: [
        { label: "List of Relevant Interested Parties", href: "#" },
      ]
    },
    {
      id: "Income",
      label: "Income Monitoring",
      icon: FileText,
      href: "https://sites.google.com/deped.gov.ph/smme-monitoring-evaluation/home" 
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20 w-full">
      
      {/* Hero Section */}
      <div className="relative w-full rounded-[3rem] overflow-hidden bg-slate-900 aspect-[16/9] sm:aspect-[21/6] shadow-2xl group border-4 border-white dark:border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 to-slate-900 z-10"></div>
        <Image 
          src={heroImage?.imageUrl || "https://picsum.photos/seed/smmehero/1200/400"} 
          alt="SMME Site Header" 
          fill
          sizes="100vw"
          className="object-cover group-hover:scale-105 transition-transform duration-1000 opacity-60"
          data-ai-hint={heroImage?.imageHint || "office administration"}
          priority
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-8 sm:px-20">
          <div className="space-y-6 animate-in zoom-in-95 duration-1000">
            <div className="space-y-2">
              <Badge className="bg-blue-500 text-white font-black uppercase tracking-[0.4em] px-4 py-1.5 border-none rounded-full text-[10px] shadow-lg shadow-blue-500/20">
                SMME Operational Hub
              </Badge>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl uppercase leading-none">
                School Management, Monitoring and Evaluation
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Command Bar Registry */}
      <section className="px-2">
        <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border border-border rounded-[1.5rem] p-2 shadow-2xl">
          <Menubar className="border-none bg-transparent h-auto py-1 flex flex-wrap justify-center items-center gap-1">
            {registryData.map((category) => (
              <MenubarMenu key={category.id}>
                {category.href ? (
                  <button 
                    onClick={() => handleLinkClick(category.href!)}
                    className="px-4 py-2.5 rounded-xl cursor-pointer hover:bg-blue-500/10 transition-all flex items-center gap-2 text-[11px] font-black uppercase tracking-widest outline-none text-foreground/80 hover:text-blue-600 focus:bg-blue-500/10"
                  >
                    <category.icon size={14} className="text-blue-600" />
                    <span>{category.label}</span>
                  </button>
                ) : (
                  <>
                    <MenubarTrigger className="px-4 py-2.5 rounded-xl cursor-pointer hover:bg-blue-500/10 focus:bg-blue-500/10 data-[state=open]:bg-blue-500/10 transition-all flex items-center gap-2">
                      <category.icon size={14} className="text-blue-600" />
                      <span className="text-[11px] font-black uppercase tracking-widest">{category.label}</span>
                    </MenubarTrigger>
                    <MenubarContent className="min-w-[240px] bg-card border-border rounded-xl shadow-3xl z-[50] animate-in fade-in zoom-in-95 duration-200">
                      {category.links?.map((link, idx) => (
                        <React.Fragment key={idx}>
                          {link.subItems ? (
                            <MenubarSub>
                              <MenubarSubTrigger className="px-4 py-3 text-[10px] font-bold uppercase tracking-tight flex items-center justify-between group/sub cursor-pointer">
                                <span className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
                                  {link.label}
                                </span>
                              </MenubarSubTrigger>
                              <MenubarSubContent className="bg-card border-border rounded-xl shadow-2xl">
                                {link.subItems.map((sub, subIdx) => (
                                  <MenubarItem 
                                    key={subIdx} 
                                    onClick={() => handleLinkClick(sub.href)}
                                    className="px-4 py-3 text-[9px] font-black uppercase tracking-widest cursor-pointer focus:bg-blue-500/10 focus:text-blue-600"
                                  >
                                    {sub.label}
                                  </MenubarItem>
                                ))}
                              </MenubarSubContent>
                            </MenubarSub>
                          ) : (
                            <MenubarItem 
                              onClick={() => handleLinkClick(link.href)}
                              className="px-4 py-3 text-[10px] font-bold uppercase tracking-tight flex items-center justify-between group/link cursor-pointer focus:bg-blue-500/10 focus:text-blue-600"
                            >
                              <span className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20 group-hover/link:bg-blue-500" />
                                {link.label}
                              </span>
                              <ExternalLink size={10} className="text-muted-foreground opacity-30 group-hover/link:opacity-100" />
                            </MenubarItem>
                          )}
                          {idx < category.links!.length - 1 && <MenubarSeparator className="bg-border/50" />}
                        </React.Fragment>
                      ))}
                    </MenubarContent>
                  </>
                )}
              </MenubarMenu>
            ))}
          </Menubar>
        </div>
      </section>

      <section className="px-4 space-y-12">
        <div className="text-center max-w-5xl mx-auto space-y-4">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
            SMME Website – a centralized platform for monitoring and evaluating school management systems in line with DepEd standards. It provides access to assessment programs, technical assistance, and monitoring and evaluation activities to support data-driven decision-making and improved learner outcomes. It also provides updates on compliance requirements, program implementation, and resource distribution, while enabling the submission, tracking, and validation of school-related applications to ensure transparent and efficient service delivery.
          </p>
          <div className="w-24 h-1 bg-blue-600/20 rounded-full mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <Card className="p-8 sm:p-10 rounded-[2.5rem] bg-card border-border shadow-xl relative overflow-hidden group hover:border-blue-500/20 transition-all flex flex-col h-full">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none group-hover:opacity-[0.08] transition-opacity">
              <Briefcase size={160} />
            </div>
            
            <div className="relative z-10 space-y-8 flex-1">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 shadow-inner">
                  <Briefcase size={28} />
                </div>
                <Badge variant="outline" className="text-[10px] font-black uppercase bg-blue-600/5 text-blue-600 border-blue-600/20 px-3 py-1">Senior Level</Badge>
              </div>

              <div>
                <h4 className="text-xl font-black uppercase tracking-tight text-foreground">Senior Education Program Specialist</h4>
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2">
                      <Target size={12} /> Purpose of Position
                    </p>
                    <p className="text-sm font-medium text-foreground/80 leading-relaxed">
                      Provide technical support in implementing quality management systems in the schools division office, the schools and learning centers and monitor adherence to standards and policies towards effective and efficient delivery of quality basic education and lead districts and schools/learning centers in the implementation of an M&E system to monitor their progress.
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border/50">
                    <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2">
                      <LayoutGrid size={12} /> Key Result Areas
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Quality Management System",
                        "Assessment",
                        "School Compliance To Quality Standards",
                        "Research And Development",
                        "Technical Assistance to Schools and Learning Center"
                      ].map((kra, i) => (
                        <Badge key={i} variant="secondary" className="bg-secondary/50 text-foreground/70 font-bold uppercase text-[9px] px-3 py-1 border-none">{kra}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 sm:p-10 rounded-[2.5rem] bg-secondary/5 border-border shadow-xl relative overflow-hidden group hover:border-blue-500/20 transition-all flex flex-col h-full">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none group-hover:opacity-[0.08] transition-opacity">
              <FileSearch size={160} />
            </div>

            <div className="relative z-10 space-y-8 flex-1">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 shadow-inner">
                  <FileSearch size={28} />
                </div>
                <Badge variant="outline" className="text-[10px] font-black uppercase bg-slate-500/5 text-slate-500 border-slate-500/20 px-3 py-1">Level II</Badge>
              </div>

              <div>
                <h4 className="text-xl font-black uppercase tracking-tight text-foreground">Education Program Specialist II</h4>
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2">
                      <Target size={12} /> Purpose of Position
                    </p>
                    <p className="text-sm font-medium text-foreground/80 leading-relaxed">
                      Assist in providing technical support in implementing quality management systems in the schools division office, the schools and learning centers and monitor adherence to standards and policies towards effective and efficient delivery of quality basic education and assist districts and schools/learning centers in the implementation of an M&E system to monitor their progress.
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border/50">
                    <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2">
                      <LayoutGrid size={12} /> Key Result Areas
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Quality Management System",
                        "Assessment",
                        "School Compliance to Quality Standards",
                        "Research and Development"
                      ].map((kra, i) => (
                        <Badge key={i} variant="secondary" className="bg-secondary/50 text-foreground/70 font-bold uppercase text-[9px] px-3 py-1 border-none">{kra}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <footer className="w-full bg-[#deded9] text-[#333333] py-16 px-6 sm:px-12 lg:px-20 mt-20 border-t border-border/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-20">
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 transition-transform duration-700 hover:rotate-6">
              <Image 
                src="https://lh3.googleusercontent.com/d/1lBvJQXZhqGLXueou1a8xvkI9wMwvUVIJ" 
                alt="Republic of the Philippines Seal"
                fill
                sizes="1024px"
                className="object-contain opacity-90 drop-shadow-lg"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest border-b border-[#333333]/20 pb-2">Republic of the Philippines</h4>
            <p className="text-[10px] font-medium leading-relaxed opacity-80">
              All content is in the public domain unless otherwise stated.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest border-b border-[#333333]/20 pb-2">About GOVPH</h4>
            <p className="text-[10px] font-medium leading-relaxed opacity-80 mb-4">
              Learn more about the Philippine government, its structure, how government works and the people behind it.
            </p>
            <ul className="space-y-2 text-[10px] font-black uppercase tracking-widest">
              <li><a href="https://data.gov.ph" className="hover:underline transition-all">GOV.PH</a></li>
              <li><a href="https://data.gov.ph" className="hover:underline transition-all">Open Data Portal</a></li>
              <li><a href="https://www.officialgazette.gov.ph" className="hover:underline transition-all">Official Gazette</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest border-b border-[#333333]/20 pb-2">Government Links</h4>
            <ul className="space-y-3 text-[10px] font-bold uppercase tracking-wider opacity-90">
              <li><a href="https://pco.gov.ph/" className="hover:underline transition-all">Office of the President</a></li>
              <li><a href="https://ovp.gov.ph" className="hover:underline transition-all">Office of the Vice President</a></li>
              <li><a href="https://senate.gov.ph" className="hover:underline transition-all">Senate of the Philippines</a></li>
              <li><a href="https://www.congress.gov.ph" className="hover:underline transition-all">House of Representatives</a></li>
              <li><a href="https://sc.judiciary.gov.ph" className="hover:underline transition-all">Supreme Court</a></li>
              <li><a href="https://ca.judiciary.gov.ph" className="hover:underline transition-all">Court of Appeals</a></li>
              <li><a href="https://sb.judiciary.gov.ph" className="hover:underline transition-all">Sandiganbayan</a></li>
            </ul>
          </div>

        </div>
      </footer>
    </div>
  );
}
