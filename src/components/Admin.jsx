import React,{ useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase, ROLE, YEARS, DEPARTMENTS, DEPT_SHORT, DEPT_COLOR, USER_TYPES,
  YEAR_COLORS, YEAR_BG, ROLE_COLOR, ROLE_BG, CARD_ACCENTS, TIER_CONFIG,
  APP_VERSION, getSubVal } from '../lib/constants.js';
import * as db from '../lib/db.js';
import { Tag, Mono, SectionLabel, Field, Avatar, RolePill, ProgressBar, Logo } from './UI.jsx';
import { useConfirm, pushNotification } from '../lib/hooks.js';
import { UploadModal } from './Upload.jsx';

export function AnalyticsTab({courses}){
  const[allProgress,setAllProgress]=useState([]);const[loading,setLoading]=useState(true);
  useEffect(()=>{dbLoadAllProgress().then(p=>{setAllProgress(p);setLoading(false);});},[]);

  const courseStats=courses.map(c=>{
    const cp=allProgress.filter(p=>p.course_id===c.id);
    const views=cp.filter(p=>p.viewed).length;
    const totalQs=c.qCount||1;
    const avgCompletion=cp.length===0?0:Math.round(cp.reduce((a,p)=>a+(p.opened_qs?.length||0)/totalQs*100,0)/cp.length);
    return{...c,views,avgCompletion,uniqueStudents:cp.length};
  }).sort((a,b)=>b.views-a.views);

  const totalViews=allProgress.filter(p=>p.viewed).length;
  const totalStudents=new Set(allProgress.map(p=>p.username)).size;
  const totalQsOpened=allProgress.reduce((a,p)=>a+(p.opened_qs?.length||0),0);

  if(loading)return<div style={{color:'var(--muted)',textAlign:'center',padding:40}}>Loading analytics…</div>;

  return(
    <div className="fade-up">
      {/* Summary cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:12,marginBottom:24}}>
        {[{label:'Total Views',val:totalViews,color:'#4f9cf9',icon:'👁'},{label:'Active Students',val:totalStudents,color:'#7fda96',icon:'👥'},{label:'Questions Opened',val:totalQsOpened,color:'#f9a84f',icon:'❓'},{label:'Total Courses',val:courses.length,color:'#da7ff0',icon:'📚'}].map((s,i)=>(
          <div key={i} className={`stagger-${i+1}`} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'14px 16px'}}>
            <div style={{fontSize:20,marginBottom:4}}>{s.icon}</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:24,color:s.color,fontWeight:600}}>{s.val}</div>
            <div style={{fontSize:11,color:'var(--muted)',marginTop:3}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Per-course — card list (no fixed-column grid that breaks on mobile) */}
      <SectionLabel>Course Performance</SectionLabel>
      {courseStats.length===0&&<div style={{padding:30,textAlign:'center',color:'var(--muted)',fontSize:13}}>No data yet.</div>}
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {courseStats.map((c,i)=>(
          <div key={c.id} className={`stagger-${Math.min(i%4+1,4)}`} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:'13px 16px'}}>
            {/* Course label */}
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:YEAR_COLORS[c.year],marginBottom:3,letterSpacing:1}}>
              Yr {c.year} · Sem {c.semester||1} · {DEPT_SHORT[c.department]||'CS'} · {c.courseName}
            </div>
            <div style={{fontSize:13,color:'var(--text)',fontWeight:500,marginBottom:10}}>{c.chapterTitle}</div>
            {/* Stats row */}
            <div style={{display:'flex',gap:16,flexWrap:'wrap',marginBottom:8}}>
              <div style={{display:'flex',alignItems:'center',gap:5}}>
                <span style={{fontSize:12}}>👁</span>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:'#4f9cf9',fontWeight:600}}>{c.views}</span>
                <span style={{fontSize:10,color:'var(--muted)'}}>views</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:5}}>
                <span style={{fontSize:12}}>👥</span>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:'#7fda96',fontWeight:600}}>{c.uniqueStudents}</span>
                <span style={{fontSize:10,color:'var(--muted)'}}>students</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:5}}>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:'#f9a84f',fontWeight:600}}>{c.avgCompletion}%</span>
                <span style={{fontSize:10,color:'var(--muted)'}}>avg completion</span>
              </div>
            </div>
            {/* Progress bar — always fits */}
            <div style={{height:5,background:'var(--border)',borderRadius:3,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${Math.min(c.avgCompletion,100)}%`,background:'#f9a84f',borderRadius:3,transition:'width .6s ease'}}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════ APPROVALS TAB ═══════════════ */

const ACTION_LABELS={
  add_course:   {icon:'📚',label:'Add Course',    color:'#4f9cf9'},
  delete_course:{icon:'🗑',label:'Delete Course', color:'#f05050'},
  add_resource: {icon:'🔗',label:'Add Resource',  color:'#7fda96'},
  delete_resource:{icon:'🗑',label:'Delete Resource',color:'#f9a84f'},
};


export function ApprovalsTab({onCourseChange,courses,reviewerUsername}){
  const[pending,setPending]=useState([]);const[history,setHistory]=useState([]);const[tab,setTab]=useState('pending');const[loading,setLoading]=useState(true);const[busy,setBusy]=useState('');const[rejectModal,setRejectModal]=useState(null);const[rejectNote,setRejectNote]=useState('');

  const load=async()=>{setLoading(true);const[p,h]=await Promise.all([dbLoadPending('pending'),dbLoadAllPending()]);setPending(p);setHistory(h.filter(a=>a.status!=='pending'));setLoading(false);};
  useEffect(()=>{load();},[]);

  const approve=async(action)=>{
    setBusy(action.id);
    try{
      // Execute the actual action
      if(action.action_type==='add_course'){
        const{entry,courseData}=action.payload;
        await dbSaveCourse(entry,courseData);
        const idx=await dbLoadCourseIndex();onCourseChange(idx);
      }
      if(action.action_type==='delete_course'){
        await dbDeleteCourse(action.payload.id);
        const idx=await dbLoadCourseIndex();onCourseChange(idx);
      }
      if(action.action_type==='add_resource'){
        await supabase.from('resources').insert(action.payload);
      }
      if(action.action_type==='delete_resource'){
        await dbDeleteResource(action.payload.id);
      }
      await dbReviewPending(action.id,'approved',reviewerUsername);
    }catch(e){console.error(e);}
    setBusy('');await load();
  };

  const reject=async()=>{
    if(!rejectModal)return;
    setBusy(rejectModal.id);
    await dbReviewPending(rejectModal.id,'rejected',reviewerUsername,rejectNote);
    setRejectModal(null);setRejectNote('');setBusy('');await load();
  };

  const list=tab==='pending'?pending:history;

  if(loading)return<div style={{color:'var(--muted)',textAlign:'center',padding:40}}>Loading approvals…</div>;

  return(
    <div className="fade-up">
      {/* Reject modal */}
      {rejectModal&&(
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setRejectModal(null)}>
          <div className="scale-in" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,padding:'26px 28px',maxWidth:420,width:'100%',boxShadow:'var(--shadow)'}}>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:19,color:'var(--text)',marginBottom:4}}>Reject Request</div>
            <p style={{fontSize:13,color:'var(--muted)',marginBottom:16}}>Optionally add a note explaining why this was rejected. The admin will see this.</p>
            <textarea value={rejectNote} onChange={e=>setRejectNote(e.target.value)} placeholder="Reason for rejection (optional)…" rows={3} style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 12px',color:'var(--text)',fontSize:13,fontFamily:"'DM Sans',sans-serif",resize:'none',marginBottom:16}}/>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button onClick={()=>setRejectModal(null)} style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'8px 16px',fontSize:13}}>Cancel</button>
              <button onClick={reject} style={{background:'rgba(240,80,80,.15)',border:'1px solid rgba(240,80,80,.4)',borderRadius:8,color:'#f05050',cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:700}}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}

      <div style={{background:'rgba(249,168,79,.06)',border:'1px solid rgba(249,168,79,.2)',borderRadius:10,padding:'12px 16px',marginBottom:20,display:'flex',gap:10,alignItems:'center'}}>
        <span style={{fontSize:20}}>⚡</span>
        <div>
          <div style={{color:'#f9a84f',fontSize:13,fontWeight:600,marginBottom:2}}>Superuser Approval Queue</div>
          <div style={{color:'var(--muted)',fontSize:12}}>All admin actions require your approval before taking effect. You can approve or reject with a note.</div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{display:'flex',gap:4,borderBottom:'1px solid var(--border)',marginBottom:18}}>
        {[{id:'pending',label:`Pending${pending.length>0?` (${pending.length})`:''}`,color:pending.length>0?'#f9a84f':undefined},{id:'history',label:'History'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{background:'none',border:'none',borderBottom:tab===t.id?`2px solid ${t.color||'#f9a84f'}`:'2px solid transparent',color:tab===t.id?(t.color||'#f9a84f'):'var(--muted)',cursor:'pointer',padding:'8px 16px',fontSize:13,fontWeight:tab===t.id?600:400}}>{t.label}</button>
        ))}
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {list.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:40,border:'1px dashed var(--border)',borderRadius:12,fontSize:13}}>{tab==='pending'?'✅ No pending requests — all clear.':'No history yet.'}</div>}
        {list.map((a,i)=>{
          const meta=ACTION_LABELS[a.action_type]||{icon:'❓',label:a.action_type,color:'#8892a4'};
          const isPending=a.status==='pending';
          const isApproved=a.status==='approved';
          return(
            <div key={a.id} className={`stagger-${Math.min(i%4+1,4)}`} style={{background:'var(--card)',border:`1px solid ${isPending?`${meta.color}30`:isApproved?'rgba(127,218,150,.2)':'rgba(240,80,80,.2)'}`,borderRadius:12,padding:'16px 18px'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
                <div style={{display:'flex',alignItems:'center',gap:12,flex:1,minWidth:200}}>
                  <div style={{width:40,height:40,borderRadius:10,background:`${meta.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{meta.icon}</div>
                  <div>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3,flexWrap:'wrap'}}>
                      <span style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{meta.label}</span>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:`${meta.color}15`,color:meta.color,borderRadius:4,padding:'2px 7px',letterSpacing:1}}>{a.action_type}</span>
                      {!isPending&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:isApproved?'rgba(127,218,150,.15)':'rgba(240,80,80,.15)',color:isApproved?'#7fda96':'#f05050',borderRadius:4,padding:'2px 7px',letterSpacing:1}}>{a.status.toUpperCase()}</span>}
                    </div>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--muted)',letterSpacing:1}}>
                      Requested by <span style={{color:'var(--text)',fontWeight:600}}>@{a.requested_by}</span> · {new Date(a.requested_at).toLocaleString()}
                    </div>
                    {/* Payload summary */}
                    {a.payload?.entry&&<div style={{fontSize:12,color:'var(--muted)',marginTop:4}}>Course: <span style={{color:'var(--text)'}}>{a.payload.entry.chapterTitle}</span> — Yr {a.payload.entry.year} · Sem {a.payload.entry.semester||1} · {DEPT_SHORT[a.payload.entry.department]||'CS'}</div>}
                    {a.payload?.chapterTitle&&<div style={{fontSize:12,color:'var(--muted)',marginTop:4}}>Course: <span style={{color:'var(--text)'}}>{a.payload.chapterTitle}</span></div>}
                    {a.payload?.title&&!a.payload?.entry&&<div style={{fontSize:12,color:'var(--muted)',marginTop:4}}>Resource: <span style={{color:'var(--text)'}}>{a.payload.title}</span></div>}
                    {!isPending&&a.note&&<div style={{fontSize:11,color:'var(--muted)',marginTop:5,fontStyle:'italic'}}>Note: {a.note}</div>}
                  </div>
                </div>
                {isPending&&(
                  <div style={{display:'flex',gap:8,flexShrink:0}}>
                    <button onClick={()=>approve(a)} disabled={busy===a.id} style={{background:'rgba(127,218,150,.12)',border:'1px solid rgba(127,218,150,.35)',borderRadius:8,color:'#7fda96',cursor:'pointer',padding:'8px 16px',fontSize:12,fontWeight:700}}>
                      {busy===a.id?'…':'✓ Approve'}
                    </button>
                    <button onClick={()=>setRejectModal(a)} disabled={busy===a.id} style={{background:'rgba(240,80,80,.1)',border:'1px solid rgba(240,80,80,.3)',borderRadius:8,color:'#f05050',cursor:'pointer',padding:'8px 14px',fontSize:12,fontWeight:700}}>✕ Reject</button>
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

/* ═══════════════ MANAGE ADMINS ═══════════════ */

export function ManageAdminsTab(){
  const[users,setUsers]=useState([]);const[admins,setAdmins]=useState([]);const[search,setSearch]=useState('');const[busy,setBusy]=useState('');const[msg,setMsg]=useState('');
  useEffect(()=>{Promise.all([dbLoadUsers(),dbLoadAdmins()]).then(([u,a])=>{setUsers(u);setAdmins(a);});},[]);
  const flash=m=>{setMsg(m);setTimeout(()=>setMsg(''),2500);};
  const toggleAdmin=async u=>{setBusy(u.username);const isAdm=admins.includes(u.username.toLowerCase());const next=isAdm?admins.filter(a=>a!==u.username.toLowerCase()):[...admins,u.username.toLowerCase()];setAdmins(next);await dbSetAdmins(next);flash(`${u.display_name||u.username} ${isAdm?'demoted to Student':'promoted to Admin'}.`);setBusy('');};
  const filtered=users.filter(u=>!search||u.username.toLowerCase().includes(search.toLowerCase()));
  return(
    <div>
      <div style={{background:'rgba(249,168,79,.06)',border:'1px solid rgba(249,168,79,.2)',borderRadius:10,padding:'12px 16px',marginBottom:18,display:'flex',gap:10}}>
        <span style={{fontSize:18}}>⚡</span>
        <div><div style={{color:'#f9a84f',fontSize:13,fontWeight:600,marginBottom:3}}>Superuser Exclusive</div><div style={{color:'var(--muted)',fontSize:12}}>Only you can promote or demote admins.</div></div>
      </div>
      {msg&&<div className="slide-down" style={{background:'rgba(127,218,150,.08)',border:'1px solid rgba(127,218,150,.3)',borderRadius:8,padding:'9px 14px',color:'#7fda96',fontSize:12.5,marginBottom:14}}>{msg}</div>}
      <SearchBar value={search} onChange={setSearch} placeholder="Search users…"/>
      <div style={{display:'flex',flexDirection:'column',gap:10,marginTop:12}}>
        {filtered.map((u,i)=>{const isAdm=admins.includes(u.username.toLowerCase());return(
          <div key={i} style={{background:'var(--surface)',border:`1px solid ${isAdm?'rgba(218,127,240,.2)':'var(--border)'}`,borderRadius:10,padding:'13px 17px',display:'flex',alignItems:'center',gap:13,flexWrap:'wrap'}}>
            <Avatar name={u.display_name||u.username}/>
            <div style={{flex:1,minWidth:140}}><div style={{fontSize:14,color:'var(--text)',fontWeight:500}}>{u.display_name||u.username}</div><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginTop:2}}>@{u.username} · Yr {u.year}</div></div>
            <RoleBadge role={isAdm?ROLE.ADMIN:ROLE.USER} accountType={u.account_type}/>
            <button onClick={()=>toggleAdmin(u)} disabled={busy===u.username} style={{background:isAdm?'rgba(240,80,80,.1)':'rgba(218,127,240,.1)',border:`1px solid ${isAdm?'rgba(240,80,80,.3)':'rgba(218,127,240,.3)'}`,borderRadius:7,color:isAdm?'#f05050':'#da7ff0',cursor:'pointer',padding:'6px 14px',fontSize:11,fontFamily:"'IBM Plex Mono',monospace",fontWeight:600}}>
              {busy===u.username?'…':isAdm?'Demote':'→ Make Admin'}
            </button>
          </div>
        );})}
        {filtered.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:30,border:'1px dashed var(--border)',borderRadius:10}}>No users found.</div>}
      </div>
    </div>
  );
}

