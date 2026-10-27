// Capa de datos: Firebase (producción) o localStorage (modo local de pruebas).
import { FIREBASE_CONFIG, ADMIN_USER, ADMIN_EMAIL } from './config.js';

export const MODE = FIREBASE_CONFIG ? 'firebase' : 'local';
const FB = 'https://www.gstatic.com/firebasejs/10.12.5/';

export function newToken(len = 24) {
  const abc = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const r = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(r, b => abc[b % abc.length]).join('');
}

/* ---------------- MODO LOCAL ---------------- */
const LK = 'mmpi_local_db', SK = 'mmpi_local_session';
const ldb = () => JSON.parse(localStorage.getItem(LK) || '{"tests":{},"respuestas":{}}');
const lsave = d => localStorage.setItem(LK, JSON.stringify(d));
const local = {
  async init() {},
  async login(u, p) { if (u.trim().toLowerCase() === ADMIN_USER && p === 'carem2412') { sessionStorage.setItem(SK, '1'); return true; } return false; },
  async logout() { sessionStorage.removeItem(SK); },
  isLogged: () => !!sessionStorage.getItem(SK),
  async createTest(meta) { const d = ldb(), id = newToken(); d.tests[id] = { id, status: 'pending', createdAt: Date.now(), ...meta }; lsave(d); return id; },
  async listTests() { return Object.values(ldb().tests).sort((a, b) => b.createdAt - a.createdAt).map(t => ({ ...t, nombre: ldb().respuestas[t.id]?.datos?.nombre || '' })); },
  async getTest(id) { return ldb().tests[id] || null; },
  async submit(id, datos, answers) {
    const d = ldb(); const t = d.tests[id];
    if (!t || t.status !== 'pending') throw new Error('closed');
    t.status = 'completed'; t.completedAt = Date.now();
    d.respuestas[id] = { datos, answers, completedAt: t.completedAt }; lsave(d);
  },
  async getResult(id) { const d = ldb(); return d.tests[id] ? { test: d.tests[id], ...d.respuestas[id] } : null; },
  async deleteTest(id) { const d = ldb(); delete d.tests[id]; delete d.respuestas[id]; lsave(d); },
};

/* ---------------- FIREBASE ---------------- */
let fb;
async function loadFb() {
  if (fb) return fb;
  const [app, fs, au] = await Promise.all([import(FB + 'firebase-app.js'), import(FB + 'firebase-firestore.js'), import(FB + 'firebase-auth.js')]);
  const a = app.initializeApp(FIREBASE_CONFIG);
  fb = { fs, au, db: fs.getFirestore(a), auth: au.getAuth(a) };
  await fb.auth.authStateReady();
  return fb;
}
const remote = {
  async init() { await loadFb(); },
  async login(u, p) {
    const { au, auth } = await loadFb();
    if (u.trim().toLowerCase() !== ADMIN_USER) return false;
    try { await au.signInWithEmailAndPassword(auth, ADMIN_EMAIL, p); return true; } catch { return false; }
  },
  async logout() { const { au, auth } = await loadFb(); await au.signOut(auth); },
  isLogged: () => !!(fb && fb.auth.currentUser),
  async createTest(meta) {
    const { fs, db } = await loadFb(); const id = newToken();
    await fs.setDoc(fs.doc(db, 'tests', id), { status: 'pending', createdAt: Date.now(), ...meta });
    return id;
  },
  async listTests() {
    const { fs, db } = await loadFb();
    const [ts, rs] = await Promise.all([fs.getDocs(fs.collection(db, 'tests')), fs.getDocs(fs.collection(db, 'respuestas'))]);
    const names = {}; rs.forEach(d => { names[d.id] = d.data().datos?.nombre || ''; });
    return ts.docs.map(d => ({ id: d.id, ...d.data(), nombre: names[d.id] || '' })).sort((a, b) => b.createdAt - a.createdAt);
  },
  async getTest(id) {
    const { fs, db } = await loadFb(); const s = await fs.getDoc(fs.doc(db, 'tests', id));
    return s.exists() ? { id, ...s.data() } : null;
  },
  async submit(id, datos, answers) {
    const { fs, db } = await loadFb(); const now = Date.now(); const b = fs.writeBatch(db);
    b.update(fs.doc(db, 'tests', id), { status: 'completed', completedAt: now });
    b.set(fs.doc(db, 'respuestas', id), { datos, answers, completedAt: now });
    try { await b.commit(); } catch (e) { throw new Error('closed'); }
  },
  async getResult(id) {
    const { fs, db } = await loadFb();
    const [t, r] = await Promise.all([fs.getDoc(fs.doc(db, 'tests', id)), fs.getDoc(fs.doc(db, 'respuestas', id))]);
    return t.exists() ? { test: { id, ...t.data() }, ...(r.exists() ? r.data() : {}) } : null;
  },
  async deleteTest(id) {
    const { fs, db } = await loadFb();
    await fs.deleteDoc(fs.doc(db, 'respuestas', id)).catch(() => {});
    await fs.deleteDoc(fs.doc(db, 'tests', id));
  },
};
export const store = MODE === 'firebase' ? remote : local;
