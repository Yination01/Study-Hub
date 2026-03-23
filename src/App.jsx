/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                      S T U D Y H U B                            ║
 * ║  © 2025 Yination & Excalibur. All rights reserved.              ║
 * ║  Unauthorised copying or distribution is strictly prohibited.   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { createClient } from '@supabase/supabase-js';

/* ═══════════════ CONFIG ═══════════════ */
// NOTE: No superuser credentials stored here.
// Auth is validated server-side via /api/auth.
// Add SU_USERNAME and SU_PASSWORD to Vercel environment variables.
const APP_VERSION    = '4.0.0';
const COPYRIGHT_YEAR = '2025';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/* ═══════════════ CONSTANTS ═══════════════ */
const ROLE  = { SUPERUSER:'superuser', ADMIN:'admin', USER:'user', EXTERNAL:'external' };
const YEARS       = [1,2,3,4];
// These are seeded defaults — overridden at runtime by loadDepartments()
let DEPARTMENTS = ['Computer Science','Computer with Statistics'];
let DEPT_SHORT  = {'Computer Science':'CS','Computer with Statistics':'CwS'};
let DEPT_COLOR  = {'Computer Science':'#4f9cf9','Computer with Statistics':'#7fda96'};
// Dynamic user types — overridden at runtime by loadUserTypes()
let USER_TYPES  = [
  {id:'ut-student', label:'Enrolled Student',  shortCode:'Student',  roleKey:'user',     color:'#4f9cf9', description:'Currently enrolled students'},
  {id:'ut-external',label:'External / Visitor',shortCode:'External', roleKey:'external', color:'#a8f94f', description:'Non-enrolled users'},
];
const YEAR_COLORS = {1:'#4f9cf9',2:'#7fda96',3:'#f9a84f',4:'#da7ff0'};
const YEAR_BG     = {1:'rgba(79,156,249,0.1)',2:'rgba(127,218,150,0.1)',3:'rgba(249,168,79,0.1)',4:'rgba(218,127,240,0.1)'};
const ROLE_COLOR  = {superuser:'#f9a84f',admin:'#da7ff0',user:'#4f9cf9',external:'#a8f94f'};
const ROLE_BG     = {superuser:'rgba(249,168,79,0.12)',admin:'rgba(218,127,240,0.12)',user:'rgba(79,156,249,0.12)',external:'rgba(168,249,79,0.12)'};
const ROLE_ICON   = {superuser:'⚡',admin:'🛡',user:'🎓',external:'🌐',guest:'👀'};
const COLOR_MAP   = {blue:{bar:'#4f9cf9'},orange:{bar:'#f9a84f'},green:{bar:'#7fda96'},purple:{bar:'#da7ff0'}};
const CARD_ACCENTS= ['#4f9cf9','#f9a84f','#7fda96','#da7ff0','#f97b7b','#a8f94f','#4ff9e4','#f94fcc'];

/* ═══════════════ SMART SORT ═══════════════ */
// Course code → department
const CODE_TO_DEPT={
  COS:'Computer Science',CSC:'Computer Science',CS:'Computer Science',
  STA:'Computer with Statistics',STT:'Computer with Statistics',MAT:'Computer with Statistics',
};
function detectYearFromCode(code){
  const m=code.match(/(\d+)/);if(!m)return null;
  const n=parseInt(m[1]);
  if(n>=100&&n<200)return 1;if(n>=200&&n<300)return 2;
  if(n>=300&&n<400)return 3;if(n>=400&&n<500)return 4;
  return null;
}
function detectDeptFromCode(code){
  const p=code.replace(/[^a-zA-Z]/g,'').toUpperCase();
  for(const k of Object.keys(CODE_TO_DEPT).sort((a,b)=>b.length-a.length))
    {if(p.startsWith(k))return CODE_TO_DEPT[k];}
  return null;
}
function detectMetadata(data){
  const name=(data.courseName||'').trim();
  const title=(data.chapterTitle||'').toLowerCase();
  const result={year:null,semester:null,department:null};
  if(name){result.year=detectYearFromCode(name);result.department=detectDeptFromCode(name);}
  if(!result.semester){
    const s1=['introduction','intro','foundations','basics','fundamentals','first'];
    const s2=['advanced','continuation','second','further','design','implementation'];
    if(s1.some(w=>title.includes(w)))result.semester=1;
    else if(s2.some(w=>title.includes(w)))result.semester=2;
  }
  return result;
}
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
  /* Hide text labels on very small screens */
  @media(max-width:400px){
    .hide-xs{display:none!important}
  }

  /* GPU-accelerate animations */
  .fade-in,.fade-up,.scale-in,.slide-down,.slide-up{will-change:transform,opacity}
  /* Remove will-change after animation to free memory */
  .fade-in,.fade-up,.scale-in{animation-fill-mode:both}

  /* Contain layout shifts in course grid */
  .course-grid>*{contain:layout style}
  @media(max-width:640px){
    /* Touch targets */
    button{min-height:44px}
    .tab-btn{padding:10px 10px!important;font-size:11px!important;min-height:40px}

    /* Layout */
    .topbar{flex-wrap:wrap;gap:8px}
    .course-grid{grid-template-columns:1fr!important}
    .year-tabs{gap:6px!important;overflow-x:auto;flex-wrap:nowrap!important;padding-bottom:4px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
    .year-tabs::-webkit-scrollbar{display:none}
    .year-tab{padding:9px 14px!important;flex-shrink:0}

    /* Course view tabs — horizontal scroll */
    .course-tabs-row{overflow-x:auto;flex-wrap:nowrap!important;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:2px}
    .course-tabs-row::-webkit-scrollbar{display:none}

    /* Auth card — full width */
    .auth-card{padding:22px 18px!important;border-radius:12px!important}

    /* Home padding */
    .home-page{padding:20px 14px 100px!important}

    /* Course view padding */
    .course-page{padding:16px 14px 110px!important}

    /* Admin panel */
    .admin-page{padding:20px 12px 80px!important}

    /* Definitions table — stack on mobile */
    .def-grid{grid-template-columns:1fr!important}
    .def-term{border-bottom:none!important;border-right:none!important;padding-bottom:4px!important}

    /* Chatbot — full width at bottom */
    .chatbot-panel{right:0!important;left:0!important;width:100%!important;bottom:52px!important;border-radius:14px 14px 0 0!important;max-height:60vh!important}
    .chatbot-btn{right:12px!important;bottom:60px!important}

    /* Notification dropdown handled by position:fixed inline */

    /* Cards */
    .modal-inner{padding:20px 16px!important;border-radius:14px!important}

    /* Hide keyboard shortcut hint on mobile */
    .kbd-hint{display:none!important}

    /* Upload modal full height */
    .upload-modal{max-height:95vh!important}

    /* Year/semester pickers — 2 columns on mobile */
    .year-picker-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  }

  /* ── Tablet: 641–900px ── */
  @media(min-width:641px) and (max-width:900px){
    .course-grid{grid-template-columns:repeat(2,1fr)!important}
    .year-tabs{flex-wrap:wrap;gap:8px}
  }

  /* ── Safe area for notched phones ── */
  @supports(padding:max(0px)){
    .copyright-bar{padding-bottom:max(7px,env(safe-area-inset-bottom))!important}
    .course-page,.home-page{padding-bottom:max(88px,calc(52px + env(safe-area-inset-bottom)))!important}
  }

  @keyframes slideUp {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideDown {from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
  .slide-up{animation:slideUp .28s cubic-bezier(.4,0,.2,1) both}
  .slide-down{animation:slideDown .28s cubic-bezier(.4,0,.2,1) both}

  /* Focus visible — keyboard nav */
  :focus-visible{outline:2px solid rgba(79,156,249,.6)!important;outline-offset:2px}

  /* Text selection colour */
  ::selection{background:rgba(79,156,249,.25);color:var(--text)}

  /* Smooth transitions on theme switch */
  *{transition:background-color .25s,border-color .25s,color .15s}
  button,input,textarea,select{transition:background-color .25s,border-color .25s,color .15s,transform .1s,box-shadow .15s}
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

function useNotificationPermission(){
  const[perm,setPerm]=useState(()=>{
    if(!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });
  const request=useCallback(async()=>{
    if(!('Notification' in window)) return 'unsupported';
    if(Notification.permission==='granted'){setPerm('granted');return 'granted';}
    const result=await Notification.requestPermission();
    setPerm(result);
    localStorage.setItem('sh-notif-asked','1');
    return result;
  },[]);
  return[perm,request];
}

function pushNotification(title,body,icon='/icon-192.png'){
  if(Notification.permission!=='granted') return;
  try{new Notification(title,{body,icon,badge:'/icon-192.png'});}catch{}
}

/* ═══════════════ DATABASE ═══════════════ */
async function dbLoadUsers(){const{data}=await supabase.from('users').select('*');return data||[];}
async function dbSaveUser(u){await supabase.from('users').upsert(u,{onConflict:'username'});}
async function dbLoadAdmins(){const{data}=await supabase.from('admins').select('username');return(data||[]).map(r=>r.username.toLowerCase());}
async function dbSetAdmins(list){await supabase.from('admins').delete().neq('username','__none__');if(list.length>0)await supabase.from('admins').insert(list.map(u=>({username:u.toLowerCase()})));}
async function dbLoadCourseIndex(){
  const{data}=await supabase.from('courses').select('id,year,semester,department,course_name,chapter_title,concept_count,term_count,q_count,added_at').order('added_at',{ascending:false});
  return(data||[]).map(r=>({id:r.id,year:r.year,semester:r.semester||1,department:r.department||'Computer Science',courseName:r.course_name,chapterTitle:r.chapter_title,conceptCount:r.concept_count,termCount:r.term_count,qCount:r.q_count,addedAt:r.added_at}));
}
async function dbLoadCourseData(id){
  const{data}=await supabase.from('courses').select('data').eq('id',id).single();
  return data?.data||null;
}
async function dbSaveCourse(entry,courseData){
  await supabase.from('courses').upsert({id:entry.id,year:entry.year,semester:entry.semester||1,department:entry.department||'Computer Science',course_name:entry.courseName,chapter_title:entry.chapterTitle,concept_count:entry.conceptCount,term_count:entry.termCount,q_count:entry.qCount,added_at:entry.addedAt,data:courseData},{onConflict:'id'});
}
async function dbDeleteCourse(id){await supabase.from('courses').delete().eq('id',id);}
async function dbLoadProgress(username){const{data}=await supabase.from('progress').select('*').eq('username',username);const out={};(data||[]).forEach(r=>{out[r.course_id]={viewed:r.viewed,openedQs:r.opened_qs||[]};});return out;}
async function dbSaveProgress(username,progress){const rows=Object.entries(progress).map(([cid,p])=>({username,course_id:cid,viewed:p.viewed,opened_qs:p.openedQs}));if(rows.length>0)await supabase.from('progress').upsert(rows,{onConflict:'username,course_id'});}
async function resolveRole(username){
  const admins=await dbLoadAdmins();
  if(admins.includes(username.toLowerCase())) return ROLE.ADMIN;
  try{
    const{data}=await supabase.from('users').select('account_type').eq('username',username).single();
    if(data?.account_type==='external') return ROLE.EXTERNAL;
  }catch{}
  return ROLE.USER;
}

// Resources
async function dbLoadResources(courseId){try{const{data}=await supabase.from('resources').select('*').eq('course_id',courseId).order('added_at',{ascending:false});return data||[];}catch{return[];}}
async function dbAddResource(r){try{await supabase.from('resources').insert(r);}catch(e){console.error(e);}}
async function dbDeleteResource(id){try{await supabase.from('resources').delete().eq('id',id);}catch{}}

// Announcements
async function dbLoadAnnouncements(courseId){
  try{
    let q=supabase.from('announcements').select('*').order('pinned',{ascending:false}).order('posted_at',{ascending:false});
    if(courseId) q=q.or(`course_id.eq.${courseId},course_id.is.null`);
    else q=q.is('course_id',null);
    const{data}=await q;return data||[];
  }catch{return[];}
}
async function dbLoadAllAnnouncements(){
  try{const{data}=await supabase.from('announcements').select('*').order('posted_at',{ascending:false});return data||[];}catch{return[];}
}
async function dbSaveAnnouncement(a){try{await supabase.from('announcements').insert(a);}catch(e){console.error(e);}}
async function dbDeleteAnnouncement(id){try{await supabase.from('announcements').delete().eq('id',id);}catch{}}
async function dbPinAnnouncement(id,pinned){try{await supabase.from('announcements').update({pinned}).eq('id',id);}catch{}}

// Notification log
async function dbMarkSeen(username,itemId,itemType){
  try{await supabase.from('notification_log').upsert({username,item_id:itemId,item_type:itemType,seen_at:new Date().toISOString()},{onConflict:'username,item_id'});}catch{}
}
async function dbLoadSeen(username){
  try{const{data}=await supabase.from('notification_log').select('item_id').eq('username',username);return new Set((data||[]).map(r=>r.item_id));}catch{return new Set();}
}

// Fetch all recent notifiable items for a user
async function dbLoadNotifications(username){
  try{
    const[assignments,cas,announcements]=await Promise.all([
      supabase.from('assignments').select('id,title,course_id,added_at,due_date').order('added_at',{ascending:false}).limit(30),
      supabase.from('course_cas').select('id,title,course_id,type,added_at,date').order('added_at',{ascending:false}).limit(30),
      supabase.from('announcements').select('*').order('posted_at',{ascending:false}).limit(30),
    ]);
    const seen=await dbLoadSeen(username);
    const items=[
      ...(announcements.data||[]).map(a=>({id:a.id,type:'announcement',title:a.title,body:a.body,priority:a.priority,time:a.posted_at,courseId:a.course_id,pinned:a.pinned})),
      ...(assignments.data||[]).map(a=>({id:a.id,type:'assignment',title:`Assignment: ${a.title}`,body:a.due_date?`Due ${new Date(a.due_date).toLocaleDateString()}`:'',priority:'info',time:a.added_at,courseId:a.course_id})),
      ...(cas.data||[]).map(a=>({id:a.id,type:'ca',title:`${a.type}: ${a.title}`,body:a.date?`On ${new Date(a.date).toLocaleDateString()}`:'',priority:'info',time:a.added_at,courseId:a.course_id})),
    ].sort((a,b)=>new Date(b.time)-new Date(a.time));
    return{items,unseenCount:items.filter(i=>!seen.has(i.id)&&(i.pinned||true)).length,seen};
  }catch{return{items:[],unseenCount:0,seen:new Set()};}
}
async function dbLoadAssignments(courseId){try{const{data}=await supabase.from('assignments').select('*').eq('course_id',courseId).order('added_at',{ascending:false});return data||[];}catch{return[];}}
async function dbSaveAssignment(a){try{await supabase.from('assignments').insert(a);}catch(e){console.error(e);}}
async function dbDeleteAssignment(id){try{await supabase.from('assignments').delete().eq('id',id);}catch{}}

// CAs / Tests
async function dbLoadCAs(courseId){try{const{data}=await supabase.from('course_cas').select('*').eq('course_id',courseId).order('added_at',{ascending:false});return data||[];}catch{return[];}}
async function dbSaveCA(a){try{await supabase.from('course_cas').insert(a);}catch(e){console.error(e);}}
async function dbDeleteCA(id){try{await supabase.from('course_cas').delete().eq('id',id);}catch{}}

// Status change requests
async function dbSubmitStatusRequest(r){
  try{await supabase.from('status_change_requests').insert(r);}catch(e){console.error(e);}
}
async function dbLoadStatusRequests(status='pending'){
  try{const{data}=await supabase.from('status_change_requests').select('*').eq('status',status).order('requested_at',{ascending:false});return data||[];}catch{return[];}
}
async function dbLoadAllStatusRequests(){
  try{const{data}=await supabase.from('status_change_requests').select('*').order('requested_at',{ascending:false});return data||[];}catch{return[];}
}
async function dbReviewStatusRequest(id,status,reviewedBy,note=''){
  try{await supabase.from('status_change_requests').update({status,reviewed_by:reviewedBy,reviewed_at:new Date().toISOString(),note}).eq('id',id);}catch(e){console.error(e);}
}
async function dbGetPendingStatusRequest(username){
  try{const{data}=await supabase.from('status_change_requests').select('*').eq('username',username).eq('status','pending').single();return data||null;}catch{return null;}
}
async function dbApplyStatusChange(username,newType){
  try{await supabase.from('users').update({account_type:newType}).eq('username',username);}catch(e){console.error(e);}
}
async function dbCountPendingStatusRequests(){
  try{const{count}=await supabase.from('status_change_requests').select('*',{count:'exact',head:true}).eq('status','pending');return count||0;}catch{return 0;}
}

// Dynamic departments
async function loadDepartments(){
  try{
    const{data}=await supabase.from('departments').select('*').order('name');
    if(data?.length){
      DEPARTMENTS=data.map(d=>d.name);
      DEPT_SHORT=Object.fromEntries(data.map(d=>[d.name,d.short_code]));
      DEPT_COLOR=Object.fromEntries(data.map(d=>[d.name,d.color||'#4f9cf9']));
    }
  }catch{}
}
async function dbAddDepartment(dept){await supabase.from('departments').insert(dept);}
async function dbDeleteDepartment(id){await supabase.from('departments').delete().eq('id',id);}

// Dynamic user types
async function loadUserTypes(){
  try{
    const{data}=await supabase.from('user_types').select('*').order('created_at');
    if(data?.length) USER_TYPES=data.map(d=>({id:d.id,label:d.label,shortCode:d.short_code,roleKey:d.role_key,color:d.color||'#4f9cf9',description:d.description||''}));
  }catch{}
}
async function dbAddUserType(ut){await supabase.from('user_types').insert(ut);}
async function dbDeleteUserType(id){await supabase.from('user_types').delete().eq('id',id);}

// Helper — get display label for a user based on role + account_type
function getUserTypeLabel(role,accountType){
  if(role===ROLE.SUPERUSER) return '⚡ Superuser';
  if(role===ROLE.ADMIN)     return '🛡 Admin';
  if(role===ROLE.EXTERNAL||accountType==='external'){
    const ut=USER_TYPES.find(u=>u.roleKey==='external');
    return `🌐 ${ut?.shortCode||'External'}`;
  }
  const ut=USER_TYPES.find(u=>u.roleKey==='user');
  return `🎓 ${ut?.shortCode||'Student'}`;
}

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
const Field=({label,type='text',value,onChange,placeholder,error,disabled,onKeyDown})=>(<div style={{marginBottom:14}}>{label&&<div style={{fontSize:11,color:'var(--muted)',marginBottom:5,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>{label}</div>}<input type={type} value={value} onChange={onChange} onKeyDown={onKeyDown} placeholder={placeholder} disabled={disabled} style={{width:'100%',background:disabled?'rgba(0,0,0,.2)':'var(--input-bg)',border:`1px solid ${error?'#f05050':'var(--border)'}`,borderRadius:8,padding:'11px 14px',color:'var(--text)',fontSize:14,fontFamily:"'DM Sans',sans-serif"}}/>{error&&<div style={{color:'#f05050',fontSize:11,marginTop:4}}>{error}</div>}</div>);
const Avatar=({name,size=32})=>{const ini=name?name.slice(0,2).toUpperCase():'??';const hue=name?name.split('').reduce((a,c)=>a+c.charCodeAt(0),0)%360:200;return<div style={{width:size,height:size,borderRadius:'50%',background:`hsl(${hue},55%,25%)`,border:`2px solid hsl(${hue},55%,45%)`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'IBM Plex Mono',monospace",fontSize:size*.33,color:`hsl(${hue},80%,80%)`,flexShrink:0}}>{ini}</div>;};
const RoleBadge=({role,accountType})=>{
  const col=ROLE_COLOR[role]||ROLE_COLOR.user;
  return(<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:ROLE_BG[role]||ROLE_BG.user,color:col,border:`1px solid ${col}40`,borderRadius:5,padding:'3px 8px',letterSpacing:1,display:'inline-flex',alignItems:'center',gap:4}}>{getUserTypeLabel(role,accountType)}</span>);
};
const RolePill=({role,accountType})=>{
  const col=ROLE_COLOR[role]||ROLE_COLOR.user;
  return(<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,background:ROLE_BG[role]||ROLE_BG.user,color:col,border:`1px solid ${col}50`,borderRadius:20,padding:'4px 12px',letterSpacing:1,display:'inline-flex',alignItems:'center',gap:5,fontWeight:600}}>{getUserTypeLabel(role,accountType)}</span>);
};
const ProgressBar=({pct,color='#4f9cf9'})=>(<div style={{marginTop:10}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><Mono color="var(--muted)" size={9}>PROGRESS</Mono><Mono color={color} size={9}>{pct}%</Mono></div><div style={{height:3,background:'var(--border)',borderRadius:2}}><div style={{height:'100%',width:`${pct}%`,background:color,borderRadius:2,transition:'width .5s ease'}}/></div></div>);

/* ═══════════════ LOGO ═══════════════ */
function Logo({onClick,size='md'}){
  const sizes={sm:{outer:28,font:15,dot:5},md:{outer:36,font:19,dot:6},lg:{outer:48,font:26,dot:8}};
  const s=sizes[size]||sizes.md;
  return(
    <button onClick={onClick} title="Go to Dashboard" style={{background:'none',border:'none',cursor:onClick?'pointer':'default',padding:0,display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
      {/* Icon mark */}
      <div style={{width:s.outer,height:s.outer,borderRadius:10,background:'linear-gradient(135deg,#1a2a4a,#0d1929)',border:'1.5px solid rgba(79,156,249,.3)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',flexShrink:0,boxShadow:'0 2px 12px rgba(79,156,249,.15)'}}>
        <span style={{fontFamily:"'DM Serif Display',serif",fontSize:s.font,color:'#4f9cf9',letterSpacing:-1,lineHeight:1}}>S</span>
        <div style={{position:'absolute',top:4,right:4,width:s.dot,height:s.dot,borderRadius:'50%',background:'#7fda96',boxShadow:'0 0 6px #7fda96'}}/>
      </div>
      {/* Wordmark */}
      <div style={{lineHeight:1}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:s.font,color:'var(--text)',letterSpacing:-0.5,lineHeight:1}}>
          Study<span style={{color:'#4f9cf9'}}>Hub</span>
        </div>
        {size!=='sm'&&<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:'var(--muted)',letterSpacing:2,marginTop:3}}>v{APP_VERSION}</div>}
      </div>
    </button>
  );
}

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
/* ═══════════════ INSTALL PROMPT (cross-browser) ═══════════════ */
const PWA_KEY      = 'sh-pwa-v2';
const SNOOZE_DAYS  = 3;

/* Shared beforeinstallprompt event — captured once, used everywhere */
let _pwaPromptEvent = null;
let _pwaListeners   = [];
if(typeof window !== 'undefined'){
  window.addEventListener('beforeinstallprompt', e=>{
    e.preventDefault();
    _pwaPromptEvent = e;
    _pwaListeners.forEach(fn=>fn(e));
  });
}
function usePWAPrompt(){
  const[p,setP]=useState(_pwaPromptEvent);
  useEffect(()=>{
    const fn=e=>setP(e);
    _pwaListeners.push(fn);
    return()=>{ _pwaListeners=_pwaListeners.filter(f=>f!==fn); };
  },[]);
  return p;
}

function useBrowserInfo(){
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
  const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS|OPiOS|SamsungBrowser/.test(ua);
  const isFirefox = /Firefox|FxiOS/.test(ua);
  const isAndroid = /Android/.test(ua);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  // Brave: navigator.brave exists on desktop; on Android it may be absent on older builds
  // Fall back to checking if the Brave-specific object or promise exists
  const isBrave = !!(navigator.brave) || typeof window.brave !== 'undefined';
  return { isIOS, isSafari, isFirefox, isAndroid, isStandalone, isBrave };
}

function pwaState(){
  try { return JSON.parse(localStorage.getItem(PWA_KEY)||'{}'); } catch { return {}; }
}
function savePwaState(patch){
  try { localStorage.setItem(PWA_KEY, JSON.stringify({...pwaState(),...patch})); } catch {}
}

function shouldShowPrompt(){
  const s = pwaState();
  if(s.neverShow) return false;              // user clicked ✕
  if(!s.snoozeUntil) return true;            // never seen before
  return Date.now() > s.snoozeUntil;         // snooze expired
}

function InstallPrompt(){
  const nativePrompt = usePWAPrompt();
  const [show,   setShow]   = useState(false);
  const [status, setStatus] = useState(null);
  const browser = useBrowserInfo();

  // Show banner when native prompt becomes available
  useEffect(()=>{
    if(nativePrompt && !browser.isStandalone && shouldShowPrompt()) setShow(true);
  },[nativePrompt]);

  useEffect(()=>{
    if(browser.isStandalone) return;

    const onInstalled = ()=>{
      setStatus('installed');
      savePwaState({ neverShow: true });
      setTimeout(()=>setStatus(null), 5000);
    };
    window.addEventListener('appinstalled', onInstalled);

    // iOS / Firefox — show manual guide after delay
    if((browser.isIOS || (browser.isFirefox && browser.isAndroid)) && shouldShowPrompt()){
      const t = setTimeout(()=>setShow(true), 3000);
      return()=>{ window.removeEventListener('appinstalled',onInstalled); clearTimeout(t); };
    }
    return()=>window.removeEventListener('appinstalled',onInstalled);
  },[]);

  const doInstall = async()=>{
    if(!nativePrompt) return;
    setShow(false); setStatus('installing');
    try{
      nativePrompt.prompt();
      const { outcome } = await nativePrompt.userChoice;
      if(outcome==='accepted'){
        setTimeout(()=>setStatus(s=>s==='installing'?'installed':s), 2000);
        setTimeout(()=>setStatus(null), 6000);
        savePwaState({ neverShow: true });
      } else {
        setStatus(null);
        savePwaState({ snoozeUntil: Date.now() + SNOOZE_DAYS * 86400_000 });
      }
    }catch(e){
      console.warn('Install error:',e);
      setStatus('failed');
      setTimeout(()=>setStatus(null), 4000);
      savePwaState({ snoozeUntil: Date.now() + 60*60*1000 });
    }
    _pwaPromptEvent = null;
  };

  const snooze = ()=>{ savePwaState({ snoozeUntil: Date.now()+SNOOZE_DAYS*86400_000 }); setShow(false); };
  const never  = ()=>{ savePwaState({ neverShow:true }); setShow(false); };

  // ── Status toasts (installing / installed / failed) ──────────────
  const StatusToast = status ? (
    <div style={{
      position:'fixed', bottom:64, left:'50%', transform:'translateX(-50%)',
      background:
        status==='installed' ? 'rgba(127,218,150,.97)' :
        status==='failed'    ? 'rgba(240,80,80,.97)'   :
        'rgba(30,40,70,.97)',
      backdropFilter:'blur(8px)',
      border:`1px solid ${status==='installed'?'rgba(127,218,150,.5)':status==='failed'?'rgba(240,80,80,.5)':'rgba(79,156,249,.3)'}`,
      borderRadius:12, padding:'11px 20px',
      display:'flex', alignItems:'center', gap:10,
      zIndex:9999, boxShadow:'0 4px 24px rgba(0,0,0,.4)',
      maxWidth:320, width:'calc(100% - 32px)',
      animation:'slideUp .3s cubic-bezier(.4,0,.2,1) both',
      whiteSpace:'nowrap',
    }}>
      {status==='installing' && <>
        <span style={{fontSize:18,animation:'spin .8s linear infinite',display:'inline-block'}}>⟳</span>
        <span style={{fontSize:13,fontWeight:600,color:'#fff'}}>Installing StudyHub…</span>
      </>}
      {status==='installed' && <>
        <span style={{fontSize:18}}>✅</span>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:'#0d2010'}}>StudyHub installed!</div>
          <div style={{fontSize:11,color:'rgba(0,0,0,.65)'}}>Check your home screen or app drawer</div>
        </div>
      </>}
      {status==='failed' && <>
        <span style={{fontSize:18}}>❌</span>
        <span style={{fontSize:13,fontWeight:600,color:'#fff'}}>Install failed — try again later</span>
      </>}
    </div>
  ) : null;

  if(!show) return StatusToast || null;

  /* ── iOS bottom-sheet guide ── */
  if(browser.isIOS && !nativePrompt){
    return(<>
      {StatusToast}
      <div className="no-print" style={{position:'fixed',bottom:0,left:0,right:0,
        background:'var(--card)',borderTop:'1px solid var(--border)',
        borderRadius:'18px 18px 0 0',padding:'20px 20px 36px',
        zIndex:9900,boxShadow:'0 -8px 40px rgba(0,0,0,.5)',
        animation:'slideUp .35s cubic-bezier(.4,0,.2,1) both'}}>
        {/* Handle bar */}
        <div style={{width:36,height:4,borderRadius:2,background:'var(--border)',margin:'0 auto 16px'}}/>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:40,height:40,borderRadius:10,background:'linear-gradient(135deg,#1a2a4a,#0d1929)',
              border:'1px solid rgba(79,156,249,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>📚</div>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:'var(--text)'}}>Install StudyHub</div>
              <div style={{fontSize:11,color:'var(--muted)'}}>Works offline · Loads faster</div>
            </div>
          </div>
          <button onClick={never} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:20,padding:'4px',lineHeight:1}}>✕</button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:9,marginBottom:16}}>
          {[
            {n:1, icon:'⬆️', html:<>Tap the <strong style={{color:'#4f9cf9'}}>Share</strong> button at the bottom of your screen</>},
            {n:2, icon:'➕', html:<>Scroll down and tap <strong style={{color:'#4f9cf9'}}>Add to Home Screen</strong></>},
            {n:3, icon:'✅', html:<>Tap <strong style={{color:'#4f9cf9'}}>Add</strong> — done!</>},
          ].map(({n,icon,html})=>(
            <div key={n} style={{display:'flex',alignItems:'center',gap:12,
              background:'var(--surface)',borderRadius:10,padding:'11px 14px'}}>
              <span style={{width:26,height:26,borderRadius:'50%',background:'rgba(79,156,249,.12)',
                color:'#4f9cf9',display:'flex',alignItems:'center',justifyContent:'center',
                fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:700,flexShrink:0}}>{n}</span>
              <span style={{fontSize:13,color:'var(--muted)',lineHeight:1.5}}>{html}</span>
            </div>
          ))}
        </div>
        <button onClick={snooze} style={{width:'100%',background:'none',border:'1px solid var(--border)',
          borderRadius:10,color:'var(--muted)',cursor:'pointer',padding:'12px 0',fontSize:13}}>
          Remind me in {SNOOZE_DAYS} days
        </button>
      </div>
    </>);
  }

  /* ── Firefox Android compact tip ── */
  if(browser.isFirefox && browser.isAndroid && !nativePrompt){
    return(<>
      {StatusToast}
      <div className="no-print" style={{position:'fixed',bottom:60,left:12,right:12,
        background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,
        padding:'13px 16px',zIndex:9900,boxShadow:'var(--shadow)',
        display:'flex',alignItems:'center',gap:12,
        animation:'slideUp .3s ease both'}}>
        <span style={{fontSize:22,flexShrink:0}}>📲</span>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:600,color:'var(--text)',marginBottom:3}}>Install StudyHub</div>
          <div style={{fontSize:11,color:'var(--muted)',lineHeight:1.5}}>
            Tap <strong style={{color:'var(--text)'}}>⋮</strong> → <strong style={{color:'var(--text)'}}>Install</strong> or <strong style={{color:'var(--text)'}}>Add to Home Screen</strong>
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:5,flexShrink:0}}>
          <button onClick={never} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:16,lineHeight:1}}>✕</button>
          <button onClick={snooze} style={{background:'none',border:'1px solid var(--border)',borderRadius:5,
            color:'var(--muted)',cursor:'pointer',padding:'3px 7px',fontSize:10}}>Later</button>
        </div>
      </div>
    </>);
  }

  /* ── Chrome / Edge / Samsung / Brave native prompt ── */
  if(!nativePrompt) return StatusToast || null;
  return(<>
    {StatusToast}
    <div className="no-print" style={{position:'fixed',top:14,left:'50%',transform:'translateX(-50%)',
      background:'var(--card)',border:`1px solid ${browser.isBrave?'rgba(249,168,79,.35)':'rgba(79,156,249,.35)'}`,borderRadius:14,
      padding:'13px 18px',display:'flex',alignItems:'center',gap:12,
      zIndex:9900,boxShadow:`0 4px 24px ${browser.isBrave?'rgba(249,168,79,.15)':'rgba(79,156,249,.18)'}`,
      maxWidth:400,width:'calc(100% - 28px)',
      animation:'slideDown .3s ease both'}}>
      <div style={{width:36,height:36,borderRadius:9,background:'linear-gradient(135deg,#1a2a4a,#0d1929)',
        border:`1px solid ${browser.isBrave?'rgba(249,168,79,.3)':'rgba(79,156,249,.3)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>
        {browser.isBrave?'🦁':'📚'}
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:600,color:'var(--text)',marginBottom:1}}>Install StudyHub</div>
        <div style={{fontSize:11,color:'var(--muted)'}}>
          {browser.isBrave?'Brave detected — Shields must be OFF to install':'Works offline · Opens instantly'}
        </div>
      </div>
      <div style={{display:'flex',gap:6,flexShrink:0,alignItems:'center'}}>
        <button onClick={never} title="Don't show again"
          style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:17,padding:'2px',lineHeight:1}}>✕</button>
        <button onClick={snooze}
          style={{background:'none',border:'1px solid var(--border)',borderRadius:7,
            color:'var(--muted)',cursor:'pointer',padding:'6px 10px',fontSize:11}}>Later</button>
        <button onClick={doInstall}
          style={{background:browser.isBrave?'linear-gradient(135deg,#f9a84f,#f97b4f)':'linear-gradient(135deg,#4f9cf9,#7f5ff9)',border:'none',borderRadius:7,
            color:'#fff',cursor:'pointer',padding:'7px 14px',fontSize:12,fontWeight:700}}>Install</button>
      </div>
    </div>
  </>);
}

/* ═══════════════ WELCOME MODAL (first sign-up) ═══════════════ */
function PWADiagnosticPanel({onClose}){
  const[results,setResults]=useState(null);
  const browser=useBrowserInfo();
  const prompt=usePWAPrompt();

  useEffect(()=>{
    async function run(){
      const checks=[];

      // ── Brave Shields (most likely cause) ──────────────────────────
      if(browser.isBrave){
        // Try fetching sw.js — Shields often blocks it with a network error
        let shieldsBlocking=false;
        try{
          const r=await fetch('/sw.js',{cache:'no-store'});
          shieldsBlocking=!r.ok;
        }catch{
          shieldsBlocking=true; // network error = Shields blocked it
        }
        checks.push({
          label:'Brave Shields',
          ok:!shieldsBlocking,
          detail:shieldsBlocking
            ?`⚠️ Brave Shields is blocking the service worker.\n\nFIX: Tap the Brave lion icon in the address bar → toggle "Shields" OFF for this site, then refresh.\n\nThis is the most common reason Brave can't install PWAs.`
            :'Shields not blocking service worker ✓',
        });
      }

      // ── HTTPS ──────────────────────────────────────────────────────
      checks.push({
        label:'HTTPS',
        ok:location.protocol==='https:'||location.hostname==='localhost',
        detail:location.protocol==='https:'?'Served over HTTPS ✓':'Not HTTPS — install requires a secure connection',
      });

      // ── Already installed? ─────────────────────────────────────────
      const isStandalone=window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
      checks.push({
        label:'Already installed?',
        ok:!isStandalone,
        info:true,
        detail:isStandalone?'Running in standalone mode — already installed!':'Not in standalone mode (normal browser tab)',
      });

      // ── Manifest ───────────────────────────────────────────────────
      try{
        const r=await fetch('/manifest.json',{cache:'no-store'});
        const ct=r.headers.get('content-type')||'';
        const j=await r.json();
        const hasName=!!(j.name||j.short_name);
        const hasIcon=j.icons?.length>0;
        const hasStart=!!j.start_url;
        const hasDisplay=['standalone','fullscreen','minimal-ui'].includes(j.display);
        const ok=r.ok&&hasName&&hasIcon&&hasStart&&hasDisplay;
        checks.push({
          label:'Manifest',
          ok,
          detail:`HTTP ${r.status} · ${ct.split(';')[0]}\nname: "${j.name||'MISSING'}" · display: "${j.display||'MISSING'}" · icons: ${j.icons?.length||0} · start_url: "${j.start_url||'MISSING'}"${!ok?' ← missing required field':''}`,
        });
        // Icons reachable?
        for(const icon of (j.icons||[]).slice(0,2)){
          try{
            const ir=await fetch(icon.src,{cache:'no-store'});
            const ict=ir.headers.get('content-type')||'';
            checks.push({
              label:`Icon ${icon.sizes} (${icon.purpose||'any'})`,
              ok:ir.ok&&ict.includes('image'),
              detail:`${icon.src} → HTTP ${ir.status} · ${ict||'no content-type'}`,
            });
          }catch(e){
            checks.push({label:`Icon ${icon.sizes}`,ok:false,detail:`Fetch failed: ${e.message}`});
          }
        }
      }catch(e){
        checks.push({label:'Manifest',ok:false,detail:`Could not fetch: ${e.message}\nBrave Shields may be blocking it.`});
      }

      // ── Service Worker ─────────────────────────────────────────────
      if('serviceWorker' in navigator){
        try{
          const regs=await navigator.serviceWorker.getRegistrations();
          const reg=regs.find(r=>r.scope===location.origin+'/');
          checks.push({
            label:'Service Worker',
            ok:!!reg,
            detail:reg
              ?`Registered ✓\nScope: ${reg.scope}\nState: ${reg.active?.state||reg.installing?.state||reg.waiting?.state||'unknown'}`
              :`Not registered — ${browser.isBrave?'likely blocked by Brave Shields':'check console for registration errors'}`,
          });
        }catch(e){
          checks.push({label:'Service Worker',ok:false,detail:e.message});
        }
      }else{
        checks.push({label:'Service Worker',ok:false,detail:'navigator.serviceWorker not available in this browser'});
      }

      // ── Install prompt ─────────────────────────────────────────────
      // If everything else passes but prompt didn't fire, app is likely already installed
      const everythingElseOk = checks.filter(c=>!c.info).every(c=>c.ok);
      const likelyInstalled  = everythingElseOk && !_pwaPromptEvent && !isStandalone;
      checks.push({
        label:'Install prompt captured',
        ok:!!_pwaPromptEvent||likelyInstalled,
        info:!_pwaPromptEvent&&(browser.isIOS||likelyInstalled),
        detail:_pwaPromptEvent
          ?'beforeinstallprompt captured ✓ — tap 📲 Install App button'
          :likelyInstalled
            ?'App appears already installed in Brave.\n\nBrave puts PWAs in the app drawer, not the home screen.\n\nTo find it:\n1. Swipe up from home → look for StudyHub\n2. Or: Brave ⋮ menu → Installed apps\n3. Long-press the icon → Add to Home Screen'
            :browser.isIOS
              ?'iOS: use Share ⬆️ → Add to Home Screen'
              :browser.isBrave
                ?'Shields may be blocking — turn Shields OFF for this site and refresh'
                :'Not captured — all PWA criteria must be met first',
      });

      // ── Browser info ───────────────────────────────────────────────
      checks.push({
        label:'Browser',
        ok:true,
        info:true,
        detail:`${browser.isBrave?'🦁 Brave':'🌐 Other'} · iOS: ${browser.isIOS} · Android: ${browser.isAndroid} · Standalone: ${isStandalone}\nUA: ${navigator.userAgent.slice(0,100)}`,
      });

      setResults(checks);
    }
    run();
  },[]);

  const allOk=results?.filter(r=>!r.info).every(r=>r.ok);

  return(
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="scale-in modal-inner" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:'24px 26px',maxWidth:520,width:'calc(100% - 24px)',margin:'auto',maxHeight:'85vh',overflowY:'auto',boxShadow:'var(--shadow)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18}}>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:'var(--text)'}}>
            {browser.isBrave?'🦁 Brave PWA Diagnostics':'PWA Install Diagnostics'}
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:20}}>✕</button>
        </div>

        {/* Brave-specific callout — shown before results load */}
        {browser.isBrave&&(
          <div style={{background:'rgba(249,168,79,.08)',border:'1px solid rgba(249,168,79,.3)',borderRadius:10,padding:'13px 16px',marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:700,color:'#f9a84f',marginBottom:6}}>🦁 You're on Brave</div>
            <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.7}}>
              Brave Shields often blocks service workers and manifest files, which prevents PWA install.<br/>
              <strong style={{color:'var(--text)'}}>Before anything else:</strong> tap the <strong style={{color:'#f9a84f'}}>🦁 lion icon</strong> in the address bar and turn <strong style={{color:'#f9a84f'}}>Shields OFF</strong> for this site, then refresh.
            </div>
          </div>
        )}

        {!results&&<div style={{color:'var(--muted)',textAlign:'center',padding:30}}>Running checks…</div>}

        {results&&(()=>{
          const swOk = results.find(r=>r.label==='Service Worker')?.ok;
          const manifestOk = results.find(r=>r.label==='Manifest')?.ok;
          const promptOk = results.find(r=>r.label==='Install prompt captured')?.ok;
          const alreadyInstalled = results.find(r=>r.label==='Already installed?')?.detail?.includes('already installed');
          const everythingReady = swOk && manifestOk && !promptOk;

          return(<>
          {alreadyInstalled&&(
            <div style={{background:'rgba(127,218,150,.08)',border:'1px solid rgba(127,218,150,.3)',borderRadius:10,padding:'13px 16px',marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:'#7fda96',marginBottom:4}}>✅ Already installed!</div>
              <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.7}}>StudyHub is running as a standalone app. You're already installed.</div>
            </div>
          )}

          {everythingReady&&(
            <div style={{background:'rgba(79,156,249,.08)',border:'1px solid rgba(79,156,249,.3)',borderRadius:10,padding:'14px 16px',marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:'#4f9cf9',marginBottom:8}}>
                📲 Everything's ready — install via the browser menu
              </div>
              <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.8,marginBottom:10}}>
                The automatic install prompt won't re-fire because the browser already processed a previous attempt.
                Use the browser menu instead:
              </div>
              {[
                {n:1, text:<>Tap the <strong style={{color:'var(--text)'}}>⋮ three-dot menu</strong> (top-right of Brave)</>},
                {n:2, text:<>Tap <strong style={{color:'#4f9cf9'}}>"Add to Home Screen"</strong> or <strong style={{color:'#4f9cf9'}}>"Install App"</strong></>},
                {n:3, text:<>Tap <strong style={{color:'var(--text)'}}>Add</strong> on the confirmation dialog</>},
                {n:4, text:<>Check your <strong style={{color:'var(--text)'}}>app drawer</strong> (swipe up from home) — it may be there, not on the home screen itself</>},
              ].map(({n,text})=>(
                <div key={n} style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:7}}>
                  <span style={{width:22,height:22,borderRadius:'50%',background:'rgba(79,156,249,.15)',color:'#4f9cf9',fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>{n}</span>
                  <span style={{fontSize:12,color:'var(--muted)',lineHeight:1.6}}>{text}</span>
                </div>
              ))}
              <div style={{marginTop:10,background:'rgba(249,168,79,.08)',border:'1px solid rgba(249,168,79,.2)',borderRadius:7,padding:'9px 12px',fontSize:11,color:'#f9a84f',lineHeight:1.6}}>
                💡 <strong>Already see StudyHub listed somewhere?</strong> It was installed to your <strong>app drawer</strong>. Open Brave, go to your phone's app drawer (swipe up from home screen), scroll or search for "StudyHub" — it should be there.
              </div>
            </div>
          )}

          <div style={{background:allOk?'rgba(127,218,150,.08)':'rgba(136,146,164,.08)',border:`1px solid ${allOk?'rgba(127,218,150,.3)':'var(--border)'}`,borderRadius:9,padding:'10px 14px',marginBottom:14,fontSize:12,color:allOk?'#7fda96':'var(--muted)',fontWeight:600}}>
            {allOk?'✅ All checks passed':'Technical checks complete — see guidance above'}
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {results.map((r,i)=>(
              <div key={i} style={{background:'var(--surface)',border:`1px solid ${r.ok?'rgba(127,218,150,.2)':r.info?'rgba(79,156,249,.2)':'rgba(240,80,80,.3)'}`,borderRadius:9,padding:'10px 13px'}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:r.detail?4:0}}>
                  <span style={{fontSize:14,flexShrink:0}}>{r.ok?'✅':r.info?'ℹ️':'❌'}</span>
                  <span style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{r.label}</span>
                </div>
                {r.detail&&<pre style={{margin:0,fontSize:10,color:'var(--muted)',lineHeight:1.6,whiteSpace:'pre-wrap',wordBreak:'break-all',fontFamily:"'IBM Plex Mono',monospace"}}>{r.detail}</pre>}
              </div>
            ))}
          </div>

          <div style={{marginTop:14,fontSize:11,color:'var(--muted)',lineHeight:1.7,background:'var(--surface)',borderRadius:8,padding:'10px 13px'}}>
            <strong style={{color:'var(--text)'}}>Share this with Yination/Excalibur</strong> — screenshot this panel so they can see exactly what's failing.
          </div>

          <button onClick={()=>{localStorage.removeItem('sh-pwa-v2');alert('PWA state cleared — refresh and try installing again.');}} style={{marginTop:10,width:'100%',background:'rgba(249,168,79,.1)',border:'1px solid rgba(249,168,79,.3)',borderRadius:8,color:'#f9a84f',cursor:'pointer',padding:'9px 0',fontSize:12,fontWeight:600}}>
            🔄 Reset install state (try if stuck)
          </button>

          {/* Already installed — where to find it */}
          {results&&results.filter(c=>!c.info).every(c=>c.ok)&&!_pwaPromptEvent&&(
            <div style={{marginTop:12,background:'rgba(79,156,249,.07)',border:'1px solid rgba(79,156,249,.2)',borderRadius:9,padding:'13px 15px'}}>
              <div style={{fontSize:13,fontWeight:700,color:'#4f9cf9',marginBottom:8}}>📲 App already installed — where to find it on Android</div>
              {[
                {n:'1',text:'Swipe up from your home screen to open the app drawer'},
                {n:'2',text:'Look for StudyHub (blue S icon) — it may take a moment to appear'},
                {n:'3',text:'Long-press it and tap Add to Home Screen to pin it'},
                {n:'🦁',text:'Or: Brave ⋮ menu → Installed apps → StudyHub'},
              ].map((s,i)=>(
                <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:6}}>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:'#4f9cf9',flexShrink:0,minWidth:18}}>{s.n}</span>
                  <span style={{fontSize:12,color:'var(--muted)',lineHeight:1.5}}>{s.text}</span>
                </div>
              ))}
            </div>
          )}
        </>);})()} 
      </div>
    </div>
  );
}

