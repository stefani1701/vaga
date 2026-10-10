/* ==========================================================
   CLOUD SYNC — GitHub as the datastore.

   Why this and not a backend: VAGA is a static page, so there is
   no server to keep anything on. Browser storage alone is not
   durable — iOS evicts it, "clear browsing data" wipes it, and a
   new phone starts empty. A private GitHub repo gives durable,
   versioned, free storage that David already has an account for,
   and every write is a commit, so nothing is ever silently lost.

   State lives in vaga-data.json; photos as photos/<id>.jpg.
   The token is kept in its own localStorage key so it never ends
   up inside an exported backup file.
   ========================================================== */
const TOKEN_KEY='vaga-gh-token';
let syncTimer=null, syncBusy=false, lastPull=0;

const ghToken=()=>{try{return localStorage.getItem(TOKEN_KEY)||''}catch(e){return ''}};
const setGhToken=t=>{try{t?localStorage.setItem(TOKEN_KEY,t):localStorage.removeItem(TOKEN_KEY)}catch(e){}};
const syncReady=()=>!!(ghToken() && S.sync && S.sync.repo && /^[\w.-]+\/[\w.-]+$/.test(S.sync.repo));

function b64enc(str){
  const bytes=new TextEncoder().encode(str);
  let bin=''; bytes.forEach(b=>bin+=String.fromCharCode(b));
  return btoa(bin);
}
function b64dec(b64){
  const bin=atob(String(b64).replace(/\s/g,''));
  const bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function gh(path,opts){
  return fetch('https://api.github.com/repos/'+S.sync.repo+'/contents/'+path+(opts&&opts.ref?'?ref='+opts.ref:''),
    Object.assign({headers:{
      'Authorization':'Bearer '+ghToken(),
      'Accept':'application/vnd.github+json',
      'X-GitHub-Api-Version':'2022-11-28'
    }},opts&&opts.init||{}));
}
function ghGet(path){
  return gh(path).then(r=>{
    if(r.status===404)return null;   // may mean "no such file" OR "no access" — preflight() tells them apart
    if(!r.ok)throw new Error('GitHub '+r.status+(r.status===401?' — token rejected':r.status===403?' — no access to that repo, or rate limited':''));
    return r.json();
  });
}

/* GitHub answers 404 rather than 403 for a repo a token cannot see, so a bare
   404 is ambiguous. Ask about the repo itself once per repo and say which it is. */
async function preflight(){
  if(S.sync.verified===S.sync.repo)return;
  const r=await fetch('https://api.github.com/repos/'+S.sync.repo,{headers:{
    'Authorization':'Bearer '+ghToken(),'Accept':'application/vnd.github+json',
    'X-GitHub-Api-Version':'2022-11-28'}});
  if(r.status===401)throw new Error('Token rejected (401). It is mistyped, expired, or has been revoked.');
  if(r.status===404)throw new Error('This token cannot see '+S.sync.repo+' (404). Either the repo name is wrong, or the token was not granted access to it — a fine-grained token only covers the repos picked when it was created, and a classic token needs the full "repo" scope for a private repo.');
  if(r.status===403)throw new Error('Forbidden (403). Rate limited, or the token is blocked for this repo.');
  if(!r.ok)throw new Error('GitHub '+r.status+' asking about '+S.sync.repo);
  /* Deliberately not trusting info.permissions here: for a fine-grained token
     that field reports the *account's* access to the repo, not what the token
     is scoped to do, so a read-only token still shows push:true. Only the write
     itself can answer that, and ghPut explains a 403 properly. */
  const info=await r.json();
  S.sync.verified=S.sync.repo; S.sync.branch=info.default_branch||S.sync.branch||'main';
  Store.set('vaga',S);
}
function ghPut(path,contentB64,sha,msg){
  return gh(path,{init:{
    method:'PUT',
    headers:{'Authorization':'Bearer '+ghToken(),'Accept':'application/vnd.github+json',
             'X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},
    body:JSON.stringify(Object.assign({message:msg,content:contentB64},sha?{sha}:{}))
  }}).then(r=>{
    if(!r.ok)return r.json().catch(()=>({})).then(j=>{
      if(r.status===403&&/rate limit|abuse|secondary/i.test(j.message||''))
        throw new Error('GitHub is rate limiting this token (403: '+j.message+'). Nothing is wrong with your setup — wait a few minutes and it will sync on its own.');
      if(r.status===403)throw new Error('GitHub refused the write (403'+(j.message?': '+j.message:'')+
        '). The token can read '+S.sync.repo+' but not write to it. On a fine-grained token this is the '+
        'Contents permission: open the token on GitHub, Repository permissions → Contents → "Read and write", '+
        'then Save. On a classic token it needs the whole "repo" scope.');
      if(r.status===409)throw new Error('Write conflict (409) — something else changed the file. It will retry on the next sync.');
      if(r.status===422)throw new Error('GitHub rejected the file (422'+(j.message?': '+j.message:'')+').');
      throw new Error('GitHub '+r.status+(j.message?' — '+j.message:''));
    });
    return r.json();
  });
}

/* what actually gets stored in the cloud — never the token */
function syncPayload(){
  const {sync,...rest}=S;
  return Object.assign({},rest,{
    sync:{repo:sync&&sync.repo||'',branch:sync&&sync.branch||'main'},
    photoMeta:PHOTOS.map(p=>({id:p.id,folder:p.folder,date:p.date})),
    updatedAt:S.updatedAt||0,
    device:S.device
  });
}

function setStatus(txt,cls){
  const el=$('#syncPill');
  if(el){el.textContent=txt; el.className='pill '+(cls||'');}
  const d=$('#syncStatus'); if(d)d.textContent=txt;
}

/* ---------- the main operation ---------- */
async function syncNow(silent){
  if(!syncReady()){if(!silent)setStatus('Not connected');return}
  if(syncBusy)return;
  syncBusy=true; setStatus('Syncing…','c');
  try{
    await preflight();
    const remote=await ghGet('vaga-data.json');
    let remoteState=null, sha=null;
    if(remote){
      sha=remote.sha;
      try{remoteState=JSON.parse(b64dec(remote.content))}catch(e){remoteState=null}
    }

    const localAt=S.updatedAt||0, remoteAt=remoteState&&remoteState.updatedAt||0;

    if(remoteState && remoteAt>localAt){
      /* cloud is ahead — adopt it, keeping our own repo/token config */
      const keepSync=S.sync;
      const {photoMeta,...incoming}=remoteState;
      S=Object.assign({},incoming);
      S.sync=keepSync;
      S.settings=Object.assign({theme:'dark',mass:'kg',len:'cm',food:'g'},S.settings||{});
      Store.set('vaga',S);
      await pullPhotos(photoMeta||[]);
      renderAll(); applyTheme(); renderRecipeBrowse(); await loadPhotos();
      S.sync.last=Date.now(); S.sync.sha=sha; Store.set('vaga',S);
      setStatus('Cloud copy restored','g'); renderSync();
      syncBusy=false; lastPull=Date.now(); return;
    }

    /* we are ahead (or equal) — push */
    if(localAt>remoteAt || !remoteState){
      const body=b64enc(JSON.stringify(syncPayload(),null,1));
      const res=await ghPut('vaga-data.json',body,sha,'VAGA: data '+new Date().toISOString().slice(0,16).replace('T',' '));
      S.sync.sha=res.content&&res.content.sha;
    }
    await pushPhotos();
    if(remoteState)await pullPhotos(remoteState.photoMeta||[]);

    S.sync.last=Date.now(); Store.set('vaga',S);
    setStatus('Synced','g'); renderSync(); lastPull=Date.now();
  }catch(e){
    setStatus('Sync failed','a');
    const d=$('#syncStatus');
    if(d){d.textContent=String(e.message||e); d.style.color='var(--amber)'}
  }
  syncBusy=false;
}

async function pushPhotos(){
  S.sync.photos=S.sync.photos||[];
  const todo=PHOTOS.filter(p=>S.sync.photos.indexOf(p.id)<0).slice(0,8);
  for(const p of todo){
    const b64=String(p.url).split(',')[1];
    if(!b64)continue;
    try{
      await ghPut('photos/'+p.id+'.jpg',b64,null,'VAGA: photo '+p.folder+' '+p.date);
      S.sync.photos.push(p.id);
    }catch(e){
      if(/422|sha/i.test(String(e.message)))S.sync.photos.push(p.id); else throw e;
    }
  }
  if(todo.length)Store.set('vaga',S);
}

async function pullPhotos(meta){
  const have=new Set(PHOTOS.map(p=>p.id));
  const missing=(meta||[]).filter(m=>!have.has(m.id)).slice(0,12);
  for(const m of missing){
    try{
      const f=await ghGet('photos/'+m.id+'.jpg');
      if(!f)continue;
      let b64=f.content&&f.content.replace(/\s/g,'');
      if(!b64&&f.download_url){
        const blob=await fetch(f.download_url).then(r=>r.blob());
        b64=await new Promise(res=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result).split(',')[1]);fr.readAsDataURL(blob)});
      }
      if(!b64)continue;
      await DB.put({id:m.id,folder:m.folder,date:m.date,url:'data:image/jpeg;base64,'+b64});
      S.sync.photos=S.sync.photos||[]; if(S.sync.photos.indexOf(m.id)<0)S.sync.photos.push(m.id);
    }catch(e){/* one bad photo must not kill the whole sync */}
  }
  if(missing.length){Store.set('vaga',S); await loadPhotos()}
}

