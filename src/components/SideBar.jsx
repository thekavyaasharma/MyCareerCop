import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  User,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/opportunities", label: "Opportunities", icon: Briefcase },
  { path: "/skillup", label: "SkillUp", icon: GraduationCap },
  { path: "/profile", label: "Profile", icon: User },
];

const STORAGE_KEY = "sidebarCollapsed";

function getInitialCollapsed() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    // localStorage can throw in some privacy modes — fail open (expanded).
    return false;
  }
}

export default function Sidebar({ onLogOut, profile }) {
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Non-fatal — collapse state just won't persist across reloads.
      }
      return next;
    });
  }

  return (
    <aside
      className={`shrink-0 h-full border-r border-line bg-surface flex flex-col transition-[width] duration-200 ease-in-out ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center border-b border-line py-6 ${
          collapsed ? "justify-center px-2" : "justify-between px-6"
        }`}
      >
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="font-display text-lg text-ink truncate">MyCareerCop</h1>
            <p className="text-xs text-ink-dim mt-1 truncate">
              {profile?.fullName || "Welcome"}
            </p>
          </div>
        )}

        <button
          onClick={toggleCollapsed}
          data-cursor-hover
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="shrink-0 text-ink-dim hover:text-ink hover:bg-ink/[0.06] rounded-lg p-1.5 transition-colors"
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      {/* Nav — scrolls internally on its own if it ever grows past the
          viewport, without disturbing the pinned footer below. */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 rounded-lg text-sm transition-colors duration-150 ${
                collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2"
              } ${
                isActive
                  ? "bg-ink/[0.06] text-ink font-medium"
                  : "text-ink-dim hover:bg-ink/[0.04] hover:text-ink"
              }`
            }
          >
            <Icon size={17} strokeWidth={2} className="shrink-0" />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      {/* Footer — pinned to the bottom of the sidebar's own fixed height,
          independent of how much the main content area scrolls. */}
      <div className="px-3 py-4 border-t border-line">
        <button
          onClick={onLogOut}
          data-cursor-hover
          title={collapsed ? "Log out" : undefined}
          className={`w-full flex items-center gap-3 rounded-lg text-sm text-ink-dim hover:bg-ink/[0.04] hover:text-ink transition-colors duration-150 ${
            collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2"
          }`}
        >
          <LogOut size={17} strokeWidth={2} className="shrink-0" />
          {!collapsed && "Log out"}
        </button>
      </div>
    </aside>
  );
}