import React,{ useState, useEffect, useRef, useCallback } from 'react';
import { Mono } from './UI.jsx';
import { APP_VERSION, css } from '../lib/constants.js';

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
export function usePWAPrompt(){
  const[p,setP]=useState(_pwaPromptEvent);
  useEffect(()=>{
    const fn=e=>setP(e);
    _pwaListeners.push(fn);
    return()=>{ _pwaListeners=_pwaListeners.filter(f=>f!==fn); };
  },[]);
  return p;
}

export function useBrowserInfo(){
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

export function pwaState(){
  try { return JSON.parse(localStorage.getItem(PWA_KEY)||'{}'); } catch { return {}; }
}
export function savePwaState(patch){
  try { localStorage.setItem(PWA_KEY, JSON.stringify({...pwaState(),...patch})); } catch {}
}

export function shouldShowPrompt(){
  const s = pwaState();
  if(s.neverShow) return false;              // user clicked ✕
  if(!s.snoozeUntil) return true;            // never seen before
  return Date.now() > s.snoozeUntil;         // snooze expired
}

export function InstallPrompt(){
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
export function PWADiagnosticPanel({onClose}){
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
