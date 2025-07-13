import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface ConfirmationRequest {
  event_id: string;
  attendee_email: string;
  attendee_name: string;
}

const generateICSFile = (event: any, attendeeName: string) => {
  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Bay Area Bahai//Event Calendar//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${event.id}@sfbahai.org
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}\n\nHost: ${event.host_name}\nRSVP confirmed for: ${attendeeName}
LOCATION:${event.location}${event.address ? ', ' + event.address : ''}
ORGANIZER;CN=${event.host_name}:MAILTO:${event.host_email}
ATTENDEE;CN=${attendeeName}:MAILTO:${attendee_email}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

  return icsContent;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event_id, attendee_email, attendee_name }: ConfirmationRequest = await req.json();

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", event_id)
      .single();

    if (eventError || !event) {
      throw new Error("Event not found");
    }

    // Generate calendar invite
    const icsContent = generateICSFile(event, attendee_name);
    const icsBuffer = new TextEncoder().encode(icsContent);

    // Format date for email
    const eventDate = new Date(event.start_date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long", 
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short"
    });

    // Send confirmation email
    const emailResponse = await resend.emails.send({
      from: "Bay Area Baha'i Community <events@sfbahai.org>",
      to: [attendee_email],
      subject: `RSVP Confirmed: ${event.title}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <header style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">RSVP Confirmed!</h1>
          </header>
          
          <div style="padding: 30px;">
            <p style="font-size: 18px; margin-bottom: 20px;">
              Dear ${attendee_name},
            </p>
            
            <p style="margin-bottom: 20px;">
              Thank you for your RSVP! We're excited to see you at <strong>${event.title}</strong>.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #16a34a; margin-top: 0;">Event Details</h2>
              <p><strong>Date & Time:</strong> ${eventDate}</p>
              <p><strong>Location:</strong> ${event.location}</p>
              ${event.address ? `<p><strong>Address:</strong> ${event.address}</p>` : ''}
              <p><strong>Host:</strong> ${event.host_name}</p>
              ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ''}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}" 
                 style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 0 10px;">
                Get Directions
              </a>
              <a href="mailto:${event.host_email}" 
                 style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 0 10px;">
                Contact Host
              </a>
            </div>
            
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              A calendar invite is attached to this email. If you need to make any changes to your RSVP, 
              please contact the host directly.
            </p>
            
            <p style="margin-top: 20px;">
              In fellowship,<br>
              Bay Area Baha'i Community
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`,
          content: icsBuffer,
        },
      ],
    });

    console.log("Confirmation email sent:", emailResponse);

    // Send notification to host
    const hostEmailResponse = await resend.emails.send({
      from: "Bay Area Baha'i Community <events@sfbahai.org>",
      to: [event.host_email],
      subject: `New RSVP for ${event.title}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2 style="color: #16a34a;">New RSVP Received</h2>
          <p><strong>${attendee_name}</strong> has RSVP'd for your event:</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <h3 style="margin-top: 0;">${event.title}</h3>
            <p><strong>Date:</strong> ${eventDate}</p>
            <p><strong>Attendee Email:</strong> ${attendee_email}</p>
          </div>
          <p>You can view all RSVPs in your admin dashboard.</p>
        </div>
      `,
    });

    console.log("Host notification sent:", hostEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        confirmation_sent: emailResponse.data?.id,
        host_notification_sent: hostEmailResponse.data?.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-event-confirmation:", error);
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