"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RolePermissions } from "@/lib/auth/roles";
import { navigationItems } from "@/lib/navigation";

type SideNavigationProps = {
  email?: string;
  name?: string;
  role: string;
  permissions: RolePermissions;
};

export default function SideNavigation({ email, name, role, permissions }: SideNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem("eatsb-sidebar-collapsed") === "true");
  }, []);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("eatsb-sidebar-collapsed", String(next));
      return next;
    });
  }

  function closeDrawer() {
    setDrawerOpen(false);
    window.setTimeout(() => hamburgerRef.current?.focus(), 0);
  }

  function handleDrawerKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDrawer();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = Array.from(
      drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    );

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  useEffect(() => {
    if (!drawerOpen) return;

    const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    firstFocusable?.focus();
  }, [drawerOpen]);

  async function signOut() {
    await supabase.auth.signOut();
    setDrawerOpen(false);
    router.replace("/login");
    router.refresh();
  }

  const visibleItems = navigationItems.filter((item) => permissions[item.permission]);

  return (
    <>
      <button
        ref={hamburgerRef}
        className="mobile-menu-button"
        type="button"
        aria-label="Open navigation"
        aria-controls="app-navigation-drawer"
        aria-expanded={drawerOpen}
        onClick={() => setDrawerOpen(true)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      {drawerOpen && <button className="sidebar-scrim" type="button" aria-label="Close navigation" onClick={closeDrawer} />}
      <aside
        ref={drawerRef}
        id="app-navigation-drawer"
        className={`sidebar ${collapsed ? "collapsed" : ""} ${drawerOpen ? "drawer-open" : ""}`}
        aria-label="Application navigation"
        aria-modal={drawerOpen}
        role={drawerOpen ? "dialog" : undefined}
        onKeyDown={handleDrawerKeyDown}
      >
        <div className="sidebar-header">
          <div>
            <p className="eyebrow">East Asian Traders</p>
            <strong>Delivery System</strong>
          </div>
          <button className="collapse-button" type="button" onClick={toggleCollapsed} aria-label="Toggle sidebar">
            {collapsed ? ">" : "<"}
          </button>
          <button className="drawer-close-button" type="button" onClick={closeDrawer} aria-label="Close navigation">
            Close
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {visibleItems.map((item) => (
            <Link
              key={item.path}
              className={pathname === item.path ? "active" : ""}
              href={item.path}
              onClick={() => setDrawerOpen(false)}
              title={item.label}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-block">
            <strong>{name || email || "Signed in"}</strong>
            {name && email && <span>{email}</span>}
            <span>{role}</span>
          </div>
          <button type="button" onClick={signOut}>Sign out</button>
        </div>
      </aside>
    </>
  );
}