/* ═══════════════ WELCOME MODAL (first sign-up) ═══════════════ */
function WelcomeModal({user,onClose}){
  const[step,setStep]=useState(0);
  const isExternal=user.role===ROLE.EXTERNAL||user.accountType==='external';

  const steps=[
    {
      icon:'🎉',
      title:`Welcome to StudyHub, ${user.displayName}!`,
      body:`We're really glad you're here. StudyHub is your AI-powered study companion — everything you need for your courses, all in one place.`,
      cta:'Next',
    },
    {
      icon:'📚',
      title:'Everything in one place',
      body: isExternal
        ? `You have full access to all course materials across every year. Browse, study, bookmark and use StudyBot whenever you need.`
        : `You're set up as a ${isExternal?'Visitor':'Year '+user.year+' student'}. Browse your courses, track your progress, and use StudyBot to get instant help on any topic.`,
      cta:'Next',
    },
    {
      icon:'🤖',
      title:'Meet StudyBot',
      body:`The 🤖 button in the corner is your AI tutor, powered by Groq. Ask it to explain anything, generate practice questions, or search for a course. It's always on.`,
      cta:'Next',
    },
    {
      icon:'📲',
      title:'Install on your phone',
      body:`StudyHub works as an app too. Look out for the "Install StudyHub" prompt, or on iPhone tap Share → Add to Home Screen. It works offline once installed.`,
      cta:"Let's go →",
    },
  ];

  const current=steps[step];
  const isLast=step===steps.length-1;

  return(
    <div className="modal-overlay" style={{zIndex:9950}} onClick={isLast?onClose:undefined}>
      <div className="scale-in" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:20,
        padding:'36px 32px',maxWidth:440,width:'calc(100% - 32px)',margin:'auto',
        boxShadow:'0 20px 60px rgba(0,0,0,.5)',textAlign:'center'}}>

        {/* Progress dots */}
        <div style={{display:'flex',gap:6,justifyContent:'center',marginBottom:28}}>
          {steps.map((_,i)=>(
            <div key={i} style={{width:i===step?24:7,height:7,borderRadius:4,
              background:i===step?'#4f9cf9':i<step?'rgba(79,156,249,.4)':'var(--border)',
              transition:'all .3s ease'}}/>
          ))}
        </div>

        {/* Icon */}
        <div style={{fontSize:52,marginBottom:16,lineHeight:1}}>{current.icon}</div>

        {/* Title */}
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:'var(--text)',
          marginBottom:12,lineHeight:1.3}}>{current.title}</div>

        {/* Body */}
        <p style={{fontSize:14,color:'var(--muted)',lineHeight:1.7,marginBottom:28,
          maxWidth:340,margin:'0 auto 28px'}}>{current.body}</p>

        {/* CTA */}
        <button onClick={isLast?onClose:()=>setStep(s=>s+1)}
          style={{background:'linear-gradient(135deg,#4f9cf9,#7f5ff9)',border:'none',
            borderRadius:10,color:'#fff',cursor:'pointer',
            padding:'13px 32px',fontSize:14,fontWeight:700,width:'100%',
            boxShadow:'0 4px 16px rgba(79,156,249,.3)'}}>
          {current.cta}
        </button>

        {!isLast&&(
          <button onClick={onClose} style={{background:'none',border:'none',
            color:'var(--muted)',cursor:'pointer',fontSize:12,marginTop:12,
            textDecoration:'underline'}}>Skip intro</button>
        )}
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
const CopyrightBar=()=>{
  const[showDiag,setShowDiag]=useState(false);
  return(<>
    {showDiag&&<PWADiagnosticPanel onClose={()=>setShowDiag(false)}/>}
    <div className="no-print copyright-bar" style={{position:'fixed',bottom:0,left:0,right:0,background:'var(--bg)',borderTop:'1px solid var(--border)',padding:'7px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',zIndex:100,flexWrap:'wrap',gap:6}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontFamily:"'DM Serif Display',serif",fontSize:14,color:'#4f9cf9'}}>StudyHub</span>
        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:'var(--muted)',letterSpacing:1}}>v{APP_VERSION}</span>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:'var(--muted)',letterSpacing:1}}>© {COPYRIGHT_YEAR} · OWNED BY</span>
        <span style={{fontFamily:"'DM Serif Display',serif",fontSize:13,color:'#f9a84f'}}>Yination</span>
        <span style={{color:'var(--muted)',fontSize:10}}>&</span>
        <span style={{fontFamily:"'DM Serif Display',serif",fontSize:13,color:'#f9a84f'}}>Excalibur</span>
        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:'var(--muted)',letterSpacing:1}}>· ALL RIGHTS RESERVED</span>
        <button onClick={()=>setShowDiag(true)} title="PWA diagnostics" style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:9,fontFamily:"'IBM Plex Mono',monospace",opacity:.4,padding:'0 4px',lineHeight:1}}>PWA?</button>
      </div>
    </div>
  </>);
};

