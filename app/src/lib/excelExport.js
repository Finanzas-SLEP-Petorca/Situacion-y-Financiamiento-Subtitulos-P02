import ExcelJS from "exceljs";
import {
  MONTHS, MONTHS_SHORT, FUENTE_DEFS, GRUPO_ORDER, APORTE_FISCAL_KEY,
  buildEstructuraDetailRows, groupDetailRowsBySubvencion, splitIngresosGastos,
} from "./calc";
import { buildFileName, nowStamp } from "./format";

/* -------------------------------- Excel: estilos compartidos ------------------------------ */
/* Antes se armaban hojas planas (arreglo de arreglos) con la librería "xlsx", que en su
   versión gratuita no escribe estilos — de ahí que el Excel exportado se viera desalineado
   y sin formato de tabla real. Ahora se usa "exceljs" para dar bordes, encabezados con
   color, negritas en subtotales y formato de moneda, replicando la estructura del PDF. */

const NAVY = "FF014F86";
const MIST = "FFEAF2F8";
const PAPER = "FFF4F2EC";
const WHITE = "FFFFFFFF";
const SOFT_INK = "FF5B6B78";
const BORDER = "FFD7DEE5";

const THIN = { style: "thin", color: { argb: BORDER } };
const BOX = { top: THIN, left: THIN, bottom: THIN, right: THIN };
const MONEY_FMT = '"$"#,##0;[Red]-"$"#,##0';
const PCT_FMT = "0.0%";

function titleRow(ws, text, cols) {
  const row = ws.addRow([text]);
  ws.mergeCells(row.number, 1, row.number, cols);
  row.getCell(1).font = { bold: true, size: 14, color: { argb: NAVY } };
  return row;
}
function subtitleRow(ws, text, cols) {
  const row = ws.addRow([text]);
  ws.mergeCells(row.number, 1, row.number, cols);
  row.getCell(1).font = { italic: true, size: 10, color: { argb: SOFT_INK } };
  return row;
}
function sectionRow(ws, text, cols) {
  const row = ws.addRow([text]);
  ws.mergeCells(row.number, 1, row.number, cols);
  row.getCell(1).font = { bold: true, size: 12, color: { argb: NAVY } };
  return row;
}
function headerRow(ws, headers) {
  const row = ws.addRow(headers);
  for (let i = 1; i <= headers.length; i++) {
    const cell = row.getCell(i);
    cell.font = { bold: true, color: { argb: WHITE } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
    cell.border = BOX;
    cell.alignment = { vertical: "middle", wrapText: true };
  }
  return row;
}
function dataRow(ws, values, colCount, { bold = false, italic = false, fill = null } = {}) {
  const row = ws.addRow(values);
  for (let i = 1; i <= colCount; i++) {
    const cell = row.getCell(i);
    cell.border = BOX;
    if (bold || italic) cell.font = { bold, italic };
    if (fill) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fill } };
  }
  return row;
}
function moneyCols(row, cols) {
  cols.forEach((c) => { row.getCell(c).numFmt = MONEY_FMT; });
}
function pctCol(row, col) { row.getCell(col).numFmt = PCT_FMT; }
function blankRow(ws) { ws.addRow([]); }
function setWidths(ws, widths) { ws.columns = widths.map((width) => ({ width })); }

