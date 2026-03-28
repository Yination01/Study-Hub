import React,{ useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { supabase, ROLE, YEARS, DEPARTMENTS, DEPT_SHORT, DEPT_COLOR, USER_TYPES, YEAR_COLORS, YEAR_BG, ROLE_COLOR, ROLE_BG, CARD_ACCENTS, PRIORITY, CACHE_KEY, APP_VERSION, COPYRIGHT_YEAR, getSubVal, getAiMsgCount, incAiMsgCount, AI_MSG_KEY } from '../lib/constants.js';
import * as db from '../lib/db.js';
import { Tag, Mono, SectionLabel, Field, Avatar, RoleBadge, RolePill, ProgressBar, Logo, ThemeToggle, SearchBar } from './UI.jsx';
import { usePWAPrompt } from './PWA.jsx';

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


export { PWADiagnosticPanel, WelcomeModal, GuestBanner, CopyrightBar, GlobalAnnouncementStrip };