/* ═══════════════ SEARCH BAR ═══════════════ */
const SearchBar=({value,onChange,placeholder='Search courses…'})=>(
  <div style={{position:'relative',flex:1}}>
    <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:14,opacity:.5}}>🔍</span>
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:10,padding:'10px 14px 10px 36px',color:'var(--text)',fontSize:13,fontFamily:"'DM Sans',sans-serif"}}/>
  </div>
);

/* ═══════════════ CHATBOT (persistent) ═══════════════ */
const QUICK_PROMPTS=['Explain this topic simply','Give me 5 extra practice questions','What are the most important concepts?','Summarise this in bullet points','What might come up in an exam?'];
const SEARCH_PREFIXES=['find ','search ','what is ','what are ','how do i ','how does ','explain ','show me ','list ','define ','describe '];
const isSearchQuery=t=>SEARCH_PREFIXES.some(p=>t.toLowerCase().startsWith(p))||t.endsWith('?');

function Chatbot({context,courses,user}){
  // Persist open state — remember how the user left it, never force-open
  const[open,setOpen]=useState(()=>{
    try{return localStorage.getItem('sh-bot-open')==='1';}catch{return false;}
  });
  const[minimised,setMinimised]=useState(false);
  const[messages,setMessages]=useState([]);
  const[input,setInput]=useState('');
  const[loading,setLoading]=useState(false);
  const[tab,setTab]=useState('chat');
  const[searchResults,setSearchResults]=useState([]);
  const[searchQ,setSearchQ]=useState('');
  const bottomRef=useRef();const inputRef=useRef();

  const toggleOpen=v=>{const next=v!==undefined?v:!open;setOpen(next);try{localStorage.setItem('sh-bot-open',next?'1':'0');}catch{}};
  const[assignmentCtx,setAssignmentCtx]=useState(null); // set when AI Help clicked

  // Listen for assignment help requests from AssignmentsTab
  useEffect(()=>{
    const h=e=>{
      const ctx=e.detail;
      setAssignmentCtx(ctx);
      setMessages([{role:'assistant',content:`I'm ready to help with the assignment: **${ctx.assignmentTitle}**.\n\nI'll read through it carefully, answer each question step-by-step, and verify my answers.\n\nDescribe the questions you need help with, or paste the assignment text here.`}]);
      setTab('chat');
      toggleOpen(true);
    };
    window.addEventListener('sh-open-bot-assignment',h);
    return()=>window.removeEventListener('sh-open-bot-assignment',h);
  },[]);

  const getWelcome=()=>{
    if(context?.chapterTitle) return `Hi! I can see you're studying **${context.chapterTitle}**. Ask me anything — or search for a course below. 🎓`;
    return `Hi${user?.displayName?' '+user.displayName:''}! I'm StudyBot. Ask me anything, search for courses, or explore topics across all your courses. 🎓`;
  };

  useEffect(()=>{
    if(open&&messages.length===0) setMessages([{role:'assistant',content:getWelcome()}]);
  },[open]);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'});},[messages,loading]);
  useEffect(()=>{if(open&&!minimised)setTimeout(()=>inputRef.current?.focus(),120);},[open,minimised]);
  useEffect(()=>{setMessages([]);},[context?.chapterTitle]);

  // Course search
  const doSearch=q=>{
    if(!q.trim()){setSearchResults([]);return;}
    const lq=q.toLowerCase();
    const res=(courses||[]).filter(c=>
      c.chapterTitle.toLowerCase().includes(lq)||
      c.courseName.toLowerCase().includes(lq)
    ).slice(0,8);
    setSearchResults(res);
  };

  useEffect(()=>{doSearch(searchQ);},[searchQ,courses]);

  const send=async text=>{
    const msg=text||input.trim();
    if(!msg||loading)return;
    setInput('');

    // If it looks like a search query, also show search results
    if(isSearchQuery(msg)){
      doSearch(msg);
      if(searchResults.length>0) setTab('search');
    }

    const next=[...messages,{role:'user',content:msg}];
    setMessages(next);setLoading(true);
    try{
      const ctx = assignmentCtx
        ? {...assignmentCtx}
        : {...context,courseName:context?.courseName,chapterTitle:context?.chapterTitle,allCourses:courses?.map(c=>c.chapterTitle+' ('+c.courseName+')').join(', ')};
      const reply=await sendChatMessage(next.filter(m=>m.role!=='system'),ctx);
      setMessages(m=>[...m,{role:'assistant',content:reply}]);
    }catch{
      setMessages(m=>[...m,{role:'assistant',content:'Sorry, something went wrong. Please try again.'}]);
    }
    setLoading(false);
  };

  if(!open) return(
    <button onClick={()=>toggleOpen(true)} className="no-print chatbot-btn" title="Open StudyBot"
      style={{position:'fixed',bottom:58,right:16,width:50,height:50,borderRadius:'50%',border:'none',cursor:'pointer',zIndex:200,background:'linear-gradient(135deg,#4f9cf9,#7f5ff9)',boxShadow:'0 4px 20px rgba(79,156,249,.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>
      🤖
    </button>
  );

  return(
    <div className="no-print chatbot-panel" style={{position:'fixed',bottom:58,right:10,width:'min(370px, calc(100vw - 20px))',maxHeight:minimised?52:'72vh',background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,display:'flex',flexDirection:'column',zIndex:200,overflow:'hidden',boxShadow:'var(--shadow)',transition:'max-height .3s ease'}}>
      {/* Header */}
      <div style={{padding:'10px 14px',borderBottom:minimised?'none':'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',background:'linear-gradient(135deg,rgba(79,156,249,.08),rgba(127,95,249,.08))',flexShrink:0,cursor:'pointer'}} onClick={()=>setMinimised(m=>!m)}>
        <div style={{display:'flex',alignItems:'center',gap:9}}>
          <div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#4f9cf9,#7f5ff9)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>🤖</div>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:'var(--text)',lineHeight:1}}>StudyBot</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:assignmentCtx?'#f9a84f':'#4f9cf9',letterSpacing:1}}>
              {assignmentCtx?'📋 ASSIGNMENT MODE · GROQ':'AI TUTOR · GROQ'}
            </div>
          </div>
          {context?.chapterTitle&&!minimised&&<div style={{background:'rgba(79,156,249,.1)',border:'1px solid rgba(79,156,249,.2)',borderRadius:4,padding:'2px 7px',fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:'#4f9cf9',maxWidth:110,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{context.chapterTitle}</div>}
        </div>
        <div style={{display:'flex',gap:4,alignItems:'center'}}>
          <button onClick={e=>{e.stopPropagation();setMessages([]);setAssignmentCtx(null);}} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:10,fontFamily:"'IBM Plex Mono',monospace",padding:'2px 6px'}} title="Clear">CLR</button>
          <button onClick={e=>{e.stopPropagation();setMinimised(m=>!m);}} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:16,padding:'0 3px',lineHeight:1}}>{minimised?'▲':'▼'}</button>
          <button onClick={e=>{e.stopPropagation();toggleOpen(false);}} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:16,padding:'0 3px',lineHeight:1}}>✕</button>
        </div>
      </div>

      {!minimised&&<>
        {/* Tabs */}
        <div style={{display:'flex',borderBottom:'1px solid var(--border)',flexShrink:0}}>
          {[{id:'chat',label:'💬 Chat'},{id:'search',label:`🔍 Search${searchResults.length>0?' ('+searchResults.length+')':''}`}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:'7px 0',border:'none',borderBottom:tab===t.id?'2px solid #4f9cf9':'2px solid transparent',background:'none',color:tab===t.id?'#4f9cf9':'var(--muted)',cursor:'pointer',fontSize:12,fontWeight:tab===t.id?600:400}}>{t.label}</button>
          ))}
        </div>

        {/* Chat panel */}
        {tab==='chat'&&<>
          <div style={{flex:1,overflowY:'auto',padding:'12px 12px 6px'}}>
            {messages.map((m,i)=>(
              <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start',marginBottom:9}}>
                {m.role==='assistant'&&<div style={{width:22,height:22,borderRadius:'50%',background:'linear-gradient(135deg,#4f9cf9,#7f5ff9)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,flexShrink:0,marginRight:6,marginTop:2}}>🤖</div>}
                <div style={{maxWidth:'80%',background:m.role==='user'?'linear-gradient(135deg,#4f9cf9,#7f5ff9)':'var(--surface)',color:m.role==='user'?'#fff':'var(--text)',borderRadius:m.role==='user'?'13px 13px 3px 13px':'13px 13px 13px 3px',padding:'8px 12px',fontSize:12.5,lineHeight:1.65,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{m.content}</div>
              </div>
            ))}
            {loading&&<div style={{display:'flex',alignItems:'center',gap:7,marginBottom:9}}><div style={{width:22,height:22,borderRadius:'50%',background:'linear-gradient(135deg,#4f9cf9,#7f5ff9)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11}}>🤖</div><div style={{background:'var(--surface)',borderRadius:'13px 13px 13px 3px',padding:'9px 14px',display:'flex',gap:5,alignItems:'center'}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:'50%',background:'#4f9cf9',animation:`blink 1.2s ease ${i*.2}s infinite`}}/>)}</div></div>}
            <div ref={bottomRef}/>
          </div>
          {messages.length<=1&&<div style={{padding:'4px 10px 6px',display:'flex',gap:5,flexWrap:'wrap'}}>
            {(assignmentCtx?[
              'Solve all questions step by step',
              'What does this question require?',
              'Check my answer for errors',
              'Explain the marking criteria',
            ]:QUICK_PROMPTS).map((p,i)=>(
              <button key={i} onClick={()=>send(p)} style={{background:assignmentCtx?'rgba(249,168,79,.07)':'rgba(79,156,249,.07)',border:`1px solid ${assignmentCtx?'rgba(249,168,79,.2)':'rgba(79,156,249,.18)'}`,borderRadius:20,color:assignmentCtx?'#f9a84f':'#4f9cf9',cursor:'pointer',padding:'3px 9px',fontSize:10}}>{p}</button>
            ))}
          </div>}
        </>}

        {/* Search panel */}
        {tab==='search'&&<div style={{flex:1,overflowY:'auto',padding:'10px'}}>
          <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search courses, topics, keywords…"
            style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:9,padding:'8px 12px',color:'var(--text)',fontSize:13,marginBottom:10,fontFamily:"'DM Sans',sans-serif"}}
            autoFocus/>
          {searchResults.length===0&&searchQ&&<div style={{color:'var(--muted)',textAlign:'center',padding:20,fontSize:12}}>No courses match "{searchQ}"</div>}
          {searchResults.length===0&&!searchQ&&<div style={{color:'var(--muted)',textAlign:'center',padding:20,fontSize:12}}>Type to search across all courses</div>}
          {searchResults.map(c=>(
            <div key={c.id} onClick={()=>{setTab('chat');send(`Tell me about ${c.chapterTitle} from ${c.courseName}`);}} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:9,padding:'10px 13px',marginBottom:8,cursor:'pointer'}}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#4f9cf970'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:YEAR_COLORS[c.year]||'#4f9cf9',marginBottom:3}}>Yr {c.year} · Sem {c.semester||1} · {DEPT_SHORT[c.department]||'CS'}</div>
              <div style={{fontSize:13,fontWeight:600,color:'var(--text)',marginBottom:2}}>{c.chapterTitle}</div>
              <div style={{fontSize:11,color:'var(--muted)'}}>{c.courseName} · {c.qCount} questions</div>
            </div>
          ))}
        </div>}

        {/* Input */}
        <div style={{padding:'8px 10px',borderTop:'1px solid var(--border)',display:'flex',gap:7,alignItems:'flex-end',flexShrink:0}}>
          <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder={tab==='search'?'Ask about a course or topic…':'Ask anything… (Enter to send)'}
            rows={1} style={{flex:1,background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:10,padding:'7px 10px',color:'var(--text)',fontSize:12.5,fontFamily:"'DM Sans',sans-serif",resize:'none',maxHeight:80,lineHeight:1.5}}/>
          <button onClick={()=>send()} disabled={!input.trim()||loading}
            style={{width:36,height:36,borderRadius:'50%',border:'none',flexShrink:0,background:!input.trim()||loading?'var(--border)':'linear-gradient(135deg,#4f9cf9,#7f5ff9)',color:!input.trim()||loading?'var(--muted)':'#fff',cursor:!input.trim()||loading?'not-allowed':'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>↑</button>
        </div>
      </>}
    </div>
  );
}

/* ═══════════════ AUTH SCREEN ═══════════════ */
function AuthScreen({onLogin,onGuest,dark,toggleTheme}){
  const[tab,setTab]=useState('signin');
  const[f,setF]=useState({username:'',password:'',confirm:'',year:3,accountType:'student'});
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
      onLogin({username:user.username,displayName:user.display_name||user.username,year:user.year,role,accountType:user.account_type||'student'});
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
      const isExternal = f.accountType==='external';
      const nu={username:f.username,pw_hash:hashStr(f.password),display_name:f.username,year:isExternal?0:f.year,account_type:isExternal?'external':'student',created_at:new Date().toISOString()};
      await dbSaveUser(nu);
      onLogin({username:nu.username,displayName:nu.display_name,year:nu.year,role:isExternal?ROLE.EXTERNAL:ROLE.USER,isNew:true});
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
              <Field label="PASSWORD" type="password" value={f.password} onChange={e=>set('password',e.target.value)} placeholder="••••••••" error={errs.password} onKeyDown={e=>e.key==='Enter'&&signIn()}/>
              <button onClick={signIn} disabled={loading} style={{width:'100%',background:loading?'var(--border)':'#4f9cf9',border:'none',borderRadius:8,color:loading?'var(--muted)':'#000',cursor:loading?'not-allowed':'pointer',padding:'12px 0',fontSize:14,fontWeight:700,marginTop:4}}>
                {loading?'Signing in…':'Sign In'}
              </button>
            </div>
          ):(
            <div className="fade-in">
              {/* Account type */}
              <div style={{marginBottom:18}}>
                <div style={{fontSize:11,color:'var(--muted)',marginBottom:8,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>ACCOUNT TYPE</div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>set('accountType','student')} style={{flex:1,padding:'10px 8px',borderRadius:8,cursor:'pointer',border:`1px solid ${f.accountType==='student'?'#4f9cf970':'var(--border)'}`,background:f.accountType==='student'?'rgba(79,156,249,.1)':'var(--input-bg)',color:f.accountType==='student'?'#4f9cf9':'var(--muted)',fontWeight:f.accountType==='student'?700:400,fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>
                    <span>🎓</span> Enrolled Student
                  </button>
                  <button onClick={()=>set('accountType','external')} style={{flex:1,padding:'10px 8px',borderRadius:8,cursor:'pointer',border:`1px solid ${f.accountType==='external'?'#a8f94f70':'var(--border)'}`,background:f.accountType==='external'?'rgba(168,249,79,.1)':'var(--input-bg)',color:f.accountType==='external'?'#a8f94f':'var(--muted)',fontWeight:f.accountType==='external'?700:400,fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>
                    <span>🌐</span> External / Visitor
                  </button>
                </div>
                {f.accountType==='external'&&(
                  <div style={{background:'rgba(168,249,79,.06)',border:'1px solid rgba(168,249,79,.2)',borderRadius:7,padding:'8px 12px',marginTop:8,fontSize:11,color:'#a8f94f',lineHeight:1.6}}>
                    Full read access to all years &amp; courses. No year required. Progress is saved to your account.
                  </div>
                )}
              </div>

              <Field label="USERNAME" value={f.username} onChange={e=>set('username',e.target.value)} placeholder="min 3 chars, no spaces" error={errs.username}/>
              <Field label="PASSWORD" type="password" value={f.password} onChange={e=>set('password',e.target.value)} placeholder="min 6 characters" error={errs.password}/>
              <Field label="CONFIRM PASSWORD" type="password" value={f.confirm} onChange={e=>set('confirm',e.target.value)} placeholder="repeat password" error={errs.confirm}/>

              {/* Year picker — only for enrolled students */}
              {f.accountType==='student'&&(
                <div style={{marginBottom:18}}>
                  <div style={{fontSize:11,color:'var(--muted)',marginBottom:8,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>YOUR YEAR</div>
                  <div style={{display:'flex',gap:8}}>
                    {YEARS.map(y=><button key={y} onClick={()=>set('year',y)} style={{flex:1,padding:'10px 0',borderRadius:8,cursor:'pointer',border:`1px solid ${f.year===y?YEAR_COLORS[y]+'70':'var(--border)'}`,background:f.year===y?YEAR_BG[y]:'var(--input-bg)',color:f.year===y?YEAR_COLORS[y]:'var(--muted)',fontWeight:f.year===y?700:400,fontSize:13}}>Yr {y}</button>)}
                  </div>
                </div>
              )}

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
/* File format definitions */
const FILE_TYPES = [
  {ext:['docx','doc'],   label:'Word Doc',  icon:'📝', accept:'.doc,.docx',     color:'#4f9cf9'},
  {ext:['txt','md'],     label:'Text / MD', icon:'📃', accept:'.txt,.md',       color:'#7fda96'},
  {ext:['png','jpg','jpeg','webp'], label:'Image', icon:'🖼', accept:'.png,.jpg,.jpeg,.webp', color:'#da7ff0'},
  {ext:['csv'],          label:'CSV',       icon:'📋', accept:'.csv',           color:'#4ff9e4'},
];

const ALL_ACCEPT = FILE_TYPES.map(t=>t.accept).join(',');

function getFileType(filename){
  const ext = filename.split('.').pop().toLowerCase();
  return FILE_TYPES.find(t=>t.ext.includes(ext));
}

/* Client-side text extraction */
async function extractText(file){
  const ext = file.name.split('.').pop().toLowerCase();

  // Plain text formats
  if(['txt','md','csv'].includes(ext)){
    return new Promise((res,rej)=>{
      const r=new FileReader();
      r.onload=e=>res(e.target.result);
      r.onerror=()=>rej(new Error('Could not read file'));
      r.readAsText(file);
    });
  }

  // JSON
  if(ext==='json'){
    const text = await new Promise((res,rej)=>{
      const r=new FileReader();r.onload=e=>res(e.target.result);r.onerror=()=>rej(new Error('Read failed'));r.readAsText(file);
    });
    // Try parsing as existing StudyHub JSON first
    try{
      const parsed=JSON.parse(text);
      if(parsed.chapterTitle) return '__STUDYHUB_JSON__:'+text;
    }catch{}
    return text;
  }

  // PDF — extract using PDF.js
  if(ext==='pdf'){
    const arrayBuffer = await file.arrayBuffer();
    if(typeof window.pdfjsLib === 'undefined'){
      // Load PDF.js dynamically
      await new Promise((res,rej)=>{
        const s=document.createElement('script');
        s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        s.onload=res;s.onerror=rej;document.head.appendChild(s);
      });
      window.pdfjsLib.GlobalWorkerOptions.workerSrc=
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    const pdf = await window.pdfjsLib.getDocument({data:arrayBuffer}).promise;
    let text='';
    for(let i=1;i<=Math.min(pdf.numPages,80);i++){
      const page=await pdf.getPage(i);
      const content=await page.getTextContent();
      text+=content.items.map(s=>s.str).join(' ')+'\n';
    }
    if(text.trim().length < 100) return '__IMAGE_NEEDED__'; // Scanned PDF — fall through to vision
    return text;
  }

  // DOCX — extract using mammoth
  if(['doc','docx'].includes(ext)){
    const arrayBuffer = await file.arrayBuffer();
    if(typeof window.mammoth === 'undefined'){
      await new Promise((res,rej)=>{
        const s=document.createElement('script');
        s.src='https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
        s.onload=res;s.onerror=rej;document.head.appendChild(s);
      });
    }
    const result = await window.mammoth.extractRawText({arrayBuffer});
    return result.value;
  }

  // Images and everything else — base64 for vision
  return '__USE_VISION__';
}

async function toBase64(file){
  return new Promise((res,rej)=>{
    const r=new FileReader();
    r.onload=e=>res(e.target.result.split(',')[1]);
    r.onerror=()=>rej(new Error('Read failed'));
    r.readAsDataURL(file);
  });
}

const JSON_PROMPT=`Generate a StudyHub JSON study guide for this document.
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

/* Format descriptions shown in the info card when a chip is selected */
const FORMAT_INFO = {
  'Word Doc': {
    desc: 'Microsoft Word documents (.docx). Great for notes, assignments, and handouts from Word or Google Docs.',
    how:  'From Google Docs: File → Download → .docx. From Word: File → Save As → .docx.',
  },
  'Text / MD': {
    desc: 'Plain text (.txt) or Markdown (.md). Good for notes, outlines, or content copied from anywhere.',
    how:  'Paste your notes into Notepad/TextEdit and save as .txt, or export from any Markdown editor.',
  },
  'Image': {
    desc: 'PNG, JPG, JPEG, or WebP images. Upload a photo of a whiteboard, handwritten notes, or a scanned page.',
    how:  'Take a clear photo with your phone, or screenshot any document. AI reads the text automatically.',
  },
  'CSV': {
    desc: 'Comma-separated values. Good for tables of definitions, data sets, or structured study material.',
    how:  'From Excel or Google Sheets: File → Download → .csv.',
  },
};

function UploadModal({onClose,onDone,adminMode=false,requestedBy=''}){
  const[uploadMode,setUploadMode]=useState('file'); // 'file' | 'paste'
  const[year,setYear]=useState(1);
  const[semester,setSemester]=useState(1);
  const[departments,setDepartments]=useState(['Computer Science']); // multi-select array
  const[pasteText,setPasteText]=useState('');
  const[file,setFile]=useState(null);
  const[status,setStatus]=useState('idle');
  const[progress,setProgress]=useState('');
  const[error,setError]=useState('');
  const[copied,setCopied]=useState(false);
  const[smartSortMsg,setSmartSortMsg]=useState('');
  const[activeFilter,setActiveFilter]=useState('All');
  const[filterInfo,setFilterInfo]=useState(null);
  const fileRef=useRef();

  const copyPrompt=()=>{navigator.clipboard.writeText(JSON_PROMPT);setCopied(true);setTimeout(()=>setCopied(false),2000);};

  const saveEntry=async(data,autoDetected)=>{
    if(!data.chapterTitle) throw new Error('Missing chapterTitle in response');
    const finalYear     = autoDetected?.year      || year;
    const finalSemester = autoDetected?.semester  || semester;
    // Multi-dept: use detected dept if auto, otherwise use all selected
    const finalDepts = autoDetected?.department
      ? [autoDetected.department]
      : departments.length>0 ? departments : ['Computer Science'];

    if(autoDetected?.year)      setYear(autoDetected.year);
    if(autoDetected?.semester)  setSemester(autoDetected.semester);
    if(autoDetected?.department)setDepartments([autoDetected.department]);

    // Save one entry per selected department
    for(const dept of finalDepts){
      const id=`c-${Date.now()}-${dept.slice(0,3)}`;
      const entry={id,year:finalYear,semester:finalSemester,department:dept,
        courseName:data.courseName||'Course',chapterTitle:data.chapterTitle,
        conceptCount:data.keyConcepts?.length||0,termCount:data.definitions?.length||0,
        qCount:data.questions?.length||0,addedAt:new Date().toLocaleDateString()};
      if(adminMode){
        await onDone(null,entry,data);
      } else {
        await dbSaveCourse(entry,data);
      }
    }
    if(!adminMode){
      const idx=await dbLoadCourseIndex();
      setTimeout(()=>onDone(idx),600);
    }
    setStatus('done');
  };

  const processFile=async()=>{
    if(!file) return;
    setStatus('processing');setError('');
    try{
      setProgress(`Reading ${file.name}…`);
      const text = await extractText(file);

      // Already valid StudyHub JSON
      if(text.startsWith('__STUDYHUB_JSON__:')){
        const data=JSON.parse(text.replace('__STUDYHUB_JSON__:',''));
        setProgress('Saving course…');
        await saveEntry(data); return;
      }

      // Needs vision model
      const useVision = text==='__USE_VISION__' || text==='__IMAGE_NEEDED__';
      setProgress(useVision?'Sending to AI vision model…':'Sending to AI…');

      let body;
      if(useVision){
        const b64=await toBase64(file);
        body={imageBase64:b64,mimeType:file.type||'image/png'};
      } else {
        body={text};
      }

      const res=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e.error||`Server error ${res.status}`);}
      const data=await res.json();

      // Smart classification routing
      const contentType=data._type||'course';
      if(contentType==='assignment'){
        setProgress('Assignment detected — saving…');
        setSmartSortMsg('📋 Detected as Assignment — saved to Assignments tab');
        // Save as assignment entry using detected course if possible
        await onDone?.(null,null,null,{type:'assignment',data});
        setStatus('done');return;
      }
      if(contentType==='ca'){
        setProgress('CA/Test detected — saving…');
        setSmartSortMsg('📝 Detected as CA/Test — saved to CA tab');
        await onDone?.(null,null,null,{type:'ca',data});
        setStatus('done');return;
      }
      if(contentType==='resource'){
        setProgress('Resource detected — saving…');
        setSmartSortMsg('🔗 Detected as Resource — add it via the Resources tab');
        setStatus('done');return;
      }

      setProgress('Applying smart sort…');
      const detected=detectMetadata(data);
      if(detected.year||detected.department||detected.semester){
        setSmartSortMsg(`✨ Smart sort: ${[detected.year?`Year ${detected.year}`:'',detected.semester?`Sem ${detected.semester}`:'',detected.department?DEPT_SHORT[detected.department]:''].filter(Boolean).join(' · ')}`);
      }
      setProgress('Saving course…');
      await saveEntry(data,detected);
    }catch(e){setError('Failed: '+e.message);setStatus('idle');setProgress('');}
  };

  const processPaste=async()=>{
    setError('');setSmartSortMsg('');
    try{
      const data=JSON.parse(pasteText.replace(/```json|```/g,'').trim());
      if(!data.chapterTitle) throw new Error('Missing chapterTitle');
      setStatus('processing');setProgress('Applying smart sort…');
      const detected=detectMetadata(data);
      if(detected.year||detected.department||detected.semester){
        setSmartSortMsg(`✨ Smart sort: ${[detected.year?`Year ${detected.year}`:'',detected.semester?`Sem ${detected.semester}`:'',detected.department?DEPT_SHORT[detected.department]:''].filter(Boolean).join(' · ')}`);
      }
      setProgress('Saving course…');
      await saveEntry(data,detected);
    }catch(e){setError('Invalid JSON: '+e.message);setStatus('idle');}
  };

  const fileType = file ? getFileType(file.name) : null;
  const canGo = status!=='processing'&&status!=='done'&&departments.length>0&&(uploadMode==='file'?!!file:!!pasteText.trim());

  return(
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="scale-in modal-inner upload-modal" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:'28px 32px',maxWidth:560,width:'100%',margin:'auto',boxShadow:'var(--shadow)',maxHeight:'90vh',overflowY:'auto'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
          <Logo onClick={null} size="sm"/>
          <div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:'var(--text)'}}>{adminMode?'Request New Course':'Add Course'}</div>
            {adminMode&&<div style={{fontSize:11,color:'#da7ff0',marginTop:2}}>🛡 Requires superuser approval</div>}
          </div>
        </div>

        {/* Mode toggle */}
        <div style={{display:'flex',background:'var(--input-bg)',borderRadius:10,padding:4,marginBottom:20}}>
          {[{id:'file',label:'📁 Upload File'},{id:'paste',label:'📋 Paste JSON'}].map(m=>(
            <button key={m.id} onClick={()=>{setUploadMode(m.id);setError('');setStatus('idle');setProgress('');}} style={{flex:1,padding:'8px 0',borderRadius:7,border:'none',background:uploadMode===m.id?'var(--surface)':'none',color:uploadMode===m.id?'var(--text)':'var(--muted)',cursor:'pointer',fontSize:13,fontWeight:uploadMode===m.id?600:400}}>{m.label}</button>
          ))}
        </div>

        {/* Year / Semester / Dept pickers */}
        <div className="year-picker-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:18}}>
          <div>
            <Mono color="var(--muted)" size={10}>YEAR</Mono>
            <div style={{display:'flex',gap:6,marginTop:6}}>
              {YEARS.map(y=><button key={y} onClick={()=>setYear(y)} style={{flex:1,padding:'7px 0',borderRadius:7,cursor:'pointer',border:`1px solid ${year===y?YEAR_COLORS[y]+'70':'var(--border)'}`,background:year===y?YEAR_BG[y]:'var(--input-bg)',color:year===y?YEAR_COLORS[y]:'var(--muted)',fontWeight:year===y?700:400,fontSize:12}}>{y}</button>)}
            </div>
          </div>
          <div>
            <Mono color="var(--muted)" size={10}>SEMESTER</Mono>
            <div style={{display:'flex',gap:6,marginTop:6}}>
              {[1,2].map(s=><button key={s} onClick={()=>setSemester(s)} style={{flex:1,padding:'7px 0',borderRadius:7,cursor:'pointer',border:`1px solid ${semester===s?YEAR_COLORS[year]+'70':'var(--border)'}`,background:semester===s?YEAR_BG[year]:'var(--input-bg)',color:semester===s?YEAR_COLORS[year]:'var(--muted)',fontWeight:semester===s?700:400,fontSize:12}}>Sem {s}</button>)}
            </div>
          </div>
        </div>
        <div style={{marginBottom:18}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
            <Mono color="var(--muted)" size={10}>DEPARTMENT</Mono>
            {departments.length>1&&(
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:'#4f9cf9',letterSpacing:1}}>
                {departments.length} SELECTED — course added to each
              </span>
            )}
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {DEPARTMENTS.map(d=>{
              const active=departments.includes(d);
              const col=DEPT_COLOR[d]||'#4f9cf9';
              return(
                <button key={d} onClick={()=>setDepartments(prev=>
                  prev.includes(d) ? prev.filter(x=>x!==d).length===0 ? prev : prev.filter(x=>x!==d) : [...prev,d]
                )}
                  style={{padding:'8px 12px',borderRadius:8,cursor:'pointer',
                    border:`1.5px solid ${active?col:col+'30'}`,
                    background:active?`${col}14`:'var(--input-bg)',
                    color:active?col:'var(--muted)',
                    fontWeight:active?700:400,fontSize:12,
                    display:'flex',alignItems:'center',gap:7,
                    transition:'all .15s',position:'relative'}}>
                  {active&&<span style={{fontSize:10,lineHeight:1}}>✓</span>}
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,
                    background:active?`${col}25`:'var(--border)',
                    color:active?col:'var(--muted)',borderRadius:3,padding:'1px 5px'}}>{DEPT_SHORT[d]}</span>
                  <span style={{fontSize:11}}>{d}</span>
                </button>
              );
            })}
          </div>
          {departments.length===0&&(
            <div style={{fontSize:11,color:'#f05050',marginTop:5}}>Select at least one department</div>
          )}
          {departments.length>1&&(
            <div style={{fontSize:11,color:'#4f9cf9',marginTop:6,display:'flex',alignItems:'center',gap:5}}>
              <span>ℹ️</span>
              <span>This course will appear under <strong>{departments.map(d=>DEPT_SHORT[d]||d).join(' and ')}</strong> — one copy per department.</span>
            </div>
          )}
        </div>

        {/* FILE MODE */}
        {uploadMode==='file'&&(
          <div className="fade-in">

            {/* ── Gemini-style format chip bar ── */}
            <div style={{marginBottom:16}}>
              <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
                {[{label:'All',icon:'📂',color:'#8892a4',filter:null},...FILE_TYPES.map(t=>({...t,filter:t.ext}))].map(t=>{
                  const active=activeFilter===t.label;
                  return(
                    <button key={t.label} onClick={()=>{
                      setActiveFilter(t.label);
                      // Show info tooltip
                      setFilterInfo(t.label==='All'?null:t);
                    }}
                      style={{display:'flex',alignItems:'center',gap:5,
                        background:active?`${t.color}18`:'var(--input-bg)',
                        border:`1.5px solid ${active?t.color:t.color+'30'}`,
                        borderRadius:20,padding:'5px 12px',cursor:'pointer',
                        transition:'all .15s',outline:'none'}}>
                      <span style={{fontSize:14}}>{t.icon}</span>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,
                        color:active?t.color:'var(--muted)',fontWeight:active?700:400,
                        letterSpacing:.5}}>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Format info card — shows when a specific chip is selected */}
              {filterInfo&&(
                <div className="fade-in" style={{marginTop:10,background:`${filterInfo.color}08`,
                  border:`1px solid ${filterInfo.color}25`,borderRadius:10,padding:'11px 14px',
                  display:'flex',gap:12,alignItems:'flex-start'}}>
                  <span style={{fontSize:24,flexShrink:0}}>{filterInfo.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:filterInfo.color,marginBottom:3}}>
                      {filterInfo.label}
                    </div>
                    <div style={{fontSize:11,color:'var(--muted)',lineHeight:1.6}}>
                      {FORMAT_INFO[filterInfo.label]?.desc}
                    </div>
                    <div style={{marginTop:6,display:'flex',gap:6,flexWrap:'wrap'}}>
                      {filterInfo.ext.map(e=>(
                        <span key={e} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,
                          background:`${filterInfo.color}15`,color:filterInfo.color,
                          borderRadius:4,padding:'2px 7px'}}>
                          .{e}
                        </span>
                      ))}
                    </div>
                    <div style={{marginTop:6,fontSize:11,color:'var(--muted)',fontStyle:'italic'}}>
                      {FORMAT_INFO[filterInfo.label]?.how}
                    </div>
                  </div>
                  <button onClick={()=>setFilterInfo(null)}
                    style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:16,lineHeight:1,flexShrink:0}}>✕</button>
                </div>
              )}
            </div>

            {/* Drop zone */}
            <div
              onClick={()=>fileRef.current?.click()}
              onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor='#4f9cf9';e.currentTarget.style.background='rgba(79,156,249,.05)';}}
              onDragLeave={e=>{e.currentTarget.style.borderColor='';e.currentTarget.style.background='';}}
              onDrop={e=>{
                e.preventDefault();
                e.currentTarget.style.borderColor='';e.currentTarget.style.background='';
                const f=e.dataTransfer.files[0];
                if(f){setFile(f);setError('');
                  // Auto-select matching chip
                  const ext=f.name.split('.').pop().toLowerCase();
                  const match=FILE_TYPES.find(t=>t.ext.includes(ext));
                  if(match){setActiveFilter(match.label);setFilterInfo(match);}
                }
              }}
              style={{border:`2px dashed ${file?YEAR_COLORS[year]+'80':'var(--border)'}`,
                borderRadius:12,padding:'28px 20px',textAlign:'center',cursor:'pointer',
                background:file?YEAR_BG[year]:'var(--input-bg)',
                transition:'border-color .15s,background .15s',marginBottom:8}}
            >
              {file?(
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12}}>
                  <div style={{width:44,height:44,borderRadius:10,
                    background:`${fileType?.color||'#4f9cf9'}15`,
                    border:`1px solid ${fileType?.color||'#4f9cf9'}30`,
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>
                    {fileType?.icon||'📄'}
                  </div>
                  <div style={{textAlign:'left',flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:'var(--text)',
                      overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{file.name}</div>
                    <div style={{fontSize:11,color:'var(--muted)',marginTop:2,display:'flex',gap:8}}>
                      <span>{(file.size/1024).toFixed(1)} KB</span>
                      <span style={{color:fileType?.color||'#4f9cf9',fontFamily:"'IBM Plex Mono',monospace",fontSize:9}}>{fileType?.label||'File'}</span>
                    </div>
                  </div>
                  <button onClick={e=>{e.stopPropagation();setFile(null);setActiveFilter('All');setFilterInfo(null);}}
                    style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:18,flexShrink:0}}>✕</button>
                </div>
              ):(
                <>
                  <div style={{fontSize:36,marginBottom:10}}>
                    {activeFilter==='All'?'📂':FILE_TYPES.find(t=>t.label===activeFilter)?.icon||'📂'}
                  </div>
                  <div style={{fontSize:13,color:'var(--text)',fontWeight:600,marginBottom:4}}>
                    {activeFilter==='All'?'Click to browse or drag & drop':
                     `Select a ${activeFilter} file`}
                  </div>
                  <div style={{fontSize:11,color:'var(--muted)'}}>
                    {activeFilter==='All'
                      ? FILE_TYPES.map(t=>t.ext[0].toUpperCase()).join(' · ')
                      : FILE_TYPES.find(t=>t.label===activeFilter)?.ext.map(e=>'.'+e).join(', ')}
                  </div>
                </>
              )}
              <input ref={fileRef} type="file"
                accept={activeFilter==='All'?ALL_ACCEPT:(FILE_TYPES.find(t=>t.label===activeFilter)?.accept||ALL_ACCEPT)}
                onChange={e=>{
                  const f=e.target.files[0];
                  if(f){
                    setFile(f);setError('');
                    const ext=f.name.split('.').pop().toLowerCase();
                    const match=FILE_TYPES.find(t=>t.ext.includes(ext));
                    if(match){setActiveFilter(match.label);setFilterInfo(match);}
                  }
                }} style={{display:'none'}}/>
            </div>
            <div style={{fontSize:11,color:'var(--muted)',textAlign:'center',marginBottom:2}}>
              AI extracts course content automatically · Tap a format chip above to filter
            </div>
          </div>
        )}

        {/* PASTE MODE */}
        {uploadMode==='paste'&&(
          <div className="fade-in">
            <div style={{background:'rgba(79,156,249,.05)',border:'1px solid rgba(79,156,249,.15)',borderRadius:10,padding:'12px 14px',marginBottom:12}}>
              <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.7}}>
                Open <strong style={{color:'var(--text)'}}>Claude.ai</strong> or <strong style={{color:'var(--text)'}}>ChatGPT</strong>, upload your file, paste this prompt:
              </div>
              <div style={{marginTop:8,background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:7,padding:'8px 12px',display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--muted)'}}>Generate a StudyHub JSON study guide…</span>
                <button onClick={copyPrompt} style={{background:copied?'rgba(127,218,150,.1)':'rgba(79,156,249,.1)',border:`1px solid ${copied?'rgba(127,218,150,.4)':'rgba(79,156,249,.3)'}`,borderRadius:5,color:copied?'#7fda96':'#4f9cf9',cursor:'pointer',padding:'4px 10px',fontSize:11,flexShrink:0}}>{copied?'✓ Copied':'Copy'}</button>
              </div>
            </div>
            <textarea value={pasteText} onChange={e=>setPasteText(e.target.value)} placeholder={'{\n  "courseName": "COS 341",\n  "chapterTitle": "Memory System",\n  ...\n}'} rows={9} style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'11px 14px',color:'var(--text)',fontSize:12,fontFamily:"'IBM Plex Mono',monospace",resize:'vertical',marginBottom:10}}/>
          </div>
        )}

        {/* Status */}
        {smartSortMsg&&<div style={{background:'rgba(168,249,79,.08)',border:'1px solid rgba(168,249,79,.25)',borderRadius:8,padding:'8px 14px',color:'#a8f94f',fontSize:12,marginBottom:10,display:'flex',alignItems:'center',gap:8}}><span>✨</span>{smartSortMsg.replace('✨ Smart sort: ','')}<span style={{color:'var(--muted)',fontSize:11,marginLeft:4}}>— pickers updated above</span></div>}
        {error&&<div style={{background:'rgba(240,80,80,.1)',border:'1px solid rgba(240,80,80,.4)',borderRadius:8,padding:'9px 14px',color:'#f05050',fontSize:12.5,marginBottom:10}}>{error}</div>}
        {status==='processing'&&<div style={{background:'rgba(79,156,249,.08)',border:'1px solid rgba(79,156,249,.2)',borderRadius:8,padding:'10px 14px',color:'#4f9cf9',fontSize:13,marginBottom:10,display:'flex',alignItems:'center',gap:10}}><span style={{animation:'spin 1s linear infinite',display:'inline-block'}}>⟳</span>{progress||'Processing…'}</div>}
        {status==='done'&&<div style={{background:'rgba(127,218,150,.08)',border:'1px solid rgba(127,218,150,.3)',borderRadius:8,padding:'10px 14px',color:'#7fda96',fontSize:13,marginBottom:10}}>{adminMode?'✓ Request submitted — awaiting superuser approval.':`✓ Course added — Year ${year}, Semester ${semester}${departments.length?`, ${departments.map(d=>DEPT_SHORT[d]||d).join(' + ')}`:''}.`}</div>}

        {/* Actions */}
        <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:4}}>
          <button onClick={onClose} style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'9px 18px',fontSize:13}}>Cancel</button>
          <button
            onClick={uploadMode==='file'?processFile:processPaste}
            disabled={!canGo}
            style={{background:!canGo?'var(--border)':adminMode?'#da7ff0':'#4f9cf9',border:'none',borderRadius:8,color:!canGo?'var(--muted)':'#000',cursor:!canGo?'not-allowed':'pointer',padding:'9px 22px',fontSize:13,fontWeight:700}}
          >
            {status==='processing'?'Processing…':status==='done'?'Done!':adminMode?'Submit for Approval':uploadMode==='file'?'Generate & Save':'Save Course'}
          </button>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════ PRIORITY STYLES ═══════════════ */
const PRIORITY={
  info:    {color:'#4f9cf9',bg:'rgba(79,156,249,.08)',border:'rgba(79,156,249,.2)',icon:'ℹ️'},
  warning: {color:'#f9a84f',bg:'rgba(249,168,79,.08)',border:'rgba(249,168,79,.2)', icon:'⚠️'},
  urgent:  {color:'#f05050',bg:'rgba(240,80,80,.08)', border:'rgba(240,80,80,.25)',  icon:'🚨'},
};

/* ═══════════════ GLOBAL ANNOUNCEMENT STRIP ═══════════════ */
function GlobalAnnouncementStrip({user}){
  const[items,setItems]=useState([]);const[idx,setIdx]=useState(0);
  useEffect(()=>{
    dbLoadAnnouncements(null).then(d=>{
      // show pinned first, then urgent, then by date
      const sorted=[...d].sort((a,b)=>{
        if(a.pinned&&!b.pinned)return -1;if(!a.pinned&&b.pinned)return 1;
        if(a.priority==='urgent'&&b.priority!=='urgent')return -1;
        if(a.priority!=='urgent'&&b.priority==='urgent')return 1;
        return new Date(b.posted_at)-new Date(a.posted_at);
      });
      setItems(sorted);
    });
  },[]);
  if(!items.length)return null;
  const a=items[idx];
  const p=PRIORITY[a.priority]||PRIORITY.info;
  return(
    <div className="fade-in" style={{background:p.bg,border:`1px solid ${p.border}`,borderRadius:10,padding:'10px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
      <span style={{fontSize:16,flexShrink:0}}>{p.icon}</span>
      <div style={{flex:1,minWidth:0}}>
        <span style={{fontSize:13,fontWeight:700,color:p.color,marginRight:8}}>{a.title}</span>
        {a.body&&<span style={{fontSize:12.5,color:'var(--text)'}}>{a.body}</span>}
      </div>
      {a.pinned&&<span style={{fontSize:12}}>📌</span>}
      {items.length>1&&<div style={{display:'flex',gap:5,flexShrink:0}}>
        <button onClick={()=>setIdx(i=>(i-1+items.length)%items.length)} style={{background:'none',border:'1px solid var(--border)',borderRadius:5,color:'var(--muted)',cursor:'pointer',padding:'2px 7px',fontSize:11}}>‹</button>
        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',display:'flex',alignItems:'center'}}>{idx+1}/{items.length}</span>
        <button onClick={()=>setIdx(i=>(i+1)%items.length)} style={{background:'none',border:'1px solid var(--border)',borderRadius:5,color:'var(--muted)',cursor:'pointer',padding:'2px 7px',fontSize:11}}>›</button>
      </div>}
    </div>
  );
}

/* ═══════════════ ANNOUNCEMENTS TAB ═══════════════ */
function AnnouncementsTab({courseId,user,onNew}){
  const[items,setItems]=useState([]);const[showForm,setShowForm]=useState(false);
  const[form,setForm]=useState({title:'',body:'',priority:'info',pinned:false,global:false});
  const[loading,setLoading]=useState(false);const[msg,setMsg]=useState('');
  const isPriv=user.role===ROLE.SUPERUSER||user.role===ROLE.ADMIN;
  const isSU2=user.role===ROLE.SUPERUSER;
  const flash=m=>{setMsg(m);setTimeout(()=>setMsg(''),3000);};

  const load=async()=>{const d=await dbLoadAnnouncements(courseId);setItems(d);};
  useEffect(()=>{load();},[courseId]);

  const save=async()=>{
    if(!form.title.trim())return;setLoading(true);
    const a={id:`ann-${Date.now()}`,course_id:form.global?null:courseId,title:form.title,body:form.body,priority:form.priority,pinned:form.pinned,posted_by:user.username,posted_at:new Date().toISOString()};
    await dbSaveAnnouncement(a);
    // Push notification if permission granted
    pushNotification(`📢 ${form.priority==='urgent'?'URGENT: ':''}${form.title}`,form.body||'New announcement on StudyHub');
    onNew?.();
    setForm({title:'',body:'',priority:'info',pinned:false,global:false});setShowForm(false);setLoading(false);
    await load();flash('✓ Announcement posted.');
  };
  const del=async id=>{await dbDeleteAnnouncement(id);await load();};
  const togglePin=async(id,pinned)=>{await dbPinAnnouncement(id,!pinned);await load();};

  return(
    <div className="fade-up">
      <SectionLabel>Announcements</SectionLabel>
      {msg&&<div className="slide-down" style={{background:'rgba(127,218,150,.08)',border:'1px solid rgba(127,218,150,.3)',borderRadius:8,padding:'9px 14px',color:'#7fda96',fontSize:12,marginBottom:12}}>{msg}</div>}
      {isPriv&&(
        <button onClick={()=>setShowForm(s=>!s)} style={{background:'rgba(249,168,79,.1)',border:'1px solid rgba(249,168,79,.25)',borderRadius:8,color:'#f9a84f',cursor:'pointer',padding:'8px 16px',fontSize:12,fontWeight:600,marginBottom:14}}>
          {showForm?'✕ Cancel':'📢 Post Announcement'}
        </button>
      )}
      {showForm&&isPriv&&(
        <div className="scale-in" style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'16px 18px',marginBottom:16}}>
          <Field label="TITLE *" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Exam date moved"/>
          <Field label="MESSAGE (optional)" value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} placeholder="Full details…"/>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>PRIORITY</div>
            <div style={{display:'flex',gap:8}}>
              {Object.entries(PRIORITY).map(([k,v])=>(
                <button key={k} onClick={()=>setForm(f=>({...f,priority:k}))} style={{flex:1,padding:'8px 0',borderRadius:7,border:`1px solid ${form.priority===k?v.color+'70':'var(--border)'}`,background:form.priority===k?v.bg:'var(--input-bg)',color:form.priority===k?v.color:'var(--muted)',cursor:'pointer',fontSize:12,fontWeight:form.priority===k?700:400,display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>
                  {v.icon} {k.charAt(0).toUpperCase()+k.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:'flex',gap:16,marginBottom:14}}>
            <label style={{display:'flex',alignItems:'center',gap:7,cursor:'pointer',fontSize:13,color:'var(--text)'}}>
              <input type="checkbox" checked={form.pinned} onChange={e=>setForm(f=>({...f,pinned:e.target.checked}))} style={{width:15,height:15}}/>
              📌 Pin to top
            </label>
            {isSU2&&(
              <label style={{display:'flex',alignItems:'center',gap:7,cursor:'pointer',fontSize:13,color:'var(--text)'}}>
                <input type="checkbox" checked={form.global} onChange={e=>setForm(f=>({...f,global:e.target.checked}))} style={{width:15,height:15}}/>
                🌐 Post globally (all courses)
              </label>
            )}
          </div>
          <button onClick={save} disabled={loading||!form.title.trim()} style={{background:PRIORITY[form.priority].color,border:'none',borderRadius:7,color:'#000',cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:700}}>
            {loading?'Posting…':'Post Announcement'}
          </button>
        </div>
      )}
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {items.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:30,border:'1px dashed var(--border)',borderRadius:10,fontSize:13}}>No announcements yet.</div>}
        {items.map((a,i)=>{
          const p=PRIORITY[a.priority]||PRIORITY.info;
          return(
            <div key={a.id} className={`stagger-${Math.min(i%4+1,4)}`} style={{background:p.bg,border:`1px solid ${p.border}`,borderRadius:10,padding:'14px 17px',borderLeft:`3px solid ${p.color}`,position:'relative'}}>
              {a.pinned&&<span style={{position:'absolute',top:10,right:isPriv?40:12,fontSize:14}}>📌</span>}
              {!a.course_id&&<span style={{position:'absolute',top:10,right:isPriv?62:34,fontSize:11,fontFamily:"'IBM Plex Mono',monospace",color:'var(--muted)'}}>GLOBAL</span>}
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                    <span style={{fontSize:14}}>{p.icon}</span>
                    <span style={{fontSize:14,fontWeight:700,color:p.color}}>{a.title}</span>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:`${p.color}18`,color:p.color,borderRadius:4,padding:'2px 7px',textTransform:'uppercase'}}>{a.priority}</span>
                  </div>
                  {a.body&&<p style={{fontSize:13,color:'var(--text)',lineHeight:1.7,margin:'0 0 6px'}}>{a.body}</p>}
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)'}}>@{a.posted_by} · {new Date(a.posted_at).toLocaleString()}</div>
                </div>
                {isPriv&&(
                  <div style={{display:'flex',gap:6,flexShrink:0}}>
                    <button onClick={()=>togglePin(a.id,a.pinned)} title={a.pinned?'Unpin':'Pin'} style={{background:'none',border:'none',color:a.pinned?'#f9a84f':'var(--muted)',cursor:'pointer',fontSize:14}}>📌</button>
                    <button onClick={()=>del(a.id)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:13}}>✕</button>
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

/* ═══════════════ NOTIFICATION BELL ═══════════════ */
function NotificationBell({user,courses,onNavigate}){
  const[open,setOpen]=useState(false);
  const[notifs,setNotifs]=useState({items:[],unseenCount:0,seen:new Set()});
  const[permState,requestPerm]=useNotificationPermission();
  const[showPermBanner,setShowPermBanner]=useState(false);
  const[askingPerm,setAskingPerm]=useState(false); // blocks outside-click while dialog is open
  const bellRef=useRef();
  const dropRef=useRef();

  const load=useCallback(async()=>{
    if(!user||user.isGuest)return;
    const n=await dbLoadNotifications(user.username);
    setNotifs(n);
    if(permState==='default'&&!localStorage.getItem('sh-notif-asked')&&n.unseenCount>0){
      setShowPermBanner(true);
    }
  },[user,permState]);

  useEffect(()=>{load();},[]);
  useEffect(()=>{if(open)load();},[open]);

  // Close on outside click — but NOT while the permission dialog is open
  useEffect(()=>{
    const h=e=>{
      if(askingPerm) return; // system permission dialog is showing — don't close
      if(bellRef.current&&!bellRef.current.contains(e.target)&&
         dropRef.current&&!dropRef.current.contains(e.target)){
        setOpen(false);
      }
    };
    document.addEventListener('mousedown',h);
    document.addEventListener('touchstart',h,{passive:true});
    return()=>{
      document.removeEventListener('mousedown',h);
      document.removeEventListener('touchstart',h);
    };
  },[askingPerm]);

  const markAllSeen=async()=>{
    const unseen=notifs.items.filter(i=>!notifs.seen.has(i.id));
    await Promise.all(unseen.map(i=>dbMarkSeen(user.username,i.id,i.type)));
    await load();
  };

  const handleOpen=()=>{setOpen(o=>!o);if(!open)markAllSeen();};

  const askPermission=async(e)=>{
    e?.stopPropagation(); // prevent click bubbling to outside handler
    setAskingPerm(true);
    try{
      const result=await requestPerm();
      setShowPermBanner(false);
      localStorage.setItem('sh-notif-asked','1');
      if(result==='granted'){
        pushNotification('🔔 Notifications enabled','You\'ll get alerts for new assignments and announcements.');
      }
    }finally{
      setAskingPerm(false);
    }
  };

  const courseMap=Object.fromEntries((courses||[]).map(c=>[c.id,c.courseName||c.chapterTitle]));
  const count=notifs.unseenCount;

  return(
    <div ref={bellRef} style={{position:'relative'}} className="no-print">

      {/* Permission banner — fixed, centred, above everything */}
      {showPermBanner&&(
        <div className="slide-down" style={{position:'fixed',top:16,left:'50%',transform:'translateX(-50%)',
          background:'var(--card)',border:'1px solid rgba(249,168,79,.35)',borderRadius:13,
          padding:'13px 18px',display:'flex',alignItems:'center',gap:12,
          zIndex:9800,boxShadow:'var(--shadow)',maxWidth:400,width:'calc(100% - 32px)'}}>
          <span style={{fontSize:24,flexShrink:0}}>🔔</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,color:'var(--text)',marginBottom:2}}>Enable notifications?</div>
            <div style={{fontSize:11,color:'var(--muted)',lineHeight:1.4}}>Get alerts for assignments, CAs and announcements.</div>
          </div>
          <button onClick={e=>askPermission(e)}
            style={{background:'#f9a84f',border:'none',borderRadius:7,color:'#000',
              cursor:'pointer',padding:'7px 14px',fontSize:12,fontWeight:700,flexShrink:0,minHeight:36}}>
            {askingPerm?'…':'Enable'}
          </button>
          <button onClick={e=>{e.stopPropagation();setShowPermBanner(false);localStorage.setItem('sh-notif-asked','1');}}
            style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:18,padding:'4px',lineHeight:1,flexShrink:0}}>✕</button>
        </div>
      )}

      {/* Bell button */}
      <button onClick={handleOpen}
        style={{position:'relative',background:open?'rgba(249,168,79,.12)':'var(--surface)',
          border:`1px solid ${open?'rgba(249,168,79,.4)':'var(--border)'}`,
          borderRadius:10,color:open?'#f9a84f':'var(--text)',cursor:'pointer',
          padding:'8px 11px',fontSize:18,display:'flex',alignItems:'center',minHeight:40,minWidth:40,justifyContent:'center'}}>
        🔔
        {count>0&&(
          <span style={{position:'absolute',top:-4,right:-4,background:'#f05050',color:'#fff',
            borderRadius:'50%',width:17,height:17,display:'flex',alignItems:'center',justifyContent:'center',
            fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,
            border:'2px solid var(--bg)'}}>{count>9?'9+':count}</span>
        )}
      </button>

      {/* Full-screen backdrop + panel */}
      {open&&(
        <>
          {/* Backdrop — dims everything behind, closes on tap */}
          <div onClick={()=>setOpen(false)} style={{
            position:'fixed',inset:0,
            background:'rgba(0,0,0,.55)',
            backdropFilter:'blur(2px)',
            zIndex:9998,
          }}/>

          {/* Panel — bottom sheet on mobile, dropdown on desktop */}
          <div ref={dropRef} style={{
            position:'fixed',
            /* Mobile: full-width bottom sheet */
            bottom:0, left:0, right:0,
            /* Desktop: dropdown from top-right */
            maxWidth:'min(420px, 100vw)',
            marginLeft:'auto',
            /* On desktop push it below topbar */
            maxHeight:'80vh',
            background:'var(--card)',
            border:'1px solid var(--border)',
            borderRadius:'18px 18px 0 0',
            boxShadow:'0 -8px 40px rgba(0,0,0,.6)',
            zIndex:9999,
            display:'flex',flexDirection:'column',
            overflow:'hidden',
            animation:'slideUp .28s cubic-bezier(.4,0,.2,1) both',
          }}>
            {/* Handle bar (mobile feel) */}
            <div style={{width:40,height:4,borderRadius:2,background:'var(--border)',margin:'10px auto 0',flexShrink:0}}/>

            {/* Header */}
            <div style={{
              padding:'12px 18px',
              borderBottom:'1px solid var(--border)',
              display:'flex',alignItems:'center',justifyContent:'space-between',
              background:'var(--surface)',flexShrink:0,marginTop:4,
            }}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:'var(--text)',letterSpacing:1,fontWeight:700}}>
                🔔 NOTIFICATIONS
              </div>
              <div style={{display:'flex',gap:10,alignItems:'center'}}>
                {permState==='default'&&(
                  <button onClick={e=>askPermission(e)}
                    style={{background:'rgba(249,168,79,.12)',border:'1px solid rgba(249,168,79,.35)',
                      borderRadius:7,color:'#f9a84f',cursor:'pointer',padding:'5px 12px',
                      fontSize:12,fontWeight:700,minHeight:34,display:'flex',alignItems:'center',gap:5}}>
                    {askingPerm?'Asking…':'🔔 Enable Push'}
                  </button>
                )}
                {permState==='granted'&&(
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'#7fda96',
                    background:'rgba(127,218,150,.1)',border:'1px solid rgba(127,218,150,.3)',
                    borderRadius:5,padding:'3px 8px',letterSpacing:1}}>✓ Push on</span>
                )}
                {permState==='denied'&&(
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'#f05050',letterSpacing:1}}>Push blocked</span>
                )}
                <button onClick={()=>setOpen(false)}
                  style={{background:'var(--surface)',border:'1px solid var(--border)',
                    borderRadius:'50%',color:'var(--muted)',cursor:'pointer',
                    width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:16,flexShrink:0}}>✕</button>
              </div>
            </div>

            {/* Items list */}
            <div style={{overflowY:'auto',flex:1,paddingBottom:'env(safe-area-inset-bottom,12px)'}}>
              {notifs.items.length===0&&(
                <div style={{padding:'40px 20px',textAlign:'center',color:'var(--muted)',fontSize:13}}>
                  <div style={{fontSize:36,marginBottom:10}}>🔕</div>
                  <div style={{fontWeight:600,marginBottom:4}}>No notifications yet</div>
                  <div style={{fontSize:11}}>New assignments, CAs and announcements will appear here</div>
                </div>
              )}
              {notifs.items.map((n,i)=>{
                const p=PRIORITY[n.priority]||PRIORITY.info;
                const unseen=!notifs.seen.has(n.id);
                // Map notification type to the tab it should open
                const targetTab = n.type==='assignment'?'assignments'
                  : n.type==='ca'?'ca'
                  : n.type==='announcement'?'announcements'
                  : null;
                const isClickable = !!(n.courseId && onNavigate);
                const handleClick = ()=>{
                  if(!isClickable) return;
                  setOpen(false);
                  onNavigate(n.courseId, targetTab);
                };
                return(
                  <div key={n.id}
                    onClick={handleClick}
                    style={{
                      padding:'14px 18px',
                      borderBottom:'1px solid var(--border)',
                      display:'flex',gap:12,alignItems:'flex-start',
                      background:unseen?`${p.color}08`:'transparent',
                      cursor:isClickable?'pointer':'default',
                      transition:'background .15s',
                    }}
                    onMouseEnter={e=>isClickable&&(e.currentTarget.style.background=`${p.color}15`)}
                    onMouseLeave={e=>(e.currentTarget.style.background=unseen?`${p.color}08`:'transparent')}
                  >
                    {/* Priority colour strip */}
                    <div style={{width:3,alignSelf:'stretch',borderRadius:2,
                      background:unseen?p.color:'transparent',flexShrink:0,minHeight:20}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:unseen?700:400,color:'var(--text)',
                        marginBottom:4,display:'flex',alignItems:'center',gap:7,flexWrap:'wrap'}}>
                        <span>{p.icon}</span>
                        <span style={{wordBreak:'break-word'}}>{n.title}</span>
                        {n.priority==='urgent'&&(
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,
                            background:'rgba(240,80,80,.15)',color:'#f05050',
                            borderRadius:3,padding:'2px 6px',fontWeight:700}}>URGENT</span>
                        )}
                        {unseen&&<span style={{width:7,height:7,borderRadius:'50%',
                          background:p.color,display:'inline-block',flexShrink:0}}/>}
                      </div>
                      {n.body&&<div style={{fontSize:12.5,color:'var(--text)',opacity:.8,
                        lineHeight:1.6,marginBottom:5}}>{n.body}</div>}
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,
                        color:'var(--muted)',display:'flex',gap:10,flexWrap:'wrap',marginTop:2,
                        alignItems:'center'}}>
                        {n.courseId&&<span>📚 {courseMap[n.courseId]||n.courseId}</span>}
                        <span>{new Date(n.time).toLocaleString()}</span>
                        {isClickable&&<span style={{color:p.color,fontSize:9}}>Tap to open →</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════ ASSIGNMENTS TAB ═══════════════ */
function AssignmentsTab({courseId,user}){
  const[items,setItems]=useState([]);const[showForm,setShowForm]=useState(false);
  const[form,setForm]=useState({title:'',description:'',due_date:'',marks:'',file_url:''});
  const[loading,setLoading]=useState(false);const[msg,setMsg]=useState('');
  const isPriv=user.role===ROLE.SUPERUSER||user.role===ROLE.ADMIN;
  const isSU2=user.role===ROLE.SUPERUSER;
  const flash=m=>{setMsg(m);setTimeout(()=>setMsg(''),3000);};

  const load=async()=>{const d=await dbLoadAssignments(courseId);setItems(d);};
  useEffect(()=>{load();},[courseId]);

  const save=async()=>{
    if(!form.title.trim())return;setLoading(true);
    const a={id:`as-${Date.now()}`,course_id:courseId,title:form.title,description:form.description,due_date:form.due_date||null,marks:form.marks?parseInt(form.marks):null,file_url:form.file_url||null,added_by:user.username,added_at:new Date().toISOString()};
    if(isSU2){await dbSaveAssignment(a);await load();}
    else{await dbSubmitPending('add_resource',user.username,{...a,_table:'assignments'});flash('✓ Submitted for superuser approval.');}
    setForm({title:'',description:'',due_date:'',marks:'',file_url:''});setShowForm(false);setLoading(false);
  };
  const del=async id=>{
    if(isSU2){await dbDeleteAssignment(id);await load();}
    else{await dbSubmitPending('delete_resource',user.username,{id,_table:'assignments'});flash('✓ Deletion submitted for approval.');}
  };

  const overdue=d=>d&&new Date(d)<new Date();
  return(
    <div className="fade-up">
      <SectionLabel>Assignments</SectionLabel>
      {msg&&<div className="slide-down" style={{background:'rgba(127,218,150,.08)',border:'1px solid rgba(127,218,150,.3)',borderRadius:8,padding:'9px 14px',color:'#7fda96',fontSize:12,marginBottom:12}}>{msg}</div>}
      {!isPriv&&<div style={{background:'rgba(79,156,249,.05)',border:'1px solid rgba(79,156,249,.15)',borderRadius:8,padding:'9px 13px',fontSize:12,color:'var(--muted)',marginBottom:14}}>📋 Assignments posted by admins will appear here.</div>}
      {isPriv&&(
        <button onClick={()=>setShowForm(s=>!s)} style={{background:'rgba(249,168,79,.1)',border:'1px solid rgba(249,168,79,.25)',borderRadius:8,color:'#f9a84f',cursor:'pointer',padding:'8px 16px',fontSize:12,fontWeight:600,marginBottom:14}}>
          {showForm?'✕ Cancel':isSU2?'+ Add Assignment':'+ Request Assignment'}
        </button>
      )}
      {showForm&&isPriv&&(
        <div className="scale-in" style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'16px 18px',marginBottom:16}}>
          <Field label="TITLE *" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Lab Report 1"/>
          <Field label="DESCRIPTION" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="What is required…"/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Field label="DUE DATE" type="date" value={form.due_date} onChange={e=>setForm(f=>({...f,due_date:e.target.value}))}/>
            <Field label="MARKS (optional)" type="number" value={form.marks} onChange={e=>setForm(f=>({...f,marks:e.target.value}))} placeholder="e.g. 20"/>
          </div>
          <Field label="FILE / LINK (optional)" value={form.file_url} onChange={e=>setForm(f=>({...f,file_url:e.target.value}))} placeholder="https://..."/>
          <button onClick={save} disabled={loading||!form.title.trim()} style={{background:'#f9a84f',border:'none',borderRadius:7,color:'#000',cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:700}}>
            {loading?'Saving…':isSU2?'Save Assignment':'Submit for Approval'}
          </button>
        </div>
      )}
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {items.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:30,border:'1px dashed var(--border)',borderRadius:10,fontSize:13}}>No assignments posted yet.</div>}
        {items.map((a,i)=>(
          <div key={a.id} className={`stagger-${Math.min(i%4+1,4)}`} style={{background:'var(--card)',border:`1px solid ${overdue(a.due_date)?'rgba(240,80,80,.25)':'var(--border)'}`,borderRadius:10,padding:'14px 17px'}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:5}}>
                  <span style={{fontSize:14,fontWeight:600,color:'var(--text)'}}>{a.title}</span>
                  {a.marks&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:'rgba(249,168,79,.15)',color:'#f9a84f',borderRadius:4,padding:'2px 7px'}}>{a.marks} marks</span>}
                  {a.due_date&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:overdue(a.due_date)?'rgba(240,80,80,.15)':'rgba(127,218,150,.15)',color:overdue(a.due_date)?'#f05050':'#7fda96',borderRadius:4,padding:'2px 7px'}}>Due {new Date(a.due_date).toLocaleDateString()}{overdue(a.due_date)?'  ⚠ Overdue':''}</span>}
                </div>
                {a.description&&<p style={{fontSize:12.5,color:'var(--muted)',lineHeight:1.6,margin:'0 0 8px'}}>{a.description}</p>}
                {a.file_url&&<a href={a.file_url} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'#4f9cf9',textDecoration:'none'}}>📎 View file / link</a>}
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginTop:6}}>Posted by @{a.added_by} · {new Date(a.added_at).toLocaleDateString()}</div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:6,flexShrink:0,alignItems:'flex-end'}}>
                {/* AI Help button — opens chatbot in assignment mode */}
                <button
                  onClick={()=>{
                    // Store assignment context for chatbot to pick up
                    window.__assignmentContext={
                      mode:'assignment',
                      assignmentTitle:a.title,
                      assignmentDescription:a.description||'',
                      assignmentQuestions:a.description||'',
                      courseName:'',
                    };
                    // Open chatbot
                    try{localStorage.setItem('sh-bot-open','1');}catch{}
                    // Fire a custom event so chatbot can react
                    window.dispatchEvent(new CustomEvent('sh-open-bot-assignment',{detail:window.__assignmentContext}));
                  }}
                  style={{background:'linear-gradient(135deg,rgba(79,156,249,.15),rgba(127,95,249,.15))',
                    border:'1px solid rgba(79,156,249,.3)',borderRadius:7,
                    color:'#4f9cf9',cursor:'pointer',padding:'6px 12px',fontSize:11,fontWeight:600,
                    display:'flex',alignItems:'center',gap:5,whiteSpace:'nowrap'}}>
                  🤖 AI Help
                </button>
                {isPriv&&<button onClick={()=>del(a.id)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:13}}>{isSU2?'✕':'↑'}</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════ CA / TESTS TAB ═══════════════ */
const CA_TYPES=['CA','Test','Quiz','Lab','Other'];
const CA_COLORS={CA:'#da7ff0',Test:'#f05050',Quiz:'#4f9cf9',Lab:'#7fda96',Other:'#f9a84f'};

function CATab({courseId,user}){
  const[items,setItems]=useState([]);const[showForm,setShowForm]=useState(false);
  const[form,setForm]=useState({title:'',type:'CA',description:'',date:'',marks:'',file_url:''});
  const[loading,setLoading]=useState(false);const[msg,setMsg]=useState('');
  const isPriv=user.role===ROLE.SUPERUSER||user.role===ROLE.ADMIN;
  const isSU2=user.role===ROLE.SUPERUSER;
  const flash=m=>{setMsg(m);setTimeout(()=>setMsg(''),3000);};

  const load=async()=>{const d=await dbLoadCAs(courseId);setItems(d);};
  useEffect(()=>{load();},[courseId]);

  const save=async()=>{
    if(!form.title.trim())return;setLoading(true);
    const a={id:`ca-${Date.now()}`,course_id:courseId,title:form.title,type:form.type,description:form.description,date:form.date||null,marks:form.marks?parseInt(form.marks):null,file_url:form.file_url||null,added_by:user.username,added_at:new Date().toISOString()};
    if(isSU2){await dbSaveCA(a);await load();}
    else{await dbSubmitPending('add_resource',user.username,{...a,_table:'course_cas'});flash('✓ Submitted for superuser approval.');}
    setForm({title:'',type:'CA',description:'',date:'',marks:'',file_url:''});setShowForm(false);setLoading(false);
  };
  const del=async id=>{
    if(isSU2){await dbDeleteCA(id);await load();}
    else{await dbSubmitPending('delete_resource',user.username,{id,_table:'course_cas'});flash('✓ Deletion submitted for approval.');}
  };

  return(
    <div className="fade-up">
      <SectionLabel>CAs / Tests / Quizzes</SectionLabel>
      {msg&&<div className="slide-down" style={{background:'rgba(127,218,150,.08)',border:'1px solid rgba(127,218,150,.3)',borderRadius:8,padding:'9px 14px',color:'#7fda96',fontSize:12,marginBottom:12}}>{msg}</div>}
      {!isPriv&&<div style={{background:'rgba(218,127,240,.05)',border:'1px solid rgba(218,127,240,.15)',borderRadius:8,padding:'9px 13px',fontSize:12,color:'var(--muted)',marginBottom:14}}>📝 Continuous Assessments and tests for this course will appear here.</div>}
      {isPriv&&(
        <button onClick={()=>setShowForm(s=>!s)} style={{background:'rgba(218,127,240,.1)',border:'1px solid rgba(218,127,240,.25)',borderRadius:8,color:'#da7ff0',cursor:'pointer',padding:'8px 16px',fontSize:12,fontWeight:600,marginBottom:14}}>
          {showForm?'✕ Cancel':isSU2?'+ Add CA / Test':'+ Request CA / Test'}
        </button>
      )}
      {showForm&&isPriv&&(
        <div className="scale-in" style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'16px 18px',marginBottom:16}}>
          <Field label="TITLE *" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. CA 1 — Data Structures"/>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>TYPE</div>
            <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
              {CA_TYPES.map(t=><button key={t} onClick={()=>setForm(f=>({...f,type:t}))} style={{padding:'6px 13px',borderRadius:7,border:`1px solid ${form.type===t?CA_COLORS[t]:'var(--border)'}`,background:form.type===t?`${CA_COLORS[t]}15`:'var(--input-bg)',color:form.type===t?CA_COLORS[t]:'var(--muted)',cursor:'pointer',fontSize:12,fontWeight:form.type===t?600:400}}>{t}</button>)}
            </div>
          </div>
          <Field label="DESCRIPTION (optional)" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Topics covered, format…"/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Field label="DATE" type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
            <Field label="MARKS (optional)" type="number" value={form.marks} onChange={e=>setForm(f=>({...f,marks:e.target.value}))} placeholder="e.g. 30"/>
          </div>
          <Field label="FILE / LINK (optional)" value={form.file_url} onChange={e=>setForm(f=>({...f,file_url:e.target.value}))} placeholder="https://past paper link…"/>
          <button onClick={save} disabled={loading||!form.title.trim()} style={{background:'#da7ff0',border:'none',borderRadius:7,color:'#000',cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:700}}>
            {loading?'Saving…':isSU2?'Save':'Submit for Approval'}
          </button>
        </div>
      )}
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {items.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:30,border:'1px dashed var(--border)',borderRadius:10,fontSize:13}}>No CAs or tests posted yet.</div>}
        {items.map((a,i)=>{
          const col=CA_COLORS[a.type]||'#da7ff0';
          return(
            <div key={a.id} className={`stagger-${Math.min(i%4+1,4)}`} style={{background:'var(--card)',border:`1px solid ${col}25`,borderRadius:10,padding:'14px 17px',borderLeft:`3px solid ${col}`}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:5}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:`${col}18`,color:col,borderRadius:4,padding:'2px 7px',fontWeight:600}}>{a.type}</span>
                    <span style={{fontSize:14,fontWeight:600,color:'var(--text)'}}>{a.title}</span>
                    {a.marks&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:'rgba(249,168,79,.15)',color:'#f9a84f',borderRadius:4,padding:'2px 7px'}}>{a.marks} marks</span>}
                    {a.date&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:'rgba(136,146,164,.1)',color:'var(--muted)',borderRadius:4,padding:'2px 7px'}}>{new Date(a.date).toLocaleDateString()}</span>}
                  </div>
                  {a.description&&<p style={{fontSize:12.5,color:'var(--muted)',lineHeight:1.6,margin:'0 0 5px'}}>{a.description}</p>}
                  {a.file_url&&<a href={a.file_url} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'#4f9cf9',textDecoration:'none'}}>📎 View file / past paper</a>}
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginTop:6}}>Posted by @{a.added_by} · {new Date(a.added_at).toLocaleDateString()}</div>
                </div>
                {isPriv&&<button onClick={()=>del(a.id)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:13,flexShrink:0}}>{isSU2?'✕':'↑'}</button>}
              </div>
            </div>
          );
        })}
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
  const del=async id=>{
    const ok=await(window.shConfirm?.({title:'Delete post?',message:'This post will be permanently removed.',danger:true,confirmLabel:'Delete'})??Promise.resolve(true));
    if(!ok)return;
    await dbDeletePost(id);await load();
  };

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
/* Definition row with copy-to-clipboard */
function DefinitionRow({def,isLast}){
  const[copied,setCopied]=useState(false);
  const copy=()=>{
    navigator.clipboard.writeText(`${def.term}: ${def.definition}`);
    setCopied(true);setTimeout(()=>setCopied(false),1500);
  };
  return(
    <div className="def-grid" style={{display:'grid',gridTemplateColumns:'190px 1fr auto',borderBottom:isLast?'none':'1px solid var(--border)',alignItems:'stretch'}} className="fade-in">
      <div className="def-term" style={{padding:'12px 14px',fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:600,color:'#7fda96',background:'var(--surface)',display:'flex',alignItems:'center'}}>{def.term}</div>
      <div style={{padding:'12px 14px',fontSize:13,color:'var(--text)',lineHeight:1.7}}>{def.definition}</div>
      <button onClick={copy} title="Copy term and definition" style={{background:'none',border:'none',color:copied?'#7fda96':'var(--muted)',cursor:'pointer',padding:'0 12px',fontSize:13,flexShrink:0,opacity:copied?1:.5}} onMouseEnter={e=>e.currentTarget.style.opacity='1'} onMouseLeave={e=>!copied&&(e.currentTarget.style.opacity='.5')}>
        {copied?'✓':'⎘'}
      </button>
    </div>
  );
}

const ALL_TABS=[{id:'announcements',label:'📢 Announcements'},{id:'concepts',label:'Key Concepts'},{id:'definitions',label:'Definitions'},{id:'mechanisms',label:'Mechanisms'},{id:'algorithms',label:'Algorithms'},{id:'takeaways',label:'Takeaways'},{id:'questions',label:'Practice Q&A'},{id:'assignments',label:'📋 Assignments'},{id:'ca',label:'📝 CA / Tests'},{id:'resources',label:'Resources'},{id:'community',label:'Community'}];

function CourseView({course,user,progress,onBack,onProgressUpdate,bookmarks,toggleBookmark,courses}){
  const[tab,setTab]=useState(course.initialTab||'announcements');const[openQ,setOpenQ]=useState(null);const[filter,setFilter]=useState('');
  const d=course.data;const cp=progress[course.id]||{viewed:false,openedQs:[]};const isPriv=user.role!==ROLE.USER;
  const isBookmarked=bookmarks.includes(course.id);

  // Cache for offline use
  useEffect(()=>{try{localStorage.setItem(CACHE_KEY(course.id),JSON.stringify({data:d,year:course.year,semester:course.semester||1,department:course.department||'Computer Science',cachedAt:Date.now()}));}catch{};},[]);
  useEffect(()=>{if(!cp.viewed){const n={...progress,[course.id]:{...cp,viewed:true}};onProgressUpdate(n);}},[]);

  const revealQ=idx=>{setOpenQ(openQ===idx?null:idx);if(!cp.openedQs.includes(idx)){const n={...progress,[course.id]:{...cp,openedQs:[...cp.openedQs,idx]}};onProgressUpdate(n);}};

  const totalQ=d.questions?.length||0;const pct=totalQ===0?0:Math.round(cp.openedQs.length/totalQ*100);
  const hasAlgo=d.algorithms?.length>0;
  const tabs=ALL_TABS.filter(t=>t.id!=='algorithms'||hasAlgo);
  const filteredQ=(d.questions||[]).filter(q=>!filter||q.question.toLowerCase().includes(filter.toLowerCase()));
  const accent=YEAR_COLORS[course.year]||'#4f9cf9';
  const chatCtx={courseName:d.courseName,chapterTitle:d.chapterTitle,summary:[d.keyConcepts?.slice(0,5).map(c=>c.title).join(', '),d.chapters?.map(c=>c.name).join(', ')].filter(Boolean).join(' | ')};

  return(
    <div className="course-page" style={{maxWidth:960,margin:'0 auto',padding:'28px 20px 88px'}}>
      {/* Top bar */}
      <div className="topbar" style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:26,flexWrap:'wrap',gap:10}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Logo onClick={onBack} size="sm"/>
          <button onClick={onBack} style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'6px 14px',fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}>← All Courses</button>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
          <RolePill role={user.role} accountType={user.accountType||user.account_type}/>
          <div style={{background:YEAR_BG[course.year],border:`1px solid ${accent}40`,borderRadius:6,padding:'4px 12px'}}><Mono color={accent} size={9}>Year {course.year} · Semester {course.semester||1}</Mono></div>
          {course.data?.department&&<div style={{background:`${DEPT_COLOR[course.data.department]||'#4f9cf9'}12`,border:`1px solid ${DEPT_COLOR[course.data.department]||'#4f9cf9'}30`,borderRadius:6,padding:'4px 12px'}}><Mono color={DEPT_COLOR[course.data.department]||'#4f9cf9'} size={9}>{DEPT_SHORT[course.data.department]||'CS'}</Mono></div>}
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
      <div className="course-tabs-row" style={{display:'flex',gap:2,flexWrap:'wrap',borderBottom:'1px solid var(--border)',marginBottom:28,overflowX:'auto'}}>
        {tabs.map(t=><button key={t.id} className="tab-btn" onClick={()=>setTab(t.id)} style={{background:tab===t.id?'rgba(79,156,249,.08)':'none',border:'none',borderBottom:tab===t.id?'2px solid #4f9cf9':'2px solid transparent',color:tab===t.id?'#4f9cf9':'var(--muted)',cursor:'pointer',padding:'9px 14px',fontSize:13,fontWeight:tab===t.id?600:400,whiteSpace:'nowrap'}}>{t.label}</button>)}
      </div>

      {/* Tab content */}
      {tab==='concepts'&&<div className="fade-up"><SectionLabel>Key Concepts</SectionLabel><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(252px,1fr))',gap:12}}>{(d.keyConcepts||[]).map((c,i)=><div key={i} className={`stagger-${Math.min(i%4+1,4)}`} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:'15px 17px',borderLeft:`3px solid ${(COLOR_MAP[c.color]||COLOR_MAP.blue).bar}`}}><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:600,color:'var(--text)',marginBottom:5}}>{c.title}</div><p style={{fontSize:12.5,color:'var(--muted)',lineHeight:1.65,margin:0}}>{c.description}</p></div>)}</div></div>}

      {tab==='definitions'&&<div className="fade-up"><SectionLabel>Terms & Definitions</SectionLabel><div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,overflow:'hidden'}}>{(d.definitions||[]).map((def,i)=><DefinitionRow key={i} def={def} isLast={i===d.definitions.length-1}/>)}</div></div>}

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

      {tab==='announcements'&&<AnnouncementsTab courseId={course.id} user={user} onNew={()=>{}}/>}
      {tab==='assignments'&&<AssignmentsTab courseId={course.id} user={user}/>}
      {tab==='ca'&&<CATab courseId={course.id} user={user}/>}
      {tab==='resources'&&<ResourcesTab courseId={course.id} user={user}/>}
      {tab==='community'&&<CommunityBoard courseId={course.id} user={user}/>}
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
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:12,marginBottom:24}}>
        {[{label:'Total Views',val:totalViews,color:'#4f9cf9',icon:'👁'},{label:'Active Students',val:totalStudents,color:'#7fda96',icon:'👥'},{label:'Questions Opened',val:totalQsOpened,color:'#f9a84f',icon:'❓'},{label:'Total Courses',val:courses.length,color:'#da7ff0',icon:'📚'}].map((s,i)=>(
          <div key={i} className={`stagger-${i+1}`} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'14px 16px'}}>
            <div style={{fontSize:20,marginBottom:4}}>{s.icon}</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:24,color:s.color,fontWeight:600}}>{s.val}</div>
            <div style={{fontSize:11,color:'var(--muted)',marginTop:3}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Per-course — card list (no fixed-column grid that breaks on mobile) */}
      <SectionLabel>Course Performance</SectionLabel>
      {courseStats.length===0&&<div style={{padding:30,textAlign:'center',color:'var(--muted)',fontSize:13}}>No data yet.</div>}
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {courseStats.map((c,i)=>(
          <div key={c.id} className={`stagger-${Math.min(i%4+1,4)}`} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:'13px 16px'}}>
            {/* Course label */}
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:YEAR_COLORS[c.year],marginBottom:3,letterSpacing:1}}>
              Yr {c.year} · Sem {c.semester||1} · {DEPT_SHORT[c.department]||'CS'} · {c.courseName}
            </div>
            <div style={{fontSize:13,color:'var(--text)',fontWeight:500,marginBottom:10}}>{c.chapterTitle}</div>
            {/* Stats row */}
            <div style={{display:'flex',gap:16,flexWrap:'wrap',marginBottom:8}}>
              <div style={{display:'flex',alignItems:'center',gap:5}}>
                <span style={{fontSize:12}}>👁</span>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:'#4f9cf9',fontWeight:600}}>{c.views}</span>
                <span style={{fontSize:10,color:'var(--muted)'}}>views</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:5}}>
                <span style={{fontSize:12}}>👥</span>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:'#7fda96',fontWeight:600}}>{c.uniqueStudents}</span>
                <span style={{fontSize:10,color:'var(--muted)'}}>students</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:5}}>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:'#f9a84f',fontWeight:600}}>{c.avgCompletion}%</span>
                <span style={{fontSize:10,color:'var(--muted)'}}>avg completion</span>
              </div>
            </div>
            {/* Progress bar — always fits */}
            <div style={{height:5,background:'var(--border)',borderRadius:3,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${Math.min(c.avgCompletion,100)}%`,background:'#f9a84f',borderRadius:3,transition:'width .6s ease'}}/>
            </div>
          </div>
        ))}
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
                    {a.payload?.entry&&<div style={{fontSize:12,color:'var(--muted)',marginTop:4}}>Course: <span style={{color:'var(--text)'}}>{a.payload.entry.chapterTitle}</span> — Yr {a.payload.entry.year} · Sem {a.payload.entry.semester||1} · {DEPT_SHORT[a.payload.entry.department]||'CS'}</div>}
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
            <RoleBadge role={isAdm?ROLE.ADMIN:ROLE.USER} accountType={u.account_type}/>
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

/* ═══════════════ SETTINGS TAB (superuser only) ═══════════════ */
function SettingsTab({onReload}){
  const[depts,setDepts]=useState([]);const[types,setTypes]=useState([]);
  const[deptForm,setDeptForm]=useState({name:'',short_code:'',color:'#4f9cf9'});
  const[typeForm,setTypeForm]=useState({label:'',short_code:'',role_key:'user',color:'#4f9cf9',description:''});
  const[msg,setMsg]=useState('');const[section,setSection]=useState('depts');
  const flash=m=>{setMsg(m);setTimeout(()=>setMsg(''),3000);};

  const loadAll=async()=>{
    const[{data:d},{data:t}]=await Promise.all([
      supabase.from('departments').select('*').order('name'),
      supabase.from('user_types').select('*').order('created_at')
    ]);
    setDepts(d||[]);setTypes(t||[]);
  };
  useEffect(()=>{loadAll();},[]);

  const addDept=async()=>{
    if(!deptForm.name.trim()||!deptForm.short_code.trim())return;
    const id=`dept-${Date.now()}`;
    await dbAddDepartment({id,name:deptForm.name,short_code:deptForm.short_code,color:deptForm.color,created_at:new Date().toISOString()});
    setDeptForm({name:'',short_code:'',color:'#4f9cf9'});
    await loadAll();await loadDepartments();onReload?.();
    flash(`✓ Department "${deptForm.name}" added.`);
  };
  const delDept=async(id,name)=>{
    const ok=await(window.shConfirm?.({title:`Remove "${name}"?`,message:"This won't delete courses already assigned to this department.",danger:true,confirmLabel:'Remove'})??Promise.resolve(true));
    if(!ok)return;
    await dbDeleteDepartment(id);await loadAll();await loadDepartments();onReload?.();
    flash(`Department removed.`);
  };

  const addType=async()=>{
    if(!typeForm.label.trim()||!typeForm.short_code.trim())return;
    const id=`ut-${Date.now()}`;
    await dbAddUserType({id,label:typeForm.label,short_code:typeForm.short_code,role_key:typeForm.role_key,color:typeForm.color,description:typeForm.description,created_at:new Date().toISOString()});
    setTypeForm({label:'',short_code:'',role_key:'user',color:'#4f9cf9',description:''});
    await loadAll();await loadUserTypes();
    flash(`✓ User type "${typeForm.label}" added.`);
  };
  const delType=async(id,label)=>{
    const ok=await(window.shConfirm?.({title:`Remove user type "${label}"?`,message:'Users with this type will keep their current access level.',danger:true,confirmLabel:'Remove'})??Promise.resolve(true));
    if(!ok)return;
    await dbDeleteUserType(id);await loadAll();await loadUserTypes();
    flash(`User type removed.`);
  };

  const PRESET_COLORS=['#4f9cf9','#7fda96','#f9a84f','#da7ff0','#f05050','#a8f94f','#4ff9e4','#f94fcc','#ff9f43','#54a0ff'];

  return(
    <div className="fade-up">
      <div style={{background:'rgba(249,168,79,.06)',border:'1px solid rgba(249,168,79,.2)',borderRadius:10,padding:'11px 15px',marginBottom:20,display:'flex',gap:10,alignItems:'center'}}>
        <span style={{fontSize:18}}>⚙️</span>
        <div><div style={{color:'#f9a84f',fontSize:13,fontWeight:600,marginBottom:2}}>Platform Settings</div><div style={{color:'var(--muted)',fontSize:12}}>Add departments and user types. Changes take effect immediately across the site.</div></div>
      </div>
      {msg&&<div className="slide-down" style={{background:'rgba(127,218,150,.08)',border:'1px solid rgba(127,218,150,.3)',borderRadius:8,padding:'9px 14px',color:'#7fda96',fontSize:12,marginBottom:14}}>{msg}</div>}

      {/* Sub-tabs */}
      <div style={{display:'flex',gap:4,borderBottom:'1px solid var(--border)',marginBottom:20}}>
        {[{id:'depts',label:'🏫 Departments'},{id:'types',label:'👥 User Types'}].map(t=>(
          <button key={t.id} onClick={()=>setSection(t.id)} style={{background:'none',border:'none',borderBottom:section===t.id?'2px solid #f9a84f':'2px solid transparent',color:section===t.id?'#f9a84f':'var(--muted)',cursor:'pointer',padding:'8px 16px',fontSize:13,fontWeight:section===t.id?600:400}}>{t.label}</button>
        ))}
      </div>

      {/* DEPARTMENTS */}
      {section==='depts'&&(
        <div className="fade-in">
          {/* Add form */}
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'16px 18px',marginBottom:18}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--muted)',letterSpacing:2,marginBottom:12}}>ADD DEPARTMENT</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 120px',gap:10,marginBottom:10}}>
              <Field label="FULL NAME" value={deptForm.name} onChange={e=>setDeptForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Computer Engineering"/>
              <Field label="SHORT CODE" value={deptForm.short_code} onChange={e=>setDeptForm(f=>({...f,short_code:e.target.value}))} placeholder="e.g. CE"/>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>COLOUR</div>
              <div style={{display:'flex',gap:7,flexWrap:'wrap',alignItems:'center'}}>
                {PRESET_COLORS.map(c=>(
                  <button key={c} onClick={()=>setDeptForm(f=>({...f,color:c}))} style={{width:24,height:24,borderRadius:'50%',background:c,border:deptForm.color===c?'3px solid var(--text)':'2px solid transparent',cursor:'pointer',padding:0}}/>
                ))}
                <input type="color" value={deptForm.color} onChange={e=>setDeptForm(f=>({...f,color:e.target.value}))} style={{width:28,height:28,borderRadius:4,border:'1px solid var(--border)',cursor:'pointer',background:'none',padding:2}}/>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:deptForm.color}}>{deptForm.color}</span>
              </div>
            </div>
            <button onClick={addDept} disabled={!deptForm.name.trim()||!deptForm.short_code.trim()} style={{background:!deptForm.name.trim()?'var(--border)':'#4f9cf9',border:'none',borderRadius:7,color:!deptForm.name.trim()?'var(--muted)':'#000',cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:700}}>Add Department</button>
          </div>
          {/* List */}
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {depts.map(d=>(
              <div key={d.id} className="fade-in" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:9,padding:'12px 16px',display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:14,height:14,borderRadius:'50%',background:d.color,flexShrink:0,boxShadow:`0 0 6px ${d.color}80`}}/>
                <div style={{flex:1}}><div style={{fontSize:14,color:'var(--text)',fontWeight:500}}>{d.name}</div></div>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:`${d.color}18`,color:d.color,borderRadius:4,padding:'2px 8px'}}>{d.short_code}</span>
                <button onClick={()=>delDept(d.id,d.name)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:13}}>✕</button>
              </div>
            ))}
            {depts.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:20,border:'1px dashed var(--border)',borderRadius:8,fontSize:13}}>No departments yet.</div>}
          </div>
        </div>
      )}

      {/* USER TYPES */}
      {section==='types'&&(
        <div className="fade-in">
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'16px 18px',marginBottom:18}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--muted)',letterSpacing:2,marginBottom:12}}>ADD USER TYPE</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 130px',gap:10,marginBottom:10}}>
              <Field label="FULL LABEL" value={typeForm.label} onChange={e=>setTypeForm(f=>({...f,label:e.target.value}))} placeholder="e.g. Postgraduate Student"/>
              <Field label="SHORT CODE" value={typeForm.short_code} onChange={e=>setTypeForm(f=>({...f,short_code:e.target.value}))} placeholder="e.g. PG"/>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>ACCESS LEVEL</div>
              <div style={{display:'flex',gap:8}}>
                {[{k:'user',label:'🎓 Student-like (year-based)'},{k:'external',label:'🌐 External (all years)'}].map(o=>(
                  <button key={o.k} onClick={()=>setTypeForm(f=>({...f,role_key:o.k}))} style={{flex:1,padding:'8px 10px',borderRadius:7,border:`1px solid ${typeForm.role_key===o.k?'#f9a84f70':'var(--border)'}`,background:typeForm.role_key===o.k?'rgba(249,168,79,.08)':'var(--input-bg)',color:typeForm.role_key===o.k?'#f9a84f':'var(--muted)',cursor:'pointer',fontSize:12,fontWeight:typeForm.role_key===o.k?600:400}}>{o.label}</button>
                ))}
              </div>
            </div>
            <Field label="DESCRIPTION (optional)" value={typeForm.description} onChange={e=>setTypeForm(f=>({...f,description:e.target.value}))} placeholder="e.g. Alumni with read-only access"/>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>BADGE COLOUR</div>
              <div style={{display:'flex',gap:7,flexWrap:'wrap',alignItems:'center'}}>
                {PRESET_COLORS.map(c=>(
                  <button key={c} onClick={()=>setTypeForm(f=>({...f,color:c}))} style={{width:24,height:24,borderRadius:'50%',background:c,border:typeForm.color===c?'3px solid var(--text)':'2px solid transparent',cursor:'pointer',padding:0}}/>
                ))}
                <input type="color" value={typeForm.color} onChange={e=>setTypeForm(f=>({...f,color:e.target.value}))} style={{width:28,height:28,borderRadius:4,border:'1px solid var(--border)',cursor:'pointer',background:'none',padding:2}}/>
              </div>
            </div>
            <button onClick={addType} disabled={!typeForm.label.trim()||!typeForm.short_code.trim()} style={{background:!typeForm.label.trim()?'var(--border)':'#da7ff0',border:'none',borderRadius:7,color:!typeForm.label.trim()?'var(--muted)':'#000',cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:700}}>Add User Type</button>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {types.map(t=>(
              <div key={t.id} className="fade-in" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:9,padding:'12px 16px',display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:14,height:14,borderRadius:'50%',background:t.color,flexShrink:0,boxShadow:`0 0 6px ${t.color}80`}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,color:'var(--text)',fontWeight:500}}>{t.label}</div>
                  {t.description&&<div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{t.description}</div>}
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginTop:3}}>Access: {t.role_key}</div>
                </div>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:`${t.color}18`,color:t.color,borderRadius:4,padding:'2px 8px'}}>{t.short_code}</span>
                <button onClick={()=>delType(t.id,t.label)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:13}}>✕</button>
              </div>
            ))}
            {types.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:20,border:'1px dashed var(--border)',borderRadius:8,fontSize:13}}>No user types yet.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ USER ROW ═══════════════ */
