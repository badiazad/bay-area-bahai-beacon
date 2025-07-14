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
    console.log("Google Maps config request received");
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    
    if (!apiKey) {
      console.error("Google Maps API key not found in environment");
      return new Response(
        JSON.stringify({ error: 'Google Maps API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log("Google Maps API key found, generating script");

    // Create the actual script that loads Google Maps
    const googleMapsScript = `
(function() {
  console.log("Google Maps loader script executing...");
  
  if (window.google && window.google.maps && window.google.maps.places) {
    console.log("Google Maps already loaded");
    return;
  }
  
  const script = document.createElement('script');
  script.src = 'https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps';
  script.async = true;
  script.defer = true;
  
  // Add callback function to window
  window.initGoogleMaps = function() {
    console.log("Google Maps API loaded successfully with Places library");
  };
  
  script.onerror = function(error) {
    console.error("Failed to load Google Maps API:", error);
  };
  
  console.log("Appending Google Maps script to document head");
  document.head.appendChild(script);
})();
`;

    console.log("Returning Google Maps script");
    return new Response(googleMapsScript, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("Error in google-maps-config function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});