/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                      S T U D Y H U B                            ║
 * ║  © 2025 Yination & Excalibur. All rights reserved.              ║
 * ║  Unauthorised copying or distribution is strictly prohibited.   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import React,{ useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const css = `  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Mono:wght@400;600&family=DM+Sans:wght@300;400;500;600&display=swap');

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
  html{scroll-behavior:smooth;font-size:16px}
  /* Scale UI for 720p phones (720×1600/1640) to feel like 1080p */
  @media (max-width:720px) and (max-height:1640px) {
    html { font-size: 14.4px; }
  }
  @media (max-width:480px) {
    html { font-size: 13.5px; }
  }
  body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;min-height:100vh;transition:background .3s,color .3s;-webkit-text-size-adjust:100%;text-size-adjust:100%}
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
  @keyframes flipIn  {from{opacity:0;transform:rotateY(-90deg)}to{opacity:1;transform:rotateY(0)}}
  @keyframes floatUp {0%{transform:translateY(0);opacity:1}100%{transform:translateY(-28px);opacity:0}}
  @keyframes popIn   {0%{transform:scale(0.7);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}

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
  @keyframes slideRight {from{opacity:0;transform:translateX(-100%)}to{opacity:1;transform:translateX(0)}}
  @keyframes confettiFall{0%{transform:translateY(-10px) rotate(0deg);opacity:1}100%{transform:translateY(140px) rotate(720deg);opacity:0}}
  .confetti-piece{position:fixed;width:9px;height:9px;border-radius:2px;animation:confettiFall 1s ease-out forwards;pointer-events:none;z-index:9999}
  .slide-up{animation:slideUp .28s cubic-bezier(.4,0,.2,1) both}
  .slide-down{animation:slideDown .28s cubic-bezier(.4,0,.2,1) both}
  .slide-right{animation:slideRight .28s cubic-bezier(.4,0,.2,1) both}

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
    z-index:2500;padding:20px;overflow-y:auto
  }`;

// Dynamic config arrays — updated at runtime
let DEPARTMENTS = ['Computer Science','Computer with Statistics'];
let DEPT_SHORT  = {'Computer Science':'CS','Computer with Statistics':'CwS'};
let DEPT_COLOR  = {'Computer Science':'#4f9cf9','Computer with Statistics':'#7fda96'};
let USER_TYPES  = [
  {id:'ut-student', label:'Enrolled Student',  shortCode:'Student',  roleKey:'user',     color:'#4f9cf9', description:'Currently enrolled students'},
  {id:'ut-external',label:'External / Visitor',shortCode:'External', roleKey:'external', color:'#a8f94f', description:'Non-enrolled users'},
];

// Subscription config cache
let _subConfig = {};
function getSubVal(key, fallback='') { return _subConfig[key] ?? fallback; }
function setSubConfigCache(cfg) { Object.assign(_subConfig, cfg); }
const AI_MSG_KEY = 'sh-ai-msgs';
function getAiMsgCount(){
  try{const s=JSON.parse(localStorage.getItem(AI_MSG_KEY)||'{}');const today=new Date().toDateString();if(s.date!==today)return 0;return s.count||0;}catch{return 0;}
}
function incAiMsgCount(){
  try{const today=new Date().toDateString();const s=JSON.parse(localStorage.getItem(AI_MSG_KEY)||'{}');const count=(s.date===today?s.count||0:0)+1;localStorage.setItem(AI_MSG_KEY,JSON.stringify({date:today,count}));return count;}catch{return 0;}
}

/* ═══════════════ DATABASE ═══════════════ */
async function dbLoadUsers(){const{data}=await supabase.from('users').select('*');return data||[];}
async function dbDeleteUser(username){
  try{
    // Delete all user data across tables
    await Promise.all([
      supabase.from('progress').delete().eq('username',username),
      supabase.from('notification_log').delete().eq('username',username),
      supabase.from('community_votes').delete().eq('username',username),
      supabase.from('status_change_requests').delete().eq('username',username),
    ]);
    // Remove from admins list if present
    const admins=await dbLoadAdmins();
    if(admins.includes(username.toLowerCase())) await dbSetAdmins(admins.filter(a=>a!==username.toLowerCase()));
    // Delete the user record itself
    await supabase.from('users').delete().eq('username',username);
  }catch(e){console.error('dbDeleteUser:',e);}
}
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
async function dbLoadNotifications(username,accessibleCourseIds=null){
  try{
    // Build queries — optionally filter to accessible courses
    let aQ=supabase.from('assignments').select('id,title,course_id,added_at,due_date').order('added_at',{ascending:false}).limit(40);
    let cQ=supabase.from('course_cas').select('id,title,course_id,type,added_at,date').order('added_at',{ascending:false}).limit(40);
    let anQ=supabase.from('announcements').select('*').order('posted_at',{ascending:false}).limit(40);
    if(accessibleCourseIds&&accessibleCourseIds.length>0){
      aQ=aQ.in('course_id',accessibleCourseIds);
      cQ=cQ.in('course_id',accessibleCourseIds);
      anQ=anQ.or(`course_id.in.(${accessibleCourseIds.join(',')}),course_id.is.null`);
    }
    const[assignments,cas,announcements]=await Promise.all([aQ,cQ,anQ]);
    const seen=await dbLoadSeen(username);
    const items=[
      ...(announcements.data||[]).map(a=>({id:a.id,type:'announcement',title:a.title,body:a.body,priority:a.priority,time:a.posted_at,courseId:a.course_id,pinned:a.pinned})),
      ...(assignments.data||[]).map(a=>({id:a.id,type:'assignment',title:`Assignment: ${a.title}`,body:a.due_date?`Due ${new Date(a.due_date).toLocaleDateString()}`:'',priority:'info',time:a.added_at,courseId:a.course_id})),
      ...(cas.data||[]).map(a=>({id:a.id,type:'ca',title:`${a.type}: ${a.title}`,body:a.date?`On ${new Date(a.date).toLocaleDateString()}`:'',priority:'info',time:a.added_at,courseId:a.course_id})),
    ].sort((a,b)=>new Date(b.time)-new Date(a.time));
    return{items,unseenCount:items.filter(i=>!seen.has(i.id)).length,seen};
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

/* ═══════════════ COURSE CODE HELPERS ═══════════════ */
function normalizeCourseCode(raw=''){
  const s=(raw||'').trim().toUpperCase().replace(/\s+/g,' ');
  if(/^[A-Z]{2,4}\s\d{3,4}/.test(s)) return s;
  const m=s.match(/^([A-Z]{2,4})(\d{3,4})/);
  if(m) return `${m[1]} ${m[2]}`;
  return s||'Other';
}
function uniqueCourseCodes(courses){
  const seen=new Set();const out=[];
  for(const c of courses){const code=normalizeCourseCode(c.courseName);if(code&&!seen.has(code)){seen.add(code);out.push(code);}}
  return out.sort();
}
async function dbLoadCourseTabData(courseIds){
  if(!courseIds.length) return{assignments:[],cas:[],resources:[],announcements:[]};
  try{
    const[a,ca,res,ann]=await Promise.all([
      supabase.from('assignments').select('*').in('course_id',courseIds).order('added_at',{ascending:false}),
      supabase.from('course_cas').select('*').in('course_id',courseIds).order('added_at',{ascending:false}),
      supabase.from('resources').select('*').in('course_id',courseIds).order('added_at',{ascending:false}),
      supabase.from('announcements').select('*').in('course_id',courseIds).order('posted_at',{ascending:false}),
    ]);
    return{assignments:a.data||[],cas:ca.data||[],resources:res.data||[],announcements:ann.data||[]};
  }catch{return{assignments:[],cas:[],resources:[],announcements:[]};}
}

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


/* ═══ SUBSCRIPTION ═══ */
async function dbLoadSubConfig(){
  try{const{data}=await supabase.from('subscription_config').select('*');const m={};(Array.isArray(data)?data:[]).forEach(r=>{m[r.key]=r.value;});return m;}catch{return{};}
}
async function dbSaveSubConfig(key,value,updatedBy){
  try{await supabase.from('subscription_config').upsert({key,value,updated_by:updatedBy,updated_at:new Date().toISOString()},{onConflict:'key'});}catch(e){console.error(e);}
}
async function dbSetUserTier(username,tier,expiresAt=null,plan=null){
  try{
    const update={subscription_tier:tier};
    if(expiresAt) update.sub_expires_at=expiresAt;
    if(plan) update.sub_plan=plan;
    if(tier==='free'){update.sub_expires_at=null;update.sub_plan=null;}
    await supabase.from('users').update(update).eq('username',username);
  }catch(e){console.error(e);}
}

// Referral system helpers
function genReferralCode(username){
  // Deterministic code based on username — no DB column needed
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let hash=0;for(const c of username){hash=(hash*31+c.charCodeAt(0))&0xffffffff;}
  let code='SH';for(let i=0;i<5;i++){code+=chars[Math.abs(hash>>(i*5))%chars.length];}
  return code;
}
async function dbAddReferralCredit(username,amount,note=''){
  try{
    await supabase.from('users').update({
      referral_credits:supabase.rpc('increment_credits',{x:amount,uname:username})||0
    }).eq('username',username);
    // Fallback: read-then-write
    const{data}=await supabase.from('users').select('referral_credits').eq('username',username).single();
    const current=(data?.referral_credits||0);
    await supabase.from('users').update({referral_credits:current+amount}).eq('username',username);
  }catch(e){console.error('referral credit:',e);}
}
async function dbGetReferralCredits(username){
  try{const{data}=await supabase.from('users').select('referral_credits').eq('username',username).single();return data?.referral_credits||0;}catch{return 0;}
}

// Promo code helpers
async function dbLoadPromos(){
  try{const{data}=await supabase.from('promo_codes').select('*').order('created_at',{ascending:false});return data||[];}catch{return[];}
}
async function dbSavePromo(promo){
  try{await supabase.from('promo_codes').upsert(promo,{onConflict:'code'});}catch(e){console.error(e);}
}
async function dbDeletePromo(code){
  try{await supabase.from('promo_codes').delete().eq('code',code);}catch(e){console.error(e);}
}
async function dbValidatePromo(code){
  try{
    const{data}=await supabase.from('promo_codes').select('*').eq('code',code.toUpperCase().trim()).single();
    if(!data) return{valid:false,error:'Code not found'};
    if(!data.active) return{valid:false,error:'This code is no longer active'};
    if(data.expires_at&&new Date(data.expires_at)<new Date()) return{valid:false,error:'Code has expired'};
    if(data.max_uses>0&&(data.uses_count||0)>=data.max_uses) return{valid:false,error:`Code limit reached (${data.max_uses} uses max)`};
    return{valid:true,promo:data};
  }catch{return{valid:false,error:'Invalid code'};}
}
async function dbRedeemPromo(code){
  try{await supabase.from('promo_codes').update({uses_count:supabase.rpc('inc',{x:1})||1}).eq('code',code.toUpperCase());}catch{}
}

/* ═══════════════ CONFIG ═══════════════ */
// NOTE: No superuser credentials stored here.
// Auth is validated server-side via /api/auth.
// Add SU_USERNAME and SU_PASSWORD to Vercel environment variables.
const APP_VERSION    = '4.7.0';

/* ═══════════════ XP / GAMIFICATION ═══════════════ */
const XP_ACTIONS={quiz_complete:20,quiz_perfect:50,flashcard_session:10,qa_reveal:2,course_view:5,question_reveal:2};
const XP_LEVELS=[
  {level:1,title:'Freshman',   min:0,    color:'#8892a4'},
  {level:2,title:'Sophomore',  min:100,  color:'#4f9cf9'},
  {level:3,title:'Junior',     min:300,  color:'#7fda96'},
  {level:4,title:'Senior',     min:600,  color:'#f9a84f'},
  {level:5,title:'Graduate',   min:1000, color:'#da7ff0'},
  {level:6,title:'Scholar',    min:1500, color:'#a8f94f'},
  {level:7,title:'Honors',     min:2200, color:'#f9a84f'},
  {level:8,title:"Dean's List",min:3000,color:'#ff6b9d'},
];
function getLevel(xp){
  let lvl=XP_LEVELS[0];
  for(const l of XP_LEVELS){if(xp>=l.min)lvl=l;else break;}
  return lvl;
}
function getXPProgress(xp){
  const cur=getLevel(xp);
  const idx=XP_LEVELS.indexOf(cur);
  const next=XP_LEVELS[idx+1];
  if(!next) return{pct:100,toNext:0};
  const pct=Math.round(((xp-cur.min)/(next.min-cur.min))*100);
  return{pct:Math.min(pct,100),toNext:next.min-xp,nextTitle:next.title};
}
function useXP(username){
  const key=username?`sh-xp-${username}`:'sh-xp-guest';
  const[xp,setXP]=useState(()=>{try{return parseInt(localStorage.getItem(key)||'0');}catch{return 0;}});
  const awardXP=useCallback((action)=>{
    const pts=XP_ACTIONS[action]||0;
    if(!pts)return 0;
    setXP(prev=>{
      const newXP=prev+pts;
      try{localStorage.setItem(key,String(newXP));}catch{}
      return newXP;
    });
    return pts;
  },[key]);
  return[xp,awardXP];
}
const COPYRIGHT_YEAR = '2025';


/* ═══════════════ CONSTANTS ═══════════════ */
const ROLE  = { SUPERUSER:'superuser', ADMIN:'admin', USER:'user', EXTERNAL:'external' };
const YEARS       = [1,2,3,4];
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

function useBookmarks(username='guest'){
  const bmKey=`sh-bookmarks-${username}`;
  const [bm,setBm]=useState(()=>{try{return JSON.parse(localStorage.getItem(bmKey)||'[]');}catch{return [];}});
  const toggle=id=>{
    setBm(prev=>{
      const next=prev.includes(id)?prev.filter(x=>x!==id):[...prev,id];
      localStorage.setItem(bmKey,JSON.stringify(next));
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

function useOnlineStatus(){
  const[online,setOnline]=useState(()=>navigator.onLine);
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


function burstConfetti(){
  const colors=['#4f9cf9','#7fda96','#f9a84f','#da7ff0','#a8f94f','#ff6b9d'];
  const pieces=Array.from({length:30},(_,i)=>{
    const el=document.createElement('div');
    el.className='confetti-piece';
    el.style.cssText=`left:${20+Math.random()*60}%;top:${20+Math.random()*30}%;background:${colors[i%colors.length]};animation-delay:${Math.random()*.4}s;animation-duration:${.7+Math.random()*.5}s`;
    document.body.appendChild(el);
    return el;
  });
  setTimeout(()=>pieces.forEach(p=>p.remove()),1500);
}
function pushNotification(title,body,icon='/icon-192.png'){
  if(Notification.permission!=='granted') return;
  try{new Notification(title,{body,icon,badge:'/icon-192.png'});}catch{}
}

/* ═══════════════ SMALL UI ATOMS ═══════════════ */
const Tag=({children,color='#4f9cf9'})=>(<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,background:`${color}18`,color,borderRadius:4,padding:'2px 8px',marginRight:5,display:'inline-block'}}>{children}</span>);
const Mono=({children,color='#4f9cf9',size=10})=>(<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:size,color,letterSpacing:2,textTransform:'uppercase'}}>{children}</span>);
const SectionLabel=({children})=>(<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,letterSpacing:3,textTransform:'uppercase',color:'#f9a84f',marginBottom:20,display:'flex',alignItems:'center',gap:10}}>{children}<div style={{flex:1,height:1,background:'var(--border)'}}/></div>);
const Field=({label,type='text',value,onChange,placeholder,error,disabled,onKeyDown,maxLength})=>(<div style={{marginBottom:14}}>{label&&<div style={{fontSize:11,color:'var(--muted)',marginBottom:5,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>{label}</div>}<input type={type} value={value} onChange={onChange} onKeyDown={onKeyDown} placeholder={placeholder} disabled={disabled} style={{width:'100%',background:disabled?'rgba(0,0,0,.2)':'var(--input-bg)',border:`1px solid ${error?'#f05050':'var(--border)'}`,borderRadius:8,padding:'11px 14px',color:'var(--text)',fontSize:14,fontFamily:"'DM Sans',sans-serif"}}/>{error&&<div style={{color:'#f05050',fontSize:11,marginTop:4}}>{error}</div>}</div>);
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
    <button onClick={toggle} title={dark?'Switch to light mode':'Switch to dark mode'} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:20,padding:'6px 12px',cursor:'pointer',color:'var(--text)',display:'flex',alignItems:'center',gap:6,fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}>
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
      <div onClick={snooze} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',backdropFilter:'blur(2px)',zIndex:9899}}/>
      <div className="no-print" style={{position:'fixed',bottom:0,left:0,right:0,
        background:'var(--card)',borderTop:'1px solid var(--border)',
        borderRadius:'20px 20px 0 0',
        padding:'16px 20px max(28px,env(safe-area-inset-bottom))',
        zIndex:9900,boxShadow:'0 -8px 40px rgba(0,0,0,.5)',
        maxHeight:'80vh',overflowY:'auto',
        animation:'slideUp .35s cubic-bezier(.4,0,.2,1) both'}}>
        {/* Handle bar */}
        <div style={{width:36,height:4,borderRadius:2,background:'var(--border)',margin:'0 auto 14px'}}/>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:40,height:40,borderRadius:10,background:'linear-gradient(135deg,#1a2a4a,#0d1929)',
              border:'1px solid rgba(79,156,249,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>📚</div>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:'var(--text)'}}>Install StudyHub</div>
              <div style={{fontSize:11,color:'var(--muted)'}}>Works offline · Loads faster</div>
            </div>
          </div>
          <button onClick={never} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:20,padding:'4px',lineHeight:1,flexShrink:0}}>✕</button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:9,marginBottom:14}}>
          {[
            {n:1, html:<>Tap the <strong style={{color:'#4f9cf9'}}>Share ⬆️</strong> button at the bottom of Safari</>},
            {n:2, html:<>Scroll down and tap <strong style={{color:'#4f9cf9'}}>Add to Home Screen</strong></>},
            {n:3, html:<>Tap <strong style={{color:'#4f9cf9'}}>Add</strong> — done!</>},
          ].map(({n,html})=>(
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
          Remind me later
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
      icon:'📖',
      title:'Study Notes + Practice',
      body:`Each course has two key sections: Study Notes (Concepts, Definitions, Mechanisms) and Practice (Q&A, Flashcards, and a full AI-generated Quiz with multiple choice or fill-in-the-gap).`,
      cta:'Next',
    },
    {
      icon:'🤖',
      title:'Meet StudyBot',
      body:`The 🤖 button is your AI tutor. Ask it anything, get practice questions, explanations for wrong answers, or suggestions to improve any course. It learns from the course content.`,
      cta:'Next',
    },
    {
      icon:'🎁',
      title:'Refer friends, earn discounts',
      body:`You have a unique referral code in the side menu. Share it with classmates — when they subscribe to Pro, you earn ₦ credits that reduce your own subscription cost.`,
      cta:'Next',
    },
    {
      icon:'📲',
      title:'Install on your phone',
      body:`StudyHub works as an app too. Look for the Install prompt at the bottom, or on iPhone tap Share → Add to Home Screen. It works offline once installed.`,
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
    <div className="no-print copyright-bar" style={{position:'fixed',bottom:0,left:0,right:0,background:'var(--bg)',borderTop:'1px solid var(--border)',padding:'4px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',zIndex:100}}>
      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:'var(--muted)',opacity:.45,letterSpacing:1}}>StudyHub v{APP_VERSION} · © {COPYRIGHT_YEAR}</span>
      <button onClick={()=>setShowDiag(true)} title="PWA diagnostics" style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:8,fontFamily:"'IBM Plex Mono',monospace",opacity:.3,padding:'0 2px',lineHeight:1}}>PWA?</button>
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
const QUICK_PROMPTS=['Explain this simply','5 practice questions','Most important concepts','Summarise in bullet points','Likely exam questions','Compare key terms','Give a real-world example','What are common mistakes?'];
const SEARCH_PREFIXES=['find ','search ','what is ','what are ','how do i ','how does ','explain ','show me ','list ','define ','describe '];
const isSearchQuery=t=>SEARCH_PREFIXES.some(p=>t.toLowerCase().startsWith(p))||t.endsWith('?');

function Chatbot({context,courses,user,subCfg={}}){
  // Persist open state — remember how the user left it, never force-open
  const[open,setOpen]=useState(()=>{
    try{return localStorage.getItem('sh-bot-open')==='1';}catch{return false;}
  });
  const[minimised,setMinimised]=useState(false);
  const[fullscreen,setFullscreen]=useState(false);
  const chatKey=user?.username?`sh-chat-${user.username}`:'sh-chat';
  const[messages,setMessages]=useState(()=>{
    try{
      const saved=JSON.parse(localStorage.getItem(chatKey)||'[]');
      return Array.isArray(saved)&&saved.length>0?saved.slice(-30):[];  // keep last 30 msgs
    }catch{return[];}
  });
  const[input,setInput]=useState('');
  const[loading,setLoading]=useState(false);
  const[tab,setTab]=useState('chat');
  const[searchResults,setSearchResults]=useState([]);
  const[searchQ,setSearchQ]=useState('');
  const bottomRef=useRef();const inputRef=useRef();

  const toggleOpen=v=>{const next=v!==undefined?v:!open;setOpen(next);try{localStorage.setItem('sh-bot-open',next?'1':'0');}catch{}};

  // Escape closes chatbot
  useEffect(()=>{
    const h=e=>{if(e.key==='Escape'&&open)toggleOpen(false);};
    document.addEventListener('keydown',h);
    return()=>document.removeEventListener('keydown',h);
  },[open]);
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
  // Persist conversation to localStorage
  useEffect(()=>{try{if(messages.length>0)localStorage.setItem(chatKey,JSON.stringify(messages.slice(-30)));}catch{}},[messages,chatKey]);

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

    // Rate limit free users (not admins/superusers, not assignment mode)
    const isFree=!user?.isGuest&&user?.role!==ROLE.SUPERUSER&&(user?.subscription_tier||'free')==='free';
    if(isFree&&!assignmentCtx){
      const limit=parseInt(subCfg?.free_ai_messages_per_month||'5');
      const getMonth=()=>new Date().toISOString().slice(0,7); // "2025-04"
      const getCount=()=>{try{const s=JSON.parse(localStorage.getItem('sh-ai-msgs')||'{}');const m=getMonth();return s.month===m?s.count||0:0;}catch{return 0;}};
      const incCount=()=>{try{const m=getMonth();const s=JSON.parse(localStorage.getItem('sh-ai-msgs')||'{}');const count=(s.month===m?s.count||0:0)+1;localStorage.setItem('sh-ai-msgs',JSON.stringify({month:m,count}));}catch{}};
      const used=getCount();
      if(used>=limit){
        setMessages(m=>[...m,{role:'user',content:msg},{role:'assistant',content:`⚠️ You've used all ${limit} free AI messages for today.\n\nUpgrade to Pro for unlimited AI chat — tap ⭐ Upgrade in the top bar.`}]);
        setInput('');
        return;
      }
      incCount();
    }

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
    <div className="no-print chatbot-panel" style={fullscreen
      ? {position:'fixed',inset:0,width:'100vw',height:'100vh',maxHeight:'100vh',background:'var(--bg)',border:'none',borderRadius:0,display:'flex',flexDirection:'column',zIndex:500,overflow:'hidden',boxShadow:'none'}
      : {position:'fixed',bottom:58,right:10,width:'min(400px, calc(100vw - 20px))',maxHeight:minimised?52:'76vh',background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,display:'flex',flexDirection:'column',zIndex:200,overflow:'hidden',boxShadow:'var(--shadow)',transition:'max-height .3s ease'}}>
      {/* Header */}
      <div style={{padding:'10px 14px',borderBottom:minimised?'none':'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',background:'linear-gradient(135deg,rgba(79,156,249,.08),rgba(127,95,249,.08))',flexShrink:0,cursor:'pointer'}} onClick={()=>setMinimised(m=>!m)}>
        <div style={{display:'flex',alignItems:'center',gap:9}}>
          <div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#4f9cf9,#7f5ff9)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>🤖</div>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{fontSize:13,fontWeight:600,color:'var(--text)',lineHeight:1}}>StudyBot</div>
              {(()=>{
                const isFreeC=!user?.isGuest&&user?.role!==ROLE.SUPERUSER&&(user?.subscription_tier||'free')==='free';
                if(!isFreeC||assignmentCtx) return null;
                const limit=parseInt(subCfg?.free_ai_messages_per_month||'5');
                const used=(()=>{try{const s=JSON.parse(localStorage.getItem('sh-ai-msgs')||'{}');const m=new Date().toISOString().slice(0,7);return s.month===m?s.count||0:0;}catch{return 0;}})();
                const left=Math.max(0,limit-used);
                return <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:left===0?'#f05050':left<=2?'#f9a84f':'#8892a4',background:'var(--surface)',borderRadius:4,padding:'1px 6px'}}>
                  {left}/{limit} this month
                </span>;
              })()}
            </div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:assignmentCtx?'#f9a84f':'#4f9cf9',letterSpacing:1}}>
              {assignmentCtx?'📋 ASSIGNMENT MODE · GROQ':'AI TUTOR · GROQ'}
            </div>
          </div>
          {context?.chapterTitle&&!minimised&&<div style={{background:'rgba(79,156,249,.1)',border:'1px solid rgba(79,156,249,.2)',borderRadius:4,padding:'2px 7px',fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:'#4f9cf9',maxWidth:110,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{context.chapterTitle}</div>}
        </div>
        <div style={{display:'flex',gap:4,alignItems:'center'}}>
          <button onClick={e=>{e.stopPropagation();setMessages([]);setAssignmentCtx(null);try{localStorage.removeItem(chatKey);}catch{}}} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:10,fontFamily:"'IBM Plex Mono',monospace",padding:'2px 6px'}} title="Clear conversation">CLR</button>
          <button onClick={e=>{e.stopPropagation();setFullscreen(f=>!f);setMinimised(false);}}
            title={fullscreen?'Exit fullscreen':'Fullscreen'}
            style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:14,padding:'0 3px',lineHeight:1}}>
            {fullscreen?'⊠':'⛶'}
          </button>
          {!fullscreen&&<button onClick={e=>{e.stopPropagation();setMinimised(m=>!m);}} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:16,padding:'0 3px',lineHeight:1}}>{minimised?'▲':'▼'}</button>}
          <button onClick={e=>{e.stopPropagation();setFullscreen(false);toggleOpen(false);}} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:16,padding:'0 3px',lineHeight:1}}>✕</button>
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
                <div style={{maxWidth:fullscreen?'70%':'80%',background:m.role==='user'?'linear-gradient(135deg,#4f9cf9,#7f5ff9)':'var(--surface)',color:m.role==='user'?'#fff':'var(--text)',borderRadius:m.role==='user'?'13px 13px 3px 13px':'13px 13px 13px 3px',padding:fullscreen?'12px 16px':'8px 12px',fontSize:fullscreen?14:12.5,lineHeight:1.7,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{m.content}</div>
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
            placeholder={tab==='search'?'Ask about a course or topic…':'Ask anything… (Enter to send, Shift+Enter for new line)'}
            maxLength={1600}
            rows={fullscreen?3:1} style={{flex:1,background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:10,padding:'7px 10px',color:'var(--text)',fontSize:fullscreen?14:12.5,fontFamily:"'DM Sans',sans-serif",resize:'none',maxHeight:fullscreen?120:80,lineHeight:1.5}}/>
          <button onClick={()=>send()} disabled={!input.trim()||loading}
            style={{width:36,height:36,borderRadius:'50%',border:'none',flexShrink:0,background:!input.trim()||loading?'var(--border)':'linear-gradient(135deg,#4f9cf9,#7f5ff9)',color:!input.trim()||loading?'var(--muted)':'#fff',cursor:!input.trim()||loading?'not-allowed':'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>↑</button>
        </div>
        {input.length>600&&<div style={{padding:'0 12px 6px',fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:input.length>750?'#f05050':'#f9a84f',textAlign:'right'}}>{800-input.length} chars left</div>}
      </>}
    </div>
  );
}


/* ═══════════════ PROFILE MODAL ═══════════════ */
function ProfileModal({user,onClose,onUpdate}){
  const[tab,setTab]=useState('name'); // 'name' | 'password'
  const[nameSaved,setNameSaved]=useState(false);
  const[xpVal]=useXP(user?.username);
  const[displayName,setDisplayName]=useState(user.displayName||user.username);
  const[currentPw,setCurrentPw]=useState('');const[newPw,setNewPw]=useState('');const[confirmPw,setConfirmPw]=useState('');
  const[msg,setMsg]=useState('');const[error,setError]=useState('');const[saving,setSaving]=useState(false);
  const flash=(m,isErr=false)=>{if(isErr)setError(m);else setMsg(m);setTimeout(()=>{setMsg('');setError('');},3000);};

  const saveName=async()=>{
    if(!displayName.trim())return flash('Name cannot be empty.',true);
    if(displayName.trim()===user.displayName)return flash('No changes made.');
    setSaving(true);
    try{
      await supabase.from('users').update({display_name:displayName.trim()}).eq('username',user.username);
      onUpdate({...user,displayName:displayName.trim()});
      flash('✓ Display name updated!');
      setNameSaved(true);
    }catch{flash('Failed to save.',true);}
    setSaving(false);
  };

  const savePw=async()=>{
    if(!currentPw||!newPw||!confirmPw)return flash('All fields required.',true);
    if(newPw!==confirmPw)return flash("New passwords don't match.",true);
    if(newPw.length<6)return flash('Password must be at least 6 characters.',true);
    if(newPw===user.username)return flash('Password cannot be the same as your username.',true);
    // Verify current password
    const{data}=await supabase.from('users').select('pw_hash').eq('username',user.username).single();
    if(data?.pw_hash!==hashStr(currentPw))return flash('Current password is incorrect.',true);
    setSaving(true);
    try{
      await supabase.from('users').update({pw_hash:hashStr(newPw)}).eq('username',user.username);
      flash('✓ Password changed!');setCurrentPw('');setNewPw('');setConfirmPw('');
    }catch{flash('Failed to save.',true);}
    setSaving(false);
  };

  return(
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="scale-in" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:18,padding:'28px 26px',maxWidth:420,width:'calc(100% - 32px)',margin:'auto',boxShadow:'var(--shadow)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:'var(--text)'}}>Edit Profile</div>
        {xpVal!=null&&<XPBadge xp={xpVal}/>}
      </div>
      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginBottom:14,letterSpacing:1}}>@{user.username}</div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:20,lineHeight:1}}>✕</button>
        </div>
        {/* Tab picker */}
        <div style={{display:'flex',background:'var(--input-bg)',borderRadius:10,padding:3,marginBottom:20,gap:4}}>
          {[{id:'name',label:'Display Name'},{id:'password',label:'Change Password'}].map(t=>(
            <button key={t.id} onClick={()=>{setTab(t.id);setMsg('');setError('');}}
              style={{flex:1,padding:'8px 0',borderRadius:8,border:'none',background:tab===t.id?'var(--card)':'transparent',color:tab===t.id?'var(--text)':'var(--muted)',cursor:'pointer',fontSize:12,fontWeight:tab===t.id?600:400,transition:'all .15s'}}>
              {t.label}
            </button>
          ))}
        </div>
        {msg&&<div style={{background:'rgba(127,218,150,.1)',border:'1px solid rgba(127,218,150,.3)',borderRadius:8,padding:'8px 14px',fontSize:12,color:'#7fda96',marginBottom:14}}>{msg}</div>}
        {error&&<div style={{background:'rgba(240,80,80,.1)',border:'1px solid rgba(240,80,80,.3)',borderRadius:8,padding:'8px 14px',fontSize:12,color:'#f05050',marginBottom:14}}>{error}</div>}
        {tab==='name'&&(
          <div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:.5}}>DISPLAY NAME</div>
            <input value={displayName} onChange={e=>setDisplayName(e.target.value)} maxLength={30}
              onKeyDown={e=>e.key==='Enter'&&saveName()}
              style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:9,padding:'10px 13px',color:'var(--text)',fontSize:14,marginBottom:6}}/>
            <div style={{fontSize:10,color:'var(--muted)',marginBottom:14}}>This is how your name appears to other students.</div>
            <button onClick={saveName} disabled={saving}
              style={{width:'100%',background:'#4f9cf9',border:'none',borderRadius:9,color:'#fff',cursor:saving?'not-allowed':'pointer',padding:'11px 0',fontSize:13,fontWeight:700}}>
              {saving?'Saving…':'Save Name'}
            </button>
          </div>
        )}
        {tab==='password'&&(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {[{label:'CURRENT PASSWORD',val:currentPw,set:setCurrentPw},{label:'NEW PASSWORD',val:newPw,set:setNewPw},{label:'CONFIRM NEW PASSWORD',val:confirmPw,set:setConfirmPw}].map(f=>(
              <div key={f.label}>
                <div style={{fontSize:11,color:'var(--muted)',marginBottom:5,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:.5}}>{f.label}</div>
                <input type="password" value={f.val} onChange={e=>f.set(e.target.value)} maxLength={72}
                  style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:9,padding:'10px 13px',color:'var(--text)',fontSize:14}}/>
              </div>
            ))}
            <button onClick={savePw} disabled={saving}
              style={{background:'#4f9cf9',border:'none',borderRadius:9,color:'#fff',cursor:saving?'not-allowed':'pointer',padding:'11px 0',fontSize:13,fontWeight:700,marginTop:4}}>
              {saving?'Saving…':'Change Password'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════ AUTH SCREEN ═══════════════ */
function AuthScreen({onLogin,onGuest,dark,toggleTheme}){
  const[tab,setTab]=useState('signin');
  const[f,setF]=useState({username:'',password:'',confirm:'',year:3,accountType:'student'});
  const[showPw,setShowPw]=useState(false);
  const[errs,setErrs]=useState({});const[loading,setLoading]=useState(false);
  const set=(k,v)=>{setF(p=>({...p,[k]:v}));setErrs(p=>({...p,[k]:''}));};

  const signIn=async()=>{
    const e={};if(!f.username.trim())e.username='Required';if(!f.password)e.password='Required';
    if(Object.keys(e).length){setErrs(e);return;}setLoading(true);

    // Check superuser server-side first — credentials never compared in browser
    try{
      const suResult = await checkSuperuser(f.username, f.password);
      if(suResult){
        onLogin({username:f.username.toLowerCase(),displayName:'Owner',role:ROLE.SUPERUSER,accountType:'superuser',subscription_tier:'pro'});
        return;
      }
    }catch{}

    // Regular user login
    try{
      const users=await dbLoadUsers();const user=users.find(u=>u.username.toLowerCase()===f.username.toLowerCase());
      if(!user||user.pw_hash!==hashStr(f.password)){setErrs({password:'Incorrect username or password.'});setLoading(false);return;}
      const role=await resolveRole(user.username);
      onLogin({username:user.username,displayName:user.display_name||user.username,year:user.year,role,accountType:user.account_type||'student',subscription_tier:user.subscription_tier||'free',sub_expires_at:user.sub_expires_at||null,sub_plan:user.sub_plan||null});
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
              <Field label="PASSWORD" type={showPw?'text':'password'} value={f.password} onChange={e=>set('password',e.target.value)} placeholder="••••••••" error={errs.password} onKeyDown={e=>e.key==='Enter'&&signIn()}/>
              <button type="button" onClick={()=>setShowPw(v=>!v)} style={{background:'none',border:'none',color:'#4f9cf9',cursor:'pointer',fontSize:11,padding:'2px 0',textAlign:'left'}}>{showPw?'🙈 Hide password':'👁 Show password'}</button>
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
              {f.password.length>0&&f.password.length<20&&(
                <div style={{marginTop:-10,marginBottom:10,height:3,background:'var(--border)',borderRadius:2}}>
                  <div style={{height:'100%',borderRadius:2,transition:'width .3s,background .3s',
                    width:f.password.length<6?`${(f.password.length/6)*40}%`:f.password.length<10?'60%':f.password.length<14?'80%':'100%',
                    background:f.password.length<6?'#f05050':f.password.length<10?'#f9a84f':'#7fda96'}}/>
                </div>
              )}
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
      const parsed=safeParse(text);
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

/* Strip control characters that break JSON.parse (e.g. unescaped tabs, newlines inside strings) */
function sanitizeJson(raw){
  // Remove BOM if present
  let s=raw.replace(/^\uFEFF/,'');
  // Replace literal control chars (0x00-0x1F except \t \n \r) inside strings with a space
  // We do a two-pass: first normalise CRLF, then strip bad chars
  s=s.replace(/\r\n/g,'\\n').replace(/\r/g,'\\n');
  // Strip remaining raw control chars (0x00–0x08, 0x0B–0x0C, 0x0E–0x1F)
  s=s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,' ');
  return s;
}
function safeParse(raw){
  try{ return JSON.parse(raw); }catch{
    return JSON.parse(sanitizeJson(raw));
  }
}

const JSON_PROMPT=`You are a university study guide generator. Read the full document carefully, then produce a complete JSON study guide.

IMPORTANT: Your output must cover EVERY topic, subtopic, and concept in the document — nothing should be left out.

Return ONLY valid JSON with this exact structure (no extra text, no markdown fences):
{
  "courseName": "Course code only — e.g. COS 341 or MTH 201",
  "chapterTitle": "Full chapter or topic title from the document",
  "summary": "Write 5–8 paragraphs covering the entire document. Use simple, clear English that a student can easily understand. Each paragraph should cover a distinct topic area from the document. Do NOT use bullet points — write in flowing sentences. Make sure every major section of the document is mentioned. End with what students must focus on for exams.",
  "diagrams": [
    {
      "title": "Name of the diagram or figure",
      "type": "flowchart|table|comparison|timeline|hierarchy|formula",
      "content": "ASCII or plain-text representation of the diagram. For tables use | separators. For flowcharts use arrows like A --> B --> C. For hierarchies use indentation. Keep it clear and readable."
    }
  ],
  "keyConcepts": [
    {"title": "Concept name", "description": "One simple sentence saying what this is and why it matters", "color": "blue|orange|green|purple"}
  ],
  "definitions": [
    {"term": "Technical term", "definition": "Short, clear definition a student can memorise easily"}
  ],
  "mechanisms": [
    {"title": "Process or mechanism name", "body": "Step-by-step plain English explanation. Number each step. Use simple words."}
  ],
  "algorithms": [
    {"name": "Algorithm or method name", "description": "What it does and how it works in plain English", "note": "Time complexity or key limitation — empty string if none"}
  ],
  "chapters": [
    {"num": "Topic 1", "name": "Topic title", "takeaways": ["Specific fact students must know", "Another specific exam point", "Third key takeaway"]}
  ],
  "questions": [
    {"question": "Full exam question", "answer": "Complete answer with reasoning and any relevant examples"}
  ]
}

Rules for each field:
- summary: Cover EVERY section of the document. 5–8 paragraphs minimum. Simple English only. No bullet points.
- diagrams: Create 2–6 diagrams that help explain the most visual or structural concepts. Use ASCII art for flowcharts, plain tables with | for data, indented lists for hierarchies. Skip this if document has no visual structure.
- keyConcepts: 12–20 items. Cover ALL major topics. Short descriptions.
- definitions: 20–40 terms. Every technical word in the document.
- mechanisms: 3–8 items. Any process, workflow, or multi-step concept.
- algorithms: Empty array [] only if document truly has no algorithms or methods.
- chapters: 5–10 topics matching the document structure. 3 takeaways each.
- questions: EXACTLY 25 questions covering easy, medium, and hard difficulty. Full worked answers.
- Write everything in simple, clear English. Avoid complex academic phrasing.
- Return ONLY the JSON object.`;


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

/* ═══════════════ AI CONFIRMATION MODAL ═══════════════ */
function AiConfirmModal({aiResult,courses,dupWarning,defaultYear,defaultSem,defaultDept,onConfirm,onCancel}){
  const[editCourse,setEditCourse]=useState(normalizeCourseCode(aiResult.courseName||''));
  const[editTitle,setEditTitle]=useState(aiResult.chapterTitle||aiResult.title||'');
  const[saveAs,setSaveAs]=useState(aiResult._type==='assignment'?'assignment':aiResult._type==='ca'?'ca':'course');
  const[editYear,setEditYear]=useState(defaultYear||1);
  const[editSem,setEditSem]=useState(defaultSem||1);
  const[editDept,setEditDept]=useState(defaultDept||DEPARTMENTS[0]||'Computer Science');

  const detected=useMemo(()=>detectMetadata({courseName:editCourse,chapterTitle:editTitle}),[editCourse,editTitle]);
  const existingCodes=useMemo(()=>uniqueCourseCodes(courses),[courses]);
  const matchedCode=useMemo(()=>existingCodes.find(c=>c===normalizeCourseCode(editCourse)),[existingCodes,editCourse]);
  const suggestions=useMemo(()=>editCourse.length>=2?existingCodes.filter(c=>c.startsWith(normalizeCourseCode(editCourse))&&c!==normalizeCourseCode(editCourse)).slice(0,3):[],[existingCodes,editCourse]);

  // Auto-apply AI-detected year/dept hints
  useEffect(()=>{if(detected.year)setEditYear(detected.year);},[detected.year]);
  useEffect(()=>{if(detected.department)setEditDept(detected.department);},[detected.department]);
  useEffect(()=>{if(detected.semester)setEditSem(detected.semester);},[detected.semester]);

  const typeOpts=[
    {id:'course',    label:'📚 Study Guide',  desc:'Key concepts, definitions & Q&A → course chapters'},
    {id:'assignment',label:'📋 Assignment',   desc:'Homework/coursework → Assignments tab'},
    {id:'ca',        label:'📝 CA / Test',    desc:'Assessment/exam → CAs & Tests tab'},
    {id:'resource',  label:'🔗 Resource',     desc:'Reference link or file → Resources tab'},
  ];
  const accentColor=YEAR_COLORS[editYear]||'#4f9cf9';

  return(
    <div className="modal-overlay" style={{zIndex:3000}} onClick={e=>e.target===e.currentTarget&&onCancel()}>
      <div className="scale-in" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:'26px 28px',maxWidth:520,width:'100%',margin:'auto',boxShadow:'var(--shadow)',maxHeight:'92vh',overflowY:'auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
          <div style={{width:40,height:40,borderRadius:10,background:'rgba(168,249,79,.1)',border:'1px solid rgba(168,249,79,.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>🤖</div>
          <div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:19,color:'var(--text)'}}>Confirm Upload</div>
            <div style={{fontSize:11,color:'var(--muted)',marginTop:1}}>Review what AI detected — edit anything before saving.</div>
          </div>
        </div>

        {/* ── Duplicate warning ── */}
        {dupWarning&&(
          <div className="slide-down" style={{background:dupWarning.exact?'rgba(240,80,80,.08)':'rgba(249,168,79,.07)',border:`1px solid ${dupWarning.exact?'rgba(240,80,80,.35)':'rgba(249,168,79,.3)'}`,borderRadius:10,padding:'12px 14px',marginBottom:14}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
              <span style={{fontSize:16}}>{dupWarning.exact?'🚫':'⚠️'}</span>
              <div style={{fontSize:12,fontWeight:700,color:dupWarning.exact?'#f05050':'#f9a84f'}}>
                {dupWarning.exact?'Exact duplicate detected':'Possible duplicate detected'}
              </div>
            </div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:8,lineHeight:1.5}}>
              {dupWarning.exact
                ?'This course appears to already exist in StudyHub. Submitting will require superuser approval to avoid duplicates.'
                :`Similar course content found. The superuser will be notified and must approve before this is saved.`}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:5}}>
              {dupWarning.matches.map((m,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:8,background:'var(--surface)',borderRadius:7,padding:'6px 10px'}}>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:YEAR_COLORS[m.year]||'#4f9cf9',background:YEAR_BG[m.year]||'rgba(79,156,249,.1)',borderRadius:4,padding:'1px 6px',flexShrink:0}}>Yr{m.year}</span>
                  <span style={{fontSize:11,color:'var(--text)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.chapterTitle}</span>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',flexShrink:0}}>{m.courseName}</span>
                </div>
              ))}
            </div>
            <div style={{marginTop:8,fontSize:10,color:'var(--muted)',fontFamily:"'IBM Plex Mono',monospace",letterSpacing:.5}}>
              ⚡ This upload will be flagged for superuser review regardless of your role.
            </div>
          </div>
        )}

        {/* AI classification badge */}
        <div style={{background:'rgba(168,249,79,.07)',border:'1px solid rgba(168,249,79,.2)',borderRadius:8,padding:'8px 13px',marginBottom:18,display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <span style={{fontSize:13}}>✨</span>
          <span style={{fontSize:12,color:'#a8f94f'}}>AI classified as <strong>{typeOpts.find(t=>t.id===saveAs)?.label}</strong></span>
          {matchedCode&&<span style={{fontSize:11,color:'var(--muted)'}}>· matches existing <span style={{color:'#4f9cf9',fontFamily:"'IBM Plex Mono',monospace"}}>{matchedCode}</span></span>}
        </div>

        {/* Save-as type selector */}
        <div style={{marginBottom:18}}>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--muted)',letterSpacing:2,marginBottom:8}}>SAVE AS</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
            {typeOpts.map(t=>(
              <button key={t.id} onClick={()=>setSaveAs(t.id)}
                style={{padding:'10px 12px',borderRadius:9,cursor:'pointer',textAlign:'left',
                  border:`1.5px solid ${saveAs===t.id?'#4f9cf9':'var(--border)'}`,
                  background:saveAs===t.id?'rgba(79,156,249,.08)':'var(--input-bg)',
                  transition:'all .15s',display:'flex',flexDirection:'column',gap:2}}>
                <div style={{fontSize:12,fontWeight:saveAs===t.id?700:400,color:saveAs===t.id?'#4f9cf9':'var(--text)'}}>{t.label}</div>
                <div style={{fontSize:10,color:'var(--muted)',lineHeight:1.4}}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Course code + title */}
        <div style={{display:'grid',gridTemplateColumns:'140px 1fr',gap:10,marginBottom:14}}>
          <div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--muted)',letterSpacing:2,marginBottom:5}}>COURSE CODE</div>
            <input value={editCourse} onChange={e=>setEditCourse(e.target.value.toUpperCase())}
              placeholder="e.g. COS 355"
              style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'9px 11px',color:'var(--text)',fontSize:13,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}/>
            {suggestions.map(c=>(
              <button key={c} onClick={()=>setEditCourse(c)}
                style={{display:'block',width:'100%',marginTop:3,background:'rgba(79,156,249,.07)',border:'1px solid rgba(79,156,249,.2)',borderRadius:5,padding:'3px 8px',color:'#4f9cf9',fontSize:10,cursor:'pointer',textAlign:'left',fontFamily:"'IBM Plex Mono',monospace"}}>
                → {c}
              </button>
            ))}
          </div>
          <div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--muted)',letterSpacing:2,marginBottom:5}}>TITLE</div>
            <input value={editTitle} onChange={e=>setEditTitle(e.target.value)}
              placeholder="Chapter or document title"
              style={{width:'100%',background:'var(--input-bg)',border:`1px solid ${editTitle?'var(--border)':'rgba(240,80,80,.4)'}`,borderRadius:8,padding:'9px 11px',color:'var(--text)',fontSize:13}}/>
            {!editTitle&&<div style={{fontSize:10,color:'#f05050',marginTop:3}}>Required</div>}
          </div>
        </div>

        {/* Year / Semester / Dept — only for study guide */}
        {saveAs==='course'&&(
          <div style={{marginBottom:18}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
              <div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--muted)',letterSpacing:2,marginBottom:6}}>YEAR</div>
                <div style={{display:'flex',gap:5}}>
                  {YEARS.map(y=>(
                    <button key={y} onClick={()=>setEditYear(y)}
                      style={{flex:1,padding:'7px 0',borderRadius:7,cursor:'pointer',fontSize:12,fontWeight:editYear===y?700:400,
                        border:`1px solid ${editYear===y?YEAR_COLORS[y]+'80':'var(--border)'}`,
                        background:editYear===y?YEAR_BG[y]:'var(--input-bg)',
                        color:editYear===y?YEAR_COLORS[y]:'var(--muted)'}}>
                      {y}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--muted)',letterSpacing:2,marginBottom:6}}>SEMESTER</div>
                <div style={{display:'flex',gap:5}}>
                  {[1,2].map(s=>(
                    <button key={s} onClick={()=>setEditSem(s)}
                      style={{flex:1,padding:'7px 0',borderRadius:7,cursor:'pointer',fontSize:12,fontWeight:editSem===s?700:400,
                        border:`1px solid ${editSem===s?accentColor+'80':'var(--border)'}`,
                        background:editSem===s?YEAR_BG[editYear]||'rgba(79,156,249,.1)':'var(--input-bg)',
                        color:editSem===s?accentColor:'var(--muted)'}}>
                      Sem {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--muted)',letterSpacing:2,marginBottom:6}}>DEPARTMENT</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {DEPARTMENTS.map(d=>{
                  const col=DEPT_COLOR[d]||'#4f9cf9';
                  const active=editDept===d;
                  return(
                    <button key={d} onClick={()=>setEditDept(d)}
                      style={{padding:'7px 12px',borderRadius:7,cursor:'pointer',fontSize:12,
                        border:`1.5px solid ${active?col:col+'30'}`,background:active?`${col}14`:'var(--input-bg)',
                        color:active?col:'var(--muted)',fontWeight:active?700:400,display:'flex',alignItems:'center',gap:5}}>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,background:active?`${col}25`:'var(--border)',color:active?col:'var(--muted)',borderRadius:3,padding:'1px 5px'}}>{DEPT_SHORT[d]||d.slice(0,2)}</span>
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Content summary for study guides */}
        {saveAs==='course'&&(aiResult.keyConcepts?.length||aiResult.questions?.length)&&(
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:9,padding:'11px 14px',marginBottom:16,display:'flex',gap:16,flexWrap:'wrap'}}>
            {[{l:'Concepts',v:aiResult.keyConcepts?.length||0,c:'#4f9cf9'},{l:'Terms',v:aiResult.definitions?.length||0,c:'#f9a84f'},{l:'Questions',v:aiResult.questions?.length||0,c:'#7fda96'},{l:'Mechanisms',v:aiResult.mechanisms?.length||0,c:'#da7ff0'}].map(s=>(
              <div key={s.l} style={{textAlign:'center',flex:1,minWidth:50}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,color:s.c,fontWeight:700}}>{s.v}</div>
                <div style={{fontSize:10,color:'var(--muted)',marginTop:1}}>{s.l}</div>
              </div>
            ))}
          </div>
        )}

        {/* Existing course tab note */}
        {matchedCode&&saveAs==='course'&&(
          <div style={{background:'rgba(79,156,249,.06)',border:'1px solid rgba(79,156,249,.2)',borderRadius:8,padding:'8px 13px',marginBottom:14,fontSize:12,color:'#4f9cf9',display:'flex',gap:8,alignItems:'center'}}>
            <span>📂</span><span>Adds to existing <strong>{matchedCode}</strong> course tab.</span>
          </div>
        )}

        <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:4}}>
          <button onClick={onCancel} style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'10px 18px',fontSize:13}}>Cancel</button>
          <button
            onClick={()=>onConfirm({...aiResult,courseName:normalizeCourseCode(editCourse)||aiResult.courseName||'',chapterTitle:editTitle,_saveAs:saveAs,_year:editYear,_semester:editSem,_department:editDept})}
            disabled={!editTitle.trim()}
            style={{background:!editTitle.trim()?'var(--border)':'#4f9cf9',border:'none',borderRadius:8,color:!editTitle.trim()?'var(--muted)':'#000',cursor:!editTitle.trim()?'not-allowed':'pointer',padding:'10px 24px',fontSize:13,fontWeight:700}}>
            ✓ Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ COURSE TAB VIEW ═══════════════ */
