/* ==========================================================
   STORAGE
   localStorage for text-sized state, IndexedDB for photos.
   Neither is durable on its own — see sync.js for why the
   cloud copy is the one that actually keeps your progress.
   ========================================================== */
const Store=(()=>{
  let ok=true,mem={};
  try{localStorage.setItem('__t','1');localStorage.removeItem('__t')}catch(e){ok=false}
  return{ok,
    get(k,d){try{const v=ok?localStorage.getItem(k):mem[k];return v?JSON.parse(v):d}catch(e){return d}},
    set(k,v){try{const s=JSON.stringify(v);ok?localStorage.setItem(k,s):mem[k]=s}catch(e){}}};
})();

const DB=(()=>{
  let db=null,fallback=[];
  const open=()=>new Promise((res,rej)=>{
    if(db)return res(db);
    if(!('indexedDB' in window))return rej('no idb');
    const r=indexedDB.open('vaga-photos',1);
    r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('p'))r.result.createObjectStore('p',{keyPath:'id'})};
    r.onsuccess=()=>{db=r.result;res(db)};
    r.onerror=()=>rej(r.error);
  });
  const st=m=>open().then(d=>d.transaction('p',m).objectStore('p'));
  return{
    put:o=>st('readwrite').then(s=>new Promise((res,rej)=>{const q=s.put(o);q.onsuccess=()=>res();q.onerror=()=>rej(q.error)}))
        .catch(()=>{fallback.push(o)}),
    all:()=>st('readonly').then(s=>new Promise((res,rej)=>{const q=s.getAll();q.onsuccess=()=>res(q.result||[]);q.onerror=()=>rej(q.error)}))
        .catch(()=>fallback.slice()),
    del:id=>st('readwrite').then(s=>new Promise(res=>{const q=s.delete(id);q.onsuccess=()=>res();q.onerror=()=>res()}))
        .catch(()=>{fallback=fallback.filter(o=>o.id!==id)})
  };
})();

/* one-time carry-over from the pre-VAGA build */
let S=Store.get('vaga',null)||Store.get('recomp',null)||
      {start:null,logs:{},daily:{},body:[],shop:{},sessions:{},diary:{}};
S.sessions=S.sessions||{}; S.diary=S.diary||{}; S.recipes=S.recipes||[]; S.myshop=S.myshop||[];
S.sync=S.sync||{repo:'',branch:'main'};
S.settings=Object.assign({theme:'dark',mass:'kg',len:'cm',food:'g'},S.settings||{});
S.device=S.device||('d'+Math.random().toString(36).slice(2,8));
if(!S.start){const d=new Date();d.setDate(d.getDate()-((d.getDay()+6)%7));S.start=iso(d);}

const save=()=>{S.updatedAt=Date.now();Store.set('vaga',S);if(typeof syncTouch==='function')syncTouch()};

/* Everything is stored metric. These convert only at the edges: on screen and on input. */
const U={
  mU:()=>S.settings.mass, lU:()=>S.settings.len, fU:()=>S.settings.food,
  mOut:kg=>kg===''||kg==null||isNaN(kg)?'':+(S.settings.mass==='lb'?+kg*2.20462:+kg).toFixed(1),
  mIn:v=>v===''||v==null||isNaN(v)?'':+(S.settings.mass==='lb'?+v/2.20462:+v).toFixed(3),
  lOut:cm=>cm===''||cm==null||isNaN(cm)?'':+(S.settings.len==='in'?+cm/2.54:+cm).toFixed(1),
  lIn:v=>v===''||v==null||isNaN(v)?'':+(S.settings.len==='in'?+v*2.54:+v).toFixed(2),
  fOut:g=>S.settings.food==='oz'?+(g/28.3495).toFixed(1):Math.round(g)
};

function iso(d){return new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)}
function today(){return iso(new Date())}
function weekNo(d){
  const days=Math.floor((new Date((d||today())+'T00:00:00')-new Date(S.start+'T00:00:00'))/864e5);
  return Math.max(1,Math.floor(days/7)+1);
}
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nice=d=>{const x=new Date(d+'T00:00:00');
  return x.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})};

/* ==========================================================
   TODAY
   ========================================================== */
