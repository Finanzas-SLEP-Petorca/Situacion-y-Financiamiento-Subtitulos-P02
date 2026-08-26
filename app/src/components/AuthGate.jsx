import { useState } from "react";
import { Mail, Loader2, ShieldAlert } from "lucide-react";
import { COLORS } from "../lib/colors";
import { useAuth } from "../hooks/useAuth";

function Shell({ children }) {
  return (
    <div
      className="flex items-center justify-center min-h-screen px-4"
      style={{ background: COLORS.paper, fontFamily: "var(--font-sans)" }}
    >
      <div className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: COLORS.line }}>
        {children}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="mb-5 text-center">
      <img src={import.meta.env.BASE_URL + "logo-slep-petorca.webp"} alt="Somos SLEP Petorca" style={{ height: 32, margin: "0 auto 12px" }} />
      <h1 className="font-semibold" style={{ color: COLORS.navyDark, fontFamily: "var(--font-display)", fontSize: 17 }}>
        Situación de Déficit — Financiamiento Remuneraciones P02
      </h1>
      <p className="text-xs mt-1" style={{ color: COLORS.inkSoft }}>SLEP Petorca · Subdepartamento de Finanzas</p>
    </div>
  );
}

export default function AuthGate({ children }) {
  const { status, error, sendLink, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  if (status === "loading") {
    return (
      <Shell>
        <Header />
        <div className="flex items-center justify-center gap-2 py-6 text-sm" style={{ color: COLORS.inkSoft }}>
          <Loader2 size={16} className="animate-spin" /> Verificando sesión…
        </div>
      </Shell>
    );
  }

  if (status === "signed-in") return children;

  if (status === "not-authorized") {
    return (
      <Shell>
        <Header />
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <ShieldAlert size={28} color={COLORS.danger} />
          <p className="text-sm font-medium" style={{ color: COLORS.danger }}>
            Tu correo no está autorizado para acceder a este dashboard.
          </p>
          <p className="text-xs" style={{ color: COLORS.inkSoft }}>
            Pide a un administrador que agregue tu correo a la lista de acceso (ALLOWED_EMAILS en src/lib/allowedEmails.js y en las reglas de Firestore).
          </p>
          <button className="btn-secondary mt-2" onClick={logout}>Cerrar sesión</button>
        </div>
      </Shell>
    );
  }

  if (status === "link-sent") {
    return (
      <Shell>
        <Header />
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <Mail size={28} color={COLORS.navy} />
          <p className="text-sm font-medium" style={{ color: COLORS.navyDark }}>Revisa tu correo</p>
          <p className="text-xs" style={{ color: COLORS.inkSoft }}>
            Te enviamos un enlace de acceso a <strong>{email}</strong>. Ábrelo en este mismo navegador para ingresar.
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Header />
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setSending(true);
          await sendLink(email);
          setSending(false);
        }}
        className="flex flex-col gap-3"
      >
        <label className="text-xs font-medium" style={{ color: COLORS.inkSoft }}>Correo institucional</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nombre@sleppetorca.gob.cl"
          className="text-sm rounded-lg border px-3 py-2"
          style={{ borderColor: COLORS.line }}
        />
        {error && <p className="text-xs" style={{ color: COLORS.danger }}>{error}</p>}
        <button className="btn-primary justify-center" disabled={sending} type="submit">
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
          Enviar enlace de acceso
        </button>
      </form>
    </Shell>
  );
}
