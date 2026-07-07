import { useEffect, useState } from "react";
import MagneticButton from "./MagneticButton";

export default function Navbar({ onOpenAuth, user, authLoading, onLogOut }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-colors ${scrolled ? "nav-scrolled" : ""}`}>
      <div className="max-w-[1200px] mx-auto flex items-center justify-between px-6 py-4">
        <a href="#top" data-cursor-hover className="font-display text-xl text-ink">
          myCareerCop
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm text-ink-dim">
          <a href="#features" data-cursor-hover className="hover:text-ink transition-colors">
            Features
          </a>
          <a href="#how-it-works" data-cursor-hover className="hover:text-ink transition-colors">
            How It Works
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {authLoading ? null : user ? (
            <>
              <span className="hidden sm:inline text-sm text-ink-dim">
                {user.displayName || user.email}
              </span>
              <button
                data-cursor-hover
                onClick={onLogOut}
                className="btn-ghost text-sm"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <button
                data-cursor-hover
                onClick={() => onOpenAuth("login")}
                className="hidden sm:inline-flex btn-ghost text-sm"
              >
                Log In
              </button>
              <MagneticButton
                onClick={() => onOpenAuth("signup")}
                className="btn-primary text-sm"
              >
                Get Started
              </MagneticButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
