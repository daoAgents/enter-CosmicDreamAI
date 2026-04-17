import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, Star } from "lucide-react";
import { NebulaBackground } from "@/components/NebulaBackground";
import { StarfieldCanvas } from "@/components/StarfieldCanvas";
import { CosmosView } from "@/components/game/CosmosView";
import { ResourcePanel } from "@/components/game/ResourcePanel";
import { ActionPanel } from "@/components/game/ActionPanel";
import { StageDisplay } from "@/components/game/StageDisplay";
import { EventLog } from "@/components/game/EventLog";
import { DaoMasterPanel } from "@/components/game/DaoMasterPanel";
import { useGameState } from "@/hooks/useGameState";
import { useCosmicEvent } from "@/hooks/useCosmicEvent";

export default function TaoGame() {
  const {
    state,
    doWuwei,
    doShouzh,
    startEvent,
    updateEventText,
    completeEvent,
    tryAdvanceStage,
    reset,
    canAdvanceStage,
  } = useGameState();

  const [isEventLoading, setIsEventLoading] = useState(false);
  const [daoQuery, setDaoQuery] = useState<string | undefined>(undefined);
  const eventLogRef = useRef<HTMLDivElement>(null);

  const { triggerEvent } = useCosmicEvent({
    onText: useCallback(
      (id: string, text: string) => updateEventText(id, text),
      [updateEventText]
    ),
    onComplete: useCallback(
      (id: string, imageUrl?: string) => {
        completeEvent(id, imageUrl);
        setIsEventLoading(false);
      },
      [completeEvent]
    ),
    onError: useCallback(
      (id: string, _error: string) => {
        updateEventText(id, "宇宙的奥秘暂时无法显现，请稍后再试。");
        setIsEventLoading(false);
      },
      [updateEventText]
    ),
  });

  const handleHuasheng = useCallback(async () => {
    if (isEventLoading || state.zhongqi < 30 || state.stage === 0) return;
    const id = `event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const eventIndex = state.events.filter((e) => e.stage === state.stage).length;
    startEvent(id, "huasheng");
    setIsEventLoading(true);

    setTimeout(() => {
      eventLogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);

    await triggerEvent(id, state.stage, "huasheng", eventIndex);
  }, [isEventLoading, state.zhongqi, state.stage, state.events, startEvent, triggerEvent]);

  const stageEvents = state.events.filter((e) => e.stage === state.stage).length;

  return (
    <div className="min-h-full relative overflow-x-hidden">
      <NebulaBackground />
      <StarfieldCanvas />

      {/* Top bar */}
      <div
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-3"
        style={{
          background: "linear-gradient(180deg, hsl(240 22% 7% / 0.9), transparent)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "linear-gradient(135deg, hsl(260 70% 40%), hsl(200 70% 30%))",
              border: "1px solid hsl(260 60% 50% / 0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.75rem",
            }}
          >
            ☯
          </div>
          <div>
            <span className="font-serif text-sm" style={{ color: "hsl(260 70% 72%)" }}>太初</span>
            <span className="text-xs ml-2" style={{ color: "hsl(220 15% 40%)", fontFamily: "Inter, sans-serif" }}>
              道德经宇宙养成
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DaoMasterPanel
            contextQuery={daoQuery}
            onClearQuery={() => setDaoQuery(undefined)}
          />
          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs transition-all hover:opacity-80"
            style={{
              background: "hsl(240 18% 14% / 0.7)",
              border: "1px solid hsl(240 25% 24% / 0.5)",
              color: "hsl(220 15% 55%)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            <Star size={12} />
            梦境
          </Link>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs transition-all hover:opacity-80"
            style={{
              background: "hsl(0 30% 14% / 0.6)",
              border: "1px solid hsl(0 40% 28% / 0.4)",
              color: "hsl(0 50% 55%)",
              fontFamily: "Inter, sans-serif",
            }}
            title="重置游戏"
          >
            <RotateCcw size={12} />
            重置
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="relative pt-16 pb-12 px-4 md:px-6" style={{ zIndex: 10 }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* LEFT PANEL */}
            <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">

              <div
                className="glass-strong rounded-2xl px-5 py-4"
                style={{ border: "1px solid hsl(240 28% 24% / 0.5)" }}
              >
                <StageDisplay
                  stage={state.stage}
                  totalEvents={state.totalEvents}
                  zhongqi={state.zhongqi}
                  stageEvents={stageEvents}
                />
              </div>

              <div
                className="glass-strong rounded-2xl flex items-center justify-center py-6"
                style={{
                  border: "1px solid hsl(240 28% 24% / 0.4)",
                  background: "linear-gradient(135deg, hsl(240 20% 10% / 0.7), hsl(260 25% 8% / 0.5))",
                }}
              >
                <CosmosView
                  stage={state.stage}
                  yin={state.yin}
                  yang={state.yang}
                  zhongqi={state.zhongqi}
                />
              </div>

              <ResourcePanel
                yin={state.yin}
                yang={state.yang}
                zhongqi={state.zhongqi}
                stage={state.stage}
              />

              <ActionPanel
                stage={state.stage}
                yin={state.yin}
                yang={state.yang}
                zhongqi={state.zhongqi}
                started={state.started}
                canAdvanceStage={canAdvanceStage}
                isEventLoading={isEventLoading}
                onWuwei={doWuwei}
                onShouzh={doShouzh}
                onHuasheng={handleHuasheng}
                onAdvanceStage={tryAdvanceStage}
              />

              {state.stage === 0 && !state.started && (
                <p
                  className="font-serif italic text-center text-xs"
                  style={{ color: "hsl(260 50% 50%)", lineHeight: 1.6 }}
                >
                  道生一，一生二，<br />二生三，三生万物。<br />
                  <span style={{ color: "hsl(220 15% 38%)", fontStyle: "normal", fontSize: "0.68rem" }}>
                    点击「无为而化」开始
                  </span>
                </p>
              )}
            </div>

            {/* RIGHT PANEL — Event Log */}
            <div ref={eventLogRef} className="flex-1 min-w-0">
              {state.events.length === 0 && state.stage === 0 ? (
                <div
                  className="glass-strong rounded-2xl p-8 text-center"
                  style={{
                    border: "1px solid hsl(240 25% 22% / 0.4)",
                    minHeight: 400,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    gap: 12,
                  }}
                >
                  <p className="font-serif text-xl" style={{ color: "hsl(260 50% 55%)", fontWeight: 300 }}>
                    无名，天地之始
                  </p>
                  <p className="font-serif italic text-sm" style={{ color: "hsl(220 15% 45%)", maxWidth: 300 }}>
                    在混沌之初，一切尚未开始。<br />以无为之心，启动宇宙的第一次流转。
                  </p>
                  <p className="text-xs" style={{ color: "hsl(220 15% 32%)", fontFamily: "Inter, sans-serif", letterSpacing: "0.05em" }}>
                    帛书老子·第一章
                  </p>
                </div>
              ) : (
                <EventLog
                  events={state.events}
                  onAskDaoMaster={(query) => setDaoQuery(query)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
