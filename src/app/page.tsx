"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PortalNavbar } from '@/components/layout/portal-navbar';
import { Button } from '@/components/ui/button';
import { 
  Megaphone,
  Clock,
  Loader2,
  ChevronRight,
  ShieldAlert,
  Users,
  Network
} from 'lucide-react';
import Image from 'next/image';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where, limit } from 'firebase/firestore';
import { format } from 'date-fns';

/**
 * UNIT LOGO REGISTRY
 */
const UNIT_LOGOS: Record<string, string> = {
  'dashboard': 'https://lh3.googleusercontent.com/d/1p_coBjDx6m9Ep3U5ZdYXUr9wNvwQVhLz',
  'SocMob & DPDS': 'https://lh3.googleusercontent.com/d/1dN-XYMHsfMgOOQC09B9ZuDmd-XHOB2Gl',
  'Planning & Research': 'https://lh3.googleusercontent.com/d/10FEdNokeQo07OYOWM_EJhEcGCfeh3fd7=s1000',
  'HRDD': 'https://lh3.googleusercontent.com/d/1y4TZtRRJcVJRSG0eN7vOfuGPZ0MlW00q=s1000',
  'Health': 'https://lh3.googleusercontent.com/d/13XJorf4FpwtxQKaYRbn3EOFpbkVLicY1=s1000',
  'DRRM': 'https://lh3.googleusercontent.com/d/1UawnaU8BaWtQRsCbb6mpJAlWtyT5CSY1',
  'Youth Formation': 'https://lh3.googleusercontent.com/d/1nLcO6Yvvoi7BnnYbl7JAsykuuuXnf5xY=s1000',
  'Learner Rights': 'https://lh3.googleusercontent.com/d/1XB9O4rXW_MwCVBBHTSJwlmisaogejyy2=s1000',
  'GAD': 'https://lh3.googleusercontent.com/d/1RKzWCEpo0PoMU8rPNmuxHMxMK23xnTAE'
};

