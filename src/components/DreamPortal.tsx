import { Loader2, Download } from "lucide-react";

interface DreamPortalProps {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

export function DreamPortal({ imageUrl, isLoading, error }: DreamPortalProps) {
  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `dream-vision-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Download failed silently
    }
  };

  return (
    <div className="w-full">
      {/* Portal frame */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          aspectRatio: "1 / 1",
          background: "linear-gradient(135deg, hsl(240 20% 8% / 0.9), hsl(240 25% 5% / 0.8))",
          border: "1px solid hsl(260 30% 20% / 0.6)",
          boxShadow: imageUrl
            ? "0 0 60px hsl(260 80% 70% / 0.25), 0 0 120px hsl(200 90% 65% / 0.1), inset 0 1px 0 hsl(260 60% 75% / 0.1)"
            : "0 8px 32px hsl(240 25% 4% / 0.6), inset 0 1px 0 hsl(240 30% 20% / 0.1)",
        }}
      >
        {/* Inner portal ring */}
        <div
          className="absolute inset-3 rounded-xl pointer-events-none"
          style={{
            border: "1px solid hsl(260 60% 50% / 0.1)",
            boxShadow: "inset 0 0 40px hsl(260 80% 70% / 0.05)",
          }}
        />

        {/* Loading state */}
        {isLoading && !imageUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            {/* Animated portal ring */}
            <div className="relative flex items-center justify-center">
              <div
                className="absolute rounded-full"
                style={{
                  width: 100, height: 100,
                  border: "1px solid hsl(260 80% 70% / 0.3)",
                  animation: "pulse-glow 2s ease-in-out infinite",
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  width: 70, height: 70,
                  border: "1px solid hsl(200 90% 65% / 0.2)",
                  animation: "pulse-glow 2s ease-in-out infinite 0.7s",
                }}
              />
              <Loader2
                className="animate-spin"
                style={{ width: 28, height: 28, color: "hsl(260, 80%, 70%)" }}
              />
            </div>
            <div className="text-center">
              <p className="font-serif italic text-sm" style={{ color: "hsl(260, 60%, 70%)" }}>
                Opening the portal...
              </p>
              <p className="text-xs mt-1" style={{
                color: "hsl(220, 15%, 40%)",
                fontFamily: "Inter, sans-serif",
                fontWeight: 300,
              }}>
                Manifesting your dreamscape
              </p>
            </div>
          </div>
        )}

        {/* Idle state */}
        {!isLoading && !imageUrl && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            {/* Portal icon rings */}
            <div className="relative">
              {[80, 56, 32].map((size, i) => (
                <div
                  key={size}
                  className="absolute rounded-full"
                  style={{
                    width: size, height: size,
                    top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    border: `1px solid hsl(260 60% 50% / ${0.15 - i * 0.04})`,
                    animation: `pulse-glow ${3 + i}s ease-in-out infinite ${i * 0.8}s`,
                  }}
                />
              ))}
              <div
                className="w-8 h-8 rounded-full"
                style={{
                  background: "radial-gradient(circle, hsl(260 80% 70% / 0.15), transparent)",
                  border: "1px solid hsl(260 60% 60% / 0.2)",
                }}
              />
            </div>
            <p className="font-serif italic text-sm text-center px-6" style={{ color: "hsl(220, 20%, 50%)" }}>
              Your dream portal<br />
              <span style={{ fontSize: "0.75rem", color: "hsl(220, 15%, 38%)" }}>
                awaits visualization
              </span>
            </p>
          </div>
        )}

        {/* Error state */}
        {error && !imageUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "hsl(320 60% 30% / 0.2)", border: "1px solid hsl(320 60% 50% / 0.3)" }}
            >
              <span style={{ color: "hsl(320, 60%, 70%)", fontSize: "1.2rem" }}>~</span>
            </div>
            <p className="font-serif italic text-xs text-center" style={{ color: "hsl(320, 50%, 65%)" }}>
              {error}
            </p>
          </div>
        )}

        {/* Generated image */}
        {imageUrl && (
          <>
            <img
              src={imageUrl}
              alt="Dream visualization"
              className="absolute inset-0 w-full h-full object-cover animate-portal-reveal"
              style={{ borderRadius: "inherit" }}
            />

            {/* Overlay gradient at bottom */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(to top, hsl(240 25% 4% / 0.5) 0%, transparent 40%)",
                borderRadius: "inherit",
              }}
            />

            {/* Download button */}
            <button
              onClick={handleDownload}
              className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg opacity-0 hover:opacity-100 transition-all duration-300 group"
              style={{
                background: "hsl(240 25% 4% / 0.8)",
                backdropFilter: "blur(8px)",
                border: "1px solid hsl(260 30% 30% / 0.5)",
                color: "hsl(220, 20%, 80%)",
                fontSize: "0.7rem",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <Download className="w-3 h-3" />
              Save Vision
            </button>
          </>
        )}

        {/* Corner ornaments */}
        {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos, i) => (
          <div
            key={i}
            className={`absolute ${pos} w-4 h-4 pointer-events-none`}
            style={{
              borderTop: i < 2 ? "1px solid hsl(260 60% 50% / 0.2)" : undefined,
              borderBottom: i >= 2 ? "1px solid hsl(260 60% 50% / 0.2)" : undefined,
              borderLeft: i % 2 === 0 ? "1px solid hsl(260 60% 50% / 0.2)" : undefined,
              borderRight: i % 2 === 1 ? "1px solid hsl(260 60% 50% / 0.2)" : undefined,
            }}
          />
        ))}
      </div>

      {/* Portal label */}
      <p className="text-center mt-3 text-xs tracking-widest uppercase" style={{
        color: "hsl(260, 40%, 45%)",
        fontFamily: "Inter, sans-serif",
        fontWeight: 300,
        letterSpacing: "0.2em",
      }}>
        Dream Portal
      </p>
    </div>
  );
}
