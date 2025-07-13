import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, Heart, Users } from "lucide-react";

const ContactForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    interest: "",
    message: "",
  });
  const { toast } = useToast();

  const interestOptions = [
    "General Inquiry",
    "Devotional Gathering", 
    "Children's Class",
    "Youth Class",
    "Study Circle",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Save to database
      const { error } = await supabase
        .from("contact_inquiries")
        .insert([formData]);

      if (error) {
        throw error;
      }

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        city: "",
        interest: "",
        message: "",
      });

      toast({
        title: "Message sent successfully!",
        description: "Thank you for reaching out. We'll get back to you soon.",
      });

    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast({
        title: "Error sending message",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-community py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <Heart className="w-6 h-6 text-accent" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Connect With Our Community
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We'd love to hear from you! Whether you're interested in joining our devotional gatherings, 
              children's classes, or simply want to learn more about our community, please reach out.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-accent" />
                  Send us a message
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        type="text"
                        placeholder="San Francisco, CA"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interest">Interest *</Label>
                    <Select
                      value={formData.interest}
                      onValueChange={(value) => setFormData({ ...formData, interest: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="What are you interested in?" />
                      </SelectTrigger>
                      <SelectContent>
                        {interestOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about how we can help you connect with our community..."
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    Our Community Activities
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-accent">Devotional Gatherings</h4>
                      <p className="text-sm text-muted-foreground">
                        Join us for weekly devotional gatherings featuring prayers, 
                        music, and spiritual reflection in a warm, welcoming atmosphere.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-accent">Children's Classes</h4>
                      <p className="text-sm text-muted-foreground">
                        Spiritual education for children focusing on virtues, 
                        character development, and service to humanity.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-accent">Youth Programs</h4>
                      <p className="text-sm text-muted-foreground">
                        Empowering young people to explore their purpose and 
                        contribute to the betterment of society.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-accent">Study Circles</h4>
                      <p className="text-sm text-muted-foreground">
                        Small group study sessions exploring themes of spiritual 
                        and social development.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    Get Involved
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Whether you're new to the Bay Area or have been here for years, 
                    our community welcomes people from all backgrounds who share a 
                    commitment to unity, justice, and service.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Location:</strong> San Francisco Bay Area</p>
                    <p><strong>Response time:</strong> Within 24 hours</p>
                    <p><strong>Languages:</strong> English, Spanish, Persian, and more</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;