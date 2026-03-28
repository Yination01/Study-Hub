import React,{ useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { supabase, ROLE, YEARS, DEPARTMENTS, DEPT_SHORT, DEPT_COLOR, USER_TYPES, YEAR_COLORS, YEAR_BG, ROLE_COLOR, ROLE_BG, CARD_ACCENTS, PRIORITY, CACHE_KEY, getSubVal, CODE_TO_DEPT, RES_ICONS, AI_MSG_KEY, getAiMsgCount, incAiMsgCount, APP_VERSION, COPYRIGHT_YEAR } from '../lib/constants.js';
import * as db from '../lib/db.js';
import { Tag, Mono, SectionLabel, Field, Avatar, RoleBadge, RolePill, ProgressBar, Logo, ThemeToggle, SearchBar } from './UI.jsx';
import { useNotificationPermission, pushNotification } from '../lib/hooks.js';

function UploadModal({onClose,onDone,adminMode=false,requestedBy='',courses=[]}){
  const[uploadMode,setUploadMode]=useState('file'); // 'file' | 'paste'
  const[year,setYear]=useState(1);
  const[semester,setSemester]=useState(1);
  const[departments,setDepartments]=useState(['Computer Science']); // multi-select array
  const[pasteText,setPasteText]=useState('');
  const[file,setFile]=useState(null);
  const[status,setStatus]=useState('idle');
  const[progress,setProgress]=useState('');
  const[error,setError]=useState('');
  const[copied,setCopied]=useState(false);
  const[smartSortMsg,setSmartSortMsg]=useState('');
  const[activeFilter,setActiveFilter]=useState('All');
  const[filterInfo,setFilterInfo]=useState(null);
  const[pendingAiResult,setPendingAiResult]=useState(null); // holds AI result waiting for confirm
  const fileRef=useRef();

  const copyPrompt=()=>{navigator.clipboard.writeText(JSON_PROMPT);setCopied(true);setTimeout(()=>setCopied(false),2000);};

  const saveEntry=async(data,autoDetected)=>{
    if(!data.chapterTitle) throw new Error('Missing chapterTitle in response');
    // Normalise all array fields so components never call .map() on null
    data.keyConcepts  = Array.isArray(data.keyConcepts)  ? data.keyConcepts  : [];
    data.definitions  = Array.isArray(data.definitions)  ? data.definitions  : [];
    data.mechanisms   = Array.isArray(data.mechanisms)   ? data.mechanisms   : [];
    data.algorithms   = Array.isArray(data.algorithms)   ? data.algorithms   : [];
    data.chapters     = Array.isArray(data.chapters)     ? data.chapters     : [];
    data.questions    = Array.isArray(data.questions)    ? data.questions    : [];
    // Ensure nested arrays inside chapters are safe
    data.chapters = data.chapters.map(ch=>({...ch,takeaways:Array.isArray(ch.takeaways)?ch.takeaways:[]}));
    // Ensure every concept/definition has required string fields
    data.keyConcepts = data.keyConcepts.map(c=>({title:c.title||'',description:c.description||'',color:c.color||'blue'}));
    data.definitions = data.definitions.map(d=>({term:d.term||'',definition:d.definition||''}));
    data.questions   = data.questions.map(q=>({question:q.question||'',answer:q.answer||''}));
    const finalYear     = autoDetected?.year      || year;
    const finalSemester = autoDetected?.semester  || semester;
    // Multi-dept: use detected dept if auto, otherwise use all selected
    const finalDepts = autoDetected?.department
      ? [autoDetected.department]
      : departments.length>0 ? departments : ['Computer Science'];

    if(autoDetected?.year)      setYear(autoDetected.year);
    if(autoDetected?.semester)  setSemester(autoDetected.semester);
    if(autoDetected?.department)setDepartments([autoDetected.department]);

    // Save one entry per selected department
    for(const dept of finalDepts){
      const id=`c-${Date.now()}-${dept.slice(0,3)}`;
      const entry={id,year:finalYear,semester:finalSemester,department:dept,
        courseName:data.courseName||'Course',chapterTitle:data.chapterTitle,
        conceptCount:data.keyConcepts?.length||0,termCount:data.definitions?.length||0,
        qCount:data.questions?.length||0,addedAt:new Date().toLocaleDateString()};
      if(adminMode){
        await onDone(null,entry,data);
      } else {
        await dbSaveCourse(entry,data);
      }
    }
    if(!adminMode){
      const idx=await dbLoadCourseIndex();
      setTimeout(()=>onDone(idx),600);
    }
    setStatus('done');
  };

  const processFile=async()=>{
    if(!file) return;
    setStatus('processing');setError('');setPendingAiResult(null);
    try{
      setProgress(`Reading ${file.name}…`);
      const text=await extractText(file);
      if(text.startsWith('__STUDYHUB_JSON__:')){
        const data=safeParse(text.replace('__STUDYHUB_JSON__:',''));
        setStatus('idle');setProgress('');
        setPendingAiResult({...data,_type:'course'});return;
      }
      const useVision=text==='__USE_VISION__'||text==='__IMAGE_NEEDED__';
      setProgress(useVision?'Sending to AI vision model…':'Sending to AI…');
      let body;
      if(useVision){const b64=await toBase64(file);body={imageBase64:b64,mimeType:file.type||'image/png'};}
      else{body={text};}
      const res=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e.error||`Server error ${res.status}`);}
      const data=await res.json();
      // Show confirmation modal instead of auto-saving
      setStatus('idle');setProgress('');
      const detected=detectMetadata(data);
      setPendingAiResult({...data,_detectedYear:detected.year,_detectedSem:detected.semester,_detectedDept:detected.department});
    }catch(e){
      const msg=e.message||'Unknown error';
      const friendly=msg.includes('control character')||msg.includes('JSON')
        ?'The file contains formatting that could not be parsed. Try saving it as plain .txt or .docx and uploading again.'
        :msg.includes('413')||msg.includes('too large')
        ?'File is too large. Try splitting it into smaller sections.'
        :'Failed: '+msg;
      setError(friendly);setStatus('idle');setProgress('');
    }
  };

  const processPaste=async()=>{
    setError('');setSmartSortMsg('');
    try{
      const data=safeParse(pasteText.replace(/```json|```/g,'').trim());
      if(!data.chapterTitle) throw new Error('Missing chapterTitle');
      const detected=detectMetadata(data);
      setPendingAiResult({...data,_type:'course',_detectedYear:detected.year,_detectedSem:detected.semester,_detectedDept:detected.department});
    }catch(e){setError('Invalid JSON: '+e.message);setStatus('idle');}
  };

  const handleConfirm=async(confirmed)=>{
    setPendingAiResult(null);
    const saveAs=confirmed._saveAs||'course';
    setStatus('processing');setProgress('Saving…');
    try{
      if(saveAs==='assignment'){
        setSmartSortMsg('📋 Saved as Assignment');
        await onDone?.(null,null,null,{type:'assignment',data:confirmed});
        setStatus('done');return;
      }
      if(saveAs==='ca'){
        setSmartSortMsg('📝 Saved as CA / Test');
        await onDone?.(null,null,null,{type:'ca',data:confirmed});
        setStatus('done');return;
      }
      if(saveAs==='resource'){
        setSmartSortMsg('🔗 Saved as Resource');
        setStatus('done');return;
      }
      // Study guide — save with user-confirmed metadata
      const autoDetected={year:confirmed._year,semester:confirmed._semester,department:confirmed._department};
      await saveEntry(confirmed,autoDetected);
      setSmartSortMsg(`✨ Saved: ${confirmed.courseName||''} · Yr ${confirmed._year} · Sem ${confirmed._semester}`);
    }catch(e){
      setError('Save failed: '+e.message);setStatus('idle');setProgress('');
    }
  };

  const fileType = file ? getFileType(file.name) : null;
  const canGo = status!=='processing'&&status!=='done'&&departments.length>0&&(uploadMode==='file'?!!file:!!pasteText.trim());

  return(
    <>
    {pendingAiResult&&(
      <AiConfirmModal
        aiResult={pendingAiResult}
        courses={courses}
        defaultYear={year} defaultSem={semester} defaultDept={departments[0]||DEPARTMENTS[0]||'Computer Science'}
        onConfirm={handleConfirm}
        onCancel={()=>{setPendingAiResult(null);setStatus('idle');}}
      />
    )}
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="scale-in modal-inner upload-modal" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:'28px 32px',maxWidth:560,width:'100%',margin:'auto',boxShadow:'var(--shadow)',maxHeight:'90vh',overflowY:'auto'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
          <Logo onClick={null} size="sm"/>
          <div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:'var(--text)'}}>{adminMode?'Request New Course':'Add Course'}</div>
            {adminMode&&<div style={{fontSize:11,color:'#da7ff0',marginTop:2}}>🛡 Requires superuser approval</div>}
          </div>
        </div>

        {/* Mode toggle */}
        <div style={{display:'flex',background:'var(--input-bg)',borderRadius:10,padding:4,marginBottom:20}}>
          {[{id:'file',label:'📁 Upload File'},{id:'paste',label:'📋 Paste JSON'}].map(m=>(
            <button key={m.id} onClick={()=>{setUploadMode(m.id);setError('');setStatus('idle');setProgress('');}} style={{flex:1,padding:'8px 0',borderRadius:7,border:'none',background:uploadMode===m.id?'var(--surface)':'none',color:uploadMode===m.id?'var(--text)':'var(--muted)',cursor:'pointer',fontSize:13,fontWeight:uploadMode===m.id?600:400}}>{m.label}</button>
          ))}
        </div>

        {/* Year / Semester / Dept pickers */}
        <div className="year-picker-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:18}}>
          <div>
            <Mono color="var(--muted)" size={10}>YEAR</Mono>
            <div style={{display:'flex',gap:6,marginTop:6}}>
              {YEARS.map(y=><button key={y} onClick={()=>setYear(y)} style={{flex:1,padding:'7px 0',borderRadius:7,cursor:'pointer',border:`1px solid ${year===y?YEAR_COLORS[y]+'70':'var(--border)'}`,background:year===y?YEAR_BG[y]:'var(--input-bg)',color:year===y?YEAR_COLORS[y]:'var(--muted)',fontWeight:year===y?700:400,fontSize:12}}>{y}</button>)}
            </div>
          </div>
          <div>
            <Mono color="var(--muted)" size={10}>SEMESTER</Mono>
            <div style={{display:'flex',gap:6,marginTop:6}}>
              {[1,2].map(s=><button key={s} onClick={()=>setSemester(s)} style={{flex:1,padding:'7px 0',borderRadius:7,cursor:'pointer',border:`1px solid ${semester===s?YEAR_COLORS[year]+'70':'var(--border)'}`,background:semester===s?YEAR_BG[year]:'var(--input-bg)',color:semester===s?YEAR_COLORS[year]:'var(--muted)',fontWeight:semester===s?700:400,fontSize:12}}>Sem {s}</button>)}
            </div>
          </div>
        </div>
        <div style={{marginBottom:18}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
            <Mono color="var(--muted)" size={10}>DEPARTMENT</Mono>
            {departments.length>1&&(
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:'#4f9cf9',letterSpacing:1}}>
                {departments.length} SELECTED — course added to each
              </span>
            )}
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {DEPARTMENTS.map(d=>{
              const active=departments.includes(d);
              const col=DEPT_COLOR[d]||'#4f9cf9';
              return(
                <button key={d} onClick={()=>setDepartments(prev=>
                  prev.includes(d) ? prev.filter(x=>x!==d).length===0 ? prev : prev.filter(x=>x!==d) : [...prev,d]
                )}
                  style={{padding:'8px 12px',borderRadius:8,cursor:'pointer',
                    border:`1.5px solid ${active?col:col+'30'}`,
                    background:active?`${col}14`:'var(--input-bg)',
                    color:active?col:'var(--muted)',
                    fontWeight:active?700:400,fontSize:12,
                    display:'flex',alignItems:'center',gap:7,
                    transition:'all .15s',position:'relative'}}>
                  {active&&<span style={{fontSize:10,lineHeight:1}}>✓</span>}
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,
                    background:active?`${col}25`:'var(--border)',
                    color:active?col:'var(--muted)',borderRadius:3,padding:'1px 5px'}}>{DEPT_SHORT[d]}</span>
                  <span style={{fontSize:11}}>{d}</span>
                </button>
              );
            })}
          </div>
          {departments.length===0&&(
            <div style={{fontSize:11,color:'#f05050',marginTop:5}}>Select at least one department</div>
          )}
          {departments.length>1&&(
            <div style={{fontSize:11,color:'#4f9cf9',marginTop:6,display:'flex',alignItems:'center',gap:5}}>
              <span>ℹ️</span>
              <span>This course will appear under <strong>{departments.map(d=>DEPT_SHORT[d]||d).join(' and ')}</strong> — one copy per department.</span>
            </div>
          )}
        </div>

        {/* FILE MODE */}
        {uploadMode==='file'&&(
          <div className="fade-in">

            {/* ── Gemini-style format chip bar ── */}
            <div style={{marginBottom:16}}>
              <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
                {[{label:'All',icon:'📂',color:'#8892a4',filter:null},...FILE_TYPES.map(t=>({...t,filter:t.ext}))].map(t=>{
                  const active=activeFilter===t.label;
                  return(
                    <button key={t.label} onClick={()=>{
                      setActiveFilter(t.label);
                      // Show info tooltip
                      setFilterInfo(t.label==='All'?null:t);
                    }}
                      style={{display:'flex',alignItems:'center',gap:5,
                        background:active?`${t.color}18`:'var(--input-bg)',
                        border:`1.5px solid ${active?t.color:t.color+'30'}`,
                        borderRadius:20,padding:'5px 12px',cursor:'pointer',
                        transition:'all .15s',outline:'none'}}>
                      <span style={{fontSize:14}}>{t.icon}</span>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,
                        color:active?t.color:'var(--muted)',fontWeight:active?700:400,
                        letterSpacing:.5}}>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Format info card — shows when a specific chip is selected */}
              {filterInfo&&(
                <div className="fade-in" style={{marginTop:10,background:`${filterInfo.color}08`,
                  border:`1px solid ${filterInfo.color}25`,borderRadius:10,padding:'11px 14px',
                  display:'flex',gap:12,alignItems:'flex-start'}}>
                  <span style={{fontSize:24,flexShrink:0}}>{filterInfo.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:filterInfo.color,marginBottom:3}}>
                      {filterInfo.label}
                    </div>
                    <div style={{fontSize:11,color:'var(--muted)',lineHeight:1.6}}>
                      {FORMAT_INFO[filterInfo.label]?.desc}
                    </div>
                    <div style={{marginTop:6,display:'flex',gap:6,flexWrap:'wrap'}}>
                      {filterInfo.ext.map(e=>(
                        <span key={e} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,
                          background:`${filterInfo.color}15`,color:filterInfo.color,
                          borderRadius:4,padding:'2px 7px'}}>
                          .{e}
                        </span>
                      ))}
                    </div>
                    <div style={{marginTop:6,fontSize:11,color:'var(--muted)',fontStyle:'italic'}}>
                      {FORMAT_INFO[filterInfo.label]?.how}
                    </div>
                  </div>
                  <button onClick={()=>setFilterInfo(null)}
                    style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:16,lineHeight:1,flexShrink:0}}>✕</button>
                </div>
              )}
            </div>

            {/* Drop zone */}
            <div
              onClick={()=>fileRef.current?.click()}
              onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor='#4f9cf9';e.currentTarget.style.background='rgba(79,156,249,.05)';}}
              onDragLeave={e=>{e.currentTarget.style.borderColor='';e.currentTarget.style.background='';}}
              onDrop={e=>{
                e.preventDefault();
                e.currentTarget.style.borderColor='';e.currentTarget.style.background='';
                const f=e.dataTransfer.files[0];
                if(f){setFile(f);setError('');
                  // Auto-select matching chip
                  const ext=f.name.split('.').pop().toLowerCase();
                  const match=FILE_TYPES.find(t=>t.ext.includes(ext));
                  if(match){setActiveFilter(match.label);setFilterInfo(match);}
                }
              }}
              style={{border:`2px dashed ${file?YEAR_COLORS[year]+'80':'var(--border)'}`,
                borderRadius:12,padding:'28px 20px',textAlign:'center',cursor:'pointer',
                background:file?YEAR_BG[year]:'var(--input-bg)',
                transition:'border-color .15s,background .15s',marginBottom:8}}
            >
              {file?(
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12}}>
                  <div style={{width:44,height:44,borderRadius:10,
                    background:`${fileType?.color||'#4f9cf9'}15`,
                    border:`1px solid ${fileType?.color||'#4f9cf9'}30`,
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>
                    {fileType?.icon||'📄'}
                  </div>
                  <div style={{textAlign:'left',flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:'var(--text)',
                      overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{file.name}</div>
                    <div style={{fontSize:11,color:'var(--muted)',marginTop:2,display:'flex',gap:8}}>
                      <span>{(file.size/1024).toFixed(1)} KB</span>
                      <span style={{color:fileType?.color||'#4f9cf9',fontFamily:"'IBM Plex Mono',monospace",fontSize:9}}>{fileType?.label||'File'}</span>
                    </div>
                  </div>
                  <button onClick={e=>{e.stopPropagation();setFile(null);setActiveFilter('All');setFilterInfo(null);}}
                    style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:18,flexShrink:0}}>✕</button>
                </div>
              ):(
                <>
                  <div style={{fontSize:36,marginBottom:10}}>
                    {activeFilter==='All'?'📂':FILE_TYPES.find(t=>t.label===activeFilter)?.icon||'📂'}
                  </div>
                  <div style={{fontSize:13,color:'var(--text)',fontWeight:600,marginBottom:4}}>
                    {activeFilter==='All'?'Click to browse or drag & drop':
                     `Select a ${activeFilter} file`}
                  </div>
                  <div style={{fontSize:11,color:'var(--muted)'}}>
                    {activeFilter==='All'
                      ? FILE_TYPES.map(t=>t.ext[0].toUpperCase()).join(' · ')
                      : FILE_TYPES.find(t=>t.label===activeFilter)?.ext.map(e=>'.'+e).join(', ')}
                  </div>
                </>
              )}
              <input ref={fileRef} type="file"
                accept={activeFilter==='All'?ALL_ACCEPT:(FILE_TYPES.find(t=>t.label===activeFilter)?.accept||ALL_ACCEPT)}
                onChange={e=>{
                  const f=e.target.files[0];
                  if(f){
                    setFile(f);setError('');
                    const ext=f.name.split('.').pop().toLowerCase();
                    const match=FILE_TYPES.find(t=>t.ext.includes(ext));
                    if(match){setActiveFilter(match.label);setFilterInfo(match);}
                  }
                }} style={{display:'none'}}/>
            </div>
            <div style={{fontSize:11,color:'var(--muted)',textAlign:'center',marginBottom:2}}>
              AI extracts course content automatically · Tap a format chip above to filter
            </div>
          </div>
        )}

        {/* PASTE MODE */}
        {uploadMode==='paste'&&(
          <div className="fade-in">
            <div style={{background:'rgba(79,156,249,.05)',border:'1px solid rgba(79,156,249,.15)',borderRadius:10,padding:'12px 14px',marginBottom:12}}>
              <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.7}}>
                Open <strong style={{color:'var(--text)'}}>Claude.ai</strong> or <strong style={{color:'var(--text)'}}>ChatGPT</strong>, upload your file, paste this prompt:
              </div>
              <div style={{marginTop:8,background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:7,padding:'8px 12px',display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--muted)'}}>Generate a StudyHub JSON study guide…</span>
                <button onClick={copyPrompt} style={{background:copied?'rgba(127,218,150,.1)':'rgba(79,156,249,.1)',border:`1px solid ${copied?'rgba(127,218,150,.4)':'rgba(79,156,249,.3)'}`,borderRadius:5,color:copied?'#7fda96':'#4f9cf9',cursor:'pointer',padding:'4px 10px',fontSize:11,flexShrink:0}}>{copied?'✓ Copied':'Copy'}</button>
              </div>
            </div>
            <textarea value={pasteText} onChange={e=>setPasteText(e.target.value)} placeholder={'{\n  "courseName": "COS 341",\n  "chapterTitle": "Memory System",\n  ...\n}'} rows={9} style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'11px 14px',color:'var(--text)',fontSize:12,fontFamily:"'IBM Plex Mono',monospace",resize:'vertical',marginBottom:10}}/>
          </div>
        )}

        {/* Status */}
        {smartSortMsg&&<div style={{background:'rgba(168,249,79,.08)',border:'1px solid rgba(168,249,79,.25)',borderRadius:8,padding:'8px 14px',color:'#a8f94f',fontSize:12,marginBottom:10,display:'flex',alignItems:'center',gap:8}}><span>✨</span>{smartSortMsg.replace('✨ Smart sort: ','')}<span style={{color:'var(--muted)',fontSize:11,marginLeft:4}}>— pickers updated above</span></div>}
        {error&&<div style={{background:'rgba(240,80,80,.1)',border:'1px solid rgba(240,80,80,.4)',borderRadius:8,padding:'9px 14px',color:'#f05050',fontSize:12.5,marginBottom:10}}>{error}</div>}
        {status==='processing'&&<div style={{background:'rgba(79,156,249,.08)',border:'1px solid rgba(79,156,249,.2)',borderRadius:8,padding:'10px 14px',color:'#4f9cf9',fontSize:13,marginBottom:10,display:'flex',alignItems:'center',gap:10}}><span style={{animation:'spin 1s linear infinite',display:'inline-block'}}>⟳</span>{progress||'Processing…'}</div>}
        {status==='done'&&<div style={{background:'rgba(127,218,150,.08)',border:'1px solid rgba(127,218,150,.3)',borderRadius:8,padding:'10px 14px',color:'#7fda96',fontSize:13,marginBottom:10}}>{adminMode?'✓ Request submitted — awaiting superuser approval.':`✓ Course added — Year ${year}, Semester ${semester}${departments.length?`, ${departments.map(d=>DEPT_SHORT[d]||d).join(' + ')}`:''}.`}</div>}

        {/* Actions */}
        <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:4}}>
          <button onClick={onClose} style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'9px 18px',fontSize:13}}>Cancel</button>
          <button
            onClick={uploadMode==='file'?processFile:processPaste}
            disabled={!canGo}
            style={{background:!canGo?'var(--border)':adminMode?'#da7ff0':'#4f9cf9',border:'none',borderRadius:8,color:!canGo?'var(--muted)':'#000',cursor:!canGo?'not-allowed':'pointer',padding:'9px 22px',fontSize:13,fontWeight:700}}
          >
            {status==='processing'?'Processing…':status==='done'?'Done ✓':adminMode?'Submit for Approval':uploadMode==='file'?'Analyse File':'Review & Save'}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}