function UserRow({u,role,isAdm,isSU2,onRoleChange,onAdminToggle,onYearChange}){
  const[expanded,setExpanded]=useState(false);
  const[busy,setBusy]=useState('');
  const[localYear,setLocalYear]=useState(u.year||1);
  const accentColor=ROLE_COLOR[role]||ROLE_COLOR.user;

  const doRoleChange=async(accountType)=>{
    setBusy('role');
    await onRoleChange(accountType);
    setBusy('');
  };
  const doAdminToggle=async()=>{
    setBusy('admin');
    await onAdminToggle();
    setBusy('');
  };
  const doYearChange=async(yr)=>{
    setLocalYear(yr);
    setBusy('year');
    await onYearChange(yr);
    setBusy('');
  };

  const isExternal=u.account_type==='external';

  return(
    <div style={{background:'var(--surface)',border:`1px solid ${expanded?accentColor+'40':'var(--border)'}`,borderRadius:10,overflow:'hidden',transition:'border-color .2s'}}>
      {/* Row summary */}
      <div style={{padding:'12px 16px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',cursor:isSU2?'pointer':'default'}} onClick={()=>isSU2&&setExpanded(e=>!e)}>
        <Avatar name={u.display_name||u.username}/>
        <div style={{flex:1,minWidth:130}}>
          <div style={{fontSize:14,color:'var(--text)',fontWeight:500}}>{u.display_name||u.username}</div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginTop:2}}>
            @{u.username} · {new Date(u.created_at).toLocaleDateString()}
          </div>
        </div>
        <RolePill role={role} accountType={u.account_type}/>
        {!isExternal&&u.year>0&&(
          <div style={{background:YEAR_BG[u.year]||'transparent',border:`1px solid ${YEAR_COLORS[u.year]||'var(--border)'}40`,borderRadius:5,padding:'3px 9px'}}>
            <Mono color={YEAR_COLORS[u.year]||'var(--muted)'} size={9}>Yr {u.year}</Mono>
          </div>
        )}
        {isAdm&&<Mono color="#da7ff0" size={9}>ADMIN</Mono>}
        {isSU2&&<span style={{color:'var(--muted)',fontSize:13,marginLeft:'auto'}}>{expanded?'▲':'▼'}</span>}
      </div>

      {/* Expanded editor — superuser only */}
      {isSU2&&expanded&&(
        <div className="fade-in" style={{borderTop:'1px solid var(--border)',padding:'14px 16px',background:'var(--card)',display:'flex',flexDirection:'column',gap:14}}>
          <Mono color="var(--muted)" size={9}>DIRECT CONTROLS — changes take effect immediately</Mono>

          {/* Account type */}
          <div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:7,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>ACCOUNT TYPE</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {USER_TYPES.map(ut=>{
                const active=(ut.roleKey==='external'&&isExternal)||(ut.roleKey!=='external'&&!isExternal);
                return(
                  <button key={ut.id} onClick={()=>doRoleChange(ut.roleKey==='external'?'external':'student')}
                    disabled={active||busy==='role'}
                    style={{padding:'7px 14px',borderRadius:8,cursor:active||busy==='role'?'default':'pointer',border:`1px solid ${active?ut.color+'70':'var(--border)'}`,background:active?`${ut.color}12`:'var(--input-bg)',color:active?ut.color:'var(--muted)',fontWeight:active?700:400,fontSize:12,display:'flex',alignItems:'center',gap:6,opacity:busy==='role'&&!active?.6:1}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,background:active?`${ut.color}20`:'var(--border)',color:active?ut.color:'var(--muted)',borderRadius:3,padding:'1px 5px'}}>{ut.shortCode}</span>
                    {ut.label}
                    {active&&<span style={{fontSize:10,color:ut.color}}>✓</span>}
                  </button>
                );
              })}
              {busy==='role'&&<Mono color="var(--muted)" size={9}>Updating…</Mono>}
            </div>
          </div>

          {/* Admin toggle */}
          <div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:7,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>ADMIN PRIVILEGES</div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <button onClick={doAdminToggle} disabled={busy==='admin'}
                style={{padding:'7px 16px',borderRadius:8,cursor:busy==='admin'?'default':'pointer',border:`1px solid ${isAdm?'rgba(240,80,80,.4)':'rgba(218,127,240,.4)'}`,background:isAdm?'rgba(240,80,80,.1)':'rgba(218,127,240,.1)',color:isAdm?'#f05050':'#da7ff0',fontWeight:600,fontSize:12}}>
                {busy==='admin'?'…':isAdm?'✕ Remove Admin':'🛡 Make Admin'}
              </button>
              <span style={{fontSize:11,color:'var(--muted)'}}>{isAdm?'Currently has admin access to the panel':'No admin privileges'}</span>
            </div>
          </div>

          {/* Year change — only for non-external */}
          {!isExternal&&(
            <div>
              <div style={{fontSize:11,color:'var(--muted)',marginBottom:7,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>YEAR LEVEL</div>
              <div style={{display:'flex',gap:7,alignItems:'center'}}>
                {YEARS.map(y=>(
                  <button key={y} onClick={()=>doYearChange(y)} disabled={busy==='year'}
                    style={{width:42,height:36,borderRadius:7,cursor:busy==='year'?'default':'pointer',border:`1px solid ${localYear===y?YEAR_COLORS[y]+'70':'var(--border)'}`,background:localYear===y?YEAR_BG[y]:'var(--input-bg)',color:localYear===y?YEAR_COLORS[y]:'var(--muted)',fontWeight:localYear===y?700:400,fontSize:13}}>
                    {y}
                  </button>
                ))}
                {busy==='year'&&<Mono color="var(--muted)" size={9}>Saving…</Mono>}
              </div>
            </div>
          )}

          {/* Status requests for this user */}
          <div style={{paddingTop:4,borderTop:'1px solid var(--border)'}}>
            <UserStatusHistory username={u.username}/>
          </div>
        </div>
      )}
    </div>
  );
}

