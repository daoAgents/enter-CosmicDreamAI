import { useState, useRef } from "react";
import { Sparkles, Moon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DreamInputProps {
  onVisualize: (dream: string) => void;
  isLoading: boolean;
}

export function DreamInput({ onVisualize, isLoading }: DreamInputProps) {
  const [dream, setDream] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (dream.trim() && !isLoading) {
      onVisualize(dream.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Input container */}
      <div
        className={cn(
          "relative rounded-2xl transition-all duration-700",
          "glass-strong",
          isFocused && "animate-pulse-glow"
        )}
        style={{
          boxShadow: isFocused
            ? "0 0 40px hsl(260 80% 70% / 0.25), 0 0 80px hsl(260 80% 70% / 0.1), inset 0 1px 0 hsl(260 60% 75% / 0.15)"
            : "0 8px 32px hsl(240 25% 4% / 0.6), inset 0 1px 0 hsl(260 60% 75% / 0.08)",
        }}
      >
        {/* Shimmer overlay */}
        {isFocused && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
            style={{ zIndex: 0 }}
          >
            <div
              className="absolute inset-0 animate-shimmer opacity-50"
              style={{
                background: "linear-gradient(90deg, transparent, hsl(260 80% 70% / 0.06), transparent)",
                backgroundSize: "200% 100%",
              }}
            />
          </div>
        )}

        {/* Header */}
        <div className="relative flex items-center gap-2 px-5 pt-5 pb-2" style={{ zIndex: 1 }}>
          <Moon className="w-4 h-4" style={{ color: "hsl(260, 80%, 70%)" }} />
          <span className="text-xs tracking-widest uppercase"
            style={{ color: "hsl(260, 80%, 70%)", fontFamily: "Inter, sans-serif", fontWeight: 300, letterSpacing: "0.15em" }}>
            Describe Your Dream
          </span>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={dream}
          onChange={(e) => setDream(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="I was floating through a cathedral of mirrors, each reflection showing a different version of myself reaching toward a luminous door..."
          disabled={isLoading}
          rows={4}
          className={cn(
            "relative w-full bg-transparent border-none outline-none resize-none",
            "px-5 pb-4 text-foreground/90 placeholder:text-muted-foreground/40",
            "transition-all duration-300 disabled:opacity-50"
          )}
          style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: "1.125rem",
            lineHeight: "1.75",
            fontStyle: "italic",
            fontWeight: 300,
            zIndex: 1,
          }}
        />

        {/* Bottom row */}
        <div className="relative flex items-center justify-between px-5 pb-5 pt-1" style={{ zIndex: 1 }}>
          <span className="text-xs" style={{ color: "hsl(220, 15%, 40%)", fontFamily: "Inter, sans-serif" }}>
            {dream.length > 0 && <>{dream.length} chars &nbsp;·&nbsp; </>}
            <span style={{ opacity: 0.6 }}>⌘↵ to visualize</span>
          </span>

          <button
            onClick={handleSubmit}
            disabled={!dream.trim() || isLoading}
            className={cn(
              "relative flex items-center gap-2 px-5 py-2.5 rounded-xl",
              "text-sm font-medium transition-all duration-500",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "group overflow-hidden"
            )}
            style={{
              background: dream.trim() && !isLoading
                ? "linear-gradient(135deg, hsl(260 80% 60%), hsl(200 80% 55%))"
                : "hsl(240 15% 15%)",
              color: dream.trim() && !isLoading ? "hsl(240 25% 4%)" : "hsl(220 15% 45%)",
              boxShadow: dream.trim() && !isLoading
                ? "0 4px 20px hsl(260 80% 70% / 0.35)"
                : "none",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Visualizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Visualize Dream</span>
              </>
            )}
          </button>
        </div>

        {/* Bottom border glow */}
        <div
          className="absolute bottom-0 left-4 right-4 h-px transition-all duration-700"
          style={{
            background: isFocused
              ? "linear-gradient(90deg, transparent, hsl(260 80% 70% / 0.5), hsl(200 90% 65% / 0.5), transparent)"
              : "linear-gradient(90deg, transparent, hsl(240 30% 25% / 0.4), transparent)",
          }}
        />
      </div>

      {/* Hint text */}
      <p className="text-center mt-4 text-xs" style={{
        color: "hsl(220, 15%, 35%)",
        fontFamily: "Inter, sans-serif",
        fontWeight: 300,
        letterSpacing: "0.05em",
      }}>
        Both symbolism analysis and visual portal will appear simultaneously
      </p>
    </div>
  );
}
