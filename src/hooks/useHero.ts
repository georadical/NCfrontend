import useSWR from "swr";
import { api } from "../lib/api";
import type { components } from "../types/api";

/**
 * Hero hook
 * EN: Fetches Hero section data from the backend using SWR.
 * ES: Obtiene los datos de la sección Hero del backend usando SWR.
 */
type Hero = components["schemas"]["Hero"]; // adjust if schema name differs

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export function useHero() {
  const { data, error, isLoading } = useSWR<Hero[]>("/hero/", fetcher);
  return {
    hero: data?.[0] ?? null,
    isLoading,
    isError: !!error,
  };
}
