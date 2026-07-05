import { useEffect, useState } from "react";
import MagneticButton from "./MagneticButton";

export default function AuthModal({ mode, onClose, onSwitchMode }) {
  const [visible, setVisible] = useState(false);
  const isSignup = mode === "signup";

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full max-w-sm bg-surface border border-line rounded-2xl p-7 transition-all duration-300 ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <button
          onClick={onClose}
          data-cursor-hover
          aria-label="Close"
          className="absolute top-4 right-4 text-ink-dim hover:text-ink transition-colors"
        >
          ✕
        </button>

        <h3 className="font-display text-2xl text-ink">
          {isSignup ? "Create your account" : "Welcome back"}
        </h3>
        <p className="text-ink-dim text-sm mt-2">
          {isSignup
            ? "Free during the beta — no credit card required."
            : "Log in to see your latest matches."}
        </p>

        <form className="mt-6 space-y-3" onSubmit={(e) => e.preventDefault()}>
          {isSignup && (
            <input
              type="text"
              placeholder="Full name"
              className="w-full bg-void border border-line rounded-lg px-4 py-2.5 text-sm text-ink placeholder:text-ink-dim focus:outline-none focus:border-signal/60"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-void border border-line rounded-lg px-4 py-2.5 text-sm text-ink placeholder:text-ink-dim focus:outline-none focus:border-signal/60"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-void border border-line rounded-lg px-4 py-2.5 text-sm text-ink placeholder:text-ink-dim focus:outline-none focus:border-signal/60"
          />

          {!isSignup && (
            <div className="text-right">
              <a href="#" data-cursor-hover className="text-xs text-ink-dim hover:text-ink">
                Forgot password?
              </a>
            </div>
          )}

          <MagneticButton type="submit" className="btn-primary w-full justify-center mt-2">
            {isSignup ? "Create Free Account" : "Log In"}
          </MagneticButton>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-line" />
          <span className="text-xs text-ink-dim">or</span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <button
          data-cursor-hover
          className="w-full btn-ghost justify-center flex items-center gap-2 text-sm"
        >
          Continue with Google
        </button>

        <p className="text-center text-xs text-ink-dim mt-6">
          {isSignup ? "Already have an account? " : "New to myCareerCop? "}
          <button
            data-cursor-hover
            onClick={() => onSwitchMode(isSignup ? "login" : "signup")}
            className="text-ink hover:underline"
          >
            {isSignup ? "Log in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}
