import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Maps API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const googleMapsScript = `
      (function() {
        if (window.google && window.google.maps) {
          return; // Already loaded
        }
        
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      })();
    `;

    return new Response(googleMapsScript, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/javascript',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});