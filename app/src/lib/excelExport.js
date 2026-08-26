import * as XLSX from "xlsx";
import { MONTHS, MONTHS_SHORT, FUENTE_DEFS, GRUPO_ORDER, APORTE_FISCAL_KEY, buildEstructuraDetailRows } from "./calc";

/* -------------------------------- Excel: hojas (AOA) ------------------------------ */
/* Portado 1:1 desde reference/dashboard_deficit_slep_petorca_1.jsx */

function monthSheetAOA(monthIdx, monthData, monthTotal) {
  const aoa = [];
  aoa.push([`Análisis de Necesidad de Financiamiento Remuneraciones P02 - ${MONTHS[monthIdx]} 2026`]);
  aoa.push(["SLEP Petorca"]);
  aoa.push([]);
  aoa.push(["Fuente de Financiamiento", "Ingresos Totales", "Saldo para Sub22 y 29", "Saldo para Remuneraciones (A)", `Remuneraciones Brutas ${monthData.tipo === "Real" ? "Reales" : "Proyectadas"}`, "Déficit/Superávit (A-B)", "Observaciones", "% Resguardo"]);
  FUENTE_DEFS.forEach((fd) => {
    const c = monthTotal.perFuente[fd.key];
    const raw = monthData[fd.key] || {};
    aoa.push([fd.label, c.ingresos, c.saldoSub, c.saldoRemu, c.remuneraciones, c.deficit, raw.obs || "", c.ingresos ? c.saldoSub / c.ingresos : 0]);
  });
  aoa.push(["Totales", monthTotal.ingresos, monthTotal.saldoSub, monthTotal.saldoRemu, monthTotal.remuneraciones, monthTotal.deficit, "Suma de déficit en SG y JUNJI", monthTotal.ingresos ? monthTotal.saldoSub / monthTotal.ingresos : 0]);
  aoa.push([]);
  aoa.push(["", "", "", "", "Saldo FAEP para REMU", monthTotal.ajusteFAEP]);
  aoa.push(["", "", "", "", "Saldo FIGA", monthTotal.ajusteFIGA]);
  aoa.push(["", "", "", "", "Déficit Líquidos (informativo)", monthTotal.deficitLiquidos]);
  aoa.push(["", "", "", "", "Déficit Total", monthTotal.f16]);

  const anyDetalle = FUENTE_DEFS.some((fd) => {
    const raw = monthData[fd.key] || {};
    return (raw.ingresosDetalle || []).length || (raw.remuneracionesDetalle || []).length;
  });
  if (anyDetalle) {
    aoa.push([]);
    aoa.push(["Detalle de Ingresos y Remuneraciones"]);
    aoa.push(["Fuente", "Tipo", "Fecha", "Concepto", "Monto"]);
    FUENTE_DEFS.forEach((fd) => {
      const raw = monthData[fd.key] || {};
      (raw.ingresosDetalle || []).forEach((e) => aoa.push([fd.label, "Ingreso", e.fecha || "", e.concepto || "", e.monto || 0]));
      (raw.remuneracionesDetalle || []).forEach((e) => aoa.push([fd.label, "Remuneraciones", e.fecha || "", e.concepto || "", e.monto || 0]));
    });
  }
  return aoa;
}

function resumenSheetAOA(months, monthTotals, accumulated, corte) {
  const shown = Array.from({ length: corte }, (_, i) => i);
  const aoa = [];
  aoa.push(["Resumen Ejecutivo - Necesidad de Financiamiento Remuneraciones P02 2026"]);
  aoa.push(["SLEP Petorca — corte a " + MONTHS[corte - 1]]);
  aoa.push([]);
  aoa.push(["Mes", "Estado", "Ingresos Totales", "Saldo Sub22 y 29", "Saldo para Remuneraciones (A)", "Remuneraciones Brutas (B)", "Déficit/Superávit (A-B)", "Déficit/Superávit Acumulado"]);
  shown.forEach((i) => {
    const mt = monthTotals[i];
    aoa.push([MONTHS[i], mt.tipo, mt.ingresos, mt.saldoSub, mt.saldoRemu, mt.remuneraciones, mt.deficit, accumulated[i]]);
  });
  aoa.push([]);
  [
    ["1. INGRESOS por Fuente y Mes", "ingresos"],
    ["2. GASTOS (Remuneraciones) por Fuente y Mes", "remuneraciones"],
    ["3. DEFICIT / SUPERAVIT por Fuente y Mes", "deficit"],
  ].forEach(([title, field]) => {
    aoa.push([title]);
    aoa.push(["Fuente", ...shown.map((i) => MONTHS_SHORT[i]), "Total Período"]);
    FUENTE_DEFS.forEach((fd) => {
      const row = [fd.label];
      let tot = 0;
      shown.forEach((i) => {
        const v = monthTotals[i].perFuente[fd.key][field] || 0;
        row.push(v);
        tot += v;
      });
      row.push(tot);
      aoa.push(row);
    });
    const totRow = ["Totales"];
    let grand = 0;
    shown.forEach((i) => {
      const v = FUENTE_DEFS.reduce((s, fd) => s + (monthTotals[i].perFuente[fd.key][field] || 0), 0);
      totRow.push(v);
      grand += v;
    });
    totRow.push(grand);
    aoa.push(totRow);
    aoa.push([]);
  });
  return aoa;
}

