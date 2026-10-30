import { MODEL } from './model.js';
import { score, fromString } from './scoring.js';
import { store, MODE } from './store.js';
import { buildPdf, LIMITE_ELEVADA } from './pdf.js';

const $app = document.getElementById('app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fdate = ms => ms ? new Date(ms).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : '';
const fday = ms => ms ? new Date(ms).toLocaleDateString('es-MX') : '';
function toast(m) { const t = document.getElementById('toast'); t.textContent = m; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 2200); }
const linkFor = id => location.origin + location.pathname + '#/t/' + id;
async function copy(text) {
  try { await navigator.clipboard.writeText(text); } catch { const i = document.createElement('input'); i.value = text; document.body.appendChild(i); i.select(); document.execCommand('copy'); i.remove(); }
  toast('Enlace copiado');
}

/* ---------------- Router ---------------- */
async function route() {
  window.scrollTo(0, 0);
  const h = location.hash.replace(/^#\/?/, '').split('/');
  try {
    if (h[0] === 't' && h[1]) return await viewRespondent(h[1]);
    if (!store.isLogged()) return viewLogin();
    if (h[0] === 'r' && h[1]) return await viewResult(h[1]);
    return await viewAdmin();
  } catch (e) { console.error(e); $app.innerHTML = `<div class="card"><h2>Ocurrió un problema</h2><p class="muted">${esc(e.message || e)}</p><a class="btn sec" href="#/">Volver</a></div>`; }
}
window.addEventListener('hashchange', route);

/* ---------------- Login ---------------- */
function viewLogin() {
  $app.innerHTML = `
  <div class="card login">
    <div class="avatar" aria-hidden="true"><svg viewBox="0 0 100 100"><ellipse cx="50" cy="38" rx="15" ry="18"/><path d="M18 100C18 72 34 62 50 62s32 10 32 38z"/></svg></div>
    <div class="center"><h1>MMPI-2-RF</h1><p class="muted small">Acceso de la persona responsable de la aplicación</p></div>
    <form id="f">
      <div class="field"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>
        <label class="sr" for="u">Usuario</label><input id="u" placeholder="Usuario" autocomplete="username" autocapitalize="none" required></div>
      <div class="field"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
        <label class="sr" for="p">Contraseña</label><input id="p" type="password" placeholder="Contraseña" autocomplete="current-password" required></div>
      <div id="e" class="err"></div><button class="btn" style="width:100%;margin-top:14px;padding:14px">Entrar</button></form>
    ${MODE === 'local' ? '<p class="small muted center" style="margin-top:14px">Modo local de pruebas (sin Firebase configurado).</p>' : ''}
  </div>`;
  document.getElementById('f').onsubmit = async ev => {
    ev.preventDefault(); const b = ev.target.querySelector('button'); b.disabled = true;
    const ok = await store.login(document.getElementById('u').value, document.getElementById('p').value);
    if (ok) route(); else { document.getElementById('e').textContent = 'Usuario o contraseña incorrectos.'; b.disabled = false; }
  };
}

/* ---------------- Panel de administración ---------------- */
async function viewAdmin(newId) {
  const tests = await store.listTests();
  $app.innerHTML = `
  <div class="topbar"><div class="brand">MMPI-2-RF</div><button class="btn sec sm" id="out">Cerrar sesión</button></div>
  ${MODE === 'local' ? '<div class="card small" style="border-color:#f5c27a;background:#fff8ec"><b>Modo local de pruebas.</b> Los enlaces solo funcionan en este mismo navegador. Configura Firebase (ver guía) para usarlos con otras personas.</div>' : ''}
  <div class="card"><h2>Crear enlace único</h2>
    <form id="nf"><div class="grid2">
      <div><label>Id o referencia (opcional)</label><input id="idc" placeholder="Ej. Caso 014"></div>
      <div><label>Baremo (opcional)</label><input id="bar" placeholder="Ej. Población general"></div></div>
      <label>Responsable de la aplicación (opcional)</label><input id="resp">
      <button class="btn" style="margin-top:12px">Generar enlace</button></form>
    <div id="newlink">${newId ? linkBlock(linkFor(newId)) : ''}</div></div>
  <div class="card"><h2>Aplicaciones</h2>${tests.length ? tests.map(t => `
    <div class="item"><div class="grow"><div><span class="chip ${t.status === 'completed' ? 'c' : 'p'}">${t.status === 'completed' ? 'Respondido' : 'Pendiente'}</span>
      <b>${esc(t.nombre || t.idCaso || 'Sin nombre')}</b></div>
      <div class="small muted">${esc(t.idCaso && t.nombre ? t.idCaso + ' · ' : '')}Creado ${fdate(t.createdAt)}${t.completedAt ? ' · Respondido ' + fdate(t.completedAt) : ''}</div></div>
      <div class="row">${t.status === 'completed' ? `<a class="btn sm" href="#/r/${t.id}">Ver resultado</a>` : `<button class="btn sm sec" data-copy="${t.id}">Copiar enlace</button>`}
      <button class="btn sm danger" data-del="${t.id}">Eliminar</button></div></div>`).join('') : '<p class="muted">Aún no has creado enlaces.</p>'}</div>`;
  document.getElementById('out').onclick = async () => { await store.logout(); route(); };
  document.getElementById('nf').onsubmit = async ev => {
    ev.preventDefault(); const b = ev.target.querySelector('button'); b.disabled = true;
    const id = await store.createTest({ idCaso: val('idc'), baremo: val('bar'), responsable: val('resp') });
    await viewAdmin(id);
  };
  const lk = document.getElementById('lk');
  if (lk) { lk.onfocus = e => e.target.select(); document.getElementById('cp').onclick = () => copy(lk.value); }
  $app.onclick = async e => {
    const c = e.target.closest('[data-copy]'), d = e.target.closest('[data-del]');
    if (c) copy(linkFor(c.dataset.copy));
    if (d && confirm('¿Eliminar este registro y sus respuestas? Esta acción no se puede deshacer.')) { await store.deleteTest(d.dataset.del); route(); }
  };
}
const linkBlock = l => `<p class="small muted" style="margin-top:14px">Enlace generado. Cópialo y envíalo a la persona que responderá; se cierra automáticamente al terminar.</p>
  <div class="linkbox"><input readonly value="${esc(l)}" id="lk"><button class="btn" id="cp" type="button">Copiar</button></div>
  <p style="margin:8px 0 0"><a class="btn sec sm" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent('Enlace para responder el cuestionario: ' + l)}">Enviar por WhatsApp</a></p>`;
const val = id => document.getElementById(id).value.trim();

/* ---------------- Resultado ---------------- */
function perfilHtml(res) {
  let last = '', out = '';
  for (const g of MODEL.groups) {
    if (g.sec !== last) { out += `<div class="sec">${esc(g.sec)}</div>`; last = g.sec; }
    const p = LIMITE_ELEVADA / g.max * 100;
    out += `<div class="grp">${g.sub ? `<div class="small muted"><b>${esc(g.sub)}</b></div>` : ''}
      <div class="prow h"><span>Escala</span><span></span><span class="center">PD</span><span class="center">T</span>
      <div class="ticks">${Array.from({ length: g.max / 20 + 1 }, (_, i) => `<span>${i * 20}</span>`).join('')}</div></div>`;
    for (const code of g.codes) {
      const s = MODEL.scales[code], r = res.scales[code];
      out += `<div class="prow"><span>${esc(s.name)}</span><span class="code">${esc(code)}</span><span class="pill">${r.pd}</span><span class="pill">${r.t}</span>
        <div class="track" style="background:linear-gradient(90deg,var(--green) ${p}%,var(--orange) ${p}%)"><i style="width:${Math.min(r.t, g.max) / g.max * 100}%"></i></div></div>`;
    }
    out += '</div>';
  }
  return out;
}
const natTable = (res, codes) => `<table class="t"><tr><th>Escala</th><th>Puntuación natural</th><th>Puntuación transformada (T)</th></tr>${codes.map(c => `<tr><td><b>${esc(c)}</b> <span class="muted small">${esc(MODEL.scales[c].name)}</span></td><td>${res.scales[c].pd}</td><td><b>${res.scales[c].t}</b></td></tr>`).join('')}</table>`;

async function viewResult(id) {
  const r = await store.getResult(id);
  if (!r || !r.answers) { $app.innerHTML = `<div class="card"><p>No hay respuestas para este enlace todavía.</p><a class="btn sec" href="#/">Volver</a></div>`; return; }
  const { test, datos, answers } = r; const res = score(fromString(answers)); const a = fromString(answers);
  const gid = (x, y) => MODEL.groups.slice(x, y).flatMap(g => g.codes);
  $app.innerHTML = `
  <div class="topbar"><a class="btn sec sm" href="#/">← Volver</a><button class="btn" id="pdf">Descargar PDF</button></div>
  <div class="card"><h1>${esc(datos.nombre)}</h1>
    <div class="grid2 small">${[['Id', test.idCaso], ['Edad', datos.edad], ['Sexo', datos.sexo], ['Escolaridad', datos.escolaridad], ['Ocupación', datos.ocupacion], ['Estado civil', datos.estadoCivil], ['Fecha de aplicación', fday(test.completedAt)], ['Baremo', test.baremo], ['Responsable', test.responsable]]
      .map(([k, v]) => `<div><b>${k}:</b> ${esc(v || '—')}</div>`).join('')}</div></div>
  <div class="card perfil"><h2>Perfil</h2><p class="small muted">PD = puntuación directa · T = puntuación típica (media 50, DT 10) · zona naranja: T ≥ ${LIMITE_ELEVADA}</p>
    <div class="prow"><span>No puedo decir</span><span class="code">?</span><span class="pill">${res.q}</span><span></span><span></span></div>${perfilHtml(res)}</div>
  <div class="card"><h2>Puntuación natural y transformada</h2>
    <h3>Validez, Dimensiones globales y Clínicas reestructuradas</h3>${natTable(res, gid(0, 5))}
    <h3>Problemas específicos, Intereses y Personalidad patológica</h3>${natTable(res, gid(5, 11))}</div>
  <div class="card"><details><summary>Respuestas del cuestionario (338)</summary>
    <table class="t" style="margin-top:8px">${MODEL.items.map((t, i) => `<tr><td>${i + 1}</td><td>${esc(t)}</td><td><b>${a[i + 1] === 1 ? 'V' : a[i + 1] === 2 ? 'F' : '-'}</b></td></tr>`).join('')}</table></details></div>`;
  document.getElementById('pdf').onclick = async ev => {
    const b = ev.target; b.disabled = true; b.textContent = 'Generando…';
    try {
      const { bytes } = await buildPdf({ test, datos, answers });
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      const el = document.createElement('a'); el.href = url;
      el.download = `MMPI-2-RF_${(datos.nombre || 'resultado').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(el); el.click(); el.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (e) { console.error(e); toast('No se pudo generar el PDF'); }
    b.disabled = false; b.textContent = 'Descargar PDF';
  };
}

/* ---------------- Evaluado ---------------- */
const PER = 10;
async function viewRespondent(token) {
  const t = await store.getTest(token);
  if (!t || t.status !== 'pending') {
    $app.innerHTML = `<div class="card done"><div class="big">🔒</div><h2>${t ? 'Este enlace ya fue utilizado' : 'Enlace no válido'}</h2><p class="muted">${t ? 'Las respuestas ya fueron enviadas y el enlace está cerrado.' : 'Verifica que el enlace esté completo o solicita uno nuevo.'}</p></div>`; return;
  }
  const KEY = 'mmpi_prog_' + token;
  const st = JSON.parse(localStorage.getItem(KEY) || '{"datos":null,"ans":{},"page":-1}');
  const save = () => localStorage.setItem(KEY, JSON.stringify(st));
  const answered = () => Object.keys(st.ans).length;

  function intro() {
    $app.innerHTML = `<div class="topbar"><div class="brand">MMPI-2-RF</div></div>
    <div class="card"><h2>Instrucciones</h2>
      <p>Encontrará una serie de afirmaciones. Lea cada una y decida si, aplicada a usted, es <b>Verdadera</b> o <b>Falsa</b>. Elija <b>una sola</b> opción por afirmación.</p>
      <p>Responda todas, sin dejar ninguna en blanco. No hay respuestas buenas ni malas: responda con sinceridad según cómo es usted <i>actualmente</i>. Son 338 afirmaciones y puede avanzar a su ritmo; sus respuestas se guardan en este dispositivo mientras las contesta.</p>
      <p class="small muted">Al terminar, sus respuestas se enviarán para su interpretación y este enlace se cerrará.</p></div>
    <form id="df" class="card"><h2>Datos generales</h2>
      <label>Nombre completo *</label><input id="nombre" required value="${esc(st.datos?.nombre)}" autocomplete="name">
      <div class="grid2"><div><label>Edad *</label><input id="edad" type="number" min="5" max="110" required value="${esc(st.datos?.edad)}"></div>
      <div><label>Sexo *</label><select id="sexo" required><option value="">Seleccione</option>${['Femenino', 'Masculino'].map(o => `<option ${st.datos?.sexo === o ? 'selected' : ''}>${o}</option>`).join('')}</select></div>
      <div><label>Escolaridad</label><select id="escolaridad"><option value="">Seleccione</option>${['Primaria', 'Secundaria', 'Bachillerato', 'Técnico', 'Licenciatura', 'Posgrado'].map(o => `<option ${st.datos?.escolaridad === o ? 'selected' : ''}>${o}</option>`).join('')}</select></div>
      <div><label>Estado civil</label><select id="estadoCivil"><option value="">Seleccione</option>${['Soltero(a)', 'Casado(a)', 'Unión libre', 'Divorciado(a)', 'Separado(a)', 'Viudo(a)'].map(o => `<option ${st.datos?.estadoCivil === o ? 'selected' : ''}>${o}</option>`).join('')}</select></div></div>
      <label>Ocupación</label><input id="ocupacion" value="${esc(st.datos?.ocupacion)}">
      <button class="btn" style="width:100%;margin-top:14px">${answered() ? 'Continuar' : 'Comenzar'}</button></form>`;
    document.getElementById('df').onsubmit = ev => {
      ev.preventDefault();
      st.datos = { nombre: val('nombre'), edad: val('edad'), sexo: val('sexo'), escolaridad: val('escolaridad'), ocupacion: val('ocupacion'), estadoCivil: val('estadoCivil') };
      st.page = Math.max(0, st.page); save(); page();
    };
  }

  function page() {
    const total = Math.ceil(338 / PER), p = st.page, from = p * PER + 1, to = Math.min(338, from + PER - 1);
    const pct = Math.round(answered() / 338 * 100);
    let h = `<div class="topbar"><div class="brand">MMPI-2-RF</div><span class="small muted">${answered()} de 338</span></div>
      <div class="prog"><i style="width:${pct}%"></i></div><p class="small muted">Página ${p + 1} de ${total}</p><div class="card" id="qs">`;
    for (let i = from; i <= to; i++) {
      h += `<div class="q" id="q${i}"><p><b class="n">${i}.</b>${esc(MODEL.items[i - 1])}</p><div class="vf">
        <button data-i="${i}" data-v="1" class="${st.ans[i] === 1 ? 'on' : ''}">Verdadero</button><button data-i="${i}" data-v="2" class="${st.ans[i] === 2 ? 'on' : ''}">Falso</button></div></div>`;
    }
    h += `</div><div class="sticky"><button class="btn sec" id="prev" ${p === 0 ? 'disabled' : ''}>Anterior</button><button class="btn" id="next">${p === total - 1 ? 'Finalizar y enviar' : 'Siguiente'}</button></div><div id="msg" class="err center"></div>`;
    $app.innerHTML = h;
    $app.onclick = null;
    document.getElementById('qs').onclick = e => {
      const b = e.target.closest('button[data-i]'); if (!b) return;
      const i = +b.dataset.i; st.ans[i] = +b.dataset.v; save();
      b.parentElement.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      document.getElementById('q' + i).classList.remove('miss');
      document.querySelector('.prog i').style.width = Math.round(answered() / 338 * 100) + '%';
      document.querySelector('.topbar .small').textContent = answered() + ' de 338';
    };
    document.getElementById('prev').onclick = () => { st.page--; save(); page(); window.scrollTo(0, 0); };
    document.getElementById('next').onclick = async ev => {
      const missing = []; for (let i = from; i <= to; i++) if (!st.ans[i]) missing.push(i);
      if (missing.length) { missing.forEach(i => document.getElementById('q' + i).classList.add('miss')); document.getElementById('msg').textContent = 'Falta responder la(s) afirmación(es): ' + missing.join(', '); document.getElementById('q' + missing[0]).scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      if (p < total - 1) { st.page++; save(); page(); window.scrollTo(0, 0); return; }
      const gaps = []; for (let i = 1; i <= 338; i++) if (!st.ans[i]) gaps.push(i);
      if (gaps.length) { document.getElementById('msg').textContent = 'Aún faltan afirmaciones por responder: ' + gaps.slice(0, 15).join(', ') + (gaps.length > 15 ? '…' : ''); st.page = Math.floor((gaps[0] - 1) / PER); save(); return; }
      if (!confirm('¿Enviar sus respuestas? Después de enviarlas no podrá modificarlas.')) return;
      ev.target.disabled = true; ev.target.textContent = 'Enviando…';
      let s = ''; for (let i = 1; i <= 338; i++) s += st.ans[i];
      try { await store.submit(token, { ...st.datos, fechaAplicacion: new Date().toLocaleDateString('es-MX') }, s); localStorage.removeItem(KEY); sent(); }
      catch (e) { ev.target.disabled = false; ev.target.textContent = 'Finalizar y enviar'; document.getElementById('msg').textContent = e.message === 'closed' ? 'Este enlace ya no está disponible.' : 'No se pudo enviar. Revise su conexión e inténtelo de nuevo.'; }
    };
  }
  const sent = () => { $app.innerHTML = `<div class="card done"><div class="big">✅</div><h2>Sus respuestas han sido enviadas para su interpretación</h2><p class="muted">Gracias por su participación. Ya puede cerrar esta ventana.</p></div>`; };
  st.page >= 0 && st.datos ? page() : intro();
}

/* ---------------- Actualización automática ---------------- */
// Cada vez que publiques cambios en GitHub, la app abierta los detecta sola y se recarga
// (sin cerrar el navegador). Espera si la persona está escribiendo o se está generando el PDF.
const WATCH = ['index.html', 'css/style.css', 'js/app.js', 'js/model.js', 'js/scoring.js', 'js/store.js', 'js/pdf.js', 'js/interpretacion.js', 'js/config.js', 'manifest.webmanifest'];
const hash = t => { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36) + t.length; };
async function signature() {
  try {
    const parts = await Promise.all(WATCH.map(async f => { const r = await fetch(f, { cache: 'no-cache' }); if (!r.ok) throw 0; return hash(await r.text()); }));
    return parts.join('|');
  } catch { return null; }   // sin conexión: no hace nada
}
let baseline = null, lastCheck = 0, reloading = false;
const busy = () => {
  const a = document.activeElement, df = document.getElementById('df');
  return (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) || document.getElementById('pdf')?.disabled
    || document.getElementById('next')?.textContent === 'Enviando…' || (df && [...df.elements].some(e => e.value && e.tagName !== 'BUTTON'));
};
function applyUpdate() {
  if (reloading) return;
  if (busy()) { setTimeout(applyUpdate, 5000); return; }
  reloading = true; toast('Actualizando la aplicación…'); setTimeout(() => location.reload(), 700);
}
async function checkUpdate(force) {
  if (reloading || document.hidden || (!force && Date.now() - lastCheck < 20000)) return;
  lastCheck = Date.now();
  const s = await signature(); if (!s) return;
  if (baseline === null) baseline = s; else if (s !== baseline) applyUpdate();
}
function watchUpdates() {
  checkUpdate(true);
  setInterval(checkUpdate, 3 * 60 * 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkUpdate(); });
  window.addEventListener('focus', () => checkUpdate());
  window.addEventListener('online', () => checkUpdate(true));
}

/* ---------------- Arranque ---------------- */
(async () => {
  try { await store.init(); } catch (e) { console.error(e); }
  if ('serviceWorker' in navigator) {
    const had = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
      setInterval(() => reg.update().catch(() => {}), 3 * 60 * 1000);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) reg.update().catch(() => {}); });
    }).catch(() => {});
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (had) applyUpdate(); });
  }
  route();
  watchUpdates();
})();
