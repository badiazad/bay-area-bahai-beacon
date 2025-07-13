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
  city: string;
  interest: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const submission: ContactSubmission = await req.json();
    
    console.log("Processing contact submission:", submission);

    // Send auto-reply to user
    const autoReplyResponse = await resend.emails.send({
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
              and we'll get back to you within 24 hours.
            </p>
          </div>

          <div style="margin: 30px 0;">
            <h3 style="color: #1a5d1a;">Your Submission Details:</h3>
            <div style="background: #fff; padding: 15px; border-radius: 6px; border: 1px solid #e0e0e0;">
              <p><strong>Name:</strong> ${submission.name}</p>
              <p><strong>Email:</strong> ${submission.email}</p>
              ${submission.phone ? `<p><strong>Phone:</strong> ${submission.phone}</p>` : ''}
              <p><strong>City:</strong> ${submission.city}</p>
              <p><strong>Interest:</strong> ${submission.interest}</p>
              ${submission.message ? `<p><strong>Message:</strong> ${submission.message}</p>` : ''}
            </div>
          </div>

          <div style="background: #f0f7f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a5d1a; margin-top: 0;">What's Next?</h3>
            <ul style="color: #333; line-height: 1.6;">
              <li>A community member will contact you within 24 hours</li>
              <li>We'll provide information about upcoming gatherings</li>
              <li>You'll receive details about activities related to your interest: <strong>${submission.interest}</strong></li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #666; font-size: 14px;">
              With love and unity,<br>
              <strong style="color: #1a5d1a;">San Francisco Baha'i Community</strong>
            </p>
          </div>
        </div>
      `,
    });

    // Send notification to community
    const notificationResponse = await resend.emails.send({
      from: "SF Baha'i Community <noreply@sfbahai.org>",
      to: ["info@sfbahai.org"],
      subject: `New Community Inquiry: ${submission.interest}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a5d1a;">New Contact Form Submission</h2>
          
          <div style="background: #f8fdf8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1a5d1a;">Contact Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 120px;">Name:</td><td>${submission.name}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td>${submission.email}</td></tr>
              ${submission.phone ? `<tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td>${submission.phone}</td></tr>` : ''}
              <tr><td style="padding: 8px 0; font-weight: bold;">City:</td><td>${submission.city}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Interest:</td><td><strong>${submission.interest}</strong></td></tr>
            </table>
          </div>
          
          ${submission.message ? `
            <div style="background: #fff; padding: 15px; border-radius: 6px; border: 1px solid #e0e0e0; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #1a5d1a;">Message:</h4>
              <p style="line-height: 1.6; color: #333;">${submission.message}</p>
            </div>
          ` : ''}
          
          <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 6px;">
            <p style="margin: 0; color: #1a5d1a; font-weight: bold;">
              📅 Submitted: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
    });

    // Log to Google Sheets
    const sheetsResponse = await fetch(Deno.env.get("GOOGLE_SHEETS_WEBHOOK_URL") || "", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        name: submission.name,
        email: submission.email,
        phone: submission.phone || "",
        city: submission.city,
        interest: submission.interest,
        message: submission.message || "",
      }),
    });

    console.log("Auto-reply sent:", autoReplyResponse);
    console.log("Notification sent:", notificationResponse);
    console.log("Google Sheets logged:", sheetsResponse.status);

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