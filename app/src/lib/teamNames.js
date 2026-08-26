/* Nombres para mostrar en "Conectado como" / "última edición por".
   Debe cubrir los correos de ALLOWED_EMAILS (src/lib/allowedEmails.js). */
export const TEAM_NAMES = {
  "wilson.rojas@sleppetorca.gob.cl": "Wilson Rojas Abarca",
  "wilson.rojasabarca@gmail.com": "Wilson Rojas Abarca",
  "juan.bustamante@sleppetorca.gob.cl": "Juan Pablo Bustamante",
  "benedicto.fessia@sleppetorca.gob.cl": "Benedicto Fessia",
  "sebastian.olguin@sleppetorca.gob.cl": "Sebastián Olguín",
  "fernando.saavedra@sleppetorca.gob.cl": "Fernando Saavedra",
  "yessenia.vilches@sleppetorca.gob.cl": "Yessenia Vilches",
  "catalina.brito@sleppetorca.gob.cl": "Catalina Brito",
  "javier.ilabaca@sleppetorca.gob.cl": "Javier Ilabaca Barraza",
  "nicolas.campos@sleppetorca.gob.cl": "Nicolás Campos",
};

export function displayName(email) {
  if (!email) return "";
  return TEAM_NAMES[email.toLowerCase()] || email;
}