const installed=()=> (window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;

function renderBanner(){
  const el=$('#installBanner'); if(!el)return;
  if(installed()||Store.get('bannerOff',false)){el.innerHTML='';return}
  el.innerHTML=`<div class="note"><b>You're in a browser tab.</b> Add VAGA to your home screen and use only that icon from then on — an installed web app gets its own private storage, so sets you log in a tab won't appear in the installed app and the other way round. Whichever browser you install from, it runs the same afterwards.
    <div style="margin-top:9px"><button class="btn ghost" style="width:auto;padding:8px 13px;font-size:12.5px" onclick="hideBanner()">Got it, hide this</button></div></div>`;
}
function hideBanner(){Store.set('bannerOff',true);renderBanner()}

function renderToday(){
  renderBanner();
  const w=weekNo(), dow=new Date().getDay(), dayId=DAYMAP[dow];
  $('#rail').innerHTML=Array.from({length:16},(_,i)=>
    `<i class="${i+1<w?'f':(i+1===w?'now':'')}"></i>`).join('');

  const hero=$('.hero'), stripe=$('#heroStripe');
  if(dayId){
    const c=(dayId==='upperA'||dayId==='upperB')?'var(--mag)':'var(--cyan)';
    stripe.style.background=c; stripe.style.boxShadow='0 0 14px '+c;
    hero.style.setProperty('--glowc',c);
    $('#heroLbl').textContent=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dow];
    $('#heroBig').textContent=TRAIN[dayId].name;
    $('#heroSub').textContent=TRAIN[dayId].sub+' · '+TRAIN[dayId].ex.length+' exercises';
    $('#kcalT').textContent='2400';
  }else{
    const rest=dow===3, c=rest?'var(--lime)':'var(--amber)';
    stripe.style.background=c; stripe.style.boxShadow='0 0 14px '+c;
    hero.style.setProperty('--glowc',c);
    $('#heroLbl').textContent=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dow];
    $('#heroBig').textContent=rest?'Walk 45 min':(dow===0?'Rest & prep':'Rest');
    $('#heroSub').textContent=rest?'Conversational pace, plus 10 min of hip and shoulder mobility.'
      :(dow===0?'Weigh in, measure the waist, take the photos, then cook.'
              :'Steps only. One planned social meal is budgeted for — take it without guilt.');
    $('#kcalT').textContent='2150';
  }

  const d=S.daily[today()]||{};
  $('#dailyChecks').innerHTML=DAILY.map(x=>
    `<button class="chk ${d[x.k]?'on':''}" data-d="${x.k}"><div class="b"></div><span>${x.t}</span></button>`).join('');
  $$('#dailyChecks .chk').forEach(el=>el.onclick=()=>{
    const day=S.daily[today()]||(S.daily[today()]={});
    day[el.dataset.d]=!day[el.dataset.d]; save(); renderToday();
  });

  renderCal();
  $('#sessN').textContent=Object.values(S.sessions).filter(v=>v==='lift').length;
  $('#streakN').textContent=streak();

  const mw=WEEKS[(w-1)%4], deload=(w===8||w===16);
  $('#weekNote').innerHTML=
    `<b>Training week ${w} of 16.</b> ${deload
      ?'<span style="color:var(--amber)"><b>Deload week</b> — same weights, two sets per exercise, stop 4–5 reps short. It will feel like wasting time. It is not.</span>'
      :'Meals on <b>'+esc(mw.name)+'</b>.'}
     <div class="hint" style="margin-top:8px">${
      w<4?'Scale weight rising right now is creatine and glycogen, not fat. Ignore it until week 3.'
      :w<7?'The waist should be moving by now even if the scale is not.'
      :w<13?'Lower belly still there at this stage is on schedule, not a failure.'
      :'Reassess at week 16 — another block, or switch to a lean bulk.'}</div>`;
  $('#wkbadge').textContent='WK '+w;
}

function streak(){
  if(!Object.values(S.sessions).some(v=>v==='lift'))return 0;
  let n=0, d=new Date();
  for(let i=0;i<400;i++){
    const k=iso(d), dow=d.getDay();
    if(DAYMAP[dow]){ if(S.sessions[k]!=='lift') break; }
    n++; d.setDate(d.getDate()-1);
  }
  return n;
}

function renderCal(){
  const cells=[]; const d=new Date(); d.setDate(d.getDate()-83);
  for(let i=0;i<84;i++){
    const k=iso(d), v=S.sessions[k];
    cells.push(`<i data-d="${k}" class="${v==='lift'?'t':(v==='other'?'w':'')} ${k===today()?'today':''}" title="${k}"></i>`);
    d.setDate(d.getDate()+1);
  }
  $('#cal').innerHTML=cells.join('');
  $$('#cal i').forEach(el=>el.onclick=()=>{
    const k=el.dataset.d, v=S.sessions[k];
    S.sessions[k]= v==='lift'?'other' : (v==='other'?undefined:'lift');
    if(!S.sessions[k])delete S.sessions[k];
    save(); renderToday();
  });
}

/* ==========================================================
   TRAINING
   ========================================================== */
const e1=(w,r)=>(!w||!r)?0:w*(1+r/30);

function tonnage(week,dayId){
  let t=0;
  const D=TRAIN[dayId]; if(!D)return 0;
  D.ex.forEach((e,i)=>{for(let s=0;s<6;s++){
    const o=S.logs[`${week}|${dayId}|${i}|${s}`];
    if(o&&o.d&&o.w&&o.r) t+=(+o.w)*(+o.r);
  }});
  return t;
}
function bestE1(week,dayId,i){
  let b=0;
  for(let s=0;s<6;s++){const o=S.logs[`${week}|${dayId}|${i}|${s}`];
    if(o&&o.w&&o.r) b=Math.max(b,e1(+o.w,+o.r));}
  return b;
}

