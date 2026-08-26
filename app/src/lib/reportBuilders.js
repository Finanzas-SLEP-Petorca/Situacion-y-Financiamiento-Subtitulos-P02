import { fmtCLP, nowStamp } from "./format";
import { MONTHS, MONTHS_SHORT, FUENTE_DEFS } from "./calc";

/* ------------------------- Reportes por correo (narrativos) ------------------------- */
/* Portado 1:1 desde reference/dashboard_deficit_slep_petorca_1.jsx */

export function buildDatosMensualReport({ monthIdx, monthData, monthTotal, accumulated }) {
  const subject = `Situación de remuneraciones — ${MONTHS[monthIdx]} 2026${monthData.tipo === "Proyectado" ? " (proyectado)" : ""}`;
  const lines = [];
  lines.push("Estimados Paulina y Javier,");
  lines.push("");
  lines.push(`Junto con saludar, informo la situación de financiamiento de remuneraciones (Programa 02) de ${MONTHS[monthIdx]} 2026${monthData.tipo === "Proyectado" ? ", en base a una proyección" : ""}:`);
  lines.push("");
  FUENTE_DEFS.forEach((fd) => {
    const c = monthTotal.perFuente[fd.key];
    if (!c.ingresos && !c.remuneraciones) return;
    const estado = c.deficit >= 0 ? "superávit" : "déficit";
    lines.push(`- ${fd.label}: ingresos ${fmtCLP(c.ingresos)}, remuneraciones ${fmtCLP(c.remuneraciones)} → ${estado} de ${fmtCLP(Math.abs(c.deficit))}`);
  });
  lines.push("");
  lines.push(`Resultado del mes: ${fmtCLP(monthTotal.f16)}.`);
  lines.push(`Déficit/Superávit acumulado a ${MONTHS[monthIdx]}: ${fmtCLP(accumulated[monthIdx])}.`);
  if (monthIdx > 0) {
    const variacion = accumulated[monthIdx] - accumulated[monthIdx - 1];
    lines.push(`Variación respecto al acumulado de ${MONTHS[monthIdx - 1]}: ${variacion >= 0 ? "+" : ""}${fmtCLP(variacion)}.`);
  }
  const fuentesDeficit = FUENTE_DEFS.filter((fd) => monthTotal.perFuente[fd.key].deficit < 0).map((fd) => fd.label);
  if (fuentesDeficit.length) {
    lines.push("");
    lines.push(`Fuentes con déficit este mes: ${fuentesDeficit.join(", ")}.`);
  }
  lines.push("");
  lines.push("Quedo atento a cualquier consulta.");
  lines.push("");
  lines.push("Saluda atentamente,");
  lines.push("Wilson Rojas Abarca");
  lines.push("Encargado de Finanzas — Servicio Local de Educación Pública de Petorca");
  return { subject, body: lines.join("\n") };
}

export function buildResumenReport({ corte, monthTotals, accumulated }) {
  const shown = Array.from({ length: corte }, (_, i) => i);
  const totalIngresos = shown.reduce((s, i) => s + monthTotals[i].ingresos, 0);
  const totalRemu = shown.reduce((s, i) => s + monthTotals[i].remuneraciones, 0);
  const totalDeficit = shown.reduce((s, i) => s + monthTotals[i].deficit, 0);
  const acumuladoFinal = accumulated[corte - 1];
  const mesesDeficit = shown.filter((i) => monthTotals[i].f16 < 0).length;
  const peorMesIdx = shown.reduce((worst, i) => (monthTotals[i].f16 < monthTotals[worst].f16 ? i : worst), 0);

  const subject = `Resumen ejecutivo situación de déficit — corte a ${MONTHS[corte - 1]} 2026`;
  const lines = [];
  lines.push("Estimados Paulina y Javier,");
  lines.push("");
  lines.push(`Junto con saludar, comparto el resumen ejecutivo de la situación de financiamiento de remuneraciones (Programa 02), con corte a ${MONTHS[corte - 1]} 2026:`);
  lines.push("");
  lines.push(`- Ingresos totales del período (Ene–${MONTHS_SHORT[corte - 1]}): ${fmtCLP(totalIngresos)}`);
  lines.push(`- Remuneraciones brutas del período: ${fmtCLP(totalRemu)}`);
  lines.push(`- Déficit/Superávit del período: ${fmtCLP(totalDeficit)}`);
  lines.push(`- Déficit/Superávit acumulado a ${MONTHS[corte - 1]}: ${fmtCLP(acumuladoFinal)}`);
  lines.push(`- Meses en déficit dentro del período: ${mesesDeficit} de ${corte}`);
  if (monthTotals[peorMesIdx].f16 < 0) {
    lines.push(`- Mes con mayor déficit: ${MONTHS[peorMesIdx]} (${fmtCLP(monthTotals[peorMesIdx].f16)})`);
  }
  lines.push("");
  lines.push(
    acumuladoFinal < 0
      ? "La situación acumulada continúa en déficit; quedo disponible para revisar en conjunto las alternativas de financiamiento."
      : "La situación acumulada se mantiene en superávit a la fecha de corte."
  );
  lines.push("");
  lines.push("Saluda atentamente,");
  lines.push("Wilson Rojas Abarca");
  lines.push("Encargado de Finanzas — Servicio Local de Educación Pública de Petorca");
  return { subject, body: lines.join("\n") };
}

