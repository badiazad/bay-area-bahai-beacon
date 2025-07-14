import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Mail } from "lucide-react";
import { format } from "date-fns";

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
  _count?: {
    rsvps: number;
  };
};

type EventDetailsDialogProps = {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onRSVP: (event: Event) => void;
  onEmailHost: (event: Event) => void;
  generateCalendarUrl: (event: Event, type: "google" | "outlook") => string;
  generateMapUrl: (event: Event) => string;
};

export const EventDetailsDialog = ({
  event,
  isOpen,
  onClose,
  onRSVP,
  onEmailHost,
  generateCalendarUrl,
  generateMapUrl,
}: EventDetailsDialogProps) => {
  if (!event) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
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
          <DialogTitle className="text-2xl">{event.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {event.featured_image_url && (
            <div className="aspect-video overflow-hidden rounded-lg">
              <img
                src={event.featured_image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {event.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{event.description}</p>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{formatDate(event.start_date)}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Host: {event.host_name}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={() => onRSVP(event)} className="w-full">
              RSVP
            </Button>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
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
                onClick={() => window.open(generateCalendarUrl(event, "outlook"), "_blank")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Outlook
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
                onClick={() => onEmailHost(event)}
                title={`Email ${event.host_name}`}
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Host
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};