/* ═══════════════ PRIORITY STYLES ═══════════════ */
const PRIORITY={
  info:    {color:'#4f9cf9',bg:'rgba(79,156,249,.08)',border:'rgba(79,156,249,.2)',icon:'ℹ️'},
  warning: {color:'#f9a84f',bg:'rgba(249,168,79,.08)',border:'rgba(249,168,79,.2)', icon:'⚠️'},
  urgent:  {color:'#f05050',bg:'rgba(240,80,80,.08)', border:'rgba(240,80,80,.25)',  icon:'🚨'},
};

/* ═══════════════ GLOBAL ANNOUNCEMENT STRIP ═══════════════ */
function GlobalAnnouncementStrip({user}){
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
function AnnouncementsTab({courseId,user,onNew}){
  const[items,setItems]=useState([]);const[showForm,setShowForm]=useState(false);
  const[form,setForm]=useState({title:'',body:'',priority:'info',pinned:false,global:false});
  const[loading,setLoading]=useState(false);const[msg,setMsg]=useState('');
  const isPriv=user.role===ROLE.SUPERUSER||user.role===ROLE.ADMIN;
  const isSU2=user.role===ROLE.SUPERUSER;
  const flash=m=>{setMsg(m);setTimeout(()=>setMsg(''),3000);};

  const load=async()=>{const d=await dbLoadAnnouncements(courseId);setItems(d);};
  useEffect(()=>{load();},[courseId]);

  const save=async()=>{
    if(!form.title.trim())return;setLoading(true);
    const a={id:`ann-${Date.now()}`,course_id:form.global?null:courseId,title:form.title,body:form.body,priority:form.priority,pinned:form.pinned,posted_by:user.username,posted_at:new Date().toISOString()};
    await dbSaveAnnouncement(a);
    // Push notification if permission granted
    pushNotification(`📢 ${form.priority==='urgent'?'URGENT: ':''}${form.title}`,form.body||'New announcement on StudyHub');
    onNew?.();
    setForm({title:'',body:'',priority:'info',pinned:false,global:false});setShowForm(false);setLoading(false);
    await load();flash('✓ Announcement posted.');
  };
  const del=async id=>{await dbDeleteAnnouncement(id);await load();};
  const togglePin=async(id,pinned)=>{await dbPinAnnouncement(id,!pinned);await load();};

  return(
    <div className="fade-up">
      <SectionLabel>Announcements</SectionLabel>
      {msg&&<div className="slide-down" style={{background:'rgba(127,218,150,.08)',border:'1px solid rgba(127,218,150,.3)',borderRadius:8,padding:'9px 14px',color:'#7fda96',fontSize:12,marginBottom:12}}>{msg}</div>}
      {isPriv&&(
        <button onClick={()=>setShowForm(s=>!s)} style={{background:'rgba(249,168,79,.1)',border:'1px solid rgba(249,168,79,.25)',borderRadius:8,color:'#f9a84f',cursor:'pointer',padding:'8px 16px',fontSize:12,fontWeight:600,marginBottom:14}}>
          {showForm?'✕ Cancel':'📢 Post Announcement'}
        </button>
      )}
      {showForm&&isPriv&&(
        <div className="scale-in" style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'16px 18px',marginBottom:16}}>
          <Field label="TITLE *" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Exam date moved"/>
          <Field label="MESSAGE (optional)" value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} placeholder="Full details…"/>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>PRIORITY</div>
            <div style={{display:'flex',gap:8}}>
              {Object.entries(PRIORITY).map(([k,v])=>(
                <button key={k} onClick={()=>setForm(f=>({...f,priority:k}))} style={{flex:1,padding:'8px 0',borderRadius:7,border:`1px solid ${form.priority===k?v.color+'70':'var(--border)'}`,background:form.priority===k?v.bg:'var(--input-bg)',color:form.priority===k?v.color:'var(--muted)',cursor:'pointer',fontSize:12,fontWeight:form.priority===k?700:400,display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>
                  {v.icon} {k.charAt(0).toUpperCase()+k.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:'flex',gap:16,marginBottom:14}}>
            <label style={{display:'flex',alignItems:'center',gap:7,cursor:'pointer',fontSize:13,color:'var(--text)'}}>
              <input type="checkbox" checked={form.pinned} onChange={e=>setForm(f=>({...f,pinned:e.target.checked}))} style={{width:15,height:15}}/>
              📌 Pin to top
            </label>
            {isSU2&&(
              <label style={{display:'flex',alignItems:'center',gap:7,cursor:'pointer',fontSize:13,color:'var(--text)'}}>
                <input type="checkbox" checked={form.global} onChange={e=>setForm(f=>({...f,global:e.target.checked}))} style={{width:15,height:15}}/>
                🌐 Post globally (all courses)
              </label>
            )}
          </div>
          <button onClick={save} disabled={loading||!form.title.trim()} style={{background:PRIORITY[form.priority].color,border:'none',borderRadius:7,color:'#000',cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:700}}>
            {loading?'Posting…':'Post Announcement'}
          </button>
        </div>
      )}
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {items.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:30,border:'1px dashed var(--border)',borderRadius:10,fontSize:13}}>No announcements yet.</div>}
        {items.map((a,i)=>{
          const p=PRIORITY[a.priority]||PRIORITY.info;
          return(
            <div key={a.id} className={`stagger-${Math.min(i%4+1,4)}`} style={{background:p.bg,border:`1px solid ${p.border}`,borderRadius:10,padding:'14px 17px',borderLeft:`3px solid ${p.color}`,position:'relative'}}>
              {a.pinned&&<span style={{position:'absolute',top:10,right:isPriv?40:12,fontSize:14}}>📌</span>}
              {!a.course_id&&<span style={{position:'absolute',top:10,right:isPriv?62:34,fontSize:11,fontFamily:"'IBM Plex Mono',monospace",color:'var(--muted)'}}>GLOBAL</span>}
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                    <span style={{fontSize:14}}>{p.icon}</span>
                    <span style={{fontSize:14,fontWeight:700,color:p.color}}>{a.title}</span>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:`${p.color}18`,color:p.color,borderRadius:4,padding:'2px 7px',textTransform:'uppercase'}}>{a.priority}</span>
                  </div>
                  {a.body&&<p style={{fontSize:13,color:'var(--text)',lineHeight:1.7,margin:'0 0 6px'}}>{a.body}</p>}
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)'}}>@{a.posted_by} · {new Date(a.posted_at).toLocaleString()}</div>
                </div>
                {isPriv&&(
                  <div style={{display:'flex',gap:6,flexShrink:0}}>
                    <button onClick={()=>togglePin(a.id,a.pinned)} title={a.pinned?'Unpin':'Pin'} style={{background:'none',border:'none',color:a.pinned?'#f9a84f':'var(--muted)',cursor:'pointer',fontSize:14}}>📌</button>
                    <button onClick={()=>del(a.id)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:13}}>✕</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════ NOTIFICATION BELL ═══════════════ */
function NotificationBell({user,courses,onNavigate}){
  const[open,setOpen]=useState(false);
  const[notifs,setNotifs]=useState({items:[],unseenCount:0,seen:new Set()});
  const[permState,requestPerm]=useNotificationPermission();
  const[showPermBanner,setShowPermBanner]=useState(false);
  const[askingPerm,setAskingPerm]=useState(false); // blocks outside-click while dialog is open
  const bellRef=useRef();
  const dropRef=useRef();

  const load=useCallback(async()=>{
    if(!user||user.isGuest)return;
    const n=await dbLoadNotifications(user.username);
    setNotifs(n);
    if(permState==='default'&&!localStorage.getItem('sh-notif-asked')&&n.unseenCount>0){
      setShowPermBanner(true);
    }
  },[user,permState]);

  useEffect(()=>{load();},[]);
  useEffect(()=>{if(open)load();},[open]);

  // Close on outside click — but NOT while the permission dialog is open
  useEffect(()=>{
    const h=e=>{
      if(askingPerm) return; // system permission dialog is showing — don't close
      if(bellRef.current&&!bellRef.current.contains(e.target)&&
         dropRef.current&&!dropRef.current.contains(e.target)){
        setOpen(false);
      }
    };
    document.addEventListener('mousedown',h);
    document.addEventListener('touchstart',h,{passive:true});
    return()=>{
      document.removeEventListener('mousedown',h);
      document.removeEventListener('touchstart',h);
    };
  },[askingPerm]);

  const markAllSeen=async()=>{
    const unseen=notifs.items.filter(i=>!notifs.seen.has(i.id));
    await Promise.all(unseen.map(i=>dbMarkSeen(user.username,i.id,i.type)));
    await load();
  };

  const handleOpen=()=>{setOpen(o=>!o);if(!open)markAllSeen();};

  const askPermission=async(e)=>{
    e?.stopPropagation(); // prevent click bubbling to outside handler
    setAskingPerm(true);
    try{
      const result=await requestPerm();
      setShowPermBanner(false);
      localStorage.setItem('sh-notif-asked','1');
      if(result==='granted'){
        pushNotification('🔔 Notifications enabled','You\'ll get alerts for new assignments and announcements.');
      }
    }finally{
      setAskingPerm(false);
    }
  };

  const courseMap=Object.fromEntries((courses||[]).map(c=>[c.id,c.courseName||c.chapterTitle]));
  const count=notifs.unseenCount;

  return(
    <div ref={bellRef} style={{position:'relative'}} className="no-print">

      {/* Permission banner — fixed, centred, above everything */}
      {showPermBanner&&(
        <div className="slide-down" style={{position:'fixed',top:16,left:'50%',transform:'translateX(-50%)',
          background:'var(--card)',border:'1px solid rgba(249,168,79,.35)',borderRadius:13,
          padding:'13px 18px',display:'flex',alignItems:'center',gap:12,
          zIndex:9800,boxShadow:'var(--shadow)',maxWidth:400,width:'calc(100% - 32px)'}}>
          <span style={{fontSize:24,flexShrink:0}}>🔔</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,color:'var(--text)',marginBottom:2}}>Enable notifications?</div>
            <div style={{fontSize:11,color:'var(--muted)',lineHeight:1.4}}>Get alerts for assignments, CAs and announcements.</div>
          </div>
          <button onClick={e=>askPermission(e)}
            style={{background:'#f9a84f',border:'none',borderRadius:7,color:'#000',
              cursor:'pointer',padding:'7px 14px',fontSize:12,fontWeight:700,flexShrink:0,minHeight:36}}>
            {askingPerm?'…':'Enable'}
          </button>
          <button onClick={e=>{e.stopPropagation();setShowPermBanner(false);localStorage.setItem('sh-notif-asked','1');}}
            style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:18,padding:'4px',lineHeight:1,flexShrink:0}}>✕</button>
        </div>
      )}

      {/* Bell button */}
      <button onClick={handleOpen}
        style={{position:'relative',background:open?'rgba(249,168,79,.12)':'var(--surface)',
          border:`1px solid ${open?'rgba(249,168,79,.4)':'var(--border)'}`,
          borderRadius:10,color:open?'#f9a84f':'var(--text)',cursor:'pointer',
          padding:'8px 11px',fontSize:18,display:'flex',alignItems:'center',minHeight:40,minWidth:40,justifyContent:'center'}}>
        🔔
        {count>0&&(
          <span style={{position:'absolute',top:-4,right:-4,background:'#f05050',color:'#fff',
            borderRadius:'50%',width:17,height:17,display:'flex',alignItems:'center',justifyContent:'center',
            fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,
            border:'2px solid var(--bg)'}}>{count>9?'9+':count}</span>
        )}
      </button>

      {/* Full-screen backdrop + panel */}
      {open&&(
        <>
          {/* Backdrop — dims everything behind, closes on tap */}
          <div onClick={()=>setOpen(false)} style={{
            position:'fixed',inset:0,
            background:'rgba(0,0,0,.55)',
            backdropFilter:'blur(2px)',
            zIndex:9998,
          }}/>

          {/* Panel — bottom sheet on mobile, dropdown on desktop */}
          <div ref={dropRef} style={{
            position:'fixed',
            /* Mobile: full-width bottom sheet */
            bottom:0, left:0, right:0,
            /* Desktop: dropdown from top-right */
            maxWidth:'min(420px, 100vw)',
            marginLeft:'auto',
            /* On desktop push it below topbar */
            maxHeight:'80vh',
            background:'var(--card)',
            border:'1px solid var(--border)',
            borderRadius:'18px 18px 0 0',
            boxShadow:'0 -8px 40px rgba(0,0,0,.6)',
            zIndex:9999,
            display:'flex',flexDirection:'column',
            overflow:'hidden',
            animation:'slideUp .28s cubic-bezier(.4,0,.2,1) both',
          }}>
            {/* Handle bar (mobile feel) */}
            <div style={{width:40,height:4,borderRadius:2,background:'var(--border)',margin:'10px auto 0',flexShrink:0}}/>

            {/* Header */}
            <div style={{
              padding:'12px 18px',
              borderBottom:'1px solid var(--border)',
              display:'flex',alignItems:'center',justifyContent:'space-between',
              background:'var(--surface)',flexShrink:0,marginTop:4,
            }}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:'var(--text)',letterSpacing:1,fontWeight:700}}>
                🔔 NOTIFICATIONS
              </div>
              <div style={{display:'flex',gap:10,alignItems:'center'}}>
                {permState==='default'&&(
                  <button onClick={e=>askPermission(e)}
                    style={{background:'rgba(249,168,79,.12)',border:'1px solid rgba(249,168,79,.35)',
                      borderRadius:7,color:'#f9a84f',cursor:'pointer',padding:'5px 12px',
                      fontSize:12,fontWeight:700,minHeight:34,display:'flex',alignItems:'center',gap:5}}>
                    {askingPerm?'Asking…':'🔔 Enable Push'}
                  </button>
                )}
                {permState==='granted'&&(
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'#7fda96',
                    background:'rgba(127,218,150,.1)',border:'1px solid rgba(127,218,150,.3)',
                    borderRadius:5,padding:'3px 8px',letterSpacing:1}}>✓ Push on</span>
                )}
                {permState==='denied'&&(
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'#f05050',letterSpacing:1}}>Push blocked</span>
                )}
                <button onClick={()=>setOpen(false)}
                  style={{background:'var(--surface)',border:'1px solid var(--border)',
                    borderRadius:'50%',color:'var(--muted)',cursor:'pointer',
                    width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:16,flexShrink:0}}>✕</button>
              </div>
            </div>

            {/* Items list */}
            <div style={{overflowY:'auto',flex:1,paddingBottom:'env(safe-area-inset-bottom,12px)'}}>
              {notifs.items.length===0&&(
                <div style={{padding:'40px 20px',textAlign:'center',color:'var(--muted)',fontSize:13}}>
                  <div style={{fontSize:36,marginBottom:10}}>🔕</div>
                  <div style={{fontWeight:600,marginBottom:4}}>No notifications yet</div>
                  <div style={{fontSize:11}}>New assignments, CAs and announcements will appear here</div>
                </div>
              )}
              {notifs.items.map((n,i)=>{
                const p=PRIORITY[n.priority]||PRIORITY.info;
                const unseen=!notifs.seen.has(n.id);
                // Map notification type to the tab it should open
                const targetTab = n.type==='assignment'?'assignments'
                  : n.type==='ca'?'ca'
                  : n.type==='announcement'?'announcements'
                  : null;
                const isClickable = !!(n.courseId && onNavigate);
                const handleClick = ()=>{
                  if(!isClickable) return;
                  setOpen(false);
                  onNavigate(n.courseId, targetTab);
                };
                return(
                  <div key={n.id}
                    onClick={handleClick}
                    style={{
                      padding:'14px 18px',
                      borderBottom:'1px solid var(--border)',
                      display:'flex',gap:12,alignItems:'flex-start',
                      background:unseen?`${p.color}08`:'transparent',
                      cursor:isClickable?'pointer':'default',
                      transition:'background .15s',
                    }}
                    onMouseEnter={e=>isClickable&&(e.currentTarget.style.background=`${p.color}15`)}
                    onMouseLeave={e=>(e.currentTarget.style.background=unseen?`${p.color}08`:'transparent')}
                  >
                    {/* Priority colour strip */}
                    <div style={{width:3,alignSelf:'stretch',borderRadius:2,
                      background:unseen?p.color:'transparent',flexShrink:0,minHeight:20}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:unseen?700:400,color:'var(--text)',
                        marginBottom:4,display:'flex',alignItems:'center',gap:7,flexWrap:'wrap'}}>
                        <span>{p.icon}</span>
                        <span style={{wordBreak:'break-word'}}>{n.title}</span>
                        {n.priority==='urgent'&&(
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,
                            background:'rgba(240,80,80,.15)',color:'#f05050',
                            borderRadius:3,padding:'2px 6px',fontWeight:700}}>URGENT</span>
                        )}
                        {unseen&&<span style={{width:7,height:7,borderRadius:'50%',
                          background:p.color,display:'inline-block',flexShrink:0}}/>}
                      </div>
                      {n.body&&<div style={{fontSize:12.5,color:'var(--text)',opacity:.8,
                        lineHeight:1.6,marginBottom:5}}>{n.body}</div>}
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,
                        color:'var(--muted)',display:'flex',gap:10,flexWrap:'wrap',marginTop:2,
                        alignItems:'center'}}>
                        {n.courseId&&<span>📚 {courseMap[n.courseId]||n.courseId}</span>}
                        <span>{new Date(n.time).toLocaleString()}</span>
                        {isClickable&&<span style={{color:p.color,fontSize:9}}>Tap to open →</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════ ASSIGNMENTS TAB ═══════════════ */
function AssignmentsTab({courseId,user}){
  const[items,setItems]=useState([]);const[showForm,setShowForm]=useState(false);
  const[form,setForm]=useState({title:'',description:'',due_date:'',marks:'',file_url:''});
  const[loading,setLoading]=useState(false);const[msg,setMsg]=useState('');
  const isPriv=user.role===ROLE.SUPERUSER||user.role===ROLE.ADMIN;
  const isSU2=user.role===ROLE.SUPERUSER;
  const flash=m=>{setMsg(m);setTimeout(()=>setMsg(''),3000);};

  const load=async()=>{const d=await dbLoadAssignments(courseId);setItems(d);};
  useEffect(()=>{load();},[courseId]);

  const save=async()=>{
    if(!form.title.trim())return;setLoading(true);
    const a={id:`as-${Date.now()}`,course_id:courseId,title:form.title,description:form.description,due_date:form.due_date||null,marks:form.marks?parseInt(form.marks):null,file_url:form.file_url||null,added_by:user.username,added_at:new Date().toISOString()};
    if(isSU2){await dbSaveAssignment(a);await load();}
    else{await dbSubmitPending('add_resource',user.username,{...a,_table:'assignments'});flash('✓ Submitted for superuser approval.');}
    setForm({title:'',description:'',due_date:'',marks:'',file_url:''});setShowForm(false);setLoading(false);
  };
  const del=async id=>{
    if(isSU2){await dbDeleteAssignment(id);await load();}
    else{await dbSubmitPending('delete_resource',user.username,{id,_table:'assignments'});flash('✓ Deletion submitted for approval.');}
  };

  const overdue=d=>d&&new Date(d)<new Date();
  return(
    <div className="fade-up">
      <SectionLabel>Assignments</SectionLabel>
      {msg&&<div className="slide-down" style={{background:'rgba(127,218,150,.08)',border:'1px solid rgba(127,218,150,.3)',borderRadius:8,padding:'9px 14px',color:'#7fda96',fontSize:12,marginBottom:12}}>{msg}</div>}
      {!isPriv&&<div style={{background:'rgba(79,156,249,.05)',border:'1px solid rgba(79,156,249,.15)',borderRadius:8,padding:'9px 13px',fontSize:12,color:'var(--muted)',marginBottom:14}}>📋 Assignments posted by admins will appear here.</div>}
      {isPriv&&(
        <button onClick={()=>setShowForm(s=>!s)} style={{background:'rgba(249,168,79,.1)',border:'1px solid rgba(249,168,79,.25)',borderRadius:8,color:'#f9a84f',cursor:'pointer',padding:'8px 16px',fontSize:12,fontWeight:600,marginBottom:14}}>
          {showForm?'✕ Cancel':isSU2?'+ Add Assignment':'+ Request Assignment'}
        </button>
      )}
      {showForm&&isPriv&&(
        <div className="scale-in" style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'16px 18px',marginBottom:16}}>
          <Field label="TITLE *" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Lab Report 1"/>
          <Field label="DESCRIPTION" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="What is required…"/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Field label="DUE DATE" type="date" value={form.due_date} onChange={e=>setForm(f=>({...f,due_date:e.target.value}))}/>
            <Field label="MARKS (optional)" type="number" value={form.marks} onChange={e=>setForm(f=>({...f,marks:e.target.value}))} placeholder="e.g. 20"/>
          </div>
          <Field label="FILE / LINK (optional)" value={form.file_url} onChange={e=>setForm(f=>({...f,file_url:e.target.value}))} placeholder="https://..."/>
          <button onClick={save} disabled={loading||!form.title.trim()} style={{background:'#f9a84f',border:'none',borderRadius:7,color:'#000',cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:700}}>
            {loading?'Saving…':isSU2?'Save Assignment':'Submit for Approval'}
          </button>
        </div>
      )}
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {items.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:30,border:'1px dashed var(--border)',borderRadius:10,fontSize:13}}>No assignments posted yet.</div>}
        {items.map((a,i)=>(
          <div key={a.id} className={`stagger-${Math.min(i%4+1,4)}`} style={{background:'var(--card)',border:`1px solid ${overdue(a.due_date)?'rgba(240,80,80,.25)':'var(--border)'}`,borderRadius:10,padding:'14px 17px'}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:5}}>
                  <span style={{fontSize:14,fontWeight:600,color:'var(--text)'}}>{a.title}</span>
                  {a.marks&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:'rgba(249,168,79,.15)',color:'#f9a84f',borderRadius:4,padding:'2px 7px'}}>{a.marks} marks</span>}
                  {a.due_date&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:overdue(a.due_date)?'rgba(240,80,80,.15)':'rgba(127,218,150,.15)',color:overdue(a.due_date)?'#f05050':'#7fda96',borderRadius:4,padding:'2px 7px'}}>Due {new Date(a.due_date).toLocaleDateString()}{overdue(a.due_date)?'  ⚠ Overdue':''}</span>}
                </div>
                {a.description&&<p style={{fontSize:12.5,color:'var(--muted)',lineHeight:1.6,margin:'0 0 8px'}}>{a.description}</p>}
                {a.file_url&&<a href={a.file_url} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'#4f9cf9',textDecoration:'none'}}>📎 View file / link</a>}
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginTop:6}}>Posted by @{a.added_by} · {new Date(a.added_at).toLocaleDateString()}</div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:6,flexShrink:0,alignItems:'flex-end'}}>
                {/* AI Help button — opens chatbot in assignment mode */}
                <button
                  onClick={()=>{
                    // Store assignment context for chatbot to pick up
                    window.__assignmentContext={
                      mode:'assignment',
                      assignmentTitle:a.title,
                      assignmentDescription:a.description||'',
                      assignmentQuestions:a.description||'',
                      courseName:'',
                    };
                    // Open chatbot
                    try{localStorage.setItem('sh-bot-open','1');}catch{}
                    // Fire a custom event so chatbot can react
                    window.dispatchEvent(new CustomEvent('sh-open-bot-assignment',{detail:window.__assignmentContext}));
                  }}
                  style={{background:'linear-gradient(135deg,rgba(79,156,249,.15),rgba(127,95,249,.15))',
                    border:'1px solid rgba(79,156,249,.3)',borderRadius:7,
                    color:'#4f9cf9',cursor:'pointer',padding:'6px 12px',fontSize:11,fontWeight:600,
                    display:'flex',alignItems:'center',gap:5,whiteSpace:'nowrap'}}>
                  🤖 AI Help
                </button>
                {isPriv&&<button onClick={()=>del(a.id)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:13}}>{isSU2?'✕':'↑'}</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════ CA / TESTS TAB ═══════════════ */
