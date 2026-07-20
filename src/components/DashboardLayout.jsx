import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import Opportunities from "./Opportunities";
import SkillUp from "./SkillUp";
import Profile from "./Profile";

export default function DashboardLayout({ user, profile, onLogOut }) {
  return (
    // h-screen (not min-h-screen) gives this row a fixed, bounded height.
    // Without that bound, <main>'s overflow-y-auto has nothing to scroll
    // *within* — the whole page scrolls instead, dragging the sidebar
    // (and its logout button) down with it.
    <div className="flex h-screen overflow-hidden">
      <Sidebar onLogOut={onLogOut} profile={profile} />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/dashboard" element={<Dashboard user={user} profile={profile} />} />
          <Route path="/opportunities" element={<Opportunities user={user} profile={profile} />} />
          <Route path="/skillup" element={<SkillUp user={user} profile={profile} />} />
          <Route path="/profile" element={<Profile user={user} profile={profile} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}