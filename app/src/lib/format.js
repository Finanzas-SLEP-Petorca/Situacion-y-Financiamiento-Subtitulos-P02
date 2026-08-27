export function fmtCLP(n) {
  const v = Math.round(Number(n) || 0);
  const abs = Math.abs(v).toLocaleString("es-CL");
  return (v < 0 ? "-$" : "$") + abs;
}
export function fmtNum(n) {
  const v = Math.round(Number(n) || 0);
  return v.toLocaleString("es-CL");
}
export function fmtPct(n) {
  if (!isFinite(n)) return "0,0%";
  return (n * 100).toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";
}
export function nowStamp() {
  const d = new Date();
  return d.toLocaleString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
export function uid() { return Date.now() + "-" + Math.random().toString(36).slice(2, 8); }
/* Fecha y hora local en formato "AAAAMMDD HHmm", usada como prefijo de los archivos
   descargados (PDF/Excel) para que el nombre indique cuándo se generó cada descarga. */
export function fileStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())} ${p(d.getHours())}${p(d.getMinutes())}`;
}
export function buildFileName(title) {
  return `${fileStamp()} - ${title}`;
}
export function fmtChileStamp(ts) {
  const d = new Date(ts);
  const fecha = d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Santiago" });
  const hora = d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", timeZone: "America/Santiago" });
  return `el ${fecha} a las ${hora} (hora Chile)`;
}
export function computeDetalleSum(entries) {
  return (entries || []).reduce((s, e) => s + (Number(e.monto) || 0), 0);
}