async function downloadWorkbook(wb, filename) {
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* -------------------------------- Excel: hoja mensual ------------------------------ */

function buildMonthSheet(ws, monthIdx, monthData, monthTotal) {
  setWidths(ws, [22, 16, 16, 18, 18, 16, 30, 12]);
  titleRow(ws, `Análisis de Necesidad de Financiamiento Remuneraciones P02 — ${MONTHS[monthIdx]} 2026`, 8);
  subtitleRow(ws, `SLEP Petorca · Generado ${nowStamp()}`, 8);
  blankRow(ws);
  headerRow(ws, ["Fuente de Financiamiento", "Ingresos Totales", "Saldo para Sub22 y 29", "Saldo para Remuneraciones (A)", `Remuneraciones Brutas ${monthData.tipo === "Real" ? "Reales" : "Proyectadas"}`, "Déficit/Superávit (A-B)", "Observaciones", "% Resguardo"]);
  FUENTE_DEFS.forEach((fd) => {
    const c = monthTotal.perFuente[fd.key];
    const raw = monthData[fd.key] || {};
    const row = dataRow(ws, [fd.label, c.ingresos, c.saldoSub, c.saldoRemu, c.remuneraciones, c.deficit, raw.obs || "", c.ingresos ? c.saldoSub / c.ingresos : 0], 8);
    moneyCols(row, [2, 3, 4, 5, 6]);
    pctCol(row, 8);
  });
  const totRow = dataRow(ws, ["Totales", monthTotal.ingresos, monthTotal.saldoSub, monthTotal.saldoRemu, monthTotal.remuneraciones, monthTotal.deficit, "Suma de déficit en SG y JUNJI", monthTotal.ingresos ? monthTotal.saldoSub / monthTotal.ingresos : 0], 8, { bold: true, fill: MIST });
  moneyCols(totRow, [2, 3, 4, 5, 6]);
  pctCol(totRow, 8);
  blankRow(ws);

  sectionRow(ws, "Ajustes adicionales", 8);
  const ajusteHead = headerRow(ws, ["Concepto", "Monto"]);
  ws.mergeCells(ajusteHead.number, 2, ajusteHead.number, 8);
  [
    ["Saldo FAEP para REMU", monthTotal.ajusteFAEP],
    ["Saldo FIGA", monthTotal.ajusteFIGA],
    ["Déficit Líquidos (informativo)", monthTotal.deficitLiquidos],
    ["Déficit Total", monthTotal.f16],
  ].forEach(([label, monto], i) => {
    const isLast = i === 3;
    const row = ws.addRow([label, monto]);
    ws.mergeCells(row.number, 2, row.number, 8);
    row.getCell(1).border = BOX;
    row.getCell(2).border = BOX;
    if (isLast) { row.getCell(1).font = { bold: true }; row.getCell(2).font = { bold: true }; row.getCell(1).fill = row.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: MIST } }; }
    row.getCell(2).numFmt = MONEY_FMT;
  });

  const anyDetalle = FUENTE_DEFS.some((fd) => {
    const raw = monthData[fd.key] || {};
    return (raw.ingresosDetalle || []).length || (raw.remuneracionesDetalle || []).length;
  });
  if (anyDetalle) {
    blankRow(ws);
    sectionRow(ws, "Detalle de Ingresos y Remuneraciones", 8);
    const dHead = headerRow(ws, ["Fuente", "Tipo", "Fecha", "Concepto", "Monto"]);
    for (let i = 6; i <= 8; i++) dHead.getCell(i).fill = null;
    FUENTE_DEFS.forEach((fd) => {
      const raw = monthData[fd.key] || {};
      (raw.ingresosDetalle || []).forEach((e) => moneyCols(dataRow(ws, [fd.label, "Ingreso", e.fecha || "", e.concepto || "", e.monto || 0], 5), [5]));
      (raw.remuneracionesDetalle || []).forEach((e) => moneyCols(dataRow(ws, [fd.label, "Remuneraciones", e.fecha || "", e.concepto || "", e.monto || 0], 5), [5]));
    });
  }
}

/* -------------------------------- Excel: hoja resumen ------------------------------ */

function buildResumenSheet(ws, months, monthTotals, accumulated, corte) {
  const shown = Array.from({ length: corte }, (_, i) => i);
  setWidths(ws, [24, ...Array(Math.max(shown.length, 13)).fill(13), 16]);
  titleRow(ws, "Resumen Ejecutivo — Necesidad de Financiamiento Remuneraciones P02 2026", 8);
  subtitleRow(ws, `SLEP Petorca — corte a ${MONTHS[corte - 1]} · Generado ${nowStamp()}`, 8);
  blankRow(ws);
  headerRow(ws, ["Mes", "Estado", "Ingresos Totales", "Saldo Sub22 y 29", "Saldo para Remuneraciones (A)", "Remuneraciones Brutas (B)", "Déficit/Superávit (A-B)", "Déficit/Superávit Acumulado"]);
  shown.forEach((i) => {
    const mt = monthTotals[i];
    const row = dataRow(ws, [MONTHS[i], mt.tipo, mt.ingresos, mt.saldoSub, mt.saldoRemu, mt.remuneraciones, mt.deficit, accumulated[i]], 8);
    moneyCols(row, [3, 4, 5, 6, 7, 8]);
  });
  blankRow(ws);

  [
    ["1. Ingresos por Fuente y Mes", "ingresos"],
    ["2. Gastos (Remuneraciones) por Fuente y Mes", "remuneraciones"],
    ["3. Déficit / Superávit por Fuente y Mes", "deficit"],
  ].forEach(([title, field]) => {
    sectionRow(ws, title, shown.length + 2);
    const cols = shown.length + 2;
    const head = headerRow(ws, ["Fuente", ...shown.map((i) => MONTHS_SHORT[i]), "Total Período"]);
    FUENTE_DEFS.forEach((fd) => {
      const row = [fd.label];
      let tot = 0;
      shown.forEach((i) => {
        const v = monthTotals[i].perFuente[fd.key][field] || 0;
        row.push(v);
        tot += v;
      });
      row.push(tot);
      const r = dataRow(ws, row, cols);
      moneyCols(r, Array.from({ length: cols - 1 }, (_, i) => i + 2));
    });
    const totRow = ["Totales"];
    let grand = 0;
    shown.forEach((i) => {
      const v = FUENTE_DEFS.reduce((s, fd) => s + (monthTotals[i].perFuente[fd.key][field] || 0), 0);
      totRow.push(v);
      grand += v;
    });
    totRow.push(grand);
    const r = dataRow(ws, totRow, cols, { bold: true, fill: MIST });
    moneyCols(r, Array.from({ length: cols - 1 }, (_, i) => i + 2));
    blankRow(ws);
  });
}

