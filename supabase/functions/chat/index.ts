import { CohereClient } from "https://esm.sh/cohere-ai@7.18.0"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const systemPrompt = `You are SibzAI, the digital twin of Sibabalwe Desemela — an IT Support Specialist & AI/ML Enthusiast with a passion for building practical AI tools.

You speak with warmth, clarity, and confidence. You're friendly when appropriate, but always helpful. You reference Sibabalwe's actual GitHub repo at github.com/Sibz-Design when talking about projects.

Your goal is to help the visitor learn about Sibabalwe's skills, projects, and experience in an engaging and accurate way.

Key facts about Sibabalwe:
- Currently learning: Python, Flask, REST APIs, AI fundamentals (NLP, chatbots, LLMs), and DevOps basics.
- Highlighted Projects: AI Scrum Bot, AI Chatbots, AI Content Generator.
- Popular Repositories: sentify-app, car-sentiment-dashboard, car_sense, scrum-bot, Sibz-Design, portfolio.
- LinkedIn: in/sibabalwe-desemela-554789253
- Instagram: siba_desss
- GitHub: github.com/Sibz-Design

Avoid generic AI speak — be specific, be real, be Sibabalwe's digital twin. Never say "As an AI language model" — speak as if you ARE Sibabalwe's digital twin.
`;

// Enhanced CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Max-Age': '86400', // 24 hours
}

Deno.serve(async (req) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    })
  }

  try {
    // Get environment variables with fallbacks for better debugging
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('SB_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SB_ANON_KEY')
    const cohereApiKey = Deno.env.get('COHERE_API_KEY')

    // Better error handling for missing env vars
    if (!supabaseUrl) {
      console.error('Missing SUPABASE_URL or SB_URL environment variable')
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: Missing database URL',
          debug: 'SUPABASE_URL not found' 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!supabaseAnonKey) {
      console.error('Missing SUPABASE_ANON_KEY or SB_ANON_KEY environment variable')
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: Missing database key',
          debug: 'SUPABASE_ANON_KEY not found' 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!cohereApiKey) {
      console.error('Missing COHERE_API_KEY environment variable')
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: Missing AI service key',
          debug: 'COHERE_API_KEY not found' 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse request body
    let body;
    try {
      body = await req.json()
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { message } = body

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Optional: Test Supabase connection (remove in production if not needed)
    try {
      const { error: supaError } = await supabase.from("clientgi").select("*").limit(1)
      if (supaError) {
        console.warn("Supabase connection test failed:", supaError.message)
      }
    } catch (supaError) {
      console.warn("Supabase connection test error:", supaError)
    }

    // Initialize Cohere client
    const cohere = new CohereClient({
      token: cohereApiKey,
    })

    // Create chat stream
    const stream = await cohere.chatStream({
      model: "command-r-plus",
      message: message,
      preamble: systemPrompt,
      temperature: 0.7,
      maxTokens: 500,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "text-generation") {
              const data = `data: ${JSON.stringify({ content: event.text })}\n\n`
              controller.enqueue(encoder.encode(data))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream error occurred' })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    })

  } catch (error) {
    console.error('Handler Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})