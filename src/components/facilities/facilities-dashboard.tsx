"use client";

import React from 'react';
import { Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContractorTracker } from './contractor-tracker';
import { InfraDatabase } from './infra-database';
import { TicketList } from '@/components/dashboard/ticket-list';

interface FacilitiesDashboardProps {
  isGuestUser: boolean;
  onOpenProjectHub: () => void;
}

export function FacilitiesDashboard({
  isGuestUser,
  onOpenProjectHub
}: FacilitiesDashboardProps) {
  return (
    <div className="space-y-8 sm:space-y-10 h-fit">
      {/* Header HUD */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Education <span className="text-accent">Facilities</span></h1>
          <p className="text-[15px] text-muted-foreground mt-2 font-medium">Infrastructure Registry & Monitoring.</p>
        </div>
        {!isGuestUser && (
          <Button onClick={onOpenProjectHub} className="h-12 bg-primary text-white font-black uppercase rounded-xl px-8 shadow-xl flex items-center gap-3">
            <Layers size={18} /> Infrastructure Hub
          </Button>
        )}
      </div>
      
      {/* Tactical Hub Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <ContractorTracker />
        </div>
        <div className="lg:col-span-2">
           <TicketList unitId="Education Facilities" />
        </div>
      </div>

      {/* Registry Section */}
      <div className="w-full">
        <InfraDatabase />
      </div>
    </div>
  );
}