function renderTrain(){
  $('#dayTabs').innerHTML=Object.keys(TRAIN).map(k=>
    `<button data-k="${k}" class="${k===viewDay?'on':''}">${TRAIN[k].name}</button>`).join('');
  $$('#dayTabs button').forEach(b=>b.onclick=()=>{viewDay=b.dataset.k;renderTrain()});

  const w=weekNo(), D=TRAIN[viewDay], deload=(w===8||w===16);
  $('#deloadNote').innerHTML=deload
    ?'<div class="note"><b>Deload week.</b> Same weights, two sets per exercise, stop 4–5 reps short of failure. One week only.</div>':'';

  const now=tonnage(w,viewDay), prev=tonnage(w-1,viewDay);
  if(now||prev){
    const dl=prev?Math.round((now-prev)/prev*100):null;
    const up=dl!==null&&dl>=0;
    $('#scoreCard').innerHTML=`<div class="card ${prev?(up?'glow-lime':'glow-amber'):''}" style="display:flex;justify-content:space-between;align-items:center;gap:12px">
      <div><div class="hint">Total load moved today</div>
        <b style="font-size:24px;letter-spacing:-.8px">${Math.round(U.mOut(now)||0).toLocaleString()} ${U.mU()}</b></div>
      <div style="text-align:right">${prev
        ? `<b style="font-size:19px;color:${up?'var(--lime)':'var(--amber)'}">${dl>=0?'+':''}${dl}%</b>
           <div class="hint">vs ${Math.round(U.mOut(prev)||0).toLocaleString()} ${U.mU()} last week</div>`
        : `<div class="hint" style="max-width:150px">First time through this session — this becomes your benchmark.</div>`}</div>
    </div>`;
  } else $('#scoreCard').innerHTML='';

  const stalls=[];
  D.ex.forEach((e,i)=>{
    const a=bestE1(w-1,viewDay,i), b=bestE1(w-2,viewDay,i), c=bestE1(w-3,viewDay,i);
    if(a&&b&&c&&a<=b*1.005&&b<=c*1.005) stalls.push(e.n);
  });
  $('#stallCard').innerHTML=stalls.length
    ? `<div class="note"><b>Stalled: ${stalls.map(esc).join(', ')}.</b> Same weight, same reps, two weeks running. Change <i>one</i> thing and wait two weeks: swap it for a close variant, add one set, or — if several lifts stalled at once and you're sleeping badly — run the deload now instead of at week 8.</div>`
    : '';

  $('#exList').innerHTML=D.ex.map((e,i)=>{
    const cls=e.heavy?'heavy':(e.cable?'cable':'');
    const pill=e.heavy?'<span class="pill h">Free weight</span>':(e.cable?'<span class="pill c">Cable</span>':'');
    const nSets=deload?2:e.s;
    let sets='';
    for(let s=0;s<nSets;s++){
      const key=`${w}|${viewDay}|${i}|${s}`, p=S.logs[`${w-1}|${viewDay}|${i}|${s}`], cur=S.logs[key]||{};
      sets+=`<div class="set ${cur.d?'done':''}" data-k="${key}" data-ex="${i}">
        <div class="si">${s+1}</div>
        <input type="number" inputmode="decimal" step="0.5" placeholder="${U.mU()}" value="${U.mOut(cur.w)}" data-f="w">
        <input type="number" inputmode="numeric" placeholder="reps" value="${cur.r??''}" data-f="r">
        <button class="tick">✓</button></div>`;
      if(p&&p.w) sets+=`<div class="set" style="padding-top:0;border:0"><div></div><div class="last">last week <b>${U.mOut(p.w)} ${U.mU()} × ${esc(p.r||'')}</b></div></div>`;
    }
    const eNow=bestE1(w,viewDay,i), ePrev=bestE1(w-1,viewDay,i);
    const foot=eNow?`<div class="exfoot"><span>Best set today · e1RM <b>${U.mOut(eNow)} ${U.mU()}</b></span>
      ${ePrev?`<span class="${eNow>=ePrev?'up':'dn'}">${eNow>=ePrev?'▲':'▼'} ${eNow>=ePrev?'+':'-'}${U.mOut(Math.abs(eNow-ePrev))} ${U.mU()}</span>`:''}</div>`:'';
    return `<div class="ex ${cls}">
      <div class="exh"><div class="n">${i+1}</div><div class="t"><b>${esc(e.n)}</b><em>${esc(e.c)}</em></div>${pill}</div>
      <div class="scheme"><span><b>${nSets}</b> sets</span><span><b>${e.r}</b> reps</span><span>rest <b>${e.rest>=60?(e.rest/60)+' min':e.rest+'s'}</b></span></div>
      ${e.why?`<div class="why">${esc(e.why)}</div>`:''}
      <div class="sets">${sets}</div>${foot}</div>`;
  }).join('');

  $$('#exList .set[data-k]').forEach(row=>{
    const key=row.dataset.k;
    row.querySelectorAll('input').forEach(inp=>inp.oninput=()=>{
      const o=S.logs[key]||(S.logs[key]={});
      o[inp.dataset.f]= inp.dataset.f==='w' ? U.mIn(inp.value) : inp.value;
      save();
    });
    row.querySelector('.tick').onclick=()=>{
      const o=S.logs[key]||(S.logs[key]={});
      o.d=!o.d; save(); row.classList.toggle('done',!!o.d);
      if(o.d){
        S.sessions[today()]='lift'; save();
        startTimer(TRAIN[viewDay].ex[+row.dataset.ex].rest);
        if(!swRunning&&swElapsed===0)toggleSW();
      }
      renderTrain(); renderToday();
    };
  });
}

