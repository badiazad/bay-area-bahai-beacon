import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, Search, Filter, LayoutGrid, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import Navigation from "@/components/layout/Navigation";
import { EventRSVPModal } from "@/components/events/EventRSVPModal";
import { EventCalendarView } from "@/components/events/EventCalendarView";

type Event = {
  id: string;
  title: string;
  description: string;
  location: string;
  address: string;
  start_date: string;
  end_date: string;
  calendar_type: string;
  featured_image_url: string;
  host_name: string;
  max_attendees: number;
  tags: string[];
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

  const { data: events, isLoading } = useQuery({
    queryKey: ["events", searchTerm, calendarFilter],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select(`
          *,
          event_rsvps(count)
        `)
        .eq("status", "published")
        .order("start_date", { ascending: true });

      if (searchTerm) {
        query = query.or(
          `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`
        );
      }

      if (calendarFilter !== "all") {
        query = query.eq("calendar_type", calendarFilter as any);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data?.map(event => ({
        ...event,
        _count: {
          rsvps: event.event_rsvps?.[0]?.count || 0
        }
      }));
    },
  });

  const handleRSVP = (event: Event) => {
    setSelectedEvent(event);
    setShowRSVPModal(true);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading events...</div>
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
          <EventCalendarView events={events || []} onEventSelect={handleRSVP} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events?.map((event) => (
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
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {formatDate(event.start_date)}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Host: {event.host_name}
                    </div>
                  </div>
                  {event.description && (
                    <p className="mt-3 text-sm line-clamp-3">{event.description}</p>
                  )}
                  {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {event.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button onClick={() => handleRSVP(event)} className="flex-1">
                    RSVP
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {events?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No events found matching your criteria.</p>
          </div>
        )}
      </div>

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