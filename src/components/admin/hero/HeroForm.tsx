"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { components } from "@/types/api";

// Hero schema from OpenAPI (includes read-only id/bg_media_url fields).
type Hero = components["schemas"]["Hero"] & { readonly id?: number };

type HeroFormProps = {
  mode?: "create" | "edit";
  initialData?: Partial<Hero>;
};

const CMS_ENDPOINT = "http://127.0.0.1:8000/cms/hero/";

function toNullable(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export default function HeroForm({ mode = "create", initialData = {} }: HeroFormProps) {
  const router = useRouter();
  const heroId = initialData.id;

  const [title, setTitle] = useState(initialData.title ?? "");
  const [subtitle, setSubtitle] = useState(initialData.subtitle ?? "");
  const [primaryCtaText, setPrimaryCtaText] = useState(initialData.cta_primary_label ?? "");
  const [primaryCtaUrl, setPrimaryCtaUrl] = useState(initialData.cta_primary_href ?? "");
  const [secondaryCtaText, setSecondaryCtaText] = useState(initialData.cta_secondary_label ?? "");
  const [secondaryCtaUrl, setSecondaryCtaUrl] = useState(initialData.cta_secondary_href ?? "");
  const [bgType, setBgType] = useState<Hero["bg_type"]>(initialData.bg_type ?? "pattern");
  const [backgroundUrl, setBackgroundUrl] = useState(initialData.bg_media_url ?? "");
  const [isActive, setIsActive] = useState(Boolean(initialData.is_active));
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "edit" && typeof heroId !== "number") {
      setErrorMsg("Missing hero identifier.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const token = typeof window !== "undefined" ? localStorage.getItem("nc_jwt_access") : null;

    const payload: Record<string, unknown> = {
      title,
      subtitle: toNullable(subtitle),
      cta_primary_label: toNullable(primaryCtaText),
      cta_primary_href: toNullable(primaryCtaUrl),
      cta_secondary_label: toNullable(secondaryCtaText),
      cta_secondary_href: toNullable(secondaryCtaUrl),
      bg_type: bgType ?? "pattern",
      is_active: isActive,
    };

    const endpoint = mode === "edit" ? `${CMS_ENDPOINT}${heroId}/` : CMS_ENDPOINT;
    const method = mode === "edit" ? "PATCH" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const detail =
          data?.detail ||
          data?.non_field_errors?.[0] ||
          Object.values(data ?? {})?.[0]?.[0] ||
          "Could not save hero block. Please review the fields.";
        setErrorMsg(String(detail));
        return;
      }

      router.push("/admin/hero");
      router.refresh();
    } catch (error) {
      console.error("Failed to submit hero form", error);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      {errorMsg ? <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{errorMsg}</div> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="hero-title">
            Title *
          </label>
          <input
            id="hero-title"
            type="text"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e677]"
            placeholder="Smarter cities, better services"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="hero-subtitle">
            Subtitle
          </label>
          <input
            id="hero-subtitle"
            type="text"
            value={subtitle}
            onChange={(event) => setSubtitle(event.target.value)}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e677]"
            placeholder="NexusCouncil centralizes geospatial data for smarter decisions"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="hero-primary-text">
            Primary CTA Text
          </label>
          <input
            id="hero-primary-text"
            type="text"
            value={primaryCtaText}
            onChange={(event) => setPrimaryCtaText(event.target.value)}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e677]"
            placeholder="Book a demo"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="hero-primary-url">
            Primary CTA URL
          </label>
          <input
            id="hero-primary-url"
            type="url"
            value={primaryCtaUrl}
            onChange={(event) => setPrimaryCtaUrl(event.target.value)}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e677]"
            placeholder="/contact"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="hero-secondary-text">
            Secondary CTA Text
          </label>
          <input
            id="hero-secondary-text"
            type="text"
            value={secondaryCtaText}
            onChange={(event) => setSecondaryCtaText(event.target.value)}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e677]"
            placeholder="See sandbox"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="hero-secondary-url">
            Secondary CTA URL
          </label>
          <input
            id="hero-secondary-url"
            type="url"
            value={secondaryCtaUrl}
            onChange={(event) => setSecondaryCtaUrl(event.target.value)}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e677]"
            placeholder="/sandbox"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="hero-bg-type">
            Background style
          </label>
          <select
            id="hero-bg-type"
            value={bgType ?? "pattern"}
            onChange={(event) => setBgType(event.target.value as Hero["bg_type"])}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e677]"
          >
            <option value="pattern">Pattern</option>
            <option value="image">Image</option>
            <option value="solid">Solid color</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="hero-background-url">
            Background image URL (optional)
          </label>
          <input
            id="hero-background-url"
            type="url"
            value={backgroundUrl}
            onChange={(event) => setBackgroundUrl(event.target.value)}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e677]"
            placeholder="https://cdn.nexus.com/hero-city.jpg"
          />
          <p className="mt-1 text-xs text-gray-500">
            File uploads are not yet supported from the dashboard. Provide a reference URL for tracking purposes.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          id="hero-is-active"
          type="checkbox"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-[#00e677] focus:ring-[#00e677]"
        />
        <label htmlFor="hero-is-active" className="text-sm text-gray-700">
          Set as active hero (deactivates any other active hero)
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center rounded-md bg-[#00e677] px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-[#00cc6a] disabled:opacity-70"
        >
          {loading ? "Saving…" : mode === "create" ? "Create Hero" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/hero")}
          className="inline-flex items-center rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}