export default function LandingPage() {
  const firestore = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Unified Broadcasts (All Users Only for Public Portal)
  const broadcastQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'broadcasts'),
      where('audience', '==', 'All Users'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
  }, [firestore]);

  const { data: broadcasts, isLoading: isBroadcastsLoading } = useCollection(broadcastQuery);

  // Helper for safe date formatting during SSR
  const formatSafeDate = (dateVal: any) => {
    if (!mounted) return '...';
    try {
      if (!dateVal) return 'Pending Update';
      const d = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
      if (isNaN(d.getTime())) return 'Archive Record';
      return format(d, 'MMMM dd, yyyy');
    } catch (e) {
      return 'Archive Record';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 overflow-x-hidden" suppressHydrationWarning>
      <PortalNavbar />

      {/* Hero Section - Optimized LCP Assets */}
      <section className="relative pt-32 pb-16 lg:pt-48 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://lh3.googleusercontent.com/d/1XRNl_QtNXELRx9AcK9-2AzizeDRYHyoI" 
            alt="Hero Background" 
            fill 
            sizes="100vw"
            className="object-cover opacity-50 blur-xs scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-80"></div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* HERO LOGO CONTAINER: Optimized for performance with priority tag */}
            <div className="relative w-full max-w-[90vw] md:max-w-4xl lg:max-w-5xl h-auto flex justify-center px-4">
              <div className="relative w-full aspect-[21/9] sm:aspect-[3/1] max-h-[50vh] transition-transform duration-700">
                <Image 
                  src="https://lh3.googleusercontent.com/d/1r5-ed_WkLE2L_QU6YFNX9nFdcn6uom_G" 
                  alt="KonekTayo! logo" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 90vw"
                  className="object-contain drop-shadow-[0_20px_50px_rgba(5,87,242,0.15)]"
                  priority
                />
              </div>
            </div>
            <p className="text-lg md:text-xl text-foreground font-bold max-w-2xl leading-relaxed">
              Administrative Leadership and Service Excellence for the Department of Education, Division of Davao del Sur
            </p>
          </div>
        </div>
      </section>

      {/* Functional Unit Strip - Performance Optimized Snap Scroll */}
      <section className="pb-0 relative z-10">
        <div className="max-w-full">
          <div className="flex items-center justify-start lg:justify-center gap-4 sm:gap-6 lg:gap-8 overflow-x-auto snap-x snap-mandatory py-6 px-6 bg-secondary/5 border-y border-border backdrop-blur-sm no-scrollbar">
            {Object.entries(UNIT_LOGOS).map(([unit, logo]) => {
              return (
                <Link 
                  key={unit} 
                  href={`/dashboard?unit=${unit}`}
                  className="shrink-0 transition-all duration-300 hover:scale-110 hover:brightness-110 active:scale-95 group snap-center"
                  title={`Enter ${unit}`}
                >
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-40 lg:h-40">
                    <Image 
                      src={logo} 
                      alt={`${unit} Logo`} 
                      fill 
                      sizes="(max-width: 768px) 96px, (max-width: 1024px) 112px, 160px"
                      className="object-contain"
                      unoptimized={logo.includes('googleusercontent')}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Communications Section */}
      <section className="py-16 sm:py-24 border-b border-border bg-background relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <div className="lg:col-span-4 space-y-8 sm:space-y-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20 text-accent">
                   <Megaphone size={20} className="animate-pulse" />
                   <span className="text-xs font-black uppercase tracking-widest">Division Updates</span>
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tighter">ANNOUNCEMENTS</h3>
                <p className="text-sm text-muted-foreground font-medium">Official updates for all personnel and stakeholders.</p> 
              </div> 

              <div className="space-y-4 max-h-[500px] sm:max-h-[600px] overflow-y-auto no-scrollbar pr-2 scroll-smooth">
                {isBroadcastsLoading ? (
                  <div className="py-10 flex flex-col items-center gap-4 opacity-40">
                    <Loader2 className="animate-spin text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Loading updates...</span>
                  </div>
                ) : broadcasts && broadcasts.length > 0 ? (
                  broadcasts.map((b) => (
                    <div key={b.id} className="p-6 rounded-[2rem] bg-secondary/10 border border-border/50 hover:border-accent/40 transition-all group cursor-default">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-foreground text-sm uppercase group-hover:text-accent transition-colors">{b.title}</h4>
                        <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-primary/10 text-primary rounded-full">{b.audience}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4 font-medium">{b.message}</p>
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase text-muted-foreground/60">
                         <Clock size={10} />
                         <span>{formatSafeDate(b.createdAt)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center border-2 border-dashed border-border rounded-[2.5rem] opacity-30">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">No new announcements</p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-8 flex justify-center items-center relative py-12">
               <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
                  <span className="text-[25vw] font-black tracking-tighter leading-none">SGOD</span>
               </div>
               
               <div className="relative w-full max-w-2xl flex flex-col items-center group px-4">
                  <div className="relative w-full aspect-[2/1] transition-transform duration-700 group-hover:scale-[1.02]">
                    <Image 
                      src="https://lh3.googleusercontent.com/d/1p_coBjDx6m9Ep3U5ZdYXUr9wNvwQVhLz" 
                      alt="SGOD Logo" 
                      fill 
                      sizes="(max-width: 1024px) 100vw, 800px"
                      className="object-contain drop-shadow-[0_20px_50px_rgba(5,87,242,0.15)]"
                    />
                  </div>
                  <div className="mt-8 text-center space-y-2">
                    <div className="h-1.5 w-24 bg-accent/20 rounded-full mx-auto mb-6"></div>
                    <span className="text-[10px] font-black text-accent uppercase tracking-[0.6em] ml-2 block">Davao del Sur</span>
                    <h4 className="text-xl font-black uppercase tracking-[0.1em] text-primary/40">Division Office</h4>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </section>
      
      {/* Organizational Structure Section */}
      <section className="py-16 sm:py-24 bg-secondary/5 border-b border-border overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="bg-white rounded-[3rem] shadow-3xl overflow-hidden border border-border p-4 sm:p-8 lg:p-12 relative min-h-[300px]">
            <div 
              className="relative w-full bg-white flex items-center justify-center overflow-x-auto no-scrollbar" 
              style={{ aspectRatio: '3200 / 2400' }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-[0.05] pointer-events-none p-20 text-center">
                 <Network size={240} className="mb-8" />
                 <p className="text-2xl sm:text-4xl font-black uppercase tracking-[0.5em]">Organizational Chart</p>
              </div>

              <Image 
                src="https://lh3.googleusercontent.com/d/12mzVNIi_Wzi6rm9vgJTSVZIgxMRGDfIH=s2000" 
                alt="Organizational Chart" 
                fill 
                sizes="100vw"
                className="object-contain relative z-10"
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-border bg-secondary/10 px-6">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative overflow-hidden flex items-center justify-center bg-transparent">
              {mounted ? (
                <Image 
                  src="https://lh3.googleusercontent.com/d/1QXsfZ7FFEP-jPWJ_alLasGR5oD1LYNhw" 
                  alt="Division Logo" 
                  fill 
                  sizes="40px"
                  className="object-contain"
                />
              ) : null}
            </div>
            <span className="text-sm font-black uppercase tracking-widest">SGOD One-Stop Service Portal</span>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">
            © 2026 DepEd Davao del Sur • Administrative Services
          </p>
          <div className="flex items-center gap-6">
            <Link href="https://privacy.gov.ph/data-privacy-act/" className="text-[10px] font-black uppercase text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