/* ---- rest timer ---- */
let tInt=null,tLeft=0;
function startTimer(sec){
  if(!sec)return;
  tLeft=sec; $('#timer').classList.add('on'); paintT();
  clearInterval(tInt);
  tInt=setInterval(()=>{tLeft--;paintT();if(tLeft<=0){stopTimer();beep()}},1000);
}
function paintT(){$('#tval').textContent=Math.floor(Math.max(0,tLeft)/60)+':'+String(Math.max(0,tLeft%60)).padStart(2,'0')}
function stopTimer(){clearInterval(tInt);$('#timer').classList.remove('on')}
function addRest(s){tLeft+=s;paintT()}
function beep(){
  try{const c=new(window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();
    o.connect(g);g.connect(c.destination);o.frequency.value=880;g.gain.value=.25;o.start();
    setTimeout(()=>{o.stop();c.close()},280)}catch(e){}
  if(navigator.vibrate)navigator.vibrate([130,70,130]);
}

/* ---- session stopwatch ---- */
let swRunning=false,swStart=0,swElapsed=0,swInt=null;
function paintSW(){
  const t=Math.floor((swElapsed+(swRunning?Date.now()-swStart:0))/1000);
  $('#swVal').textContent=Math.floor(t/60)+':'+String(t%60).padStart(2,'0');
}
function toggleSW(){
  if(swRunning){swElapsed+=Date.now()-swStart;swRunning=false;clearInterval(swInt);$('#swBtn').textContent='Resume'}
  else{swStart=Date.now();swRunning=true;swInt=setInterval(paintSW,500);$('#swBtn').textContent='Pause'}
  paintSW();
}
function resetSW(){swRunning=false;swElapsed=0;clearInterval(swInt);$('#swBtn').textContent='Start';paintSW()}

/* ==========================================================
   FOOD
   ========================================================== */
function renderEat(){
  $('#mealWeekTabs').innerHTML=WEEKS.map((w,i)=>
    `<button data-i="${i}" class="${i===viewMealWeek?'on':''}">Week ${i+1}</button>`).join('');
  $$('#mealWeekTabs button').forEach(b=>b.onclick=()=>{viewMealWeek=+b.dataset.i;renderEat()});
  const W=WEEKS[viewMealWeek];
  $('#mwName').textContent=W.name; $('#mwTag').textContent=W.tag;
  $('#mwKcal').textContent=W.kcal+' kcal'; $('#mwP').textContent=W.p+' g protein';
  $('#mwNote').innerHTML=W.note;
  $('#mealList').innerHTML=W.meals.map(m=>`
    <div class="meal">
      <div class="mh"><div class="time">${m.time}</div>
        <div class="t"><b>${esc(m.name)}</b><em>${esc(m.sub)}</em></div>
        <div class="mac">${m.kcal}<span>${m.p} g P</span></div></div>
      <div class="mb">
        ${m.items.map(x=>`<div class="ing"><span>${esc(x[1])}</span><i>${esc(x[0])}</i></div>`).join('')}
        ${m.how?`<div class="how">${m.how}</div>`:''}</div></div>`).join('');
  $$('#mealList .mh').forEach(h=>h.onclick=()=>h.parentElement.classList.toggle('open'));
  $('#prepList').innerHTML=W.prep.map(p=>`<div style="padding:7px 0;border-bottom:1px solid var(--line2)">${p}</div>`).join('')
    +`<div class="hint" style="margin-top:10px">All weights raw. Cool food spread flat before it goes in the fridge, and check the fridge is actually at 4 °C — most sit at 6–8, which halves how long anything keeps.</div>`;
}

function renderShop(){
  $('#shopWeekTabs').innerHTML=WEEKS.map((w,i)=>
    `<button data-i="${i}" class="${i===viewShopWeek?'on':''}">Week ${i+1}</button>`).join('');
  $$('#shopWeekTabs button').forEach(b=>b.onclick=()=>{viewShopWeek=+b.dataset.i;renderShop()});
  const list=SHOP[viewShopWeek], ticks=S.shop[viewShopWeek]||{};
  let total=0,html='';
  list.forEach(([sec,items])=>{
    html+=`<div class="sec">${esc(sec)}</div>`;
    items.forEach(([n,q,p,note])=>{
      total+=p; const id=sec+'|'+n;
      html+=`<div class="item ${ticks[id]?'on':''}" data-id="${esc(id)}"><div class="b"></div>
        <div class="t"><b>${esc(n)}</b>${note?`<em>${esc(note)}</em>`:''}</div>
        <div class="q">${esc(q)}<span>€${p.toFixed(2)}</span></div></div>`;
    });
  });
  $('#shopList').innerHTML=html;
  $('#shopTotal').textContent='€'+total.toFixed(0)+' / week';
  $('#shopMonth').textContent='≈ €'+Math.round(total*4.33)+' a month at this list';
  $('#budgetCard').innerHTML=`<div class="card"><b style="font-size:14px">Getting it to ~€57 a week</b>
    <div class="hint" style="margin:7px 0 10px">That is ~€245 a month. Every swap below is nutritionally neutral or better.</div>
    ${[['Chicken thighs instead of breast, always','€3.50','None. Arguably better food — it reheats without going dry.'],
       ['Two meatless dinners a week (lentils + eggs)','€4.00','None nutritionally. More fibre.'],
       ['Drop the mince by 400 g, add 10 eggs','€2.50','Slightly more monotonous.'],
       ['Skip nuts and peanut butter, get fat from eggs and oil','€2.00','Lose a convenient calorie source.'],
       ['Buy meat only on akcija and freeze three weeks of it','€4–6','Needs freezer space and a Wednesday leaflet habit.']]
      .map(([s,v,c])=>`<div style="display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid var(--line2)">
        <div style="flex:1"><b style="font-size:13px;font-weight:600">${s}</b><div class="hint">${c}</div></div>
        <b style="color:var(--lime);white-space:nowrap">−${v}</b></div>`).join('')}</div>`;
  $$('#shopList .item').forEach(el=>el.onclick=()=>{
    const t=S.shop[viewShopWeek]||(S.shop[viewShopWeek]={});
    t[el.dataset.id]=!t[el.dataset.id]; save(); el.classList.toggle('on',!!t[el.dataset.id]);
  });
}
function clearShop(){S.shop[viewShopWeek]={};save();renderShop()}

/* ==========================================================
   PHOTOS
   ========================================================== */
let PHOTOS=[], phFolder='front', selecting=false, selected=[], viewList=[], viewIdx=0;
const FOLDER_HINT={
  front:'Feet at the same mark, arms relaxed at your sides, camera at chest height. Same light, same time of day.',
  side:'Turn 90°, look straight ahead, arms hanging naturally. Don\'t suck in and don\'t push out — the honest photo is the useful one.',
  back:'Arms relaxed. Get someone to take it, or use the volume button on a timer with the phone propped at the same spot.'
};

function loadPhotos(){return DB.all().then(a=>{PHOTOS=a.sort((x,y)=>x.date<y.date?-1:(x.date>y.date?1:0));renderPhotos()})}

function renderPhotos(){
  if(phFolder==='cmp'){renderDayPicker();return}
  const mine=PHOTOS.filter(p=>p.folder===phFolder);
  const ref=mine[mine.length-1];
  $('#phNote').innerHTML=`<b>${phFolder[0].toUpperCase()+phFolder.slice(1)} view.</b> ${FOLDER_HINT[phFolder]}`
    +(ref?`<div style="display:flex;gap:10px;align-items:center;margin-top:10px">
        <img src="${ref.url}" style="width:44px;height:58px;object-fit:cover;border-radius:7px;opacity:.65;border:1px solid var(--line)">
        <div class="hint" style="flex:1">Your last ${phFolder} shot, ${nice(ref.date)}. Match this framing and distance — inconsistent framing is what ruins progress photos, not bad lighting.</div></div>`:'');

  $('#phGrid').innerHTML=
    `<button class="addph" onclick="pick()"><b>+</b>Add ${phFolder}</button>`+
    mine.slice().reverse().map(p=>{
      const o=selected.indexOf(p.id);
      return `<div class="ph ${o>=0?'sel':''}" data-id="${p.id}" ${o>=0?`data-order="${o+1}"`:''}>
        <img src="${p.url}" alt="${phFolder} view, ${p.date}" loading="lazy">
        <span class="wk">W${weekNo(p.date)}</span>
        <div class="d">${nice(p.date).replace(/ \d{4}$/,'')}</div></div>`;
    }).join('');

  $$('#phGrid .ph').forEach(el=>el.onclick=()=>{
    const id=el.dataset.id;
    if(selecting){
      const i=selected.indexOf(id);
      if(i>=0)selected.splice(i,1); else if(selected.length<2)selected.push(id);
      renderPhotos();
    }else{
      viewList=mine; viewIdx=mine.findIndex(p=>p.id===id); openViewer();
    }
  });
  renderPairCompare();
  $('#selBtn').textContent=selecting?(selected.length===2?'Clear selection':'Tap two photos ('+selected.length+'/2)'):'Select two to compare';
}

function toggleSelect(){selecting=!selecting;selected=[];renderPhotos()}

function renderPairCompare(){
  const old=$('#pairOut'); if(old)old.remove();
  if(selected.length!==2)return;
  const a=PHOTOS.find(p=>p.id===selected[0]), b=PHOTOS.find(p=>p.id===selected[1]);
  if(!a||!b)return;
  const [e,l]=a.date<=b.date?[a,b]:[b,a];
  const days=Math.round((new Date(l.date)-new Date(e.date))/864e5);
  const html=`<div id="pairOut">
    <h2>Side by side</h2>
    <div class="cmp"><figure><img src="${e.url}" alt=""><figcaption>${nice(e.date)} · W${weekNo(e.date)}</figcaption></figure>
      <figure><img src="${l.url}" alt=""><figcaption>${nice(l.date)} · W${weekNo(l.date)}</figcaption></figure></div>
    <h2>Drag to wipe between them</h2>
    <div class="wipe" id="wipe"><img src="${l.url}" alt="">
      <div class="b" id="wipeB"><img src="${e.url}" alt=""></div><div class="hnd" id="wipeH"></div></div>
    <div class="hint" style="margin-top:9px;text-align:center">${days} days apart. Left of the line is ${nice(e.date)}.</div></div>`;
  $('#phGridWrap').insertAdjacentHTML('beforeend',html);
  initWipe();
}

function initWipe(){
  const w=$('#wipe'); if(!w)return;
  const b=$('#wipeB'), h=$('#wipeH');
  const set=x=>{
    const r=w.getBoundingClientRect();
    const pct=Math.min(100,Math.max(0,(x-r.left)/r.width*100));
    b.style.width=pct+'%'; h.style.left=pct+'%';
    const img=b.querySelector('img'); img.style.width=r.width+'px'; img.style.height='auto';
  };
  const move=ev=>{ev.preventDefault();set((ev.touches?ev.touches[0]:ev).clientX)};
  w.addEventListener('pointerdown',e=>{try{w.setPointerCapture(e.pointerId)}catch(_){}move(e)});
  w.addEventListener('pointermove',e=>{if(e.pressure>0||e.buttons)move(e)});
  w.addEventListener('touchmove',move,{passive:false});
  requestAnimationFrame(()=>{const r=w.getBoundingClientRect();set(r.left+r.width/2)});
}

function pick(){const i=$('#phInput'); i.value=''; i.click()}
$('#phInput').addEventListener('change',function(){
  const f=this.files&&this.files[0]; if(!f)return;
  const fr=new FileReader();
  fr.onload=()=>{
    const img=new Image();
    img.onload=()=>{
      const max=1300, sc=Math.min(1,max/Math.max(img.width,img.height));
      const c=document.createElement('canvas');
      c.width=Math.round(img.width*sc); c.height=Math.round(img.height*sc);
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);
      DB.put({id:String(Date.now())+Math.random().toString(36).slice(2,6),folder:phFolder,
              date:today(),url:c.toDataURL('image/jpeg',.72)}).then(()=>{save();return loadPhotos()});
    };
    img.src=fr.result;
  };
  fr.readAsDataURL(f);
});

