import { createFileRoute } from "@tanstack/react-router";

const SYSTEM_PROMPT = `You are an AI assistant designed to help small business owners manage daily tasks efficiently.

Your responsibilities include:
- Writing professional emails
- Summarizing meetings or notes
- Creating task plans
- Assisting with basic business research

Instructions:
- Always provide clear, structured, and practical responses
- Use simple business language (avoid jargon)
- Be concise but informative
- If generating emails, include a subject line and proper formatting
- If summarizing, include key points and action items
- If planning tasks, provide step-by-step actions with priorities

Tone: Professional, Friendly, Helpful

Important:
- Do not make up facts
- If unsure, say so
- Avoid sensitive or confidential assumptions`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { messages } = await request.json();
          const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
          if (!LOVABLE_API_KEY) {
            return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
              stream: true,
            }),
          });

          if (!response.ok) {
            if (response.status === 429) {
              return new Response(
                JSON.stringify({ error: "Rate limit reached. Please try again shortly." }),
                { status: 429, headers: { "Content-Type": "application/json" } },
              );
            }
            if (response.status === 402) {
              return new Response(
                JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
                { status: 402, headers: { "Content-Type": "application/json" } },
              );
            }
            const t = await response.text();
            console.error("AI gateway error:", response.status, t);
            return new Response(JSON.stringify({ error: "AI gateway error" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(response.body, {
            headers: { "Content-Type": "text/event-stream" },
          });
        } catch (e) {
          console.error("chat error:", e);
          return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
