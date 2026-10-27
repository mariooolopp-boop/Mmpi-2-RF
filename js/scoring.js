// Motor de calificación MMPI-2-RF — replica las fórmulas del Excel (Mmpirf.xlsx).
// answers: arreglo de 339 posiciones (índice 1..338): 1 = Verdadero, 2 = Falso, 0 = sin respuesta.
import { MODEL } from './model.js';

const hit = (a, [item, keyed]) => (a[item] === keyed ? 1 : 0);

// T desde la tabla del baremo. El Excel deja vacía la celda en las puntuaciones directas que
// ya superaron el tope (120 / 100); aquí se conserva el último valor definido (el tope).
export function toT(code, pd) {
  const t = MODEL.scales[code].tabla;
  let i = Math.min(pd, t.length - 1);
  while (i > 0 && t[i] == null) i--;
  return t[i] == null ? 0 : t[i];
}

export function score(answers) {
  const a = answers;
  const pd = {};
  // Interrogante "?" = respuestas en 0 (sin responder)
  let q = 0;
  for (let i = 1; i <= 338; i++) if (!a[i]) q++;
  // INVAR-r: pares en los que ambas respuestas van en la dirección inconsistente (suma = 2)
  pd['INVAR-r'] = MODEL.invar.filter(p => p.reduce((s, x) => s + hit(a, x), 0) === 2).length;
  // INVER-r: (pares VV con suma 2) - (pares FF con suma 2) + 11
  const vv = MODEL.invver.vv.filter(p => p.reduce((s, x) => s + hit(a, x), 0) === 2).length;
  const ff = MODEL.invver.ff.filter(p => p.reduce((s, x) => s + hit(a, x), 0) === 2).length;
  pd['INVER-r'] = vv - ff + MODEL.invver.offset;
  const extra = { 'INVER-r': { vv, ff, total: vv - ff } };
  for (const [code, s] of Object.entries(MODEL.scales)) {
    if (s.special) continue;
    let n = 0;
    for (const i of s.T) if (a[i] === 1) n++;
    for (const i of s.F) if (a[i] === 2) n++;
    pd[code] = n;
  }
  const res = {};
  for (const code of Object.keys(MODEL.scales)) res[code] = { pd: pd[code], t: toT(code, pd[code]) };
  return { q, scales: res, extra };
}

// "V/F" <-> arreglo
export function fromString(str) { // '1','2','0' x 338
  const a = [0]; for (let i = 0; i < 338; i++) a.push(+str[i] || 0); return a;
}
export function toStringAns(a) { let s = ''; for (let i = 1; i <= 338; i++) s += a[i] || 0; return s; }
