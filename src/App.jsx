/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                      S T U D Y H U B                            ║
 * ║  © 2025 Yination & Excalibur. All rights reserved.              ║
 * ║  Unauthorised copying or distribution is strictly prohibited.   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

/* ═══════════════ CONFIG ═══════════════ */
// NOTE: No superuser credentials stored here.
// Auth is validated server-side via /api/auth.
// Add SU_USERNAME and SU_PASSWORD to Vercel environment variables.
const APP_VERSION    = '3.4.0';
const COPYRIGHT_YEAR = '2025';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/* ═══════════════ CONSTANTS ═══════════════ */
const ROLE  = { SUPERUSER:'superuser', ADMIN:'admin', USER:'user' };
const YEARS = [1,2,3,4];
const YEAR_COLORS = {1:'#4f9cf9',2:'#7fda96',3:'#f9a84f',4:'#da7ff0'};
const YEAR_BG     = {1:'rgba(79,156,249,0.1)',2:'rgba(127,218,150,0.1)',3:'rgba(249,168,79,0.1)',4:'rgba(218,127,240,0.1)'};
const ROLE_COLOR  = {superuser:'#f9a84f',admin:'#da7ff0',user:'#4f9cf9'};
const ROLE_BG     = {superuser:'rgba(249,168,79,0.12)',admin:'rgba(218,127,240,0.12)',user:'rgba(79,156,249,0.12)'};
const ROLE_LABEL  = {superuser:'⚡ Superuser',admin:'🛡 Admin',user:'Student'};
const COLOR_MAP   = {blue:{bar:'#4f9cf9'},orange:{bar:'#f9a84f'},green:{bar:'#7fda96'},purple:{bar:'#da7ff0'}};
const CARD_ACCENTS= ['#4f9cf9','#f9a84f','#7fda96','#da7ff0','#f97b7b','#a8f94f','#4ff9e4','#f94fcc'];
const RES_ICONS   = {link:'🔗',video:'▶️',pdf:'📄',doc:'📝'};
const CACHE_KEY   = id => `sh-course-cache-${id}`;