function CourseTabView({courseCode,courses,user,progress,onSelectCourse,onBack,bookmarks,toggleBookmark}){
  const chapters=useMemo(()=>courses.filter(c=>normalizeCourseCode(c.courseName)===courseCode),[courses,courseCode]);
  const courseIds=useMemo(()=>chapters.map(c=>c.id),[chapters]);
  const[tabData,setTabData]=useState({assignments:[],cas:[],resources:[],announcements:[]});
  const[activeSection,setActiveSection]=useState('chapters');
  const[dataLoaded,setDataLoaded]=useState(false);
  const[chapterSort,setChapterSort]=useState('default');
  const isPriv=user.role===ROLE.SUPERUSER||user.role===ROLE.ADMIN;
  const dominantYear=chapters[0]?.year||1;
  const accent=YEAR_COLORS[dominantYear]||'#4f9cf9';
  const dept=chapters[0]?.department||'Computer Science';
  const deptColor=DEPT_COLOR[dept]||'#4f9cf9';

  useEffect(()=>{
    setDataLoaded(false);
    dbLoadCourseTabData(courseIds).then(d=>{setTabData(d);setDataLoaded(true);});
  },[courseIds.join(',')]);

  const totalConcepts=chapters.reduce((a,c)=>a+(c.conceptCount||0),0);
  const totalQ=chapters.reduce((a,c)=>a+(c.qCount||0),0);
  const visitedCount=chapters.filter(c=>progress[c.id]?.viewed).length;

  const sections=[
    {id:'chapters',     label:'📚 Chapters',    count:chapters.length},
    {id:'assignments',  label:'📋 Assignments', count:tabData.assignments.length},
    {id:'cas',          label:'📝 CAs & Tests', count:tabData.cas.length},
    {id:'announcements',label:'📣 Notices',     count:tabData.announcements.length},
    {id:'resources',    label:'🔗 Resources',   count:tabData.resources.length},
    {id:'community',    label:'💬 Community'},
  ];

  return(
    <div className="home-page" style={{maxWidth:990,margin:'0 auto',padding:'28px 20px 88px'}}>
      <div className="fade-up">
        <button onClick={onBack} style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'6px 14px',fontSize:12,fontFamily:"'IBM Plex Mono',monospace",marginBottom:20}}>← All Courses</button>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16,flexWrap:'wrap',marginBottom:22}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6,flexWrap:'wrap'}}>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:26,fontWeight:700,color:accent,letterSpacing:1}}>{courseCode}</span>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:`${deptColor}18`,color:deptColor,border:`1px solid ${deptColor}30`,borderRadius:4,padding:'2px 8px'}}>{DEPT_SHORT[dept]||dept}</span>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:YEAR_BG[dominantYear],color:accent,border:`1px solid ${accent}30`,borderRadius:4,padding:'2px 8px'}}>Year {dominantYear}</span>
            </div>
            <div style={{fontSize:13,color:'var(--muted)'}}>
              {chapters.length} chapter{chapters.length!==1?'s':''} · {totalConcepts} concepts · {totalQ} questions
              {visitedCount>0&&<span style={{color:'#7fda96',marginLeft:8}}>· {visitedCount}/{chapters.length} visited</span>}
              {totalQ>0&&<span style={{color:'#4f9cf9',marginLeft:8}}>· {Math.round(chapters.reduce((a,c)=>a+(progress[c.id]?.openedQs?.length||0),0)/totalQ*100)}% questions opened</span>}
              {chapters.length>0&&<span style={{color:'var(--muted)',marginLeft:8}}>· ~{Math.ceil(chapters.length*12)} min est.</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="course-tabs-row" style={{display:'flex',gap:2,borderBottom:'1px solid var(--border)',marginBottom:22,overflowX:'auto',flexWrap:'nowrap'}}>
        {sections.map(s=>(
          <button key={s.id} onClick={()=>setActiveSection(s.id)}
            style={{background:'none',border:'none',borderBottom:activeSection===s.id?`2px solid ${accent}`:'2px solid transparent',color:activeSection===s.id?accent:'var(--muted)',cursor:'pointer',padding:'9px 16px',fontSize:13,letterSpacing:.2,fontWeight:activeSection===s.id?600:400,whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
            {s.label}
            {s.count>0&&<span style={{background:activeSection===s.id?`${accent}20`:'var(--border)',color:activeSection===s.id?accent:'var(--muted)',borderRadius:10,padding:'1px 7px',fontSize:9,fontFamily:"'IBM Plex Mono',monospace"}}>{s.count}</span>}
          </button>
        ))}
      </div>

      {!dataLoaded&&activeSection!=='chapters'&&<div style={{color:'var(--muted)',textAlign:'center',padding:40,fontSize:13}}>Loading…</div>}

      {/* CHAPTERS */}
      {activeSection==='chapters'&&(
        <div className="fade-in">
          {/* Chapter sort */}
          {chapters.length>1&&(
            <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
              <select value={chapterSort} onChange={e=>setChapterSort(e.target.value)}
                style={{background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:7,color:'var(--text)',padding:'6px 10px',fontSize:11}}>
                <option value="default">Default order</option>
                <option value="progress">By progress</option>
                <option value="unseen">Unseen first</option>
                <option value="name">A → Z</option>
                <option value="questions">Most Questions</option>
              </select>
            </div>
          )}
          {chapters.length===0
            ?<div style={{textAlign:'center',padding:50,color:'var(--muted)',fontSize:13,border:'1px dashed var(--border)',borderRadius:12}}>No chapters here yet — they'll appear once the superuser uploads study guides for {courseCode}.</div>
            :<div style={{display:'flex',flexDirection:'column',gap:10}}>
              {[...chapters].sort((a,b)=>{
                if(chapterSort==='progress'){const pa=(progress[a.id]?.openedQs||[]).length/(a.qCount||1);const pb=(progress[b.id]?.openedQs||[]).length/(b.qCount||1);return pb-pa;}
                if(chapterSort==='unseen'){const va=progress[a.id]?.viewed?1:0;const vb=progress[b.id]?.viewed?1:0;return va-vb;}
                if(chapterSort==='name') return(a.chapterTitle||'').localeCompare(b.chapterTitle||'');
                if(chapterSort==='questions') return (b.qCount||0)-(a.qCount||0);
                return 0;
              }).map((c,i)=>{
                const cp=progress[c.id];const pct=c.qCount>0?Math.round(((cp?.openedQs?.length||0)/c.qCount)*100):0;
                const viewed=cp?.viewed;const isBookmarked=bookmarks.includes(c.id);
                return(
                  <div key={c.id} className={`stagger-${Math.min(i%4+1,4)}`}
                    style={{background:'var(--card)',border:`1px solid ${viewed?'rgba(127,218,150,.25)':'var(--border)'}`,borderRadius:12,padding:'16px 20px',cursor:'pointer',borderLeft:`3px solid ${YEAR_COLORS[c.year]||accent}`,transition:'transform .15s,box-shadow .15s'}}
                    onClick={()=>onSelectCourse(c.id)}
                    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,.2)';}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10}}>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',gap:6,marginBottom:6,flexWrap:'wrap',alignItems:'center'}}>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:YEAR_BG[c.year],color:YEAR_COLORS[c.year]||accent,borderRadius:4,padding:'2px 7px'}}>Yr {c.year} · Sem {c.semester||1}</span>
                          {viewed&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'#7fda96'}}>✓ Visited</span>}
                        </div>
                        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:'var(--text)',lineHeight:1.3,marginBottom:8}}>{c.chapterTitle}</div>
                        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                          <Tag color={YEAR_COLORS[c.year]||accent}>{c.conceptCount||0} concepts</Tag>
                          <Tag color={YEAR_COLORS[c.year]||accent}>{c.termCount||0} terms</Tag>
                          <Tag color={YEAR_COLORS[c.year]||accent}>{c.qCount||0} Q&A</Tag>
                        </div>
                        {!isPriv&&c.qCount>0&&(
                          <div style={{marginTop:10}}>
                            <div style={{height:3,background:'var(--border)',borderRadius:2,overflow:'hidden'}}>
                              <div style={{height:'100%',width:`${pct}%`,background:YEAR_COLORS[c.year]||accent,borderRadius:2,transition:'width .5s'}}/>
                            </div>
                            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginTop:3}}>{pct}% complete</div>
                          </div>
                        )}
                      </div>
                      <div style={{display:'flex',gap:6,alignItems:'center',flexShrink:0}}>
                        <button onClick={e=>{e.stopPropagation();toggleBookmark(c.id);}} style={{background:isBookmarked?'rgba(249,168,79,.15)':'none',border:`1px solid ${isBookmarked?'#f9a84f':'var(--border)'}`,borderRadius:7,color:isBookmarked?'#f9a84f':'var(--muted)',cursor:'pointer',padding:'6px 10px',fontSize:13}}>🔖</button>
                        <span style={{color:'var(--muted)',fontSize:18}}>›</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          }
        </div>
      )}

      {/* ASSIGNMENTS */}
      {activeSection==='assignments'&&dataLoaded&&(
        <div className="fade-in">
          {tabData.assignments.length===0
            ?<div style={{textAlign:'center',padding:40,color:'var(--muted)',border:'1px dashed var(--border)',borderRadius:12,fontSize:13}}>No assignments for {courseCode} yet.</div>
            :<div style={{display:'flex',flexDirection:'column',gap:10}}>
              {tabData.assignments.map((a,i)=>(
                <div key={a.id} className={`stagger-${Math.min(i%4+1,4)}`} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:11,padding:'15px 18px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',gap:10,flexWrap:'wrap',alignItems:'flex-start'}}>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'#4f9cf9',marginBottom:4,letterSpacing:1}}>ASSIGNMENT</div>
                      <div style={{fontSize:14,fontWeight:600,color:'var(--text)',marginBottom:4}}>{a.title}</div>
                      {a.description&&<p style={{fontSize:12,color:'var(--muted)',lineHeight:1.6,margin:0}}>{a.description}</p>}
                    </div>
                    {a.due_date&&<div style={{background:'rgba(249,168,79,.1)',border:'1px solid rgba(249,168,79,.3)',borderRadius:6,padding:'5px 11px',flexShrink:0,textAlign:'center'}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'#f9a84f',letterSpacing:1}}>DUE</div>
                      <div style={{fontSize:12,color:'#f9a84f',fontWeight:600}}>{new Date(a.due_date).toLocaleDateString()}</div>
                    </div>}
                  </div>
                  {a.marks&&<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginTop:8}}>{a.marks} marks</div>}
                </div>
              ))}
            </div>
          }
        </div>
      )}

      {/* CAs */}
      {activeSection==='cas'&&dataLoaded&&(
        <div className="fade-in">
          {tabData.cas.length===0
            ?<div style={{textAlign:'center',padding:40,color:'var(--muted)',border:'1px dashed var(--border)',borderRadius:12,fontSize:13}}>No CAs or tests for {courseCode} yet.</div>
            :<div style={{display:'flex',flexDirection:'column',gap:10}}>
              {tabData.cas.map((ca,i)=>(
                <div key={ca.id} className={`stagger-${Math.min(i%4+1,4)}`} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:11,padding:'15px 18px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',gap:10,flexWrap:'wrap',alignItems:'flex-start'}}>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'#da7ff0',marginBottom:4,letterSpacing:1}}>{ca.type||'CA'}</div>
                      <div style={{fontSize:14,fontWeight:600,color:'var(--text)',marginBottom:4}}>{ca.title}</div>
                      {ca.description&&<p style={{fontSize:12,color:'var(--muted)',lineHeight:1.6,margin:0}}>{ca.description}</p>}
                    </div>
                    {ca.date&&<div style={{background:'rgba(218,127,240,.1)',border:'1px solid rgba(218,127,240,.3)',borderRadius:6,padding:'5px 11px',flexShrink:0,textAlign:'center'}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'#da7ff0',letterSpacing:1}}>DATE</div>
                      <div style={{fontSize:12,color:'#da7ff0',fontWeight:600}}>{new Date(ca.date).toLocaleDateString()}</div>
                    </div>}
                  </div>
                  {ca.marks&&<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginTop:8}}>{ca.marks} marks</div>}
                </div>
              ))}
            </div>
          }
        </div>
      )}

      {/* RESOURCES */}
      {activeSection==='resources'&&dataLoaded&&(
        <div className="fade-in">
          {tabData.resources.length===0
            ?<div style={{textAlign:'center',padding:40,color:'var(--muted)',border:'1px dashed var(--border)',borderRadius:12,fontSize:13}}>No resources for {courseCode} yet.</div>
            :<div style={{display:'flex',flexDirection:'column',gap:8}}>
              {tabData.resources.map((r,i)=>(
                <div key={r.id} style={{display:'flex',alignItems:'center',gap:10}}>
                  <a href={r.url||'#'} target="_blank" rel="noopener noreferrer"
                    style={{flex:1,background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:'13px 16px',textDecoration:'none',display:'flex',alignItems:'center',gap:12,transition:'border-color .15s'}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(79,156,249,.4)'}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=''}>
                    <span style={{fontSize:20,flexShrink:0}}>{RES_ICONS[r.type]||'🔗'}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.title||r.url}</div>
                      {r.description&&<div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{r.description}</div>}
                    </div>
                    <span style={{color:'var(--muted)',fontSize:16,flexShrink:0}}>↗</span>
                  </a>
                  <button onClick={()=>{try{navigator.clipboard.writeText(r.url||'');}catch{}}} title="Copy link"
                    style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'8px 10px',fontSize:13,flexShrink:0,transition:'all .15s'}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(79,156,249,.4)';e.currentTarget.style.color='#4f9cf9';}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--muted)';}}>📋</button>
                </div>
              ))}
            </div>
          }
        </div>
      )}

      {/* ANNOUNCEMENTS */}
      {activeSection==='announcements'&&dataLoaded&&(
        <div className="fade-in">
          {tabData.announcements.length===0
            ?<div style={{textAlign:'center',padding:40,color:'var(--muted)',border:'1px dashed var(--border)',borderRadius:12,fontSize:13}}>No announcements for this course yet. Check back later!</div>
            :<div style={{display:'flex',flexDirection:'column',gap:10}}>
              {tabData.announcements.map((a,i)=>{
                const p=PRIORITY[a.priority]||PRIORITY.info;
                return(
                  <div key={a.id} className={`stagger-${Math.min(i%4+1,4)}`} style={{background:p.bg,border:`1px solid ${p.border}`,borderRadius:10,padding:'14px 16px'}}>
                    <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                      <span style={{fontSize:16,flexShrink:0}}>{p.icon}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:600,color:'var(--text)',marginBottom:4}}>{a.title}</div>
                        <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.7,margin:0}}>{a.body}</p>
                        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginTop:6}}>{new Date(a.posted_at).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          }
        </div>
      )}

      {/* Community board — course-level shared discussion */}
      {activeSection==='community'&&(
        <div className="fade-in">
          <CommunityBoard courseId={chapters[0]?.id||courseCode} user={user}/>
        </div>
      )}
    </div>
  );
}

