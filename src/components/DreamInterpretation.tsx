import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface DreamInterpretationProps {
  interpretation: string;
  isLoading: boolean;
  error: string | null;
  isComplete: boolean;
}

function formatInterpretation(text: string): React.ReactNode[] {
  if (!text) return [];

  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let keyIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      nodes.push(<div key={`space-${keyIndex++}`} className="h-3" />);
      continue;
    }

    // Bold headers (markdown **text**)
    if (line.startsWith("**") && line.endsWith("**")) {
      const content = line.slice(2, -2);
      nodes.push(
        <h3
          key={`h-${keyIndex++}`}
          className="font-serif italic mt-4 mb-2"
          style={{
            color: "hsl(260, 70%, 75%)",
            fontSize: "1.1rem",
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          {content}
        </h3>
      );
      continue;
    }

    // Section headers with #
    if (line.startsWith("# ") || line.startsWith("## ") || line.startsWith("### ")) {
      const content = line.replace(/^#+\s/, "");
      const isTitle = line.startsWith("# ");
      nodes.push(
        <h2
          key={`title-${keyIndex++}`}
          className="font-serif italic mb-3"
          style={{
            background: isTitle
              ? "linear-gradient(135deg, hsl(260 80% 75%), hsl(200 90% 70%))"
              : "linear-gradient(135deg, hsl(260 70% 70%), hsl(320 60% 68%))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontSize: isTitle ? "1.5rem" : "1.2rem",
            fontWeight: 400,
            lineHeight: 1.3,
            marginTop: isTitle ? "0" : "1rem",
          }}
        >
          {content}
        </h2>
      );
      continue;
    }

    // Process inline bold
    const parts = line.split(/\*\*(.+?)\*\*/g);
    const processed: React.ReactNode[] = parts.map((part, pIdx) => {
      if (pIdx % 2 === 1) {
        return (
          <strong key={pIdx} style={{ color: "hsl(260, 70%, 80%)", fontWeight: 500 }}>
            {part}
          </strong>
        );
      }
      return part;
    });

    nodes.push(
      <p
        key={`p-${keyIndex++}`}
        className="font-serif"
        style={{
          color: "hsl(220, 20%, 82%)",
          fontSize: "1rem",
          lineHeight: 1.85,
          fontWeight: 300,
          fontStyle: i === 0 ? "italic" : "normal",
        }}
      >
        {processed}
      </p>
    );
  }

  return nodes;
}

export function DreamInterpretation({ interpretation, isLoading, error, isComplete }: DreamInterpretationProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full h-full flex flex-col">
      {/* Card */}
      <div
        className="flex-1 rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "linear-gradient(135deg, hsl(240 20% 9% / 0.9), hsl(240 25% 6% / 0.8))",
          backdropFilter: "blur(24px)",
          border: "1px solid hsl(240 30% 18% / 0.6)",
          boxShadow: "0 8px 40px hsl(240 25% 4% / 0.7), inset 0 1px 0 hsl(260 60% 75% / 0.06)",
        }}
      >
        {/* Card header */}
        <div
          className="flex items-center gap-3 px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid hsl(240 25% 15% / 0.5)" }}
        >
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: 6, height: 6,
                  background: `hsl(${260 - i * 30} ${70 + i * 5}% ${65 + i * 3}% / 0.6)`,
                }}
              />
            ))}
          </div>
          <span
            className="text-xs tracking-widest uppercase"
            style={{
              color: "hsl(260, 40%, 55%)",
              fontFamily: "Inter, sans-serif",
              fontWeight: 300,
              letterSpacing: "0.18em",
            }}
          >
            {t("oracle.title")}
          </span>
          {isLoading && (
            <Loader2 className="w-3 h-3 ml-auto animate-spin" style={{ color: "hsl(260, 70%, 65%)" }} />
          )}
          {isComplete && (
            <div
              className="ml-auto w-1.5 h-1.5 rounded-full"
              style={{ background: "hsl(160, 70%, 55%)", boxShadow: "0 0 6px hsl(160 70% 55% / 0.6)" }}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Idle state */}
          {!isLoading && !interpretation && !error && (
            <div className="h-full flex flex-col items-center justify-center gap-4 py-8">
              <div className="flex gap-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-full"
                    style={{
                      width: 8, height: 8,
                      background: `hsl(260 60% 60% / 0.3)`,
                      animation: `pulse-glow 2s ease-in-out infinite ${i * 0.4}s`,
                    }}
                  />
                ))}
              </div>
              <p
                className="font-serif italic text-center"
                style={{ color: "hsl(220, 15%, 45%)", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: "280px" }}
              >
                {t("oracle.idle")}
              </p>
              <p
                className="text-xs text-center"
                style={{
                  color: "hsl(220, 15%, 32%)",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 300,
                  maxWidth: "240px",
                  lineHeight: 1.6,
                }}
              >
                {t("oracle.idleDesc")}
              </p>
            </div>
          )}

          {/* Loading with no content yet */}
          {isLoading && !interpretation && (
            <div className="h-full flex flex-col items-center justify-center gap-4 py-8">
              <div className="relative">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: "hsl(260, 70%, 65%)" }} />
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ boxShadow: "0 0 20px hsl(260 80% 70% / 0.3)", animation: "pulse-glow 2s infinite" }}
                />
              </div>
              <p className="font-serif italic" style={{ color: "hsl(260, 50%, 60%)", fontSize: "0.95rem" }}>
                {t("oracle.reading")}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="rounded-xl p-4"
              style={{
                background: "hsl(320 60% 20% / 0.15)",
                border: "1px solid hsl(320 60% 40% / 0.2)",
              }}
            >
              <p className="font-serif italic text-sm" style={{ color: "hsl(320, 60%, 70%)" }}>
                {error}
              </p>
            </div>
          )}

          {/* Interpretation text */}
          {interpretation && (
            <div
              className={cn("space-y-1", !isComplete ? "" : "animate-fade-in")}
              style={{ minHeight: "100%" }}
            >
              {formatInterpretation(interpretation)}

              {/* Streaming cursor */}
              {isLoading && (
                <span
                  className="inline-block w-0.5 h-4 ml-0.5 animate-typing-cursor"
                  style={{
                    background: "hsl(260, 70%, 65%)",
                    verticalAlign: "middle",
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
