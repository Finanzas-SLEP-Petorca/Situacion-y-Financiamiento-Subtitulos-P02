import { useCallback, useState } from "react";
import { LayoutGrid, FileSpreadsheet, ArrowLeftRight, ClipboardList, Loader2 } from "lucide-react";
import { COLORS } from "./lib/colors";
import { computeDetalleSum, fmtChileStamp, buildFileName } from "./lib/format";
import { MONTHS, FIELD_LABELS } from "./lib/calc";
import { displayName } from "./lib/teamNames";
import { useDashboardData } from "./hooks/useDashboardData";
import { useAuth } from "./hooks/useAuth";
import { SyncStatus } from "./components/ui/Primitives";
import DatosMensualesTab from "./components/tabs/DatosMensualesTab";
import ResumenTab from "./components/tabs/ResumenTab";
import EstructuraTab from "./components/tabs/EstructuraTab";
import BitacoraTab from "./components/tabs/BitacoraTab";
import DetalleModal from "./components/DetalleModal";
import ReportModal from "./components/ReportModal";
import { PrintViewDatos, PrintViewResumen, PrintViewEstructura, PrintViewBitacora, PrintViewRex } from "./components/print/PrintViews";
import {
  buildDatosMensualReport, buildResumenReport, buildEstructuraReport, buildBitacoraReport,
} from "./lib/reportBuilders";
import {
  exportDatosMensualExcel, exportResumenExcel, exportEstructuraExcel, exportBitacoraExcel, exportRexExcel,
} from "./lib/excelExport";

const LOGO_SRC = import.meta.env.BASE_URL + "logo-slep-icon.png";

const TABS = [
  { key: "datos", label: "Datos Mensuales", icon: LayoutGrid },
  { key: "resumen", label: "Resumen Ejecutivo", icon: FileSpreadsheet },
  { key: "estructura", label: "Traspasos entre Cuentas", icon: ArrowLeftRight },
  { key: "bitacora", label: "Bitácora de Movimientos", icon: ClipboardList },
];

/* Título sugerido por el navegador al guardar el PDF (window.print), con el mismo
   nombre base que usan los Excel de cada pestaña (ver excelExport.js) para que ambas
   descargas de un mismo reporte queden con el mismo nombre. */
const ORIGINAL_TITLE = document.title;
const printTitle = (target, { selectedMonth, corte }) => {
  switch (target) {
    case "datos": return `Datos ${MONTHS[selectedMonth]} - Financiamiento P02`;
    case "resumen": return `Resumen a ${MONTHS[corte - 1]} - Financiamiento P02`;
    case "estructura": return "Situacion deficit - Financiamiento P02";
    case "bitacora": return "Bitacora movimientos - Financiamiento P02";
    case "rex": return "Registro traspasos REX - Financiamiento P02";
    default: return ORIGINAL_TITLE;
  }
};

