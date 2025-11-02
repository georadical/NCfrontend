import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Site Settings", href: "/admin/site-settings" },
  { label: "Hero Blocks", href: "/admin/hero" },
  { label: "Navigation", href: "/admin/navigation" },
  { label: "Footer", href: "/admin/footer" },
  { label: "Pricing", href: "/admin/pricing" },
  { label: "Testimonials", href: "/admin/testimonials" },
  { label: "FAQ", href: "/admin/faq" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex text-gray-900">
      <aside className="hidden lg:flex w-64 flex-col border-r border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-900 text-white">NC</div>
          <span className="text-lg font-semibold tracking-tight">NexusCouncil</span>
        </div>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-900/5 hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <h1 className="text-base font-semibold">Admin Console</h1>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>admin@nexuscouncil.gov</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
