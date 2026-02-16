import React, { useState, useEffect, useRef } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  Plus,
  Clock,
  User,
  Users
} from "lucide-react";
import { 
  format, 
  addDays, 
  subDays, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isToday, 
  setHours, 
  setMinutes, 
  addMinutes,
  differenceInMinutes,
  startOfDay
} from "date-fns";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

// --- Types ---

type EventType = "class" | "pt" | "block";

interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  start: Date;
  end: Date;
  color?: string;
  description?: string;
}

// --- Constants ---

const START_HOUR = 6; // 6 AM
const END_HOUR = 22; // 10 PM
const TOTAL_HOURS = END_HOUR - START_HOUR + 1;
const CELL_HEIGHT = 60; // Height of one hour in pixels
const MINUTE_HEIGHT = CELL_HEIGHT / 60;

// Sample Data
const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Morning Yoga",
    type: "class",
    start: setMinutes(setHours(new Date(), 7), 0),
    end: setMinutes(setHours(new Date(), 8), 0),
    color: "bg-blue-100 border-blue-200 text-blue-700",
  },
  {
    id: "2",
    title: "HIIT Workout",
    type: "class",
    start: setMinutes(setHours(new Date(), 10), 0),
    end: setMinutes(setHours(new Date(), 11), 30),
    color: "bg-orange-100 border-orange-200 text-orange-700",
  },
  {
    id: "3",
    title: "PT with Sarah",
    type: "pt",
    start: setMinutes(setHours(new Date(), 14), 0),
    end: setMinutes(setHours(new Date(), 15), 0),
    color: "bg-green-100 border-green-200 text-green-700",
  },
];

// --- Components ---

const EventBlock = ({ event, onClick }: { event: CalendarEvent; onClick: (e: CalendarEvent) => void }) => {
  const startMinutes = differenceInMinutes(event.start, startOfDay(event.start));
  const duration = differenceInMinutes(event.end, event.start);
  
  // Calculate top offset relative to START_HOUR
  const topOffset = (startMinutes - START_HOUR * 60) * MINUTE_HEIGHT;
  const height = duration * MINUTE_HEIGHT;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
      className={cn(
        "absolute left-0 right-1 mx-1 rounded-md border p-1 text-xs shadow-sm cursor-pointer transition-all hover:brightness-95",
        event.color || "bg-blue-100 border-blue-200 text-blue-700"
      )}
      style={{
        top: `${topOffset}px`,
        height: `${height}px`,
      }}
    >
      <div className="font-semibold truncate">{event.title}</div>
      <div className="text-[10px] opacity-90 truncate">
        {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
      </div>
    </div>
  );
};

const CurrentTimeIndicator = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const currentHours = now.getHours();
  if (currentHours < START_HOUR || currentHours > END_HOUR) return null;

  const minutesFromStart = (currentHours - START_HOUR) * 60 + now.getMinutes();
  const topOffset = minutesFromStart * MINUTE_HEIGHT;

  return (
    <div
      className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
      style={{ top: `${topOffset}px` }}
    >
      <div className="h-3 w-3 -ml-1.5 rounded-full bg-red-500 ring-2 ring-white" />
      <div className="h-[2px] w-full bg-red-500" />
    </div>
  );
};

// --- Main Layout ---