export default function App() {
  const data = useDashboardData();
  const { user, logout } = useAuth();
  const [corte, setCorte] = useState(12);
  const [activeTab, setActiveTab] = useState("datos");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [reportModal, setReportModal] = useState(null);
  const [printTarget, setPrintTarget] = useState(null);
  const [detalleModal, setDetalleModal] = useState(null);
  const [detalleEstructuraModal, setDetalleEstructuraModal] = useState(null);
  const [copied, setCopied] = useState(false);

  const openDetalle = useCallback((monthIdx, fuenteKey, field, label) => {
    setDetalleModal({ monthIdx, fuenteKey, field, label });
  }, []);
  const openDetalleEstructura = useCallback((targetKey, field, label) => {
    setDetalleEstructuraModal({ targetKey, field, label });
  }, []);

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
    document.title = buildFileName(printTitle(target, { selectedMonth, corte }));
    setTimeout(() => {
      window.print();
      setPrintTarget(null);
      document.title = ORIGINAL_TITLE;
    }, 60);
  }

  if (!data.loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen gap-2 text-sm" style={{ color: COLORS.inkSoft, background: COLORS.paper }}>
        <Loader2 size={16} className="animate-spin" /> Cargando datos…
      </div>
    );
  }

  const { months, monthTotals, accumulated, eneroDetalle, estructura, estructuraCalc, changeLog } = data;
  const pendingChanges = changeLog.filter((c) => c.incluido && !c.reportado);
  const lastLog = changeLog[0];
  const lastEdit = lastLog ? { name: displayName(lastLog.userEmail), stamp: fmtChileStamp(lastLog.ts) } : null;

  function openDatosReport() {
    const r = buildDatosMensualReport({ monthIdx: selectedMonth, monthData: months[selectedMonth], monthTotal: monthTotals[selectedMonth], accumulated });
    setReportModal({ tabLabel: "Datos Mensuales", ...r, showMarkReported: false });
  }
  function openResumenReport() {
    const r = buildResumenReport({ corte, monthTotals, accumulated });
    setReportModal({ tabLabel: "Resumen Ejecutivo", ...r, showMarkReported: false });
  }
  function openEstructuraReport() {
    const r = buildEstructuraReport({ estructura, estructuraCalc });
    setReportModal({ tabLabel: "Traspasos entre Cuentas", ...r, showMarkReported: false });
  }
  function openBitacoraReport() {
    const r = buildBitacoraReport({ changes: pendingChanges });
    setReportModal({ tabLabel: "Bitácora de Movimientos", ...r, showMarkReported: true });
  }

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: COLORS.ink, background: COLORS.paper, minHeight: "100%" }}>
      {printTarget === "datos" && (
        <PrintViewDatos monthIdx={selectedMonth} monthData={months[selectedMonth]} monthTotal={monthTotals[selectedMonth]} />
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
      {printTarget === "rex" && (
        <PrintViewRex estructura={estructura} estructuraCalc={estructuraCalc} />
      )}

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
            <SyncStatus status={data.saveStatus} lastEdit={lastEdit} userEmail={user?.email} />
            <button
              onClick={logout}
              className="text-xs font-medium"
              style={{ color: "rgba(255,255,255,0.75)" }}
              title="Cerrar sesión"
            >
              Cerrar sesión
            </button>
            <div style={{ background: "#fff", borderRadius: 8, padding: "5px 12px", display: "flex", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }}>
              <img src={LOGO_SRC} alt="SLEP Petorca" style={{ height: 24, width: "auto", display: "block" }} />
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
              updateFuenteField={data.updateFuenteField}
              updateFuenteObs={data.updateFuenteObs}
              updateMonthMeta={data.updateMonthMeta}
              aplicarPromedioReal={data.aplicarPromedioReal}
              eneroDetalle={eneroDetalle}
              updateEneroDetalle={data.updateEneroDetalle}
              onExcel={() => exportDatosMensualExcel(selectedMonth, months[selectedMonth], monthTotals[selectedMonth])}
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
              onExcel={() => exportResumenExcel(months, monthTotals, accumulated, corte)}
              onPDF={() => handlePrint("resumen")}
              onReport={openResumenReport}
            />
          )}
          {activeTab === "estructura" && (
            <EstructuraTab
              estructura={estructura}
              estructuraCalc={estructuraCalc}
              updatePeriodo={data.updatePeriodo}
              updateCdIngresoTotal={data.updateCdIngresoTotal}
              updateEstructuraGrupo={data.updateEstructuraGrupo}
              updateEstructuraJunji={data.updateEstructuraJunji}
              toggleIncluirTotal={data.toggleIncluirTotal}
              addSacado={data.addSacado}
              updateSacado={data.updateSacado}
              removeSacado={data.removeSacado}
              onExcel={() => exportEstructuraExcel(estructura, estructuraCalc)}
              onPDF={() => handlePrint("estructura")}
              onReport={openEstructuraReport}
              onExcelRex={() => exportRexExcel(estructura, estructuraCalc)}
              onPDFRex={() => handlePrint("rex")}
              onOpenDetalle={openDetalleEstructura}
            />
          )}
          {activeTab === "bitacora" && (
            <BitacoraTab
              changeLog={changeLog}
              updateLogNota={data.updateLogNota}
              toggleLogIncluido={data.toggleLogIncluido}
              removeLogEntry={data.removeLogEntry}
              pendingChanges={pendingChanges}
              onExcel={() => exportBitacoraExcel(changeLog)}
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
          onMarcarReportados={() => { data.marcarReportados(); setReportModal(null); }}
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
            onAdd={() => data.addDetalleEntry(detalleModal.monthIdx, detalleModal.fuenteKey, detalleModal.field)}
            onUpdate={(id, prop, val) => data.updateDetalleEntry(detalleModal.monthIdx, detalleModal.fuenteKey, detalleModal.field, id, prop, val)}
            onRemove={(id) => data.removeDetalleEntry(detalleModal.monthIdx, detalleModal.fuenteKey, detalleModal.field, id)}
            onClose={() => setDetalleModal(null)}
          />
        );
      })()}

      {detalleEstructuraModal && (() => {
        const target = data.getEstructuraTarget(estructura, detalleEstructuraModal.targetKey) || {};
        const entries = target[detalleEstructuraModal.field + "Detalle"] || [];
        return (
          <DetalleModal
            title={`Detalle de ${FIELD_LABELS[detalleEstructuraModal.field] || detalleEstructuraModal.field} — ${detalleEstructuraModal.label}`}
            entries={entries}
            total={computeDetalleSum(entries)}
            originalTotal={target[detalleEstructuraModal.field] || 0}
            onAdd={() => data.addDetalleEntryEstructura(detalleEstructuraModal.targetKey, detalleEstructuraModal.field, detalleEstructuraModal.label)}
            onUpdate={(id, prop, val) => data.updateDetalleEntryEstructura(detalleEstructuraModal.targetKey, detalleEstructuraModal.field, detalleEstructuraModal.label, id, prop, val)}
            onRemove={(id) => data.removeDetalleEntryEstructura(detalleEstructuraModal.targetKey, detalleEstructuraModal.field, detalleEstructuraModal.label, id)}
            onClose={() => setDetalleEstructuraModal(null)}
          />
        );
      })()}
    </div>
  );
}
