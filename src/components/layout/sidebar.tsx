
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  Users, 
  BarChart3, 
  GraduationCap, 
  HeartPulse, 
  LogOut,
  ChevronLeft,
  Menu,
  Shield,
  Sparkles,
  Trophy,
  Scale,
  Construction,
  ShieldAlert,
  Home,
  ShieldCheck,
  TrendingUp,
  ChevronRight,
  LogIn
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { doc } from 'firebase/firestore';

const EXTERNAL_PORTALS: Record<string, string> = {
  'HRDD': 'https://sites.google.com/view/learninganddevelopmentportal/home',
  'DRRM': 'https://drrm.sdodavsur.com'
  'Sports': 'https://sports.sdodavsur.com'
};

interface SidebarProps {
  activeSection: string;
  setActiveSection: (id: string) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  globalConfig?: any;
  onShowLogin?: () => void;
}

function SidebarContent({ 
  activeSection, setActiveSection, isExpanded, isMobile = false, setIsMobileMenuOpen, handleSignOut, globalConfig, onShowLogin
}: { 
  activeSection: string; setActiveSection: (id: string) => void; isExpanded: boolean; isMobile?: boolean; 
  setIsMobileMenuOpen?: (open: boolean) => void; handleSignOut: () => void; globalConfig?: any; onShowLogin?: () => void;
}) {
  const [logoError, setLogoError] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const isGuest = user?.isAnonymous || !user;

  const profileRef = useMemoFirebase(() => {
    if (!user || !firestore || user.isAnonymous) return null;
    return doc(firestore, 'user_profiles', user.uid);
  }, [user, firestore]);
  const { data: profile } = useDoc(profileRef);

  const isVerifiedStaff = profile?.isActive === true || user?.email === 'admin@admin.com';
  const showPerformance = isVerifiedStaff && profile?.unitId !== 'SGOD' && user?.email !== 'admin@admin.com';

  const navItems = [
    { id: 'SMME', label: 'SMME Monitoring', icon: ClipboardCheck },
    { id: 'Education Facilities', label: 'Education Facilities', icon: Construction },
    { id: 'SocMob & DPDS', label: 'Social Mobilization', icon: Users },
    { id: 'Planning & Research', label: 'Planning & Research', icon: BarChart3 },
    { id: 'HRDD', label: 'HR & Development', icon: GraduationCap },
    { id: 'Health', label: 'Health & Nutrition', icon: HeartPulse },
    { id: 'DRRM', label: 'DRRMC Portal', icon: Shield },
    { id: 'Youth Formation', label: 'Youth Formation', icon: Sparkles },
    { id: 'Learner Rights', label: 'Learner Rights', icon: Scale },
    { id: 'Sports', label: 'Sports', icon: Trophy },
    { id: 'GAD', label: 'Gender & Devt.', icon: Scale },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    if (EXTERNAL_PORTALS[id]) {
      window.open(EXTERNAL_PORTALS[id], '_blank', 'noopener,noreferrer');
    }
    if (isMobile && setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleInternalSignIn = () => {
    if (onShowLogin) onShowLogin();
    if (isMobile && setIsMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      <div className={cn(
        "flex flex-col items-center justify-center border-b border-sidebar-border transition-all duration-300 shrink-0 relative",
        (isExpanded || isMobile) ? "h-48 px-4" : "h-24 px-2"
      )}>
        {(isExpanded || isMobile) ? (
          <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative w-48 h-12 flex items-center justify-center shrink-0">
              {!logoError ? (
                <Image 
                  src="https://lh3.googleusercontent.com/d/1p_coBjDx6m9Ep3U5ZdYXUr9wNvwQVhLz" 
                  alt="SGOD Logo" 
                  fill 
                  sizes="100vw"
                  className="object-contain" 
                  onError={() => setLogoError(true)} 
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary font-black text-2xl tracking-tighter">SGOD</div>
              )}
            </div>
            <div className="text-center mt-1">
              <span className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em]">One-Stop Portal</span>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              {!logoError ? (
                <Image 
                  src="https://lh3.googleusercontent.com/d/1p_coBjDx6m9Ep3U5ZdYXUr9wNvwQVhLz" 
                  alt="SGOD Logo" 
                  fill 
                  sizes="100vw"
                  className="object-contain" 
                  onError={() => setLogoError(true)} 
                />
              ) : (
                <div className="text-primary font-black text-[12px]">SD</div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <nav className="flex-1 p-4 space-y-1 mt-4 overflow-y-auto no-scrollbar">
        <SidebarNavItem active={false} onClick={() => {}} icon={Home} label="Back to Portal" expanded={isExpanded || isMobile} isHomeLink />
        <SidebarNavItem 
          active={activeSection === 'dashboard'} 
          onClick={() => handleNavClick('dashboard')} 
          icon={LayoutDashboard} 
          label="Dashboard" 
          expanded={isExpanded || isMobile} 
        />
        
        {showPerformance && (
          <SidebarNavItem 
            active={activeSection === 'performance'} 
            onClick={() => handleNavClick('performance')} 
            icon={TrendingUp} 
            label="Performance" 
            expanded={isExpanded || isMobile} 
          />
        )}

        <div className={cn("px-4 pt-8 pb-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest transition-opacity", (!isExpanded && !isMobile) ? "opacity-0" : "opacity-100")}>Functional Units</div>
        {navItems.map((item) => (
          <SidebarNavItem 
            key={item.id} 
            active={activeSection === item.id} 
            onClick={() => handleNavClick(item.id)} 
            icon={item.icon} 
            label={item.label} 
            expanded={isExpanded || isMobile} 
          />
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border shrink-0">
        {isGuest ? (
          <Button 
            onClick={handleInternalSignIn} 
            className={cn("w-full justify-start bg-primary text-white px-3 h-12 rounded-xl shadow-lg", (!isExpanded && !isMobile) && "justify-center")}
          >
            <LogIn size={20} className="shrink-0" />
            {(isExpanded || isMobile) && <span className="ml-4 font-black uppercase text-[10px] tracking-widest">Sign In</span>}
          </Button>
        ) : (
          <Button variant="ghost" onClick={handleSignOut} className={cn("w-full justify-start text-muted-foreground hover:bg-secondary hover:text-foreground px-3 h-12 rounded-xl", (!isExpanded && !isMobile) && "justify-center")}>
            <LogOut size={20} className="shrink-0" />
            {(isExpanded || isMobile) && <span className="ml-4 font-semibold text-[15px]">Sign Out</span>}
          </Button>
        )}
      </div>
    </div>
  );
}

export function Sidebar({ 
  activeSection, setActiveSection, isExpanded, setIsExpanded, isMobileMenuOpen, setIsMobileMenuOpen, globalConfig, onShowLogin
}: SidebarProps) {
  const auth = useAuth();
  const handleSignOut = () => { if (auth) signOut(auth); };

  return (
    <>
      <aside className={cn("fixed left-0 top-0 h-screen z-50 hidden md:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 shadow-2xl", isExpanded ? "w-64" : "w-24")}>
        <SidebarContent activeSection={activeSection} setActiveSection={setActiveSection} isExpanded={isExpanded} handleSignOut={handleSignOut} globalConfig={globalConfig} onShowLogin={onShowLogin} />
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="absolute top-10 -right-4 h-8 w-8 bg-accent text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all z-[60] border-2 border-sidebar"
        >
          {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </aside>
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-sidebar border-r border-sidebar-border">
          <SidebarContent isMobile activeSection={activeSection} setActiveSection={setActiveSection} isExpanded={isExpanded} setIsMobileMenuOpen={setIsMobileMenuOpen} handleSignOut={handleSignOut} globalConfig={globalConfig} onShowLogin={onShowLogin} />
        </SheetContent>
      </Sheet>
    </>
  );
}

function SidebarNavItem({ active, onClick, icon: Icon, label, expanded, isHomeLink }: { active: boolean, onClick: () => void, icon: any, label: string, expanded: boolean, isHomeLink?: boolean }) {
  if (isHomeLink) {
    return (
      <Link href="/" className={cn("w-full flex items-center h-12 px-4 rounded-xl transition-all duration-200 group relative text-muted-foreground hover:bg-secondary hover:text-foreground")}>
        <Icon size={20} className="shrink-0" />
        {expanded && <span className="ml-4 text-[15px] font-semibold truncate">{label}</span>}
      </Link>
    );
  }

  return (
    <button 
      onClick={onClick} 
      className={cn(
        "w-full flex items-center h-12 px-4 rounded-xl transition-all duration-200 group relative", 
        active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      <Icon size={20} className={cn("shrink-0", active && "text-white")} />
      {expanded && <span className={cn("ml-4 text-[15px] font-semibold truncate", active ? "text-white" : "text-inherit")}>{label}</span>}
      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.4)]" />}
    </button>
  );
}
