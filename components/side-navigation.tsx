"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const visibleItems = navigationItems.filter((item) => permissions[item.permission]);

  return (
    <>
      <button className="mobile-menu-button" type="button" onClick={() => setDrawerOpen(true)}>
        Menu
      </button>
      {drawerOpen && <button className="sidebar-scrim" type="button" aria-label="Close menu" onClick={() => setDrawerOpen(false)} />}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${drawerOpen ? "drawer-open" : ""}`}>
        <div className="sidebar-header">
          <div>
            <p className="eyebrow">East Asian Traders</p>
            <strong>Delivery System</strong>
          </div>
          <button className="collapse-button" type="button" onClick={toggleCollapsed} aria-label="Toggle sidebar">
            {collapsed ? ">" : "<"}
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
