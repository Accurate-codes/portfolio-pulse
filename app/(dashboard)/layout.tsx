"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  {
    href: "/select-track",
    label: "Dashboard",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/history",
    label: "History",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const [isDesktop, setIsDesktop] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleViewportChange = () => {
      const desktop = mediaQuery.matches;
      setIsDesktop(desktop);

      if (desktop) {
        setIsMobileOpen(false);
        setIsDesktopCollapsed(true);
      }
    };

    handleViewportChange();
    mediaQuery.addEventListener("change", handleViewportChange);

    return () => mediaQuery.removeEventListener("change", handleViewportChange);
  }, []);

  const closeMobileSidebar = () => setIsMobileOpen(false);

  const handleNavClick = () => {
    setIsDesktopCollapsed(true);
    closeMobileSidebar();
  };

  const sidebarContent = (
    <>
      <Link
        href="/"
        className={`flex h-20 items-center border-b border-white/10 ${
          isDesktop && isDesktopCollapsed ? "justify-center px-0" : "gap-2 px-6"
        }`}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 p-1.5">
          <svg viewBox="0 0 32 32" fill="none" className="h-full w-full stroke-coral stroke-[2.5]">
            <path d="M4 16h6l3-8 5 16 4-11 3 5 4-2h3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {!(isDesktop && isDesktopCollapsed) && (
          <span className="font-display text-lg font-bold tracking-tight">
            Portfolio<span className="text-coral">Pulse</span>
          </span>
        )}
      </Link>

      <nav className="flex-1 space-y-1 px-3 py-6">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const isCollapsedDesktopItem = isDesktop && isDesktopCollapsed;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              title={isCollapsedDesktopItem ? item.label : undefined}
              aria-label={item.label}
              className={`flex items-center rounded-lg text-sm font-medium transition-all duration-300 ${
                isCollapsedDesktopItem ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5"
              } ${
                isActive
                  ? "bg-coral text-white"
                  : "text-zinc-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">{item.icon}</span>
              {!isCollapsedDesktopItem && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div
        className={`flex items-center border-t border-white/10 px-4 py-4 ${
          isDesktop && isDesktopCollapsed ? "justify-center" : "gap-3"
        }`}
      >
        <UserButton />
        {!(isDesktop && isDesktopCollapsed) && user && (
          <span className="truncate text-sm font-medium text-zinc-200">
            {user.fullName || user.primaryEmailAddress?.emailAddress}
          </span>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-canvas">
      {!isDesktop && (
        <>
          <button
            type="button"
            onClick={() => setIsMobileOpen((open) => !open)}
            className="fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-white shadow-lg transition-transform duration-200 hover:scale-105 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {isMobileOpen && (
            <button
              type="button"
              onClick={closeMobileSidebar}
              aria-label="Close navigation menu"
              className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
            />
          )}
        </>
      )}

      {isDesktop ? (
        <div className="flex min-h-screen">
          <aside
            onMouseEnter={() => setIsDesktopCollapsed(false)}
            onMouseLeave={() => setIsDesktopCollapsed(true)}
            className={`flex shrink-0 flex-col overflow-hidden bg-ink text-white transition-all duration-300 ease-out ${
              isDesktopCollapsed ? "w-20" : "w-64"
            }`}
          >
            {sidebarContent}
          </aside>

          <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
        </div>
      ) : (
        <div className="flex min-h-screen">
          <aside
            className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col overflow-hidden bg-ink text-white shadow-2xl transition-transform duration-300 ease-out ${
              isMobileOpen ? "translate-x-0" : "-translate-x-full"
            } lg:static lg:w-64 lg:translate-x-0`}
          >
            {sidebarContent}
          </aside>

          <main className="min-w-0 flex-1 overflow-x-hidden pt-16 md:pt-0">{children}</main>
        </div>
      )}
    </div>
  );
}