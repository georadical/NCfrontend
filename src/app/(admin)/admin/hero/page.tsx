"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios, { AxiosError } from "axios";
import type { components } from "@/types/api";

const CMS_BASE_URL = "http://127.0.0.1:8000/cms/";

/** Hero schema from OpenAPI */
type Hero = components["schemas"]["Hero"];

type HeroRow = Hero & { readonly id: number };

type ApiError = AxiosError<{ detail?: string }>;

type RequestExecutor<T> = () => Promise<T>;

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("nc_jwt_access");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("nc_jwt_refresh");
}

function clearStoredTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("nc_jwt_access");
  localStorage.removeItem("nc_jwt_refresh");
}

async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) {
    clearStoredTokens();
    return false;
  }
  try {
    const response = await axios.post("http://127.0.0.1:8000/api/token/refresh/", { refresh });
    const access = response.data?.access;
    if (typeof access === "string") {
      if (typeof window !== "undefined") {
        localStorage.setItem("nc_jwt_access", access);
      }
      return true;
    }
  } catch (error) {
    console.error("Token refresh failed", error);
  }
  clearStoredTokens();
  return false;
}

async function withAutoRefresh<T>(request: RequestExecutor<T>, fallback?: RequestExecutor<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    const axiosError = error as ApiError;
    if (axiosError?.response?.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return request();
      }
      if (fallback) {
        return fallback();
      }
    }
    throw error;
  }
}

function buildAuthHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export default function HeroManagementPage() {
  const [heroes, setHeroes] = useState<HeroRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isReadOnly, setIsReadOnly] = useState(false);

  const fetchHeroes = useCallback(async () => {
    setLoading(true);
    setError("");
    setIsReadOnly(false);

    try {
      const response = await withAutoRefresh(
        () =>
          axios.get<HeroRow[]>("hero/", {
            baseURL: CMS_BASE_URL,
            headers: buildAuthHeaders(),
          }),
        () => axios.get<HeroRow[]>("hero/", { baseURL: CMS_BASE_URL }),
      );

      const rows = Array.isArray(response.data)
        ? response.data
        : response.data
        ? [response.data as HeroRow]
        : [];

      setHeroes(rows);
      if (!getAccessToken()) {
        setIsReadOnly(true);
      }
    } catch (err) {
      console.error("Failed to load heroes", err);
      setError("Could not load hero records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeroes();
  }, [fetchHeroes]);

const activeHeroId = useMemo(() => heroes.find((hero) => hero.is_active)?.id ?? null, [heroes]);

  const handleActivate = async (id: number) => {
    if (isReadOnly) {
      setError("Read-only mode. Log in to modify hero blocks.");
      return;
    }

    const previous = heroes;
    const updated = heroes.map((hero) => ({
      ...hero,
      is_active: hero.id === id,
    }));
    setHeroes(updated);

    try {
      await withAutoRefresh(
        () =>
          Promise.all(
            updated.map((hero) =>
              axios.patch(
                `hero/${hero.id}/`,
                { is_active: hero.is_active },
                {
                  baseURL: CMS_BASE_URL,
                  headers: {
                    ...buildAuthHeaders(),
                    "Content-Type": "application/json",
                  },
                },
              ),
            ),
          ),
      );
    } catch (err) {
      console.error("Failed to activate hero", err);
      setError("Failed to update active hero.");
      setHeroes(previous);
    }
  };

  const handleDelete = async (id: number) => {
    if (isReadOnly) {
      setError("Read-only mode. Log in to modify hero blocks.");
      return;
    }
    if (typeof window !== "undefined" && !window.confirm("Delete this hero block?")) {
      return;
    }

    const previous = heroes;
    setHeroes((prev) => prev.filter((hero) => hero.id !== id));

    try {
      await withAutoRefresh(() =>
        axios.delete(`hero/${id}/`, {
          baseURL: CMS_BASE_URL,
          headers: buildAuthHeaders(),
        }),
      );
    } catch (err) {
      console.error("Failed to delete hero", err);
      setError("Failed to delete hero.");
      setHeroes(previous);
    }
  };

  const tableBody = useMemo(() => {
    if (!heroes.length) {
      return (
        <tr>
          <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
            No hero blocks found. Create a new hero to get started.
          </td>
        </tr>
      );
    }

    return heroes.map((hero) => (
      <tr key={hero.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
        <td className="px-4 py-3 align-top">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">{hero.title ?? "Untitled hero"}</p>
            {hero.subtitle ? <p className="text-xs text-gray-500 break-words">{hero.subtitle}</p> : null}
          </div>
        </td>
        <td className="px-4 py-3 align-top text-sm text-gray-600">
          <div className="space-y-1">
            <p className="font-medium text-gray-900">{hero.cta_primary_label ?? "—"}</p>
            <p className="text-xs text-gray-500">{hero.cta_primary_href ?? ""}</p>
          </div>
        </td>
        <td className="px-4 py-3 align-top text-sm text-gray-600">
          <div className="space-y-1">
            <p className="font-medium text-gray-900">{hero.cta_secondary_label ?? "—"}</p>
            <p className="text-xs text-gray-500">{hero.cta_secondary_href ?? ""}</p>
          </div>
        </td>
        <td className="px-4 py-3">
          {hero.bg_media_url ? (
            <div
              className="h-14 w-24 overflow-hidden rounded-md border border-gray-200 bg-cover bg-center"
              style={{ backgroundImage: `url(${hero.bg_media_url})` }}
              aria-label={hero.title ?? "Hero background"}
            />
          ) : (
            <span className="text-sm text-gray-400">No image</span>
          )}
        </td>
        <td className="px-4 py-3 text-center">
          <input
            type="radio"
            name="active-hero"
            className="h-4 w-4 text-[#00e677] focus:ring-[#00e677]"
            checked={hero.id === activeHeroId}
            onChange={() => handleActivate(hero.id)}
            disabled={isReadOnly}
            aria-label={`Set ${hero.title ?? "hero"} as active`}
          />
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-3 text-sm">
            <Link
              href={`/admin/hero/${hero.id}`}
              className="text-gray-600 hover:text-gray-900 underline-offset-2 hover:underline"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => handleDelete(hero.id)}
              className="text-red-500 hover:text-red-700"
              disabled={isReadOnly}
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    ));
  }, [heroes, activeHeroId, isReadOnly]);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading hero blocks…</p>;
  }

  if (error && !heroes.length) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Blocks</h1>
          <p className="text-sm text-gray-500">
            Manage hero sections displayed on the public website.
          </p>
          {isReadOnly ? (
            <p className="mt-2 text-xs text-amber-600">
              Viewing in read-only mode. Log in again to create, edit, or delete hero blocks.
            </p>
          ) : null}
          {error && heroes.length ? (
            <p className="mt-2 text-xs text-red-500">{error}</p>
          ) : null}
        </div>
        <Link
          href="/admin/hero/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#00e677] px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-[#00cc6a] disabled:opacity-60"
        >
          <span className="text-lg leading-none">+</span>
          Create New Hero Block
        </Link>
      </header>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Primary Button</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Secondary Button</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Background</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Active</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">{tableBody}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
