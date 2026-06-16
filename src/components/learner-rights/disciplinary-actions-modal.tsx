"use client";

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gavel, AlertCircle, Scale, ShieldAlert, Zap, Gavel as GavelIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DisciplinaryActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DisciplinaryActionsModal({ isOpen, onClose }: DisciplinaryActionsModalProps) {
  const personnelClause = "Any personnel who commits the aformentioned act shall be subject to appropriate administrative actions and/or sanctions in accordance with existing rules and regulations of the Department of Education or in the private school, without prejudice to any civil or criminal action.";

  const PersonnelSanction = () => (
    <div className="pt-6 border-t border-border/50">
      <p className="text-[11px] font-black text-foreground uppercase tracking-widest mb-4">For School Personnel:</p>
      <div className="relative pl-4 border-l-4 border-destructive space-y-1">
        <p className="text-xs font-bold text-foreground leading-relaxed italic">
          {personnelClause}
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-card border-border shadow-3xl p-0 overflow-hidden rounded-[2.5rem] max-h-[90vh] flex flex-col w-[95vw]">
        <DialogHeader className="p-6 md:p-8 border-b border-border bg-background shrink-0">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.25rem] bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/5 shrink-0">
              <GavelIcon size={28} className="md:size-8" />
            </div>
            <div>
              <DialogTitle className="text-xl md:text-3xl font-black uppercase tracking-tight text-foreground leading-tight">Disciplinary Registry</DialogTitle>
              <DialogDescription className="text-[9px] md:text-xs font-black text-muted-foreground uppercase mt-1 tracking-[0.1em] md:tracking-[0.2em]">
                ADMINISTRATIVE PROTOCOLS & INTERVENTION LEVELS
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="bullying" className="flex-1 overflow-hidden flex flex-col">
          <div className="px-6 md:px-8 pt-4 border-b border-border bg-secondary/40">
            <TabsList className="bg-transparent gap-4 md:gap-8 h-auto p-0 flex flex-wrap justify-center sm:justify-start overflow-x-auto no-scrollbar">
              <TabsTrigger 
                value="bullying" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 md:px-2 pb-4 text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all text-muted-foreground data-[state=active]:text-primary whitespace-nowrap"
              >
                Bullying Protocols
              </TabsTrigger>
              <TabsTrigger 
                value="annex-i" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 md:px-2 pb-4 text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all text-muted-foreground data-[state=active]:text-primary whitespace-nowrap"
              >
                Annex I: Non-Bullying
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar bg-secondary/5">
            {/* TAB: Bullying-Related Protocols */}
            <TabsContent value="bullying" className="m-0 p-4 md:p-8 space-y-8">
              <div className="bg-card border border-border rounded-3xl overflow-x-auto shadow-xl no-scrollbar">
                <Table className="min-w-[800px]">
                  <TableHeader className="bg-secondary/40">
                    <TableRow className="border-none hover:bg-transparent">
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase text-muted-foreground tracking-widest w-[60%]">
                        Levels of Disciplinary Intervention
                      </TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center border-l border-border/50">
                        Penalties
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* LEVEL 1 - Bullying */}
                    <TableRow className="border-b border-border/50 hover:bg-amber-500/[0.02] transition-colors border-t-4 border-t-amber-500">
                      <TableCell className="px-8 py-10 align-top">
                        <div className="space-y-6">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-600 shrink-0"><Zap size={16} /></div>
                            <div className="space-y-4">
                              <p className="text-[16px] font-medium text-foreground uppercase tracking-tight leading-snug">
                                First Level of Disciplinary Intervention including Precursors to Bullying.
                              </p>
                             
                              <p className="text-[15px] text-muted-foreground font-medium leading-relaxed">
                                  This level of discipline applies to precursors to bullying or bullying behaviors that can be classified as “minor bullying acts” such as, but not limited to:
                                </p>
                              
                            </div>
                          </div>
                          <div className="space-y-4 text-[15px] text-muted-foreground font-medium pl-11">
                            {[
                              "Uttering profanities / swearwords against a learner;",
                              "Disruptive behavior and/ or pranks against a learner;",
                              "Grabbing belongings of another learner without permission;",
                              "Punching, pinching another learner which does not result in physical injuries; and",
                              "Fighting a learner which does not result in physical injuries."
                            ].map((text, i) => (
                              <div key={i} className="flex gap-4 items-start">
                                <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-700 text-[10px] font-black flex items-center justify-center shrink-0 border border-amber-400/30">{i+1}</span>
                                <span className="leading-relaxed">{text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-10 align-top border-l border-border/50 bg-amber-500/[0.01]">
                        <div className="space-y-8">
                          <div>
                            <p className="text-[11px] font-black text-foreground uppercase tracking-widest mb-4">For Learners:</p>
                            <div className="space-y-4">
                              <div className="relative pl-4 border-l-4 border-amber-500 space-y-1">
                                <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest">1ST OFFENSE:</p>
                                <p className="text-sm font-bold text-foreground">Written reprimand and Summon of Parents</p>
                              </div>
                              <div className="relative pl-4 border-l-4 border-amber-500 space-y-1">
                                <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest">2nd OFFENSE:</p>
                                <p className="text-sm font-bold text-foreground">Suspension from classes for three (3) days</p>
                              </div>
                              <div className="relative pl-4 border-l-4 border-amber-500 space-y-1">
                                <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest">3rd OFFENSE:</p>
                                <p className="text-sm font-bold text-foreground">Suspension from classes for five (5) days</p>
                              </div>
                            </div>
                          </div>

                        </div>
                      </TableCell>
                    </TableRow>

                    {/* LEVEL 2 - Bullying */}
                    <TableRow className="border-b border-border/50 hover:bg-orange-500/[0.02] transition-colors border-t-4 border-t-orange-500">
                      <TableCell className="px-8 py-10 align-top">
                        <div className="space-y-6">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-400/10 flex items-center justify-center text-orange-600 shrink-0"><AlertCircle size={16} /></div>
                            <div className="space-y-4">
                              <p className="text-[16px] font-medium text-foreground uppercase tracking-tight leading-snug">
                                Second Level of Disciplinary Intervention
                              </p>
                              
                              <p className="text-[15px] text-muted-foreground font-medium leading-relaxed">
                                  This level of discipline applies to bullying behaviors that can be classified as “serious bullying acts” such as, but not limited to:
                                </p>
                             
                            </div>
                          </div>
                          <div className="space-y-4 text-[15px] text-muted-foreground font-medium pl-11">
                            {[
                              "Stalking;",
                              "Catcalling, wolf-whistling, unwanted invitations, misogynistic, transphobic, homophobic and sexist slurs, persistent uninvited comments or gestures on a person's appearance, relentless requests for personal details, statement of sexual comments and suggestions against a learner",
                              "Assaulting or inflicting slight physical injuries to another learner;",
                              "Theft or stealing learner's belongings; and",
                              "Intimidating or threatening a learner."
                            ].map((text, i) => (
                              <div key={i} className="flex gap-4 items-start">
                                <span className="w-6 h-6 rounded-full bg-orange-400/20 text-orange-700 text-[10px] font-black flex items-center justify-center shrink-0 border border-orange-400/30">{i+1}</span>
                                <span className="leading-relaxed">{text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-10 align-top border-l border-border/50 bg-orange-500/[0.01]">
                        <div className="space-y-8">
                          <div>
                            <p className="text-[11px] font-black text-foreground uppercase tracking-widest mb-4">For Learners:</p>
                            <div className="space-y-4">
                              <div className="relative pl-4 border-l-4 border-orange-500 space-y-1">
                                <p className="text-[11px] font-black text-orange-600 uppercase tracking-widest">1ST OFFENSE:</p>
                                <p className="text-sm font-bold text-foreground">Suspension from classes for five (5) days, Summon of Parents, and referral to the Social Welfare Development Office</p>
                              </div>
                              <div className="relative pl-4 border-l-4 border-orange-500 space-y-1">
                                <p className="text-[11px] font-black text-orange-600 uppercase tracking-widest">2nd OFFENSE:</p>
                                <p className="text-sm font-bold text-foreground">Non-readmission</p>
                              </div>
                              <div className="relative pl-4 border-l-4 border-orange-500 space-y-1">
                                <p className="text-[11px] font-black text-orange-600 uppercase tracking-widest">3rd OFFENSE:</p>
                                <p className="text-sm font-bold text-foreground">Exclusion</p>
                              </div>
                            </div>
                          </div>

                        </div>
                      </TableCell>
                    </TableRow>

                    {/* LEVEL 3 - Bullying */}
                    <TableRow className="border-b border-border/50 hover:bg-destructive/[0.02] transition-colors border-t-4 border-t-destructive">
                      <TableCell className="px-8 py-10 align-top">
                        <div className="space-y-6">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive shrink-0"><ShieldAlert size={16} /></div>
                            <div className="space-y-4">
                              <p className="text-[16px] font-medium text-foreground uppercase tracking-tight leading-snug">
                                Third Level of Disciplinary Intervention
                              </p>
                              
                              <p className="text-[15px] text-muted-foreground font-medium leading-relaxed">
                                  This level of discipline applies to acts of bullying that cannot be resolved by the teacher at the classroom level or by the Learner Formation Officer, such as, but not limited to:
                                </p>

                            </div>
                          </div>
                          <div className="space-y-4 text-[15px] text-muted-foreground font-medium pl-11">
                            {[
                              "Inflicting physical injuries to another learner when the victim is incapacitated or requires medical intervention for 10 days or more;",
                              "Offensive physical or body gestures at someone, and exposing private parts for the sexual gratification of the respondent with the effect of demeaning, harassing, threatening or intimidating the offended party, including flashing of private parts, public masturbation, groping, and similar lewd sexual actions;",
                              "Uploading and sharing recorded or live videos which degrades, demeans or shames other learners; and",
                              "Uploading and sharing one's or another student's recorded/live video, photo, or voice with sexual content in the social media or to any person willing to pay for purposes of gain or profit."
                            ].map((text, i) => (
                              <div key={i} className="flex gap-4 items-start">
                                <span className="w-6 h-6 rounded-full bg-destructive/20 text-destructive text-[10px] font-black flex items-center justify-center shrink-0 border border-destructive/30">{i+1}</span>
                                <span className="leading-relaxed">{text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-10 align-top border-l border-border/50 bg-destructive/[0.01]">
                        <div className="space-y-8">
                          <div>
                            <p className="text-[11px] font-black text-foreground uppercase tracking-widest mb-4">For Learners:</p>
                            <div className="relative pl-4 border-l-4 border-destructive space-y-1">
                              <p className="text-[11px] font-black text-destructive uppercase tracking-widest">First Offense</p>
                              <p className="text-sm font-bold text-foreground">Exclusion</p>
                            </div>
                          </div>

                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* TAB: Annex I: Non-Bullying Incidents */}
            <TabsContent value="annex-i" className="m-0 p-4 md:p-8 space-y-8">
              <div className="bg-card border border-border rounded-3xl overflow-x-auto shadow-xl no-scrollbar">
                <Table className="min-w-[800px]">
                  <TableHeader className="bg-secondary/40">
                    <TableRow className="border-none hover:bg-transparent">
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase text-muted-foreground tracking-widest w-[60%]">
                        Levels of Disciplinary Intervention
                      </TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center border-l border-border/50">
                        Penalties
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* LEVEL 1 - Annex I */}
                    <TableRow className="border-b border-border/50 hover:bg-amber-500/[0.02] transition-colors border-t-4 border-t-amber-500">
                      <TableCell className="px-8 py-10 align-top">
                        <div className="space-y-6">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-600 shrink-0"><Zap size={16} /></div>
                            <div className="space-y-4">
                              <p className="text-[16px] font-medium text-foreground uppercase tracking-tight leading-snug">First Level</p>
                              <p className="text-[15px] text-muted-foreground font-medium leading-relaxed">
                                These acts involve less severe actions that do not pose immediate physical, psychological, or emotional harm but still disrupt the learning environment and these behaviors can often be handled through direct intervention and guidance from teachers/authorities. “Minor offenses” such as, but not limited to:
                              </p>
                             
                            </div>
                          </div>
                          <div className="space-y-4 text-[15px] text-muted-foreground font-medium pl-11">
                            {[
                              "Uttering profanities/swearwords inside the school premises, or through online platforms, or during school sanctioned activities whether inside or outside the school;",
                              "Sharing fake news or false information that can create confusion or commotion in the school;",
                              "Disruptive behavior and/or pranks in class or within the school premises or during school-sanctioned activities, whether inside or outside the school;",
                              "Grabbing other’s belongings (e.g., toys, things, food, etc.) inside the classroom, school premises or during school-sanctioned activities whether inside or outside the school;",
                              "Simple vandalism inside the classroom or school premises, involving damage valued at not more than Php 500.00. Vandalism is marking or damaging school property;",
                              "Punching, pinching another learner which does not result in physical injuries, inside the classroom, school premises or during school-sanctioned activities;",
                              "Fighting in class/school premises or during school-sanctioned activities which does not result in physical injuries;",
                              "Carrying, concealing, liquor, toxic substances, cigarettes/e-cigarettes/vapes, and pornographic materials inside the classroom, school premises or during school-sanctioned activities whether inside or outside the school;"
                            ].map((text, i) => (
                              <div key={i} className="flex gap-4 items-start">
                                <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-700 text-[10px] font-black flex items-center justify-center shrink-0 border border-amber-400/30">{i+1}</span>
                                <span className="leading-relaxed">{text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-10 align-top border-l border-border/50 bg-amber-500/[0.01]">
                        <div className="space-y-8">
                          <div>
                             <p className="text-[11px] font-black text-foreground uppercase tracking-widest mb-4">For Learners:</p>
                             <div className="space-y-6">
                                <div className="relative pl-4 border-l-4 border-amber-500 space-y-1">
                                  <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest">1ST OFFENSE:</p>
                                  <p className="text-sm font-bold text-foreground">Written reprimand and parental notice (through formal communication).</p>
                                </div>
                                <div className="relative pl-4 border-l-4 border-amber-500 space-y-1">
                                  <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest">2nd OFFENSE:</p>
                                  <p className="text-sm font-bold text-foreground">Written reprimand and summon of parents through Call Slip (See Annex K).</p>
                                </div>
                                <div className="relative pl-4 border-l-4 border-amber-500 space-y-1">
                                  <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest">3rd OFFENSE:</p>
                                  <p className="text-sm font-bold text-foreground">Suspension not exceeding five (5) days, with provision of alternative learning modalities.</p>
                                </div>
                             </div>
                          </div>
                          <PersonnelSanction />
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* LEVEL 2 - Annex I */}
                    <TableRow className="border-b border-border/50 hover:bg-orange-500/[0.02] transition-colors border-t-4 border-t-orange-500">
                      <TableCell className="px-8 py-10 align-top">
                        <div className="space-y-6">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-400/10 flex items-center justify-center text-orange-600 shrink-0"><AlertCircle size={16} /></div>
                            <div className="space-y-4">
                              <p className="text-[16px] font-medium text-foreground uppercase tracking-tight leading-snug">Second Level</p>
                              <p className="text-[15px] text-muted-foreground font-medium leading-relaxed">
                                These acts are severe or repeated behaviors that go beyond minor offenses which necessitate a formal proceeding intervention by the Learner Formation Officer or other relevant authorities. “Serious offenses” such as, but not limited to:
                              </p>
                              
                            </div>
                          </div>
                          <div className="space-y-4 text-[15px] text-muted-foreground font-medium pl-11">
                            {[
                              "Stalking inside the classroom, school premises or during school-sanctioned activities whether inside or outside the school;",
                              "Assaulting or inflicting slight physical injuries to another learner or teacher or school personnel, whether inside or outside the school. Slight physical injuries are those that require medical intervention for 1-9 days;",
                              "Theft or stealing other’s belongings inside the classroom, school premises or during school-sanctioned activities whether inside or outside the school;",
                              "Intimidating or threatening school personnel or learners whether inside or outside the school. This includes threat or intimidation done electronically or using social media platforms;",
                              "Gambling or possession of gambling materials inside the classroom, school premises or during school-sanctioned activities whether inside or outside the school;",
                              "Smoking cigarettes/e-cigarettes/vapes, inside the school premises or during school-sanctioned activities whether inside or outside the school;",
                              "Serious vandalism inside the classroom or school premises involving damaged valued at more than Php500.00 Vandalism is marking or damaging school property;",
                              "Offensive physical or body gestures at someone, and exposing private parts for the sexual gratification of the offender with the effect of demeaning, harassing, threatening or intimidating the offended party, including flashing of private parts, public masturbation, groping, and similar lewd sexual actions committed inside the classroom, school premises or school-sanctioned activities whether inside or outside the school."
                            ].map((text, i) => (
                              <div key={i} className="flex gap-4 items-start">
                                <span className="w-6 h-6 rounded-full bg-orange-400/20 text-orange-700 text-[10px] font-black flex items-center justify-center shrink-0 border border-orange-400/30">{i+1}</span>
                                <span className="leading-relaxed">{text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-10 align-top border-l border-border/50 bg-orange-500/[0.01]">
                        <div className="space-y-8">
                          <div>
                             <p className="text-[11px] font-black text-foreground uppercase tracking-widest mb-4">For Learners:</p>
                             <div className="space-y-6">
                                <div className="relative pl-4 border-l-4 border-orange-500 space-y-1">
                                  <p className="text-[11px] font-black text-orange-600 uppercase tracking-widest">1ST OFFENSE:</p>
                                  <p className="text-sm font-bold text-foreground">Suspension not exceeding five (5) days, with provision of alternative learning modalities, and referral to the Social Welfare Development Office.</p>
                                </div>
                                <div className="relative pl-4 border-l-4 border-orange-500 space-y-1">
                                  <p className="text-[11px] font-black text-orange-600 uppercase tracking-widest">2nd OFFENSE:</p>
                                  <p className="text-sm font-bold text-foreground">Non-readmission and referral to the Social Welfare Development Office.</p>
                                </div>
                                <div className="relative pl-4 border-l-4 border-orange-500 space-y-1">
                                  <p className="text-[11px] font-black text-orange-600 uppercase tracking-widest">3rd OFFENSE:</p>
                                  <p className="text-sm font-bold text-foreground">Exclusion and referral to the Social Welfare Development Office.</p>
                                </div>
                             </div>
                          </div>
                          <PersonnelSanction />
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* LEVEL 3 - Annex I */}
                    <TableRow className="border-b border-border/50 hover:bg-destructive/[0.02] transition-colors border-t-4 border-t-destructive">
                      <TableCell className="px-8 py-10 align-top">
                        <div className="space-y-6">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive shrink-0"><ShieldAlert size={16} /></div>
                            <div className="space-y-4">
                              <p className="text-[16px] font-medium text-foreground uppercase tracking-tight leading-snug">Third Level</p>
                              <p className="text-[15px] text-muted-foreground font-medium leading-relaxed">
                                These include more severe or complex situations as these incidents require a higher level of intervention due to their potential impact on learner safety and well-being. This level of discipline applies to offenses that cannot be resolved at the school level, such as, but not limited to:
                              </p>
                            </div>
                          </div>
                          <div className="space-y-4 text-[15px] text-muted-foreground font-medium pl-11">
                            {[
                              "Joining, organizing and/or recruiting learners to fraternities, sororities, street gangs, and similar organizations;",
                              "Cheating/dishonesty during class assessment/exams; or allowing another student to copy one's answer in exams or assigned homework or similar assessment whether for personal reasons, profit or gain (sagot for sale);",
                              "Making bomb threats/jokes;",
                              "Inflicting serious physical injuries to another learner or personnel, whether inside or outside the school. Serious physical injuries occur when the victim requires medical intervention for 10 days or more;",
                              "Use, possession, or sale of prohibited drugs or substances inside the school premises or during school-sanctioned activities whether inside or outside the school;",
                              "Drinking liquor inside the school or during school-sanctioned activities whether inside or outside the school or coming to the school intoxicated;",
                              "Acts of lasciviousness, offensive physical or body gestures at someone, and exposing private parts for the sexual gratification of the offender with the effect of demeaning, harassing, threatening or intimidating the offended party including flashing of private parts, public masturbation, groping, and similar lewd sexual actions committed inside the classroom, school premises or school-sanctioned activities whether inside or outside the school;",
                              "Sexual exploitation, sexual assault or rape committed whether inside or outside the school;",
                              "Carrying and concealing deadly weapons, such as firearms, ammunitions, explosives, bladed/pointed/blunt weapons inside the school premises or during school-sanctioned activities whether inside or outside the school;",
                              "Homicide or murder committed whether inside or outside the school; Hazing in any form inside or outside the school premises;",
                              "Uploading and sharing recorded or live videos which degrades, demeans, or shames other learners and school personnel;",
                              "Uploading and sharing one's or another student's recorded/live video, photo, or voice with sexual content in the social media or to any person willing to pay for purposes of gain or profit (online sex for sale)."
                            ].map((text, i) => (
                              <div key={i} className="flex gap-4 items-start">
                                <span className="w-6 h-6 rounded-full bg-destructive/20 text-destructive text-[10px] font-black flex items-center justify-center shrink-0 border border-destructive/30">{i+1}</span>
                                <span className="leading-relaxed">{text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-10 align-top border-l border-border/50 bg-destructive/[0.01]">
                        <div className="space-y-8">
                          <div>
                             <p className="text-[11px] font-black text-foreground uppercase tracking-widest mb-4">For Learners:</p>
                             <div className="space-y-6">
                                <div className="relative pl-4 border-l-4 border-destructive space-y-1">
                                  <p className="text-[11px] font-black text-destructive uppercase tracking-widest">1ST OFFENSE:</p>
                                  <p className="text-sm font-bold text-foreground">Non-readmission and referral to the appropriate office (e.g. PNP, Social Welfare Development Office).</p>
                                </div>
                                <div className="relative pl-4 border-l-4 border-destructive space-y-1">
                                  <p className="text-[11px] font-black text-destructive uppercase tracking-widest">2nd OFFENSE:</p>
                                  <p className="text-sm font-bold text-foreground">Exclusion and referral to the appropriate office (e.g. PNP, Social Welfare Development Office).</p>
                                </div>
                             </div>
                          </div>
                          <PersonnelSanction />
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="px-6 md:px-10 py-6 md:py-8 border-t border-border bg-secondary/20 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
           <div className="flex items-center gap-3 text-muted-foreground/60">
             <Scale size={20} className="text-primary shrink-0" />
             <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-center sm:text-left">Project Kabataang LEGAL Intelligence Center</span>
           </div>
           <Button onClick={onClose} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-xl font-black uppercase text-xs tracking-widest px-10 h-12 shadow-lg shadow-primary/20 active:scale-95 transition-all border-none">
             Acknowledge & Close Hub
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
