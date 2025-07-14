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
    address: "",
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

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) errors.push("Name is required");
    if (!formData.email.trim()) errors.push("Email is required");
    if (!formData.message.trim()) errors.push("Message is required");
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push("Please enter a valid email address");
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form data
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        toast({
          title: "Please check your information",
          description: validationErrors.join(", "),
          variant: "destructive",
        });
        return;
      }

      // Prepare clean data for database
      const cleanFormData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        interest: formData.interest || null,
        message: formData.message.trim(),
      };

      // Save to database
      const { error: dbError } = await supabase
        .from("contact_inquiries")
        .insert([cleanFormData]);

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Send emails via edge function
      try {
        const { error: emailError } = await supabase.functions.invoke('send-contact-emails', {
          body: cleanFormData
        });

        if (emailError) {
          console.error("Email error:", emailError);
          // Email failure doesn't fail the whole process
          toast({
            title: "Message saved successfully!",
            description: "Your message was saved but confirmation email may be delayed. We'll get back to you soon.",
          });
        } else {
          toast({
            title: "Message sent successfully!",
            description: "Thank you for reaching out. Check your email for confirmation and we'll get back to you soon.",
          });
        }
      } catch (emailError) {
        console.error("Email function error:", emailError);
        toast({
          title: "Message saved successfully!",
          description: "Your message was saved but confirmation email may be delayed. We'll get back to you soon.",
        });
      }

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        interest: "",
        message: "",
      });

    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      
      let errorMessage = "An unexpected error occurred. Please try again later.";
      
      if (error.message?.includes("duplicate key value")) {
        errorMessage = "It looks like you've already submitted this message recently. Please wait a moment before submitting again.";
      } else if (error.message?.includes("violates row-level security")) {
        errorMessage = "There was a permission error. Please refresh the page and try again.";
      } else if (error.message?.includes("Network")) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      toast({
        title: "Error sending message",
        description: errorMessage,
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
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        type="text"
                        placeholder="San Francisco, CA"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interest">Interest</Label>
                    <Select
                      value={formData.interest}
                      onValueChange={(value) => setFormData({ ...formData, interest: value })}
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
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about how we can help you connect with our community..."
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
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
                    Visit or Contact Us
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-accent">San Francisco Baha'i Center</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>355 Bryant St, Unit 110</p>
                        <p>San Francisco, CA 94107</p>
                        <p>United States</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-accent">Contact Information</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Phone:</strong> (415) 431-9990</p>
                        <p><strong>Email:</strong> office@sfbahai.org</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    Connect With Us
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    If you're interested in learning more about the Baha'i Faith or would like to attend an event, we'd be delighted to hear from you.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    You can use the contact form, call us, or simply stop by our center during office hours.
                  </p>
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