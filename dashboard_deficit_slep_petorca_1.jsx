import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, BarChart, Bar, Legend, Cell
} from "recharts";
import {
  LayoutGrid, FileSpreadsheet, ArrowLeftRight, ClipboardList, Download,
  Printer, Plus, Trash2, Copy, Check, ChevronDown, AlertTriangle,
  TrendingUp, TrendingDown, Save, Loader2, Mail, RotateCcw, Info, X, List
} from "lucide-react";
import * as XLSX from "xlsx";

/* ============================================================================
   SLEP PETORCA — Dashboard Situación de Déficit / Financiamiento Remuneraciones
   Prototipo de estructura para futura migración a Firebase + GitHub Pages
   ============================================================================ */

/* ---------------------------- Constantes base ---------------------------- */

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const MONTHS_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const FUENTE_DEFS = [
  { key: "general",      label: "Subvención General", mode: "standard" },
  { key: "pie",           label: "PIE",                 mode: "standard" },
  { key: "sep",           label: "SEP",                 mode: "sep" },
  { key: "junji",         label: "JUNJI",               mode: "standard" },
  { key: "aporteFiscal",  label: "Aporte Fiscal",       mode: "standard" },
  { key: "faep",          label: "FAEP",                mode: "standard" },
  { key: "mantenimiento", label: "Mantenimiento",       mode: "standard" },
  { key: "prorretencion", label: "Prorretención",       mode: "prorretencion" },
];

const SEED_MONTHS = [
{
"tipo": "Real",
"general": {
"ingresos": 1326402066,
"saldoSub": 0,
"remuneraciones": 1559824035,
"obs": "Sin resguardo para ST 22 Y 29"
},
"pie": {
"ingresos": 506388302,
"saldoSub": 0,
"remuneraciones": 415045462,
"obs": "Sin resguardo para ST 22 Y 29"
},
"sep": {
"ingresos": 500181771,
"saldoParaRemu": 320463402,
"remuneraciones": 320463402,
"obs": "36% resguardo para ST 22 Y 29"
},
"junji": {
"ingresos": 163158694,
"saldoSub": 0,
"remuneraciones": 194387796,
"obs": "Sin resguardo para ST 22 Y 29"
},
"aporteFiscal": {
"ingresos": 155449000,
"saldoSub": 0,
"remuneraciones": 197924915,
"obs": "NO APLICA a ST 22 Y 29"
},
"faep": {
"ingresos": 0,
"saldoSub": 0,
"remuneraciones": 0,
"obs": ""
},
"mantenimiento": {
"ingresos": 0,
"saldoSub": 0,
"remuneraciones": 0,
"obs": ""
},
"prorretencion": {
"ingresos": 0,
"obs": "Retencion puntual; sin remuneraciones asociadas"
},
"ajusteFAEP": 820483200,
"ajusteFIGA": 0,
"deficitLiquidos": 0
},
{
"tipo": "Real",
"general": {
"ingresos": 1308356868,
"saldoSub": 3769920,
"remuneraciones": 1776131624,
"obs": "10% de resguardo para operaciones"
},
"pie": {
"ingresos": 583462376,
"saldoSub": 0,
"remuneraciones": 437015442,
"obs": ""
},
"sep": {
"ingresos": 527306236,
"saldoParaRemu": 335040114,
"remuneraciones": 335040114,
"obs": ""
},
"junji": {
"ingresos": 157044001,
"saldoSub": 0,
"remuneraciones": 244828590,
"obs": "10% de resguardo para operaciones"
},
"aporteFiscal": {
"ingresos": 43124326,
"saldoSub": 0,
"remuneraciones": 256727739,
"obs": ""
},
"faep": {
"ingresos": 0,
"saldoSub": 0,
"remuneraciones": 17802449,
"obs": ""
},
"mantenimiento": {
"ingresos": 149116725,
"saldoSub": 149116725,
"remuneraciones": 0,
"obs": ""
},
"prorretencion": {
"ingresos": 0,
"obs": "Retencion puntual; sin remuneraciones asociadas"
},
"ajusteFAEP": 0,
"ajusteFIGA": 0,
"deficitLiquidos": 0
},
{
"tipo": "Real",
"general": {
"ingresos": 1672673593,
"saldoSub": 768960,
"remuneraciones": 1566970484,
"obs": ""
},
"pie": {
"ingresos": 470186981,
"saldoSub": 0,
"remuneraciones": 421934119,
"obs": ""
},
"sep": {
"ingresos": 459526259,
"saldoParaRemu": 315585052,
"remuneraciones": 315585052,
"obs": ""
},
"junji": {
"ingresos": 134833236,
"saldoSub": 0,
"remuneraciones": 186817076,
"obs": ""
},
"aporteFiscal": {
"ingresos": 325168000,
"saldoSub": 0,
"remuneraciones": 116147803,
"obs": ""
},
"faep": {
"ingresos": 0,
"saldoSub": 0,
"remuneraciones": 8848540,
"obs": ""
},
"mantenimiento": {
"ingresos": 56421713,
"saldoSub": 56421713,
"remuneraciones": 0,
"obs": ""
},
"prorretencion": {
"ingresos": 0,
"obs": "Retencion puntual; sin remuneraciones asociadas"
},
"ajusteFAEP": 0,
"ajusteFIGA": 0,
"deficitLiquidos": 0
},
{
"tipo": "Real",
"general": {
"ingresos": 1454028092,
"saldoSub": 135011881,
"remuneraciones": 1716052663,
"obs": ""
},
"pie": {
"ingresos": 435270791,
"saldoSub": 0,
"remuneraciones": 440883098,
"obs": ""
},
"sep": {
"ingresos": 491082584,
"saldoParaRemu": 322999889,
"remuneraciones": 322999889,
"obs": ""
},
"junji": {
"ingresos": 136379816,
"saldoSub": 0,
"remuneraciones": 204800489,
"obs": ""
},
"aporteFiscal": {
"ingresos": 119214678,
"saldoSub": 0,
"remuneraciones": 73778125,
"obs": ""
},
"faep": {
"ingresos": 0,
"saldoSub": 0,
"remuneraciones": 8727050,
"obs": ""
},
"mantenimiento": {
"ingresos": 0,
"saldoSub": 0,
"remuneraciones": 0,
"obs": ""
},
"prorretencion": {
"ingresos": 0,
"obs": "Retencion puntual; sin remuneraciones asociadas"
},
"ajusteFAEP": 0,
"ajusteFIGA": 0,
"deficitLiquidos": 0
},
{
"tipo": "Real",
"general": {
"ingresos": 1486604191,
"saldoSub": 70134191,
"remuneraciones": 1643153153,
"obs": ""
},
"pie": {
"ingresos": 355401909,
"saldoSub": 0,
"remuneraciones": 436365856,
"obs": ""
},
"sep": {
"ingresos": 490420727,
"saldoParaRemu": 320631554,
"remuneraciones": 320631554,
"obs": ""
},
"junji": {
"ingresos": 139684788,
"saldoSub": 0,
"remuneraciones": 188196881,
"obs": ""
},
"aporteFiscal": {
"ingresos": 40200000,
"saldoSub": 0,
"remuneraciones": 83672771,
"obs": ""
},
"faep": {
"ingresos": 0,
"saldoSub": 0,
"remuneraciones": 0,
"obs": ""
},
"mantenimiento": {
"ingresos": 0,
"saldoSub": 0,
"remuneraciones": 0,
"obs": ""
},
"prorretencion": {
"ingresos": 0,
"obs": "Retencion puntual; sin remuneraciones asociadas"
},
"ajusteFAEP": 0,
"ajusteFIGA": 0,
"deficitLiquidos": 0
},
{
"tipo": "Real",
"general": {
"ingresos": 1285359224,
"saldoSub": 218272631,
"remuneraciones": 1681650227,
"obs": ""
},
"pie": {
"ingresos": 402149815,
"saldoSub": 0,
"remuneraciones": 448608628,
"obs": ""
},
"sep": {
"ingresos": 444076449,
"saldoParaRemu": 330512710,
"remuneraciones": 330512710,
"obs": ""
},
"junji": {
"ingresos": 140392679,
"saldoSub": 0,
"remuneraciones": 198951907,
"obs": ""
},
"aporteFiscal": {
"ingresos": 106069560,
"saldoSub": 0,
"remuneraciones": 105898497,
"obs": ""
},
"faep": {
"ingresos": 0,
"saldoSub": 0,
"remuneraciones": 0,
"obs": ""
},
"mantenimiento": {
"ingresos": 0,
"saldoSub": 0,
"remuneraciones": 0,
"obs": ""
},
"prorretencion": {
"ingresos": 155530344,
"obs": ""
},
"ajusteFAEP": 0,
"ajusteFIGA": 113956000,
"deficitLiquidos": 0
},
{
"tipo": "Real",
"general": {
"ingresos": 1535525069,
"saldoSub": 172574240,
"remuneraciones": 1732926442,
"obs": ""
},
"pie": {
"ingresos": 394453613,
"saldoSub": 0,
"remuneraciones": 449499038,
"obs": ""
},
"sep": {
"ingresos": 448310081,
"saldoParaRemu": 333348234,
"remuneraciones": 333348234,
"obs": ""
},
"junji": {
"ingresos": 156376584,
"saldoSub": 0,
"remuneraciones": 195158924,
"obs": ""
},
"aporteFiscal": {
"ingresos": 0,
"saldoSub": 0,
"remuneraciones": 76771134,
"obs": ""
},
"faep": {
"ingresos": 0,
"saldoSub": 0,
"remuneraciones": 0,
"obs": ""
},
"mantenimiento": {
"ingresos": 0,
"saldoSub": 0,
"remuneraciones": 0,
"obs": ""
},
"prorretencion": {
"ingresos": 0,
"obs": ""
},
"ajusteFAEP": 0,
"ajusteFIGA": 1383103000,
"deficitLiquidos": 0
},
{
"tipo": "Proyectado",
"general": {
"ingresos": 1494871712,
"saldoSub": 550000000,
"remuneraciones": 1817001456,
"obs": "36,79% Resguardo para Subtitulo 22 y 29"
},
"pie": {
"ingresos": 403432524,
"saldoSub": 0,
"remuneraciones": 444824507,
"obs": ""
},
"sep": {
"ingresos": 425780731,
"saldoParaRemu": 328164166,
"remuneraciones": 328164166,
"obs": "22,9% Resguardo para Subtitulo 22 y 29"
},
"junji": {
"ingresos": 116427506,
"saldoSub": 0,
"remuneraciones": 194102571,
"obs": ""
},
"aporteFiscal": {
"ingresos": 0,
"saldoSub": 0,
"remuneraciones": 88780801,
"obs": ""
},
"faep": {
"ingresos": 0,
"saldoSub": 0,
"remuneraciones": 0,
"obs": ""
},
"mantenimiento": {
"ingresos": 0,
"saldoSub": 0,
"remuneraciones": 0,
"obs": ""
},
"prorretencion": {
"ingresos": 0,
"obs": ""
},
"ajusteFAEP": 0,
"ajusteFIGA": 0,
"deficitLiquidos": 0
},
{
"tipo": "Proyectado",
"general": {
"ingresos": 1435829495,
"saldoSub": 350000000,
"remuneraciones": 1685909941,
"obs": "24,38% Resguardo para Subtitulo 22 y 29"
},
"pie": {
"ingresos": 384001779,
"saldoSub": 0,
"remuneraciones": 444824507,
"obs": ""
},
"sep": {
"ingresos": 460935752,
"saldoParaRemu": 328164166,
"remuneraciones": 328164166,
"obs": "28,8% Resguardo para Subtitulo 22 y 29"
},
"junji": {
"ingresos": 145484684,
"saldoSub": 0,
"remuneraciones": 194102571,
"obs": ""
},
"aporteFiscal": {
"ingresos": 48756520,
"saldoSub": 0,
"remuneraciones": 88780801,
"obs": ""
},
"faep": {
"ingresos": 0,
"saldoSub": 0,
"remuneraciones": 0,
"obs": ""
},
"mantenimiento": {
"ingresos": 0,
"saldoSub": 0,
"remuneraciones": 0,
"obs": ""
},
"prorretencion": {
"ingresos": 0,
"obs": ""
},
"ajusteFAEP": 0,
"ajusteFIGA": 0,
"deficitLiquidos": 0
},
{
"tipo": "Proyectado",
"general": {
"ingresos": 1435829495,
"saldoSub": 350000000,
"remuneraciones": 1685909941,
"obs": "24,38% Resguardo para Subtitulo 22 y 29"
},
"pie": {
"ingresos": 384001779,
"saldoSub": 0,
"remuneraciones": 444824507,
"obs": ""
},
"sep": {
"ingresos": 460935752,
"saldoParaRemu": 328164166,
"remuneraciones": 328164166,
"obs": "28,8% Resguardo para Subtitulo 22 y 29"
},
"junji": {
"ingresos": 145484684,
"saldoSub": 0,
"remuneraciones": 194102571,
"obs": ""
},
"aporteFiscal": {
"ingresos": 48756520,
"saldoSub": 0,
"remuneraciones": 88780801,
"obs": ""
},
"faep": {
"ingresos": 0,
"saldoSub": 0,
"remuneraciones": 0,
"obs": ""
},
"mantenimiento": {
"ingresos": 0,
"saldoSub": 0,
"remuneraciones": 0,
"obs": ""
},
"prorretencion": {
"ingresos": 0,
"obs": ""
},
"ajusteFAEP": 0,
"ajusteFIGA": 0,
"deficitLiquidos": 0
},
{
"tipo": "Proyectado",
"general": {
"ingresos": 1435829495,
"saldoSub": 350000000,
"remuneraciones": 1685909941,
"obs": "24,38% Resguardo para Subtitulo 22 y 29"
},
"pie": {
"ingresos": 384001779,
"saldoSub": 0,
"remuneraciones": 444824507,
"obs": ""
},
"sep": {
"ingresos": 460935752,
"saldoParaRemu": 328164166,
"remuneraciones": 328164166,
"obs": "28,8% Resguardo para Subtitulo 22 y 29"
},
"junji": {
"ingresos": 145484684,
"saldoSub": 0,
"remuneraciones": 194102571,
"obs": ""
},
"aporteFiscal": {
"ingresos": 48756520,
"saldoSub": 0,
"remuneraciones": 88780801,
"obs": ""
},
"faep": {
"ingresos": 0,
"saldoSub": 0,
"remuneraciones": 0,
"obs": ""
},
"mantenimiento": {
"ingresos": 0,
"saldoSub": 0,
"remuneraciones": 0,
"obs": ""
},
"prorretencion": {
"ingresos": 0,
"obs": ""
},
"ajusteFAEP": 0,
"ajusteFIGA": 0,
"deficitLiquidos": 0
},
{
"tipo": "Proyectado",
"general": {
"ingresos": 1435829495,
"saldoSub": 350000000,
"remuneraciones": 1685909941,
"obs": "24,38% Resguardo para Subtitulo 22 y 29"
},
"pie": {
"ingresos": 384001779,
"saldoSub": 0,
"remuneraciones": 444824507,
"obs": ""
},
"sep": {
"ingresos": 460935752,
"saldoParaRemu": 328164166,
"remuneraciones": 328164166,
"obs": "28,8% Resguardo para Subtitulo 22 y 29"
},
"junji": {
"ingresos": 145484684,
"saldoSub": 0,
"remuneraciones": 194102571,
"obs": ""
},
"aporteFiscal": {
"ingresos": 48756520,
"saldoSub": 0,
"remuneraciones": 88780801,
"obs": ""
},
"faep": {
"ingresos": 0,
"saldoSub": 0,
"remuneraciones": 0,
"obs": ""
},
"mantenimiento": {
"ingresos": 0,
"saldoSub": 0,
"remuneraciones": 0,
"obs": ""
},
"prorretencion": {
"ingresos": 0,
"obs": ""
},
"ajusteFAEP": 0,
"ajusteFIGA": 0,
"deficitLiquidos": 0
}
];

