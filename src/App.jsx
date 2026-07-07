import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
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

export default function App() {
  const [authMode, setAuthMode] = useState(null); // null | "login" | "signup"
  const { user, loading, logOut } = useAuth();

  return (
    <div className="bg-void min-h-screen">
      <Cursor />
      <Navbar onOpenAuth={setAuthMode} user={user} authLoading={loading} onLogOut={logOut} />

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
    </div>
  );
}
