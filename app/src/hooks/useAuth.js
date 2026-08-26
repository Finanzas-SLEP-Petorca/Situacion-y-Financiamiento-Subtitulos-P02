import { useEffect, useState, useCallback } from "react";
import {
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured, SIGNIN_EMAIL_KEY } from "../firebase";

const actionCodeSettings = {
  url: window.location.href.split("#")[0],
  handleCodeInApp: true,
};

async function isAuthorized(email) {
  const snap = await getDoc(doc(db, "config", "team"));
  const emails = snap.exists() ? snap.data().emails || [] : [];
  return emails.map((e) => e.toLowerCase()).includes(email.toLowerCase());
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(isFirebaseConfigured ? "loading" : "not-configured"); // loading | signed-out | link-sent | not-authorized | signed-in | not-configured
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    (async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem(SIGNIN_EMAIL_KEY);
        if (!email) {
          email = window.prompt("Confirma tu correo para completar el ingreso:");
        }
        try {
          await signInWithEmailLink(auth, email, window.location.href);
          window.localStorage.removeItem(SIGNIN_EMAIL_KEY);
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {
          setError("El enlace de acceso no es válido o ya expiró. Solicita uno nuevo.");
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setStatus("signed-out");
        return;
      }
      const ok = await isAuthorized(u.email);
      if (!ok) {
        setStatus("not-authorized");
        setUser(u);
        return;
      }
      setUser(u);
      setStatus("signed-in");
    });
  }, []);

  const sendLink = useCallback(async (email) => {
    setError("");
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem(SIGNIN_EMAIL_KEY, email);
      setStatus("link-sent");
    } catch (e) {
      setError("No se pudo enviar el enlace. Verifica el correo e intenta de nuevo.");
    }
  }, []);

  const logout = useCallback(() => signOut(auth), []);

  return { user, status, error, sendLink, logout };
}