/* ═══════════════ SETTINGS TAB (superuser only) ═══════════════ */

export function SettingsTab({onReload}){
  const[depts,setDepts]=useState([]);const[types,setTypes]=useState([]);
  const[deptForm,setDeptForm]=useState({name:'',short_code:'',color:'#4f9cf9'});
  const[typeForm,setTypeForm]=useState({label:'',short_code:'',role_key:'user',color:'#4f9cf9',description:''});
  const[msg,setMsg]=useState('');const[section,setSection]=useState('depts');
  const flash=m=>{setMsg(m);setTimeout(()=>setMsg(''),3000);};

  const loadAll=async()=>{
    const[{data:d},{data:t}]=await Promise.all([
      supabase.from('departments').select('*').order('name'),
      supabase.from('user_types').select('*').order('created_at')
    ]);
    setDepts(d||[]);setTypes(t||[]);
  };
  useEffect(()=>{loadAll();},[]);

  const addDept=async()=>{
    if(!deptForm.name.trim()||!deptForm.short_code.trim())return;
    const id=`dept-${Date.now()}`;
    await dbAddDepartment({id,name:deptForm.name,short_code:deptForm.short_code,color:deptForm.color,created_at:new Date().toISOString()});
    setDeptForm({name:'',short_code:'',color:'#4f9cf9'});
    await loadAll();await loadDepartments();onReload?.();
    flash(`✓ Department "${deptForm.name}" added.`);
  };
  const delDept=async(id,name)=>{
    const ok=await(window.shConfirm?.({title:`Remove "${name}"?`,message:"This won't delete courses already assigned to this department.",danger:true,confirmLabel:'Remove'})??Promise.resolve(true));
    if(!ok)return;
    await dbDeleteDepartment(id);await loadAll();await loadDepartments();onReload?.();
    flash(`Department removed.`);
  };

  const addType=async()=>{
    if(!typeForm.label.trim()||!typeForm.short_code.trim())return;
    const id=`ut-${Date.now()}`;
    await dbAddUserType({id,label:typeForm.label,short_code:typeForm.short_code,role_key:typeForm.role_key,color:typeForm.color,description:typeForm.description,created_at:new Date().toISOString()});
    setTypeForm({label:'',short_code:'',role_key:'user',color:'#4f9cf9',description:''});
    await loadAll();await loadUserTypes();
    flash(`✓ User type "${typeForm.label}" added.`);
  };
  const delType=async(id,label)=>{
    const ok=await(window.shConfirm?.({title:`Remove user type "${label}"?`,message:'Users with this type will keep their current access level.',danger:true,confirmLabel:'Remove'})??Promise.resolve(true));
    if(!ok)return;
    await dbDeleteUserType(id);await loadAll();await loadUserTypes();
    flash(`User type removed.`);
  };

  const PRESET_COLORS=['#4f9cf9','#7fda96','#f9a84f','#da7ff0','#f05050','#a8f94f','#4ff9e4','#f94fcc','#ff9f43','#54a0ff'];

  return(
    <div className="fade-up">
      <div style={{background:'rgba(249,168,79,.06)',border:'1px solid rgba(249,168,79,.2)',borderRadius:10,padding:'11px 15px',marginBottom:20,display:'flex',gap:10,alignItems:'center'}}>
        <span style={{fontSize:18}}>⚙️</span>
        <div><div style={{color:'#f9a84f',fontSize:13,fontWeight:600,marginBottom:2}}>Platform Settings</div><div style={{color:'var(--muted)',fontSize:12}}>Add departments and user types. Changes take effect immediately across the site.</div></div>
      </div>
      {msg&&<div className="slide-down" style={{background:'rgba(127,218,150,.08)',border:'1px solid rgba(127,218,150,.3)',borderRadius:8,padding:'9px 14px',color:'#7fda96',fontSize:12,marginBottom:14}}>{msg}</div>}

      {/* Sub-tabs */}
      <div style={{display:'flex',gap:4,borderBottom:'1px solid var(--border)',marginBottom:20}}>
        {[{id:'depts',label:'🏫 Departments'},{id:'types',label:'👥 User Types'}].map(t=>(
          <button key={t.id} onClick={()=>setSection(t.id)} style={{background:'none',border:'none',borderBottom:section===t.id?'2px solid #f9a84f':'2px solid transparent',color:section===t.id?'#f9a84f':'var(--muted)',cursor:'pointer',padding:'8px 16px',fontSize:13,fontWeight:section===t.id?600:400}}>{t.label}</button>
        ))}
      </div>

      {/* DEPARTMENTS */}
      {section==='depts'&&(
        <div className="fade-in">
          {/* Add form */}
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'16px 18px',marginBottom:18}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--muted)',letterSpacing:2,marginBottom:12}}>ADD DEPARTMENT</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 120px',gap:10,marginBottom:10}}>
              <Field label="FULL NAME" value={deptForm.name} onChange={e=>setDeptForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Computer Engineering"/>
              <Field label="SHORT CODE" value={deptForm.short_code} onChange={e=>setDeptForm(f=>({...f,short_code:e.target.value}))} placeholder="e.g. CE"/>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>COLOUR</div>
              <div style={{display:'flex',gap:7,flexWrap:'wrap',alignItems:'center'}}>
                {PRESET_COLORS.map(c=>(
                  <button key={c} onClick={()=>setDeptForm(f=>({...f,color:c}))} style={{width:24,height:24,borderRadius:'50%',background:c,border:deptForm.color===c?'3px solid var(--text)':'2px solid transparent',cursor:'pointer',padding:0}}/>
                ))}
                <input type="color" value={deptForm.color} onChange={e=>setDeptForm(f=>({...f,color:e.target.value}))} style={{width:28,height:28,borderRadius:4,border:'1px solid var(--border)',cursor:'pointer',background:'none',padding:2}}/>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:deptForm.color}}>{deptForm.color}</span>
              </div>
            </div>
            <button onClick={addDept} disabled={!deptForm.name.trim()||!deptForm.short_code.trim()} style={{background:!deptForm.name.trim()?'var(--border)':'#4f9cf9',border:'none',borderRadius:7,color:!deptForm.name.trim()?'var(--muted)':'#000',cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:700}}>Add Department</button>
          </div>
          {/* List */}
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {depts.map(d=>(
              <div key={d.id} className="fade-in" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:9,padding:'12px 16px',display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:14,height:14,borderRadius:'50%',background:d.color,flexShrink:0,boxShadow:`0 0 6px ${d.color}80`}}/>
                <div style={{flex:1}}><div style={{fontSize:14,color:'var(--text)',fontWeight:500}}>{d.name}</div></div>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:`${d.color}18`,color:d.color,borderRadius:4,padding:'2px 8px'}}>{d.short_code}</span>
                <button onClick={()=>delDept(d.id,d.name)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:13}}>✕</button>
              </div>
            ))}
            {depts.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:20,border:'1px dashed var(--border)',borderRadius:8,fontSize:13}}>No departments yet.</div>}
          </div>
        </div>
      )}

      {/* USER TYPES */}
      {section==='types'&&(
        <div className="fade-in">
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'16px 18px',marginBottom:18}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--muted)',letterSpacing:2,marginBottom:12}}>ADD USER TYPE</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 130px',gap:10,marginBottom:10}}>
              <Field label="FULL LABEL" value={typeForm.label} onChange={e=>setTypeForm(f=>({...f,label:e.target.value}))} placeholder="e.g. Postgraduate Student"/>
              <Field label="SHORT CODE" value={typeForm.short_code} onChange={e=>setTypeForm(f=>({...f,short_code:e.target.value}))} placeholder="e.g. PG"/>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>ACCESS LEVEL</div>
              <div style={{display:'flex',gap:8}}>
                {[{k:'user',label:'🎓 Student-like (year-based)'},{k:'external',label:'🌐 External (all years)'}].map(o=>(
                  <button key={o.k} onClick={()=>setTypeForm(f=>({...f,role_key:o.k}))} style={{flex:1,padding:'8px 10px',borderRadius:7,border:`1px solid ${typeForm.role_key===o.k?'#f9a84f70':'var(--border)'}`,background:typeForm.role_key===o.k?'rgba(249,168,79,.08)':'var(--input-bg)',color:typeForm.role_key===o.k?'#f9a84f':'var(--muted)',cursor:'pointer',fontSize:12,fontWeight:typeForm.role_key===o.k?600:400}}>{o.label}</button>
                ))}
              </div>
            </div>
            <Field label="DESCRIPTION (optional)" value={typeForm.description} onChange={e=>setTypeForm(f=>({...f,description:e.target.value}))} placeholder="e.g. Alumni with read-only access"/>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>BADGE COLOUR</div>
              <div style={{display:'flex',gap:7,flexWrap:'wrap',alignItems:'center'}}>
                {PRESET_COLORS.map(c=>(
                  <button key={c} onClick={()=>setTypeForm(f=>({...f,color:c}))} style={{width:24,height:24,borderRadius:'50%',background:c,border:typeForm.color===c?'3px solid var(--text)':'2px solid transparent',cursor:'pointer',padding:0}}/>
                ))}
                <input type="color" value={typeForm.color} onChange={e=>setTypeForm(f=>({...f,color:e.target.value}))} style={{width:28,height:28,borderRadius:4,border:'1px solid var(--border)',cursor:'pointer',background:'none',padding:2}}/>
              </div>
            </div>
            <button onClick={addType} disabled={!typeForm.label.trim()||!typeForm.short_code.trim()} style={{background:!typeForm.label.trim()?'var(--border)':'#da7ff0',border:'none',borderRadius:7,color:!typeForm.label.trim()?'var(--muted)':'#000',cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:700}}>Add User Type</button>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {types.map(t=>(
              <div key={t.id} className="fade-in" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:9,padding:'12px 16px',display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:14,height:14,borderRadius:'50%',background:t.color,flexShrink:0,boxShadow:`0 0 6px ${t.color}80`}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,color:'var(--text)',fontWeight:500}}>{t.label}</div>
                  {t.description&&<div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{t.description}</div>}
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginTop:3}}>Access: {t.role_key}</div>
                </div>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:`${t.color}18`,color:t.color,borderRadius:4,padding:'2px 8px'}}>{t.short_code}</span>
                <button onClick={()=>delType(t.id,t.label)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:13}}>✕</button>
              </div>
            ))}
            {types.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:20,border:'1px dashed var(--border)',borderRadius:8,fontSize:13}}>No user types yet.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ USER ROW ═══════════════ */

