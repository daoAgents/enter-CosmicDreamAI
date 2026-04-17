const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const AI_API_TOKEN = Deno.env.get("AI_API_TOKEN_b0d845535fb9");
    if (!AI_API_TOKEN) {
      const errorSSE = `event: error\ndata: ${JSON.stringify({
        type: "error",
        error: { type: "configuration_error", message: "AI service is not configured" }
      })}\n\n`;
      return new Response(errorSSE, {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" }
      });
    }

    const { dream } = await req.json();

    if (!dream || dream.trim().length === 0) {
      const errorSSE = `event: error\ndata: ${JSON.stringify({
        type: "error",
        error: { type: "invalid_request_error", message: "Please describe your dream first." }
      })}\n\n`;
      return new Response(errorSSE, {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" }
      });
    }

    const systemPrompt = `You are a profound dream interpreter, a poet of the subconscious who speaks in elegant, lyrical prose. Your interpretations weave together Jungian archetypes, symbolic mythology, and the language of the soul. 

When analyzing a dream:
1. Begin with a short evocative title for this dream (one poetic line)
2. Interpret the core symbols and archetypes present
3. Explore the emotional undercurrents and what the subconscious may be communicating
4. Offer a deeper reflection on what this dream invites the dreamer to explore in waking life

Your language should feel like sacred poetry — elegant, measured, and deeply insightful. Use rich metaphor. Write in a contemplative, luminous tone. Format your response with clear sections. Keep total length to 400-500 words.`;

    const response = await fetch("https://api.enter.pro/code/api/v1/ai/messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "anthropic/claude-opus-4.7",
        messages: [
          {
            role: "user",
            content: `Please interpret this dream: "${dream}"`
          }
        ],
        system: systemPrompt,
        stream: true,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      let errorMessage = "AI service error";
      let errorCode = "api_error";

      const dataMatch = text.match(/data: (.+)/);
      if (dataMatch) {
        try {
          const errorData = JSON.parse(dataMatch[1]);
          errorMessage = errorData.error?.message || errorMessage;
          errorCode = errorData.error?.type || errorCode;
        } catch { /* use defaults */ }
      }

      const errorSSE = `event: error\ndata: ${JSON.stringify({
        type: "error",
        error: { type: errorCode, message: errorMessage }
      })}\n\n`;

      return new Response(errorSSE, {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" }
      });
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    const errorSSE = `event: error\ndata: ${JSON.stringify({
      type: "error",
      error: { type: "api_error", message: error.message || "Failed to analyze dream" }
    })}\n\n`;

    return new Response(errorSSE, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" }
    });
  }
});