/* -------------------------------- Excel: hoja Estructura Déficit ------------------------------ */

function buildEstructuraSheet(ws, estructura, estructuraCalc) {
  setWidths(ws, [30, 18, 20, 18, 18, 18, 16]);
  titleRow(ws, "Estructura de Déficit — Traspasos entre cuentas corrientes", 7);
  subtitleRow(ws, `SLEP Petorca · Período: ${estructura.periodo} · Generado ${nowStamp()}`, 7);
  blankRow(ws);

  headerRow(ws, ["Subvención", "Ingresos", "Gasto Remuneraciones", "Gasto Subt. 22 y 29", "Total Gastos", "Diferencia", "Incluida en Total Final"]);
  GRUPO_ORDER.forEach((key) => {
    const g = estructuraCalc.groups[key];
    if (!g) return;
    const row = dataRow(ws, [g.label, g.totalIngresos, g.totalGastoRemu, g.gastoST2229, g.totalGastos, g.diferencia, g.incluirTotal ? "Sí" : "No"], 7);
    moneyCols(row, [2, 3, 4, 5, 6]);
    if (g.cd) {
      const cdRow = dataRow(ws, ["  ↳ Carrera Docente", g.cdIngresos, g.cdGasto, "", "", g.cdDeficit, ""], 7, { italic: true, fill: PAPER });
      moneyCols(cdRow, [2, 3, 6]);
    }
  });
  const jc = estructuraCalc.junjiCalc;
  const junjiRow = dataRow(ws, ["JUNJI", jc.ingresos, jc.gasto, estructura.junji.gastoST2229, jc.totalGastos, jc.diferencia, estructura.junji.incluirTotal ? "Sí" : "No"], 7);
  moneyCols(junjiRow, [2, 3, 4, 5, 6]);

  const af = estructuraCalc.groups[APORTE_FISCAL_KEY];
  if (af) {
    const afRow = dataRow(ws, [af.label, af.totalIngresos, af.totalGastoRemu, af.gastoST2229, af.totalGastos, af.diferencia, af.incluirTotal ? "Sí" : "No"], 7);
    moneyCols(afRow, [2, 3, 4, 5, 6]);
  }
  blankRow(ws);
  const totalRow = dataRow(ws, ["Total Final", estructuraCalc.ingresosFinal, estructuraCalc.gastoRemuFinal, estructuraCalc.st2229Final, estructuraCalc.gastosFinal, estructuraCalc.diferenciaFinal, ""], 7, { bold: true, fill: MIST });
  moneyCols(totalRow, [2, 3, 4, 5, 6]);
  blankRow(ws);

  sectionRow(ws, "Registro de traspasos entre cuentas (REX)", 7);
  const rexHead = headerRow(ws, ["Fecha", "Proceso / Motivo", "Cuenta Origen (Desde)", "Cuenta Destino (Hacia)", "Monto", "N° REX"]);
  rexHead.getCell(7).fill = null;
  estructura.sacados.forEach((s) => {
    const row = dataRow(ws, [s.fecha || "", s.proceso || "", s.cuentaOrigen || "", s.cuentaDestino || "", s.monto, s.rex || ""], 6);
    moneyCols(row, [5]);
  });
  blankRow(ws);
  const deficitRow = ws.addRow(["Déficit acumulado periodo de análisis", "", "", "", "", estructuraCalc.deficitAcumuladoAPedir]);
  ws.mergeCells(deficitRow.number, 1, deficitRow.number, 5);
  for (let i = 1; i <= 6; i++) {
    deficitRow.getCell(i).border = BOX;
    deficitRow.getCell(i).font = { bold: true };
    deficitRow.getCell(i).fill = { type: "pattern", pattern: "solid", fgColor: { argb: MIST } };
  }
  deficitRow.getCell(6).numFmt = MONEY_FMT;

  const detailRows = buildEstructuraDetailRows(estructura);
  if (detailRows.length) {
    blankRow(ws);
    sectionRow(ws, "Detalle de Ingresos y Gastos por subvención", 7);
    groupDetailRowsBySubvencion(detailRows).forEach((grp) => {
      const { ingresoRows, gastoRows, subtotalIngresos, subtotalGastos, diferencia } = splitIngresosGastos(grp.rows);
      sectionRow(ws, grp.subvencion, 7);
      const head = headerRow(ws, ["Tipo", "Fecha", "Concepto", "Monto"]);
      for (let i = 5; i <= 7; i++) head.getCell(i).fill = null;
      ingresoRows.forEach((e) => moneyCols(dataRow(ws, [e.tipo, e.fecha || "", e.concepto || "", e.monto || 0], 4), [4]));
      if (ingresoRows.length) {
        const r = ws.addRow(["Subtotal Ingresos " + grp.subvencion, "", "", subtotalIngresos]);
        ws.mergeCells(r.number, 1, r.number, 3);
        for (let i = 1; i <= 4; i++) { r.getCell(i).border = BOX; r.getCell(i).font = { bold: true }; r.getCell(i).fill = { type: "pattern", pattern: "solid", fgColor: { argb: MIST } }; }
        r.getCell(4).numFmt = MONEY_FMT;
      }
      gastoRows.forEach((e) => moneyCols(dataRow(ws, [e.tipo, e.fecha || "", e.concepto || "", e.monto || 0], 4), [4]));
      if (gastoRows.length) {
        const r = ws.addRow(["Subtotal Gastos " + grp.subvencion, "", "", subtotalGastos]);
        ws.mergeCells(r.number, 1, r.number, 3);
        for (let i = 1; i <= 4; i++) { r.getCell(i).border = BOX; r.getCell(i).font = { bold: true }; r.getCell(i).fill = { type: "pattern", pattern: "solid", fgColor: { argb: MIST } }; }
        r.getCell(4).numFmt = MONEY_FMT;
      }
      const dRow = ws.addRow(["Diferencia " + grp.subvencion, "", "", diferencia]);
      ws.mergeCells(dRow.number, 1, dRow.number, 3);
      for (let i = 1; i <= 4; i++) { dRow.getCell(i).border = BOX; dRow.getCell(i).font = { bold: true }; dRow.getCell(i).fill = { type: "pattern", pattern: "solid", fgColor: { argb: MIST } }; }
      dRow.getCell(4).numFmt = MONEY_FMT;
      blankRow(ws);
    });
  }
}

