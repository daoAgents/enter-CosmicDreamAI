import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NebulaBackground } from "@/components/NebulaBackground";
import { StarfieldCanvas } from "@/components/StarfieldCanvas";
import { CosmosView } from "@/components/game/CosmosView";
import { ResourcePanel } from "@/components/game/ResourcePanel";
import { ActionPanel } from "@/components/game/ActionPanel";
import { StageDisplay } from "@/components/game/StageDisplay";
import { EventLog } from "@/components/game/EventLog";
import { TaoRecords } from "@/components/game/TaoRecords";
import { DaoMasterPanel } from "@/components/game/DaoMasterPanel";
import { StageTransition } from "@/components/game/StageTransition";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useGameState } from "@/hooks/useGameState";
import { useCosmicEvent } from "@/hooks/useCosmicEvent";
import { useTaoRecords } from "@/hooks/useTaoRecords";
import type { GameStage } from "@/hooks/useGameState";

export default function TaoGame() {
  const { t, i18n } = useTranslation();
  const {
    state,
    doWuwei,
    doShouzh,
    doCosmosTouch,
    startEvent,
    updateEventText,
    completeEvent,
    tryAdvanceStage,
    reset,
    canAdvanceStage,
  } = useGameState();

  const [isEventLoading, setIsEventLoading] = useState(false);
  const [daoQuery, setDaoQuery] = useState<string | undefined>(undefined);
  const [transitionStage, setTransitionStage] = useState<GameStage | null>(null);
  const [activeTab, setActiveTab] = useState<"events" | "records">("events");
  const [newRecordCount, setNewRecordCount] = useState(0);
  const { records, addRecord } = useTaoRecords();
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
        updateEventText(id, t("tao.error"));
        setIsEventLoading(false);
      },
      [updateEventText, t]
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

    await triggerEvent(id, state.stage, "huasheng", eventIndex, i18n.language);
  }, [isEventLoading, state.zhongqi, state.stage, state.events, startEvent, triggerEvent, i18n.language]);

  // Intercept advance: show ceremony first, then commit stage change
  const handleAdvanceStage = useCallback(() => {
    if (!canAdvanceStage) return;
    setTransitionStage((state.stage + 1) as GameStage);
  }, [canAdvanceStage, state.stage]);

  const handleTransitionComplete = useCallback(() => {
    setTransitionStage(null);
    tryAdvanceStage();
  }, [tryAdvanceStage]);

  const handleRecordSaved = useCallback((question: string, answer: string) => {
    addRecord(question, answer);
    setNewRecordCount((n) => (activeTab === "records" ? 0 : n + 1));
  }, [addRecord, activeTab]);

  const handleSwitchToRecords = useCallback(() => {
    setActiveTab("records");
    setNewRecordCount(0);
  }, []);

  const stageEvents = state.events.filter((e) => e.stage === state.stage).length;

  return (
    <div className="min-h-screen relative overflow-x-hidden">
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
            <span className="font-serif text-sm" style={{ color: "hsl(260 70% 72%)" }}>
              {t("tao.title")}
            </span>
            <span className="text-xs ml-2" style={{ color: "hsl(220 15% 40%)", fontFamily: "Inter, sans-serif" }}>
              {t("tao.subtitle")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DaoMasterPanel
            contextQuery={daoQuery}
            onClearQuery={() => setDaoQuery(undefined)}
            onRecordSaved={handleRecordSaved}
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
            {t("tao.nav.dream")}
          </Link>
          <LanguageSwitcher />
          <button
            onClick={reset}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs transition-all hover:opacity-80"
            style={{
              background: "hsl(0 30% 14% / 0.6)",
              border: "1px solid hsl(0 40% 28% / 0.4)",
              color: "hsl(0 50% 55%)",
              fontFamily: "Inter, sans-serif",
            }}
            title={t("tao.nav.resetTitle")}
          >
            <RotateCcw size={12} />
            {t("tao.nav.reset")}
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
                  onTouch={doCosmosTouch}
                  onTriggerWuwei={doWuwei}
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
                onAdvanceStage={handleAdvanceStage}
              />

              {state.stage === 0 && !state.started && (
                <p
                  className="font-serif italic text-center text-xs"
                  style={{ color: "hsl(260 50% 50%)", lineHeight: 1.6 }}
                >
                  {t("tao.welcome.taoQuote").split("\n").map((line, i) => (
                    <span key={i}>{line}{i === 0 && <br />}</span>
                  ))}
                  <br />
                  <span style={{ color: "hsl(220 15% 38%)", fontStyle: "normal", fontSize: "0.68rem" }}>
                    {t("tao.welcome.startHint")}
                  </span>
                </p>
              )}
            </div>

            {/* RIGHT PANEL — Tabbed log */}
            <div ref={eventLogRef} className="flex-1 min-w-0">
              {/* Tab bar */}
              <div className="flex items-center gap-1 mb-4">
                <button
                  onClick={() => setActiveTab("events")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs transition-all duration-200"
                  style={{
                    background: activeTab === "events"
                      ? "hsl(260 50% 25% / 0.5)"
                      : "hsl(240 18% 12% / 0.5)",
                    border: `1px solid ${activeTab === "events" ? "hsl(260 55% 45% / 0.5)" : "hsl(240 22% 20% / 0.4)"}`,
                    color: activeTab === "events" ? "hsl(260 70% 72%)" : "hsl(220 15% 48%)",
                    fontFamily: "Inter, sans-serif",
                    boxShadow: activeTab === "events" ? "0 0 12px hsl(260 60% 30% / 0.2)" : "none",
                  }}
                >
                  <span className="font-serif">{t("tao.tabs.events")}</span>
                </button>
                <button
                  onClick={handleSwitchToRecords}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs transition-all duration-200"
                  style={{
                    background: activeTab === "records"
                      ? "hsl(45 55% 20% / 0.5)"
                      : "hsl(240 18% 12% / 0.5)",
                    border: `1px solid ${activeTab === "records" ? "hsl(45 60% 40% / 0.5)" : "hsl(240 22% 20% / 0.4)"}`,
                    color: activeTab === "records" ? "hsl(45 75% 68%)" : "hsl(220 15% 48%)",
                    fontFamily: "Inter, sans-serif",
                    boxShadow: activeTab === "records" ? "0 0 12px hsl(45 50% 25% / 0.2)" : "none",
                  }}
                >
                  <span className="font-serif">{t("tao.tabs.records")}</span>
                  {newRecordCount > 0 && (
                    <span
                      className="flex items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        minWidth: 18, height: 18, padding: "0 4px",
                        background: "hsl(45 80% 50%)",
                        color: "hsl(240 22% 10%)",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.65rem",
                      }}
                    >
                      {newRecordCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Tab content */}
              {activeTab === "events" ? (
                state.events.length === 0 && state.stage === 0 ? (
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
                      {t("tao.welcome.title")}
                    </p>
                    <p className="font-serif italic text-sm" style={{ color: "hsl(220 15% 45%)", maxWidth: 300 }}>
                      {t("tao.welcome.desc").split("\n").map((line, i) => (
                        <span key={i}>{line}{i === 0 && <br />}</span>
                      ))}
                    </p>
                    <p className="text-xs" style={{ color: "hsl(220 15% 32%)", fontFamily: "Inter, sans-serif", letterSpacing: "0.05em" }}>
                      {t("tao.welcome.chapter")}
                    </p>
                  </div>
                ) : (
                  <EventLog
                    events={state.events}
                    onAskDaoMaster={(query) => setDaoQuery(query)}
                  />
                )
              ) : (
                <TaoRecords records={records} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stage advancement ceremony overlay */}
      {transitionStage !== null && (
        <StageTransition
          newStage={transitionStage}
          onComplete={handleTransitionComplete}
        />
      )}
    </div>
  );
}
