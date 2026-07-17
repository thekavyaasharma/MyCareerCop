import { NavLink } from "react-router-dom";
import { LayoutDashboard, Briefcase, GraduationCap, User, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/opportunities", label: "Opportunities", icon: Briefcase },
  { path: "/skillup", label: "SkillUp", icon: GraduationCap },
  { path: "/profile", label: "Profile", icon: User },
];

export default function Sidebar({ onLogOut, profile }) {
  return (
    <aside className="w-64 shrink-0 min-h-screen border-r border-line bg-surface flex flex-col">
      <div className="px-6 py-6 border-b border-line">
        <h1 className="font-display text-lg text-ink">MyCareerCop</h1>
        <p className="text-xs text-ink-dim mt-1">
          {profile?.fullName || "Welcome"}
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                isActive
                  ? "bg-ink/[0.06] text-ink font-medium"
                  : "text-ink-dim hover:bg-ink/[0.04] hover:text-ink"
              }`
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-line">
        <button
          onClick={onLogOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink-dim hover:bg-ink/[0.04] hover:text-ink transition-colors duration-150"
        >
          <LogOut size={17} strokeWidth={2} />
          Log out
        </button>
      </div>
    </aside>
  );
}