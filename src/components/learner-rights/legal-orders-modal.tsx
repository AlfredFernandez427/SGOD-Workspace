"use client";

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Scale, 
  Search, 
  ChevronRight, 
  Filter,
  Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Law {
  id: string;
  title: string;
  category: string;
  description: string;
  url?: string;
}

const LAWS: Law[] = [
  // Child Protection
  { id: 'cp-1', title: 'RA 7610', category: 'Child Protection', description: 'Special Protection of Children Against Abuse, Exploitation and Discrimination Act of 1992.', url: 'https://lawphil.net/statutes/repacts/ra1992/ra_7610_1992.html' },
  { id: 'cp-2', title: 'RA 11648', category: 'Child Protection', description: 'Raising the Age of Sexual Consent Act of 2022.', url: 'https://lawphil.net/statutes/repacts/ra2022/ra_11648_2022.html' },
  { id: 'cp-3', title: 'RA 11596', category: 'Child Protection', description: 'Prohibition of Child Marriage Act of 2021.', url: 'https://lawphil.net/statutes/repacts/ra2021/ra_11596_2021.html' },
  { id: 'cp-4', title: 'RA 11930', category: 'Child Protection', description: 'Anti-Online Sexual Abuse or Exploitation of Children (OSAEC) and Anti-Child Sexual Abuse or Exploitation Materials (CSAEM) Act of 2022.', url: 'https://lawphil.net/statutes/repacts/ra2022/ra_11930_2022.html' },
  { id: 'cp-5', title: 'RA 11188', category: 'Child Protection', description: 'Special Protection of Children in Situations of Armed Conflict Act of 2019.', url: 'https://lawphil.net/statutes/repacts/ra2019/ra_11188_2019.html' },

  // Bullying & School Safety
  { id: 'bs-1', title: 'RA 10627', category: 'Bullying & School Safety', description: 'Anti-Bullying Act of 2013.', url: 'https://lawphil.net/statutes/repacts/ra2013/ra_10627_2013.html' },
  { id: 'bs-2', title: 'IRR of RA No. 10627', category: 'Bullying & School Safety', description: 'Implementing Rules and Regulations of the Anti-Bullying Act of 2013.', url: 'http://www.deped.gov.ph/wp-content/uploads/2013/12/DO_s2013_55.pdf' },

  // Gender-Based & Sexual Harassment
  { id: 'gb-1', title: 'RA 11313', category: 'Gender-Based & Sexual Harassment', description: 'Safe Spaces Act of 2019.', url: 'https://lawphil.net/statutes/repacts/ra2019/ra_11313_2019.html' },
  { id: 'gb-2', title: 'RA 7877', category: 'Gender-Based & Sexual Harassment', description: 'Anti-Sexual Harassment Act of 1995.', url: 'https://lawphil.net/statutes/repacts/ra1995/ra_7877_1995.html' },
  { id: 'gb-3', title: 'RA 9262', category: 'Gender-Based & Sexual Harassment', description: 'Anti-Violence Against Women and Their Children Act of 2004.', url: 'https://lawphil.net/statutes/repacts/ra2004/ra_9262_2004.html' },

  // Trafficking & Exploitation
  { id: 'te-1', title: 'RA 11862', category: 'Trafficking & Exploitation', description: 'Expanded Anti-Trafficking in Persons Act of 2022.', url: 'https://lawphil.net/statutes/repacts/ra2022/ra_11862_2022.html' },
  { id: 'te-2', title: 'RA 9231', category: 'Trafficking & Exploitation', description: 'Elimination of the Worst Forms of Child Labor Act of 1995.', url: 'https://lawphil.net/statutes/repacts/ra2003/ra_9231_2003.html' },
  { id: 'te-3', title: 'RA 9775', category: 'Trafficking & Exploitation', description: 'Anti-Child Pornography Act of 2009.', url: 'https://lawphil.net/statutes/repacts/ra2009/ra_9775_2009.html' },

  // Torture & Inhuman Treatment
  { id: 'it-1', title: 'RA 9745', category: 'Torture & Inhuman Treatment', description: 'Anti-Torture Act of 2009.', url: 'https://lawphil.net/statutes/repacts/ra2009/ra_9745_2009.html' },

  // Hazing & Initiation Rites
  { id: 'hr-1', title: 'RA 8049', category: 'Hazing & Initiation Rites', description: 'Anti-Hazing Act of 1995.', url: 'https://lawphil.net/statutes/repacts/ra1995/ra_8049_1995.html' },

  // Juvenile Justice
  { id: 'jj-1', title: 'RA 9344', category: 'Juvenile Justice', description: 'Juvenile Justice and Welfare Act of 2006.', url: 'https://lawphil.net/statutes/repacts/ra2006/ra_9344_2006.html' },

  // Online, Cyber & Other Special Laws
  { id: 'oc-1', title: 'RA 10175', category: 'Online, Cyber & Other Special Laws', description: 'Cybercrime Prevention Act of 2012.', url: 'https://lawphil.net/statutes/repacts/ra2012/ra_10175_2012.html' },
  { id: 'oc-2', title: 'RA 9851', category: 'Online, Cyber & Other Special Laws', description: 'Philippine Act on Crimes Against International Humanitarian Law, Genocide, and Other Crimes Against Humanity of 2009.', url: 'https://lawphil.net/statutes/repacts/ra2009/ra_9851_2009.html' },
  { id: 'oc-3', title: 'RA 7079', category: 'Online, Cyber & Other Special Laws', description: 'Campus Journalism Act of 1991.', url: 'https://lawphil.net/statutes/repacts/ra1991/ra_7079_1991.html' },

  // Special Protection & Human Rights
  { id: 'sp-1', title: 'RA 7277', category: 'Special Protection & Human Rights', description: 'Magna Carta for Disabled Persons of 1992.', url: 'https://lawphil.net/statutes/repacts/ra1992/ra_7277_1992.html' },
  { id: 'sp-2', title: 'RA 9442', category: 'Special Protection & Human Rights', description: 'Amendments to the Magna Carta for Disabled Persons.', url: 'https://lawphil.net/statutes/repacts/ra2007/ra_9442_2007.html' },
  { id: 'sp-3', title: 'RA 8353', category: 'Special Protection & Human Rights', description: 'Anti-Rape Law of 1997.', url: 'https://lawphil.net/statutes/repacts/ra1997/ra_8353_1997.html' },
  { id: 'sp-4', title: 'RA 8371', category: 'Special Protection & Human Rights', description: 'Indigenous Peoples’ Rights Act (IPRA) of 1997.', url: 'https://lawphil.net/statutes/repacts/ra1997/ra_8371_1997.html' },

  // Data & Privacy
  { id: 'dp-1', title: 'RA 9995', category: 'Data & Privacy', description: 'Anti-Photo and Video Voyeurism Act of 2009.', url: 'https://lawphil.net/statutes/repacts/ra2009/ra_9995_2009.html' },
  { id: 'dp-2', title: 'RA 10173', category: 'Data & Privacy', description: 'Data Privacy Act of 2012.', url: 'https://lawphil.net/statutes/repacts/ra2012/ra_10173_2012.html' },

  // DepEd Orders
  { id: 'do-1', title: 'DepEd Order No. 006, s. 2026', category: 'DepEd Orders', description: 'Guidelines on Ensuring a Safe and Motivating Learning Environment (ESMLE).', url: 'https://www.deped.gov.ph/wp-content/uploads/DO_s2026_006r.pdf' },
  { id: 'do-2', title: 'DepEd Order No. 40, s. 2012', category: 'DepEd Orders', description: 'Child Protection Policy (CPP).', url: 'http://www.deped.gov.ph/wp-content/uploads/2012/05/DO_s2012_40.pdf' },
  { id: 'do-3', title: 'DepEd Order No. 55, s. 2013', category: 'DepEd Orders', description: 'Implementing Rules and Regulations of the Anti-Bullying Act.', url: 'http://www.deped.gov.ph/wp-content/uploads/2013/12/DO_s2013_55.pdf' },
  { id: 'do-4', title: 'DepEd Order No. 18, s. 2015', category: 'DepEd Orders', description: 'Guidelines and Procedures on the Management of Children-at-Risk and Children in Conflict with the Law.', url: 'http://www.deped.gov.ph/wp-content/uploads/2015/05/DO_s2015_18.pdf' },
  { id: 'do-5', title: 'DepEd Order No. 31, s. 2018', category: 'DepEd Orders', description: 'Policy Guidelines on the Implementation of the Comprehensive Sexuality Education.', url: 'http://www.deped.gov.ph/wp-content/uploads/2018/07/DO_s2018_031-1.pdf' },
  { id: 'do-6', title: 'DepEd Order No. 32, s. 2017', category: 'DepEd Orders', description: 'Gender-Responsive Basic Education Policy.', url: 'http://www.deped.gov.ph/wp-content/uploads/2017/06/DO_s2017_032.pdf' },
  { id: 'do-7', title: 'OUOPS-2024-05-01115', category: 'DepEd Orders', description: 'Guidelines on the Implementation of the Safe Spaces Act in Basic Education Institutions.', url: 'https://www.deped.gov.ph/wp-content/uploads/DO_s2026_006r.pdf' },
  { id: 'do-8', title: 'DepEd Order No. 47, s. 2022', category: 'DepEd Orders', description: 'Promotion of Professionalism in the Implementation and Delivery of Basic Education Programs and Services.', url: 'https://www.deped.gov.ph/wp-content/uploads/2022/11/DO_s2022_049.pdf' },
  { id: 'do-9', title: 'DepEd Order No. 49, s. 2022', category: 'DepEd Orders', description: 'Amendments to DepEd Order No. 47, s. 2022.', url: 'https://www.deped.gov.ph/wp-content/uploads/2022/11/DO_s2022_049.pdf' },
  { id: 'do-10', title: 'DM-OUOPS-2024-05-07998', category: 'DepEd Orders', description: 'Supplemental Guidelines for the Implementation of DO No. 40, s. 2012.', url: 'https://www.deped.gov.ph/wp-content/uploads/2012/05/DO_s2012_40.pdf' },{ id: 'cp-6', title: 'DepEd Order No. 57, s. 2017', category: 'Child Protection', description: 'Policy on the Protection of Children in Armed Conflict.', url: 'https://www.deped.gov.ph/wp-content/uploads/2017/11/DO_s2017_057.pdf' },
  { id: 'do-11', title: 'DepEd Order No. 32, s. 2019', category: 'DepEd Orders', description: 'National Policy Framework on Learners and Schools as Zones of Peace.', url: 'https://www.deped.gov.ph/wp-content/uploads/2019/11/DO_s2019_032.pdf' },
  { id: 'd0-12', title: 'DM-OUOPS-2024-05-01167', category: 'DepEd Orders', description: 'Guidelines on the Protocols on the Handling of Children in Situations of Armed Conflict (CSAC) Learners.', url: 'https://depedph-my.sharepoint.com/:b:/g/personal/rizal_deped_gov_ph/EfGiqOasRThInGyUiVNKW3ABpnj3B2c-SIAeevTgno-f3g?e=mtQeSb' },
];

