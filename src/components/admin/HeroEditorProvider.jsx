"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

import { api } from "@/lib/api";

/** @typedef {import("@/types/api").components["schemas"]["Hero"]} Hero */

const HeroEditorContext = createContext(null);

function cloneHero(hero) {
  if (!hero) {
    return null;
  }
  return { ...hero };
}

function getAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("nc_jwt_access");
}

function getRefreshToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("nc_jwt_refresh");
}

function clearStoredTokens() {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem("nc_jwt_access");
  localStorage.removeItem("nc_jwt_refresh");
}

function getAuthHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearStoredTokens();
    return false;
  }

  try {
    const response = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {
      refresh: refreshToken,
    });
    const access = response.data?.access;
    if (typeof access !== "string") {
      throw new Error("Missing access token in refresh response");
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("nc_jwt_access", access);
    }
    return true;
  } catch (error) {
    console.error("Token refresh failed:", error);
    clearStoredTokens();
    return false;
  }
}

async function requestWithAutoRefresh(requestFn) {
  try {
    return await requestFn();
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return requestFn();
      }
    }
    throw error;
  }
}

export default function HeroEditorProvider({ children }) {
  const [hero, setHero] = useState(/** @type {Hero | null} */ (null));
  const [initialHero, setInitialHero] = useState(/** @type {Hero | null} */ (null));
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(/** @type {string | null} */ (null));
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(/** @type {string | null} */ (null));
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const fetchHero = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await requestWithAutoRefresh(() =>
        api.get("/hero/", { headers: getAuthHeaders() }),
      );
      const payload = Array.isArray(response.data) ? response.data[0] ?? null : response.data ?? null;
      setHero(cloneHero(payload));
      setInitialHero(cloneHero(payload));
      setIsReadOnly(false);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearStoredTokens();
        try {
          const fallbackResponse = await api.get("/hero/");
          const payload = Array.isArray(fallbackResponse.data)
            ? fallbackResponse.data[0] ?? null
            : fallbackResponse.data ?? null;
          setHero(cloneHero(payload));
          setInitialHero(cloneHero(payload));
          setIsReadOnly(true);
          setLoadError("You are viewing the hero in read-only mode. Log in again to edit.");
        } catch (fallbackError) {
          console.error("Failed to load hero without authentication:", fallbackError);
          setHero(null);
          setInitialHero(null);
          setIsReadOnly(true);
          setLoadError("Could not load hero data.");
        }
      } else {
        console.error("Failed to load hero:", error);
        setLoadError("Could not load hero data.");
        setHero(null);
        setInitialHero(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHero();
  }, [fetchHero]);

  const resetHero = useCallback(() => {
    setHero(cloneHero(initialHero));
  }, [initialHero]);

  const saveHero = useCallback(async () => {
    if (isReadOnly) {
      setSaveError("Please log in again to make changes.");
      return false;
    }

    if (!hero || !hero.id) {
      setSaveError("Hero record not loaded.");
      return false;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const payload = {
      title: hero.title ?? "",
      subtitle: hero.subtitle ?? "",
      cta_primary_label: hero.cta_primary_label ?? "",
      cta_primary_href: hero.cta_primary_href ?? "",
      cta_secondary_label: hero.cta_secondary_label ?? "",
      cta_secondary_href: hero.cta_secondary_href ?? "",
      bg_type: hero.bg_type ?? "pattern",
      is_active: hero.is_active ?? true,
    };

    try {
      const response = await requestWithAutoRefresh(() =>
        api.patch(`/hero/${hero.id}/`, payload, {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        }),
      );
      const updatedHero = response.data ?? { ...hero, ...payload };
      setHero(cloneHero(updatedHero));
      setInitialHero(cloneHero(updatedHero));
      setSaveSuccess(true);
      window.setTimeout(() => setSaveSuccess(false), 2500);
      return true;
    } catch (error) {
      console.error("Failed to save hero:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          clearStoredTokens();
          setIsReadOnly(true);
          setSaveError("Session expired. Please log in again to continue editing.");
          return false;
        }
        const detail = error.response?.data?.detail;
        const message = typeof detail === "string" ? detail : "Error updating hero.";
        setSaveError(message);
      } else {
        setSaveError("Error updating hero.");
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [hero, isReadOnly]);

  const value = useMemo(
    () => ({
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
      refresh: fetchHero,
      isReadOnly,
    }),
    [
      hero,
      initialHero,
      isLoading,
      loadError,
      isSaving,
      saveError,
      saveSuccess,
      saveHero,
      resetHero,
      fetchHero,
      isReadOnly,
    ],
  );

  return <HeroEditorContext.Provider value={value}>{children}</HeroEditorContext.Provider>;
}

export function useHeroEditor() {
  const context = useContext(HeroEditorContext);
  if (!context) {
    throw new Error("useHeroEditor must be used within a HeroEditorProvider");
  }
  return context;
}
