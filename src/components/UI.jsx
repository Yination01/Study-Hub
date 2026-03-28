import React from 'react';
import { ROLE_COLOR, ROLE_BG, ROLE_ICON, USER_TYPES, YEAR_COLORS } from '../lib/constants.js';

export const Tag=({children,color='#4f9cf9'})=>(<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,background:`${color}18`,color,borderRadius:4,padding:'2px 8px',marginRight:5,display:'inline-block'}}>{children}</span>);
export const Mono=({children,color='#4f9cf9',size=10})=>(<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:size,color,letterSpacing:2,textTransform:'uppercase'}}>{children}</span>);
export const SectionLabel=({children})=>(<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,letterSpacing:3,textTransform:'uppercase',color:'#f9a84f',marginBottom:20,display:'flex',alignItems:'center',gap:10}}>{children}<div style={{flex:1,height:1,background:'var(--border)'}}/></div>);
export const Field=({label,type='text',value,onChange,placeholder,error,disabled,onKeyDown})=>(<div style={{marginBottom:14}}>{label&&<div style={{fontSize:11,color:'var(--muted)',marginBottom:5,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>{label}</div>}<input type={type} value={value} onChange={onChange} onKeyDown={onKeyDown} placeholder={placeholder} disabled={disabled} style={{width:'100%',background:disabled?'rgba(0,0,0,.2)':'var(--input-bg)',border:`1px solid ${error?'#f05050':'var(--border)'}`,borderRadius:8,padding:'11px 14px',color:'var(--text)',fontSize:14,fontFamily:"'DM Sans',sans-serif"}}/>{error&&<div style={{color:'#f05050',fontSize:11,marginTop:4}}>{error}</div>}</div>);
export const Avatar=({name,size=32})=>{const ini=name?name.slice(0,2).toUpperCase():'??';const hue=name?name.split('').reduce((a,c)=>a+c.charCodeAt(0),0)%360:200;return<div style={{width:size,height:size,borderRadius:'50%',background:`hsl(${hue},55%,25%)`,border:`2px solid hsl(${hue},55%,45%)`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'IBM Plex Mono',monospace",fontSize:size*.33,color:`hsl(${hue},80%,80%)`,flexShrink:0}}>{ini}</div>;};
export const RoleBadge=({role,accountType})=>{
  const col=ROLE_COLOR[role]||ROLE_COLOR.user;
  return(<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:ROLE_BG[role]||ROLE_BG.user,color:col,border:`1px solid ${col}40`,borderRadius:5,padding:'3px 8px',letterSpacing:1,display:'inline-flex',alignItems:'center',gap:4}}>{getUserTypeLabel(role,accountType)}</span>);
};
export const RolePill=({role,accountType})=>{
  const col=ROLE_COLOR[role]||ROLE_COLOR.user;
  return(<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,background:ROLE_BG[role]||ROLE_BG.user,color:col,border:`1px solid ${col}50`,borderRadius:20,padding:'4px 12px',letterSpacing:1,display:'inline-flex',alignItems:'center',gap:5,fontWeight:600}}>{getUserTypeLabel(role,accountType)}</span>);
};
export const ProgressBar=({pct,color='#4f9cf9'})=>(<div style={{marginTop:10}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><Mono color="var(--muted)" size={9}>PROGRESS</Mono><Mono color={color} size={9}>{pct}%</Mono></div><div style={{height:3,background:'var(--border)',borderRadius:2}}><div style={{height:'100%',width:`${pct}%`,background:color,borderRadius:2,transition:'width .5s ease'}}/></div></div>);

/* ═══════════════ LOGO ═══════════════ */
export function Logo({onClick,size='md'}){
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
export function ThemeToggle({dark,toggle}){
  return(
    <button onClick={toggle} title={dark?'Switch to light mode':'Switch to dark mode'} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:20,padding:'6px 12px',cursor:'pointer',color:'var(--text)',fontSize:16,display:'flex',alignItems:'center',gap:6,fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}>
      {dark?'☀️':'🌙'} <span style={{color:'var(--muted)'}}>{dark?'Light':'Dark'}</span>
    </button>
  );
}

/* ═══════════════ OFFLINE BANNER ═══════════════ */
export function OfflineBanner(){
  return(
    <div className="slide-down" style={{position:'fixed',top:0,left:0,right:0,background:'#f9a84f',color:'#000',padding:'8px 20px',textAlign:'center',fontSize:12,fontWeight:600,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
      📶 You are offline — showing cached content
    </div>
  );
}

/* ═══════════════ PWA INSTALL ═══════════════ */
/* ═══════════════ INSTALL PROMPT (cross-browser) ═══════════════ */
export const PWA_KEY      = 'sh-pwa-v2';
export const SNOOZE_DAYS  = 3;

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
export function usePWAPrompt(){
  const[p,setP]=useState(_pwaPromptEvent);
  useEffect(()=>{
    const fn=e=>setP(e);
    _pwaListeners.push(fn);
    return()=>{ _pwaListeners=_pwaListeners.filter(f=>f!==fn); };
  },[]);
