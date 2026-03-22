/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                      S T U D Y H U B                            ║
 * ║                                                                  ║
 * ║  © 2025 Yination. All rights reserved.                           |
 * ║                                                                  ║
 * ║  This software and its source code are proprietary and           ║
 * ║  confidential. Unauthorised copying, modification, distribution  ║
 * ║  or use of this software, in whole or in part, by any means,    ║
 * ║  is strictly prohibited without the express written permission   ║
 * ║  of the owner.                                                   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

/* ═══════════════════════════════════════════════
   SUPERUSER CONFIG  ← change before deploying
═══════════════════════════════════════════════ */
const SUPERUSER_USERNAME = 'yination';
const SUPERUSER_PASSWORD = 'Ucwme50p';
const APP_VERSION        = '2.0.0';
const COPYRIGHT_YEAR     = '2025';
const COPYRIGHT_NAME     = 'Yination';
const COPYRIGHT_ORG      = "Excalibur";

/* ═══════════════════════════════════════════════
   SUPABASE CLIENT
   Vite exposes env vars prefixed with VITE_
═══════════════════════════════════════════════ */
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/* ═══════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════ */
const ROLE  = { SUPERUSER: 'superuser', ADMIN: 'admin', USER: 'user' };
const YEARS = [1, 2, 3, 4];

const YEAR_COLORS = { 1:'#4f9cf9', 2:'#7fda96', 3:'#f9a84f', 4:'#da7ff0' };
const YEAR_BG     = { 1:'rgba(79,156,249,0.1)', 2:'rgba(127,218,150,0.1)', 3:'rgba(249,168,79,0.1)', 4:'rgba(218,127,240,0.1)' };
const ROLE_COLOR  = { superuser:'#f9a84f', admin:'#da7ff0', user:'#4f9cf9' };
const ROLE_BG     = { superuser:'rgba(249,168,79,0.12)', admin:'rgba(218,127,240,0.12)', user:'rgba(79,156,249,0.12)' };
const ROLE_LABEL  = { superuser:'⚡ Superuser', admin:'🛡 Admin', user:'Student' };
const COLOR_MAP   = { blue:{bar:'#4f9cf9'}, orange:{bar:'#f9a84f'}, green:{bar:'#7fda96'}, purple:{bar:'#da7ff0'} };
const CARD_ACCENTS= ['#4f9cf9','#f9a84f','#7fda96','#da7ff0','#f97b7b','#a8f94f','#4ff9e4','#f94fcc'];

/* ═══════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════ */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Mono:wght@400;600&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0d0f14;color:#e2e6f0;font-family:'DM Sans',sans-serif;min-height:100vh}
  ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#13161d}::-webkit-scrollbar-thumb{background:#252a36;border-radius:3px}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shake{0%,100%{transform:translateX(0)}25%,75%{transform:translateX(-5px)}50%{transform:translateX(5px)}}
  .fade{animation:fadeIn .22s ease both}
  .shake{animation:shake .3s ease}
  input:focus,select:focus,textarea:focus{outline:2px solid #4f9cf940!important;outline-offset:0}
`;

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
function hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16);
}
const isSU = u => u?.toLowerCase() === SUPERUSER_USERNAME.toLowerCase();

/* ═══════════════════════════════════════════════
   DATABASE LAYER  (Supabase)
═══════════════════════════════════════════════ */
async function dbLoadUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return data || [];
}
async function dbSaveUser(user) {
  const { error } = await supabase.from('users').upsert(user, { onConflict: 'username' });
  if (error) throw error;
}
async function dbLoadAdmins() {
  const { data } = await supabase.from('admins').select('username');
  return (data || []).map(r => r.username.toLowerCase());
}
async function dbSetAdmins(list) {
  await supabase.from('admins').delete().neq('username', '__none__');
  if (list.length > 0) await supabase.from('admins').insert(list.map(u => ({ username: u.toLowerCase() })));
}
async function dbLoadCourseIndex() {
  const { data } = await supabase.from('courses').select('id,year,course_name,chapter_title,concept_count,term_count,q_count,added_at').order('added_at', { ascending: false });
  return (data || []).map(r => ({
    id: r.id, year: r.year, courseName: r.course_name,
    chapterTitle: r.chapter_title, conceptCount: r.concept_count,
    termCount: r.term_count, qCount: r.q_count, addedAt: r.added_at
  }));
}
async function dbLoadCourseData(id) {
  const { data } = await supabase.from('courses').select('data').eq('id', id).single();
  return data?.data || null;
}
async function dbSaveCourse(entry, courseData) {
  const { error } = await supabase.from('courses').upsert({
    id: entry.id, year: entry.year,
    course_name: entry.courseName, chapter_title: entry.chapterTitle,
    concept_count: entry.conceptCount, term_count: entry.termCount,
    q_count: entry.qCount, added_at: entry.addedAt, data: courseData
  }, { onConflict: 'id' });
  if (error) throw error;
}
async function dbDeleteCourse(id) {
  await supabase.from('courses').delete().eq('id', id);
}
async function dbLoadProgress(username) {
  const { data } = await supabase.from('progress').select('*').eq('username', username);
  const out = {};
  (data || []).forEach(r => { out[r.course_id] = { viewed: r.viewed, openedQs: r.opened_qs || [] }; });
  return out;
}
async function dbSaveProgress(username, progress) {
  const rows = Object.entries(progress).map(([cid, p]) => ({
    username, course_id: cid, viewed: p.viewed, opened_qs: p.openedQs
  }));
  if (rows.length > 0) await supabase.from('progress').upsert(rows, { onConflict: 'username,course_id' });
}
async function resolveRole(username) {
  if (isSU(username)) return ROLE.SUPERUSER;
  const admins = await dbLoadAdmins();
  return admins.includes(username.toLowerCase()) ? ROLE.ADMIN : ROLE.USER;
}

/* ═══════════════════════════════════════════════
   AI LAYER  (calls /api/generate → Gemini)
═══════════════════════════════════════════════ */
async function processPDF(base64Data, filename) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Data, filename })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error ${res.status}`);
  }
  return res.json();
}

