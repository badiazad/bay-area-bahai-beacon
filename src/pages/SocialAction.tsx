import Navigation from "@/components/layout/Navigation";

const SocialAction = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-6">Social Action</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-muted-foreground mb-8">
              Working together to address social issues and contribute to the betterment of our communities.
            </p>
            
            <div className="bg-gradient-community rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold mb-4">Our Approach to Social Action</h2>
              <p className="mb-4">
                Our social action efforts are guided by principles of justice, unity, and service. 
                We believe in addressing root causes of social problems through collaborative 
                action that builds capacity within communities and promotes sustainable change.
              </p>
            </div>
            
            <h2 className="text-2xl font-semibold mb-4">Current Initiatives</h2>
            
            <div className="space-y-6 mb-8">
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-xl font-semibold mb-3">Community Development</h3>
                <p className="text-muted-foreground mb-4">
                  Working with local organizations and residents to identify community needs 
                  and develop sustainable solutions that strengthen neighborhoods.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Neighborhood cleanups and beautification projects</li>
                  <li>Community gardens and food security initiatives</li>
                  <li>Supporting local businesses and economic development</li>
                  <li>Building bridges between different community groups</li>
                </ul>
              </div>
              
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-xl font-semibold mb-3">Education & Literacy</h3>
                <p className="text-muted-foreground mb-4">
                  Supporting educational opportunities and literacy programs that empower 
                  individuals and strengthen communities.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Tutoring and mentoring programs</li>
                  <li>Adult literacy and English language classes</li>
                  <li>Educational workshops and skill-building sessions</li>
                  <li>Supporting access to educational resources</li>
                </ul>
              </div>
              
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-xl font-semibold mb-3">Environmental Sustainability</h3>
                <p className="text-muted-foreground mb-4">
                  Taking action to protect our environment and promote sustainable 
                  practices that benefit both current and future generations.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Climate action and environmental education</li>
                  <li>Sustainable living workshops and resources</li>
                  <li>Supporting renewable energy and conservation</li>
                  <li>Connecting environmental and social justice issues</li>
                </ul>
              </div>
              
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-xl font-semibold mb-3">Social Justice & Advocacy</h3>
                <p className="text-muted-foreground mb-4">
                  Advocating for policies and practices that promote equality, justice, 
                  and the inherent dignity of all people.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Racial unity and anti-racism education</li>
                  <li>Economic justice and poverty alleviation</li>
                  <li>Supporting immigrant and refugee communities</li>
                  <li>Promoting interfaith dialogue and cooperation</li>
                </ul>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold mb-4">How to Get Involved</h2>
            <p className="mb-4">
              There are many ways to participate in our social action efforts, whether through 
              direct service, advocacy, education, or supporting others who are engaged in this work. 
              We believe that everyone has something valuable to contribute.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-3">Volunteer Opportunities</h3>
                <p className="text-muted-foreground">
                  Join us for regular service projects, special events, and ongoing initiatives 
                  that address community needs.
                </p>
              </div>
              
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-3">Learning & Reflection</h3>
                <p className="text-muted-foreground">
                  Participate in study circles and workshops that explore the connection 
                  between spiritual principles and social action.
                </p>
              </div>
            </div>
            
            <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
              <p className="font-medium mb-2">Ready to make a difference?</p>
              <p>Contact us to learn about current social action projects and how you can 
              contribute to building a more just and unified community.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialAction;