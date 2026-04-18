import { useTranslation } from "react-i18next";

interface ResourcePanelProps {
  yin: number;
  yang: number;
  zhongqi: number;
  stage: number;
}

function ResourceBar({
  label,
  labelEn,
  value,
  color,
  glowColor,
  bgColor,
}: {
  label: string;
  labelEn: string;
  value: number;
  color: string;
  glowColor: string;
  bgColor: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-serif text-sm font-medium" style={{ color }}>
            {label}
          </span>
          <span
            className="text-xs"
            style={{ color: "hsl(220 15% 45%)", fontFamily: "Inter, sans-serif", letterSpacing: "0.05em" }}
          >
            {labelEn}
          </span>
        </div>
        <span
          className="text-xs tabular-nums"
          style={{ color, fontFamily: "Inter, sans-serif", fontVariantNumeric: "tabular-nums" }}
        >
          {Math.floor(value)}
        </span>
      </div>
      {/* Track */}
      <div
        className="relative h-2 rounded-full overflow-hidden"
        style={{ background: bgColor }}
      >
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 8px ${glowColor}`,
          }}
        />
        {/* Shimmer */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${color}22 ${value}%, transparent ${value + 2}%)`,
          }}
        />
      </div>
    </div>
  );
}

export function ResourcePanel({ yin, yang, zhongqi, stage }: ResourcePanelProps) {
  const { t } = useTranslation();

  return (
    <div
      className="glass rounded-2xl p-4 flex flex-col gap-3"
      style={{ border: "1px solid hsl(240 28% 28% / 0.5)" }}
    >
      <p
        className="text-xs text-center tracking-widest uppercase mb-1"
        style={{ color: "hsl(220 15% 48%)", fontFamily: "Inter, sans-serif", letterSpacing: "0.2em" }}
      >
        {stage === 0 ? t("tao.resources.title_idle") : t("tao.resources.title_active")}
      </p>

      <ResourceBar
        label="阳"
        labelEn="Yang"
        value={yang}
        color="hsl(45 90% 68%)"
        glowColor="hsl(45 90% 68% / 0.6)"
        bgColor="hsl(45 40% 15% / 0.5)"
      />
      <ResourceBar
        label="阴"
        labelEn="Yin"
        value={yin}
        color="hsl(240 70% 65%)"
        glowColor="hsl(240 70% 65% / 0.6)"
        bgColor="hsl(240 40% 12% / 0.5)"
      />
      <ResourceBar
        label="中气"
        labelEn="Zhong Qi"
        value={zhongqi}
        color="hsl(160 70% 58%)"
        glowColor="hsl(160 70% 58% / 0.6)"
        bgColor="hsl(160 30% 12% / 0.5)"
      />
    </div>
  );
}
