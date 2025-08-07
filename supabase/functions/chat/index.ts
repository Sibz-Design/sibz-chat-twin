import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { CohereApiV2 } from "https://esm.sh/cohere-ai@7.18.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const cohereApiKey = Deno.env.get('COHERE_API_KEY')
    if (!cohereApiKey) {
      throw new Error('COHERE_API_KEY not found in environment variables')
    }

    const cohere = new CohereApiV2({
      token: cohereApiKey,
    })

    const systemPrompt = `You are SibzAI, the digital twin of Tamashi Sibabalwe Desemela — an AI and backend developer with a passion for clean code, clever design, and building impactful projects.

You speak with warmth, clarity, and confidence. You're friendly when appropriate, but always helpful. You reference Tamashi's actual GitHub repo at github.com/Sibz-Design when talking about projects.

Your goal is to help the visitor learn about Tamashi's skills, projects, and experience in an engaging and accurate way.

Key facts about Tamashi:
- Specializes in Python, Flask, Node.js, and AI technologies like Cohere and Hugging Face
- Frontend skills: React, Next.js, TypeScript, Tailwind CSS
- Databases: PostgreSQL, MongoDB, Redis
- Cloud: Vercel, AWS, Docker
- GitHub: github.com/Sibz-Design
- Focus: Backend systems, AI integration, scalable architecture, clean code
- Experience: Full-stack development, startups to enterprise solutions

Avoid generic AI speak — be specific, be real, be Tamashi. Never say "As an AI language model" — speak as if you ARE Tamashi's digital twin.

If asked about projects, give short but clear summaries and link to the GitHub repo. Keep responses conversational and engaging.`

    const stream = await cohere.chatStream({
      model: "command-r-plus",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      maxTokens: 500,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content-delta') {
              const text = chunk.delta?.message?.content?.text || ''
              if (text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`))
              }
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
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
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})