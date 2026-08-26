import { RotateCcw, Info } from "lucide-react";
import { COLORS } from "../../lib/colors";
import { fmtCLP, fmtNum, fmtPct } from "../../lib/format";
import { MONTHS, MONTHS_SHORT, FUENTE_DEFS } from "../../lib/calc";
import { EditableCell, TextCell, DeficitTag, FieldBlock, SectionIntro, TabToolbar, AmountCell } from "../ui/Primitives";

function MonthPicker({ months, monthTotals, selectedMonth, setSelectedMonth }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-4" style={{ scrollbarWidth: "thin" }}>
      {MONTHS.map((m, i) => {
        const active = i === selectedMonth;
        const mt = monthTotals[i];
        const proyectado = months[i].tipo === "Proyectado";
        const positive = mt.f16 >= 0;
        return (
          <button
            key={m}
            onClick={() => setSelectedMonth(i)}
            className="shrink-0 rounded-lg px-3 py-2 text-left transition-all"
            style={{
              minWidth: 92,
              background: active ? COLORS.navy : "#fff",
              border: `1px solid ${active ? COLORS.navy : COLORS.line}`,
              boxShadow: active ? "0 2px 6px rgba(1,79,134,0.25)" : "none",
            }}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold" style={{ color: active ? "#fff" : COLORS.ink }}>{MONTHS_SHORT[i]}</span>
              {proyectado && (
                <span
                  className="text-[8px] font-bold uppercase px-1 rounded"
                  style={{ background: active ? "rgba(255,255,255,0.25)" : COLORS.warningBg, color: active ? "#fff" : COLORS.warning }}
                >
                  proy
                </span>
              )}
            </div>
            <div
              className="text-[10px] font-mono mt-0.5"
              style={{ color: active ? "rgba(255,255,255,0.85)" : positive ? COLORS.success : COLORS.danger }}
            >
              {fmtCLP(mt.f16)}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function FuenteTable({ monthIdx, monthData, monthTotal, updateFuenteField, updateFuenteObs, onOpenDetalle }) {
  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: COLORS.line }}>
      <table className="w-full text-sm border-collapse" style={{ minWidth: 1080 }}>
        <thead>
          <tr style={{ background: COLORS.mist }}>
            <th className="th-cell text-left" style={{ minWidth: 170 }}>Fuente de Financiamiento</th>
            <th className="th-cell text-right">Ingresos Totales</th>
            <th className="th-cell text-right">Saldo Sub. 22 y 29</th>
            <th className="th-cell text-right">Saldo p/ Remuneraciones (A)</th>
            <th className="th-cell text-right">Remuneraciones Brutas (B)</th>
            <th className="th-cell text-right">Déficit / Superávit (A-B)</th>
            <th className="th-cell text-right">% Resguardo</th>
            <th className="th-cell text-left" style={{ minWidth: 220 }}>Observaciones</th>
          </tr>
        </thead>
        <tbody>
          {FUENTE_DEFS.map((fd) => {
            const raw = monthData[fd.key] || {};
            const c = monthTotal.perFuente[fd.key];
            const pct = c.ingresos ? c.saldoSub / c.ingresos : 0;
            return (
              <tr key={fd.key} className="border-t" style={{ borderColor: COLORS.line }}>
                <td className="td-cell font-medium" style={{ color: COLORS.navyDark }}>{fd.label}</td>
                <td className="td-cell text-right">
                  <AmountCell
                    value={raw.ingresos || 0}
                    onCommit={(v) => updateFuenteField(monthIdx, fd.key, "ingresos", v)}
                    detalleCount={(raw.ingresosDetalle || []).length}
                    onOpenDetalle={() => onOpenDetalle(monthIdx, fd.key, "ingresos", fd.label)}
                  />
                </td>
                <td className="td-cell text-right">
                  {fd.mode === "standard" ? (
                    <EditableCell value={raw.saldoSub || 0} onCommit={(v) => updateFuenteField(monthIdx, fd.key, "saldoSub", v)} />
                  ) : (
                    <span className="computed-value">{fmtNum(c.saldoSub)}</span>
                  )}
                </td>
                <td className="td-cell text-right">
                  {fd.mode === "sep" ? (
                    <EditableCell value={raw.saldoParaRemu || 0} onCommit={(v) => updateFuenteField(monthIdx, fd.key, "saldoParaRemu", v)} />
                  ) : (
                    <span className="computed-value">{fmtNum(c.saldoRemu)}</span>
                  )}
                </td>
                <td className="td-cell text-right">
                  {fd.mode === "prorretencion" ? (
                    <span className="computed-value">—</span>
                  ) : (
                    <AmountCell
                      value={raw.remuneraciones || 0}
                      onCommit={(v) => updateFuenteField(monthIdx, fd.key, "remuneraciones", v)}
                      detalleCount={(raw.remuneracionesDetalle || []).length}
                      onOpenDetalle={() => onOpenDetalle(monthIdx, fd.key, "remuneraciones", fd.label)}
                    />
                  )}
                </td>
                <td className="td-cell text-right"><DeficitTag value={c.deficit} small /></td>
                <td className="td-cell text-right font-mono text-xs" style={{ color: COLORS.inkSoft }}>{fmtPct(pct)}</td>
                <td className="td-cell">
                  <TextCell value={raw.obs} onCommit={(v) => updateFuenteObs(monthIdx, fd.key, v)} width={220} placeholder="—" />
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: COLORS.mist }}>
            <td className="td-cell font-bold" style={{ color: COLORS.navyDark }}>Totales</td>
            <td className="td-cell text-right font-mono font-semibold">{fmtCLP(monthTotal.ingresos)}</td>
            <td className="td-cell text-right font-mono font-semibold">{fmtCLP(monthTotal.saldoSub)}</td>
            <td className="td-cell text-right font-mono font-semibold">{fmtCLP(monthTotal.saldoRemu)}</td>
            <td className="td-cell text-right font-mono font-semibold">{fmtCLP(monthTotal.remuneraciones)}</td>
            <td className="td-cell text-right"><DeficitTag value={monthTotal.deficit} /></td>
            <td className="td-cell text-right font-mono text-xs">{fmtPct(monthTotal.resguardoPct)}</td>
            <td className="td-cell text-xs" style={{ color: COLORS.inkSoft }}>Suma de déficit en SG y JUNJI</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function AjustesPanel({ monthIdx, months, monthTotal, accumulated, updateMonthMeta, aplicarPromedioReal }) {
  const monthData = months[monthIdx];
  const isProyectado = monthData.tipo === "Proyectado";
  return (
    <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="card-title">Ajustes del mes</h3>
          <div className="flex items-center gap-2">
            <button
              className={"toggle-pill " + (monthData.tipo === "Real" ? "toggle-pill-active" : "")}
              onClick={() => updateMonthMeta(monthIdx, "tipo", "Real")}
            >
              Real
            </button>
            <button
              className={"toggle-pill " + (isProyectado ? "toggle-pill-active-warn" : "")}
              onClick={() => updateMonthMeta(monthIdx, "tipo", "Proyectado")}
            >
              Proyectado
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <FieldBlock label="Saldo FAEP para REMU">
            <EditableCell value={monthData.ajusteFAEP || 0} onCommit={(v) => updateMonthMeta(monthIdx, "ajusteFAEP", v)} width="100%" />
          </FieldBlock>
          <FieldBlock label="Saldo FIGA">
            <EditableCell value={monthData.ajusteFIGA || 0} onCommit={(v) => updateMonthMeta(monthIdx, "ajusteFIGA", v)} width="100%" />
          </FieldBlock>
          <FieldBlock label="Déficit Líquidos (informativo)">
            <EditableCell value={monthData.deficitLiquidos || 0} onCommit={(v) => updateMonthMeta(monthIdx, "deficitLiquidos", v)} width="100%" />
          </FieldBlock>
        </div>
        {isProyectado && (
          <button
            className="btn-secondary mt-3"
            onClick={() => aplicarPromedioReal(monthIdx)}
          >
            <RotateCcw size={13} /> Recalcular con promedio de los últimos 3 meses reales
          </button>
        )}
      </div>

      <div className="card flex flex-col justify-between">
        <div>
          <h3 className="card-title mb-3">Resultado del mes</h3>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs" style={{ color: COLORS.inkSoft }}>Déficit / Superávit Total (F16)</span>
            <DeficitTag value={monthTotal.f16} />
          </div>
          <div className="flex items-center justify-between py-1.5 border-t" style={{ borderColor: COLORS.line }}>
            <span className="text-xs font-semibold" style={{ color: COLORS.inkSoft }}>Déficit / Superávit Acumulado</span>
            <DeficitTag value={accumulated[monthIdx]} />
          </div>
        </div>
        <div className="mt-2 text-[11px] leading-snug" style={{ color: COLORS.inkSoft }}>
          Acumulado = acumulado del mes anterior + resultado de este mes (Déficit del mes + ajustes FAEP/FIGA).
        </div>
      </div>
    </div>
  );
}

function EneroDetallePanel({ eneroDetalle, updateEneroDetalle }) {
  const saldoPostRendicion = eneroDetalle.totalFAEP - eneroDetalle.cuotaEducacion - eneroDetalle.cuotaJardines;
  const st22Jardines = eneroDetalle.totalFAEP * 0.2;
  const saldoARendir2da = saldoPostRendicion - st22Jardines;
  const sumaEducacion = eneroDetalle.abrilEducacion + eneroDetalle.faepAGeneral;
  const poderRendirCalc = saldoARendir2da - sumaEducacion;
  const diferencia = eneroDetalle.poderRendirJunjiReal - poderRendirCalc;

  return (
    <div className="card mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Info size={14} color={COLORS.navy} />
        <h3 className="card-title">Detalle FAEP — Enero (rendición JUNJI 2da parte)</h3>
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <FieldBlock label="Total FAEP">
          <EditableCell value={eneroDetalle.totalFAEP} onCommit={(v) => updateEneroDetalle("totalFAEP", v)} width="100%" />
        </FieldBlock>
        <FieldBlock label="Cuota Educación">
          <EditableCell value={eneroDetalle.cuotaEducacion} onCommit={(v) => updateEneroDetalle("cuotaEducacion", v)} width="100%" />
        </FieldBlock>
        <FieldBlock label="Cuota Jardines">
          <EditableCell value={eneroDetalle.cuotaJardines} onCommit={(v) => updateEneroDetalle("cuotaJardines", v)} width="100%" />
        </FieldBlock>
        <FieldBlock label="Saldo post rendición REMU">
          <div className="computed-value w-full">{fmtNum(saldoPostRendicion)}</div>
        </FieldBlock>
        <FieldBlock label="ST22 Jardines (20%)">
          <div className="computed-value w-full">{fmtNum(st22Jardines)}</div>
        </FieldBlock>
        <FieldBlock label="Saldo a rendir REMU 2da parte">
          <div className="computed-value w-full">{fmtNum(saldoARendir2da)}</div>
        </FieldBlock>
        <FieldBlock label="Abril a Educación">
          <EditableCell value={eneroDetalle.abrilEducacion} onCommit={(v) => updateEneroDetalle("abrilEducacion", v)} width="100%" />
        </FieldBlock>
        <FieldBlock label="FAEP a General">
          <EditableCell value={eneroDetalle.faepAGeneral} onCommit={(v) => updateEneroDetalle("faepAGeneral", v)} width="100%" />
        </FieldBlock>
        <FieldBlock label="Poder rendir en JUNJI (calculado)">
          <div className="computed-value w-full">{fmtNum(poderRendirCalc)}</div>
        </FieldBlock>
        <FieldBlock label="Poder rendir en JUNJI (real / oficio)">
          <EditableCell value={eneroDetalle.poderRendirJunjiReal} onCommit={(v) => updateEneroDetalle("poderRendirJunjiReal", v)} width="100%" />
        </FieldBlock>
        <FieldBlock label="Diferencia (real − calculado)">
          <div className="computed-value w-full" style={{ color: diferencia === 0 ? COLORS.success : COLORS.danger }}>{fmtNum(diferencia)}</div>
        </FieldBlock>
      </div>
    </div>
  );
}

export default function DatosMensualesTab({
  months, monthTotals, accumulated, selectedMonth, setSelectedMonth,
  updateFuenteField, updateFuenteObs, updateMonthMeta, aplicarPromedioReal,
  eneroDetalle, updateEneroDetalle, onExcel, onPDF, onReport, onOpenDetalle,
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <SectionIntro
          title="Datos mensuales por fuente de financiamiento"
          desc="Estos son los mismos datos y fórmulas de la planilla original (ingresos, saldo para Subt. 22 y 29, remuneraciones). Edita cualquier celda, o usa el ícono de lista junto a Ingresos/Remuneraciones para desglosar el monto por fecha y concepto. El Resumen, la Estructura de Déficit y el resto del dashboard se recalculan solos."
        />
        <TabToolbar onExcel={onExcel} onPDF={onPDF} onReport={onReport} />
      </div>
      <MonthPicker months={months} monthTotals={monthTotals} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
      <FuenteTable
        monthIdx={selectedMonth}
        monthData={months[selectedMonth]}
        monthTotal={monthTotals[selectedMonth]}
        updateFuenteField={updateFuenteField}
        updateFuenteObs={updateFuenteObs}
        onOpenDetalle={onOpenDetalle}
      />
      <AjustesPanel
        monthIdx={selectedMonth}
        months={months}
        monthTotal={monthTotals[selectedMonth]}
        accumulated={accumulated}
        updateMonthMeta={updateMonthMeta}
        aplicarPromedioReal={aplicarPromedioReal}
      />
      {selectedMonth === 0 && (
        <EneroDetallePanel eneroDetalle={eneroDetalle} updateEneroDetalle={updateEneroDetalle} />
      )}
    </div>
  );
}
