import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@googlemaps/js-api-loader";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Calendar, 
  MapPin, 
  Clock,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload,
  X
} from "lucide-react";
import { format } from "date-fns";
import Navigation from "@/components/layout/Navigation";
import type { User } from "@supabase/supabase-js";

type Event = {
  id: string;
  title: string;
  description: string;
  location: string;
  address: string;
  start_date: string;
  end_date: string;
  calendar_type: string;
  status: string;
  host_name: string;
  host_email: string;
  max_attendees: number;
  tags: string[];
  featured_image_url: string;
  created_by: string;
  _count?: {
    rsvps: number;
  };
};

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    start_date: "",
    end_date: "",
    calendar_type: "community_gathering",
    status: "published",
    host_name: "",
    host_email: "",
    featured_image_url: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data: rolesData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);
        
        if (rolesData) {
          setUserRoles(rolesData.map(r => r.role));
        }
      }
    };

    getSession();
  }, []);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    const initAutocomplete = async () => {
      if (!locationInputRef.current) return;

      try {
        const loader = new Loader({
          apiKey: "AIzaSyBvF8GX2tY5QH9pM4V4Q1L8aX0H1I2J3K4", // Replace with your Google Maps API key
          version: "weekly",
          libraries: ["places"]
        });

        await loader.load();
        
        autocompleteRef.current = new (window as any).google.maps.places.Autocomplete(
          locationInputRef.current,
          {
            types: ["establishment", "geocode"],
            fields: ["formatted_address", "name", "place_id"]
          }
        );

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current?.getPlace();
          if (place) {
            setFormData(prev => ({
              ...prev,
              location: place.name || place.formatted_address || ""
            }));
          }
        });
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };

    initAutocomplete();
  }, [showCreateModal, editingEvent]);

  const hasAdminAccess = userRoles.includes('admin') || userRoles.includes('editor') || userRoles.includes('author');

  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          event_rsvps(count)
        `)
        .order("start_date", { ascending: true });

      if (error) throw error;

      return data?.map(event => ({
        ...event,
        _count: {
          rsvps: event.event_rsvps?.[0]?.count || 0
        }
      }));
    },
    enabled: hasAdminAccess,
  });

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `event-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      let imageUrl = data.featured_image_url;
      
      if (selectedImage) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadImage(selectedImage);
        } finally {
          setUploadingImage(false);
        }
      }

      const eventData = {
        ...data,
        featured_image_url: imageUrl || null,
        created_by: user?.id,
      };

      const { error } = await supabase.from("events").insert(eventData);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Event created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setShowCreateModal(false);
      setSelectedImage(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      let imageUrl = data.featured_image_url;
      
      if (selectedImage) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadImage(selectedImage);
        } finally {
          setUploadingImage(false);
        }
      }

      const eventData = {
        ...data,
        featured_image_url: imageUrl || null,
      };

      const { error } = await supabase.from("events").update(eventData).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Event updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setEditingEvent(null);
      setSelectedImage(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Event deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      start_date: "",
      end_date: "",
      calendar_type: "community_gathering",
      status: "published",
      host_name: "",
      host_email: "",
      featured_image_url: "",
    });
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      location: event.location,
      start_date: event.start_date.slice(0, 16),
      end_date: event.end_date ? event.end_date.slice(0, 16) : "",
      calendar_type: event.calendar_type,
      status: event.status,
      host_name: event.host_name,
      host_email: event.host_email,
      featured_image_url: event.featured_image_url || "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      updateEventMutation.mutate({ id: editingEvent.id, data: formData });
    } else {
      createEventMutation.mutate(formData);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800";
      case "draft": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please sign in to access the admin panel</h1>
            <Button onClick={() => window.location.href = "/auth"}>Sign In</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p>You don't have permission to access the admin panel.</p>
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
          <h1 className="text-4xl font-bold text-foreground mb-4">Admin Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Manage events, content, and community activities
          </p>
        </div>

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="rsvps">RSVPs</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Event Management</h2>
              <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingEvent ? "Edit Event" : "Create New Event"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Event Title *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="calendar_type">Event Type</Label>
                        <Select value={formData.calendar_type} onValueChange={(value) => setFormData(prev => ({ ...prev, calendar_type: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="devotional">Devotional Gathering</SelectItem>
                            <SelectItem value="youth_class">Youth Class</SelectItem>
                            <SelectItem value="childrens_class">Children's Class</SelectItem>
                            <SelectItem value="study_circle">Study Circle</SelectItem>
                            <SelectItem value="holy_day">Holy Day</SelectItem>
                            <SelectItem value="community_gathering">Community Gathering</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        ref={locationInputRef}
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Start typing to search for a location..."
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="image">Event Image</Label>
                      <div className="space-y-2">
                        {(formData.featured_image_url || selectedImage) && (
                          <div className="relative inline-block">
                            <img 
                              src={selectedImage ? URL.createObjectURL(selectedImage) : formData.featured_image_url} 
                              alt="Event preview" 
                              className="h-32 w-48 object-cover rounded-md border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1"
                              onClick={() => {
                                setSelectedImage(null);
                                setFormData(prev => ({ ...prev, featured_image_url: "" }));
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setSelectedImage(file);
                                setFormData(prev => ({ ...prev, featured_image_url: "" }));
                              }
                            }}
                            className="hidden"
                            id="image-upload"
                          />
                          <Label htmlFor="image-upload" className="cursor-pointer">
                            <Button type="button" variant="outline" asChild>
                              <span>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Image
                              </span>
                            </Button>
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_date">Start Date & Time *</Label>
                        <Input
                          id="start_date"
                          type="datetime-local"
                          value={formData.start_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_date">End Date & Time</Label>
                        <Input
                          id="end_date"
                          type="datetime-local"
                          value={formData.end_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="host_name">Host Name *</Label>
                        <Input
                          id="host_name"
                          value={formData.host_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, host_name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="host_email">Host Email *</Label>
                        <Input
                          id="host_email"
                          type="email"
                          value={formData.host_email}
                          onChange={(e) => setFormData(prev => ({ ...prev, host_email: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={createEventMutation.isPending || updateEventMutation.isPending || uploadingImage}>
                        {uploadingImage ? "Uploading..." : editingEvent ? "Update Event" : "Create Event"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => {
                        setShowCreateModal(false);
                        setEditingEvent(null);
                        setSelectedImage(null);
                        resetForm();
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {isLoading ? (
              <div>Loading events...</div>
            ) : (
              <div className="grid gap-4">
                {events?.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {event.title}
                            <Badge className={getStatusColor(event.status)}>
                              {event.status}
                            </Badge>
                          </CardTitle>
                          <div className="text-sm text-muted-foreground mt-2 space-y-1">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              {format(new Date(event.start_date), "MMM d, yyyy 'at' h:mm a")}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              {event.location}
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              {event._count?.rsvps || 0} RSVPs
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(event)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteEventMutation.mutate(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rsvps">
            <div>RSVP management coming soon...</div>
          </TabsContent>

          <TabsContent value="content">
            <div>Content management coming soon...</div>
          </TabsContent>

          <TabsContent value="users">
            <div>User management coming soon...</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;