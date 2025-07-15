
import { useState, useEffect, useRef } from "react";
import PageEditor from "@/components/admin/PageEditor";
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
import { Switch } from "@/components/ui/switch";
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
  start_date: string;
  end_date: string;
  calendar_type: string;
  status: string;
  host_name: string;
  host_email: string;
  featured_image_url: string;
  is_recurring: boolean;
  recurrence_type: string;
  recurrence_interval: number;
  recurrence_end_date: string;
  slug: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  parent_event_id: string;
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
    is_recurring: false,
    recurrence_type: "none",
    recurrence_interval: 1,
    recurrence_end_date: "",
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

  // Load Google Maps API and initialize autocomplete
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        console.log("Starting to load Google Maps API...");
        
        // Check if already loaded
        if ((window as any).google?.maps?.places) {
          console.log("Google Maps API already loaded");
          return;
        }
        
        // Set up a promise that resolves when Google Maps is loaded
        const googleMapsPromise = new Promise<void>((resolve) => {
          // Override the callback function
          (window as any).initGoogleMaps = () => {
            console.log("Google Maps callback fired - API is ready!");
            resolve();
          };
          
          // Also check periodically in case callback doesn't fire
          const checkInterval = setInterval(() => {
            if ((window as any).google?.maps?.places) {
              console.log("Google Maps detected via polling");
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
          
          // Timeout after 15 seconds
          setTimeout(() => {
            console.error("Timeout waiting for Google Maps to load");
            clearInterval(checkInterval);
            resolve();
          }, 15000);
        });
        
        // Load Google Maps script via our edge function
        const script = document.createElement('script');
        script.src = 'https://hrbouetcqtxlmlpqboqr.supabase.co/functions/v1/google-maps-config';
        script.async = true;
        
        script.onload = () => {
          console.log("Google Maps config script loaded and executed");
        };
        
        script.onerror = (error) => {
          console.warn("Google Maps config script failed to load, using regular text input:", error);
          // Don't let this error prevent the rest of the app from working
        };
        
        document.head.appendChild(script);
        
        // Wait for Google Maps to be ready
        await googleMapsPromise;
        console.log("Google Maps loading process completed");
        
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };

    loadGoogleMaps();
  }, []);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    const initAutocomplete = async () => {
      if (!locationInputRef.current) {
        console.log("Location input ref not available");
        return;
      }

      try {
        console.log("Attempting to initialize autocomplete...");
        
        // Check if Google Maps is loaded
        if (!(window as any).google?.maps?.places) {
          console.log("Google Maps API not available - using regular text input");
          return;
        }

        console.log("Google Maps API detected, initializing autocomplete...");

        autocompleteRef.current = new (window as any).google.maps.places.Autocomplete(
          locationInputRef.current,
          {
            types: ["establishment", "geocode"],
            fields: ["formatted_address", "name", "place_id"]
          }
        );

        autocompleteRef.current.addListener("place_changed", () => {
          console.log("Place changed event fired");
          const place = autocompleteRef.current?.getPlace();
          if (place) {
            console.log("Selected place:", place);
            setFormData(prev => ({
              ...prev,
              location: place.name || place.formatted_address || ""
            }));
          }
        });
        
        console.log("Google Maps autocomplete initialized successfully");
      } catch (error) {
        console.error("Error initializing Google Maps autocomplete:", error);
      }
    };

    // Only initialize when modal is open and after a small delay
    if (showCreateModal || editingEvent) {
      console.log("Modal is open, will initialize autocomplete...");
      setTimeout(initAutocomplete, 1000); // Increased delay
    }
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
    try {
      console.log("Starting image upload for file:", file.name, "Size:", file.size);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `event-images/${fileName}`;

      console.log("Uploading to path:", filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log("Upload successful, getting public URL...");

      const { data } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      console.log("Public URL generated:", data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    }
  };

  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Creating event with data:", data);
      let imageUrl = data.featured_image_url;
      
      if (selectedImage) {
        console.log("Uploading image:", selectedImage.name, "Size:", selectedImage.size);
        try {
          imageUrl = await uploadImage(selectedImage);
          console.log("Image uploaded successfully:", imageUrl);
        } catch (error) {
          console.error("Image upload failed:", error);
          throw new Error("Failed to upload image: " + (error as Error).message);
        }
      } else if (!imageUrl || imageUrl.trim() === '') {
        // Skip default image for now to prevent hanging - can be added back later
        console.log("No image provided, proceeding without default image");
        imageUrl = null;
      }

      const eventData = {
        title: data.title,
        description: data.description || null,
        location: data.location,
        start_date: data.start_date.includes('T') ? data.start_date + ':00.000Z' : data.start_date,
        end_date: data.end_date && data.end_date.trim() !== '' ? 
          (data.end_date.includes('T') ? data.end_date + ':00.000Z' : data.end_date) : null,
        calendar_type: data.calendar_type,
        status: data.status,
        host_name: data.host_name,
        host_email: data.host_email,
        featured_image_url: imageUrl || null,
        created_by: user?.id,
        is_recurring: data.is_recurring,
        recurrence_type: data.is_recurring ? data.recurrence_type : 'none',
        recurrence_interval: data.is_recurring ? parseInt(data.recurrence_interval) : null,
        recurrence_end_date: data.is_recurring && data.recurrence_end_date ? data.recurrence_end_date : null,
        slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      };

      console.log("Final event data:", eventData);
      console.log("About to insert into database...");

      const { data: insertedData, error } = await supabase.from("events").insert(eventData).select();
      if (error) {
        console.error("Database insert error:", error);
        throw new Error(`Database error: ${error.message}`);
      }
      console.log("Event created successfully in database:", insertedData);
      return insertedData;
    },
    onSuccess: () => {
      console.log("Event created successfully");
      toast({ title: "Event created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setShowCreateModal(false);
      setSelectedImage(null);
      resetForm();
    },
    onError: (error: Error) => {
      console.error("Event creation error:", error);
      toast({
        title: "Error creating event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      console.log("Updating event with data:", data);
      let imageUrl = data.featured_image_url;
      
      if (selectedImage) {
        console.log("Uploading new image:", selectedImage.name, "Size:", selectedImage.size);
        try {
          imageUrl = await uploadImage(selectedImage);
          console.log("Image uploaded successfully:", imageUrl);
        } catch (error) {
          console.error("Image upload failed:", error);
          throw new Error("Failed to upload image: " + (error as Error).message);
        }
      }

      const eventData = {
        title: data.title,
        description: data.description || null,
        location: data.location,
        start_date: data.start_date.includes('T') ? data.start_date + ':00.000Z' : data.start_date,
        end_date: data.end_date && data.end_date.trim() !== '' ? 
          (data.end_date.includes('T') ? data.end_date + ':00.000Z' : data.end_date) : null,
        calendar_type: data.calendar_type,
        status: data.status,
        host_name: data.host_name,
        host_email: data.host_email,
        featured_image_url: imageUrl || null,
        is_recurring: data.is_recurring,
        recurrence_type: data.is_recurring ? data.recurrence_type : 'none',
        recurrence_interval: data.is_recurring ? parseInt(data.recurrence_interval) : null,
        recurrence_end_date: data.is_recurring && data.recurrence_end_date ? data.recurrence_end_date : null,
      };

      console.log("Final update data:", eventData);

      const { error } = await supabase.from("events").update(eventData).eq("id", id);
      if (error) {
        console.error("Database update error:", error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      console.log("Event updated successfully in database");
    },
    onSuccess: () => {
      console.log("Event updated successfully");
      toast({ title: "Event updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setEditingEvent(null);
      setSelectedImage(null);
      resetForm();
    },
    onError: (error: Error) => {
      console.error("Event update error:", error);
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
      is_recurring: false,
      recurrence_type: "none",
      recurrence_interval: 1,
      recurrence_end_date: "",
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
      is_recurring: event.is_recurring || false,
      recurrence_type: event.recurrence_type || "none",
      recurrence_interval: event.recurrence_interval || 1,
      recurrence_end_date: event.recurrence_end_date ? event.recurrence_end_date.slice(0, 10) : "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted", { formData, selectedImage, editingEvent });
    
    try {
      if (editingEvent) {
        console.log("Calling update mutation...");
        updateEventMutation.mutate({ id: editingEvent.id, data: formData });
      } else {
        console.log("Calling create mutation...");
        createEventMutation.mutate(formData);
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Error submitting form",
        description: "Please try again or check your connection.",
        variant: "destructive",
      });
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

  const isSubmitting = createEventMutation.isPending || updateEventMutation.isPending;

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
              <Dialog open={showCreateModal || !!editingEvent} onOpenChange={(open) => {
                if (!open) {
                  setShowCreateModal(false);
                  setEditingEvent(null);
                  setSelectedImage(null);
                  resetForm();
                } else if (!editingEvent) {
                  setShowCreateModal(true);
                }
              }}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    resetForm();
                    setEditingEvent(null);
                    setShowCreateModal(true);
                  }}>
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
                        placeholder="Enter location"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Type to search for locations with Google autocomplete
                      </p>
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
                                console.log("Image selected:", file.name, file.size);
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

                    <div className="space-y-4 border-t pt-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_recurring"
                          checked={formData.is_recurring}
                          onCheckedChange={(checked) => setFormData(prev => ({ 
                            ...prev, 
                            is_recurring: checked,
                            recurrence_type: checked ? "weekly" : "none"
                          }))}
                        />
                        <Label htmlFor="is_recurring">Recurring Event</Label>
                      </div>

                      {formData.is_recurring && (
                        <div className="space-y-4 ml-6 p-4 bg-muted/30 rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="recurrence_type">Repeat</Label>
                              <Select 
                                value={formData.recurrence_type} 
                                onValueChange={(value) => setFormData(prev => ({ ...prev, recurrence_type: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="daily">Daily</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                  <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="recurrence_interval">Every</Label>
                              <div className="flex items-center space-x-2">
                                <Input
                                  id="recurrence_interval"
                                  type="number"
                                  min="1"
                                  max="99"
                                  value={formData.recurrence_interval}
                                  onChange={(e) => setFormData(prev => ({ ...prev, recurrence_interval: parseInt(e.target.value) || 1 }))}
                                  className="w-20"
                                />
                                <span className="text-sm text-muted-foreground">
                                  {formData.recurrence_type === "daily" && (formData.recurrence_interval === 1 ? "day" : "days")}
                                  {formData.recurrence_type === "weekly" && (formData.recurrence_interval === 1 ? "week" : "weeks")}
                                  {formData.recurrence_type === "monthly" && (formData.recurrence_interval === 1 ? "month" : "months")}
                                  {formData.recurrence_type === "yearly" && (formData.recurrence_interval === 1 ? "year" : "years")}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="recurrence_end_date">End Date (optional)</Label>
                            <Input
                              id="recurrence_end_date"
                              type="date"
                              value={formData.recurrence_end_date}
                              onChange={(e) => setFormData(prev => ({ ...prev, recurrence_end_date: e.target.value }))}
                              min={formData.start_date ? formData.start_date.split('T')[0] : undefined}
                            />
                          </div>
                        </div>
                      )}
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
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}
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
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold">Content Management</h3>
              
              <Tabs defaultValue="home" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="home">Home Page</TabsTrigger>
                  <TabsTrigger value="community-building">Community Building</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="social-action">Social Action</TabsTrigger>
                </TabsList>
                
                <TabsContent value="home" className="mt-6">
                  <PageEditor pageSlug="home" pageName="Home Page" />
                </TabsContent>
                
                <TabsContent value="community-building" className="mt-6">
                  <PageEditor pageSlug="community-building" pageName="Community Building" />
                </TabsContent>
                
                <TabsContent value="education" className="mt-6">
                  <PageEditor pageSlug="education" pageName="Education" />
                </TabsContent>
                
                <TabsContent value="social-action" className="mt-6">
                  <PageEditor pageSlug="social-action" pageName="Social Action" />
                </TabsContent>
              </Tabs>
            </div>
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
