import Navigation from "@/components/layout/Navigation";

const CommunityBuilding = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-6">Community Building</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-muted-foreground mb-8">
              Building stronger communities through meaningful connections and inclusive spaces.
            </p>
            
            <div className="bg-gradient-community rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold mb-4">Our Approach</h2>
              <p className="mb-4">
                We believe in creating inclusive spaces where people of all backgrounds can come 
                together to build community. Our approach focuses on fostering unity in diversity 
                through shared activities and mutual service.
              </p>
            </div>
            
            <h2 className="text-2xl font-semibold mb-4">Activities & Programs</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-xl font-semibold mb-3">Devotional Gatherings</h3>
                <p className="text-muted-foreground">
                  Weekly gatherings for prayer, music, and spiritual reflection that bring 
                  people together across cultural and religious boundaries.
                </p>
              </div>
              
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-xl font-semibold mb-3">Neighborhood Conversations</h3>
                <p className="text-muted-foreground">
                  Informal discussions about issues that matter to our community and 
                  how we can work together to address them.
                </p>
              </div>
              
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-xl font-semibold mb-3">Service Projects</h3>
                <p className="text-muted-foreground">
                  Collaborative efforts to serve our neighborhoods and contribute to 
                  the betterment of our local community.
                </p>
              </div>
              
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-xl font-semibold mb-3">Cultural Celebrations</h3>
                <p className="text-muted-foreground">
                  Events that celebrate the rich diversity of our community and 
                  provide opportunities for cross-cultural learning.
                </p>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold mb-4">Getting Involved</h2>
            <p className="mb-4">
              Whether you're new to the area or have been part of the community for years, 
              there are many ways to get involved in community building activities. 
              Join us for a devotional gathering, participate in a service project, or 
              simply come to one of our neighborhood conversations.
            </p>
            
            <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
              <p className="font-medium mb-2">Ready to connect?</p>
              <p>Contact us to learn more about upcoming community building activities 
              and how you can be part of building unity in our neighborhoods.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityBuilding;