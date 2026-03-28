import { supabase, _subConfig, setSubConfig } from './constants.js';

// Re-export for convenience
export { supabase };

/* ═══════════════ DATABASE ═══════════════ */
async function dbLoadUsers(){const{data}=await supabase.from('users').select('*');return data||[];}
async function dbSaveUser(u){await supabase.from('users').upsert(u,{onConflict:'username'});}
async function dbLoadAdmins(){const{data}=await supabase.from('admins').select('username');return(data||[]).map(r=>r.username.toLowerCase());}
async function dbSetAdmins(list){await supabase.from('admins').delete().neq('username','__none__');if(list.length>0)await supabase.from('admins').insert(list.map(u=>({username:u.toLowerCase()})));}
async function dbLoadCourseIndex(){
  const{data}=await supabase.from('courses').select('id,year,semester,department,course_name,chapter_title,concept_count,term_count,q_count,added_at').order('added_at',{ascending:false});
  return(data||[]).map(r=>({id:r.id,year:r.year,semester:r.semester||1,department:r.department||'Computer Science',courseName:r.course_name,chapterTitle:r.chapter_title,conceptCount:r.concept_count,termCount:r.term_count,qCount:r.q_count,addedAt:r.added_at}));
}
async function dbLoadCourseData(id){
  const{data}=await supabase.from('courses').select('data').eq('id',id).single();
  return data?.data||null;
}
async function dbSaveCourse(entry,courseData){
  await supabase.from('courses').upsert({id:entry.id,year:entry.year,semester:entry.semester||1,department:entry.department||'Computer Science',course_name:entry.courseName,chapter_title:entry.chapterTitle,concept_count:entry.conceptCount,term_count:entry.termCount,q_count:entry.qCount,added_at:entry.addedAt,data:courseData},{onConflict:'id'});
}
async function dbDeleteCourse(id){await supabase.from('courses').delete().eq('id',id);}
async function dbLoadProgress(username){const{data}=await supabase.from('progress').select('*').eq('username',username);const out={};(data||[]).forEach(r=>{out[r.course_id]={viewed:r.viewed,openedQs:r.opened_qs||[]};});return out;}
async function dbSaveProgress(username,progress){const rows=Object.entries(progress).map(([cid,p])=>({username,course_id:cid,viewed:p.viewed,opened_qs:p.openedQs}));if(rows.length>0)await supabase.from('progress').upsert(rows,{onConflict:'username,course_id'});}
async function resolveRole(username){
  const admins=await dbLoadAdmins();
  if(admins.includes(username.toLowerCase())) return ROLE.ADMIN;
  try{
    const{data}=await supabase.from('users').select('account_type').eq('username',username).single();
    if(data?.account_type==='external') return ROLE.EXTERNAL;
  }catch{}
  return ROLE.USER;
}

// Resources
async function dbLoadResources(courseId){try{const{data}=await supabase.from('resources').select('*').eq('course_id',courseId).order('added_at',{ascending:false});return data||[];}catch{return[];}}
async function dbAddResource(r){try{await supabase.from('resources').insert(r);}catch(e){console.error(e);}}
async function dbDeleteResource(id){try{await supabase.from('resources').delete().eq('id',id);}catch{}}

// Announcements
async function dbLoadAnnouncements(courseId){
  try{
    let q=supabase.from('announcements').select('*').order('pinned',{ascending:false}).order('posted_at',{ascending:false});
    if(courseId) q=q.or(`course_id.eq.${courseId},course_id.is.null`);
    else q=q.is('course_id',null);
    const{data}=await q;return data||[];
  }catch{return[];}
}
async function dbLoadAllAnnouncements(){
  try{const{data}=await supabase.from('announcements').select('*').order('posted_at',{ascending:false});return data||[];}catch{return[];}
}
async function dbSaveAnnouncement(a){try{await supabase.from('announcements').insert(a);}catch(e){console.error(e);}}
async function dbDeleteAnnouncement(id){try{await supabase.from('announcements').delete().eq('id',id);}catch{}}
async function dbPinAnnouncement(id,pinned){try{await supabase.from('announcements').update({pinned}).eq('id',id);}catch{}}

