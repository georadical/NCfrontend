"use client";

import { useMemo } from "react";
import { useHeroEditor } from "@/components/admin/HeroEditorProvider";

export default function HeroPreview() {
  const { hero, isLoading } = useHeroEditor();

  const backgroundStyle = useMemo(() => {
    if (!hero) {
      return {
        backgroundColor: "#1f2933",
      };
    }
    if (hero.bg_type === "image" && hero.bg_media_url) {
      return {
        backgroundImage: `url(${hero.bg_media_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    if (hero.bg_type === "solid") {
      return {
        backgroundColor: "#1f2933",
      };
    }
    return {
      backgroundImage: "linear-gradient(135deg, #111827, #1f2937)",
    };
  }, [hero]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
        <p className="text-sm font-semibold text-gray-700">Live Preview</p>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-200 text-gray-600">
          <button type="button" className="px-2 py-1 rounded-md bg-white text-xs font-semibold shadow-sm">
            Desktop
          </button>
          <button type="button" className="px-2 py-1 rounded-md text-xs font-medium">
            Mobile
          </button>
        </div>
      </div>
      <div className="relative min-h-[360px] p-8 flex flex-col justify-center gap-4" style={backgroundStyle}>
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 flex flex-col gap-4 text-white max-w-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-300">Preview</p>
          <h2 className="text-3xl font-bold tracking-tight drop-shadow-sm">
            {hero?.title ?? "One GIS-Powered Console for Smarter Councils."}
          </h2>
          <p className="text-sm text-gray-100 leading-relaxed drop-shadow-sm">
            {hero?.subtitle ??
              "NexusCouncil centralizes geospatial data, streamlines workflows, and unlocks actionable insights for local governments."}
          </p>
          <div className="flex flex-wrap gap-3">
            {hero?.cta_primary_label ? (
              <button className="h-10 px-5 rounded-md bg-[#00e677] text-gray-900 text-sm font-semibold shadow-sm hover:bg-[#00cc6a]">
                {hero.cta_primary_label}
              </button>
            ) : null}
            {hero?.cta_secondary_label ? (
              <button className="h-10 px-5 rounded-md bg-white/20 border border-white/40 text-white text-sm font-semibold hover:bg-white/30">
                {hero.cta_secondary_label}
              </button>
            ) : null}
          </div>
        </div>
        {isLoading ? <div className="absolute inset-0 bg-black/20 animate-pulse" aria-hidden /> : null}
      </div>
    </div>
  );
}
