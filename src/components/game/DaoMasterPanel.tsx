import { useEffect, useRef, useState } from "react";
import { X, MessageCircle } from "lucide-react";

const DAO_YAN_URL = "https://167c2bc1450e4ea3a0dc4b07c5873069.prod.enter.pro/";

interface DaoMasterPanelProps {
  contextQuery?: string;
  onClearQuery?: () => void;
}

export function DaoMasterPanel({ contextQuery, onClearQuery }: DaoMasterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [iframeSrc, setIframeSrc] = useState(DAO_YAN_URL);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const prevQueryRef = useRef<string | undefined>(undefined);

  // When a context query arrives, open the panel and update the iframe src
  useEffect(() => {
    if (contextQuery && contextQuery !== prevQueryRef.current) {
      prevQueryRef.current = contextQuery;
      const encoded = encodeURIComponent(contextQuery);
      setIframeSrc(`${DAO_YAN_URL}?q=${encoded}`);
      setIsOpen(true);
    }
  }, [contextQuery]);

  function handleOpen() {
    setIsOpen(true);
    setIframeSrc(DAO_YAN_URL);
  }

  function handleClose() {
    setIsOpen(false);
    onClearQuery?.();
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all duration-300 hover:scale-105"
        style={{
          background: "linear-gradient(135deg, hsl(240 18% 16% / 0.85), hsl(240 15% 11% / 0.7))",
          border: "1px solid hsl(260 60% 55% / 0.4)",
          boxShadow: "0 4px 24px hsl(260 80% 60% / 0.15)",
          backdropFilter: "blur(12px)",
        }}
        title="向道衍问道"
      >
        <MessageCircle size={16} style={{ color: "hsl(260 80% 70%)" }} />
        <span
          className="font-serif text-sm"
          style={{ color: "hsl(260 70% 72%)" }}
        >
          问道师
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
          道衍
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
          width: "min(420px, 100vw)",
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
              }}
            >
              <span style={{ fontSize: "0.9rem" }}>☯</span>
            </div>
            <div>
              <p className="font-serif text-sm" style={{ color: "hsl(260 70% 72%)" }}>
                道衍
              </p>
              <p className="text-xs" style={{ color: "hsl(220 15% 42%)", fontFamily: "Inter, sans-serif" }}>
                帛书老子智慧修行平台
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

        {/* Iframe */}
        <div className="flex-1 relative overflow-hidden">
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            className="w-full h-full border-0"
            title="道衍 — 帛书老子智慧平台"
            allow="clipboard-write"
          />
        </div>
      </div>
    </>
  );
}