/* ═══════════════ GLOBAL CSS ═══════════════ */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Mono:wght@400;600&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --bg:#0d0f14; --surface:#13161d; --card:#1a1e27; --border:#252a36;
    --text:#e2e6f0; --muted:#8892a4; --input-bg:#0d0f14;
    --shadow:0 8px 32px rgba(0,0,0,.5);
    --radius:12px; --transition:all .22s cubic-bezier(.4,0,.2,1);
  }
  .light {
    --bg:#f0f4fc; --surface:#ffffff; --card:#ffffff; --border:#dde3f0;
    --text:#1a1e2f; --muted:#5a6478; --input-bg:#f5f7ff;
    --shadow:0 8px 32px rgba(0,0,0,.1);
  }

  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;min-height:100vh;transition:background .3s,color .3s}
  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--surface)}::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}

  /* Animations */
  @keyframes spin    {to{transform:rotate(360deg)}}
  @keyframes fadeUp  {from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn  {from{opacity:0}to{opacity:1}}
  @keyframes scaleIn {from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
  @keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes stagger {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse   {0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
  @keyframes blink   {0%,100%{opacity:1}50%{opacity:0}}
  @keyframes shake   {0%,100%{transform:translateX(0)}25%,75%{transform:translateX(-5px)}50%{transform:translateX(5px)}}
  @keyframes shimmer {0%{opacity:.6}50%{opacity:1}100%{opacity:.6}}

  .fade-up   {animation:fadeUp .28s cubic-bezier(.4,0,.2,1) both}
  .fade-in   {animation:fadeIn .2s ease both}
  .scale-in  {animation:scaleIn .26s cubic-bezier(.4,0,.2,1) both}
  .slide-down{animation:slideDown .22s ease both}
  .shake     {animation:shake .3s ease}
  .stagger-1 {animation:stagger .3s .05s both}
  .stagger-2 {animation:stagger .3s .1s both}
  .stagger-3 {animation:stagger .3s .15s both}
  .stagger-4 {animation:stagger .3s .2s both}

  input:focus,textarea:focus,select:focus{outline:2px solid rgba(79,156,249,.4)!important;outline-offset:0}
  button{transition:var(--transition)}
  button:active{transform:scale(.97)}

  /* Mobile touch targets */
  @media(max-width:640px){
    button,a{min-height:44px;min-width:44px}
    .tab-btn{padding:10px 12px!important;font-size:12px!important}
    .course-grid{grid-template-columns:1fr!important}
    .year-tabs{gap:6px!important}
    .year-tab{padding:10px 14px!important}
    .topbar{flex-wrap:wrap;gap:10px}
  }

  /* Print / PDF styles */
  @media print{
    .no-print{display:none!important}
    body{background:#fff!important;color:#000!important}
    .print-content{padding:20px}
    h1,h2,h3{color:#000!important}
    .course-card-print{page-break-inside:avoid;margin-bottom:16px;border:1px solid #ccc;padding:12px;border-radius:8px}
    .q-print{page-break-inside:avoid;margin-bottom:12px;border-bottom:1px solid #eee;padding-bottom:12px}
  }

  /* Blur backdrop for modals */
  .modal-overlay{
    position:fixed;inset:0;background:rgba(0,0,0,.72);
    backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
    display:flex;align-items:center;justify-content:center;
    z-index:1500;padding:20px;overflow-y:auto
  }
`;

/* ═══════════════ HELPERS ═══════════════ */
function hashStr(s){let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return(h>>>0).toString(16);}

// Superuser auth is server-side only — no username check in browser
async function checkSuperuser(username, password){
  try{
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({username, password})
    });
    const data = await res.json();
    return data.ok === true ? data : null;
  }catch{ return null; }
}

/* ═══════════════ HOOKS ═══════════════ */
function useTheme(){
  const [dark,setDark]=useState(()=>localStorage.getItem('sh-theme')!=='light');
  useEffect(()=>{
    document.documentElement.classList.toggle('light',!dark);
    localStorage.setItem('sh-theme',dark?'dark':'light');
  },[dark]);
  return [dark,()=>setDark(d=>!d)];
}

function useBookmarks(){
  const [bm,setBm]=useState(()=>{try{return JSON.parse(localStorage.getItem('sh-bookmarks')||'[]');}catch{return [];}});
  const toggle=id=>{
    setBm(prev=>{
      const next=prev.includes(id)?prev.filter(x=>x!==id):[...prev,id];
      localStorage.setItem('sh-bookmarks',JSON.stringify(next));
      return next;
    });
  };
  return [bm,toggle];
}

function useOnline(){
  const [online,setOnline]=useState(navigator.onLine);
  useEffect(()=>{
    const on=()=>setOnline(true);const off=()=>setOnline(false);
    window.addEventListener('online',on);window.addEventListener('offline',off);
    return()=>{window.removeEventListener('online',on);window.removeEventListener('offline',off);};
  },[]);
  return online;
}

/* ═══════════════ DATABASE ═══════════════ */
async function dbLoadUsers(){const{data}=await supabase.from('users').select('*');return data||[];}
async function dbSaveUser(u){await supabase.from('users').upsert(u,{onConflict:'username'});}
async function dbLoadAdmins(){const{data}=await supabase.from('admins').select('username');return(data||[]).map(r=>r.username.toLowerCase());}
async function dbSetAdmins(list){await supabase.from('admins').delete().neq('username','__none__');if(list.length>0)await supabase.from('admins').insert(list.map(u=>({username:u.toLowerCase()})));}
async function dbLoadCourseIndex(){
  const{data}=await supabase.from('courses').select('id,year,course_name,chapter_title,concept_count,term_count,q_count,added_at').order('added_at',{ascending:false});
  return(data||[]).map(r=>({id:r.id,year:r.year,courseName:r.course_name,chapterTitle:r.chapter_title,conceptCount:r.concept_count,termCount:r.term_count,qCount:r.q_count,addedAt:r.added_at}));
}
async function dbLoadCourseData(id){
  const{data}=await supabase.from('courses').select('data').eq('id',id).single();
  return data?.data||null;
}
async function dbSaveCourse(entry,courseData){
  await supabase.from('courses').upsert({id:entry.id,year:entry.year,course_name:entry.courseName,chapter_title:entry.chapterTitle,concept_count:entry.conceptCount,term_count:entry.termCount,q_count:entry.qCount,added_at:entry.addedAt,data:courseData},{onConflict:'id'});
}
async function dbDeleteCourse(id){await supabase.from('courses').delete().eq('id',id);}
async function dbLoadProgress(username){const{data}=await supabase.from('progress').select('*').eq('username',username);const out={};(data||[]).forEach(r=>{out[r.course_id]={viewed:r.viewed,openedQs:r.opened_qs||[]};});return out;}
async function dbSaveProgress(username,progress){const rows=Object.entries(progress).map(([cid,p])=>({username,course_id:cid,viewed:p.viewed,opened_qs:p.openedQs}));if(rows.length>0)await supabase.from('progress').upsert(rows,{onConflict:'username,course_id'});}
async function resolveRole(username){const admins=await dbLoadAdmins();return admins.includes(username.toLowerCase())?ROLE.ADMIN:ROLE.USER;}

// Resources
async function dbLoadResources(courseId){try{const{data}=await supabase.from('resources').select('*').eq('course_id',courseId).order('added_at',{ascending:false});return data||[];}catch{return[];}}
async function dbAddResource(r){try{await supabase.from('resources').insert(r);}catch(e){console.error(e);}}
async function dbDeleteResource(id){try{await supabase.from('resources').delete().eq('id',id);}catch{}}

// Community
async function dbLoadCommunity(courseId){try{const{data}=await supabase.from('community_posts').select('*').eq('course_id',courseId).order('upvote_count',{ascending:false});return data||[];}catch{return[];}}
async function dbSubmitPost(post){try{await supabase.from('community_posts').insert(post);}catch(e){console.error(e);}}
async function dbUpvote(username,postId){
  try{
    const{data:existing}=await supabase.from('community_votes').select('*').eq('username',username).eq('post_id',postId);
    if(existing?.length>0){
      await supabase.from('community_votes').delete().eq('username',username).eq('post_id',postId);
      await supabase.from('community_posts').update({upvote_count:supabase.rpc('decrement',{x:1})}).eq('id',postId);
      // simple approach: just reload
    } else {
      await supabase.from('community_votes').insert({username,post_id:postId});
      const{data:post}=await supabase.from('community_posts').select('upvote_count').eq('id',postId).single();
      await supabase.from('community_posts').update({upvote_count:(post?.upvote_count||0)+1}).eq('id',postId);
    }
  }catch(e){console.error(e);}
}
async function dbGetMyVotes(username){try{const{data}=await supabase.from('community_votes').select('post_id').eq('username',username);return(data||[]).map(r=>r.post_id);}catch{return[];}}
async function dbDeletePost(id){try{await supabase.from('community_posts').delete().eq('id',id);}catch{}}

/* ═══════════════ PENDING ACTIONS ═══════════════ */
async function dbSubmitPending(action_type,requested_by,payload,note=''){
  await supabase.from('pending_actions').insert({id:`pa-${Date.now()}`,action_type,requested_by,requested_at:new Date().toISOString(),status:'pending',payload,note});
}
async function dbLoadPending(status='pending'){
  const{data}=await supabase.from('pending_actions').select('*').eq('status',status).order('requested_at',{ascending:false});
  return data||[];
}
async function dbLoadAllPending(){
  const{data}=await supabase.from('pending_actions').select('*').order('requested_at',{ascending:false});
  return data||[];
}
async function dbReviewPending(id,status,reviewed_by,note=''){
  await supabase.from('pending_actions').update({status,reviewed_by,reviewed_at:new Date().toISOString(),note}).eq('id',id);
}
async function dbCountPending(){
  const{count}=await supabase.from('pending_actions').select('*',{count:'exact',head:true}).eq('status','pending');
  return count||0;
}

// Analytics helpers
async function dbLoadAllProgress(){try{const{data}=await supabase.from('progress').select('*');return data||[];}catch{return[];}}

/* ═══════════════ AI (chat via Groq) ═══════════════ */
async function sendChatMessage(messages,context){
  const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages,context})});
  if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e.error||`Error ${res.status}`);}
  return(await res.json()).reply;
}

/* ═══════════════ PDF EXPORT ═══════════════ */
function exportCoursePDF(d,chapterTitle){
  const w=window.open('','_blank');
  if(!w)return;
  const styles=`body{font-family:Georgia,serif;max-width:800px;margin:0 auto;padding:30px;color:#000}
h1{font-size:26px;margin-bottom:4px}h2{font-size:18px;margin:20px 0 8px;border-bottom:2px solid #333;padding-bottom:4px}
h3{font-size:14px;margin:14px 0 4px;font-family:monospace}
p,li{font-size:13px;line-height:1.7;margin-bottom:6px}
.tag{background:#eee;padding:2px 8px;border-radius:4px;font-size:11px;margin-right:4px}
.q{background:#f9f9f9;border-left:3px solid #333;padding:10px 14px;margin-bottom:12px;page-break-inside:avoid}
.ans{margin-top:6px;padding:8px;background:#fff;border:1px solid #ddd;font-size:12px}
.meta{color:#666;font-size:11px;font-family:monospace}
footer{margin-top:30px;border-top:1px solid #ccc;padding-top:10px;font-size:10px;color:#999;text-align:center}`;
  const concepts=(d.keyConcepts||[]).map(c=>`<li><strong>${c.title}</strong> — ${c.description}</li>`).join('');
  const defs=(d.definitions||[]).map(def=>`<tr><td style="padding:4px 8px;font-weight:bold;font-family:monospace;font-size:12px;border:1px solid #ccc">${def.term}</td><td style="padding:4px 8px;font-size:12px;border:1px solid #ccc">${def.definition}</td></tr>`).join('');
  const qs=(d.questions||[]).map((q,i)=>`<div class="q"><strong>Q${i+1}.</strong> ${q.question}<div class="ans"><strong>Answer:</strong> ${q.answer}</div></div>`).join('');
  const mechs=(d.mechanisms||[]).map(m=>`<h3>${m.title}</h3><p style="white-space:pre-line">${m.body}</p>`).join('');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${chapterTitle} — StudyHub</title><style>${styles}</style></head><body>
<p class="meta">StudyHub Export · ${new Date().toLocaleDateString()} · © ${COPYRIGHT_YEAR} Yination & Excalibur</p>
<h1>${d.courseName} — ${chapterTitle}</h1>
<div style="margin-bottom:12px"><span class="tag">${d.keyConcepts?.length||0} concepts</span><span class="tag">${d.definitions?.length||0} terms</span><span class="tag">${d.questions?.length||0} questions</span></div>
<h2>Key Concepts</h2><ul>${concepts}</ul>
<h2>Terms & Definitions</h2><table style="border-collapse:collapse;width:100%">${defs}</table>
<h2>Mechanisms</h2>${mechs}
<h2>Practice Questions (${d.questions?.length||0})</h2>${qs}
<footer>© ${COPYRIGHT_YEAR} Yination & Excalibur · StudyHub v${APP_VERSION} · All rights reserved · Unauthorised distribution prohibited</footer>
</body></html>`);
  w.document.close();
  setTimeout(()=>w.print(),400);
}

/* ═══════════════ SMALL UI ATOMS ═══════════════ */
const Tag=({children,color='#4f9cf9'})=>(<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,background:`${color}18`,color,borderRadius:4,padding:'2px 8px',marginRight:5,display:'inline-block'}}>{children}</span>);
const Mono=({children,color='#4f9cf9',size=10})=>(<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:size,color,letterSpacing:2,textTransform:'uppercase'}}>{children}</span>);
const SectionLabel=({children})=>(<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,letterSpacing:3,textTransform:'uppercase',color:'#f9a84f',marginBottom:20,display:'flex',alignItems:'center',gap:10}}>{children}<div style={{flex:1,height:1,background:'var(--border)'}}/></div>);
const Field=({label,type='text',value,onChange,placeholder,error,disabled})=>(<div style={{marginBottom:14}}>{label&&<div style={{fontSize:11,color:'var(--muted)',marginBottom:5,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>{label}</div>}<input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} style={{width:'100%',background:disabled?'rgba(0,0,0,.2)':'var(--input-bg)',border:`1px solid ${error?'#f05050':'var(--border)'}`,borderRadius:8,padding:'11px 14px',color:'var(--text)',fontSize:14,fontFamily:"'DM Sans',sans-serif"}}/>{error&&<div style={{color:'#f05050',fontSize:11,marginTop:4}}>{error}</div>}</div>);
const Avatar=({name,size=32})=>{const ini=name?name.slice(0,2).toUpperCase():'??';const hue=name?name.split('').reduce((a,c)=>a+c.charCodeAt(0),0)%360:200;return<div style={{width:size,height:size,borderRadius:'50%',background:`hsl(${hue},55%,25%)`,border:`2px solid hsl(${hue},55%,45%)`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'IBM Plex Mono',monospace",fontSize:size*.33,color:`hsl(${hue},80%,80%)`,flexShrink:0}}>{ini}</div>;};
const RoleBadge=({role})=>(<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:ROLE_BG[role],color:ROLE_COLOR[role],border:`1px solid ${ROLE_COLOR[role]}40`,borderRadius:5,padding:'3px 8px',letterSpacing:1,display:'inline-flex',alignItems:'center',gap:4}}>{ROLE_LABEL[role]}</span>);

/* Larger pill used in headers/profile areas */
const RolePill=({role})=>{
  const icons={superuser:'⚡',admin:'🛡',user:'🎓'};
  return(
    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,background:ROLE_BG[role],color:ROLE_COLOR[role],border:`1px solid ${ROLE_COLOR[role]}50`,borderRadius:20,padding:'4px 12px',letterSpacing:1,display:'inline-flex',alignItems:'center',gap:5,fontWeight:600}}>
      {icons[role]} {role.toUpperCase()}
    </span>
  );
};
const ProgressBar=({pct,color='#4f9cf9'})=>(<div style={{marginTop:10}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><Mono color="var(--muted)" size={9}>PROGRESS</Mono><Mono color={color} size={9}>{pct}%</Mono></div><div style={{height:3,background:'var(--border)',borderRadius:2}}><div style={{height:'100%',width:`${pct}%`,background:color,borderRadius:2,transition:'width .5s ease'}}/></div></div>);

/* ═══════════════ THEME TOGGLE ═══════════════ */
function ThemeToggle({dark,toggle}){
  return(
    <button onClick={toggle} title={dark?'Switch to light mode':'Switch to dark mode'} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:20,padding:'6px 12px',cursor:'pointer',color:'var(--text)',fontSize:16,display:'flex',alignItems:'center',gap:6,fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}>
      {dark?'☀️':'🌙'} <span style={{color:'var(--muted)'}}>{dark?'Light':'Dark'}</span>
    </button>
  );
}

/* ═══════════════ OFFLINE BANNER ═══════════════ */
function OfflineBanner(){
  return(
    <div className="slide-down" style={{position:'fixed',top:0,left:0,right:0,background:'#f9a84f',color:'#000',padding:'8px 20px',textAlign:'center',fontSize:12,fontWeight:600,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
      📶 You are offline — showing cached content
    </div>
  );
}

/* ═══════════════ PWA INSTALL ═══════════════ */
function InstallPrompt(){
  const[prompt,setPrompt]=useState(null);
  const[show,setShow]=useState(false);

  useEffect(()=>{
    if(window.matchMedia('(display-mode: standalone)').matches) return;
    if(window.navigator.standalone) return;
    if(sessionStorage.getItem('pwa-dismissed')) return;
    if(localStorage.getItem('pwa-dismissed')) return;
    const h=e=>{e.preventDefault();setPrompt(e);setShow(true);};
    window.addEventListener('beforeinstallprompt',h);
    return()=>window.removeEventListener('beforeinstallprompt',h);
  },[]);

  const install=async()=>{
    if(!prompt)return;
    prompt.prompt();
    await prompt.userChoice;
    setShow(false);setPrompt(null);
    localStorage.setItem('pwa-dismissed','1');
  };
  const dismiss=()=>{setShow(false);setPrompt(null);sessionStorage.setItem('pwa-dismissed','1');};
  const neverShow=()=>{setShow(false);setPrompt(null);localStorage.setItem('pwa-dismissed','1');};

  if(!show)return null;
  return(
    <div className="slide-down no-print" style={{position:'fixed',top:16,left:'50%',transform:'translateX(-50%)',background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:'12px 18px',display:'flex',alignItems:'center',gap:12,zIndex:600,boxShadow:'var(--shadow)',maxWidth:380,width:'calc(100% - 32px)'}}>
      <div style={{fontSize:22}}>📲</div>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:600,color:'var(--text)',marginBottom:2}}>Install StudyHub</div>
        <div style={{fontSize:11,color:'var(--muted)'}}>Add to home screen for quick access</div>
      </div>
      <div style={{display:'flex',gap:6,flexShrink:0,alignItems:'center'}}>
        <button onClick={neverShow} title="Don't show again" style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:18,padding:'2px 4px',lineHeight:1}}>✕</button>
        <button onClick={dismiss} style={{background:'none',border:'1px solid var(--border)',borderRadius:7,color:'var(--muted)',cursor:'pointer',padding:'6px 10px',fontSize:11}}>Later</button>
        <button onClick={install} style={{background:'#4f9cf9',border:'none',borderRadius:7,color:'#000',cursor:'pointer',padding:'6px 12px',fontSize:11,fontWeight:700}}>Install</button>
      </div>
    </div>
  );
}

/* ═══════════════ GUEST BANNER ═══════════════ */
function GuestBanner({onSignUp}){
  const[dismissed,setDismissed]=useState(false);
  if(dismissed)return null;
  return(
    <div className="slide-down no-print" style={{position:'fixed',top:0,left:0,right:0,background:'linear-gradient(90deg,#13172a,#1e2236)',borderBottom:'1px solid rgba(79,156,249,.2)',padding:'9px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',zIndex:9000,gap:12,flexWrap:'wrap'}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:16}}>👀</span>
        <div>
          <span style={{fontSize:12.5,color:'#e2e6f0',fontWeight:600}}>Browsing as Guest </span>
          <span style={{fontSize:11.5,color:'#8892a4'}}>— progress won't be saved · community features disabled</span>
        </div>
      </div>
      <div style={{display:'flex',gap:8,alignItems:'center',flexShrink:0}}>
        <button onClick={onSignUp} style={{background:'#4f9cf9',border:'none',borderRadius:7,color:'#000',cursor:'pointer',padding:'6px 14px',fontSize:12,fontWeight:700}}>Create Free Account</button>
        <button onClick={()=>setDismissed(true)} style={{background:'none',border:'1px solid rgba(136,146,164,.3)',borderRadius:7,color:'#8892a4',cursor:'pointer',padding:'6px 10px',fontSize:11}}>✕</button>
      </div>
    </div>
  );
}

/* ═══════════════ COPYRIGHT BAR ═══════════════ */
const CopyrightBar=()=>(<div className="no-print" style={{position:'fixed',bottom:0,left:0,right:0,background:'var(--bg)',borderTop:'1px solid var(--border)',padding:'7px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',zIndex:100,flexWrap:'wrap',gap:6}}><div style={{display:'flex',alignItems:'center',gap:10}}><span style={{fontFamily:"'DM Serif Display',serif",fontSize:14,color:'#4f9cf9'}}>StudyHub</span><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:'var(--muted)',letterSpacing:1}}>v{APP_VERSION}</span></div><div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:'var(--muted)',letterSpacing:1}}>© {COPYRIGHT_YEAR} · OWNED BY</span><span style={{fontFamily:"'DM Serif Display',serif",fontSize:13,color:'#f9a84f'}}>Yination</span><span style={{color:'var(--muted)',fontSize:10}}>&</span><span style={{fontFamily:"'DM Serif Display',serif",fontSize:13,color:'#f9a84f'}}>Excalibur</span><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:'var(--muted)',letterSpacing:1}}>· ALL RIGHTS RESERVED</span></div></div>);

/* ═══════════════ SEARCH BAR ═══════════════ */
const SearchBar=({value,onChange,placeholder='Search courses…'})=>(
  <div style={{position:'relative',flex:1}}>
    <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:14,opacity:.5}}>🔍</span>
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:10,padding:'10px 14px 10px 36px',color:'var(--text)',fontSize:13,fontFamily:"'DM Sans',sans-serif"}}/>
  </div>
);

/* ═══════════════ CHATBOT ═══════════════ */
const QUICK_PROMPTS=['Explain this topic simply','Give me 5 extra practice questions','What are the most important concepts?','Summarise this in bullet points','What might come up in an exam?'];

function Chatbot({context}){
  const[open,setOpen]=useState(false);const[messages,setMessages]=useState([]);const[input,setInput]=useState('');const[loading,setLoading]=useState(false);
  const bottomRef=useRef();const inputRef=useRef();
  useEffect(()=>{if(open&&messages.length===0)setMessages([{role:'assistant',content:context?.chapterTitle?`Hi! I'm StudyBot. I can see you're studying "${context.chapterTitle}". Ask me anything — explanations, examples, or extra practice questions.`:`Hi! I'm StudyBot. Ask me anything about your course material.`}]);},[open]);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'});},[messages,loading]);
  useEffect(()=>{if(open)setTimeout(()=>inputRef.current?.focus(),120);},[open]);
  useEffect(()=>{setMessages([]);},[context?.chapterTitle]);
  const send=async text=>{const msg=text||input.trim();if(!msg||loading)return;setInput('');const next=[...messages,{role:'user',content:msg}];setMessages(next);setLoading(true);try{const reply=await sendChatMessage(next.filter(m=>m.role!=='system'),context);setMessages(m=>[...m,{role:'assistant',content:reply}]);}catch{setMessages(m=>[...m,{role:'assistant',content:'Sorry, something went wrong. Please try again.'}]);}setLoading(false);};
  return(
    <>
      <button onClick={()=>setOpen(o=>!o)} className="no-print" style={{position:'fixed',bottom:52,right:22,width:52,height:52,borderRadius:'50%',border:'none',cursor:'pointer',zIndex:200,background:'linear-gradient(135deg,#4f9cf9,#7f5ff9)',boxShadow:open?'none':'0 4px 24px rgba(79,156,249,.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,animation:open?'none':'pulse 3s ease infinite'}}>
        {open?'✕':'🤖'}
      </button>
      {open&&<div className="slide-up no-print" style={{position:'fixed',bottom:114,right:18,width:360,maxHeight:'68vh',background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,display:'flex',flexDirection:'column',zIndex:200,overflow:'hidden',boxShadow:'var(--shadow)'}}>
        <div style={{padding:'13px 17px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',background:'var(--surface)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#4f9cf9,#7f5ff9)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🤖</div>
            <div><div style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>StudyBot</div><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'#4f9cf9',letterSpacing:1}}>AI TUTOR · GROQ</div></div>
          </div>
          <button onClick={()=>setMessages([])} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:11,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>CLEAR</button>
        </div>
        {context?.chapterTitle&&<div style={{padding:'5px 14px',background:'rgba(79,156,249,.05)',borderBottom:'1px solid var(--border)'}}><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'#4f9cf9',letterSpacing:1}}>STUDYING: </span><span style={{fontSize:11,color:'var(--muted)'}}>{context.chapterTitle}</span></div>}
        <div style={{flex:1,overflowY:'auto',padding:'12px 12px 6px'}}>
          {messages.map((m,i)=>(
            <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start',marginBottom:10}}>
              {m.role==='assistant'&&<div style={{width:24,height:24,borderRadius:'50%',background:'linear-gradient(135deg,#4f9cf9,#7f5ff9)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0,marginRight:7,marginTop:2}}>🤖</div>}
              <div style={{maxWidth:'78%',background:m.role==='user'?'linear-gradient(135deg,#4f9cf9,#7f5ff9)':'var(--surface)',color:m.role==='user'?'#fff':'var(--text)',borderRadius:m.role==='user'?'14px 14px 4px 14px':'14px 14px 14px 4px',padding:'9px 12px',fontSize:13,lineHeight:1.65,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{m.content}</div>
            </div>
          ))}
          {loading&&<div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}><div style={{width:24,height:24,borderRadius:'50%',background:'linear-gradient(135deg,#4f9cf9,#7f5ff9)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>🤖</div><div style={{background:'var(--surface)',borderRadius:'14px 14px 14px 4px',padding:'10px 15px',display:'flex',gap:5,alignItems:'center'}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:'50%',background:'#4f9cf9',animation:`blink 1.2s ease ${i*.2}s infinite`}}/>)}</div></div>}
          <div ref={bottomRef}/>
        </div>
        {messages.length<=1&&<div style={{padding:'4px 12px 8px',display:'flex',gap:6,flexWrap:'wrap'}}>{QUICK_PROMPTS.map((p,i)=><button key={i} onClick={()=>send(p)} style={{background:'rgba(79,156,249,.08)',border:'1px solid rgba(79,156,249,.2)',borderRadius:20,color:'#4f9cf9',cursor:'pointer',padding:'4px 10px',fontSize:11}}>{p}</button>)}</div>}
        <div style={{padding:'9px 11px',borderTop:'1px solid var(--border)',display:'flex',gap:8,alignItems:'flex-end'}}>
          <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Ask anything… (Enter to send)" rows={1} style={{flex:1,background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:10,padding:'8px 11px',color:'var(--text)',fontSize:13,fontFamily:"'DM Sans',sans-serif",resize:'none',maxHeight:80,lineHeight:1.5}}/>
          <button onClick={()=>send()} disabled={!input.trim()||loading} style={{width:35,height:35,borderRadius:'50%',border:'none',flexShrink:0,background:!input.trim()||loading?'var(--border)':'linear-gradient(135deg,#4f9cf9,#7f5ff9)',color:!input.trim()||loading?'var(--muted)':'#fff',cursor:!input.trim()||loading?'not-allowed':'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>↑</button>
        </div>
      </div>}
    </>
  );
}

/* ═══════════════ AUTH SCREEN ═══════════════ */
function AuthScreen({onLogin,onGuest,dark,toggleTheme}){
  const[tab,setTab]=useState('signin');
  const[f,setF]=useState({username:'',password:'',confirm:'',year:3});
  const[errs,setErrs]=useState({});const[loading,setLoading]=useState(false);
  const set=(k,v)=>{setF(p=>({...p,[k]:v}));setErrs(p=>({...p,[k]:''}));};

  const signIn=async()=>{
    const e={};if(!f.username.trim())e.username='Required';if(!f.password)e.password='Required';
    if(Object.keys(e).length){setErrs(e);return;}setLoading(true);

    // Check superuser server-side first — credentials never compared in browser
    try{
      const suResult = await checkSuperuser(f.username, f.password);
      if(suResult){
        onLogin({username:f.username.toLowerCase(),displayName:'Owner',role:ROLE.SUPERUSER});
        return;
      }
    }catch{}

    // Regular user login
    try{
      const users=await dbLoadUsers();const user=users.find(u=>u.username.toLowerCase()===f.username.toLowerCase());
      if(!user||user.pw_hash!==hashStr(f.password)){setErrs({password:'Incorrect username or password.'});setLoading(false);return;}
      const role=await resolveRole(user.username);
      onLogin({username:user.username,displayName:user.display_name||user.username,year:user.year,role});
    }catch{setErrs({password:'Connection error. Try again.'});setLoading(false);}
  };

  const signUp=async()=>{
    const e={};
    if(!f.username.trim())e.username='Required';
    else if(f.username.length<3)e.username='Min 3 characters';
    else if(!/^[a-zA-Z0-9_]+$/.test(f.username))e.username='Letters, numbers, underscores only';
    if(!f.password)e.password='Required';else if(f.password.length<6)e.password='Min 6 characters';
    if(f.confirm!==f.password)e.confirm='Passwords do not match';
    if(Object.keys(e).length){setErrs(e);return;}
    // Check with server if username is the superuser
    try{const r=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:f.username,password:'__probe__'})});const d=await r.json();if(d.ok){setErrs({username:'Username is reserved.'});setLoading(false);return;}}catch{}
    // Also block if username matches any admin-reserved pattern
    if(f.username.toLowerCase()==='guest'){setErrs({username:'Username is reserved.'});setLoading(false);return;}
    setLoading(true);
    try{
      const users=await dbLoadUsers();
      if(users.find(u=>u.username.toLowerCase()===f.username.toLowerCase())){setErrs({username:'Username already taken.'});setLoading(false);return;}
      const nu={username:f.username,pw_hash:hashStr(f.password),display_name:f.username,year:f.year,created_at:new Date().toISOString()};
      await dbSaveUser(nu);
      onLogin({username:nu.username,displayName:nu.display_name,year:nu.year,role:ROLE.USER});
    }catch{setErrs({password:'Connection error. Try again.'});setLoading(false);}
  };

  return(
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20,background:dark?'radial-gradient(ellipse at 50% 0%,#1a1e2f 0%,#0d0f14 60%)':'radial-gradient(ellipse at 50% 0%,#dde8ff 0%,#f0f4fc 60%)'}}>
      <div className="fade-up" style={{width:'100%',maxWidth:400}}>
        <div style={{position:'absolute',top:16,right:16}}><ThemeToggle dark={dark} toggle={toggleTheme}/></div>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:42,color:dark?'#fff':'#1a1e2f',letterSpacing:-1,lineHeight:1}}>Study<span style={{color:'#4f9cf9'}}>Hub</span></div>
          <p style={{color:'var(--muted)',fontSize:13,marginTop:8}}>AI-powered course companion</p>
        </div>
        <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:'30px',boxShadow:'var(--shadow)'}}>
          <div style={{display:'flex',background:'var(--input-bg)',borderRadius:10,padding:4,marginBottom:26}}>
            {['signin','signup'].map(t=>(
              <button key={t} onClick={()=>{setTab(t);setErrs({});}} style={{flex:1,padding:'9px 0',borderRadius:7,border:'none',background:tab===t?'var(--surface)':'none',color:tab===t?'var(--text)':'var(--muted)',cursor:'pointer',fontSize:13,fontWeight:tab===t?600:400}}>
                {t==='signin'?'Sign In':'Sign Up'}
              </button>
            ))}
          </div>
          {tab==='signin'?(
            <div className="fade-in">
              <Field label="USERNAME" value={f.username} onChange={e=>set('username',e.target.value)} placeholder="your_username" error={errs.username}/>
              <Field label="PASSWORD" type="password" value={f.password} onChange={e=>set('password',e.target.value)} placeholder="••••••••" error={errs.password}/>
              <button onClick={signIn} disabled={loading} style={{width:'100%',background:loading?'var(--border)':'#4f9cf9',border:'none',borderRadius:8,color:loading?'var(--muted)':'#000',cursor:loading?'not-allowed':'pointer',padding:'12px 0',fontSize:14,fontWeight:700,marginTop:4}}>
                {loading?'Signing in…':'Sign In'}
              </button>
            </div>
          ):(
            <div className="fade-in">
              <Field label="USERNAME" value={f.username} onChange={e=>set('username',e.target.value)} placeholder="min 3 chars, no spaces" error={errs.username}/>
              <Field label="PASSWORD" type="password" value={f.password} onChange={e=>set('password',e.target.value)} placeholder="min 6 characters" error={errs.password}/>
              <Field label="CONFIRM PASSWORD" type="password" value={f.confirm} onChange={e=>set('confirm',e.target.value)} placeholder="repeat password" error={errs.confirm}/>
              <div style={{marginBottom:18}}>
                <div style={{fontSize:11,color:'var(--muted)',marginBottom:8,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>YOUR YEAR</div>
                <div style={{display:'flex',gap:8}}>
                  {YEARS.map(y=><button key={y} onClick={()=>set('year',y)} style={{flex:1,padding:'10px 0',borderRadius:8,cursor:'pointer',border:`1px solid ${f.year===y?YEAR_COLORS[y]+'70':'var(--border)'}`,background:f.year===y?YEAR_BG[y]:'var(--input-bg)',color:f.year===y?YEAR_COLORS[y]:'var(--muted)',fontWeight:f.year===y?700:400,fontSize:13}}>Yr {y}</button>)}
                </div>
              </div>
              <button onClick={signUp} disabled={loading} style={{width:'100%',background:loading?'var(--border)':'#4f9cf9',border:'none',borderRadius:8,color:loading?'var(--muted)':'#000',cursor:loading?'not-allowed':'pointer',padding:'12px 0',fontSize:14,fontWeight:700}}>
                {loading?'Creating account…':'Create Account'}
              </button>
            </div>
          )}
        </div>

        {/* Guest access */}
        <div style={{textAlign:'center',marginTop:16}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
            <div style={{flex:1,height:1,background:'var(--border)'}}/>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',letterSpacing:2}}>OR</span>
            <div style={{flex:1,height:1,background:'var(--border)'}}/>
          </div>
          <button onClick={onGuest} style={{width:'100%',background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'11px 0',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <span>👀</span> Continue as Guest
          </button>
          <p style={{fontSize:11,color:'var(--muted)',marginTop:10,lineHeight:1.5}}>No account needed · Read-only access · No data saved</p>
        </div>

        <div style={{textAlign:'center',marginTop:14}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:3}}>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',letterSpacing:1}}>© {COPYRIGHT_YEAR} · OWNED BY</span>
            <span style={{fontFamily:"'DM Serif Display',serif",fontSize:13,color:'#f9a84f'}}>Yination</span>
            <span style={{color:'var(--muted)',fontSize:9}}>&</span>
            <span style={{fontFamily:"'DM Serif Display',serif",fontSize:13,color:'#f9a84f'}}>Excalibur</span>
          </div>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',letterSpacing:1}}>ALL RIGHTS RESERVED</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ UPLOAD MODAL ═══════════════ */
const JSON_PROMPT=`Generate a StudyHub JSON study guide for this PDF.
Return ONLY valid JSON with this exact structure:
{
  "courseName": "e.g. COS 341",
  "chapterTitle": "full chapter title",
  "keyConcepts": [{"title":"","description":"one sentence","color":"blue|orange|green|purple"}],
  "definitions": [{"term":"","definition":""}],
  "mechanisms": [{"title":"","body":"step-by-step; use \\n\\n for paragraph breaks"}],
  "algorithms": [{"name":"","description":"","note":""}],
  "chapters": [{"num":"Chapter X","name":"","takeaways":["","",""]}],
  "questions": [{"question":"","answer":""}]
}
Rules: keyConcepts 12-18, definitions 20-35, mechanisms 4-7, algorithms [] if none, chapters 4-8 with EXACTLY 3 takeaways each, questions EXACTLY 25 exam-style with full worked answers. Return ONLY the JSON.`;

function UploadModal({onClose,onDone,adminMode=false,requestedBy=''}){
  const[year,setYear]=useState(1);const[pasteText,setPasteText]=useState('');const[status,setStatus]=useState('idle');const[error,setError]=useState('');const[copied,setCopied]=useState(false);
  const copyPrompt=()=>{navigator.clipboard.writeText(JSON_PROMPT);setCopied(true);setTimeout(()=>setCopied(false),2000);};
  const go=async()=>{
    setError('');
    try{
      const data=JSON.parse(pasteText.replace(/```json|```/g,'').trim());
      if(!data.chapterTitle)throw new Error('Missing chapterTitle');
      setStatus('processing');
      if(adminMode){
        // Admin mode: build entry and pass to parent for approval submission
        const id=`c-${Date.now()}`;
        const entry={id,year,courseName:data.courseName||'Course',chapterTitle:data.chapterTitle,conceptCount:data.keyConcepts?.length||0,termCount:data.definitions?.length||0,qCount:data.questions?.length||0,addedAt:new Date().toLocaleDateString()};
        await onDone(null,entry,data);
        setStatus('done');
      } else {
        const id=`c-${Date.now()}`;
        const entry={id,year,courseName:data.courseName||'Course',chapterTitle:data.chapterTitle,conceptCount:data.keyConcepts?.length||0,termCount:data.definitions?.length||0,qCount:data.questions?.length||0,addedAt:new Date().toLocaleDateString()};
        await dbSaveCourse(entry,data);
        const idx=await dbLoadCourseIndex();setStatus('done');setTimeout(()=>onDone(idx),700);
      }
    }catch(e){setError('Invalid JSON: '+e.message);setStatus('idle');}
  };
  return(
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="scale-in" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:'28px 32px',maxWidth:540,width:'100%',margin:'auto',boxShadow:'var(--shadow)'}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:'var(--text)',marginBottom:4}}>{adminMode?'Request New Course':'Add Course'}</div>
        <p style={{color:'var(--muted)',fontSize:13,marginBottom:adminMode?8:20}}>{adminMode?'Paste the JSON below — your request will be sent to the superuser for approval.':'Generate a study guide using Claude, ChatGPT, or any AI — paste the JSON here.'}</p>
        {adminMode&&<div style={{background:'rgba(218,127,240,.06)',border:'1px solid rgba(218,127,240,.2)',borderRadius:8,padding:'8px 14px',fontSize:12,color:'#da7ff0',marginBottom:16}}>🛡 This request will be queued and only go live once the superuser approves it.</div>}
        <div style={{marginBottom:18}}>
          <Mono color="var(--muted)" size={10}>ASSIGN TO YEAR</Mono>
          <div style={{display:'flex',gap:8,marginTop:8}}>
            {YEARS.map(y=><button key={y} onClick={()=>setYear(y)} style={{flex:1,padding:'9px 0',borderRadius:8,cursor:'pointer',border:`1px solid ${year===y?YEAR_COLORS[y]+'70':'var(--border)'}`,background:year===y?YEAR_BG[y]:'var(--input-bg)',color:year===y?YEAR_COLORS[y]:'var(--muted)',fontWeight:year===y?700:400,fontSize:13}}>Year {y}</button>)}
          </div>
        </div>
        <div style={{background:'rgba(79,156,249,.05)',border:'1px solid rgba(79,156,249,.15)',borderRadius:10,padding:'14px 16px',marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:600,color:'#4f9cf9',marginBottom:10}}>How to generate a study guide</div>
          <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.8}}><span style={{color:'var(--text)'}}>Step 1</span> — Open Claude.ai, ChatGPT, or any AI<br/><span style={{color:'var(--text)'}}>Step 2</span> — Upload your PDF<br/><span style={{color:'var(--text)'}}>Step 3</span> — Copy and paste this prompt:</div>
          <div style={{marginTop:10,background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 12px',display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--muted)',lineHeight:1.6,flex:1}}>Generate a StudyHub JSON study guide for this PDF…</div>
            <button onClick={copyPrompt} style={{background:copied?'rgba(127,218,150,.1)':'rgba(79,156,249,.1)',border:`1px solid ${copied?'rgba(127,218,150,.4)':'rgba(79,156,249,.3)'}`,borderRadius:6,color:copied?'#7fda96':'#4f9cf9',cursor:'pointer',padding:'5px 12px',fontSize:11,flexShrink:0}}>{copied?'✓ Copied':'Copy Prompt'}</button>
          </div>
          <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.8,marginTop:10}}><span style={{color:'var(--text)'}}>Step 4</span> — Copy the JSON output<br/><span style={{color:'var(--text)'}}>Step 5</span> — Paste it below</div>
        </div>
        <textarea value={pasteText} onChange={e=>setPasteText(e.target.value)} placeholder={'{\n  "courseName": "COS 341",\n  "chapterTitle": "Memory System",\n  ...\n}'} rows={9} style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'11px 14px',color:'var(--text)',fontSize:12,fontFamily:"'IBM Plex Mono',monospace",resize:'vertical',marginBottom:12}}/>
        {error&&<div style={{background:'rgba(240,80,80,.1)',border:'1px solid rgba(240,80,80,.4)',borderRadius:8,padding:'9px 14px',color:'#f05050',fontSize:12.5,marginBottom:10}}>{error}</div>}
        {status==='processing'&&<div style={{background:'rgba(79,156,249,.08)',border:'1px solid rgba(79,156,249,.2)',borderRadius:8,padding:'10px 14px',color:'#4f9cf9',fontSize:13,marginBottom:10,display:'flex',alignItems:'center',gap:10}}><span style={{animation:'spin 1s linear infinite',display:'inline-block'}}>⟳</span>{adminMode?'Submitting request…':'Saving course…'}</div>}
        {status==='done'&&<div style={{background:'rgba(127,218,150,.08)',border:'1px solid rgba(127,218,150,.3)',borderRadius:8,padding:'10px 14px',color:'#7fda96',fontSize:13,marginBottom:10}}>{adminMode?'✓ Request submitted — awaiting superuser approval.':'✓ Course added to Year '+year+'!'}</div>}
        <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
          <button onClick={onClose} style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'9px 18px',fontSize:13}}>Cancel</button>
          <button onClick={go} disabled={!pasteText.trim()||status==='processing'||status==='done'} style={{background:!pasteText.trim()||status==='processing'||status==='done'?'var(--border)':adminMode?'#da7ff0':'#4f9cf9',border:'none',borderRadius:8,color:!pasteText.trim()||status==='processing'||status==='done'?'var(--muted)':'#000',cursor:'pointer',padding:'9px 22px',fontSize:13,fontWeight:700}}>
            {status==='processing'?'Submitting…':status==='done'?'Done!':adminMode?'Submit for Approval':'Save Course'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ COMMUNITY BOARD ═══════════════ */
function CommunityBoard({courseId,user}){
  const[posts,setPosts]=useState([]);const[myVotes,setMyVotes]=useState([]);const[showForm,setShowForm]=useState(false);
  const[form,setForm]=useState({title:'',url:'',description:''});const[loading,setLoading]=useState(false);
  const isPriv=user.role!==ROLE.USER;
  const isGuest=user.isGuest===true;

  const load=async()=>{const[p,v]=await Promise.all([dbLoadCommunity(courseId),dbGetMyVotes(user.username)]);setPosts(p);setMyVotes(v);};
  useEffect(()=>{load();},[courseId]);

  const submit=async()=>{
    if(!form.title.trim()||!form.url.trim())return;
    setLoading(true);
    try{
      await dbSubmitPost({id:`cp-${Date.now()}`,course_id:courseId,title:form.title,url:form.url,description:form.description,submitted_by:user.username,submitted_at:new Date().toISOString(),upvote_count:0});
      setForm({title:'',url:'',description:''});setShowForm(false);await load();
    }catch(e){console.error(e);}setLoading(false);
  };

  const vote=async id=>{if(isGuest)return;await dbUpvote(user.username,id);await load();};
  const del=async id=>{if(!confirm('Delete this post?'))return;await dbDeletePost(id);await load();};

  return(
    <div className="fade-up">
      <SectionLabel>Community Board</SectionLabel>
      <div style={{background:'rgba(79,156,249,.05)',border:'1px solid rgba(79,156,249,.15)',borderRadius:10,padding:'10px 14px',marginBottom:16,fontSize:12,color:'var(--muted)'}}>
        📌 Share useful links, videos, or resources for this course. Upvote what's helpful.
      </div>

      {isGuest?(
        <div style={{background:'rgba(249,168,79,.06)',border:'1px solid rgba(249,168,79,.2)',borderRadius:10,padding:'14px 16px',marginBottom:16,display:'flex',gap:10,alignItems:'center'}}>
          <span style={{fontSize:18}}>🔒</span>
          <div><div style={{fontSize:13,color:'#f9a84f',fontWeight:600,marginBottom:2}}>Create an account to participate</div><div style={{fontSize:12,color:'var(--muted)'}}>Guests can read posts but cannot submit or upvote.</div></div>
        </div>
      ):(
        <button onClick={()=>setShowForm(s=>!s)} style={{background:'rgba(79,156,249,.1)',border:'1px solid rgba(79,156,249,.25)',borderRadius:8,color:'#4f9cf9',cursor:'pointer',padding:'8px 16px',fontSize:12,fontWeight:600,marginBottom:16}}>
          {showForm?'✕ Cancel':'+ Submit a Resource'}
        </button>
      )}

      {showForm&&!isGuest&&(
        <div className="scale-in" style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'16px 18px',marginBottom:16}}>
          <Field label="TITLE" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Great YouTube explanation"/>
          <Field label="URL" value={form.url} onChange={e=>setForm(f=>({...f,url:e.target.value}))} placeholder="https://..."/>
          <Field label="DESCRIPTION (optional)" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Brief note about this resource"/>
          <button onClick={submit} disabled={loading||!form.title.trim()||!form.url.trim()} style={{background:loading?'var(--border)':'#4f9cf9',border:'none',borderRadius:7,color:loading?'var(--muted)':'#000',cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:700}}>
            {loading?'Submitting…':'Submit'}
          </button>
        </div>
      )}

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {posts.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:30,border:'1px dashed var(--border)',borderRadius:10,fontSize:13}}>No community posts yet{isGuest?' — sign up to be the first!':' — be the first to share!'}</div>}
        {posts.map((p,i)=>{
          const voted=myVotes.includes(p.id);
          return(
            <div key={p.id} className={`stagger-${Math.min(i+1,4)}`} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:'13px 16px',display:'flex',gap:12,alignItems:'flex-start'}}>
              <button onClick={()=>vote(p.id)} disabled={isGuest} title={isGuest?'Sign up to vote':''} style={{background:voted?'rgba(79,156,249,.15)':'var(--input-bg)',border:`1px solid ${voted?'rgba(79,156,249,.4)':'var(--border)'}`,borderRadius:8,color:isGuest?'var(--border)':voted?'#4f9cf9':'var(--muted)',cursor:isGuest?'not-allowed':'pointer',padding:'6px 10px',display:'flex',flexDirection:'column',alignItems:'center',gap:2,flexShrink:0,minWidth:42}}>
                <span style={{fontSize:14}}>▲</span>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600}}>{p.upvote_count||0}</span>
              </button>
              <div style={{flex:1,minWidth:0}}>
                <a href={p.url} target="_blank" rel="noopener noreferrer" style={{fontSize:14,fontWeight:600,color:'#4f9cf9',textDecoration:'none',wordBreak:'break-word'}}>{p.title}</a>
                {p.description&&<p style={{fontSize:12,color:'var(--muted)',marginTop:3,lineHeight:1.5}}>{p.description}</p>}
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginTop:4,letterSpacing:1}}>@{p.submitted_by} · {new Date(p.submitted_at).toLocaleDateString()}</div>
              </div>
              {(isPriv||p.submitted_by===user.username)&&<button onClick={()=>del(p.id)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:12,flexShrink:0}}>✕</button>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════ RESOURCES TAB ═══════════════ */
function ResourcesTab({courseId,user}){
  const[resources,setResources]=useState([]);const[showForm,setShowForm]=useState(false);
  const[form,setForm]=useState({title:'',url:'',type:'link'});const[loading,setLoading]=useState(false);
  const[msg,setMsg]=useState('');
  const isPriv=user.role!==ROLE.USER;
  const isSU2=user.role===ROLE.SUPERUSER;
  const flash=m=>{setMsg(m);setTimeout(()=>setMsg(''),3000);};

  const load=async()=>{const r=await dbLoadResources(courseId);setResources(r);};
  useEffect(()=>{load();},[courseId]);

  const add=async()=>{
    if(!form.title.trim()||!form.url.trim())return;setLoading(true);
    const resource={id:`r-${Date.now()}`,course_id:courseId,title:form.title,url:form.url,type:form.type,added_by:user.username,added_at:new Date().toISOString()};
    if(isSU2){
      await dbAddResource(resource);await load();
    } else {
      await dbSubmitPending('add_resource',user.username,resource);
      flash('✓ Resource submitted for superuser approval.');
    }
    setForm({title:'',url:'',type:'link'});setShowForm(false);setLoading(false);
  };

  const del=async id=>{
    if(isSU2){
      await dbDeleteResource(id);await load();
    } else {
      await dbSubmitPending('delete_resource',user.username,{id});
      flash('✓ Deletion request submitted for superuser approval.');
    }
  };

  return(
    <div className="fade-up">
      <SectionLabel>Resources</SectionLabel>
      {msg&&<div className="slide-down" style={{background:'rgba(127,218,150,.08)',border:'1px solid rgba(127,218,150,.3)',borderRadius:8,padding:'9px 14px',color:'#7fda96',fontSize:12.5,marginBottom:14}}>{msg}</div>}
      {isPriv&&!isSU2&&<div style={{background:'rgba(218,127,240,.06)',border:'1px solid rgba(218,127,240,.2)',borderRadius:8,padding:'8px 14px',fontSize:12,color:'#da7ff0',marginBottom:12}}>🛡 Resource add/remove requests go to the superuser for approval.</div>}
      {isPriv&&(
        <button onClick={()=>setShowForm(s=>!s)} style={{background:'rgba(127,218,150,.1)',border:'1px solid rgba(127,218,150,.25)',borderRadius:8,color:'#7fda96',cursor:'pointer',padding:'8px 16px',fontSize:12,fontWeight:600,marginBottom:16}}>
          {showForm?'✕ Cancel':isSU2?'+ Add Resource':'+ Request Resource'}
        </button>
      )}
      {showForm&&isPriv&&(
        <div className="scale-in" style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'16px 18px',marginBottom:16}}>
          <Field label="TITLE" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Official lecture slides"/>
          <Field label="URL" value={form.url} onChange={e=>setForm(f=>({...f,url:e.target.value}))} placeholder="https://..."/>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>TYPE</div>
            <div style={{display:'flex',gap:8}}>
              {['link','video','pdf','doc'].map(t=><button key={t} onClick={()=>setForm(f=>({...f,type:t}))} style={{padding:'7px 14px',borderRadius:7,border:`1px solid ${form.type===t?'#7fda96':'var(--border)'}`,background:form.type===t?'rgba(127,218,150,.1)':'var(--input-bg)',color:form.type===t?'#7fda96':'var(--muted)',cursor:'pointer',fontSize:12}}>{RES_ICONS[t]} {t}</button>)}
            </div>
          </div>
          <button onClick={add} disabled={loading} style={{background:'#7fda96',border:'none',borderRadius:7,color:'#000',cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:700}}>{loading?'Submitting…':isSU2?'Add Resource':'Submit for Approval'}</button>
        </div>
      )}
      <div style={{display:'flex',flexDirection:'column',gap:9}}>
        {resources.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:30,border:'1px dashed var(--border)',borderRadius:10,fontSize:13}}>No resources added yet{isPriv?'.':' — check back soon.'}.</div>}
        {resources.map((r,i)=>(
          <div key={r.id} className={`stagger-${Math.min(i+1,4)}`} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:'13px 16px',display:'flex',alignItems:'center',gap:12}}>
            <span style={{fontSize:20,flexShrink:0}}>{RES_ICONS[r.type]||'🔗'}</span>
            <div style={{flex:1,minWidth:0}}>
              <a href={r.url} target="_blank" rel="noopener noreferrer" style={{fontSize:14,fontWeight:600,color:'var(--text)',textDecoration:'none',wordBreak:'break-word'}}>{r.title}</a>
              <div style={{display:'flex',alignItems:'center',gap:8,marginTop:3}}>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',letterSpacing:1,textTransform:'uppercase'}}>{r.type}</span>
                {r.added_by&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)'}}>· @{r.added_by}</span>}
              </div>
            </div>
            {isPriv&&<button onClick={()=>del(r.id)} title={isSU2?'Delete resource':'Request deletion'} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:12,flexShrink:0}}>{isSU2?'✕':'↑'}</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════ COURSE VIEW ═══════════════ */
const ALL_TABS=[{id:'concepts',label:'Key Concepts'},{id:'definitions',label:'Definitions'},{id:'mechanisms',label:'Mechanisms'},{id:'algorithms',label:'Algorithms'},{id:'takeaways',label:'Takeaways'},{id:'questions',label:'Practice Q&A'},{id:'resources',label:'Resources'},{id:'community',label:'Community'}];

function CourseView({course,user,progress,onBack,onProgressUpdate,bookmarks,toggleBookmark}){
  const[tab,setTab]=useState('concepts');const[openQ,setOpenQ]=useState(null);const[filter,setFilter]=useState('');
  const d=course.data;const cp=progress[course.id]||{viewed:false,openedQs:[]};const isPriv=user.role!==ROLE.USER;
  const isBookmarked=bookmarks.includes(course.id);

  // Cache for offline use
  useEffect(()=>{try{localStorage.setItem(CACHE_KEY(course.id),JSON.stringify({data:d,year:course.year,cachedAt:Date.now()}));}catch{};},[]);
  useEffect(()=>{if(!cp.viewed){const n={...progress,[course.id]:{...cp,viewed:true}};onProgressUpdate(n);}},[]);

  const revealQ=idx=>{setOpenQ(openQ===idx?null:idx);if(!cp.openedQs.includes(idx)){const n={...progress,[course.id]:{...cp,openedQs:[...cp.openedQs,idx]}};onProgressUpdate(n);}};

  const totalQ=d.questions?.length||0;const pct=totalQ===0?0:Math.round(cp.openedQs.length/totalQ*100);
  const hasAlgo=d.algorithms?.length>0;
  const tabs=ALL_TABS.filter(t=>t.id!=='algorithms'||hasAlgo);
  const filteredQ=(d.questions||[]).filter(q=>!filter||q.question.toLowerCase().includes(filter.toLowerCase()));
  const accent=YEAR_COLORS[course.year]||'#4f9cf9';
  const chatCtx={courseName:d.courseName,chapterTitle:d.chapterTitle,summary:[d.keyConcepts?.slice(0,5).map(c=>c.title).join(', '),d.chapters?.map(c=>c.name).join(', ')].filter(Boolean).join(' | ')};

  return(
    <div style={{maxWidth:960,margin:'0 auto',padding:'28px 20px 88px'}}>
      {/* Top bar */}
      <div className="topbar" style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:26,flexWrap:'wrap',gap:10}}>
        <button onClick={onBack} style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'8px 16px',fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}>← All Courses</button>
        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
          <RolePill role={user.role}/>
          <div style={{background:YEAR_BG[course.year],border:`1px solid ${accent}40`,borderRadius:6,padding:'4px 12px'}}><Mono color={accent} size={9}>Year {course.year}</Mono></div>
          {!isPriv&&<div style={{fontSize:12,color:'var(--muted)'}}>{cp.openedQs.length}/{totalQ} revealed</div>}
          <button onClick={()=>toggleBookmark(course.id)} title={isBookmarked?'Remove bookmark':'Bookmark'} style={{background:isBookmarked?'rgba(249,168,79,.15)':'var(--surface)',border:`1px solid ${isBookmarked?'#f9a84f':'var(--border)'}`,borderRadius:8,color:isBookmarked?'#f9a84f':'var(--muted)',cursor:'pointer',padding:'7px 12px',fontSize:13}}>
            {isBookmarked?'🔖':'🔖'}
          </button>
          <button onClick={()=>exportCoursePDF(d,d.chapterTitle)} title="Export to PDF" style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'7px 12px',fontSize:13}}>⬇ PDF</button>
        </div>
      </div>

      {/* Header */}
      <div className="fade-up" style={{borderBottom:'1px solid var(--border)',paddingBottom:24,marginBottom:28}}>
        <Mono>{d.courseName}</Mono>
        <h1 style={{fontFamily:"'DM Serif Display',serif",fontSize:'clamp(22px,4vw,38px)',color:'var(--text)',lineHeight:1.15,margin:'8px 0 10px'}}>{d.chapterTitle}</h1>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <Tag>{d.keyConcepts?.length||0} concepts</Tag>
          <Tag color="#f9a84f">{d.definitions?.length||0} terms</Tag>
          <Tag color="#7fda96">{totalQ} questions</Tag>
        </div>
        {!isPriv&&<ProgressBar pct={pct} color={accent}/>}
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:2,flexWrap:'wrap',borderBottom:'1px solid var(--border)',marginBottom:28,overflowX:'auto'}}>
        {tabs.map(t=><button key={t.id} className="tab-btn" onClick={()=>setTab(t.id)} style={{background:tab===t.id?'rgba(79,156,249,.08)':'none',border:'none',borderBottom:tab===t.id?'2px solid #4f9cf9':'2px solid transparent',color:tab===t.id?'#4f9cf9':'var(--muted)',cursor:'pointer',padding:'9px 14px',fontSize:13,fontWeight:tab===t.id?600:400,whiteSpace:'nowrap'}}>{t.label}</button>)}
      </div>

      {/* Tab content */}
      {tab==='concepts'&&<div className="fade-up"><SectionLabel>Key Concepts</SectionLabel><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(252px,1fr))',gap:12}}>{(d.keyConcepts||[]).map((c,i)=><div key={i} className={`stagger-${Math.min(i%4+1,4)}`} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:'15px 17px',borderLeft:`3px solid ${(COLOR_MAP[c.color]||COLOR_MAP.blue).bar}`}}><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:600,color:'var(--text)',marginBottom:5}}>{c.title}</div><p style={{fontSize:12.5,color:'var(--muted)',lineHeight:1.65,margin:0}}>{c.description}</p></div>)}</div></div>}

      {tab==='definitions'&&<div className="fade-up"><SectionLabel>Terms & Definitions</SectionLabel><div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,overflow:'hidden'}}>{(d.definitions||[]).map((def,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'190px 1fr',borderBottom:i<d.definitions.length-1?'1px solid var(--border)':'none'}}><div style={{padding:'12px 14px',fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:600,color:'#7fda96',background:'var(--surface)'}}>{def.term}</div><div style={{padding:'12px 14px',fontSize:13,color:'var(--text)',lineHeight:1.7}}>{def.definition}</div></div>)}</div></div>}

      {tab==='mechanisms'&&<div className="fade-up"><SectionLabel>Mechanisms Explained</SectionLabel><div style={{display:'flex',flexDirection:'column',gap:13}}>{(d.mechanisms||[]).map((m,i)=><div key={i} className={`stagger-${Math.min(i+1,4)}`} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:'18px 22px'}}><div style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:'var(--text)',marginBottom:10}}>{m.title}</div><p style={{fontSize:13,color:'var(--muted)',lineHeight:1.85,margin:0,whiteSpace:'pre-line'}}>{m.body}</p></div>)}</div></div>}

      {tab==='algorithms'&&hasAlgo&&<div className="fade-up"><SectionLabel>Algorithms & Methods</SectionLabel><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(228px,1fr))',gap:11}}>{(d.algorithms||[]).map((a,i)=><div key={i} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,padding:'13px 15px'}}><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'#da7ff0',fontWeight:600,marginBottom:5}}>{a.name}</div><p style={{fontSize:12,color:'var(--muted)',lineHeight:1.65,margin:0}}>{a.description}</p>{a.note&&<p style={{fontSize:11,color:'#f9a84f',marginTop:5,marginBottom:0}}>{a.note}</p>}</div>)}</div></div>}

      {tab==='takeaways'&&<div className="fade-up"><SectionLabel>Takeaways Per Chapter</SectionLabel><div style={{display:'flex',flexDirection:'column',gap:15}}>{(d.chapters||[]).map((ch,i)=><div key={i} className={`stagger-${Math.min(i+1,4)}`} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:'18px 22px'}}><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',letterSpacing:2,textTransform:'uppercase',marginBottom:3}}>{ch.num}</div><div style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:'var(--text)',marginBottom:11}}>{ch.name}</div><div style={{display:'flex',flexDirection:'column',gap:9}}>{(ch.takeaways||[]).map((t,j)=><div key={j} style={{display:'flex',gap:11,alignItems:'flex-start',fontSize:13,color:'var(--text)'}}><span style={{color:'#da7ff0',flexShrink:0}}>→</span><span>{t}</span></div>)}</div></div>)}</div></div>}

      {tab==='questions'&&(
        <div className="fade-up">
          <SectionLabel>Practice Questions & Answers</SectionLabel>
          {!isPriv&&<div style={{background:'rgba(79,156,249,.05)',border:'1px solid rgba(79,156,249,.15)',borderRadius:8,padding:'9px 13px',marginBottom:14,display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:6,fontSize:12,color:'var(--muted)'}}>
            <span>Click to reveal answers — progress saved automatically.</span>
            <span style={{color:'#4f9cf9',fontFamily:"'IBM Plex Mono',monospace",fontSize:10}}>{cp.openedQs.length}/{totalQ} opened</span>
          </div>}
          <SearchBar value={filter} onChange={setFilter} placeholder="Search questions…"/>
          <Mono color="var(--muted)" size={9}>SHOWING {filteredQ.length} OF {totalQ} QUESTIONS</Mono>
          <div style={{display:'flex',flexDirection:'column',gap:9,marginTop:12}}>
            {filteredQ.map(q=>{const ri=(d.questions||[]).indexOf(q);const isOpen=openQ===ri;const seen=cp.openedQs.includes(ri);return(
              <div key={ri} className="fade-in" style={{background:'var(--card)',border:`1px solid ${seen?'rgba(127,218,150,.3)':'var(--border)'}`,borderRadius:10,overflow:'hidden'}}>
                <div onClick={()=>revealQ(ri)} style={{padding:'13px 17px',display:'flex',alignItems:'flex-start',gap:12,cursor:'pointer'}}>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:seen?'#7fda96':'#4f9cf9',color:'#000',borderRadius:4,padding:'2px 6px',flexShrink:0,marginTop:3}}>Q{ri+1}</span>
                  <span style={{fontSize:13.5,color:'var(--text)',fontWeight:500,lineHeight:1.6,flex:1}}>{q.question}</span>
                  <span style={{color:'var(--muted)',fontSize:18,flexShrink:0,lineHeight:1}}>{isOpen?'−':'+'}</span>
                </div>
                {isOpen&&<div className="fade-in" style={{borderTop:'1px solid var(--border)',padding:'14px 17px',background:'rgba(79,156,249,.03)'}}>
                  <Mono color="#7fda96" size={9}>Answer</Mono>
                  <p style={{fontSize:13,color:'var(--text)',lineHeight:1.8,margin:'8px 0 0',whiteSpace:'pre-line'}}>{q.answer}</p>
                </div>}
              </div>
            );})}
          </div>
        </div>
      )}

      {tab==='resources'&&<ResourcesTab courseId={course.id} user={user}/>}
      {tab==='community'&&<CommunityBoard courseId={course.id} user={user}/>}

      <Chatbot context={chatCtx}/>
    </div>
  );
}

