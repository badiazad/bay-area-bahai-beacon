import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Clock, Download, Mail, Phone } from "lucide-react";
import { format } from "date-fns";

type Event = {
  id: string;
  title: string;
  description: string;
  location: string;
  address: string;
  start_date: string;
  end_date: string;
  host_name: string;
  latitude?: number;
  longitude?: number;
};

type EventRSVPModalProps = {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
};

export const EventRSVPModal = ({ event, isOpen, onClose }: EventRSVPModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    guest_count: 1,
    dietary_restrictions: "",
    notes: "",
    reminder_email: true,
    reminder_sms: false,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const rsvpMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("event_rsvps")
        .insert({
          event_id: event.id,
          ...data,
        });

      if (error) throw error;

      // Send confirmation email and calendar invite
      await supabase.functions.invoke("send-event-confirmation", {
        body: {
          event_id: event.id,
          attendee_email: data.email,
          attendee_name: data.name,
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "RSVP Confirmed!",
        description: "You'll receive a confirmation email with calendar invite shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      onClose();
      setFormData({
        name: "",
        email: "",
        phone: "",
        guest_count: 1,
        dietary_restrictions: "",
        notes: "",
        reminder_email: true,
        reminder_sms: false,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "RSVP Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    rsvpMutation.mutate(formData);
  };

  const generateCalendarUrl = (type: "google" | "outlook" | "apple") => {
    const startDate = new Date(event.start_date);
    const endDate = event.end_date ? new Date(event.end_date) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    const details = `${event.description || ''}\n\nHost: ${event.host_name}\nLocation: ${event.location}${event.address ? `\nAddress: ${event.address}` : ''}`;
    
    if (type === "google") {
      const start = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const end = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(event.location)}`;
    }
    
    if (type === "outlook") {
      const start = startDate.toISOString();
      const end = endDate.toISOString();
      return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&startdt=${start}&enddt=${end}&body=${encodeURIComponent(details)}&location=${encodeURIComponent(event.location)}`;
    }
    
    return "#"; // Apple calendar would need .ics file download
  };

  const generateMapUrl = () => {
    if (event.latitude && event.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>RSVP for {event.title}</DialogTitle>
          <DialogDescription>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {format(new Date(event.start_date), "MMM d, yyyy 'at' h:mm a")}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {event.location}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="guest_count">Guests</Label>
              <Input
                id="guest_count"
                type="number"
                min="1"
                max="10"
                value={formData.guest_count}
                onChange={(e) => setFormData(prev => ({ ...prev, guest_count: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="dietary_restrictions">Dietary Restrictions</Label>
            <Input
              id="dietary_restrictions"
              value={formData.dietary_restrictions}
              onChange={(e) => setFormData(prev => ({ ...prev, dietary_restrictions: e.target.value }))}
              placeholder="e.g., vegetarian, gluten-free"
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reminder_email"
                checked={formData.reminder_email}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, reminder_email: !!checked }))
                }
              />
              <Label htmlFor="reminder_email" className="text-sm">
                Email reminders
              </Label>
            </div>
            {formData.phone && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reminder_sms"
                  checked={formData.reminder_sms}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, reminder_sms: !!checked }))
                  }
                />
                <Label htmlFor="reminder_sms" className="text-sm">
                  SMS reminders
                </Label>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={rsvpMutation.isPending} className="flex-1">
              {rsvpMutation.isPending ? "Submitting..." : "RSVP"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>

        {/* Quick Actions */}
        <div className="border-t pt-4 space-y-3">
          <h4 className="font-medium">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(generateCalendarUrl("google"), "_blank")}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Google Cal
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(generateCalendarUrl("outlook"), "_blank")}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Outlook
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(generateMapUrl(), "_blank")}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Directions
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`mailto:${event.host_name}`, "_blank")}
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Host
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};