import React,{ useState, useEffect, useRef } from 'react';
import { supabase, ROLE, YEARS, DEPARTMENTS, DEPT_SHORT, DEPT_COLOR, USER_TYPES, YEAR_COLORS, YEAR_BG, ROLE_COLOR, ROLE_BG, ROLE_ICON, COLOR_MAP, CARD_ACCENTS, PRIORITY, RES_ICONS, CACHE_KEY, APP_VERSION, COPYRIGHT_YEAR, CODE_TO_DEPT, detectMetadata, getSubVal, getAiMsgCount, incAiMsgCount, AI_MSG_KEY, TIER_CONFIG, css } from '../lib/constants.js';
import * as db from '../lib/db.jsx';
import { Field, Logo, Mono, ThemeToggle } from './UI.jsx';

/* ═══════════════ AUTH SCREEN ═══════════════ */
export function AuthScreen({onLogin,onGuest,dark,toggleTheme}){
  const[tab,setTab]=useState('signin');
  const[f,setF]=useState({username:'',password:'',confirm:'',year:3,accountType:'student'});
  const[errs,setErrs]=useState({});const[loading,setLoading]=useState(false);
  const set=(k,v)=>{setF(p=>({...p,[k]:v}));setErrs(p=>({...p,[k]:''}));};

  const signIn=async()=>{
    const e={};if(!f.username.trim())e.username='Required';if(!f.password)e.password='Required';
    if(Object.keys(e).length){setErrs(e);return;}setLoading(true);

    // Check superuser server-side first — credentials never compared in browser
    try{
      const suResult = await checkSuperuser(f.username, f.password);
      if(suResult){
        onLogin({username:f.username.toLowerCase(),displayName:'Owner',role:ROLE.SUPERUSER});
        return;
      }
    }catch{}

    // Regular user login
    try{
      const users=await dbLoadUsers();const user=users.find(u=>u.username.toLowerCase()===f.username.toLowerCase());
      if(!user||user.pw_hash!==hashStr(f.password)){setErrs({password:'Incorrect username or password.'});setLoading(false);return;}
      const role=await resolveRole(user.username);
      onLogin({username:user.username,displayName:user.display_name||user.username,year:user.year,role,accountType:user.account_type||'student'});
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
              <Field label="PASSWORD" type="password" value={f.password} onChange={e=>set('password',e.target.value)} placeholder="••••••••" error={errs.password} onKeyDown={e=>e.key==='Enter'&&signIn()}/>
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
