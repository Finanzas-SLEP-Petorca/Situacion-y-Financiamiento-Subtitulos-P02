import { useEffect, useState, useCallback } from "react";
import {
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
} from "firebase/auth";
import { auth, SIGNIN_EMAIL_KEY } from "../firebase";
import { ALLOWED_EMAILS } from "../lib/allowedEmails";

const actionCodeSettings = {
  url: window.location.href.split("#")[0],
  handleCodeInApp: true,
};

function isAuthorized(email) {
  return ALLOWED_EMAILS.map((e) => e.toLowerCase()).includes(email.toLowerCase());
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | signed-out | link-sent | not-authorized | signed-in
  const [error, setError] = useState("");

  useEffect(() => {
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
    return onAuthStateChanged(auth, (u) => {
      if (!u) {
        setUser(null);
        setStatus("signed-out");
        return;
      }
      const ok = isAuthorized(u.email);
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
