import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock, MapPin, Users } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

type Event = {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  calendar_type: string;
  host_name: string;
  _count?: {
    rsvps: number;
  };
};

type EventCalendarViewProps = {
  events: Event[];
  onEventSelect: (event: Event) => void;
};

export const EventCalendarView = ({ events, onEventSelect }: EventCalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.start_date), day)
    );
  };

  const getCalendarTypeColor = (type: string) => {
    const colors = {
      devotional: "bg-blue-500",
      youth_class: "bg-purple-500",
      childrens_class: "bg-yellow-500",
      study_circle: "bg-green-500",
      holy_day: "bg-red-500",
      community_gathering: "bg-indigo-500",
      other: "bg-gray-500",
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="p-3 text-center font-medium text-muted-foreground">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {daysInMonth.map(day => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <Card 
              key={day.toISOString()} 
              className={`min-h-[120px] ${!isCurrentMonth ? 'opacity-50' : ''} ${isToday ? 'ring-2 ring-primary' : ''}`}
            >
              <CardHeader className="p-2">
                <div className="text-sm font-medium">
                  {format(day, "d")}
                </div>
              </CardHeader>
              <CardContent className="p-2 space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: `${getCalendarTypeColor(event.calendar_type)}20` }}
                    onClick={() => onEventSelect(event)}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="text-muted-foreground">
                      {formatTime(event.start_date)}
                    </div>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center">
        {[
          { type: "devotional", label: "Devotional" },
          { type: "youth_class", label: "Youth Class" },
          { type: "childrens_class", label: "Children's Class" },
          { type: "study_circle", label: "Study Circle" },
          { type: "holy_day", label: "Holy Day" },
          { type: "community_gathering", label: "Community" },
          { type: "other", label: "Other" },
        ].map(({ type, label }) => (
          <div key={type} className="flex items-center gap-2">
            <div 
              className={`w-3 h-3 rounded ${getCalendarTypeColor(type)}`}
            />
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};