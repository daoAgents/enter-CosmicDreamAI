import { useTranslation } from "react-i18next";
import { ExternalLink, Image } from "lucide-react";
import { CosmicEvent, STAGE_NAMES, GameStage } from "@/hooks/useGameState";

interface EventLogProps {
  events: CosmicEvent[];
  onAskDaoMaster?: (query: string) => void;
}

const STAGE_COLORS: Record<GameStage, string> = {
  0: "hsl(260 60% 60%)",
  1: "hsl(45 80% 65%)",
  2: "hsl(200 70% 65%)",
  3: "hsl(160 65% 58%)",
  4: "hsl(320 65% 65%)",
};

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function EventLog({ events, onAskDaoMaster }: EventLogProps) {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === "zh";

  const ACTION_LABELS: Record<string, string> = {
    wuwei: t("tao.eventlog.action_wuwei"),
    shouzh: t("tao.eventlog.action_shouzh"),
    huasheng: t("tao.eventlog.action_huasheng"),
  };

  if (events.length === 0) {
    return (
      <div
        className="glass-strong rounded-2xl flex flex-col items-center justify-center text-center p-8"
        style={{ minHeight: 300, border: "1px solid hsl(240 25% 22% / 0.5)" }}
      >
        <div
          style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "hsl(260 60% 30% / 0.3)",
            border: "1px solid hsl(260 50% 40% / 0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Image size={20} style={{ color: "hsl(260 60% 55%)" }} />
        </div>
        <p className="font-serif italic" style={{ color: "hsl(220 20% 55%)", fontSize: "1rem" }}>
          {t("tao.eventlog.title")}
        </p>
        <p className="text-xs mt-2" style={{ color: "hsl(220 15% 38%)", fontFamily: "Inter, sans-serif" }}>
          {t("tao.eventlog.empty_desc")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, hsl(260 40% 35% / 0.4))" }} />
        <span
          className="text-xs tracking-widest uppercase"
          style={{ color: "hsl(260 40% 50%)", fontFamily: "Inter, sans-serif", letterSpacing: "0.2em" }}
        >
          {t("tao.eventlog.title")}
        </span>
        <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, hsl(260 40% 35% / 0.4), transparent)" }} />
      </div>

      {events.map((event, i) => {
        const stageColor = STAGE_COLORS[event.stage];
        const stageInfo = STAGE_NAMES[event.stage];
        const stageName = isZh ? stageInfo.zh : stageInfo.en;
        const actionLabel = ACTION_LABELS[event.actionType] ?? ACTION_LABELS.huasheng;
        const query = t("tao.eventlog.ask_query", { stageName, actionLabel });

        return (
          <div
            key={event.id}
            className="glass-strong rounded-2xl overflow-hidden animate-fade-in"
            style={{
              border: `1px solid ${stageColor}28`,
              boxShadow: `0 4px 24px ${stageColor}10`,
              animationDelay: i === 0 ? "0s" : undefined,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{
                borderBottom: "1px solid hsl(240 22% 18% / 0.5)",
                background: `${stageColor}08`,
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: stageColor,
                    boxShadow: `0 0 6px ${stageColor}`,
                  }}
                />
                <span className="font-serif text-xs" style={{ color: stageColor }}>
                  {stageName}
                </span>
                <span className="text-xs" style={{ color: "hsl(220 15% 38%)", fontFamily: "Inter, sans-serif" }}>
                  · {actionLabel}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "hsl(220 15% 32%)", fontFamily: "Inter, sans-serif" }}>
                  {formatTime(event.timestamp)}
                </span>
                {onAskDaoMaster && (
                  <button
                    onClick={() => onAskDaoMaster(query)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs transition-all hover:opacity-80"
                    style={{
                      background: `${stageColor}18`,
                      border: `1px solid ${stageColor}35`,
                      color: stageColor,
                      fontFamily: "Inter, sans-serif",
                    }}
                    title={t("tao.daomaster.button_label")}
                  >
                    <ExternalLink size={10} />
                    {t("tao.eventlog.ask_button")}
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex gap-0">
              {/* Image — show loading spinner until imageUrl is set */}
              {event.imageUrl ? (
                <div
                  className="flex-shrink-0 animate-portal-reveal"
                  style={{ width: 120, minHeight: 120 }}
                >
                  <img
                    src={event.imageUrl}
                    alt={`${stageName} cosmic vision`}
                    className="w-full h-full object-cover"
                    style={{ minHeight: 120 }}
                    crossOrigin="anonymous"
                  />
                </div>
              ) : (
                <div
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{
                    width: 120, minHeight: 120,
                    background: `linear-gradient(135deg, hsl(240 20% 10%), ${stageColor}08)`,
                    borderRight: `1px solid ${stageColor}18`,
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      style={{
                        width: 20, height: 20, borderRadius: "50%",
                        border: `2px solid ${stageColor}40`,
                        borderTopColor: stageColor,
                        animation: "crystal-spin 1s linear infinite",
                      }}
                    />
                    <span style={{ fontSize: "0.6rem", color: stageColor, opacity: 0.6, fontFamily: "Inter, sans-serif" }}>
                      {t("tao.eventlog.image_loading")}
                    </span>
                  </div>
                </div>
              )}

              {/* Text */}
              <div className="flex-1 p-4">
                {event.text ? (
                  <p
                    className="font-serif leading-relaxed"
                    style={{
                      fontSize: "0.82rem",
                      color: "hsl(220 20% 72%)",
                      lineHeight: 1.75,
                    }}
                  >
                    {event.text}
                    {!event.imageUrl && event.text.length > 0 && (
                      <span
                        className="animate-typing-cursor ml-0.5"
                        style={{ color: stageColor }}
                      >
                        |
                      </span>
                    )}
                  </p>
                ) : (
                  <p
                    className="font-serif italic text-xs"
                    style={{ color: "hsl(220 15% 40%)" }}
                  >
                    {t("tao.eventlog.text_loading")}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
