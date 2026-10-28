// Generación del informe en PDF (pdf-lib, local, sin conexión). Contenido: datos, perfil con gráficas,
// tablas de puntuación natural y transformada, y respuestas V/F de todo el cuestionario.
import { MODEL } from './model.js';
import { score, fromString } from './scoring.js';
import { interpretar } from './interpretacion.js';

const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
const C = {
  blue: rgb(0.12, 0.31, 0.47), ink: rgb(0.1, 0.1, 0.12), grey: rgb(0.45, 0.47, 0.5), line: rgb(0.75, 0.77, 0.8),
  green: rgb(0.573, 0.816, 0.314), orange: rgb(1, 0.6, 0.2), bar: rgb(0.26, 0.52, 0.96), white: rgb(1, 1, 1), soft: rgb(0.94, 0.96, 0.98),
};
const W = 595.28, H = 841.89, M = 36;
const clean = s => String(s ?? '').replace(/[\u2013\u2014]/g, '-').replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, '?');
export const LIMITE_ELEVADA = 65;

export async function buildPdf({ test, datos, answers: ansStr }) {
  const a = fromString(ansStr);
  const res = score(a);
  const doc = await PDFDocument.create();
  const f = await doc.embedFont(StandardFonts.Helvetica);
  const fb = await doc.embedFont(StandardFonts.HelveticaBold);
  doc.setTitle('MMPI-2-RF - ' + (datos.nombre || ''));
  doc.setCreator('Aplicación MMPI-2-RF');
  let page, y;
  const newPage = () => { page = doc.addPage([W, H]); y = H - M; };
  const ensure = h => { if (y - h < M + 18) newPage(); };
  const tx = (s, x, yy, size = 8, font = f, color = C.ink, opts = {}) => page.drawText(clean(s), { x, y: yy, size, font, color, ...opts });
  const tw = (s, size, font = f) => font.widthOfTextAtSize(clean(s), size);
  const center = (s, cx, yy, size, font = f, color = C.ink) => tx(s, cx - tw(s, size, font) / 2, yy, size, font, color);
  const wrap = (s, size, width, font = f) => {
    const out = []; let line = '';
    for (const w of clean(s).split(/\s+/)) {
      const t = line ? line + ' ' + w : w;
      if (tw(t, size, font) > width && line) { out.push(line); line = w; } else line = t;
    }
    if (line) out.push(line); return out;
  };
  const title = (s) => { ensure(30); page.drawRectangle({ x: M, y: y - 16, width: W - 2 * M, height: 18, color: C.blue }); tx(s, M + 8, y - 11, 10, fb, C.white); y -= 28; };

  // ---------- Encabezado y datos ----------
  newPage();
  tx('MMPI-2-RF', M, y - 18, 20, fb, C.blue);
  tx('Informe de resultados del cuestionario', M + 105, y - 18, 11, f, C.grey);
  y -= 34;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: C.blue }); y -= 14;
  const fecha = datos.fechaAplicacion || (test.completedAt ? new Date(test.completedAt).toLocaleDateString('es-MX') : '');
  const fields = [
    ['Nombre', datos.nombre], ['Id', test.idCaso], ['Edad', datos.edad], ['Sexo', datos.sexo],
    ['Escolaridad', datos.escolaridad], ['Ocupación', datos.ocupacion], ['Estado civil', datos.estadoCivil],
    ['Fecha de aplicación', fecha], ['Baremo', test.baremo], ['Responsable de la aplicación', test.responsable],
  ];
  const colW = (W - 2 * M) / 2;
  fields.forEach(([k, v], i) => {
    const cx = M + (i % 2) * colW, cy = y - Math.floor(i / 2) * 17;
    tx(k + ':', cx, cy, 8.5, fb, C.blue);
    const lab = tw(k + ':', 8.5, fb) + 5;
    const lines = wrap(v || '-', 8.5, colW - lab - 8); tx(lines[0], cx + lab, cy, 8.5);
  });
  y -= Math.ceil(fields.length / 2) * 17 + 6;

  // ---------- Perfil ----------
  title('PERFIL  (PD = puntuación directa;  T = puntuación típica, media 50 y DT 10)');
  // Interrogante
  tx('No puedo decir', M + 8, y - 8, 8); tx('?', M + 150, y - 8, 8, fb, C.blue);
  box(page, M + 186, y - 12, 26, 13); center(String(res.q), M + 199, y - 9, 8, fb);
  y -= 20;
  const nameX = M + 8, codeX = M + 150, pdX = M + 186, tX = M + 218, barX = M + 258, barW = W - M - barX - 6, rowH = 13;
  function box(p, x, yy, w, h) { p.drawRectangle({ x, y: yy, width: w, height: h, borderColor: C.grey, borderWidth: 0.7, color: C.white }); }
  let lastSec = '';
  for (const g of MODEL.groups) {
    const h = 12 + g.codes.length * rowH + 12;
    ensure(h + (g.sec !== lastSec ? 16 : 0) + 4);
    if (g.sec !== lastSec) { tx(g.sec, M + 2, y - 9, 9, fb, C.blue); y -= 15; lastSec = g.sec; }
    if (g.sub) { tx(g.sub, M + 8, y - 8, 8, fb, C.grey); }
    // cabecera de columnas
    tx('PD', pdX + 6, y - 8, 7.5, fb, C.grey); tx('T', tX + 10, y - 8, 7.5, fb, C.grey);
    const top = y - 11, plotH = g.codes.length * rowH, x65 = barX + barW * LIMITE_ELEVADA / g.max;
    page.drawRectangle({ x: barX, y: top - plotH, width: x65 - barX, height: plotH, color: C.green });
    page.drawRectangle({ x: x65, y: top - plotH, width: barX + barW - x65, height: plotH, color: C.orange });
    for (let v = 0; v <= g.max; v += 20) {
      const x = barX + barW * v / g.max;
      page.drawLine({ start: { x, y: top }, end: { x, y: top - plotH }, thickness: 0.4, color: rgb(1, 1, 1), opacity: 0.8 });
      center(String(v), x, top - plotH - 9, 6.5, f, C.grey);
    }
    page.drawLine({ start: { x: x65, y: top }, end: { x: x65, y: top - plotH }, thickness: 0.8, color: rgb(0.5, 0.25, 0), dashArray: [2, 2] });
    g.codes.forEach((code, i) => {
      const s = MODEL.scales[code], r = res.scales[code], ry = top - (i + 1) * rowH;
      tx(s.name, nameX, ry + 4, 7.5); tx(code, codeX, ry + 4, 7.5, fb, C.blue);
      box(page, pdX, ry + 1, 26, 11); center(String(r.pd), pdX + 13, ry + 4, 7.5, fb);
      box(page, tX, ry + 1, 26, 11); center(String(r.t), tX + 13, ry + 4, 7.5, fb);
      const bw = Math.max(1, barW * Math.min(r.t, g.max) / g.max);
      page.drawRectangle({ x: barX, y: ry + 3, width: bw, height: 7, color: C.bar, borderColor: rgb(0.1, 0.2, 0.5), borderWidth: 0.4 });
    });
    y -= h + 6;
  }
  tx('Zona naranja: puntuaciones T de 65 o más.', M + 2, y - 4, 7, f, C.grey); y -= 14;

  // ---------- Puntuación natural y transformada ----------
  newPage();
  const tbl = (heading, codes) => {
    title(heading);
    const cw = [150, 80, 100, 100];
    const hx = [M, M + cw[0], M + cw[0] + cw[1], M + cw[0] + cw[1] + cw[2]];
    ensure(16);
    ['Escala', 'Puntuación natural', 'Escala', 'Puntuación transformada (T)'].forEach((h, i) => { tx(h, hx[i] + 4, y - 9, 8, fb, C.blue); });
    page.drawLine({ start: { x: M, y: y - 13 }, end: { x: W - M, y: y - 13 }, thickness: 0.8, color: C.blue }); y -= 16;
    codes.forEach((code, i) => {
      ensure(13);
      if (i % 2 === 0) page.drawRectangle({ x: M, y: y - 10, width: W - 2 * M - 40, height: 12, color: C.soft });
      const r = res.scales[code];
      tx(code, hx[0] + 4, y - 7, 8, fb); tx(String(r.pd), hx[1] + 4, y - 7, 8);
      tx(code, hx[2] + 4, y - 7, 8, fb); tx(String(r.t), hx[3] + 4, y - 7, 8, fb);
      y -= 12;
    });
    y -= 12;
  };
  const gid = n => MODEL.groups.slice(...n).flatMap(g => g.codes);
  tbl('PUNTUACIÓN NATURAL Y TRANSFORMADA — Validez, Dimensiones globales y Clínicas reestructuradas', gid([0, 5]));
  tbl('PUNTUACIÓN NATURAL Y TRANSFORMADA — Problemas específicos, Intereses y Personalidad patológica', gid([5, 11]));
  // Detalle de inconsistencia (solo lectura)
  const ex = res.extra['INVER-r'];
  tx(`INVER-r: pares V-V = ${ex.vv}, pares F-F = ${ex.ff}, total = ${ex.total}, total corregido (+11) = ${res.scales['INVER-r'].pd}.`, M, y - 6, 7.5, f, C.grey); y -= 14;

  // ---------- Interpretación por escala (orientativa, según T) ----------
  newPage();
  title('INTERPRETACIÓN POR ESCALA  (orientativa, según la puntuación T)');
  const NC = {
    verde: rgb(0.20, 0.78, 0.35), amarillo: rgb(1, 0.78, 0.04), rojo: rgb(0.93, 0.23, 0.19),
    bajo: rgb(0.66, 0.74, 0.82), medio: rgb(0.35, 0.65, 0.90), alto: rgb(0.12, 0.38, 0.75),
  };
  const RED = rgb(0.72, 0.1, 0.08);
  const para = (s, size, color = C.grey, font = f, x = M + 2) => {
    for (const l of wrap(s, size, W - 2 * M - (x - M) - 2)) { ensure(size + 3); tx(l, x, y - size, size, font, color); y -= size + 2.6; }
  };
  para('Clasificación orientativa de visualización (no son puntos de corte oficiales universales). Escalas sustantivas: verde = T menor de 55; amarillo = T de 55 a 64; rojo = T de 65 o más. Las escalas de validez usan criterios propios y las de intereses solo indican grado de preferencia. Esta interpretación automática no es un diagnóstico ni sustituye el juicio clínico: debe contrastarse con otras escalas, la entrevista, la historia y otras fuentes de información.', 7.3);
  y -= 4;
  // Alertas
  const alertas = [];
  for (const g of MODEL.groups) for (const code of g.codes) {
    const it = interpretar(code, res.scales[code].t);
    if (it && it.alerta) alertas.push(code === 'ISU'
      ? `RIESGO: ISU (T = ${res.scales[code].t}) elevada. Realizar de inmediato una evaluación directa del riesgo suicida.`
      : `VALIDEZ: ${code} (T = ${res.scales[code].t}) alcanza el criterio de alerta. Revisar el protocolo antes de interpretar las demás escalas.`);
  }
  if (alertas.length) {
    const lines = alertas.flatMap(a => wrap(a, 8, W - 2 * M - 20));
    const bh = lines.length * 10.5 + 18;
    ensure(bh + 6);
    page.drawRectangle({ x: M, y: y - bh, width: W - 2 * M, height: bh, color: rgb(1, 0.93, 0.92), borderColor: NC.rojo, borderWidth: 1 });
    tx('ALERTAS', M + 8, y - 12, 8.5, fb, RED);
    lines.forEach((l, i) => tx(l, M + 8, y - 24 - i * 10.5, 8, fb, RED));
    y -= bh + 8;
  }
  // Leyenda
  ensure(16);
  let lx = M + 2;
  [['verde', 'Verde'], ['amarillo', 'Amarillo'], ['rojo', 'Rojo']].forEach(([k, n]) => {
    page.drawCircle({ x: lx + 4, y: y - 5, size: 4, color: NC[k] }); tx(n, lx + 11, y - 8, 7.5, f, C.grey); lx += 11 + tw(n, 7.5) + 14;
  });
  y -= 16;
  const SEC = { 'VALIDEZ': 'Escalas de validez', 'D. GLOBALES': 'Escalas globales (segundo orden)', 'CLÍNICAS REESTRUCTURADAS': 'Escalas clínicas reestructuradas',
    'PROBLEMAS ESPECÍFICOS': 'Escalas de problemas específicos', '5 PERSONALIDAD PATOLÓGICA': 'Escalas de personalidad patológica (PSY-5)' };
  let lastS = '';
  for (const g of MODEL.groups) {
    if (g.sec !== lastS) { ensure(34); y -= 4; tx(SEC[g.sec] || g.sec, M + 2, y - 10, 10, fb, C.blue); y -= 16; lastS = g.sec; }
    if (g.sub) { ensure(26); tx(g.sub, M + 4, y - 8, 8.5, fb, C.grey); y -= 12; }
    if (g.sub === 'Intereses') para('En estas escalas el color indica el grado de preferencia, no gravedad clínica.', 7, C.grey, f, M + 4);
    for (const code of g.codes) {
      const sc = MODEL.scales[code], r = res.scales[code], it = interpretar(code, r.t);
      if (!it) continue;
      const body = wrap(it.texto + (it.extra ? ' ' + it.extra : ''), 7.8, W - 2 * M - 26);
      const crit = wrap(it.criterio, 6.6, W - 2 * M - 26);
      ensure(16 + body.length * 9.6 + crit.length * 8.2 + 8);
      page.drawCircle({ x: M + 9, y: y - 5.5, size: 4.6, color: NC[it.color] });
      tx(code, M + 20, y - 8, 8.5, fb, C.blue);
      const right = `PD ${r.pd}   T ${r.t}   ${it.etiqueta}`;
      tx(right, W - M - tw(right, 8, fb) - 2, y - 8, 8, fb, C.ink);
      const nm = wrap(sc.name, 7.2, W - 2 * M - 26 - tw(code, 8.5, fb) - tw(right, 8, fb) - 22)[0];
      tx(nm, M + 20 + tw(code, 8.5, fb) + 6, y - 8, 7.2, f, C.grey);
      y -= 13;
      body.forEach(l => { tx(l, M + 20, y - 7, 7.8, f, C.ink); y -= 9.6; });
      crit.forEach(l => { tx(l, M + 20, y - 6, 6.6, f, C.grey); y -= 8.2; });
      if (it.alerta) { page.drawLine({ start: { x: M + 20, y: y - 1 }, end: { x: W - M, y: y - 1 }, thickness: 0.4, color: NC.rojo }); }
      y -= 6;
    }
  }

  // ---------- Respuestas ----------
  newPage();
  title('RESPUESTAS DEL CUESTIONARIO  (V = Verdadero, F = Falso)');
  const numX = M + 2, ansX = W - M - 22, textX = M + 30, textW = ansX - textX - 8;
  for (let i = 1; i <= 338; i++) {
    const lines = wrap(MODEL.items[i - 1], 7.5, textW);
    ensure(lines.length * 9.2 + 3);
    if (i % 2 === 0) page.drawRectangle({ x: M, y: y - lines.length * 9.2 - 1, width: W - 2 * M, height: lines.length * 9.2 + 2, color: C.soft });
    tx(String(i), numX, y - 8, 7.5, fb, C.blue);
    lines.forEach((l, k) => tx(l, textX, y - 8 - k * 9.2, 7.5));
    const v = a[i] === 1 ? 'V' : a[i] === 2 ? 'F' : '-';
    center(v, ansX + 8, y - 8, 8.5, fb, v === '-' ? C.grey : C.ink);
    y -= lines.length * 9.2 + 2.6;
  }

  // ---------- Pie de página ----------
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    const t = `MMPI-2-RF  |  ${clean(datos.nombre || '')}  |  Página ${i + 1} de ${pages.length}`;
    p.drawText(t, { x: M, y: 20, size: 7, font: f, color: C.grey });
  });
  return { bytes: await doc.save(), res };
}