/* ═══════════════ ANALYTICS TAB ═══════════════ */
function AnalyticsTab({courses}){
  const[allProgress,setAllProgress]=useState([]);const[loading,setLoading]=useState(true);
  useEffect(()=>{dbLoadAllProgress().then(p=>{setAllProgress(p);setLoading(false);});},[]);

  const courseStats=courses.map(c=>{
    const cp=allProgress.filter(p=>p.course_id===c.id);
    const views=cp.filter(p=>p.viewed).length;
    const totalQs=c.qCount||1;
    const avgCompletion=cp.length===0?0:Math.round(cp.reduce((a,p)=>a+(p.opened_qs?.length||0)/totalQs*100,0)/cp.length);
    return{...c,views,avgCompletion,uniqueStudents:cp.length};
  }).sort((a,b)=>b.views-a.views);

  const totalViews=allProgress.filter(p=>p.viewed).length;
  const totalStudents=new Set(allProgress.map(p=>p.username)).size;
  const totalQsOpened=allProgress.reduce((a,p)=>a+(p.opened_qs?.length||0),0);

  if(loading)return<div style={{color:'var(--muted)',textAlign:'center',padding:40}}>Loading analytics…</div>;

  return(
    <div className="fade-up">
      {/* Summary cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:12,marginBottom:24}}>
        {[{label:'Total Views',val:totalViews,color:'#4f9cf9',icon:'👁'},{label:'Active Students',val:totalStudents,color:'#7fda96',icon:'👥'},{label:'Questions Opened',val:totalQsOpened,color:'#f9a84f',icon:'❓'},{label:'Total Courses',val:courses.length,color:'#da7ff0',icon:'📚'}].map((s,i)=>(
          <div key={i} className={`stagger-${i+1}`} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'14px 16px'}}>
            <div style={{fontSize:20,marginBottom:4}}>{s.icon}</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:24,color:s.color,fontWeight:600}}>{s.val}</div>
            <div style={{fontSize:11,color:'var(--muted)',marginTop:3}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Per-course table */}
      <SectionLabel>Course Performance</SectionLabel>
      <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 80px 80px 80px',background:'var(--surface)',padding:'10px 14px',gap:8}}>
          {['Course','Views','Students','Avg %'].map(h=><Mono key={h} color="var(--muted)" size={9}>{h}</Mono>)}
        </div>
        {courseStats.map((c,i)=>(
          <div key={c.id} style={{display:'grid',gridTemplateColumns:'1fr 80px 80px 80px',padding:'12px 14px',gap:8,borderTop:'1px solid var(--border)',alignItems:'center'}}>
            <div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:YEAR_COLORS[c.year],marginBottom:2}}>Yr {c.year} · {c.courseName}</div>
              <div style={{fontSize:13,color:'var(--text)'}}>{c.chapterTitle}</div>
            </div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:'#4f9cf9',fontWeight:600}}>{c.views}</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:'#7fda96',fontWeight:600}}>{c.uniqueStudents}</div>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <div style={{flex:1,height:4,background:'var(--border)',borderRadius:2}}><div style={{height:'100%',width:`${c.avgCompletion}%`,background:'#f9a84f',borderRadius:2}}/></div>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'#f9a84f',flexShrink:0}}>{c.avgCompletion}%</span>
            </div>
          </div>
        ))}
        {courseStats.length===0&&<div style={{padding:30,textAlign:'center',color:'var(--muted)',fontSize:13}}>No data yet.</div>}
      </div>
    </div>
  );
}

