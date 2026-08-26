import { Mail, X, Copy, Check } from "lucide-react";
import { COLORS } from "../lib/colors";
import { FieldBlock } from "./ui/Primitives";

export default function ReportModal({ tabLabel, subject, body, onClose, onCopy, copied, showMarkReported, onMarcarReportados, pendingCount }) {
  return (
    <div className="modal-overlay no-print" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: COLORS.line }}>
          <div className="flex items-center gap-2">
            <Mail size={16} color={COLORS.navy} />
            <h3 className="font-semibold" style={{ color: COLORS.navyDark }}>Reporte por correo — {tabLabel}</h3>
          </div>
          <button onClick={onClose}><X size={18} color={COLORS.inkSoft} /></button>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs mb-3" style={{ color: COLORS.inkSoft }}>
            Texto independiente del Excel/PDF de esta pestaña, listo para copiar y pegar en un correo a Paulina Sáez Kifafi y Javier Ilabaca Barraza.
          </p>
          <FieldBlock label="Asunto">
            <input
              readOnly
              value={subject}
              className="w-full text-xs rounded-lg border px-3 py-2 mb-3"
              style={{ borderColor: COLORS.line, fontFamily: "var(--font-sans)", color: COLORS.ink }}
            />
          </FieldBlock>
          <FieldBlock label="Cuerpo del mensaje">
            <textarea
              readOnly
              value={body}
              className="w-full text-xs rounded-lg border p-3"
              style={{ height: 300, borderColor: COLORS.line, fontFamily: "var(--font-mono)", color: COLORS.ink, resize: "vertical" }}
            />
          </FieldBlock>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: COLORS.line }}>
          <button className="btn-secondary" onClick={onCopy}>
            {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar asunto y cuerpo</>}
          </button>
          {showMarkReported && (
            <button className="btn-primary" onClick={onMarcarReportados} disabled={pendingCount === 0}>
              <Check size={14} /> Marcar como reportado
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
