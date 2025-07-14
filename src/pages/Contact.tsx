import Navigation from "@/components/layout/Navigation";
import ContactForm from "@/components/contact/ContactForm";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ContactForm />
      
      {/* Visit or Contact Us Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8">Visit or Contact Us</h2>
          
          <div className="bg-card rounded-lg p-8 border">
            <h3 className="text-2xl font-semibold text-foreground mb-6">San Francisco Baha'i Center</h3>
            
            <div className="space-y-3 text-muted-foreground">
              <p className="text-lg">355 Bryant St, Unit 110</p>
              <p className="text-lg">San Francisco, CA 94107</p>
              <p className="text-lg">United States</p>
              
              <div className="pt-4 space-y-2">
                <p className="text-lg">
                  <span className="font-medium">Phone:</span> (415) 431-9990
                </p>
                <p className="text-lg">
                  <span className="font-medium">Email:</span> office@sfbahai.org
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connect With Us Section */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8">Connect With Us</h2>
          
          <div className="bg-card rounded-lg p-8 border">
            <p className="text-lg text-muted-foreground mb-6">
              If you're interested in learning more about the Baha'i Faith or would like to attend an event, we'd be delighted to hear from you.
            </p>
            <p className="text-lg text-muted-foreground">
              You can use the contact form, call us, or simply stop by our center during office hours.
            </p>
          </div>
        </div>
      </div>

      {/* Google Maps Section */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-lg overflow-hidden border">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3152.9158249353315!2d-122.39184658468193!3d37.78513197975665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808f7fc5b1b1b1b1%3A0x1b1b1b1b1b1b1b1b!2s355%20Bryant%20St%20Unit%20110%2C%20San%20Francisco%2C%20CA%2094107!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="San Francisco Baha'i Center Location"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;