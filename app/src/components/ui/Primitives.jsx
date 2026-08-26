import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Save, Loader2, Download, Printer, Mail, List } from "lucide-react";
import { COLORS } from "../../lib/colors";
import { fmtNum, fmtCLP } from "../../lib/format";

export function Badge({ tone = "neutral", children, style }) {
  const tones = {
    neutral: { bg: "#EEF1F4", fg: COLORS.inkSoft },
    success: { bg: COLORS.successBg, fg: COLORS.success },
    danger: { bg: COLORS.dangerBg, fg: COLORS.danger },
    warning: { bg: COLORS.warningBg, fg: COLORS.warning },
    navy: { bg: COLORS.mist, fg: COLORS.navy },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
      style={{ background: t.bg, color: t.fg, ...style }}
    >
      {children}
    </span>
  );
}

export function EditableCell({ value, onCommit, align = "right", width = 128, disabled = false, placeholder }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? 0));

  useEffect(() => { if (!editing) setDraft(String(value ?? 0)); }, [value, editing]);

  return (
    <input
      type="text"
      inputMode="numeric"
      disabled={disabled}
      placeholder={placeholder}
      value={editing ? draft : fmtNum(value)}
      onFocus={(e) => { setEditing(true); setDraft(value ? String(value) : ""); e.target.select(); }}
      onChange={(e) => setDraft(e.target.value.replace(/[^-0-9]/g, ""))}
      onBlur={() => {
        setEditing(false);
        const num = draft === "" || draft === "-" ? 0 : parseInt(draft, 10);
        if (num !== value) onCommit(num);
      }}
      onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
      style={{
        width,
        textAlign: align,
        fontFamily: "var(--font-mono)",
        fontSize: 13,
        padding: "6px 8px",
        borderRadius: 6,
        border: `1px solid ${editing ? COLORS.navy : "transparent"}`,
        background: disabled ? "transparent" : editing ? "#fff" : "#F3F6F8",
        color: COLORS.ink,
        outline: "none",
        transition: "background .12s, border-color .12s",
      }}
      className={disabled ? "" : "hover:bg-white"}
    />
  );
}

export function TextCell({ value, onCommit, width = 200, placeholder }) {
  const [draft, setDraft] = useState(value || "");
  useEffect(() => setDraft(value || ""), [value]);
  return (
    <input
      type="text"
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => { if (draft !== value) onCommit(draft); }}
      style={{
        width, fontSize: 12.5, padding: "6px 8px", borderRadius: 6,
        border: "1px solid transparent", background: "#F3F6F8", color: COLORS.inkSoft,
        outline: "none", fontFamily: "var(--font-sans)",
      }}
      className="hover:bg-white focus:bg-white focus:border-slate-300"
    />
  );
}

export function DeficitTag({ value, small }) {
  const positive = value >= 0;
  return (
    <span
      className={"inline-flex items-center gap-1 font-semibold " + (small ? "text-xs" : "text-sm")}
      style={{ color: positive ? COLORS.success : COLORS.danger, fontFamily: "var(--font-mono)" }}
    >
      {positive ? <TrendingUp size={small ? 12 : 14} /> : <TrendingDown size={small ? 12 : 14} />}
      {fmtCLP(value)}
    </span>
  );
}

export function AmountCell({ value, onCommit, detalleCount, onOpenDetalle, hideDetalle }) {
  const hasDetalle = detalleCount > 0;
  return (
    <div className="flex items-center justify-end gap-1">
      <EditableCell value={value} onCommit={onCommit} disabled={hasDetalle} />
      {!hideDetalle && (
        <button
          onClick={onOpenDetalle}
          title={hasDetalle ? `Ver detalle (${detalleCount} línea(s))` : "Agregar detalle (fecha, concepto, monto)"}
          className="shrink-0"
          style={{
            width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 6,
            background: hasDetalle ? COLORS.mist : "transparent",
            color: hasDetalle ? COLORS.navy : COLORS.inkSoft,
            border: `1px solid ${hasDetalle ? COLORS.navy : COLORS.line}`,
          }}
        >
          <List size={12} />
        </button>
      )}
    </div>
  );
}

export function FieldBlock({ label, children }) {
  return (
    <div>
      <div className="text-[11px] font-medium mb-1" style={{ color: COLORS.inkSoft }}>{label}</div>
      {children}
    </div>
  );
}

export function SectionIntro({ title, desc }) {
  return (
    <div className="mb-4">
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: COLORS.navyDark }}>{title}</h2>
      {desc && <p className="text-sm mt-1" style={{ color: COLORS.inkSoft, maxWidth: 780 }}>{desc}</p>}
    </div>
  );
}

export function TabToolbar({ onExcel, onPDF, onReport, reportBadge }) {
  return (
    <div className="flex items-center gap-2 shrink-0 flex-wrap">
      <button className="btn-secondary" onClick={onExcel} title="Exportar Excel de esta pestaña">
        <Download size={14} /> Excel
      </button>
      <button className="btn-secondary" onClick={onPDF} title="Exportar PDF de esta pestaña">
        <Printer size={14} /> PDF
      </button>
      <button className="btn-primary" onClick={onReport} title="Generar reporte por correo de esta pestaña">
        <Mail size={14} /> Reporte
        {!!reportBadge && (
          <span className="rounded-full text-[10px] font-bold px-1.5" style={{ background: "rgba(255,255,255,0.3)" }}>{reportBadge}</span>
        )}
      </button>
    </div>
  );
}

export function SyncStatus({ status, lastEdit, userEmail }) {
  return (
    <div className="text-right text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
      {userEmail && <div className="truncate">Conectado como: {userEmail}</div>}
      <div className="flex items-center justify-end gap-1.5">
        {status === "saving" ? (
          <>
            <Loader2 size={13} className="animate-spin" /> Guardando…
          </>
        ) : (
          <>
            <Save size={13} />
            {lastEdit ? `Sincronizado · última edición por ${lastEdit.name} ${lastEdit.stamp}` : "Sincronizado"}
          </>
        )}
      </div>
    </div>
  );
}

export function KpiCard({ label, value, tone, sub }) {
  const tones = {
    navy: { bg: COLORS.navy, fg: "#fff" },
    success: { bg: COLORS.successBg, fg: COLORS.success },
    danger: { bg: COLORS.dangerBg, fg: COLORS.danger },
    neutral: { bg: "#fff", fg: COLORS.ink },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <div className="rounded-xl p-4 border" style={{ background: t.bg, borderColor: tone === "navy" ? COLORS.navy : COLORS.line }}>
      <div className="text-xs font-medium" style={{ color: tone === "navy" ? "rgba(255,255,255,0.75)" : COLORS.inkSoft }}>{label}</div>
      <div className="text-xl font-bold mt-1" style={{ color: t.fg, fontFamily: "var(--font-mono)" }}>{value}</div>
      {sub && <div className="text-[11px] mt-0.5" style={{ color: tone === "navy" ? "rgba(255,255,255,0.65)" : COLORS.inkSoft }}>{sub}</div>}
    </div>
  );
}
