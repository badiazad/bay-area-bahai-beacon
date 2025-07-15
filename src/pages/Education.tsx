import Navigation from "@/components/layout/Navigation";

const Education = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-6">Education</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-muted-foreground mb-8">
              Spiritual education programs for all ages focused on character development and service.
            </p>
            
            <div className="bg-gradient-community rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold mb-4">Our Educational Approach</h2>
              <p className="mb-4">
                Our educational programs are designed to develop spiritual qualities, foster a 
                spirit of service, and build capacity for contributing to the betterment of society. 
                We offer programs for children, junior youth, youth, and adults.
              </p>
            </div>
            
            <h2 className="text-2xl font-semibold mb-4">Programs by Age Group</h2>
            
            <div className="space-y-6 mb-8">
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-xl font-semibold mb-3">Children's Classes (Ages 5-11)</h3>
                <p className="text-muted-foreground mb-4">
                  Fun and engaging classes that help children develop spiritual qualities 
                  through stories, songs, games, and creative activities.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Character development through stories and role-playing</li>
                  <li>Learning prayers and devotional practices</li>
                  <li>Creative arts and crafts activities</li>
                  <li>Service projects appropriate for young children</li>
                </ul>
              </div>
              
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-xl font-semibold mb-3">Junior Youth Programs (Ages 12-15)</h3>
                <p className="text-muted-foreground mb-4">
                  Empowering programs that help junior youth explore their identity, 
                  develop their capabilities, and contribute to their communities.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Spiritual empowerment through study and reflection</li>
                  <li>Community service projects and social action</li>
                  <li>Arts and media for social transformation</li>
                  <li>Leadership development and mentoring</li>
                </ul>
              </div>
              
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-xl font-semibold mb-3">Youth Programs (Ages 15+)</h3>
                <p className="text-muted-foreground mb-4">
                  Programs that support youth in becoming agents of social change and 
                  contributing to the transformation of society.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Study circles on spiritual and social themes</li>
                  <li>Service-learning opportunities</li>
                  <li>Community organizing and social action</li>
                  <li>Mentoring younger participants</li>
                </ul>
              </div>
              
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-xl font-semibold mb-3">Adult Study Circles</h3>
                <p className="text-muted-foreground mb-4">
                  Small group studies that explore themes of spiritual development 
                  and social transformation in a collaborative learning environment.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Ruhi Institute curriculum and materials</li>
                  <li>Reflection on spiritual principles and their application</li>
                  <li>Developing capacity for service and teaching</li>
                  <li>Building learning communities</li>
                </ul>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold mb-4">Join Our Educational Community</h2>
            <p className="mb-4">
              All of our educational programs are free and open to people of all backgrounds. 
              Whether you're interested in enrolling your child, participating as a youth or adult, 
              or helping as a facilitator, we welcome your involvement.
            </p>
            
            <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
              <p className="font-medium mb-2">Interested in learning more?</p>
              <p>Contact us to find out about class schedules, locations, and how to get involved 
              in our educational programs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Education;