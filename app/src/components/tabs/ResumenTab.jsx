import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { COLORS } from "../../lib/colors";
import { fmtCLP, fmtNum } from "../../lib/format";
import { MONTHS, MONTHS_SHORT, FUENTE_DEFS } from "../../lib/calc";
import { Badge, DeficitTag, SectionIntro, TabToolbar, KpiCard } from "../ui/Primitives";

function MatrixTable({ title, months, monthTotals, field }) {
  const rowTotal = (fd) => months.reduce((s, i) => {
    const c = monthTotals[i].perFuente[fd.key];
    return s + (c[field] || 0);
  }, 0);
  const colTotal = (i) => FUENTE_DEFS.reduce((s, fd) => s + (monthTotals[i].perFuente[fd.key][field] || 0), 0);
  const grandTotal = months.reduce((s, i) => s + colTotal(i), 0);

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold mb-2" style={{ color: COLORS.navyDark }}>{title}</h3>
      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: COLORS.line }}>
        <table className="w-full text-xs border-collapse" style={{ minWidth: 900 }}>
          <thead>
            <tr style={{ background: COLORS.mist }}>
              <th className="th-cell text-left">Fuente</th>
              {months.map((i) => <th key={i} className="th-cell text-right">{MONTHS_SHORT[i]}</th>)}
              <th className="th-cell text-right" style={{ background: COLORS.mist }}>Total período</th>
            </tr>
          </thead>
          <tbody>
            {FUENTE_DEFS.map((fd) => (
              <tr key={fd.key} className="border-t" style={{ borderColor: COLORS.line }}>
                <td className="td-cell font-medium">{fd.label}</td>
                {months.map((i) => {
                  const v = monthTotals[i].perFuente[fd.key][field] || 0;
                  return (
                    <td key={i} className="td-cell text-right font-mono" style={field === "deficit" ? { color: v >= 0 ? COLORS.success : COLORS.danger } : {}}>
                      {fmtNum(v)}
                    </td>
                  );
                })}
                <td className="td-cell text-right font-mono font-semibold">{fmtNum(rowTotal(fd))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: COLORS.mist }}>
              <td className="td-cell font-bold">Totales</td>
              {months.map((i) => (
                <td key={i} className="td-cell text-right font-mono font-semibold">{fmtNum(colTotal(i))}</td>
              ))}
              <td className="td-cell text-right font-mono font-bold">{fmtNum(grandTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default function ResumenTab({ months, monthTotals, accumulated, corte, setCorte, onExcel, onPDF, onReport }) {
  const shown = Array.from({ length: corte }, (_, i) => i);

  const totalIngresos = shown.reduce((s, i) => s + monthTotals[i].ingresos, 0);
  const totalRemu = shown.reduce((s, i) => s + monthTotals[i].remuneraciones, 0);
  const totalDeficit = shown.reduce((s, i) => s + monthTotals[i].deficit, 0);
  const acumuladoFinal = accumulated[corte - 1];
  const mesesDeficit = shown.filter((i) => monthTotals[i].f16 < 0).length;

  const chartData = shown.map((i) => ({
    mes: MONTHS_SHORT[i],
    acumulado: Math.round(accumulated[i]),
    mensual: Math.round(monthTotals[i].f16),
  }));

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <SectionIntro
          title="Resumen ejecutivo"
          desc="Se recalcula automáticamente al editar cualquier mes. Usa el selector de corte para ver el acumulado hasta el mes que necesites informar."
        />
        <div className="flex items-center gap-3 flex-wrap shrink-0">
          <label className="text-xs font-medium flex items-center gap-1.5 shrink-0" style={{ color: COLORS.inkSoft }}>
            Ver hasta:
            <select
              value={corte}
              onChange={(e) => setCorte(Number(e.target.value))}
              className="text-sm font-semibold rounded-md border px-2 py-1"
              style={{ borderColor: COLORS.line, color: COLORS.navy }}
            >
              {MONTHS.map((m, i) => (<option key={m} value={i + 1}>{m}</option>))}
            </select>
          </label>
          <TabToolbar onExcel={onExcel} onPDF={onPDF} onReport={onReport} />
        </div>
      </div>

      <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <KpiCard label={`Ingresos totales (Ene–${MONTHS_SHORT[corte - 1]})`} value={fmtCLP(totalIngresos)} tone="navy" />
        <KpiCard label="Remuneraciones brutas" value={fmtCLP(totalRemu)} tone="neutral" />
        <KpiCard label="Déficit / Superávit del período" value={fmtCLP(totalDeficit)} tone={totalDeficit >= 0 ? "success" : "danger"} />
        <KpiCard label="Acumulado a corte" value={fmtCLP(acumuladoFinal)} tone={acumuladoFinal >= 0 ? "success" : "danger"} sub={`${mesesDeficit} de ${corte} meses en déficit`} />
      </div>

      <div className="card mb-5">
        <h3 className="card-title mb-3">Evolución del déficit / superávit acumulado</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.navy} stopOpacity={0.35} />
                <stop offset="95%" stopColor={COLORS.navy} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: COLORS.inkSoft }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: COLORS.inkSoft }} tickFormatter={(v) => (v / 1e6).toFixed(0) + "M"} axisLine={false} tickLine={false} width={48} />
            <Tooltip formatter={(v) => fmtCLP(v)} labelStyle={{ color: COLORS.ink }} contentStyle={{ borderRadius: 8, border: `1px solid ${COLORS.line}`, fontSize: 12 }} />
            <ReferenceLine y={0} stroke={COLORS.inkSoft} strokeDasharray="2 2" />
            <Area type="monotone" dataKey="acumulado" stroke={COLORS.navy} fill="url(#accGrad)" strokeWidth={2} name="Acumulado" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto rounded-xl border mb-6" style={{ borderColor: COLORS.line }}>
        <table className="w-full text-sm border-collapse" style={{ minWidth: 920 }}>
          <thead>
            <tr style={{ background: COLORS.mist }}>
              <th className="th-cell text-left">Mes</th>
              <th className="th-cell text-left">Estado</th>
              <th className="th-cell text-right">Ingresos Totales</th>
              <th className="th-cell text-right">Saldo Sub. 22/29</th>
              <th className="th-cell text-right">Saldo Remuneraciones (A)</th>
              <th className="th-cell text-right">Remuneraciones (B)</th>
              <th className="th-cell text-right">Déficit/Superávit (A-B)</th>
              <th className="th-cell text-right">Acumulado</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((i) => {
              const mt = monthTotals[i];
              return (
                <tr key={i} className="border-t" style={{ borderColor: COLORS.line }}>
                  <td className="td-cell font-medium">{MONTHS[i]}</td>
                  <td className="td-cell"><Badge tone={mt.tipo === "Real" ? "navy" : "warning"}>{mt.tipo}</Badge></td>
                  <td className="td-cell text-right font-mono">{fmtCLP(mt.ingresos)}</td>
                  <td className="td-cell text-right font-mono">{fmtCLP(mt.saldoSub)}</td>
                  <td className="td-cell text-right font-mono">{fmtCLP(mt.saldoRemu)}</td>
                  <td className="td-cell text-right font-mono">{fmtCLP(mt.remuneraciones)}</td>
                  <td className="td-cell text-right"><DeficitTag value={mt.deficit} small /></td>
                  <td className="td-cell text-right"><DeficitTag value={accumulated[i]} small /></td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: COLORS.mist }}>
              <td className="td-cell font-bold" colSpan={2}>Totales del período</td>
              <td className="td-cell text-right font-mono font-semibold">{fmtCLP(totalIngresos)}</td>
              <td className="td-cell text-right font-mono font-semibold">{fmtCLP(shown.reduce((s, i) => s + monthTotals[i].saldoSub, 0))}</td>
              <td className="td-cell text-right font-mono font-semibold">{fmtCLP(shown.reduce((s, i) => s + monthTotals[i].saldoRemu, 0))}</td>
              <td className="td-cell text-right font-mono font-semibold">{fmtCLP(totalRemu)}</td>
              <td className="td-cell text-right"><DeficitTag value={totalDeficit} /></td>
              <td className="td-cell text-right"><DeficitTag value={acumuladoFinal} /></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <MatrixTable title="1. Ingresos por fuente y mes" months={shown} monthTotals={monthTotals} field="ingresos" />
      <MatrixTable title="2. Gastos (remuneraciones) por fuente y mes" months={shown} monthTotals={monthTotals} field="remuneraciones" />
      <MatrixTable title="3. Déficit / superávit por fuente y mes" months={shown} monthTotals={monthTotals} field="deficit" />
    </div>
  );
}
