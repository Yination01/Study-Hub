import React,{ useState, useEffect, useRef, useCallback } from 'react';
import { supabase, ROLE, YEARS, DEPARTMENTS, DEPT_SHORT, DEPT_COLOR, USER_TYPES,
  YEAR_COLORS, YEAR_BG, ROLE_COLOR, ROLE_BG, CARD_ACCENTS, PRIORITY, RES_ICONS,
  CACHE_KEY, APP_VERSION, getSubVal, getAiMsgCount, incAiMsgCount, TIER_CONFIG } from '../lib/constants.js';
import * as db from '../lib/db.js';
import { Tag, Mono, SectionLabel, Field, Avatar, RolePill, ProgressBar, Logo, SearchBar } from './UI.jsx';
import { useNotificationPermission, pushNotification } from '../lib/hooks.js';

export function AnnouncementsTab({courseId,user,onNew}){
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

export function NotificationBell({user,courses,onNavigate}){
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

export function AssignmentsTab({courseId,user}){
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


export function CATab({courseId,user}){
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

export function CommunityBoard({courseId,user}){
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

export function ResourcesTab({courseId,user}){
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
