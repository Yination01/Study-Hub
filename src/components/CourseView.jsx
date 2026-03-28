import React,{ useState, useEffect, useCallback } from 'react';
import { supabase, ROLE, YEARS, DEPARTMENTS, DEPT_SHORT, DEPT_COLOR, USER_TYPES, YEAR_COLORS, YEAR_BG, ROLE_COLOR, ROLE_BG, CARD_ACCENTS, PRIORITY, RES_ICONS, CACHE_KEY, APP_VERSION, getSubVal, getAiMsgCount, incAiMsgCount, TIER_CONFIG } from '../lib/constants.js';
import * as db from '../lib/db.jsx';
import { Tag, Mono, SectionLabel, Field, Avatar, RolePill, ProgressBar, Logo } from './UI.jsx';
import { AnnouncementsTab, NotificationBell, AssignmentsTab, CATab, CommunityBoard, ResourcesTab } from './CourseTabs.jsx';
import { Chatbot } from './Chatbot.jsx';

/* ═══════════════ COURSE VIEW ═══════════════ */
/* Definition row with copy-to-clipboard */
export function DefinitionRow({def,isLast}){
  const[copied,setCopied]=useState(false);
  const copy=()=>{
    navigator.clipboard.writeText(`${def.term}: ${def.definition}`);
    setCopied(true);setTimeout(()=>setCopied(false),1500);
  };
  return(
    <div className="def-grid" style={{display:'grid',gridTemplateColumns:'190px 1fr auto',borderBottom:isLast?'none':'1px solid var(--border)',alignItems:'stretch'}} className="fade-in">
      <div className="def-term" style={{padding:'12px 14px',fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:600,color:'#7fda96',background:'var(--surface)',display:'flex',alignItems:'center'}}>{def.term}</div>
      <div style={{padding:'12px 14px',fontSize:13,color:'var(--text)',lineHeight:1.7}}>{def.definition}</div>
      <button onClick={copy} title="Copy term and definition" style={{background:'none',border:'none',color:copied?'#7fda96':'var(--muted)',cursor:'pointer',padding:'0 12px',fontSize:13,flexShrink:0,opacity:copied?1:.5}} onMouseEnter={e=>e.currentTarget.style.opacity='1'} onMouseLeave={e=>!copied&&(e.currentTarget.style.opacity='.5')}>
        {copied?'✓':'⎘'}
      </button>
    </div>
  );
}

export const ALL_TABS=[{id:'announcements',label:'📢 Announcements'},{id:'concepts',label:'Key Concepts'},{id:'definitions',label:'Definitions'},{id:'mechanisms',label:'Mechanisms'},{id:'algorithms',label:'Algorithms'},{id:'takeaways',label:'Takeaways'},{id:'questions',label:'Practice Q&A'},{id:'assignments',label:'📋 Assignments'},{id:'ca',label:'📝 CA / Tests'},{id:'resources',label:'Resources'},{id:'community',label:'Community'}];

