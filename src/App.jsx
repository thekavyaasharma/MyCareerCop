import { useState } from "react";
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

  return (
    <div className="bg-void min-h-screen">
      <Cursor />
      <Navbar onOpenAuth={setAuthMode} />

      <main>
        <Hero onOpenAuth={setAuthMode} />
        <Welcome />
        <Features />
        <Audience />
        <HowItWorks />
        <WhyChoose />
        <CTA onOpenAuth={setAuthMode} />
      </main>

      <Footer />

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitchMode={setAuthMode}
        />
      )}
    </div>
  );
}
