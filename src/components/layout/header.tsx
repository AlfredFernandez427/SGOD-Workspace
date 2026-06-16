"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Moon, 
  Sun, 
  Menu, 
  LayoutDashboard, 
  ShieldCheck, 
  LogIn, 
  Circle,
  Home,
  User as UserIcon,
  Camera,
  Save,
  Loader2,
  Maximize2,
  Move
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFirestore, useUser, useMemoFirebase, useDoc, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NotificationsDropdown } from './notifications-dropdown';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
  isAdminView?: boolean;
  onToggleView?: () => void;
  onShowLogin?: () => void;
}

export function Header({ onOpenMobileMenu, isAdminView, onToggleView, onShowLogin }: HeaderProps) {
  const [isDark, setIsDark] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [cropScale, setCropScale] = useState(1);
  const [cropPos, setCropPos] = useState({ x: 0, y: 0 });
  const [isCropping, setIsCropping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const profileRef = useMemoFirebase(() => {
    if (!user || !firestore || user.isAnonymous) return null;
    return doc(firestore, 'user_profiles', user.uid);
  }, [user, firestore]);
  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setIsCropping(true);
        setCropScale(1);
        setCropPos({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isCropping) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStart.current = { x: clientX - cropPos.x, y: clientY - cropPos.y };
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !isCropping) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setCropPos({
      x: clientX - dragStart.current.x,
      y: clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleUpdateProfile = async () => {
    if (!firestore || !user || !tempImage) return;
    setIsUpdatingProfile(true);

    try {
      const normX = cropPos.x / 256;
      const normY = cropPos.y / 256;

      updateDocumentNonBlocking(doc(firestore, 'user_profiles', user.uid), {
        profilePicture: tempImage,
        profileScale: cropScale,
        profilePosX: normX,
        profilePosY: normY, 
        updatedAt: new Date().toISOString()
      });
      toast({ title: "Registry Synchronized" });
      setIsProfileModalOpen(false);
      setIsCropping(false);
      setTempImage(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Registry Update Failed" });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const displayName = profile ? `${profile.firstName} ${profile.lastName}` : (user?.displayName || user?.email || 'User');
  const displayRole = profile?.role || 'Personnel';
  const canSwitch = profile?.role === 'Admin' || profile?.role === 'SGOD Chief' || profile?.isAdmin || profile?.isOwner;
  const isGuest = user?.isAnonymous || !user;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Duty': return 'text-emerald-500';
      case 'On Leave': return 'text-destructive';
      case 'On Official Business': return 'text-amber-500';
      case 'Absent': return 'text-muted-foreground';
      default: return 'text-emerald-500';
    }
  };

  const renderPfpStyle = (containerSize: number) => {
    if (!profile?.profilePicture) return undefined;
    const posX = (profile.profilePosX || 0) * containerSize;
    const posY = (profile.profilePosY || 0) * containerSize;
    const scale = profile.profileScale || 1;
    return {
      transform: `translate(${posX}px, ${posY}px) scale(${scale})`,
      transformOrigin: 'center center',
      objectFit: 'cover' as const,
    };
  };

  return (
    <>
      <header className="h-20 flex items-center justify-between px-4 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-40 w-full transition-all">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
           <Button 
             variant="ghost" 
             size="icon" 
             onClick={onOpenMobileMenu} 
             className="md:hidden lg:hidden h-10 w-10 text-muted-foreground hover:text-foreground shrink-0"
           >
             <Menu size={24} />
           </Button>
           <div className="flex flex-col min-w-0">
             <div className="flex items-center gap-2">
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate hidden xs:inline">Davao del Sur</span>
               {firestore && (
                 <Badge variant="outline" className="h-4 px-1.5 border-emerald-500/50 text-emerald-500 bg-emerald-500/5 flex items-center gap-1 shrink-0">
                   <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                   <span className="text-[8px] font-black uppercase">Live</span>
                 </Badge>
               )}
             </div>
             <span className="text-xs sm:text-sm md:text-lg font-black text-foreground tracking-tight truncate uppercase">
               SGOD <span className="text-accent hidden sm:inline">Portal</span>
             </span>
           </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 shrink-0">
          <div className="flex items-center gap-1 sm:gap-4 lg:border-l lg:border-border lg:pl-6">
             <Button asChild variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10 rounded-xl text-muted-foreground hover:text-primary transition-all hidden md:flex">
               <Link href="/"><Home size={18} /></Link>
             </Button>

             {!isGuest && (
               <div className="h-9 px-2 md:h-10 md:px-3 flex items-center gap-2 bg-secondary/30 rounded-xl border border-border/50 shrink-0">
                 <Circle className={cn("w-2 h-2 md:w-2.5 md:h-2.5 fill-current", getStatusColor(profile?.status || 'On Duty'))} />
                 <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest hidden xl:block text-foreground/70">
                   {profile?.status || 'On Duty'}
                 </span>
               </div>
             )}

             {canSwitch && onToggleView && (
               <Button 
                 onClick={onToggleView}
                 variant="outline"
                 className={cn(
                   "h-9 px-2 md:h-10 md:px-4 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shrink-0",
                   isAdminView 
                     ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20" 
                     : "bg-secondary/50 text-foreground hover:bg-primary/10 hover:text-primary"
                 )}
               >
                 {isAdminView ? <LayoutDashboard size={14} /> : <ShieldCheck size={14} />}
                 <span className="hidden sm:inline">{isAdminView ? "Personnel" : "Admin"}</span>
               </Button>
             )}

             <div className="flex items-center gap-1">
               <button 
                 onClick={toggleTheme}
                 className="p-1.5 md:p-2 text-muted-foreground hover:text-foreground transition-colors bg-secondary/30 rounded-full flex items-center justify-center w-8 h-8 md:w-9 md:h-9"
               >
                 {isDark ? <Sun size={14} className="md:size-4" /> : <Moon size={14} className="md:size-4" />}
               </button>
               {!isGuest && <NotificationsDropdown />}
             </div>
             
             <div className="flex items-center gap-2 ml-1 md:ml-2">
               {isGuest ? (
                 <Button 
                   onClick={onShowLogin}
                   className="h-9 px-3 md:h-10 md:px-4 bg-primary text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hidden sm:flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg"
                 >
                   <LogIn size={14} />
                   <span className="hidden lg:inline">Sign In</span>
                 </Button>
               ) : (
                 <div className="text-right hidden xl:block">
                   <p className="text-xs font-bold text-foreground leading-none truncate max-w-[100px]">{displayName}</p>
                   <p className="text-[9px] text-primary font-black uppercase tracking-widest mt-1 truncate">{displayRole}</p>
                 </div>
               )}
               <Avatar 
                 className="h-8 w-8 md:h-10 md:w-10 ring-2 ring-primary/20 ring-offset-2 ring-offset-background cursor-pointer hover:ring-primary transition-all overflow-hidden" 
                 onClick={isGuest ? onShowLogin : () => setIsProfileModalOpen(true)}
               >
                 <AvatarImage 
                    src={profile?.profilePicture || `https://picsum.photos/seed/${user?.uid}/100`} 
                    style={renderPfpStyle(40)}
                 />
                 <AvatarFallback className="bg-primary/20 text-primary font-bold text-[10px] md:text-xs uppercase">
                   {profile?.firstName?.[0] || 'U'}
                 </AvatarFallback>
               </Avatar>
             </div>
          </div>
        </div>
      </header>

      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl p-0 overflow-hidden rounded-[2rem] w-[95vw]">
          <DialogHeader className="p-8 border-b border-border bg-secondary/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {isCropping ? <Maximize2 size={24} /> : <UserIcon size={24} />}
              </div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                  {isCropping ? "Refine Personnel Photo" : "Personnel Profile"}
                </DialogTitle>
                <DialogDescription className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
                  {isCropping ? "Drag to position & scale to zoom" : "Manage your SGOD workspace visual identity."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-8 flex flex-col items-center gap-8">
             {isCropping ? (
               <div className="w-full space-y-8 animate-in fade-in zoom-in-95 duration-300">
                  <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto rounded-full overflow-hidden bg-secondary border-4 border-primary/20 shadow-inner cursor-move touch-none"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={handleMouseUp}
                  >
                     <div 
                       className="absolute inset-0 flex items-center justify-center pointer-events-none"
                       style={{ 
                         transform: `translate(${cropPos.x}px, ${cropPos.y}px) scale(${cropScale})`,
                         transformOrigin: 'center center'
                       }}
                     >
                        <img src={tempImage!} alt="Crop preview" className="max-w-none w-full h-full object-cover" draggable={false} />
                     </div>
                     <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/10">
                        <Move size={24} className="text-white/40" />
                     </div>
                  </div>
                  
                  <div className="space-y-4 px-4">
                     <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <span>Zoom Scale</span>
                        <span className="text-primary">{Math.round(cropScale * 100)}%</span>
                     </div>
                     <Slider 
                       value={[cropScale]} 
                       min={1} 
                       max={4} 
                       step={0.01} 
                       onValueChange={(v) => setCropScale(v[0])} 
                       className="w-full"
                     />
                  </div>
               </div>
             ) : (
               <>
                 <div className="relative group">
                    <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-4 border-background shadow-2xl overflow-hidden">
                       <AvatarImage 
                         src={profile?.profilePicture || `https://picsum.photos/seed/${user?.uid}/100`} 
                         style={renderPfpStyle(128)}
                       />
                       <AvatarFallback className="text-2xl font-black">{profile?.firstName?.[0]}</AvatarFallback>
                    </Avatar>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary text-white flex items-center justify-center border-4 border-background shadow-lg hover:scale-110 transition-transform"
                    >
                       <Camera size={16} />
                    </button>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleImageSelect}
                    />
                 </div>

                 <div className="w-full space-y-4 text-center">
                    <div className="space-y-1">
                       <p className="text-xl font-black text-foreground">{displayName}</p>
                       <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{profile?.position}</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                       <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black uppercase text-[9px] md:text-[10px]">{profile?.unitId}</Badge>
                       <Badge variant="outline" className="bg-secondary/50 text-foreground border-border font-black uppercase text-[9px] md:text-[10px]">{profile?.role}</Badge>
                    </div>
                 </div>

                 <div className="w-full p-4 rounded-xl bg-secondary/20 border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className={cn("w-2.5 h-2.5 rounded-full fill-current", getStatusColor(profile?.status || 'On Duty'))} />
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registry Status</span>
                    </div>
                    <span className="text-xs font-bold text-foreground">{profile?.status || 'On Duty'}</span>
                 </div>
               </>
             )}
          </div>

          <DialogFooter className="p-8 border-t border-border bg-secondary/10 flex flex-col sm:flex-row gap-3">
             <Button 
               variant="outline" 
               onClick={() => {
                 if (isCropping) {
                   setIsCropping(false);
                   setTempImage(null);
                 } else {
                   setIsProfileModalOpen(false);
                 }
               }}
               className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest w-full sm:w-auto"
             >
               {isCropping ? "Cancel" : "Dismiss"}
             </Button>
             {isCropping ? (
               <Button 
                 onClick={handleUpdateProfile}
                 disabled={isUpdatingProfile}
                 className="flex-1 h-12 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 w-full sm:w-auto"
               >
                 {isUpdatingProfile ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} className="mr-2" /> Save Photo</>}
               </Button>
             ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