/* Mini component: shows pending/recent status request for a specific user */
function UserStatusHistory({username}){
  const[req,setReq]=useState(null);const[loaded,setLoaded]=useState(false);
  useEffect(()=>{
    dbGetPendingStatusRequest(username).then(r=>{setReq(r);setLoaded(true);});
  },[username]);
  if(!loaded)return null;
  if(!req)return<div style={{fontSize:11,color:'var(--muted)',fontFamily:"'IBM Plex Mono',monospace"}}>No pending status request</div>;
  return(
    <div style={{background:'rgba(168,249,79,.06)',border:'1px solid rgba(168,249,79,.2)',borderRadius:7,padding:'9px 13px',display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
      <span style={{fontSize:14}}>⏳</span>
      <div style={{flex:1}}>
        <div style={{fontSize:12,color:'#a8f94f',fontWeight:600}}>Pending status request</div>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginTop:2}}>{req.from_type} → {req.to_type} · {new Date(req.requested_at).toLocaleString()}</div>
        {req.reason&&<div style={{fontSize:11,color:'var(--muted)',marginTop:3,fontStyle:'italic'}}>"{req.reason}"</div>}
      </div>
    </div>
  );
}

/* ═══════════════ ADMIN PANEL ═══════════════ */
function AdminPanel({user,courses,onClose,onCoursesChange}){
  const isSU2=user.role===ROLE.SUPERUSER;
  const[tab,setTab]=useState('courses');const[allUsers,setAllUsers]=useState([]);const[admins,setAdmins]=useState([]);const[filterY,setFilterY]=useState(0);const[filterSem,setFilterSem]=useState(0);const[filterDept,setFilterDept]=useState('all');const[showUpload,setShowUpload]=useState(false);const[search,setSearch]=useState('');const[pendingCount,setPendingCount]=useState(0);const[statusPendingCount,setStatusPendingCount]=useState(0);const[actionMsg,setActionMsg]=useState('');

  useEffect(()=>{
    Promise.all([dbLoadUsers(),dbLoadAdmins()]).then(([u,a])=>{setAllUsers(u);setAdmins(a);});
    if(isSU2)dbCountPending().then(setPendingCount);
    dbCountPendingStatusRequests().then(setStatusPendingCount);
  },[]);

  const flash=m=>{setActionMsg(m);setTimeout(()=>setActionMsg(''),3000);};

  // Admins submit for approval; superuser acts directly
  const doDelete=async id=>{
    const ok=await(window.shConfirm?.({
      title:isSU2?'Delete course permanently?':'Submit deletion request?',
      message:isSU2?'This course and all its data will be permanently removed. This cannot be undone.':'Your deletion request will be sent to the superuser for approval.',
      danger:true,
      confirmLabel:isSU2?'Delete':'Submit Request'
    })??Promise.resolve(true));
    if(!ok)return;
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
    {id:'status',label:'status',statusCount:statusPendingCount},
    ...(isSU2?[{id:'approvals',label:'approvals',pendingCount},{id:'admins',label:'⚡ Manage Admins'},{id:'settings',label:'⚙️ Settings'}]:[])
  ];

  const filtered=(filterY===0?courses:courses.filter(c=>c.year===filterY)).filter(c=>filterSem===0||c.semester===filterSem).filter(c=>filterDept==='all'||c.department===filterDept).filter(c=>!search||c.chapterTitle.toLowerCase().includes(search.toLowerCase())||c.courseName.toLowerCase().includes(search.toLowerCase()));

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.88)',backdropFilter:'blur(8px)',zIndex:2000,overflow:'auto'}}>
      <div className="admin-page" style={{maxWidth:900,margin:'0 auto',padding:'34px 20px 90px'}}>
        <div className="fade-up" style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:26,flexWrap:'wrap',gap:14}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
              <Logo onClick={onClose} size="sm"/>
              <div style={{width:1,height:20,background:'var(--border)'}}/>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <Mono color={isSU2?'#f9a84f':'#da7ff0'} size={9}>{isSU2?'SUPERUSER PANEL':'ADMIN PANEL'}</Mono>
                <RolePill role={user.role} accountType={user.accountType||user.account_type}/>
              </div>
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
              {t.id==='approvals'?'⚡ Approvals':t.id==='status'?'🔄 Status Changes':t.label}
              {t.id==='approvals'&&t.pendingCount>0&&<span style={{background:'#f9a84f',color:'#000',borderRadius:10,padding:'1px 7px',fontSize:10,fontWeight:700}}>{t.pendingCount}</span>}
              {t.id==='status'&&t.statusCount>0&&<span style={{background:'#a8f94f',color:'#000',borderRadius:10,padding:'1px 7px',fontSize:10,fontWeight:700}}>{t.statusCount}</span>}
            </button>
          ))}
        </div>

        {tab==='courses'&&(
          <div className="fade-up">
            {!isSU2&&<div style={{background:'rgba(218,127,240,.06)',border:'1px solid rgba(218,127,240,.2)',borderRadius:8,padding:'9px 14px',fontSize:12,color:'#da7ff0',marginBottom:14}}>🛡 As Admin, your Add and Delete actions will be queued for superuser approval.</div>}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10,flexWrap:'wrap',gap:10}}>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                {[{label:'All',y:0},...YEARS.map(y=>({label:`Yr ${y}`,y}))].map(({label,y})=>(
                  <button key={y} onClick={()=>setFilterY(y)} style={{background:filterY===y?(y===0?'rgba(136,146,164,.1)':YEAR_BG[y]):'none',border:`1px solid ${filterY===y?(y===0?'#8892a4':YEAR_COLORS[y])+'60':'var(--border)'}`,borderRadius:20,color:filterY===y?(y===0?'#8892a4':YEAR_COLORS[y]):'var(--muted)',cursor:'pointer',padding:'5px 14px',fontSize:12,fontWeight:filterY===y?600:400}}>{label}</button>
                ))}
              </div>
              <button onClick={()=>setShowUpload(true)} style={{background:'#4f9cf9',border:'none',borderRadius:8,color:'#000',cursor:'pointer',padding:'9px 18px',fontSize:13,fontWeight:700}}>+ {isSU2?'Add Course':'Request Course'}</button>
            </div>
            <div style={{display:'flex',gap:8,marginBottom:14,alignItems:'center',flexWrap:'wrap'}}>
              {[{label:'All Semesters',s:0},...[1,2].map(s=>({label:`Semester ${s}`,s}))].map(({label,s})=>(
                <button key={s} onClick={()=>setFilterSem(s)} style={{background:filterSem===s?'rgba(79,156,249,.1)':'none',border:`1px solid ${filterSem===s?'rgba(79,156,249,.4)':'var(--border)'}`,borderRadius:20,color:filterSem===s?'#4f9cf9':'var(--muted)',cursor:'pointer',padding:'5px 14px',fontSize:12,fontWeight:filterSem===s?600:400}}>{label}</button>
              ))}
              <div style={{width:1,height:20,background:'var(--border)',margin:'0 4px'}}/>
              {[{label:'All Depts',d:'all',color:'#8892a4'},...DEPARTMENTS.map(d=>({label:DEPT_SHORT[d],d,color:DEPT_COLOR[d]}))].map(({label,d,color})=>(
                <button key={d} onClick={()=>setFilterDept(d)} style={{background:filterDept===d?`${color}15`:'none',border:`1px solid ${filterDept===d?color+'60':'var(--border)'}`,borderRadius:20,color:filterDept===d?color:'var(--muted)',cursor:'pointer',padding:'5px 14px',fontSize:12,fontWeight:filterDept===d?600:400}}>{label}</button>
              ))}
              <SearchBar value={search} onChange={setSearch} placeholder="Search courses…"/>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              {filtered.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:40,border:'1px dashed var(--border)',borderRadius:12}}>No courses here yet.</div>}
              {filtered.map(c=>(
                <div key={c.id} className="fade-in" style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'13px 17px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                  <div style={{display:'flex',flexDirection:'column',gap:4}}>
                    <div style={{background:YEAR_BG[c.year],border:`1px solid ${YEAR_COLORS[c.year]}40`,borderRadius:5,padding:'3px 9px'}}><Mono color={YEAR_COLORS[c.year]} size={9}>Yr {c.year}</Mono></div>
                    <div style={{background:'rgba(79,156,249,.1)',border:'1px solid rgba(79,156,249,.3)',borderRadius:5,padding:'3px 9px'}}><Mono color="#4f9cf9" size={9}>Sem {c.semester||1}</Mono></div>
                    <div style={{background:`${DEPT_COLOR[c.department]||'#4f9cf9'}12`,border:`1px solid ${DEPT_COLOR[c.department]||'#4f9cf9'}30`,borderRadius:5,padding:'3px 9px'}}><Mono color={DEPT_COLOR[c.department]||'#4f9cf9'} size={9}>{DEPT_SHORT[c.department]||'CS'}</Mono></div>
                  </div>
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
            {isSU2&&<div style={{background:'rgba(249,168,79,.06)',border:'1px solid rgba(249,168,79,.2)',borderRadius:8,padding:'9px 14px',fontSize:12,color:'#f9a84f',marginBottom:14}}>⚡ Superuser: click any field below to change it directly — no approval needed.</div>}
            <div style={{marginBottom:14}}><SearchBar value={search} onChange={setSearch} placeholder="Search users…"/></div>
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              {allUsers.filter(u=>!search||u.username.toLowerCase().includes(search.toLowerCase())).map((u,i)=>{
                const isAdm=admins.includes(u.username.toLowerCase());
                const role=isAdm?ROLE.ADMIN:u.account_type==='external'?ROLE.EXTERNAL:ROLE.USER;
                return(
                  <UserRow key={i} u={u} role={role} isAdm={isAdm} isSU2={isSU2}
                    onRoleChange={async(newAccountType)=>{
                      await dbApplyStatusChange(u.username,newAccountType);
                      const[users,adms]=await Promise.all([dbLoadUsers(),dbLoadAdmins()]);
                      setAllUsers(users);setAdmins(adms);
                    }}
                    onAdminToggle={async()=>{
                      const next=isAdm?admins.filter(a=>a!==u.username.toLowerCase()):[...admins,u.username.toLowerCase()];
                      setAdmins(next);await dbSetAdmins(next);
                    }}
                    onYearChange={async(yr)=>{
                      await supabase.from('users').update({year:yr}).eq('username',u.username);
                      setAllUsers(prev=>prev.map(x=>x.username===u.username?{...x,year:yr}:x));
                    }}
                  />
                );
              })}
              {allUsers.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:40,border:'1px dashed var(--border)',borderRadius:12}}>No users yet.</div>}
            </div>
          </div>
        )}

        {tab==='analytics'&&<AnalyticsTab courses={courses}/>}
        {tab==='status'&&<StatusChangesTab reviewerUsername={user.username}/>}
        {tab==='approvals'&&isSU2&&<ApprovalsTab onCourseChange={onCoursesChange} courses={courses} reviewerUsername={user.username}/>}
        {tab==='admins'&&isSU2&&<ManageAdminsTab/>}
        {tab==='settings'&&isSU2&&<SettingsTab onReload={()=>onCoursesChange([...courses])}/>}
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

