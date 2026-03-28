import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, ROLE } from './constants.js';
import { resolveRole, dbLoadProgress } from './db.js';

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

export { useTheme, useBookmarks, useOnline, useNotificationPermission, pushNotification,
  saveSession, loadSession, clearSession,
  useErrorToast, ErrorToast, useConfirm, usePageTitle, useKeyboardShortcuts };
