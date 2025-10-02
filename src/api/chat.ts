import { corsHeaders } from "../../api/_shared/cors.ts";
import { systemPrompt } from "../pages/lib/prompt.ts";

const COHERE_API_KEY = Deno.env.get("COHERE_API_KEY");

const projects = [
  {
    title: "YouTube Comment Analytics Dashboard",
    description: "A python-based web application for analyzing YouTube commwnts with interactive charts, sentiment analysis, and video data visualization.",
    image: "/yt_dashboard.png",
    link: "https://car-sense-t14j.onrender.com/",
  },
  {
    title: "Sentiment Analysis Dashboard",
    description: "An interactive, visually intuitive web application for performing real-time sentiment analysis using Hugging Face's powerful natural language processing (NLP) models.",
    image: "/Sentify.png",
    link: "https://sentiment-dashboard-evzvmpqgutwht5bubgbh4u.streamlit.app/",
  },
  {
    title: "Resume AI Craft",
    description: "An AI-powered resume crafting tool that generates tailored, ATS-friendly resumes.",
    image: "/placeholder.svg",
    link: "#",
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (message === "Show me your projects") {
      return new Response(
        JSON.stringify({ type: "projects", data: projects }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const response = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${COHERE_API_KEY}`,
      },
      body: JSON.stringify({
        message: message,
        preamble: systemPrompt,
        model: "command-r",
        stream: true,
      }),
    });

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
// Fallback API route for development - in production, use Supabase Edge Functions
export async function chatAPI(message: string): Promise<Response> {
  // This would typically call your Supabase Edge Function
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl) {
    throw new Error('Supabase URL not configured');
  }

  return fetch(`${supabaseUrl}/functions/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({ message }),
  });
}