export function buildEstructuraReport({ estructura, estructuraCalc }) {
  const subject = `Propuesta de traspaso entre cuentas corrientes (REX) — ${estructura.periodo}`;
  const lines = [];
  lines.push("Estimados Paulina y Javier,");
  lines.push("");
  lines.push(`Junto con saludar, remito los antecedentes para fundamentar la Resolución Exenta (REX) de traspaso de fondos entre cuentas corrientes, correspondiente al período ${estructura.periodo}:`);
  lines.push("");
  Object.values(estructuraCalc.groups).forEach((g) => {
    const estado = g.diferencia >= 0 ? "saldo disponible" : "déficit";
    lines.push(`- ${g.label}: ${estado} de ${fmtCLP(Math.abs(g.diferencia))}${g.incluirTotal ? "" : " (no incluida en el total final)"}`);
  });
  const jc = estructuraCalc.junjiCalc;
  lines.push(`- JUNJI: ${jc.diferencia >= 0 ? "saldo disponible" : "déficit"} de ${fmtCLP(Math.abs(jc.diferencia))}${estructura.junji.incluirTotal ? "" : " (no incluida en el total final)"}`);
  lines.push("");
  lines.push(`Diferencia Total Final: ${fmtCLP(estructuraCalc.diferenciaFinal)}`);
  if (estructura.sacados.length) {
    lines.push("");
    lines.push("Traspasos ya registrados entre cuentas:");
    estructura.sacados.forEach((s) => {
      lines.push(`- ${s.fecha || "s/fecha"} — ${s.proceso || "s/proceso"}: ${s.cuentaOrigen || "?"} → ${s.cuentaDestino || "?"}, ${fmtCLP(s.monto)} (${s.rex || "sin REX"})`);
    });
    lines.push(`Subtotal traspasos: ${fmtCLP(estructuraCalc.sacadosSum)}`);
  }
  lines.push("");
  lines.push(`Déficit acumulado total a pedir en oficio: ${fmtCLP(estructuraCalc.deficitAcumuladoAPedir)}`);
  lines.push("");
  lines.push("Quedo atento a sus comentarios para tramitar la resolución correspondiente.");
  lines.push("");
  lines.push("Saluda atentamente,");
  lines.push("Wilson Rojas Abarca");
  lines.push("Encargado de Finanzas — Servicio Local de Educación Pública de Petorca");
  return { subject, body: lines.join("\n") };
}

export function buildBitacoraReport({ changes }) {
  const subject = `Movimientos registrados — ${nowStamp()}`;
  const lines = [];
  lines.push("Estimados Paulina y Javier,");
  lines.push("");
  lines.push("Junto con saludar, informo los siguientes movimientos registrados en el dashboard de Situación de Déficit / Financiamiento de Remuneraciones:");
  lines.push("");
  if (!changes.length) {
    lines.push("(Sin movimientos nuevos pendientes de reportar)");
  } else {
    changes.forEach((c, idx) => {
      const before = typeof c.oldVal === "number" ? fmtCLP(c.oldVal) : c.oldVal;
      const after = typeof c.newVal === "number" ? fmtCLP(c.newVal) : c.newVal;
      lines.push(`${idx + 1}. [${c.section}] ${c.mes} — ${c.concepto} / ${c.campo}: ${before} → ${after}${c.nota ? "  — " + c.nota : ""}`);
    });
  }
  lines.push("");
  lines.push("Quedo atento a cualquier consulta.");
  lines.push("");
  lines.push("Saluda atentamente,");
  lines.push("Wilson Rojas Abarca");
  lines.push("Encargado de Finanzas — Servicio Local de Educación Pública de Petorca");
  return { subject, body: lines.join("\n") };
}
