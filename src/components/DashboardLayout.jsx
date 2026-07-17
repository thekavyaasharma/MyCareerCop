import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import Opportunities from "./Opportunities";
import SkillUp from "./SkillUp";
import Profile from "./Profile";

export default function DashboardLayout({ user, profile, onLogOut }) {
  return (
    <div className="flex min-h-screen">
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