function estructuraSheetAOA(estructura, estructuraCalc) {
  const aoa = [];
  aoa.push(["Estructura de Déficit — Traspasos entre cuentas corrientes"]);
  aoa.push(["Período: " + estructura.periodo]);
  aoa.push([]);
  aoa.push(["Subvención", "Ingresos", "Gasto Remuneraciones", "Gasto Subt. 22 y 29", "Total Gastos", "Diferencia", "Incluida en Total Final"]);
  GRUPO_ORDER.forEach((key) => {
    const g = estructuraCalc.groups[key];
    if (!g) return;
    aoa.push([g.label, g.totalIngresos, g.totalGastoRemu, g.gastoST2229, g.totalGastos, g.diferencia, g.incluirTotal ? "Sí" : "No"]);
    if (g.cd) {
      aoa.push(["  ↳ Carrera Docente", g.cdIngresos, g.cdGasto, "", "", g.cdDeficit, ""]);
    }
  });
  const jc = estructuraCalc.junjiCalc;
  aoa.push(["JUNJI", jc.ingresos, jc.gasto, estructura.junji.gastoST2229, jc.totalGastos, jc.diferencia, estructura.junji.incluirTotal ? "Sí" : "No"]);
  aoa.push(["  Total JUNJI", jc.ingresos, jc.gasto, estructura.junji.gastoST2229, jc.totalGastos, jc.diferencia, ""]);

  const af = estructuraCalc.groups[APORTE_FISCAL_KEY];
  if (af) {
    aoa.push([af.label, af.totalIngresos, af.totalGastoRemu, af.gastoST2229, af.totalGastos, af.diferencia, af.incluirTotal ? "Sí" : "No"]);
  }
  aoa.push([]);
  aoa.push(["Total Final", estructuraCalc.ingresosFinal, estructuraCalc.gastoRemuFinal, estructuraCalc.st2229Final, estructuraCalc.gastosFinal, estructuraCalc.diferenciaFinal, ""]);
  aoa.push([]);
  aoa.push(["Registro de traspasos entre cuentas (REX)"]);
  aoa.push(["Fecha", "Proceso / Motivo", "Cuenta Origen (Desde)", "Cuenta Destino (Hacia)", "Monto", "N° REX"]);
  estructura.sacados.forEach((s) => aoa.push([s.fecha || "", s.proceso || "", s.cuentaOrigen || "", s.cuentaDestino || "", s.monto, s.rex || ""]));
  aoa.push([]);
  aoa.push(["Déficit acumulado periodo de análisis", "", "", "", "", estructuraCalc.deficitAcumuladoAPedir]);

  const detailRows = buildEstructuraDetailRows(estructura);
  if (detailRows.length) {
    aoa.push([]);
    aoa.push(["Detalle de Ingresos y Gastos por subvención"]);
    aoa.push(["Subvención", "Tipo", "Fecha", "Concepto", "Monto"]);
    detailRows.forEach((e) => aoa.push([e.subvencion, e.tipo, e.fecha || "", e.concepto || "", e.monto || 0]));
  }
  return aoa;
}

function bitacoraSheetAOA(changeLog) {
  const aoa = [["Fecha", "Sección", "Mes / Período", "Concepto", "Campo", "Valor anterior", "Valor nuevo", "Nota", "Reportado"]];
  changeLog.forEach((c) => {
    aoa.push([c.tsLabel, c.section, c.mes, c.concepto, c.campo, c.oldVal, c.newVal, c.nota || "", c.reportado ? "Sí" : "No"]);
  });
  return aoa;
}

/* -------------------------------- Excel: exportación independiente por pestaña ------------------------------ */

export function exportDatosMensualExcel(monthIdx, monthData, monthTotal) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(monthSheetAOA(monthIdx, monthData, monthTotal));
  ws["!cols"] = [{ wch: 24 }, { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 30 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws, MONTHS_SHORT[monthIdx] + " " + (monthIdx + 1));
  XLSX.writeFile(wb, `SLEP_Petorca_${MONTHS[monthIdx]}2026.xlsx`);
}

export function exportResumenExcel(months, monthTotals, accumulated, corte) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(resumenSheetAOA(months, monthTotals, accumulated, corte));
  ws["!cols"] = [{ wch: 26 }, ...Array(13).fill({ wch: 14 })];
  XLSX.utils.book_append_sheet(wb, ws, "Resumen");
  XLSX.writeFile(wb, `SLEP_Petorca_Resumen_${MONTHS[corte - 1]}2026.xlsx`);
}

export function exportEstructuraExcel(estructura, estructuraCalc) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(estructuraSheetAOA(estructura, estructuraCalc));
  ws["!cols"] = [{ wch: 28 }, { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws, "Estructura Deficit");
  XLSX.writeFile(wb, "SLEP_Petorca_Traspasos_Cuentas.xlsx");
}

export function exportBitacoraExcel(changeLog) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(bitacoraSheetAOA(changeLog));
  ws["!cols"] = [{ wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 22 }, { wch: 22 }, { wch: 16 }, { wch: 16 }, { wch: 30 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws, "Bitacora");
  XLSX.writeFile(wb, "SLEP_Petorca_Bitacora_Movimientos.xlsx");
}
