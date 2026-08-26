import { Trash2 } from "lucide-react";
import { COLORS } from "../../lib/colors";
import { fmtNum } from "../../lib/format";
import { Badge, TextCell, SectionIntro, TabToolbar } from "../ui/Primitives";

export default function BitacoraTab({ changeLog, updateLogNota, toggleLogIncluido, removeLogEntry, pendingChanges, onExcel, onPDF, onReport }) {
  const reportados = changeLog.filter((c) => c.reportado);

  return (
    <div>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <SectionIntro
          title="Bitácora de movimientos"
          desc="Cada vez que cambias un monto en Datos Mensuales o en la Estructura de Déficit queda registrado aquí. Marca qué incluir, deja una nota de contexto y genera el reporte para las jefaturas."
        />
        <TabToolbar onExcel={onExcel} onPDF={onPDF} onReport={onReport} reportBadge={pendingChanges.length} />
      </div>

      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: COLORS.line }}>
        <table className="w-full text-sm border-collapse" style={{ minWidth: 980 }}>
          <thead>
            <tr style={{ background: COLORS.mist }}>
              <th className="th-cell text-center" style={{ width: 36 }}></th>
              <th className="th-cell text-left">Fecha</th>
              <th className="th-cell text-left">Sección</th>
              <th className="th-cell text-left">Mes / Período</th>
              <th className="th-cell text-left">Concepto</th>
              <th className="th-cell text-left">Campo</th>
              <th className="th-cell text-right">Antes</th>
              <th className="th-cell text-right">Después</th>
              <th className="th-cell text-left" style={{ minWidth: 220 }}>Nota para jefatura</th>
              <th className="th-cell"></th>
            </tr>
          </thead>
          <tbody>
            {changeLog.length === 0 && (
              <tr><td colSpan={10} className="td-cell text-sm text-center py-8" style={{ color: COLORS.inkSoft }}>
                Aún no hay cambios registrados. Edita cualquier monto en las otras pestañas y aparecerá aquí automáticamente.
              </td></tr>
            )}
            {changeLog.map((c) => (
              <tr key={c.id} className="border-t" style={{ borderColor: COLORS.line, opacity: c.reportado ? 0.55 : 1 }}>
                <td className="td-cell text-center">
                  <input type="checkbox" checked={c.incluido} disabled={c.reportado} onChange={() => toggleLogIncluido(c.id)} />
                </td>
                <td className="td-cell text-xs whitespace-nowrap" style={{ color: COLORS.inkSoft }}>{c.tsLabel}</td>
                <td className="td-cell text-xs"><Badge tone="navy">{c.section}</Badge></td>
                <td className="td-cell text-xs">{c.mes}</td>
                <td className="td-cell text-xs font-medium">{c.concepto}</td>
                <td className="td-cell text-xs" style={{ color: COLORS.inkSoft }}>{c.campo}</td>
                <td className="td-cell text-right text-xs font-mono" style={{ color: COLORS.inkSoft }}>{typeof c.oldVal === "number" ? fmtNum(c.oldVal) : c.oldVal}</td>
                <td className="td-cell text-right text-xs font-mono font-semibold">{typeof c.newVal === "number" ? fmtNum(c.newVal) : c.newVal}</td>
                <td className="td-cell"><TextCell value={c.nota} onCommit={(v) => updateLogNota(c.id, v)} width={220} placeholder="Motivo (opcional)" /></td>
                <td className="td-cell text-center">
                  <button onClick={() => removeLogEntry(c.id)} style={{ color: COLORS.danger }} title="Eliminar registro">
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reportados.length > 0 && (
        <p className="text-[11px] mt-3" style={{ color: COLORS.inkSoft }}>
          {reportados.length} movimiento(s) ya fueron marcados como reportados a jefatura.
        </p>
      )}
    </div>
  );
}
