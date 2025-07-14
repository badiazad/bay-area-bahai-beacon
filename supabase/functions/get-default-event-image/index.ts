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
    const { title, description } = await req.json();
    
    const apiKey = Deno.env.get('GOOGLE_CUSTOM_SEARCH_API_KEY');
    const searchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');
    
    if (!apiKey || !searchEngineId) {
      console.error('Missing Google Custom Search credentials');
      return new Response(
        JSON.stringify({ 
          error: 'Google Custom Search not configured',
          fallbackImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create search query from title only
    const searchQuery = title.trim();
    
    console.log('Searching for images with query:', searchQuery);

    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.set('key', apiKey);
    searchUrl.searchParams.set('cx', searchEngineId);
    searchUrl.searchParams.set('q', searchQuery);
    searchUrl.searchParams.set('searchType', 'image');
    searchUrl.searchParams.set('num', '3');
    searchUrl.searchParams.set('safe', 'active');
    searchUrl.searchParams.set('imgSize', 'medium');
    searchUrl.searchParams.set('imgType', 'photo');

    const response = await fetch(searchUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Google Custom Search API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      // Return the first suitable image
      const imageUrl = data.items[0].link;
      console.log('Found image:', imageUrl);
      
      return new Response(
        JSON.stringify({ imageUrl }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      // Fallback to a default community image from Unsplash
      const fallbackImage = 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop';
      
      return new Response(
        JSON.stringify({ imageUrl: fallbackImage }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Error in get-default-event-image function:', error);
    
    // Return fallback image on error
    const fallbackImage = 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop';
    
    return new Response(
      JSON.stringify({ imageUrl: fallbackImage }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});