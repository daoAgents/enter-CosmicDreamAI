const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function parseErrorCode(type: string, message: string): string {
  if (type !== "api_error") return type;
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes("insufficient credits")) return "insufficient_credits";
  if (lowerMsg.includes("disabled")) return "permission_error";
  if (lowerMsg.includes("rate limit")) return "rate_limit_error";
  if (lowerMsg.includes("timeout")) return "overloaded_error";
  return type;
}

function errorResponse(status: number, message: string, code: string) {
  console.error(`[AI Dream Image Error] ${code}: ${message}`);
  return new Response(
    JSON.stringify({ success: false, message, code }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

function successResponse(images: Array<{ url: string; meta_data?: Record<string, unknown> }>, taskId: string) {
  return new Response(
    JSON.stringify({ success: true, images, task_id: taskId }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

function parseRespPayload(respPayload: string): Array<{ url: string; meta_data?: Record<string, unknown> }> {
  try {
    const payload = JSON.parse(respPayload);
    const resources = payload.resources || [];
    return resources.map((r: { url?: string; meta_data?: Record<string, unknown> }) => ({
      url: r.url || r.meta_data?.url,
      meta_data: r.meta_data
    }));
  } catch (e) {
    console.error("[AI Dream Image] Failed to parse resp_payload:", e);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const AI_API_TOKEN = Deno.env.get("AI_API_TOKEN_b0d845535fb9");
    if (!AI_API_TOKEN) {
      return errorResponse(500, "AI service is not configured", "configuration_error");
    }

    const { dream } = await req.json();

    if (!dream || dream.trim().length === 0) {
      return errorResponse(400, "Please describe your dream first.", "invalid_request_error");
    }

    // Craft a vivid, surreal image prompt from the dream description
    const imagePrompt = `Surreal ethereal dreamscape visualization: ${dream}. 
Style: hyper-detailed digital art, deep-space midnight aesthetic, bioluminescent colors of violet, teal, and rose gold, 
cosmic nebula background, crystalline light refractions, otherworldly atmosphere, 
cinematic lighting, painterly yet photorealistic, 8K ultra-detailed, 
dreamlike surrealism meets dark fantasy, floating cosmic elements, 
portal-like framing with glowing edges, spiritual and mystical atmosphere`;

    console.log(`[AI Dream Image] Generating for dream: ${dream.substring(0, 60)}...`);

    const response = await fetch("https://api.enter.pro/code/api/v1/ai/images", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "doubao/seedream-4.5",
        prompt: imagePrompt,
        type: "txt_2_img",
        image_option: {
          ratio: "1:1",
          resolution: "2k",
          format: "png"
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = (errorData as { error?: { message?: string } }).error?.message || "AI service error";
      const rawCode = (errorData as { error?: { type?: string } }).error?.type || "api_error";
      const code = parseErrorCode(rawCode, message);
      return errorResponse(response.status, message, code);
    }

    const data = await response.json();

    if (data.status === "failed") {
      return errorResponse(500, data.error || "Image generation failed", "api_error");
    }

    let images: Array<{ url: string; meta_data?: Record<string, unknown> }> = [];

    if (data.resp_payload) {
      images = parseRespPayload(data.resp_payload);
    } else if (data.images) {
      images = data.images;
    }

    return successResponse(images, data.task_id);
  } catch (error) {
    return errorResponse(500, (error as Error).message || "Internal error", "internal_error");
  }
});
