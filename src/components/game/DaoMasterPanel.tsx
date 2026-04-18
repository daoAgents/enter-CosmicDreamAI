import { useEffect, useRef, useState, useCallback } from "react";
import { X, MessageCircle, Copy, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

const DAO_YAN_URL = "https://167c2bc1450e4ea3a0dc4b07c5873069.prod.enter.pro/";
const DAO_YAN_ORIGIN = "https://167c2bc1450e4ea3a0dc4b07c5873069.prod.enter.pro";

interface DaoMasterPanelProps {
  contextQuery?: string;
  onClearQuery?: () => void;
}

function QueryBanner({
  query,
  onDismiss,
}: {
  query: string;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(true);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(query);
    } catch {
      const el = document.createElement("textarea");
      el.value = query;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 400);
    }, 3000);
  }

  if (!visible) return null;

  return (
    <div
      className="flex-shrink-0 animate-fade-in"
      style={{
        borderBottom: "1px solid hsl(260 50% 35% / 0.4)",
        background: "linear-gradient(135deg, hsl(260 35% 14% / 0.95), hsl(240 28% 10% / 0.9))",
        padding: "10px 14px",
        transition: "opacity 0.4s ease",
        opacity: visible ? 1 : 0,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs tracking-wide"
          style={{
            color: "hsl(260 60% 68%)",
            fontFamily: "Inter, sans-serif",
            letterSpacing: "0.08em",
          }}
        >
          {t("tao.daomaster.query_banner_label")}
        </span>
        <button
          onClick={() => { setVisible(false); setTimeout(onDismiss, 400); }}
          style={{ color: "hsl(220 15% 40%)", lineHeight: 1 }}
        >
          <X size={12} />
        </button>
      </div>

      <p
        className="font-serif leading-relaxed mb-3"
        style={{
          fontSize: "0.78rem",
          color: "hsl(220 20% 78%)",
          lineHeight: 1.65,
          wordBreak: "break-all",
        }}
      >
        {query}
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all duration-200"
          style={{
            background: copied ? "hsl(160 60% 25% / 0.5)" : "hsl(260 60% 35% / 0.4)",
            border: `1px solid ${copied ? "hsl(160 60% 40% / 0.5)" : "hsl(260 60% 55% / 0.4)"}`,
            color: copied ? "hsl(160 65% 65%)" : "hsl(260 70% 75%)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? t("tao.daomaster.copied") : t("tao.daomaster.copy_button")}
        </button>
        {copied && (
          <span
            className="text-xs animate-fade-in"
            style={{ color: "hsl(160 55% 52%)", fontFamily: "Inter, sans-serif" }}
          >
            {t("tao.daomaster.copy_hint")}
          </span>
        )}
      </div>
    </div>
  );
}

export function DaoMasterPanel({ contextQuery, onClearQuery }: DaoMasterPanelProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeQuery, setActiveQuery] = useState<string | undefined>(undefined);
  const [iframeReady, setIframeReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const prevQueryRef = useRef<string | undefined>(undefined);

  const tryPostMessage = useCallback((query: string) => {
    if (!iframeRef.current?.contentWindow) return;
    try {
      iframeRef.current.contentWindow.postMessage(
        { type: "ENTER_CHAT_INPUT", message: query },
        DAO_YAN_ORIGIN
      );
      iframeRef.current.contentWindow.postMessage(
        { type: "SET_INPUT", value: query },
        DAO_YAN_ORIGIN
      );
    } catch { /* ignore cross-origin errors */ }
  }, []);

  useEffect(() => {
    if (contextQuery && contextQuery !== prevQueryRef.current) {
      prevQueryRef.current = contextQuery;
      setActiveQuery(contextQuery);
      setIsOpen(true);
    }
  }, [contextQuery]);

  useEffect(() => {
    if (iframeReady && activeQuery) {
      const timer = setTimeout(() => tryPostMessage(activeQuery), 800);
      return () => clearTimeout(timer);
    }
  }, [iframeReady, activeQuery, tryPostMessage]);

  function handleOpen() { setIsOpen(true); }

  function handleClose() {
    setIsOpen(false);
    setActiveQuery(undefined);
    onClearQuery?.();
  }

  function handleIframeLoad() { setIframeReady(true); }

  function handleDismissBanner() {
    setActiveQuery(undefined);
    onClearQuery?.();
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all duration-300 hover:scale-105"
        style={{
          background: "linear-gradient(135deg, hsl(240 18% 16% / 0.85), hsl(240 15% 11% / 0.7))",
          border: "1px solid hsl(260 60% 55% / 0.4)",
          boxShadow: "0 4px 24px hsl(260 80% 60% / 0.15)",
          backdropFilter: "blur(12px)",
        }}
        title={t("tao.daomaster.button_label")}
      >
        <MessageCircle size={16} style={{ color: "hsl(260 80% 70%)" }} />
        <span className="font-serif text-sm" style={{ color: "hsl(260 70% 72%)" }}>
          {t("tao.daomaster.button_label")}
        </span>
        <span
          className="text-xs px-1.5 py-0.5 rounded-md"
          style={{
            background: "hsl(260 60% 40% / 0.3)",
            color: "hsl(260 60% 70%)",
            fontFamily: "Inter, sans-serif",
            fontSize: "0.65rem",
          }}
        >
          {t("tao.daomaster.button_tag")}
        </span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 transition-opacity duration-300"
          style={{ background: "hsl(240 25% 3% / 0.5)", backdropFilter: "blur(4px)" }}
          onClick={handleClose}
        />
      )}

      {/* Sliding panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: "min(440px, 100vw)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          background: "hsl(240 22% 8%)",
          borderLeft: "1px solid hsl(260 40% 28% / 0.4)",
          boxShadow: isOpen ? "-8px 0 40px hsl(260 60% 20% / 0.3)" : "none",
        }}
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{
            borderBottom: "1px solid hsl(240 25% 18% / 0.6)",
            background: "linear-gradient(90deg, hsl(240 22% 10%), hsl(260 25% 12%))",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg, hsl(260 80% 35%), hsl(200 70% 25%))",
                border: "1px solid hsl(260 60% 50% / 0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 12px hsl(260 80% 55% / 0.3)",
                fontSize: "0.9rem",
              }}
            >
              ☯
            </div>
            <div>
              <p className="font-serif text-sm" style={{ color: "hsl(260 70% 72%)" }}>
                {t("tao.daomaster.panel_title")}
              </p>
              <p className="text-xs" style={{ color: "hsl(220 15% 42%)", fontFamily: "Inter, sans-serif" }}>
                {t("tao.daomaster.panel_subtitle")}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 transition-all hover:opacity-80"
            style={{
              background: "hsl(240 20% 16%)",
              border: "1px solid hsl(240 20% 24% / 0.5)",
            }}
          >
            <X size={15} style={{ color: "hsl(220 15% 52%)" }} />
          </button>
        </div>

        {/* Query banner */}
        {activeQuery && isOpen && (
          <QueryBanner query={activeQuery} onDismiss={handleDismissBanner} />
        )}

        {/* Iframe */}
        <div className="flex-1 relative overflow-hidden">
          <iframe
            ref={iframeRef}
            src={DAO_YAN_URL}
            className="w-full h-full border-0"
            title={t("tao.daomaster.panel_title")}
            allow="clipboard-write"
            onLoad={handleIframeLoad}
          />
        </div>
      </div>
    </>
  );
}
