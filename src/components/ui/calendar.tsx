"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Clock, Info, ShieldCheck, HelpCircle, UserX } from "lucide-react"
import { DayPicker, useNavigation, MonthCaptionProps, DayProps } from "react-day-picker"
import { parseISO, format, startOfDay, isWeekend, isValid } from "date-fns"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  events?: any[];
  isStaff?: boolean;
}

/**
 * CustomDay: Strategic Cell Component
 * Renders the individual date cell (td) with event status indicators.
 * Includes interactive tooltips for event intelligence.
 */
function CustomDay(props: DayProps & { events?: any[]; isStaff?: boolean }) {
  const { day, modifiers, className, events, isStaff } = props;
  const date = day.date;
  
  const isWknd = isWeekend(date);
  
  const dayEvents = (events || []).filter((ev: any) => {
    if (!ev.date || !ev.title) return false;
    if (ev.type === 'Task' && !isStaff) return false;

    try {
      const start = startOfDay(parseISO(ev.date));
      const end = ev.endDate ? startOfDay(parseISO(ev.endDate)) : start;
      return date >= start && date <= end;
    } catch (e) {
      return false;
    }
  });

  const getMarkerColor = (ev: any) => {
    if (ev.type === 'Appointment') return 'bg-primary';
    if (ev.type === 'Task') return 'bg-destructive';
    return 'bg-amber-500'; // Standard Operational Event
  };

  const getStatusIcon = (ev: any) => {
    if (ev.type !== 'Appointment') return null;
    const status = ev.status || 'Pending';
    if (status === 'Noted' || status === 'Resolved') return <ShieldCheck size={10} className="text-emerald-500" />;
    if (status === 'Unavailable') return <UserX size={10} className="text-destructive" />;
    return <HelpCircle size={10} className="text-amber-500" />;
  };

  return (
    <td
      role="gridcell"
      className={cn(
        "p-0 relative h-full w-full border-r border-b border-border/40 transition-all cursor-pointer hover:bg-primary/[0.03] overflow-hidden",
        modifiers?.today && "bg-primary/5 ring-1 ring-inset ring-primary/20",
        modifiers?.selected && "bg-primary/10 ring-2 ring-inset ring-primary z-10",
        modifiers?.outside && "opacity-20 pointer-events-none",
        className
      )}
    >
      <button
        type="button"
        className="w-full h-full min-h-[80px] flex flex-col items-center justify-start p-2 outline-none border-none bg-transparent text-left"
      >
        <span className={cn(
          "text-[11px] font-black mb-2 block",
          isWknd ? "text-destructive" : "text-foreground"
        )}>{date.getDate()}</span>
        
        <TooltipProvider>
          <div className="flex flex-col gap-1 w-full overflow-hidden">
             {dayEvents.slice(0, 3).map((ev: any, idx: number) => (
               <Tooltip key={ev.id || idx}>
                 <TooltipTrigger asChild>
                   <div 
                     className={cn(
                       "h-1.5 w-full rounded-full shrink-0 transition-transform hover:scale-x-110", 
                       getMarkerColor(ev)
                     )} 
                   />
                 </TooltipTrigger>
                 <TooltipContent side="top" className="p-3 bg-card border-border shadow-2xl z-[100] max-w-[200px]">
                    <div className="space-y-1.5">
                       <div className="flex items-center justify-between gap-2">
                          <p className="text-[10px] font-black uppercase text-primary tracking-widest">{ev.type}</p>
                          {getStatusIcon(ev)}
                       </div>
                       <p className="text-xs font-bold text-foreground leading-tight">{ev.title}</p>
                       {ev.type === 'Appointment' && (
                         <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                           Ref: #{ev.id.substring(0, 8).toUpperCase()}
                         </p>
                       )}
                       {ev.time && (
                         <div className="flex items-center gap-1 text-[9px] font-black text-muted-foreground uppercase">
                           <Clock size={10} /> {ev.time}
                         </div>
                       )}
                       {ev.type === 'Appointment' && (
                         <p className={cn(
                           "text-[9px] font-black uppercase mt-1",
                           (ev.status === 'Noted' || ev.status === 'Resolved') ? "text-emerald-500" :
                           ev.status === 'Unavailable' ? "text-destructive" : "text-amber-500"
                         )}>Status: {ev.status || 'Pending'}</p>
                       )}
                    </div>
                 </TooltipContent>
               </Tooltip>
             ))}
             {dayEvents.length > 3 && (
               <span className="text-[8px] font-black text-primary text-center">+{dayEvents.length - 3}</span>
             )}
          </div>
        </TooltipProvider>
      </button>
    </td>
  );
}

/**
 * CustomMonthCaption: Unified Tactical Header
 * Consolidates the month title and navigation buttons into a single centered block.
 */
function CustomMonthCaption(props: MonthCaptionProps) {
  const { calendarMonth } = props;
  const displayMonth = calendarMonth.date;
  const { goToMonth, previousMonth, nextMonth } = useNavigation();
  
  const isDateValid = displayMonth && isValid(displayMonth);

  return (
    <div className="flex items-center justify-center gap-6 mb-10 h-12">
      <button
        type="button"
        disabled={!previousMonth}
        onClick={(e) => {
          e.preventDefault();
          previousMonth && goToMonth(previousMonth);
        }}
        className={cn(
          "h-10 w-10 bg-secondary/50 hover:bg-primary/10 rounded-xl flex items-center justify-center text-foreground border border-border transition-all shadow-sm",
          !previousMonth && "opacity-20 cursor-not-allowed"
        )}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      
      <span className="text-sm font-black uppercase tracking-[0.2em] text-foreground min-w-[200px] text-center bg-secondary/20 px-6 py-2 rounded-xl border border-border">
        {isDateValid ? format(displayMonth, 'MMMM yyyy') : 'Loading...'}
      </span>

      <button
        type="button"
        disabled={!nextMonth}
        onClick={(e) => {
          e.preventDefault();
          nextMonth && goToMonth(nextMonth);
        }}
        className={cn(
          "h-10 w-10 bg-secondary/50 hover:bg-primary/10 rounded-xl flex items-center justify-center text-foreground border border-border transition-all shadow-sm",
          !nextMonth && "opacity-20 cursor-not-allowed"
        )}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  events = [],
  isStaff = false,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-0 w-full", className)}
      classNames={{
        months: "w-full flex flex-col",
        month: "space-y-4 w-full flex flex-col", 
        nav: "hidden", 
        month_grid: "w-full border-collapse table-fixed flex-1 border-t border-l border-border/40", 
        weekdays: "w-full flex",
        weekday: "text-muted-foreground text-[10px] font-black uppercase h-10 flex-1 flex items-center justify-center opacity-60 tracking-[0.2em] [&:nth-child(1)]:text-destructive [&:nth-child(7)]:text-destructive",
        weeks: "w-full",
        week: "w-full flex",
        outside: "day-outside text-muted-foreground opacity-20", 
        disabled: "text-muted-foreground opacity-50",
        ...classNames,
      }}
      components={{
        Day: (dayProps) => <CustomDay {...dayProps} events={events} isStaff={isStaff} />,
        MonthCaption: CustomMonthCaption
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }