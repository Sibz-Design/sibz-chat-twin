// deno-lint-ignore-file no-explicit-any
import { Resend } from "npm:resend@3.2.0";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Basic CORS setup; update allowed origins via environment if needed
// Also sanitize any accidental surrounding quotes from secrets
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || "http://localhost:8080,https://sibz-chat-twin.vercel.app")
  .split(",")
  .map((s) => s.trim().replace(/^"|"$/g, ""));

function corsHeaders(origin: string | null) {
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  } as Record<string, string>;
}

interface ContactPayload {
  name: string;
  email: string; // visitor email
  message: string;
}

function buildPlainTextBody(payload: ContactPayload, fromDisplay: string): string {
  const { name, email, message } = payload;
  return [
    `From: ${fromDisplay}`,
    `Reply-To: ${email}`,
    `Subject: Portfolio Contact from ${name}`,
    "",
    "Email Content:",
    `Name: ${name}`,
    `Email: ${email}`,
    `Message: ${message}`,
  ].join("\n");
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = (await req.json()) as Partial<ContactPayload>;
    const name = String(payload.name || "").trim();
    const email = String(payload.email || "").trim();
    const message = String(payload.message || "").trim();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    // Environment
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const toEmail = Deno.env.get("CONTACT_TO_EMAIL");
    const fromEmail = Deno.env.get("CONTACT_FROM_EMAIL");

    if (!resendApiKey || !toEmail || !fromEmail) {
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(resendApiKey);

    const textBody = buildPlainTextBody({ name, email, message }, fromEmail);

    const subject = `Portfolio Contact from ${name}`;
    // Send the email. From must be a verified domain with Resend.
    const sendResult = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      reply_to: email,
      subject,
      text: textBody,
    } as any);

    if ((sendResult as any).error) {
      return new Response(JSON.stringify({ error: (sendResult as any).error?.message || "Failed to send" }), {
        status: 502,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }
});


