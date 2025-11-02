"use client";

import { useMemo } from "react";
import { useHeroEditor } from "@/components/admin/HeroEditorProvider";

/** @typedef {import("@/types/api").components["schemas"]["Hero"]} Hero */

export default function HeroEditorForm() {
  const {
    hero,
    setHero,
    initialHero,
    isLoading,
    loadError,
    isSaving,
    saveError,
    saveSuccess,
    saveHero,
    resetHero,
    isReadOnly,
  } = useHeroEditor();

  const bgOptions = useMemo(
    () => [
      { value: "pattern", label: "Pattern" },
      { value: "image", label: "Background Image" },
      { value: "solid", label: "Solid Color" },
    ],
    [],
  );

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="mt-4 space-y-3">
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-24 w-full bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (loadError && !hero) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-red-500 text-sm shadow-sm">
        {loadError}
      </div>
    );
  }

  if (!hero) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-500 shadow-sm">
        No hero record found.
      </div>
    );
  }

  const updateField = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setHero((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await saveHero();
  };

  const handleCancel = () => {
    if (initialHero) {
      resetHero();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Edit Hero Section</h2>
        <p className="text-sm text-gray-500">Headline, description, CTAs, and background settings.</p>
      </div>

      {loadError && hero ? <p className="text-sm text-amber-600">{loadError}</p> : null}
      {isReadOnly ? (
        <p className="text-sm text-amber-600">
          Read-only mode — sign in again to enable editing.
        </p>
      ) : null}
      {saveError ? <p className="text-sm text-red-500">{saveError}</p> : null}
      {saveSuccess ? <p className="text-sm text-emerald-600">Hero updated successfully.</p> : null}

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700" htmlFor="hero-title">
          Headline
        </label>
        <input
          id="hero-title"
          value={hero.title ?? ""}
          onChange={updateField("title")}
          className="w-full rounded-md border border-gray-300 bg-gray-50 focus:border-gray-500 focus:ring-gray-400 text-sm px-3 py-2"
          placeholder="One GIS-Powered Console for Smarter Councils."
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700" htmlFor="hero-subtitle">
          Subheadline / Description
        </label>
        <textarea
          id="hero-subtitle"
          value={hero.subtitle ?? ""}
          onChange={updateField("subtitle")}
          className="w-full rounded-md border border-gray-300 bg-gray-50 focus:border-gray-500 focus:ring-gray-400 text-sm px-3 py-2 min-h-[96px]"
          placeholder="Centralize geospatial data, streamline workflows, and unlock actionable insights."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="hero-primary-label">
            Primary Button Text
          </label>
          <input
            id="hero-primary-label"
            value={hero.cta_primary_label ?? ""}
            onChange={updateField("cta_primary_label")}
            className="w-full rounded-md border border-gray-300 bg-gray-50 focus:border-gray-500 focus:ring-gray-400 text-sm px-3 py-2"
            placeholder="Book a Demo"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="hero-primary-href">
            Primary Button URL
          </label>
          <input
            id="hero-primary-href"
            value={hero.cta_primary_href ?? ""}
            onChange={updateField("cta_primary_href")}
            className="w-full rounded-md border border-gray-300 bg-gray-50 focus:border-gray-500 focus:ring-gray-400 text-sm px-3 py-2"
            placeholder="/contact"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="hero-secondary-label">
            Secondary Button Text
          </label>
          <input
            id="hero-secondary-label"
            value={hero.cta_secondary_label ?? ""}
            onChange={updateField("cta_secondary_label")}
            className="w-full rounded-md border border-gray-300 bg-gray-50 focus:border-gray-500 focus:ring-gray-400 text-sm px-3 py-2"
            placeholder="See Live Sandbox"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="hero-secondary-href">
            Secondary Button URL
          </label>
          <input
            id="hero-secondary-href"
            value={hero.cta_secondary_href ?? ""}
            onChange={updateField("cta_secondary_href")}
            className="w-full rounded-md border border-gray-300 bg-gray-50 focus:border-gray-500 focus:ring-gray-400 text-sm px-3 py-2"
            placeholder="/sandbox"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700" htmlFor="hero-bg-type">
          Background Style
        </label>
        <select
          id="hero-bg-type"
          value={hero.bg_type ?? "pattern"}
          onChange={updateField("bg_type")}
          className="w-full rounded-md border border-gray-300 bg-gray-50 focus:border-gray-500 focus:ring-gray-400 text-sm px-3 py-2"
        >
          {bgOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-400">Background image uploads are managed separately in the media library.</p>
      </div>

      <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
        <input
          type="checkbox"
          checked={hero.is_active ?? true}
          onChange={updateField("is_active")}
          className="h-4 w-4 rounded border-gray-300 text-[#00e677] focus:ring-[#00e677]"
        />
        Active hero
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSaving || isReadOnly}
          className="inline-flex items-center justify-center px-4 h-10 rounded-md text-sm font-semibold text-gray-900 bg-[#00e677] hover:bg-[#00cc6a] transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center justify-center px-4 h-10 rounded-md text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
