import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

const LANGS = [
  { code: "en", label: "EN" },
  { code: "zh", label: "中" },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language;

  const toggle = () => {
    const next = current === "en" ? "zh" : "en";
    i18n.changeLanguage(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle language"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-300"
      style={{
        background: "hsl(240 20% 10% / 0.7)",
        backdropFilter: "blur(12px)",
        border: "1px solid hsl(260 30% 22% / 0.5)",
        boxShadow: "0 2px 12px hsl(240 25% 4% / 0.4)",
      }}
    >
      <Languages
        className="w-3.5 h-3.5"
        style={{ color: "hsl(260, 70%, 65%)" }}
      />
      <span
        className="text-xs font-medium"
        style={{ color: "hsl(220, 20%, 65%)", fontFamily: "Inter, sans-serif" }}
      >
        {LANGS.find((l) => l.code === current)?.label ?? "EN"}
      </span>
      <span style={{ color: "hsl(240, 20%, 35%)", fontSize: "0.6rem" }}>/</span>
      <span
        className="text-xs"
        style={{ color: "hsl(220, 20%, 40%)", fontFamily: "Inter, sans-serif" }}
      >
        {LANGS.find((l) => l.code !== current)?.label ?? "中"}
      </span>
    </button>
  );
}
