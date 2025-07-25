import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactSubmission {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  interest?: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("📧 Contact email function called");
  
  if (req.method === "OPTIONS") {
    console.log("🔄 Handling CORS preflight");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📝 Parsing request body");
    const submission: ContactSubmission = await req.json();
    
    console.log("📊 Processing contact submission:", { 
      name: submission.name, 
      email: submission.email,
      hasMessage: !!submission.message 
    });

    // Validate required fields
    if (!submission.name || !submission.email || !submission.message) {
      console.error("❌ Missing required fields");
      return new Response(
        JSON.stringify({ error: "Name, email, and message are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(submission.email)) {
      console.error("❌ Invalid email format");
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("📧 Sending emails in parallel...");
    
    // Send both emails in parallel for better performance
    const [autoReplyResponse, notificationResponse] = await Promise.all([
      resend.emails.send({
        from: "SF Baha'i Community <noreply@sfbahai.org>",
        to: [submission.email],
        subject: "Thank you for connecting with us!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1a5d1a; margin-bottom: 10px;">San Francisco Baha'i Community</h1>
              <p style="color: #4a7c59; font-size: 16px;">Building Unity Through Love and Service</p>
            </div>
            
            <div style="background: #f8fdf8; padding: 20px; border-radius: 8px; border-left: 4px solid #1a5d1a;">
              <h2 style="color: #1a5d1a; margin-top: 0;">Thank you for reaching out!</h2>
              <p style="color: #333; line-height: 1.6;">
                Dear ${submission.name},<br><br>
                We're delighted that you've reached out to our community! Your message is important to us, 
                and we'll get back to you in the next few days.
              </p>
            </div>

            <div style="margin: 30px 0;">
              <h3 style="color: #1a5d1a;">Your Submission Details:</h3>
              <div style="background: #fff; padding: 15px; border-radius: 6px; border: 1px solid #e0e0e0;">
                <p><strong>Name:</strong> ${submission.name}</p>
                <p><strong>Email:</strong> ${submission.email}</p>
                ${submission.phone ? `<p><strong>Phone:</strong> ${submission.phone}</p>` : ''}
                ${submission.address ? `<p><strong>Address:</strong> ${submission.address}</p>` : ''}
                ${submission.interest ? `<p><strong>Interest:</strong> ${submission.interest}</p>` : ''}
                <p><strong>Message:</strong> ${submission.message}</p>
              </div>
            </div>


            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="color: #666; font-size: 14px;">
                With love and unity,<br>
                <strong style="color: #1a5d1a;">San Francisco Baha'i Community</strong>
              </p>
            </div>
          </div>
        `,
      }),
      resend.emails.send({
        from: "SF Baha'i Community <noreply@sfbahai.org>",
        to: ["badiazad@yahoo.com"],
        subject: `New Community Inquiry${submission.interest ? `: ${submission.interest}` : ''}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a5d1a;">New Contact Form Submission</h2>
            
            <div style="background: #f8fdf8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1a5d1a;">Contact Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; font-weight: bold; width: 120px;">Name:</td><td>${submission.name}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td>${submission.email}</td></tr>
                ${submission.phone ? `<tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td>${submission.phone}</td></tr>` : ''}
                ${submission.address ? `<tr><td style="padding: 8px 0; font-weight: bold;">Address:</td><td>${submission.address}</td></tr>` : ''}
                ${submission.interest ? `<tr><td style="padding: 8px 0; font-weight: bold;">Interest:</td><td><strong>${submission.interest}</strong></td></tr>` : ''}
              </table>
            </div>
            
            <div style="background: #fff; padding: 15px; border-radius: 6px; border: 1px solid #e0e0e0; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #1a5d1a;">Message:</h4>
              <p style="line-height: 1.6; color: #333;">${submission.message}</p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 6px;">
              <p style="margin: 0; color: #1a5d1a; font-weight: bold;">
                📅 Submitted: ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        `,
      })
    ]);

    console.log("✅ Emails sent successfully");
    console.log("📧 Auto-reply sent:", autoReplyResponse.id);
    console.log("📧 Notification sent:", notificationResponse.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Contact form submitted successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in contact form function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);