const ENERO_DETALLE_SEED = {
  totalFAEP: 1025604000,
  cuotaEducacion: 393306808,
  cuotaJardines: 119495192,
  abrilEducacion: 250000000,
  faepAGeneral: 18687364,
  poderRendirJunjiReal: 72481845,
};

const ESTRUCTURA_SEED = {
  periodo: "Junio - Julio 2026",
  grupos: {
    general:      { label: "Subvención General", ingresos: 1071586263, gastoRemu: 1684423840, cd: true,  cdIngresos: 415017928, cdGasto: 605003635, gastoST2229: 258577452, incluirTotal: true },
    pie:          { label: "PIE",                 ingresos: 256421443,  gastoRemu: 433995230,  cd: true,  cdIngresos: 85131683,  cdGasto: 122850303, gastoST2229: 35000000,  incluirTotal: true },
    sep:          { label: "SEP",                 ingresos: 416289229,  gastoRemu: 319183478,  cd: true,  cdIngresos: 31924456,  cdGasto: 46695007,  gastoST2229: 132291372, incluirTotal: false },
    aporteFiscal: { label: "Aporte Fiscal",       ingresos: 0,           gastoRemu: 78304926,   cd: false, gastoST2229: 0,          incluirTotal: true },
  },
  junji: {
    operacion:     { ingresos: 104072763, gasto: 183680084 },
    cd:            { ingresos: 13866022,  gasto: 13866022 },
    homologacion:  { ingresos: 22453894,  gasto: 22453894 },
    gastoST2229: 54173977,
    incluirTotal: true,
  },
  sacados: [
    { id: 1, fecha: "2026-06-12", proceso: "Devolución mes mayo", cuentaOrigen: "Cuenta General / fondos comunes", cuentaDestino: "SEP",                 monto: -473234227, rex: "REX 296 del 12/06/2026" },
    { id: 2, fecha: "2026-06-12", proceso: "Devolución mes mayo", cuentaOrigen: "Cuenta General / fondos comunes", cuentaDestino: "GENERAL",             monto: -343072993, rex: "REX 296 del 12/06/2026" },
    { id: 3, fecha: "2026-06-12", proceso: "Devolución mes mayo", cuentaOrigen: "Cuenta General / fondos comunes", cuentaDestino: "APORTE FISCAL LIBRE", monto: -38299560,  rex: "REX 296 del 12/06/2026" },
    { id: 4, fecha: "2026-06-12", proceso: "Devolución mes mayo", cuentaOrigen: "Cuenta General / fondos comunes", cuentaDestino: "JUNJI",               monto: -8000000,   rex: "REX 296 del 12/06/2026" },
  ],
};

