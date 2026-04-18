import { useEffect, useRef, useState, useCallback } from "react";
import { X, MessageCircle, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

const DAOYAN_API_URL =
  "https://spb-t4nnhrh7ch7j2940.supabase.opentrust.net/functions/v1/daoyan-agent-api";
const DAOYAN_ANON_KEY =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiIsInJlZiI6InNwYi10NG5uaHJoN2NoN2oyOTQwIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzYwNzQ1MjMsImV4cCI6MjA5MTY1MDUyM30.5GFdUIA3rHOUoCI99ocBzBxDZjjQxOHRV-T6CKiHzCQ";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface DaoMasterPanelProps {
  contextQuery?: string;
  onClearQuery?: () => void;
}

function msgId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function DaoMasterPanel({ contextQuery, onClearQuery }: DaoMasterPanelProps) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const prevQueryRef = useRef<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const askDaoyan = useCallback(
    async (question: string) => {
      if (isStreaming || !question.trim()) return;
      setIsStreaming(true);

      const userMsg: ChatMessage = { id: msgId(), role: "user", content: question };
      const assistantId = msgId();
      const assistantMsg: ChatMessage = { id: assistantId, role: "assistant", content: "" };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      // Build conversation history from previous messages (excluding the new ones)
      const history = messages.map((m) => ({ role: m.role, content: m.content }));

      try {
        const locale = i18n.language === "zh" ? "zh-CN" : "en";
        const response = await fetch(DAOYAN_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${DAOYAN_ANON_KEY}`,
          },
          body: JSON.stringify({
            question,
            conversation_history: history,
            locale,
            stream: true,
          }),
        });

        if (!response.ok || !response.body) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: i18n.language === "zh" ? "道衍暂时无法回应，请稍后再试。" : "Daoyan is unavailable. Please try again later." }
                : m
            )
          );
          setIsStreaming(false);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + chunk } : m
            )
          );
        }
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: i18n.language === "zh" ? "道衍暂时无法回应，请稍后再试。" : "Daoyan is unavailable. Please try again later." }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, messages, i18n.language]
  );

  // Auto-send contextQuery when it arrives
  useEffect(() => {
    if (contextQuery && contextQuery !== prevQueryRef.current) {
      prevQueryRef.current = contextQuery;
      setIsOpen(true);
      // Small delay to let the panel animate open
      setTimeout(() => askDaoyan(contextQuery), 300);
      onClearQuery?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextQuery]);

  function handleOpen() {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 400);
  }

  function handleClose() {
    setIsOpen(false);
  }

  function handleSend() {
    const q = inputValue.trim();
    if (!q || isStreaming) return;
    setInputValue("");
    askDaoyan(q);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
          width: "min(480px, 100vw)",
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

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ scrollbarWidth: "thin", scrollbarColor: "hsl(260 40% 20%) transparent" }}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <div style={{ fontSize: "2rem", opacity: 0.3 }}>☯</div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "hsl(220 15% 38%)", fontFamily: "Inter, sans-serif" }}
              >
                {t("tao.daomaster.empty_hint")}
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mr-2 mt-0.5"
                  style={{
                    background: "linear-gradient(135deg, hsl(260 70% 30%), hsl(200 60% 22%))",
                    border: "1px solid hsl(260 50% 40% / 0.4)",
                    fontSize: "0.7rem",
                  }}
                >
                  ☯
                </div>
              )}
              <div
                className="max-w-[82%] rounded-2xl px-3.5 py-2.5"
                style={
                  msg.role === "user"
                    ? {
                        background: "linear-gradient(135deg, hsl(260 55% 28% / 0.7), hsl(240 40% 22% / 0.6))",
                        border: "1px solid hsl(260 50% 40% / 0.35)",
                        color: "hsl(220 20% 82%)",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.82rem",
                        lineHeight: 1.6,
                      }
                    : {
                        background: "hsl(240 18% 11% / 0.6)",
                        border: "1px solid hsl(240 22% 20% / 0.5)",
                        color: "hsl(220 20% 78%)",
                        fontFamily: "'Noto Serif SC', serif",
                        fontSize: "0.84rem",
                        lineHeight: 1.8,
                      }
                }
              >
                {msg.content === "" && msg.role === "assistant" ? (
                  <span style={{ color: "hsl(260 50% 55%)", fontFamily: "Inter, sans-serif", fontSize: "0.78rem" }}>
                    {t("tao.daomaster.thinking")}
                  </span>
                ) : (
                  <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
                )}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div
          className="flex-shrink-0 flex items-center gap-2 px-3 py-3"
          style={{
            borderTop: "1px solid hsl(240 22% 16% / 0.7)",
            background: "hsl(240 22% 9%)",
          }}
        >
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder={t("tao.daomaster.input_placeholder")}
            className="flex-1 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all"
            style={{
              background: "hsl(240 18% 13%)",
              border: "1px solid hsl(240 25% 22% / 0.6)",
              color: "hsl(220 20% 80%)",
              fontFamily: "Inter, sans-serif",
              fontSize: "0.82rem",
              caretColor: "hsl(260 70% 65%)",
            }}
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || !inputValue.trim()}
            className="flex-shrink-0 rounded-xl px-3.5 py-2.5 transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: "linear-gradient(135deg, hsl(260 65% 38%), hsl(240 50% 30%))",
              border: "1px solid hsl(260 55% 48% / 0.4)",
              color: "hsl(260 80% 82%)",
              fontFamily: "Inter, sans-serif",
              fontSize: "0.82rem",
              fontWeight: 500,
            }}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </>
  );
}