function openViewer(){
  $('#viewer').classList.add('on');
  document.body.style.overflow='hidden';
  paintViewer();
}
function closeViewer(){$('#viewer').classList.remove('on');document.body.style.overflow=''}
function stepViewer(n){
  const i=viewIdx+n;
  if(i<0||i>=viewList.length){if(i>=viewList.length)closeViewer();return}
  viewIdx=i; paintViewer();
}
function paintViewer(){
  const p=viewList[viewIdx]; if(!p)return closeViewer();
  $('#vbars').innerHTML=viewList.map((_,i)=>`<i class="${i<=viewIdx?'on':''}"></i>`).join('');
  $('#vimgel').src=p.url;
  $('#vfolder').textContent=p.folder.toUpperCase()+' · '+(viewIdx+1)+' of '+viewList.length;
  $('#vdate').textContent=nice(p.date);
  const first=viewList[0];
  const days=Math.round((new Date(p.date)-new Date(first.date))/864e5);
  $('#vsub').textContent='Week '+weekNo(p.date)+(days>0?' · day '+days+' of this series':' · the first one');
}
function deleteCurrent(){
  const p=viewList[viewIdx]; if(!p)return;
  if(!confirm('Delete this photo? It stays in your camera roll, but it goes from here.'))return;
  DB.del(p.id).then(()=>{
    viewList.splice(viewIdx,1);
    if(!viewList.length)closeViewer(); else{viewIdx=Math.min(viewIdx,viewList.length-1);paintViewer()}
    save(); loadPhotos();
  });
}

