export const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
export const MONTHS_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

export const FUENTE_DEFS = [
  { key: "general",      label: "Subvención General", mode: "standard" },
  { key: "pie",           label: "PIE",                 mode: "standard" },
  { key: "sep",           label: "SEP",                 mode: "sep" },
  { key: "junji",         label: "JUNJI",               mode: "standard" },
  { key: "aporteFiscal",  label: "Aporte Fiscal",       mode: "standard" },
  { key: "faep",          label: "FAEP",                mode: "standard" },
  { key: "mantenimiento", label: "Mantenimiento",       mode: "standard" },
  { key: "prorretencion", label: "Prorretención",       mode: "prorretencion" },
];

/* Orden fijo de subvenciones en Estructura Déficit / Traspasos — independiente del
   orden de campos que devuelva Firestore, que puede variar entre actualizaciones.
   Aporte Fiscal no tiene fila de Carrera Docente y se muestra al final, después de
   JUNJI (ver APORTE_FISCAL_KEY), no dentro de este orden. */
export const GRUPO_ORDER = ["general", "sep", "pie"];
export const APORTE_FISCAL_KEY = "aporteFiscal";

export const FIELD_LABELS = {
  ingresos: "Ingresos Totales",
  saldoSub: "Saldo Sub. 22 y 29",
  saldoParaRemu: "Saldo para Remuneraciones",
  remuneraciones: "Remuneraciones Brutas",
  ajusteFAEP: "Saldo FAEP para REMU",
  ajusteFIGA: "Saldo FIGA",
  deficitLiquidos: "Déficit Líquidos",
  totalFAEP: "Total FAEP",
  cuotaEducacion: "Cuota Educación",
  cuotaJardines: "Cuota Jardines",
  abrilEducacion: "Abril a Educación",
  faepAGeneral: "FAEP a General",
  poderRendirJunjiReal: "Poder Rendir en JUNJI (real)",
  gastoRemu: "Gasto Remuneraciones",
  cdIngresos: "Ingresos Carrera Docente",
  cdGasto: "Gasto Carrera Docente",
  gastoST2229: "Gasto Subt. 22 y 29",
};

/* ---------------------------- Lógica de cálculo --------------------------- */
/* Portado 1:1 desde reference/dashboard_deficit_slep_petorca_1.jsx — no modificar fórmulas. */

export function computeFuente(f, mode) {
  if (!f) f = {};
  if (mode === "sep") {
    const ingresos = f.ingresos || 0;
    const saldoParaRemu = f.saldoParaRemu || 0;
    const remuneraciones = f.remuneraciones || 0;
    return {
      ingresos,
      saldoSub: ingresos - saldoParaRemu,
      saldoRemu: saldoParaRemu,
      remuneraciones,
      deficit: saldoParaRemu - remuneraciones,
    };
  }
  if (mode === "prorretencion") {
    const ingresos = f.ingresos || 0;
    return { ingresos, saldoSub: ingresos, saldoRemu: 0, remuneraciones: 0, deficit: 0 };
  }
  const ingresos = f.ingresos || 0;
  const saldoSub = f.saldoSub || 0;
  const remuneraciones = f.remuneraciones || 0;
  const saldoRemu = ingresos - saldoSub;
  return { ingresos, saldoSub, saldoRemu, remuneraciones, deficit: saldoRemu - remuneraciones };
}

export function computeMonthTotals(monthData) {
  const perFuente = {};
  let ingresos = 0, saldoSub = 0, saldoRemu = 0, remuneraciones = 0, deficit = 0;
  FUENTE_DEFS.forEach((fd) => {
    const c = computeFuente(monthData[fd.key], fd.mode);
    perFuente[fd.key] = c;
    ingresos += c.ingresos;
    saldoSub += c.saldoSub;
    saldoRemu += c.saldoRemu;
    remuneraciones += c.remuneraciones;
    deficit += c.deficit;
  });
  const ajusteFAEP = monthData.ajusteFAEP || 0;
  const ajusteFIGA = monthData.ajusteFIGA || 0;
  const deficitLiquidos = monthData.deficitLiquidos || 0;
  const f16 = deficit + ajusteFAEP + ajusteFIGA;
  return {
    perFuente, ingresos, saldoSub, saldoRemu, remuneraciones, deficit,
    ajusteFAEP, ajusteFIGA, deficitLiquidos, f16, tipo: monthData.tipo || "Real",
    resguardoPct: ingresos ? saldoSub / ingresos : 0,
  };
}

export function computeAccumulated(monthTotalsArr) {
  let acc = 0;
  return monthTotalsArr.map((mt) => { acc += mt.f16; return acc; });
}

/* Estructura Déficit / Traspasos ------------------------------------------ */