const CA_TYPES=['CA','Test','Quiz','Lab','Other'];
const CA_COLORS={CA:'#da7ff0',Test:'#f05050',Quiz:'#4f9cf9',Lab:'#7fda96',Other:'#f9a84f'};

function CATab({courseId,user}){
  const[items,setItems]=useState([]);const[showForm,setShowForm]=useState(false);
  const[form,setForm]=useState({title:'',type:'CA',description:'',date:'',marks:'',file_url:''});
  const[loading,setLoading]=useState(false);const[msg,setMsg]=useState('');
  const isPriv=user.role===ROLE.SUPERUSER||user.role===ROLE.ADMIN;
  const isSU2=user.role===ROLE.SUPERUSER;
  const flash=m=>{setMsg(m);setTimeout(()=>setMsg(''),3000);};

  const load=async()=>{const d=await dbLoadCAs(courseId);setItems(d);};
  useEffect(()=>{load();},[courseId]);

  const save=async()=>{
    if(!form.title.trim())return;setLoading(true);
    const a={id:`ca-${Date.now()}`,course_id:courseId,title:form.title,type:form.type,description:form.description,date:form.date||null,marks:form.marks?parseInt(form.marks):null,file_url:form.file_url||null,added_by:user.username,added_at:new Date().toISOString()};
    if(isSU2){await dbSaveCA(a);await load();}
    else{await dbSubmitPending('add_resource',user.username,{...a,_table:'course_cas'});flash('✓ Submitted for superuser approval.');}
    setForm({title:'',type:'CA',description:'',date:'',marks:'',file_url:''});setShowForm(false);setLoading(false);
  };
  const del=async id=>{
    if(isSU2){await dbDeleteCA(id);await load();}
    else{await dbSubmitPending('delete_resource',user.username,{id,_table:'course_cas'});flash('✓ Deletion submitted for approval.');}
  };

  return(
    <div className="fade-up">
      <SectionLabel>CAs / Tests / Quizzes</SectionLabel>
      {msg&&<div className="slide-down" style={{background:'rgba(127,218,150,.08)',border:'1px solid rgba(127,218,150,.3)',borderRadius:8,padding:'9px 14px',color:'#7fda96',fontSize:12,marginBottom:12}}>{msg}</div>}
      {!isPriv&&<div style={{background:'rgba(218,127,240,.05)',border:'1px solid rgba(218,127,240,.15)',borderRadius:8,padding:'9px 13px',fontSize:12,color:'var(--muted)',marginBottom:14}}>📝 Continuous Assessments and tests for this course will appear here.</div>}
      {isPriv&&(
        <button onClick={()=>setShowForm(s=>!s)} style={{background:'rgba(218,127,240,.1)',border:'1px solid rgba(218,127,240,.25)',borderRadius:8,color:'#da7ff0',cursor:'pointer',padding:'8px 16px',fontSize:12,fontWeight:600,marginBottom:14}}>
          {showForm?'✕ Cancel':isSU2?'+ Add CA / Test':'+ Request CA / Test'}
        </button>
      )}
      {showForm&&isPriv&&(
        <div className="scale-in" style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'16px 18px',marginBottom:16}}>
          <Field label="TITLE *" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. CA 1 — Data Structures"/>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>TYPE</div>
            <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
              {CA_TYPES.map(t=><button key={t} onClick={()=>setForm(f=>({...f,type:t}))} style={{padding:'6px 13px',borderRadius:7,border:`1px solid ${form.type===t?CA_COLORS[t]:'var(--border)'}`,background:form.type===t?`${CA_COLORS[t]}15`:'var(--input-bg)',color:form.type===t?CA_COLORS[t]:'var(--muted)',cursor:'pointer',fontSize:12,fontWeight:form.type===t?600:400}}>{t}</button>)}
            </div>
          </div>
          <Field label="DESCRIPTION (optional)" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Topics covered, format…"/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Field label="DATE" type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
            <Field label="MARKS (optional)" type="number" value={form.marks} onChange={e=>setForm(f=>({...f,marks:e.target.value}))} placeholder="e.g. 30"/>
          </div>
          <Field label="FILE / LINK (optional)" value={form.file_url} onChange={e=>setForm(f=>({...f,file_url:e.target.value}))} placeholder="https://past paper link…"/>
          <button onClick={save} disabled={loading||!form.title.trim()} style={{background:'#da7ff0',border:'none',borderRadius:7,color:'#000',cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:700}}>
            {loading?'Saving…':isSU2?'Save':'Submit for Approval'}
          </button>
        </div>
      )}
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {items.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:30,border:'1px dashed var(--border)',borderRadius:10,fontSize:13}}>No CAs or tests posted yet.</div>}
        {items.map((a,i)=>{
          const col=CA_COLORS[a.type]||'#da7ff0';
          return(
            <div key={a.id} className={`stagger-${Math.min(i%4+1,4)}`} style={{background:'var(--card)',border:`1px solid ${col}25`,borderRadius:10,padding:'14px 17px',borderLeft:`3px solid ${col}`}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:5}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:`${col}18`,color:col,borderRadius:4,padding:'2px 7px',fontWeight:600}}>{a.type}</span>
                    <span style={{fontSize:14,fontWeight:600,color:'var(--text)'}}>{a.title}</span>
                    {a.marks&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:'rgba(249,168,79,.15)',color:'#f9a84f',borderRadius:4,padding:'2px 7px'}}>{a.marks} marks</span>}
                    {a.date&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:'rgba(136,146,164,.1)',color:'var(--muted)',borderRadius:4,padding:'2px 7px'}}>{new Date(a.date).toLocaleDateString()}</span>}
                  </div>
                  {a.description&&<p style={{fontSize:12.5,color:'var(--muted)',lineHeight:1.6,margin:'0 0 5px'}}>{a.description}</p>}
                  {a.file_url&&<a href={a.file_url} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'#4f9cf9',textDecoration:'none'}}>📎 View file / past paper</a>}
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginTop:6}}>Posted by @{a.added_by} · {new Date(a.added_at).toLocaleDateString()}</div>
                </div>
                {isPriv&&<button onClick={()=>del(a.id)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:13,flexShrink:0}}>{isSU2?'✕':'↑'}</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════ COMMUNITY BOARD ═══════════════ */
