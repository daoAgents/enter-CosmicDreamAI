import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from "@supabase/supabase-js";

const FALLBACK_MESSAGES: Record<string, string> = {
  authentication_error: "Authentication failed. Please refresh the page.",
  rate_limit_error: "Too many requests. Please try again later.",
  insufficient_credits: "The AI credits have been exhausted. Please contact the administrator.",
  permission_error: "AI capability is disabled. Please contact the administrator.",
  api_error: "The vision oracle is temporarily unavailable.",
  internal_error: "Service error. Please try again later.",
};

function getUserMessage(code: string, backendMessage: string): string {
  if (backendMessage) return backendMessage;
  return FALLBACK_MESSAGES[code] || "Vision generation unavailable.";
}

interface GeneratedImage {
  url: string;
  meta_data?: Record<string, unknown>;
}

interface EdgeFunctionResponse {
  success: boolean;
  images?: GeneratedImage[];
  task_id?: string;
  message?: string;
  code?: string;
}

export function useDreamImage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = useCallback(async (dream: string) => {
    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke<EdgeFunctionResponse>(
        "ai-dream-image",
        { body: { dream } }
      );

      if (invokeError) {
        if (invokeError instanceof FunctionsHttpError) {
          const errorBody = await invokeError.context.json();
          throw new Error(getUserMessage(errorBody.code || "api_error", errorBody.message || "Request failed"));
        }
        if (invokeError instanceof FunctionsRelayError) {
          throw new Error("Network connection error. Please check your connection.");
        }
        if (invokeError instanceof FunctionsFetchError) {
          throw new Error("Network request failed. Please try again.");
        }
        throw new Error(invokeError.message || "Network request failed");
      }

      if (!data) {
        throw new Error("No response received from the vision oracle.");
      }

      if (data.success === false) {
        throw new Error(getUserMessage(data.code || "api_error", data.message || "Vision generation failed"));
      }

      if (data.success === true && data.images && data.images.length > 0) {
        setImageUrl(data.images[0].url);
        return data.images[0].url;
      }

      throw new Error("No image was generated.");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate vision";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setImageUrl(null);
    setError(null);
  }, []);

  return { imageUrl, isLoading, error, generateImage, reset };
}
