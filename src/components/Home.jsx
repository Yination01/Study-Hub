import React,{ useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { supabase, ROLE, YEARS, DEPARTMENTS, DEPT_SHORT, DEPT_COLOR, USER_TYPES, YEAR_COLORS, YEAR_BG, ROLE_COLOR, ROLE_BG, CARD_ACCENTS, PRIORITY, CACHE_KEY, getSubVal, CODE_TO_DEPT, RES_ICONS, AI_MSG_KEY, getAiMsgCount, incAiMsgCount, APP_VERSION, COPYRIGHT_YEAR } from '../lib/constants.js';
import * as db from '../lib/db.js';
import { Tag, Mono, SectionLabel, Field, Avatar, RoleBadge, RolePill, ProgressBar, Logo, ThemeToggle, SearchBar } from './UI.jsx';
import { useNotificationPermission, pushNotification } from '../lib/hooks.js';
import { NotificationBell } from './CourseTabs.jsx';
import { StatusChangeModal } from './Admin.jsx';
import { SubscriptionBadge, PaymentPortal } from './Subscription.jsx';
import { usePWAPrompt } from './PWA.jsx';
import { CopyrightBar, GlobalAnnouncementStrip } from './Modals.jsx';

/* ═══════════════ COURSE CARD (memoised) ═══════════════ */
const CourseCard=memo(function CourseCard({course:c,index:i,pct,viewed,bookmarked,isPriv,onSelect}){
  const accent=YEAR_COLORS[c.year]||CARD_ACCENTS[i%CARD_ACCENTS.length];
  return(
    <div className={`stagger-${Math.min(i%4+1,4)}`}
      onClick={()=>onSelect(c.id)}
      style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:'18px 20px',
        cursor:'pointer',transition:'transform .18s,box-shadow .18s',
        borderTop:`3px solid ${accent}`,position:'relative',boxShadow:'none'}}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,.2)';}}
      onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>
      <div style={{position:'absolute',top:12,right:12,display:'flex',gap:6,alignItems:'center'}}>
        {viewed&&<div style={{width:7,height:7,borderRadius:'50%',background:'#7fda96'}} title="Visited"/>}
        {bookmarked&&<span style={{fontSize:12}}>🔖</span>}
      </div>
      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:accent,letterSpacing:2,textTransform:'uppercase',marginBottom:4,display:'flex',alignItems:'center',gap:6}}>
        {c.courseName} · SEM {c.semester}
        <span style={{background:`${DEPT_COLOR[c.department]||'#4f9cf9'}18`,color:DEPT_COLOR[c.department]||'#4f9cf9',borderRadius:4,padding:'1px 6px',fontSize:8,letterSpacing:1}}>{DEPT_SHORT[c.department]||'CS'}</span>
      </div>
      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:16,color:'var(--text)',marginBottom:11,lineHeight:1.3,paddingRight:30}}>{c.chapterTitle}</div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8}}>
        <Tag color={accent}>{c.conceptCount} concepts</Tag>
        <Tag color={accent}>{c.termCount} terms</Tag>
        <Tag color={accent}>{c.qCount} Q&A</Tag>
      </div>
      {!isPriv&&<ProgressBar pct={pct} color={accent}/>}
      <div style={{marginTop:9,fontSize:10,color:'var(--muted)',fontFamily:"'IBM Plex Mono',monospace"}}>Added {c.addedAt}</div>
    </div>
  );
});