// Notification log
async function dbMarkSeen(username,itemId,itemType){
  try{await supabase.from('notification_log').upsert({username,item_id:itemId,item_type:itemType,seen_at:new Date().toISOString()},{onConflict:'username,item_id'});}catch{}
}
async function dbLoadSeen(username){
  try{const{data}=await supabase.from('notification_log').select('item_id').eq('username',username);return new Set((data||[]).map(r=>r.item_id));}catch{return new Set();}
}

// Fetch all recent notifiable items for a user
async function dbLoadNotifications(username){
  try{
    const[assignments,cas,announcements]=await Promise.all([
      supabase.from('assignments').select('id,title,course_id,added_at,due_date').order('added_at',{ascending:false}).limit(30),
      supabase.from('course_cas').select('id,title,course_id,type,added_at,date').order('added_at',{ascending:false}).limit(30),
      supabase.from('announcements').select('*').order('posted_at',{ascending:false}).limit(30),
    ]);
    const seen=await dbLoadSeen(username);
    const items=[
      ...(announcements.data||[]).map(a=>({id:a.id,type:'announcement',title:a.title,body:a.body,priority:a.priority,time:a.posted_at,courseId:a.course_id,pinned:a.pinned})),
      ...(assignments.data||[]).map(a=>({id:a.id,type:'assignment',title:`Assignment: ${a.title}`,body:a.due_date?`Due ${new Date(a.due_date).toLocaleDateString()}`:'',priority:'info',time:a.added_at,courseId:a.course_id})),
      ...(cas.data||[]).map(a=>({id:a.id,type:'ca',title:`${a.type}: ${a.title}`,body:a.date?`On ${new Date(a.date).toLocaleDateString()}`:'',priority:'info',time:a.added_at,courseId:a.course_id})),
    ].sort((a,b)=>new Date(b.time)-new Date(a.time));
    return{items,unseenCount:items.filter(i=>!seen.has(i.id)&&(i.pinned||true)).length,seen};
  }catch{return{items:[],unseenCount:0,seen:new Set()};}
}
async function dbLoadAssignments(courseId){try{const{data}=await supabase.from('assignments').select('*').eq('course_id',courseId).order('added_at',{ascending:false});return data||[];}catch{return[];}}
async function dbSaveAssignment(a){try{await supabase.from('assignments').insert(a);}catch(e){console.error(e);}}
async function dbDeleteAssignment(id){try{await supabase.from('assignments').delete().eq('id',id);}catch{}}

// CAs / Tests
async function dbLoadCAs(courseId){try{const{data}=await supabase.from('course_cas').select('*').eq('course_id',courseId).order('added_at',{ascending:false});return data||[];}catch{return[];}}
async function dbSaveCA(a){try{await supabase.from('course_cas').insert(a);}catch(e){console.error(e);}}
async function dbDeleteCA(id){try{await supabase.from('course_cas').delete().eq('id',id);}catch{}}

// Status change requests
async function dbSubmitStatusRequest(r){
  try{await supabase.from('status_change_requests').insert(r);}catch(e){console.error(e);}
}
async function dbLoadStatusRequests(status='pending'){
  try{const{data}=await supabase.from('status_change_requests').select('*').eq('status',status).order('requested_at',{ascending:false});return data||[];}catch{return[];}
}
async function dbLoadAllStatusRequests(){
  try{const{data}=await supabase.from('status_change_requests').select('*').order('requested_at',{ascending:false});return data||[];}catch{return[];}
}
async function dbReviewStatusRequest(id,status,reviewedBy,note=''){
  try{await supabase.from('status_change_requests').update({status,reviewed_by:reviewedBy,reviewed_at:new Date().toISOString(),note}).eq('id',id);}catch(e){console.error(e);}
}
async function dbGetPendingStatusRequest(username){
  try{const{data}=await supabase.from('status_change_requests').select('*').eq('username',username).eq('status','pending').single();return data||null;}catch{return null;}
}
async function dbApplyStatusChange(username,newType){
  try{await supabase.from('users').update({account_type:newType}).eq('username',username);}catch(e){console.error(e);}
}

