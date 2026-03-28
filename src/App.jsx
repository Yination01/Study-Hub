/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                      S T U D Y H U B                            ║
 * ║  © 2025 Yination & Excalibur. All rights reserved.              ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import React,{ useState, useEffect, useCallback } from 'react';
import { ROLE, supabase } from './lib/constants.js';
import * as db from './lib/db.js';
import { useTheme, useBookmarks, useOnline, useErrorToast, ErrorToast,
  useConfirm, usePageTitle, useKeyboardShortcuts, SyncToast,
  saveSession, loadSession, clearSession } from './lib/hooks.js';
import { InstallPrompt } from './components/PWA.jsx';
import { AuthScreen } from './components/Auth.jsx';
import { Chatbot } from './components/Chatbot.jsx';
import { Home } from './components/Home.jsx';
import { CourseView } from './components/CourseView.jsx';
import { AdminPanel } from './components/Admin.jsx';
import { WelcomeModal, CopyrightBar } from './components/Modals.jsx';

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
  const[activeCourseCode,setActiveCourseCode]=useState(null);
  const[progress,setProgress]=useState({});
  const[loading,setLoading]=useState(false);
  const[syncing,setSyncing]=useState(false);
  const[showWelcome,setShowWelcome]=useState(false);
  const[announceKey,setAnnounceKey]=useState(0);

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
    Promise.all([loadDepartments(),loadUserTypes(),loadSubConfig()]).catch(()=>{});

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
        dbLoadCourseIndex().then(data=>{
          setCourses(prev=>{
            const prevSig=prev.map(c=>c.id).sort().join('|');
            const newSig=data.map(c=>c.id).sort().join('|');
            return prevSig===newSig&&prev.length===data.length?prev:data;
          });
          setSyncing(false);
        }).catch(()=>setSyncing(false));
      }).subscribe();

    // Announcements — force GlobalAnnouncementStrip to remount by bumping a counter
    const annCh=supabase.channel('rt-announcements')
      .on('postgres_changes',{event:'*',schema:'public',table:'announcements'},()=>{
        setSyncing(true);
        setAnnounceKey(k=>k+1); // triggers GlobalAnnouncementStrip to re-fetch
        setTimeout(()=>setSyncing(false),600);
      }).subscribe();

    // Assignments — push + notification badge refresh
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

    // Pending approvals
    const pendingCh=supabase.channel('rt-pending')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'pending_actions'},()=>{
        setSyncing(true);setTimeout(()=>setSyncing(false),600);
        if(user?.role===ROLE.SUPERUSER) pushNotification('⚡ New Approval Request','An admin has submitted a request for your approval on StudyHub.');
      }).subscribe();

    // Status change requests
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
          pushNotification('❌ Status change rejected',row.note||'Your request was declined.');
        }
      }).subscribe();

    // Users table — detect when superuser changes year/account_type for the current user
    const usersCh=supabase.channel('rt-users')
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'users'},async(payload)=>{
        if(!user||user.isGuest)return;
        if(payload.new?.username!==user.username)return;
        // Our own user row changed — re-resolve role and update session
        const row=payload.new;
        const newRole=await resolveRole(user.username);
        const updated={...user,role:newRole,year:row.year||user.year,accountType:row.account_type||user.accountType};
        setUser(updated);saveSession(updated);
        if(newRole!==user.role) pushNotification('✅ Account updated','Your account type has been changed. Changes are live.');
      }).subscribe();

    // Subscription config changes — reload global config instantly
    const subCfgCh=supabase.channel('rt-sub-config')
      .on('postgres_changes',{event:'*',schema:'public',table:'subscription_config'},()=>{
        loadSubConfig().catch(()=>{}); // silently refresh global _subConfig
      }).subscribe();

    return()=>{
      supabase.removeChannel(coursesCh);
      supabase.removeChannel(annCh);
      supabase.removeChannel(assignCh);
      supabase.removeChannel(caCh);
      supabase.removeChannel(pendingCh);
      supabase.removeChannel(statusCh);
      supabase.removeChannel(usersCh);
      supabase.removeChannel(subCfgCh);
    };
  },[user?.role]);

  // ── Periodic silent background refresh (every 30s) ────────────────────
  useEffect(()=>{
    if(!online)return;
    const tick=setInterval(async()=>{
      // Fully silent — no toast, no flicker, no interruption
      try{
        const [newCourses] = await Promise.all([
          dbLoadCourseIndex(),
          loadDepartments(),
          loadUserTypes(),
          ...(user&&!user.isGuest?[dbLoadProgress(user.username).then(setProgress)]:[]),
        ]);
        // Only update courses state if something actually changed (avoids re-renders)
        setCourses(prev=>{
          const prevIds=prev.map(c=>c.id+c.addedAt).join('|');
          const newIds=newCourses.map(c=>c.id+c.addedAt).join('|');
          return prevIds===newIds?prev:newCourses;
        });
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
      }catch{}
    },30_000);
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

  const goToSignUp=useCallback(()=>{clearSession();setUser(null);setProgress({});setActive(null);setView('auth');},[]);

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
            onOpenCourseTab={handleOpenCourseTab}/>
        </div>
      )}

      {view==='coursetab'&&activeCourseCode&&user&&(
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

      {view==='course'&&active&&user&&(
        <div style={{paddingTop:user?.isGuest?48:0}}>
          <CourseView course={active} user={user} progress={progress}
            onBack={()=>{activeCourseCode?setView('coursetab'):setView('home');}}
            onProgressUpdate={handleProgress}
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
    </ErrorBoundary>
  );
}

