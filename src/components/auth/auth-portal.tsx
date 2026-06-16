"use client";

import React, { useState, useEffect } from 'react';
import { 
  Loader2, 
  Lock, 
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  useFirestore, 
  useUser, 
  useAuth, 
  setDocumentNonBlocking, 
  initiateAnonymousSignIn,
  initiatePasswordReset
} from '@/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  EmailAuthProvider, 
  linkWithCredential 
} from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { UNITS } from '@/lib/constants';

export function AuthPortal({ onAuthenticated }: { onAuthenticated: () => void }) {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [loginIdentifier, setLoginIdentifier] = useState(''); // Email or DepEd ID
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMode, setLoginMode] = useState<'login' | 'register' | 'pending'>('login');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const [regForm, setRegForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    position: '',
    email: '',
    password: '',
    confirmPassword: '',
    unitId: '',
    employeeId: '', 
    phoneNumber: '' 
  });

  useEffect(() => {
    const savedLockout = localStorage.getItem('sgod_lockout_time');
    if (savedLockout) {
      const time = parseInt(savedLockout, 10);
      if (time > Date.now()) {
        setLockoutTime(time);
        setCountdown(Math.ceil((time - Date.now()) / 1000));
      } else {
        localStorage.removeItem('sgod_lockout_time');
      }
    }
  }, []);

  useEffect(() => {
    if (lockoutTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        if (now >= lockoutTime) {
          setLockoutTime(null);
          setCountdown(0);
          setFailedAttempts(0);
          localStorage.removeItem('sgod_lockout_time');
          clearInterval(interval);
        } else {
          setCountdown(Math.ceil((lockoutTime - now) / 1000));
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTime]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;

    if (loginMode === 'login' && countdown > 0) {
      toast({ variant: "destructive", title: "Access Suspended", description: `Security lockout active. Please wait ${countdown} seconds.` });
      return;
    }

    setIsLoggingIn(true);

    if (loginMode === 'register') {
      if (regForm.password !== regForm.confirmPassword) {
        toast({ variant: "destructive", title: "Validation Error", description: "Passwords do not match." });
        setIsLoggingIn(false);
        return;
      }

      if (regForm.employeeId.length !== 7 || !/^\d+$/.test(regForm.employeeId)) {
        toast({ variant: "destructive", title: "Validation Error", description: "DepEd ID must be exactly 7 digits." });
        setIsLoggingIn(false);
        return;
      }

      if (regForm.phoneNumber.length !== 11 || !/^\d+$/.test(regForm.phoneNumber)) {
        toast({ variant: "destructive", title: "Validation Error", description: "Phone number must be exactly 11 digits." });
        setIsLoggingIn(false);
        return;
      }
      
      try {
        let uid = '';
        if (user && user.isAnonymous) {
          const credential = EmailAuthProvider.credential(regForm.email, regForm.password);
          const result = await linkWithCredential(user, credential);
          uid = result.user.uid;
        } else {
          const userCredential = await createUserWithEmailAndPassword(auth, regForm.email, regForm.password);
          uid = userCredential.user.uid;
        }
        
        const isBootstrapAdmin = regForm.email.toLowerCase() === 'admin@admin.com' || regForm.unitId === 'SGOD';

        await setDocumentNonBlocking(doc(firestore, 'user_profiles', uid), {
          id: uid,
          firstName: regForm.firstName,
          middleName: regForm.middleName,
          lastName: regForm.lastName,
          suffix: regForm.suffix,
          position: regForm.position,
          email: regForm.email,
          unitId: regForm.unitId,
          employeeId: regForm.employeeId,
          phoneNumber: regForm.phoneNumber,
          role: isBootstrapAdmin ? 'Admin' : 'Staff',
          isAdmin: isBootstrapAdmin,
          isActive: isBootstrapAdmin,
          status: 'On Duty',
          createdAt: new Date().toISOString()
        }, { merge: true });
        
        setIsLoggingIn(false);
        if (isBootstrapAdmin) {
          toast({ title: "Administrative Link Established" });
          onAuthenticated();
        } else {
          setLoginMode('pending');
        }
      } catch (err: any) {
        setIsLoggingIn(false);
        toast({ variant: "destructive", title: "Registry Error", description: err.message });
      }
    } else {
      try {
        let targetEmail = loginIdentifier;

        if (loginIdentifier.length === 7 && /^\d+$/.test(loginIdentifier)) {
          const q = query(
            collection(firestore, 'user_profiles'), 
            where('employeeId', '==', loginIdentifier),
            limit(1)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            targetEmail = querySnapshot.docs[0].data().email;
          } else {
            throw new Error("DepEd ID not found in registry.");
          }
        }

        await signInWithEmailAndPassword(auth, targetEmail, loginPassword);
        
        setFailedAttempts(0);
        toast({ title: "Welcome Back" });
        onAuthenticated();
      } catch (err: any) {
        setIsLoggingIn(false);
        const newFailedCount = failedAttempts + 1;
        setFailedAttempts(newFailedCount);

        if (newFailedCount >= 3) {
          const unlockAt = Date.now() + 120000;
          setLockoutTime(unlockAt);
          setCountdown(120);
          localStorage.setItem('sgod_lockout_time', unlockAt.toString());
          toast({ variant: "destructive", title: "Access Suspended", description: "Security lockout active for 2 minutes." });
        } else {
          toast({ variant: "destructive", title: "Auth Error", description: err.message || `Invalid credentials. ${3 - newFailedCount} attempts remaining.` });
        }
      }
    }
  };

  const handlePasswordReset = () => {
    if (!auth || !loginIdentifier || !loginIdentifier.includes('@')) {
      toast({ variant: "destructive", title: "Protocol Error", description: "Please enter your registered email address to initiate reset." });
      return;
    }
    initiatePasswordReset(auth, loginIdentifier, (err) => {
      if (err) {
        toast({ variant: "destructive", title: "Reset Error", description: err.message });
      } else {
        toast({ title: "Intelligence Dispatched", description: "Password reset instructions sent to your email." });
      }
    });
  };

  const handleGuestLogin = () => {
    if (!auth) return;
    setIsLoggingIn(true);
    initiateAnonymousSignIn(
      auth, 
      () => {
        setIsLoggingIn(false);
        onAuthenticated();
      },
      (err) => {
        setIsLoggingIn(false);
        toast({ variant: "destructive", title: "Guest Access Error", description: "Failed to establish anonymous session." });
      }
    );
  };

  if (loginMode === 'pending') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-white/20 shadow-2xl bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-10 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="text-amber-500" size={40} />
          </div>
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase tracking-tight text-center">Pending Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center font-medium text-muted-foreground leading-relaxed">
              Your credentials have been submitted. An administrator will verify your profile shortly. Please wait or refresh this page.
            </p>
          </CardContent>
          <CardFooter className="mt-10 flex flex-col gap-4">
            <Button onClick={() => window.location.reload()} className="w-full h-14 bg-primary text-white font-black uppercase rounded-xl">Check Status</Button>
            <Button variant="ghost" onClick={() => setLoginMode('login')} className="w-full text-[10px] font-black uppercase text-muted-foreground">Return to Login</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 overflow-y-auto">
      <Card className={cn("w-full border-white/20 shadow-2xl bg-white/70 backdrop-blur-xl transition-all duration-500 rounded-[2.5rem]", loginMode === 'register' ? 'max-w-4xl my-10' : 'max-w-md')}>
        <CardHeader className="pt-12 pb-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            {loginMode === 'register' ? <UserPlus className="text-primary" size={28} /> : <Lock className="text-primary" size={28} />}
          </div>
          <CardTitle className="text-2xl font-black uppercase tracking-tight">
            {loginMode === 'register' ? 'Personnel Registry' : 'SGOD One-Stop Service Portal'}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-10">
          <div className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-6">
              {loginMode === 'register' ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-2 space-y-2"><Label className="text-[10px] font-black uppercase">First Name</Label><Input value={regForm.firstName} onChange={(e) => setRegForm({...regForm, firstName: e.target.value})} className="h-12 bg-white/50 rounded-xl" required /></div>
                  <div className="md:col-span-1 space-y-2"><Label className="text-[10px] font-black uppercase">M.I.</Label><Input value={regForm.middleName} onChange={(e) => setRegForm({...regForm, middleName: e.target.value})} className="h-12 bg-white/50 rounded-xl" maxLength={2} /></div>
                  <div className="md:col-span-1 space-y-2"><Label className="text-[10px] font-black uppercase">Suffix</Label><Input value={regForm.suffix} onChange={(e) => setRegForm({...regForm, suffix: e.target.value})} className="h-12 bg-white/50 rounded-xl" placeholder="Jr/III" /></div>
                  
                  <div className="md:col-span-2 space-y-2"><Label className="text-[10px] font-black uppercase">Last Name</Label><Input value={regForm.lastName} onChange={(e) => setRegForm({...regForm, lastName: e.target.value})} className="h-12 bg-white/50 rounded-xl" required /></div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-[10px] font-black uppercase">DepEd ID (7 Digits)</Label>
                    <Input value={regForm.employeeId} onChange={(e) => setRegForm({...regForm, employeeId: e.target.value})} className="h-12 bg-white/50 rounded-xl" placeholder="XXXXXXX" maxLength={7} required />
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-[10px] font-black uppercase">Phone Number (11 Digits)</Label>
                    <Input value={regForm.phoneNumber} onChange={(e) => setRegForm({...regForm, phoneNumber: e.target.value})} className="h-12 bg-white/50 rounded-xl" placeholder="09XXXXXXXXX" maxLength={11} required />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-[10px] font-black uppercase">Assigned Unit</Label>
                    <Select value={regForm.unitId} onValueChange={(v) => setRegForm({...regForm, unitId: v})}>
                      <SelectTrigger className="h-12 bg-white/50 rounded-xl"><SelectValue placeholder="Select Unit" /></SelectTrigger>
                      <SelectContent>
                        {UNITS.map(unit => <SelectItem key={unit.id} value={unit.id}>{unit.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-2"><Label className="text-[10px] font-black uppercase">Position</Label><Input value={regForm.position} onChange={(e) => setRegForm({...regForm, position: e.target.value})} className="h-12 bg-white/50 rounded-xl" required /></div>
                  <div className="md:col-span-2 space-y-2"><Label className="text-[10px] font-black uppercase">Email Address</Label><Input type="email" value={regForm.email} onChange={(e) => setRegForm({...regForm, email: e.target.value})} className="h-12 bg-white/50 rounded-xl" required /></div>
                  <div className="md:col-span-2 space-y-2"><Label className="text-[10px] font-black uppercase">Password</Label><Input type="password" value={regForm.password} onChange={(e) => setRegForm({...regForm, password: e.target.value})} className="h-12 bg-white/50 rounded-xl" required /></div>
                  <div className="md:col-span-2 space-y-2"><Label className="text-[10px] font-black uppercase">Confirm Password</Label><Input type="password" value={regForm.confirmPassword} onChange={(e) => setRegForm({...regForm, confirmPassword: e.target.value})} className="h-12 bg-white/50 rounded-xl" required /></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {countdown > 0 && (
                    <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl flex items-center gap-3 animate-pulse">
                      <ShieldAlert className="text-destructive" size={18} />
                      <p className="text-[10px] font-black uppercase text-destructive tracking-widest">
                        Security Lockout: Wait {countdown}s to retry
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase">Email or DepEd ID</Label>
                    <Input disabled={countdown > 0} type="text" value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} className="h-12 bg-white/50 rounded-xl" placeholder="Email or 7-digit ID" required />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-[10px] font-black uppercase">Password</Label>
                      <button type="button" onClick={handlePasswordReset} className="text-[9px] font-black uppercase text-primary hover:underline">Forgot Password?</button>
                    </div>
                    <Input disabled={countdown > 0} type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="h-12 bg-white/50 rounded-xl" required />
                  </div>
                </div>
              )}
              <Button type="submit" disabled={isLoggingIn || (loginMode === 'login' && countdown > 0)} className="w-full h-14 bg-primary text-white font-black uppercase tracking-widest rounded-xl shadow-xl hover:scale-[1.01] transition-all">
                {isLoggingIn ? <Loader2 className="animate-spin" /> : (countdown > 0 && loginMode === 'login' ? 'Access Restricted' : (loginMode === 'login' ? 'Access Portal' : 'Register'))}
              </Button>
            </form>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pb-12 pt-4">
          <button onClick={() => { setLoginMode(loginMode === 'login' ? 'register' : 'login'); setIsLoggingIn(false); }} className="text-[10px] font-black uppercase text-muted-foreground hover:text-primary transition-colors">
            {loginMode === 'login' ? 'Register New Account' : 'Return to Login'}
          </button>
          {loginMode === 'login' && (
            <button disabled={isLoggingIn} onClick={handleGuestLogin} className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2 hover:text-primary transition-colors disabled:opacity-50">
              {isLoggingIn ? <Loader2 className="animate-spin h-3 w-3" /> : <Plus size={14} />} 
              Continue as Guest Observer
            </button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}