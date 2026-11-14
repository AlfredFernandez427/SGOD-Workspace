"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Menu, 
  ChevronDown, 
  LayoutDashboard,
  Sun,
  Moon,
  LogIn,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

const EXTERNAL_PORTALS: Record<string, string> = {
  'HRDD': 'https://sites.google.com/view/learninganddevelopmentportal/home',
  'DRRM': 'https://drrm.sdodavsur.com',
  'Sports': 'https://sports.sdodavsur.com'
  
};

export function PortalNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { 
      label: 'About US', 
      items: [
        { label: 'DepEd Data Privacy Act', href: 'https://privacy.gov.ph/data-privacy-act/' },
      ]
    },
    { 
      label: 'Functional Units & Services', 
      items: [
        { label: 'SMME Monitoring', href: '/dashboard?unit=SMME' },
        { label: 'Education Facilities', href: '/dashboard?unit=Education Facilities' },
        { label: 'SocMob & DPDS', href: '/dashboard?unit=SocMob & DPDS' },
        { label: 'Planning & Research', href: '/dashboard?unit=Planning & Research' },
        { label: 'Human Resources & Devt.', href: '/dashboard?unit=HRDD' },
        { label: 'Health & Nutrition', href: '/dashboard?unit=Health' },
        { label: 'Disaster Risk Reduction Mgt.', href: '/dashboard?unit=DRRM' },
        { label: 'Youth Formation', href: '/dashboard?unit=Youth Formation' },
        { label: 'Learner Rights', href: '/dashboard?unit=Learner Rights' },
        { label: 'Sports', href: '/dashboard?unit=Sports' },
        { label: 'Gender & Devt.', href: '/dashboard?unit=GAD' },
      ]
    },
  ];

  const handleDropdownItemClick = (href: string) => {
    const unitId = href.split('unit=')[1];
    if (unitId && EXTERNAL_PORTALS[unitId]) {
      window.open(EXTERNAL_PORTALS[unitId], '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 sm:px-10 flex items-center",
      isScrolled 
        ? "h-20 bg-primary border-b border-primary/20 shadow-xl" 
        : "h-32 bg-transparent"
    )}>
      <div className="max-w-[1440px] mx-auto w-full flex items-center justify-between">
        
        {/* LOGO SECTION */}
        <div className="flex-1 flex justify-start items-center">
          <Link href="/" className="flex items-center gap-2 sm:gap-4 group transition-transform hover:scale-[1.02]">
            <div className="relative w-32 sm:w-40 h-8 sm:h-10 flex items-center justify-start shrink-0">
              {!logoError ? (
                <Image 
                  src="https://lh3.googleusercontent.com/d/1p_coBjDx6m9Ep3U5ZdYXUr9wNvwQVhLz" 
                  alt="SGOD Logo" 
                  fill 
                  sizes="160px"
                  className={cn(
                    "object-contain object-left transition-all duration-500",
                    isScrolled && "brightness-0 invert"
                  )} 
                  onError={() => setLogoError(true)}
                  priority
                />
              ) : (
                <span className={cn(
                  "font-black text-lg sm:text-xl tracking-tighter transition-colors",
                  isScrolled ? "text-white" : "text-primary"
                )}>SGOD</span>
              )}
            </div>
          </Link>
        </div>

        {/* DESKTOP NAV (Center) */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-8">
          {navLinks.map((link) => (
            <div key={link.label}>
              {link.items ? (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className={cn(
                    "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors outline-none group h-10",
                    isScrolled 
                      ? "text-white/80 hover:text-white" 
                      : "text-foreground/70 hover:text-primary"
                  )}>
                    {link.label} 
                    <ChevronDown size={12} className={cn("opacity-40 group-data-[state=open]:rotate-180 transition-transform", isScrolled && "text-white")} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-2 bg-card border-border rounded-xl shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200">
                    {link.items.map((item) => (
                      <DropdownMenuItem 
                        key={item.label} 
                        asChild 
                        className="p-3 rounded-lg focus:bg-primary/5 focus:text-primary cursor-pointer"
                        onClick={() => handleDropdownItemClick(item.href)}
                      >
                        <Link 
                          href={item.href} 
                          className="text-[10px] font-black uppercase tracking-widest w-full"
                        >
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href={link.href} className={cn(
                  "flex items-center text-[10px] font-black uppercase tracking-widest transition-colors h-10",
                  isScrolled 
                    ? "text-white/80 hover:text-white" 
                    : "text-foreground/70 hover:text-primary"
                )}>
                  {link.label}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* ACTIONS SECTION (Right) */}
        <div className="flex-1 flex justify-end items-center gap-2 sm:gap-4">
          <button 
            onClick={toggleTheme}
            className={cn(
              "p-2 transition-colors rounded-xl h-10 w-10 hidden sm:flex items-center justify-center",
              isScrolled 
                ? "bg-white/10 text-white hover:bg-white/20" 
                : "bg-secondary/50 text-muted-foreground hover:text-foreground"
            )}
            title="Toggle Night Mode"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Optimized Workspace Button for all sizes */}
          <Button asChild className={cn(
            "h-10 sm:h-12 px-4 sm:px-8 rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] shadow-xl transition-all flex group relative overflow-hidden shrink-0",
            isScrolled 
              ? "bg-accent text-white hover:bg-accent/90" 
              : "bg-primary text-white shadow-primary/20 hover:scale-[1.02]"
          )}>
            <Link href="/dashboard">
              <LayoutDashboard size={14} className="mr-1.5 sm:mr-2" />
              <span>{user ? "Workspace" : "Enter Portal"}</span>
              <ArrowRight size={14} className="ml-2 hidden sm:block opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          </Button>
          
          <Sheet modal={false}>
            <SheetTrigger asChild>
              <button className={cn(
                "p-2 transition-colors rounded-xl h-10 w-10 flex items-center justify-center",
                isScrolled 
                  ? "bg-white/10 text-white hover:bg-white/20" 
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground",
                "lg:hidden"
              )}>
                <Menu size={20} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] bg-background p-0 border-l border-border flex flex-col">
              <ScrollArea className="flex-1">
                <div className="p-10 flex flex-col gap-12">
                  <div>
                    <SheetTitle className="text-2xl font-black uppercase tracking-tight text-primary">SGOD Navigation</SheetTitle>
                    <SheetDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">Operational Portal Menu</SheetDescription>
                  </div>
                  
                  <div className="flex flex-col gap-8">
                    <button 
                      onClick={toggleTheme}
                      className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 text-foreground hover:bg-primary/10 transition-colors"
                    >
                      {isDark ? <Sun size={20} /> : <Moon size={20} />}
                      <span className="text-sm font-black uppercase tracking-widest">
                        {isDark ? 'Light Mode' : 'Night Mode'}
                      </span>
                    </button>

                    {navLinks.map((link) => (
                      <div key={link.label} className="space-y-4">
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] block border-b border-border pb-2">{link.label}</span>
                        <div className="flex flex-col gap-4 pl-4">
                          {link.items ? (
                            link.items.map((item) => (
                              <Link 
                                key={item.label} 
                                href={item.href} 
                                onClick={() => handleDropdownItemClick(item.href)}
                                className="text-lg font-bold text-foreground hover:text-primary transition-colors"
                              >
                                {item.label}
                              </Link>
                            ))
                          ) : (
                            <Link href={link.href} className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                              {link.label}
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>

              <div className="p-10 border-t border-border bg-secondary/5 shrink-0">
                 <Button asChild className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-3">
                   <Link href="/dashboard">
                     <LayoutDashboard size={18} />
                     {user ? "Launch Workspace" : "Enter Portal"}
                   </Link>
                 </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
