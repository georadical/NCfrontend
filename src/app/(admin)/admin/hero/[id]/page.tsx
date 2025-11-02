"use client";

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import type { components } from "@/types/api";
import HeroForm from "@/components/admin/hero/HeroForm";

const CMS_BASE_URL = "http://127.0.0.1:8000/cms/hero/";

type Hero = components["schemas"]["Hero"] & { readonly id: number };

export default function HeroEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const heroId = useMemo(() => Number(params?.id), [params?.id]);
  const [hero, setHero] = useState<Hero | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!Number.isFinite(heroId)) {
      setError("Invalid hero ID.");
      setLoading(false);
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("nc_jwt_access") : null;

    axios
      .get<Hero>(`${CMS_BASE_URL}${heroId}/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      .then((response) => {
        setHero(response.data);
      })
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          notFound();
        } else {
          setError("Unable to load hero details.");
        }
      })
      .finally(() => setLoading(false));
  }, [heroId]);

  if (!Number.isFinite(heroId)) {
    return <p className="text-sm text-red-500">Invalid hero identifier.</p>;
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Loading hero details…</p>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-500">{error}</p>
        <button
          type="button"
          onClick={() => router.push("/admin/hero")}
          className="inline-flex items-center rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
        >
          Back to Hero Blocks
        </button>
      </div>
    );
  }

  if (!hero) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/hero"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        ← Back to Hero Blocks
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-gray-900">Edit Hero Block</h1>
        <p className="text-sm text-gray-500">Update the content for this hero section (ID: {params?.id}).</p>
      </header>
      <HeroForm mode="edit" initialData={hero ?? {}} />
    </div>
  );
}