const LOGO_B64 = "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";

/* --------------------------------- Utils --------------------------------- */

function fmtCLP(n) {
  const v = Math.round(Number(n) || 0);
  const abs = Math.abs(v).toLocaleString("es-CL");
  return (v < 0 ? "-$" : "$") + abs;
}
function fmtNum(n) {
  const v = Math.round(Number(n) || 0);
  return v.toLocaleString("es-CL");
}
function fmtPct(n) {
  if (!isFinite(n)) return "0,0%";
  return (n * 100).toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";
}
function nowStamp() {
  const d = new Date();
  return d.toLocaleString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function uid() { return Date.now() + "-" + Math.random().toString(36).slice(2, 8); }
function computeDetalleSum(entries) {
  return (entries || []).reduce((s, e) => s + (Number(e.monto) || 0), 0);
}

/* ---------------------------- Lógica de cálculo --------------------------- */

function computeFuente(f, mode) {
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

function computeMonthTotals(monthData) {
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

function computeAccumulated(monthTotalsArr) {
  let acc = 0;
  return monthTotalsArr.map((mt) => { acc += mt.f16; return acc; });
}

/* Estructura Déficit / Traspasos ------------------------------------------ */

function computeEstructura(estructura) {
  const groups = {};
  let ingresosFinal = 0, gastoRemuFinal = 0, st2229Final = 0, diferenciaFinal = 0;
  Object.entries(estructura.grupos).forEach(([key, g]) => {
    const cdIngresos = g.cd ? (g.cdIngresos || 0) : 0;
    const cdGasto = g.cd ? (g.cdGasto || 0) : 0;
    const totalIngresos = (g.ingresos || 0) + cdIngresos;
    const totalGastoRemu = g.gastoRemu || 0;
    const totalGastos = totalGastoRemu + (g.gastoST2229 || 0);
    const diferencia = totalIngresos - totalGastos;
    const cdDeficit = g.cd ? cdIngresos - cdGasto : null;
    groups[key] = { ...g, totalIngresos, totalGastoRemu, totalGastos, diferencia, cdDeficit };
    ingresosFinal += totalIngresos;
    gastoRemuFinal += totalGastoRemu;
    st2229Final += g.gastoST2229 || 0;
    if (g.incluirTotal) diferenciaFinal += diferencia;
  });

  const j = estructura.junji;
  const junjiIngresos = (j.operacion.ingresos || 0) + (j.cd.ingresos || 0) + (j.homologacion.ingresos || 0);
  const junjiGasto = (j.operacion.gasto || 0) + (j.cd.gasto || 0) + (j.homologacion.gasto || 0);
  const junjiTotalGastos = junjiGasto + (j.gastoST2229 || 0);
  const junjiDiferencia = junjiIngresos - junjiTotalGastos;
  const junjiCalc = { ingresos: junjiIngresos, gasto: junjiGasto, totalGastos: junjiTotalGastos, diferencia: junjiDiferencia };
  ingresosFinal += junjiIngresos;
  gastoRemuFinal += junjiGasto;
  st2229Final += j.gastoST2229 || 0;
  if (j.incluirTotal) diferenciaFinal += junjiDiferencia;

  const sacadosSum = (estructura.sacados || []).reduce((s, r) => s + (r.monto || 0), 0);
  const deficitAcumuladoAPedir = diferenciaFinal + sacadosSum;

  return { groups, junjiCalc, ingresosFinal, gastoRemuFinal, st2229Final, diferenciaFinal, sacadosSum, deficitAcumuladoAPedir };
}

/* ------------------------------ UI Primitives ----------------------------- */

const COLORS = {
  navy: "#014F86",
  navyDark: "#012A47",
  steel: "#2C6E8E",
  mist: "#EAF2F8",
  paper: "#F7F5EF",
  ink: "#1B2733",
  inkSoft: "#5B6B78",
  line: "#DDE3E8",
  success: "#1E7B4D",
  successBg: "#E7F5EC",
  danger: "#B23A2E",
  dangerBg: "#FBEAE7",
  warning: "#9C6B0A",
  warningBg: "#FBF3DE",
};

function Badge({ tone = "neutral", children, style }) {
  const tones = {
    neutral: { bg: "#EEF1F4", fg: COLORS.inkSoft },
    success: { bg: COLORS.successBg, fg: COLORS.success },
    danger: { bg: COLORS.dangerBg, fg: COLORS.danger },
    warning: { bg: COLORS.warningBg, fg: COLORS.warning },
    navy: { bg: COLORS.mist, fg: COLORS.navy },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
      style={{ background: t.bg, color: t.fg, ...style }}
    >
      {children}
    </span>
  );
}

function EditableCell({ value, onCommit, align = "right", width = 128, disabled = false, placeholder }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? 0));

  useEffect(() => { if (!editing) setDraft(String(value ?? 0)); }, [value, editing]);

  return (
    <input
      type="text"
      inputMode="numeric"
      disabled={disabled}
      placeholder={placeholder}
      value={editing ? draft : fmtNum(value)}
      onFocus={(e) => { setEditing(true); setDraft(value ? String(value) : ""); e.target.select(); }}
      onChange={(e) => setDraft(e.target.value.replace(/[^-0-9]/g, ""))}
      onBlur={() => {
        setEditing(false);
        const num = draft === "" || draft === "-" ? 0 : parseInt(draft, 10);
        if (num !== value) onCommit(num);
      }}
      onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
      style={{
        width,
        textAlign: align,
        fontFamily: "var(--font-mono)",
        fontSize: 13,
        padding: "6px 8px",
        borderRadius: 6,
        border: `1px solid ${editing ? COLORS.navy : "transparent"}`,
        background: disabled ? "transparent" : editing ? "#fff" : "#F3F6F8",
        color: COLORS.ink,
        outline: "none",
        transition: "background .12s, border-color .12s",
      }}
      className={disabled ? "" : "hover:bg-white"}
    />
  );
}

function TextCell({ value, onCommit, width = 200, placeholder }) {
  const [draft, setDraft] = useState(value || "");
  useEffect(() => setDraft(value || ""), [value]);
  return (
    <input
      type="text"
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => { if (draft !== value) onCommit(draft); }}
      style={{
        width, fontSize: 12.5, padding: "6px 8px", borderRadius: 6,
        border: "1px solid transparent", background: "#F3F6F8", color: COLORS.inkSoft,
        outline: "none", fontFamily: "var(--font-sans)",
      }}
      className="hover:bg-white focus:bg-white focus:border-slate-300"
    />
  );
}

function DeficitTag({ value, small }) {
  const positive = value >= 0;
  return (
    <span
      className={"inline-flex items-center gap-1 font-semibold " + (small ? "text-xs" : "text-sm")}
      style={{ color: positive ? COLORS.success : COLORS.danger, fontFamily: "var(--font-mono)" }}
    >
      {positive ? <TrendingUp size={small ? 12 : 14} /> : <TrendingDown size={small ? 12 : 14} />}
      {fmtCLP(value)}
    </span>
  );
}

/* --------------------------------- Header --------------------------------- */

