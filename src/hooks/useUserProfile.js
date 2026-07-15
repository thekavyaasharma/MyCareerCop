import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Live-subscribes to the current user's Firestore profile doc.
 * Returns loading state + the profile data, so the app always
 * knows in real time whether onboarding is complete.
 */
export function useUserProfile(uid) {
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    const unsubscribe = onSnapshot(
      doc(db, "users", uid),
      (snap) => {
        setProfile(snap.exists() ? snap.data() : null);
        setProfileLoading(false);
      },
      (err) => {
        console.error("Profile listener failed:", err);
        setProfile(null);
        setProfileLoading(false);
      }
    );

    return unsubscribe;
  }, [uid]);

  return { profile, profileLoading };
}