function UploadModal({onClose,onDone,adminMode=false,requestedBy='',courses=[]}){
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
  const[pendingAiResult,setPendingAiResult]=useState(null); // holds AI result waiting for confirm
  const[dupWarning,setDupWarning]=useState(null); // {exact:bool, matches:[{id,chapterTitle,courseName,year,semester}]}
  const fileRef=useRef();

  const copyPrompt=()=>{navigator.clipboard.writeText(JSON_PROMPT);setCopied(true);setTimeout(()=>setCopied(false),2000);};

  // Similarity check: compares a candidate against existing courses
  const checkDuplicates=useCallback((chapterTitle='',courseName='')=>{
    if(!courses.length) return null;
    const normT=chapterTitle.toLowerCase().replace(/[^a-z0-9\s]/g,'').trim();
    const normC=courseName.toLowerCase().replace(/[^a-z0-9\s]/g,'').trim();
    const words=t=>new Set(t.split(/\s+/).filter(w=>w.length>3));
    const jaccard=(a,b)=>{
      const setA=words(a),setB=words(b);
      const intersection=[...setA].filter(x=>setB.has(x)).length;
      const union=new Set([...setA,...setB]).size;
      return union===0?0:intersection/union;
    };
    const matches=[];
    for(const c of courses){
      const ct=(c.chapterTitle||'').toLowerCase().replace(/[^a-z0-9\s]/g,'').trim();
      const cn=(c.courseName||'').toLowerCase().replace(/[^a-z0-9\s]/g,'').trim();
      const titleSim=jaccard(normT,ct);
      const courseSim=jaccard(normC,cn);
      const exact=normT===ct&&normC===cn;
      if(exact||titleSim>0.6){
        matches.push({...c,titleSim,exact});
      }
    }
    if(!matches.length) return null;
    return{exact:matches.some(m=>m.exact),matches:matches.slice(0,3)};
  },[courses]);

  const saveEntry=async(data,autoDetected)=>{
    if(!data.chapterTitle) throw new Error('Missing chapterTitle in response');
    // Normalise all array fields so components never call .map() on null
    data.summary      = typeof data.summary === 'string' ? data.summary.trim() : '';
    data.diagrams     = Array.isArray(data.diagrams)     ? data.diagrams     : [];
    data.keyConcepts  = Array.isArray(data.keyConcepts)  ? data.keyConcepts  : [];
    data.definitions  = Array.isArray(data.definitions)  ? data.definitions  : [];
    data.mechanisms   = Array.isArray(data.mechanisms)   ? data.mechanisms   : [];
    data.algorithms   = Array.isArray(data.algorithms)   ? data.algorithms   : [];
    data.chapters     = Array.isArray(data.chapters)     ? data.chapters     : [];
    data.questions    = Array.isArray(data.questions)    ? data.questions    : [];
    // Ensure nested arrays inside chapters are safe
    data.chapters = data.chapters.map(ch=>({...ch,takeaways:Array.isArray(ch.takeaways)?ch.takeaways:[]}));
    // Ensure every concept/definition has required string fields
    data.keyConcepts = data.keyConcepts.map(c=>({title:c.title||'',description:c.description||'',color:c.color||'blue'}));
    data.definitions = data.definitions.map(d=>({term:d.term||'',definition:d.definition||''}));
    data.questions   = data.questions.map(q=>({question:q.question||'',answer:q.answer||''}));
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
    setStatus('processing');setError('');setPendingAiResult(null);
    try{
      setProgress(`Reading ${file.name}…`);
      const text=await extractText(file);
      if(text.startsWith('__STUDYHUB_JSON__:')){
        const data=safeParse(text.replace('__STUDYHUB_JSON__:',''));
        setStatus('idle');setProgress('');
        setPendingAiResult({...data,_type:'course'});return;
      }
      const useVision=text==='__USE_VISION__'||text==='__IMAGE_NEEDED__';
      setProgress(useVision?'Sending to AI vision model…':'Sending to AI…');
      let body;
      if(useVision){const b64=await toBase64(file);body={imageBase64:b64,mimeType:file.type||'image/png'};}
      else{body={text};}
      const res=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e.error||`Server error ${res.status}`);}
      const data=await res.json();
      // Show confirmation modal instead of auto-saving
      setStatus('idle');setProgress('');
      const detected=detectMetadata(data);
      const dup=checkDuplicates(data.chapterTitle,data.courseName);
      setDupWarning(dup);
      setPendingAiResult({...data,_detectedYear:detected.year,_detectedSem:detected.semester,_detectedDept:detected.department});
    }catch(e){
      const msg=e.message||'Unknown error';
      const friendly=msg.includes('control character')||msg.includes('JSON')
        ?'The file contains formatting that could not be parsed. Try saving it as plain .txt or .docx and uploading again.'
        :msg.includes('413')||msg.includes('too large')
        ?'File is too large. Try splitting it into smaller sections.'
        :'Failed: '+msg;
      setError(friendly);setStatus('idle');setProgress('');
    }
  };

  const processPaste=async()=>{
    setError('');setSmartSortMsg('');
    try{
      const data=safeParse(pasteText.replace(/```json|```/g,'').trim());
      if(!data.chapterTitle) throw new Error('Missing chapterTitle');
      const detected=detectMetadata(data);
      const dup=checkDuplicates(data.chapterTitle,data.courseName);
      setDupWarning(dup);
      setPendingAiResult({...data,_type:'course',_detectedYear:detected.year,_detectedSem:detected.semester,_detectedDept:detected.department});
    }catch(e){setError('Invalid JSON: '+e.message);setStatus('idle');}
  };

  const handleConfirm=async(confirmed)=>{
    setPendingAiResult(null);
    const saveAs=confirmed._saveAs||'course';
    const isDup=!!dupWarning;
    setDupWarning(null);
    setStatus('processing');setProgress('Saving…');
    try{
      if(saveAs==='assignment'){
        setSmartSortMsg('📋 Saved as Assignment');
        await onDone?.(null,null,null,{type:'assignment',data:confirmed});
        setStatus('done');return;
      }
      if(saveAs==='ca'){
        setSmartSortMsg('📝 Saved as CA / Test');
        await onDone?.(null,null,null,{type:'ca',data:confirmed});
        setStatus('done');return;
      }
      if(saveAs==='resource'){
        setSmartSortMsg('🔗 Saved as Resource');
        setStatus('done');return;
      }
      // Study guide — if duplicate detected, force it to approval queue regardless of role
      const autoDetected={year:confirmed._year,semester:confirmed._semester,department:confirmed._department};
      if(isDup&&!adminMode){
        // Force to pending queue even for superuser-direct uploads — superuser reviews their own
        const id=`c-${Date.now()}-dup`;
        const entry={id,year:confirmed._year,semester:confirmed._semester,department:confirmed._department,
          courseName:confirmed.courseName||'Course',chapterTitle:confirmed.chapterTitle,
          conceptCount:confirmed.keyConcepts?.length||0,termCount:confirmed.definitions?.length||0,
          qCount:confirmed.questions?.length||0,addedAt:new Date().toLocaleDateString()};
        await dbSubmitPending('add_course',requestedBy||'superuser',{entry,courseData:confirmed},
          `⚠️ DUPLICATE WARNING: Similar course detected — "${dupWarning?.matches?.[0]?.chapterTitle||'unknown'}". Requires superuser review.`);
        setSmartSortMsg('⚠️ Potential duplicate — flagged for superuser review before saving.');
        setStatus('done');
      } else {
        await saveEntry(confirmed,autoDetected);
        setSmartSortMsg(`✨ Saved: ${confirmed.courseName||''} · Yr ${confirmed._year} · Sem ${confirmed._semester}`);
      }
    }catch(e){
      setError('Save failed: '+e.message);setStatus('idle');setProgress('');
    }
  };

  const fileType = file ? getFileType(file.name) : null;
  const canGo = status!=='processing'&&status!=='done'&&departments.length>0&&(uploadMode==='file'?!!file:!!pasteText.trim());

  return(
    <>
    {pendingAiResult&&(
      <AiConfirmModal
        aiResult={pendingAiResult}
        courses={courses}
        dupWarning={dupWarning}
        defaultYear={year} defaultSem={semester} defaultDept={departments[0]||DEPARTMENTS[0]||'Computer Science'}
        onConfirm={handleConfirm}
        onCancel={()=>{setPendingAiResult(null);setDupWarning(null);setStatus('idle');}}
      />
    )}
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
            {status==='processing'?'Processing…':status==='done'?'Done ✓':adminMode?'Submit for Approval':uploadMode==='file'?'Analyse File':'Review & Save'}
          </button>
        </div>
      </div>
    </div>

    </>
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
  const[notifFilter,setNotifFilter]=useState('all');
  const[permState,requestPerm]=useNotificationPermission();
  const[showPermBanner,setShowPermBanner]=useState(false);
  const[askingPerm,setAskingPerm]=useState(false); // blocks outside-click while dialog is open
  const bellRef=useRef();
  const dropRef=useRef();

  const prevUnseenRef=useRef(0);
  const load=useCallback(async()=>{
    if(!user||user.isGuest)return;
    const accessibleIds=courses.filter(c=>!!c.id).map(c=>c.id);
    const n=await dbLoadNotifications(user.username,accessibleIds.length>0?accessibleIds:null);
    setNotifs(n);
    // Show in-app badge pulse when unseen count increases
    if(n.unseenCount>prevUnseenRef.current&&prevUnseenRef.current>0){
      // New notifications arrived — also try OS push
      pushNotification('🔔 New notification',`You have ${n.unseenCount} unread update${n.unseenCount!==1?'s':''}`);
    }
    prevUnseenRef.current=n.unseenCount;
    if(permState==='default'&&!localStorage.getItem('sh-notif-asked')&&n.unseenCount>0){
      setShowPermBanner(true);
    }
  },[user,permState,courses]);

  useEffect(()=>{load();},[]);
  useEffect(()=>{if(open)load();},[open]);

  // Realtime: refresh bell count when assignments, CAs or announcements change
  useEffect(()=>{
    if(!user||user.isGuest) return;
    const ch=supabase.channel('rt-notif-bell')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'assignments'},()=>load())
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'course_cas'},()=>load())
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'announcements'},()=>load())
      .subscribe();
    return()=>supabase.removeChannel(ch);
  },[user?.username]);

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

  const courseMap=Object.fromEntries((courses||[]).map(c=>[c.id,c.chapterTitle?`${c.courseName} — ${c.chapterTitle}`:c.courseName]));
  const count=notifs.unseenCount;
  const filteredNotifs=notifFilter==='all'?notifs.items
    :notifs.items.filter(i=>i.type===notifFilter||(notifFilter==='unseen'&&!notifs.seen.has(i.id)));

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
                {count>0&&<span style={{marginLeft:8,background:'#f05050',color:'#fff',borderRadius:10,padding:'1px 7px',fontSize:9}}>{count}</span>}
              </div>
              <div style={{display:'flex',gap:10,alignItems:'center'}}>
                {notifs.unseenCount>0&&(
                  <button onClick={async()=>{
                    const unseen=notifs.items.filter(n=>!notifs.seen.has(n.id));
                    await Promise.all(unseen.map(n=>dbMarkSeen(user.username,n.id,n.type)));
                    await load();
                  }} style={{background:'none',border:'none',color:'#4f9cf9',cursor:'pointer',fontSize:10,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:.5,padding:0,whiteSpace:'nowrap'}}>
                    Mark all read
                  </button>
                )}
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

            {/* Filter tabs */}
            <div style={{display:'flex',gap:0,borderBottom:'1px solid var(--border)',background:'var(--surface)',flexShrink:0}}>
              {[{id:'all',label:'All'},{id:'unseen',label:'Unread'},{id:'announcement',label:'📢'},{id:'assignment',label:'📋'},{id:'ca',label:'📝'}].map(f=>(
                <button key={f.id} onClick={()=>setNotifFilter(f.id)}
                  style={{flex:1,padding:'8px 4px',border:'none',borderBottom:notifFilter===f.id?'2px solid #f9a84f':'2px solid transparent',background:'none',color:notifFilter===f.id?'#f9a84f':'var(--muted)',cursor:'pointer',fontSize:11,fontWeight:notifFilter===f.id?700:400,whiteSpace:'nowrap'}}>
                  {f.label}
                </button>
              ))}
            </div>
            {/* Items list */}
            <div style={{overflowY:'auto',flex:1,paddingBottom:'env(safe-area-inset-bottom,12px)'}}>
              {filteredNotifs.length===0&&(
                <div style={{padding:'40px 20px',textAlign:'center',color:'var(--muted)',fontSize:13}}>
                  <div style={{fontSize:36,marginBottom:10}}>🔕</div>
                  <div style={{fontWeight:600,marginBottom:4}}>No notifications yet</div>
                  <div style={{fontSize:11}}>New assignments, CAs and announcements will appear here</div>
                </div>
              )}
              {filteredNotifs.map((n,i)=>{
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
                        <span>{timeAgo(n.time)}</span>
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

/* ═══════════════ DATE / TIME HELPERS (module level) ═══════════════ */
const overdue   = d => d && new Date(d) < new Date();
// Simple inline markdown renderer — bold **text**, italic *text*, `code`
const renderMd = (text='') => {
  if(!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((p,i) => {
    if(p.startsWith('**') && p.endsWith('**')) return <strong key={i} style={{fontWeight:700}}>{p.slice(2,-2)}</strong>;
    if(p.startsWith('*')  && p.endsWith('*'))  return <em key={i} style={{fontStyle:'italic'}}>{p.slice(1,-1)}</em>;
    if(p.startsWith('`')  && p.endsWith('`'))  return <code key={i} style={{fontFamily:"'IBM Plex Mono',monospace",background:'rgba(79,156,249,.12)',borderRadius:3,padding:'1px 5px',fontSize:'0.9em'}}>{p.slice(1,-1)}</code>;
    return p;
  });
};
const daysUntil = d => { if(!d) return null; return Math.ceil((new Date(d)-new Date())/(1000*60*60*24)); };
const timeAgo   = d => {
  if(!d) return '';
  const s = Math.floor((Date.now()-new Date(d))/1000);
  if(s<60)     return 'just now';
  if(s<3600)   return `${Math.floor(s/60)}m ago`;
  if(s<86400)  return `${Math.floor(s/3600)}h ago`;
  if(s<604800) return `${Math.floor(s/86400)}d ago`;
  return new Date(d).toLocaleDateString('en-NG',{day:'numeric',month:'short'});
};
const dueBadge = d => {
  if(!d) return null;
  const n = daysUntil(d);
  if(n<0)  return {text:'Overdue',  color:'#f05050',bg:'rgba(240,80,80,.1)'};
  if(n===0)return {text:'Due today',color:'#f05050',bg:'rgba(240,80,80,.08)'};
  if(n<=2) return {text:`${n}d left`,color:'#f9a84f',bg:'rgba(249,168,79,.1)'};
  if(n<=7) return {text:`${n}d left`,color:'#f9a84f',bg:'rgba(249,168,79,.06)'};
  return {text:new Date(d).toLocaleDateString('en-NG',{day:'numeric',month:'short'}),color:'var(--muted)',bg:'transparent'};
};

/* ═══════════════ ASSIGNMENTS TAB ═══════════════ */
function AssignmentsTab({courseId,user}){
  const[items,setItems]=useState([]);const[showForm,setShowForm]=useState(false);
  const[form,setForm]=useState({title:'',description:'',due_date:'',marks:'',file_url:'',priority:'normal'});
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
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,color:'var(--muted)',marginBottom:5,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>PRIORITY</div>
              <div style={{display:'flex',gap:6}}>
                {[{id:'low',label:'Low',c:'#7fda96'},{id:'normal',label:'Normal',c:'#4f9cf9'},{id:'high',label:'High',c:'#f9a84f'},{id:'urgent',label:'Urgent',c:'#f05050'}].map(p=>(
                  <button key={p.id} type="button" onClick={()=>setForm(f=>({...f,priority:p.id}))}
                    style={{flex:1,padding:'6px 0',borderRadius:7,border:`1.5px solid ${(form.priority||'normal')===p.id?p.c:'var(--border)'}`,background:(form.priority||'normal')===p.id?`${p.c}18`:'var(--surface)',color:(form.priority||'normal')===p.id?p.c:'var(--muted)',cursor:'pointer',fontSize:11,fontWeight:(form.priority||'normal')===p.id?700:400,transition:'all .15s'}}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Field label="FILE / LINK (optional)" value={form.file_url} onChange={e=>setForm(f=>({...f,file_url:e.target.value}))} placeholder="https://..." maxLength={500}/>
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
                  <div style={{display:'flex',alignItems:'center',gap:7,flex:1}}>
                    <span style={{fontSize:14,fontWeight:600,color:'var(--text)',flex:1,lineHeight:1.35}}>{a.title}</span>
                    {a.priority&&a.priority!=='normal'&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,padding:'2px 7px',borderRadius:4,background:a.priority==='urgent'?'rgba(240,80,80,.15)':a.priority==='high'?'rgba(249,168,79,.15)':'rgba(127,218,150,.15)',color:a.priority==='urgent'?'#f05050':a.priority==='high'?'#f9a84f':'#7fda96',fontWeight:700,letterSpacing:.4,flexShrink:0}}>{(a.priority||'').toUpperCase()}</span>}
                  </div>
                  {a.marks&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:'rgba(249,168,79,.15)',color:'#f9a84f',borderRadius:4,padding:'2px 7px'}}>{a.marks} marks</span>}
                  {a.due_date&&(()=>{const db=dueBadge(a.due_date);return db?<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:db.bg||'transparent',color:db.color,borderRadius:4,padding:'2px 7px',fontWeight:db.color==='#f05050'?700:400}}>📅 {db.text}</span>:null;})()}
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
                    <div style={{display:'flex',alignItems:'center',gap:7,flex:1}}>
                    <span style={{fontSize:14,fontWeight:600,color:'var(--text)',flex:1,lineHeight:1.35}}>{a.title}</span>
                    {a.priority&&a.priority!=='normal'&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,padding:'2px 7px',borderRadius:4,background:a.priority==='urgent'?'rgba(240,80,80,.15)':a.priority==='high'?'rgba(249,168,79,.15)':'rgba(127,218,150,.15)',color:a.priority==='urgent'?'#f05050':a.priority==='high'?'#f9a84f':'#7fda96',fontWeight:700,letterSpacing:.4,flexShrink:0}}>{(a.priority||'').toUpperCase()}</span>}
                  </div>
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
function CommunityBoard({courseId,user,subCfg={}}){
  const[posts,setPosts]=useState([]);const[communitySort,setCommunitySort]=useState('newest');const[myVotes,setMyVotes]=useState([]);const[showForm,setShowForm]=useState(false);
  const[form,setForm]=useState({title:'',url:'',description:''});const[loading,setLoading]=useState(false);
  const isPriv=user.role!==ROLE.USER;
  const isGuest=user.isGuest===true;
  const freePosting=(subCfg?.free_community_posting||'false')==='true';
  const maxPostsPerDay=parseInt(subCfg?.max_community_posts||'5');
  const isFree=!isGuest&&user.role!==ROLE.SUPERUSER&&(user.subscription_tier||'free')==='free';
  const canPost=!isGuest&&(!isFree||freePosting||isPriv);

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
      ):!canPost?(
        <div style={{background:'rgba(249,168,79,.06)',border:'1px solid rgba(249,168,79,.2)',borderRadius:10,padding:'14px 16px',marginBottom:16,display:'flex',gap:10,alignItems:'center'}}>
          <span style={{fontSize:18}}>⭐</span>
          <div>
            <div style={{fontSize:13,color:'#f9a84f',fontWeight:600,marginBottom:2}}>Pro feature — community posting</div>
            <div style={{fontSize:12,color:'var(--muted)'}}>Upgrade to Pro to share resources and participate in the community board.</div>
          </div>
        </div>
      ):(
        <button onClick={()=>setShowForm(s=>!s)} style={{background:'rgba(79,156,249,.1)',border:'1px solid rgba(79,156,249,.25)',borderRadius:8,color:'#4f9cf9',cursor:'pointer',padding:'8px 16px',fontSize:12,fontWeight:600,marginBottom:16}}>
          {showForm?'✕ Cancel':'+ Submit a Resource'}
        </button>
      )}

      {showForm&&!isGuest&&(
        <div className="scale-in" style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'16px 18px',marginBottom:16}}>
          <Field label="TITLE" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Great YouTube explanation" maxLength={100}/>
          <Field label="URL" value={form.url} onChange={e=>setForm(f=>({...f,url:e.target.value}))} placeholder="https://..." maxLength={500}/>
          <Field label="DESCRIPTION (optional)" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Brief note about this resource" maxLength={200}/>
          <button onClick={submit} disabled={loading||!form.title.trim()||!form.url.trim()} style={{background:loading?'var(--border)':'#4f9cf9',border:'none',borderRadius:7,color:loading?'var(--muted)':'#000',cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:700}}>
            {loading?'Submitting…':'Submit'}
          </button>
        </div>
      )}

      {/* Sort bar */}
      {posts.length>1&&(
        <div style={{display:'flex',alignItems:'center',marginBottom:10}}>
          <Mono color="var(--muted)" size={9}>{posts.length} POST{posts.length!==1?'S':''}</Mono>
          <div style={{marginLeft:'auto',display:'flex',gap:6}}>
            {[{id:'newest',label:'Newest'},{id:'popular',label:'Popular'}].map(s=>(
              <button key={s.id} onClick={()=>setCommunitySort(s.id)}
                style={{background:communitySort===s.id?'rgba(79,156,249,.1)':'none',border:`1px solid ${communitySort===s.id?'rgba(79,156,249,.4)':'var(--border)'}`,borderRadius:20,color:communitySort===s.id?'#4f9cf9':'var(--muted)',cursor:'pointer',padding:'4px 12px',fontSize:11,fontWeight:communitySort===s.id?600:400}}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {posts.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:30,border:'1px dashed var(--border)',borderRadius:10,fontSize:13}}>No community posts yet{isGuest?' — sign up to be the first!':' — be the first to share!'}</div>}
        {[...posts].sort((a,b)=>communitySort==='popular'?(b.upvote_count||0)-(a.upvote_count||0):new Date(b.submitted_at||0)-new Date(a.submitted_at||0)).map((p,i)=>{
          const voted=myVotes.includes(p.id);
          return(
            <div key={p.id} className={`stagger-${Math.min(i+1,4)}`} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:'13px 16px',display:'flex',gap:12,alignItems:'flex-start'}}>
              <button onClick={()=>vote(p.id)} disabled={isGuest} title={isGuest?'Sign up to vote':''} style={{background:voted?'rgba(79,156,249,.15)':'var(--input-bg)',border:`1px solid ${voted?'rgba(79,156,249,.4)':'var(--border)'}`,borderRadius:8,color:isGuest?'var(--border)':voted?'#4f9cf9':'var(--muted)',cursor:isGuest?'not-allowed':'pointer',padding:'6px 10px',display:'flex',flexDirection:'column',alignItems:'center',gap:2,flexShrink:0,minWidth:42,transition:'all .15s',transform:voted?'scale(1.05)':'scale(1)'
}}>
                <span style={{fontSize:14}}>▲</span>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600}}>{p.upvote_count||0}</span>
              </button>
              <div style={{flex:1,minWidth:0}}>
                <a href={p.url} target="_blank" rel="noopener noreferrer" style={{fontSize:14,fontWeight:600,color:'#4f9cf9',textDecoration:'none',wordBreak:'break-word'}}>{p.title}</a>
                {p.description&&<p style={{fontSize:12,color:'var(--muted)',marginTop:3,lineHeight:1.5}}>{p.description}</p>}
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginTop:4,letterSpacing:1}}>@{p.submitted_by} · {(()=>{const d=new Date(p.submitted_at);const now=new Date();const diff=Math.floor((now-d)/1000);if(diff<60)return'just now';if(diff<3600)return Math.floor(diff/60)+'m ago';if(diff<86400)return Math.floor(diff/3600)+'h ago';if(diff<604800)return Math.floor(diff/86400)+'d ago';return d.toLocaleDateString();})()}</div>
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
          <Field label="URL" value={form.url} onChange={e=>setForm(f=>({...f,url:e.target.value}))} placeholder="https://..." maxLength={500}/>
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
    <div className="def-grid fade-in" style={{display:'grid',gridTemplateColumns:'190px 1fr auto',borderBottom:isLast?'none':'1px solid var(--border)',alignItems:'stretch'}}>
      <div className="def-term" style={{padding:'12px 14px',fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:600,color:'#7fda96',background:'var(--surface)',display:'flex',alignItems:'center'}}>{def.term}</div>
      <div style={{padding:'12px 14px',fontSize:13,color:'var(--text)',lineHeight:1.7}}>{def.definition}</div>
      <button onClick={copy} title="Copy term and definition" style={{background:'none',border:'none',color:copied?'#7fda96':'var(--muted)',cursor:'pointer',padding:'0 12px',fontSize:13,flexShrink:0,opacity:copied?1:.5}} onMouseEnter={e=>e.currentTarget.style.opacity='1'} onMouseLeave={e=>!copied&&(e.currentTarget.style.opacity='.5')}>
        {copied?'✓':'⎘'}
      </button>
    </div>
  );
}

// PDF-level tabs (CourseView: individual study note)
const ALL_TABS=[
  {id:'notes',    label:'📖 Study Notes'},
  {id:'practice', label:'🎓 Practice'},
  {id:'resources',label:'🔗 Resources'},
];

