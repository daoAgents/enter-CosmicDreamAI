import { useState, useRef, useCallback } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";

const FALLBACK_MESSAGES: Record<string, string> = {
  authentication_error: "Authentication failed. Please refresh the page.",
  rate_limit_error: "Too many requests. Please try again later.",
  invalid_request_error: "Please describe your dream first.",
  overloaded_error: "The dream oracle is resting. Please try again shortly.",
  insufficient_credits: "The AI credits have been exhausted. Please contact the administrator.",
  permission_error: "AI capability is disabled. Please contact the administrator.",
  api_error: "The oracle is temporarily unavailable.",
};

function getUserErrorMessage(code: string, backendMessage: string): string {
  if (backendMessage) return backendMessage;
  return FALLBACK_MESSAGES[code] || "The oracle is temporarily unavailable.";
}

export function useDreamAnalysis() {
  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const analyzeDream = useCallback(async (dream: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setInterpretation("");
    setIsLoading(true);
    setError(null);
    setIsComplete(false);

    const blocks = new Map<number, { type: string; content: string }>();

    try {
      await fetchEventSource(`${SUPABASE_URL}/functions/v1/ai-dream-analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ dream }),
        signal: abortControllerRef.current.signal,

        async onopen(response) {
          const contentType = response.headers.get("content-type");

          if (!response.ok) {
            if (contentType?.includes("text/event-stream")) {
              const text = await response.text();
              const dataMatch = text.match(/data: (.+)/);
              if (dataMatch) {
                try {
                  const errorData = JSON.parse(dataMatch[1]);
                  if (errorData.type === "error" && errorData.error?.message) {
                    throw new Error(errorData.error.message);
                  }
                } catch (parseError) {
                  if (parseError instanceof Error && !parseError.message.includes("Unexpected token")) {
                    throw parseError;
                  }
                }
              }
            }
            if (contentType?.includes("application/json")) {
              const errorData = await response.json();
              throw new Error(errorData.error?.message || `Request failed: ${response.status}`);
            }
            throw new Error(`Request failed: ${response.status}`);
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
            const errorMsg = getUserErrorMessage(
              data.error?.type || "api_error",
              data.error?.message || "Oracle service error"
            );
            setError(errorMsg);
            setIsLoading(false);
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
                setInterpretation(block.content);
              }
              break;
            }
            case "message_stop":
              setIsComplete(true);
              setIsLoading(false);
              break;
          }
        },

        onerror(err) {
          throw err;
        },
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message || "Failed to analyze dream");
        setIsLoading(false);
      }
    }
  }, []);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  const reset = useCallback(() => {
    cancel();
    setInterpretation("");
    setError(null);
    setIsComplete(false);
  }, [cancel]);

  return { interpretation, isLoading, error, isComplete, analyzeDream, cancel, reset };
}