function photoDates(){return [...new Set(PHOTOS.map(p=>p.date))].sort()}
function renderDayPicker(){
  const ds=photoDates();
  const opts=ds.map(d=>`<option value="${d}">${nice(d)} · W${weekNo(d)}</option>`).join('');
  $('#dayA').innerHTML=opts; $('#dayB').innerHTML=opts;
  if(ds.length>1){$('#dayA').value=ds[0];$('#dayB').value=ds[ds.length-1]}
  $('#dayCmpOut').innerHTML= ds.length>1?'':'<div class="empty">Two different days with photos and this comes alive.<br>Sunday morning is the moment to take them.</div>';
  if(ds.length>1)renderDayCompare();
}
function renderDayCompare(){
  const a=$('#dayA').value, b=$('#dayB').value;
  if(!a||!b)return;
  const days=Math.round(Math.abs(new Date(b)-new Date(a))/864e5);
  const pic=(d,f)=>{const m=PHOTOS.filter(p=>p.date===d&&p.folder===f);return m[m.length-1]};
  const rows=['front','side','back'].map(f=>{
    const pa=pic(a,f), pb=pic(b,f);
    if(!pa&&!pb)return '';
    const ph=p=>p?`<img src="${p.url}" alt="">`:`<div style="aspect-ratio:3/4;border-radius:11px;border:1px dashed var(--line);display:flex;align-items:center;justify-content:center;color:var(--dim);font-size:11px">No ${f} shot</div>`;
    return `<div class="rowlbl">${f}</div><div class="cmp">
      <figure>${ph(pa)}<figcaption>${nice(a)}</figcaption></figure>
      <figure>${ph(pb)}<figcaption>${nice(b)}</figcaption></figure></div>`;
  }).join('');
  $('#dayCmpOut').innerHTML=rows
    ? `<div class="card glow-vio" style="text-align:center"><div class="hint">Between these two days</div>
        <b style="font-size:24px;letter-spacing:-.8px">${days} days</b>
        <div class="hint">${waistBetween(a,b)}</div></div>${rows}`
    : '<div class="empty">No photos on those two days.</div>';
}
function waistBetween(a,b){
  const near=d=>{let best=null,bd=1e9;
    S.body.forEach(x=>{if(x.wa){const dd=Math.abs(new Date(x.d)-new Date(d));if(dd<bd){bd=dd;best=x}}});
    return bd<=6*864e5?best:null};
  const A=near(a),B=near(b);
  if(!A||!B)return 'Log your waist on photo days and this line fills in.';
  const a1=+U.lOut(A.wa), b1=+U.lOut(B.wa), d=(b1-a1).toFixed(1);
  return `Waist ${a1} → ${b1} ${U.lU()} (${d>0?'+':''}${d})`;
}

/* ==========================================================
   DIARY
   ========================================================== */
