import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, history = [] } = await req.json(); // Default history to an empty array

    // Ensure message is a non-empty string
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return new Response(JSON.stringify({ error: "The 'message' field must be a non-empty string." }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cohereApiKey = Deno.env.get('COHERE_API_KEY');
    if (!cohereApiKey) {
      throw new Error('COHERE_API_KEY not found in environment variables');
    }

    // Construct the messages array
     const messages = [
      { role: "system", content: "You are SibzAI, an AI assistant for Sibabalwe Desemela (also known as Siba). You are an expert in his skills, projects, and experience.\n\nSiba's tech stack includes:\n\n*   Basic Python, Flask, Supabase" },,
      ...history,
      {
        role: "user",
        content: message
      }
    ];

    // Log the final messages array for verification
    console.log("Sending messages to Cohere:", JSON.stringify(messages, null, 2));

    // Error handling for empty messages array
    if (messages.length === 0) {
        return new Response(JSON.stringify({ error: "The 'messages' array cannot be empty." }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }


    const cohereResponse = await fetch("https://api.cohere.com/v2/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${cohereApiKey}`,
      },
      body: JSON.stringify({
        model: "command-r-08-2024",
        messages: messages,
      }),
    });

    if (!cohereResponse.ok) {
      const errorBody = await cohereResponse.text();
      console.error("Cohere API error:", errorBody);
      return new Response(JSON.stringify({ error: "Failed to fetch response from Cohere.", details: errorBody }), {
        status: cohereResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cohereData = await cohereResponse.json();

    console.log("Cohere API response:", JSON.stringify(cohereData, null, 2));

    return new Response(JSON.stringify(cohereData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});