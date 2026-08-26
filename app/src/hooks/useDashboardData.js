import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  collection, doc, getDocs, onSnapshot, orderBy, query,
  writeBatch, updateDoc, addDoc, deleteDoc, setDoc,
} from "firebase/firestore";
import { auth, db, YEAR } from "../firebase";
import { MONTHS, FIELD_LABELS, computeMonthTotals, computeAccumulated, computeEstructura, FUENTE_DEFS } from "../lib/calc";
import { computeDetalleSum, nowStamp, uid } from "../lib/format";
import seedMonths from "../data/seedMonths.json";
import seedEneroDetalle from "../data/seedEneroDetalle.json";
import seedEstructura from "../data/seedEstructura.json";

const pad = (n) => String(n).padStart(2, "0");
const base = () => `situacionDeficit/${YEAR}`;
const monthRef = (i) => doc(db, `${base()}/months/${pad(i + 1)}`);
const eneroRef = () => doc(db, `${base()}/eneroDetalle/current`);
const estructuraRef = () => doc(db, `${base()}/estructura/current`);
const sacadosCol = () => collection(db, `${base()}/estructura/current/sacados`);
const changeLogCol = () => collection(db, `${base()}/changeLog`);

async function seedIfEmpty() {
  const monthsSnap = await getDocs(collection(db, `${base()}/months`));
  if (!monthsSnap.empty) return;

  const batch = writeBatch(db);
  seedMonths.forEach((m, i) => batch.set(monthRef(i), m));
  batch.set(eneroRef(), seedEneroDetalle);
  const { sacados, ...estructuraDoc } = seedEstructura;
  batch.set(estructuraRef(), estructuraDoc);
  await batch.commit();

  const sacadosBatch = writeBatch(db);
  sacados.forEach((s) => {
    const { id, ...rest } = s;
    sacadosBatch.set(doc(sacadosCol(), String(id)), rest);
  });
  await sacadosBatch.commit();
}