/* ── Subscription config ── */
async function dbLoadSubConfig(){
  try{const{data}=await supabase.from('subscription_config').select('*');
    const map={};(data||[]).forEach(r=>{map[r.key]=r.value;});return map;}catch{return{};}
}
async function dbSaveSubConfig(key,value,updatedBy){
  try{await supabase.from('subscription_config').upsert({key,value,updated_by:updatedBy,updated_at:new Date().toISOString()},{onConflict:'key'});}catch(e){console.error(e);}
}
async function dbSetUserTier(username,tier,updatedBy){
  try{
    await supabase.from('users').update({subscription_tier:tier}).eq('username',username);
    await supabase.from('subscription_config').upsert({key:`user_tier_log_${username}`,value:tier,label:`Tier set by ${updatedBy}`,updated_by:updatedBy,updated_at:new Date().toISOString()},{onConflict:'key'});
  }catch(e){console.error(e);}
}
async function dbGetUserTier(username){
  try{const{data}=await supabase.from('users').select('subscription_tier').eq('username',username).single();return data?.subscription_tier||'free';}catch{return'free';}
}
async function dbCountPendingStatusRequests(){
  try{const{count}=await supabase.from('status_change_requests').select('*',{count:'exact',head:true}).eq('status','pending');return count||0;}catch{return 0;}
}

// Dynamic departments
async function loadDepartments(){
  try{
    const{data}=await supabase.from('departments').select('*').order('name');
    if(data?.length){
      DEPARTMENTS=data.map(d=>d.name);
      DEPT_SHORT=Object.fromEntries(data.map(d=>[d.name,d.short_code]));
      DEPT_COLOR=Object.fromEntries(data.map(d=>[d.name,d.color||'#4f9cf9']));
    }
  }catch{}
}
async function dbAddDepartment(dept){await supabase.from('departments').insert(dept);}
async function dbDeleteDepartment(id){await supabase.from('departments').delete().eq('id',id);}

// Dynamic user types
async function loadUserTypes(){
  try{
    const{data}=await supabase.from('user_types').select('*').order('created_at');
    if(data?.length) USER_TYPES=data.map(d=>({id:d.id,label:d.label,shortCode:d.short_code,roleKey:d.role_key,color:d.color||'#4f9cf9',description:d.description||''}));
  }catch{}
}
async function dbAddUserType(ut){await supabase.from('user_types').insert(ut);}
async function dbDeleteUserType(id){await supabase.from('user_types').delete().eq('id',id);}

// Helper — get display label for a user based on role + account_type
function getUserTypeLabel(role,accountType){
  if(role===ROLE.SUPERUSER) return '⚡ Superuser';
  if(role===ROLE.ADMIN)     return '🛡 Admin';
  if(role===ROLE.EXTERNAL||accountType==='external'){
    const ut=USER_TYPES.find(u=>u.roleKey==='external');
    return `🌐 ${ut?.shortCode||'External'}`;
  }
  const ut=USER_TYPES.find(u=>u.roleKey==='user');
  return `🎓 ${ut?.shortCode||'Student'}`;
}

// Community
async function dbLoadCommunity(courseId){try{const{data}=await supabase.from('community_posts').select('*').eq('course_id',courseId).order('upvote_count',{ascending:false});return data||[];}catch{return[];}}
async function dbSubmitPost(post){try{await supabase.from('community_posts').insert(post);}catch(e){console.error(e);}}
async function dbUpvote(username,postId){
  try{
    const{data:existing}=await supabase.from('community_votes').select('*').eq('username',username).eq('post_id',postId);
    if(existing?.length>0){
      await supabase.from('community_votes').delete().eq('username',username).eq('post_id',postId);
      await supabase.from('community_posts').update({upvote_count:supabase.rpc('decrement',{x:1})}).eq('id',postId);
      // simple approach: just reload
    } else {
      await supabase.from('community_votes').insert({username,post_id:postId});
      const{data:post}=await supabase.from('community_posts').select('upvote_count').eq('id',postId).single();
      await supabase.from('community_posts').update({upvote_count:(post?.upvote_count||0)+1}).eq('id',postId);
    }
  }catch(e){console.error(e);}
}
async function dbGetMyVotes(username){try{const{data}=await supabase.from('community_votes').select('post_id').eq('username',username);return(data||[]).map(r=>r.post_id);}catch{return[];}}
async function dbDeletePost(id){try{await supabase.from('community_posts').delete().eq('id',id);}catch{}}

/* ═══════════════ COURSE CODE HELPERS ═══════════════ */
function normalizeCourseCode(raw=''){
  const s=(raw||'').trim().toUpperCase().replace(/\s+/g,' ');
  if(/^[A-Z]{2,4}\s\d{3,4}/.test(s)) return s;
  const m=s.match(/^([A-Z]{2,4})(\d{3,4})/);
  if(m) return `${m[1]} ${m[2]}`;
  return s||'Other';
}
function uniqueCourseCodes(courses){
  const seen=new Set();const out=[];
  for(const c of courses){const code=normalizeCourseCode(c.courseName);if(code&&!seen.has(code)){seen.add(code);out.push(code);}}
  return out.sort();
}
async function dbLoadCourseTabData(courseIds){
  if(!courseIds.length) return{assignments:[],cas:[],resources:[],announcements:[]};
  try{
    const[a,ca,res,ann]=await Promise.all([
      supabase.from('assignments').select('*').in('course_id',courseIds).order('added_at',{ascending:false}),
      supabase.from('course_cas').select('*').in('course_id',courseIds).order('added_at',{ascending:false}),
      supabase.from('resources').select('*').in('course_id',courseIds).order('added_at',{ascending:false}),
      supabase.from('announcements').select('*').in('course_id',courseIds).order('posted_at',{ascending:false}),
    ]);
    return{assignments:a.data||[],cas:ca.data||[],resources:res.data||[],announcements:ann.data||[]};
  }catch{return{assignments:[],cas:[],resources:[],announcements:[]};}
}

/* ═══════════════ PENDING ACTIONS ═══════════════ */
async function dbSubmitPending(action_type,requested_by,payload,note=''){
  await supabase.from('pending_actions').insert({id:`pa-${Date.now()}`,action_type,requested_by,requested_at:new Date().toISOString(),status:'pending',payload,note});
}
async function dbLoadPending(status='pending'){
  const{data}=await supabase.from('pending_actions').select('*').eq('status',status).order('requested_at',{ascending:false});
  return data||[];
}
async function dbLoadAllPending(){
  const{data}=await supabase.from('pending_actions').select('*').order('requested_at',{ascending:false});
  return data||[];
}
async function dbReviewPending(id,status,reviewed_by,note=''){
  await supabase.from('pending_actions').update({status,reviewed_by,reviewed_at:new Date().toISOString(),note}).eq('id',id);
}
async function dbCountPending(){
  const{count}=await supabase.from('pending_actions').select('*',{count:'exact',head:true}).eq('status','pending');
  return count||0;
}

// Analytics helpers
async function dbLoadAllProgress(){try{const{data}=await supabase.from('progress').select('*');return data||[];}catch{return[];}}

/* ═══════════════ AI (chat via Groq) ═══════════════ */
async function sendChatMessage(messages,context){
  const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages,context})});
  if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e.error||`Error ${res.status}`);}
  return(await res.json()).reply;
}