/* ═══════════════ APPROVALS TAB ═══════════════ */
const ACTION_LABELS={
  add_course:   {icon:'📚',label:'Add Course',    color:'#4f9cf9'},
  delete_course:{icon:'🗑',label:'Delete Course', color:'#f05050'},
  add_resource: {icon:'🔗',label:'Add Resource',  color:'#7fda96'},
  delete_resource:{icon:'🗑',label:'Delete Resource',color:'#f9a84f'},
};

function ApprovalsTab({onCourseChange,courses,reviewerUsername}){
  const[pending,setPending]=useState([]);const[history,setHistory]=useState([]);const[tab,setTab]=useState('pending');const[loading,setLoading]=useState(true);const[busy,setBusy]=useState('');const[rejectModal,setRejectModal]=useState(null);const[rejectNote,setRejectNote]=useState('');

  const load=async()=>{setLoading(true);const[p,h]=await Promise.all([dbLoadPending('pending'),dbLoadAllPending()]);setPending(p);setHistory(h.filter(a=>a.status!=='pending'));setLoading(false);};
  useEffect(()=>{load();},[]);

  const approve=async(action)=>{
    setBusy(action.id);
    try{
      // Execute the actual action
      if(action.action_type==='add_course'){
        const{entry,courseData}=action.payload;
        await dbSaveCourse(entry,courseData);
        const idx=await dbLoadCourseIndex();onCourseChange(idx);
      }
      if(action.action_type==='delete_course'){
        await dbDeleteCourse(action.payload.id);
        const idx=await dbLoadCourseIndex();onCourseChange(idx);
      }
      if(action.action_type==='add_resource'){
        await supabase.from('resources').insert(action.payload);
      }
      if(action.action_type==='delete_resource'){
        await dbDeleteResource(action.payload.id);
      }
      await dbReviewPending(action.id,'approved',reviewerUsername);
    }catch(e){console.error(e);}
    setBusy('');await load();
  };

  const reject=async()=>{
    if(!rejectModal)return;
    setBusy(rejectModal.id);
    await dbReviewPending(rejectModal.id,'rejected',reviewerUsername,rejectNote);
    setRejectModal(null);setRejectNote('');setBusy('');await load();
  };

  const list=tab==='pending'?pending:history;

  if(loading)return<div style={{color:'var(--muted)',textAlign:'center',padding:40}}>Loading approvals…</div>;

  return(
    <div className="fade-up">
      {/* Reject modal */}
      {rejectModal&&(
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setRejectModal(null)}>
          <div className="scale-in" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,padding:'26px 28px',maxWidth:420,width:'100%',boxShadow:'var(--shadow)'}}>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:19,color:'var(--text)',marginBottom:4}}>Reject Request</div>
            <p style={{fontSize:13,color:'var(--muted)',marginBottom:16}}>Optionally add a note explaining why this was rejected. The admin will see this.</p>
            <textarea value={rejectNote} onChange={e=>setRejectNote(e.target.value)} placeholder="Reason for rejection (optional)…" rows={3} style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 12px',color:'var(--text)',fontSize:13,fontFamily:"'DM Sans',sans-serif",resize:'none',marginBottom:16}}/>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button onClick={()=>setRejectModal(null)} style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'8px 16px',fontSize:13}}>Cancel</button>
              <button onClick={reject} style={{background:'rgba(240,80,80,.15)',border:'1px solid rgba(240,80,80,.4)',borderRadius:8,color:'#f05050',cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:700}}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}

      <div style={{background:'rgba(249,168,79,.06)',border:'1px solid rgba(249,168,79,.2)',borderRadius:10,padding:'12px 16px',marginBottom:20,display:'flex',gap:10,alignItems:'center'}}>
        <span style={{fontSize:20}}>⚡</span>
        <div>
          <div style={{color:'#f9a84f',fontSize:13,fontWeight:600,marginBottom:2}}>Superuser Approval Queue</div>
          <div style={{color:'var(--muted)',fontSize:12}}>All admin actions require your approval before taking effect. You can approve or reject with a note.</div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{display:'flex',gap:4,borderBottom:'1px solid var(--border)',marginBottom:18}}>
        {[{id:'pending',label:`Pending${pending.length>0?` (${pending.length})`:''}`,color:pending.length>0?'#f9a84f':undefined},{id:'history',label:'History'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{background:'none',border:'none',borderBottom:tab===t.id?`2px solid ${t.color||'#f9a84f'}`:'2px solid transparent',color:tab===t.id?(t.color||'#f9a84f'):'var(--muted)',cursor:'pointer',padding:'8px 16px',fontSize:13,fontWeight:tab===t.id?600:400}}>{t.label}</button>
        ))}
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {list.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:40,border:'1px dashed var(--border)',borderRadius:12,fontSize:13}}>{tab==='pending'?'✅ No pending requests — all clear.':'No history yet.'}</div>}
        {list.map((a,i)=>{
          const meta=ACTION_LABELS[a.action_type]||{icon:'❓',label:a.action_type,color:'#8892a4'};
          const isPending=a.status==='pending';
          const isApproved=a.status==='approved';
          return(
            <div key={a.id} className={`stagger-${Math.min(i%4+1,4)}`} style={{background:'var(--card)',border:`1px solid ${isPending?`${meta.color}30`:isApproved?'rgba(127,218,150,.2)':'rgba(240,80,80,.2)'}`,borderRadius:12,padding:'16px 18px'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
                <div style={{display:'flex',alignItems:'center',gap:12,flex:1,minWidth:200}}>
                  <div style={{width:40,height:40,borderRadius:10,background:`${meta.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{meta.icon}</div>
                  <div>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3,flexWrap:'wrap'}}>
                      <span style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{meta.label}</span>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:`${meta.color}15`,color:meta.color,borderRadius:4,padding:'2px 7px',letterSpacing:1}}>{a.action_type}</span>
                      {!isPending&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:isApproved?'rgba(127,218,150,.15)':'rgba(240,80,80,.15)',color:isApproved?'#7fda96':'#f05050',borderRadius:4,padding:'2px 7px',letterSpacing:1}}>{a.status.toUpperCase()}</span>}
                    </div>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--muted)',letterSpacing:1}}>
                      Requested by <span style={{color:'var(--text)',fontWeight:600}}>@{a.requested_by}</span> · {new Date(a.requested_at).toLocaleString()}
                    </div>
                    {/* Payload summary */}
                    {a.payload?.entry&&<div style={{fontSize:12,color:'var(--muted)',marginTop:4}}>Course: <span style={{color:'var(--text)'}}>{a.payload.entry.chapterTitle}</span> (Year {a.payload.entry.year})</div>}
                    {a.payload?.chapterTitle&&<div style={{fontSize:12,color:'var(--muted)',marginTop:4}}>Course: <span style={{color:'var(--text)'}}>{a.payload.chapterTitle}</span></div>}
                    {a.payload?.title&&!a.payload?.entry&&<div style={{fontSize:12,color:'var(--muted)',marginTop:4}}>Resource: <span style={{color:'var(--text)'}}>{a.payload.title}</span></div>}
                    {!isPending&&a.note&&<div style={{fontSize:11,color:'var(--muted)',marginTop:5,fontStyle:'italic'}}>Note: {a.note}</div>}
                  </div>
                </div>
                {isPending&&(
                  <div style={{display:'flex',gap:8,flexShrink:0}}>
                    <button onClick={()=>approve(a)} disabled={busy===a.id} style={{background:'rgba(127,218,150,.12)',border:'1px solid rgba(127,218,150,.35)',borderRadius:8,color:'#7fda96',cursor:'pointer',padding:'8px 16px',fontSize:12,fontWeight:700}}>
                      {busy===a.id?'…':'✓ Approve'}
                    </button>
                    <button onClick={()=>setRejectModal(a)} disabled={busy===a.id} style={{background:'rgba(240,80,80,.1)',border:'1px solid rgba(240,80,80,.3)',borderRadius:8,color:'#f05050',cursor:'pointer',padding:'8px 14px',fontSize:12,fontWeight:700}}>✕ Reject</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════ MANAGE ADMINS ═══════════════ */
function ManageAdminsTab(){
  const[users,setUsers]=useState([]);const[admins,setAdmins]=useState([]);const[search,setSearch]=useState('');const[busy,setBusy]=useState('');const[msg,setMsg]=useState('');
  useEffect(()=>{Promise.all([dbLoadUsers(),dbLoadAdmins()]).then(([u,a])=>{setUsers(u);setAdmins(a);});},[]);
  const flash=m=>{setMsg(m);setTimeout(()=>setMsg(''),2500);};
  const toggleAdmin=async u=>{setBusy(u.username);const isAdm=admins.includes(u.username.toLowerCase());const next=isAdm?admins.filter(a=>a!==u.username.toLowerCase()):[...admins,u.username.toLowerCase()];setAdmins(next);await dbSetAdmins(next);flash(`${u.display_name||u.username} ${isAdm?'demoted to Student':'promoted to Admin'}.`);setBusy('');};
  const filtered=users.filter(u=>!search||u.username.toLowerCase().includes(search.toLowerCase()));
  return(
    <div>
      <div style={{background:'rgba(249,168,79,.06)',border:'1px solid rgba(249,168,79,.2)',borderRadius:10,padding:'12px 16px',marginBottom:18,display:'flex',gap:10}}>
        <span style={{fontSize:18}}>⚡</span>
        <div><div style={{color:'#f9a84f',fontSize:13,fontWeight:600,marginBottom:3}}>Superuser Exclusive</div><div style={{color:'var(--muted)',fontSize:12}}>Only you can promote or demote admins.</div></div>
      </div>
      {msg&&<div className="slide-down" style={{background:'rgba(127,218,150,.08)',border:'1px solid rgba(127,218,150,.3)',borderRadius:8,padding:'9px 14px',color:'#7fda96',fontSize:12.5,marginBottom:14}}>{msg}</div>}
      <SearchBar value={search} onChange={setSearch} placeholder="Search users…"/>
      <div style={{display:'flex',flexDirection:'column',gap:10,marginTop:12}}>
        {filtered.map((u,i)=>{const isAdm=admins.includes(u.username.toLowerCase());return(
          <div key={i} style={{background:'var(--surface)',border:`1px solid ${isAdm?'rgba(218,127,240,.2)':'var(--border)'}`,borderRadius:10,padding:'13px 17px',display:'flex',alignItems:'center',gap:13,flexWrap:'wrap'}}>
            <Avatar name={u.display_name||u.username}/>
            <div style={{flex:1,minWidth:140}}><div style={{fontSize:14,color:'var(--text)',fontWeight:500}}>{u.display_name||u.username}</div><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginTop:2}}>@{u.username} · Yr {u.year}</div></div>
            <RoleBadge role={isAdm?ROLE.ADMIN:ROLE.USER}/>
            <button onClick={()=>toggleAdmin(u)} disabled={busy===u.username} style={{background:isAdm?'rgba(240,80,80,.1)':'rgba(218,127,240,.1)',border:`1px solid ${isAdm?'rgba(240,80,80,.3)':'rgba(218,127,240,.3)'}`,borderRadius:7,color:isAdm?'#f05050':'#da7ff0',cursor:'pointer',padding:'6px 14px',fontSize:11,fontFamily:"'IBM Plex Mono',monospace",fontWeight:600}}>
              {busy===u.username?'…':isAdm?'Demote':'→ Make Admin'}
            </button>
          </div>
        );})}
        {filtered.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:30,border:'1px dashed var(--border)',borderRadius:10}}>No users found.</div>}
      </div>
    </div>
  );
}

/* ═══════════════ ADMIN PANEL ═══════════════ */
function AdminPanel({user,courses,onClose,onCoursesChange}){
  const isSU2=user.role===ROLE.SUPERUSER;
  const[tab,setTab]=useState('courses');const[allUsers,setAllUsers]=useState([]);const[admins,setAdmins]=useState([]);const[filterY,setFilterY]=useState(0);const[showUpload,setShowUpload]=useState(false);const[search,setSearch]=useState('');const[pendingCount,setPendingCount]=useState(0);const[actionMsg,setActionMsg]=useState('');

  useEffect(()=>{
    Promise.all([dbLoadUsers(),dbLoadAdmins()]).then(([u,a])=>{setAllUsers(u);setAdmins(a);});
    if(isSU2)dbCountPending().then(setPendingCount);
  },[]);

  const flash=m=>{setActionMsg(m);setTimeout(()=>setActionMsg(''),3000);};

  // Admins submit for approval; superuser acts directly
  const doDelete=async id=>{
    if(!confirm(isSU2?'Delete this course permanently?':'Submit deletion request for superuser approval?'))return;
    if(isSU2){
      await dbDeleteCourse(id);const idx=await dbLoadCourseIndex();onCoursesChange(idx);
    } else {
      const c=courses.find(x=>x.id===id);
      await dbSubmitPending('delete_course',user.username,{id,chapterTitle:c?.chapterTitle,courseName:c?.courseName});
      flash('✓ Deletion request submitted — awaiting superuser approval.');
    }
  };

  const pTabs=[
    {id:'courses',label:'Courses'},
    {id:'users',label:'Users'},
    {id:'analytics',label:'📊 Analytics'},
    ...(isSU2?[{id:'approvals',label:'approvals',pendingCount},{id:'admins',label:'⚡ Manage Admins'}]:[])
  ];

  const filtered=(filterY===0?courses:courses.filter(c=>c.year===filterY)).filter(c=>!search||c.chapterTitle.toLowerCase().includes(search.toLowerCase())||c.courseName.toLowerCase().includes(search.toLowerCase()));

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.88)',backdropFilter:'blur(8px)',zIndex:2000,overflow:'auto'}}>
      <div style={{maxWidth:900,margin:'0 auto',padding:'34px 20px 90px'}}>
        <div className="fade-up" style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:26,flexWrap:'wrap',gap:14}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
              <Mono color={isSU2?'#f9a84f':'#da7ff0'} size={9}>{isSU2?'SUPERUSER PANEL':'ADMIN PANEL'}</Mono>
              <RolePill role={user.role}/>
            </div>
            <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:'var(--text)'}}>Manage StudyHub</h2>
            {!isSU2&&<p style={{fontSize:12,color:'var(--muted)',marginTop:5}}>Your course & resource actions require superuser approval before taking effect.</p>}
          </div>
          <button onClick={onClose} style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'9px 18px',fontSize:13}}>← Back</button>
        </div>

        {actionMsg&&<div className="slide-down" style={{background:'rgba(127,218,150,.08)',border:'1px solid rgba(127,218,150,.3)',borderRadius:8,padding:'10px 16px',color:'#7fda96',fontSize:13,marginBottom:18}}>{actionMsg}</div>}

        {/* Stats */}
        <div className="stagger-1" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:10,marginBottom:24}}>
          {[{label:'Total Courses',val:courses.length,color:'#4f9cf9'},{label:'Users',val:allUsers.length,color:'#7fda96'},{label:'Admins',val:admins.length,color:'#da7ff0'},...(isSU2&&pendingCount>0?[{label:'Pending Approval',val:pendingCount,color:'#f9a84f'}]:[]),...YEARS.map(y=>({label:`Year ${y}`,val:courses.filter(c=>c.year===y).length,color:YEAR_COLORS[y]}))].map((s,i)=>(
            <div key={i} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'14px 16px'}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:22,color:s.color,fontWeight:600}}>{s.val}</div>
              <div style={{fontSize:11,color:'var(--muted)',marginTop:3}}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{display:'flex',gap:4,borderBottom:'1px solid var(--border)',marginBottom:22,flexWrap:'wrap'}}>
          {pTabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{background:tab===t.id?'rgba(249,168,79,.06)':'none',border:'none',borderBottom:tab===t.id?'2px solid #f9a84f':'2px solid transparent',color:tab===t.id?'#f9a84f':'var(--muted)',cursor:'pointer',padding:'9px 16px',fontSize:13,fontWeight:tab===t.id?600:400,display:'flex',alignItems:'center',gap:6}}>
              {t.id==='approvals'?'⚡ Approvals':t.label}
              {t.id==='approvals'&&t.pendingCount>0&&<span style={{background:'#f9a84f',color:'#000',borderRadius:10,padding:'1px 7px',fontSize:10,fontWeight:700}}>{t.pendingCount}</span>}
            </button>
          ))}
        </div>

        {tab==='courses'&&(
          <div className="fade-up">
            {!isSU2&&<div style={{background:'rgba(218,127,240,.06)',border:'1px solid rgba(218,127,240,.2)',borderRadius:8,padding:'9px 14px',fontSize:12,color:'#da7ff0',marginBottom:14}}>🛡 As Admin, your Add and Delete actions will be queued for superuser approval.</div>}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,flexWrap:'wrap',gap:10}}>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                {[{label:'All',y:0},...YEARS.map(y=>({label:`Yr ${y}`,y}))].map(({label,y})=>(
                  <button key={y} onClick={()=>setFilterY(y)} style={{background:filterY===y?(y===0?'rgba(136,146,164,.1)':YEAR_BG[y]):'none',border:`1px solid ${filterY===y?(y===0?'#8892a4':YEAR_COLORS[y])+'60':'var(--border)'}`,borderRadius:20,color:filterY===y?(y===0?'#8892a4':YEAR_COLORS[y]):'var(--muted)',cursor:'pointer',padding:'5px 14px',fontSize:12,fontWeight:filterY===y?600:400}}>{label}</button>
                ))}
                <SearchBar value={search} onChange={setSearch} placeholder="Search courses…"/>
              </div>
              <button onClick={()=>setShowUpload(true)} style={{background:'#4f9cf9',border:'none',borderRadius:8,color:'#000',cursor:'pointer',padding:'9px 18px',fontSize:13,fontWeight:700}}>+ {isSU2?'Add Course':'Request Course'}</button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              {filtered.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:40,border:'1px dashed var(--border)',borderRadius:12}}>No courses here yet.</div>}
              {filtered.map(c=>(
                <div key={c.id} className="fade-in" style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'13px 17px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                  <div style={{background:YEAR_BG[c.year],border:`1px solid ${YEAR_COLORS[c.year]}40`,borderRadius:5,padding:'3px 9px'}}><Mono color={YEAR_COLORS[c.year]} size={9}>Yr {c.year}</Mono></div>
                  <div style={{flex:1,minWidth:160}}><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)'}}>{c.courseName}</div><div style={{fontSize:14,color:'var(--text)',marginTop:2}}>{c.chapterTitle}</div></div>
                  <div style={{display:'flex',gap:6}}><Tag color="#4f9cf9">{c.conceptCount} concepts</Tag><Tag color="#7fda96">{c.qCount} questions</Tag></div>
                  <button onClick={()=>doDelete(c.id)} title={isSU2?'Delete permanently':'Submit deletion request'} style={{background:'rgba(240,80,80,.1)',border:'1px solid rgba(240,80,80,.3)',borderRadius:6,color:'#f05050',cursor:'pointer',padding:'5px 12px',fontSize:11,flexShrink:0}}>{isSU2?'✕ Delete':'↑ Request Delete'}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='users'&&(
          <div className="fade-up">
            <div style={{marginBottom:14}}><SearchBar value={search} onChange={setSearch} placeholder="Search users…"/></div>
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              {allUsers.filter(u=>!search||u.username.toLowerCase().includes(search.toLowerCase())).map((u,i)=>{const isAdm=admins.includes(u.username.toLowerCase());return(
                <div key={i} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'12px 16px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                  <Avatar name={u.display_name||u.username}/>
                  <div style={{flex:1}}><div style={{fontSize:14,color:'var(--text)',fontWeight:500}}>{u.display_name||u.username}</div><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginTop:2}}>@{u.username} · Yr {u.year} · {new Date(u.created_at).toLocaleDateString()}</div></div>
                  <RolePill role={isAdm?ROLE.ADMIN:ROLE.USER}/>
                  <div style={{background:YEAR_BG[u.year],border:`1px solid ${YEAR_COLORS[u.year]}40`,borderRadius:5,padding:'3px 9px'}}><Mono color={YEAR_COLORS[u.year]} size={9}>Yr {u.year}</Mono></div>
                </div>
              );})}
              {allUsers.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:40,border:'1px dashed var(--border)',borderRadius:12}}>No users yet.</div>}
            </div>
          </div>
        )}

        {tab==='analytics'&&<AnalyticsTab courses={courses}/>}
        {tab==='approvals'&&isSU2&&<ApprovalsTab onCourseChange={onCoursesChange} courses={courses} reviewerUsername={user.username}/>}
        {tab==='admins'&&isSU2&&<ManageAdminsTab/>}
      </div>
      {showUpload&&(
        isSU2
          ? <UploadModal onClose={()=>setShowUpload(false)} onDone={idx=>{onCoursesChange(idx);setShowUpload(false);}}/>
          : <UploadModal onClose={()=>setShowUpload(false)} onDone={async(idx,entry,courseData)=>{
              // Admin: submit for approval instead of saving directly
              await dbSubmitPending('add_course',user.username,{entry,courseData});
              setShowUpload(false);flash('✓ Course submitted for superuser approval.');
            }} adminMode={true} requestedBy={user.username}/>
      )}
    </div>
  );
}

/* ═══════════════ HOME ═══════════════ */
function Home({user,courses,progress,onSelectCourse,onLogout,onShowAdmin,onProgressUpdate,bookmarks,toggleBookmark,dark,toggleTheme}){
  const[activeYear,setActiveYear]=useState(user.year||1);
  const[search,setSearch]=useState('');const[showBookmarks,setShowBookmarks]=useState(false);
  const isPriv=user.role!==ROLE.USER;

  const visible=courses.filter(c=>{
    const matchYear=c.year===activeYear;
    const matchSearch=!search||c.chapterTitle.toLowerCase().includes(search.toLowerCase())||c.courseName.toLowerCase().includes(search.toLowerCase());
    return matchYear&&matchSearch;
  });

  const bookmarkedCourses=courses.filter(c=>bookmarks.includes(c.id));

  const pct=id=>{const cp=progress[id];const m=courses.find(c=>c.id===id);if(!cp||!m||m.qCount===0)return 0;return Math.round((cp.openedQs?.length||0)/m.qCount*100);};
  const yearStat=y=>{const yc=courses.filter(c=>c.year===y);if(!yc.length)return null;return `${yc.filter(c=>progress[c.id]?.viewed).length}/${yc.length} started`;};

  return(
    <div style={{maxWidth:990,margin:'0 auto',padding:'34px 20px 88px'}}>
      {/* Top bar */}
      <div className="topbar fade-up" style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:28,flexWrap:'wrap',gap:14}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Avatar name={user.displayName} size={40}/>
          <div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'var(--text)'}}>{user.displayName}</div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginTop:4,flexWrap:'wrap'}}>
              <RolePill role={user.role}/>
              {user.role===ROLE.USER&&!user.isGuest&&<Mono color="var(--muted)" size={9}>Year {user.year} · @{user.username}</Mono>}
              {user.isGuest&&<Mono color="var(--muted)" size={9}>Preview mode</Mono>}
            </div>
          </div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <ThemeToggle dark={dark} toggle={toggleTheme}/>
          {bookmarks.length>0&&<button onClick={()=>setShowBookmarks(s=>!s)} style={{background:showBookmarks?'rgba(249,168,79,.15)':'var(--surface)',border:`1px solid ${showBookmarks?'#f9a84f':'var(--border)'}`,borderRadius:8,color:showBookmarks?'#f9a84f':'var(--muted)',cursor:'pointer',padding:'8px 14px',fontSize:13}}>🔖 {bookmarks.length}</button>}
          {isPriv&&<button onClick={onShowAdmin} style={{background:ROLE_BG[user.role],border:`1px solid ${ROLE_COLOR[user.role]}40`,borderRadius:8,color:ROLE_COLOR[user.role],cursor:'pointer',padding:'8px 16px',fontSize:12,fontWeight:600}}>{user.role===ROLE.SUPERUSER?'⚡ Panel':'⚙ Panel'}</button>}
          <button onClick={onLogout} style={{background:user.isGuest?'#4f9cf9':'none',border:user.isGuest?'none':'1px solid var(--border)',borderRadius:8,color:user.isGuest?'#000':'var(--muted)',cursor:'pointer',padding:'8px 16px',fontSize:12,fontWeight:user.isGuest?700:400}}>
            {user.isGuest?'Sign In / Sign Up':'Sign Out'}
          </button>
        </div>
      </div>

      {/* Bookmarks panel */}
      {showBookmarks&&bookmarkedCourses.length>0&&(
        <div className="scale-in" style={{background:'var(--surface)',border:'1px solid rgba(249,168,79,.3)',borderRadius:12,padding:'18px 20px',marginBottom:24}}>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'#f9a84f',letterSpacing:2,marginBottom:14}}>🔖 BOOKMARKED COURSES</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:10}}>
            {bookmarkedCourses.map(c=>(
              <div key={c.id} onClick={()=>onSelectCourse(c.id)} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,padding:'12px 14px',cursor:'pointer',borderLeft:`3px solid ${YEAR_COLORS[c.year]}`}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:YEAR_COLORS[c.year],marginBottom:3}}>Yr {c.year} · {c.courseName}</div>
                <div style={{fontSize:13,color:'var(--text)',fontWeight:500}}>{c.chapterTitle}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Year tabs */}
      <div className="stagger-1" style={{marginBottom:22}}>
        <Mono color="var(--muted)" size={9}>BROWSE BY YEAR</Mono>
        <div className="year-tabs" style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:10}}>
          {YEARS.map(y=>{const active=activeYear===y;const st=yearStat(y);return(
            <button key={y} className="year-tab" onClick={()=>{setActiveYear(y);setSearch('');}} style={{background:active?YEAR_BG[y]:'var(--surface)',border:`1px solid ${active?YEAR_COLORS[y]+'60':'var(--border)'}`,borderRadius:10,cursor:'pointer',padding:'10px 18px',transition:'var(--transition)',textAlign:'left'}}>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:16,color:active?YEAR_COLORS[y]:'var(--text)'}}>Year {y}</div>
              {st&&<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:active?YEAR_COLORS[y]+'aa':'var(--muted)',marginTop:2}}>{st}</div>}
            </button>
          );})}
        </div>
      </div>

      {/* Search */}
      <div className="stagger-2" style={{marginBottom:20}}>
        <SearchBar value={search} onChange={setSearch} placeholder={`Search Year ${activeYear} courses…`}/>
      </div>

      <Mono color="var(--muted)" size={9}>{visible.length} COURSE{visible.length!==1?'S':''} · YEAR {activeYear}{search?` · "${search}"`:''}</Mono>

      {visible.length===0?(
        <div style={{textAlign:'center',padding:'55px 20px',border:'1px dashed var(--border)',borderRadius:16,marginTop:16}}>
          <div style={{fontSize:34,marginBottom:12}}>📚</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:'var(--text)',marginBottom:8}}>{search?'No courses match your search':'No Year '+activeYear+' courses yet'}</div>
          <p style={{color:'var(--muted)',fontSize:13}}>{search?'Try a different keyword':(isPriv?'Open the panel to add courses.':'Check back later.')}</p>
        </div>
      ):(
        <div className="course-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(278px,1fr))',gap:14,marginTop:16}}>
          {visible.map((c,i)=>{
            const accent=YEAR_COLORS[c.year]||CARD_ACCENTS[i%CARD_ACCENTS.length];
            const p=pct(c.id);const viewed=progress[c.id]?.viewed;const bm=bookmarks.includes(c.id);
            return(
              <div key={c.id} className={`stagger-${Math.min(i%4+1,4)}`} onClick={()=>onSelectCourse(c.id)} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:'18px 20px',cursor:'pointer',transition:'transform .18s, box-shadow .18s',borderTop:`3px solid ${accent}`,position:'relative',boxShadow:'none'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,.2)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>
                <div style={{position:'absolute',top:12,right:12,display:'flex',gap:6,alignItems:'center'}}>
                  {viewed&&<div style={{width:7,height:7,borderRadius:'50%',background:'#7fda96'}} title="Visited"/>}
                  {bm&&<span style={{fontSize:12}}>🔖</span>}
                </div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:accent,letterSpacing:2,textTransform:'uppercase',marginBottom:4}}>{c.courseName}</div>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:16,color:'var(--text)',marginBottom:11,lineHeight:1.3,paddingRight:30}}>{c.chapterTitle}</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8}}>
                  <Tag color={accent}>{c.conceptCount} concepts</Tag>
                  <Tag color={accent}>{c.termCount} terms</Tag>
                  <Tag color={accent}>{c.qCount} Q&A</Tag>
                </div>
                {!isPriv&&<ProgressBar pct={p} color={accent}/>}
                <div style={{marginTop:9,fontSize:10,color:'var(--muted)',fontFamily:"'IBM Plex Mono',monospace"}}>Added {c.addedAt}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════ ROOT APP ═══════════════ */
export default function App(){
  const[dark,toggleTheme]=useTheme();
  const[bookmarks,toggleBookmark]=useBookmarks();
  const online=useOnline();
  const[view,setView]=useState('auth');
  const[user,setUser]=useState(null);
  const[courses,setCourses]=useState([]);
  const[active,setActive]=useState(null);
  const[progress,setProgress]=useState({});
  const[loading,setLoading]=useState(false);

  useEffect(()=>{
    dbLoadCourseIndex().then(setCourses).catch(async()=>{
      // Offline fallback: try to rebuild index from localStorage cache
      const cached=[];
      for(let i=0;i<localStorage.length;i++){
        const k=localStorage.key(i);
        if(k?.startsWith('sh-course-cache-')){
          try{const d=JSON.parse(localStorage.getItem(k));if(d?.data)cached.push({id:k.replace('sh-course-cache-',''),year:d.year,courseName:d.data.courseName,chapterTitle:d.data.chapterTitle,conceptCount:d.data.keyConcepts?.length||0,termCount:d.data.definitions?.length||0,qCount:d.data.questions?.length||0,addedAt:'Cached'});}catch{}
        }
      }
      if(cached.length>0)setCourses(cached);
    });
  },[]);

  const handleLogin=async u=>{setUser(u);if(u.role===ROLE.USER){const p=await dbLoadProgress(u.username).catch(()=>({}));setProgress(p);}setView('home');};
  const handleGuest=()=>{setUser({username:'guest',displayName:'Guest',role:ROLE.USER,isGuest:true,year:1});setView('home');};
  const handleLogout=()=>{setUser(null);setProgress({});setActive(null);setView('auth');};

  const handleSelect=async id=>{
    setLoading(true);
    let data=null,year=null;
    try{data=await dbLoadCourseData(id);year=courses.find(c=>c.id===id)?.year;}
    catch{
      // Offline: try cache
      try{const c=JSON.parse(localStorage.getItem(CACHE_KEY(id)));data=c?.data;year=c?.year;}catch{}
    }
    if(data){setActive({id,data,year});setView('course');}
    setLoading(false);
  };

  // Guests get in-memory progress only — no DB writes
  const handleProgress=async p=>{setProgress(p);if(user?.role===ROLE.USER&&!user?.isGuest)await dbSaveProgress(user.username,p).catch(()=>{});};

  const goToSignUp=()=>{setUser(null);setProgress({});setActive(null);setView('auth');};

  return(
    <>
      <style>{css}</style>
      {!online&&<OfflineBanner/>}
      {user?.isGuest&&view!=='auth'&&<GuestBanner onSignUp={goToSignUp}/>}
      <InstallPrompt/>

      {view==='auth'&&<AuthScreen onLogin={handleLogin} onGuest={handleGuest} dark={dark} toggleTheme={toggleTheme}/>}

      {view==='home'&&user&&(
        <div style={{paddingTop:user?.isGuest?48:0}}>
          <Home user={user} courses={courses} progress={progress}
            onSelectCourse={handleSelect} onLogout={handleLogout}
            onShowAdmin={()=>setView('admin')} onProgressUpdate={handleProgress}
            bookmarks={bookmarks} toggleBookmark={toggleBookmark}
            dark={dark} toggleTheme={toggleTheme}/>
        </div>
      )}

      {view==='course'&&active&&user&&(
        <div style={{paddingTop:user?.isGuest?48:0}}>
          <CourseView course={active} user={user} progress={progress}
            onBack={()=>setView('home')} onProgressUpdate={handleProgress}
            bookmarks={bookmarks} toggleBookmark={toggleBookmark}/>
        </div>
      )}

      {view==='admin'&&user&&(user.role===ROLE.ADMIN||user.role===ROLE.SUPERUSER)&&(
        <AdminPanel user={user} courses={courses} onClose={()=>setView('home')} onCoursesChange={setCourses}/>
      )}

      {loading&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:3000}}>
          <div style={{color:'#4f9cf9',fontSize:32,animation:'spin 1s linear infinite'}}>⟳</div>
        </div>
      )}

      {view!=='auth'&&<CopyrightBar/>}
    </>
  );
}
