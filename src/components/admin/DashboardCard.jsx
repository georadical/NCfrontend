import React from "react";

export default function DashboardCard({
  title,
  count,
  updated,
  isLoading = false,
  isError = false,
}) {
  const resolvedCount =
    typeof count === "number" || typeof count === "string" ? count : "—";
  const recordLabel =
    typeof resolvedCount === "number"
      ? `${resolvedCount} Record${resolvedCount === 1 ? "" : "s"}`
      : resolvedCount;

  let metaLabel = updated;
  if (isError) {
    metaLabel = "Unable to load data.";
  } else if (isLoading) {
    metaLabel = "Loading latest activity...";
  } else if (updated) {
    metaLabel = `Last updated: ${updated}`;
  }

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
      aria-busy={isLoading}
    >
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <p className="text-2xl font-semibold text-gray-900">
        {isLoading ? (
          <span className="inline-flex h-6 w-24 animate-pulse rounded bg-gray-200" aria-hidden />
        ) : (
          recordLabel
        )}
      </p>
      <p className="text-xs text-gray-400 mt-1">{metaLabel}</p>
    </div>
  );
}