function CommunityBoard({courseId,user}){
  const[posts,setPosts]=useState([]);const[myVotes,setMyVotes]=useState([]);const[showForm,setShowForm]=useState(false);
  const[form,setForm]=useState({title:'',url:'',description:''});const[loading,setLoading]=useState(false);
  const isPriv=user.role!==ROLE.USER;
  const isGuest=user.isGuest===true;

  const load=async()=>{const[p,v]=await Promise.all([dbLoadCommunity(courseId),dbGetMyVotes(user.username)]);setPosts(p);setMyVotes(v);};
  useEffect(()=>{load();},[courseId]);

  const submit=async()=>{
    if(!form.title.trim()||!form.url.trim())return;
    setLoading(true);
    try{
      await dbSubmitPost({id:`cp-${Date.now()}`,course_id:courseId,title:form.title,url:form.url,description:form.description,submitted_by:user.username,submitted_at:new Date().toISOString(),upvote_count:0});
      setForm({title:'',url:'',description:''});setShowForm(false);await load();
    }catch(e){console.error(e);}setLoading(false);
  };

  const vote=async id=>{if(isGuest)return;await dbUpvote(user.username,id);await load();};
  const del=async id=>{
    const ok=await(window.shConfirm?.({title:'Delete post?',message:'This post will be permanently removed.',danger:true,confirmLabel:'Delete'})??Promise.resolve(true));
    if(!ok)return;
    await dbDeletePost(id);await load();
  };

  return(
    <div className="fade-up">
      <SectionLabel>Community Board</SectionLabel>
      <div style={{background:'rgba(79,156,249,.05)',border:'1px solid rgba(79,156,249,.15)',borderRadius:10,padding:'10px 14px',marginBottom:16,fontSize:12,color:'var(--muted)'}}>
        📌 Share useful links, videos, or resources for this course. Upvote what's helpful.
      </div>

      {isGuest?(
        <div style={{background:'rgba(249,168,79,.06)',border:'1px solid rgba(249,168,79,.2)',borderRadius:10,padding:'14px 16px',marginBottom:16,display:'flex',gap:10,alignItems:'center'}}>
          <span style={{fontSize:18}}>🔒</span>
          <div><div style={{fontSize:13,color:'#f9a84f',fontWeight:600,marginBottom:2}}>Create an account to participate</div><div style={{fontSize:12,color:'var(--muted)'}}>Guests can read posts but cannot submit or upvote.</div></div>
        </div>
      ):(
        <button onClick={()=>setShowForm(s=>!s)} style={{background:'rgba(79,156,249,.1)',border:'1px solid rgba(79,156,249,.25)',borderRadius:8,color:'#4f9cf9',cursor:'pointer',padding:'8px 16px',fontSize:12,fontWeight:600,marginBottom:16}}>
          {showForm?'✕ Cancel':'+ Submit a Resource'}
        </button>
      )}

      {showForm&&!isGuest&&(
        <div className="scale-in" style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'16px 18px',marginBottom:16}}>
          <Field label="TITLE" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Great YouTube explanation"/>
          <Field label="URL" value={form.url} onChange={e=>setForm(f=>({...f,url:e.target.value}))} placeholder="https://..."/>
          <Field label="DESCRIPTION (optional)" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Brief note about this resource"/>
          <button onClick={submit} disabled={loading||!form.title.trim()||!form.url.trim()} style={{background:loading?'var(--border)':'#4f9cf9',border:'none',borderRadius:7,color:loading?'var(--muted)':'#000',cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:700}}>
            {loading?'Submitting…':'Submit'}
          </button>
        </div>
      )}

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {posts.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:30,border:'1px dashed var(--border)',borderRadius:10,fontSize:13}}>No community posts yet{isGuest?' — sign up to be the first!':' — be the first to share!'}</div>}
        {posts.map((p,i)=>{
          const voted=myVotes.includes(p.id);
          return(
            <div key={p.id} className={`stagger-${Math.min(i+1,4)}`} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:'13px 16px',display:'flex',gap:12,alignItems:'flex-start'}}>
              <button onClick={()=>vote(p.id)} disabled={isGuest} title={isGuest?'Sign up to vote':''} style={{background:voted?'rgba(79,156,249,.15)':'var(--input-bg)',border:`1px solid ${voted?'rgba(79,156,249,.4)':'var(--border)'}`,borderRadius:8,color:isGuest?'var(--border)':voted?'#4f9cf9':'var(--muted)',cursor:isGuest?'not-allowed':'pointer',padding:'6px 10px',display:'flex',flexDirection:'column',alignItems:'center',gap:2,flexShrink:0,minWidth:42}}>
                <span style={{fontSize:14}}>▲</span>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600}}>{p.upvote_count||0}</span>
              </button>
              <div style={{flex:1,minWidth:0}}>
                <a href={p.url} target="_blank" rel="noopener noreferrer" style={{fontSize:14,fontWeight:600,color:'#4f9cf9',textDecoration:'none',wordBreak:'break-word'}}>{p.title}</a>
                {p.description&&<p style={{fontSize:12,color:'var(--muted)',marginTop:3,lineHeight:1.5}}>{p.description}</p>}
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginTop:4,letterSpacing:1}}>@{p.submitted_by} · {new Date(p.submitted_at).toLocaleDateString()}</div>
              </div>
              {(isPriv||p.submitted_by===user.username)&&<button onClick={()=>del(p.id)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:12,flexShrink:0}}>✕</button>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════ RESOURCES TAB ═══════════════ */
