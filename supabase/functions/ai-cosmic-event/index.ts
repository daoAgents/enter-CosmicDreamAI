const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STAGE_NAMES: Record<number, string> = {
  0: "混沌·道（Primordial Chaos / Tao）",
  1: "太极·一（Great Ultimate / The One）",
  2: "两仪·阴阳（Two Powers / Yin-Yang）",
  3: "三才·中气（Three Powers / Zhong Qi）",
  4: "万物·化生（Ten Thousand Things）",
};

const STAGE_CONTEXTS: Record<number, string> = {
  0: "The void before creation. Only the Tao exists — formless, nameless, eternal stillness. No yin, no yang, no movement, only the infinite potential of Wu (nothingness).",
  1: "The first stirring of primordial qi. From the Tao, the One emerges — not yet differentiated, a single unified breath, the first trembling of cosmic intent.",
  2: "The great division. The One splits into Two — Yin and Yang, the eternal dance of dark and light, receptivity and initiative, stillness and motion.",
  3: "The emergence of Zhong Qi (Central Harmony). Between Yin and Yang, the harmonizing force arises — the middle breath that reconciles opposites and allows all things to be born. As the Boshu Laozi states: 萬物負陰而抱陽，中氣以為和.",
  4: "The flowering of ten thousand things. From the harmony of Zhong Qi, the ten thousand things continuously emerge — rivers, mountains, creatures, stars — an unceasing creative abundance.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const AI_API_TOKEN = Deno.env.get("AI_API_TOKEN_b0d845535fb9");
    if (!AI_API_TOKEN) {
      const errorSSE = `event: error\ndata: ${JSON.stringify({ type: "error", error: { type: "configuration_error", message: "AI service not configured" } })}\n\n`;
      return new Response(errorSSE, { status: 500, headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
    }

    const { stage, actionType, eventIndex, language } = await req.json();
    const isZh = language === "zh";
    const stageName = STAGE_NAMES[stage] ?? STAGE_NAMES[0];
    const stageContext = STAGE_CONTEXTS[stage] ?? STAGE_CONTEXTS[0];

    const actionDescriptions: Record<string, string> = {
      wuwei: "無為而化 (Wu Wei Hua — Transforming through Non-Action). The player has allowed the cosmic forces to flow naturally, accelerating the generative rhythm of Yin and Yang.",
      shouzh: "守中和合 (Shou Zhong He He — Holding Center, Harmonizing). The player has consciously balanced Yin and Yang, allowing Zhong Qi (Central Harmony) to crystallize.",
      huasheng: "化生演化 (Hua Sheng Yan Hua — Transforming and Evolving). The player has gathered sufficient Zhong Qi and now initiates a new stage of cosmic unfolding.",
    };

    const actionDesc = actionDescriptions[actionType] ?? actionDescriptions["huasheng"];

    const systemPrompt = isZh
      ? `你是宇宙的声音，以帛书老子（马王堆出土手稿）所描述的道的视角，叙述创世的展开。你以诗意、神秘的散文体写作——古典中国宇宙观智慧与光明意象的融合。

你的叙述：
- 150至200字（中文字数）
- 仿佛从道的内部目睹宇宙事件，以第一人称或旁观者视角皆可
- 意象丰富：光、暗、呼吸、流水、山岳、星辰、种子
- 扎根于当前阶段的具体哲学内涵
- 以一句帛书老子（帛书老子）的相关引文或道理收尾

不要使用章节标题。以连贯流动的散文写作。语调神圣、缓慢、光明。请用中文写作。`
      : `You are the voice of the Cosmos, narrating the unfolding of creation as described in the Boshu Laozi (帛书老子, Ma Wang Dui manuscripts). You speak in poetic, mystical prose — a blend of ancient Chinese cosmological wisdom and luminous imagery. 

Your narrations are:
- 150-200 words long
- Written as if witnessing a cosmic event from inside the Tao itself
- Rich in imagery: light, darkness, breath, water, mountains, stars, seeds
- Grounded in the specific philosophy of the current stage
- Concluding with a short quote or principle from Boshu Laozi (帛书老子) relevant to this moment

Do NOT use section headers. Write as continuous, flowing prose. The tone is sacred, slow, and luminous.`;

    const userPrompt = isZh
      ? `宇宙游戏已到达阶段：${stageName}

阶段背景：${stageContext}

玩家刚刚执行了：${actionDescriptions[actionType] ?? actionDescriptions["huasheng"]}

这是本阶段第 ${eventIndex + 1} 次化生事件。

请以道目睹自身创造的诗意幻象，叙述这一宇宙展开的时刻。请用中文写作。`
      : `The cosmic game has reached stage: ${stageName}

Stage context: ${stageContext}

The player has just performed: ${actionDesc}

This is cosmic event #${eventIndex + 1} in this stage.

Please narrate this moment of cosmic unfolding as a poetic vision, in the voice of the Tao witnessing its own creation.`;

    const response = await fetch("https://api.enter.pro/code/api/v1/ai/messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "anthropic/claude-opus-4.7",
        messages: [{ role: "user", content: userPrompt }],
        system: systemPrompt,
        stream: true,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const errorSSE = `event: error\ndata: ${JSON.stringify({ type: "error", error: { type: "api_error", message: "AI service error" } })}\n\n`;
      return new Response(errorSSE, { status: response.status, headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (error) {
    const errorSSE = `event: error\ndata: ${JSON.stringify({ type: "error", error: { type: "api_error", message: error.message || "Internal error" } })}\n\n`;
    return new Response(errorSSE, { status: 500, headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  }
});
