import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/layout/Navigation";
import heroImage from "@/assets/bahai-community-hero.jpg";
import { 
  Calendar, 
  Users, 
  Heart, 
  BookOpen, 
  Sparkles, 
  ChevronRight,
  Clock,
  MapPin,
  UserPlus,
  GraduationCap,
  TreePine
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  excerpt: string;
  published_at: string;
  type: string;
}

interface Post {
  id: string;
  title: string;
  excerpt: string;
  published_at: string;
  featured_image_url: string;
}

const Home = () => {
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Fetch recent events
        const { data: eventsData } = await supabase
          .from("content")
          .select("id, title, excerpt, published_at, type")
          .eq("type", "event")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(3);

        // Fetch recent posts
        const { data: postsData } = await supabase
          .from("content")
          .select("id, title, excerpt, published_at, featured_image_url")
          .eq("type", "post")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(3);

        setRecentEvents(eventsData || []);
        setRecentPosts(postsData || []);
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/60" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Users className="w-8 h-8" />
            </div>
            <Heart className="w-8 h-8" />
            <Sparkles className="w-6 h-6" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Welcome to Our
            <span className="block bg-gradient-to-r from-yellow-400 to-orange-300 bg-clip-text text-transparent">
              Community
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-95">
            Join the San Francisco Baha'i community in building unity, fostering spiritual growth, 
            and serving humanity through love, justice, and fellowship.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="warm" size="lg" asChild className="text-lg px-8 py-6">
              <Link to="/contact">
                <Heart className="mr-2 h-5 w-5" />
                Join Our Community
              </Link>
            </Button>
            <Button variant="community" size="lg" asChild className="text-lg px-8 py-6">
              <Link to="/events">
                <Calendar className="mr-2 h-5 w-5" />
                Upcoming Events
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 bg-gradient-community">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              What We Do in San Francisco
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Building stronger communities through meaningful action and connection
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-soft hover:shadow-medium transition-all duration-300 transform hover:scale-105">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Community Building</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  We foster inclusive spaces where people of all backgrounds come together to build community through devotional gatherings, study circles, and service projects.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-medium transition-all duration-300 transform hover:scale-105">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Education</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  We offer spiritual education for children, junior youth empowerment programs, and adult study circles focused on applying spiritual principles to everyday life.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-medium transition-all duration-300 transform hover:scale-105">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                  <TreePine className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Social Action</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  We engage in service projects and social action initiatives aimed at contributing to the betterment of our neighborhoods and addressing social issues.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Upcoming Events
              </h2>
              <p className="text-xl text-muted-foreground">
                Join us for these community gatherings and activities
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/events">
                View All Events
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentEvents.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {recentEvents.map((event) => (
                <Card key={event.id} className="shadow-soft hover:shadow-medium transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">
                        <Calendar className="w-3 h-3 mr-1" />
                        Event
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(event.published_at)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      {event.excerpt || "Join us for this special community event."}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-soft">
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <CardDescription className="text-lg">
                  No upcoming events at the moment. Check back soon for new community gatherings!
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Community Activities Section */}
      <section className="py-20 bg-gradient-community">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Get Involved
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the many ways to connect and contribute to our community
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-soft hover:shadow-medium transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Devotional Gatherings</h3>
                <p className="text-sm text-muted-foreground">
                  Weekly gatherings for prayer, music, and spiritual reflection
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-medium transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Children's Classes</h3>
                <p className="text-sm text-muted-foreground">
                  Spiritual education focusing on virtues and character development
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-medium transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Youth Programs</h3>
                <p className="text-sm text-muted-foreground">
                  Empowering young people to explore their purpose and potential
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-medium transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Study Circles</h3>
                <p className="text-sm text-muted-foreground">
                  Small group studies exploring themes of spiritual development
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button variant="hero" size="lg" asChild>
              <Link to="/contact">
                <Heart className="mr-2 h-5 w-5" />
                Connect With Us
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-accent-foreground" />
                </div>
                <Heart className="w-4 h-4 text-accent" />
                <span className="font-bold">SF Baha'i Community</span>
              </div>
              <p className="text-primary-foreground/80">
                Building unity, fostering spiritual growth, and serving humanity 
                in the beautiful San Francisco Bay Area.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/events" className="block text-primary-foreground/80 hover:text-accent transition-colors">
                  Events
                </Link>
                <Link to="/gallery" className="block text-primary-foreground/80 hover:text-accent transition-colors">
                  Gallery
                </Link>
                <Link to="/contact" className="block text-primary-foreground/80 hover:text-accent transition-colors">
                  Contact Us
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Location</h3>
              <div className="flex items-start gap-2 text-primary-foreground/80">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>San Francisco Bay Area, California</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
            <p>&copy; 2024 San Francisco Baha'i Community. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;