/* ═══════════════ STATUS CHANGE MODAL ═══════════════ */
function StatusChangeModal({user,onClose,onSubmitted}){
  const[reason,setReason]=useState('');
  const[targetType,setTargetType]=useState('');
  const[loading,setLoading]=useState(false);
  const[pending,setPending]=useState(null);
  const[checking,setChecking]=useState(true);

  // Map account_type to role key for display
  const currentType=user.accountType||user.account_type||'student';
  const currentLabel=USER_TYPES.find(u=>u.roleKey===(user.role===ROLE.EXTERNAL?'external':'user'))?.shortCode||
    (user.role===ROLE.EXTERNAL?'External':'Student');

  // Available types to switch to (exclude current)
  const options=USER_TYPES.filter(t=>
    t.roleKey!==(user.role===ROLE.EXTERNAL?'external':'user')
  );

  useEffect(()=>{
    if(options.length>0)setTargetType(options[0].id);
    dbGetPendingStatusRequest(user.username).then(p=>{setPending(p);setChecking(false);});
  },[]);

  const submit=async()=>{
    if(!targetType)return;
    setLoading(true);
    const target=USER_TYPES.find(t=>t.id===targetType);
    await dbSubmitStatusRequest({
      id:`sr-${Date.now()}`,
      username:user.username,
      from_type:currentType,
      to_type:target?.id||targetType,
      reason:reason.trim()||null,
      status:'pending',
      requested_at:new Date().toISOString()
    });
    setLoading(false);
    onSubmitted?.();
    onClose();
  };

  if(checking) return null;

  const target=USER_TYPES.find(t=>t.id===targetType);

  return(
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="scale-in modal-inner" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:'28px 30px',maxWidth:440,width:'100%',margin:'auto',boxShadow:'var(--shadow)'}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:'var(--text)',marginBottom:6}}>Change Account Status</div>
        <p style={{color:'var(--muted)',fontSize:13,marginBottom:20}}>Request a status change. An admin or superuser will review and approve or reject it.</p>

        {pending?(
          <div style={{background:'rgba(249,168,79,.07)',border:'1px solid rgba(249,168,79,.25)',borderRadius:10,padding:'16px 18px',textAlign:'center'}}>
            <div style={{fontSize:24,marginBottom:8}}>⏳</div>
            <div style={{fontSize:14,fontWeight:600,color:'#f9a84f',marginBottom:4}}>Request Pending</div>
            <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.6}}>
              You already have a pending request to change your status.<br/>
              Submitted {new Date(pending.requested_at).toLocaleString()}
            </div>
            {pending.reason&&<div style={{fontSize:12,color:'var(--text)',marginTop:8,fontStyle:'italic'}}>"{pending.reason}"</div>}
            <button onClick={onClose} style={{marginTop:16,background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'8px 20px',fontSize:13}}>Close</button>
          </div>
        ):(
          <>
            {/* Current → Target */}
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20,background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'14px 16px'}}>
              <div style={{flex:1,textAlign:'center'}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',letterSpacing:1,marginBottom:4}}>CURRENT</div>
                <div style={{background:ROLE_BG[user.role]||ROLE_BG.user,color:ROLE_COLOR[user.role]||ROLE_COLOR.user,borderRadius:8,padding:'6px 14px',fontSize:13,fontWeight:600,display:'inline-block'}}>{currentLabel}</div>
              </div>
              <div style={{fontSize:22,color:'var(--muted)',flexShrink:0}}>→</div>
              <div style={{flex:1,textAlign:'center'}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',letterSpacing:1,marginBottom:4}}>REQUESTING</div>
                {target&&<div style={{background:`${target.color}15`,color:target.color,border:`1px solid ${target.color}40`,borderRadius:8,padding:'6px 14px',fontSize:13,fontWeight:600,display:'inline-block'}}>{target.shortCode}</div>}
              </div>
            </div>

            {/* Pick target type if more than one option */}
            {options.length>1&&(
              <div style={{marginBottom:16}}>
                <div style={{fontSize:11,color:'var(--muted)',marginBottom:8,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>SWITCH TO</div>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {options.map(o=>(
                    <button key={o.id} onClick={()=>setTargetType(o.id)} style={{padding:'10px 14px',borderRadius:8,cursor:'pointer',border:`1px solid ${targetType===o.id?o.color+'70':'var(--border)'}`,background:targetType===o.id?`${o.color}10`:'var(--input-bg)',color:targetType===o.id?o.color:'var(--muted)',fontWeight:targetType===o.id?600:400,fontSize:13,textAlign:'left',display:'flex',alignItems:'center',gap:10}}>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:targetType===o.id?`${o.color}20`:'var(--border)',color:targetType===o.id?o.color:'var(--muted)',borderRadius:4,padding:'2px 7px'}}>{o.shortCode}</span>
                      <div>
                        <div>{o.label}</div>
                        {o.description&&<div style={{fontSize:11,color:'var(--muted)',marginTop:1}}>{o.description}</div>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reason */}
            <div style={{marginBottom:18}}>
              <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>REASON (optional)</div>
              <textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="Tell the admin why you want to change your account type…" rows={3} style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 13px',color:'var(--text)',fontSize:13,fontFamily:"'DM Sans',sans-serif",resize:'none'}}/>
            </div>

            <div style={{background:'rgba(79,156,249,.05)',border:'1px solid rgba(79,156,249,.15)',borderRadius:8,padding:'9px 13px',fontSize:11,color:'var(--muted)',marginBottom:18,lineHeight:1.6}}>
              ℹ️ Your request will be reviewed by an admin. You'll keep your current access until it's approved. You cannot submit another request while one is pending.
            </div>

            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button onClick={onClose} style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'9px 18px',fontSize:13}}>Cancel</button>
              <button onClick={submit} disabled={loading||!targetType} style={{background:loading||!targetType?'var(--border)':'#4f9cf9',border:'none',borderRadius:8,color:loading||!targetType?'var(--muted)':'#000',cursor:'pointer',padding:'9px 22px',fontSize:13,fontWeight:700}}>
                {loading?'Submitting…':'Submit Request'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════ STATUS CHANGES TAB (admin/superuser) ═══════════════ */
function StatusChangesTab({reviewerUsername}){
  const[pending,setPending]=useState([]);const[history,setHistory]=useState([]);
  const[tab,setTab]=useState('pending');const[loading,setLoading]=useState(true);
  const[busy,setBusy]=useState('');const[rejectModal,setRejectModal]=useState(null);
  const[rejectNote,setRejectNote]=useState('');

  const load=async()=>{
    setLoading(true);
    const[p,all]=await Promise.all([dbLoadStatusRequests('pending'),dbLoadAllStatusRequests()]);
    setPending(p);setHistory(all.filter(r=>r.status!=='pending'));setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const approve=async req=>{
    setBusy(req.id);
    const target=USER_TYPES.find(t=>t.id===req.to_type);
    const newAccountType=target?.roleKey==='external'?'external':'student';
    await dbApplyStatusChange(req.username,newAccountType);
    await dbReviewStatusRequest(req.id,'approved',reviewerUsername);
    setBusy('');await load();
  };

  const reject=async()=>{
    if(!rejectModal)return;setBusy(rejectModal.id);
    await dbReviewStatusRequest(rejectModal.id,'rejected',reviewerUsername,rejectNote);
    setRejectModal(null);setRejectNote('');setBusy('');await load();
  };

  const list=tab==='pending'?pending:history;

  if(loading)return<div style={{color:'var(--muted)',textAlign:'center',padding:40}}>Loading…</div>;

  return(
    <div className="fade-up">
      {/* Reject modal */}
      {rejectModal&&(
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setRejectModal(null)}>
          <div className="scale-in" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,padding:'24px 26px',maxWidth:400,width:'100%',boxShadow:'var(--shadow)'}}>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'var(--text)',marginBottom:12}}>Reject Request</div>
            <textarea value={rejectNote} onChange={e=>setRejectNote(e.target.value)} placeholder="Reason for rejection (optional)…" rows={3} style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 12px',color:'var(--text)',fontSize:13,resize:'none',marginBottom:14}}/>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button onClick={()=>setRejectModal(null)} style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'8px 16px',fontSize:13}}>Cancel</button>
              <button onClick={reject} style={{background:'rgba(240,80,80,.15)',border:'1px solid rgba(240,80,80,.4)',borderRadius:8,color:'#f05050',cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:700}}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}

      <div style={{background:'rgba(168,249,79,.06)',border:'1px solid rgba(168,249,79,.2)',borderRadius:10,padding:'11px 15px',marginBottom:18,display:'flex',gap:10}}>
        <span style={{fontSize:18}}>🔄</span>
        <div><div style={{color:'#a8f94f',fontSize:13,fontWeight:600,marginBottom:2}}>Status Change Requests</div><div style={{color:'var(--muted)',fontSize:12}}>Review user requests to change their account type. Approving immediately updates their access.</div></div>
      </div>

      {/* Sub-tabs */}
      <div style={{display:'flex',gap:4,borderBottom:'1px solid var(--border)',marginBottom:18}}>
        {[{id:'pending',label:`Pending${pending.length>0?` (${pending.length})`:''}`,color:pending.length>0?'#a8f94f':undefined},{id:'history',label:'History'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{background:'none',border:'none',borderBottom:tab===t.id?`2px solid ${t.color||'#a8f94f'}`:'2px solid transparent',color:tab===t.id?(t.color||'#a8f94f'):'var(--muted)',cursor:'pointer',padding:'7px 16px',fontSize:13,fontWeight:tab===t.id?600:400}}>{t.label}</button>
        ))}
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:11}}>
        {list.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:40,border:'1px dashed var(--border)',borderRadius:12,fontSize:13}}>{tab==='pending'?'✅ No pending requests.':'No history yet.'}</div>}
        {list.map((r,i)=>{
          const fromUT=USER_TYPES.find(t=>t.id===r.from_type||t.roleKey===r.from_type);
          const toUT=USER_TYPES.find(t=>t.id===r.to_type||t.roleKey===r.to_type);
          const isPending=r.status==='pending';
          const isApproved=r.status==='approved';
          return(
            <div key={r.id} className={`stagger-${Math.min(i%4+1,4)}`} style={{background:'var(--card)',border:`1px solid ${isPending?'rgba(168,249,79,.2)':isApproved?'rgba(127,218,150,.2)':'rgba(240,80,80,.2)'}`,borderRadius:11,padding:'15px 18px'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
                <div style={{flex:1,minWidth:180}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6,flexWrap:'wrap'}}>
                    <Avatar name={r.username} size={28}/>
                    <span style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>@{r.username}</span>
                    {/* From → To */}
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:ROLE_BG.user,color:ROLE_COLOR.user,borderRadius:4,padding:'2px 7px'}}>{fromUT?.shortCode||r.from_type}</span>
                      <span style={{color:'var(--muted)',fontSize:12}}>→</span>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:`${(toUT?.color||'#a8f94f')}15`,color:toUT?.color||'#a8f94f',borderRadius:4,padding:'2px 7px'}}>{toUT?.shortCode||r.to_type}</span>
                    </div>
                    {!isPending&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:isApproved?'rgba(127,218,150,.15)':'rgba(240,80,80,.15)',color:isApproved?'#7fda96':'#f05050',borderRadius:4,padding:'2px 7px'}}>{r.status.toUpperCase()}</span>}
                  </div>
                  {r.reason&&<p style={{fontSize:12,color:'var(--muted)',margin:'0 0 4px',fontStyle:'italic'}}>"{r.reason}"</p>}
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',display:'flex',gap:12,flexWrap:'wrap'}}>
                    <span>Requested {new Date(r.requested_at).toLocaleString()}</span>
                    {!isPending&&r.reviewed_by&&<span>Reviewed by @{r.reviewed_by}</span>}
                    {!isPending&&r.note&&<span>Note: {r.note}</span>}
                  </div>
                </div>
                {isPending&&(
                  <div style={{display:'flex',gap:8,flexShrink:0}}>
                    <button onClick={()=>approve(r)} disabled={busy===r.id} style={{background:'rgba(127,218,150,.12)',border:'1px solid rgba(127,218,150,.35)',borderRadius:8,color:'#7fda96',cursor:'pointer',padding:'7px 14px',fontSize:12,fontWeight:700}}>
                      {busy===r.id?'…':'✓ Approve'}
                    </button>
                    <button onClick={()=>setRejectModal(r)} disabled={busy===r.id} style={{background:'rgba(240,80,80,.1)',border:'1px solid rgba(240,80,80,.3)',borderRadius:8,color:'#f05050',cursor:'pointer',padding:'7px 12px',fontSize:12,fontWeight:700}}>✕ Reject</button>
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

/* ═══════════════ COURSE CARD (memoised) ═══════════════ */
const CourseCard=memo(function CourseCard({course:c,index:i,pct,viewed,bookmarked,isPriv,onSelect}){
  const accent=YEAR_COLORS[c.year]||CARD_ACCENTS[i%CARD_ACCENTS.length];
  return(
    <div className={`stagger-${Math.min(i%4+1,4)}`}
      onClick={()=>onSelect(c.id)}
      style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:'18px 20px',
        cursor:'pointer',transition:'transform .18s,box-shadow .18s',
        borderTop:`3px solid ${accent}`,position:'relative',boxShadow:'none'}}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,.2)';}}
      onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>
      <div style={{position:'absolute',top:12,right:12,display:'flex',gap:6,alignItems:'center'}}>
        {viewed&&<div style={{width:7,height:7,borderRadius:'50%',background:'#7fda96'}} title="Visited"/>}
        {bookmarked&&<span style={{fontSize:12}}>🔖</span>}
      </div>
      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:accent,letterSpacing:2,textTransform:'uppercase',marginBottom:4,display:'flex',alignItems:'center',gap:6}}>
        {c.courseName} · SEM {c.semester}
        <span style={{background:`${DEPT_COLOR[c.department]||'#4f9cf9'}18`,color:DEPT_COLOR[c.department]||'#4f9cf9',borderRadius:4,padding:'1px 6px',fontSize:8,letterSpacing:1}}>{DEPT_SHORT[c.department]||'CS'}</span>
      </div>
      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:16,color:'var(--text)',marginBottom:11,lineHeight:1.3,paddingRight:30}}>{c.chapterTitle}</div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8}}>
        <Tag color={accent}>{c.conceptCount} concepts</Tag>
        <Tag color={accent}>{c.termCount} terms</Tag>
        <Tag color={accent}>{c.qCount} Q&A</Tag>
      </div>
      {!isPriv&&<ProgressBar pct={pct} color={accent}/>}
      <div style={{marginTop:9,fontSize:10,color:'var(--muted)',fontFamily:"'IBM Plex Mono',monospace"}}>Added {c.addedAt}</div>
    </div>
  );
});

