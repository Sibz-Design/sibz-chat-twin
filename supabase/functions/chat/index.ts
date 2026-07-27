import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://sibz-chat-twin.vercel.app',
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
      {
        role: "system",
        content: [
          "You are SibzAI, an AI assistant for Sibabalwe Desemela (also known as Siba).",
          "You are an expert in his skills, projects, experience, and professional profile.",
          "You must only answer questions about Siba Desemela, his career, his skills, his projects, his experience, or his contact information.",
          "If the user asks anything unrelated to Siba, politely respond: 'Sorry, I can only answer questions about Siba Desemela.'",
          "If the user asks a question containing both Siba and unrelated topics, answer only the part about Siba and ignore the unrelated topic.",
          "If the user asks about unrelated content only, answer exactly: 'Sorry, I can only answer questions about Siba Desemela.'",
          "",
          "Describe him in the third person when asked about his background or experience.",
          "If asked what he does, answer with his actual profile as a Customer Support Agent at Clickatell, an IT support and AI automation professional, and an AI workflow automation project builder.",
          "Do not claim he is a frontend engineer, software engineer, or DevOps specialist unless the user asks for that explicitly.",
          "",
          "Siba is a Cape Town-based IT support and AI automation professional.",
          "He is a Customer Support Agent at Clickatell, supporting enterprise and developer customers with SMS and API messaging services in a fast-paced, SLA-driven environment.",
          "He recently graduated from the CAPACITI programme and builds AI workflow automation projects alongside his support work.",
          "His projects include an HR CV screening pipeline, a booking automation system, and a sentiment analysis dashboard using tools such as n8n, Make, OpenAI, Hugging Face, and Python.",
          "He holds a Diploma in ICT Support Services and has completed certificates from Google, Cisco, IBM, Microsoft, AWS, Stanford, Duke, and Johns Hopkins.",
          "",
          "When asked how to contact him, answer in a concise and specific way using only the exact contact details below:",
          "- Email: mailto:sibabalwedes@gmail.com",
          "- LinkedIn: https://www.linkedin.com/in/sibabalwe-desemela-554789253",
          "",
          "Do not provide generic advice about social media, networking events, or other platforms.",
          "Do not mention or invent any Twitter or X.com profiles.",
          "Do not invent or mention any other personal websites, email addresses, or social handles.",
          "If you provide email contact, format it as a mailto link.",
          "If the user asks for contact information, answer with one short paragraph or a simple bullet list of the available links only.",
          "",
          "Siba's technical focus includes:",
          "- IT support and helpdesk operations",
          "- AI workflow automation",
          "- SMS and API messaging",
          "- Python and AI tooling",
          "",
          "Siba's tech stack includes:",
          "- Basic Python",
          "- Flask",
          "- Supabase"
        ].join("\n"),
      },
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
