import { fmtCLP, fmtPct, nowStamp } from "../../lib/format";
import { MONTHS, FUENTE_DEFS, GRUPO_ORDER, APORTE_FISCAL_ORDER, buildEstructuraDetailRows, groupDetailRowsBySubvencion, splitIngresosGastos } from "../../lib/calc";

function PrintHeader({ title, subtitle }) {
  return (
    <div className="border-b pb-3 mb-4" style={{ borderColor: "#ccc" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>{title}</h1>
      <div style={{ fontSize: 11, color: "#555" }}>SLEP Petorca · {subtitle} · Generado {nowStamp()}</div>
    </div>
  );
}

const printCellStyle = { border: "1px solid #ccc", padding: "3px 6px" };
const printCellStyleR = { border: "1px solid #ccc", padding: "3px 6px", textAlign: "right" };
const printHeadStyle = { border: "1px solid #ccc", padding: "4px 6px", background: "#eef2f5", textAlign: "right" };

export function PrintViewDatos({ monthIdx, monthData, monthTotal }) {
  return (
    <div className="only-print" style={{ fontFamily: "var(--font-sans)", color: "#111", padding: 24 }}>
      <PrintHeader title={`Financiamiento de remuneraciones — ${MONTHS[monthIdx]} 2026`} subtitle={`Estado: ${monthTotal.tipo}`} />
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5, marginBottom: 16 }}>
        <thead>
          <tr>
            {["Fuente", "Ingresos", "Saldo Sub 22/29", "Saldo Remu (A)", "Remuneraciones (B)", "Déficit (A-B)", "% Resguardo"].map((h) => (
              <th key={h} style={printHeadStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FUENTE_DEFS.map((fd) => {
            const c = monthTotal.perFuente[fd.key];
            return (
              <tr key={fd.key}>
                <td style={printCellStyle}>{fd.label}</td>
                <td style={printCellStyleR}>{fmtCLP(c.ingresos)}</td>
                <td style={printCellStyleR}>{fmtCLP(c.saldoSub)}</td>
                <td style={printCellStyleR}>{fmtCLP(c.saldoRemu)}</td>
                <td style={printCellStyleR}>{fmtCLP(c.remuneraciones)}</td>
                <td style={printCellStyleR}>{fmtCLP(c.deficit)}</td>
                <td style={printCellStyleR}>{fmtPct(c.ingresos ? c.saldoSub / c.ingresos : 0)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ fontWeight: 700 }}>
            <td style={printCellStyle}>Totales</td>
            <td style={printCellStyleR}>{fmtCLP(monthTotal.ingresos)}</td>
            <td style={printCellStyleR}>{fmtCLP(monthTotal.saldoSub)}</td>
            <td style={printCellStyleR}>{fmtCLP(monthTotal.saldoRemu)}</td>
            <td style={printCellStyleR}>{fmtCLP(monthTotal.remuneraciones)}</td>
            <td style={printCellStyleR}>{fmtCLP(monthTotal.deficit)}</td>
            <td style={printCellStyleR}></td>
          </tr>
        </tfoot>
      </table>
      <table style={{ fontSize: 10.5, borderCollapse: "collapse" }}>
        <tbody>
          <tr><td style={printCellStyle}>Saldo FAEP para REMU</td><td style={printCellStyleR}>{fmtCLP(monthTotal.ajusteFAEP)}</td></tr>
          <tr><td style={printCellStyle}>Saldo FIGA</td><td style={printCellStyleR}>{fmtCLP(monthTotal.ajusteFIGA)}</td></tr>
          <tr style={{ fontWeight: 700 }}><td style={printCellStyle}>Déficit / Superávit Total</td><td style={printCellStyleR}>{fmtCLP(monthTotal.f16)}</td></tr>
        </tbody>
      </table>

      {FUENTE_DEFS.some((fd) => (monthData[fd.key]?.ingresosDetalle || []).length || (monthData[fd.key]?.remuneracionesDetalle || []).length) && (
        <>
          <h2 style={{ fontSize: 13, fontWeight: 700, margin: "16px 0 6px" }}>Detalle de Ingresos y Remuneraciones</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
            <thead>
              <tr>
                {["Fuente", "Tipo", "Fecha", "Concepto", "Monto"].map((h) => (
                  <th key={h} style={{ ...printHeadStyle, textAlign: h === "Monto" ? "right" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FUENTE_DEFS.flatMap((fd) => {
                const raw = monthData[fd.key] || {};
                const rows = [];
                (raw.ingresosDetalle || []).forEach((e) => rows.push({ ...e, fuente: fd.label, tipo: "Ingreso" }));
                (raw.remuneracionesDetalle || []).forEach((e) => rows.push({ ...e, fuente: fd.label, tipo: "Remuneraciones" }));
                return rows;
              }).map((e) => (
                <tr key={e.id}>
                  <td style={printCellStyle}>{e.fuente}</td>
                  <td style={printCellStyle}>{e.tipo}</td>
                  <td style={printCellStyle}>{e.fecha || ""}</td>
                  <td style={printCellStyle}>{e.concepto || ""}</td>
                  <td style={printCellStyleR}>{fmtCLP(e.monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export function PrintViewResumen({ months, monthTotals, accumulated, corte }) {
  const shown = Array.from({ length: corte }, (_, i) => i);
  const totalDeficit = shown.reduce((s, i) => s + monthTotals[i].deficit, 0);
  const acumuladoFinal = accumulated[corte - 1];

  return (
    <div className="only-print" style={{ fontFamily: "var(--font-sans)", color: "#111", padding: 24 }}>
      <PrintHeader title="Resumen ejecutivo — Financiamiento de remuneraciones P02" subtitle={`Corte al mes de ${MONTHS[corte - 1]} 2026`} />
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
        <thead>
          <tr>
            {["Mes", "Estado", "Ingresos", "Saldo Sub 22/29", "Saldo Remu (A)", "Remuneraciones (B)", "Déficit (A-B)", "Acumulado"].map((h) => (
              <th key={h} style={printHeadStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((i) => {
            const mt = monthTotals[i];
            return (
              <tr key={i}>
                <td style={printCellStyle}>{MONTHS[i]}</td>
                <td style={printCellStyle}>{mt.tipo}</td>
                <td style={printCellStyleR}>{fmtCLP(mt.ingresos)}</td>
                <td style={printCellStyleR}>{fmtCLP(mt.saldoSub)}</td>
                <td style={printCellStyleR}>{fmtCLP(mt.saldoRemu)}</td>
                <td style={printCellStyleR}>{fmtCLP(mt.remuneraciones)}</td>
                <td style={printCellStyleR}>{fmtCLP(mt.deficit)}</td>
                <td style={printCellStyleR}>{fmtCLP(accumulated[i])}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ fontWeight: 700 }}>
            <td style={printCellStyle} colSpan={6}>Totales del período</td>
            <td style={printCellStyleR}>{fmtCLP(totalDeficit)}</td>
            <td style={printCellStyleR}>{fmtCLP(acumuladoFinal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export function PrintViewEstructura({ estructura, estructuraCalc }) {
  return (
    <div className="only-print" style={{ fontFamily: "var(--font-sans)", color: "#111", padding: 24 }}>
      <PrintHeader title="Estructura de déficit — traspasos entre cuentas (REX)" subtitle={`Período: ${estructura.periodo}`} />
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
        <thead>
          <tr>
            {["Subvención", "Ingresos", "Total Gastos", "Diferencia"].map((h) => (
              <th key={h} style={printHeadStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {GRUPO_ORDER.map((key) => estructuraCalc.groups[key]).filter(Boolean).map((g) => (
            <tr key={g.label}>
              <td style={printCellStyle}>{g.label}</td>
              <td style={printCellStyleR}>{fmtCLP(g.totalIngresos)}</td>
              <td style={printCellStyleR}>{fmtCLP(g.totalGastos)}</td>
              <td style={printCellStyleR}>{fmtCLP(g.diferencia)}</td>
            </tr>
          ))}
          <tr>
            <td style={printCellStyle}>JUNJI</td>
            <td style={printCellStyleR}>{fmtCLP(estructuraCalc.junjiCalc.ingresos)}</td>
            <td style={printCellStyleR}>{fmtCLP(estructuraCalc.junjiCalc.totalGastos)}</td>
            <td style={printCellStyleR}>{fmtCLP(estructuraCalc.junjiCalc.diferencia)}</td>
          </tr>
          {APORTE_FISCAL_ORDER.map((key) => estructuraCalc.groups[key]).filter(Boolean).map((g) => (
            <tr key={g.label}>
              <td style={printCellStyle}>{g.label}</td>
              <td style={printCellStyleR}>{fmtCLP(g.totalIngresos)}</td>
              <td style={printCellStyleR}>{fmtCLP(g.totalGastos)}</td>
              <td style={printCellStyleR}>{fmtCLP(g.diferencia)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ fontWeight: 700 }}>
            <td style={printCellStyle}>Total Final</td>
            <td style={printCellStyleR}>{fmtCLP(estructuraCalc.ingresosFinal)}</td>
            <td style={printCellStyleR}>{fmtCLP(estructuraCalc.gastosFinal)}</td>
            <td style={printCellStyleR}>{fmtCLP(estructuraCalc.diferenciaFinal)}</td>
          </tr>
        </tfoot>
      </table>

      <h2 style={{ fontSize: 13, fontWeight: 700, margin: "16px 0 6px" }}>Registro de traspasos entre cuentas (REX)</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
        <thead>
          <tr>
            {["Fecha", "Proceso / Motivo", "Desde", "Hacia", "Monto", "N° REX"].map((h) => (
              <th key={h} style={{ ...printHeadStyle, textAlign: h === "Monto" ? "right" : "left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {estructura.sacados.map((s) => (
            <tr key={s.id}>
              <td style={printCellStyle}>{s.fecha || ""}</td>
              <td style={printCellStyle}>{s.proceso || ""}</td>
              <td style={printCellStyle}>{s.cuentaOrigen || ""}</td>
              <td style={printCellStyle}>{s.cuentaDestino || ""}</td>
              <td style={printCellStyleR}>{fmtCLP(s.monto)}</td>
              <td style={printCellStyle}>{s.rex || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6, padding: "6px 8px", border: "1px solid #999", fontSize: 11, fontWeight: 700 }}>
        <span>Subtotal traspasos registrados (REX)</span>
        <span>{fmtCLP(estructuraCalc.sacadosSum)}</span>
      </div>

      {(() => {
        const detailRows = buildEstructuraDetailRows(estructura);
        if (!detailRows.length) return null;
        const groups = groupDetailRowsBySubvencion(detailRows);
        return (
          <>
            <h2 style={{ fontSize: 13, fontWeight: 700, margin: "16px 0 6px" }}>Detalle de Ingresos y Gastos por subvención</h2>
            {groups.map((grp) => {
              const { ingresoRows, gastoRows, subtotalIngresos, subtotalGastos, diferencia } = splitIngresosGastos(grp.rows);
              return (
                <div key={grp.subvencion} style={{ marginBottom: 10, breakInside: "avoid" }}>
                  <h3 style={{ fontSize: 11, fontWeight: 700, margin: "6px 0 3px", color: "#014F86" }}>{grp.subvencion}</h3>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                    <thead>
                      <tr>
                        {["Tipo", "Fecha", "Concepto", "Monto"].map((h) => (
                          <th key={h} style={{ ...printHeadStyle, textAlign: h === "Monto" ? "right" : "left" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ingresoRows.map((e, i) => (
                        <tr key={"i" + i}>
                          <td style={printCellStyle}>{e.tipo}</td>
                          <td style={printCellStyle}>{e.fecha || ""}</td>
                          <td style={printCellStyle}>{e.concepto || ""}</td>
                          <td style={printCellStyleR}>{fmtCLP(e.monto)}</td>
                        </tr>
                      ))}
                      {ingresoRows.length > 0 && (
                        <tr style={{ fontWeight: 700 }}>
                          <td style={printCellStyle} colSpan={3}>Subtotal Ingresos {grp.subvencion}</td>
                          <td style={printCellStyleR}>{fmtCLP(subtotalIngresos)}</td>
                        </tr>
                      )}
                      {gastoRows.map((e, i) => (
                        <tr key={"g" + i}>
                          <td style={printCellStyle}>{e.tipo}</td>
                          <td style={printCellStyle}>{e.fecha || ""}</td>
                          <td style={printCellStyle}>{e.concepto || ""}</td>
                          <td style={printCellStyleR}>{fmtCLP(e.monto)}</td>
                        </tr>
                      ))}
                      {gastoRows.length > 0 && (
                        <tr style={{ fontWeight: 700 }}>
                          <td style={printCellStyle} colSpan={3}>Subtotal Gastos {grp.subvencion}</td>
                          <td style={printCellStyleR}>{fmtCLP(subtotalGastos)}</td>
                        </tr>
                      )}
                      <tr style={{ fontWeight: 700, borderTop: "1px solid #999" }}>
                        <td style={printCellStyle} colSpan={3}>Diferencia {grp.subvencion}</td>
                        <td style={printCellStyleR}>{fmtCLP(diferencia)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </>
        );
      })()}
    </div>
  );
}

export function PrintViewBitacora({ changeLog }) {
  return (
    <div className="only-print" style={{ fontFamily: "var(--font-sans)", color: "#111", padding: 24 }}>
      <PrintHeader title="Bitácora de movimientos" subtitle={`${changeLog.length} movimiento(s) registrados`} />
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9.5 }}>
        <thead>
          <tr>
            {["Fecha", "Sección", "Mes/Período", "Concepto", "Campo", "Antes", "Después", "Nota"].map((h) => (
              <th key={h} style={{ ...printHeadStyle, textAlign: "left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {changeLog.length === 0 && (
            <tr><td style={printCellStyle} colSpan={8}>Sin movimientos registrados.</td></tr>
          )}
          {changeLog.map((c) => (
            <tr key={c.id}>
              <td style={printCellStyle}>{c.tsLabel}</td>
              <td style={printCellStyle}>{c.section}</td>
              <td style={printCellStyle}>{c.mes}</td>
              <td style={printCellStyle}>{c.concepto}</td>
              <td style={printCellStyle}>{c.campo}</td>
              <td style={printCellStyleR}>{typeof c.oldVal === "number" ? c.oldVal.toLocaleString("es-CL") : c.oldVal}</td>
              <td style={printCellStyleR}>{typeof c.newVal === "number" ? c.newVal.toLocaleString("es-CL") : c.newVal}</td>
              <td style={printCellStyle}>{c.nota || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
