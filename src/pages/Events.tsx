import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, Search, Filter, LayoutGrid, Calendar as CalendarIcon, Mail } from "lucide-react";
import { format } from "date-fns";
import Navigation from "@/components/layout/Navigation";
import { EventRSVPModal } from "@/components/events/EventRSVPModal";
import { EventCalendarView } from "@/components/events/EventCalendarView";
import { EventDetailsDialog } from "@/components/events/EventDetailsDialog";

type Event = {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  calendar_type: string;
  featured_image_url: string;
  host_name: string;
  host_email: string;
  status: string;
  slug: string;
  created_at: string;
  created_by: string;
  _count?: {
    rsvps: number;
  };
};

const Events = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [calendarFilter, setCalendarFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const { data: events, isLoading, error, refetch } = useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: async (): Promise<Event[]> => {
      console.log("🔍 Fetching events from database");
      
      try {
        let query = supabase
          .from("events")
          .select("*")
          .eq("status", "published")
          .order("start_date", { ascending: true })
          .limit(20); // Reduced limit for faster loading

        // Apply database-level filtering for better performance
        if (calendarFilter !== "all") {
          query = query.eq("calendar_type", calendarFilter as any);
        }

        if (searchTerm) {
          query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("❌ Database error:", error);
          throw new Error(`Failed to load events: ${error.message}`);
        }

        console.log("✅ Events loaded:", data?.length || 0);
        return data || [];
        
      } catch (error: any) {
        console.error("💥 Query failed:", error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: true, // Always enabled
  });

  // Separate query for search/filter to avoid blocking initial load
  const { data: filteredEvents } = useQuery<Event[]>({
    queryKey: ["events-filtered", searchTerm, calendarFilter],
    queryFn: async (): Promise<Event[]> => {
      if (!searchTerm && calendarFilter === "all") {
        return events || [];
      }
      
      let query = supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .order("start_date", { ascending: true })
        .limit(20);

      if (calendarFilter !== "all") {
        query = query.eq("calendar_type", calendarFilter as any);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      return data || [];
    },
    enabled: !!(searchTerm || calendarFilter !== "all"),
    staleTime: 30 * 1000, // 30 seconds for search results
  });

  const displayEvents = filteredEvents || events;

  const handleRSVP = (event: Event) => {
    setSelectedEvent(event);
    setShowRSVPModal(true);
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setShowDetailsDialog(true);
  };

  const handleEmailHost = (event: Event) => {
    const subject = encodeURIComponent(`Question about "${event.title}"`);
    const body = encodeURIComponent(
      `Hi ${event.host_name},\n\nI have a question about the "${event.title}" event scheduled for ${formatDate(event.start_date)} at ${event.location}.\n\n${event.description ? `Event Description: ${event.description}\n\n` : ''}Please let me know:\n\nThank you!\n\nBest regards`
    );
    
    window.open(`mailto:${event.host_email}?subject=${subject}&body=${body}`, "_blank");
  };

  const generateCalendarUrl = (event: Event, type: "google" | "apple") => {
    const startDate = new Date(event.start_date);
    const endDate = event.end_date ? new Date(event.end_date) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    const details = `${event.description || ''}\n\nHost: ${event.host_name}\nLocation: ${event.location}`;
    
    if (type === "google") {
      const start = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const end = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(event.location)}`;
    }
    
    if (type === "apple") {
      const start = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const end = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Organization//Events//EN
BEGIN:VEVENT
UID:${event.id}@yourdomain.com
DTSTART:${start}
DTEND:${end}
SUMMARY:${event.title}
DESCRIPTION:${details.replace(/\n/g, '\\n')}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;
      
      const blob = new Blob([icsContent], { type: 'text/calendar' });
      return URL.createObjectURL(blob);
    }
    
    return "#";
  };

  const generateMapUrl = (event: Event) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  };

  const getCalendarTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      devotional: "bg-blue-100 text-blue-800",
      youth_class: "bg-purple-100 text-purple-800",
      childrens_class: "bg-yellow-100 text-yellow-800",
      study_circle: "bg-green-100 text-green-800",
      holy_day: "bg-red-100 text-red-800",
      community_gathering: "bg-indigo-100 text-indigo-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[type] || colors.other;
  };

  const calendarTypes = [
    { value: "all", label: "All Events" },
    { value: "devotional", label: "Devotional Gatherings" },
    { value: "youth_class", label: "Youth Classes" },
    { value: "childrens_class", label: "Children's Classes" },
    { value: "study_circle", label: "Study Circles" },
    { value: "holy_day", label: "Holy Days" },
    { value: "community_gathering", label: "Community Gatherings" },
    { value: "other", label: "Other" },
  ];

  console.log("🎬 Events page render - State:", { 
    isLoading, 
    hasError: !!error, 
    eventsCount: events?.length || 0,
    searchTerm,
    calendarFilter
  });

  if (error) {
    console.error("💥 Events page error details:", error);
  }

  if (isLoading) {
    console.log("⏳ Showing loading state");
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading events...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Fetching community events from database...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("❌ Rendering error state");
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Community Events</h1>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-destructive font-medium mb-2">Unable to load events</p>
              <p className="text-sm text-muted-foreground mb-4">
                {error.message.includes('timeout') 
                  ? 'The request timed out. Please try again.' 
                  : `Error: ${error.message || 'Unknown error occurred'}`
                }
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => refetch()} 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Retrying...' : 'Try Again'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()} 
                  className="w-full"
                >
                  Refresh Page
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Community Events</h1>
          <p className="text-muted-foreground text-lg">
            Join us for devotional gatherings, study circles, and community activities
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search events, locations, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={calendarFilter} onValueChange={setCalendarFilter}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {calendarTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              size="sm"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              List View
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              onClick={() => setViewMode("calendar")}
              size="sm"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendar View
            </Button>
          </div>
        </div>

        {/* Content */}
        {viewMode === "calendar" ? (
          <EventCalendarView events={displayEvents || []} onEventSelect={handleEventSelect} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayEvents?.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {event.featured_image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={event.featured_image_url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getCalendarTypeColor(event.calendar_type)}>
                      {event.calendar_type.replace('_', ' ')}
                    </Badge>
                    {event._count?.rsvps > 0 && (
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {event._count.rsvps} RSVP{event._count.rsvps !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{event.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {formatDate(event.start_date)}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Host: {event.host_name}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button onClick={() => handleRSVP(event)} className="w-full">
                    RSVP
                  </Button>
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(generateCalendarUrl(event, "google"), "_blank")}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Google Cal
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = generateCalendarUrl(event, "apple");
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
                        link.click();
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Apple Cal
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(generateMapUrl(event), "_blank")}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Directions
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEmailHost(event)}
                      title={`Email ${event.host_name}`}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Contact Host
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {displayEvents?.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No events found matching your criteria.</p>
          </div>
        )}

      </div>

      {/* Event Details Dialog */}
      {selectedEvent && (
        <EventDetailsDialog
          event={selectedEvent}
          isOpen={showDetailsDialog}
          onClose={() => {
            setShowDetailsDialog(false);
            setSelectedEvent(null);
          }}
          onRSVP={handleRSVP}
          onEmailHost={handleEmailHost}
          generateCalendarUrl={generateCalendarUrl}
          generateMapUrl={generateMapUrl}
        />
      )}

      {/* RSVP Modal */}
      {selectedEvent && (
        <EventRSVPModal
          event={selectedEvent}
          isOpen={showRSVPModal}
          onClose={() => {
            setShowRSVPModal(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default Events;