/* ═══════════════ HOME ═══════════════ */
function Home({user,courses,progress,onSelectCourse,onLogout,onShowAdmin,onProgressUpdate,bookmarks,toggleBookmark,dark,toggleTheme}){
  const isExternal=user.role===ROLE.EXTERNAL;
  const[activeYear,setActiveYear]=useState(isExternal?'all':(user.year||1));
  const[activeSemester,setActiveSemester]=useState(1);
  const[activeDept,setActiveDept]=useState('all');
  const[searchRaw,setSearchRaw]=useState('');
  const[search,setSearch]=useState('');
  const[showBookmarks,setShowBookmarks]=useState(false);
  const[showStatusModal,setShowStatusModal]=useState(false);
  const[showPWADebug,setShowPWADebug]=useState(false);
  const nativePrompt=usePWAPrompt();
  const[statusMsg,setStatusMsg]=useState('');
  const isPriv=user.role===ROLE.SUPERUSER||user.role===ROLE.ADMIN;

  // Debounce search — input feels instant, filtering only runs after 150ms pause
  useEffect(()=>{
    const t=setTimeout(()=>setSearch(searchRaw),150);
    return()=>clearTimeout(t);
  },[searchRaw]);

  const visible=useMemo(()=>courses.filter(c=>{
    const matchYear=activeYear==='all'||c.year===activeYear;
    const matchSem=activeYear==='all'||c.semester===activeSemester;
    const matchDept=activeDept==='all'||c.department===activeDept;
    const lq=search.toLowerCase();
    const matchSearch=!search||c.chapterTitle.toLowerCase().includes(lq)||c.courseName.toLowerCase().includes(lq);
    return matchYear&&matchSem&&matchDept&&matchSearch;
  }),[courses,activeYear,activeSemester,activeDept,search]);

  const semCount=useCallback(s=>courses.filter(c=>(activeYear==='all'||c.year===activeYear)&&c.semester===s).length,[courses,activeYear]);
  const deptCount=useCallback(d=>courses.filter(c=>(activeYear==='all'||c.year===activeYear)&&(activeYear==='all'||c.semester===activeSemester)&&(d==='all'||c.department===d)).length,[courses,activeYear,activeSemester]);

  const bookmarkedCourses=useMemo(()=>courses.filter(c=>bookmarks.includes(c.id)),[courses,bookmarks]);
  const pct=useCallback(id=>{const cp=progress[id];const m=courses.find(c=>c.id===id);if(!cp||!m||m.qCount===0)return 0;return Math.round((cp.openedQs?.length||0)/m.qCount*100);},[progress,courses]);
  const yearStat=useCallback(y=>{const yc=courses.filter(c=>c.year===y);if(!yc.length)return null;return `${yc.filter(c=>progress[c.id]?.viewed).length}/${yc.length} started`;},[courses,progress]);

  const selectYear=useCallback(y=>{setActiveYear(y);setActiveSemester(1);setActiveDept('all');setSearch('');setSearchRaw('');},[]);

  return(
    <div className="home-page" style={{maxWidth:990,margin:'0 auto',padding:'34px 20px 88px'}}>
      {/* Top bar */}
      <div className="topbar fade-up" style={{
        display:'flex',alignItems:'center',justifyContent:'space-between',
        marginBottom:24,gap:10,flexWrap:'wrap',
        position:'sticky',top:0,
        background:'var(--bg)',
        zIndex:50,
        padding:'10px 0',
        marginLeft:-20,marginRight:-20,paddingLeft:20,paddingRight:20,
        borderBottom:'1px solid var(--border)',
        backdropFilter:'blur(12px)',
        WebkitBackdropFilter:'blur(12px)',
      }}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <Logo onClick={null} size="md"/>
          <div style={{width:1,height:32,background:'var(--border)'}}/>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <Avatar name={user.displayName} size={34}/>
            <div>
              <div style={{fontSize:14,fontWeight:600,color:'var(--text)'}}>{user.displayName}</div>
              <div style={{display:'flex',alignItems:'center',gap:6,marginTop:3,flexWrap:'wrap'}}>
                <RolePill role={user.role} accountType={user.accountType||user.account_type}/>
                {user.role===ROLE.USER&&!user.isGuest&&<Mono color="var(--muted)" size={9}>Yr {user.year} · @{user.username}</Mono>}
                {isExternal&&<Mono color="#a8f94f" size={9}>@{user.username} · External</Mono>}
                {user.isGuest&&<Mono color="var(--muted)" size={9}>Preview mode</Mono>}
              </div>
            </div>
          </div>
        </div>

        {/* Right side — ordered: theme | install | bookmarks | change status | panel | sign out | 🔔 */}
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',flexShrink:0}}>
          <ThemeToggle dark={dark} toggle={toggleTheme}/>

          {/* Install App */}
          {!window.matchMedia('(display-mode: standalone)').matches&&!window.navigator.standalone&&nativePrompt&&(
            <button onClick={async()=>{
              if(!nativePrompt)return;
              nativePrompt.prompt();
              const{outcome}=await nativePrompt.userChoice;
              if(outcome==='accepted') savePwaState({neverShow:true});
              _pwaPromptEvent=null;
            }} style={{background:'rgba(79,156,249,.1)',border:'1px solid rgba(79,156,249,.3)',borderRadius:8,color:'#4f9cf9',cursor:'pointer',padding:'8px 12px',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',gap:5}}>
              📲 Install App
            </button>
          )}

          {/* Bookmarks */}
          {bookmarks.length>0&&<button onClick={()=>setShowBookmarks(s=>!s)} style={{background:showBookmarks?'rgba(249,168,79,.15)':'var(--surface)',border:`1px solid ${showBookmarks?'#f9a84f':'var(--border)'}`,borderRadius:8,color:showBookmarks?'#f9a84f':'var(--muted)',cursor:'pointer',padding:'8px 12px',fontSize:13,display:'flex',alignItems:'center',gap:5}}>🔖<span className="hide-xs">{bookmarks.length}</span></button>}

          {/* Change Status */}
          {!user.isGuest&&(user.role===ROLE.USER||user.role===ROLE.EXTERNAL)&&(
            <button onClick={()=>setShowStatusModal(true)} title="Request account status change" style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'8px 12px',fontSize:12,display:'flex',alignItems:'center',gap:5}}>
              🔄 <span className="hide-xs">Change Status</span>
            </button>
          )}

          {/* Admin Panel */}
          {isPriv&&<button onClick={onShowAdmin} style={{background:ROLE_BG[user.role],border:`1px solid ${ROLE_COLOR[user.role]}40`,borderRadius:8,color:ROLE_COLOR[user.role],cursor:'pointer',padding:'8px 14px',fontSize:12,fontWeight:600}}>{user.role===ROLE.SUPERUSER?'⚡ Panel':'⚙ Panel'}</button>}

          {/* Sign Out */}
          <button onClick={onLogout} title={user.isGuest?'Sign In':'Sign Out'} style={{background:user.isGuest?'#4f9cf9':'none',border:user.isGuest?'none':'1px solid var(--border)',borderRadius:8,color:user.isGuest?'#000':'var(--muted)',cursor:'pointer',padding:'8px 14px',fontSize:12,fontWeight:user.isGuest?700:400}}>
            {user.isGuest?'Sign In':'Sign Out'}
          </button>

          {/* 🔔 Bell — always far right */}
          {!user.isGuest&&<NotificationBell user={user} courses={courses} onNavigate={(courseId,tab)=>{onSelectCourse(courseId,tab);}}/>}
        </div>
      </div>

      {/* PWA Diagnostic panel */}
      {showPWADebug&&<PWADiagnosticPanel onClose={()=>setShowPWADebug(false)}/>}

      {/* Status change modal */}
      {showStatusModal&&<StatusChangeModal user={user} onClose={()=>setShowStatusModal(false)} onSubmitted={()=>{setStatusMsg('✓ Request submitted — an admin will review it shortly.');setTimeout(()=>setStatusMsg(''),4000);}}/>}
      {statusMsg&&<div className="slide-down" style={{background:'rgba(168,249,79,.08)',border:'1px solid rgba(168,249,79,.3)',borderRadius:8,padding:'10px 16px',color:'#a8f94f',fontSize:13,marginBottom:14}}>{statusMsg}</div>}

      {/* Bookmarks panel */}
      {showBookmarks&&bookmarkedCourses.length>0&&(
        <div className="scale-in" style={{background:'var(--surface)',border:'1px solid rgba(249,168,79,.3)',borderRadius:12,padding:'18px 20px',marginBottom:24}}>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'#f9a84f',letterSpacing:2,marginBottom:14}}>🔖 BOOKMARKED COURSES</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:10}}>
            {bookmarkedCourses.map(c=>(
              <div key={c.id} onClick={()=>onSelectCourse(c.id)} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,padding:'12px 14px',cursor:'pointer',borderLeft:`3px solid ${YEAR_COLORS[c.year]}`}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:YEAR_COLORS[c.year],marginBottom:3}}>Yr {c.year} · Sem {c.semester} · {DEPT_SHORT[c.department]||'CS'} · {c.courseName}</div>
                <div style={{fontSize:13,color:'var(--text)',fontWeight:500}}>{c.chapterTitle}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Global announcements strip */}
      <GlobalAnnouncementStrip user={user}/>

      {/* Year tabs */}
      <div className="stagger-1" style={{marginBottom:16}}>
        <Mono color="var(--muted)" size={9}>BROWSE BY YEAR</Mono>
        <div className="year-tabs" style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:10}}>
          {/* External users get an "All Years" tab */}
          {isExternal&&(
            <button className="year-tab" onClick={()=>selectYear('all')} style={{background:activeYear==='all'?'rgba(168,249,79,.1)':'var(--surface)',border:`1px solid ${activeYear==='all'?'rgba(168,249,79,.4)':'var(--border)'}`,borderRadius:10,cursor:'pointer',padding:'10px 18px',transition:'var(--transition)',textAlign:'left'}}>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:16,color:activeYear==='all'?'#a8f94f':'var(--text)'}}>All Years</div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:activeYear==='all'?'#a8f94faa':'var(--muted)',marginTop:2}}>{courses.length} courses</div>
            </button>
          )}
          {YEARS.map(y=>{const active=activeYear===y;const st=yearStat(y);return(
            <button key={y} className="year-tab" onClick={()=>selectYear(y)} style={{background:active?YEAR_BG[y]:'var(--surface)',border:`1px solid ${active?YEAR_COLORS[y]+'60':'var(--border)'}`,borderRadius:10,cursor:'pointer',padding:'10px 18px',transition:'var(--transition)',textAlign:'left'}}>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:16,color:active?YEAR_COLORS[y]:'var(--text)'}}>Year {y}</div>
              {st&&<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:active?YEAR_COLORS[y]+'aa':'var(--muted)',marginTop:2}}>{st}</div>}
            </button>
          );})}
        </div>
      </div>

      {/* Semester tabs — hidden when All Years selected */}
      {activeYear!=='all'&&<div className="stagger-2" style={{marginBottom:20}}>
        <Mono color="var(--muted)" size={9}>SEMESTER</Mono>
        <div style={{display:'flex',gap:8,marginTop:8}}>
          {[1,2].map(s=>{
            const active=activeSemester===s;
            const count=semCount(s);
            const accent=typeof activeYear==='number'?YEAR_COLORS[activeYear]:'#4f9cf9';
            return(
              <button key={s} onClick={()=>setActiveSemester(s)} style={{background:active?(typeof activeYear==='number'?YEAR_BG[activeYear]:'rgba(79,156,249,.1)'):'var(--surface)',border:`1px solid ${active?accent+'60':'var(--border)'}`,borderRadius:10,cursor:'pointer',padding:'9px 20px',transition:'var(--transition)',display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontFamily:"'DM Serif Display',serif",fontSize:15,color:active?accent:'var(--text)'}}>Semester {s}</span>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:active?`${accent}20`:'var(--border)',color:active?accent:'var(--muted)',borderRadius:10,padding:'2px 7px'}}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>}

      {/* Search */}
      <div className="stagger-3" style={{marginBottom:16}}>
        <div style={{position:'relative'}}>
          <SearchBar value={searchRaw} onChange={setSearchRaw} placeholder={activeYear==='all'?`Search all courses…`:`Search Year ${activeYear} Sem ${activeSemester}${activeDept!=='all'?' · '+DEPT_SHORT[activeDept]:''} courses…`}/>
          {!searchRaw&&<div className="kbd-hint" style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:4,padding:'1px 6px',pointerEvents:'none'}}>Press /</div>}
        </div>
      </div>

      {/* Department filter */}
      <div className="stagger-4" style={{marginBottom:20}}>
        <Mono color="var(--muted)" size={9}>DEPARTMENT</Mono>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
          {[{label:'All Departments',key:'all',color:'#8892a4'},...DEPARTMENTS.map(d=>({label:d,key:d,color:DEPT_COLOR[d]}))].map(({label,key,color})=>{
            const active=activeDept===key;
            return(
              <button key={key} onClick={()=>setActiveDept(key)} style={{background:active?`${color}15`:'var(--surface)',border:`1px solid ${active?color+'60':'var(--border)'}`,borderRadius:10,cursor:'pointer',padding:'8px 16px',transition:'var(--transition)',display:'flex',alignItems:'center',gap:7}}>
                {key!=='all'&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,background:active?`${color}25`:'var(--border)',color:active?color:'var(--muted)',borderRadius:4,padding:'2px 6px'}}>{DEPT_SHORT[key]}</span>}
                <span style={{fontSize:13,color:active?color:'var(--text)',fontWeight:active?600:400}}>{label}</span>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:active?`${color}20`:'var(--border)',color:active?color:'var(--muted)',borderRadius:10,padding:'2px 7px'}}>{deptCount(key)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Mono color="var(--muted)" size={9}>{visible.length} COURSE{visible.length!==1?'S':''}{activeYear==='all'?` · ALL YEARS`:` · YEAR ${activeYear} · SEM ${activeSemester}`}{activeDept!=='all'?` · ${DEPT_SHORT[activeDept]}`:''}{search?` · "${search}"`:''}</Mono>

      {visible.length===0?(
        <div style={{textAlign:'center',padding:'50px 24px',border:'1px dashed var(--border)',
          borderRadius:16,marginTop:16,background:'var(--surface)'}}>
          <div style={{fontSize:48,marginBottom:14,lineHeight:1}}>
            {search?'🔍':isPriv?'➕':'📭'}
          </div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:'var(--text)',marginBottom:8}}>
            {search?`No results for "${search}"`
             :activeYear==='all'?'No courses yet'
             :`No Year ${activeYear}, Semester ${activeSemester} courses yet`}
          </div>
          <p style={{color:'var(--muted)',fontSize:13,lineHeight:1.6,maxWidth:280,margin:'0 auto 16px'}}>
            {search?'Try a different keyword or clear the search.'
             :isPriv?'Open the admin panel and add courses for this year and semester.'
             :'No courses have been added here yet. Check back soon.'}
          </p>
          {search&&(
            <button onClick={()=>{setSearch('');setSearchRaw('');}}
              style={{background:'rgba(79,156,249,.1)',border:'1px solid rgba(79,156,249,.3)',
                borderRadius:8,color:'#4f9cf9',cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:600}}>
              Clear search
            </button>
          )}
          {!search&&isPriv&&(
            <button onClick={onShowAdmin}
              style={{background:ROLE_BG[user.role],border:`1px solid ${ROLE_COLOR[user.role]}40`,
                borderRadius:8,color:ROLE_COLOR[user.role],cursor:'pointer',
                padding:'8px 18px',fontSize:13,fontWeight:600}}>
              {user.role===ROLE.SUPERUSER?'⚡ Open Panel':'⚙ Open Panel'}
            </button>
          )}
        </div>
      ):(
        <div className="course-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(278px,1fr))',gap:14,marginTop:16}}>
          {visible.map((c,i)=>(
            <CourseCard key={c.id} course={c} index={i} pct={pct(c.id)}
              viewed={!!progress[c.id]?.viewed} bookmarked={bookmarks.includes(c.id)}
              isPriv={isPriv} onSelect={onSelectCourse}/>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════ ROOT APP ═══════════════ */
const SESSION_KEY = 'sh-session';

function saveSession(u){
  try{localStorage.setItem(SESSION_KEY,JSON.stringify({...u,savedAt:Date.now()}));}catch{}
}
function loadSession(){
  try{
    const raw=localStorage.getItem(SESSION_KEY);
    if(!raw)return null;
    const s=JSON.parse(raw);
    // Expire sessions older than 30 days
    if(Date.now()-s.savedAt>30*24*60*60*1000){localStorage.removeItem(SESSION_KEY);return null;}
    return s;
  }catch{return null;}
}
function clearSession(){try{localStorage.removeItem(SESSION_KEY);}catch{}}

/* ═══════════════ GLOBAL ERROR TOAST ═══════════════ */
function useErrorToast(){
  const[err,setErr]=useState('');
  useEffect(()=>{
    const h=e=>{
      const msg=e?.reason?.message||e?.message||'Something went wrong';
      if(msg.includes('ResizeObserver')||msg.includes('Script error'))return; // ignore noise
      setErr(msg);setTimeout(()=>setErr(''),5000);
    };
    window.addEventListener('unhandledrejection',h);
    window.addEventListener('error',h);
    return()=>{window.removeEventListener('unhandledrejection',h);window.removeEventListener('error',h);};
  },[]);
  return[err,setErr];
}
function ErrorToast({message,onDismiss}){
  if(!message)return null;
  return(
    <div className="slide-down" style={{position:'fixed',top:16,left:'50%',transform:'translateX(-50%)',background:'rgba(240,80,80,.95)',backdropFilter:'blur(8px)',border:'1px solid rgba(240,80,80,.6)',borderRadius:10,padding:'10px 18px',display:'flex',alignItems:'center',gap:10,zIndex:9998,maxWidth:420,width:'calc(100% - 32px)',boxShadow:'0 4px 20px rgba(240,80,80,.3)'}}>
      <span style={{fontSize:16}}>⚠️</span>
      <span style={{flex:1,fontSize:12.5,color:'#fff',lineHeight:1.4}}>{message}</span>
      <button onClick={onDismiss} style={{background:'none',border:'none',color:'rgba(255,255,255,.7)',cursor:'pointer',fontSize:16,padding:0,lineHeight:1}}>✕</button>
    </div>
  );
}

/* ═══════════════ CONFIRM MODAL ═══════════════ */
// Usage: const confirmed = await confirm({title, message, danger})
let _confirmResolve=null;
function useConfirm(){
  const[state,setState]=useState(null);
  const confirm=useCallback((opts)=>new Promise(res=>{
    _confirmResolve=res;setState(opts);
  }),[]);
  const ConfirmModal=state?(
    <div className="modal-overlay" onClick={()=>{setState(null);_confirmResolve?.(false);}}>
      <div className="scale-in" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,padding:'26px 28px',maxWidth:380,width:'100%',boxShadow:'var(--shadow)'}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:19,color:'var(--text)',marginBottom:8}}>{state.title||'Are you sure?'}</div>
        {state.message&&<p style={{fontSize:13,color:'var(--muted)',lineHeight:1.6,marginBottom:20}}>{state.message}</p>}
        <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
          <button onClick={()=>{setState(null);_confirmResolve?.(false);}} style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'9px 18px',fontSize:13}}>Cancel</button>
          <button onClick={()=>{setState(null);_confirmResolve?.(true);}} style={{background:state.danger?'rgba(240,80,80,.15)':'rgba(79,156,249,.15)',border:`1px solid ${state.danger?'rgba(240,80,80,.4)':'rgba(79,156,249,.4)'}`,borderRadius:8,color:state.danger?'#f05050':'#4f9cf9',cursor:'pointer',padding:'9px 20px',fontSize:13,fontWeight:700}}>
            {state.confirmLabel||'Confirm'}
          </button>
        </div>
      </div>
    </div>
  ):null;
  return[confirm,ConfirmModal];
}

