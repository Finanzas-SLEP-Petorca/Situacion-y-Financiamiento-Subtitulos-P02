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
export function computeDetalleSum(entries) {
  return (entries || []).reduce((s, e) => s + (Number(e.monto) || 0), 0);
}