export function UserRow({u,role,isAdm,isSU2,onRoleChange,onAdminToggle,onYearChange}){
  const[expanded,setExpanded]=useState(false);
  const[busy,setBusy]=useState('');
  const[localYear,setLocalYear]=useState(u.year||1);
  const[localAccountType,setLocalAccountType]=useState(u.account_type||'student');
  const accentColor=ROLE_COLOR[role]||ROLE_COLOR.user;

  const doRoleChange=async(accountType)=>{
    setBusy('role');
    await onRoleChange(accountType);
    setLocalAccountType(accountType);
    setBusy('');
  };
  const doAdminToggle=async()=>{
    setBusy('admin');
    await onAdminToggle();
    setBusy('');
  };
  const doYearChange=async(yr)=>{
    setLocalYear(yr);
    setBusy('year');
    await onYearChange(yr);
    setBusy('');
  };

  const isExternal=localAccountType==='external';

  return(
    <div style={{background:'var(--surface)',border:`1px solid ${expanded?accentColor+'40':'var(--border)'}`,borderRadius:10,overflow:'hidden',transition:'border-color .2s'}}>
      {/* Row summary */}
      <div style={{padding:'12px 16px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',cursor:isSU2?'pointer':'default'}} onClick={()=>isSU2&&setExpanded(e=>!e)}>
        <Avatar name={u.display_name||u.username}/>
        <div style={{flex:1,minWidth:130}}>
          <div style={{fontSize:14,color:'var(--text)',fontWeight:500}}>{u.display_name||u.username}</div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginTop:2}}>
            @{u.username} · {new Date(u.created_at).toLocaleDateString()}
          </div>
        </div>
        <RolePill role={isAdm?ROLE.ADMIN:isExternal?ROLE.EXTERNAL:ROLE.USER} accountType={localAccountType}/>
        {!isExternal&&localYear>0&&(
          <div style={{background:YEAR_BG[localYear]||'transparent',border:`1px solid ${YEAR_COLORS[localYear]||'var(--border)'}40`,borderRadius:5,padding:'3px 9px'}}>
            <Mono color={YEAR_COLORS[localYear]||'var(--muted)'} size={9}>Yr {localYear}</Mono>
          </div>
        )}
        {isAdm&&<Mono color="#da7ff0" size={9}>ADMIN</Mono>}
        {isSU2&&<span style={{color:'var(--muted)',fontSize:13,marginLeft:'auto'}}>{expanded?'▲':'▼'}</span>}
      </div>

      {/* Expanded editor — superuser only */}
      {isSU2&&expanded&&(
        <div className="fade-in" style={{borderTop:'1px solid var(--border)',padding:'14px 16px',background:'var(--card)',display:'flex',flexDirection:'column',gap:14}}>
          <Mono color="var(--muted)" size={9}>DIRECT CONTROLS — changes take effect immediately</Mono>

          {/* Account type */}
          <div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:7,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>ACCOUNT TYPE</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {USER_TYPES.map(ut=>{
                const active=(ut.roleKey==='external'&&isExternal)||(ut.roleKey!=='external'&&!isExternal);
                return(
                  <button key={ut.id} onClick={()=>doRoleChange(ut.roleKey==='external'?'external':'student')}
                    disabled={active||busy==='role'}
                    style={{padding:'7px 14px',borderRadius:8,cursor:active||busy==='role'?'default':'pointer',border:`1px solid ${active?ut.color+'70':'var(--border)'}`,background:active?`${ut.color}12`:'var(--input-bg)',color:active?ut.color:'var(--muted)',fontWeight:active?700:400,fontSize:12,display:'flex',alignItems:'center',gap:6,opacity:busy==='role'&&!active?.6:1}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,background:active?`${ut.color}20`:'var(--border)',color:active?ut.color:'var(--muted)',borderRadius:3,padding:'1px 5px'}}>{ut.shortCode}</span>
                    {ut.label}
                    {active&&<span style={{fontSize:10,color:ut.color}}>✓</span>}
                  </button>
                );
              })}
              {busy==='role'&&<Mono color="var(--muted)" size={9}>Updating…</Mono>}
            </div>
          </div>

          {/* Admin toggle */}
          <div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:7,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>ADMIN PRIVILEGES</div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <button onClick={doAdminToggle} disabled={busy==='admin'}
                style={{padding:'7px 16px',borderRadius:8,cursor:busy==='admin'?'default':'pointer',border:`1px solid ${isAdm?'rgba(240,80,80,.4)':'rgba(218,127,240,.4)'}`,background:isAdm?'rgba(240,80,80,.1)':'rgba(218,127,240,.1)',color:isAdm?'#f05050':'#da7ff0',fontWeight:600,fontSize:12}}>
                {busy==='admin'?'…':isAdm?'✕ Remove Admin':'🛡 Make Admin'}
              </button>
              <span style={{fontSize:11,color:'var(--muted)'}}>{isAdm?'Currently has admin access to the panel':'No admin privileges'}</span>
            </div>
          </div>

          {/* Year change — only for non-external */}
          {!isExternal&&(
            <div>
              <div style={{fontSize:11,color:'var(--muted)',marginBottom:7,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>YEAR LEVEL</div>
              <div style={{display:'flex',gap:7,alignItems:'center'}}>
                {YEARS.map(y=>(
                  <button key={y} onClick={()=>doYearChange(y)} disabled={busy==='year'}
                    style={{width:42,height:36,borderRadius:7,cursor:busy==='year'?'default':'pointer',border:`1px solid ${localYear===y?YEAR_COLORS[y]+'70':'var(--border)'}`,background:localYear===y?YEAR_BG[y]:'var(--input-bg)',color:localYear===y?YEAR_COLORS[y]:'var(--muted)',fontWeight:localYear===y?700:400,fontSize:13}}>
                    {y}
                  </button>
                ))}
                {busy==='year'&&<Mono color="var(--muted)" size={9}>Saving…</Mono>}
              </div>
            </div>
          )}

          {/* Status requests for this user */}
          <div style={{paddingTop:4,borderTop:'1px solid var(--border)'}}>
            <UserStatusHistory username={u.username}/>
          </div>
        </div>
      )}
    </div>
  );
}