export function useDashboardData() {
  const [months, setMonths] = useState(null);
  const [eneroDetalle, setEneroDetalle] = useState(null);
  const [estructuraBase, setEstructuraBase] = useState(null);
  const [sacados, setSacados] = useState(null);
  const [changeLog, setChangeLog] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle");
  const pending = useRef(0);

  useEffect(() => {
    let unsub = [];
    (async () => {
      await seedIfEmpty();

      unsub.push(onSnapshot(collection(db, `${base()}/months`), (snap) => {
        const arr = new Array(12).fill(null);
        snap.forEach((d) => { arr[Number(d.id) - 1] = d.data(); });
        setMonths(arr);
      }));
      unsub.push(onSnapshot(eneroRef(), (snap) => setEneroDetalle(snap.data() || {})));
      unsub.push(onSnapshot(estructuraRef(), (snap) => setEstructuraBase(snap.data() || {})));
      unsub.push(onSnapshot(sacadosCol(), (snap) => {
        setSacados(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }));
      unsub.push(onSnapshot(query(changeLogCol(), orderBy("ts", "desc")), (snap) => {
        setChangeLog(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }));
    })();
    return () => unsub.forEach((u) => u());
  }, []);

  const estructura = useMemo(() => {
    if (!estructuraBase || !sacados) return null;
    return { ...estructuraBase, sacados };
  }, [estructuraBase, sacados]);

  const loaded = !!(months && eneroDetalle && estructura && changeLog);

  const monthTotals = useMemo(() => (months ? months.map((m) => computeMonthTotals(m || {})) : []), [months]);
  const accumulated = useMemo(() => computeAccumulated(monthTotals), [monthTotals]);
  const estructuraCalc = useMemo(() => (estructura ? computeEstructura(estructura) : null), [estructura]);

  const withSaving = useCallback(async (fn) => {
    pending.current += 1;
    setSaveStatus("saving");
    try {
      await fn();
    } finally {
      pending.current -= 1;
      if (pending.current === 0) setSaveStatus("saved");
    }
  }, []);

  const logChange = useCallback((section, mes, concepto, campo, oldVal, newVal) => {
    return withSaving(() => addDoc(changeLogCol(), {
      ts: Date.now(),
      tsLabel: nowStamp(),
      section, mes, concepto, campo, oldVal, newVal,
      nota: "", incluido: true, reportado: false,
      userEmail: auth.currentUser?.email || "",
    }));
  }, [withSaving]);

  /* ---- Datos Mensuales: fuentes ---- */
  const updateFuenteField = useCallback((monthIdx, fuenteKey, field, newVal) => {
    const oldVal = (months[monthIdx]?.[fuenteKey]?.[field]) || 0;
    const fLabel = FUENTE_DEFS.find((f) => f.key === fuenteKey)?.label || fuenteKey;
    withSaving(() => updateDoc(monthRef(monthIdx), { [`${fuenteKey}.${field}`]: newVal }));
    if (oldVal !== newVal) logChange("Datos Mensuales", MONTHS[monthIdx], fLabel, FIELD_LABELS[field] || field, oldVal, newVal);
  }, [months, withSaving, logChange]);

  const updateFuenteObs = useCallback((monthIdx, fuenteKey, text) => {
    withSaving(() => updateDoc(monthRef(monthIdx), { [`${fuenteKey}.obs`]: text }));
  }, [withSaving]);

  const mutateDetalle = useCallback((monthIdx, fuenteKey, field, mutateFn) => {
    const fuente = months[monthIdx]?.[fuenteKey] || {};
    const detKey = field + "Detalle";
    const oldEntries = fuente[detKey] || [];
    const oldTotal = computeDetalleSum(oldEntries);
    const currentFieldValue = fuente[field] || 0;
    const newEntries = mutateFn(oldEntries, currentFieldValue);
    const newTotal = computeDetalleSum(newEntries);
    const patch = { [`${fuenteKey}.${detKey}`]: newEntries };
    if (newEntries.length > 0) patch[`${fuenteKey}.${field}`] = newTotal;
    withSaving(() => updateDoc(monthRef(monthIdx), patch));
    if (newEntries.length > 0 && oldTotal !== newTotal) {
      const fLabel = FUENTE_DEFS.find((f) => f.key === fuenteKey)?.label || fuenteKey;
      logChange("Datos Mensuales", MONTHS[monthIdx], fLabel, (FIELD_LABELS[field] || field) + " (detalle)", oldTotal, newTotal);
    }
  }, [months, withSaving, logChange]);

  const addDetalleEntry = useCallback((monthIdx, fuenteKey, field) => {
    mutateDetalle(monthIdx, fuenteKey, field, (entries, currentValue) => {
      const seedMonto = entries.length === 0 ? currentValue : 0;
      return [...entries, { id: uid(), fecha: "", concepto: "", monto: seedMonto }];
    });
  }, [mutateDetalle]);

  const updateDetalleEntry = useCallback((monthIdx, fuenteKey, field, entryId, prop, value) => {
    mutateDetalle(monthIdx, fuenteKey, field, (entries) =>
      entries.map((e) => (e.id === entryId ? { ...e, [prop]: value } : e)));
  }, [mutateDetalle]);

  const removeDetalleEntry = useCallback((monthIdx, fuenteKey, field, entryId) => {
    mutateDetalle(monthIdx, fuenteKey, field, (entries) => entries.filter((e) => e.id !== entryId));
  }, [mutateDetalle]);

  const updateMonthMeta = useCallback((monthIdx, field, newVal) => {
    const oldVal = months[monthIdx]?.[field];
    withSaving(() => updateDoc(monthRef(monthIdx), { [field]: newVal }));
    if (oldVal !== newVal && field !== "tipo") {
      logChange("Datos Mensuales", MONTHS[monthIdx], "Ajuste mensual", FIELD_LABELS[field] || field, oldVal, newVal);
    }
  }, [months, withSaving, logChange]);

  const aplicarPromedioReal = useCallback((monthIdx) => {
    const realIdx = [];
    for (let i = monthIdx - 1; i >= 0 && realIdx.length < 3; i--) {
      if (months[i].tipo === "Real") realIdx.unshift(i);
    }
    if (realIdx.length === 0) return;
    const patch = {};
    FUENTE_DEFS.forEach((fd) => {
      if (fd.mode === "prorretencion") return;
      const avgIngresos = Math.round(realIdx.reduce((s, i) => s + (months[i][fd.key].ingresos || 0), 0) / realIdx.length);
      const avgRemu = Math.round(realIdx.reduce((s, i) => s + (months[i][fd.key].remuneraciones || 0), 0) / realIdx.length);
      patch[`${fd.key}.ingresos`] = avgIngresos;
      patch[`${fd.key}.remuneraciones`] = avgRemu;
      if (fd.mode === "sep") patch[`${fd.key}.saldoParaRemu`] = avgRemu;
    });
    withSaving(() => updateDoc(monthRef(monthIdx), patch));
    const MONTHS_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    logChange("Datos Mensuales", MONTHS[monthIdx], "Proyección automática", "Todas las fuentes",
      "—", "Promedio " + realIdx.map((i) => MONTHS_SHORT[i]).join("/"));
  }, [months, withSaving, logChange]);

  const updateEneroDetalle = useCallback((field, newVal) => {
    const oldVal = eneroDetalle?.[field];
    withSaving(() => updateDoc(eneroRef(), { [field]: newVal }));
    if (oldVal !== newVal) logChange("Datos Mensuales", "Enero", "Detalle FAEP", FIELD_LABELS[field] || field, oldVal, newVal);
  }, [eneroDetalle, withSaving, logChange]);

  /* ---- Estructura / Traspasos ---- */
  function getEstructuraTarget(est, targetKey) {
    if (targetKey.startsWith("grupo:")) return est.grupos[targetKey.split(":")[1]];
    if (targetKey.startsWith("junjiSub:")) return est.junji[targetKey.split(":")[1]];
    if (targetKey === "junjiTotal") return est.junji;
    return {};
  }
  function targetFieldPath(targetKey, field) {
    if (targetKey.startsWith("grupo:")) return `grupos.${targetKey.split(":")[1]}.${field}`;
    if (targetKey.startsWith("junjiSub:")) return `junji.${targetKey.split(":")[1]}.${field}`;
    if (targetKey === "junjiTotal") return `junji.${field}`;
    return field;
  }

  const mutateDetalleEstructura = useCallback((targetKey, field, label, mutateFn) => {
    const target = getEstructuraTarget(estructura, targetKey) || {};
    const detKey = field + "Detalle";
    const oldEntries = target[detKey] || [];
    const oldTotal = computeDetalleSum(oldEntries);
    const currentValue = target[field] || 0;
    const newEntries = mutateFn(oldEntries, currentValue);
    const newTotal = computeDetalleSum(newEntries);
    const patch = { [targetFieldPath(targetKey, detKey)]: newEntries };
    if (newEntries.length > 0) patch[targetFieldPath(targetKey, field)] = newTotal;
    withSaving(() => updateDoc(estructuraRef(), patch));
    if (newEntries.length > 0 && oldTotal !== newTotal) {
      logChange("Traspasos entre Cuentas", estructura.periodo, label, (FIELD_LABELS[field] || field) + " (detalle)", oldTotal, newTotal);
    }
  }, [estructura, withSaving, logChange]);

  const addDetalleEntryEstructura = useCallback((targetKey, field, label) => {
    mutateDetalleEstructura(targetKey, field, label, (entries, currentValue) => {
      const seedMonto = entries.length === 0 ? currentValue : 0;
      return [...entries, { id: uid(), fecha: "", concepto: "", monto: seedMonto }];
    });
  }, [mutateDetalleEstructura]);
  const updateDetalleEntryEstructura = useCallback((targetKey, field, label, entryId, prop, value) => {
    mutateDetalleEstructura(targetKey, field, label, (entries) =>
      entries.map((e) => (e.id === entryId ? { ...e, [prop]: value } : e)));
  }, [mutateDetalleEstructura]);
  const removeDetalleEntryEstructura = useCallback((targetKey, field, label, entryId) => {
    mutateDetalleEstructura(targetKey, field, label, (entries) => entries.filter((e) => e.id !== entryId));
  }, [mutateDetalleEstructura]);

  const updateEstructuraGrupo = useCallback((key, field, newVal) => {
    const oldVal = estructura.grupos[key][field];
    withSaving(() => updateDoc(estructuraRef(), { [`grupos.${key}.${field}`]: newVal }));
    if (oldVal !== newVal) logChange("Estructura Déficit", estructura.periodo, estructura.grupos[key].label, FIELD_LABELS[field] || field, oldVal, newVal);
  }, [estructura, withSaving, logChange]);

  const updateEstructuraJunji = useCallback((sub, field, newVal) => {
    const oldVal = sub === "gastoST2229" ? estructura.junji.gastoST2229 : estructura.junji[sub][field];
    const path = sub === "gastoST2229" ? "junji.gastoST2229" : `junji.${sub}.${field}`;
    withSaving(() => updateDoc(estructuraRef(), { [path]: newVal }));
    if (oldVal !== newVal) logChange("Estructura Déficit", estructura.periodo, "JUNJI", FIELD_LABELS[field] || field, oldVal, newVal);
  }, [estructura, withSaving, logChange]);

  const toggleIncluirTotal = useCallback((key, isJunji) => {
    if (isJunji) {
      withSaving(() => updateDoc(estructuraRef(), { "junji.incluirTotal": !estructura.junji.incluirTotal }));
    } else {
      withSaving(() => updateDoc(estructuraRef(), { [`grupos.${key}.incluirTotal`]: !estructura.grupos[key].incluirTotal }));
    }
  }, [estructura, withSaving]);

  const updatePeriodo = useCallback((text) => {
    withSaving(() => updateDoc(estructuraRef(), { periodo: text }));
  }, [withSaving]);

  const addSacado = useCallback(() => {
    withSaving(() => addDoc(sacadosCol(), { fecha: "", proceso: "", cuentaOrigen: "", cuentaDestino: "", monto: 0, rex: "" }));
  }, [withSaving]);
  const updateSacado = useCallback((id, field, val) => {
    withSaving(() => updateDoc(doc(sacadosCol(), id), { [field]: val }));
  }, [withSaving]);
  const removeSacado = useCallback((id) => {
    withSaving(() => deleteDoc(doc(sacadosCol(), id)));
  }, [withSaving]);

  /* ---- Bitácora ---- */
  const updateLogNota = useCallback((id, nota) => {
    withSaving(() => updateDoc(doc(changeLogCol(), id), { nota }));
  }, [withSaving]);
  const toggleLogIncluido = useCallback((id) => {
    const entry = changeLog.find((c) => c.id === id);
    if (!entry) return;
    withSaving(() => updateDoc(doc(changeLogCol(), id), { incluido: !entry.incluido }));
  }, [changeLog, withSaving]);
  const removeLogEntry = useCallback((id) => {
    withSaving(() => deleteDoc(doc(changeLogCol(), id)));
  }, [withSaving]);
  const marcarReportados = useCallback(() => {
    const toMark = changeLog.filter((c) => c.incluido && !c.reportado);
    if (!toMark.length) return;
    withSaving(async () => {
      const batch = writeBatch(db);
      toMark.forEach((c) => batch.update(doc(changeLogCol(), c.id), { reportado: true, incluido: false }));
      await batch.commit();
    });
  }, [changeLog, withSaving]);

  return {
    loaded, saveStatus,
    months, eneroDetalle, estructura, changeLog,
    monthTotals, accumulated, estructuraCalc,
    updateFuenteField, updateFuenteObs,
    addDetalleEntry, updateDetalleEntry, removeDetalleEntry,
    updateMonthMeta, aplicarPromedioReal, updateEneroDetalle,
    addDetalleEntryEstructura, updateDetalleEntryEstructura, removeDetalleEntryEstructura,
    updateEstructuraGrupo, updateEstructuraJunji, toggleIncluirTotal, updatePeriodo,
    addSacado, updateSacado, removeSacado,
    updateLogNota, toggleLogIncluido, removeLogEntry, marcarReportados,
    getEstructuraTarget,
  };
}
