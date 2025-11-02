"use client";

import Link from "next/link";
import HeroForm from "@/components/admin/hero/HeroForm";

export default function NewHeroPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/hero"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        ← Back to Hero Blocks
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-gray-900">Create Hero Block</h1>
        <p className="text-sm text-gray-500">
          Fill in the fields below to publish a new hero section.
        </p>
      </header>

      <HeroForm mode="create" />
    </div>
  );
}