const CATEGORIES = [
  'Child Protection',
  'Bullying & School Safety',
  'Gender-Based & Sexual Harassment',
  'Trafficking & Exploitation',
  'Torture & Inhuman Treatment',
  'Hazing & Initiation Rites',
  'Juvenile Justice',
  'Online, Cyber & Other Special Laws',
  'Special Protection & Human Rights',
  'Data & Privacy',
  'DepEd Orders'
];

interface LegalOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LegalOrdersModal({ isOpen, onClose }: LegalOrdersModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredLaws = LAWS.filter(law => {
    const matchesSearch = law.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         law.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || law.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleClose = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    onClose();
  };

  const handleOpenLink = (url?: string) => {
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl bg-card border-border shadow-3xl p-0 overflow-hidden rounded-[2.5rem] h-[90vh] flex flex-col">
        {/* HEADER: Precise visual match to provided "Legal Orders Hub" reference image */}
        <DialogHeader className="p-8 border-b border-border bg-background shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[1.25rem] bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/5">
                <Scale size={32} />
              </div>
              <div>
                <DialogTitle className="text-3xl font-black uppercase tracking-tight text-foreground">Legal Orders Hub</DialogTitle>
                <DialogDescription className="text-xs font-black text-muted-foreground uppercase mt-1 tracking-[0.2em]">
                  REPOSITORY OF LAWS AND ORDERS
                </DialogDescription>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-primary" />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-12 w-[240px] bg-background/50 rounded-xl border-border font-black uppercase text-[10px] tracking-widest outline-none focus:ring-1 focus:ring-primary/30">
                    <SelectValue placeholder="Protocol Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl shadow-2xl z-[200]">
                    <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest py-3">All Records</SelectItem>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat} className="text-[10px] font-black uppercase tracking-widest py-3">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative w-full md:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input 
                  placeholder="Search title..." 
                  className="h-12 pl-12 bg-background/50 rounded-xl border-border text-sm font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-secondary/5">
          <ScrollArea className="h-full">
            <div className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {filteredLaws.length > 0 ? (
                  filteredLaws.map((law) => (
                    <div key={law.id} className="p-8 rounded-[2.5rem] bg-card border border-border hover:border-primary/40 transition-all group flex flex-col justify-between shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                        <Zap size={80} />
                      </div>

                      <div className="space-y-4 relative z-10">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-[9px] font-black uppercase bg-primary/5 text-primary border-primary/20 px-3 py-1 rounded-full">{law.category}</Badge>
                        </div>
                        <h4 className="text-xl font-black text-foreground leading-tight group-hover:text-primary transition-colors tracking-tight">{law.title}</h4>
                        <div className="h-0.5 w-12 bg-accent/20 rounded-full group-hover:w-20 transition-all"></div>
                        <p className="text-[13px] text-muted-foreground font-medium leading-relaxed line-clamp-4">{law.description}</p>
                      </div>

                      <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-end relative z-10">
                         <button 
                           onClick={() => handleOpenLink(law.url)}
                           disabled={!law.url || law.url === '#'}
                           className={cn(
                             "text-[10px] font-black uppercase flex items-center gap-2 hover:scale-105 transition-transform group/btn",
                             (!law.url || law.url === '#') ? "text-muted-foreground cursor-not-allowed" : "text-primary"
                           )}
                         >
                           Read More <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                         </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-32 text-center opacity-30 flex flex-col items-center">
                    <Scale size={64} className="mb-6 text-primary" />
                    <p className="text-base font-black uppercase tracking-[0.3em] text-foreground">Registry Records Clear</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        <div className="px-10 py-6 border-t border-border bg-secondary/10 flex items-center justify-between shrink-0">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Zap size={14} className="text-primary animate-pulse" /> Learner Rights Strategic Intelligence Center
          </p>
          <div className="flex items-center gap-3">
             <Badge className="bg-slate-900 text-white font-black uppercase text-[8px]">DIV. DAVAO DEL SUR</Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