/* ---------- called by save() on every change ---------- */
function syncTouch(){
  if(!syncReady())return;
  setStatus('Pending…','');
  clearTimeout(syncTimer);
  syncTimer=setTimeout(()=>syncNow(true),6000);
}

/* ---------- settings UI ---------- */
function renderSync(){
  const box=$('#syncBox'); if(!box)return;
  S.sync=S.sync||{repo:'',branch:'main'};
  const on=syncReady();
  const last=S.sync.last?new Date(S.sync.last).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'never';
  box.innerHTML=`
    <div class="note ${on?'v':''}" style="margin-bottom:12px">
      <b>${on?'Connected.':'Not connected yet.'}</b> ${on
        ? `Every change is committed to <b>${esc(S.sync.repo)}</b> a few seconds after you make it. Clear your browser, switch phone, reinstall — open VAGA, and it pulls everything back. Last sync: ${last}.`
        : `Right now your logs live only in this browser. iOS evicts storage from unused web apps and "clear browsing data" wipes it. Point this at a <b>private</b> GitHub repo and nothing can be lost.`}
    </div>
    <label>Private repo for your data</label>
    <input id="syRepo" value="${esc(S.sync.repo||'')}" placeholder="yourname/vaga-data" autocapitalize="off" autocorrect="off" spellcheck="false">
    <div class="hint" style="margin-top:6px">A separate, <b>private</b> repo — not the one the app is published from.</div>
    <div style="height:12px"></div>
    <label>Fine-grained access token</label>
    <input id="syTok" type="password" value="${ghToken()?'••••••••••••':''}" placeholder="github_pat_…" autocapitalize="off" autocorrect="off" spellcheck="false">
    <div class="hint" style="margin-top:6px">
      github.com → Settings → Developer settings → Fine-grained tokens. Only that one repo, and only
      <b>Contents: Read and write</b>. Nothing else. The token stays in this browser, never in the repo and never in an export.
    </div>
    <div style="height:14px"></div>
    <button class="btn neon" onclick="saveSync()">${on?'Save and sync now':'Connect'}</button>
    ${on?`<div style="height:9px"></div><button class="btn ghost" onclick="syncNow()">Sync now</button>
          <div style="height:9px"></div><button class="btn red" onclick="disconnectSync()">Disconnect</button>`:''}
    <div class="hint" style="margin-top:11px" id="syncStatus"></div>`;
}
function saveSync(){
  S.sync=S.sync||{};
  S.sync.repo=$('#syRepo').value.trim().replace(/^https?:\/\/github\.com\//,'').replace(/\.git$/,'').replace(/\/$/,'');
  const t=$('#syTok').value.trim().replace(/^["'<]+|["'>]+$/g,'');
  if(t && !/^•+$/.test(t))setGhToken(t);
  S.sync.verified=null;          // re-check the repo whenever either half changes
  save();
  if(!syncReady()){setStatus('Fill in both the repo and the token');renderSync();return}
  renderSync(); syncNow();
}
function disconnectSync(){
  if(!confirm('Disconnect cloud backup? Your data stays in this browser and stays in the repo — they just stop talking to each other.'))return;
  setGhToken(''); S.sync={repo:S.sync.repo,branch:'main'}; save(); renderSync(); setStatus('Not connected');
}
