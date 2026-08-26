import { List, X, Plus, Trash2 } from "lucide-react";
import { COLORS } from "../lib/colors";
import { fmtCLP } from "../lib/format";
import { EditableCell, TextCell } from "./ui/Primitives";

export default function DetalleModal({ title, entries, total, originalTotal, onAdd, onUpdate, onRemove, onClose }) {
  const cuadra = entries.length === 0 || total === originalTotal;
  return (
    <div className="modal-overlay no-print" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: COLORS.line }}>
          <div className="flex items-center gap-2">
            <List size={16} color={COLORS.navy} />
            <h3 className="font-semibold" style={{ color: COLORS.navyDark }}>{title}</h3>
          </div>
          <button onClick={onClose}><X size={18} color={COLORS.inkSoft} /></button>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs mb-3" style={{ color: COLORS.inkSoft }}>
            Agrega fecha, concepto y monto de cada movimiento que compone este total. La suma reemplaza automáticamente el monto en la pantalla general y queda registrada en la Bitácora.
          </p>
          <div className="overflow-y-auto rounded-lg border" style={{ borderColor: COLORS.line, maxHeight: 320 }}>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ background: COLORS.mist }}>
                  <th className="th-cell text-left" style={{ width: 150 }}>Fecha</th>
                  <th className="th-cell text-left">Concepto</th>
                  <th className="th-cell text-right" style={{ width: 150 }}>Monto</th>
                  <th className="th-cell" style={{ width: 36 }}></th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={4} className="td-cell text-center text-xs py-8" style={{ color: COLORS.inkSoft }}>
                      Sin detalle todavía. Agrega la primera línea para comenzar a desglosar este monto.
                    </td>
                  </tr>
                )}
                {entries.map((e) => (
                  <tr key={e.id} className="border-t" style={{ borderColor: COLORS.line }}>
                    <td className="td-cell">
                      <input
                        type="date"
                        value={e.fecha || ""}
                        onChange={(ev) => onUpdate(e.id, "fecha", ev.target.value)}
                        className="text-xs rounded-md border px-2 py-1.5 w-full"
                        style={{ borderColor: COLORS.line, fontFamily: "var(--font-sans)", color: COLORS.ink }}
                      />
                    </td>
                    <td className="td-cell">
                      <TextCell value={e.concepto} onCommit={(v) => onUpdate(e.id, "concepto", v)} width="100%" placeholder="Ej: Transferencia SEP mayo" />
                    </td>
                    <td className="td-cell text-right">
                      <EditableCell value={e.monto || 0} onCommit={(v) => onUpdate(e.id, "monto", v)} width="100%" />
                    </td>
                    <td className="td-cell text-center">
                      <button onClick={() => onRemove(e.id)} style={{ color: COLORS.danger }} title="Eliminar línea">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn-secondary mt-3" onClick={onAdd}>
            <Plus size={13} /> Agregar detalle
          </button>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: COLORS.line }}>
          <span className="text-xs" style={{ color: COLORS.inkSoft }}>{entries.length} línea(s)</span>
          <div className="flex items-center gap-2">
            {!cuadra && (
              <span className="text-[11px]" style={{ color: COLORS.warning }}>
                Antes: {fmtCLP(originalTotal)}
              </span>
            )}
            <div className="text-sm font-bold" style={{ color: COLORS.navyDark, fontFamily: "var(--font-mono)" }}>
              Total: {fmtCLP(total)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
