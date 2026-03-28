import React,{ useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { supabase, ROLE, YEARS, DEPARTMENTS, DEPT_SHORT, DEPT_COLOR, USER_TYPES, YEAR_COLORS, YEAR_BG, ROLE_COLOR, ROLE_BG, CARD_ACCENTS, PRIORITY, CACHE_KEY, APP_VERSION, COPYRIGHT_YEAR, getSubVal, getAiMsgCount, incAiMsgCount, AI_MSG_KEY } from '../lib/constants.js';
import * as db from '../lib/db.js';
import { Tag, Mono, SectionLabel, Field, Avatar, RoleBadge, RolePill, ProgressBar, Logo, ThemeToggle, SearchBar } from './UI.jsx';
import { ROLE } from '../lib/constants.js';

/* ═══════════════ CHATBOT (persistent) ═══════════════ */
const QUICK_PROMPTS=['Explain this topic simply','Give me 5 extra practice questions','What are the most important concepts?','Summarise this in bullet points','What might come up in an exam?'];
const SEARCH_PREFIXES=['find ','search ','what is ','what are ','how do i ','how does ','explain ','show me ','list ','define ','describe '];
const isSearchQuery=t=>SEARCH_PREFIXES.some(p=>t.toLowerCase().startsWith(p))||t.endsWith('?');

function Chatbot({context,courses,user}){
  // Persist open state — remember how the user left it, never force-open
  const[open,setOpen]=useState(()=>{
    try{return localStorage.getItem('sh-bot-open')==='1';}catch{return false;}
  });
  const[minimised,setMinimised]=useState(false);
  const[messages,setMessages]=useState([]);
  const[input,setInput]=useState('');
  const[loading,setLoading]=useState(false);
  const[tab,setTab]=useState('chat');
  const[searchResults,setSearchResults]=useState([]);
  const[searchQ,setSearchQ]=useState('');
  const bottomRef=useRef();const inputRef=useRef();

  const toggleOpen=v=>{const next=v!==undefined?v:!open;setOpen(next);try{localStorage.setItem('sh-bot-open',next?'1':'0');}catch{}};
  const[assignmentCtx,setAssignmentCtx]=useState(null); // set when AI Help clicked

  // Listen for assignment help requests from AssignmentsTab
  useEffect(()=>{
    const h=e=>{
      const ctx=e.detail;
      setAssignmentCtx(ctx);
      setMessages([{role:'assistant',content:`I'm ready to help with the assignment: **${ctx.assignmentTitle}**.\n\nI'll read through it carefully, answer each question step-by-step, and verify my answers.\n\nDescribe the questions you need help with, or paste the assignment text here.`}]);
      setTab('chat');
      toggleOpen(true);
    };
    window.addEventListener('sh-open-bot-assignment',h);
    return()=>window.removeEventListener('sh-open-bot-assignment',h);
  },[]);

  const getWelcome=()=>{
    if(context?.chapterTitle) return `Hi! I can see you're studying **${context.chapterTitle}**. Ask me anything — or search for a course below. 🎓`;
    return `Hi${user?.displayName?' '+user.displayName:''}! I'm StudyBot. Ask me anything, search for courses, or explore topics across all your courses. 🎓`;
  };

  useEffect(()=>{
    if(open&&messages.length===0) setMessages([{role:'assistant',content:getWelcome()}]);
  },[open]);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'});},[messages,loading]);
  useEffect(()=>{if(open&&!minimised)setTimeout(()=>inputRef.current?.focus(),120);},[open,minimised]);
  useEffect(()=>{setMessages([]);},[context?.chapterTitle]);

  // Course search
  const doSearch=q=>{
    if(!q.trim()){setSearchResults([]);return;}
    const lq=q.toLowerCase();
    const res=(courses||[]).filter(c=>
      c.chapterTitle.toLowerCase().includes(lq)||
      c.courseName.toLowerCase().includes(lq)
    ).slice(0,8);
    setSearchResults(res);
  };

  useEffect(()=>{doSearch(searchQ);},[searchQ,courses]);

  const send=async text=>{
    const msg=text||input.trim();
    if(!msg||loading)return;

    // Rate limit check for free-tier users (not admins/superusers)
    const isFree=(user?.subscription_tier||'free')==='free';
    const isPrivUser=user?.role===ROLE.SUPERUSER||user?.role===ROLE.ADMIN;
    if(isFree&&!isPrivUser&&!assignmentCtx){
      const limit=parseInt(getSubVal('free_ai_messages_per_day','5')||'5');
      const used=getAiMsgCount();
      if(used>=limit){
        setMessages(m=>[...m,
          {role:'user',content:msg},
          {role:'assistant',content:`⚠️ You've used all ${limit} AI messages for today on the Free plan.\n\nUpgrade to Pro for unlimited AI chat — tap ⭐ Upgrade in the top bar.`}
        ]);
        setInput('');
        return;
      }
      incAiMsgCount();
    }

    setInput('');

    // If it looks like a search query, also show search results
    if(isSearchQuery(msg)){
      doSearch(msg);
      if(searchResults.length>0) setTab('search');
    }

    const next=[...messages,{role:'user',content:msg}];
    setMessages(next);setLoading(true);
    try{
      const ctx = assignmentCtx
        ? {...assignmentCtx}
        : {...context,courseName:context?.courseName,chapterTitle:context?.chapterTitle,allCourses:courses?.map(c=>c.chapterTitle+' ('+c.courseName+')').join(', ')};
      const reply=await sendChatMessage(next.filter(m=>m.role!=='system'),ctx);
      setMessages(m=>[...m,{role:'assistant',content:reply}]);
    }catch{
      setMessages(m=>[...m,{role:'assistant',content:'Sorry, something went wrong. Please try again.'}]);
    }
    setLoading(false);
  };

  if(!open) return(
    <button onClick={()=>toggleOpen(true)} className="no-print chatbot-btn" title="Open StudyBot"
      style={{position:'fixed',bottom:58,right:16,width:50,height:50,borderRadius:'50%',border:'none',cursor:'pointer',zIndex:200,background:'linear-gradient(135deg,#4f9cf9,#7f5ff9)',boxShadow:'0 4px 20px rgba(79,156,249,.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>
      🤖
    </button>
  );

  return(
    <div className="no-print chatbot-panel" style={{position:'fixed',bottom:58,right:10,width:'min(370px, calc(100vw - 20px))',maxHeight:minimised?52:'72vh',background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,display:'flex',flexDirection:'column',zIndex:200,overflow:'hidden',boxShadow:'var(--shadow)',transition:'max-height .3s ease'}}>
      {/* Header */}
      <div style={{padding:'10px 14px',borderBottom:minimised?'none':'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',background:'linear-gradient(135deg,rgba(79,156,249,.08),rgba(127,95,249,.08))',flexShrink:0,cursor:'pointer'}} onClick={()=>setMinimised(m=>!m)}>
        <div style={{display:'flex',alignItems:'center',gap:9}}>
          <div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#4f9cf9,#7f5ff9)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>🤖</div>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:'var(--text)',lineHeight:1}}>StudyBot</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:assignmentCtx?'#f9a84f':'#4f9cf9',letterSpacing:1}}>
              {assignmentCtx?'📋 ASSIGNMENT MODE · GROQ':'AI TUTOR · GROQ'}
            </div>
          </div>
          {context?.chapterTitle&&!minimised&&<div style={{background:'rgba(79,156,249,.1)',border:'1px solid rgba(79,156,249,.2)',borderRadius:4,padding:'2px 7px',fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:'#4f9cf9',maxWidth:110,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{context.chapterTitle}</div>}
        </div>
        <div style={{display:'flex',gap:4,alignItems:'center'}}>
          <button onClick={e=>{e.stopPropagation();setMessages([]);setAssignmentCtx(null);}} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:10,fontFamily:"'IBM Plex Mono',monospace",padding:'2px 6px'}} title="Clear">CLR</button>
          <button onClick={e=>{e.stopPropagation();setMinimised(m=>!m);}} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:16,padding:'0 3px',lineHeight:1}}>{minimised?'▲':'▼'}</button>
          <button onClick={e=>{e.stopPropagation();toggleOpen(false);}} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:16,padding:'0 3px',lineHeight:1}}>✕</button>
        </div>
      </div>

      {!minimised&&<>
        {/* Tabs */}
        <div style={{display:'flex',borderBottom:'1px solid var(--border)',flexShrink:0}}>
          {[{id:'chat',label:'💬 Chat'},{id:'search',label:`🔍 Search${searchResults.length>0?' ('+searchResults.length+')':''}`}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:'7px 0',border:'none',borderBottom:tab===t.id?'2px solid #4f9cf9':'2px solid transparent',background:'none',color:tab===t.id?'#4f9cf9':'var(--muted)',cursor:'pointer',fontSize:12,fontWeight:tab===t.id?600:400}}>{t.label}</button>
          ))}
        </div>

        {/* Chat panel */}
        {tab==='chat'&&<>
          <div style={{flex:1,overflowY:'auto',padding:'12px 12px 6px'}}>
            {messages.map((m,i)=>(
              <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start',marginBottom:9}}>
                {m.role==='assistant'&&<div style={{width:22,height:22,borderRadius:'50%',background:'linear-gradient(135deg,#4f9cf9,#7f5ff9)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,flexShrink:0,marginRight:6,marginTop:2}}>🤖</div>}
                <div style={{maxWidth:'80%',background:m.role==='user'?'linear-gradient(135deg,#4f9cf9,#7f5ff9)':'var(--surface)',color:m.role==='user'?'#fff':'var(--text)',borderRadius:m.role==='user'?'13px 13px 3px 13px':'13px 13px 13px 3px',padding:'8px 12px',fontSize:12.5,lineHeight:1.65,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{m.content}</div>
              </div>
            ))}
            {loading&&<div style={{display:'flex',alignItems:'center',gap:7,marginBottom:9}}><div style={{width:22,height:22,borderRadius:'50%',background:'linear-gradient(135deg,#4f9cf9,#7f5ff9)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11}}>🤖</div><div style={{background:'var(--surface)',borderRadius:'13px 13px 13px 3px',padding:'9px 14px',display:'flex',gap:5,alignItems:'center'}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:'50%',background:'#4f9cf9',animation:`blink 1.2s ease ${i*.2}s infinite`}}/>)}</div></div>}
            <div ref={bottomRef}/>
          </div>
          {messages.length<=1&&<div style={{padding:'4px 10px 6px',display:'flex',gap:5,flexWrap:'wrap'}}>
            {(assignmentCtx?[
              'Solve all questions step by step',
              'What does this question require?',
              'Check my answer for errors',
              'Explain the marking criteria',
            ]:QUICK_PROMPTS).map((p,i)=>(
              <button key={i} onClick={()=>send(p)} style={{background:assignmentCtx?'rgba(249,168,79,.07)':'rgba(79,156,249,.07)',border:`1px solid ${assignmentCtx?'rgba(249,168,79,.2)':'rgba(79,156,249,.18)'}`,borderRadius:20,color:assignmentCtx?'#f9a84f':'#4f9cf9',cursor:'pointer',padding:'3px 9px',fontSize:10}}>{p}</button>
            ))}
          </div>}
        </>}

        {/* Search panel */}
        {tab==='search'&&<div style={{flex:1,overflowY:'auto',padding:'10px'}}>
          <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search courses, topics, keywords…"
            style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:9,padding:'8px 12px',color:'var(--text)',fontSize:13,marginBottom:10,fontFamily:"'DM Sans',sans-serif"}}
            autoFocus/>
          {searchResults.length===0&&searchQ&&<div style={{color:'var(--muted)',textAlign:'center',padding:20,fontSize:12}}>No courses match "{searchQ}"</div>}
          {searchResults.length===0&&!searchQ&&<div style={{color:'var(--muted)',textAlign:'center',padding:20,fontSize:12}}>Type to search across all courses</div>}
          {searchResults.map(c=>(
            <div key={c.id} onClick={()=>{setTab('chat');send(`Tell me about ${c.chapterTitle} from ${c.courseName}`);}} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:9,padding:'10px 13px',marginBottom:8,cursor:'pointer'}}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#4f9cf970'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:YEAR_COLORS[c.year]||'#4f9cf9',marginBottom:3}}>Yr {c.year} · Sem {c.semester||1} · {DEPT_SHORT[c.department]||'CS'}</div>
              <div style={{fontSize:13,fontWeight:600,color:'var(--text)',marginBottom:2}}>{c.chapterTitle}</div>
              <div style={{fontSize:11,color:'var(--muted)'}}>{c.courseName} · {c.qCount} questions</div>
            </div>
          ))}
        </div>}

        {/* Input */}
        <div style={{padding:'8px 10px',borderTop:'1px solid var(--border)',display:'flex',gap:7,alignItems:'flex-end',flexShrink:0}}>
          <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder={tab==='search'?'Ask about a course or topic…':'Ask anything… (Enter to send)'}
            rows={1} style={{flex:1,background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:10,padding:'7px 10px',color:'var(--text)',fontSize:12.5,fontFamily:"'DM Sans',sans-serif",resize:'none',maxHeight:80,lineHeight:1.5}}/>
          <button onClick={()=>send()} disabled={!input.trim()||loading}
            style={{width:36,height:36,borderRadius:'50%',border:'none',flexShrink:0,background:!input.trim()||loading?'var(--border)':'linear-gradient(135deg,#4f9cf9,#7f5ff9)',color:!input.trim()||loading?'var(--muted)':'#fff',cursor:!input.trim()||loading?'not-allowed':'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>↑</button>
        </div>
      </>}
    </div>
  );
}


export { Chatbot };