/* Mini component: shows pending/recent status request for a specific user */

export function UserStatusHistory({username}){
  const[req,setReq]=useState(null);const[loaded,setLoaded]=useState(false);
  useEffect(()=>{
    dbGetPendingStatusRequest(username).then(r=>{setReq(r);setLoaded(true);});
  },[username]);
  if(!loaded)return null;
  if(!req)return<div style={{fontSize:11,color:'var(--muted)',fontFamily:"'IBM Plex Mono',monospace"}}>No pending status request</div>;
  return(
    <div style={{background:'rgba(168,249,79,.06)',border:'1px solid rgba(168,249,79,.2)',borderRadius:7,padding:'9px 13px',display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
      <span style={{fontSize:14}}>⏳</span>
      <div style={{flex:1}}>
        <div style={{fontSize:12,color:'#a8f94f',fontWeight:600}}>Pending status request</div>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',marginTop:2}}>{req.from_type} → {req.to_type} · {new Date(req.requested_at).toLocaleString()}</div>
        {req.reason&&<div style={{fontSize:11,color:'var(--muted)',marginTop:3,fontStyle:'italic'}}>"{req.reason}"</div>}
      </div>
    </div>
  );
}

/* ═══════════════ ADMIN PANEL ═══════════════ */

export function AdminPanel({user,courses,onClose,onCoursesChange}){
  const isSU2=user.role===ROLE.SUPERUSER;
  const[tab,setTab]=useState('courses');const[allUsers,setAllUsers]=useState([]);const[admins,setAdmins]=useState([]);const[filterY,setFilterY]=useState(0);const[filterSem,setFilterSem]=useState(0);const[filterDept,setFilterDept]=useState('all');const[showUpload,setShowUpload]=useState(false);const[search,setSearch]=useState('');const[pendingCount,setPendingCount]=useState(0);const[statusPendingCount,setStatusPendingCount]=useState(0);const[actionMsg,setActionMsg]=useState('');

  useEffect(()=>{
    Promise.all([dbLoadUsers(),dbLoadAdmins()]).then(([u,a])=>{setAllUsers(u);setAdmins(a);});
    if(isSU2)dbCountPending().then(setPendingCount);
    dbCountPendingStatusRequests().then(setStatusPendingCount);
  },[]);

  const flash=m=>{setActionMsg(m);setTimeout(()=>setActionMsg(''),3000);};

  // Admins submit for approval; superuser acts directly
  const doDelete=async id=>{
    // Use shConfirm if available, otherwise native confirm as reliable fallback
    let ok;
    if(typeof window.shConfirm==='function'){
      ok=await window.shConfirm({
        title:isSU2?'Delete course permanently?':'Submit deletion request?',
        message:isSU2?'This course and all its data will be permanently removed. This cannot be undone.':'Your deletion request will be sent to the superuser for approval.',
        danger:true,
        confirmLabel:isSU2?'Delete':'Submit Request'
      });
    } else {
      ok=window.confirm(isSU2?'Delete this course permanently?':'Submit deletion request for superuser approval?');
    }
    if(!ok)return;
    try{
      if(isSU2){
        await dbDeleteCourse(id);
        const idx=await dbLoadCourseIndex();
        onCoursesChange(idx);
        flash('✓ Course deleted.');
      } else {
        const c=courses.find(x=>x.id===id);
        await dbSubmitPending('delete_course',user.username,{id,chapterTitle:c?.chapterTitle,courseName:c?.courseName});
        flash('✓ Deletion request submitted — awaiting superuser approval.');
      }
    }catch(e){flash('Error: '+e.message);}
  };

  const pTabs=[
    {id:'courses',label:'Courses'},
    {id:'users',label:'Users'},
    {id:'analytics',label:'📊 Analytics'},
    {id:'status',label:'status',statusCount:statusPendingCount},
    ...(isSU2?[{id:'approvals',label:'approvals',pendingCount},{id:'admins',label:'⚡ Manage Admins'},{id:'settings',label:'⚙️ Settings'}]:[])
  ];

  const filtered=(filterY===0?courses:courses.filter(c=>c.year===filterY)).filter(c=>filterSem===0||c.semester===filterSem).filter(c=>filterDept==='all'||c.department===filterDept).filter(c=>!search||c.chapterTitle.toLowerCase().includes(search.toLowerCase())||c.courseName.toLowerCase().includes(search.toLowerCase()));

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.88)',backdropFilter:'blur(8px)',zIndex:2000,overflow:'auto'}}>
      <div className="admin-page" style={{maxWidth:900,margin:'0 auto',padding:'34px 20px 90px'}}>
        <div className="fade-up" style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:26,flexWrap:'wrap',gap:14}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
              <Logo onClick={onClose} size="sm"/>
              <div style={{width:1,height:20,background:'var(--border)'}}/>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <Mono color={isSU2?'#f9a84f':'#da7ff0'} size={9}>{isSU2?'SUPERUSER PANEL':'ADMIN PANEL'}</Mono>
                <RolePill role={user.role} accountType={user.accountType||user.account_type}/>
              </div>
            </div>
            <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:'var(--text)'}}>Manage StudyHub</h2>
            {!isSU2&&<p style={{fontSize:12,color:'var(--muted)',marginTop:5}}>Your course & resource actions require superuser approval before taking effect.</p>}
          </div>
          <button onClick={onClose} style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'9px 18px',fontSize:13}}>← Back</button>
        </div>

        {actionMsg&&<div className="slide-down" style={{background:'rgba(127,218,150,.08)',border:'1px solid rgba(127,218,150,.3)',borderRadius:8,padding:'10px 16px',color:'#7fda96',fontSize:13,marginBottom:18}}>{actionMsg}</div>}

        {/* Stats */}
        <div className="stagger-1" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:10,marginBottom:24}}>
          {[{label:'Total Courses',val:courses.length,color:'#4f9cf9'},{label:'Users',val:allUsers.length,color:'#7fda96'},{label:'Admins',val:admins.length,color:'#da7ff0'},...(isSU2&&pendingCount>0?[{label:'Pending Approval',val:pendingCount,color:'#f9a84f'}]:[]),...YEARS.map(y=>({label:`Year ${y}`,val:courses.filter(c=>c.year===y).length,color:YEAR_COLORS[y]}))].map((s,i)=>(
            <div key={i} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'14px 16px'}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:22,color:s.color,fontWeight:600}}>{s.val}</div>
              <div style={{fontSize:11,color:'var(--muted)',marginTop:3}}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{display:'flex',gap:4,borderBottom:'1px solid var(--border)',marginBottom:22,flexWrap:'wrap'}}>
          {pTabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{background:tab===t.id?'rgba(249,168,79,.06)':'none',border:'none',borderBottom:tab===t.id?'2px solid #f9a84f':'2px solid transparent',color:tab===t.id?'#f9a84f':'var(--muted)',cursor:'pointer',padding:'9px 16px',fontSize:13,fontWeight:tab===t.id?600:400,display:'flex',alignItems:'center',gap:6}}>
              {t.id==='approvals'?'⚡ Approvals':t.id==='status'?'🔄 Status Changes':t.label}
              {t.id==='approvals'&&t.pendingCount>0&&<span style={{background:'#f9a84f',color:'#000',borderRadius:10,padding:'1px 7px',fontSize:10,fontWeight:700}}>{t.pendingCount}</span>}
              {t.id==='status'&&t.statusCount>0&&<span style={{background:'#a8f94f',color:'#000',borderRadius:10,padding:'1px 7px',fontSize:10,fontWeight:700}}>{t.statusCount}</span>}
            </button>
          ))}
        </div>

        {tab==='courses'&&(
          <div className="fade-up">
            {!isSU2&&<div style={{background:'rgba(218,127,240,.06)',border:'1px solid rgba(218,127,240,.2)',borderRadius:8,padding:'9px 14px',fontSize:12,color:'#da7ff0',marginBottom:14}}>🛡 As Admin, your Add and Delete actions will be queued for superuser approval.</div>}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10,flexWrap:'wrap',gap:10}}>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                {[{label:'All',y:0},...YEARS.map(y=>({label:`Yr ${y}`,y}))].map(({label,y})=>(
                  <button key={y} onClick={()=>setFilterY(y)} style={{background:filterY===y?(y===0?'rgba(136,146,164,.1)':YEAR_BG[y]):'none',border:`1px solid ${filterY===y?(y===0?'#8892a4':YEAR_COLORS[y])+'60':'var(--border)'}`,borderRadius:20,color:filterY===y?(y===0?'#8892a4':YEAR_COLORS[y]):'var(--muted)',cursor:'pointer',padding:'5px 14px',fontSize:12,fontWeight:filterY===y?600:400}}>{label}</button>
                ))}
              </div>
              <button onClick={()=>setShowUpload(true)} style={{background:'#4f9cf9',border:'none',borderRadius:8,color:'#000',cursor:'pointer',padding:'9px 18px',fontSize:13,fontWeight:700}}>+ {isSU2?'Add Course':'Request Course'}</button>
            </div>
            <div style={{display:'flex',gap:8,marginBottom:14,alignItems:'center',flexWrap:'wrap'}}>
              {[{label:'All Semesters',s:0},...[1,2].map(s=>({label:`Semester ${s}`,s}))].map(({label,s})=>(
                <button key={s} onClick={()=>setFilterSem(s)} style={{background:filterSem===s?'rgba(79,156,249,.1)':'none',border:`1px solid ${filterSem===s?'rgba(79,156,249,.4)':'var(--border)'}`,borderRadius:20,color:filterSem===s?'#4f9cf9':'var(--muted)',cursor:'pointer',padding:'5px 14px',fontSize:12,fontWeight:filterSem===s?600:400}}>{label}</button>
              ))}
              <div style={{width:1,height:20,background:'var(--border)',margin:'0 4px'}}/>
              {[{label:'All Depts',d:'all',color:'#8892a4'},...DEPARTMENTS.map(d=>({label:DEPT_SHORT[d],d,color:DEPT_COLOR[d]}))].map(({label,d,color})=>(
                <button key={d} onClick={()=>setFilterDept(d)} style={{background:filterDept===d?`${color}15`:'none',border:`1px solid ${filterDept===d?color+'60':'var(--border)'}`,borderRadius:20,color:filterDept===d?color:'var(--muted)',cursor:'pointer',padding:'5px 14px',fontSize:12,fontWeight:filterDept===d?600:400}}>{label}</button>
              ))}
              <SearchBar value={search} onChange={setSearch} placeholder="Search courses…"/>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              {filtered.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:40,border:'1px dashed var(--border)',borderRadius:12}}>No courses here yet.</div>}
              {filtered.map(c=>(
                <div key={c.id} className="fade-in" style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'13px 17px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                  <div style={{display:'flex',flexDirection:'column',gap:4}}>
                    <div style={{background:YEAR_BG[c.year],border:`1px solid ${YEAR_COLORS[c.year]}40`,borderRadius:5,padding:'3px 9px'}}><Mono color={YEAR_COLORS[c.year]} size={9}>Yr {c.year}</Mono></div>
                    <div style={{background:'rgba(79,156,249,.1)',border:'1px solid rgba(79,156,249,.3)',borderRadius:5,padding:'3px 9px'}}><Mono color="#4f9cf9" size={9}>Sem {c.semester||1}</Mono></div>
                    <div style={{background:`${DEPT_COLOR[c.department]||'#4f9cf9'}12`,border:`1px solid ${DEPT_COLOR[c.department]||'#4f9cf9'}30`,borderRadius:5,padding:'3px 9px'}}><Mono color={DEPT_COLOR[c.department]||'#4f9cf9'} size={9}>{DEPT_SHORT[c.department]||'CS'}</Mono></div>
                  </div>
                  <div style={{flex:1,minWidth:160}}><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)'}}>{c.courseName}</div><div style={{fontSize:14,color:'var(--text)',marginTop:2}}>{c.chapterTitle}</div></div>
                  <div style={{display:'flex',gap:6}}><Tag color="#4f9cf9">{c.conceptCount} concepts</Tag><Tag color="#7fda96">{c.qCount} questions</Tag></div>
                  <button onClick={()=>doDelete(c.id)} title={isSU2?'Delete permanently':'Submit deletion request'} style={{background:'rgba(240,80,80,.1)',border:'1px solid rgba(240,80,80,.3)',borderRadius:6,color:'#f05050',cursor:'pointer',padding:'5px 12px',fontSize:11,flexShrink:0}}>{isSU2?'✕ Delete':'↑ Request Delete'}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='users'&&(
          <div className="fade-up">
            {isSU2&&<div style={{background:'rgba(249,168,79,.06)',border:'1px solid rgba(249,168,79,.2)',borderRadius:8,padding:'9px 14px',fontSize:12,color:'#f9a84f',marginBottom:14}}>⚡ Superuser: click a user row to expand and change their year or account type directly — no approval needed.</div>}
            <div style={{marginBottom:14,display:'flex',gap:10,alignItems:'center'}}><SearchBar value={search} onChange={setSearch} placeholder="Search users…"/><Mono color="var(--muted)" size={9}>{allUsers.filter(u=>!search||u.username.toLowerCase().includes(search.toLowerCase())).length} USERS</Mono></div>
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              {allUsers.filter(u=>!search||u.username.toLowerCase().includes(search.toLowerCase())).map((u,i)=>{
                const isAdm=admins.includes(u.username.toLowerCase());
                const role=isAdm?ROLE.ADMIN:u.account_type==='external'?ROLE.EXTERNAL:ROLE.USER;
                return(
                  <UserRow key={i} u={u} role={role} isAdm={isAdm} isSU2={isSU2}
                    onRoleChange={async(newAccountType)=>{
                      await dbApplyStatusChange(u.username,newAccountType);
                      const[users,adms]=await Promise.all([dbLoadUsers(),dbLoadAdmins()]);
                      setAllUsers(users);setAdmins(adms);
                    }}
                    onAdminToggle={async()=>{
                      const next=isAdm?admins.filter(a=>a!==u.username.toLowerCase()):[...admins,u.username.toLowerCase()];
                      setAdmins(next);await dbSetAdmins(next);
                    }}
                    onYearChange={async(yr)=>{
                      await supabase.from('users').update({year:yr}).eq('username',u.username);
                      setAllUsers(prev=>prev.map(x=>x.username===u.username?{...x,year:yr}:x));
                    }}
                  />
                );
              })}
              {allUsers.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:40,border:'1px dashed var(--border)',borderRadius:12}}>No users yet.</div>}
            </div>
          </div>
        )}

        {tab==='analytics'&&<AnalyticsTab courses={courses}/>}
        {tab==='status'&&<StatusChangesTab reviewerUsername={user.username}/>}
        {tab==='approvals'&&isSU2&&<ApprovalsTab onCourseChange={onCoursesChange} courses={courses} reviewerUsername={user.username}/>}
        {tab==='admins'&&isSU2&&<ManageAdminsTab/>}
        {tab==='settings'&&isSU2&&<SettingsTab onReload={()=>onCoursesChange([...courses])}/>}
      </div>
      {showUpload&&(
        isSU2
          ? <UploadModal courses={courses} onClose={()=>setShowUpload(false)} onDone={idx=>{onCoursesChange(idx);setShowUpload(false);}}/>
          : <UploadModal courses={courses} onClose={()=>setShowUpload(false)} onDone={async(idx,entry,courseData)=>{
              await dbSubmitPending('add_course',user.username,{entry,courseData});
              setShowUpload(false);flash('✓ Course submitted for superuser approval.');
            }} adminMode={true} requestedBy={user.username}/>
      )}
    </div>
  );
}

