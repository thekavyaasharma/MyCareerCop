import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { friendlyAuthError } from "../lib/authErrors";
import MagneticButton from "./MagneticButton";

export default function AuthModal({ mode, onClose, onSwitchMode }) {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

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

  // Clear transient state whenever the mode is switched (signup <-> login)
  useEffect(() => {
    setError("");
    setResetSent(false);
  }, [mode]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isSignup) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(cred.user, { displayName: name.trim() });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setSubmitting(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    setError("");
    if (!email) {
      setError("Enter your email above first, then tap \u201cForgot password?\u201d");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err) {
      setError(friendlyAuthError(err));
    }
  }

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

        {error && (
          <div className="mt-4 text-sm text-signal bg-signal-dim border border-signal/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {resetSent && (
          <div className="mt-4 text-sm text-scan bg-scan/10 border border-scan/30 rounded-lg px-3 py-2">
            Password reset email sent — check your inbox.
          </div>
        )}

        <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
          {isSignup && (
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-void border border-line rounded-lg px-4 py-2.5 text-sm text-ink placeholder:text-ink-dim focus:outline-none focus:border-signal/60"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-void border border-line rounded-lg px-4 py-2.5 text-sm text-ink placeholder:text-ink-dim focus:outline-none focus:border-signal/60"
          />
          <input
            type="password"
            placeholder="Password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-void border border-line rounded-lg px-4 py-2.5 text-sm text-ink placeholder:text-ink-dim focus:outline-none focus:border-signal/60"
          />

          {!isSignup && (
            <div className="text-right">
              <button
                type="button"
                data-cursor-hover
                onClick={handleForgotPassword}
                className="text-xs text-ink-dim hover:text-ink"
              >
                Forgot password?
              </button>
            </div>
          )}

          <MagneticButton
            type="submit"
            disabled={submitting}
            className="btn-primary w-full justify-center mt-2 disabled:opacity-60"
          >
            {submitting
              ? "Please wait…"
              : isSignup
              ? "Create Free Account"
              : "Log In"}
          </MagneticButton>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-line" />
          <span className="text-xs text-ink-dim">or</span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <button
          type="button"
          data-cursor-hover
          onClick={handleGoogle}
          disabled={submitting}
          className="w-full btn-ghost justify-center flex items-center gap-2 text-sm disabled:opacity-60"
        >
          Continue with Google
        </button>

        <p className="text-center text-xs text-ink-dim mt-6">
          {isSignup ? "Already have an account? " : "New to MyCareerCop? "}
          <button
            type="button"
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
