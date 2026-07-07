const MESSAGES = {
  "auth/email-already-in-use": "An account with this email already exists — try logging in instead.",
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "Incorrect password. Try again or reset it.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/popup-closed-by-user": "Google sign-in was closed before finishing.",
  "auth/network-request-failed": "Network error — check your connection and try again.",
};

export function friendlyAuthError(error) {
  return MESSAGES[error?.code] || "Something went wrong. Please try again.";
}