function CourseView({course,user,progress,onBack,onProgressUpdate,bookmarks,toggleBookmark,courses,subCfg={}}){
  // Map legacy initialTab values to new PDF-level tab IDs
  const resolveInitialTab=(t)=>{
    if(!t) return 'notes';
    if(['announcements','assignments','ca','updates'].includes(t)) return 'notes'; // these live at course level now
    if(['concepts','definitions','mechanisms','algorithms','takeaways'].includes(t)) return 'notes';
    if(['questions','flashcards','quiz','practice'].includes(t)) return 'practice';
    if(t==='resources') return 'resources';
    return 'notes';
  };
  const resolveInitialSection=(t)=>{
    if(['concepts','definitions','mechanisms','algorithms','takeaways'].includes(t)) return t;
    if(['questions','flashcards','quiz'].includes(t)) return t==='questions'?'qa':t;
    return null;
  };
  const initTab=resolveInitialTab(course.initialTab);
  const initSection=resolveInitialSection(course.initialTab);
  const[tab,setTab]=useState(initTab);const[openQ,setOpenQ]=useState(null);const[filter,setFilter]=useState('');
  // Flashcard state
  const[fcIdx,setFcIdx]=useState(0);const[fcFlipped,setFcFlipped]=useState(false);const[fcDeck,setFcDeck]=useState('definitions');const[fcKnown,setFcKnown]=useState(new Set());
  // Quiz state
  const[quizStarted,setQuizStarted]=useState(false);const[quizIdx,setQuizIdx]=useState(0);const[quizChoice,setQuizChoice]=useState(null);const[quizScore,setQuizScore]=useState(0);const[quizLog,setQuizLog]=useState([]);const[quizDone,setQuizDone]=useState(false);const[quizOpts,setQuizOpts]=useState([]);
  const[quizMode,setQuizMode]=useState('mc'); // 'mc' = multiple choice | 'fill' = fill the gap
  const[qSearch,setQSearch]=useState('');
  const[fillInput,setFillInput]=useState('');const[fillRevealed,setFillRevealed]=useState(false);
  const[explainIdx,setExplainIdx]=useState(null);const[explainText,setExplainText]=useState({});const[explainLoading,setExplainLoading]=useState(false);
  // AI fresh questions state
  const[aiFreshQs,setAiFreshQs]=useState([]);const[aiFreshLoading,setAiFreshLoading]=useState(false);const[openFreshQ,setOpenFreshQ]=useState(null);
  // AI suggestions state
  const[suggestLoading,setSuggestLoading]=useState(false);const[suggestModal,setSuggestModal]=useState(null);
  const d=course.data;const cp=progress[course.id]||{viewed:false,openedQs:[]};const isPriv=user.role!==ROLE.USER;
  const isBookmarked=bookmarks.includes(course.id);

  // Cache for offline use
  useEffect(()=>{try{localStorage.setItem(CACHE_KEY(course.id),JSON.stringify({data:d,year:course.year,semester:course.semester||1,department:course.department||'Computer Science',cachedAt:Date.now()}));}catch{};},[]);
  useEffect(()=>{const n={...progress,[course.id]:{...cp,viewed:true,lastViewedAt:new Date().toISOString()}};onProgressUpdate(n);},[]);

  const revealQ=idx=>{setOpenQ(openQ===idx?null:idx);if(!(cp.openedQs||[]).includes(idx)){
      awardXP('qa_reveal');const n={...progress,[course.id]:{...cp,openedQs:[...(cp.openedQs||[]),idx],lastViewedAt:new Date().toISOString()}};onProgressUpdate(n);}};

  const totalQ=(d.questions||[]).length;const pct=totalQ===0?0:Math.round((cp.openedQs||[]).length/totalQ*100);
  const hasAlgo=d.algorithms?.length>0;
  const tabs=ALL_TABS;
  const[notesSection,setNotesSection]=useState((['concepts','definitions','mechanisms','algorithms','takeaways','diagrams'].includes(initSection)?initSection:'concepts'));
  const[cSearch,setCSearch]=useState('');   // concept search in notes tab
  const[dSearch,setDSearch]=useState('');   // definition search in notes tab
  const[regenLoading,setRegenLoading]=useState(false); // AI regenerate notes
  const[regenMsg,setRegenMsg]=useState('');
  const[practiceSection,setPracticeSection]=useState((['qa','flashcards','quiz'].includes(initSection)?initSection:'qa'));
  const filteredQ=(d.questions||[]).filter(q=>!filter||q.question.toLowerCase().includes(filter.toLowerCase()));
  const accent=YEAR_COLORS[course.year]||'#4f9cf9';
  const chatCtx={courseName:d.courseName,chapterTitle:d.chapterTitle,summary:[d.keyConcepts?.slice(0,5).map(c=>c.title).join(', '),d.chapters?.map(c=>c.name).join(', ')].filter(Boolean).join(' | ')};

  // Flashcard deck
  const fcCards=useMemo(()=>{
    if(fcDeck==='definitions') return(d.definitions||[]).map(df=>({front:df.term,back:df.definition,color:'#4f9cf9'}));
    return(d.keyConcepts||[]).map(c=>({front:c.title,back:c.description,color:(COLOR_MAP[c.color]||COLOR_MAP.blue).bar}));
  },[fcDeck,d.definitions,d.keyConcepts]);
  const fcCard=fcCards[fcIdx]||null;
  const fcTotal=fcCards.length;
  const fcKnownCount=fcKnown.size;

  // Quiz option generator
  const buildQuizOpts=useCallback((idx)=>{
    const qs=d.questions||[];if(!qs[idx])return[];
    const correct=qs[idx].answer;
    const pool=qs.filter((_,i)=>i!==idx).map(q=>q.answer);
    const shuffled=pool.sort(()=>Math.random()-.5).slice(0,3);
    const opts=[...shuffled,correct].sort(()=>Math.random()-.5);
    return opts;
  },[d.questions]);

  // AI improvement suggestions — routes to approvals for superuser review
  const askAiSuggestions=async()=>{
    setSuggestLoading(true);
    try{
      const summary=`Concepts: ${(d.keyConcepts||[]).map(c=>c.title).join(', ')}. Definitions: ${(d.definitions||[]).length}. Questions: ${totalQ}. Mechanisms: ${(d.mechanisms||[]).length}.`;
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        messages:[{role:'user',content:`Please suggest improvements for this course content.`}],
        context:{mode:'suggest',chapterTitle:d.chapterTitle,courseName:d.courseName,summary,isSuperuser:user.role===ROLE.SUPERUSER}
      })});
      const data=await res.json();
      const raw=data.reply||'{}';
      const parsed=JSON.parse(raw.replace(/```json|```/g,'').trim());
      setSuggestModal({suggestions:parsed.suggestions||[],courseId:course.id,chapterTitle:d.chapterTitle,courseName:d.courseName});
    }catch(e){
      setSuggestModal({error:'Could not generate suggestions: '+e.message,suggestions:[]});
    }
    setSuggestLoading(false);
  };

  const submitSuggestion=async(s)=>{
    await dbSubmitPending('ai_suggestion',user.username,{
      courseId:course.id,chapterTitle:d.chapterTitle,courseName:d.courseName,
      suggestion:s,requestedAt:new Date().toISOString()
    },`🤖 AI Suggestion: "${s.title}" for ${d.chapterTitle}`);
    setSuggestModal(prev=>({...prev,submitted:{...prev.submitted,[s.title]:true}}));
  };

  const startQuiz=()=>{if(!d.questions?.length)return;setQuizStarted(true);setQuizIdx(0);setQuizChoice(null);setFillInput('');setFillRevealed(false);setQuizScore(0);setQuizLog([]);setQuizDone(false);setExplainIdx(null);setExplainText({});if(quizMode==='mc')setQuizOpts(buildQuizOpts(0));};
  const nextQuiz=()=>{
    if(quizChoice===null)return;
    const qs=d.questions||[];const correct=qs[quizIdx].answer;const isCorrect=quizChoice===correct;
    const newScore=quizScore+(isCorrect?1:0);
    const newLog=[...quizLog,{q:qs[quizIdx].question,correct,chosen:quizChoice,ok:isCorrect}];
    if(quizIdx+1>=qs.length){
      setQuizScore(newScore);setQuizLog(newLog);setQuizDone(true);
      // Build full progress update object
      const qProg={...progress,[course.id]:{...cp,viewed:true,openedQs:cp.openedQs||[],lastViewedAt:new Date().toISOString()}};
      onProgressUpdate(qProg);
      if(newScore===qs.length) awardXP('quiz_perfect');
      else if(newScore>=Math.ceil(qs.length*0.7)) awardXP('quiz_complete');
    }
    else{setQuizScore(newScore);setQuizLog(newLog);setQuizIdx(quizIdx+1);setQuizChoice(null);if(quizMode==='mc')setQuizOpts(buildQuizOpts(quizIdx+1));}
  };
  const nextFill=()=>{
    if(!fillRevealed)return;
    const qs=d.questions||[];const correct=qs[quizIdx].answer;
    const norm=s=>s.trim().toLowerCase().replace(/[^a-z0-9\s]/g,'').replace(/\s+/g,' ');
    const trimmed=norm(fillInput);const correctTrim=norm(correct);
    const isCorrect=trimmed===correctTrim||(correctTrim.includes(trimmed)&&trimmed.length>5)||(trimmed.includes(correctTrim)&&correctTrim.length>5);
    const newScore=quizScore+(isCorrect?1:0);
    const newLog=[...quizLog,{q:qs[quizIdx].question,correct,chosen:fillInput.trim()||'(no answer)',ok:isCorrect}];
    if(quizIdx+1>=qs.length){
      setQuizScore(newScore);setQuizLog(newLog);setQuizDone(true);
      // Build full progress update object
      const qProg={...progress,[course.id]:{...cp,viewed:true,openedQs:cp.openedQs||[],lastViewedAt:new Date().toISOString()}};
      onProgressUpdate(qProg);
      if(newScore===qs.length) awardXP('quiz_perfect');
      else if(newScore>=Math.ceil(qs.length*0.7)) awardXP('quiz_complete');
    }
    else{setQuizScore(newScore);setQuizLog(newLog);setQuizIdx(quizIdx+1);setFillInput('');setFillRevealed(false);}
  };
  const askExplanation=async(logItem,idx)=>{
    if(explainText[idx])return; // already loaded
    setExplainIdx(idx);setExplainLoading(true);
    try{
      const prompt=`A student got this question wrong in a quiz about "${d.chapterTitle}" (${d.courseName}).\n\nQuestion: ${logItem.q}\nCorrect answer: ${logItem.correct}\nStudent's answer: ${logItem.chosen}\n\nGive a clear, concise explanation (3-5 sentences) of why the correct answer is right. Be encouraging and educational. No preamble.`;
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:prompt}],context:{mode:'explanation',courseName:d.courseName,chapterTitle:d.chapterTitle}})});
      const data=await res.json();
      setExplainText(prev=>({...prev,[idx]:data.reply||'No explanation available.'}));
    }catch{
      setExplainText(prev=>({...prev,[idx]:'Could not load explanation — check your connection.'}));
    }
    setExplainLoading(false);
  };

  return(
    <div className="course-page" style={{maxWidth:960,margin:'0 auto',padding:'28px 20px 88px'}}>
      {/* Top bar */}
      <div className="topbar" style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:26,flexWrap:'wrap',gap:10}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Logo onClick={onBack} size="sm"/>
          <button onClick={onBack} style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'6px 14px',fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}>← Back</button>
          {(()=>{
            const siblings=[...courses].filter(c=>c.year===course.year&&c.semester===course.semester).sort((a,b)=>a.courseName.localeCompare(b.courseName));
            const idx=siblings.findIndex(c=>c.id===course.id);
            const prev=siblings[idx-1]; const next=siblings[idx+1];
            if(!prev&&!next) return null;
            return(
              <div style={{display:'flex',gap:6,marginLeft:4}}>
                <button disabled={!prev} onClick={()=>prev&&onBack('prev',prev.id)}
                  title={prev?prev.chapterTitle:'First chapter'}
                  style={{background:'none',border:'1px solid var(--border)',borderRadius:7,color:prev?'var(--text)':'var(--border)',cursor:prev?'pointer':'default',padding:'5px 10px',fontSize:13,lineHeight:1}}>‹</button>
                <button disabled={!next} onClick={()=>next&&onBack('next',next.id)}
                  title={next?next.chapterTitle:'Last chapter'}
                  style={{background:'none',border:'1px solid var(--border)',borderRadius:7,color:next?'var(--text)':'var(--border)',cursor:next?'pointer':'default',padding:'5px 10px',fontSize:13,lineHeight:1}}>›</button>
              </div>
            );
          })()}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
          <RolePill role={user.role} accountType={user.accountType||user.account_type}/>
          <div style={{background:YEAR_BG[course.year],border:`1px solid ${accent}40`,borderRadius:6,padding:'4px 12px'}}><Mono color={accent} size={9}>Year {course.year} · Semester {course.semester||1}</Mono></div>
          {course.data?.department&&<div style={{background:`${DEPT_COLOR[course.data.department]||'#4f9cf9'}12`,border:`1px solid ${DEPT_COLOR[course.data.department]||'#4f9cf9'}30`,borderRadius:6,padding:'4px 12px'}}><Mono color={DEPT_COLOR[course.data.department]||'#4f9cf9'} size={9}>{DEPT_SHORT[course.data.department]||'CS'}</Mono></div>}
          {!isPriv&&<div style={{fontSize:12,color:'var(--muted)'}}>{(cp.openedQs||[]).length}/{totalQ} revealed</div>}
          <button onClick={()=>toggleBookmark(course.id)} title={isBookmarked?'Remove bookmark':'Bookmark'} style={{background:isBookmarked?'rgba(249,168,79,.15)':'var(--surface)',border:`1px solid ${isBookmarked?'#f9a84f':'var(--border)'}`,borderRadius:8,color:isBookmarked?'#f9a84f':'var(--muted)',cursor:'pointer',padding:'7px 12px',fontSize:13}}>
            {isBookmarked?'🔖':'🔖'}
          </button>
          {/* ── Regenerate Notes from PDF (admin only) ── */}
          {(user.role===ROLE.ADMIN||user.role===ROLE.SUPERUSER)&&(
            <div style={{position:'relative'}}>
              {/* Hidden file input */}
              <input
                id="regen-file-input"
                type="file"
                accept=".pdf,.docx,.txt,.md,.jpg,.jpeg,.png"
                style={{display:'none'}}
                onChange={async e=>{
                  const f=e.target.files?.[0];
                  if(!f) return;
                  e.target.value=''; // reset so same file can be re-selected
                  const ok=await window.shConfirm?.(`Re-generate notes from "${f.name}"? This will replace the current notes for "${d.chapterTitle}".`);
                  if(!ok) return;
                  setRegenLoading(true); setRegenMsg('');
                  try{
                    // Step 1: extract text from the uploaded file (same as UploadModal)
                    setRegenMsg('⏳ Reading file…');
                    const text=await extractText(f);
                    let body;
                    if(text==='__USE_VISION__'||text==='__IMAGE_NEEDED__'){
                      setRegenMsg('⏳ Sending to AI vision model…');
                      const b64=await toBase64(f);
                      body={imageBase64:b64,mimeType:f.type||'image/jpeg'};
                    } else if(text.startsWith('__STUDYHUB_JSON__:')){
                      // User uploaded an existing JSON export — parse directly
                      const parsed=safeParse(text.replace('__STUDYHUB_JSON__:',''));
                      if(!parsed.chapterTitle) throw new Error('Invalid StudyHub JSON');
                      body=null;
                      // Use parsed directly
                      const newData=parsed;
                      newData.summary     = typeof newData.summary==='string'?newData.summary.trim():'';
                      newData.diagrams    = Array.isArray(newData.diagrams)?newData.diagrams:[];
                      newData.keyConcepts = Array.isArray(newData.keyConcepts)?newData.keyConcepts:[];
                      newData.definitions = Array.isArray(newData.definitions)?newData.definitions:[];
                      newData.mechanisms  = Array.isArray(newData.mechanisms)?newData.mechanisms:[];
                      newData.algorithms  = Array.isArray(newData.algorithms)?newData.algorithms:[];
                      newData.chapters    = Array.isArray(newData.chapters)?newData.chapters:[];
                      newData.questions   = Array.isArray(newData.questions)?newData.questions:[];
                      newData.courseName  = newData.courseName||d.courseName;
                      newData.chapterTitle= newData.chapterTitle||d.chapterTitle;
                      await supabase.from('courses').update({data:newData,concept_count:newData.keyConcepts.length,term_count:newData.definitions.length,q_count:newData.questions.length}).eq('id',course.id);
                      setRegenMsg('✅ Notes updated from JSON! Reloading…');
                      setTimeout(()=>window.location.reload(),1800);
                      return;
                    } else {
                      setRegenMsg('⏳ Sending to AI… (this takes ~30s)');
                      body={text};
                    }
                    // Step 2: call /api/generate exactly like UploadModal
                    const res=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
                    if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e.error||`Server error ${res.status}`);}
                    const newData=await res.json();
                    // Step 3: normalise all fields
                    newData.summary     = typeof newData.summary==='string'?newData.summary.trim():'';
                    newData.diagrams    = Array.isArray(newData.diagrams)?newData.diagrams:[];
                    newData.keyConcepts = Array.isArray(newData.keyConcepts)?newData.keyConcepts:[];
                    newData.definitions = Array.isArray(newData.definitions)?newData.definitions:[];
                    newData.mechanisms  = Array.isArray(newData.mechanisms)?newData.mechanisms:[];
                    newData.algorithms  = Array.isArray(newData.algorithms)?newData.algorithms:[];
                    newData.chapters    = Array.isArray(newData.chapters)?newData.chapters:[];
                    newData.questions   = Array.isArray(newData.questions)?newData.questions:[];
                    newData.courseName  = newData.courseName||d.courseName;
                    newData.chapterTitle= newData.chapterTitle||d.chapterTitle;
                    // Step 4: update the existing course record in Supabase
                    const{error:dbErr}=await supabase.from('courses').update({
                      data:newData,
                      concept_count:newData.keyConcepts.length,
                      term_count:newData.definitions.length,
                      q_count:newData.questions.length,
                    }).eq('id',course.id);
                    if(dbErr) throw new Error(dbErr.message);
                    setRegenMsg('✅ Notes regenerated from PDF! Reloading…');
                    setTimeout(()=>window.location.reload(),1800);
                  }catch(e){
                    const msg=e.message||'Unknown error';
                    const friendly=msg.includes('control character')||msg.includes('JSON')
                      ?'The file has formatting issues. Try saving as plain .txt and re-uploading.'
                      :msg.includes('413')||msg.includes('too large')
                      ?'File too large. Try splitting the PDF into smaller sections.'
                      :'❌ Failed: '+msg;
                    setRegenMsg(friendly);
                  }
                  finally{setRegenLoading(false);}
                }}
              />
              {/* Visible button — triggers file picker */}
              <button
                onClick={()=>{if(!regenLoading)document.getElementById('regen-file-input').click();}}
                disabled={regenLoading}
                title="Upload the original PDF to regenerate all notes with AI (admin only)"
                style={{background:'rgba(168,249,79,.08)',border:'1px solid rgba(168,249,79,.3)',borderRadius:8,color:'#a8f94f',cursor:regenLoading?'not-allowed':'pointer',padding:'7px 13px',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',gap:5,opacity:regenLoading?.6:1,whiteSpace:'nowrap'}}>
                {regenLoading
                  ?<><span style={{animation:'spin 1s linear infinite',display:'inline-block'}}>⟳</span> {typeof regenMsg==='string'&&regenMsg.startsWith('⏳')?regenMsg.slice(2).trim():'Processing…'}</>
                  :<>📄 Regen from PDF</>}
              </button>
            </div>
          )}
          {/* Status toast */}
          {regenMsg&&!regenMsg.startsWith('⏳')&&(
            <div className="slide-down" style={{position:'fixed',bottom:70,right:10,background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:'10px 16px',fontSize:12,color:'var(--text)',zIndex:300,boxShadow:'var(--shadow)',maxWidth:300,cursor:'pointer'}} onClick={()=>setRegenMsg('')}>
              {regenMsg}
            </div>
          )}
          <button onClick={()=>exportCoursePDF(d,d.chapterTitle)} title="Export to PDF" style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'7px 12px',fontSize:13}}>⬇ PDF</button>
          {/* AI Suggest — all roles can request, routes to approvals */}
          <button onClick={askAiSuggestions} disabled={suggestLoading}
            title="Ask AI to suggest improvements to this course"
            style={{background:'rgba(168,249,79,.08)',border:'1px solid rgba(168,249,79,.25)',borderRadius:8,color:'#a8f94f',cursor:suggestLoading?'not-allowed':'pointer',padding:'7px 12px',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',gap:5,opacity:suggestLoading?.65:1}}>
            {suggestLoading?<><span style={{animation:'spin 1s linear infinite',display:'inline-block'}}>⟳</span> Thinking…</>:<>🤖 Suggest</>}
          </button>
        </div>
      </div>

      {/* AI Suggestions Modal */}
      {suggestModal&&(
        <div className="modal-overlay" style={{zIndex:3100}} onClick={e=>e.target===e.currentTarget&&setSuggestModal(null)}>
          <div className="scale-in" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:'26px 24px',maxWidth:500,width:'calc(100% - 24px)',margin:'auto',maxHeight:'88vh',overflowY:'auto',boxShadow:'var(--shadow)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
              <div>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'var(--text)'}}>🤖 AI Suggestions</div>
                <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>For: {suggestModal.chapterTitle}</div>
              </div>
              <button onClick={()=>setSuggestModal(null)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:20,padding:4}}>✕</button>
            </div>
            {suggestModal.error&&<div style={{color:'#f05050',fontSize:13,padding:'12px 14px',background:'rgba(240,80,80,.06)',borderRadius:8,marginBottom:14}}>{suggestModal.error}</div>}
            {user.role===ROLE.SUPERUSER&&(
              <div style={{background:'rgba(249,168,79,.06)',border:'1px solid rgba(249,168,79,.2)',borderRadius:8,padding:'8px 13px',marginBottom:16,fontSize:11,color:'#f9a84f'}}>
                ⚡ As superuser you can submit any suggestion directly or dismiss it. All suggestions go to your Approvals tab.
              </div>
            )}
            {!user.isPriv&&!(user.role===ROLE.SUPERUSER)&&(
              <div style={{background:'rgba(79,156,249,.06)',border:'1px solid rgba(79,156,249,.2)',borderRadius:8,padding:'8px 13px',marginBottom:16,fontSize:11,color:'#4f9cf9'}}>
                Submitted suggestions go to the superuser for review before any changes are made.
              </div>
            )}
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {(suggestModal.suggestions||[]).map((s,i)=>{
                const submitted=suggestModal.submitted?.[s.title];
                return(
                  <div key={i} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:'14px 16px'}}>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10,marginBottom:6}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'#a8f94f',fontWeight:700,letterSpacing:.5}}>{s.type?.replace(/_/g,' ').toUpperCase()}</div>
                      {submitted&&<span style={{fontSize:10,color:'#7fda96',fontFamily:"'IBM Plex Mono',monospace"}}>✓ SUBMITTED</span>}
                    </div>
                    <div style={{fontSize:13,fontWeight:600,color:'var(--text)',marginBottom:5}}>{s.title}</div>
                    <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.6,marginBottom:10}}>{s.description}</div>
                    <button onClick={()=>!submitted&&submitSuggestion(s)} disabled={!!submitted}
                      style={{background:submitted?'var(--border)':'rgba(168,249,79,.1)',border:`1px solid ${submitted?'transparent':'rgba(168,249,79,.3)'}`,borderRadius:7,color:submitted?'var(--muted)':'#a8f94f',cursor:submitted?'not-allowed':'pointer',padding:'6px 14px',fontSize:11,fontWeight:600}}>
                      {submitted?'Submitted ✓':'Submit for Review'}
                    </button>
                  </div>
                );
              })}
              {!(suggestModal.suggestions?.length)&&!suggestModal.error&&(
                <div style={{color:'var(--muted)',textAlign:'center',padding:30,fontSize:13}}>No suggestions generated.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="fade-up" style={{borderBottom:'1px solid var(--border)',paddingBottom:24,marginBottom:28}}>
        <Mono>{d.courseName}</Mono>
        <h1 style={{fontFamily:"'DM Serif Display',serif",fontSize:'clamp(22px,4vw,38px)',color:'var(--text)',lineHeight:1.15,margin:'8px 0 10px'}}>{d.chapterTitle}</h1>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <Tag>{d.keyConcepts?.length||0} concepts</Tag>
          <Tag color="#f9a84f">{d.definitions?.length||0} terms</Tag>
          <Tag color="#7fda96">{totalQ} questions</Tag>
        </div>
        {!isPriv&&(
          <div style={{marginTop:8}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
              <Mono color="var(--muted)" size={8}>PROGRESS</Mono>
              <Mono color={pct===100?'#7fda96':accent} size={8}>{pct===100?'✓ Complete':`${pct}%`}</Mono>
            </div>
            <div style={{height:3,background:'var(--border)',borderRadius:2}}>
              <div style={{height:'100%',width:`${pct}%`,background:pct===100?'#7fda96':accent,borderRadius:2,transition:'width .5s ease'}}/>
            </div>
          </div>
        )}
      {pct===100&&<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:'#7fda96',letterSpacing:1,marginTop:4,display:'flex',alignItems:'center',gap:4}}><span>✓</span> COMPLETED</div>}
      </div>

      {/* Tabs */}
      <div className="course-tabs-row" style={{display:'flex',gap:2,flexWrap:'wrap',borderBottom:'1px solid var(--border)',marginBottom:28,overflowX:'auto'}}>
        {tabs.map(t=><button key={t.id} className="tab-btn" onClick={()=>setTab(t.id)} style={{background:tab===t.id?'rgba(79,156,249,.08)':'none',border:'none',borderBottom:tab===t.id?'2px solid #4f9cf9':'2px solid transparent',color:tab===t.id?'#4f9cf9':'var(--muted)',cursor:'pointer',padding:'9px 14px',fontSize:13,fontWeight:tab===t.id?600:400,whiteSpace:'nowrap'}}>{t.label}</button>)}
      </div>

      {/* Tab content */}

      {tab==='notes'&&(
        <div className="fade-up">
          {/* ── Sticky quick-nav bar ── */}
          {(d.keyConcepts?.length||d.definitions?.length||d.mechanisms?.length)>0&&(
            <div style={{position:'sticky',top:0,zIndex:20,background:'var(--bg)',paddingBottom:8,marginBottom:4}}>
              <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4,scrollbarWidth:'none'}}>
                {[
                  {id:'summary',  label:'📖 Summary',  show:!!(d.summary?.length>50)},
                  {id:'concepts', label:'💡 Concepts',  show:!!(d.keyConcepts?.length)},
                  {id:'definitions',label:'📖 Defs',   show:!!(d.definitions?.length)},
                  {id:'mechanisms',label:'⚙️ Mechanisms',show:!!(d.mechanisms?.length)},
                  {id:'diagrams', label:'🗺️ Diagrams',  show:!!(d.diagrams?.length)},
                  {id:'algorithms',label:'🔢 Algorithms',show:!!(d.algorithms?.length)},
                  {id:'takeaways',label:'✨ Takeaways', show:!!(d.chapters?.length)},
                ].filter(s=>s.show).map(s=>(
                  <button key={s.id}
                    onClick={()=>s.id==='summary'?setNotesSection(null):setNotesSection(s.id)}
                    style={{flexShrink:0,padding:'5px 12px',borderRadius:16,border:`1.5px solid ${(s.id==='summary'?!notesSection:notesSection===s.id)?'#4f9cf9':'var(--border)'}`,background:(s.id==='summary'?!notesSection:notesSection===s.id)?'rgba(79,156,249,.1)':'var(--surface)',color:(s.id==='summary'?!notesSection:notesSection===s.id)?'#4f9cf9':'var(--muted)',cursor:'pointer',fontSize:11,fontWeight:(s.id==='summary'?!notesSection:notesSection===s.id)?700:400,whiteSpace:'nowrap',transition:'all .15s'}}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Context banner ── */}
          <div style={{background:'rgba(79,156,249,.05)',border:'1px solid rgba(79,156,249,.12)',borderRadius:8,padding:'8px 14px',marginBottom:18,display:'flex',gap:8,alignItems:'center',fontSize:12,color:'var(--muted)'}}>
            <span>ℹ️</span>
            <span>Study guide for <strong style={{color:'var(--text)'}}>{d.chapterTitle}</strong>. Assignments &amp; community for <strong style={{color:'var(--text)'}}>{d.courseName}</strong> are on the <button onClick={onBack} style={{background:'none',border:'none',color:'#4f9cf9',cursor:'pointer',padding:0,fontSize:12,textDecoration:'underline'}}>course page ←</button></span>
          </div>

          {/* ── Summary (main prose notes) ── */}
          {(()=>{
            const summary = d.summary || '';
            const hasSummary = summary.length > 50;
            // Section pill state lives above
            return(<>
              {hasSummary ? (
                <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,padding:'22px 26px',marginBottom:22}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
                    <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:'var(--text)'}}>📖 Summary</div>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',background:'var(--surface)',borderRadius:4,padding:'2px 8px',letterSpacing:.5}}>READ FIRST</div>
                  </div>
                  {summary.split(/\n\n+/).filter(Boolean).map((para,i)=>(
                    <p key={i} style={{fontSize:14.5,color:'var(--text)',lineHeight:1.9,margin:'0 0 14px',fontFamily:"'DM Sans',sans-serif",opacity:.92}}>
                      {renderMd(para)}
                    </p>
                  ))}
                  <div style={{borderTop:'1px solid var(--border)',marginTop:8,paddingTop:12,display:'flex',gap:8,flexWrap:'wrap'}}>
                    {[
                      {icon:'💡',label:'Concepts',count:d.keyConcepts?.length||0,id:'concepts'},
                      {icon:'📖',label:'Definitions',count:d.definitions?.length||0,id:'definitions'},
                      {icon:'⚙️',label:'Mechanisms',count:d.mechanisms?.length||0,id:'mechanisms'},
                      ...(d.algorithms?.length?[{icon:'🔢',label:'Algorithms',count:d.algorithms.length,id:'algorithms'}]:[]),
                      ...(d.diagrams?.length?[{icon:'🗺️',label:'Diagrams',count:d.diagrams.length,id:'diagrams'}]:[]),
                      {icon:'✨',label:'Takeaways',count:d.chapters?.length||0,id:'takeaways'},
                    ].filter(s=>s.count>0).map(s=>(
                      <button key={s.id} onClick={()=>setNotesSection(notesSection===s.id?null:s.id)}
                        style={{display:'flex',alignItems:'center',gap:5,padding:'5px 13px',borderRadius:20,border:`1.5px solid ${notesSection===s.id?'#4f9cf9':'var(--border)'}`,background:notesSection===s.id?'rgba(79,156,249,.1)':'var(--surface)',color:notesSection===s.id?'#4f9cf9':'var(--muted)',cursor:'pointer',fontSize:12,fontWeight:notesSection===s.id?700:400,transition:'all .15s'}}>
                        {s.icon} {s.label}
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:notesSection===s.id?'rgba(79,156,249,.2)':'var(--border)',color:notesSection===s.id?'#4f9cf9':'var(--muted)',borderRadius:10,padding:'1px 5px'}}>{s.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (<>
                {/* No summary — fall back to chips layout with regen hint */}
                {(user?.role===ROLE.ADMIN||user?.role===ROLE.SUPERUSER)&&(
                  <div className="fade-in" style={{background:'rgba(168,249,79,.04)',border:'1px dashed rgba(168,249,79,.25)',borderRadius:10,padding:'10px 14px',marginBottom:14,fontSize:12,color:'var(--muted)',display:'flex',alignItems:'center',gap:8}}>
                    <span>📋</span>
                    <span>This chapter was uploaded before the summary feature. Click <strong style={{color:'#a8f94f'}}>📄 Regen from PDF</strong> to generate a full summary with diagrams.</span>
                  </div>
                )}
                <div style={{display:'flex',gap:6,marginBottom:20,flexWrap:'wrap'}}>
                  {[
                    {id:'concepts',   label:'💡 Concepts',   count:d.keyConcepts?.length||0},
                    {id:'definitions',label:'📖 Definitions',count:d.definitions?.length||0},
                    {id:'mechanisms', label:'⚙️ Mechanisms', count:d.mechanisms?.length||0},
                    ...(d.algorithms?.length?[{id:'algorithms',label:'🔢 Algorithms',count:d.algorithms.length}]:[]),
                    {id:'takeaways',  label:'✨ Takeaways',  count:d.chapters?.length||0},
                  ].map(s=>(
                    <button key={s.id} onClick={()=>setNotesSection(s.id)}
                      style={{padding:'7px 16px',borderRadius:20,border:`1.5px solid ${notesSection===s.id?'#4f9cf9':'var(--border)'}`,background:notesSection===s.id?'rgba(79,156,249,.1)':'var(--surface)',color:notesSection===s.id?'#4f9cf9':'var(--muted)',cursor:'pointer',fontSize:12,fontWeight:notesSection===s.id?700:400,transition:'all .15s',display:'flex',alignItems:'center',gap:6}}>
                      {s.label}
                      {s.count>0&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:notesSection===s.id?'rgba(79,156,249,.2)':'var(--border)',color:notesSection===s.id?'#4f9cf9':'var(--muted)',borderRadius:10,padding:'1px 6px'}}>{s.count}</span>}
                    </button>
                  ))}
                </div>
              </>)}

              {/* ── Section deep-dives ── */}
              {notesSection==='concepts'&&<div className="fade-up" style={{marginTop:hasSummary?4:0}}>
                {hasSummary&&<div style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:'var(--text)',marginBottom:14}}>💡 Key Concepts</div>}
                {(()=>{
                  const filtered=(d.keyConcepts||[]).filter(c=>!cSearch||c.title.toLowerCase().includes(cSearch.toLowerCase())||c.description.toLowerCase().includes(cSearch.toLowerCase()));
                  return(<>
                    {(d.keyConcepts||[]).length>6&&<input value={cSearch} onChange={e=>setCSearch(e.target.value)} placeholder="Filter concepts…" style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'7px 12px',color:'var(--text)',fontSize:12,fontFamily:"'DM Sans',sans-serif",marginBottom:12}}/>}
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(252px,1fr))',gap:12}}>
                    {filtered.map((c,i)=>{const col=(COLOR_MAP[c.color]||COLOR_MAP.blue).bar;return(
                    <div key={i} className={`stagger-${Math.min(i%4+1,4)}`} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:'16px 18px',borderLeft:`3px solid ${col}`,position:'relative',overflow:'hidden'}}>
                      <div style={{position:'absolute',top:0,right:0,width:60,height:60,borderRadius:'0 12px 0 60px',background:`${col}08`}}/>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:700,color:col,marginBottom:6,letterSpacing:.5}}>{c.title}</div>
                      <p style={{fontSize:12.5,color:'var(--muted)',lineHeight:1.7,margin:0}}>{c.description}</p>
                    </div>
                  );})}
                  {!filtered.length&&<div style={{color:'var(--muted)',textAlign:'center',padding:40,gridColumn:'1/-1'}}>{cSearch?'No matching concepts.':'No concepts yet.'}</div>}
                </div></>
                );})()} 
              </div>}

              {notesSection==='definitions'&&<div className="fade-up" style={{marginTop:hasSummary?4:0}}>
                {hasSummary&&<div style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:'var(--text)',marginBottom:14}}>📖 Definitions</div>}
                {(()=>{
                  const filtDefs=(d.definitions||[]).filter(def=>!dSearch||def.term.toLowerCase().includes(dSearch.toLowerCase())||def.definition.toLowerCase().includes(dSearch.toLowerCase()));
                  return(<>
                    {(d.definitions||[]).length>8&&<input value={dSearch} onChange={e=>setDSearch(e.target.value)} placeholder="Search definitions…" style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'7px 12px',color:'var(--text)',fontSize:12,fontFamily:"'DM Sans',sans-serif",marginBottom:10}}/>}
                    <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
                      {filtDefs.map((def,i)=><DefinitionRow key={i} def={def} isLast={i===filtDefs.length-1}/>)}
                    </div>
                    {!filtDefs.length&&<div style={{color:'var(--muted)',textAlign:'center',padding:40}}>{dSearch?'No matching definitions.':'No definitions yet.'}</div>}
                    {filtDefs.length>0&&<div style={{marginTop:10,textAlign:'right'}}>
                      <button onClick={()=>{const txt=filtDefs.map(d=>`${d.term}: ${d.definition}`).join('\n');navigator.clipboard?.writeText(txt).catch(()=>{});}}
                        style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:11,textDecoration:'underline',padding:0}}>
                        📋 Copy all {filtDefs.length} definitions
                      </button>
                    </div>}
                  </>);
                })()}
              </div>}

              {notesSection==='mechanisms'&&<div className="fade-up" style={{marginTop:hasSummary?4:0}}>
                {hasSummary&&<div style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:'var(--text)',marginBottom:14}}>⚙️ Mechanisms</div>}
                <div style={{display:'flex',flexDirection:'column',gap:13}}>
                  {(d.mechanisms||[]).map((m,i)=>(
                    <div key={i} className={`stagger-${Math.min(i+1,4)}`} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:'18px 22px'}}>
                      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:'var(--text)',marginBottom:10}}>{m.title}</div>
                      <div style={{fontSize:13,color:'var(--muted)',lineHeight:1.85,marginTop:0}}>
                        {(m.body||'').split(/\n\n+/).filter(Boolean).map((para,pi)=>(
                          <p key={pi} style={{margin:'0 0 10px',whiteSpace:'pre-line'}}>{renderMd(para)}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                  {!(d.mechanisms?.length)&&<div style={{color:'var(--muted)',textAlign:'center',padding:40}}>No mechanisms yet.</div>}
                </div>
              </div>}

              {notesSection==='algorithms'&&d.algorithms?.length>0&&<div className="fade-up" style={{marginTop:hasSummary?4:0}}>
                {hasSummary&&<div style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:'var(--text)',marginBottom:14}}>🔢 Algorithms</div>}
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(228px,1fr))',gap:11}}>
                  {(d.algorithms||[]).map((a,i)=>(
                    <div key={i} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,padding:'13px 15px'}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:700,color:'#da7ff0',marginBottom:5}}>{a.name}</div>
                      <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.65,margin:'0 0 6px'}}>{a.description}</p>
                      {a.note&&<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'#f9a84f',background:'rgba(249,168,79,.06)',borderRadius:4,padding:'3px 7px',marginTop:4}}>{a.note}</div>}
                    </div>
                  ))}
                </div>
              </div>}

              {/* ── Diagrams section ── */}
              {notesSection==='diagrams'&&d.diagrams?.length>0&&<div className="fade-up" style={{marginTop:hasSummary?4:0}}>
                {hasSummary&&<div style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:'var(--text)',marginBottom:14}}>🗺️ Diagrams &amp; Visuals</div>}
                <div style={{display:'flex',flexDirection:'column',gap:16}}>
                  {(d.diagrams||[]).map((diag,i)=>(
                    <div key={i} className={`stagger-${Math.min(i+1,4)}`} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
                      <div style={{background:'rgba(79,156,249,.06)',borderBottom:'1px solid var(--border)',padding:'10px 18px',display:'flex',alignItems:'center',gap:10}}>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:'rgba(79,156,249,.15)',color:'#4f9cf9',borderRadius:4,padding:'2px 8px',letterSpacing:.5,textTransform:'uppercase'}}>{diag.type||'diagram'}</span>
                        <span style={{fontFamily:"'DM Serif Display',serif",fontSize:15,color:'var(--text)'}}>{diag.title}</span>
                      </div>
                      <pre style={{margin:0,padding:'18px 20px',fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:'var(--text)',lineHeight:1.8,overflowX:'auto',whiteSpace:'pre',background:'var(--card)'}}>{diag.content}</pre>
                    </div>
                  ))}
                </div>
              </div>}

              {notesSection==='takeaways'&&<div className="fade-up" style={{marginTop:hasSummary?4:0}}>
                {hasSummary&&<div style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:'var(--text)',marginBottom:14}}>✨ Chapter Takeaways</div>}
                <div style={{display:'flex',flexDirection:'column',gap:14}}>
                  {(d.chapters||[]).map((ch,i)=>(
                    <div key={i} className={`stagger-${Math.min(i+1,4)}`} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:'16px 20px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:10}}>
                        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',background:'var(--surface)',borderRadius:4,padding:'2px 8px'}}>{ch.num}</div>
                        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:15,color:'var(--text)'}}>{ch.name}</div>
                      </div>
                      <ul style={{margin:0,paddingLeft:18,display:'flex',flexDirection:'column',gap:6}}>
                        {(ch.takeaways||[]).map((t,j)=><li key={j} style={{fontSize:13,color:'var(--muted)',lineHeight:1.65}}>{t}</li>)}
                      </ul>
                    </div>
                  ))}
                  {!(d.chapters?.length)&&<div style={{color:'var(--muted)',textAlign:'center',padding:40}}>No takeaways yet.</div>}
                </div>
              </div>}
            </>);
          })()}
          {/* Back to top */}
          <button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}
            style={{display:'block',margin:'28px auto 4px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:20,color:'var(--muted)',cursor:'pointer',padding:'7px 22px',fontSize:11,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:.5}}>
            ↑ BACK TO TOP
          </button>
        </div>
      )}
      {tab==='practice'&&(
        <div className="fade-up">
          <div style={{display:'flex',gap:6,marginBottom:20,flexWrap:'wrap'}}>
            {[
              {id:'qa',label:'❓ Q&A',count:totalQ},
              ...(d.definitions?.length||d.keyConcepts?.length?[{id:'flashcards',label:'🃏 Flashcards'}]:[]),
              ...(totalQ>=4?[{id:'quiz',label:'🎯 Quiz'}]:[]),
            ].map(s=>(
              <button key={s.id} onClick={()=>setPracticeSection(s.id)}
                style={{padding:'7px 16px',borderRadius:20,border:`1.5px solid ${practiceSection===s.id?'#7fda96':'var(--border)'}`,background:practiceSection===s.id?'rgba(127,218,150,.1)':'var(--surface)',color:practiceSection===s.id?'#7fda96':'var(--muted)',cursor:'pointer',fontSize:12,fontWeight:practiceSection===s.id?700:400,transition:'all .15s',display:'flex',alignItems:'center',gap:6}}>
                {s.label}
                {s.count>0&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:practiceSection===s.id?'rgba(127,218,150,.2)':'var(--border)',color:practiceSection===s.id?'#7fda96':'var(--muted)',borderRadius:10,padding:'1px 6px'}}>{s.count}</span>}
              </button>
            ))}
          </div>
          {practiceSection==='qa'&&(
        <div className="fade-up">
          {/* Header with actions */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,flexWrap:'wrap',gap:10}}>
            <SectionLabel>Practice Q&A</SectionLabel>
            <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
              {!isPriv&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:(cp.openedQs||[]).length===totalQ&&totalQ>0?'#7fda96':'#4f9cf9'}}>{(cp.openedQs||[]).length}/{totalQ} {(cp.openedQs||[]).length===totalQ&&totalQ>0?'✓ all done':'opened'}</span>}
              {/* AI fresh questions button */}
              <button onClick={async()=>{
                setAiFreshLoading(true);
                try{
                  const existingQs=(d.questions||[]).map(q=>q.question).join('\n');
                  const prompt=`Generate 5 fresh, unique exam-style practice questions for the topic "${d.chapterTitle}" (${d.courseName}).

These questions already exist — do NOT repeat them or ask the same thing differently:
${existingQs}

Requirements:
- Questions must test different concepts not covered in the existing questions
- Mix difficulty: 2 easy recall, 2 application, 1 analysis
- Include full worked answers
- Plain text only

Return JSON only: {"questions":[{"question":"...","answer":"..."}]}`;
                  const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:prompt}],context:{mode:'tutor',chapterTitle:d.chapterTitle,courseName:d.courseName,isSuperuser:user.role===ROLE.SUPERUSER}})});
                  const data=await res.json();
                  const raw=data.reply||'{}';
                  const parsed=JSON.parse(raw.replace(/```json|```/g,'').trim());
                  setAiFreshQs(parsed.questions||[]);
                }catch(e){setAiFreshQs([{question:'Could not generate questions',answer:e.message}]);}
                setAiFreshLoading(false);
              }} disabled={aiFreshLoading}
                style={{display:'flex',alignItems:'center',gap:6,background:'rgba(168,249,79,.08)',border:'1px solid rgba(168,249,79,.25)',borderRadius:8,color:'#a8f94f',cursor:aiFreshLoading?'not-allowed':'pointer',padding:'6px 12px',fontSize:11,fontWeight:600,opacity:aiFreshLoading?.7:1}}>
                {aiFreshLoading?<><span style={{animation:'spin 1s linear infinite',display:'inline-block'}}>⟳</span> Generating…</>:<>🤖 Fresh Questions</>}
              </button>
            </div>
          </div>

          {/* AI-generated fresh questions panel */}
          {aiFreshQs.length>0&&(
            <div className="fade-in" style={{background:'rgba(168,249,79,.04)',border:'1px solid rgba(168,249,79,.2)',borderRadius:12,padding:'14px 16px',marginBottom:16}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                <Mono color="#a8f94f" size={9}>🤖 AI FRESH QUESTIONS — {aiFreshQs.length} NEW</Mono>
                <button onClick={()=>setAiFreshQs([])} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:12,opacity:.5}}>✕ close</button>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {aiFreshQs.map((q,i)=>(
                  <div key={i} style={{background:'var(--card)',border:'1px solid rgba(168,249,79,.15)',borderRadius:9,overflow:'hidden'}}>
                    <div onClick={()=>setOpenFreshQ(openFreshQ===i?null:i)} style={{padding:'11px 14px',display:'flex',alignItems:'flex-start',gap:10,cursor:'pointer'}}>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:'rgba(168,249,79,.2)',color:'#a8f94f',borderRadius:4,padding:'2px 6px',flexShrink:0,marginTop:2}}>NEW</span>
                      <span style={{fontSize:13,color:'var(--text)',fontWeight:500,lineHeight:1.6,flex:1}}>{q.question}</span>
                      <span style={{color:'var(--muted)',fontSize:16,flexShrink:0}}>{openFreshQ===i?'−':'+'}</span>
                    </div>
                    {openFreshQ===i&&(
                      <div className="fade-in" style={{borderTop:'1px solid rgba(168,249,79,.15)',padding:'12px 14px',background:'rgba(168,249,79,.03)'}}>
                        <Mono color="#7fda96" size={9}>Answer</Mono>
                        <p style={{fontSize:13,color:'var(--text)',lineHeight:1.8,margin:'6px 0 0',whiteSpace:'pre-line'}}>{q.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <SearchBar value={filter} onChange={setFilter} placeholder="Search questions…"/>
          <Mono color="var(--muted)" size={9}>SHOWING {filteredQ.length} OF {totalQ} QUESTIONS</Mono>
          <div style={{display:'flex',flexDirection:'column',gap:9,marginTop:12}}>
            {filteredQ.map(q=>{const ri=(d.questions||[]).indexOf(q);const isOpen=openQ===ri;const seen=(cp.openedQs||[]).includes(ri);return(
              <div key={ri} className="fade-in" style={{background:'var(--card)',border:`1px solid ${seen?'rgba(127,218,150,.3)':'var(--border)'}`,borderRadius:10,overflow:'hidden'}}>
                <div onClick={()=>revealQ(ri)} style={{padding:'13px 17px',display:'flex',alignItems:'flex-start',gap:12,cursor:'pointer'}}>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:seen?'#7fda96':'#4f9cf9',color:'#000',borderRadius:4,padding:'2px 6px',flexShrink:0,marginTop:3}}>Q{ri+1}</span>
                  <span style={{fontSize:13.5,color:'var(--text)',fontWeight:500,lineHeight:1.6,flex:1}}>{q.question}</span>
                  <span style={{color:'var(--muted)',fontSize:18,flexShrink:0,lineHeight:1}}>{isOpen?'−':'+'}</span>
                </div>
                {isOpen&&<div className="fade-in" style={{borderTop:'1px solid var(--border)',padding:'14px 17px',background:'rgba(79,156,249,.03)'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                    <Mono color="#7fda96" size={9}>Answer</Mono>
                    <button onClick={()=>navigator.clipboard.writeText(`Q: ${q.question}
A: ${q.answer}`)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:10,opacity:.5}} onMouseEnter={e=>e.currentTarget.style.opacity='1'} onMouseLeave={e=>e.currentTarget.style.opacity='.5'}>{copied?'✓ Copied!':'📋 Copy'}</button>
                  </div>
                  <p style={{fontSize:13,color:'var(--text)',lineHeight:1.8,margin:'0',whiteSpace:'pre-line'}}>{q.answer}</p>
                </div>}
              </div>
            );})}
          </div>
        </div>

          )}
          {practiceSection==='flashcards'&&
<div className="fade-up">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:10}}>
          <SectionLabel>Flashcards</SectionLabel>
          <div style={{display:'flex',gap:6}}>
            {[{id:'definitions',label:'📖 Terms'},{id:'concepts',label:'💡 Concepts'}].map(dk=>(
              <button key={dk.id} onClick={()=>{setFcDeck(dk.id);setFcIdx(0);setFcFlipped(false);setFcKnown(new Set());}}
                style={{background:fcDeck===dk.id?'rgba(79,156,249,.15)':'var(--surface)',border:`1px solid ${fcDeck===dk.id?'rgba(79,156,249,.4)':'var(--border)'}`,borderRadius:8,color:fcDeck===dk.id?'#4f9cf9':'var(--muted)',cursor:'pointer',padding:'6px 12px',fontSize:11,fontWeight:fcDeck===dk.id?700:400}}>
                {dk.label} ({fcDeck===dk.id?fcTotal:(dk.id==='definitions'?(d.definitions?.length||0):(d.keyConcepts?.length||0))})
              </button>
            ))}
          </div>
        </div>
        {fcTotal===0?(
          <div style={{color:'var(--muted)',textAlign:'center',padding:40}}>No cards in this deck.</div>
        ):(
          <>
            {/* Progress bar */}
            <div style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <Mono color="var(--muted)" size={9}>{fcIdx+1} / {fcTotal}</Mono>
                <Mono color="#7fda96" size={9}>{fcKnownCount} known · {fcTotal-fcKnownCount} to review</Mono>
              </div>
              <div style={{height:4,background:'var(--border)',borderRadius:2}}>
                <div style={{height:'100%',background:'#7fda96',borderRadius:2,width:`${(fcKnownCount/fcTotal)*100}%`,transition:'width .3s'}}/>
              </div>
            </div>

            {/* Card */}
            <div onClick={()=>setFcFlipped(f=>!f)}
              style={{cursor:'pointer',minHeight:200,background:'var(--card)',border:`2px solid ${fcCard?.color||'#4f9cf9'}40`,borderRadius:16,padding:'32px 28px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',position:'relative',userSelect:'none',boxShadow:`0 4px 24px ${fcCard?.color||'#4f9cf9'}18`,transition:'all .2s'}}>
              <div style={{position:'absolute',top:12,right:14,fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)'}}>
                {fcFlipped?'← BACK — tap to flip':'FRONT — tap to flip →'}
              </div>
              {!fcFlipped?(
                <>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:fcCard?.color||'#4f9cf9',letterSpacing:2,marginBottom:16,fontWeight:700}}>
                    {fcDeck==='definitions'?'TERM':'CONCEPT'}
                  </div>
                  <div style={{fontSize:20,fontWeight:700,color:'var(--text)',lineHeight:1.4}}>{fcCard?.front}</div>
                </>
              ):(
                <>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'#7fda96',letterSpacing:2,marginBottom:16,fontWeight:700}}>ANSWER</div>
                  <div style={{fontSize:14,color:'var(--text)',lineHeight:1.7}}>{fcCard?.back}</div>
                </>
              )}
            </div>

            {/* Navigation */}
            <div style={{display:'flex',gap:10,marginTop:14,justifyContent:'center',flexWrap:'wrap'}}>
              <button onClick={()=>{if(fcIdx>0){setFcIdx(fcIdx-1);setFcFlipped(false);}}}
                disabled={fcIdx===0}
                style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:9,color:fcIdx===0?'var(--border)':'var(--muted)',cursor:fcIdx===0?'not-allowed':'pointer',padding:'8px 18px',fontSize:13}}>
                ← Prev
              </button>
              <button onClick={()=>{
                const newKnown=new Set(fcKnown);newKnown.add(fcIdx);setFcKnown(newKnown);
                if(fcIdx<fcTotal-1){setFcIdx(fcIdx+1);setFcFlipped(false);}
              }}
                style={{background:'rgba(127,218,150,.12)',border:'1px solid rgba(127,218,150,.35)',borderRadius:9,color:'#7fda96',cursor:'pointer',padding:'8px 20px',fontSize:13,fontWeight:700}}>
                ✓ Got it
              </button>
              <button onClick={()=>{
                const newKnown=new Set(fcKnown);newKnown.delete(fcIdx);setFcKnown(newKnown);
                if(fcIdx<fcTotal-1){setFcIdx(fcIdx+1);setFcFlipped(false);}
              }}
                style={{background:'rgba(240,80,80,.08)',border:'1px solid rgba(240,80,80,.3)',borderRadius:9,color:'#f05050',cursor:'pointer',padding:'8px 20px',fontSize:13,fontWeight:700}}>
                ✗ Review
              </button>
              <button onClick={()=>{if(fcIdx<fcTotal-1){setFcIdx(fcIdx+1);setFcFlipped(false);}}}
                disabled={fcIdx===fcTotal-1}
                style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:9,color:fcIdx===fcTotal-1?'var(--border)':'var(--muted)',cursor:fcIdx===fcTotal-1?'not-allowed':'pointer',padding:'8px 18px',fontSize:13}}>
                Next →
              </button>
            </div>
            {/* Reset */}
            <div style={{textAlign:'center',marginTop:10}}>
              <button onClick={()=>{setFcIdx(0);setFcFlipped(false);setFcKnown(new Set());}}
                style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:11,textDecoration:'underline'}}>
                Reset deck
              </button>
            </div>
          </>
        )}
      </div>}

      {/* ── Quiz mode ───────────────────────────────────────────────── */}
          {practiceSection==='quiz'&&
<div className="fade-up">

        {/* ── Start screen ─────────────────────────────────────────── */}
        {!quizStarted&&!quizDone&&(
          <div style={{maxWidth:420,margin:'0 auto',padding:'32px 20px'}}>
            <div style={{textAlign:'center',marginBottom:28}}>
              <div style={{fontSize:48,marginBottom:12}}>🎯</div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:'var(--text)',marginBottom:6}}>Quiz Time</div>
              <p style={{color:'var(--muted)',fontSize:13,lineHeight:1.6}}>{totalQ} questions · Instant feedback · AI explanations</p>
            </div>

            {/* Quiz type picker */}
            <div style={{marginBottom:24}}>
              <Mono color="var(--muted)" size={9}>CHOOSE QUIZ TYPE</Mono>
              <div style={{display:'flex',flexDirection:'column',gap:10,marginTop:10}}>
                {[
                  {id:'mc',  icon:'🔘', title:'Multiple Choice', desc:'Pick the correct answer from 4 options'},
                  {id:'fill',icon:'✏️', title:'Fill in the Gap',  desc:'Type the answer yourself — tests real recall'},
                ].map(m=>(
                  <button key={m.id} onClick={()=>setQuizMode(m.id)}
                    style={{background:quizMode===m.id?'rgba(79,156,249,.1)':'var(--surface)',border:`2px solid ${quizMode===m.id?'#4f9cf9':'var(--border)'}`,borderRadius:14,padding:'14px 16px',cursor:'pointer',textAlign:'left',display:'flex',alignItems:'center',gap:14,transition:'all .15s'}}>
                    <span style={{fontSize:22,flexShrink:0}}>{m.icon}</span>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:quizMode===m.id?'#4f9cf9':'var(--text)',marginBottom:3}}>{m.title}</div>
                      <div style={{fontSize:11,color:'var(--muted)',lineHeight:1.4}}>{m.desc}</div>
                    </div>
                    {quizMode===m.id&&<span style={{marginLeft:'auto',color:'#4f9cf9',fontSize:18,flexShrink:0}}>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {totalQ<4&&quizMode==='mc'?(
              <div style={{background:'rgba(249,168,79,.06)',border:'1px solid rgba(249,168,79,.2)',borderRadius:10,padding:'12px 16px',color:'#f9a84f',fontSize:12,textAlign:'center'}}>
                Need at least 4 questions for Multiple Choice. This course has {totalQ}. Try Fill in the Gap instead.
              </div>
            ):(
              <button onClick={startQuiz}
                style={{width:'100%',background:'linear-gradient(135deg,#4f9cf9,#7f5ff9)',border:'none',borderRadius:12,color:'#fff',cursor:'pointer',padding:'15px 0',fontSize:15,fontWeight:700,boxShadow:'0 4px 20px rgba(79,156,249,.3)'}}>
                Start {quizMode==='mc'?'Multiple Choice':'Fill in the Gap'} Quiz →
              </button>
            )}
          </div>
        )}

        {/* ── Active quiz ───────────────────────────────────────────── */}
        {quizStarted&&!quizDone&&(()=>{
          const qs=d.questions||[];const q=qs[quizIdx];if(!q)return null;
          const revealed=quizMode==='mc'?quizChoice!==null:fillRevealed;
          const correct=q.answer;
          const mcCorrect=quizMode==='mc'&&quizChoice===correct;
          const fillCorrect=quizMode==='fill'&&fillRevealed&&(fillInput.trim().toLowerCase()===correct.trim().toLowerCase()||correct.trim().toLowerCase().includes(fillInput.trim().toLowerCase())&&fillInput.trim().length>5);
          const isWrong=revealed&&(quizMode==='mc'?!mcCorrect:!fillCorrect);

          return(
            <div>
              {/* Progress bar */}
              <div style={{marginBottom:18}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                  <Mono color="var(--muted)" size={9}>Q{quizIdx+1} / {qs.length}</Mono>
                  <Mono color="#7fda96" size={9}>{quizScore} correct so far</Mono>
                </div>
                <div style={{height:5,background:'var(--border)',borderRadius:3}}>
                  <div style={{height:'100%',background:'linear-gradient(90deg,#4f9cf9,#7f5ff9)',borderRadius:3,width:`${(quizIdx/qs.length)*100}%`,transition:'width .4s'}}/>
                </div>
              </div>

              {/* Question card */}
              <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,padding:'20px 18px',marginBottom:14}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'#4f9cf9',letterSpacing:1,marginBottom:8,fontWeight:700,display:'flex',gap:8,alignItems:'center'}}>
                  Q{quizIdx+1}
                  <span style={{background:quizMode==='mc'?'rgba(79,156,249,.1)':'rgba(218,127,240,.1)',color:quizMode==='mc'?'#4f9cf9':'#da7ff0',borderRadius:4,padding:'1px 7px'}}>{quizMode==='mc'?'MULTIPLE CHOICE':'FILL IN THE GAP'}</span>
                </div>
                <div style={{fontSize:15,color:'var(--text)',fontWeight:500,lineHeight:1.65}}>{q.question}</div>
              </div>

              {/* Multiple choice options */}
              {quizMode==='mc'&&(
                <div style={{display:'flex',flexDirection:'column',gap:9,marginBottom:14}}>
                  {quizOpts.map((opt,i)=>{
                    const isChosen=quizChoice===opt;const isCorr=opt===correct;
                    let bg='var(--surface)',bdr='var(--border)',col='var(--text)';
                    if(revealed&&isCorr){bg='rgba(127,218,150,.1)';bdr='rgba(127,218,150,.5)';col='#7fda96';}
                    else if(revealed&&isChosen&&!isCorr){bg='rgba(240,80,80,.08)';bdr='rgba(240,80,80,.4)';col='#f05050';}
                    return(
                      <button key={i} onClick={()=>{if(!quizChoice)setQuizChoice(opt);}}
                        style={{background:bg,border:`1.5px solid ${bdr}`,borderRadius:11,color:col,cursor:quizChoice?'default':'pointer',padding:'13px 16px',textAlign:'left',fontSize:13,lineHeight:1.5,display:'flex',alignItems:'center',gap:12,transition:'all .15s'}}>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:revealed&&isCorr?'rgba(127,218,150,.2)':revealed&&isChosen&&!isCorr?'rgba(240,80,80,.2)':'var(--border)',color:revealed&&isCorr?'#7fda96':revealed&&isChosen&&!isCorr?'#f05050':'var(--muted)',borderRadius:4,padding:'2px 7px',flexShrink:0,fontWeight:700,minWidth:22,textAlign:'center'}}>
                          {String.fromCharCode(65+i)}
                        </span>
                        <span style={{flex:1}}>{opt}</span>
                        {revealed&&isCorr&&<span style={{fontSize:16,flexShrink:0}}>✓</span>}
                        {revealed&&isChosen&&!isCorr&&<span style={{fontSize:16,flexShrink:0}}>✗</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Fill in the gap input */}
              {quizMode==='fill'&&(
                <div style={{marginBottom:14}}>
                  <div style={{position:'relative'}}>
                    <input
                      value={fillInput}
                      onChange={e=>!fillRevealed&&setFillInput(e.target.value)}
                      onKeyDown={e=>{if(e.key==='Enter'&&!fillRevealed&&fillInput.trim())setFillRevealed(true);}}
                      placeholder="Type your answer here…"
                      style={{width:'100%',background:'var(--input-bg)',border:`1.5px solid ${fillRevealed?(fillCorrect?'rgba(127,218,150,.5)':'rgba(240,80,80,.4)'):'var(--border)'}`,borderRadius:11,padding:'13px 16px',color:'var(--text)',fontSize:13,outline:'none',fontFamily:"'DM Sans',sans-serif"}}
                    />
                  </div>
                  {!fillRevealed&&(
                    <button onClick={()=>{if(fillInput.trim())setFillRevealed(true);}}
                      disabled={!fillInput.trim()}
                      style={{marginTop:10,width:'100%',background:fillInput.trim()?'rgba(79,156,249,.12)':'var(--border)',border:`1px solid ${fillInput.trim()?'rgba(79,156,249,.35)':'transparent'}`,borderRadius:9,color:fillInput.trim()?'#4f9cf9':'var(--muted)',cursor:fillInput.trim()?'pointer':'not-allowed',padding:'10px 0',fontSize:13,fontWeight:600}}>
                      Check Answer
                    </button>
                  )}
                  {fillRevealed&&(
                    <div style={{marginTop:10,background:fillCorrect?'rgba(127,218,150,.08)':'rgba(240,80,80,.06)',border:`1px solid ${fillCorrect?'rgba(127,218,150,.3)':'rgba(240,80,80,.25)'}`,borderRadius:10,padding:'12px 14px'}}>
                      <div style={{fontSize:12,fontWeight:700,color:fillCorrect?'#7fda96':'#f05050',marginBottom:4}}>
                        {fillCorrect?'✓ Correct!':'✗ Not quite'}
                      </div>
                      {!fillCorrect&&<div style={{fontSize:12,color:'var(--muted)'}}>Correct answer: <span style={{color:'#7fda96',fontWeight:600}}>{correct}</span></div>}
                    </div>
                  )}
                </div>
              )}

              {/* AI Explanation button — shows when wrong */}
              {revealed&&isWrong&&(
                <div style={{marginBottom:14}}>
                  {!explainText[quizIdx]?(
                    <button onClick={()=>askExplanation({q:q.question,correct,chosen:quizMode==='mc'?quizChoice:fillInput},quizIdx)}
                      disabled={explainLoading&&explainIdx===quizIdx}
                      style={{display:'flex',alignItems:'center',gap:8,background:'rgba(127,218,150,.08)',border:'1px solid rgba(127,218,150,.25)',borderRadius:10,color:'#7fda96',cursor:'pointer',padding:'10px 16px',fontSize:12,fontWeight:600,width:'100%',justifyContent:'center'}}>
                      {explainLoading&&explainIdx===quizIdx
                        ?<><span style={{animation:'spin 1s linear infinite',display:'inline-block'}}>⟳</span> Asking StudyBot…</>
                        :<>🤖 Ask StudyBot to explain this</>}
                    </button>
                  ):(
                    <div className="fade-in" style={{background:'rgba(79,156,249,.06)',border:'1px solid rgba(79,156,249,.2)',borderRadius:12,padding:'14px 16px'}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'#4f9cf9',letterSpacing:1,marginBottom:8,fontWeight:700}}>🤖 STUDYBOT EXPLANATION</div>
                      <p style={{fontSize:13,color:'var(--text)',lineHeight:1.75,margin:0}}>{explainText[quizIdx]}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Next button */}
              {revealed&&(
                <div style={{textAlign:'center'}}>
                  <button onClick={quizMode==='mc'?nextQuiz:nextFill}
                    style={{background:'linear-gradient(135deg,#4f9cf9,#7f5ff9)',border:'none',borderRadius:10,color:'#fff',cursor:'pointer',padding:'12px 36px',fontSize:14,fontWeight:700,boxShadow:'0 3px 14px rgba(79,156,249,.3)'}}>
                    {quizIdx+1>=qs.length?'See Results →':'Next Question →'}
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {/* ── Results screen ────────────────────────────────────────── */}
        {quizDone&&(()=>{
          const total=d.questions?.length||0;
          const pctScore=Math.round(quizScore/total*100);
          const grade=pctScore>=80?'🏆 Excellent!':pctScore>=60?'👍 Good job!':pctScore>=40?'📚 Keep studying':'💪 Keep at it!';
          const missed=quizLog.filter(l=>!l.ok);
          return(
            <div>
              {/* Score card */}
              <div style={{textAlign:'center',padding:'32px 16px 24px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,marginBottom:20}}>
                <div style={{fontSize:52,marginBottom:10}}>{pctScore>=80?'🏆':pctScore>=60?'⭐':'📚'}</div>
                {quizScore===total&&total>0&&<div style={{fontSize:36,textAlign:'center',animation:'scale-in .4s ease',marginBottom:4}}>🎉</div>}
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:36,color:quizScore===total?'#7fda96':quizScore>=Math.ceil(total*0.7)?'#f9a84f':'var(--text)',marginBottom:4,textAlign:'center'}}>{quizScore}<span style={{fontSize:20,color:'var(--muted)'}}>/{total}</span></div>
                <div style={{fontSize:14,color:pctScore>=80?'#7fda96':pctScore>=60?'#f9a84f':'#f05050',fontWeight:700,marginBottom:4}}>{pctScore}%</div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,background:pctScore>=80?'rgba(127,218,150,.15)':pctScore>=60?'rgba(249,168,79,.15)':'rgba(240,80,80,.12)',color:pctScore>=80?'#7fda96':pctScore>=60?'#f9a84f':'#f05050',borderRadius:6,padding:'3px 12px',display:'inline-block',fontWeight:700,letterSpacing:.5}}>{grade}</div>
                <div style={{marginTop:10,fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',letterSpacing:1}}>
                  {quizMode==='mc'?'MULTIPLE CHOICE':'FILL IN THE GAP'} · {total} QUESTIONS
                </div>
              </div>

              {/* Missed questions with AI explanations */}
              {missed.length>0&&(
                <div style={{marginBottom:20}}>
                  <Mono color="#f05050" size={9}>REVIEW — {missed.length} MISSED</Mono>
                  <div style={{marginTop:10,display:'flex',flexDirection:'column',gap:12}}>
                    {missed.map((l,i)=>{
                      const logIdx=quizLog.findIndex(x=>x===l);
                      return(
                        <div key={i} style={{background:'var(--card)',border:'1px solid rgba(240,80,80,.2)',borderRadius:12,padding:'15px 16px'}}>
                          <div style={{fontSize:13,color:'var(--text)',fontWeight:600,marginBottom:8,lineHeight:1.5}}>{l.q}</div>
                          <div style={{fontSize:12,color:'#f05050',marginBottom:3}}>✗ Your answer: <em>{l.chosen}</em></div>
                          <div style={{fontSize:12,color:'#7fda96',marginBottom:10}}>✓ Correct: <strong>{l.correct}</strong></div>
                          {/* AI explain button on results screen */}
                          {!explainText[`r-${i}`]?(
                            <button onClick={async()=>{
                              setExplainLoading(true);setExplainIdx(`r-${i}`);
                              try{
                                const prompt=`A student got this question wrong in a quiz about "${d.chapterTitle}" (${d.courseName}).\n\nQuestion: ${l.q}\nCorrect answer: ${l.correct}\nStudent's answer: ${l.chosen}\n\nGive a clear, concise explanation (3-5 sentences) of why the correct answer is right. Be encouraging. No preamble.`;
                                const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:prompt}],context:{mode:'explanation'}})});
                                const data=await res.json();
                                setExplainText(prev=>({...prev,[`r-${i}`]:data.reply||'No explanation available.'}));
                              }catch{setExplainText(prev=>({...prev,[`r-${i}`]:'Could not load explanation.'}));}
                              setExplainLoading(false);
                            }} disabled={explainLoading&&explainIdx===`r-${i}`}
                              style={{display:'flex',alignItems:'center',gap:7,background:'rgba(79,156,249,.08)',border:'1px solid rgba(79,156,249,.2)',borderRadius:8,color:'#4f9cf9',cursor:'pointer',padding:'7px 14px',fontSize:11,fontWeight:600}}>
                              {explainLoading&&explainIdx===`r-${i}`?<><span style={{animation:'spin 1s linear infinite',display:'inline-block'}}>⟳</span> Loading…</>:<>🤖 Explain this</>}
                            </button>
                          ):(
                            <div className="fade-in" style={{background:'rgba(79,156,249,.06)',border:'1px solid rgba(79,156,249,.2)',borderRadius:9,padding:'11px 13px',marginTop:6}}>
                              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:'#4f9cf9',letterSpacing:1,marginBottom:6,fontWeight:700}}>🤖 STUDYBOT</div>
                              <p style={{fontSize:12,color:'var(--text)',lineHeight:1.7,margin:0}}>{explainText[`r-${i}`]}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {missed.length===0&&(
                <div style={{textAlign:'center',padding:'20px',color:'#7fda96',fontSize:13,fontWeight:600}}>
                  🎉 Perfect score! You got every question right.
                </div>
              )}

              {/* Study tip for low scores */}
              {pctScore<60&&total>0&&(
                <div className="fade-in" style={{background:'rgba(249,168,79,.06)',border:'1px solid rgba(249,168,79,.2)',borderRadius:10,padding:'10px 14px',marginBottom:14,marginTop:4}}>
                  <div style={{fontSize:12,color:'#f9a84f',fontWeight:700,marginBottom:3}}>💡 Study Tip</div>
                  <div style={{fontSize:11,color:'var(--muted)',lineHeight:1.6}}>Review the Study Notes tab before retrying — focus on the Concepts and Definitions sections for this chapter.</div>
                </div>
              )}

              <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap',paddingBottom:20}}>
                <button onClick={startQuiz}
                  style={{background:'rgba(79,156,249,.12)',border:'1px solid rgba(79,156,249,.35)',borderRadius:10,color:'#4f9cf9',cursor:'pointer',padding:'11px 24px',fontSize:13,fontWeight:700}}>
                  Retry Quiz
                </button>
                <button onClick={()=>{
                    const pct=Math.round(quizScore/(qs.length||1)*100);
                    const msg=`I scored ${quizScore}/${qs.length} (${pct}%) on "${d.chapterTitle}" — StudyHub 📚`;
                    if(navigator.share)navigator.share({text:msg});
                    else navigator.clipboard.writeText(msg);
                  }} style={{background:'rgba(79,156,249,.1)',border:'1px solid rgba(79,156,249,.3)',borderRadius:10,color:'#4f9cf9',cursor:'pointer',padding:'11px 20px',fontSize:13,fontWeight:600}}>
                  📤 Share Result
                </button>
                <button onClick={()=>{setQuizStarted(false);setQuizDone(false);}}
                  style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,color:'var(--muted)',cursor:'pointer',padding:'11px 20px',fontSize:13}}>
                  Change Type
                </button>
              </div>
            </div>
          );
        })()}
      </div>}
        </div>
      )}

      {tab==='resources'&&<ResourcesTab courseId={course.id} user={user}/>}
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
  add_course:       {icon:'📚',label:'Add Course',        color:'#4f9cf9'},
  delete_course:    {icon:'🗑', label:'Delete Course',     color:'#f05050'},
  add_resource:     {icon:'🔗',label:'Add Resource',      color:'#7fda96'},
  delete_resource:  {icon:'🗑', label:'Delete Resource',   color:'#f9a84f'},
  ai_suggestion:    {icon:'🤖',label:'AI Suggestion',     color:'#a8f94f'},
  duplicate_warning:{icon:'⚠️',label:'Duplicate Warning', color:'#f9a84f'},
};

function ApprovalsTab({onCourseChange,courses,reviewerUsername}){
  const[pending,setPending]=useState([]);const[history,setHistory]=useState([]);const[tab,setTab]=useState('pending');const[loading,setLoading]=useState(true);const[busy,setBusy]=useState('');const[bulkBusy,setBulkBusy]=useState('');const[rejectModal,setRejectModal]=useState(null);const[rejectNote,setRejectNote]=useState('');const[histSort,setHistSort]=useState('recent');const[histFilter,setHistFilter]=useState('all');

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
      // AI suggestion — no automated action on approval, superuser acknowledges it
      // (implementing the suggestion is a separate manual or upload action)
      await dbReviewPending(action.id,'approved',reviewerUsername);
    }catch(e){console.error(e);}
    setBusy('');await load();
  };

  const approveAll=async()=>{
    if(!pending.length)return;
    setBulkBusy('approving');
    for(const action of pending){
      try{
        if(action.action_type==='add_course'){const{entry,courseData}=action.payload;await dbSaveCourse(entry,courseData);}
        if(action.action_type==='delete_course'){await dbDeleteCourse(action.payload.id);}
        if(action.action_type==='add_resource'){await supabase.from('resources').insert(action.payload);}
        if(action.action_type==='delete_resource'){await dbDeleteResource(action.payload.id);}
        await dbReviewPending(action.id,'approved',reviewerUsername);
      }catch(e){console.error(e);}
    }
    const idx=await dbLoadCourseIndex();onCourseChange(idx);
    setBulkBusy('');await load();
  };

  const rejectAll=async()=>{
    if(!pending.length)return;
    setBulkBusy('rejecting');
    await Promise.all(pending.map(a=>dbReviewPending(a.id,'rejected',reviewerUsername,'Bulk rejected by superuser.')));
    setBulkBusy('');await load();
  };

  const reject=async()=>{
    if(!rejectModal)return;
    setBusy(rejectModal.id);
    await dbReviewPending(rejectModal.id,'rejected',reviewerUsername,rejectNote);
    setRejectModal(null);setRejectNote('');setBusy('');await load();
  };

  // Sort and filter the list
  const list=useMemo(()=>{
    const base=tab==='pending'?pending:history;
    let filtered=histFilter==='all'?base:base.filter(a=>a.action_type===histFilter);
    return [...filtered].sort((a,b)=>{
      if(histSort==='oldest') return new Date(a.requested_at)-new Date(b.requested_at);
      if(histSort==='type') return a.action_type.localeCompare(b.action_type);
      return new Date(b.requested_at)-new Date(a.requested_at); // recent first
    });
  },[tab,pending,history,histSort,histFilter]);

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

      <div style={{background:'rgba(249,168,79,.06)',border:'1px solid rgba(249,168,79,.2)',borderRadius:10,padding:'12px 16px',marginBottom:16}}>
        <div style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:10}}>
          <span style={{fontSize:20}}>⚡</span>
          <div>
            <div style={{color:'#f9a84f',fontSize:13,fontWeight:600,marginBottom:2}}>Superuser Approval Queue</div>
            <div style={{color:'var(--muted)',fontSize:12}}>Admin actions queue here for your approval before taking effect.</div>
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {[
            {icon:'📚',label:'Add Course',desc:'Admin uploaded a new study guide. Approve to publish it for students.'},
            {icon:'🗑',label:'Delete Course',desc:'Admin requested deletion. Approve to permanently remove it.'},
            {icon:'🔗',label:'Add/Remove Resource',desc:'Admin added a link or file to a course. Approve to make it visible.'},
            {icon:'🤖',label:'AI Suggestion',color:'#a8f94f',desc:'StudyBot noticed something that could improve a course — e.g. missing concepts or weak questions. This is informational. Approving just marks it as reviewed. To act on it, upload an updated study guide manually.'},
          ].map(t=>(
            <div key={t.label} style={{display:'flex',gap:8,alignItems:'flex-start',padding:'6px 8px',background:'rgba(0,0,0,.15)',borderRadius:7}}>
              <span style={{fontSize:14,flexShrink:0}}>{t.icon}</span>
              <div>
                <span style={{fontSize:11,fontWeight:700,color:t.color||'var(--text)',marginRight:6}}>{t.label}</span>
                <span style={{fontSize:11,color:'var(--muted)'}}>{t.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-tabs + bulk actions */}
      <div style={{display:'flex',alignItems:'center',gap:4,borderBottom:'1px solid var(--border)',marginBottom:18,flexWrap:'wrap'}}>
        {[{id:'pending',label:`Pending${pending.length>0?` (${pending.length})`:''}`,color:pending.length>0?'#f9a84f':undefined},{id:'history',label:'History'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{background:'none',border:'none',borderBottom:tab===t.id?`2px solid ${t.color||'#f9a84f'}`:'2px solid transparent',color:tab===t.id?(t.color||'#f9a84f'):'var(--muted)',cursor:'pointer',padding:'8px 16px',fontSize:13,fontWeight:tab===t.id?600:400}}>{t.label}</button>
        ))}
        {tab==='history'&&(
          <div style={{marginLeft:'auto',display:'flex',gap:6,paddingBottom:4,alignItems:'center',flexWrap:'wrap'}}>
            <select value={histFilter} onChange={e=>setHistFilter(e.target.value)}
              style={{background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:7,color:'var(--text)',padding:'5px 8px',fontSize:11}}>
              <option value="all">All types</option>
              <option value="add_course">Add Course</option>
              <option value="delete_course">Delete Course</option>
              <option value="ai_suggestion">AI Suggestion</option>
              <option value="add_resource">Add Resource</option>
            </select>
            <select value={histSort} onChange={e=>setHistSort(e.target.value)}
              style={{background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:7,color:'var(--text)',padding:'5px 8px',fontSize:11}}>
              <option value="recent">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="type">By type</option>
            </select>
          </div>
        )}
        {tab==='pending'&&pending.length>1&&(
          <div style={{marginLeft:'auto',display:'flex',gap:8,paddingBottom:4}}>
            <button onClick={approveAll} disabled={bulkBusy!==''} style={{background:'rgba(127,218,150,.12)',border:'1px solid rgba(127,218,150,.35)',borderRadius:8,color:'#7fda96',cursor:'pointer',padding:'6px 14px',fontSize:12,fontWeight:700}}>
              {bulkBusy==='approving'?'Approving…':'✓ Approve All'}
            </button>
            <button onClick={rejectAll} disabled={bulkBusy!==''} style={{background:'rgba(240,80,80,.08)',border:'1px solid rgba(240,80,80,.3)',borderRadius:8,color:'#f05050',cursor:'pointer',padding:'6px 14px',fontSize:12,fontWeight:700}}>
              {bulkBusy==='rejecting'?'Rejecting…':'✕ Reject All'}
            </button>
          </div>
        )}
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {list.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:40,border:'1px dashed var(--border)',borderRadius:12,fontSize:13}}>{tab==='pending'?"✅ All caught up — no pending requests.":'No reviewed actions yet — approvals and rejections will show here.'}</div>}
        {list.map((a,i)=>{
          const meta=ACTION_LABELS[a.action_type]||{icon:'❓',label:a.action_type,color:'#8892a4'};
          const isPending=a.status==='pending';
          const isApproved=a.status==='approved';
          // Build detail sections based on action type
          const details=[];
          if(a.action_type==='add_course'&&a.payload?.entry){
            const e=a.payload.entry;const d=a.payload.courseData;
            details.push({label:'Course',value:`${e.courseName} — ${e.chapterTitle}`});
            details.push({label:'Location',value:`Year ${e.year} · Semester ${e.semester||1} · ${DEPT_SHORT[e.department]||e.department||'CS'}`});
            if(d){
              details.push({label:'Content',value:`${d.keyConcepts?.length||0} concepts · ${d.definitions?.length||0} terms · ${d.questions?.length||0} questions · ${d.mechanisms?.length||0} mechanisms`});
              if(d.chapters?.length) details.push({label:'Chapters',value:d.chapters.map(c=>c.name||c.num).join(' · ')});
            }
          }
          if(a.action_type==='delete_course'){
            const course=courses.find(c=>c.id===a.payload?.id);
            details.push({label:'Course to delete',value:course?`${course.courseName} — ${course.chapterTitle}`:`ID: ${a.payload?.id}`});
            details.push({label:'Warning',value:'This will permanently remove all course data including notes, questions, and student progress.',danger:true});
          }
          if(a.action_type==='add_resource'||a.action_type==='delete_resource'){
            if(a.payload?.title) details.push({label:'Resource',value:a.payload.title});
            if(a.payload?.url) details.push({label:'URL',value:a.payload.url});
            if(a.payload?._table) details.push({label:'Type',value:a.payload._table==='assignments'?'Assignment':a.payload._table==='course_cas'?'CA / Test':'Resource'});
          }
          if(a.action_type==='ai_suggestion'&&a.payload?.suggestion){
            const s=a.payload.suggestion;
            details.push({label:'Course',value:`${a.payload.courseName||''} — ${a.payload.chapterTitle||''}`});
            details.push({label:'Suggestion',value:s.title,highlight:true});
            details.push({label:'Type',value:(s.type||'').replace(/_/g,' ')});
            details.push({label:'Details',value:s.description});
            details.push({label:'Action required',value:'This is an AI suggestion only. Approve to acknowledge it — implement it manually via the Upload panel if you agree.',info:true});
          }
          if(a.action_type==='duplicate_warning'||a.note?.includes('DUPLICATE')){
            details.push({label:'⚠️ Duplicate flag',value:a.note||'Possible duplicate content detected.',danger:true});
          }
          // Generic note
          if(a.note&&!details.some(d=>d.value===a.note)) details.push({label:'Note',value:a.note});

          return(
            <div key={a.id} className={`stagger-${Math.min(i%4+1,4)}`}
              style={{background:'var(--card)',border:`1px solid ${isPending?`${meta.color}30`:isApproved?'rgba(127,218,150,.2)':'rgba(240,80,80,.2)'}`,borderRadius:12,padding:'16px 18px'}}>
              {/* Header row */}
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,flexWrap:'wrap',marginBottom:details.length?12:0}}>
                <div style={{display:'flex',alignItems:'center',gap:12,flex:1,minWidth:200}}>
                  <div style={{width:40,height:40,borderRadius:10,background:`${meta.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{meta.icon}</div>
                  <div>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3,flexWrap:'wrap'}}>
                      <span style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>{meta.label}</span>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:`${meta.color}15`,color:meta.color,borderRadius:4,padding:'2px 7px',letterSpacing:.5}}>{a.action_type}</span>
                      {!isPending&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:isApproved?'rgba(127,218,150,.15)':'rgba(240,80,80,.15)',color:isApproved?'#7fda96':'#f05050',borderRadius:4,padding:'2px 7px',letterSpacing:.5}}>{a.status.toUpperCase()}</span>}
                    </div>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)'}}>
                      By <span style={{color:'var(--text)',fontWeight:600}}>@{a.requested_by}</span> · {new Date(a.requested_at).toLocaleString()}
                      {!isPending&&a.reviewed_by&&<span> · Reviewed by @{a.reviewed_by}</span>}
                    </div>
                  </div>
                </div>
                {isPending&&(
                  <div style={{display:'flex',gap:8,flexShrink:0}}>
                    <button onClick={()=>approve(a)} disabled={busy===a.id}
                      style={{background:'rgba(127,218,150,.12)',border:'1px solid rgba(127,218,150,.35)',borderRadius:8,color:'#7fda96',cursor:'pointer',padding:'8px 16px',fontSize:12,fontWeight:700}}>
                      {busy===a.id?'…':'✓ Approve'}
                    </button>
                    <button onClick={()=>setRejectModal(a)} disabled={busy===a.id}
                      style={{background:'rgba(240,80,80,.1)',border:'1px solid rgba(240,80,80,.3)',borderRadius:8,color:'#f05050',cursor:'pointer',padding:'8px 14px',fontSize:12,fontWeight:700}}>✕ Reject</button>
                  </div>
                )}
              </div>
              {/* Detail rows */}
              {details.length>0&&(
                <div style={{borderTop:'1px solid var(--border)',paddingTop:10,display:'flex',flexDirection:'column',gap:6}}>
                  {details.map((d,di)=>(
                    <div key={di} style={{display:'flex',gap:8,alignItems:'flex-start',background:d.danger?'rgba(240,80,80,.06)':d.info?'rgba(79,156,249,.06)':d.highlight?'rgba(168,249,79,.06)':'transparent',borderRadius:6,padding:d.danger||d.info||d.highlight?'5px 8px':0}}>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:d.danger?'#f05050':d.info?'#4f9cf9':d.highlight?'#a8f94f':'var(--muted)',letterSpacing:.5,flexShrink:0,minWidth:80,paddingTop:1}}>{d.label}</span>
                      <span style={{fontSize:12,color:d.danger?'#f05050':d.highlight?'#a8f94f':'var(--text)',lineHeight:1.5,wordBreak:'break-word'}}>{d.value}</span>
                    </div>
                  ))}
                </div>
              )}
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
            <div style={{position:'relative',flexShrink:0}}>
              <Avatar name={u.display_name||u.username}/>
              {u.created_at&&(new Date()-new Date(u.created_at))<7*24*3600*1000&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7,background:'rgba(127,218,150,.9)',color:'#000',borderRadius:3,padding:'1px 5px',fontWeight:700,position:'absolute',top:-6,right:-6}}>NEW</span>}
            </div>
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
/* ═══════════════ SUBSCRIPTION / PAYMENT ═══════════════ */
const TIER_CONFIG={
  free:    {label:'Free',       color:'#8892a4',icon:'🎓',badge:'Free'},
  pro:     {label:'Student Pro',color:'#f9a84f',icon:'⭐',badge:'Pro' },
  external:{label:'External',   color:'#a8f94f',icon:'🌐',badge:'Pro' },
};

function XPBadge({xp,size=9}){
  const lvl=getLevel(xp);
  const{pct}=getXPProgress(xp);
  return(
    <span title={`Level ${lvl.level} ${lvl.title} · ${xp} XP · ${pct}% to next level`}
      style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:size,background:`${lvl.color}15`,color:lvl.color,border:`1px solid ${lvl.color}40`,borderRadius:4,padding:'1px 6px',letterSpacing:.5,fontWeight:700,cursor:'default'}}>
      Lv{lvl.level} {lvl.title}
    </span>
  );
}
function SubscriptionBadge({tier,role,expiresAt}){
  if(role===ROLE.SUPERUSER) return null;
  const t=TIER_CONFIG[tier]||TIER_CONFIG.free;
  const isExpired=expiresAt&&new Date(expiresAt)<new Date();
  const daysLeft=expiresAt?Math.max(0,Math.ceil((new Date(expiresAt)-new Date())/(1000*60*60*24))):null;
  const warn=tier==='pro'&&daysLeft!==null&&daysLeft<=7;
  return(
    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,background:isExpired?'rgba(240,80,80,.15)':warn?'rgba(249,168,79,.2)':`${t.color}20`,color:isExpired?'#f05050':warn?'#f9a84f':t.color,border:`1px solid ${isExpired?'rgba(240,80,80,.4)':warn?'rgba(249,168,79,.4)':t.color+'40'}`,borderRadius:4,padding:'1px 6px',letterSpacing:1,fontWeight:700}}>
      {isExpired?'⚠ EXPIRED':warn?`⭐ ${daysLeft}d left`:t.icon+' '+t.badge}
    </span>
  );
}

function PaymentPortal({user,subCfg,onClose}){
  const onePrice  = subCfg?.pro_price_1month||'500';
  const semPrice  = subCfg?.pro_price_semester||'1500';
  const yearPrice = subCfg?.pro_price_yearly||'5000';
  const acctName  = subCfg?.payment_account_name||'StudyHUB';
  const acctNum   = subCfg?.payment_account_number||'0123456789';
  const bank      = subCfg?.payment_bank||'OPay';
  const wa        = subCfg?.payment_whatsapp||'';
  const aiLimit   = subCfg?.free_ai_messages_per_month||'5';
  const referralCredit=parseInt(subCfg?.referral_credit||'100');
  const[copied,setCopied]=useState(false);
  const[selPlan,setSelPlan]=useState('semester');
  const[promoCode,setPromoCode]=useState('');
  const[promoResult,setPromoResult]=useState(null); // {valid,promo,error}
  const[promoChecking,setPromoChecking]=useState(false);
  const[userCredits,setUserCredits]=useState(0);
  const myReferralCode=genReferralCode(user?.username||'');
  const[refCopied,setRefCopied]=useState(false);

  useEffect(()=>{
    if(user?.username)dbGetReferralCredits(user.username).then(setUserCredits);
  },[user?.username]);

  const checkPromo=async()=>{
    if(!promoCode.trim())return;
    setPromoChecking(true);setPromoResult(null);
    const result=await dbValidatePromo(promoCode);
    setPromoResult(result);setPromoChecking(false);
  };

  const plans=[
    {id:'1month', label:'1 Month',    duration:'30 days',    price:onePrice, badge:null,        color:'#8892a4'},
    {id:'semester',label:'1 Semester',duration:'~5 months', price:semPrice, badge:null,        color:'#4f9cf9'},
    {id:'yearly',  label:'1 Year',    duration:'2 semesters',price:yearPrice,badge:'Best value', color:'#f9a84f'},
  ];
  const sel=plans.find(p=>p.id===selPlan)||plans[0];

  // Calculate final price with credits and promo
  const basePrice=parseInt(sel.price)||0;
  const creditDiscount=Math.min(userCredits,basePrice);
  const promoDiscount=(()=>{
    if(!promoResult?.valid)return 0;
    const p=promoResult.promo;
    if(p.discount_type==='percent') return Math.round(basePrice*p.discount_value/100);
    if(p.discount_type==='flat') return Math.min(p.discount_value,basePrice);
    return 0;
  })();
  const finalPrice=Math.max(0,basePrice-creditDiscount-promoDiscount);

  const copyAcct=()=>{navigator.clipboard.writeText(acctNum).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});};
  const copyRef=()=>{navigator.clipboard.writeText(myReferralCode).then(()=>{setRefCopied(true);setTimeout(()=>setRefCopied(false),2000);});};

  return(
    <div className="modal-overlay" style={{zIndex:9960}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="scale-in" style={{
        background:'linear-gradient(160deg,#07119a,#0e8f94)',
        border:'1px solid rgba(255,255,255,.12)',
        borderRadius:20,padding:'26px 22px',
        maxWidth:440,width:'calc(100% - 20px)',margin:'auto',
        boxShadow:'0 20px 60px rgba(0,0,0,.5)',
        position:'relative',maxHeight:'92vh',overflowY:'auto',
      }}>
        <div style={{position:'absolute',top:-60,right:-60,width:180,height:180,borderRadius:'50%',background:'rgba(17,163,168,.3)',filter:'blur(50px)',pointerEvents:'none'}}/>

        {/* Header */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:18}}>
          <div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:'#fff',marginBottom:2}}>StudyHub Pro</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.55)'}}>Unlock full access for your studies</div>
          </div>
          <button onClick={onClose} style={{background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.2)',borderRadius:'50%',color:'#fff',cursor:'pointer',width:30,height:30,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0,marginTop:2}}>✕</button>
        </div>

        {/* Current subscription status banner */}
        {user?.subscription_tier==='pro'&&user?.sub_expires_at&&(()=>{
          const exp=new Date(user.sub_expires_at);
          const daysLeft=Math.max(0,Math.ceil((exp-new Date())/(1000*60*60*24)));
          const expired=exp<new Date();
          return(
            <div style={{background:expired?'rgba(240,80,80,.2)':daysLeft<=14?'rgba(249,168,79,.2)':'rgba(127,218,150,.15)',border:`1px solid ${expired?'rgba(240,80,80,.5)':daysLeft<=14?'rgba(249,168,79,.5)':'rgba(127,218,150,.4)'}`,borderRadius:10,padding:'10px 14px',marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:18}}>{expired?'⚠️':daysLeft<=14?'⏳':'⭐'}</span>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:'#fff',marginBottom:1}}>
                  {expired?'Subscription expired':'Active Pro subscription'}
                </div>
                <div style={{fontSize:10,color:'rgba(255,255,255,.7)'}}>
                  {expired
                    ?`Expired on ${exp.toLocaleDateString()}`
                    :`${daysLeft} day${daysLeft!==1?'s':''} remaining · expires ${exp.toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}`}
                  {user.sub_plan&&<span style={{marginLeft:8,opacity:.7}}>{({'1month':'1 Month','semester':'1 Semester','yearly':'1 Year (2 Sems)'})[user.sub_plan]||''}</span>}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Tier comparison */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:18}}>
          {[
            {tier:'🎓 Basic (Free)',color:'#8892a4',features:[
              `Year ${user?.year||1} courses only`,
              `${aiLimit} AI explanations/month`,
              'Community forum support',
              'Limited notes access',
            ]},
            {tier:'⭐ Premium',color:'#f9a84f',features:[
              'All years & departments',
              'Unlimited AI analysis',
              'Personalized study plans',
              'Practice questions',
              'Detailed explanations',
              'Priority support',
            ]},
          ].map((t,i)=>(
            <div key={i} style={{background:`rgba(255,255,255,${i===1?.12:.05})`,border:`1px solid ${t.color}40`,borderRadius:12,padding:'12px 11px'}}>
              <div style={{fontSize:10,fontWeight:700,color:t.color,marginBottom:8,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:.5}}>{t.tier}</div>
              {t.features.map((f,j)=>(
                <div key={j} style={{fontSize:10.5,color:i===1?'rgba(255,255,255,.9)':'rgba(255,255,255,.45)',marginBottom:3,display:'flex',alignItems:'flex-start',gap:4,lineHeight:1.4}}>
                  <span style={{color:i===1?'#7fda96':'#444',fontSize:9,flexShrink:0,marginTop:2}}>{i===1?'✓':'·'}</span>{f}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Plan picker */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:9,color:'rgba(255,255,255,.45)',fontFamily:"'IBM Plex Mono',monospace",letterSpacing:2,marginBottom:10}}>CHOOSE YOUR PLAN</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {plans.map(p=>(
              <button key={p.id} onClick={()=>setSelPlan(p.id)} style={{
                background:selPlan===p.id?`rgba(255,255,255,.14)`:'rgba(255,255,255,.05)',
                border:`1.5px solid ${selPlan===p.id?p.color:'rgba(255,255,255,.15)'}`,
                borderRadius:12,padding:'11px 14px',cursor:'pointer',
                display:'flex',alignItems:'center',justifyContent:'space-between',
                transition:'all .15s',textAlign:'left',
              }}>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:selPlan===p.id?p.color:'rgba(255,255,255,.85)',marginBottom:2}}>{p.label}</div>
                  <div style={{fontSize:10,color:'rgba(255,255,255,.45)'}}>{p.duration}</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  {p.badge&&<span style={{fontSize:9,background:`${p.color}25`,color:p.color,borderRadius:4,padding:'2px 7px',fontFamily:"'IBM Plex Mono',monospace",fontWeight:700}}>{p.badge}</span>}
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:17,color:p.color,fontWeight:700}}>₦{p.price}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Referral note */}
        <div style={{background:'rgba(127,218,150,.08)',border:'1px solid rgba(127,218,150,.2)',borderRadius:10,padding:'10px 13px',marginBottom:16,display:'flex',gap:10,alignItems:'flex-start'}}>
          <span style={{fontSize:16,flexShrink:0}}>🎁</span>
          <div style={{fontSize:11,color:'rgba(255,255,255,.7)',lineHeight:1.5}}>
            <strong style={{color:'#7fda96'}}>Referral discount:</strong> Get <strong style={{color:'#7fda96'}}>₦100 off</strong> for each friend you refer who subscribes. Mention your username during WhatsApp verification.
          </div>
        </div>

        {/* ── Referral credits banner ── */}
        {userCredits>0&&(
          <div style={{background:'rgba(127,218,150,.12)',border:'1px solid rgba(127,218,150,.3)',borderRadius:10,padding:'10px 14px',marginBottom:14,display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:18}}>🎁</span>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:'#7fda96'}}>₦{userCredits} referral credits</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,.55)'}}>Auto-applied to your next payment</div>
            </div>
          </div>
        )}

        {/* ── Promo code input ── */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:9,color:'rgba(255,255,255,.45)',fontFamily:"'IBM Plex Mono',monospace",letterSpacing:2,marginBottom:6}}>PROMO CODE (OPTIONAL)</div>
          <div style={{display:'flex',gap:8}}>
            <input value={promoCode} onChange={e=>setPromoCode(e.target.value.toUpperCase())}
              onKeyDown={e=>e.key==='Enter'&&checkPromo()}
              placeholder="e.g. WELCOME50"
              style={{flex:1,background:'rgba(255,255,255,.08)',border:`1px solid ${promoResult?.valid?'rgba(127,218,150,.6)':promoResult?.error?'rgba(240,80,80,.6)':'rgba(255,255,255,.2)'}`,borderRadius:8,padding:'9px 12px',color:'#fff',fontSize:12,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}/>
            <button onClick={checkPromo} disabled={promoChecking||!promoCode.trim()}
              style={{background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.2)',borderRadius:8,color:'#fff',cursor:'pointer',padding:'9px 14px',fontSize:11,fontWeight:700,flexShrink:0}}>
              {promoChecking?'…':'Apply'}
            </button>
          </div>
          {promoResult&&(
            <div style={{marginTop:6,fontSize:11,color:promoResult.valid?'#7fda96':'#f05050'}}>
              {promoResult.valid
                ?`✓ ${promoResult.promo.description||'Discount applied!'} — saves ₦${promoDiscount}`
                :`✕ ${promoResult.error}`}
            </div>
          )}
        </div>

        {/* ── Price breakdown ── */}
        {(creditDiscount>0||promoDiscount>0)&&(
          <div style={{background:'rgba(0,0,0,.2)',borderRadius:10,padding:'10px 14px',marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'rgba(255,255,255,.6)',marginBottom:4}}>
              <span>Base price</span><span>₦{basePrice}</span>
            </div>
            {creditDiscount>0&&<div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#7fda96',marginBottom:4}}>
              <span>🎁 Referral credits</span><span>−₦{creditDiscount}</span>
            </div>}
            {promoDiscount>0&&<div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#7fda96',marginBottom:4}}>
              <span>🏷 Promo code</span><span>−₦{promoDiscount}</span>
            </div>}
            <div style={{borderTop:'1px solid rgba(255,255,255,.15)',marginTop:6,paddingTop:6,display:'flex',justifyContent:'space-between',fontSize:14,fontWeight:700,color:'#fff'}}>
              <span>You pay</span><span>₦{finalPrice}</span>
            </div>
          </div>
        )}

        {/* Payment details */}
        <div style={{background:'rgba(0,0,0,.3)',border:'1px solid rgba(255,255,255,.1)',borderRadius:12,padding:'12px 14px',marginBottom:16}}>
          <div style={{fontSize:9,color:'rgba(255,255,255,.4)',fontFamily:"'IBM Plex Mono',monospace",letterSpacing:2,marginBottom:8}}>
            PAY ₦{finalPrice>0?finalPrice:0} — {sel.label.toUpperCase()}
            {finalPrice===0&&<span style={{color:'#7fda96',marginLeft:8}}>FREE WITH CREDITS!</span>}
          </div>
          <div style={{fontSize:12,color:'rgba(255,255,255,.7)',marginBottom:8}}>{acctName}</div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}>
            <div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:20,color:'#fff',letterSpacing:2,fontWeight:700}}>{acctNum}</div>
              <div style={{fontSize:11,color:'rgba(7,243,7,.9)',fontWeight:600,marginTop:2}}>{bank}</div>
            </div>
            <button onClick={copyAcct} style={{background:copied?'rgba(127,218,150,.2)':'rgba(255,255,255,.1)',border:`1px solid ${copied?'rgba(127,218,150,.5)':'rgba(255,255,255,.2)'}`,borderRadius:8,color:copied?'#7fda96':'#fff',cursor:'pointer',padding:'8px 14px',fontSize:11,fontWeight:600,flexShrink:0,transition:'all .2s'}}>
              {copied?'✓ Copied':'Copy'}
            </button>
          </div>
        </div>

        {/* ── Your referral code ── */}
        <div style={{background:'rgba(168,249,79,.06)',border:'1px solid rgba(168,249,79,.2)',borderRadius:10,padding:'12px 14px',marginBottom:14}}>
          <div style={{fontSize:9,color:'rgba(168,249,79,.7)',fontFamily:"'IBM Plex Mono',monospace",letterSpacing:2,marginBottom:6}}>YOUR REFERRAL CODE</div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}>
            <div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:20,color:'#a8f94f',letterSpacing:3,fontWeight:700}}>{myReferralCode}</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,.45)',marginTop:3}}>Share with friends — earn ₦{referralCredit} credit per subscriber</div>
            </div>
            <button onClick={copyRef} style={{background:refCopied?'rgba(168,249,79,.2)':'rgba(168,249,79,.08)',border:'1px solid rgba(168,249,79,.3)',borderRadius:8,color:'#a8f94f',cursor:'pointer',padding:'8px 14px',fontSize:11,fontWeight:600,flexShrink:0}}>
              {refCopied?'✓ Copied':'Copy'}
            </button>
          </div>
        </div>

        {/* WhatsApp CTA */}
        <div style={{textAlign:'center',marginBottom:10}}>
          <div style={{fontSize:11,color:'rgba(255,255,255,.55)',marginBottom:10,lineHeight:1.5}}>
            Send proof of payment on WhatsApp to activate Pro.<br/>
            <span style={{color:'rgba(168,249,79,.8)'}}>Include your referral code to track credits</span>
          </div>
          {wa?(
            <a href={wa} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:8,background:'#1fff02',color:'#000',padding:'11px 26px',borderRadius:12,fontSize:14,fontWeight:700,textDecoration:'none',boxShadow:'0 4px 20px rgba(31,255,2,.3)'}}>
              💬 Send Payment Proof
            </a>
          ):(
            <div style={{fontSize:11,color:'rgba(255,255,255,.3)',fontStyle:'italic'}}>WhatsApp link not configured — contact admin</div>
          )}
        </div>
        <div style={{fontSize:10,color:'rgba(255,255,255,.25)',textAlign:'center',lineHeight:1.6}}>
          Activated within 24 hrs · No auto-renewal · Pay per plan
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ PROMO CODES TAB ═══════════════ */
function PromoCodesTab({superuserName}){
  const BLANK={code:'',description:'',discount_type:'percent',discount_value:10,max_uses:0,expires_at:'',active:true};
  const[promos,setPromos]=useState([]);const[loading,setLoading]=useState(true);
  const[form,setForm]=useState(BLANK);const[saving,setSaving]=useState(false);
  const[msg,setMsg]=useState('');

  const load=async()=>{setLoading(true);const p=await dbLoadPromos();setPromos(p);setLoading(false);};
  useEffect(()=>{load();},[]);
  const flash=m=>{setMsg(m);setTimeout(()=>setMsg(''),3000);};

  const save=async()=>{
    if(!form.code.trim()||!form.description.trim()){flash('❌ Code and description are required');return;}
    setSaving(true);
    const promo={
      code:form.code.trim().toUpperCase(),
      description:form.description.trim(),
      discount_type:form.discount_type,
      discount_value:parseInt(form.discount_value)||0,
      max_uses:parseInt(form.max_uses)||0,
      uses_count:0,
      active:true,
      expires_at:form.expires_at||null,
      created_by:superuserName,
      created_at:new Date().toISOString(),
    };
    await dbSavePromo(promo);await load();setForm(BLANK);
    flash('✓ Promo code saved');setSaving(false);
  };

  const toggle=async(code,active)=>{
    await supabase.from('promo_codes').update({active}).eq('code',code);
    await load();
  };

  const remove=async(code)=>{
    if(!window.confirm(`Delete promo "${code}"?`))return;
    await dbDeletePromo(code);await load();flash('Deleted.');
  };

  return(
    <div>
      {msg&&<div style={{background:'rgba(168,249,79,.1)',border:'1px solid rgba(168,249,79,.3)',borderRadius:8,padding:'8px 14px',fontSize:12,color:'#a8f94f',marginBottom:14}}>{msg}</div>}
      <div style={{background:'rgba(249,168,79,.06)',border:'1px solid rgba(249,168,79,.2)',borderRadius:10,padding:'12px 16px',marginBottom:20}}>
        <div style={{color:'#f9a84f',fontSize:13,fontWeight:600,marginBottom:4}}>🏷 Promo Codes</div>
        <div style={{color:'var(--muted)',fontSize:12}}>Create discount codes for special offers. Users enter these in the payment portal.</div>
      </div>

      {/* Create form */}
      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:'16px',marginBottom:20}}>
        <Mono color="var(--muted)" size={9}>CREATE NEW CODE</Mono>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:10}}>
          <div>
            <div style={{fontSize:10,color:'var(--muted)',marginBottom:4,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>CODE</div>
            <input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'')}))} placeholder="e.g. WELCOME50" maxLength={20}
              style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'9px 12px',color:'var(--text)',fontSize:13,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}/>
          </div>
          <div>
            <div style={{fontSize:10,color:'var(--muted)',marginBottom:4,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>DESCRIPTION</div>
            <input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="e.g. 50% off first month"
              style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'9px 12px',color:'var(--text)',fontSize:13}}/>
          </div>
          <div>
            <div style={{fontSize:10,color:'var(--muted)',marginBottom:4,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>DISCOUNT TYPE</div>
            <select value={form.discount_type} onChange={e=>setForm(f=>({...f,discount_type:e.target.value}))}
              style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'9px 12px',color:'var(--text)',fontSize:13}}>
              <option value="percent">% Off (e.g. 50% off)</option>
              <option value="flat">Flat amount (e.g. ₦500 off)</option>
            </select>
          </div>
          <div>
            <div style={{fontSize:10,color:'var(--muted)',marginBottom:4,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>
              DISCOUNT VALUE ({form.discount_type==='percent'?'%':'₦'})
            </div>
            <input type="number" value={form.discount_value} onChange={e=>setForm(f=>({...f,discount_value:e.target.value}))} min="1" max={form.discount_type==='percent'?100:99999}
              style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'9px 12px',color:'var(--text)',fontSize:13}}/>
          </div>
          <div>
            <div style={{fontSize:10,color:'var(--muted)',marginBottom:4,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>MAX USES (0 = unlimited)</div>
            <input type="number" value={form.max_uses} onChange={e=>setForm(f=>({...f,max_uses:e.target.value}))} min="0"
              style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'9px 12px',color:'var(--text)',fontSize:13}}/>
            <div style={{fontSize:10,color:'var(--muted)',marginTop:3}}>e.g. 100 for "first 100 users"</div>
          </div>
          <div>
            <div style={{fontSize:10,color:'var(--muted)',marginBottom:4,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>EXPIRES (leave blank = never)</div>
            <input type="date" value={form.expires_at} onChange={e=>setForm(f=>({...f,expires_at:e.target.value}))}
              style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'9px 12px',color:'var(--text)',fontSize:13}}/>
          </div>
        </div>
        <button onClick={save} disabled={saving||!form.code.trim()}
          style={{marginTop:14,background:'#f9a84f',border:'none',borderRadius:8,color:'#000',cursor:saving?'not-allowed':'pointer',padding:'10px 22px',fontSize:13,fontWeight:700}}>
          {saving?'Saving…':'+ Create Promo Code'}
        </button>
      </div>

      {/* Existing promos */}
      {loading&&<div style={{color:'var(--muted)',textAlign:'center',padding:24}}>Loading…</div>}
      {!loading&&promos.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:24,border:'1px dashed var(--border)',borderRadius:12}}>No promo codes yet.</div>}
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {promos.map(p=>{
          const isExpired=p.expires_at&&new Date(p.expires_at)<new Date();
          const isFull=p.max_uses>0&&(p.uses_count||0)>=p.max_uses;
          return(
            <div key={p.code} style={{background:'var(--card)',border:`1px solid ${p.active&&!isExpired&&!isFull?'var(--border)':'rgba(240,80,80,.2)'}`,borderRadius:10,padding:'14px 16px'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4,flexWrap:'wrap'}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,fontWeight:700,color:p.active?'#a8f94f':'var(--muted)',letterSpacing:1}}>{p.code}</span>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:p.active&&!isExpired&&!isFull?'rgba(168,249,79,.1)':'rgba(240,80,80,.1)',color:p.active&&!isExpired&&!isFull?'#a8f94f':'#f05050',borderRadius:4,padding:'2px 7px'}}>
                      {!p.active?'DISABLED':isExpired?'EXPIRED':isFull?'LIMIT REACHED':'ACTIVE'}
                    </span>
                    <span style={{fontSize:11,color:'var(--muted)'}}>
                      {p.discount_type==='percent'?`${p.discount_value}% off`:`₦${p.discount_value} off`}
                    </span>
                  </div>
                  <div style={{fontSize:12,color:'var(--text)',marginBottom:4}}>{p.description}</div>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',display:'flex',gap:12,flexWrap:'wrap'}}>
                    <span>Used: {p.uses_count||0}{p.max_uses>0?`/${p.max_uses}`:''}</span>
                    {p.expires_at&&<span>Expires: {new Date(p.expires_at).toLocaleDateString()}</span>}
                    <span>By @{p.created_by}</span>
                  </div>
                </div>
                <div style={{display:'flex',gap:8,flexShrink:0}}>
                  <button onClick={()=>toggle(p.code,!p.active)}
                    style={{background:p.active?'rgba(240,80,80,.1)':'rgba(127,218,150,.1)',border:`1px solid ${p.active?'rgba(240,80,80,.3)':'rgba(127,218,150,.3)'}`,borderRadius:7,color:p.active?'#f05050':'#7fda96',cursor:'pointer',padding:'6px 12px',fontSize:11,fontWeight:700}}>
                    {p.active?'Disable':'Enable'}
                  </button>
                  <button onClick={()=>remove(p.code)}
                    style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',padding:'6px',fontSize:16,opacity:.5}}
                    onMouseEnter={e=>{e.currentTarget.style.color='#f05050';e.currentTarget.style.opacity='1';}}
                    onMouseLeave={e=>{e.currentTarget.style.color='var(--muted)';e.currentTarget.style.opacity='.5';}}>
                    🗑
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SettingsTab({onReload,superuserName}){
  const[depts,setDepts]=useState([]);const[types,setTypes]=useState([]);
  const[deptForm,setDeptForm]=useState({name:'',short_code:'',color:'#4f9cf9'});
  const[typeForm,setTypeForm]=useState({label:'',short_code:'',role_key:'user',color:'#4f9cf9',description:''});
  const[msg,setMsg]=useState('');const[section,setSection]=useState('depts');
  const[subCfg,setSubCfg]=useState({});const[subEdits,setSubEdits]=useState({});const[subSaving,setSubSaving]=useState(false);
  const flash=m=>{setMsg(m);setTimeout(()=>setMsg(''),3000);};

  const loadAll=async()=>{
    const[{data:d},{data:t},{data:sc}]=await Promise.all([
      supabase.from('departments').select('*').order('name'),
      supabase.from('user_types').select('*').order('created_at'),
      supabase.from('subscription_config').select('*'),
    ]);
    setDepts(d||[]);setTypes(t||[]);
    const cfg={};(Array.isArray(sc)?sc:[]).forEach(r=>{cfg[r.key]=r.value;});
    setSubCfg(cfg);setSubEdits(cfg);
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
        <div><div style={{color:'#f9a84f',fontSize:13,fontWeight:600,marginBottom:2}}>Platform Settings</div><div style={{color:'var(--muted)',fontSize:12}}>Every setting here is live — changes apply immediately for all users across StudyHub.</div></div>
      </div>
      {msg&&<div className="slide-down" style={{background:'rgba(127,218,150,.08)',border:'1px solid rgba(127,218,150,.3)',borderRadius:8,padding:'9px 14px',color:'#7fda96',fontSize:12,marginBottom:14}}>{msg}</div>}

      {/* Sub-tabs */}
      <div style={{display:'flex',gap:4,borderBottom:'1px solid var(--border)',marginBottom:20}}>
        {[{id:'depts',label:'🏫 Departments'},{id:'types',label:'👥 User Types'},{id:'subscription',label:'💳 Subscription'},{id:'promos',label:'🏷 Promo Codes'}].map(t=>(
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

      {/* SUBSCRIPTION CONFIG */}
      {section==='subscription'&&(
        <div className="fade-in">
          <div style={{background:'rgba(249,168,79,.06)',border:'1px solid rgba(249,168,79,.2)',borderRadius:10,padding:'11px 15px',marginBottom:18}}>
            <div style={{color:'#f9a84f',fontSize:13,fontWeight:600,marginBottom:2}}>💳 Subscription & Payment Settings</div>
            <div style={{color:'var(--muted)',fontSize:12}}>Only you can change these. Students see updates immediately.</div>
          </div>
          {[
            {key:'free_ai_messages_per_month', label:'Free tier AI messages / month',       type:'number', hint:'AI messages free users get per month. Default: 5'},
            {key:'max_focus_tasks',              label:'Max focus list tasks per user',      type:'number', hint:'Max items in Focus List widget. Default: 3'},
            {key:'max_community_posts',          label:'Max community posts per user/day',   type:'number', hint:'Spam guard for Community tab. 0 = unlimited. Default: 5'},
            {key:'pro_price_1month',             label:'Premium — 1 month (₦)',              type:'number', hint:'30 days access. Recommended: ₦300–₦500'},
            {key:'pro_price_semester',          label:'Premium — per semester (₦)',         type:'number', hint:'~5 months. Recommended: ₦500–₦1,000'},
            {key:'pro_price_yearly',            label:'Premium — full year (₦)',            type:'number', hint:'2 semesters. Recommended: ₦5,000'},
            {key:'referral_credit',             label:'Referral credit per friend (₦)',     type:'number', hint:'₦ credited to referrer per paying subscriber (default: ₦100)'},
            {key:'payment_account_name',        label:'OPay account name',                  type:'text',   hint:'Name shown on the payment card'},
            {key:'payment_account_number',      label:'OPay account number',                type:'text',   hint:'Account number students copy to pay'},
            {key:'payment_bank',                label:'Bank name',                          type:'text',   hint:'e.g. OPay'},
            {key:'payment_whatsapp',            label:'WhatsApp verification link',         type:'text',   hint:'Full wa.me link e.g. https://wa.me/2348012345678'},
          ].map(f=>(
            <div key={f.key} style={{marginBottom:14}}>
              <div style={{fontSize:11,color:'var(--muted)',marginBottom:4,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>{f.label.toUpperCase()}</div>
              <input type={f.type} value={subEdits[f.key]??''} onChange={e=>setSubEdits(prev=>({...prev,[f.key]:e.target.value}))}
                style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 13px',color:'var(--text)',fontSize:13}}/>
              {f.hint&&<div style={{fontSize:10,color:'var(--muted)',marginTop:3}}>{f.hint}</div>}
            </div>
          ))}
          {/* Feature flags */}
          <div style={{marginBottom:18}}>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:8,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>FREE TIER FEATURE FLAGS</div>
            {[
              {key:'free_community_posting',label:'Allow community posting on Free tier'},
              {key:'free_all_years',        label:'Free tier sees all years (no year gating)'},
            ].map(f=>{
              const val=(subEdits[f.key]??subCfg[f.key]??'false')==='true';
              return(
                <div key={f.key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'var(--surface)',borderRadius:8,marginBottom:8}}>
                  <span style={{fontSize:13,color:'var(--text)'}}>{f.label}</span>
                  <button onClick={()=>setSubEdits(prev=>({...prev,[f.key]:val?'false':'true'}))}
                    style={{background:val?'rgba(127,218,150,.15)':'var(--input-bg)',border:`1px solid ${val?'rgba(127,218,150,.4)':'var(--border)'}`,borderRadius:20,color:val?'#7fda96':'var(--muted)',cursor:'pointer',padding:'4px 14px',fontSize:12,fontWeight:600,minWidth:52}}>
                    {val?'ON':'OFF'}
                  </button>
                </div>
              );
            })}
          </div>
          <button onClick={async()=>{
            setSubSaving(true);
            await Promise.all(Object.entries(subEdits).map(([key,value])=>
              supabase.from('subscription_config').upsert({key,value,updated_by:superuserName,updated_at:new Date().toISOString()},{onConflict:'key'})
            ));
            await loadAll();
            flash('✓ Subscription settings saved.');
            setSubSaving(false);
          }} disabled={subSaving} style={{background:'#f9a84f',border:'none',borderRadius:8,color:'#000',cursor:'pointer',padding:'10px 22px',fontSize:13,fontWeight:700}}>
            {subSaving?'Saving…':'Save All Changes'}
          </button>
        </div>
      )}

      {/* ── PROMO CODES ── */}
      {section==='promos'&&<PromoCodesTab superuserName={superuserName}/>}
    </div>
  );
}

/* ═══════════════ USER ROW ═══════════════ */
/* ─── Subscription Manager — shown inside UserRow for superuser ─── */
function SubscriptionManager({u,onSaved,subCfg={}}){
  const[referredBy,setReferredBy]=useState('');
  const PLANS=[
    {id:'1month',  label:'1 Month',     months:1,  color:'#8892a4'},
    {id:'semester',label:'1 Semester',  months:5,  color:'#4f9cf9'},
    {id:'yearly',  label:'1 Year',      months:12, color:'#f9a84f'},
  ];

  const currentTier = u.subscription_tier||'free';
  const expiresAt   = u.sub_expires_at;
  const currentPlan = u.sub_plan;

  const[sel,setSel]=useState(currentPlan||'semester');
  const[saving,setSaving]=useState(false);
  const[saved,setSaved]=useState(false);

  const isExpired = expiresAt && new Date(expiresAt)<new Date();
  const daysLeft  = expiresAt
    ? Math.max(0,Math.ceil((new Date(expiresAt)-new Date())/(1000*60*60*24)))
    : null;

  const activate=async()=>{
    const plan=PLANS.find(p=>p.id===sel);if(!plan)return;
    setSaving(true);
    const expires=new Date();
    expires.setMonth(expires.getMonth()+plan.months);
    await dbSetUserTier(u.username,'pro',expires.toISOString(),plan.id);
    // Credit the referrer if a code was entered
    if(referredBy.trim()){
      try{
        const{data:allUsers}=await supabase.from('users').select('username');
        const codeMap=(allUsers||[]).reduce((acc,row)=>({...acc,[genReferralCode(row.username)]:row.username}),{});
        const referrerUsername=codeMap[referredBy.trim().toUpperCase()];
        if(referrerUsername&&referrerUsername!==u.username){
          const{data:ref}=await supabase.from('users').select('referral_credits').eq('username',referrerUsername).single();
          const cur=ref?.referral_credits||0;
          const creditAmt=parseInt(subCfg?.referral_credit||'100');
          await supabase.from('users').update({referral_credits:cur+creditAmt}).eq('username',referrerUsername);
        }
      }catch(e){console.error('referral credit:',e);}
    }
    setSaved(true);setSaving(false);
    setTimeout(()=>setSaved(false),2500);
    onSaved?.();
  };

  const revoke=async()=>{
    setSaving(true);
    await dbSetUserTier(u.username,'free',null,null);
    setSaving(false);onSaved?.();
  };

  return(
    <div style={{background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:10,padding:'12px 14px'}}>

      {/* Current status */}
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10,flexWrap:'wrap'}}>
        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,letterSpacing:.5,
          background:currentTier==='pro'?'rgba(249,168,79,.15)':'var(--border)',
          color:currentTier==='pro'?'#f9a84f':'var(--muted)',
          border:`1px solid ${currentTier==='pro'?'rgba(249,168,79,.4)':'transparent'}`,
          borderRadius:5,padding:'2px 8px',fontWeight:700}}>
          {currentTier==='pro'?'⭐ PRO':'🎓 FREE'}
        </span>
        {currentTier==='pro'&&expiresAt&&(
          <span style={{fontSize:10,color:isExpired?'#f05050':daysLeft<=14?'#f9a84f':'var(--muted)'}}>
            {isExpired
              ?'⚠ Expired '+new Date(expiresAt).toLocaleDateString()
              :`Expires ${new Date(expiresAt).toLocaleDateString()} · ${daysLeft}d left`}
          </span>
        )}
        {currentTier==='pro'&&!expiresAt&&(
          <span style={{fontSize:10,color:'var(--muted)'}}>No expiry set</span>
        )}
      </div>

      {/* Plan selector */}
      <div style={{marginBottom:10}}>
        <div style={{fontSize:9,color:'var(--muted)',fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1,marginBottom:6}}>
          {currentTier==='pro'?'EXTEND / CHANGE PLAN':'ACTIVATE PRO — SELECT PLAN'}
        </div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {PLANS.map(p=>(
            <button key={p.id} onClick={()=>setSel(p.id)}
              style={{padding:'6px 12px',borderRadius:8,fontSize:11,cursor:'pointer',fontWeight:sel===p.id?700:400,
                border:`1.5px solid ${sel===p.id?p.color:'var(--border)'}`,
                background:sel===p.id?`${p.color}14`:'transparent',
                color:sel===p.id?p.color:'var(--muted)',transition:'all .15s'}}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      {sel&&(()=>{
        const plan=PLANS.find(p=>p.id===sel);
        const exp=new Date();exp.setMonth(exp.getMonth()+plan.months);
        return(
          <div style={{fontSize:10,color:'var(--muted)',marginBottom:8,fontFamily:"'IBM Plex Mono',monospace"}}>
            → Pro until <span style={{color:plan.color,fontWeight:700}}>{exp.toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</span>
          </div>
        );
      })()}

      {/* Referred by */}
      <div style={{marginBottom:10}}>
        <div style={{fontSize:9,color:'var(--muted)',marginBottom:3,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:.5}}>REFERRED BY (optional — auto-credits referrer ₦100)</div>
        <input value={referredBy} onChange={e=>setReferredBy(e.target.value.toUpperCase())} placeholder="e.g. SHXYZ12"
          style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:7,padding:'6px 10px',color:'var(--text)',fontSize:11,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}/>
      </div>

      {/* Action buttons */}
      <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
        <button onClick={activate} disabled={saving||saved}
          style={{background:saved?'rgba(127,218,150,.15)':'rgba(79,156,249,.12)',border:`1px solid ${saved?'rgba(127,218,150,.4)':'rgba(79,156,249,.3)'}`,
            borderRadius:8,color:saved?'#7fda96':'#4f9cf9',cursor:saving||saved?'default':'pointer',
            padding:'7px 14px',fontSize:11,fontWeight:700}}>
          {saving?'Saving…':saved?'✓ Saved!':currentTier==='pro'?'Update Plan':'Activate Pro'}
        </button>
        {currentTier==='pro'&&(
          <button onClick={revoke} disabled={saving}
            style={{background:'rgba(240,80,80,.08)',border:'1px solid rgba(240,80,80,.25)',borderRadius:8,
              color:'#f05050',cursor:saving?'default':'pointer',padding:'7px 14px',fontSize:11,fontWeight:600}}>
            Revoke Pro
          </button>
        )}
      </div>
    </div>
  );
}

function UserRow({u,role,isAdm,isSU2,onRoleChange,onAdminToggle,onYearChange,isOnline=false}){
  const[expanded,setExpanded]=useState(false);
  const[busy,setBusy]=useState('');
  const[localYear,setLocalYear]=useState(u.year||1);
  const[localAccountType,setLocalAccountType]=useState(u.account_type||'student');
  // Sync local state when the user prop changes (sort/filter re-uses component instances)
  useEffect(()=>{setLocalYear(u.year||1);setLocalAccountType(u.account_type||'student');},[u.username,u.year,u.account_type]);
  const accentColor=ROLE_COLOR[role]||ROLE_COLOR.user;

  const doRoleChange=async(accountType)=>{
    setBusy('role');
    await onRoleChange(accountType);
    setLocalAccountType(accountType);
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

  const isExternal=localAccountType==='external';

  return(
    <div style={{background:'var(--surface)',border:`1px solid ${expanded?accentColor+'40':'var(--border)'}`,borderRadius:10,overflow:'hidden',transition:'border-color .2s'}}>
      {/* Row summary */}
      <div style={{padding:'12px 16px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',cursor:isSU2?'pointer':'default'}} onClick={()=>isSU2&&setExpanded(e=>!e)}>
        <button onClick={e=>{e.stopPropagation();navigator.clipboard?.writeText(u.username);}}
          title={`Copy @${u.username}`} style={{background:'none',border:'none',cursor:'pointer',padding:0,flexShrink:0,position:'relative'}}>
          <Avatar name={u.display_name||u.username}/>
          {isOnline&&<div style={{position:'absolute',bottom:1,right:1,width:8,height:8,borderRadius:'50%',background:'#7fda96',border:'2px solid var(--surface)'}}/>}
        </button>
        <div style={{flex:1,minWidth:130}}>
          <div style={{fontSize:14,color:'var(--text)',fontWeight:500}}>{u.display_name||u.username}</div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginTop:2}}>
            @{u.username} · {u.created_at?new Date(u.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'}):'—'}
          </div>
        </div>
        <RolePill role={isAdm?ROLE.ADMIN:isExternal?ROLE.EXTERNAL:ROLE.USER} accountType={localAccountType}/>
        <SubscriptionBadge tier={u.subscription_tier||'free'} role={isAdm?ROLE.ADMIN:isExternal?ROLE.EXTERNAL:ROLE.USER} expiresAt={u.sub_expires_at}/>
        {!isExternal&&localYear>0&&(
          <div style={{background:YEAR_BG[localYear]||'transparent',border:`1px solid ${YEAR_COLORS[localYear]||'var(--border)'}40`,borderRadius:5,padding:'3px 9px'}}>
            <Mono color={YEAR_COLORS[localYear]||'var(--muted)'} size={9}>Yr {localYear}</Mono>
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

          {/* Subscription management — superuser only */}
          {isSU2&&(
            <div>
              <div style={{fontSize:11,color:'var(--muted)',marginBottom:8,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>SUBSCRIPTION</div>
              <SubscriptionManager u={u} subCfg={subCfg} onSaved={async()=>{
                const[users,adms]=await Promise.all([dbLoadUsers(),dbLoadAdmins()]);
                setAllUsers(users);setAdmins(adms);
              }}/>
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
function AdminPanel({user,courses,onClose,onCoursesChange,onlineUsers=new Set()}){
  const isSU2=user.role===ROLE.SUPERUSER;
  const[subCfg,setSubCfg]=useState({});
  const[tab,setTab]=useState('courses');const[allUsers,setAllUsers]=useState([]);const[admins,setAdmins]=useState([]);const[filterY,setFilterY]=useState(0);const[filterSem,setFilterSem]=useState(0);const[filterDept,setFilterDept]=useState('all');const[showUpload,setShowUpload]=useState(false);const[search,setSearch]=useState('');const[pendingCount,setPendingCount]=useState(0);const[statusPendingCount,setStatusPendingCount]=useState(0);const[actionMsg,setActionMsg]=useState('');
  const[selectedUsers,setSelectedUsers]=useState(new Set());
  const[bulkAction,setBulkAction]=useState('');const[bulkBusy,setBulkBusy]=useState(false);
  const[userSort,setUserSort]=useState('recent'); // 'recent'|'name'|'year'|'tier'
  const[courseSort,setCourseSort]=useState('year'); // 'year'|'recent'|'name'
  const[deleteConfirm,setDeleteConfirm]=useState(null); // username to delete

  useEffect(()=>{
    Promise.all([dbLoadUsers(),dbLoadAdmins(),dbLoadSubConfig()]).then(([u,a,sc])=>{setAllUsers(u);setAdmins(a);setSubCfg(sc||{});});
    if(isSU2)dbCountPending().then(setPendingCount);
    dbCountPendingStatusRequests().then(setStatusPendingCount);
  },[]);

  const flash=m=>{setActionMsg(m);setTimeout(()=>setActionMsg(''),3000);};

  // Bulk action handler
  const doBulkAction=async()=>{
    if(!bulkAction||selectedUsers.size===0)return;
    setBulkBusy(true);
    const usernames=[...selectedUsers];
    try{
      if(bulkAction==='make_pro'){
        // Set pro with 1-semester default when bulk-setting (superuser can refine per user)
        const defExp=new Date();defExp.setMonth(defExp.getMonth()+5);
        await Promise.all(usernames.map(u=>dbSetUserTier(u,'pro',defExp.toISOString(),'semester')));
        flash(`✓ Set ${usernames.length} user(s) to Pro (semester plan)`);
      }else if(bulkAction==='make_free'){
        await Promise.all(usernames.map(u=>dbSetUserTier(u,'free')));
        flash(`✓ Set ${usernames.length} user(s) to Free`);
      }else if(bulkAction==='make_admin'){
        const current=await dbLoadAdmins();
        const combined=[...new Set([...current,...usernames])];
        await dbSetAdmins(combined);
        flash(`✓ Made ${usernames.length} user(s) admin`);
      }else if(bulkAction==='remove_admin'){
        const current=await dbLoadAdmins();
        await dbSetAdmins(current.filter(a=>!usernames.includes(a)));
        flash(`✓ Removed admin from ${usernames.length} user(s)`);
      }else if(bulkAction==='year_1'||bulkAction==='year_2'||bulkAction==='year_3'||bulkAction==='year_4'){
        const yr=parseInt(bulkAction.split('_')[1]);
        await Promise.all(usernames.map(u=>supabase.from('users').update({year:yr}).eq('username',u)));
        flash(`✓ Set ${usernames.length} user(s) to Year ${yr}`);
      }
      const[u,a]=await Promise.all([dbLoadUsers(),dbLoadAdmins()]);
      setAllUsers(u);setAdmins(a);
      setSelectedUsers(new Set());setBulkAction('');
    }catch(e){flash('Error: '+e.message);}
    setBulkBusy(false);
  };

  // Admins submit for approval; superuser acts directly
  const doDelete=async id=>{
    // Use shConfirm if available, otherwise native confirm as reliable fallback
    let ok;
    if(typeof window.shConfirm==='function'){
      ok=await window.shConfirm({
        title:isSU2?'Delete course permanently?':'Submit deletion request?',
        message:isSU2?'This course and all its data will be permanently removed. This cannot be undone.':'Your deletion request will be sent to the superuser for approval.',
        danger:true,
        confirmLabel:isSU2?'Delete':'Submit Request'
      });
    } else {
      ok=window.confirm(isSU2?'Delete this course permanently?':'Submit deletion request for superuser approval?');
    }
    if(!ok)return;
    try{
      if(isSU2){
        await dbDeleteCourse(id);
        const idx=await dbLoadCourseIndex();
        onCoursesChange(idx);
        flash('✓ Course deleted.');
      } else {
        const c=courses.find(x=>x.id===id);
        await dbSubmitPending('delete_course',user.username,{id,chapterTitle:c?.chapterTitle,courseName:c?.courseName});
        flash('✓ Deletion request submitted — awaiting superuser approval.');
      }
    }catch(e){flash('Error: '+e.message);}
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
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
              <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:'var(--text)',margin:0}}>Manage StudyHub</h2>
              <button onClick={()=>{
                Promise.all([dbLoadUsers(),dbLoadAdmins(),dbLoadSubConfig()]).then(([u,a,sc])=>{setAllUsers(u);setAdmins(a);setSubCfg(sc||{});});
                if(isSU2){dbCountPending().then(setPendingCount);dbCountPendingStatusRequests().then(setStatusPendingCount);}
              }} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'6px 14px',fontSize:12,display:'flex',alignItems:'center',gap:5}}>
                ↻ Refresh
              </button>
            </div>
            {!isSU2&&<p style={{fontSize:12,color:'var(--muted)',marginTop:5}}>Your course & resource actions require superuser approval before taking effect.</p>}
          </div>
          <button onClick={onClose} style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'9px 18px',fontSize:13}}>← Back</button>
        </div>

        {actionMsg&&<div className="slide-down" style={{background:'rgba(127,218,150,.08)',border:'1px solid rgba(127,218,150,.3)',borderRadius:8,padding:'10px 16px',color:'#7fda96',fontSize:13,marginBottom:18}}>{actionMsg}</div>}

        {/* Stats */}
        <div className="stagger-1" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:10,marginBottom:24}}>
          {(()=>{const proU=allUsers.filter(u=>(u.subscription_tier||'free')==='pro').length;return[{label:'Courses',val:courses.length,color:'#4f9cf9'},{label:'Avg Q&A',val:courses.length?Math.round(courses.reduce((a,c)=>a+(c.qCount||0),0)/courses.length):0,color:'#4f9cf9'},{label:'Total Users',val:allUsers.length,color:'#7fda96'},{label:'⭐ Pro',val:proU,color:'#f9a84f',pct:allUsers.length?Math.round(proU/allUsers.length*100):0},{label:'Free',val:allUsers.length-proU,color:'#8892a4',pct:allUsers.length?Math.round((allUsers.length-proU)/allUsers.length*100):0},{label:'Admins',val:admins.length,color:'#da7ff0'},...(isSU2&&pendingCount>0?[{label:'⚡ Pending',val:pendingCount,color:'#f9a84f'}]:[]),{label:'Online Now',val:onlineUsers.size,color:'#7fda96'},...YEARS.map(y=>({label:`Year ${y}`,val:courses.filter(c=>c.year===y).length,color:YEAR_COLORS[y]}))];})().map((s,i)=>(
            <div key={i} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'14px 16px'}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:22,color:s.color,fontWeight:700}}>{s.val}</div>
              <div style={{fontSize:11,color:'var(--muted)',marginTop:3}}>{s.label}</div>
              {s.pct!=null&&<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:s.color,opacity:.55,marginTop:1}}>{s.pct}%</div>}
            </div>
          ))}
        </div>

        <div style={{display:'flex',gap:4,borderBottom:'1px solid var(--border)',marginBottom:22,flexWrap:'wrap'}}>
          {pTabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{background:tab===t.id?'rgba(249,168,79,.06)':'none',border:'none',borderBottom:tab===t.id?'2px solid #f9a84f':'2px solid transparent',color:tab===t.id?'#f9a84f':'var(--muted)',cursor:'pointer',padding:'9px 16px',fontSize:13,letterSpacing:.2,fontWeight:tab===t.id?600:400,display:'flex',alignItems:'center',gap:6}}>
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
              <select value={courseSort} onChange={e=>setCourseSort(e.target.value)}
                style={{background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:7,color:'var(--text)',padding:'5px 10px',fontSize:11,marginLeft:'auto'}}>
                <option value="year">By Year</option>
                <option value="recent">Newest first</option>
                <option value="name">A → Z</option>
                <option value="questions">Most questions</option>
                <option value="concepts">Most concepts</option>
              </select>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              {filtered.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:40,border:'1px dashed var(--border)',borderRadius:12}}>No courses found. Try adjusting your filters or check back later.</div>}
              {[...filtered].sort((a,b)=>{
                if(courseSort==='recent') return new Date(b.addedAt||0)-new Date(a.addedAt||0);
                if(courseSort==='name') return(a.chapterTitle||'').localeCompare(b.chapterTitle||'');
                if(courseSort==='questions') return(b.qCount||0)-(a.qCount||0);
          if(courseSort==='concepts') return(b.conceptCount||0)-(a.conceptCount||0);
                return(a.year-b.year)||((a.semester||1)-(b.semester||1));
              }).map(c=>(
                <div key={c.id} className="fade-in" style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'13px 17px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                  <div style={{display:'flex',flexDirection:'column',gap:4}}>
                    <div style={{background:YEAR_BG[c.year],border:`1px solid ${YEAR_COLORS[c.year]}40`,borderRadius:5,padding:'3px 9px'}}><Mono color={YEAR_COLORS[c.year]} size={9}>Yr {c.year}</Mono></div>
                    <div style={{background:'rgba(79,156,249,.1)',border:'1px solid rgba(79,156,249,.3)',borderRadius:5,padding:'3px 9px'}}><Mono color="#4f9cf9" size={9}>Sem {c.semester||1}</Mono></div>
                    <div style={{background:`${DEPT_COLOR[c.department]||'#4f9cf9'}12`,border:`1px solid ${DEPT_COLOR[c.department]||'#4f9cf9'}30`,borderRadius:5,padding:'3px 9px'}}><Mono color={DEPT_COLOR[c.department]||'#4f9cf9'} size={9}>{DEPT_SHORT[c.department]||'CS'}</Mono></div>
                  </div>
                  <div style={{flex:1,minWidth:160}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)'}}>{c.courseName}</div>
            <div style={{fontSize:15,color:'var(--text)',marginTop:2,fontWeight:500}}>{c.chapterTitle}</div>
            {c.addedAt&&<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:'var(--muted)',marginTop:2,opacity:.6}}>Added {new Date(c.addedAt).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</div>}
          </div>
                  <div style={{display:'flex',gap:6}}><Tag color="#4f9cf9">{c.conceptCount} concepts</Tag><Tag color="#7fda96">{c.qCount} questions</Tag></div>
                  <button onClick={()=>doDelete(c.id)} title={isSU2?'Delete permanently':'Submit deletion request'} style={{background:'rgba(240,80,80,.1)',border:'1px solid rgba(240,80,80,.3)',borderRadius:6,color:'#f05050',cursor:'pointer',padding:'5px 12px',fontSize:11,flexShrink:0}}>{isSU2?'✕ Delete':'↑ Request Delete'}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='users'&&(
          <div className="fade-up">
            {isSU2&&<div style={{background:'rgba(249,168,79,.06)',border:'1px solid rgba(249,168,79,.2)',borderRadius:8,padding:'9px 14px',fontSize:12,color:'#f9a84f',marginBottom:14}}>
              ⚡ Superuser: expand a row to edit individually, or tick checkboxes for bulk actions.
              {onlineUsers.size>0&&<span style={{marginLeft:8,color:'#7fda96'}}>🟢 {onlineUsers.size} online now</span>}
            </div>}

            {/* Search + sort + select all */}
            <div style={{marginBottom:10,display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
              <SearchBar value={search} onChange={setSearch} placeholder="Search users…"/>
              {/* Sort */}
              {isSU2&&<button onClick={()=>{
                const csv=['Username,Display Name,Year,Type,Tier,Joined'].concat(allUsers.map(u=>`${u.username},${u.display_name||''},${u.year||''},${u.account_type||''},${u.subscription_tier||'free'},${u.created_at||''}`)).join('\n');
                const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);a.download='studyhub-users.csv';a.click();
              }} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:7,color:'var(--muted)',cursor:'pointer',padding:'7px 12px',fontSize:11,whiteSpace:'nowrap'}}>⬇ Export CSV</button>}
              <select value={userSort} onChange={e=>setUserSort(e.target.value)}
                style={{background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:7,color:'var(--text)',padding:'7px 10px',fontSize:11}}>
                <option value="recent">↓ Newest</option>
                <option value="name">A → Z</option>
                <option value="year">By Year</option>
                <option value="tier">By Tier</option>
              </select>
              {isSU2&&(
                <button onClick={()=>{
                  const filtered=allUsers.filter(u=>!search||u.username.toLowerCase().includes(search.toLowerCase()));
                  if(selectedUsers.size===filtered.length) setSelectedUsers(new Set());
                  else setSelectedUsers(new Set(filtered.map(u=>u.username)));
                }} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:7,color:'var(--muted)',cursor:'pointer',padding:'7px 12px',fontSize:11,whiteSpace:'nowrap'}}>
                  {selectedUsers.size>0?`✓ ${selectedUsers.size} selected`:'Select All'}
                </button>
              )}
              <Mono color="var(--muted)" size={9}>{allUsers.filter(u=>!search||u.username.toLowerCase().includes(search.toLowerCase())).length} USERS</Mono>
            </div>

            {/* Delete account confirm modal */}
            {deleteConfirm&&(
              <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setDeleteConfirm(null)}>
                <div className="scale-in" style={{background:'var(--card)',border:'1px solid rgba(240,80,80,.4)',borderRadius:14,padding:'24px 26px',maxWidth:400,width:'100%',boxShadow:'var(--shadow)'}}>
                  <div style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#f05050',marginBottom:8}}>⚠️ Permanently Delete Account</div>
                  <p style={{fontSize:13,color:'var(--muted)',lineHeight:1.6,marginBottom:8}}>
                    You are about to permanently delete <strong style={{color:'var(--text)'}}>@{deleteConfirm}</strong>.
                  </p>
                  <div style={{background:'rgba(240,80,80,.06)',border:'1px solid rgba(240,80,80,.2)',borderRadius:8,padding:'10px 12px',fontSize:12,color:'#f05050',marginBottom:16,lineHeight:1.6}}>
                    This will delete: their account, all progress, notification history, votes, and status requests. This cannot be undone.
                  </div>
                  <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
                    <button onClick={()=>setDeleteConfirm(null)} style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'8px 16px',fontSize:13}}>Cancel</button>
                    <button onClick={async()=>{
                      await dbDeleteUser(deleteConfirm);
                      setDeleteConfirm(null);
                      const[u,a]=await Promise.all([dbLoadUsers(),dbLoadAdmins()]);
                      setAllUsers(u);setAdmins(a);
                      flash(`✓ Account @${deleteConfirm} permanently deleted.`);
                    }} style={{background:'rgba(240,80,80,.15)',border:'1px solid rgba(240,80,80,.4)',borderRadius:8,color:'#f05050',cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:700}}>
                      Delete Permanently
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bulk action toolbar — appears when users are selected */}
            {isSU2&&selectedUsers.size>0&&(
              <div className="slide-down" style={{background:'rgba(249,168,79,.08)',border:'1px solid rgba(249,168,79,.3)',borderRadius:10,padding:'10px 14px',marginBottom:14,display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                <span style={{fontSize:12,color:'#f9a84f',fontWeight:700,marginRight:4}}>
                  {selectedUsers.size} user{selectedUsers.size!==1?'s':''} selected
                </span>
                <select value={bulkAction} onChange={e=>setBulkAction(e.target.value)}
                  style={{background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:7,color:'var(--text)',padding:'6px 10px',fontSize:12,flex:1,minWidth:160}}>
                  <option value="">Choose action…</option>
                  <optgroup label="Subscription">
                    <option value="make_pro">⭐ Set to Pro</option>
                    <option value="make_free">🎓 Set to Free</option>
                  </optgroup>
                  <optgroup label="Admin">
                    <option value="make_admin">🛡 Make Admin</option>
                    <option value="remove_admin">Remove Admin</option>
                  </optgroup>
                  <optgroup label="Year">
                    <option value="year_1">Set Year 1</option>
                    <option value="year_2">Set Year 2</option>
                    <option value="year_3">Set Year 3</option>
                    <option value="year_4">Set Year 4</option>
                  </optgroup>
                </select>
                <button onClick={doBulkAction} disabled={!bulkAction||bulkBusy}
                  style={{background:bulkAction?'#f9a84f':'var(--border)',border:'none',borderRadius:7,color:bulkAction?'#000':'var(--muted)',cursor:bulkAction?'pointer':'not-allowed',padding:'7px 16px',fontSize:12,fontWeight:700}}>
                  {bulkBusy?'Applying…':'Apply'}
                </button>
                <button onClick={()=>{setSelectedUsers(new Set());setBulkAction('');}}
                  style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:18,padding:'0 4px',lineHeight:1}}>✕</button>
              </div>
            )}

            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              {(()=>{
                const filtered=allUsers.filter(u=>!search||u.username.toLowerCase().includes(search.toLowerCase())||u.display_name?.toLowerCase().includes(search.toLowerCase()));
                const sortedUsers=[...filtered].sort((a,b)=>{
                  if(userSort==='name') return(a.display_name||a.username).localeCompare(b.display_name||b.username);
                  if(userSort==='year') return(a.year||0)-(b.year||0);
                  if(userSort==='tier') return(b.subscription_tier==='pro'?1:0)-(a.subscription_tier==='pro'?1:0);
                  return new Date(b.created_at||0)-new Date(a.created_at||0); // recent first
                });
                if(sortedUsers.length===0)return(
                  <div style={{textAlign:'center',padding:'32px 16px',color:'var(--muted)',fontSize:13}}>
                    {search?<>No users match <strong style={{color:'var(--text)'}}>"{search}"</strong></>:'No users yet.'}
                  </div>
                );
                return sortedUsers.map((u,i)=>{
                const isAdm=admins.includes(u.username.toLowerCase());
                const role=isAdm?ROLE.ADMIN:u.account_type==='external'?ROLE.EXTERNAL:ROLE.USER;
                const isOnline=onlineUsers.has(u.username);
                const uTier=u.subscription_tier||'free';
                return(
                  <div key={u.username} style={{display:'flex',alignItems:'flex-start',gap:8}}>
                    {/* Checkbox */}
                    {isSU2&&(
                      <button onClick={()=>{
                        setSelectedUsers(prev=>{
                          const n=new Set(prev);
                          n.has(u.username)?n.delete(u.username):n.add(u.username);
                          return n;
                        });
                      }} style={{background:selectedUsers.has(u.username)?'rgba(79,156,249,.15)':'var(--surface)',border:`1px solid ${selectedUsers.has(u.username)?'#4f9cf9':'var(--border)'}`,borderRadius:5,cursor:'pointer',width:28,height:28,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,marginTop:2}}>
                        {selectedUsers.has(u.username)?'✓':''}
                      </button>
                    )}
                    {/* Online dot */}
                    {isSU2&&<span title={isOnline?'Online now':'Offline'} style={{width:8,height:8,borderRadius:'50%',background:isOnline?'#7fda96':'var(--border)',flexShrink:0,marginTop:10,border:`1px solid ${isOnline?'rgba(127,218,150,.5)':'transparent'}`}}/>}
                    <div style={{flex:1}}>
                      <UserRow u={u} role={role} isAdm={isAdm} isSU2={isSU2} isOnline={onlineUsers?.has(u.username)}
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
                    </div>
                    {/* Delete button — superuser only */}
                    {isSU2&&u.username!==user.username&&(
                      <button onClick={()=>setDeleteConfirm(u.username)} title="Permanently delete account"
                        style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:14,padding:'8px 4px',flexShrink:0,opacity:.4,lineHeight:1}}
                        onMouseEnter={e=>{e.currentTarget.style.color='#f05050';e.currentTarget.style.opacity='1';}}
                        onMouseLeave={e=>{e.currentTarget.style.color='var(--muted)';e.currentTarget.style.opacity='.4';}}>
                        🗑
                      </button>
                    )}
                  </div>
                );
              });
              })()}
              {allUsers.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:40,border:'1px dashed var(--border)',borderRadius:12}}>No users yet.</div>}
            </div>

          </div>
        )}

        {tab==='analytics'&&<AnalyticsTab courses={courses}/>}
        {tab==='status'&&<StatusChangesTab reviewerUsername={user.username}/>}
        {tab==='approvals'&&isSU2&&<ApprovalsTab onCourseChange={onCoursesChange} courses={courses} reviewerUsername={user.username}/>}
        {tab==='admins'&&isSU2&&<ManageAdminsTab/>}
        {tab==='settings'&&isSU2&&<SettingsTab onReload={()=>onCoursesChange([...courses])} superuserName={user.username}/>}
      </div>
      {showUpload&&(
        isSU2
          ? <UploadModal courses={courses} onClose={()=>setShowUpload(false)} onDone={idx=>{onCoursesChange(idx);setShowUpload(false);}}/>
          : <UploadModal courses={courses} onClose={()=>setShowUpload(false)} onDone={async(idx,entry,courseData)=>{
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
              ℹ️ Your request will be reviewed by an admin. You will keep your current access until approved. You cannot submit another request while one is pending.
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
  const[histSort,setHistSort]=useState('newest');
  const[histFilter,setHistFilter]=useState('all');

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

  // Sort and filter the list
  const list=useMemo(()=>{
    const base=tab==='pending'?pending:history;
    let filtered=histFilter==='all'?base:base.filter(a=>a.action_type===histFilter);
    return [...filtered].sort((a,b)=>{
      if(histSort==='oldest') return new Date(a.requested_at)-new Date(b.requested_at);
      if(histSort==='type') return a.action_type.localeCompare(b.action_type);
      return new Date(b.requested_at)-new Date(a.requested_at); // recent first
    });
  },[tab,pending,history,histSort,histFilter]);

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
        {list.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:40,border:'1px dashed var(--border)',borderRadius:12,fontSize:13}}>{tab==='pending'?'✅ No pending requests.':'No reviewed actions yet — approvals and rejections will show here.'}</div>}
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
  const isNew=c.addedAt&&(new Date()-new Date(c.addedAt))<7*24*60*60*1000;
  return(
    <div className={`stagger-${Math.min(i%4+1,4)}`}
      onClick={()=>onSelect(c.id)}
      onContextMenu={e=>{e.preventDefault();if(typeof toggleBookmark==='function')toggleBookmark(c.id);}}
      title="Right-click / long press to bookmark"
      style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,padding:'20px 22px',
        cursor:'pointer',transition:'transform .18s,box-shadow .18s',willChange:'transform',
        borderTop:`3px solid ${accent}`,position:'relative',boxShadow:'none'}}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,.2)';}}
      onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>
      {/* Top-right badges */}
      <div style={{position:'absolute',top:14,right:14,display:'flex',gap:6,alignItems:'center'}}>
        {isNew&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,background:'rgba(127,218,150,.9)',color:'#000',borderRadius:3,padding:'2px 7px',letterSpacing:.5,fontWeight:700}}>NEW</span>}
        {viewed&&<div style={{width:8,height:8,borderRadius:'50%',background:'#7fda96'}} title="Visited"/>}
        {bookmarked&&<span style={{fontSize:13}}>🔖</span>}
      </div>
      {/* Course code + semester + dept */}
      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:accent,letterSpacing:1.5,textTransform:'uppercase',marginBottom:6,display:'flex',alignItems:'center',gap:7,flexWrap:'wrap'}}>
        <span style={{fontWeight:700}}>{c.courseName}</span>
        <span style={{opacity:.6}}>·</span>
        <span>Sem {c.semester}</span>
        <span style={{background:`${DEPT_COLOR[c.department]||'#4f9cf9'}20`,color:DEPT_COLOR[c.department]||'#4f9cf9',borderRadius:4,padding:'1px 7px',fontSize:9,letterSpacing:.5}}>{DEPT_SHORT[c.department]||'CS'}</span>
      </div>
      {/* Chapter title — bigger, easier to read */}
      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'var(--text)',marginBottom:12,lineHeight:1.35,paddingRight:28,fontWeight:400}}>{c.chapterTitle}</div>
      {/* Stats row */}
      <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:10}}>
        <Tag color={accent}>{c.conceptCount} concepts</Tag>
        <Tag color={accent}>{c.termCount} terms</Tag>
        <Tag color={accent}>{c.qCount} Q&amp;A</Tag>
      </div>
      {/* Progress */}
      {!isPriv&&(
        <div style={{marginTop:8}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',letterSpacing:.5}}>PROGRESS</span>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:pct===100?'#7fda96':accent}}>{pct===100?'✓ Complete':`${pct}%`}</span>
          </div>
          <div style={{height:3,background:'var(--border)',borderRadius:2}}>
            <div style={{height:'100%',width:`${pct}%`,background:pct===100?'#7fda96':accent,borderRadius:2,transition:'width .5s ease'}}/>
          </div>
        </div>
      )}
      {/* Added date */}
      {c.addedAt&&<div style={{marginTop:8,fontSize:10,color:'var(--muted)',fontFamily:"'IBM Plex Mono',monospace",opacity:.55}}>Added {new Date(c.addedAt).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</div>}
    </div>
  );
});

/* ═══════════════ STUDY TOOLS ═══════════════ */
function StudyTools({user,subCfg={}}){
  const storageKey = user?.username ? `sh-studytools-${user.username}` : 'sh-studytools-guest';
  const padKey     = user?.username ? `sh-scratchpad-${user.username}` : 'sh-scratchpad-guest';

  // Load persisted state
  const[open,setOpen]=useState(()=>{
    try{return localStorage.getItem(storageKey+'-open')!=='false';}catch{return true;}
  });
  const[tasks,setTasks]=useState(()=>{
    try{return JSON.parse(localStorage.getItem(storageKey))||[];}catch{return [];}
  });
  const[input,setInput]=useState('');
  const[pad,setPad]=useState(()=>{
    try{return localStorage.getItem(padKey)||'';}catch{return '';}
  });
  const[activePanel,setActivePanel]=useState('tasks'); // 'tasks' | 'pad' | 'pomodoro'

  // Study streak — increment once per calendar day
  const streakKey=user?.username?`sh-streak-${user.username}`:'sh-streak-guest';
  const[streak,setStreak]=useState(()=>{
    try{
      const s=JSON.parse(localStorage.getItem(streakKey)||'{}');
      const today=new Date().toDateString();
      // If last study day was yesterday or today, streak is valid
      const last=s.lastDay?new Date(s.lastDay):null;
      const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
      if(!last) return{count:0,lastDay:null};
      if(s.lastDay===today) return s;
      if(last.toDateString()===yesterday.toDateString()) return s; // will increment on activity
      return{count:0,lastDay:null}; // streak broken
    }catch{return{count:0,lastDay:null};}
  });

  // Increment streak when panel opens (counts as a study session)
  useEffect(()=>{
    if(!open) return;
    const today=new Date().toDateString();
    setStreak(prev=>{
      if(prev.lastDay===today) return prev; // already counted today
      const newStreak={count:(prev.lastDay?prev.count:0)+1,lastDay:today};
      try{localStorage.setItem(streakKey,JSON.stringify(newStreak));}catch{}
      return newStreak;
    });
  },[open]);

  // Pomodoro state
  const[pomMode,setPomMode]=useState('work'); // 'work'|'break'
  const[pomRunning,setPomRunning]=useState(false);
  const[pomSecs,setPomSecs]=useState(25*60);
  // Session counter — how many 25-min focus blocks completed today
  const[pomLog,setPomLog]=useState(()=>{try{const s=JSON.parse(localStorage.getItem('sh-pom-log')||'{}');return s.date===new Date().toDateString()?s.count||0:0;}catch{return 0;}});
  const POM_WORK=25*60;const POM_BREAK=5*60;
  const pomRef=useRef(null);

  useEffect(()=>{
    if(pomRunning){
      pomRef.current=setInterval(()=>{
        setPomSecs(s=>{
          if(s<=1){
            clearInterval(pomRef.current);setPomRunning(false);
            const next=pomMode==='work'?'break':'work';
            if(pomMode==='work'){
              setPomLog(n=>{const newN=n+1;try{localStorage.setItem('sh-pom-log',JSON.stringify({date:new Date().toDateString(),count:newN}));}catch{} return newN;});
              // Vibrate + soft beep on work session complete
              try{if(navigator.vibrate)navigator.vibrate([200,100,200,100,400]);}catch{}
              try{const ac=new(window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator();const g=ac.createGain();o.connect(g);g.connect(ac.destination);o.frequency.value=660;o.type='sine';g.gain.setValueAtTime(0.25,ac.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.8);o.start();o.stop(ac.currentTime+0.8);}catch{}
            }
            setPomMode(next);setPomSecs(next==='work'?POM_WORK:POM_BREAK);
            pushNotification(next==='break'?'🍅 Break time!':'🍅 Back to work!',next==='break'?'Take a 5 minute break.':'25 minute focus session starting.');
            return 0;
          }
          return s-1;
        });
      },1000);
    }else{clearInterval(pomRef.current);}
    return()=>clearInterval(pomRef.current);
  },[pomRunning,pomMode]);

  const pomMins=String(Math.floor(pomSecs/60)).padStart(2,'0');
  const pomSec2=String(pomSecs%60).padStart(2,'0');
  const pomPct=(pomMode==='work'?(POM_WORK-pomSecs)/POM_WORK:(POM_BREAK-pomSecs)/POM_BREAK)*100;

  // Persist tasks
  useEffect(()=>{
    try{localStorage.setItem(storageKey,JSON.stringify(tasks));}catch{}
  },[tasks,storageKey]);

  // Persist open state
  useEffect(()=>{
    try{localStorage.setItem(storageKey+'-open',String(open));}catch{}
  },[open,storageKey]);

  const addTask=()=>{
    const t=input.trim();
    const maxT=parseInt(subCfg?.max_focus_tasks||'3');if(!t||tasks.length>=maxT)return;
    setTasks(prev=>[...prev,{id:Date.now(),text:t,done:false}]);
    setInput('');
  };

  const toggleTask=id=>setTasks(prev=>prev.map(t=>t.id===id?{...t,done:!t.done}:t));
  const deleteTask=id=>setTasks(prev=>prev.filter(t=>t.id!==id));

  const savePad=val=>{
    setPad(val);
    try{localStorage.setItem(padKey,val);}catch{}
  };

  const maxT=parseInt(subCfg?.max_focus_tasks||'3');const full=tasks.length>=maxT;

  return(
    <div style={{marginBottom:18}}>
      {/* Header toggle */}
      <button onClick={()=>setOpen(o=>!o)}
        style={{display:'flex',alignItems:'center',gap:8,background:'none',border:'none',cursor:'pointer',padding:'4px 0',width:'100%',textAlign:'left',marginBottom:open?10:0}}>
        <Mono color="var(--muted)" size={9}>STUDY TOOLS</Mono>
        {streak.count>0&&(
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'#f9a84f',background:'rgba(249,168,79,.1)',border:'1px solid rgba(249,168,79,.3)',borderRadius:10,padding:'1px 7px',marginLeft:4}}>
            🔥 {streak.count} day{streak.count!==1?'s':''} streak
          </span>
        )}
        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginLeft:'auto'}}>
          {open?'▲ hide':'▼ show'}
        </span>
      </button>

      {open&&(
        <div className="fade-in" style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:14,overflow:'hidden'}}>

          {/* Sub-tabs */}
          <div style={{display:'flex',borderBottom:'1px solid var(--border)'}}>
            {[{id:'tasks',label:'✅ Focus List'},{id:'pad',label:'📝 Scratchpad'},{id:'pomodoro',label:'🍅 Timer'}].map(p=>(
              <button key={p.id} onClick={()=>setActivePanel(p.id)}
                style={{flex:1,padding:'10px 4px',border:'none',borderBottom:activePanel===p.id?'2px solid #4f9cf9':'2px solid transparent',background:'none',color:activePanel===p.id?'#4f9cf9':'var(--muted)',cursor:'pointer',fontSize:11,fontWeight:activePanel===p.id?700:400,transition:'all .15s',whiteSpace:'nowrap'}}>
                {p.label}
              </button>
            ))}
          </div>

          {/* ── Top 3 Task List ── */}
          {activePanel==='tasks'&&(
            <div style={{padding:'14px 16px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                <div style={{fontSize:11,color:'var(--muted)',lineHeight:1.4}}>
                  Your 3 most important tasks for today.
                </div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:full?'#f9a84f':'var(--muted)',background:full?'rgba(249,168,79,.1)':'var(--border)',borderRadius:10,padding:'2px 8px',whiteSpace:'nowrap'}}>
                  {tasks.length}/3
                </div>
              </div>

              {/* Task list */}
              <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:12}}>
                {tasks.length===0&&(
                  <div style={{textAlign:'center',padding:'16px 0',color:'var(--muted)',fontSize:12,fontStyle:'italic'}}>
                    No tasks yet — add up to 3 below
                  </div>
                )}
                {tasks.map(t=>(
                  <div key={t.id} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',background:'var(--card)',borderRadius:9,border:'1px solid var(--border)',transition:'opacity .2s',opacity:t.done?.55:1}}>
                    {/* Custom checkbox */}
                    <button onClick={()=>toggleTask(t.id)}
                      style={{width:20,height:20,borderRadius:5,border:`2px solid ${t.done?'#7fda96':'var(--border)'}`,background:t.done?'rgba(127,218,150,.15)':'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .15s',padding:0}}>
                      {t.done&&<span style={{color:'#7fda96',fontSize:11,lineHeight:1}}>✓</span>}
                    </button>
                    {/* Task text */}
                    <span style={{flex:1,fontSize:13,color:'var(--text)',textDecoration:t.done?'line-through':'none',lineHeight:1.4,wordBreak:'break-word'}}>
                      {t.text}
                    </span>
                    {/* Delete */}
                    <button onClick={()=>deleteTask(t.id)}
                      style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:15,padding:'0 2px',lineHeight:1,flexShrink:0,opacity:.4}}
                      onMouseEnter={e=>e.currentTarget.style.opacity='1'}
                      onMouseLeave={e=>e.currentTarget.style.opacity='.4'}>
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Input row */}
              <div style={{display:'flex',gap:8}}>
                <input
                  value={input}
                  onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&addTask()}
                  disabled={full}
                  maxLength={80}
                  placeholder={full?'Complete or delete a task first…':'Add a task (Enter to save)…'}
                  style={{flex:1,background:full?'var(--border)':'var(--input-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'9px 12px',color:full?'var(--muted)':'var(--text)',fontSize:12,fontFamily:"'DM Sans',sans-serif",opacity:full?.6:1,cursor:full?'not-allowed':'text'}}
                />
                <button onClick={addTask} disabled={full||!input.trim()}
                  style={{background:full||!input.trim()?'var(--border)':'#4f9cf9',border:'none',borderRadius:8,color:full||!input.trim()?'var(--muted)':'#000',cursor:full||!input.trim()?'not-allowed':'pointer',padding:'9px 16px',fontSize:12,fontWeight:700,flexShrink:0,transition:'all .15s'}}>
                  Add
                </button>
              </div>

              {/* Clear completed + all-done hint */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:8}}>
                {tasks.some(t=>t.done)&&(
                  <button onClick={()=>{const kept=tasks.filter(t=>!t.done);setTasks(kept);try{localStorage.setItem(storageKey,JSON.stringify(kept));}catch{}}}
                    style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:11,textDecoration:'underline',padding:0}}>
                    Clear {tasks.filter(t=>t.done).length} completed
                  </button>
                )}
              </div>
              {tasks.length>0&&tasks.every(t=>t.done)&&(
                <div className="fade-in" style={{marginTop:8,textAlign:'center',padding:'10px',background:'rgba(127,218,150,.08)',border:'1px solid rgba(127,218,150,.2)',borderRadius:8,fontSize:12,color:'#7fda96',fontWeight:600}}>
                  🎉 All done! Clear your list to start fresh.
                </div>
              )}
            </div>
          )}

          {/* ── Scratchpad ── */}
          {activePanel==='pad'&&(
            <div style={{padding:'4px 0 0'}}>
              <textarea
                value={pad}
                onChange={e=>savePad(e.target.value)}
                placeholder="Quick notes, ideas, formulas… auto-saved as you type."
                style={{
                  display:'block',width:'100%',
                  minHeight:160,maxHeight:320,
                  background:'transparent',
                  border:'none',outline:'none',
                  resize:'vertical',
                  padding:'12px 16px',
                  color:'var(--text)',
                  fontSize:13,
                  lineHeight:1.75,
                  fontFamily:"'DM Sans',sans-serif",
                }}
              />
              {/* Footer: char count + clear */}
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:'var(--muted)',padding:'0 16px 2px',textAlign:'right',opacity:.45}}>{pad.length.toLocaleString()} chars</div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 16px 10px',borderTop:'1px solid var(--border)'}}>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:'var(--muted)',letterSpacing:.5}}>
                  {pad.length} chars · auto-saved
                </span>
                {pad&&(
                  <button onClick={()=>savePad('')}
                    style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:11,opacity:.5,textDecoration:'underline',padding:0}}
                    onMouseEnter={e=>e.currentTarget.style.opacity='1'}
                    onMouseLeave={e=>e.currentTarget.style.opacity='.5'}>
                    clear
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Pomodoro Timer ── */}
          {activePanel==='pomodoro'&&(
            <div style={{padding:'20px 16px',textAlign:'center'}}>
              {/* Mode label */}
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,letterSpacing:2,color:pomMode==='work'?'#f05050':'#7fda96',marginBottom:12,fontWeight:700}}>
                {pomMode==='work'?'FOCUS SESSION':'BREAK TIME'}
              </div>

              {/* Circular progress + timer */}
              <div style={{position:'relative',width:120,height:120,margin:'0 auto 16px'}}>
                <svg width="120" height="120" style={{transform:'rotate(-90deg)'}}>
                  <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="6"/>
                  <circle cx="60" cy="60" r="52" fill="none"
                    stroke={pomMode==='work'?'#f05050':'#7fda96'} strokeWidth="6"
                    strokeDasharray={`${2*Math.PI*52}`}
                    strokeDashoffset={`${2*Math.PI*52*(1-pomPct/100)}`}
                    strokeLinecap="round"
                    style={{transition:'stroke-dashoffset .9s linear'}}
                  />
                </svg>
                <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:24,fontWeight:700,color:'var(--text)',lineHeight:1}}>{pomMins}:{pomSec2}</div>
                  <div style={{fontSize:9,color:'var(--muted)',marginTop:3}}>{pomMode==='work'?'focus':'break'}</div>
                </div>
              </div>

              {/* Controls */}
              <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:12}}>
                <button onClick={()=>setPomRunning(r=>!r)}
                  style={{background:pomRunning?'rgba(240,80,80,.12)':'rgba(127,218,150,.12)',border:`1px solid ${pomRunning?'rgba(240,80,80,.3)':'rgba(127,218,150,.3)'}`,borderRadius:10,color:pomRunning?'#f05050':'#7fda96',cursor:'pointer',padding:'9px 22px',fontSize:13,fontWeight:700}}>
                  {pomRunning?'⏸ Pause':'▶ Start'}
                </button>
                <button onClick={()=>{setPomRunning(false);setPomMode('work');setPomSecs(POM_WORK);}}
                  style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,color:'var(--muted)',cursor:'pointer',padding:'9px 14px',fontSize:13}}>
                  ↺ Reset
                </button>
              </div>

              {/* Mode switcher */}
              <div style={{display:'flex',gap:6,justifyContent:'center'}}>
                {[{id:'work',label:'🔴 Focus 25m'},{id:'break',label:'🟢 Break 5m'}].map(m=>(
                  <button key={m.id} onClick={()=>{setPomRunning(false);setPomMode(m.id);setPomSecs(m.id==='work'?POM_WORK:POM_BREAK);}}
                    style={{background:pomMode===m.id?'var(--card)':'none',border:`1px solid ${pomMode===m.id?'var(--border)':'transparent'}`,borderRadius:8,color:pomMode===m.id?'var(--text)':'var(--muted)',cursor:'pointer',padding:'5px 12px',fontSize:10}}>
                    {m.label}
                  </button>
                ))}
              </div>

              <div style={{marginTop:10,fontSize:10,color:'var(--muted)',fontFamily:"'IBM Plex Mono',monospace",display:'flex',gap:16,justifyContent:'center'}}>
                <span>🔥 {streak.count} day{streak.count!==1?'s':''} streak</span>
                <span title="Completed focus sessions">🍅 {pomLog} session{pomLog!==1?'s':''} today</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════ HOME ═══════════════ */
function Home({user,courses,progress,onSelectCourse,onLogout,onShowAdmin,onProgressUpdate,bookmarks,toggleBookmark,dark,toggleTheme,onOpenCourseTab,onUserUpdate}){
  const[xp]=useXP(user?.username); // XP for badge in header
  const isExternal=user.role===ROLE.EXTERNAL;
  const[activeYear,setActiveYear]=useState(isExternal?'all':(user.year||1));
  const[activeSemester,setActiveSemester]=useState(1);
  const[activeDept,setActiveDept]=useState('all');
  const[deptOpen,setDeptOpen]=useState(false);
  const[searchRaw,setSearchRaw]=useState('');
  const[search,setSearch]=useState('');
  // Debounce: only update active search 300ms after typing stops
  useEffect(()=>{const t=setTimeout(()=>setSearch(searchRaw),300);return()=>clearTimeout(t);},[searchRaw]);
  const[showBookmarks,setShowBookmarks]=useState(false);
  const[showStatusModal,setShowStatusModal]=useState(false);
  const[showPWADebug,setShowPWADebug]=useState(false);
  const[showPayment,setShowPayment]=useState(false);
  const[showProfile,setShowProfile]=useState(false);
  const[copied,setCopied]=useState(false);
  const[subCfg,setSubCfg]=useState({});
  const[drawerOpen,setDrawerOpen]=useState(false);
  const[browseMode,setBrowseMode]=useState('year'); // 'year' | 'course'
  const nativePrompt=usePWAPrompt();
  const[statusMsg,setStatusMsg]=useState('');
  const isPriv=user.role===ROLE.SUPERUSER||user.role===ROLE.ADMIN;

  // Load subscription config for PaymentPortal
  useEffect(()=>{
    supabase.from('subscription_config').select('*').then(({data})=>{
      if(Array.isArray(data)){const cfg={};data.forEach(r=>{cfg[r.key]=r.value;});setSubCfg(cfg);}
    }).catch(()=>{});
  },[]);

  // Course code tiles data
  const courseCodes=useMemo(()=>{
    const map={};
    for(const c of courses){
      const code=normalizeCourseCode(c.courseName);
      if(!map[code]) map[code]={code,count:0,year:c.year,department:c.department,ids:[]};
      map[code].count++;map[code].ids.push(c.id);
    }
    return Object.values(map).sort((a,b)=>a.code.localeCompare(b.code));
  },[courses]);

  // Debounce search — input feels instant, filtering only runs after 150ms pause
  useEffect(()=>{
    const t=setTimeout(()=>setSearch(searchRaw),150);
    return()=>clearTimeout(t);
  },[searchRaw]);

  // Tier-based access: free users locked to their year unless free_all_years=true
  const isFreeUser=!user.isGuest&&user.role!==ROLE.SUPERUSER&&(user.subscription_tier||'free')==='free';
  const freeAllYears=(subCfg?.free_all_years||'false')==='true';
  const accessibleYears=useMemo(()=>{
    if(user.isGuest||!isFreeUser||freeAllYears) return null; // null = all years
    return new Set([user.year||1]);
  },[isFreeUser,freeAllYears,user.year,user.isGuest]);

  const visible=useMemo(()=>courses.filter(c=>{
    const matchYear=activeYear==='all'||c.year===activeYear;
    const matchSem=activeYear==='all'||c.semester===activeSemester;
    const matchDept=activeDept==='all'||c.department===activeDept;
    const lq=search.toLowerCase();
    const matchSearch=!search||c.chapterTitle.toLowerCase().includes(lq)||c.courseName.toLowerCase().includes(lq)||(c.department||"").toLowerCase().includes(lq)||(DEPT_SHORT[c.department]||"").toLowerCase().includes(lq)||String(c.year).includes(lq);
    const matchTier=!accessibleYears||accessibleYears.has(c.year);
    return matchYear&&matchSem&&matchDept&&matchSearch&&matchTier;
  }),[courses,activeYear,activeSemester,activeDept,search,accessibleYears]);

  const semCount=useCallback(s=>courses.filter(c=>(activeYear==='all'||c.year===activeYear)&&c.semester===s).length,[courses,activeYear]);
  const deptCount=useCallback(d=>courses.filter(c=>(activeYear==='all'||c.year===activeYear)&&(activeYear==='all'||c.semester===activeSemester)&&(d==='all'||c.department===d)).length,[courses,activeYear,activeSemester]);

  const bookmarkedCourses=useMemo(()=>courses.filter(c=>bookmarks.includes(c.id)),[courses,bookmarks]);
  const pct=useCallback(id=>{const cp=progress[id];const m=courses.find(c=>c.id===id);if(!cp||!m||m.qCount===0)return 0;return Math.round((cp.openedQs?.length||0)/m.qCount*100);},[progress,courses]);
  const yearStat=useCallback(y=>{const yc=courses.filter(c=>c.year===y);if(!yc.length)return null;return `${yc.filter(c=>progress[c.id]?.viewed).length}/${yc.length} started`;},[courses,progress]);

  const selectYear=useCallback(y=>{
    // Block free users from selecting locked years
    if(accessibleYears&&y!=='all'&&!accessibleYears.has(y)){
      setShowPayment(true);
      return;
    }
    setActiveYear(y);setActiveSemester(1);setActiveDept('all');setSearch('');setSearchRaw('');
  },[accessibleYears]);

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
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <div style={{fontSize:14,fontWeight:600,color:'var(--text)'}}>{(()=>{const h=new Date().getHours();const g=h<12?'☀️':h<17?'👋':'🌙';return g+' '+user.displayName;})()}</div>
                {!user.isGuest&&<XPBadge xp={xp||0} size={8}/>}
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6,marginTop:3,flexWrap:'wrap'}}>
                <RolePill role={user.role} accountType={user.accountType||user.account_type}/>
                {!user.isGuest&&<SubscriptionBadge tier={user.subscription_tier||'free'} role={user.role} expiresAt={user.sub_expires_at}/>}
                {user.role===ROLE.USER&&!user.isGuest&&<Mono color="var(--muted)" size={9}>Yr {user.year} · @{user.username}</Mono>}
                {isExternal&&<Mono color="#a8f94f" size={9}>@{user.username} · External</Mono>}
                {user.isGuest&&<Mono color="var(--muted)" size={9}>Preview mode</Mono>}
              </div>
            </div>
          </div>
        </div>

        {/* Right side — minimal: upgrade | bell | hamburger */}
        <div style={{display:'flex',gap:8,alignItems:'center',flexShrink:0}}>

          {/* ⭐ Upgrade — free-tier users only */}
          {!user.isGuest&&user.role!==ROLE.SUPERUSER&&(user.subscription_tier||'free')==='free'&&(
            <button onClick={()=>setShowPayment(true)}
              style={{background:'linear-gradient(135deg,rgba(249,168,79,.18),rgba(249,168,79,.08))',border:'1px solid rgba(249,168,79,.4)',borderRadius:8,color:'#f9a84f',cursor:'pointer',padding:'7px 11px',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',gap:4,whiteSpace:'nowrap'}}>
              ⭐ <span className="hide-xs">Upgrade</span>
            </button>
          )}

          {/* 🔔 Bell */}
          {!user.isGuest&&<NotificationBell user={user} courses={courses} onNavigate={(courseId,tab)=>{onSelectCourse(courseId,tab);}}/>}

          {/* ☰ Hamburger */}
          <button onClick={()=>setDrawerOpen(true)}
            style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',cursor:'pointer',padding:'8px 10px',display:'flex',flexDirection:'column',gap:4,alignItems:'center',justifyContent:'center',width:38,height:38}}>
            <span style={{display:'block',width:16,height:2,background:'currentColor',borderRadius:1}}/>
            <span style={{display:'block',width:16,height:2,background:'currentColor',borderRadius:1}}/>
            <span style={{display:'block',width:12,height:2,background:'currentColor',borderRadius:1}}/>
          </button>
        </div>
      </div>

      {/* ── Side Drawer ─────────────────────────────────────── */}
      {drawerOpen&&(
        <>
          <div onClick={()=>setDrawerOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.55)',backdropFilter:'blur(3px)',zIndex:1998}}/>
          <div className="slide-right" style={{position:'fixed',top:0,left:0,bottom:0,width:280,background:'var(--card)',borderRight:'1px solid var(--border)',zIndex:1999,display:'flex',flexDirection:'column',overflowY:'auto',boxShadow:'8px 0 40px rgba(0,0,0,.5)'}}>
            {/* Drawer header */}
            <div style={{padding:'20px 20px 16px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'var(--text)'}}>StudyHub</div>
                <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{user.displayName}</div>
              </div>
              <button onClick={()=>setDrawerOpen(false)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:20,padding:4}}>✕</button>
            </div>

            {/* User info */}
            <div style={{padding:'14px 20px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:44,height:44,borderRadius:'50%',background:`linear-gradient(135deg,${ROLE_COLOR[user.role]||'#4f9cf9'},#1a1e27)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>
                {ROLE_ICON[user.role]||'👤'}
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{user.displayName}</div>
                <div style={{display:'flex',gap:6,marginTop:4,flexWrap:'wrap'}}>
                  <RolePill role={user.role} accountType={user.accountType}/>
                  {!user.isGuest&&<SubscriptionBadge tier={user.subscription_tier||'free'} role={user.role} expiresAt={user.sub_expires_at}/>}
                </div>
                {user.role===ROLE.USER&&!user.isGuest&&<div style={{fontSize:10,color:'var(--muted)',marginTop:3}}>Year {user.year} · @{user.username}</div>}
              </div>
            </div>

            {/* Nav links */}
            <div style={{padding:'12px 12px',flex:1}}>
              <div style={{fontSize:9,color:'var(--muted)',fontFamily:"'IBM Plex Mono',monospace",letterSpacing:2,padding:'4px 8px',marginBottom:6}}>NAVIGATION</div>
              {[
                {icon:'🏠',label:'Home',action:()=>{setDrawerOpen(false);},active:true},
                ...(bookmarks.length>0?[{icon:'🔖',label:`Bookmarks (${bookmarks.length})`,action:()=>{setShowBookmarks(s=>!s);setDrawerOpen(false);}}]:[]),
                ...(isPriv?[{icon:user.role===ROLE.SUPERUSER?'⚡':'⚙️',label:'Admin Panel',action:()=>{onShowAdmin();setDrawerOpen(false);}}]:[]),
                ...(!user.isGuest&&(user.role===ROLE.USER||user.role===ROLE.EXTERNAL)?[{icon:'🔄',label:'Change Status',action:()=>{setShowStatusModal(true);setDrawerOpen(false);}}]:[]),
                ...(!user.isGuest?[{icon:'✏️',label:'Edit Profile',action:()=>{setShowProfile(true);setDrawerOpen(false);}}]:[]),
            ...(!user.isGuest&&(user.subscription_tier||'free')==='free'&&user.role!==ROLE.SUPERUSER?[{icon:'⭐',label:'Upgrade to Pro',action:()=>{setShowPayment(true);setDrawerOpen(false);},highlight:true}]:[]),
              ].map((item,i)=>(
                <button key={i} onClick={item.action}
                  style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'11px 12px',borderRadius:10,border:'none',background:item.active?'rgba(79,156,249,.08)':item.highlight?'rgba(249,168,79,.08)':'transparent',color:item.highlight?'#f9a84f':item.active?'#4f9cf9':'var(--text)',cursor:'pointer',textAlign:'left',fontSize:13,fontWeight:item.active||item.highlight?600:400,marginBottom:2}}>
                  <span style={{fontSize:16,width:22,textAlign:'center'}}>{item.icon}</span>
                  {item.label}
                </button>
              ))}

              <div style={{fontSize:9,color:'var(--muted)',fontFamily:"'IBM Plex Mono',monospace",letterSpacing:2,padding:'4px 8px',marginTop:12,marginBottom:6}}>SETTINGS</div>
              {/* Theme toggle */}
              <button onClick={()=>{toggleTheme();}} style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'11px 12px',borderRadius:10,border:'none',background:'transparent',color:'var(--text)',cursor:'pointer',textAlign:'left',fontSize:13,marginBottom:2}}>
                <span style={{fontSize:16,width:22,textAlign:'center'}}>{dark?'🌙':'☀️'}</span>
                {dark?'Dark Mode':'Light Mode'}
                <span style={{marginLeft:'auto',fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)'}}>ON</span>
              </button>
              {/* Install */}
              {!window.matchMedia('(display-mode: standalone)').matches&&!window.navigator.standalone&&nativePrompt&&(
                <button onClick={async()=>{
                  nativePrompt.prompt();
                  const{outcome}=await nativePrompt.userChoice;
                  if(outcome==='accepted') savePwaState({neverShow:true});
                  _pwaPromptEvent=null;
                  setDrawerOpen(false);
                }} style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'11px 12px',borderRadius:10,border:'none',background:'rgba(79,156,249,.08)',color:'#4f9cf9',cursor:'pointer',textAlign:'left',fontSize:13,fontWeight:600,marginBottom:2}}>
                  <span style={{fontSize:16,width:22,textAlign:'center'}}>📲</span>
                  Install App
                </button>
              )}
            </div>

            {/* Referral code — quick access for logged-in users */}
            {!user.isGuest&&(
              <div style={{padding:'0 12px 8px'}}>
                <div style={{background:'rgba(168,249,79,.06)',border:'1px solid rgba(168,249,79,.15)',borderRadius:10,padding:'10px 12px'}}>
                  <div style={{fontSize:9,color:'rgba(168,249,79,.6)',fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1,marginBottom:4}}>YOUR REFERRAL CODE</div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:15,fontWeight:700,color:'#a8f94f',letterSpacing:2}}>{genReferralCode(user.username)}</span>
                    <button onClick={()=>{navigator.clipboard.writeText(genReferralCode(user.username));setCopied(true);setTimeout(()=>setCopied(false),2000);}}
                      style={{background:'rgba(168,249,79,.12)',border:'1px solid rgba(168,249,79,.3)',borderRadius:6,color:'#a8f94f',cursor:'pointer',padding:'3px 10px',fontSize:10,fontWeight:700}}>Copy</button>
                  </div>
                  <div style={{fontSize:9,color:'var(--muted)',marginTop:3}}>Share · earn ₦ credit per subscribing friend</div>
                </div>
              </div>
            )}
            {/* Sign out */}
            <div style={{padding:'12px 12px',borderTop:'1px solid var(--border)'}}>
              <button onClick={()=>{setDrawerOpen(false);onLogout();}}
                style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'11px 12px',borderRadius:10,border:'1px solid var(--border)',background:'transparent',color:'var(--muted)',cursor:'pointer',textAlign:'left',fontSize:13}}>
                <span style={{fontSize:16,width:22,textAlign:'center'}}>{user.isGuest?'🔑':'🚪'}</span>
                {user.isGuest?'Sign In / Sign Up':'Sign Out'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* PWA Diagnostic panel */}
      {showPWADebug&&<PWADiagnosticPanel onClose={()=>setShowPWADebug(false)}/>}

      {/* Payment portal */}
      {showPayment&&<PaymentPortal user={user} subCfg={subCfg} onClose={()=>setShowPayment(false)}/>}
      {showProfile&&<ProfileModal user={user} onClose={()=>setShowProfile(false)} onUpdate={updated=>{onUserUpdate&&onUserUpdate(updated);setShowProfile(false);}}/>}

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

      {/* ── Browse mode toggle ── */}
      <div className="stagger-1" style={{marginBottom:18,display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:3,display:'inline-flex',gap:2}}>
          {[{id:'year',label:'📅 By Year'},{id:'course',label:'📂 By Course'}].map(m=>(
            <button key={m.id} onClick={()=>{setBrowseMode(m.id);setSearch('');setSearchRaw('');}}
              style={{padding:'7px 16px',borderRadius:8,border:'none',background:browseMode===m.id?'var(--card)':'none',color:browseMode===m.id?'var(--text)':'var(--muted)',cursor:'pointer',fontSize:12,fontWeight:browseMode===m.id?600:400,boxShadow:browseMode===m.id?'0 1px 4px rgba(0,0,0,.2)':'none',transition:'all .15s'}}>
              {m.label}
            </button>
          ))}
        </div>
        {browseMode==='course'&&<Mono color="var(--muted)" size={9}>{courseCodes.length} COURSE{courseCodes.length!==1?'S':''}</Mono>}
      </div>

      {/* ── BY COURSE mode ── */}
      {browseMode==='course'&&(
        <div className="fade-in">
          {courseCodes.length===0?(
            <div style={{textAlign:'center',padding:'40px 24px',border:'1px dashed var(--border)',borderRadius:12,color:'var(--muted)',fontSize:13,marginBottom:24}}>
              No courses yet.{isPriv&&<span style={{marginLeft:6}}>Open the admin panel to add some.</span>}
            </div>
          ):(
            <>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:10,marginBottom:16}}>
                {courseCodes.map((c,i)=>{
                  const accent=YEAR_COLORS[c.year]||CARD_ACCENTS[i%CARD_ACCENTS.length];
                  const deptColor=DEPT_COLOR[c.department]||'#4f9cf9';
                  const visitedC=c.ids.filter(id=>progress[id]?.viewed).length;
                  return(
                    <button key={c.code} onClick={()=>onOpenCourseTab&&onOpenCourseTab(c.code)}
                      style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:'16px 14px',textAlign:'left',cursor:'pointer',borderTop:`3px solid ${accent}`,transition:'transform .15s,box-shadow .15s',position:'relative'}}
                      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,.2)';}}
                      onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:17,fontWeight:700,color:accent,marginBottom:5,letterSpacing:.5}}>{c.code}</div>
                      <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:6}}>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,background:`${deptColor}18`,color:deptColor,borderRadius:4,padding:'1px 6px'}}>{DEPT_SHORT[c.department]||c.department?.slice(0,3)||'CS'}</span>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,background:YEAR_BG[c.year],color:accent,borderRadius:4,padding:'1px 6px'}}>Yr {c.year}</span>
                      </div>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)'}}>
                        {c.count} chapter{c.count!==1?'s':''}
                        {visitedC>0&&<span style={{color:'#7fda96',marginLeft:5}}>· {visitedC} visited</span>}
                      </div>
                      <span style={{position:'absolute',bottom:10,right:12,color:'var(--muted)',fontSize:14}}>›</span>
                    </button>
                  );
                })}
              </div>
              {/* Search within course mode */}
              <SearchBar value={searchRaw} onChange={setSearchRaw} placeholder="Search all chapters…"/>
              {search&&(
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(278px,1fr))',gap:14,marginTop:12}}>
                  {courses.filter(c=>{const lq=search.toLowerCase();return c.chapterTitle.toLowerCase().includes(lq)||c.courseName.toLowerCase().includes(lq);}).map((c,i)=>(
                    <CourseCard key={c.id} course={c} index={i} pct={pct(c.id)} viewed={!!progress[c.id]?.viewed} bookmarked={bookmarks.includes(c.id)} isPriv={isPriv} onSelect={onSelectCourse}/>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── BY YEAR mode ── */}
      {browseMode==='year'&&(<>

      {/* Recently viewed courses */}
      {(()=>{
        const recent=[...courses].filter(c=>progress[c.id]?.viewed)
          .sort((a,b)=>new Date(progress[b.id]?.lastViewedAt||0)-new Date(progress[a.id]?.lastViewedAt||0))
          .slice(0,4);
        if(!recent.length) return null;
        return(
          <div className="fade-in" style={{marginBottom:18}}>
            <Mono color="var(--muted)" size={9}>RECENTLY VIEWED</Mono>
            <div style={{display:'flex',gap:8,marginTop:8,flexWrap:'wrap'}}>
              {recent.map(c=>{
                const accent=YEAR_COLORS[c.year]||'#4f9cf9';
                const isNew=c.addedAt&&(new Date()-new Date(c.addedAt))<7*24*60*60*1000;
                return(
                  <button key={c.id} onClick={()=>onSelectCourse(c.id)}
                    style={{background:'var(--card)',border:`1px solid ${accent}30`,borderRadius:10,padding:'8px 14px',cursor:'pointer',textAlign:'left',display:'flex',flexDirection:'column',gap:3,flex:'1 1 160px',maxWidth:220}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:accent,letterSpacing:1}}>{c.courseName}</span>
                    <span style={{fontSize:12,color:'var(--text)',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.chapterTitle}</span>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:pct(c.id)===100?'#7fda96':'var(--muted)'}}>{pct(c.id)===100?'✓ Complete':`${pct(c.id)}% done`}</span>
                    {progress[c.id]?.lastViewedAt&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7,color:'var(--muted)',opacity:.6}}>{timeAgo(progress[c.id].lastViewedAt)}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}
      {/* Year tabs */}
      <div className="stagger-1" style={{marginBottom:16}}>
        <Mono color="var(--muted)" size={9}>YEAR</Mono>
        <div className="year-tabs" style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:10}}>
          {isExternal&&(
            <button className="year-tab" onClick={()=>selectYear('all')} style={{background:activeYear==='all'?'rgba(168,249,79,.1)':'var(--surface)',border:`1px solid ${activeYear==='all'?'rgba(168,249,79,.4)':'var(--border)'}`,borderRadius:10,cursor:'pointer',padding:'10px 18px',transition:'var(--transition)',textAlign:'left'}}>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:16,color:activeYear==='all'?'#a8f94f':'var(--text)'}}>All Years</div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:activeYear==='all'?'#a8f94faa':'var(--muted)',marginTop:2}}>{courses.length} courses</div>
            </button>
          )}
          {YEARS.map(y=>{const active=activeYear===y;const st=yearStat(y);const locked=accessibleYears&&!accessibleYears.has(y);return(
            <button key={y} className="year-tab" onClick={()=>selectYear(y)} style={{background:active?YEAR_BG[y]:'var(--surface)',border:`1px solid ${active?YEAR_COLORS[y]+'60':locked?'var(--border)':'var(--border)'}`,borderRadius:10,cursor:'pointer',padding:'10px 18px',transition:'var(--transition)',textAlign:'left',opacity:locked?.55:1,position:'relative'}}>
              {locked&&<span style={{position:'absolute',top:6,right:8,fontSize:10}}>🔒</span>}
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:active?YEAR_COLORS[y]:locked?'var(--muted)':'var(--text)'}}>Year {y}</div>
              {locked?<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:'var(--muted)',marginTop:2}}>Pro only</div>
                :(st&&<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:active?YEAR_COLORS[y]+'aa':'var(--muted)',marginTop:2}}>{st}</div>)}
            </button>
          );})}
        </div>
      </div>

      {/* Semester tabs */}
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

      {/* ── Study Tools: Top 3 Tasks + Scratchpad ───────────────── */}
      <StudyTools user={user} subCfg={subCfg}/>

      {/* Search */}
      <div className="stagger-3" style={{marginBottom:16}}>
        <div style={{position:'relative'}}>
          <SearchBar value={searchRaw} onChange={setSearchRaw} placeholder={activeYear==='all'?`Search all courses…`:`Search Year ${activeYear} Sem ${activeSemester}${activeDept!=='all'?' · '+DEPT_SHORT[activeDept]:''} courses…`}/>
          {!searchRaw&&<div className="kbd-hint" style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:4,padding:'1px 6px',pointerEvents:'none'}}>Press /</div>}
        </div>
      </div>

      {/* Department filter — collapsible */}
      {DEPARTMENTS.length>0&&(
        <div className="stagger-4" style={{marginBottom:16}}>
          <button onClick={()=>setDeptOpen(o=>!o)}
            style={{display:'flex',alignItems:'center',gap:8,background:'none',border:'none',cursor:'pointer',padding:'4px 0',width:'100%',textAlign:'left'}}>
            <Mono color={activeDept!=='all'?DEPT_COLOR[activeDept]||'#f9a84f':'var(--muted)'} size={9}>
              DEPARTMENT{activeDept!=='all'?` · ${DEPT_SHORT[activeDept]||activeDept}`:''}
            </Mono>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginLeft:'auto'}}>
              {deptOpen?'▲ hide':'▼ show'}
            </span>
          </button>
          {/* Always show "All Departments" chip */}
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:6}}>
            <button onClick={()=>{setActiveDept('all');setDeptOpen(false);}}
              style={{background:activeDept==='all'?'rgba(136,146,164,.15)':'var(--surface)',border:`1px solid ${activeDept==='all'?'#8892a4':'var(--border)'}`,borderRadius:20,cursor:'pointer',padding:'6px 14px',display:'flex',alignItems:'center',gap:6,transition:'var(--transition)'}}>
              <span style={{fontSize:12,color:'var(--text)',fontWeight:activeDept==='all'?700:400}}>All Departments</span>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:'var(--border)',color:'var(--muted)',borderRadius:10,padding:'1px 6px'}}>{deptCount('all')}</span>
            </button>
            {activeDept!=='all'&&(
              <button onClick={()=>setActiveDept('all')}
                style={{background:`${DEPT_COLOR[activeDept]||'#f9a84f'}15`,border:`1px solid ${DEPT_COLOR[activeDept]||'#f9a84f'}50`,borderRadius:20,cursor:'pointer',padding:'6px 12px',display:'flex',alignItems:'center',gap:6}}>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:DEPT_COLOR[activeDept]||'#f9a84f',fontWeight:700}}>{DEPT_SHORT[activeDept]||activeDept}</span>
                <span style={{fontSize:11,color:DEPT_COLOR[activeDept]||'#f9a84f'}}>✕</span>
              </button>
            )}
          </div>
          {/* Expanded dept list */}
          {deptOpen&&(
            <div className="fade-in" style={{display:'flex',flexDirection:'column',gap:6,marginTop:10,background:'var(--surface)',borderRadius:12,padding:'10px',border:'1px solid var(--border)'}}>
              {DEPARTMENTS.map(d=>{
                const isActive=activeDept===d;
                const color=DEPT_COLOR[d]||'#4f9cf9';
                return(
                  <button key={d} onClick={()=>{setActiveDept(d);setDeptOpen(false);}}
                    style={{background:isActive?`${color}15`:'transparent',border:`1px solid ${isActive?color+'60':'transparent'}`,borderRadius:8,cursor:'pointer',padding:'9px 12px',display:'flex',alignItems:'center',gap:10,textAlign:'left',transition:'var(--transition)'}}>
                    <span style={{width:8,height:8,borderRadius:'50%',background:color,flexShrink:0}}/>
                    <span style={{flex:1,fontSize:13,color:isActive?color:'var(--text)',fontWeight:isActive?600:400}}>{d}</span>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:isActive?`${color}20`:'var(--border)',color:isActive?color:'var(--muted)',borderRadius:10,padding:'2px 7px'}}>{deptCount(d)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {isFreeUser&&!freeAllYears&&(()=>{
        const aiLimit=parseInt(subCfg?.free_ai_messages_per_month||'5');
        const aiUsed=(()=>{try{const s=JSON.parse(localStorage.getItem('sh-ai-msgs')||'{}');const m=new Date().toISOString().slice(0,7);return s.month===m?s.count||0:0;}catch{return 0;}})();
        const aiLeft=Math.max(0,aiLimit-aiUsed);
        return(
          <div className="fade-in" style={{background:'linear-gradient(135deg,rgba(249,168,79,.08),rgba(249,168,79,.03))',border:'1px solid rgba(249,168,79,.2)',borderRadius:10,padding:'10px 16px',marginBottom:14,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
            <div>
              <div style={{fontSize:12,color:'rgba(249,168,79,.9)',fontWeight:600,marginBottom:2}}>🎓 Free plan · Year {user.year||1} only</div>
              <div style={{fontSize:10,color:'var(--muted)'}}>{aiLeft}/{aiLimit} AI messages left this month · <span style={{color:'#4f9cf9',cursor:'pointer',textDecoration:'underline'}} onClick={()=>setShowPayment(true)}>Upgrade to Pro</span> for unlimited access</div>
            </div>
            <button onClick={()=>setShowPayment(true)} style={{background:'rgba(249,168,79,.15)',border:'1px solid rgba(249,168,79,.4)',borderRadius:7,color:'#f9a84f',cursor:'pointer',padding:'5px 12px',fontSize:11,fontWeight:700,whiteSpace:'nowrap',flexShrink:0}}>
              ⭐ Upgrade
            </button>
          </div>
        );
      })()}
      <Mono color="var(--muted)" size={9}>{visible.length} COURSE{visible.length!==1?'S':''}{activeYear==='all'?` · ALL YEARS`:` · YEAR ${activeYear} · SEM ${activeSemester}`}{activeDept!=='all'?` · ${DEPT_SHORT[activeDept]}`:''}{search?` · "${search}"`:''}</Mono>

      {visible.length===0?(
        <div style={{textAlign:'center',padding:'50px 24px',border:'1px dashed var(--border)',borderRadius:16,marginTop:16,background:'var(--surface)'}}>
          <div style={{fontSize:48,marginBottom:14,lineHeight:1}}>{search?'🔍':accessibleYears&&activeYear!=='all'&&!accessibleYears.has(activeYear)?'🔒':isPriv?'➕':'📭'}</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:'var(--text)',marginBottom:8}}>
            {search?`No results for "${search}"`
             :accessibleYears&&activeYear!=='all'&&!accessibleYears.has(activeYear)?`Year ${activeYear} is Pro only`
             :activeYear==='all'?'No courses uploaded yet — check back later'
             :`No Year ${activeYear}, Semester ${activeSemester} courses yet`}
          </div>
          <p style={{color:'var(--muted)',fontSize:13,lineHeight:1.6,maxWidth:280,margin:'0 auto 16px'}}>
            {search?'Try a different keyword or clear the search.'
             :accessibleYears&&activeYear!=='all'&&!accessibleYears.has(activeYear)?'Upgrade to Pro to access all years and departments.'
             :isPriv?'Open the admin panel and add courses for this year and semester.'
             :'No courses have been added here yet. Check back soon.'}
          </p>
          {search&&<button onClick={()=>{setSearch('');setSearchRaw('');}} style={{background:'rgba(79,156,249,.1)',border:'1px solid rgba(79,156,249,.3)',borderRadius:8,color:'#4f9cf9',cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:600}}>Clear search</button>}
          {!search&&accessibleYears&&activeYear!=='all'&&!accessibleYears.has(activeYear)&&<button onClick={()=>setShowPayment(true)} style={{background:'linear-gradient(135deg,rgba(249,168,79,.18),rgba(249,168,79,.08))',border:'1px solid rgba(249,168,79,.4)',borderRadius:8,color:'#f9a84f',cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:700}}>⭐ Upgrade to Pro</button>}
          {!search&&isPriv&&<button onClick={onShowAdmin} style={{background:ROLE_BG[user.role],border:`1px solid ${ROLE_COLOR[user.role]}40`,borderRadius:8,color:ROLE_COLOR[user.role],cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:600}}>{user.role===ROLE.SUPERUSER?'⚡ Open Panel':'⚙ Open Panel'}</button>}
        </div>
      ):(<>
        {courses.length===0&&!search&&(
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(278px,1fr))',gap:14,marginTop:16}}>
            {[1,2,3,4,5,6].map(k=><div key={k} style={{height:136,borderRadius:14,background:'var(--surface)',border:'1px solid var(--border)',animation:'pulse 1.8s ease-in-out infinite',animationDelay:`${k*.1}s`}}/>)}
          </div>
        )}
        <div className="course-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(285px,1fr))',gap:16,marginTop:16}}>
          {visible.map((c,i)=>(
            <CourseCard key={c.id} course={c} index={i} pct={pct(c.id)}
              viewed={!!progress[c.id]?.viewed} bookmarked={bookmarks.includes(c.id)}
              isPriv={isPriv} onSelect={onSelectCourse}/>
          ))}
        </div>
      </>)}
      </>)}
    </div>
  );
}