function StampBadge({ children, tone }) {
  const color = tone === "danger" ? COLORS.danger : tone === "success" ? COLORS.success : COLORS.warning;
  return (
    <span
      className="inline-block font-bold uppercase tracking-wide text-[11px] px-2 py-1 rounded-md"
      style={{
        color: "#fff",
        background: color,
        WebkitTextStroke: "0.4px rgba(0,0,0,0.15)",
        boxShadow: "0 2px 0 rgba(0,0,0,0.12)",
        transform: "rotate(-1.5deg)",
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </span>
  );
}

/* ==================================== APP ================================= */

export default function App() {
  const [months, setMonths] = useState(SEED_MONTHS);
  const [eneroDetalle, setEneroDetalle] = useState(ENERO_DETALLE_SEED);
  const [estructura, setEstructura] = useState(ESTRUCTURA_SEED);
  const [changeLog, setChangeLog] = useState([]);
  const [corte, setCorte] = useState(12);
  const [activeTab, setActiveTab] = useState("datos");
  const [selectedMonth, setSelectedMonth] = useState(6);
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [reportModal, setReportModal] = useState(null); // { tabLabel, subject, body, showMarkReported }
  const [printTarget, setPrintTarget] = useState(null); // 'datos' | 'resumen' | 'estructura' | 'bitacora'
  const [detalleModal, setDetalleModal] = useState(null); // { monthIdx, fuenteKey, field, label }
  const [detalleEstructuraModal, setDetalleEstructuraModal] = useState(null); // { targetKey, field, label }
  const [copied, setCopied] = useState(false);
  const saveTimer = useRef(null);

  /* ---- limpia el objetivo de impresión después de imprimir ---- */
  useEffect(() => {
    const reset = () => setPrintTarget(null);
    window.addEventListener("afterprint", reset);
    return () => window.removeEventListener("afterprint", reset);
  }, []);

  /* ---- carga inicial desde almacenamiento del artefacto ---- */
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("slep-deficit-dashboard-v1", false);
        if (r && r.value) {
          const parsed = JSON.parse(r.value);
          if (parsed.months) setMonths(parsed.months);
          if (parsed.eneroDetalle) setEneroDetalle(parsed.eneroDetalle);
          if (parsed.estructura) setEstructura(parsed.estructura);
          if (parsed.changeLog) setChangeLog(parsed.changeLog);
          if (parsed.corte) setCorte(parsed.corte);
        }
      } catch (e) { /* sin datos guardados aún */ }
      setLoaded(true);
    })();
  }, []);

  /* ---- autoguardado (debounced) ---- */
  useEffect(() => {
    if (!loaded) return;
    setSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await window.storage.set("slep-deficit-dashboard-v1", JSON.stringify({ months, eneroDetalle, estructura, changeLog, corte }), false);
        setSaveStatus("saved");
      } catch (e) { setSaveStatus("idle"); }
    }, 700);
    return () => clearTimeout(saveTimer.current);
  }, [months, eneroDetalle, estructura, changeLog, corte, loaded]);

  const monthTotals = useMemo(() => months.map(computeMonthTotals), [months]);
  const accumulated = useMemo(() => computeAccumulated(monthTotals), [monthTotals]);
  const estructuraCalc = useMemo(() => computeEstructura(estructura), [estructura]);

  const logChange = useCallback((section, mes, concepto, campo, oldVal, newVal) => {
    setChangeLog((prev) => [
      { id: uid(), ts: new Date().toISOString(), tsLabel: nowStamp(), section, mes, concepto, campo, oldVal, newVal, nota: "", incluido: true },
      ...prev,
    ]);
  }, []);

  function updateFuenteField(monthIdx, fuenteKey, field, newVal) {
    setMonths((prev) => {
      const next = prev.slice();
      const monthCopy = { ...next[monthIdx] };
      const fuenteCopy = { ...monthCopy[fuenteKey] };
      const oldVal = fuenteCopy[field] || 0;
      fuenteCopy[field] = newVal;
      monthCopy[fuenteKey] = fuenteCopy;
      next[monthIdx] = monthCopy;
      const fLabel = FUENTE_DEFS.find((f) => f.key === fuenteKey)?.label || fuenteKey;
      logChange("Datos Mensuales", MONTHS[monthIdx], fLabel, FIELD_LABELS[field] || field, oldVal, newVal);
      return next;
    });
  }

  function updateFuenteObs(monthIdx, fuenteKey, text) {
    setMonths((prev) => {
      const next = prev.slice();
      const monthCopy = { ...next[monthIdx] };
      monthCopy[fuenteKey] = { ...monthCopy[fuenteKey], obs: text };
      next[monthIdx] = monthCopy;
      return next;
    });
  }

  /* ---- Detalle (fecha/concepto/monto) de Ingresos y Remuneraciones por fuente ---- */
  function openDetalle(monthIdx, fuenteKey, field, label) {
    setDetalleModal({ monthIdx, fuenteKey, field, label });
  }

  function mutateDetalle(monthIdx, fuenteKey, field, mutateFn) {
    setMonths((prev) => {
      const next = prev.slice();
      const monthCopy = { ...next[monthIdx] };
      const fuenteCopy = { ...monthCopy[fuenteKey] };
      const detKey = field + "Detalle";
      const oldEntries = fuenteCopy[detKey] || [];
      const oldTotal = computeDetalleSum(oldEntries);
      const currentFieldValue = fuenteCopy[field] || 0;
      const newEntries = mutateFn(oldEntries, currentFieldValue);
      fuenteCopy[detKey] = newEntries;
      const newTotal = computeDetalleSum(newEntries);
      if (newEntries.length > 0) fuenteCopy[field] = newTotal;
      monthCopy[fuenteKey] = fuenteCopy;
      next[monthIdx] = monthCopy;
      if (newEntries.length > 0 && oldTotal !== newTotal) {
        const fLabel = FUENTE_DEFS.find((f) => f.key === fuenteKey)?.label || fuenteKey;
        logChange("Datos Mensuales", MONTHS[monthIdx], fLabel, (FIELD_LABELS[field] || field) + " (detalle)", oldTotal, newTotal);
      }
      return next;
    });
  }

  function addDetalleEntry(monthIdx, fuenteKey, field) {
    mutateDetalle(monthIdx, fuenteKey, field, (entries, currentValue) => {
      const seedMonto = entries.length === 0 ? currentValue : 0;
      return [...entries, { id: uid(), fecha: "", concepto: "", monto: seedMonto }];
    });
  }

  function updateDetalleEntry(monthIdx, fuenteKey, field, entryId, prop, value) {
    mutateDetalle(monthIdx, fuenteKey, field, (entries) =>
      entries.map((e) => (e.id === entryId ? { ...e, [prop]: value } : e))
    );
  }

  function removeDetalleEntry(monthIdx, fuenteKey, field, entryId) {
    mutateDetalle(monthIdx, fuenteKey, field, (entries) => entries.filter((e) => e.id !== entryId));
  }

  /* ---- Detalle (fecha/concepto/monto) para montos en Estructura / Traspasos ---- */
  function getEstructuraTarget(est, targetKey) {
    if (targetKey.startsWith("grupo:")) return est.grupos[targetKey.split(":")[1]];
    if (targetKey.startsWith("junjiSub:")) return est.junji[targetKey.split(":")[1]];
    if (targetKey === "junjiTotal") return est.junji;
    return {};
  }
  function setEstructuraTarget(est, targetKey, newTarget) {
    if (targetKey.startsWith("grupo:")) {
      const key = targetKey.split(":")[1];
      return { ...est, grupos: { ...est.grupos, [key]: newTarget } };
    }
    if (targetKey.startsWith("junjiSub:")) {
      const sub = targetKey.split(":")[1];
      return { ...est, junji: { ...est.junji, [sub]: newTarget } };
    }
    if (targetKey === "junjiTotal") {
      return { ...est, junji: { ...est.junji, ...newTarget } };
    }
    return est;
  }

  function openDetalleEstructura(targetKey, field, label) {
    setDetalleEstructuraModal({ targetKey, field, label });
  }

  function mutateDetalleEstructura(targetKey, field, label, mutateFn) {
    setEstructura((prev) => {
      const target = getEstructuraTarget(prev, targetKey) || {};
      const detKey = field + "Detalle";
      const oldEntries = target[detKey] || [];
      const oldTotal = computeDetalleSum(oldEntries);
      const currentValue = target[field] || 0;
      const newEntries = mutateFn(oldEntries, currentValue);
      const newTotal = computeDetalleSum(newEntries);
      const newTarget = { ...target, [detKey]: newEntries };
      if (newEntries.length > 0) newTarget[field] = newTotal;
      const next = setEstructuraTarget(prev, targetKey, newTarget);
      if (newEntries.length > 0 && oldTotal !== newTotal) {
        logChange("Traspasos entre Cuentas", prev.periodo, label, (FIELD_LABELS[field] || field) + " (detalle)", oldTotal, newTotal);
      }
      return next;
    });
  }

  function addDetalleEntryEstructura(targetKey, field, label) {
    mutateDetalleEstructura(targetKey, field, label, (entries, currentValue) => {
      const seedMonto = entries.length === 0 ? currentValue : 0;
      return [...entries, { id: uid(), fecha: "", concepto: "", monto: seedMonto }];
    });
  }
  function updateDetalleEntryEstructura(targetKey, field, label, entryId, prop, value) {
    mutateDetalleEstructura(targetKey, field, label, (entries) =>
      entries.map((e) => (e.id === entryId ? { ...e, [prop]: value } : e))
    );
  }
  function removeDetalleEntryEstructura(targetKey, field, label, entryId) {
    mutateDetalleEstructura(targetKey, field, label, (entries) => entries.filter((e) => e.id !== entryId));
  }

  function updateMonthMeta(monthIdx, field, newVal) {
    setMonths((prev) => {
      const next = prev.slice();
      const oldVal = next[monthIdx][field];
      next[monthIdx] = { ...next[monthIdx], [field]: newVal };
      if (oldVal !== newVal && field !== "tipo") {
        logChange("Datos Mensuales", MONTHS[monthIdx], "Ajuste mensual", FIELD_LABELS[field] || field, oldVal, newVal);
      }
      return next;
    });
  }

  function aplicarPromedioReal(monthIdx) {
    const realIdx = [];
    for (let i = monthIdx - 1; i >= 0 && realIdx.length < 3; i--) {
      if (months[i].tipo === "Real") realIdx.unshift(i);
    }
    if (realIdx.length === 0) return;
    setMonths((prev) => {
      const next = prev.slice();
      const monthCopy = { ...next[monthIdx] };
      FUENTE_DEFS.forEach((fd) => {
        if (fd.mode === "prorretencion") return;
        const avgIngresos = Math.round(realIdx.reduce((s, i) => s + (prev[i][fd.key].ingresos || 0), 0) / realIdx.length);
        const avgRemu = Math.round(realIdx.reduce((s, i) => s + (prev[i][fd.key].remuneraciones || 0), 0) / realIdx.length);
        const fuenteCopy = { ...monthCopy[fd.key], ingresos: avgIngresos, remuneraciones: avgRemu };
        if (fd.mode === "sep") fuenteCopy.saldoParaRemu = avgRemu;
        monthCopy[fd.key] = fuenteCopy;
      });
      next[monthIdx] = monthCopy;
      logChange("Datos Mensuales", MONTHS[monthIdx], "Proyección automática", "Todas las fuentes",
        "—", "Promedio " + realIdx.map((i) => MONTHS_SHORT[i]).join("/"));
      return next;
    });
  }

  function updateEneroDetalle(field, newVal) {
    setEneroDetalle((prev) => {
      const oldVal = prev[field];
      if (oldVal !== newVal) logChange("Datos Mensuales", "Enero", "Detalle FAEP", FIELD_LABELS[field] || field, oldVal, newVal);
      return { ...prev, [field]: newVal };
    });
  }

  function updateEstructuraGrupo(key, field, newVal) {
    setEstructura((prev) => {
      const g = prev.grupos[key];
      const oldVal = g[field];
      if (oldVal !== newVal) logChange("Estructura Déficit", prev.periodo, prev.grupos[key].label, FIELD_LABELS[field] || field, oldVal, newVal);
      return { ...prev, grupos: { ...prev.grupos, [key]: { ...g, [field]: newVal } } };
    });
  }

  function updateEstructuraJunji(sub, field, newVal) {
    setEstructura((prev) => {
      const oldVal = sub === "gastoST2229" ? prev.junji.gastoST2229 : prev.junji[sub][field];
      const next = { ...prev, junji: { ...prev.junji } };
      if (sub === "gastoST2229") next.junji.gastoST2229 = newVal;
      else next.junji[sub] = { ...prev.junji[sub], [field]: newVal };
      if (oldVal !== newVal) logChange("Estructura Déficit", prev.periodo, "JUNJI", FIELD_LABELS[field] || field, oldVal, newVal);
      return next;
    });
  }

  function toggleIncluirTotal(key, isJunji) {
    setEstructura((prev) => {
      if (isJunji) return { ...prev, junji: { ...prev.junji, incluirTotal: !prev.junji.incluirTotal } };
      const g = prev.grupos[key];
      return { ...prev, grupos: { ...prev.grupos, [key]: { ...g, incluirTotal: !g.incluirTotal } } };
    });
  }

  function updatePeriodo(text) { setEstructura((prev) => ({ ...prev, periodo: text })); }

  function addSacado() {
    setEstructura((prev) => ({ ...prev, sacados: [...prev.sacados, { id: uid(), fecha: "", proceso: "", cuentaOrigen: "", cuentaDestino: "", monto: 0, rex: "" }] }));
  }
  function updateSacado(id, field, val) {
    setEstructura((prev) => ({ ...prev, sacados: prev.sacados.map((s) => (s.id === id ? { ...s, [field]: val } : s)) }));
  }
  function removeSacado(id) {
    setEstructura((prev) => ({ ...prev, sacados: prev.sacados.filter((s) => s.id !== id) }));
  }

  function updateLogNota(id, nota) {
    setChangeLog((prev) => prev.map((c) => (c.id === id ? { ...c, nota } : c)));
  }
  function toggleLogIncluido(id) {
    setChangeLog((prev) => prev.map((c) => (c.id === id ? { ...c, incluido: !c.incluido } : c)));
  }
  function removeLogEntry(id) {
    setChangeLog((prev) => prev.filter((c) => c.id !== id));
  }
  function marcarReportados() {
    setChangeLog((prev) => prev.map((c) => (c.incluido ? { ...c, reportado: true, incluido: false } : c)));
  }

  const pendingChanges = changeLog.filter((c) => c.incluido && !c.reportado);

  function handleCopyReport() {
    if (!reportModal) return;
    const text = `Asunto: ${reportModal.subject}\n\n${reportModal.body}`;
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function handlePrint(target) {
    setPrintTarget(target);
    setTimeout(() => window.print(), 60);
  }

  /* ---- Datos Mensuales: reportes independientes de esa pestaña ---- */
  function openDatosReport() {
    const r = buildDatosMensualReport({ monthIdx: selectedMonth, monthData: months[selectedMonth], monthTotal: monthTotals[selectedMonth], accumulated });
    setReportModal({ tabLabel: "Datos Mensuales", ...r, showMarkReported: false });
  }
  function exportDatosExcel() {
    exportDatosMensualExcel(selectedMonth, months[selectedMonth], monthTotals[selectedMonth]);
  }

  /* ---- Resumen Ejecutivo: reportes independientes de esa pestaña ---- */
  function openResumenReport() {
    const r = buildResumenReport({ corte, monthTotals, accumulated });
    setReportModal({ tabLabel: "Resumen Ejecutivo", ...r, showMarkReported: false });
  }
  function exportResumenExcelHandler() {
    exportResumenExcel(months, monthTotals, accumulated, corte);
  }

  /* ---- Traspasos entre Cuentas: reportes independientes de esa pestaña ---- */
  function openEstructuraReport() {
    const r = buildEstructuraReport({ estructura, estructuraCalc });
    setReportModal({ tabLabel: "Traspasos entre Cuentas", ...r, showMarkReported: false });
  }
  function exportEstructuraExcelHandler() {
    exportEstructuraExcel(estructura, estructuraCalc);
  }

  /* ---- Bitácora: reportes independientes de esa pestaña ---- */
  function openBitacoraReport() {
    const r = buildBitacoraReport({ changes: pendingChanges });
    setReportModal({ tabLabel: "Bitácora de Movimientos", ...r, showMarkReported: true });
  }
  function exportBitacoraExcelHandler() {
    exportBitacoraExcel(changeLog);
  }

  const TABS = [
    { key: "datos", label: "Datos Mensuales", icon: LayoutGrid },
    { key: "resumen", label: "Resumen Ejecutivo", icon: FileSpreadsheet },
    { key: "estructura", label: "Traspasos entre Cuentas", icon: ArrowLeftRight },
    { key: "bitacora", label: "Bitácora de Movimientos", icon: ClipboardList },
  ];

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: COLORS.ink, background: COLORS.paper, minHeight: "100%" }}>
      <style>{STYLE_BLOCK}</style>

      {/* ============================ VISTA IMPRESIÓN ============================ */}
      {printTarget === "datos" && (
        <PrintViewDatos monthIdx={selectedMonth} monthData={months[selectedMonth]} monthTotal={monthTotals[selectedMonth]} eneroDetalle={eneroDetalle} />
      )}
      {printTarget === "resumen" && (
        <PrintViewResumen months={months} monthTotals={monthTotals} accumulated={accumulated} corte={corte} />
      )}
      {printTarget === "estructura" && (
        <PrintViewEstructura estructura={estructura} estructuraCalc={estructuraCalc} />
      )}
      {printTarget === "bitacora" && (
        <PrintViewBitacora changeLog={changeLog} />
      )}

      {/* ============================== VISTA PANTALLA ============================ */}
      <div className="no-print">
        <header
          className="flex items-center justify-between gap-4 px-5 py-3 border-b"
          style={{ background: COLORS.navy, borderColor: COLORS.navyDark }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex items-center justify-center rounded-lg shrink-0"
              style={{ width: 40, height: 40, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              <FileSpreadsheet size={20} color="#fff" />
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-semibold leading-tight truncate" style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>
                Situación de Déficit — Financiamiento Remuneraciones P02
              </h1>
              <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.7)" }}>SLEP Petorca · Subdepartamento de Finanzas · 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <SaveIndicator status={saveStatus} />
            <div style={{ background: "#fff", borderRadius: 8, padding: "5px 12px", display: "flex", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }}>
              <img src={"data:image/webp;base64," + LOGO_B64} alt="Somos SLEP Petorca" style={{ height: 24, width: "auto", display: "block" }} />
            </div>
          </div>
        </header>

        <div className="flex items-center gap-3 px-5 py-2.5 border-b flex-wrap" style={{ background: "#fff", borderColor: COLORS.line }}>
          <nav className="flex items-center gap-1 flex-wrap">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: active ? COLORS.navy : "transparent",
                    color: active ? "#fff" : COLORS.inkSoft,
                  }}
                >
                  <Icon size={15} />
                  {t.label}
                  {t.key === "bitacora" && pendingChanges.length > 0 && (
                    <span
                      className="ml-1 rounded-full text-[10px] font-bold px-1.5"
                      style={{ background: active ? "rgba(255,255,255,0.25)" : COLORS.warningBg, color: active ? "#fff" : COLORS.warning }}
                    >
                      {pendingChanges.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <main className="px-5 py-5 max-w-[1400px] mx-auto">
          {activeTab === "datos" && (
            <DatosMensualesTab
              months={months}
              monthTotals={monthTotals}
              accumulated={accumulated}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              updateFuenteField={updateFuenteField}
              updateFuenteObs={updateFuenteObs}
              updateMonthMeta={updateMonthMeta}
              aplicarPromedioReal={aplicarPromedioReal}
              eneroDetalle={eneroDetalle}
              updateEneroDetalle={updateEneroDetalle}
              onExcel={exportDatosExcel}
              onPDF={() => handlePrint("datos")}
              onReport={openDatosReport}
              onOpenDetalle={openDetalle}
            />
          )}
          {activeTab === "resumen" && (
            <ResumenTab
              months={months}
              monthTotals={monthTotals}
              accumulated={accumulated}
              corte={corte}
              setCorte={setCorte}
              onExcel={exportResumenExcelHandler}
              onPDF={() => handlePrint("resumen")}
              onReport={openResumenReport}
            />
          )}
          {activeTab === "estructura" && (
            <EstructuraTab
              estructura={estructura}
              estructuraCalc={estructuraCalc}
              updatePeriodo={updatePeriodo}
              updateEstructuraGrupo={updateEstructuraGrupo}
              updateEstructuraJunji={updateEstructuraJunji}
              toggleIncluirTotal={toggleIncluirTotal}
              addSacado={addSacado}
              updateSacado={updateSacado}
              removeSacado={removeSacado}
              onExcel={exportEstructuraExcelHandler}
              onPDF={() => handlePrint("estructura")}
              onReport={openEstructuraReport}
              onOpenDetalle={openDetalleEstructura}
            />
          )}
          {activeTab === "bitacora" && (
            <BitacoraTab
              changeLog={changeLog}
              updateLogNota={updateLogNota}
              toggleLogIncluido={toggleLogIncluido}
              removeLogEntry={removeLogEntry}
              pendingChanges={pendingChanges}
              onExcel={exportBitacoraExcelHandler}
              onPDF={() => handlePrint("bitacora")}
              onReport={openBitacoraReport}
            />
          )}
        </main>
      </div>

      {reportModal && (
        <ReportModal
          tabLabel={reportModal.tabLabel}
          subject={reportModal.subject}
          body={reportModal.body}
          onClose={() => setReportModal(null)}
          onCopy={handleCopyReport}
          copied={copied}
          showMarkReported={reportModal.showMarkReported}
          onMarcarReportados={() => { marcarReportados(); setReportModal(null); }}
          pendingCount={pendingChanges.length}
        />
      )}

      {detalleModal && (() => {
        const fuente = months[detalleModal.monthIdx][detalleModal.fuenteKey];
        const entries = fuente[detalleModal.field + "Detalle"] || [];
        return (
          <DetalleModal
            title={`Detalle de ${detalleModal.field === "ingresos" ? "Ingresos" : "Remuneraciones"} — ${detalleModal.label} — ${MONTHS[detalleModal.monthIdx]}`}
            entries={entries}
            total={computeDetalleSum(entries)}
            originalTotal={fuente[detalleModal.field] || 0}
            onAdd={() => addDetalleEntry(detalleModal.monthIdx, detalleModal.fuenteKey, detalleModal.field)}
            onUpdate={(id, prop, val) => updateDetalleEntry(detalleModal.monthIdx, detalleModal.fuenteKey, detalleModal.field, id, prop, val)}
            onRemove={(id) => removeDetalleEntry(detalleModal.monthIdx, detalleModal.fuenteKey, detalleModal.field, id)}
            onClose={() => setDetalleModal(null)}
          />
        );
      })()}

      {detalleEstructuraModal && (() => {
        const target = getEstructuraTarget(estructura, detalleEstructuraModal.targetKey) || {};
        const entries = target[detalleEstructuraModal.field + "Detalle"] || [];
        return (
          <DetalleModal
            title={`Detalle de ${FIELD_LABELS[detalleEstructuraModal.field] || detalleEstructuraModal.field} — ${detalleEstructuraModal.label}`}
            entries={entries}
            total={computeDetalleSum(entries)}
            originalTotal={target[detalleEstructuraModal.field] || 0}
            onAdd={() => addDetalleEntryEstructura(detalleEstructuraModal.targetKey, detalleEstructuraModal.field, detalleEstructuraModal.label)}
            onUpdate={(id, prop, val) => updateDetalleEntryEstructura(detalleEstructuraModal.targetKey, detalleEstructuraModal.field, detalleEstructuraModal.label, id, prop, val)}
            onRemove={(id) => removeDetalleEntryEstructura(detalleEstructuraModal.targetKey, detalleEstructuraModal.field, detalleEstructuraModal.label, id)}
            onClose={() => setDetalleEstructuraModal(null)}
          />
        );
      })()}
    </div>
  );
}

const FIELD_LABELS = {
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

function SaveIndicator({ status }) {
  return (
    <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
      {status === "saving" ? (
        <>
          <Loader2 size={13} className="animate-spin" /> Guardando…
        </>
      ) : status === "saved" ? (
        <>
          <Save size={13} /> Guardado
        </>
      ) : null}
    </div>
  );
}

/* placeholder for component sections appended below */
/* ------------------------------ Tab: Datos ------------------------------ */

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

function AmountCell({ value, onCommit, detalleCount, onOpenDetalle, hideDetalle }) {
  const hasDetalle = detalleCount > 0;
  return (
    <div className="flex items-center justify-end gap-1">
      <EditableCell value={value} onCommit={onCommit} disabled={hasDetalle} />
      {!hideDetalle && (
        <button
          onClick={onOpenDetalle}
          title={hasDetalle ? `Ver detalle (${detalleCount} línea(s))` : "Agregar detalle (fecha, concepto, monto)"}
          className="shrink-0"
          style={{
            width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 6,
            background: hasDetalle ? COLORS.mist : "transparent",
            color: hasDetalle ? COLORS.navy : COLORS.inkSoft,
            border: `1px solid ${hasDetalle ? COLORS.navy : COLORS.line}`,
          }}
        >
          <List size={12} />
        </button>
      )}
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

function FieldBlock({ label, children }) {
  return (
    <div>
      <div className="text-[11px] font-medium mb-1" style={{ color: COLORS.inkSoft }}>{label}</div>
      {children}
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

function DatosMensualesTab({
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

function SectionIntro({ title, desc }) {
  return (
    <div className="mb-4">
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: COLORS.navyDark }}>{title}</h2>
      {desc && <p className="text-sm mt-1" style={{ color: COLORS.inkSoft, maxWidth: 780 }}>{desc}</p>}
    </div>
  );
}

function TabToolbar({ onExcel, onPDF, onReport, reportBadge }) {
  return (
    <div className="flex items-center gap-2 shrink-0 flex-wrap">
      <button className="btn-secondary" onClick={onExcel} title="Exportar Excel de esta pestaña">
        <Download size={14} /> Excel
      </button>
      <button className="btn-secondary" onClick={onPDF} title="Exportar PDF de esta pestaña">
        <Printer size={14} /> PDF
      </button>
      <button className="btn-primary" onClick={onReport} title="Generar reporte por correo de esta pestaña">
        <Mail size={14} /> Reporte
        {!!reportBadge && (
          <span className="rounded-full text-[10px] font-bold px-1.5" style={{ background: "rgba(255,255,255,0.3)" }}>{reportBadge}</span>
        )}
      </button>
    </div>
  );
}


/* ----------------------------- Tab: Resumen ------------------------------ */

function KpiCard({ label, value, tone, sub }) {
  const tones = {
    navy: { bg: COLORS.navy, fg: "#fff" },
    success: { bg: COLORS.successBg, fg: COLORS.success },
    danger: { bg: COLORS.dangerBg, fg: COLORS.danger },
    neutral: { bg: "#fff", fg: COLORS.ink },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <div className="rounded-xl p-4 border" style={{ background: t.bg, borderColor: tone === "navy" ? COLORS.navy : COLORS.line }}>
      <div className="text-xs font-medium" style={{ color: tone === "navy" ? "rgba(255,255,255,0.75)" : COLORS.inkSoft }}>{label}</div>
      <div className="text-xl font-bold mt-1" style={{ color: t.fg, fontFamily: "var(--font-mono)" }}>{value}</div>
      {sub && <div className="text-[11px] mt-0.5" style={{ color: tone === "navy" ? "rgba(255,255,255,0.65)" : COLORS.inkSoft }}>{sub}</div>}
    </div>
  );
}

function ResumenTab({ months, monthTotals, accumulated, corte, setCorte, onExcel, onPDF, onReport }) {
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


/* -------------------------- Tab: Estructura Déficit ----------------------- */

function GrupoRow({ gkey, g, updateEstructuraGrupo, toggleIncluirTotal, onOpenDetalle }) {
  return (
    <React.Fragment>
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
    </React.Fragment>
  );
}

function EstructuraTab({
  estructura, estructuraCalc, updatePeriodo, updateEstructuraGrupo, updateEstructuraJunji,
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
            {Object.entries(estructuraCalc.groups).map(([key, g]) => (
              <GrupoRow key={key} gkey={key} g={g} updateEstructuraGrupo={updateEstructuraGrupo} toggleIncluirTotal={toggleIncluirTotal} onOpenDetalle={onOpenDetalle} />
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
                  <td className="td-cell text-right font-mono text-xs">{fmtNum(j[sub].ingresos - j[sub].gasto)}</td>
                  <td className="td-cell"></td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: COLORS.mist }}>
              <td className="td-cell font-bold">Total Final</td>
              <td className="td-cell text-right font-mono font-semibold">{fmtNum(estructuraCalc.ingresosFinal)}</td>
              <td className="td-cell text-right font-mono font-semibold">{fmtNum(estructuraCalc.gastoRemuFinal)}</td>
              <td className="td-cell text-right font-mono font-semibold">{fmtNum(estructuraCalc.st2229Final)}</td>
              <td className="td-cell text-right font-mono font-semibold">—</td>
              <td className="td-cell text-right"><DeficitTag value={estructuraCalc.diferenciaFinal} /></td>
              <td className="td-cell"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="text-[11px] mb-6 -mt-2" style={{ color: COLORS.inkSoft }}>
        "En total" marca qué subvenciones se suman en la Diferencia Total Final. Por defecto SEP queda fuera (como en la planilla original), ya que su déficit/superávit se autocontiene dentro de la propia subvención. Ajusta la casilla si tu criterio cambia.
      </p>

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
          <table className="w-full text-sm border-collapse" style={{ minWidth: 880 }}>
            <thead>
              <tr style={{ background: COLORS.mist }}>
                <th className="th-cell text-left" style={{ width: 130 }}>Fecha</th>
                <th className="th-cell text-left">Proceso / Motivo</th>
                <th className="th-cell text-left">Cuenta Origen (Desde)</th>
                <th className="th-cell text-left">Cuenta Destino (Hacia)</th>
                <th className="th-cell text-right">Monto</th>
                <th className="th-cell text-left">N° REX</th>
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
                  <td className="td-cell"><TextCell value={s.proceso} onCommit={(v) => updateSacado(s.id, "proceso", v)} width={170} placeholder="Ej: Remuneraciones julio" /></td>
                  <td className="td-cell"><TextCell value={s.cuentaOrigen} onCommit={(v) => updateSacado(s.id, "cuentaOrigen", v)} width={160} placeholder="Ej: Cuenta General" /></td>
                  <td className="td-cell"><TextCell value={s.cuentaDestino} onCommit={(v) => updateSacado(s.id, "cuentaDestino", v)} width={160} placeholder="Ej: SEP" /></td>
                  <td className="td-cell text-right"><EditableCell value={s.monto} onCommit={(v) => updateSacado(s.id, "monto", v)} /></td>
                  <td className="td-cell"><TextCell value={s.rex} onCommit={(v) => updateSacado(s.id, "rex", v)} width={170} placeholder="Ej: REX 296 del 12/06/2026" /></td>
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
          <div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Déficit acumulado total a pedir en oficio</div>
          <div className="text-2xl font-bold mt-1" style={{ color: "#fff", fontFamily: "var(--font-mono)" }}>{fmtCLP(estructuraCalc.deficitAcumuladoAPedir)}</div>
        </div>
        <div className="text-xs text-right" style={{ color: "rgba(255,255,255,0.75)", maxWidth: 360 }}>
          Diferencia Total Final ({fmtCLP(estructuraCalc.diferenciaFinal)}) + traspasos ya registrados ({fmtCLP(estructuraCalc.sacadosSum)}).
        </div>
      </div>
    </div>
  );
}


/* ----------------------------- Tab: Bitácora ------------------------------ */

function BitacoraTab({ changeLog, updateLogNota, toggleLogIncluido, removeLogEntry, pendingChanges, onExcel, onPDF, onReport }) {
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

/* ------------------------------- Detalle Modal (desglose fecha/concepto/monto) ------------------------------ */

function DetalleModal({ title, entries, total, originalTotal, onAdd, onUpdate, onRemove, onClose }) {
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

/* ------------------------------- Report Modal (genérico) ------------------------------ */

function ReportModal({ tabLabel, subject, body, onClose, onCopy, copied, showMarkReported, onMarcarReportados, pendingCount }) {
  return (
    <div className="modal-overlay no-print" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: COLORS.line }}>
          <div className="flex items-center gap-2">
            <Mail size={16} color={COLORS.navy} />
            <h3 className="font-semibold" style={{ color: COLORS.navyDark }}>Reporte por correo — {tabLabel}</h3>
          </div>
          <button onClick={onClose}><X size={18} color={COLORS.inkSoft} /></button>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs mb-3" style={{ color: COLORS.inkSoft }}>
            Texto independiente del Excel/PDF de esta pestaña, listo para copiar y pegar en un correo a Paulina Sáez Kifafi y Javier Ilabaca Barraza.
          </p>
          <FieldBlock label="Asunto">
            <input
              readOnly
              value={subject}
              className="w-full text-xs rounded-lg border px-3 py-2 mb-3"
              style={{ borderColor: COLORS.line, fontFamily: "var(--font-sans)", color: COLORS.ink }}
            />
          </FieldBlock>
          <FieldBlock label="Cuerpo del mensaje">
            <textarea
              readOnly
              value={body}
              className="w-full text-xs rounded-lg border p-3"
              style={{ height: 300, borderColor: COLORS.line, fontFamily: "var(--font-mono)", color: COLORS.ink, resize: "vertical" }}
            />
          </FieldBlock>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: COLORS.line }}>
          <button className="btn-secondary" onClick={onCopy}>
            {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar asunto y cuerpo</>}
          </button>
          {showMarkReported && (
            <button className="btn-primary" onClick={onMarcarReportados} disabled={pendingCount === 0}>
              <Check size={14} /> Marcar como reportado
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Print Views (uno por pestaña) ------------------------------- */

function PrintHeader({ title, subtitle }) {
  return (
    <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: "#ccc" }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>{title}</h1>
        <div style={{ fontSize: 11, color: "#555" }}>SLEP Petorca · {subtitle} · Generado {nowStamp()}</div>
      </div>
      <img src={"data:image/webp;base64," + LOGO_B64} alt="Somos SLEP Petorca" style={{ height: 40 }} />
    </div>
  );
}

const printCellStyle = { border: "1px solid #ccc", padding: "3px 6px" };
const printCellStyleR = { border: "1px solid #ccc", padding: "3px 6px", textAlign: "right" };
const printHeadStyle = { border: "1px solid #ccc", padding: "4px 6px", background: "#eef2f5", textAlign: "right" };

function PrintViewDatos({ monthIdx, monthData, monthTotal, eneroDetalle }) {
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

function PrintViewResumen({ months, monthTotals, accumulated, corte }) {
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

function PrintViewEstructura({ estructura, estructuraCalc }) {
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
          {Object.values(estructuraCalc.groups).map((g) => (
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
        </tbody>
        <tfoot>
          <tr style={{ fontWeight: 700 }}>
            <td style={printCellStyle} colSpan={3}>Diferencia Total Final</td>
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
        <tfoot>
          <tr style={{ fontWeight: 700 }}>
            <td style={printCellStyle} colSpan={5}>Déficit acumulado total a pedir en oficio</td>
            <td style={printCellStyleR}>{fmtCLP(estructuraCalc.deficitAcumuladoAPedir)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function PrintViewBitacora({ changeLog }) {
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
              <td style={printCellStyleR}>{typeof c.oldVal === "number" ? fmtNum(c.oldVal) : c.oldVal}</td>
              <td style={printCellStyleR}>{typeof c.newVal === "number" ? fmtNum(c.newVal) : c.newVal}</td>
              <td style={printCellStyle}>{c.nota || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


/* placeholder for report + excel builders appended below */
/* ============================================================================
   Cada pestaña tiene sus propios reportes independientes:
   - Excel: exporta solo los datos de esa pestaña (funciones exportXxxExcel)
   - PDF: vista de impresión propia de esa pestaña (ver PrintView en part4)
   - Correo: texto narrativo propio, redactado para jefatura — NO es un volcado
     de los datos del Excel/PDF, es un resumen independiente (funciones buildXxxReport)
   ============================================================================ */

/* ------------------------- Reportes por correo (narrativos) ------------------------- */

function buildDatosMensualReport({ monthIdx, monthData, monthTotal, accumulated }) {
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

function buildResumenReport({ corte, monthTotals, accumulated }) {
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

function buildEstructuraReport({ estructura, estructuraCalc }) {
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

function buildBitacoraReport({ changes }) {
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

/* -------------------------------- Excel: hojas (AOA) ------------------------------ */

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
  Object.values(estructuraCalc.groups).forEach((g) => {
    aoa.push([g.label, g.totalIngresos, g.totalGastoRemu, g.gastoST2229, g.totalGastos, g.diferencia, g.incluirTotal ? "Sí" : "No"]);
    if (g.cd) {
      aoa.push(["  ↳ Carrera Docente", g.cdIngresos, g.cdGasto, "", "", g.cdDeficit, ""]);
    }
  });
  const jc = estructuraCalc.junjiCalc;
  aoa.push(["JUNJI", jc.ingresos, jc.gasto, estructura.junji.gastoST2229, jc.totalGastos, jc.diferencia, estructura.junji.incluirTotal ? "Sí" : "No"]);
  aoa.push([]);
  aoa.push(["Total Final (Diferencia)", "", "", "", "", estructuraCalc.diferenciaFinal]);
  aoa.push([]);
  aoa.push(["Registro de traspasos entre cuentas (REX)"]);
  aoa.push(["Fecha", "Proceso / Motivo", "Cuenta Origen (Desde)", "Cuenta Destino (Hacia)", "Monto", "N° REX"]);
  estructura.sacados.forEach((s) => aoa.push([s.fecha || "", s.proceso || "", s.cuentaOrigen || "", s.cuentaDestino || "", s.monto, s.rex || ""]));
  aoa.push([]);
  aoa.push(["Déficit acumulado total a pedir en oficio", "", "", "", "", estructuraCalc.deficitAcumuladoAPedir]);

  const detailRows = [];
  Object.entries(estructura.grupos).forEach(([key, g]) => {
    (g.ingresosDetalle || []).forEach((e) => detailRows.push([g.label, "Ingresos", e.fecha || "", e.concepto || "", e.monto || 0]));
    (g.gastoRemuDetalle || []).forEach((e) => detailRows.push([g.label, "Gasto Remuneraciones", e.fecha || "", e.concepto || "", e.monto || 0]));
    (g.gastoST2229Detalle || []).forEach((e) => detailRows.push([g.label, "Gasto Subt. 22 y 29", e.fecha || "", e.concepto || "", e.monto || 0]));
    (g.cdIngresosDetalle || []).forEach((e) => detailRows.push([`Carrera Docente — ${g.label}`, "Ingresos", e.fecha || "", e.concepto || "", e.monto || 0]));
    (g.cdGastoDetalle || []).forEach((e) => detailRows.push([`Carrera Docente — ${g.label}`, "Gasto", e.fecha || "", e.concepto || "", e.monto || 0]));
  });
  (estructura.junji.gastoST2229Detalle || []).forEach((e) => detailRows.push(["JUNJI", "Gasto Subt. 22 y 29", e.fecha || "", e.concepto || "", e.monto || 0]));
  ["operacion", "cd", "homologacion"].forEach((sub) => {
    const label = "JUNJI " + (sub === "operacion" ? "Operación" : sub === "cd" ? "Convenio CD" : "Homologación");
    (estructura.junji[sub].ingresosDetalle || []).forEach((e) => detailRows.push([label, "Ingresos", e.fecha || "", e.concepto || "", e.monto || 0]));
    (estructura.junji[sub].gastoDetalle || []).forEach((e) => detailRows.push([label, "Gasto", e.fecha || "", e.concepto || "", e.monto || 0]));
  });
  if (detailRows.length) {
    aoa.push([]);
    aoa.push(["Detalle de Ingresos y Gastos por subvención"]);
    aoa.push(["Subvención", "Tipo", "Fecha", "Concepto", "Monto"]);
    detailRows.forEach((r) => aoa.push(r));
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

function exportDatosMensualExcel(monthIdx, monthData, monthTotal) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(monthSheetAOA(monthIdx, monthData, monthTotal));
  ws["!cols"] = [{ wch: 24 }, { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 30 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws, MONTHS_SHORT[monthIdx] + " " + (monthIdx + 1));
  XLSX.writeFile(wb, `SLEP_Petorca_${MONTHS[monthIdx]}2026.xlsx`);
}

function exportResumenExcel(months, monthTotals, accumulated, corte) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(resumenSheetAOA(months, monthTotals, accumulated, corte));
  ws["!cols"] = [{ wch: 26 }, ...Array(13).fill({ wch: 14 })];
  XLSX.utils.book_append_sheet(wb, ws, "Resumen");
  XLSX.writeFile(wb, `SLEP_Petorca_Resumen_${MONTHS[corte - 1]}2026.xlsx`);
}

function exportEstructuraExcel(estructura, estructuraCalc) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(estructuraSheetAOA(estructura, estructuraCalc));
  ws["!cols"] = [{ wch: 28 }, { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws, "Estructura Deficit");
  XLSX.writeFile(wb, "SLEP_Petorca_Traspasos_Cuentas.xlsx");
}

function exportBitacoraExcel(changeLog) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(bitacoraSheetAOA(changeLog));
  ws["!cols"] = [{ wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 22 }, { wch: 22 }, { wch: 16 }, { wch: 16 }, { wch: 30 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws, "Bitacora");
  XLSX.writeFile(wb, "SLEP_Petorca_Bitacora_Movimientos.xlsx");
}


const STYLE_BLOCK = `
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

:root {
  --font-display: 'Source Serif 4', Georgia, serif;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'IBM Plex Mono', 'SFMono-Regular', Menlo, monospace;
}

* { box-sizing: border-box; }

.th-cell { padding: 9px 10px; font-size: 11.5px; font-weight: 600; color: ${COLORS.navyDark}; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.02em; }
.td-cell { padding: 7px 10px; vertical-align: middle; }

.card { background: #fff; border: 1px solid ${COLORS.line}; border-radius: 12px; padding: 16px; }
.card-title { font-size: 13px; font-weight: 600; color: ${COLORS.navyDark}; }

.computed-value {
  display: inline-block; min-width: 100px; text-align: right;
  font-family: var(--font-mono); font-size: 13px; color: ${COLORS.inkSoft};
  padding: 6px 8px; background: #F9FAFB; border-radius: 6px;
}

.btn-primary, .btn-secondary {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12.5px; font-weight: 600; padding: 7px 12px; border-radius: 8px;
  cursor: pointer; transition: filter .12s, background .12s; border: 1px solid transparent;
  white-space: nowrap;
}
.btn-primary { background: ${COLORS.navy}; color: #fff; }
.btn-primary:hover { filter: brightness(1.08); }
.btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-secondary { background: #fff; color: ${COLORS.navyDark}; border-color: ${COLORS.line}; }
.btn-secondary:hover { background: ${COLORS.mist}; }

.toggle-pill {
  font-size: 11.5px; font-weight: 600; padding: 4px 10px; border-radius: 999px;
  border: 1px solid ${COLORS.line}; color: ${COLORS.inkSoft}; background: #fff; cursor: pointer;
}
.toggle-pill-active { background: ${COLORS.navy}; border-color: ${COLORS.navy}; color: #fff; }
.toggle-pill-active-warn { background: ${COLORS.warning}; border-color: ${COLORS.warning}; color: #fff; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(10, 20, 30, 0.45);
  display: flex; align-items: center; justify-content: center; z-index: 50; padding: 16px;
}
.modal-panel {
  background: #fff; border-radius: 14px; width: 100%; max-width: 640px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25); max-height: 88vh; display: flex; flex-direction: column; overflow: hidden;
}

.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.only-print { display: none; }

@media print {
  .no-print { display: none !important; }
  .only-print { display: block !important; }
  @page { size: A4 landscape; margin: 12mm; }
}

input:focus { outline: none; }
select { outline: none; }
::-webkit-scrollbar { height: 8px; width: 8px; }
::-webkit-scrollbar-thumb { background: #C7D0D8; border-radius: 8px; }
`;