/* ═══════════════ HOME ═══════════════ */
function Home({user,courses,progress,onSelectCourse,onLogout,onShowAdmin,onProgressUpdate,bookmarks,toggleBookmark,dark,toggleTheme,onOpenCourseTab}){
  const isExternal=user.role===ROLE.EXTERNAL;
  const[activeYear,setActiveYear]=useState(isExternal?'all':(user.year||1));
  const[activeSemester,setActiveSemester]=useState(1);
  const[activeDept,setActiveDept]=useState('all');
  const[searchRaw,setSearchRaw]=useState('');
  const[search,setSearch]=useState('');
  const[showBookmarks,setShowBookmarks]=useState(false);
  const[showStatusModal,setShowStatusModal]=useState(false);
  const[showPayment,setShowPayment]=useState(false);
  const[showPWADebug,setShowPWADebug]=useState(false);
  const[browseMode,setBrowseMode]=useState('year'); // 'year' | 'course'
  const nativePrompt=usePWAPrompt();
  const[statusMsg,setStatusMsg]=useState('');
  const isPriv=user.role===ROLE.SUPERUSER||user.role===ROLE.ADMIN;

  // Course code tiles data
  const courseCodes=useMemo(()=>{
    const map={};
    for(const c of courses){
      const code=normalizeCourseCode(c.courseName);
      if(!map[code]) map[code]={code,count:0,year:c.year,department:c.department,ids:[]};
      map[code].count++;map[code].ids.push(c.id);
    }
    return Object.values(map).sort((a,b)=>a.code.localeCompare(b.code));
  },[courses]);

  // Debounce search — input feels instant, filtering only runs after 150ms pause
  useEffect(()=>{
    const t=setTimeout(()=>setSearch(searchRaw),150);
    return()=>clearTimeout(t);
  },[searchRaw]);

  const visible=useMemo(()=>courses.filter(c=>{
    const matchYear=activeYear==='all'||c.year===activeYear;
    const matchSem=activeYear==='all'||c.semester===activeSemester;
    const matchDept=activeDept==='all'||c.department===activeDept;
    const lq=search.toLowerCase();
    const matchSearch=!search||c.chapterTitle.toLowerCase().includes(lq)||c.courseName.toLowerCase().includes(lq);
    return matchYear&&matchSem&&matchDept&&matchSearch;
  }),[courses,activeYear,activeSemester,activeDept,search]);

  const semCount=useCallback(s=>courses.filter(c=>(activeYear==='all'||c.year===activeYear)&&c.semester===s).length,[courses,activeYear]);
  const deptCount=useCallback(d=>courses.filter(c=>(activeYear==='all'||c.year===activeYear)&&(activeYear==='all'||c.semester===activeSemester)&&(d==='all'||c.department===d)).length,[courses,activeYear,activeSemester]);

  const bookmarkedCourses=useMemo(()=>courses.filter(c=>bookmarks.includes(c.id)),[courses,bookmarks]);
  const pct=useCallback(id=>{const cp=progress[id];const m=courses.find(c=>c.id===id);if(!cp||!m||m.qCount===0)return 0;return Math.round((cp.openedQs?.length||0)/m.qCount*100);},[progress,courses]);
  const yearStat=useCallback(y=>{const yc=courses.filter(c=>c.year===y);if(!yc.length)return null;return `${yc.filter(c=>progress[c.id]?.viewed).length}/${yc.length} started`;},[courses,progress]);

  const selectYear=useCallback(y=>{setActiveYear(y);setActiveSemester(1);setActiveDept('all');setSearch('');setSearchRaw('');},[]);

  return(
    <div className="home-page" style={{maxWidth:990,margin:'0 auto',padding:'34px 20px 88px'}}>
      {/* Top bar */}
      <div className="topbar fade-up" style={{
        display:'flex',alignItems:'center',justifyContent:'space-between',
        marginBottom:24,gap:10,flexWrap:'wrap',
        position:'sticky',top:0,
        background:'var(--bg)',
        zIndex:50,
        padding:'10px 0',
        marginLeft:-20,marginRight:-20,paddingLeft:20,paddingRight:20,
        borderBottom:'1px solid var(--border)',
        backdropFilter:'blur(12px)',
        WebkitBackdropFilter:'blur(12px)',
      }}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <Logo onClick={null} size="md"/>
          <div style={{width:1,height:32,background:'var(--border)'}}/>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <Avatar name={user.displayName} size={34}/>
            <div>
              <div style={{fontSize:14,fontWeight:600,color:'var(--text)'}}>{user.displayName}</div>
              <div style={{display:'flex',alignItems:'center',gap:6,marginTop:3,flexWrap:'wrap'}}>
                <RolePill role={user.role} accountType={user.accountType||user.account_type}/>
                {!user.isGuest&&<SubscriptionBadge tier={user.subscription_tier||'free'}/>}
                {user.role===ROLE.USER&&!user.isGuest&&<Mono color="var(--muted)" size={9}>Yr {user.year} · @{user.username}</Mono>}
                {isExternal&&<Mono color="#a8f94f" size={9}>@{user.username} · External</Mono>}
                {user.isGuest&&<Mono color="var(--muted)" size={9}>Preview mode</Mono>}
              </div>
            </div>
          </div>
        </div>

        {/* Right side — ordered: theme | install | bookmarks | change status | panel | sign out | 🔔 */}
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',flexShrink:0}}>
          <ThemeToggle dark={dark} toggle={toggleTheme}/>

          {/* Install App */}
          {!window.matchMedia('(display-mode: standalone)').matches&&!window.navigator.standalone&&nativePrompt&&(
            <button onClick={async()=>{
              if(!nativePrompt)return;
              nativePrompt.prompt();
              const{outcome}=await nativePrompt.userChoice;
              if(outcome==='accepted') savePwaState({neverShow:true});
              _pwaPromptEvent=null;
            }} style={{background:'rgba(79,156,249,.1)',border:'1px solid rgba(79,156,249,.3)',borderRadius:8,color:'#4f9cf9',cursor:'pointer',padding:'8px 12px',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',gap:5}}>
              📲 Install App
            </button>
          )}

          {/* Bookmarks */}
          {bookmarks.length>0&&<button onClick={()=>setShowBookmarks(s=>!s)} style={{background:showBookmarks?'rgba(249,168,79,.15)':'var(--surface)',border:`1px solid ${showBookmarks?'#f9a84f':'var(--border)'}`,borderRadius:8,color:showBookmarks?'#f9a84f':'var(--muted)',cursor:'pointer',padding:'8px 12px',fontSize:13,display:'flex',alignItems:'center',gap:5}}>🔖<span className="hide-xs">{bookmarks.length}</span></button>}

          {/* Upgrade to Pro — shown for free-tier students/external, not guests/admins */}
          {!user.isGuest&&(user.role===ROLE.USER||user.role===ROLE.EXTERNAL)&&(user.subscription_tier||'free')==='free'&&(
            <button onClick={()=>setShowPayment(true)}
              style={{background:'linear-gradient(135deg,rgba(249,168,79,.18),rgba(249,168,79,.08))',
                border:'1px solid rgba(249,168,79,.4)',borderRadius:8,
                color:'#f9a84f',cursor:'pointer',padding:'8px 12px',fontSize:12,fontWeight:700,
                display:'flex',alignItems:'center',gap:5,whiteSpace:'nowrap'}}>
              ⭐ <span className="hide-xs">Upgrade</span>
            </button>
          )}

          {/* Change Status */}
          {!user.isGuest&&(user.role===ROLE.USER||user.role===ROLE.EXTERNAL)&&(
            <button onClick={()=>setShowStatusModal(true)} title="Request account status change" style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'8px 12px',fontSize:12,display:'flex',alignItems:'center',gap:5}}>
              🔄 <span className="hide-xs">Change Status</span>
            </button>
          )}

          {/* Admin Panel */}
          {isPriv&&<button onClick={onShowAdmin} style={{background:ROLE_BG[user.role],border:`1px solid ${ROLE_COLOR[user.role]}40`,borderRadius:8,color:ROLE_COLOR[user.role],cursor:'pointer',padding:'8px 14px',fontSize:12,fontWeight:600}}>{user.role===ROLE.SUPERUSER?'⚡ Panel':'⚙ Panel'}</button>}

          {/* Sign Out */}
          <button onClick={onLogout} title={user.isGuest?'Sign In':'Sign Out'} style={{background:user.isGuest?'#4f9cf9':'none',border:user.isGuest?'none':'1px solid var(--border)',borderRadius:8,color:user.isGuest?'#000':'var(--muted)',cursor:'pointer',padding:'8px 14px',fontSize:12,fontWeight:user.isGuest?700:400}}>
            {user.isGuest?'Sign In':'Sign Out'}
          </button>

          {/* 🔔 Bell — always far right */}
          {!user.isGuest&&<NotificationBell user={user} courses={courses} onNavigate={(courseId,tab)=>{onSelectCourse(courseId,tab);}}/>}
        </div>
      </div>

      {/* PWA Diagnostic panel */}
      {showPayment&&<PaymentPortal user={user} onClose={()=>setShowPayment(false)}/> }
      {showPWADebug&&<PWADiagnosticPanel onClose={()=>setShowPWADebug(false)}/>}

      {/* Status change modal */}
      {showStatusModal&&<StatusChangeModal user={user} onClose={()=>setShowStatusModal(false)} onSubmitted={()=>{setStatusMsg('✓ Request submitted — an admin will review it shortly.');setTimeout(()=>setStatusMsg(''),4000);}}/>}
      {statusMsg&&<div className="slide-down" style={{background:'rgba(168,249,79,.08)',border:'1px solid rgba(168,249,79,.3)',borderRadius:8,padding:'10px 16px',color:'#a8f94f',fontSize:13,marginBottom:14}}>{statusMsg}</div>}

      {/* Bookmarks panel */}
      {showBookmarks&&bookmarkedCourses.length>0&&(
        <div className="scale-in" style={{background:'var(--surface)',border:'1px solid rgba(249,168,79,.3)',borderRadius:12,padding:'18px 20px',marginBottom:24}}>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'#f9a84f',letterSpacing:2,marginBottom:14}}>🔖 BOOKMARKED COURSES</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:10}}>
            {bookmarkedCourses.map(c=>(
              <div key={c.id} onClick={()=>onSelectCourse(c.id)} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,padding:'12px 14px',cursor:'pointer',borderLeft:`3px solid ${YEAR_COLORS[c.year]}`}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:YEAR_COLORS[c.year],marginBottom:3}}>Yr {c.year} · Sem {c.semester} · {DEPT_SHORT[c.department]||'CS'} · {c.courseName}</div>
                <div style={{fontSize:13,color:'var(--text)',fontWeight:500}}>{c.chapterTitle}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Global announcements strip */}
      <GlobalAnnouncementStrip user={user}/>

      {/* ── Browse mode toggle ── */}
      <div className="stagger-1" style={{marginBottom:18,display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:3,display:'inline-flex',gap:2}}>
          {[{id:'year',label:'📅 By Year'},{id:'course',label:'📂 By Course'}].map(m=>(
            <button key={m.id} onClick={()=>{setBrowseMode(m.id);setSearch('');setSearchRaw('');}}
              style={{padding:'7px 16px',borderRadius:8,border:'none',background:browseMode===m.id?'var(--card)':'none',color:browseMode===m.id?'var(--text)':'var(--muted)',cursor:'pointer',fontSize:12,fontWeight:browseMode===m.id?600:400,boxShadow:browseMode===m.id?'0 1px 4px rgba(0,0,0,.2)':'none',transition:'all .15s'}}>
              {m.label}
            </button>
          ))}
        </div>
        {browseMode==='course'&&<Mono color="var(--muted)" size={9}>{courseCodes.length} COURSE{courseCodes.length!==1?'S':''}</Mono>}
      </div>

      {/* ── BY COURSE mode ── */}
      {browseMode==='course'&&(
        <div className="fade-in">
          {courseCodes.length===0?(
            <div style={{textAlign:'center',padding:'40px 24px',border:'1px dashed var(--border)',borderRadius:12,color:'var(--muted)',fontSize:13,marginBottom:24}}>
              No courses yet.{isPriv&&<span style={{marginLeft:6}}>Open the admin panel to add some.</span>}
            </div>
          ):(
            <>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:10,marginBottom:16}}>
                {courseCodes.map((c,i)=>{
                  const accent=YEAR_COLORS[c.year]||CARD_ACCENTS[i%CARD_ACCENTS.length];
                  const deptColor=DEPT_COLOR[c.department]||'#4f9cf9';
                  const visitedC=c.ids.filter(id=>progress[id]?.viewed).length;
                  return(
                    <button key={c.code} onClick={()=>onOpenCourseTab&&onOpenCourseTab(c.code)}
                      style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:'16px 14px',textAlign:'left',cursor:'pointer',borderTop:`3px solid ${accent}`,transition:'transform .15s,box-shadow .15s',position:'relative'}}
                      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,.2)';}}
                      onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:17,fontWeight:700,color:accent,marginBottom:5,letterSpacing:.5}}>{c.code}</div>
                      <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:6}}>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,background:`${deptColor}18`,color:deptColor,borderRadius:4,padding:'1px 6px'}}>{DEPT_SHORT[c.department]||c.department?.slice(0,3)||'CS'}</span>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,background:YEAR_BG[c.year],color:accent,borderRadius:4,padding:'1px 6px'}}>Yr {c.year}</span>
                      </div>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)'}}>
                        {c.count} chapter{c.count!==1?'s':''}
                        {visitedC>0&&<span style={{color:'#7fda96',marginLeft:5}}>· {visitedC} visited</span>}
                      </div>
                      <span style={{position:'absolute',bottom:10,right:12,color:'var(--muted)',fontSize:14}}>›</span>
                    </button>
                  );
                })}
              </div>
              {/* Search within course mode */}
              <SearchBar value={searchRaw} onChange={setSearchRaw} placeholder="Search all chapters…"/>
              {search&&(
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(278px,1fr))',gap:14,marginTop:12}}>
                  {courses.filter(c=>{const lq=search.toLowerCase();return c.chapterTitle.toLowerCase().includes(lq)||c.courseName.toLowerCase().includes(lq);}).map((c,i)=>(
                    <CourseCard key={c.id} course={c} index={i} pct={pct(c.id)} viewed={!!progress[c.id]?.viewed} bookmarked={bookmarks.includes(c.id)} isPriv={isPriv} onSelect={onSelectCourse}/>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── BY YEAR mode ── */}
      {browseMode==='year'&&(<>

      {/* Year tabs */}
      <div className="stagger-1" style={{marginBottom:16}}>
        <Mono color="var(--muted)" size={9}>YEAR</Mono>
        <div className="year-tabs" style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:10}}>
          {isExternal&&(
            <button className="year-tab" onClick={()=>selectYear('all')} style={{background:activeYear==='all'?'rgba(168,249,79,.1)':'var(--surface)',border:`1px solid ${activeYear==='all'?'rgba(168,249,79,.4)':'var(--border)'}`,borderRadius:10,cursor:'pointer',padding:'10px 18px',transition:'var(--transition)',textAlign:'left'}}>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:16,color:activeYear==='all'?'#a8f94f':'var(--text)'}}>All Years</div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:activeYear==='all'?'#a8f94faa':'var(--muted)',marginTop:2}}>{courses.length} courses</div>
            </button>
          )}
          {YEARS.map(y=>{const active=activeYear===y;const st=yearStat(y);return(
            <button key={y} className="year-tab" onClick={()=>selectYear(y)} style={{background:active?YEAR_BG[y]:'var(--surface)',border:`1px solid ${active?YEAR_COLORS[y]+'60':'var(--border)'}`,borderRadius:10,cursor:'pointer',padding:'10px 18px',transition:'var(--transition)',textAlign:'left'}}>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:16,color:active?YEAR_COLORS[y]:'var(--text)'}}>Year {y}</div>
              {st&&<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:active?YEAR_COLORS[y]+'aa':'var(--muted)',marginTop:2}}>{st}</div>}
            </button>
          );})}
        </div>
      </div>

      {/* Semester tabs */}
      {activeYear!=='all'&&<div className="stagger-2" style={{marginBottom:20}}>
        <Mono color="var(--muted)" size={9}>SEMESTER</Mono>
        <div style={{display:'flex',gap:8,marginTop:8}}>
          {[1,2].map(s=>{
            const active=activeSemester===s;
            const count=semCount(s);
            const accent=typeof activeYear==='number'?YEAR_COLORS[activeYear]:'#4f9cf9';
            return(
              <button key={s} onClick={()=>setActiveSemester(s)} style={{background:active?(typeof activeYear==='number'?YEAR_BG[activeYear]:'rgba(79,156,249,.1)'):'var(--surface)',border:`1px solid ${active?accent+'60':'var(--border)'}`,borderRadius:10,cursor:'pointer',padding:'9px 20px',transition:'var(--transition)',display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontFamily:"'DM Serif Display',serif",fontSize:15,color:active?accent:'var(--text)'}}>Semester {s}</span>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:active?`${accent}20`:'var(--border)',color:active?accent:'var(--muted)',borderRadius:10,padding:'2px 7px'}}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>}

      {/* Search */}
      <div className="stagger-3" style={{marginBottom:16}}>
        <div style={{position:'relative'}}>
          <SearchBar value={searchRaw} onChange={setSearchRaw} placeholder={activeYear==='all'?`Search all courses…`:`Search Year ${activeYear} Sem ${activeSemester}${activeDept!=='all'?' · '+DEPT_SHORT[activeDept]:''} courses…`}/>
          {!searchRaw&&<div className="kbd-hint" style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:4,padding:'1px 6px',pointerEvents:'none'}}>Press /</div>}
        </div>
      </div>

      {/* Department filter */}
      <div className="stagger-4" style={{marginBottom:20}}>
        <Mono color="var(--muted)" size={9}>DEPARTMENT</Mono>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
          {[{label:'All Departments',key:'all',color:'#8892a4'},...DEPARTMENTS.map(d=>({label:d,key:d,color:DEPT_COLOR[d]}))].map(({label,key,color})=>{
            const active=activeDept===key;
            return(
              <button key={key} onClick={()=>setActiveDept(key)} style={{background:active?`${color}15`:'var(--surface)',border:`1px solid ${active?color+'60':'var(--border)'}`,borderRadius:10,cursor:'pointer',padding:'8px 16px',transition:'var(--transition)',display:'flex',alignItems:'center',gap:7}}>
                {key!=='all'&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,background:active?`${color}25`:'var(--border)',color:active?color:'var(--muted)',borderRadius:4,padding:'2px 6px'}}>{DEPT_SHORT[key]}</span>}
                <span style={{fontSize:13,color:active?color:'var(--text)',fontWeight:active?600:400}}>{label}</span>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:active?`${color}20`:'var(--border)',color:active?color:'var(--muted)',borderRadius:10,padding:'2px 7px'}}>{deptCount(key)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Mono color="var(--muted)" size={9}>{visible.length} COURSE{visible.length!==1?'S':''}{activeYear==='all'?` · ALL YEARS`:` · YEAR ${activeYear} · SEM ${activeSemester}`}{activeDept!=='all'?` · ${DEPT_SHORT[activeDept]}`:''}{search?` · "${search}"`:''}</Mono>

      {visible.length===0?(
        <div style={{textAlign:'center',padding:'50px 24px',border:'1px dashed var(--border)',borderRadius:16,marginTop:16,background:'var(--surface)'}}>
          <div style={{fontSize:48,marginBottom:14,lineHeight:1}}>{search?'🔍':isPriv?'➕':'📭'}</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:'var(--text)',marginBottom:8}}>
            {search?`No results for "${search}"`
             :activeYear==='all'?'No courses yet'
             :`No Year ${activeYear}, Semester ${activeSemester} courses yet`}
          </div>
          <p style={{color:'var(--muted)',fontSize:13,lineHeight:1.6,maxWidth:280,margin:'0 auto 16px'}}>
            {search?'Try a different keyword or clear the search.'
             :isPriv?'Open the admin panel and add courses for this year and semester.'
             :'No courses have been added here yet. Check back soon.'}
          </p>
          {search&&<button onClick={()=>{setSearch('');setSearchRaw('');}} style={{background:'rgba(79,156,249,.1)',border:'1px solid rgba(79,156,249,.3)',borderRadius:8,color:'#4f9cf9',cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:600}}>Clear search</button>}
          {!search&&isPriv&&<button onClick={onShowAdmin} style={{background:ROLE_BG[user.role],border:`1px solid ${ROLE_COLOR[user.role]}40`,borderRadius:8,color:ROLE_COLOR[user.role],cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:600}}>{user.role===ROLE.SUPERUSER?'⚡ Open Panel':'⚙ Open Panel'}</button>}
        </div>
      ):(
        <div className="course-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(278px,1fr))',gap:14,marginTop:16}}>
          {visible.map((c,i)=>(
            <CourseCard key={c.id} course={c} index={i} pct={pct(c.id)}
              viewed={!!progress[c.id]?.viewed} bookmarked={bookmarks.includes(c.id)}
              isPriv={isPriv} onSelect={onSelectCourse}/>
          ))}
        </div>
      )}
      </>)}
    </div>
  );
}


export { Home, CourseCard };