/* ═══════════════ ROOT APP ═══════════════ */
const SESSION_KEY = 'sh-session';
const NAV_KEY = 'sh-nav';

function saveNav(view, activeCourseCode=null, activeCourseId=null){
  // Don't persist admin view — always drop back to home on refresh for security
  const persistView = (view==='admin'||view==='auth') ? 'home' : view;
  try{localStorage.setItem(NAV_KEY,JSON.stringify({view:persistView,activeCourseCode,activeCourseId}));}catch{}
}
function loadNav(){
  try{const raw=localStorage.getItem(NAV_KEY);return raw?JSON.parse(raw):null;}catch{return null;}
}
function clearNav(){try{localStorage.removeItem(NAV_KEY);}catch{}}

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
    // ? opens keyboard shortcuts help
    if(e.key==='?'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){
      setShowShortcuts(s=>!s);
    }
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

/* ═══════════════ ERROR BOUNDARY ═══════════════ */
class ErrorBoundary extends React.Component{
  constructor(p){super(p);this.state={crashed:false,msg:''};}
  static getDerivedStateFromError(e){return{crashed:true,msg:e?.message||'Unknown error'};}
  componentDidCatch(e,info){console.error('StudyHub crash:',e,info);}
  render(){
    if(this.state.crashed){
      return(
        <div style={{minHeight:'100vh',background:'#0d0f14',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{maxWidth:420,width:'100%',background:'#1a1e27',border:'1px solid rgba(240,80,80,.3)',borderRadius:16,padding:'32px 28px',textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:16}}>⚠️</div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:'#e2e6f0',marginBottom:10}}>Something went wrong</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:'rgba(255,255,255,.3)',marginBottom:10,letterSpacing:1}}>v{APP_VERSION}</div>
            <p style={{fontSize:13,color:'#8892a4',lineHeight:1.7,marginBottom:20}}>
              {this.state.msg?.includes('map')||this.state.msg?.includes('undefined')
                ?'A course was saved with missing data. The rest of your courses are safe — reload to continue.'
                :this.state.msg||'An unexpected error occurred. Your data is safe.'}
            </p>
            <button onClick={()=>{this.setState({crashed:false,msg:''});window.location.reload();}}
              style={{background:'#4f9cf9',border:'none',borderRadius:10,color:'#000',cursor:'pointer',padding:'11px 28px',fontSize:14,fontWeight:700}}>
              🔄 Reload StudyHub
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App(){
  const[dark,toggleTheme]=useTheme();
  const online=useOnline();
  const[errMsg,setErrMsg]=useErrorToast();
  const[showShortcuts,setShowShortcuts]=useState(false);
  const[confirm,ConfirmModal]=useConfirm();

  // Expose confirm globally so child components can call window.shConfirm()
  useEffect(()=>{window.shConfirm=confirm;return()=>{delete window.shConfirm;};},[confirm]);

  // Restore session from localStorage on mount
  const savedSession=loadSession();
  // Auto-downgrade expired subscription on startup before setting user state
  if(savedSession&&savedSession.role!==ROLE.SUPERUSER&&savedSession.subscription_tier==='pro'&&savedSession.sub_expires_at){
    if(new Date(savedSession.sub_expires_at)<new Date()){
      savedSession.subscription_tier='free';
      savedSession.sub_expires_at=null;
      savedSession.sub_plan=null;
      // Silently update DB — don't block startup
      dbSetUserTier(savedSession.username,'free').catch(()=>{});
    }
  }
  const savedNav=savedSession?loadNav():null;
  // Start as 'home' for course view — will switch once data loads async
  const[view,setView]=useState(savedSession?(savedNav?.view==='course'?'home':(savedNav?.view||'home')):'auth');
  const[user,setUser]=useState(savedSession||null);
  // These hooks depend on user — must come AFTER user is declared
  const[bookmarks,toggleBookmark]=useBookmarks(user?.username||'guest');
  const[courses,setCourses]=useState([]);
  const[active,setActive]=useState(null);
  const[activeCourseCode,setActiveCourseCode]=useState(savedNav?.activeCourseCode||null);
  const[progress,setProgress]=useState({});
  const[loading,setLoading]=useState(false);
  const[syncing,setSyncing]=useState(false);
  const[showWelcome,setShowWelcome]=useState(false);
  const[subCfg,setSubCfg]=useState({});
  const[announceKey,setAnnounceKey]=useState(0);
  const[onlineUsers,setOnlineUsers]=useState(new Set());

  // Single presence channel — tracks this user AND watches who's online
  // Only one channel ever exists, owned by root App, passed down as prop
  useEffect(()=>{
    if(!user||user.isGuest) return;
    const ch=supabase.channel('sh-presence',{config:{presence:{key:user.username}}});
    ch
      .on('presence',{event:'sync'},()=>{
        const state=ch.presenceState();
        setOnlineUsers(new Set(Object.keys(state)));
      })
      .on('presence',{event:'join'},({key})=>{
        setOnlineUsers(prev=>new Set([...prev,key]));
      })
      .on('presence',{event:'leave'},({key})=>{
        setOnlineUsers(prev=>{const n=new Set(prev);n.delete(key);return n;});
      })
      .subscribe(async status=>{
        if(status==='SUBSCRIBED'){
          await ch.track({username:user.username,role:user.role,at:Date.now()});
        }
      });
    return()=>supabase.removeChannel(ch);
  },[user?.username]);

  // Persist current view so refresh restores the same page
  useEffect(()=>{
    if(user&&!user.isGuest) saveNav(view,activeCourseCode,active?.id||null);
  },[view,activeCourseCode,active?.id,user?.username]);

  // Page title
  useEffect(()=>{
    const base='StudyHub';
    if(view==='auth') document.title=base;
    else if(view==='course'&&active?.data?.chapterTitle) document.title=`${active.data.chapterTitle} · ${base}`;
    else if(view==='coursetab'&&activeCourseCode) document.title=`${activeCourseCode} · ${base}`;
    else if(view==='admin') document.title=`Admin Panel · ${base}`;
    else document.title=base;
  },[view,active?.data?.chapterTitle,activeCourseCode]);

  // Global search ref for keyboard shortcut
  const searchRef=useRef(null);
  useKeyboardShortcuts({
    onToggleTheme:toggleTheme,
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
    // Load subscription config
    supabase.from('subscription_config').select('*').then(({data})=>{
      if(Array.isArray(data)){const cfg={};data.forEach(r=>{cfg[r.key]=r.value;});setSubCfg(cfg);}
    }).catch(()=>{});

    // Reload courses silently, then restore active course if nav was persisted
    const loadCourses=()=>{
      dbLoadCourseIndex().then(async data=>{
        setCourses(data);
        // If refreshed mid-course, re-fetch and restore
        if(savedNav?.view==='course'&&savedNav?.activeCourseId){
          try{
            const courseData=await dbLoadCourseData(savedNav.activeCourseId);
            const meta=data.find(c=>c.id===savedNav.activeCourseId);
            if(courseData&&meta){
              setActive({id:meta.id,data:courseData,year:meta.year,semester:meta.semester||1,department:meta.department||'Computer Science',initialTab:null});
              setView('course');
            } else {
              // Course was deleted or unavailable — go home cleanly
              setView('home');saveNav('home',null,null);
            }
          }catch{setView('home');saveNav('home');}
        }
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

  // ── Real-time: stable channels — mount once, never torn down ────────────
  useEffect(()=>{
    // Courses — any role needs this
    const coursesCh=supabase.channel('rt-courses')
      .on('postgres_changes',{event:'*',schema:'public',table:'courses'},()=>{
        setSyncing(true);
        dbLoadCourseIndex().then(data=>{
          setCourses(prev=>{
            const prevSig=prev.map(c=>c.id).sort().join('|');
            const newSig=data.map(c=>c.id).sort().join('|');
            return prevSig===newSig&&prev.length===data.length?prev:data;
          });
          setSyncing(false);
        }).catch(()=>setSyncing(false));
      }).subscribe();

    // Announcements
    const annCh=supabase.channel('rt-announcements')
      .on('postgres_changes',{event:'*',schema:'public',table:'announcements'},()=>{
        setSyncing(true);
        setAnnounceKey(k=>k+1);
        setTimeout(()=>setSyncing(false),600);
      }).subscribe();

    // Assignments
    const assignCh=supabase.channel('rt-assignments')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'assignments'},(payload)=>{
        setSyncing(true);setTimeout(()=>setSyncing(false),600);
        if(payload.new) pushNotification(`📋 New Assignment: ${payload.new.title}`,payload.new.due_date?`Due ${new Date(payload.new.due_date).toLocaleDateString()}`:'Check StudyHub for details');
      }).subscribe();

    // CAs
    const caCh=supabase.channel('rt-cas')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'course_cas'},(payload)=>{
        setSyncing(true);setTimeout(()=>setSyncing(false),600);
        if(payload.new) pushNotification(`📝 New ${payload.new.type}: ${payload.new.title}`,payload.new.date?`On ${new Date(payload.new.date).toLocaleDateString()}`:'Check StudyHub for details');
      }).subscribe();

    // Subscription config
    const subCfgCh=supabase.channel('rt-sub-config')
      .on('postgres_changes',{event:'*',schema:'public',table:'subscription_config'},()=>{
        supabase.from('subscription_config').select('*').then(({data})=>{
          if(Array.isArray(data)){const cfg={};data.forEach(r=>{cfg[r.key]=r.value;});setSubCfg(cfg);}
        });
      }).subscribe();

    return()=>{
      supabase.removeChannel(coursesCh);
      supabase.removeChannel(annCh);
      supabase.removeChannel(assignCh);
      supabase.removeChannel(caCh);
      supabase.removeChannel(subCfgCh);
    };
  },[]); // empty deps — mount once, stay alive

  // ── Real-time: user-specific channels — rebuild only when role changes ───
  useEffect(()=>{
    if(!user||user.isGuest) return;

    // Pending approvals (superuser only)
    const pendingCh=supabase.channel('rt-pending')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'pending_actions'},()=>{
        setSyncing(true);setTimeout(()=>setSyncing(false),600);
        if(user?.role===ROLE.SUPERUSER) pushNotification('⚡ New Approval Request','An admin has submitted a request for your approval on StudyHub.');
      }).subscribe();

    // Status change requests
    const statusCh=supabase.channel('rt-status-requests')
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'status_change_requests'},async(payload)=>{
        const row=payload.new;
        if(row.username!==user.username)return;
        if(row.status==='approved'){
          const newRole=await resolveRole(user.username);
          const updated={...user,role:newRole,accountType:newRole===ROLE.EXTERNAL?'external':'student'};
          setUser(updated);saveSession(updated);
          pushNotification('✅ Status change approved',`Your account is now "${row.to_type}". Changes are live.`);
        } else if(row.status==='rejected'){
          pushNotification('❌ Status change rejected',row.note||'Your request was declined.');
        }
      }).subscribe();