export function CourseView({course,user,progress,onBack,onProgressUpdate,bookmarks,toggleBookmark,courses}){
  const[tab,setTab]=useState(course.initialTab||'announcements');const[openQ,setOpenQ]=useState(null);const[filter,setFilter]=useState('');
  const d=course.data;const cp=progress[course.id]||{viewed:false,openedQs:[]};const isPriv=user.role!==ROLE.USER;
  const isBookmarked=bookmarks.includes(course.id);

  // Cache for offline use
  useEffect(()=>{try{localStorage.setItem(CACHE_KEY(course.id),JSON.stringify({data:d,year:course.year,semester:course.semester||1,department:course.department||'Computer Science',cachedAt:Date.now()}));}catch{};},[]);
  useEffect(()=>{if(!cp.viewed){const n={...progress,[course.id]:{...cp,viewed:true}};onProgressUpdate(n);}},[]);

  const revealQ=idx=>{setOpenQ(openQ===idx?null:idx);if(!cp.openedQs.includes(idx)){const n={...progress,[course.id]:{...cp,openedQs:[...cp.openedQs,idx]}};onProgressUpdate(n);}};

  const totalQ=d.questions?.length||0;const pct=totalQ===0?0:Math.round(cp.openedQs.length/totalQ*100);
  const hasAlgo=d.algorithms?.length>0;
  const tabs=ALL_TABS.filter(t=>t.id!=='algorithms'||hasAlgo);
  const filteredQ=(d.questions||[]).filter(q=>!filter||q.question.toLowerCase().includes(filter.toLowerCase()));
  const accent=YEAR_COLORS[course.year]||'#4f9cf9';
  const chatCtx={courseName:d.courseName,chapterTitle:d.chapterTitle,summary:[d.keyConcepts?.slice(0,5).map(c=>c.title).join(', '),d.chapters?.map(c=>c.name).join(', ')].filter(Boolean).join(' | ')};

  return(
    <div className="course-page" style={{maxWidth:960,margin:'0 auto',padding:'28px 20px 88px'}}>
      {/* Top bar */}
      <div className="topbar" style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:26,flexWrap:'wrap',gap:10}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Logo onClick={onBack} size="sm"/>
          <button onClick={onBack} style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'6px 14px',fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}>← All Courses</button>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
          <RolePill role={user.role} accountType={user.accountType||user.account_type}/>
          <div style={{background:YEAR_BG[course.year],border:`1px solid ${accent}40`,borderRadius:6,padding:'4px 12px'}}><Mono color={accent} size={9}>Year {course.year} · Semester {course.semester||1}</Mono></div>
          {course.data?.department&&<div style={{background:`${DEPT_COLOR[course.data.department]||'#4f9cf9'}12`,border:`1px solid ${DEPT_COLOR[course.data.department]||'#4f9cf9'}30`,borderRadius:6,padding:'4px 12px'}}><Mono color={DEPT_COLOR[course.data.department]||'#4f9cf9'} size={9}>{DEPT_SHORT[course.data.department]||'CS'}</Mono></div>}
          {!isPriv&&<div style={{fontSize:12,color:'var(--muted)'}}>{cp.openedQs.length}/{totalQ} revealed</div>}
          <button onClick={()=>toggleBookmark(course.id)} title={isBookmarked?'Remove bookmark':'Bookmark'} style={{background:isBookmarked?'rgba(249,168,79,.15)':'var(--surface)',border:`1px solid ${isBookmarked?'#f9a84f':'var(--border)'}`,borderRadius:8,color:isBookmarked?'#f9a84f':'var(--muted)',cursor:'pointer',padding:'7px 12px',fontSize:13}}>
            {isBookmarked?'🔖':'🔖'}
          </button>
          <button onClick={()=>exportCoursePDF(d,d.chapterTitle)} title="Export to PDF" style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'7px 12px',fontSize:13}}>⬇ PDF</button>
        </div>
      </div>

      {/* Header */}
      <div className="fade-up" style={{borderBottom:'1px solid var(--border)',paddingBottom:24,marginBottom:28}}>
        <Mono>{d.courseName}</Mono>
        <h1 style={{fontFamily:"'DM Serif Display',serif",fontSize:'clamp(22px,4vw,38px)',color:'var(--text)',lineHeight:1.15,margin:'8px 0 10px'}}>{d.chapterTitle}</h1>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <Tag>{d.keyConcepts?.length||0} concepts</Tag>
          <Tag color="#f9a84f">{d.definitions?.length||0} terms</Tag>
          <Tag color="#7fda96">{totalQ} questions</Tag>
        </div>
        {!isPriv&&<ProgressBar pct={pct} color={accent}/>}
      </div>

      {/* Tabs */}
      <div className="course-tabs-row" style={{display:'flex',gap:2,flexWrap:'wrap',borderBottom:'1px solid var(--border)',marginBottom:28,overflowX:'auto'}}>
        {tabs.map(t=><button key={t.id} className="tab-btn" onClick={()=>setTab(t.id)} style={{background:tab===t.id?'rgba(79,156,249,.08)':'none',border:'none',borderBottom:tab===t.id?'2px solid #4f9cf9':'2px solid transparent',color:tab===t.id?'#4f9cf9':'var(--muted)',cursor:'pointer',padding:'9px 14px',fontSize:13,fontWeight:tab===t.id?600:400,whiteSpace:'nowrap'}}>{t.label}</button>)}
      </div>

      {/* Tab content */}
      {tab==='concepts'&&<div className="fade-up"><SectionLabel>Key Concepts</SectionLabel><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(252px,1fr))',gap:12}}>{(d.keyConcepts||[]).map((c,i)=><div key={i} className={`stagger-${Math.min(i%4+1,4)}`} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:'15px 17px',borderLeft:`3px solid ${(COLOR_MAP[c.color]||COLOR_MAP.blue).bar}`}}><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:600,color:'var(--text)',marginBottom:5}}>{c.title}</div><p style={{fontSize:12.5,color:'var(--muted)',lineHeight:1.65,margin:0}}>{c.description}</p></div>)}</div></div>}

      {tab==='definitions'&&<div className="fade-up"><SectionLabel>Terms & Definitions</SectionLabel><div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,overflow:'hidden'}}>{(d.definitions||[]).map((def,i)=><DefinitionRow key={i} def={def} isLast={i===d.definitions.length-1}/>)}</div></div>}

      {tab==='mechanisms'&&<div className="fade-up"><SectionLabel>Mechanisms Explained</SectionLabel><div style={{display:'flex',flexDirection:'column',gap:13}}>{(d.mechanisms||[]).map((m,i)=><div key={i} className={`stagger-${Math.min(i+1,4)}`} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:'18px 22px'}}><div style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:'var(--text)',marginBottom:10}}>{m.title}</div><p style={{fontSize:13,color:'var(--muted)',lineHeight:1.85,margin:0,whiteSpace:'pre-line'}}>{m.body}</p></div>)}</div></div>}

      {tab==='algorithms'&&hasAlgo&&<div className="fade-up"><SectionLabel>Algorithms & Methods</SectionLabel><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(228px,1fr))',gap:11}}>{(d.algorithms||[]).map((a,i)=><div key={i} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,padding:'13px 15px'}}><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'#da7ff0',fontWeight:600,marginBottom:5}}>{a.name}</div><p style={{fontSize:12,color:'var(--muted)',lineHeight:1.65,margin:0}}>{a.description}</p>{a.note&&<p style={{fontSize:11,color:'#f9a84f',marginTop:5,marginBottom:0}}>{a.note}</p>}</div>)}</div></div>}

      {tab==='takeaways'&&<div className="fade-up"><SectionLabel>Takeaways Per Chapter</SectionLabel><div style={{display:'flex',flexDirection:'column',gap:15}}>{(d.chapters||[]).map((ch,i)=><div key={i} className={`stagger-${Math.min(i+1,4)}`} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:'18px 22px'}}><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',letterSpacing:2,textTransform:'uppercase',marginBottom:3}}>{ch.num}</div><div style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:'var(--text)',marginBottom:11}}>{ch.name}</div><div style={{display:'flex',flexDirection:'column',gap:9}}>{(ch.takeaways||[]).map((t,j)=><div key={j} style={{display:'flex',gap:11,alignItems:'flex-start',fontSize:13,color:'var(--text)'}}><span style={{color:'#da7ff0',flexShrink:0}}>→</span><span>{t}</span></div>)}</div></div>)}</div></div>}

      {tab==='questions'&&(
        <div className="fade-up">
          <SectionLabel>Practice Questions & Answers</SectionLabel>
          {!isPriv&&<div style={{background:'rgba(79,156,249,.05)',border:'1px solid rgba(79,156,249,.15)',borderRadius:8,padding:'9px 13px',marginBottom:14,display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:6,fontSize:12,color:'var(--muted)'}}>
            <span>Click to reveal answers — progress saved automatically.</span>
            <span style={{color:'#4f9cf9',fontFamily:"'IBM Plex Mono',monospace",fontSize:10}}>{cp.openedQs.length}/{totalQ} opened</span>
          </div>}
          <SearchBar value={filter} onChange={setFilter} placeholder="Search questions…"/>
          <Mono color="var(--muted)" size={9}>SHOWING {filteredQ.length} OF {totalQ} QUESTIONS</Mono>
          <div style={{display:'flex',flexDirection:'column',gap:9,marginTop:12}}>
            {filteredQ.map(q=>{const ri=(d.questions||[]).indexOf(q);const isOpen=openQ===ri;const seen=cp.openedQs.includes(ri);return(
              <div key={ri} className="fade-in" style={{background:'var(--card)',border:`1px solid ${seen?'rgba(127,218,150,.3)':'var(--border)'}`,borderRadius:10,overflow:'hidden'}}>
                <div onClick={()=>revealQ(ri)} style={{padding:'13px 17px',display:'flex',alignItems:'flex-start',gap:12,cursor:'pointer'}}>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:seen?'#7fda96':'#4f9cf9',color:'#000',borderRadius:4,padding:'2px 6px',flexShrink:0,marginTop:3}}>Q{ri+1}</span>
                  <span style={{fontSize:13.5,color:'var(--text)',fontWeight:500,lineHeight:1.6,flex:1}}>{q.question}</span>
                  <span style={{color:'var(--muted)',fontSize:18,flexShrink:0,lineHeight:1}}>{isOpen?'−':'+'}</span>
                </div>
                {isOpen&&<div className="fade-in" style={{borderTop:'1px solid var(--border)',padding:'14px 17px',background:'rgba(79,156,249,.03)'}}>
                  <Mono color="#7fda96" size={9}>Answer</Mono>
                  <p style={{fontSize:13,color:'var(--text)',lineHeight:1.8,margin:'8px 0 0',whiteSpace:'pre-line'}}>{q.answer}</p>
                </div>}
              </div>
            );})}
          </div>
        </div>
      )}

      {tab==='announcements'&&<AnnouncementsTab courseId={course.id} user={user} onNew={()=>{}}/>}
      {tab==='assignments'&&<AssignmentsTab courseId={course.id} user={user}/>}
      {tab==='ca'&&<CATab courseId={course.id} user={user}/>}
      {tab==='resources'&&<ResourcesTab courseId={course.id} user={user}/>}
      {tab==='community'&&<CommunityBoard courseId={course.id} user={user}/>}
    </div>
  );
}