let dEnergy=0;
function renderEnergyScale(){
  $('#dEnergy').innerHTML=[1,2,3,4,5].map(n=>`<button data-n="${n}" class="${n===dEnergy?'on':''}">${n}</button>`).join('');
  $$('#dEnergy button').forEach(b=>b.onclick=()=>{dEnergy=+b.dataset.n;renderEnergyScale()});
}
function saveEntry(){
  const t=$('#dText').value.trim(), sl=parseFloat($('#dSleep').value);
  if(!t&&!dEnergy&&isNaN(sl))return;
  S.diary[today()]={t,e:dEnergy||null,s:isNaN(sl)?null:sl};
  save(); $('#dText').value=''; $('#dSleep').value=''; dEnergy=0;
  renderEnergyScale(); renderDiary();
}
function renderDiary(){
  const ks=Object.keys(S.diary).sort().reverse();
  $('#diaryList').innerHTML= ks.length? ks.map(k=>{
    const e=S.diary[k], s=S.sessions[k];
    return `<div class="entry">
      <div class="eh"><b>${nice(k)}</b><em>WEEK ${weekNo(k)}${s==='lift'?' · LIFTED':''}</em></div>
      ${e.t?`<p>${esc(e.t)}</p>`:''}
      <div class="tags">
        ${e.e?`<span class="tag ${e.e>=4?'hi':(e.e<=2?'lo':'')}">Energy ${e.e}/5</span>`:''}
        ${e.s?`<span class="tag ${e.s>=7?'hi':'lo'}">${e.s} h sleep</span>`:''}
      </div></div>`;
  }).join('') : '<div class="empty">Nothing written yet.<br>Two lines on a bad day is worth more than a paragraph on a good one — that\'s the entry that explains next week.</div>';
}

/* ==========================================================
   ME
   ========================================================== */
