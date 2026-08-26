import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/* Proyecto compartido con Calendariopermisos y Monitoreo Ingresos y Gastos SEP 2026 —
   estos valores del SDK web no son secretos (van igual en el JS de cualquier navegador),
   la seguridad real la dan las reglas de Firestore en /firestore.rules. */
const firebaseConfig = {
  apiKey: "AIzaSyBfYE16R3s3EVfn8A3dEUROJjC1vWdQ118",
  authDomain: "slep-petorca-finanzas-permisos.firebaseapp.com",
  projectId: "slep-petorca-finanzas-permisos",
  storageBucket: "slep-petorca-finanzas-permisos.firebasestorage.app",
  messagingSenderId: "1032729181983",
  appId: "1:1032729181983:web:3a33171e171ea6adc4ba2a",
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/* Año del ejercicio que se está trabajando. Las colecciones de Firestore
   cuelgan de situacionDeficit/{YEAR}/... — ver doc de traspaso a Firebase. */
export const YEAR = "2026";

export const SIGNIN_EMAIL_KEY = "slep-deficit-signin-email";