    // Users table — detect when our own row changes
    const usersCh=supabase.channel('rt-users')
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'users'},async(payload)=>{
        if(payload.new?.username!==user.username)return;
        const row=payload.new;
        const newRole=await resolveRole(user.username);
        // Also pick up subscription changes pushed by superuser
        const updated={...user,role:newRole,year:row.year||user.year,accountType:row.account_type||user.accountType,
          subscription_tier:row.subscription_tier||user.subscription_tier,
          sub_expires_at:row.sub_expires_at||null,sub_plan:row.sub_plan||null};
        setUser(updated);saveSession(updated);
        if(newRole!==user.role) pushNotification('✅ Account updated','Your account type has been changed. Changes are live.');
        // Notify if subscription was just activated
        if(row.subscription_tier==='pro'&&user.subscription_tier!=='pro'){
          pushNotification('⭐ Pro activated!','Your StudyHub Pro subscription is now active.');
        }
      }).subscribe();

    return()=>{
      supabase.removeChannel(pendingCh);
      supabase.removeChannel(statusCh);
      supabase.removeChannel(usersCh);
    };
  },[user?.role,user?.username]);

  // ── Re-fetch on reconnect (replaces 90s polling) ────────────────────────
  // Realtime handles live updates. This only fires once when coming back online.
  const prevOnlineRef=useRef(online);
  useEffect(()=>{
    if(!online||prevOnlineRef.current===online){prevOnlineRef.current=online;return;}
    prevOnlineRef.current=online;
    // Just came back online — do a single silent refresh
    Promise.all([
      dbLoadCourseIndex().then(data=>setCourses(data)).catch(()=>{}),
      loadDepartments().catch(()=>{}),
      loadUserTypes().catch(()=>{}),
      user&&!user.isGuest?dbLoadProgress(user.username).then(setProgress).catch(()=>{}):Promise.resolve(),
    ]);
  },[online]);

  // ── Subscription expiry check — runs every 5 minutes ────────────────────
  // (separate from realtime — needs periodic check as expiry is time-based)
  useEffect(()=>{
    if(!user||user.isGuest||user.role===ROLE.SUPERUSER) return;
    const check=()=>{
      if(user.subscription_tier==='pro'&&user.sub_expires_at){
        if(new Date(user.sub_expires_at)<new Date()){
          const updated={...user,subscription_tier:'free',sub_expires_at:null,sub_plan:null};
          dbSetUserTier(user.username,'free').catch(()=>{});
          setUser(updated);saveSession(updated);
          pushNotification('📋 Subscription ended','Your Pro subscription has expired. Renew in Settings.');
        }
      }
    };
    check(); // check immediately on mount
    const t=setInterval(check,5*60*1000); // then every 5 mins
    return()=>clearInterval(t);
  },[user?.username,user?.subscription_tier,user?.sub_expires_at]);

  // ── Auth handlers ─────────────────────────────────────────────────────
  const handleLogin=useCallback(async u=>{
    // Auto-downgrade if subscription expired
    const effectiveTier=(()=>{
      if(u.role===ROLE.SUPERUSER) return 'pro';
      if(u.subscription_tier==='pro'&&u.sub_expires_at){
        if(new Date(u.sub_expires_at)<new Date()){
          // Expired — silently downgrade in DB too
          dbSetUserTier(u.username,'free').catch(()=>{});
          return 'free';
        }
      }
      return u.subscription_tier||'free';
    })();
    const resolved={...u,subscription_tier:effectiveTier};
    setUser(resolved);
    saveSession(resolved);
    if(resolved.role===ROLE.USER&&!resolved.isGuest){
      const p=await dbLoadProgress(resolved.username).catch(()=>({}));
      setProgress(p);
    }
    if(resolved.isNew) setShowWelcome(true);
    setView('home');
  },[]);

  const handleGuest=useCallback(()=>{
    setUser({username:'guest',displayName:'Guest',role:ROLE.USER,isGuest:true,year:1});
    setView('home');
  },[]);

  const handleLogout=useCallback(()=>{
    clearSession();clearNav();
    setUser(null);setProgress({});setActive(null);setActiveCourseCode(null);setView('auth');
  },[]);

  const handleOpenCourseTab=useCallback(code=>{
    setActiveCourseCode(code);setView('coursetab');
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

  const goToSignUp=useCallback(()=>{clearSession();clearNav();setUser(null);setProgress({});setActive(null);setView('auth');},[]);

  return(
    <ErrorBoundary>
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
            dark={dark} toggleTheme={toggleTheme}
            onOpenCourseTab={handleOpenCourseTab}
            onUserUpdate={updated=>setUser(u=>({...u,...updated}))}/>
        </div>
      )}

      {view==='coursetab'&&activeCourseCode&&user&&courses.length===0&&(
        <div style={{position:'fixed',inset:0,background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{color:'#4f9cf9',fontSize:32,animation:'spin 1s linear infinite'}}>⟳</div>
        </div>
      )}
      {view==='coursetab'&&activeCourseCode&&user&&courses.length>0&&(
        <div style={{paddingTop:user?.isGuest?48:0}}>
          <CourseTabView
            courseCode={activeCourseCode}
            courses={courses}
            user={user}
            progress={progress}
            onSelectCourse={id=>{setActiveCourseCode(activeCourseCode);handleSelect(id);}}
            onBack={()=>setView('home')}
            bookmarks={bookmarks}
            toggleBookmark={toggleBookmark}/>
        </div>
      )}

      {view==='course'&&!active&&user&&(
        <div style={{position:'fixed',inset:0,background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16}}>
          <div style={{color:'#4f9cf9',fontSize:32,animation:'spin 1s linear infinite'}}>⟳</div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--muted)',letterSpacing:2}}>LOADING COURSE…</div>
        </div>
      )}
      {view==='course'&&active&&user&&(
        <div style={{paddingTop:user?.isGuest?48:0}}>
          <CourseView course={active} user={user} progress={progress}
            onBack={()=>{activeCourseCode?setView('coursetab'):setView('home');}}
            onProgressUpdate={handleProgress}
            bookmarks={bookmarks} toggleBookmark={toggleBookmark}
            courses={courses} subCfg={subCfg}/>
        </div>
      )}

      {view==='admin'&&user&&(user.role===ROLE.ADMIN||user.role===ROLE.SUPERUSER)&&(
        <AdminPanel user={user} courses={courses} onClose={()=>setView('home')} onCoursesChange={setCourses} onlineUsers={onlineUsers}/>
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
          summary:active.data?.keyConcepts?.slice(0,5).map(c=>c.title).join(', '),
          isSuperuser:user?.role===ROLE.SUPERUSER
        }:null} courses={courses} user={user} subCfg={subCfg}/>
      )}

      {showWelcome&&user&&<WelcomeModal user={user} onClose={()=>setShowWelcome(false)}/>}

      {view!=='auth'&&<CopyrightBar/>}
    </>
    </ErrorBoundary>
  );
}
