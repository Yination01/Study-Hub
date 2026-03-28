import React,{ useState, useEffect, useRef } from 'react';
import { supabase, ROLE, YEARS, DEPARTMENTS, DEPT_SHORT, DEPT_COLOR, USER_TYPES,
  YEAR_COLORS, YEAR_BG, ROLE_COLOR, ROLE_BG, ROLE_ICON, COLOR_MAP, CARD_ACCENTS,
  PRIORITY, RES_ICONS, CACHE_KEY, APP_VERSION, COPYRIGHT_YEAR,
  getSubVal, getAiMsgCount, incAiMsgCount, AI_MSG_KEY,
  TIER_CONFIG, CODE_TO_DEPT, detectMetadata, css } from '../lib/constants.js';
import * as db from '../lib/db.js';
import { Mono, Logo, Tag } from './UI.jsx';
import { usePWAPrompt } from './PWA.jsx';

export function WelcomeModal({user,onClose}){
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

export function GuestBanner({onSignUp}){
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

export const CopyrightBar=()=>{
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

export function GlobalAnnouncementStrip({user}){
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
