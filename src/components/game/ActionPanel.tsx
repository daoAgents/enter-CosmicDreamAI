import { useState } from "react";
import { Sparkles, Waves, Zap, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GameStage } from "@/hooks/useGameState";

interface ActionPanelProps {
  stage: GameStage;
  yin: number;
  yang: number;
  zhongqi: number;
  started: boolean;
  canAdvanceStage: boolean;
  isEventLoading: boolean;
  onWuwei: () => void;
  onShouzh: () => void;
  onHuasheng: () => void;
  onAdvanceStage: () => void;
}

function ActionButton({
  label,
  subLabel,
  desc,
  icon: Icon,
  onClick,
  disabled,
  color,
  glowColor,
  pulse,
}: {
  label: string;
  subLabel: string;
  desc: string;
  icon: React.ElementType;
  onClick: () => void;
  disabled: boolean;
  color: string;
  glowColor: string;
  pulse?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl px-4 py-3 text-left transition-all duration-300 group"
      style={{
        background: disabled
          ? "hsl(240 18% 12% / 0.5)"
          : `linear-gradient(135deg, hsl(240 18% 16% / 0.8), hsl(240 15% 11% / 0.6))`,
        border: `1px solid ${disabled ? "hsl(240 20% 18% / 0.4)" : `${glowColor}55`}`,
        boxShadow: disabled ? "none" : `0 4px 20px ${glowColor}22`,
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        animation: pulse && !disabled ? "pulse-glow 2s ease-in-out infinite" : "none",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: disabled ? "hsl(240 15% 18%)" : `${glowColor}22`,
            border: `1px solid ${disabled ? "hsl(240 15% 22%)" : `${glowColor}44`}`,
          }}
        >
          <Icon size={15} style={{ color: disabled ? "hsl(220 15% 35%)" : color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="font-serif text-sm font-medium"
              style={{ color: disabled ? "hsl(220 15% 35%)" : color }}
            >
              {label}
            </span>
            <span
              className="text-xs"
              style={{ color: disabled ? "hsl(220 15% 28%)" : "hsl(220 15% 50%)", fontFamily: "Inter, sans-serif" }}
            >
              {subLabel}
            </span>
          </div>
          <p
            className="text-xs mt-0.5 truncate"
            style={{ color: "hsl(220 15% 40%)", fontFamily: "Inter, sans-serif" }}
          >
            {desc}
          </p>
        </div>
        {!disabled && (
          <ChevronRight
            size={14}
            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color }}
          />
        )}
      </div>
    </button>
  );
}

export function ActionPanel({
  stage,
  yin,
  yang,
  zhongqi,
  canAdvanceStage,
  isEventLoading,
  onWuwei,
  onShouzh,
  onHuasheng,
  onAdvanceStage,
}: ActionPanelProps) {
  const { t } = useTranslation();
  const [wuweiCooldown, setWuweiCooldown] = useState(false);
  const canShouzh = yin >= 20 && yang >= 20;
  const canHuasheng = zhongqi >= 30 && !isEventLoading;

  function handleWuwei() {
    if (wuweiCooldown) return;
    onWuwei();
    setWuweiCooldown(true);
    setTimeout(() => setWuweiCooldown(false), 3000);
  }

  return (
    <div
      className="glass rounded-2xl p-4 flex flex-col gap-2"
      style={{ border: "1px solid hsl(240 28% 28% / 0.5)" }}
    >
      <p
        className="text-xs text-center tracking-widest uppercase mb-1"
        style={{ color: "hsl(220 15% 48%)", fontFamily: "Inter, sans-serif", letterSpacing: "0.2em" }}
      >
        {t("tao.actions.title")}
      </p>

      <ActionButton
        label={t("tao.actions.wuwei_label")}
        subLabel={t("tao.actions.wuwei_sub")}
        desc={stage === 0 ? t("tao.actions.wuwei_desc_0") : t("tao.actions.wuwei_desc")}
        icon={Sparkles}
        onClick={handleWuwei}
        disabled={wuweiCooldown}
        color="hsl(45 90% 68%)"
        glowColor="hsl(45 90% 68%)"
        pulse={stage === 0}
      />

      <ActionButton
        label={t("tao.actions.shouzh_label")}
        subLabel={t("tao.actions.shouzh_sub")}
        desc={
          canShouzh
            ? t("tao.actions.shouzh_desc_can")
            : t("tao.actions.shouzh_desc_need", { yin: Math.floor(yin), yang: Math.floor(yang) })
        }
        icon={Waves}
        onClick={onShouzh}
        disabled={!canShouzh || stage === 0}
        color="hsl(160 70% 58%)"
        glowColor="hsl(160 70% 58%)"
      />

      <ActionButton
        label={t("tao.actions.huasheng_label")}
        subLabel={t("tao.actions.huasheng_sub")}
        desc={
          canHuasheng
            ? t("tao.actions.huasheng_desc_can")
            : isEventLoading
            ? t("tao.actions.huasheng_desc_loading")
            : t("tao.actions.huasheng_desc_need", { zhongqi: Math.floor(zhongqi) })
        }
        icon={Zap}
        onClick={onHuasheng}
        disabled={!canHuasheng || stage === 0}
        color="hsl(260 80% 72%)"
        glowColor="hsl(260 80% 72%)"
        pulse={canHuasheng && !isEventLoading}
      />

      {/* Stage advance button */}
      {canAdvanceStage && (
        <button
          onClick={onAdvanceStage}
          className="w-full rounded-xl px-4 py-3 mt-1 font-serif text-sm transition-all duration-500"
          style={{
            background: "linear-gradient(135deg, hsl(320 65% 35% / 0.6), hsl(260 70% 30% / 0.4))",
            border: "1px solid hsl(320 65% 55% / 0.5)",
            color: "hsl(320 70% 70%)",
            boxShadow: "0 0 30px hsl(320 65% 55% / 0.2)",
            animation: "pulse-glow 2s ease-in-out infinite",
          }}
        >
          {t("tao.actions.advance")}
        </button>
      )}
    </div>
  );
}