export function computeEstructura(estructura) {
  const groups = {};
  let ingresosFinal = 0, gastoRemuFinal = 0, st2229Final = 0, gastosFinal = 0, diferenciaFinal = 0;
  Object.entries(estructura.grupos).forEach(([key, g]) => {
    const cdIngresos = g.cd ? (g.cdIngresos || 0) : 0;
    const cdGasto = g.cd ? (g.cdGasto || 0) : 0;
    const totalIngresos = (g.ingresos || 0) + cdIngresos;
    const totalGastoRemu = (g.gastoRemu || 0) + cdGasto;
    const totalGastos = totalGastoRemu + (g.gastoST2229 || 0);
    const diferencia = totalIngresos - totalGastos;
    const cdDeficit = g.cd ? cdIngresos - cdGasto : null;
    groups[key] = { ...g, totalIngresos, totalGastoRemu, totalGastos, diferencia, cdDeficit };
    if (g.incluirTotal) {
      ingresosFinal += totalIngresos;
      gastoRemuFinal += totalGastoRemu;
      st2229Final += g.gastoST2229 || 0;
      gastosFinal += totalGastos;
      diferenciaFinal += diferencia;
    }
  });

  const j = estructura.junji;
  const junjiIngresos = (j.operacion.ingresos || 0) + (j.cd.ingresos || 0) + (j.homologacion.ingresos || 0);
  const junjiGasto = (j.operacion.gasto || 0) + (j.cd.gasto || 0) + (j.homologacion.gasto || 0);
  const junjiTotalGastos = junjiGasto + (j.gastoST2229 || 0);
  const junjiDiferencia = junjiIngresos - junjiTotalGastos;
  const junjiCalc = { ingresos: junjiIngresos, gasto: junjiGasto, totalGastos: junjiTotalGastos, diferencia: junjiDiferencia };
  if (j.incluirTotal) {
    ingresosFinal += junjiIngresos;
    gastoRemuFinal += junjiGasto;
    st2229Final += j.gastoST2229 || 0;
    gastosFinal += junjiTotalGastos;
    diferenciaFinal += junjiDiferencia;
  }

  const sacadosSum = (estructura.sacados || []).reduce((s, r) => s + (r.monto || 0), 0);
  const deficitAcumuladoAPedir = diferenciaFinal + sacadosSum;

  return { groups, junjiCalc, ingresosFinal, gastoRemuFinal, st2229Final, gastosFinal, diferenciaFinal, sacadosSum, deficitAcumuladoAPedir };
}

const JUNJI_SUB_LABELS = { operacion: "Operación", cd: "Convenio CD", homologacion: "Homologación" };

function sortByFecha(rows) {
  return rows.sort((a, b) => (a.fecha || "9999-99-99").localeCompare(b.fecha || "9999-99-99"));
}

/* Desglose de detalle (fecha/concepto/monto) de Ingresos y Gastos de Estructura Déficit,
   agrupado por subvención (una sola entrada por subvención — Carrera Docente y las
   sub-cuentas de JUNJI quedan como "tipo" dentro de esa misma subvención, no como
   entidades aparte), en el mismo orden que el resto de la pestaña (GRUPO_ORDER, JUNJI,
   Aporte Fiscal) y cada bloque ordenado cronológicamente. Usado por el Excel y el PDF
   de Traspasos entre Cuentas. */
export function buildEstructuraDetailRows(estructura) {
  const rows = [];
  const addGroup = (subvencion, g) => {
    rows.push(...sortByFecha((g.ingresosDetalle || []).map((e) => ({ subvencion, tipo: "Ingresos", ...e }))));
    rows.push(...sortByFecha((g.gastoRemuDetalle || []).map((e) => ({ subvencion, tipo: "Gasto Remuneraciones", ...e }))));
    rows.push(...sortByFecha((g.gastoST2229Detalle || []).map((e) => ({ subvencion, tipo: "Gasto Subt. 22 y 29", ...e }))));
    if (g.cd) {
      rows.push(...sortByFecha((g.cdIngresosDetalle || []).map((e) => ({ subvencion, tipo: "Carrera Docente — Ingresos", ...e }))));
      rows.push(...sortByFecha((g.cdGastoDetalle || []).map((e) => ({ subvencion, tipo: "Carrera Docente — Gasto", ...e }))));
    }
  };

  GRUPO_ORDER.forEach((key) => {
    const g = estructura.grupos[key];
    if (g) addGroup(g.label, g);
  });

  rows.push(...sortByFecha((estructura.junji.gastoST2229Detalle || []).map((e) => ({ subvencion: "JUNJI", tipo: "Gasto Subt. 22 y 29", ...e }))));
  ["operacion", "cd", "homologacion"].forEach((sub) => {
    const subLabel = JUNJI_SUB_LABELS[sub];
    rows.push(...sortByFecha((estructura.junji[sub].ingresosDetalle || []).map((e) => ({ subvencion: "JUNJI", tipo: `${subLabel} — Ingresos`, ...e }))));
    rows.push(...sortByFecha((estructura.junji[sub].gastoDetalle || []).map((e) => ({ subvencion: "JUNJI", tipo: `${subLabel} — Gasto`, ...e }))));
  });

  const af = estructura.grupos[APORTE_FISCAL_KEY];
  if (af) addGroup(af.label, af);

  return rows;
}
