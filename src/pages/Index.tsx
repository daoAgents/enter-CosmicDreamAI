import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { StarfieldCanvas } from "@/components/StarfieldCanvas";
import { FloatingCrystals } from "@/components/FloatingCrystals";
import { NebulaBackground } from "@/components/NebulaBackground";
import { DreamInput } from "@/components/DreamInput";
import { DreamPortal } from "@/components/DreamPortal";
import { DreamInterpretation } from "@/components/DreamInterpretation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useDreamAnalysis } from "@/hooks/useDreamAnalysis";
import { useDreamImage } from "@/hooks/useDreamImage";

const Index = () => {
  const { t } = useTranslation();

  const {
    interpretation,
    isLoading: isAnalyzing,
    error: analysisError,
    isComplete: analysisComplete,
    analyzeDream,
    reset: resetAnalysis,
  } = useDreamAnalysis();

  const {
    imageUrl,
    isLoading: isGeneratingImage,
    error: imageError,
    generateImage,
    reset: resetImage,
  } = useDreamImage();

  const resultsRef = useRef<HTMLDivElement>(null);
  const hasResults = interpretation || imageUrl || isAnalyzing || isGeneratingImage;

  const handleVisualize = useCallback(
    async (dream: string) => {
      resetAnalysis();
      resetImage();

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);

      await Promise.all([analyzeDream(dream), generateImage(dream)]);
    },
    [analyzeDream, generateImage, resetAnalysis, resetImage]
  );

  const isLoading = isAnalyzing || isGeneratingImage;

  return (
    <div className="min-h-full relative overflow-x-hidden">
      {/* Background layers */}
      <NebulaBackground />
      <StarfieldCanvas />
      <FloatingCrystals />

      {/* Language switcher — fixed top right */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      {/* Content */}
      <div className="relative flex flex-col min-h-full" style={{ zIndex: 10 }}>
        {/* Hero section */}
        <div className="flex flex-col items-center justify-center px-6 pt-16 pb-12 md:pt-24 md:pb-16">
          {/* Title */}
          <div className="text-center mb-12 animate-fade-in-up">
            {/* Eyebrow */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div
                className="h-px w-12"
                style={{ background: "linear-gradient(90deg, transparent, hsl(260 80% 70% / 0.5))" }}
              />
              <span className="text-xs tracking-widest uppercase" style={{
                color: "hsl(260, 70%, 60%)",
                fontFamily: "Inter, sans-serif",
                fontWeight: 300,
                letterSpacing: "0.25em",
              }}>
                {t("hero.eyebrow")}
              </span>
              <div
                className="h-px w-12"
                style={{ background: "linear-gradient(90deg, hsl(260 80% 70% / 0.5), transparent)" }}
              />
            </div>

            {/* Main title */}
            <h1
              className="font-serif mb-5"
              style={{
                fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
                fontWeight: 300,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              <span className="text-gradient-dream">{t("hero.titleLine1")}</span>
              <br />
              <span
                className="italic"
                style={{
                  color: "hsl(220, 20%, 88%)",
                  textShadow: "0 0 60px hsl(260 80% 70% / 0.15)",
                }}
              >
                {t("hero.titleLine2")}
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="font-serif italic"
              style={{
                fontSize: "1.15rem",
                lineHeight: 1.7,
                color: "hsl(220, 20%, 55%)",
                maxWidth: "480px",
                margin: "0 auto",
              }}
            >
              {t("hero.subtitle")}
            </p>
          </div>

          {/* Input */}
          <div
            className="w-full animate-fade-in-up"
            style={{ maxWidth: "680px", animationDelay: "0.2s", animationFillMode: "both" }}
          >
            <DreamInput onVisualize={handleVisualize} isLoading={isLoading} />
          </div>
        </div>

        {/* Divider */}
        {hasResults && (
          <div className="flex items-center gap-4 px-6 mb-8 max-w-6xl mx-auto w-full">
            <div
              className="h-px flex-1"
              style={{ background: "linear-gradient(90deg, transparent, hsl(260 60% 30% / 0.4), transparent)" }}
            />
            <span className="text-xs tracking-widest uppercase" style={{
              color: "hsl(260, 40%, 45%)",
              fontFamily: "Inter, sans-serif",
              fontWeight: 300,
              letterSpacing: "0.2em",
              whiteSpace: "nowrap",
            }}>
              {t("hero.divider")}
            </span>
            <div
              className="h-px flex-1"
              style={{ background: "linear-gradient(90deg, transparent, hsl(260 60% 30% / 0.4), transparent)" }}
            />
          </div>
        )}

        {/* Results section */}
        {hasResults && (
          <div ref={resultsRef} className="flex-1 w-full max-w-6xl mx-auto px-6 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
              {/* Portal — 2/5 columns */}
              <div
                className="lg:col-span-2 animate-fade-in-up"
                style={{ animationDelay: "0.1s", animationFillMode: "both" }}
              >
                <DreamPortal
                  imageUrl={imageUrl}
                  isLoading={isGeneratingImage}
                  error={imageError}
                />
              </div>

              {/* Interpretation — 3/5 columns */}
              <div
                className="lg:col-span-3 animate-fade-in-up"
                style={{
                  animationDelay: "0.2s",
                  animationFillMode: "both",
                  minHeight: "500px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <DreamInterpretation
                  interpretation={interpretation}
                  isLoading={isAnalyzing}
                  error={analysisError}
                  isComplete={analysisComplete}
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pb-8 pt-4 flex items-center justify-center">
          <p className="text-xs" style={{
            color: "hsl(220, 15%, 28%)",
            fontFamily: "Inter, sans-serif",
            fontWeight: 300,
            letterSpacing: "0.05em",
          }}>
            {t("common.poweredBy")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