function addBody(){
  const wv=parseFloat($('#inW').value), wav=parseFloat($('#inWa').value);
  if(isNaN(wv)&&isNaN(wav))return;
  S.body=S.body.filter(b=>b.d!==today());
  S.body.push({d:today(),w:isNaN(wv)?null:+U.mIn(wv),wa:isNaN(wav)?null:+U.lIn(wav)});
  S.body.sort((a,b)=>a.d<b.d?-1:1);
  $('#inW').value='';$('#inWa').value='';
  save();renderMe();
}
function spark(el,vals,color){
  const svg=$(el);
  if(vals.length<2){svg.innerHTML=`<text x="150" y="45" fill="#5A6080" font-size="11" text-anchor="middle">Two entries and this becomes a line.</text>`;return}
  const mn=Math.min(...vals),mx=Math.max(...vals),r=(mx-mn)||1;
  const pts=vals.map((v,i)=>[8+i*(284/(vals.length-1)),70-((v-mn)/r)*58]);
  const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
  svg.innerHTML=`<path d="${d}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" style="filter:drop-shadow(0 0 6px ${color})"/>`
    +pts.map(p=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2.8" fill="${color}"/>`).join('');
}
const MAIN=[['Bench Press','upperA',0],['Back Squat','lowerA',0],['Overhead Press','upperB',0],['Deadlift','lowerB',0]];
function renderMe(){
  $('#startDate').value=S.start;
  $('#lbW').textContent='Weight '+U.mU(); $('#lbWa').textContent='Waist '+U.lU();
  const ws=S.body.filter(b=>b.w!=null).map(b=>+U.mOut(b.w)), was=S.body.filter(b=>b.wa!=null).map(b=>+U.lOut(b.wa));
  spark('#sparkW',ws,'#EEF0FA'); spark('#sparkWaist',was,'#C6FF3D');
  $('#wDelta').textContent=ws.length>1?`${(ws.at(-1)-ws[0]>0?'+':'')}${(ws.at(-1)-ws[0]).toFixed(1)} ${U.mU()} since you started.`:'';
  $('#waistDelta').textContent=was.length>1?`${(was.at(-1)-was[0]).toFixed(1)} ${U.lU()} since you started. This is the number that matters.`:'';

  const w=weekNo();
  $('#e1rm').innerHTML=MAIN.map(([label,day,idx])=>{
    let best=0,bw=0;
    for(let k=1;k<=w;k++){const v=bestE1(k,day,idx); if(v>best){best=v;bw=k}}
    return `<div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--line2)">
      <span style="font-weight:600">${esc(TRAIN[day].ex[idx].n)}</span>
      <b style="color:${best?'var(--cyan)':'var(--dim)'}">${best?U.mOut(best)+' '+U.mU()+' · W'+bw:'—'}</b></div>`;
  }).join('')+`<div class="hint" style="margin-top:9px">Epley estimate from your best logged set. If these climb while the waist drops, the recomposition is working — that is the definition of it working.</div>`;

  $('#bodyTable').innerHTML='<tr><th>Date</th><th>Weight</th><th>Waist</th></tr>'+
    (S.body.length?[...S.body].reverse().map(b=>`<tr><td>${b.d.slice(5)}</td><td>${b.w!=null?U.mOut(b.w)+' '+U.mU():'—'}</td><td>${b.wa!=null?U.lOut(b.wa)+' '+U.lU():'—'}</td></tr>`).join('')
     :'<tr><td colspan="3" style="text-align:center;color:#5A6080;padding:18px 0">Nothing logged yet. Sunday morning is the moment.</td></tr>');

  $('#storeNote').textContent=Store.ok
    ?'This file is a snapshot you can keep anywhere. Cloud backup above is the one that runs by itself.'
    :'Storage is blocked in this preview, so nothing survives a reload. Install it properly and it will.';
}
function setStart(v){if(v){S.start=v;save();renderAll()}}
function exportData(){
  const b=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(b); a.download='vaga-backup-'+today()+'.json'; a.click();
}
function importData(inp){
  const f=inp.files[0]; if(!f)return;
  const r=new FileReader();
  r.onload=()=>{try{
      const o=JSON.parse(r.result); if(!o.start)throw 0;
      const keepSync=S.sync;
      S=o; S.sync=keepSync;
      S.sessions=S.sessions||{}; S.diary=S.diary||{}; S.recipes=S.recipes||[]; S.myshop=S.myshop||[];
      S.settings=Object.assign({theme:'dark',mass:'kg',len:'cm',food:'g'},S.settings||{});
      save(); applyTheme(); renderAll(); renderRecipeBrowse();
    }catch(e){alert('That is not a VAGA backup file.')}};
  r.readAsText(f);
}
function wipe(){
  if(!confirm('Erase every log, diary entry and measurement on this device? Photos stay.'))return;
  const connected=(typeof syncReady==='function')&&syncReady();
  let alsoCloud=false;
  if(connected){
    alsoCloud=confirm('Also erase the copy in your GitHub repo?\n\nOK = erase both.\nCancel = erase only this device, then pull everything back from the cloud.');
  }
  const keepSync=S.sync;
  S={start:S.start,logs:{},daily:{},body:[],shop:{},sessions:{},diary:{},recipes:[],myshop:[],
     settings:S.settings,device:S.device,sync:keepSync};
  if(connected && !alsoCloud){
    S.updatedAt=0; Store.set('vaga',S); renderAll(); syncNow();
    return;
  }
  save(); renderAll(); renderRecipeBrowse();
}

/* ==========================================================
   NAV + BOOT
   ========================================================== */
let viewDay=DAYMAP[new Date().getDay()]||'upperA';
let viewMealWeek=(weekNo()-1)%4, viewShopWeek=viewMealWeek;

const TITLES={today:['Recomposition','Today'],train:['Progressive overload','Train'],
  food:['4-week rotation','Food'],photos:['Front · side · back','Photos'],
  diary:['Why the week went that way','Diary'],me:['Waist over scale','Me']};
$$('nav button').forEach(b=>b.onclick=()=>{
  const t=b.dataset.t;
  $$('nav button').forEach(x=>x.classList.toggle('on',x===b));
  $$('main section').forEach(s=>s.classList.toggle('on',s.id==='s-'+t));
  $('#eyebrow').textContent=TITLES[t][0];
  $('#title').textContent=TITLES[t][1];
  if(t==='photos')loadPhotos();
  $('#fab').classList.toggle('on', t==='food' && $('#foodRecipes').style.display!=='none');
  if(t!=='food')closeDrawer();
  window.scrollTo(0,0);
});
$$('#trainSeg button').forEach(b=>b.onclick=()=>{
  $$('#trainSeg button').forEach(x=>x.classList.toggle('on',x===b));
  $('#trainWork').style.display=b.dataset.v==='work'?'':'none';
  $('#trainTimer').style.display=b.dataset.v==='timer'?'':'none';
});
$$('#foodSeg button').forEach(b=>b.onclick=()=>{
  $$('#foodSeg button').forEach(x=>x.classList.toggle('on',x===b));
  const v=b.dataset.v;
  $('#foodMeals').style.display=v==='meals'?'':'none';
  $('#foodRecipes').style.display=v==='recipes'?'':'none';
  $('#foodShop').style.display=v==='shop'?'':'none';
  $('#fab').classList.toggle('on',v==='recipes');
  if(v==='recipes')backToRecipes();
  if(v==='shop')renderMyShop();
});
$$('#phSeg button').forEach(b=>b.onclick=()=>{
  $$('#phSeg button').forEach(x=>x.classList.toggle('on',x===b));
  phFolder=b.dataset.v; selecting=false; selected=[];
  $('#phGridWrap').style.display=phFolder==='cmp'?'none':'';
  $('#phCompare').style.display=phFolder==='cmp'?'':'none';
  renderPhotos();
});
document.addEventListener('keydown',e=>{
  if(!$('#viewer').classList.contains('on'))return;
  if(e.key==='Escape')closeViewer();
  if(e.key==='ArrowRight')stepViewer(1);
  if(e.key==='ArrowLeft')stepViewer(-1);
});

function renderAll(){
  renderToday();renderTrain();renderEat();renderShop();renderMyShop();
  renderDiary();renderMe();renderEnergyScale();renderSettings();renderSync();
}

applyTheme();
if(window.matchMedia)try{window.matchMedia('(prefers-color-scheme: light)')
  .addEventListener('change',()=>{if(S.settings.theme==='auto')applyTheme()})}catch(e){}
renderAll();
renderRecipeBrowse();
paintSW();
loadPhotos().then(()=>{ if(typeof syncNow==='function')syncNow(true) });

/* pull again when you come back to the app, so a log made on the
   other device is already here before you start a set */
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible' && typeof syncNow==='function'
     && Date.now()-lastPull>120000) syncNow(true);
});
window.addEventListener('online',()=>{if(typeof syncNow==='function')syncNow(true)});

/* Ask the browser not to evict. Chrome/Android grants this silently for
   installed apps; iOS Safari ignores it — which is the whole reason the
   GitHub backup exists. */
if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
}