function ResourcesTab({courseId,user}){
  const[resources,setResources]=useState([]);const[showForm,setShowForm]=useState(false);
  const[form,setForm]=useState({title:'',url:'',type:'link'});const[loading,setLoading]=useState(false);
  const[msg,setMsg]=useState('');
  const isPriv=user.role!==ROLE.USER;
  const isSU2=user.role===ROLE.SUPERUSER;
  const flash=m=>{setMsg(m);setTimeout(()=>setMsg(''),3000);};

  const load=async()=>{const r=await dbLoadResources(courseId);setResources(r);};
  useEffect(()=>{load();},[courseId]);

  const add=async()=>{
    if(!form.title.trim()||!form.url.trim())return;setLoading(true);
    const resource={id:`r-${Date.now()}`,course_id:courseId,title:form.title,url:form.url,type:form.type,added_by:user.username,added_at:new Date().toISOString()};
    if(isSU2){
      await dbAddResource(resource);await load();
    } else {
      await dbSubmitPending('add_resource',user.username,resource);
      flash('✓ Resource submitted for superuser approval.');
    }
    setForm({title:'',url:'',type:'link'});setShowForm(false);setLoading(false);
  };

  const del=async id=>{
    if(isSU2){
      await dbDeleteResource(id);await load();
    } else {
      await dbSubmitPending('delete_resource',user.username,{id});
      flash('✓ Deletion request submitted for superuser approval.');
    }
  };

  return(
    <div className="fade-up">
      <SectionLabel>Resources</SectionLabel>
      {msg&&<div className="slide-down" style={{background:'rgba(127,218,150,.08)',border:'1px solid rgba(127,218,150,.3)',borderRadius:8,padding:'9px 14px',color:'#7fda96',fontSize:12.5,marginBottom:14}}>{msg}</div>}
      {isPriv&&!isSU2&&<div style={{background:'rgba(218,127,240,.06)',border:'1px solid rgba(218,127,240,.2)',borderRadius:8,padding:'8px 14px',fontSize:12,color:'#da7ff0',marginBottom:12}}>🛡 Resource add/remove requests go to the superuser for approval.</div>}
      {isPriv&&(
        <button onClick={()=>setShowForm(s=>!s)} style={{background:'rgba(127,218,150,.1)',border:'1px solid rgba(127,218,150,.25)',borderRadius:8,color:'#7fda96',cursor:'pointer',padding:'8px 16px',fontSize:12,fontWeight:600,marginBottom:16}}>
          {showForm?'✕ Cancel':isSU2?'+ Add Resource':'+ Request Resource'}
        </button>
      )}
      {showForm&&isPriv&&(
        <div className="scale-in" style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'16px 18px',marginBottom:16}}>
          <Field label="TITLE" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Official lecture slides"/>
          <Field label="URL" value={form.url} onChange={e=>setForm(f=>({...f,url:e.target.value}))} placeholder="https://..."/>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>TYPE</div>
            <div style={{display:'flex',gap:8}}>
              {['link','video','pdf','doc'].map(t=><button key={t} onClick={()=>setForm(f=>({...f,type:t}))} style={{padding:'7px 14px',borderRadius:7,border:`1px solid ${form.type===t?'#7fda96':'var(--border)'}`,background:form.type===t?'rgba(127,218,150,.1)':'var(--input-bg)',color:form.type===t?'#7fda96':'var(--muted)',cursor:'pointer',fontSize:12}}>{RES_ICONS[t]} {t}</button>)}
            </div>
          </div>
          <button onClick={add} disabled={loading} style={{background:'#7fda96',border:'none',borderRadius:7,color:'#000',cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:700}}>{loading?'Submitting…':isSU2?'Add Resource':'Submit for Approval'}</button>
        </div>
      )}
      <div style={{display:'flex',flexDirection:'column',gap:9}}>
        {resources.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:30,border:'1px dashed var(--border)',borderRadius:10,fontSize:13}}>No resources added yet{isPriv?'.':' — check back soon.'}.</div>}
        {resources.map((r,i)=>(
          <div key={r.id} className={`stagger-${Math.min(i+1,4)}`} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:'13px 16px',display:'flex',alignItems:'center',gap:12}}>
            <span style={{fontSize:20,flexShrink:0}}>{RES_ICONS[r.type]||'🔗'}</span>
            <div style={{flex:1,minWidth:0}}>
              <a href={r.url} target="_blank" rel="noopener noreferrer" style={{fontSize:14,fontWeight:600,color:'var(--text)',textDecoration:'none',wordBreak:'break-word'}}>{r.title}</a>
              <div style={{display:'flex',alignItems:'center',gap:8,marginTop:3}}>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',letterSpacing:1,textTransform:'uppercase'}}>{r.type}</span>
                {r.added_by&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)'}}>· @{r.added_by}</span>}
              </div>
            </div>
            {isPriv&&<button onClick={()=>del(r.id)} title={isSU2?'Delete resource':'Request deletion'} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:12,flexShrink:0}}>{isSU2?'✕':'↑'}</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════ COURSE VIEW ═══════════════ */
/* Definition row with copy-to-clipboard */
function DefinitionRow({def,isLast}){
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

const ALL_TABS=[{id:'announcements',label:'📢 Announcements'},{id:'concepts',label:'Key Concepts'},{id:'definitions',label:'Definitions'},{id:'mechanisms',label:'Mechanisms'},{id:'algorithms',label:'Algorithms'},{id:'takeaways',label:'Takeaways'},{id:'questions',label:'Practice Q&A'},{id:'assignments',label:'📋 Assignments'},{id:'ca',label:'📝 CA / Tests'},{id:'resources',label:'Resources'},{id:'community',label:'Community'}];

export { AnnouncementsTab, NotificationBell, AssignmentsTab, CATab, CommunityBoard, ResourcesTab, DefinitionRow, ALL_TABS };
