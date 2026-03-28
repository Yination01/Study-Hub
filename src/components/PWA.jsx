import React,{ useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { supabase, ROLE, YEARS, DEPARTMENTS, DEPT_SHORT, DEPT_COLOR, USER_TYPES, YEAR_COLORS, YEAR_BG, ROLE_COLOR, ROLE_BG, CARD_ACCENTS, PRIORITY, CACHE_KEY, APP_VERSION, COPYRIGHT_YEAR, getSubVal, getAiMsgCount, incAiMsgCount, AI_MSG_KEY } from '../lib/constants.js';
import { Tag, Mono, SectionLabel, Field, Avatar, RoleBadge, RolePill, ProgressBar, Logo, ThemeToggle, SearchBar } from './UI.jsx';

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
      {/* Full-screen backdrop */}
      <div onClick={snooze} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',backdropFilter:'blur(2px)',zIndex:9899}}/>
      <div className="no-print" style={{
        position:'fixed',bottom:0,left:0,right:0,
        background:'var(--card)',borderTop:'1px solid var(--border)',
        borderRadius:'20px 20px 0 0',
        padding:'16px 20px max(24px,env(safe-area-inset-bottom))',
        zIndex:9900,boxShadow:'0 -8px 40px rgba(0,0,0,.5)',
        maxHeight:'85vh',overflowY:'auto',
        animation:'slideUp .35s cubic-bezier(.4,0,.2,1) both'}}>
        {/* Handle bar */}
        <div style={{width:36,height:4,borderRadius:2,background:'var(--border)',margin:'0 auto 16px'}}/>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
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
        <div style={{display:'flex',flexDirection:'column',gap:9,marginBottom:16}}>
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

/* ═══════════════ SUBSCRIPTION / PAYMENT ═══════════════ */
const TIER_CONFIG={
  free:{label:'Free',color:'#8892a4',icon:'🎓',badge:'Free'},
  pro: {label:'Student Pro',color:'#f9a84f',icon:'⭐',badge:'Pro'},
  external:{label:'External Pro',color:'#a8f94f',icon:'🌐',badge:'Pro'},
};

function SubscriptionBadge({tier}){
  const t=TIER_CONFIG[tier]||TIER_CONFIG.free;
  return(
    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,background:`${t.color}20`,
      color:t.color,border:`1px solid ${t.color}40`,borderRadius:4,padding:'1px 6px',letterSpacing:1,fontWeight:700}}>
      {t.icon} {t.badge}
    </span>
  );
}