/* ═══════════════ STATUS CHANGE MODAL ═══════════════ */

export function StatusChangeModal({user,onClose,onSubmitted}){
  const[reason,setReason]=useState('');
  const[targetType,setTargetType]=useState('');
  const[loading,setLoading]=useState(false);
  const[pending,setPending]=useState(null);
  const[checking,setChecking]=useState(true);

  // Map account_type to role key for display
  const currentType=user.accountType||user.account_type||'student';
  const currentLabel=USER_TYPES.find(u=>u.roleKey===(user.role===ROLE.EXTERNAL?'external':'user'))?.shortCode||
    (user.role===ROLE.EXTERNAL?'External':'Student');

  // Available types to switch to (exclude current)
  const options=USER_TYPES.filter(t=>
    t.roleKey!==(user.role===ROLE.EXTERNAL?'external':'user')
  );

  useEffect(()=>{
    if(options.length>0)setTargetType(options[0].id);
    dbGetPendingStatusRequest(user.username).then(p=>{setPending(p);setChecking(false);});
  },[]);

  const submit=async()=>{
    if(!targetType)return;
    setLoading(true);
    const target=USER_TYPES.find(t=>t.id===targetType);
    await dbSubmitStatusRequest({
      id:`sr-${Date.now()}`,
      username:user.username,
      from_type:currentType,
      to_type:target?.id||targetType,
      reason:reason.trim()||null,
      status:'pending',
      requested_at:new Date().toISOString()
    });
    setLoading(false);
    onSubmitted?.();
    onClose();
  };

  if(checking) return null;

  const target=USER_TYPES.find(t=>t.id===targetType);

  return(
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="scale-in modal-inner" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:'28px 30px',maxWidth:440,width:'100%',margin:'auto',boxShadow:'var(--shadow)'}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:'var(--text)',marginBottom:6}}>Change Account Status</div>
        <p style={{color:'var(--muted)',fontSize:13,marginBottom:20}}>Request a status change. An admin or superuser will review and approve or reject it.</p>

        {pending?(
          <div style={{background:'rgba(249,168,79,.07)',border:'1px solid rgba(249,168,79,.25)',borderRadius:10,padding:'16px 18px',textAlign:'center'}}>
            <div style={{fontSize:24,marginBottom:8}}>⏳</div>
            <div style={{fontSize:14,fontWeight:600,color:'#f9a84f',marginBottom:4}}>Request Pending</div>
            <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.6}}>
              You already have a pending request to change your status.<br/>
              Submitted {new Date(pending.requested_at).toLocaleString()}
            </div>
            {pending.reason&&<div style={{fontSize:12,color:'var(--text)',marginTop:8,fontStyle:'italic'}}>"{pending.reason}"</div>}
            <button onClick={onClose} style={{marginTop:16,background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'8px 20px',fontSize:13}}>Close</button>
          </div>
        ):(
          <>
            {/* Current → Target */}
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20,background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'14px 16px'}}>
              <div style={{flex:1,textAlign:'center'}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',letterSpacing:1,marginBottom:4}}>CURRENT</div>
                <div style={{background:ROLE_BG[user.role]||ROLE_BG.user,color:ROLE_COLOR[user.role]||ROLE_COLOR.user,borderRadius:8,padding:'6px 14px',fontSize:13,fontWeight:600,display:'inline-block'}}>{currentLabel}</div>
              </div>
              <div style={{fontSize:22,color:'var(--muted)',flexShrink:0}}>→</div>
              <div style={{flex:1,textAlign:'center'}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',letterSpacing:1,marginBottom:4}}>REQUESTING</div>
                {target&&<div style={{background:`${target.color}15`,color:target.color,border:`1px solid ${target.color}40`,borderRadius:8,padding:'6px 14px',fontSize:13,fontWeight:600,display:'inline-block'}}>{target.shortCode}</div>}
              </div>
            </div>

            {/* Pick target type if more than one option */}
            {options.length>1&&(
              <div style={{marginBottom:16}}>
                <div style={{fontSize:11,color:'var(--muted)',marginBottom:8,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>SWITCH TO</div>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {options.map(o=>(
                    <button key={o.id} onClick={()=>setTargetType(o.id)} style={{padding:'10px 14px',borderRadius:8,cursor:'pointer',border:`1px solid ${targetType===o.id?o.color+'70':'var(--border)'}`,background:targetType===o.id?`${o.color}10`:'var(--input-bg)',color:targetType===o.id?o.color:'var(--muted)',fontWeight:targetType===o.id?600:400,fontSize:13,textAlign:'left',display:'flex',alignItems:'center',gap:10}}>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:targetType===o.id?`${o.color}20`:'var(--border)',color:targetType===o.id?o.color:'var(--muted)',borderRadius:4,padding:'2px 7px'}}>{o.shortCode}</span>
                      <div>
                        <div>{o.label}</div>
                        {o.description&&<div style={{fontSize:11,color:'var(--muted)',marginTop:1}}>{o.description}</div>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reason */}
            <div style={{marginBottom:18}}>
              <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1}}>REASON (optional)</div>
              <textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="Tell the admin why you want to change your account type…" rows={3} style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 13px',color:'var(--text)',fontSize:13,fontFamily:"'DM Sans',sans-serif",resize:'none'}}/>
            </div>

            <div style={{background:'rgba(79,156,249,.05)',border:'1px solid rgba(79,156,249,.15)',borderRadius:8,padding:'9px 13px',fontSize:11,color:'var(--muted)',marginBottom:18,lineHeight:1.6}}>
              ℹ️ Your request will be reviewed by an admin. You'll keep your current access until it's approved. You cannot submit another request while one is pending.
            </div>

            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button onClick={onClose} style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'9px 18px',fontSize:13}}>Cancel</button>
              <button onClick={submit} disabled={loading||!targetType} style={{background:loading||!targetType?'var(--border)':'#4f9cf9',border:'none',borderRadius:8,color:loading||!targetType?'var(--muted)':'#000',cursor:'pointer',padding:'9px 22px',fontSize:13,fontWeight:700}}>
                {loading?'Submitting…':'Submit Request'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════ STATUS CHANGES TAB (admin/superuser) ═══════════════ */

export function StatusChangesTab({reviewerUsername}){
  const[pending,setPending]=useState([]);const[history,setHistory]=useState([]);
  const[tab,setTab]=useState('pending');const[loading,setLoading]=useState(true);
  const[busy,setBusy]=useState('');const[rejectModal,setRejectModal]=useState(null);
  const[rejectNote,setRejectNote]=useState('');

  const load=async()=>{
    setLoading(true);
    const[p,all]=await Promise.all([dbLoadStatusRequests('pending'),dbLoadAllStatusRequests()]);
    setPending(p);setHistory(all.filter(r=>r.status!=='pending'));setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const approve=async req=>{
    setBusy(req.id);
    const target=USER_TYPES.find(t=>t.id===req.to_type);
    const newAccountType=target?.roleKey==='external'?'external':'student';
    await dbApplyStatusChange(req.username,newAccountType);
    await dbReviewStatusRequest(req.id,'approved',reviewerUsername);
    setBusy('');await load();
  };

  const reject=async()=>{
    if(!rejectModal)return;setBusy(rejectModal.id);
    await dbReviewStatusRequest(rejectModal.id,'rejected',reviewerUsername,rejectNote);
    setRejectModal(null);setRejectNote('');setBusy('');await load();
  };

  const list=tab==='pending'?pending:history;

  if(loading)return<div style={{color:'var(--muted)',textAlign:'center',padding:40}}>Loading…</div>;

  return(
    <div className="fade-up">
      {/* Reject modal */}
      {rejectModal&&(
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setRejectModal(null)}>
          <div className="scale-in" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,padding:'24px 26px',maxWidth:400,width:'100%',boxShadow:'var(--shadow)'}}>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'var(--text)',marginBottom:12}}>Reject Request</div>
            <textarea value={rejectNote} onChange={e=>setRejectNote(e.target.value)} placeholder="Reason for rejection (optional)…" rows={3} style={{width:'100%',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 12px',color:'var(--text)',fontSize:13,resize:'none',marginBottom:14}}/>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button onClick={()=>setRejectModal(null)} style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',padding:'8px 16px',fontSize:13}}>Cancel</button>
              <button onClick={reject} style={{background:'rgba(240,80,80,.15)',border:'1px solid rgba(240,80,80,.4)',borderRadius:8,color:'#f05050',cursor:'pointer',padding:'8px 18px',fontSize:13,fontWeight:700}}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}

      <div style={{background:'rgba(168,249,79,.06)',border:'1px solid rgba(168,249,79,.2)',borderRadius:10,padding:'11px 15px',marginBottom:18,display:'flex',gap:10}}>
        <span style={{fontSize:18}}>🔄</span>
        <div><div style={{color:'#a8f94f',fontSize:13,fontWeight:600,marginBottom:2}}>Status Change Requests</div><div style={{color:'var(--muted)',fontSize:12}}>Review user requests to change their account type. Approving immediately updates their access.</div></div>
      </div>

      {/* Sub-tabs */}
      <div style={{display:'flex',gap:4,borderBottom:'1px solid var(--border)',marginBottom:18}}>
        {[{id:'pending',label:`Pending${pending.length>0?` (${pending.length})`:''}`,color:pending.length>0?'#a8f94f':undefined},{id:'history',label:'History'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{background:'none',border:'none',borderBottom:tab===t.id?`2px solid ${t.color||'#a8f94f'}`:'2px solid transparent',color:tab===t.id?(t.color||'#a8f94f'):'var(--muted)',cursor:'pointer',padding:'7px 16px',fontSize:13,fontWeight:tab===t.id?600:400}}>{t.label}</button>
        ))}
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:11}}>
        {list.length===0&&<div style={{color:'var(--muted)',textAlign:'center',padding:40,border:'1px dashed var(--border)',borderRadius:12,fontSize:13}}>{tab==='pending'?'✅ No pending requests.':'No history yet.'}</div>}
        {list.map((r,i)=>{
          const fromUT=USER_TYPES.find(t=>t.id===r.from_type||t.roleKey===r.from_type);
          const toUT=USER_TYPES.find(t=>t.id===r.to_type||t.roleKey===r.to_type);
          const isPending=r.status==='pending';
          const isApproved=r.status==='approved';
          return(
            <div key={r.id} className={`stagger-${Math.min(i%4+1,4)}`} style={{background:'var(--card)',border:`1px solid ${isPending?'rgba(168,249,79,.2)':isApproved?'rgba(127,218,150,.2)':'rgba(240,80,80,.2)'}`,borderRadius:11,padding:'15px 18px'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
                <div style={{flex:1,minWidth:180}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6,flexWrap:'wrap'}}>
                    <Avatar name={r.username} size={28}/>
                    <span style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>@{r.username}</span>
                    {/* From → To */}
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:ROLE_BG.user,color:ROLE_COLOR.user,borderRadius:4,padding:'2px 7px'}}>{fromUT?.shortCode||r.from_type}</span>
                      <span style={{color:'var(--muted)',fontSize:12}}>→</span>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:`${(toUT?.color||'#a8f94f')}15`,color:toUT?.color||'#a8f94f',borderRadius:4,padding:'2px 7px'}}>{toUT?.shortCode||r.to_type}</span>
                    </div>
                    {!isPending&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,background:isApproved?'rgba(127,218,150,.15)':'rgba(240,80,80,.15)',color:isApproved?'#7fda96':'#f05050',borderRadius:4,padding:'2px 7px'}}>{r.status.toUpperCase()}</span>}
                  </div>
                  {r.reason&&<p style={{fontSize:12,color:'var(--muted)',margin:'0 0 4px',fontStyle:'italic'}}>"{r.reason}"</p>}
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--muted)',display:'flex',gap:12,flexWrap:'wrap'}}>
                    <span>Requested {new Date(r.requested_at).toLocaleString()}</span>
                    {!isPending&&r.reviewed_by&&<span>Reviewed by @{r.reviewed_by}</span>}
                    {!isPending&&r.note&&<span>Note: {r.note}</span>}
                  </div>
                </div>
                {isPending&&(
                  <div style={{display:'flex',gap:8,flexShrink:0}}>
                    <button onClick={()=>approve(r)} disabled={busy===r.id} style={{background:'rgba(127,218,150,.12)',border:'1px solid rgba(127,218,150,.35)',borderRadius:8,color:'#7fda96',cursor:'pointer',padding:'7px 14px',fontSize:12,fontWeight:700}}>
                      {busy===r.id?'…':'✓ Approve'}
                    </button>
                    <button onClick={()=>setRejectModal(r)} disabled={busy===r.id} style={{background:'rgba(240,80,80,.1)',border:'1px solid rgba(240,80,80,.3)',borderRadius:8,color:'#f05050',cursor:'pointer',padding:'7px 12px',fontSize:12,fontWeight:700}}>✕ Reject</button>
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

/* ═══════════════ COURSE CARD (memoised) ═══════════════ */