/* ═══════════════ PAGE TITLE HOOK ═══════════════ */
function usePageTitle(view,active){
  useEffect(()=>{
    const base='StudyHub';
    if(view==='auth')document.title=base;
    else if(view==='course'&&active?.data?.chapterTitle)document.title=`${active.data.chapterTitle} · ${base}`;
    else if(view==='admin')document.title=`Admin Panel · ${base}`;
    else document.title=base;
  },[view,active?.data?.chapterTitle]);
}

/* ═══════════════ KEYBOARD SHORTCUTS ═══════════════ */
function useKeyboardShortcuts({onSearch,onEscape}){
  useEffect(()=>{
    const h=e=>{
      // '/' focuses search — ignore if typing in input/textarea
      if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){
        e.preventDefault();onSearch?.();
      }
      // Escape
      if(e.key==='Escape')onEscape?.();
    };
    window.addEventListener('keydown',h);
    return()=>window.removeEventListener('keydown',h);
  },[onSearch,onEscape]);
}

/* Silent refresh toast */
function SyncToast({visible}){
  if(!visible)return null;
  return(
    <div className="fade-in" style={{position:'fixed',bottom:52,left:20,background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,padding:'6px 14px',display:'flex',alignItems:'center',gap:8,zIndex:9999,fontSize:11,color:'var(--muted)',fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1,boxShadow:'var(--shadow)'}}>
      <span style={{animation:'spin .8s linear infinite',display:'inline-block',fontSize:12}}>⟳</span> Syncing…
    </div>
  );
}

export default function App(){
  const[dark,toggleTheme]=useTheme();
  const[bookmarks,toggleBookmark]=useBookmarks();
  const online=useOnline();
  const[errMsg,setErrMsg]=useErrorToast();
  const[confirm,ConfirmModal]=useConfirm();

  // Expose confirm globally so child components can call window.shConfirm()
  useEffect(()=>{window.shConfirm=confirm;return()=>{delete window.shConfirm;};},[confirm]);

  // Restore session from localStorage on mount
  const savedSession=loadSession();
  const[view,setView]=useState(savedSession?'home':'auth');
  const[user,setUser]=useState(savedSession||null);
  const[courses,setCourses]=useState([]);
  const[active,setActive]=useState(null);
  const[progress,setProgress]=useState({});
  const[loading,setLoading]=useState(false);
  const[syncing,setSyncing]=useState(false);
  const[showWelcome,setShowWelcome]=useState(false);

  // Page title updates on view change
  usePageTitle(view,active);

  // Global search ref for keyboard shortcut
  const searchRef=useRef(null);
  useKeyboardShortcuts({
    onSearch:useCallback(()=>{
      // Focus search bar in home or questions filter — best-effort
      const el=document.querySelector('input[placeholder*="Search"]');
      el?.focus();
    },[]),
    onEscape:useCallback(()=>{
      // Close course view → home, or home stays
      if(view==='course')setView('home');
    },[view]),
  });

  // ── Startup: config + courses + restore progress ─────────────────────
  useEffect(()=>{
    Promise.all([loadDepartments(),loadUserTypes()]).catch(()=>{});

    // Reload courses silently
    const loadCourses=()=>{
      dbLoadCourseIndex().then(data=>{
        setCourses(data);
      }).catch(async()=>{
        const cached=[];
        for(let i=0;i<localStorage.length;i++){
          const k=localStorage.key(i);
          if(k?.startsWith('sh-course-cache-')){
            try{const d=JSON.parse(localStorage.getItem(k));if(d?.data)cached.push({id:k.replace('sh-course-cache-',''),year:d.year,semester:d.semester||1,department:d.department||'Computer Science',courseName:d.data.courseName,chapterTitle:d.data.chapterTitle,conceptCount:d.data.keyConcepts?.length||0,termCount:d.data.definitions?.length||0,qCount:d.data.questions?.length||0,addedAt:'Cached'});}catch{}
          }
        }
        if(cached.length>0)setCourses(cached);
      });
    };
    loadCourses();

    // Restore progress for saved session
    if(savedSession&&savedSession.role===ROLE.USER&&!savedSession.isGuest){
      dbLoadProgress(savedSession.username).then(setProgress).catch(()=>{});
    }
  },[]);

  // ── Real-time Supabase subscriptions ─────────────────────────────────
  useEffect(()=>{
    // Courses channel — when any course is added/removed/updated
    const coursesCh=supabase.channel('rt-courses')
      .on('postgres_changes',{event:'*',schema:'public',table:'courses'},()=>{
        setSyncing(true);
        dbLoadCourseIndex().then(data=>{setCourses(data);setSyncing(false);}).catch(()=>setSyncing(false));
      }).subscribe();

    // Announcements channel
    const annCh=supabase.channel('rt-announcements')
      .on('postgres_changes',{event:'*',schema:'public',table:'announcements'},()=>{
        // Just trigger a re-render signal — GlobalAnnouncementStrip will re-fetch
        setSyncing(true);setTimeout(()=>setSyncing(false),600);
      }).subscribe();

    // Assignments — push notification on new one if permission granted
    const assignCh=supabase.channel('rt-assignments')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'assignments'},(payload)=>{
        setSyncing(true);setTimeout(()=>setSyncing(false),600);
        if(payload.new){
          pushNotification(`📋 New Assignment: ${payload.new.title}`,payload.new.due_date?`Due ${new Date(payload.new.due_date).toLocaleDateString()}`:'Check StudyHub for details');
        }
      }).subscribe();

    // CAs channel
    const caCh=supabase.channel('rt-cas')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'course_cas'},(payload)=>{
        setSyncing(true);setTimeout(()=>setSyncing(false),600);
        if(payload.new){
          pushNotification(`📝 New ${payload.new.type}: ${payload.new.title}`,payload.new.date?`On ${new Date(payload.new.date).toLocaleDateString()}`:'Check StudyHub for details');
        }
      }).subscribe();

    // Pending approvals counter (superuser only)
    const pendingCh=supabase.channel('rt-pending')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'pending_actions'},()=>{
        setSyncing(true);setTimeout(()=>setSyncing(false),600);
        if(user?.role===ROLE.SUPERUSER){
          pushNotification('⚡ New Approval Request','An admin has submitted a request for your approval on StudyHub.');
        }
      }).subscribe();

    // Status change requests — detect when own request is approved/rejected
    const statusCh=supabase.channel('rt-status-requests')
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'status_change_requests'},async(payload)=>{
        if(!user||user.isGuest)return;
        const row=payload.new;
        if(row.username!==user.username)return;
        if(row.status==='approved'){
          const newRole=await resolveRole(user.username);
          const updated={...user,role:newRole,accountType:newRole===ROLE.EXTERNAL?'external':'student'};
          setUser(updated);saveSession(updated);
          pushNotification('✅ Status change approved',`Your account is now "${row.to_type}". Changes are live.`);
        } else if(row.status==='rejected'){
          pushNotification('❌ Status change rejected',row.note||'Your request was declined. You can submit a new one.');
        }
      }).subscribe();

    return()=>{
      supabase.removeChannel(coursesCh);
      supabase.removeChannel(annCh);
      supabase.removeChannel(assignCh);
      supabase.removeChannel(caCh);
      supabase.removeChannel(pendingCh);
      supabase.removeChannel(statusCh);
    };
  },[user?.role]);

  // ── Periodic silent background refresh (every 90s) ────────────────────
  useEffect(()=>{
    if(!online)return;
    const tick=setInterval(async()=>{
      setSyncing(true);
      try{
        await Promise.all([
          dbLoadCourseIndex().then(setCourses),
          loadDepartments(),
          loadUserTypes(),
          ...(user&&!user.isGuest?[dbLoadProgress(user.username).then(setProgress)]:[]),
        ]);
        // Re-check role in case a status change was approved
        if(user&&!user.isGuest&&(user.role===ROLE.USER||user.role===ROLE.EXTERNAL)){
          const newRole=await resolveRole(user.username);
          if(newRole!==user.role){
            const updated={...user,role:newRole,accountType:newRole===ROLE.EXTERNAL?'external':'student'};
            setUser(updated);
            saveSession(updated);
            pushNotification('✅ Account status updated','Your account type has been changed on StudyHub.');
          }
        }
      }catch{}finally{setSyncing(false);}
    },90_000);
    return()=>clearInterval(tick);
  },[online,user?.username,user?.role]);

  // ── Auth handlers ─────────────────────────────────────────────────────
  const handleLogin=useCallback(async u=>{
    setUser(u);
    saveSession(u);
    if(u.role===ROLE.USER&&!u.isGuest){
      const p=await dbLoadProgress(u.username).catch(()=>({}));
      setProgress(p);
    }
    if(u.isNew) setShowWelcome(true);
    setView('home');
  },[]);

  const handleGuest=useCallback(()=>{
    setUser({username:'guest',displayName:'Guest',role:ROLE.USER,isGuest:true,year:1});
    setView('home');
  },[]);

  const handleLogout=useCallback(()=>{
    clearSession();
    setUser(null);setProgress({});setActive(null);setView('auth');
  },[]);

  const handleSelect=useCallback(async(id,initialTab)=>{
    setLoading(true);
    let data=null,year=null,semester=1,department='Computer Science';
    try{
      data=await dbLoadCourseData(id);
      const meta=courses.find(c=>c.id===id);
      year=meta?.year;semester=meta?.semester||1;department=meta?.department||'Computer Science';
    }catch{
      try{const c=JSON.parse(localStorage.getItem(CACHE_KEY(id)));data=c?.data;year=c?.year;semester=c?.semester||1;department=c?.department||'Computer Science';}catch{}
    }
    if(data){setActive({id,data,year,semester,department,initialTab:initialTab||null});setView('course');}
    setLoading(false);
  },[courses]);

  const handleProgress=useCallback(async p=>{
    setProgress(p);
    if(user?.role===ROLE.USER&&!user?.isGuest)
      await dbSaveProgress(user.username,p).catch(()=>{});
  },[user?.username,user?.role,user?.isGuest]);

  const goToSignUp=useCallback(()=>{clearSession();setUser(null);setProgress({});setActive(null);setView('auth');},[]);

  return(
    <>
      <style>{css}</style>
      {!online&&<OfflineBanner/>}
      <SyncToast visible={syncing&&online}/>
      <ErrorToast message={errMsg} onDismiss={()=>setErrMsg('')}/>
      {ConfirmModal}
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
            bookmarks={bookmarks} toggleBookmark={toggleBookmark}
            courses={courses}/>
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

      {/* Persistent chatbot — visible on home and course views, hidden on auth/admin */}
      {user&&!user.isGuest&&view!=='auth'&&view!=='admin'&&(
        <Chatbot context={view==='course'&&active?{
          courseName:active.data?.courseName,
          chapterTitle:active.data?.chapterTitle,
          summary:active.data?.keyConcepts?.slice(0,5).map(c=>c.title).join(', ')
        }:null} courses={courses} user={user}/>
      )}

      {showWelcome&&user&&<WelcomeModal user={user} onClose={()=>setShowWelcome(false)}/>}

      {view!=='auth'&&<CopyrightBar/>}
    </>
  );
}
