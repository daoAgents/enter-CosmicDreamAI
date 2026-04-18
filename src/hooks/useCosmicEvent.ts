import { useCallback } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from "@supabase/supabase-js";
import { GameStage, ActionType } from "./useGameState";

interface CosmicEventCallbacks {
  onText: (id: string, text: string) => void;
  onComplete: (id: string, imageUrl?: string) => void;
  onError?: (id: string, error: string) => void;
}

interface ImageResponse {
  success: boolean;
  images?: Array<{ url: string }>;
  message?: string;
  code?: string;
}

async function generateCosmicImage(stage: GameStage, actionType: ActionType): Promise<string | undefined> {
  const IMAGE_PROMPTS: Record<GameStage, string> = {
    0: "Absolute void, primordial chaos before creation, infinite darkness with a single infinitesimally small point of light at center, the Tao before manifestation, deep cosmic black with wisps of ancient energy, digital art, ethereal, 8K",
    1: "The Great Ultimate emerging, a single luminous sphere of unified primordial qi floating in cosmic void, soft golden-white light radiating outward like the first dawn, Chinese ink painting meets cosmic photography, bioluminescent",
    2: "Yin and Yang separating from unity, dark cosmic waters meeting blazing cosmic light, swirling nebula in deep midnight blue and warm gold, ancient Taoist symbol evolving into a living galaxy, surreal hyper-detailed digital art",
    3: "Central Harmony crystallizing between yin and yang, a luminous jade-green energy stream flowing between dark and light forces, three cosmic pillars of creation aligned, mystical ancient Chinese cosmology meets space art",
    4: "Ten thousand things bursting forth from cosmic harmony, an explosion of life — rivers of light, mountain forms, crystalline structures, flowers of energy, all emanating from a central Tao point, cosmic genesis artwork, vibrant yet mystical",
  };

  try {
    const prompt = `${IMAGE_PROMPTS[stage]} Style: deep-space midnight aesthetic, glassmorphism light effects, violet-cyan-gold color palette, ultra-detailed cosmic art`;
    const { data, error } = await supabase.functions.invoke<ImageResponse>("ai-dream-image", {
      body: { dream: prompt },
    });

    if (error) {
      if (error instanceof FunctionsHttpError) {
        console.warn("[CosmicImage] HTTP error:", error.message);
      } else if (error instanceof FunctionsRelayError) {
        console.warn("[CosmicImage] Relay error");
      } else if (error instanceof FunctionsFetchError) {
        console.warn("[CosmicImage] Fetch error");
      }
      return undefined;
    }

    if (data?.success && data.images && data.images.length > 0) {
      return data.images[0].url;
    }
  } catch (e) {
    console.warn("[CosmicImage] Error:", e);
  }
  return undefined;
}

export function useCosmicEvent({ onText, onComplete, onError }: CosmicEventCallbacks) {
  const triggerEvent = useCallback(
    async (id: string, stage: GameStage, actionType: ActionType, eventIndex: number, language?: string) => {
      const blocks = new Map<number, { type: string; content: string }>();

      // Start both text streaming and image generation simultaneously
      const textPromise = new Promise<void>((resolve) => {
        fetchEventSource(`${SUPABASE_URL}/functions/v1/ai-cosmic-event`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ stage, actionType, eventIndex, language: language ?? "zh" }),

          async onopen(response) {
            if (!response.ok) {
              resolve();
            }
          },

          onmessage(event) {
            if (!event.data) return;
            let data;
            try {
              data = JSON.parse(event.data);
            } catch {
              return;
            }

            if (data.type === "error") {
              onError?.(id, data.error?.message || "Cosmic narration unavailable");
              resolve();
              return;
            }

            switch (data.type) {
              case "content_block_start":
                blocks.set(data.index, { type: data.content_block.type, content: "" });
                break;
              case "content_block_delta": {
                const block = blocks.get(data.index);
                if (block?.type === "text") {
                  block.content += data.delta.text || "";
                  onText(id, block.content);
                }
                break;
              }
              case "message_stop":
                resolve();
                break;
            }
          },

          onerror(err) {
            console.warn("[CosmicEvent] SSE error:", err);
            resolve();
          },
        }).catch(() => resolve());
      });

      const imagePromise = generateCosmicImage(stage, actionType);

      const [, imageUrl] = await Promise.all([textPromise, imagePromise]);
      onComplete(id, imageUrl);
    },
    [onText, onComplete, onError]
  );

  return { triggerEvent };
}