export const GymScheduler = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(SAMPLE_EVENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  // Scroll to current time on mount
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      const currentHour = new Date().getHours();
      const scrollHour = Math.max(START_HOUR, Math.min(currentHour - 1, END_HOUR));
      const scrollTo = (scrollHour - START_HOUR) * CELL_HEIGHT;
      scrollRef.current.scrollTop = scrollTo;
    }
  }, []);

  // Helpers
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday start
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const prevWeek = () => setCurrentDate(subDays(currentDate, 7));
  const goToToday = () => setCurrentDate(new Date());

  const handleSlotClick = (day: Date, hour: number) => {
    const start = setMinutes(setHours(day, hour), 0);
    const end = addMinutes(start, 60);
    setSelectedSlot({ start, end });
    setIsModalOpen(true);
  };

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  return (
    <div className="flex flex-col h-screen bg-card text-foreground border border-border rounded-xl overflow-hidden shadow-sm">
      {/* 1. Header Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-normal text-foreground">
            {format(currentDate, "MMMM yyyy")}
          </h1>
          <div className="flex items-center rounded-md border border-border bg-card shadow-sm">
            <button onClick={prevWeek} className="p-1.5 hover:bg-muted/80 text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={goToToday} className="px-3 py-1.5 text-sm font-medium border-x border-border hover:bg-muted/80 text-foreground">
              Today
            </button>
            <button onClick={nextWeek} className="p-1.5 hover:bg-muted/80 text-foreground">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           {/* Placeholder for view switcher (Day/Week/Month) */}
           <div className="px-3 py-1 text-sm font-medium text-foreground border border-border rounded-md">Week</div>
        </div>
      </div>

      {/* 2. Calendar Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Time Labels */}
        <div className="w-16 flex-shrink-0 border-r border-border bg-card overflow-hidden pt-[50px]">
             {/* The top spacing accounts for the day header height approx 50px */}
             <div className="relative" style={{ height: `${TOTAL_HOURS * CELL_HEIGHT}px` }}> {/* Match content height */}
                 {hours.map((hour) => (
                    <div
                      key={hour}
                      className="absolute right-2 text-xs text-muted-foreground transform -translate-y-1/2"
                      style={{ top: `${(hour - START_HOUR) * CELL_HEIGHT}px` }}
                    >
                      {format(setHours(new Date(), hour), "ha")}
                    </div>
                  ))}
             </div>
        </div>

        {/* Scrollable Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto relative bg-card">
           <div className="min-w-[800px]"> {/* Ensure horizontal scroll on small screens */}
              
              {/* Days Header */}
              <div className="sticky top-0 z-20 flex bg-card border-b border-border shadow-sm ml-1">
                 {weekDays.map((day, i) => (
                   <div key={i} className="flex-1 py-3 text-center border-l border-border first:border-l-0">
                     <div className={cn("text-xs font-semibold uppercase mb-1", isSameDay(day, new Date()) ? "text-blue-600" : "text-muted-foreground")}>
                       {format(day, "EEE")}
                     </div>
                     <div className={cn(
                       "text-xl font-normal h-8 w-8 mx-auto flex items-center justify-center rounded-full",
                        isSameDay(day, new Date()) ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-foreground hover:bg-muted/80 cursor-pointer"
                       )}>
                       {format(day, "d")}
                     </div>
                   </div>
                 ))}
              </div>

              {/* Time Slots Grid */}
              <div className="relative flex ml-1" style={{ height: `${TOTAL_HOURS * CELL_HEIGHT}px` }}>
                 
                 {/* Horizontal grid lines */}
                 {hours.map((_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-t border-border pointer-events-none"
                      style={{ top: `${i * CELL_HEIGHT}px` }}
                    />
                 ))}

                 {/* Day Columns */}
                 {weekDays.map((day, dayIndex) => {
                     const dayEvents = events.filter(e => isSameDay(e.start, day));
                     const isTodayCol = isSameDay(day, new Date());

                     return (
                      <div key={dayIndex} className="relative flex-1 border-l border-border first:border-l-0 h-full group">
                          
                          {/* Current Time Indicator for Today */}
                          {isTodayCol && <CurrentTimeIndicator />}

                          {/* Render Events */}
                          {dayEvents.map(event => (
                            <EventBlock key={event.id} event={event} onClick={(e) => console.log('Edit', e)} />
                          ))}

                          {/* Placeholder Slots for clicking */}
                          {hours.map((hour) => (
                             <div
                               key={`${dayIndex}-${hour}`}
                               className="absolute left-0 right-0 z-0 hover:bg-muted/50 cursor-pointer transition-colors"
                               style={{ 
                                 top: `${(hour - START_HOUR) * CELL_HEIGHT}px`,
                                 height: `${CELL_HEIGHT}px`
                               }}
                               onClick={() => handleSlotClick(day, hour)}
                             />
                          ))}
                      </div>
                     );
                 })}
              </div>
           </div>
        </div>
      </div>

       {/* Add Event Dialog (Simplified) */}
       <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg shadow-xl p-6 w-[400px] z-50">
            <Dialog.Title className="text-lg font-semibold mb-4 text-foreground">Add New Session</Dialog.Title>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Event Name</label>
                <input type="text" placeholder="e.g., Core Strength" className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Start</label>
                  <div className="flex items-center gap-2 text-sm text-foreground bg-muted px-3 py-2 rounded-md border border-border">
                    <Clock className="w-4 h-4" />
                    {selectedSlot && format(selectedSlot.start, "h:mm a")}
                  </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                   <select className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-card">
                      <option value="class">Class</option>
                      <option value="pt">Personal Training</option>
                      <option value="block">Block Time</option>
                   </select>
                </div>
              </div>

               <div className="flex justify-end gap-2 mt-6">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-muted/80 rounded-md hover:bg-border transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    // Logic to add event would go here
                    setIsModalOpen(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Save Event
                </button>
              </div>
            </div>
            
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
};
