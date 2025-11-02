"use client";

import { useMemo } from "react";
import useSWR from "swr";

import DashboardCard from "@/components/admin/DashboardCard";
import ActionCard from "@/components/admin/ActionCard";
import { api } from "../../../lib/api";

type ActionCardConfig = {
  title: string;
  description: string;
  button: string;
  primary?: boolean;
};

type CmsCollectionResult = {
  count: number | null;
  updated: string | null;
  isLoading: boolean;
  isError: boolean;
};

const quickActions: ActionCardConfig[] = [
  {
    title: "Create New Content",
    description: "Add a new page, post, or record.",
    button: "Create New",
    primary: true,
  },
  {
    title: "Edit Existing Content",
    description: "Find and modify existing records.",
    button: "Edit Content",
  },
  {
    title: "View Live Site",
    description: "Open the public-facing website.",
    button: "View Site",
  },
];

const fetcher = (endpoint: string) => api.get(endpoint).then((res) => res.data);

export default function AdminDashboardPage() {
  const siteSettings = useCmsCollection("site-settings/");
  const heroBlocks = useCmsCollection("hero/");
  const navigationItems = useCmsCollection("navigation-menu/");
  const footerLinks = useCmsCollection("footer-links/");
  const pricingPlans = useCmsCollection("pricing-plans/");
  const testimonials = useCmsCollection("testimonials/");
  const faqItems = useCmsCollection("faq-items/");

  const stats = [
    {
      title: "Site Settings",
      fallbackCount: 1,
      fallbackUpdated: "2 days ago",
      data: siteSettings,
    },
    {
      title: "Hero Blocks",
      fallbackCount: 1,
      fallbackUpdated: "5 hours ago",
      data: heroBlocks,
    },
    {
      title: "Navigation Items",
      fallbackCount: 4,
      fallbackUpdated: "1 week ago",
      data: navigationItems,
    },
    {
      title: "Footer Links",
      fallbackCount: 5,
      fallbackUpdated: "1 week ago",
      data: footerLinks,
    },
    {
      title: "Pricing Plans",
      fallbackCount: 3,
      fallbackUpdated: "1 month ago",
      data: pricingPlans,
    },
    {
      title: "Testimonials",
      fallbackCount: 8,
      fallbackUpdated: "4 days ago",
      data: testimonials,
    },
    {
      title: "FAQ Entries",
      fallbackCount: 12,
      fallbackUpdated: "3 weeks ago",
      data: faqItems,
    },
  ];

  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500">Content overview and quick actions.</p>
      </header>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Content Overview</h2>
          <p className="text-sm text-gray-500">High-level metrics for each CMS module.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stats.map((stat) => {
            const { isLoading, isError, count, updated } = stat.data;
            const resolvedCount =
              count != null && !Number.isNaN(count) ? count : stat.fallbackCount;
            const resolvedUpdated = updated && !isError ? updated : stat.fallbackUpdated;

            return (
              <DashboardCard
                key={stat.title}
                title={stat.title}
                count={resolvedCount}
                updated={resolvedUpdated}
                isLoading={isLoading}
                isError={isError}
              />
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <ActionCard key={action.title} {...action} />
          ))}
        </div>
      </section>
    </div>
  );
}

function useCmsCollection(endpoint: string): CmsCollectionResult {
  const { data, error, isLoading } = useSWR(endpoint, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30_000,
  });

  const meta = useMemo(() => deriveCollectionMeta(data), [data]);

  return {
    ...meta,
    isLoading,
    isError: Boolean(error),
  };
}

function deriveCollectionMeta(data: unknown): Pick<CmsCollectionResult, "count" | "updated"> {
  if (data == null) {
    return { count: null, updated: null };
  }

  if (Array.isArray(data)) {
    return { count: data.length, updated: extractUpdatedLabel(data) };
  }

  if (isPlainRecord(data)) {
    if (Array.isArray(data.results)) {
      const results = data.results as unknown[];
      const count =
        typeof data.count === "number" ? data.count : typeof data.total === "number" ? data.total : results.length;
      return { count, updated: extractUpdatedLabel(results) };
    }

    if (typeof data.count === "number") {
      return { count: data.count, updated: null };
    }

    return { count: 1, updated: extractUpdatedLabel([data]) };
  }

  return { count: null, updated: null };
}

function extractUpdatedLabel(items: unknown[]): string | null {
  const timestamps = items
    .filter(isPlainRecord)
    .map((record) => extractTimestamp(record))
    .filter((value): value is string => Boolean(value))
    .map((value) => {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date.getTime();
    })
    .filter((value): value is number => value !== null);

  if (!timestamps.length) {
    return null;
  }

  const latest = Math.max(...timestamps);
  return formatRelativeTime(new Date(latest));
}

const TIMESTAMP_KEYS = [
  "updated_at",
  "modified_at",
  "updated",
  "modified",
  "last_updated",
  "last_modified",
  "published_at",
  "created_at",
] as const;

type TimestampKey = (typeof TIMESTAMP_KEYS)[number];

function extractTimestamp(record: Record<string, unknown>): string | null {
  for (const key of TIMESTAMP_KEYS) {
    const value = record[key as TimestampKey];
    if (typeof value === "string") {
      return value;
    }
  }
  return null;
}

const RELATIVE_FORMATTER = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const RELATIVE_DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

function formatRelativeTime(date: Date): string {
  const diff = date.getTime() - Date.now();

  if (Math.abs(diff) < 45 * 1000) {
    return "just now";
  }

  let duration = diff / 1000;
  for (const division of RELATIVE_DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return RELATIVE_FORMATTER.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