/* ═══════════════════════════════════════════════
   SMALL UI ATOMS
═══════════════════════════════════════════════ */
const Tag = ({ children, color = '#4f9cf9' }) => (
  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, background: `${color}18`, color, borderRadius: 4, padding: '2px 8px', marginRight: 5, display: 'inline-block' }}>{children}</span>
);
const Mono = ({ children, color = '#4f9cf9', size = 10 }) => (
  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: size, color, letterSpacing: 2, textTransform: 'uppercase' }}>{children}</span>
);
const SectionLabel = ({ children }) => (
  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#f9a84f', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
    {children}<div style={{ flex: 1, height: 1, background: '#252a36' }} />
  </div>
);
const Field = ({ label, type = 'text', value, onChange, placeholder, error, disabled }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <div style={{ fontSize: 11, color: '#8892a4', marginBottom: 5, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: 1 }}>{label}</div>}
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
      style={{ width: '100%', background: disabled ? '#0a0c10' : '#0d0f14', border: `1px solid ${error ? '#f05050' : '#252a36'}`, borderRadius: 8, padding: '11px 14px', color: disabled ? '#8892a4' : '#fff', fontSize: 14, fontFamily: "'DM Sans',sans-serif" }} />
    {error && <div style={{ color: '#f05050', fontSize: 11, marginTop: 4 }}>{error}</div>}
  </div>
);
const Avatar = ({ name, size = 32 }) => {
  const ini = name ? name.slice(0, 2).toUpperCase() : '??';
  const hue = name ? name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360 : 200;
  return <div style={{ width: size, height: size, borderRadius: '50%', background: `hsl(${hue},55%,25%)`, border: `2px solid hsl(${hue},55%,45%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'IBM Plex Mono',monospace", fontSize: size * .33, color: `hsl(${hue},80%,80%)`, flexShrink: 0 }}>{ini}</div>;
};
const RoleBadge = ({ role }) => (
  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, background: ROLE_BG[role], color: ROLE_COLOR[role], border: `1px solid ${ROLE_COLOR[role]}40`, borderRadius: 5, padding: '3px 8px', letterSpacing: 1 }}>{ROLE_LABEL[role]}</span>
);
const ProgressBar = ({ pct, color = '#4f9cf9' }) => (
  <div style={{ marginTop: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <Mono color="#8892a4" size={9}>PROGRESS</Mono>
      <Mono color={color} size={9}>{pct}%</Mono>
    </div>
    <div style={{ height: 3, background: '#252a36', borderRadius: 2 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width .4s ease' }} />
    </div>
  </div>
);
const CopyrightBar = () => (
  <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0d0f14', borderTop: '1px solid #1a1e27', padding: '6px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 100 }}>
    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: '#3a3f4f', letterSpacing: 1 }}>© {COPYRIGHT_YEAR} {COPYRIGHT_NAME} · {COPYRIGHT_ORG} · All rights reserved</span>
    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: '#3a3f4f', letterSpacing: 1 }}>StudyHub v{APP_VERSION} · Unauthorised use prohibited</span>
  </div>
);

/* ═══════════════════════════════════════════════
   AUTH SCREEN
═══════════════════════════════════════════════ */
function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState('signin');
  const [f, setF] = useState({ username: '', password: '', confirm: '', displayName: '', year: 3 });
  const [errs, setErrs] = useState({});
  const [loading, setLoading] = useState(false);
  const set = (k, v) => { setF(p => ({ ...p, [k]: v })); setErrs(p => ({ ...p, [k]: '' })); };

  const signIn = async () => {
    const e = {};
    if (!f.username.trim()) e.username = 'Required';
    if (!f.password) e.password = 'Required';
    if (Object.keys(e).length) { setErrs(e); return; }
    setLoading(true);
    if (isSU(f.username) && f.password === SUPERUSER_PASSWORD) {
      onLogin({ username: SUPERUSER_USERNAME, displayName: 'Owner', role: ROLE.SUPERUSER }); return;
    }
    try {
      const users = await dbLoadUsers();
      const user = users.find(u => u.username.toLowerCase() === f.username.toLowerCase());
      if (!user || user.pw_hash !== hashStr(f.password)) {
        setErrs({ password: 'Incorrect username or password.' }); setLoading(false); return;
      }
      const role = await resolveRole(user.username);
      onLogin({ username: user.username, displayName: user.display_name || user.username, year: user.year, role });
    } catch (err) { setErrs({ password: 'Connection error. Try again.' }); setLoading(false); }
  };

  const signUp = async () => {
    const e = {};
    if (!f.username.trim()) e.username = 'Required';
    else if (f.username.length < 3) e.username = 'Min 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(f.username)) e.username = 'Letters, numbers, underscores only';
    if (!f.password) e.password = 'Required';
    else if (f.password.length < 6) e.password = 'Min 6 characters';
    if (f.confirm !== f.password) e.confirm = 'Passwords do not match';
    if (Object.keys(e).length) { setErrs(e); return; }
    if (isSU(f.username)) { setErrs({ username: 'Username is reserved.' }); return; }
    setLoading(true);
    try {
      const users = await dbLoadUsers();
      if (users.find(u => u.username.toLowerCase() === f.username.toLowerCase())) {
        setErrs({ username: 'Username already taken.' }); setLoading(false); return;
      }
      const nu = { username: f.username, pw_hash: hashStr(f.password), display_name: f.displayName.trim() || f.username, year: f.year, created_at: new Date().toISOString() };
      await dbSaveUser(nu);
      onLogin({ username: nu.username, displayName: nu.display_name, year: nu.year, role: ROLE.USER });
    } catch (err) { setErrs({ password: 'Connection error. Try again.' }); setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'radial-gradient(ellipse at 50% 0%,#1a1e2f 0%,#0d0f14 60%)' }}>
      <div className="fade" style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 40, color: '#fff', letterSpacing: -1, lineHeight: 1 }}>Study<span style={{ color: '#4f9cf9' }}>Hub</span></div>
          <p style={{ color: '#8892a4', fontSize: 13, marginTop: 8 }}>{COPYRIGHT_ORG} · AI-powered course companion</p>
        </div>
        <div style={{ background: '#13161d', border: '1px solid #252a36', borderRadius: 16, padding: '30px 30px' }}>
          <div style={{ display: 'flex', background: '#0d0f14', borderRadius: 10, padding: 4, marginBottom: 26 }}>
            {['signin', 'signup'].map(t => (
              <button key={t} onClick={() => { setTab(t); setErrs({}); }} style={{ flex: 1, padding: '9px 0', borderRadius: 7, border: 'none', background: tab === t ? '#1a1e27' : 'none', color: tab === t ? '#fff' : '#8892a4', cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 600 : 400 }}>
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>
          {tab === 'signin' ? (
            <>
              <Field label="USERNAME" value={f.username} onChange={e => set('username', e.target.value)} placeholder="your_username" error={errs.username} />
              <Field label="PASSWORD" type="password" value={f.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" error={errs.password} />
              <button onClick={signIn} disabled={loading} style={{ width: '100%', background: loading ? '#252a36' : '#4f9cf9', border: 'none', borderRadius: 8, color: loading ? '#8892a4' : '#000', cursor: loading ? 'not-allowed' : 'pointer', padding: '12px 0', fontSize: 14, fontWeight: 700, marginTop: 4 }}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </>
          ) : (
            <>
              <Field label="DISPLAY NAME (optional)" value={f.displayName} onChange={e => set('displayName', e.target.value)} placeholder="e.g. Chimdi" />
              <Field label="USERNAME" value={f.username} onChange={e => set('username', e.target.value)} placeholder="min 3 chars, no spaces" error={errs.username} />
              <Field label="PASSWORD" type="password" value={f.password} onChange={e => set('password', e.target.value)} placeholder="min 6 characters" error={errs.password} />
              <Field label="CONFIRM PASSWORD" type="password" value={f.confirm} onChange={e => set('confirm', e.target.value)} placeholder="repeat password" error={errs.confirm} />
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: '#8892a4', marginBottom: 8, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: 1 }}>YOUR YEAR</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {YEARS.map(y => (
                    <button key={y} onClick={() => set('year', y)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, cursor: 'pointer', border: `1px solid ${f.year === y ? YEAR_COLORS[y] + '70' : '#252a36'}`, background: f.year === y ? YEAR_BG[y] : '#0d0f14', color: f.year === y ? YEAR_COLORS[y] : '#8892a4', fontWeight: f.year === y ? 700 : 400, fontSize: 13 }}>
                      Yr {y}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={signUp} disabled={loading} style={{ width: '100%', background: loading ? '#252a36' : '#4f9cf9', border: 'none', borderRadius: 8, color: loading ? '#8892a4' : '#000', cursor: loading ? 'not-allowed' : 'pointer', padding: '12px 0', fontSize: 14, fontWeight: 700 }}>
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </>
          )}
        </div>
        <p style={{ textAlign: 'center', color: '#3a3f4f', fontSize: 10, marginTop: 16, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: 1 }}>© {COPYRIGHT_YEAR} {COPYRIGHT_NAME} · {COPYRIGHT_ORG} · All rights reserved</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   UPLOAD MODAL  (AI upload + Paste JSON)
═══════════════════════════════════════════════ */
function UploadModal({ onClose, onDone }) {
  const [mode, setMode] = useState('ai');   // 'ai' | 'paste'
  const [file, setFile] = useState(null);
  const [year, setYear] = useState(1);
  const [pasteText, setPasteText] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const ref = useRef();

  const saveAndClose = async (data) => {
    const id = `c-${Date.now()}`;
    const entry = {
      id, year,
      courseName: data.courseName || 'Course',
      chapterTitle: data.chapterTitle || 'Chapter',
      conceptCount: data.keyConcepts?.length || 0,
      termCount: data.definitions?.length || 0,
      qCount: data.questions?.length || 0,
      addedAt: new Date().toLocaleDateString()
    };
    await dbSaveCourse(entry, data);
    const idx = await dbLoadCourseIndex();
    setStatus('done');
    setTimeout(() => onDone(idx), 700);
  };

  const goAI = async () => {
    if (!file) return;
    setStatus('processing'); setError('');
    try {
      const b64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.onerror = () => rej(new Error('read failed')); r.readAsDataURL(file); });
      const data = await processPDF(b64, file.name);
      await saveAndClose(data);
    } catch (e) { setError('Failed: ' + e.message); setStatus('error'); }
  };

  const goPaste = async () => {
    setError('');
    try {
      const data = JSON.parse(pasteText.replace(/```json|```/g, '').trim());
      if (!data.chapterTitle) throw new Error('Invalid JSON — missing chapterTitle');
      setStatus('processing');
      await saveAndClose(data);
    } catch (e) { setError('Invalid JSON: ' + e.message); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500, padding: 20, overflowY: 'auto' }}>
      <div className="fade" style={{ background: '#13161d', border: '1px solid #252a36', borderRadius: 16, padding: '30px 34px', maxWidth: 500, width: '100%', margin: 'auto' }}>
        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, color: '#fff', marginBottom: 6 }}>Add Course</div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', background: '#0d0f14', borderRadius: 10, padding: 4, marginBottom: 22 }}>
          {[{ id: 'ai', label: '✨ AI Upload (Gemini)' }, { id: 'paste', label: '📋 Paste JSON' }].map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setError(''); setStatus('idle'); }} style={{ flex: 1, padding: '8px 0', borderRadius: 7, border: 'none', background: mode === m.id ? '#1a1e27' : 'none', color: mode === m.id ? '#fff' : '#8892a4', cursor: 'pointer', fontSize: 12, fontWeight: mode === m.id ? 600 : 400 }}>{m.label}</button>
          ))}
        </div>

        {/* Year picker (shared) */}
        <div style={{ marginBottom: 18 }}>
          <Mono color="#8892a4" size={10}>ASSIGN TO YEAR</Mono>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {YEARS.map(y => (
              <button key={y} onClick={() => setYear(y)} style={{ flex: 1, padding: '9px 0', borderRadius: 8, cursor: 'pointer', border: `1px solid ${year === y ? YEAR_COLORS[y] + '70' : '#252a36'}`, background: year === y ? YEAR_BG[y] : '#0d0f14', color: year === y ? YEAR_COLORS[y] : '#8892a4', fontWeight: year === y ? 700 : 400, fontSize: 13 }}>
                Year {y}
              </button>
            ))}
          </div>
        </div>

        {/* AI mode */}
        {mode === 'ai' && (
          <>
            <p style={{ color: '#8892a4', fontSize: 12.5, marginBottom: 14 }}>Upload a PDF — Gemini reads it and generates concepts, definitions, mechanisms &amp; <strong style={{ color: '#f9a84f' }}>25 practice questions</strong>.</p>
            <div onClick={() => ref.current?.click()} style={{ border: `2px dashed ${file ? '#7fda96' : '#252a36'}`, borderRadius: 10, padding: '22px 20px', textAlign: 'center', cursor: 'pointer', marginBottom: 14, background: file ? 'rgba(127,218,150,0.04)' : '#0d0f14' }}>
              <div style={{ fontSize: 24, marginBottom: 5 }}>{file ? '✅' : '📄'}</div>
              <div style={{ color: file ? '#7fda96' : '#8892a4', fontSize: 13 }}>{file ? file.name : 'Click to select a PDF'}</div>
              <input ref={ref} type="file" accept=".pdf" onChange={e => { const f = e.target.files[0]; if (f?.type === 'application/pdf') { setFile(f); setError(''); } else setError('PDF only.'); }} style={{ display: 'none' }} />
            </div>
          </>
        )}

        {/* Paste mode */}
        {mode === 'paste' && (
          <>
            <p style={{ color: '#8892a4', fontSize: 12.5, marginBottom: 12 }}>Generate a study guide in Claude, ChatGPT, or any AI — paste the JSON here. The JSON must follow the StudyHub format.</p>
            <textarea value={pasteText} onChange={e => setPasteText(e.target.value)} placeholder={'{\n  "courseName": "COS 341",\n  "chapterTitle": "Memory System",\n  "keyConcepts": [...],\n  ...\n}'} rows={10}
              style={{ width: '100%', background: '#0d0f14', border: '1px solid #252a36', borderRadius: 8, padding: '11px 14px', color: '#e2e6f0', fontSize: 12, fontFamily: "'IBM Plex Mono',monospace", resize: 'vertical', marginBottom: 14 }} />
            <div style={{ background: 'rgba(79,156,249,0.05)', border: '1px solid #4f9cf920', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: '#4f9cf9', marginBottom: 4, fontWeight: 600 }}>📋 How to generate JSON from Claude.ai</div>
              <div style={{ fontSize: 11, color: '#8892a4', lineHeight: 1.6 }}>1. Upload your PDF in Claude.ai<br />2. Ask: "Generate a StudyHub JSON study guide for this PDF"<br />3. Copy the JSON output and paste it above</div>
            </div>
          </>
        )}

        {error && <div style={{ background: 'rgba(240,80,80,0.1)', border: '1px solid #f05050', borderRadius: 8, padding: '9px 14px', color: '#f05050', fontSize: 12.5, marginBottom: 12 }}>{error}</div>}
        {status === 'processing' && <div style={{ background: 'rgba(79,156,249,0.08)', border: '1px solid #4f9cf930', borderRadius: 8, padding: '10px 14px', color: '#4f9cf9', fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>{mode === 'ai' ? 'Gemini is reading your PDF…' : 'Saving course…'}</div>}
        {status === 'done' && <div style={{ background: 'rgba(127,218,150,0.08)', border: '1px solid #7fda9640', borderRadius: 8, padding: '10px 14px', color: '#7fda96', fontSize: 13, marginBottom: 12 }}>✓ Course added to Year {year}!</div>}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid #252a36', borderRadius: 8, color: '#8892a4', cursor: 'pointer', padding: '9px 18px', fontSize: 13 }}>Cancel</button>
          <button
            onClick={mode === 'ai' ? goAI : goPaste}
            disabled={status === 'processing' || status === 'done' || (mode === 'ai' && !file) || (mode === 'paste' && !pasteText.trim())}
            style={{ background: status === 'processing' || status === 'done' || (mode === 'ai' && !file) || (mode === 'paste' && !pasteText.trim()) ? '#252a36' : '#4f9cf9', border: 'none', borderRadius: 8, color: status === 'processing' || status === 'done' || (mode === 'ai' && !file) || (mode === 'paste' && !pasteText.trim()) ? '#8892a4' : '#000', cursor: 'pointer', padding: '9px 22px', fontSize: 13, fontWeight: 700 }}>
            {status === 'processing' ? 'Processing…' : status === 'done' ? 'Done!' : mode === 'ai' ? 'Generate with Gemini' : 'Save Course'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   COURSE VIEW
═══════════════════════════════════════════════ */
const ALL_TABS = [
  { id: 'concepts', label: 'Key Concepts' }, { id: 'definitions', label: 'Definitions' },
  { id: 'mechanisms', label: 'Mechanisms' }, { id: 'algorithms', label: 'Algorithms' },
  { id: 'takeaways', label: 'Takeaways' }, { id: 'questions', label: 'Practice Q&A' }
];

function CourseView({ course, user, progress, onBack, onProgressUpdate }) {
  const [tab, setTab] = useState('concepts');
  const [openQ, setOpenQ] = useState(null);
  const [filter, setFilter] = useState('');
  const d = course.data;
  const cp = progress[course.id] || { viewed: false, openedQs: [] };
  const isPriv = user.role !== ROLE.USER;

  useEffect(() => {
    if (!cp.viewed) { const n = { ...progress, [course.id]: { ...cp, viewed: true } }; onProgressUpdate(n); }
  }, []);

  const revealQ = idx => {
    setOpenQ(openQ === idx ? null : idx);
    if (!cp.openedQs.includes(idx)) { const n = { ...progress, [course.id]: { ...cp, openedQs: [...cp.openedQs, idx] } }; onProgressUpdate(n); }
  };

  const totalQ = d.questions?.length || 0;
  const openedQ = cp.openedQs.length;
  const pct = totalQ === 0 ? 0 : Math.round(openedQ / totalQ * 100);
  const hasAlgo = d.algorithms?.length > 0;
  const tabs = ALL_TABS.filter(t => t.id !== 'algorithms' || hasAlgo);
  const filteredQ = (d.questions || []).filter(q => !filter || q.question.toLowerCase().includes(filter.toLowerCase()));
  const accent = YEAR_COLORS[course.year] || '#4f9cf9';

  return (
    <div style={{ maxWidth: 940, margin: '0 auto', padding: '28px 20px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26, flexWrap: 'wrap', gap: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: '1px solid #252a36', borderRadius: 6, color: '#8892a4', cursor: 'pointer', padding: '6px 14px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11 }}>← All Courses</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: YEAR_BG[course.year], border: `1px solid ${accent}40`, borderRadius: 6, padding: '4px 12px' }}><Mono color={accent} size={9}>Year {course.year}</Mono></div>
          {!isPriv && <div style={{ fontSize: 12, color: '#8892a4' }}>{openedQ}/{totalQ} revealed</div>}
        </div>
      </div>

      <div style={{ borderBottom: '1px solid #252a36', paddingBottom: 24, marginBottom: 30 }}>
        <Mono>{d.courseName}</Mono>
        <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(22px,4vw,38px)', color: '#fff', lineHeight: 1.15, margin: '8px 0 10px' }}>{d.chapterTitle}</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Tag>{d.keyConcepts?.length || 0} concepts</Tag>
          <Tag color="#f9a84f">{d.definitions?.length || 0} terms</Tag>
          <Tag color="#7fda96">{totalQ} questions</Tag>
        </div>
        {!isPriv && <ProgressBar pct={pct} color={accent} />}
      </div>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', borderBottom: '1px solid #252a36', marginBottom: 30 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? '#4f9cf918' : 'none', border: 'none', borderBottom: tab === t.id ? '2px solid #4f9cf9' : '2px solid transparent', color: tab === t.id ? '#4f9cf9' : '#8892a4', cursor: 'pointer', padding: '9px 15px', fontSize: 13, fontWeight: tab === t.id ? 600 : 400 }}>{t.label}</button>
        ))}
      </div>

      {tab === 'concepts' && <div className="fade"><SectionLabel>Key Concepts</SectionLabel><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(252px,1fr))', gap: 12 }}>{(d.keyConcepts || []).map((c, i) => <div key={i} style={{ background: '#1a1e27', border: '1px solid #252a36', borderRadius: 10, padding: '15px 17px', borderLeft: `3px solid ${(COLOR_MAP[c.color] || COLOR_MAP.blue).bar}` }}><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 600, color: '#fff', marginBottom: 5 }}>{c.title}</div><p style={{ fontSize: 12.5, color: '#8892a4', lineHeight: 1.65, margin: 0 }}>{c.description}</p></div>)}</div></div>}

      {tab === 'definitions' && <div className="fade"><SectionLabel>Terms & Definitions</SectionLabel><div style={{ background: '#1a1e27', border: '1px solid #252a36', borderRadius: 10, overflow: 'hidden' }}>{(d.definitions || []).map((def, i) => <div key={i} style={{ display: 'grid', gridTemplateColumns: '190px 1fr', borderBottom: i < d.definitions.length - 1 ? '1px solid #252a36' : 'none' }}><div style={{ padding: '12px 14px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 600, color: '#7fda96', background: '#13161d' }}>{def.term}</div><div style={{ padding: '12px 14px', fontSize: 13, color: '#e2e6f0', lineHeight: 1.7 }}>{def.definition}</div></div>)}</div></div>}

      {tab === 'mechanisms' && <div className="fade"><SectionLabel>Mechanisms Explained</SectionLabel><div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>{(d.mechanisms || []).map((m, i) => <div key={i} style={{ background: '#1a1e27', border: '1px solid #252a36', borderRadius: 10, padding: '18px 22px' }}><div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 17, color: '#fff', marginBottom: 10 }}>{m.title}</div><p style={{ fontSize: 13, color: '#8892a4', lineHeight: 1.85, margin: 0, whiteSpace: 'pre-line' }}>{m.body}</p></div>)}</div></div>}

      {tab === 'algorithms' && hasAlgo && <div className="fade"><SectionLabel>Algorithms & Methods</SectionLabel><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(228px,1fr))', gap: 11 }}>{(d.algorithms || []).map((a, i) => <div key={i} style={{ background: '#1a1e27', border: '1px solid #252a36', borderRadius: 8, padding: '13px 15px' }}><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: '#da7ff0', fontWeight: 600, marginBottom: 5 }}>{a.name}</div><p style={{ fontSize: 12, color: '#8892a4', lineHeight: 1.65, margin: 0 }}>{a.description}</p>{a.note && <p style={{ fontSize: 11, color: '#f9a84f', marginTop: 5, marginBottom: 0 }}>{a.note}</p>}</div>)}</div></div>}

      {tab === 'takeaways' && <div className="fade"><SectionLabel>Takeaways Per Chapter</SectionLabel><div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>{(d.chapters || []).map((ch, i) => <div key={i} style={{ background: '#13161d', border: '1px solid #252a36', borderRadius: 12, padding: '18px 22px' }}><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: '#8892a4', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 3 }}>{ch.num}</div><div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 17, color: '#fff', marginBottom: 11 }}>{ch.name}</div><div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>{(ch.takeaways || []).map((t, j) => <div key={j} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', fontSize: 13, color: '#e2e6f0' }}><span style={{ color: '#da7ff0', flexShrink: 0 }}>→</span><span>{t}</span></div>)}</div></div>)}</div></div>}

      {tab === 'questions' && (
        <div className="fade">
          <SectionLabel>Practice Questions & Answers</SectionLabel>
          {!isPriv && <div style={{ background: 'rgba(79,156,249,0.05)', border: '1px solid #4f9cf920', borderRadius: 8, padding: '9px 13px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8892a4' }}>
            <span>Click to reveal answers — progress saved automatically.</span>
            <span style={{ color: '#4f9cf9', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10 }}>{openedQ}/{totalQ} opened</span>
          </div>}
          <input placeholder="Search questions…" value={filter} onChange={e => setFilter(e.target.value)} style={{ width: '100%', background: '#13161d', border: '1px solid #252a36', borderRadius: 8, padding: '9px 13px', color: '#fff', fontSize: 13, marginBottom: 14, fontFamily: "'DM Sans',sans-serif" }} />
          <Mono color="#8892a4" size={9}>SHOWING {filteredQ.length} OF {totalQ} QUESTIONS</Mono>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 12 }}>
            {filteredQ.map(q => {
              const ri = (d.questions || []).indexOf(q);
              const isOpen = openQ === ri;
              const seen = cp.openedQs.includes(ri);
              return (
                <div key={ri} style={{ background: '#1a1e27', border: `1px solid ${seen ? '#7fda9630' : '#252a36'}`, borderRadius: 10, overflow: 'hidden' }}>
                  <div onClick={() => revealQ(ri)} style={{ padding: '13px 17px', display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, background: seen ? '#7fda96' : '#4f9cf9', color: '#000', borderRadius: 4, padding: '2px 6px', flexShrink: 0, marginTop: 3 }}>Q{ri + 1}</span>
                    <span style={{ fontSize: 13.5, color: '#fff', fontWeight: 500, lineHeight: 1.6, flex: 1 }}>{q.question}</span>
                    <span style={{ color: '#8892a4', fontSize: 18, flexShrink: 0, lineHeight: 1 }}>{isOpen ? '−' : '+'}</span>
                  </div>
                  {isOpen && <div className="fade" style={{ borderTop: '1px solid #252a36', padding: '14px 17px', background: 'rgba(79,156,249,0.04)' }}>
                    <Mono color="#7fda96" size={9}>Answer</Mono>
                    <p style={{ fontSize: 13, color: '#e2e6f0', lineHeight: 1.8, margin: '8px 0 0', whiteSpace: 'pre-line' }}>{q.answer}</p>
                  </div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MANAGE ADMINS TAB (superuser only)
═══════════════════════════════════════════════ */
function ManageAdminsTab() {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => { Promise.all([dbLoadUsers(), dbLoadAdmins()]).then(([u, a]) => { setUsers(u); setAdmins(a); }); }, []);
  const flash = m => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

  const toggleAdmin = async u => {
    setBusy(u.username);
    const isAdm = admins.includes(u.username.toLowerCase());
    const next = isAdm ? admins.filter(a => a !== u.username.toLowerCase()) : [...admins, u.username.toLowerCase()];
    setAdmins(next);
    await dbSetAdmins(next);
    flash(`${u.display_name || u.username} ${isAdm ? 'demoted to Student' : 'promoted to Admin'}.`);
    setBusy('');
  };

  const filtered = users.filter(u => !search || u.username.toLowerCase().includes(search.toLowerCase()) || u.display_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ background: 'rgba(249,168,79,0.06)', border: '1px solid #f9a84f30', borderRadius: 10, padding: '12px 16px', marginBottom: 18, display: 'flex', gap: 10 }}>
        <span style={{ fontSize: 18 }}>⚡</span>
        <div><div style={{ color: '#f9a84f', fontSize: 13, fontWeight: 600, marginBottom: 3 }}>Superuser Exclusive</div><div style={{ color: '#8892a4', fontSize: 12 }}>Only you can promote or demote admins. Admins can add/remove courses but cannot access this panel.</div></div>
      </div>
      {msg && <div style={{ background: 'rgba(127,218,150,0.08)', border: '1px solid #7fda9640', borderRadius: 8, padding: '9px 14px', color: '#7fda96', fontSize: 12.5, marginBottom: 14 }}>{msg}</div>}
      <input placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', background: '#0d0f14', border: '1px solid #252a36', borderRadius: 8, padding: '9px 13px', color: '#fff', fontSize: 13, marginBottom: 14, fontFamily: "'DM Sans',sans-serif" }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((u, i) => {
          const isAdm = admins.includes(u.username.toLowerCase());
          return (
            <div key={i} style={{ background: '#13161d', border: `1px solid ${isAdm ? '#da7ff030' : '#252a36'}`, borderRadius: 10, padding: '13px 17px', display: 'flex', alignItems: 'center', gap: 13, flexWrap: 'wrap' }}>
              <Avatar name={u.display_name || u.username} />
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{u.display_name || u.username}</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: '#8892a4', marginTop: 2 }}>@{u.username} · Yr {u.year} · {new Date(u.created_at).toLocaleDateString()}</div>
              </div>
              <RoleBadge role={isAdm ? ROLE.ADMIN : ROLE.USER} />
              <button onClick={() => toggleAdmin(u)} disabled={busy === u.username} style={{ background: isAdm ? 'rgba(240,80,80,0.1)' : 'rgba(218,127,240,0.1)', border: `1px solid ${isAdm ? '#f0505040' : '#da7ff040'}`, borderRadius: 7, color: isAdm ? '#f05050' : '#da7ff0', cursor: 'pointer', padding: '6px 14px', fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600 }}>
                {busy === u.username ? '…' : isAdm ? 'Demote' : '→ Make Admin'}
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && <div style={{ color: '#8892a4', textAlign: 'center', padding: 30, border: '1px dashed #252a36', borderRadius: 10 }}>No users found.</div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ADMIN PANEL
═══════════════════════════════════════════════ */
function AdminPanel({ user, courses, onClose, onCoursesChange }) {
  const isSuperUser = user.role === ROLE.SUPERUSER;
  const panelTabs = [{ id: 'courses', label: 'Courses' }, { id: 'users', label: 'Users' }, ...(isSuperUser ? [{ id: 'admins', label: '⚡ Manage Admins' }] : [])];
  const [tab, setTab] = useState('courses');
  const [allUsers, setAllUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [filterY, setFilterY] = useState(0);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => { Promise.all([dbLoadUsers(), dbLoadAdmins()]).then(([u, a]) => { setAllUsers(u); setAdmins(a); }); }, []);

  const doDelete = async id => {
    if (!confirm('Delete this course permanently?')) return;
    await dbDeleteCourse(id);
    const idx = await dbLoadCourseIndex();
    onCoursesChange(idx);
  };

  const filtered = filterY === 0 ? courses : courses.filter(c => c.year === filterY);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.92)', zIndex: 2000, overflow: 'auto' }}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '34px 20px 90px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 26, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}><Mono color={isSuperUser ? '#f9a84f' : '#da7ff0'} size={9}>{isSuperUser ? 'SUPERUSER PANEL' : 'ADMIN PANEL'}</Mono><RoleBadge role={user.role} /></div>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 24, color: '#fff' }}>Manage StudyHub</h2>
            <p style={{ color: '#8892a4', fontSize: 12, marginTop: 4 }}>{isSuperUser ? 'Full system control — only you can manage admin roles.' : 'Add/remove courses and view registered users.'}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid #252a36', borderRadius: 8, color: '#8892a4', cursor: 'pointer', padding: '9px 18px', fontSize: 13 }}>← Back to Hub</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10, marginBottom: 24 }}>
          {[{ label: 'Total Courses', val: courses.length, color: '#4f9cf9' }, { label: 'Registered Users', val: allUsers.length, color: '#7fda96' }, { label: 'Admins', val: admins.length, color: '#da7ff0' }, ...YEARS.map(y => ({ label: `Year ${y}`, val: courses.filter(c => c.year === y).length, color: YEAR_COLORS[y] }))].map((s, i) => (
            <div key={i} style={{ background: '#13161d', border: '1px solid #252a36', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 22, color: s.color, fontWeight: 600 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: '#8892a4', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #252a36', marginBottom: 22 }}>
          {panelTabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? 'rgba(249,168,79,0.06)' : 'none', border: 'none', borderBottom: tab === t.id ? '2px solid #f9a84f' : '2px solid transparent', color: tab === t.id ? '#f9a84f' : '#8892a4', cursor: 'pointer', padding: '9px 16px', fontSize: 13, fontWeight: tab === t.id ? 600 : 400 }}>{t.label}</button>
          ))}
        </div>

        {tab === 'courses' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[{ label: 'All', y: 0 }, ...YEARS.map(y => ({ label: `Yr ${y}`, y }))].map(({ label, y }) => (
                  <button key={y} onClick={() => setFilterY(y)} style={{ background: filterY === y ? (y === 0 ? 'rgba(136,146,164,0.1)' : YEAR_BG[y]) : 'none', border: `1px solid ${filterY === y ? (y === 0 ? '#8892a4' : YEAR_COLORS[y]) + '60' : '#252a36'}`, borderRadius: 20, color: filterY === y ? (y === 0 ? '#8892a4' : YEAR_COLORS[y]) : '#8892a4', cursor: 'pointer', padding: '5px 14px', fontSize: 12, fontWeight: filterY === y ? 600 : 400 }}>{label}</button>
                ))}
              </div>
              <button onClick={() => setShowUpload(true)} style={{ background: '#4f9cf9', border: 'none', borderRadius: 8, color: '#000', cursor: 'pointer', padding: '9px 18px', fontSize: 13, fontWeight: 700 }}>+ Add Course</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {filtered.length === 0 && <div style={{ color: '#8892a4', textAlign: 'center', padding: 40, border: '1px dashed #252a36', borderRadius: 12 }}>No courses here yet.</div>}
              {filtered.map(c => (
                <div key={c.id} style={{ background: '#13161d', border: '1px solid #252a36', borderRadius: 10, padding: '13px 17px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ background: YEAR_BG[c.year], border: `1px solid ${YEAR_COLORS[c.year]}40`, borderRadius: 5, padding: '3px 9px' }}><Mono color={YEAR_COLORS[c.year]} size={9}>Yr {c.year}</Mono></div>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: '#8892a4' }}>{c.courseName}</div>
                    <div style={{ fontSize: 14, color: '#fff', marginTop: 2 }}>{c.chapterTitle}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}><Tag color="#4f9cf9">{c.conceptCount} concepts</Tag><Tag color="#7fda96">{c.qCount} questions</Tag></div>
                  <button onClick={() => doDelete(c.id)} style={{ background: 'rgba(240,80,80,0.1)', border: '1px solid #f0505040', borderRadius: 6, color: '#f05050', cursor: 'pointer', padding: '5px 12px', fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", flexShrink: 0 }}>✕ Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <Mono color="#8892a4" size={9}>{allUsers.length} REGISTERED USER{allUsers.length !== 1 ? 'S' : ''}</Mono>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {allUsers.map((u, i) => {
                const isAdm = admins.includes(u.username.toLowerCase());
                return (
                  <div key={i} style={{ background: '#13161d', border: '1px solid #252a36', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <Avatar name={u.display_name || u.username} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{u.display_name || u.username}</div>
                      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: '#8892a4', marginTop: 2 }}>@{u.username} · Yr {u.year} · {new Date(u.created_at).toLocaleDateString()}</div>
                    </div>
                    <RoleBadge role={isAdm ? ROLE.ADMIN : ROLE.USER} />
                    <div style={{ background: YEAR_BG[u.year], border: `1px solid ${YEAR_COLORS[u.year]}40`, borderRadius: 5, padding: '3px 9px' }}><Mono color={YEAR_COLORS[u.year]} size={9}>Yr {u.year}</Mono></div>
                  </div>
                );
              })}
              {allUsers.length === 0 && <div style={{ color: '#8892a4', textAlign: 'center', padding: 40, border: '1px dashed #252a36', borderRadius: 12 }}>No users yet.</div>}
            </div>
          </div>
        )}

        {tab === 'admins' && isSuperUser && <ManageAdminsTab />}
      </div>
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onDone={idx => { onCoursesChange(idx); setShowUpload(false); }} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   HOME
═══════════════════════════════════════════════ */
function Home({ user, courses, progress, onSelectCourse, onLogout, onShowAdmin, onProgressUpdate }) {
  const [activeYear, setActiveYear] = useState(user.year || 1);
  const isPriv = user.role !== ROLE.USER;
  const visible = courses.filter(c => c.year === activeYear);

  const pct = id => { const cp = progress[id]; const m = courses.find(c => c.id === id); if (!cp || !m || m.qCount === 0) return 0; return Math.round((cp.openedQs?.length || 0) / m.qCount * 100); };
  const yearStat = y => { const yc = courses.filter(c => c.year === y); if (!yc.length) return null; return `${yc.filter(c => progress[c.id]?.viewed).length}/${yc.length} started`; };

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '34px 20px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30, flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={user.displayName} size={40} />
          <div>
            <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, color: '#fff' }}>{user.displayName}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}><RoleBadge role={user.role} />{user.role === ROLE.USER && <Mono color="#8892a4" size={9}>Year {user.year} · @{user.username}</Mono>}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {isPriv && <button onClick={onShowAdmin} style={{ background: ROLE_BG[user.role], border: `1px solid ${ROLE_COLOR[user.role]}40`, borderRadius: 8, color: ROLE_COLOR[user.role], cursor: 'pointer', padding: '8px 16px', fontSize: 12, fontWeight: 600 }}>{user.role === ROLE.SUPERUSER ? '⚡ Superuser Panel' : '⚙ Admin Panel'}</button>}
          <button onClick={onLogout} style={{ background: 'none', border: '1px solid #252a36', borderRadius: 8, color: '#8892a4', cursor: 'pointer', padding: '8px 16px', fontSize: 12 }}>Sign Out</button>
        </div>
      </div>

      <div style={{ marginBottom: 26 }}>
        <Mono color="#8892a4" size={9}>BROWSE BY YEAR</Mono>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
          {YEARS.map(y => {
            const active = activeYear === y; const st = yearStat(y);
            return <button key={y} onClick={() => setActiveYear(y)} style={{ background: active ? YEAR_BG[y] : '#13161d', border: `1px solid ${active ? YEAR_COLORS[y] + '60' : '#252a36'}`, borderRadius: 10, cursor: 'pointer', padding: '10px 18px', transition: 'all .15s', textAlign: 'left' }}>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 16, color: active ? YEAR_COLORS[y] : '#fff' }}>Year {y}</div>
              {st && <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: active ? YEAR_COLORS[y] + 'aa' : '#8892a4', marginTop: 2 }}>{st}</div>}
            </button>;
          })}
        </div>
      </div>

      <Mono color="#8892a4" size={9}>{visible.length} COURSE{visible.length !== 1 ? 'S' : ''} · YEAR {activeYear}</Mono>
      {visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '55px 20px', border: '1px dashed #252a36', borderRadius: 16, marginTop: 16 }}>
          <div style={{ fontSize: 34, marginBottom: 12 }}>📚</div>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, color: '#fff', marginBottom: 8 }}>No Year {activeYear} courses yet</div>
          <p style={{ color: '#8892a4', fontSize: 13 }}>{isPriv ? 'Open the panel to add courses.' : 'Check back later — content will be added soon.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(278px,1fr))', gap: 14, marginTop: 16 }}>
          {visible.map((c, i) => {
            const accent = YEAR_COLORS[c.year] || CARD_ACCENTS[i % CARD_ACCENTS.length];
            const p = pct(c.id); const viewed = progress[c.id]?.viewed;
            return (
              <div key={c.id} onClick={() => onSelectCourse(c.id)} style={{ background: '#1a1e27', border: '1px solid #252a36', borderRadius: 12, padding: '18px 20px', cursor: 'pointer', transition: 'transform .15s', borderTop: `3px solid ${accent}`, position: 'relative' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                {viewed && <div style={{ position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: '50%', background: '#7fda96' }} title="Visited" />}
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{c.courseName}</div>
                <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 16, color: '#fff', marginBottom: 11, lineHeight: 1.3 }}>{c.chapterTitle}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  <Tag color={accent}>{c.conceptCount} concepts</Tag><Tag color={accent}>{c.termCount} terms</Tag><Tag color={accent}>{c.qCount} Q&A</Tag>
                </div>
                {!isPriv && <ProgressBar pct={p} color={accent} />}
                <div style={{ marginTop: 9, fontSize: 10, color: '#8892a4', fontFamily: "'IBM Plex Mono',monospace" }}>Added {c.addedAt}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════ */
export default function App() {
  const [view, setView] = useState('auth');
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [active, setActive] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { dbLoadCourseIndex().then(setCourses).catch(console.error); }, []);

  const handleLogin = async u => {
    setUser(u);
    if (u.role === ROLE.USER) { const p = await dbLoadProgress(u.username); setProgress(p); }
    setView('home');
  };

  const handleLogout = () => { setUser(null); setProgress({}); setActive(null); setView('auth'); };

  const handleSelect = async id => {
    setLoading(true);
    const data = await dbLoadCourseData(id);
    const meta = courses.find(c => c.id === id);
    if (data) { setActive({ id, data, year: meta?.year }); setView('course'); }
    setLoading(false);
  };

  const handleProgress = async p => {
    setProgress(p);
    if (user?.role === ROLE.USER) await dbSaveProgress(user.username, p);
  };

  return (
    <>
      <style>{css}</style>
      {view === 'auth' && <AuthScreen onLogin={handleLogin} />}
      {view === 'home' && user && <Home user={user} courses={courses} progress={progress} onSelectCourse={handleSelect} onLogout={handleLogout} onShowAdmin={() => setView('admin')} onProgressUpdate={handleProgress} />}
      {view === 'course' && active && user && <CourseView course={active} user={user} progress={progress} onBack={() => setView('home')} onProgressUpdate={handleProgress} />}
      {view === 'admin' && user && (user.role === ROLE.ADMIN || user.role === ROLE.SUPERUSER) && <AdminPanel user={user} courses={courses} onClose={() => setView('home')} onCoursesChange={setCourses} />}
      {loading && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}><div style={{ color: '#4f9cf9', fontSize: 28, animation: 'spin 1s linear infinite' }}>⟳</div></div>}
      <CopyrightBar />
    </>
  );
}
