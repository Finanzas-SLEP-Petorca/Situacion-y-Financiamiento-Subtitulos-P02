import { Plus, Trash2, Info } from "lucide-react";
import { COLORS } from "../../lib/colors";
import { fmtCLP, fmtNum, fmtPct } from "../../lib/format";
import { GRUPO_ORDER, APORTE_FISCAL_ORDER } from "../../lib/calc";
import { CUENTAS_CORRIENTES } from "../../lib/cuentas";
import { DeficitTag, TextCell, SelectCell, EditableCell, FieldBlock, SectionIntro, TabToolbar, AmountCell } from "../ui/Primitives";

const CD_LABELS = { general: "Subvención General", sep: "SEP", pie: "PIE" };
/* El N° de cuenta es importante tanto en el reporte como en el propio Registro en
   pantalla, así que el desplegable muestra "N° — nombre" igual a como queda
   guardado. */
const CUENTA_OPTIONS = CUENTAS_CORRIENTES.map((c) => ({ value: `${c.numero} — ${c.alias}`, label: `${c.numero} — ${c.alias}` }));

function CarreraDocentePanel({ estructura, updateCdIngresoTotal }) {
  const total = estructura.cdIngresoTotal || 0;
  const gastos = {
    general: estructura.grupos.general?.cdGasto || 0,
    sep: estructura.grupos.sep?.cdGasto || 0,
    pie: estructura.grupos.pie?.cdGasto || 0,
  };
  const gastoTotal = gastos.general + gastos.sep + gastos.pie;
  const ingresos = {
    general: estructura.grupos.general?.cdIngresos || 0,
    sep: estructura.grupos.sep?.cdIngresos || 0,
    pie: estructura.grupos.pie?.cdIngresos || 0,
  };
  const ingresoRepartido = ingresos.general + ingresos.sep + ingresos.pie;

  return (
    <div className="card mb-4">
      <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
        <div style={{ maxWidth: 520 }}>
          <h3 className="card-title">Carrera Docente — reparto del ingreso</h3>
          <p className="text-[11px] mt-0.5" style={{ color: COLORS.inkSoft }}>
            El ingreso de Carrera Docente llega como un solo monto total. Aquí se reparte automáticamente entre General, SEP y PIE en la misma proporción en que cada una gastó en remuneraciones de Carrera Docente ese mes (columna "Gasto Carrera Docente" de la tabla de arriba). El resultado se guarda como el ingreso de Carrera Docente de cada subvención.
          </p>
        </div>
        <FieldBlock label="Ingreso total Carrera Docente del mes">
          <EditableCell value={total} onCommit={updateCdIngresoTotal} width={180} />
        </FieldBlock>
      </div>
      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: COLORS.line }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ background: COLORS.mist }}>
              <th className="th-cell text-left">Subvención</th>
              <th className="th-cell text-right">Gasto Carrera Docente</th>
              <th className="th-cell text-right">% del gasto</th>
              <th className="th-cell text-right">Ingreso repartido</th>
            </tr>
          </thead>
          <tbody>
            {["general", "sep", "pie"].map((k) => (
              <tr key={k} className="border-t" style={{ borderColor: COLORS.line }}>
                <td className="td-cell font-medium">{CD_LABELS[k]}</td>
                <td className="td-cell text-right font-mono">{fmtNum(gastos[k])}</td>
                <td className="td-cell text-right font-mono text-xs" style={{ color: COLORS.inkSoft }}>
                  {fmtPct(gastoTotal ? gastos[k] / gastoTotal : 0)}
                </td>
                <td className="td-cell text-right font-mono font-semibold">{fmtNum(ingresos[k])}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: COLORS.mist }}>
              <td className="td-cell font-bold">Total</td>
              <td className="td-cell text-right font-mono font-semibold">{fmtNum(gastoTotal)}</td>
              <td className="td-cell text-right"></td>
              <td className="td-cell text-right font-mono font-bold">{fmtNum(ingresoRepartido)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function GrupoRow({ gkey, g, updateEstructuraGrupo, toggleIncluirTotal, onOpenDetalle }) {
  return (
    <>
      <tr className="border-t" style={{ borderColor: COLORS.line }}>
        <td className="td-cell font-semibold" style={{ color: COLORS.navyDark }}>{g.label}</td>
        <td className="td-cell text-right">
          <AmountCell
            value={g.ingresos}
            onCommit={(v) => updateEstructuraGrupo(gkey, "ingresos", v)}
            detalleCount={(g.ingresosDetalle || []).length}
            onOpenDetalle={() => onOpenDetalle(`grupo:${gkey}`, "ingresos", g.label)}
          />
        </td>
        <td className="td-cell text-right">
          <AmountCell
            value={g.gastoRemu}
            onCommit={(v) => updateEstructuraGrupo(gkey, "gastoRemu", v)}
            detalleCount={(g.gastoRemuDetalle || []).length}
            onOpenDetalle={() => onOpenDetalle(`grupo:${gkey}`, "gastoRemu", g.label)}
          />
        </td>
        <td className="td-cell text-right">
          <AmountCell
            value={g.gastoST2229}
            onCommit={(v) => updateEstructuraGrupo(gkey, "gastoST2229", v)}
            detalleCount={(g.gastoST2229Detalle || []).length}
            onOpenDetalle={() => onOpenDetalle(`grupo:${gkey}`, "gastoST2229", g.label)}
          />
        </td>
        <td className="td-cell text-right font-mono">{fmtNum(g.totalGastos)}</td>
        <td className="td-cell text-right"><DeficitTag value={g.diferencia} small /></td>
        <td className="td-cell text-center">
          <label className="inline-flex items-center gap-1 cursor-pointer select-none">
            <input type="checkbox" checked={g.incluirTotal} onChange={() => toggleIncluirTotal(gkey, false)} />
          </label>
        </td>
      </tr>
      {g.cd && (
        <tr className="border-t" style={{ borderColor: COLORS.line, background: "#FBFBF9" }}>
          <td className="td-cell text-xs pl-6" style={{ color: COLORS.inkSoft }}>↳ Carrera Docente — {g.label}</td>
          <td className="td-cell text-right">
            <AmountCell
              value={g.cdIngresos}
              onCommit={(v) => updateEstructuraGrupo(gkey, "cdIngresos", v)}
              detalleCount={(g.cdIngresosDetalle || []).length}
              onOpenDetalle={() => onOpenDetalle(`grupo:${gkey}`, "cdIngresos", `Carrera Docente — ${g.label}`)}
            />
          </td>
          <td className="td-cell text-right">
            <AmountCell
              value={g.cdGasto}
              onCommit={(v) => updateEstructuraGrupo(gkey, "cdGasto", v)}
              detalleCount={(g.cdGastoDetalle || []).length}
              onOpenDetalle={() => onOpenDetalle(`grupo:${gkey}`, "cdGasto", `Carrera Docente — ${g.label}`)}
            />
          </td>
          <td className="td-cell text-right text-xs" style={{ color: COLORS.inkSoft }}>—</td>
          <td className="td-cell text-right text-xs" style={{ color: COLORS.inkSoft }}>—</td>
          <td className="td-cell text-right"><DeficitTag value={g.cdDeficit} small /></td>
          <td className="td-cell"></td>
        </tr>
      )}
      {g.cd && (
        <tr className="border-t" style={{ borderColor: COLORS.line, background: COLORS.mist }}>
          <td className="td-cell text-xs font-semibold pl-6" style={{ color: COLORS.navyDark }}>Total {g.label} (incl. Carrera Docente)</td>
          <td className="td-cell text-right font-mono font-semibold">{fmtNum(g.totalIngresos)}</td>
          <td className="td-cell text-right font-mono font-semibold">{fmtNum(g.totalGastoRemu)}</td>
          <td className="td-cell text-right font-mono font-semibold">{fmtNum(g.gastoST2229)}</td>
          <td className="td-cell text-right font-mono font-semibold">{fmtNum(g.totalGastos)}</td>
          <td className="td-cell text-right"><DeficitTag value={g.diferencia} small /></td>
          <td className="td-cell"></td>
        </tr>
      )}
    </>
  );
}

export default function EstructuraTab({
  estructura, estructuraCalc, updatePeriodo, updateEstructuraGrupo, updateCdIngresoTotal, updateEstructuraJunji,
  toggleIncluirTotal, addSacado, updateSacado, removeSacado,
  onExcel, onPDF, onReport, onOpenDetalle,
}) {
  const j = estructura.junji;
  const jc = estructuraCalc.junjiCalc;

  return (
    <div>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <SectionIntro
          title="Estructura de déficit — traspasos entre cuentas corrientes (REX)"
          desc="A partir del saldo de cada subvención (ingresos disponibles vs. gasto en remuneraciones + Subt. 22/29) se determina cuánto falta o sobra por fuente. Usa el ícono de lista junto a cada monto para desglosarlo por fecha y concepto, igual que en Datos Mensuales."
        />
        <TabToolbar onExcel={onExcel} onPDF={onPDF} onReport={onReport} />
      </div>

      <div className="card mb-4 flex items-center gap-3 flex-wrap">
        <FieldBlock label="Período de análisis">
          <TextCell value={estructura.periodo} onCommit={updatePeriodo} width={260} />
        </FieldBlock>
        <div className="text-[11px] flex items-start gap-1.5 max-w-md" style={{ color: COLORS.inkSoft }}>
          <Info size={13} className="mt-0.5 shrink-0" />
          Esta pestaña es independiente de los datos mensuales: ingresa los saldos vigentes de cada subvención al momento de calcular el traspaso.
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border mb-4" style={{ borderColor: COLORS.line }}>
        <table className="w-full text-sm border-collapse" style={{ minWidth: 920 }}>
          <thead>
            <tr style={{ background: COLORS.mist }}>
              <th className="th-cell text-left">Subvención</th>
              <th className="th-cell text-right">Ingresos</th>
              <th className="th-cell text-right">Gasto Remuneraciones</th>
              <th className="th-cell text-right">Gasto Subt. 22 y 29</th>
              <th className="th-cell text-right">Total Gastos</th>
              <th className="th-cell text-right">Diferencia</th>
              <th className="th-cell text-center" title="Incluir en Total Final">En total</th>
            </tr>
          </thead>
          <tbody>
            {GRUPO_ORDER.filter((key) => estructuraCalc.groups[key]).map((key) => (
              <GrupoRow key={key} gkey={key} g={estructuraCalc.groups[key]} updateEstructuraGrupo={updateEstructuraGrupo} toggleIncluirTotal={toggleIncluirTotal} onOpenDetalle={onOpenDetalle} />
            ))}

            <tr className="border-t" style={{ borderColor: COLORS.line }}>
              <td className="td-cell font-semibold" style={{ color: COLORS.navyDark }}>JUNJI</td>
              <td className="td-cell text-right font-mono">{fmtNum(jc.ingresos)}</td>
              <td className="td-cell text-right font-mono">{fmtNum(jc.gasto)}</td>
              <td className="td-cell text-right">
                <AmountCell
                  value={j.gastoST2229}
                  onCommit={(v) => updateEstructuraJunji("gastoST2229", null, v)}
                  detalleCount={(j.gastoST2229Detalle || []).length}
                  onOpenDetalle={() => onOpenDetalle("junjiTotal", "gastoST2229", "JUNJI")}
                />
              </td>
              <td className="td-cell text-right font-mono">{fmtNum(jc.totalGastos)}</td>
              <td className="td-cell text-right"><DeficitTag value={jc.diferencia} small /></td>
              <td className="td-cell text-center">
                <input type="checkbox" checked={j.incluirTotal} onChange={() => toggleIncluirTotal(null, true)} />
              </td>
            </tr>
            {["operacion", "cd", "homologacion"].map((sub) => {
              const subLabel = sub === "operacion" ? "Operación" : sub === "cd" ? "Convenio CD" : "Homologación";
              return (
                <tr key={sub} className="border-t" style={{ borderColor: COLORS.line, background: "#FBFBF9" }}>
                  <td className="td-cell text-xs pl-6" style={{ color: COLORS.inkSoft }}>↳ JUNJI {subLabel}</td>
                  <td className="td-cell text-right">
                    <AmountCell
                      value={j[sub].ingresos}
                      onCommit={(v) => updateEstructuraJunji(sub, "ingresos", v)}
                      detalleCount={(j[sub].ingresosDetalle || []).length}
                      onOpenDetalle={() => onOpenDetalle(`junjiSub:${sub}`, "ingresos", `JUNJI ${subLabel}`)}
                    />
                  </td>
                  <td className="td-cell text-right">
                    <AmountCell
                      value={j[sub].gasto}
                      onCommit={(v) => updateEstructuraJunji(sub, "gasto", v)}
                      detalleCount={(j[sub].gastoDetalle || []).length}
                      onOpenDetalle={() => onOpenDetalle(`junjiSub:${sub}`, "gasto", `JUNJI ${subLabel}`)}
                    />
                  </td>
                  <td className="td-cell text-right text-xs" style={{ color: COLORS.inkSoft }}>—</td>
                  <td className="td-cell text-right text-xs" style={{ color: COLORS.inkSoft }}>—</td>
                  <td className="td-cell text-right"><DeficitTag value={j[sub].ingresos - j[sub].gasto} small /></td>
                  <td className="td-cell"></td>
                </tr>
              );
            })}
            <tr className="border-t" style={{ borderColor: COLORS.line, background: COLORS.mist }}>
              <td className="td-cell text-xs font-semibold pl-6" style={{ color: COLORS.navyDark }}>Total JUNJI</td>
              <td className="td-cell text-right font-mono font-semibold">{fmtNum(jc.ingresos)}</td>
              <td className="td-cell text-right font-mono font-semibold">{fmtNum(jc.gasto)}</td>
              <td className="td-cell text-right font-mono font-semibold">{fmtNum(j.gastoST2229)}</td>
              <td className="td-cell text-right font-mono font-semibold">{fmtNum(jc.totalGastos)}</td>
              <td className="td-cell text-right"><DeficitTag value={jc.diferencia} small /></td>
              <td className="td-cell"></td>
            </tr>

            {APORTE_FISCAL_ORDER.filter((key) => estructuraCalc.groups[key]).map((key) => (
              <GrupoRow
                key={key}
                gkey={key}
                g={estructuraCalc.groups[key]}
                updateEstructuraGrupo={updateEstructuraGrupo}
                toggleIncluirTotal={toggleIncluirTotal}
                onOpenDetalle={onOpenDetalle}
              />
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: COLORS.mist }}>
              <td className="td-cell font-bold">Total Final</td>
              <td className="td-cell text-right font-mono font-semibold">{fmtNum(estructuraCalc.ingresosFinal)}</td>
              <td className="td-cell text-right font-mono font-semibold">{fmtNum(estructuraCalc.gastoRemuFinal)}</td>
              <td className="td-cell text-right font-mono font-semibold">{fmtNum(estructuraCalc.st2229Final)}</td>
              <td className="td-cell text-right font-mono font-semibold">{fmtNum(estructuraCalc.gastosFinal)}</td>
              <td className="td-cell text-right"><DeficitTag value={estructuraCalc.diferenciaFinal} /></td>
              <td className="td-cell"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="text-[11px] mb-4 -mt-2" style={{ color: COLORS.inkSoft }}>
        "En total" marca qué subvenciones se suman en la fila Total Final (Ingresos, Gasto Remuneraciones, Gasto Subt. 22/29, Total Gastos y Diferencia, todas juntas). Por defecto SEP queda fuera (como en la planilla original), ya que su déficit/superávit se autocontiene dentro de la propia subvención. Ajusta la casilla si tu criterio cambia — por ejemplo, para que el Total Final sea exactamente Subvención General + SEP + PIE + JUNJI, deja esas cuatro marcadas y Aporte Fiscal Educación / Jardines sin marcar.
      </p>

      <CarreraDocentePanel estructura={estructura} updateCdIngresoTotal={updateCdIngresoTotal} />

      <div className="card">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h3 className="card-title">Registro de traspasos entre cuentas (REX)</h3>
            <p className="text-[11px] mt-0.5" style={{ color: COLORS.inkSoft }}>
              Cada fila es un movimiento real: de qué cuenta salió, a cuál entró, para qué proceso (remuneraciones, pago a proveedores, etc.) y bajo qué resolución. El monto usa signo manual: negativo si ese movimiento ya redujo lo que falta pedir, positivo si lo aumentó.
            </p>
          </div>
          <button className="btn-secondary shrink-0" onClick={addSacado}><Plus size={13} /> Agregar traspaso</button>
        </div>
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: COLORS.line }}>
          <table className="w-full text-sm border-collapse" style={{ minWidth: 1500 }}>
            <thead>
              <tr style={{ background: COLORS.mist }}>
                <th className="th-cell text-left" style={{ width: 130 }}>Fecha</th>
                <th className="th-cell text-left" style={{ width: 220 }}>Proceso / Motivo</th>
                <th className="th-cell text-left" style={{ width: 340 }}>Cuenta Origen (Desde)</th>
                <th className="th-cell text-left" style={{ width: 340 }}>Cuenta Destino (Hacia)</th>
                <th className="th-cell text-right">Monto</th>
                <th className="th-cell text-left" style={{ width: 200 }}>N° REX</th>
                <th className="th-cell"></th>
              </tr>
            </thead>
            <tbody>
              {estructura.sacados.map((s) => (
                <tr key={s.id} className="border-t" style={{ borderColor: COLORS.line }}>
                  <td className="td-cell">
                    <input
                      type="date"
                      value={s.fecha || ""}
                      onChange={(ev) => updateSacado(s.id, "fecha", ev.target.value)}
                      className="text-xs rounded-md border px-2 py-1.5 w-full"
                      style={{ borderColor: COLORS.line, fontFamily: "var(--font-sans)", color: COLORS.ink }}
                    />
                  </td>
                  <td className="td-cell"><TextCell value={s.proceso} onCommit={(v) => updateSacado(s.id, "proceso", v)} width={210} placeholder="Ej: Remuneraciones julio" /></td>
                  <td className="td-cell"><SelectCell value={s.cuentaOrigen} options={CUENTA_OPTIONS} onCommit={(v) => updateSacado(s.id, "cuentaOrigen", v)} width={330} placeholder="Desde…" /></td>
                  <td className="td-cell"><SelectCell value={s.cuentaDestino} options={CUENTA_OPTIONS} onCommit={(v) => updateSacado(s.id, "cuentaDestino", v)} width={330} placeholder="Hacia…" /></td>
                  <td className="td-cell text-right"><EditableCell value={s.monto} onCommit={(v) => updateSacado(s.id, "monto", v)} /></td>
                  <td className="td-cell"><TextCell value={s.rex} onCommit={(v) => updateSacado(s.id, "rex", v)} width={210} placeholder="Ej: REX 296 del 12/06/2026" /></td>
                  <td className="td-cell text-center">
                    <button onClick={() => removeSacado(s.id)} style={{ color: COLORS.danger }} title="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {estructura.sacados.length === 0 && (
                <tr><td className="td-cell text-xs" colSpan={7} style={{ color: COLORS.inkSoft }}>Sin traspasos registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl p-5 mt-4 flex items-center justify-between flex-wrap gap-3" style={{ background: COLORS.navy }}>
        <div>
          <div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Déficit acumulado periodo de análisis</div>
          <div className="text-2xl font-bold mt-1" style={{ color: "#fff", fontFamily: "var(--font-mono)" }}>{fmtCLP(estructuraCalc.deficitAcumuladoAPedir)}</div>
        </div>
        <div className="text-xs text-right" style={{ color: "rgba(255,255,255,0.75)", maxWidth: 360 }}>
          Diferencia Total Final ({fmtCLP(estructuraCalc.diferenciaFinal)}) + traspasos ya registrados ({fmtCLP(estructuraCalc.sacadosSum)}).
        </div>
      </div>
    </div>
  );
}