/* -------------------------------- Excel: hoja Bitácora ------------------------------ */

function buildBitacoraSheet(ws, changeLog) {
  setWidths(ws, [16, 16, 14, 24, 24, 16, 16, 32, 10]);
  titleRow(ws, "Bitácora de Movimientos", 9);
  subtitleRow(ws, `SLEP Petorca · Generado ${nowStamp()}`, 9);
  blankRow(ws);
  headerRow(ws, ["Fecha", "Sección", "Mes / Período", "Concepto", "Campo", "Valor anterior", "Valor nuevo", "Nota", "Reportado"]);
  changeLog.forEach((c) => {
    dataRow(ws, [c.tsLabel, c.section, c.mes, c.concepto, c.campo, c.oldVal, c.newVal, c.nota || "", c.reportado ? "Sí" : "No"], 9);
  });
}

/* -------------------------------- Excel: exportación independiente por pestaña ------------------------------ */

export async function exportDatosMensualExcel(monthIdx, monthData, monthTotal) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(MONTHS_SHORT[monthIdx] + " " + (monthIdx + 1));
  buildMonthSheet(ws, monthIdx, monthData, monthTotal);
  await downloadWorkbook(wb, buildFileName(`Datos ${MONTHS[monthIdx]} - Financiamiento P02`) + ".xlsx");
}

export async function exportResumenExcel(months, monthTotals, accumulated, corte) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Resumen");
  buildResumenSheet(ws, months, monthTotals, accumulated, corte);
  await downloadWorkbook(wb, buildFileName(`Resumen a ${MONTHS[corte - 1]} - Financiamiento P02`) + ".xlsx");
}

export async function exportEstructuraExcel(estructura, estructuraCalc) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Estructura Deficit");
  buildEstructuraSheet(ws, estructura, estructuraCalc);
  await downloadWorkbook(wb, buildFileName("Situacion deficit - Financiamiento P02") + ".xlsx");
}

export async function exportBitacoraExcel(changeLog) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Bitacora");
  buildBitacoraSheet(ws, changeLog);
  await downloadWorkbook(wb, buildFileName("Bitacora movimientos - Financiamiento P02") + ".xlsx");
}