function PaymentPortal({user,onClose}){
  const monthly=getSubVal('pro_price_monthly','500');
  const yearly=getSubVal('pro_price_yearly','5000');
  const acctName=getSubVal('payment_account_name','StudyHUB');
  const acctNum=getSubVal('payment_account_number','0123456789');
  const bank=getSubVal('payment_bank','OPay');
  const wa=getSubVal('payment_whatsapp','');
  const dailyLimit=parseInt(getSubVal('free_ai_messages_per_day','5'));
  const[copied,setCopied]=useState(false);
  const copyAcct=()=>{navigator.clipboard.writeText(acctNum).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});};

  return(
    <div className="modal-overlay" style={{zIndex:9960}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="scale-in" style={{
        background:'linear-gradient(160deg,#07119a,#0e8f94)',
        border:'1px solid rgba(255,255,255,.12)',
        borderRadius:20,padding:'32px 28px',
        maxWidth:420,width:'calc(100% - 24px)',margin:'auto',
        boxShadow:'0 20px 60px rgba(0,0,0,.5)',
        position:'relative',overflow:'hidden',maxHeight:'90vh',overflowY:'auto',
      }}>
        <div style={{position:'absolute',top:-60,right:-60,width:200,height:200,borderRadius:'50%',background:'rgba(17,163,168,.3)',filter:'blur(60px)',pointerEvents:'none'}}/>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
          <div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:'#fff',marginBottom:2}}>StudyHub Pro</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,.6)'}}>Unlock everything — one payment</div>
          </div>
          <button onClick={onClose} style={{background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.2)',borderRadius:'50%',color:'#fff',cursor:'pointer',width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>✕</button>
        </div>
        {/* Tier comparison */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20}}>
          {[
            {tier:'Free',color:'#8892a4',features:[`Year ${user?.year||1} courses only`,`${dailyLimit} AI messages/day`,'No community posting']},
            {tier:'Pro ⭐',color:'#f9a84f',features:['All years & departments','Unlimited AI chat','Community posting + support']},
          ].map((t,i)=>(
            <div key={i} style={{background:`rgba(255,255,255,${i===1?.12:.06})`,border:`1px solid ${t.color}40`,borderRadius:14,padding:'14px 12px'}}>
              <div style={{fontSize:11,fontWeight:700,color:t.color,marginBottom:8,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>{t.tier}</div>
              {t.features.map((f,j)=>(
                <div key={j} style={{fontSize:11,color:i===1?'rgba(255,255,255,.9)':'rgba(255,255,255,.5)',marginBottom:4,display:'flex',alignItems:'flex-start',gap:5,lineHeight:1.4}}>
                  <span style={{color:i===1?'#7fda96':'#555',fontSize:10,flexShrink:0,marginTop:1}}>{i===1?'✓':'·'}</span>{f}
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* Pricing */}
        <div style={{background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.15)',borderRadius:14,padding:'14px 16px',marginBottom:18}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <span style={{fontSize:13,color:'rgba(255,255,255,.8)'}}>Monthly</span>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,color:'#f9a84f',fontWeight:700}}>₦{monthly}</span>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:8,borderTop:'1px solid rgba(255,255,255,.1)'}}>
            <span style={{fontSize:13,color:'rgba(255,255,255,.8)'}}>Yearly <span style={{fontSize:10,color:'#7fda96'}}>(save {Math.round((1-yearly/(monthly*12))*100)}%)</span></span>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,color:'#f9a84f',fontWeight:700}}>₦{yearly}</span>
          </div>
        </div>
        {/* Payment details */}
        <div style={{background:'rgba(0,0,0,.3)',border:'1px solid rgba(255,255,255,.1)',borderRadius:14,padding:'14px 16px',marginBottom:18}}>
          <div style={{fontSize:9,color:'rgba(255,255,255,.45)',fontFamily:"'IBM Plex Mono',monospace",letterSpacing:2,marginBottom:10}}>PAYMENT DETAILS</div>
          <div style={{fontSize:13,color:'#fff',fontWeight:600,marginBottom:6}}>{acctName}</div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}>
            <div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:22,color:'#fff',letterSpacing:2,fontWeight:700}}>{acctNum}</div>
              <div style={{fontSize:11,color:'rgba(7,243,7,.9)',fontWeight:600,marginTop:2}}>{bank}</div>
            </div>
            <button onClick={copyAcct} style={{background:copied?'rgba(127,218,150,.2)':'rgba(255,255,255,.12)',border:`1px solid ${copied?'rgba(127,218,150,.5)':'rgba(255,255,255,.2)'}`,borderRadius:8,color:copied?'#7fda96':'#fff',cursor:'pointer',padding:'8px 14px',fontSize:11,fontWeight:600,flexShrink:0,transition:'all .2s'}}>
              {copied?'✓ Copied':'Copy'}
            </button>
          </div>
        </div>
        {/* WhatsApp CTA */}
        <div style={{textAlign:'center',marginBottom:14}}>
          <div style={{fontSize:11,color:'rgba(255,255,255,.6)',marginBottom:10,lineHeight:1.5}}>After payment, verify on WhatsApp to activate Pro</div>
          {wa?(
            <a href={wa} target="_blank" rel="noopener noreferrer"
              style={{display:'inline-flex',alignItems:'center',gap:8,background:'#1fff02',color:'#000',padding:'12px 28px',borderRadius:12,fontSize:14,fontWeight:700,textDecoration:'none',boxShadow:'0 4px 20px rgba(31,255,2,.3)'}}>
              💬 Verify on WhatsApp
            </a>
          ):(
            <div style={{fontSize:11,color:'rgba(255,255,255,.35)',fontStyle:'italic'}}>WhatsApp link not configured — contact the admin</div>
          )}
        </div>
        <div style={{fontSize:10,color:'rgba(255,255,255,.3)',textAlign:'center',lineHeight:1.6}}>
          Pro access is activated within 24 hrs of verification by the superuser.
        </div>
      </div>
    </div>
  );
}


export { InstallPrompt, PWADiagnosticPanel, usePWAPrompt, useBrowserInfo };
