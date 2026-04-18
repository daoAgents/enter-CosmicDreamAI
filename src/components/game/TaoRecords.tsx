import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TaoRecord } from "@/hooks/useTaoRecords";

interface TaoRecordsProps {
  records: TaoRecord[];
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/** Minimal Markdown: **bold** and newlines → paragraphs */
function renderAnswer(text: string) {
  return text.split(/\n\n+/).map((para, pi) => {
    // Bold spans
    const parts = para.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={pi} className="mb-3 last:mb-0 leading-relaxed">
        {parts.map((part, idx) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={idx} style={{ color: "hsl(45 85% 78%)", fontWeight: 600 }}>
              {part.slice(2, -2)}
            </strong>
          ) : (
            <span key={idx}>{part}</span>
          )
        )}
      </p>
    );
  });
}

export function TaoRecords({ records }: TaoRecordsProps) {
  const { t } = useTranslation();

  if (records.length === 0) {
    return (
      <div
        className="glass-strong rounded-2xl flex flex-col items-center justify-center text-center p-8"
        style={{ minHeight: 300, border: "1px solid hsl(45 40% 22% / 0.4)" }}
      >
        <div
          style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "hsl(45 60% 25% / 0.3)",
            border: "1px solid hsl(45 50% 40% / 0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <BookOpen size={20} style={{ color: "hsl(45 70% 55%)" }} />
        </div>
        <p className="font-serif italic" style={{ color: "hsl(220 20% 55%)", fontSize: "1rem" }}>
          {t("tao.taorecords.empty_title")}
        </p>
        <p className="text-xs mt-2" style={{ color: "hsl(220 15% 38%)", fontFamily: "Inter, sans-serif" }}>
          {t("tao.taorecords.empty_desc")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, hsl(45 50% 35% / 0.4))" }} />
        <span
          className="text-xs tracking-widest uppercase"
          style={{ color: "hsl(45 60% 50%)", fontFamily: "Inter, sans-serif", letterSpacing: "0.2em" }}
        >
          {t("tao.taorecords.title")}
        </span>
        <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, hsl(45 50% 35% / 0.4), transparent)" }} />
      </div>

      {records.map((rec, i) => (
        <div
          key={rec.id}
          className="glass-strong rounded-2xl overflow-hidden animate-fade-in"
          style={{
            borderLeft: "2px solid hsl(45 80% 50% / 0.55)",
            border: "1px solid hsl(45 40% 22% / 0.4)",
            borderLeftWidth: 2,
            borderLeftColor: "hsl(45 80% 50% / 0.55)",
            boxShadow: "0 4px 24px hsl(45 60% 20% / 0.12)",
            animationDelay: i === 0 ? "0s" : undefined,
          }}
        >
          {/* Question row */}
          <div
            className="flex items-start gap-2 px-4 pt-3 pb-2"
            style={{ borderBottom: "1px solid hsl(45 30% 15% / 0.4)" }}
          >
            <span
              className="flex-shrink-0 text-xs rounded px-1.5 py-0.5 font-serif"
              style={{
                background: "hsl(45 50% 25% / 0.35)",
                border: "1px solid hsl(45 50% 35% / 0.3)",
                color: "hsl(45 70% 62%)",
                fontSize: "0.7rem",
              }}
            >
              {t("tao.taorecords.question_label")}
            </span>
            <p
              className="flex-1 font-serif leading-relaxed"
              style={{ color: "hsl(220 15% 58%)", fontSize: "0.8rem" }}
            >
              {rec.question}
            </p>
            <span
              className="flex-shrink-0 text-xs"
              style={{ color: "hsl(220 15% 32%)", fontFamily: "Inter, sans-serif" }}
            >
              {formatTime(rec.timestamp)}
            </span>
          </div>

          {/* Answer body */}
          <div className="px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <div
                style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: "linear-gradient(135deg, hsl(260 70% 30%), hsl(200 60% 22%))",
                  border: "1px solid hsl(260 50% 40% / 0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.6rem",
                }}
              >
                ☯
              </div>
              <span
                className="text-xs font-serif"
                style={{ color: "hsl(45 65% 58%)" }}
              >
                {t("tao.taorecords.answer_label")}
              </span>
            </div>
            <div
              className="font-serif"
              style={{
                color: "hsl(45 55% 75%)",
                fontSize: "0.84rem",
                lineHeight: 1.85,
              }}
            >
              {renderAnswer(rec.answer)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
