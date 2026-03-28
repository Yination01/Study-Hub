import React,{ useState } from 'react';
import { TIER_CONFIG, getSubVal } from '../lib/constants.js';


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
