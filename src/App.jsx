import { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { useUserProfile } from "./hooks/useUserProfile";
import Cursor from "./components/Cursor";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Welcome from "./components/Welcome";
import Features from "./components/Features";
import Audience from "./components/Audience";
import HowItWorks from "./components/HowItWorks";
import WhyChoose from "./components/WhyChoose";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import ProfileSetupModal from "./components/ProfileSetupModal";
import DashboardLayout from "./components/DashboardLayout";

export default function App() {
  const [authMode, setAuthMode] = useState(null); // null | "login" | "signup"
  const { user, loading: authLoading, logOut } = useAuth();
  const { profile, profileLoading } = useUserProfile(user?.uid);

  const stillChecking = authLoading || (user && profileLoading);
  const needsOnboarding = user && !profileLoading && !profile?.profileComplete;
  const isReady = user && !profileLoading && profile?.profileComplete;

  // Avoid flashing the landing page while we're still figuring out
  // who's logged in / whether their profile is complete.
  if (stillChecking) {
    return (
      <div className="bg-void min-h-screen flex items-center justify-center">
        <span className="text-ink-dim text-sm">Loading…</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {isReady ? (
        <div className="bg-void min-h-screen">
          <Cursor />
          <DashboardLayout user={user} profile={profile} onLogOut={logOut} />
        </div>
      ) : (
        <div className="bg-void min-h-screen">
          <Cursor />
          <Navbar onOpenAuth={setAuthMode} user={user} authLoading={authLoading} onLogOut={logOut} />

          <main>
            <Hero onOpenAuth={setAuthMode} user={user} />
            <Welcome />
            <Features />
            <Audience />
            <HowItWorks />
            <WhyChoose />
            <CTA onOpenAuth={setAuthMode} user={user} />
          </main>

          <Footer />

          {authMode && !user && (
            <AuthModal
              mode={authMode}
              onClose={() => setAuthMode(null)}
              onSwitchMode={setAuthMode}
            />
          )}

          {/* Onboarding is now driven purely by profile state, not by
              the login moment — so it reliably shows exactly once,
              right after signup, and never again after that. */}
          {needsOnboarding && <ProfileSetupModal onComplete={() => {}} />}
        </div>
      )}
    </BrowserRouter>
  );
}