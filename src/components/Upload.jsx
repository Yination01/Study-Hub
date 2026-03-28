import React,{ useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { supabase, ROLE, YEARS, DEPARTMENTS, DEPT_SHORT, DEPT_COLOR, USER_TYPES, YEAR_COLORS, YEAR_BG, ROLE_COLOR, ROLE_BG, CARD_ACCENTS, PRIORITY, CACHE_KEY, getSubVal, CODE_TO_DEPT, RES_ICONS, AI_MSG_KEY, getAiMsgCount, incAiMsgCount, APP_VERSION, COPYRIGHT_YEAR } from '../lib/constants.js';
import * as db from '../lib/db.js';
import { Tag, Mono, SectionLabel, Field, Avatar, RoleBadge, RolePill, ProgressBar, Logo, ThemeToggle, SearchBar } from './UI.jsx';

/* ═══════════════ UPLOAD MODAL ═══════════════ */
/* File format definitions */
const FILE_TYPES = [
  {ext:['docx','doc'],   label:'Word Doc',  icon:'📝', accept:'.doc,.docx',     color:'#4f9cf9'},
  {ext:['txt','md'],     label:'Text / MD', icon:'📃', accept:'.txt,.md',       color:'#7fda96'},
  {ext:['png','jpg','jpeg','webp'], label:'Image', icon:'🖼', accept:'.png,.jpg,.jpeg,.webp', color:'#da7ff0'},
  {ext:['csv'],          label:'CSV',       icon:'📋', accept:'.csv',           color:'#4ff9e4'},
];

const ALL_ACCEPT = FILE_TYPES.map(t=>t.accept).join(',');

function getFileType(filename){
  const ext = filename.split('.').pop().toLowerCase();
  return FILE_TYPES.find(t=>t.ext.includes(ext));
}

/* Client-side text extraction */
async function extractText(file){
  const ext = file.name.split('.').pop().toLowerCase();

  // Plain text formats
  if(['txt','md','csv'].includes(ext)){
    return new Promise((res,rej)=>{
      const r=new FileReader();
      r.onload=e=>res(e.target.result);
      r.onerror=()=>rej(new Error('Could not read file'));
      r.readAsText(file);
    });
  }

  // JSON
  if(ext==='json'){
    const text = await new Promise((res,rej)=>{
      const r=new FileReader();r.onload=e=>res(e.target.result);r.onerror=()=>rej(new Error('Read failed'));r.readAsText(file);
    });
    // Try parsing as existing StudyHub JSON first
    try{
      const parsed=safeParse(text);
      if(parsed.chapterTitle) return '__STUDYHUB_JSON__:'+text;
    }catch{}
    return text;
  }

  // PDF — extract using PDF.js
  if(ext==='pdf'){
    const arrayBuffer = await file.arrayBuffer();
    if(typeof window.pdfjsLib === 'undefined'){
      // Load PDF.js dynamically
      await new Promise((res,rej)=>{
        const s=document.createElement('script');
        s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        s.onload=res;s.onerror=rej;document.head.appendChild(s);
      });
      window.pdfjsLib.GlobalWorkerOptions.workerSrc=
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    const pdf = await window.pdfjsLib.getDocument({data:arrayBuffer}).promise;
    let text='';
    for(let i=1;i<=Math.min(pdf.numPages,80);i++){
      const page=await pdf.getPage(i);
      const content=await page.getTextContent();
      text+=content.items.map(s=>s.str).join(' ')+'\n';
    }
    if(text.trim().length < 100) return '__IMAGE_NEEDED__'; // Scanned PDF — fall through to vision
    return text;
  }

  // DOCX — extract using mammoth
  if(['doc','docx'].includes(ext)){
    const arrayBuffer = await file.arrayBuffer();
    if(typeof window.mammoth === 'undefined'){
      await new Promise((res,rej)=>{
        const s=document.createElement('script');
        s.src='https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
        s.onload=res;s.onerror=rej;document.head.appendChild(s);
      });
    }
    const result = await window.mammoth.extractRawText({arrayBuffer});
    return result.value;
  }

  // Images and everything else — base64 for vision
  return '__USE_VISION__';
}

async function toBase64(file){
  return new Promise((res,rej)=>{
    const r=new FileReader();
    r.onload=e=>res(e.target.result.split(',')[1]);
    r.onerror=()=>rej(new Error('Read failed'));
    r.readAsDataURL(file);
  });
}

/* Strip control characters that break JSON.parse (e.g. unescaped tabs, newlines inside strings) */
function sanitizeJson(raw){
  // Remove BOM if present
  let s=raw.replace(/^\uFEFF/,'');
  // Replace literal control chars (0x00-0x1F except \t \n \r) inside strings with a space
  // We do a two-pass: first normalise CRLF, then strip bad chars
  s=s.replace(/\r\n/g,'\\n').replace(/\r/g,'\\n');
  // Strip remaining raw control chars (0x00–0x08, 0x0B–0x0C, 0x0E–0x1F)
  s=s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,' ');
  return s;
}
function safeParse(raw){
  try{ return JSON.parse(raw); }catch{
    return JSON.parse(sanitizeJson(raw));
  }
}

const JSON_PROMPT=`Generate a StudyHub JSON study guide for this document.
Return ONLY valid JSON with this exact structure:
{
  "courseName": "e.g. COS 341",
  "chapterTitle": "full chapter title",
  "keyConcepts": [{"title":"","description":"one sentence","color":"blue|orange|green|purple"}],
  "definitions": [{"term":"","definition":""}],
  "mechanisms": [{"title":"","body":"step-by-step; use \\n\\n for paragraph breaks"}],
  "algorithms": [{"name":"","description":"","note":""}],
  "chapters": [{"num":"Chapter X","name":"","takeaways":["","",""]}],
  "questions": [{"question":"","answer":""}]
}
Rules: keyConcepts 12-18, definitions 20-35, mechanisms 4-7, algorithms [] if none, chapters 4-8 with EXACTLY 3 takeaways each, questions EXACTLY 25 exam-style with full worked answers. Return ONLY the JSON.`;

/* Format descriptions shown in the info card when a chip is selected */
const FORMAT_INFO = {
  'Word Doc': {
    desc: 'Microsoft Word documents (.docx). Great for notes, assignments, and handouts from Word or Google Docs.',
    how:  'From Google Docs: File → Download → .docx. From Word: File → Save As → .docx.',
  },
  'Text / MD': {
    desc: 'Plain text (.txt) or Markdown (.md). Good for notes, outlines, or content copied from anywhere.',
    how:  'Paste your notes into Notepad/TextEdit and save as .txt, or export from any Markdown editor.',
  },
  'Image': {
    desc: 'PNG, JPG, JPEG, or WebP images. Upload a photo of a whiteboard, handwritten notes, or a scanned page.',
    how:  'Take a clear photo with your phone, or screenshot any document. AI reads the text automatically.',
  },
  'CSV': {
    desc: 'Comma-separated values. Good for tables of definitions, data sets, or structured study material.',
    how:  'From Excel or Google Sheets: File → Download → .csv.',
  },
};

/* ═══════════════ AI CONFIRMATION MODAL ═══════════════ */
function AiConfirmModal({aiResult,courses,defaultYear,defaultSem,defaultDept,onConfirm,onCancel}){
  const[editCourse,setEditCourse]=useState(normalizeCourseCode(aiResult.courseName||''));
  const[editTitle,setEditTitle]=useState(aiResult.chapterTitle||aiResult.title||'');
  const[saveAs,setSaveAs]=useState(aiResult._type==='assignment'?'assignment':aiResult._type==='ca'?'ca':'course');
  const[editYear,setEditYear]=useState(defaultYear||1);
  const[editSem,setEditSem]=useState(defaultSem||1);
  const[editDept,setEditDept]=useState(defaultDept||DEPARTMENTS[0]||'Computer Science');

  const detected=useMemo(()=>detectMetadata({courseName:editCourse,chapterTitle:editTitle}),[editCourse,editTitle]);
  const existingCodes=useMemo(()=>uniqueCourseCodes(courses),[courses]);
  const matchedCode=useMemo(()=>existingCodes.find(c=>c===normalizeCourseCode(editCourse)),[existingCodes,editCourse]);
  const suggestions=useMemo(()=>editCourse.length>=2?existingCodes.filter(c=>c.startsWith(normalizeCourseCode(editCourse))&&c!==normalizeCourseCode(editCourse)).slice(0,3):[],[existingCodes,editCourse]);

  // Auto-apply AI-detected year/dept hints
  useEffect(()=>{if(detected.year)setEditYear(detected.year);},[detected.year]);
  useEffect(()=>{if(detected.department)setEditDept(detected.department);},[detected.department]);
  useEffect(()=>{if(detected.semester)setEditSem(detected.semester);},[detected.semester]);

  const typeOpts=[
    {id:'course',    label:'📚 Study Guide',  desc:'Key concepts, definitions & Q&A → course chapters'},
    {id:'assignment',label:'📋 Assignment',   desc:'Homework/coursework → Assignments tab'},
    {id:'ca',        label:'📝 CA / Test',    desc:'Assessment/exam → CAs & Tests tab'},
    {id:'resource',  label:'🔗 Resource',     desc:'Reference link or file → Resources tab'},
  ];
  const accentColor=YEAR_COLORS[editYear]||'#4f9cf9';

  return(
    <div className="modal-overlay" style={{zIndex:3000}} onClick={e=>e.target===e.currentTarget&&onCancel()}>
      <div className="scale-in" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:'26px 28px',maxWidth:520,width:'100%',margin:'auto',boxShadow:'var(--shadow)',maxHeight:'92vh',overflowY:'auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
          <div style={{width:40,height:40,borderRadius:10,background:'rgba(168,249,79,.1)',border:'1px solid rgba(168,249,79,.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>🤖</div>
          <div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:19,color:'var(--text)'}}>Confirm Upload</div>
            <div style={{fontSize:11,color:'var(--muted)',marginTop:1}}>Review what AI detected — edit anything before saving.</div>
          </div>
        </div>

        {/* AI classification badge */}
        <div style={{background:'rgba(168,249,79,.07)',border:'1px solid rgba(168,249,79,.2)',borderRadius:8,padding:'8px 13px',marginBottom:18,display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <span style={{fontSize:13}}>✨</span>
          <span style={{fontSize:12,color:'#a8f94f'}}>AI classified as <strong>{typeOpts.find(t=>t.id===saveAs)?.label}</strong></span>
          {matchedCode&&<span style={{fontSize:11,color:'var(--muted)'}}>· matches existing <span style={{color:'#4f9cf9',fontFamily:"'IBM Plex Mono',monospace"}}>{matchedCode}</span></span>}
        </div>

        {/* Save-as type selector */}
        <div style={{marginBottom:18}}>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--muted)',letterSpacing:2,marginBottom:8}}>SAVE AS</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
            {typeOpts.map(t=>(
              <button key={t.id} onClick={()=>setSaveAs(t.id)}
                style={{padding:'10px 12px',borderRadius:9,cursor:'pointer',textAlign:'left',
                  border:`1.5px solid ${saveAs===t.id?'#4f9cf9':'var(--border)'}`,
                  background:saveAs===t.id?'rgba(79,156,249,.08)':'var(--input-bg)',
                  transition:'all .15s',display:'flex',flexDirection:'column',gap:2}}>
                <div style={{fontSize:12,fontWeight:saveAs===t.id?700:400,color:saveAs===t.id?'#4f9cf9':'var(--text)'}}>{t.label}</div>
                <div style={{fontSize:10,color:'var(--muted)',lineHeight:1.4}}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Course code + title */}
        <div style={{display:'grid',gridTemplateColumns:'140px 1fr',gap:10,marginBottom:14}}>
          <div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--muted)',letterSpacing:2,marginBottom:5}}>COURSE CODE</div>
            <input value={editCourse} onChange={e=>setEditCourse(e.target.value.toUpperCase())}
              placeholder="e.g. COS 355"
              style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'9px 11px',color:'var(--text)',fontSize:13,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}/>
            {suggestions.map(c=>(
              <button key={c} onClick={()=>setEditCourse(c)}
                style={{display:'block',width:'100%',marginTop:3,background:'rgba(79,156,249,.07)',border:'1px solid rgba(79,156,249,.2)',borderRadius:5,padding:'3px 8px',color:'#4f9cf9',fontSize:10,cursor:'pointer',textAlign:'left',fontFamily:"'IBM Plex Mono',monospace"}}>
                → {c}
              </button>
            ))}
          </div>
          <div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--muted)',letterSpacing:2,marginBottom:5}}>TITLE</div>
            <input value={editTitle} onChange={e=>setEditTitle(e.target.value)}
              placeholder="Chapter or document title"
              style={{width:'100%',background:'var(--input-bg)',border:`1px solid ${editTitle?'var(--border)':'rgba(240,80,80,.4)'}`,borderRadius:8,padding:'9px 11px',color:'var(--text)',fontSize:13}}/>
            {!editTitle&&<div style={{fontSize:10,color:'#f05050',marginTop:3}}>Required</div>}
          </div>
        </div>

        {/* Year / Semester / Dept — only for study guide */}
        {saveAs==='course'&&(
          <div style={{marginBottom:18}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
              <div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--muted)',letterSpacing:2,marginBottom:6}}>YEAR</div>
                <div style={{display:'flex',gap:5}}>
                  {YEARS.map(y=>(
                    <button key={y} onClick={()=>setEditYear(y)}
                      style={{flex:1,padding:'7px 0',borderRadius:7,cursor:'pointer',fontSize:12,fontWeight:editYear===y?700:400,
                        border:`1px solid ${editYear===y?YEAR_COLORS[y]+'80':'var(--border)'}`,
                        background:editYear===y?YEAR_BG[y]:'var(--input-bg)',
                        color:editYear===y?YEAR_COLORS[y]:'var(--muted)'}}>
                      {y}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--muted)',letterSpacing:2,marginBottom:6}}>SEMESTER</div>
                <div style={{display:'flex',gap:5}}>
                  {[1,2].map(s=>(
                    <button key={s} onClick={()=>setEditSem(s)}
                      style={{flex:1,padding:'7px 0',borderRadius:7,cursor:'pointer',fontSize:12,fontWeight:editSem===s?700:400,
                        border:`1px solid ${editSem===s?accentColor+'80':'var(--border)'}`,
                        background:editSem===s?YEAR_BG[editYear]||'rgba(79,156,249,.1)':'var(--input-bg)',
                        color:editSem===s?accentColor:'var(--muted)'}}>
                      Sem {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--muted)',letterSpacing:2,marginBottom:6}}>DEPARTMENT</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {DEPARTMENTS.map(d=>{
                  const col=DEPT_COLOR[d]||'#4f9cf9';
                  const active=editDept===d;
                  return(
                    <button key={d} onClick={()=>setEditDept(d)}
                      style={{padding:'7px 12px',borderRadius:7,cursor:'pointer',fontSize:12,
                        border:`1.5px solid ${active?col:col+'30'}`,background:active?`${col}14`:'var(--input-bg)',
                        color:active?col:'var(--muted)',fontWeight:active?700:400,display:'flex',alignItems:'center',gap:5}}>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,background:active?`${col}25`:'var(--border)',color:active?col:'var(--muted)',borderRadius:3,padding:'1px 5px'}}>{DEPT_SHORT[d]||d.slice(0,2)}</span>
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Content summary for study guides */}
        {saveAs==='course'&&(aiResult.keyConcepts?.length||aiResult.questions?.length)&&(
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:9,padding:'11px 14px',marginBottom:16,display:'flex',gap:16,flexWrap:'wrap'}}>
            {[{l:'Concepts',v:aiResult.keyConcepts?.length||0,c:'#4f9cf9'},{l:'Terms',v:aiResult.definitions?.length||0,c:'#f9a84f'},{l:'Questions',v:aiResult.questions?.length||0,c:'#7fda96'},{l:'Mechanisms',v:aiResult.mechanisms?.length||0,c:'#da7ff0'}].map(s=>(
              <div key={s.l} style={{textAlign:'center',flex:1,minWidth:50}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,color:s.c,fontWeight:700}}>{s.v}</div>
                <div style={{fontSize:10,color:'var(--muted)',marginTop:1}}>{s.l}</div>
              </div>
            ))}
          </div>
        )}

        {/* Existing course tab note */}
        {matchedCode&&saveAs==='course'&&(
          <div style={{background:'rgba(79,156,249,.06)',border:'1px solid rgba(79,156,249,.2)',borderRadius:8,padding:'8px 13px',marginBottom:14,fontSize:12,color:'#4f9cf9',display:'flex',gap:8,alignItems:'center'}}>
            <span>📂</span><span>Adds to existing <strong>{matchedCode}</strong> course tab.</span>
          </div>
        )}

        <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:4}}>
          <button onClick={onCancel} style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'10px 18px',fontSize:13}}>Cancel</button>
          <button
            onClick={()=>onConfirm({...aiResult,courseName:normalizeCourseCode(editCourse)||aiResult.courseName||'',chapterTitle:editTitle,_saveAs:saveAs,_year:editYear,_semester:editSem,_department:editDept})}
            disabled={!editTitle.trim()}
            style={{background:!editTitle.trim()?'var(--border)':'#4f9cf9',border:'none',borderRadius:8,color:!editTitle.trim()?'var(--muted)':'#000',cursor:!editTitle.trim()?'not-allowed':'pointer',padding:'10px 24px',fontSize:13,fontWeight:700}}>
            ✓ Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ COURSE TAB VIEW ═══════════════ */
function CourseTabView({courseCode,courses,user,progress,onSelectCourse,onBack,bookmarks,toggleBookmark}){
  const chapters=useMemo(()=>courses.filter(c=>normalizeCourseCode(c.courseName)===courseCode),[courses,courseCode]);
  const courseIds=useMemo(()=>chapters.map(c=>c.id),[chapters]);
  const[tabData,setTabData]=useState({assignments:[],cas:[],resources:[],announcements:[]});
  const[activeSection,setActiveSection]=useState('chapters');
  const[dataLoaded,setDataLoaded]=useState(false);
  const isPriv=user.role===ROLE.SUPERUSER||user.role===ROLE.ADMIN;
  const dominantYear=chapters[0]?.year||1;
  const accent=YEAR_COLORS[dominantYear]||'#4f9cf9';
  const dept=chapters[0]?.department||'Computer Science';
  const deptColor=DEPT_COLOR[dept]||'#4f9cf9';

  useEffect(()=>{
    setDataLoaded(false);
    dbLoadCourseTabData(courseIds).then(d=>{setTabData(d);setDataLoaded(true);});
  },[courseIds.join(',')]);

  const totalConcepts=chapters.reduce((a,c)=>a+(c.conceptCount||0),0);
  const totalQ=chapters.reduce((a,c)=>a+(c.qCount||0),0);
  const visitedCount=chapters.filter(c=>progress[c.id]?.viewed).length;

  const sections=[
    {id:'chapters',   label:'📚 Chapters',    count:chapters.length},
    {id:'assignments',label:'📋 Assignments', count:tabData.assignments.length},
    {id:'cas',        label:'📝 CAs & Tests', count:tabData.cas.length},
    {id:'resources',  label:'🔗 Resources',   count:tabData.resources.length},
    {id:'announcements',label:'📣 Notices',   count:tabData.announcements.length},
  ];

  return(
    <div className="home-page" style={{maxWidth:990,margin:'0 auto',padding:'28px 20px 88px'}}>
      <div className="fade-up">
        <button onClick={onBack} style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'6px 14px',fontSize:12,fontFamily:"'IBM Plex Mono',monospace",marginBottom:20}}>← All Courses</button>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16,flexWrap:'wrap',marginBottom:22}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6,flexWrap:'wrap'}}>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:26,fontWeight:700,color:accent,letterSpacing:1}}>{courseCode}</span>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:`${deptColor}18`,color:deptColor,border:`1px solid ${deptColor}30`,borderRadius:4,padding:'2px 8px'}}>{DEPT_SHORT[dept]||dept}</span>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:YEAR_BG[dominantYear],color:accent,border:`1px solid ${accent}30`,borderRadius:4,padding:'2px 8px'}}>Year {dominantYear}</span>
            </div>
            <div style={{fontSize:13,color:'var(--muted)'}}>
              {chapters.length} chapter{chapters.length!==1?'s':''} · {totalConcepts} concepts · {totalQ} questions
              {visitedCount>0&&<span style={{color:'#7fda96',marginLeft:8}}>· {visitedCount}/{chapters.length} visited</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="course-tabs-row" style={{display:'flex',gap:2,borderBottom:'1px solid var(--border)',marginBottom:22,overflowX:'auto',flexWrap:'nowrap'}}>
        {sections.map(s=>(
          <button key={s.id} onClick={()=>setActiveSection(s.id)}
            style={{background:'none',border:'none',borderBottom:activeSection===s.id?`2px solid ${accent}`:'2px solid transparent',color:activeSection===s.id?accent:'var(--muted)',cursor:'pointer',padding:'9px 16px',fontSize:13,fontWeight:activeSection===s.id?600:400,whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
            {s.label}
            {s.count>0&&<span style={{background:activeSection===s.id?`${accent}20`:'var(--border)',color:activeSection===s.id?accent:'var(--muted)',borderRadius:10,padding:'1px 7px',fontSize:9,fontFamily:"'IBM Plex Mono',monospace"}}>{s.count}</span>}
          </button>
        ))}
      </div>

      {!dataLoaded&&activeSection!=='chapters'&&<div style={{color:'var(--muted)',textAlign:'center',padding:40,fontSize:13}}>Loading…</div>}

      {/* CHAPTERS */}
      {activeSection==='chapters'&&(
        <div className="fade-in">
          {chapters.length===0
            ?<div style={{textAlign:'center',padding:50,color:'var(--muted)',fontSize:13,border:'1px dashed var(--border)',borderRadius:12}}>No chapters yet for {courseCode}.</div>
            :<div style={{display:'flex',flexDirection:'column',gap:10}}>
              {chapters.map((c,i)=>{
                const cp=progress[c.id];const pct=c.qCount>0?Math.round(((cp?.openedQs?.length||0)/c.qCount)*100):0;
                const viewed=cp?.viewed;const isBookmarked=bookmarks.includes(c.id);
                return(
                  <div key={c.id} className={`stagger-${Math.min(i%4+1,4)}`}
                    style={{background:'var(--card)',border:`1px solid ${viewed?'rgba(127,218,150,.25)':'var(--border)'}`,borderRadius:12,padding:'16px 20px',cursor:'pointer',borderLeft:`3px solid ${YEAR_COLORS[c.year]||accent}`,transition:'transform .15s,box-shadow .15s'}}
                    onClick={()=>onSelectCourse(c.id)}
                    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,.2)';}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10}}>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',gap:6,marginBottom:6,flexWrap:'wrap',alignItems:'center'}}>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:YEAR_BG[c.year],color:YEAR_COLORS[c.year]||accent,borderRadius:4,padding:'2px 7px'}}>Yr {c.year} · Sem {c.semester||1}</span>
                          {viewed&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'#7fda96'}}>✓ Visited</span>}
                        </div>
                        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:'var(--text)',lineHeight:1.3,marginBottom:8}}>{c.chapterTitle}</div>
                        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                          <Tag color={YEAR_COLORS[c.year]||accent}>{c.conceptCount||0} concepts</Tag>
                          <Tag color={YEAR_COLORS[c.year]||accent}>{c.termCount||0} terms</Tag>
                          <Tag color={YEAR_COLORS[c.year]||accent}>{c.qCount||0} Q&A</Tag>
                        </div>
                        {!isPriv&&c.qCount>0&&(
                          <div style={{marginTop:10}}>
                            <div style={{height:3,background:'var(--border)',borderRadius:2,overflow:'hidden'}}>
                              <div style={{height:'100%',width:`${pct}%`,background:YEAR_COLORS[c.year]||accent,borderRadius:2,transition:'width .5s'}}/>
                            </div>
                            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginTop:3}}>{pct}% complete</div>
                          </div>
                        )}
                      </div>
                      <div style={{display:'flex',gap:6,alignItems:'center',flexShrink:0}}>
                        <button onClick={e=>{e.stopPropagation();toggleBookmark(c.id);}} style={{background:isBookmarked?'rgba(249,168,79,.15)':'none',border:`1px solid ${isBookmarked?'#f9a84f':'var(--border)'}`,borderRadius:7,color:isBookmarked?'#f9a84f':'var(--muted)',cursor:'pointer',padding:'6px 10px',fontSize:13}}>🔖</button>
                        <span style={{color:'var(--muted)',fontSize:18}}>›</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          }
        </div>
      )}

      {/* ASSIGNMENTS */}
      {activeSection==='assignments'&&dataLoaded&&(
        <div className="fade-in">
          {tabData.assignments.length===0
            ?<div style={{textAlign:'center',padding:40,color:'var(--muted)',border:'1px dashed var(--border)',borderRadius:12,fontSize:13}}>No assignments for {courseCode} yet.</div>
            :<div style={{display:'flex',flexDirection:'column',gap:10}}>
              {tabData.assignments.map((a,i)=>(
                <div key={a.id} className={`stagger-${Math.min(i%4+1,4)}`} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:11,padding:'15px 18px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',gap:10,flexWrap:'wrap',alignItems:'flex-start'}}>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'#4f9cf9',marginBottom:4,letterSpacing:1}}>ASSIGNMENT</div>
                      <div style={{fontSize:14,fontWeight:600,color:'var(--text)',marginBottom:4}}>{a.title}</div>
                      {a.description&&<p style={{fontSize:12,color:'var(--muted)',lineHeight:1.6,margin:0}}>{a.description}</p>}
                    </div>
                    {a.due_date&&<div style={{background:'rgba(249,168,79,.1)',border:'1px solid rgba(249,168,79,.3)',borderRadius:6,padding:'5px 11px',flexShrink:0,textAlign:'center'}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'#f9a84f',letterSpacing:1}}>DUE</div>
                      <div style={{fontSize:12,color:'#f9a84f',fontWeight:600}}>{new Date(a.due_date).toLocaleDateString()}</div>
                    </div>}
                  </div>
                  {a.marks&&<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginTop:8}}>{a.marks} marks</div>}
                </div>
              ))}
            </div>
          }
        </div>
      )}

      {/* CAs */}
      {activeSection==='cas'&&dataLoaded&&(
        <div className="fade-in">
          {tabData.cas.length===0
            ?<div style={{textAlign:'center',padding:40,color:'var(--muted)',border:'1px dashed var(--border)',borderRadius:12,fontSize:13}}>No CAs or tests for {courseCode} yet.</div>
            :<div style={{display:'flex',flexDirection:'column',gap:10}}>
              {tabData.cas.map((ca,i)=>(
                <div key={ca.id} className={`stagger-${Math.min(i%4+1,4)}`} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:11,padding:'15px 18px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',gap:10,flexWrap:'wrap',alignItems:'flex-start'}}>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'#da7ff0',marginBottom:4,letterSpacing:1}}>{ca.type||'CA'}</div>
                      <div style={{fontSize:14,fontWeight:600,color:'var(--text)',marginBottom:4}}>{ca.title}</div>
                      {ca.description&&<p style={{fontSize:12,color:'var(--muted)',lineHeight:1.6,margin:0}}>{ca.description}</p>}
                    </div>
                    {ca.date&&<div style={{background:'rgba(218,127,240,.1)',border:'1px solid rgba(218,127,240,.3)',borderRadius:6,padding:'5px 11px',flexShrink:0,textAlign:'center'}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'#da7ff0',letterSpacing:1}}>DATE</div>
                      <div style={{fontSize:12,color:'#da7ff0',fontWeight:600}}>{new Date(ca.date).toLocaleDateString()}</div>
                    </div>}
                  </div>
                  {ca.marks&&<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginTop:8}}>{ca.marks} marks</div>}
                </div>
              ))}
            </div>
          }
        </div>
      )}

      {/* RESOURCES */}
      {activeSection==='resources'&&dataLoaded&&(
        <div className="fade-in">
          {tabData.resources.length===0
            ?<div style={{textAlign:'center',padding:40,color:'var(--muted)',border:'1px dashed var(--border)',borderRadius:12,fontSize:13}}>No resources for {courseCode} yet.</div>
            :<div style={{display:'flex',flexDirection:'column',gap:8}}>
              {tabData.resources.map((r,i)=>(
                <a key={r.id} href={r.url||'#'} target="_blank" rel="noopener noreferrer"
                  style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:'13px 16px',textDecoration:'none',display:'flex',alignItems:'center',gap:12,transition:'border-color .15s'}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(79,156,249,.4)'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=''}>
                  <span style={{fontSize:20,flexShrink:0}}>{RES_ICONS[r.type]||'🔗'}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.title||r.url}</div>
                    {r.description&&<div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{r.description}</div>}
                  </div>
                  <span style={{color:'var(--muted)',fontSize:16,flexShrink:0}}>↗</span>
                </a>
              ))}
            </div>
          }
        </div>
      )}

      {/* ANNOUNCEMENTS */}
      {activeSection==='announcements'&&dataLoaded&&(
        <div className="fade-in">
          {tabData.announcements.length===0
            ?<div style={{textAlign:'center',padding:40,color:'var(--muted)',border:'1px dashed var(--border)',borderRadius:12,fontSize:13}}>No announcements for {courseCode} yet.</div>
            :<div style={{display:'flex',flexDirection:'column',gap:10}}>
              {tabData.announcements.map((a,i)=>{
                const p=PRIORITY[a.priority]||PRIORITY.info;
                return(
                  <div key={a.id} className={`stagger-${Math.min(i%4+1,4)}`} style={{background:p.bg,border:`1px solid ${p.border}`,borderRadius:10,padding:'14px 16px'}}>
                    <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                      <span style={{fontSize:16,flexShrink:0}}>{p.icon}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:600,color:'var(--text)',marginBottom:4}}>{a.title}</div>
                        <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.7,margin:0}}>{a.body}</p>
                        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginTop:6}}>{new Date(a.posted_at).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          }
        </div>
      )}
    </div>
  );
}


export { UploadModal, AiConfirmModal, CourseTabView, FILE_TYPES, ALL_ACCEPT, FORMAT_INFO, getFileType };
