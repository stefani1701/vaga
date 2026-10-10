/* ==========================================================
   FOOD TABLE — per 100 g, raw unless noted.
   Offline and instant. Open Food Facts fills the gaps.
   ========================================================== */
const FOODS=[
 ['Chicken breast · pileća prsa',110,23,0,1.8],
 ['Chicken thigh, boneless · pileći zabatak',170,18,0,10.7],
 ['Beef mince 10% · mljeveno juneće',176,20,0,10],
 ['Turkey mince 7% · mljeveno pureće',140,19,0,7],
 ['Pork loin · svinjski file',143,21,0,6],
 ['Egg, whole · jaje',143,12.6,0.7,9.5],
 ['Hake · oslić',86,18,0,1.3],
 ['Mackerel · skuša',205,19,0,14],
 ['Salmon · losos',208,20,0,13],
 ['Tuna in brine, drained · tuna',116,26,0,1],
 ['Skyr / posni sir',58,10,3.8,0.3],
 ['Cottage cheese',98,11,3.4,4.3],
 ['Greek yogurt 2%',73,9,4,2],
 ['Milk 2.8% · mlijeko',52,3.4,4.8,2.8],
 ['Whey protein',383,80,7,5],
 ['Grated cheese · ribani sir',380,25,2,30],
 ['Red lentils, dry · crvena leća',350,24,60,1.1],
 ['Chickpeas, drained · slanutak',120,6.3,18,2],
 ['Beans, drained · grah',90,6,15,0.5],
 ['Rice, dry · riža',358,7,79,0.9],
 ['Pasta, dry · tjestenina',360,12.5,71,1.5],
 ['Oats · zobene pahuljice',380,13,60,7],
 ['Barley, dry · ječam',352,10,73,2.3],
 ['Potato · krumpir',77,2,17,0.1],
 ['Rye bread · raženi kruh',230,7,44,1.5],
 ['Banana',89,1.1,23,0.3],
 ['Apple · jabuka',52,0.3,14,0.2],
 ['Frozen spinach · špinat',23,2.9,1.4,0.4],
 ['Broccoli · brokula',34,2.8,7,0.4],
 ['Chard · blitva',19,1.8,3.7,0.2],
 ['Onion · luk',40,1.1,9,0.1],
 ['Passata',32,1.5,6,0.2],
 ['Olive oil · maslinovo ulje',884,0,0,100],
 ['Peanut butter · kikiriki maslac',600,25,20,50],
 ['Almonds · bademi',579,21,22,50],
 ['Walnuts · orasi',654,15,14,65],
 ['Honey · med',304,0.3,82,0]
];

/* ==========================================================
   BUILT-IN RECIPES
   ========================================================== */
const BUILTIN=[
{id:'b1',name:'Crvena leća s piletinom',tag:'Red lentil & chicken stew',mins:40,serv:4,
 ing:[[320,'Red lentils, dry'],[700,'Chicken thigh, boneless'],[200,'Onion, diced'],[15,'Garlic, ~4 cloves'],
      [400,'Passata'],[20,'Olive oil'],[6,'Cumin + sweet paprika'],[50,'Lemon juice'],[10,'Salt']],
 water:'1.6 L water',
 steps:['Brown the diced thigh hard in the oil — get colour on it, that is most of the flavour.',
   'Onion and garlic in, 4 minutes, then the cumin and paprika for 30 seconds off the heat so the paprika does not burn bitter.',
   'Lentils, passata and 1.6 L water. Bring up, then simmer 20–25 min, stirring now and then so the lentils do not catch on the base.',
   'Off the heat, lemon juice in. Salt to taste last — the lentils absorb a lot and it tastes flat if you salt early.'],
 tip:'Red lentils need no soaking and go soft in 15 minutes, which is the whole reason they are in this plan. It also freezes and reheats better than any other meal here.'},

{id:'b2',name:'Puretina sa špinatom',tag:'Turkey & spinach with potatoes',mins:45,serv:4,
 ing:[[800,'Turkey mince 7%'],[1200,'Frozen spinach'],[1200,'Potato, skin on'],[20,'Olive oil'],
      [150,'Onion'],[10,'Garlic'],[2,'Nutmeg, grated'],[10,'Salt + black pepper']],
 steps:['Potatoes in 3 cm chunks, oil and salt, 200 °C for 35–40 min. Own tray.',
   'Brown the mince in a dry hot pan. Do not stir it for the first two minutes — let it catch.',
   'Onion and garlic in, then the spinach straight from frozen. Cook until the water has gone, otherwise it waters down the whole pan.',
   'Nutmeg, salt, pepper. The nutmeg is not optional; it is the difference between this and hospital food.'],
 tip:'1.2 kg of spinach sounds absurd and cooks down to about 300 g. It fills half the plate for 270 kcal across four portions.'},

{id:'b3',name:'Slanutak curry',tag:'Chickpea, spinach & chicken curry',mins:35,serv:5,
 ing:[[720,'Chicken breast, diced'],[720,'Chickpeas, drained'],[800,'Frozen spinach'],[600,'Passata'],
      [200,'Milk'],[25,'Olive oil'],[18,'Curry powder + cumin'],[15,'Garlic'],[240,'Rice, dry']],
 steps:['Bloom the curry powder, cumin and garlic in the oil for 30 seconds before anything else. Skip this and the whole thing tastes flat.',
   'Chicken in, sear, then chickpeas, spinach and passata.',
   'Simmer 15 min. Milk at the very end for body — never boil it after that or it splits.',
   'Rice boiled separately, 12 min lid on, 5 min off the heat.'],
 tip:'The best-tasting thing in the rotation and it freezes perfectly. Make a double batch when you are short on Sundays.'},

{id:'b4',name:'Protein zobena kaša',tag:'Protein oats, 5 minutes',mins:5,serv:1,
 ing:[[70,'Oats'],[250,'Milk'],[30,'Whey protein'],[120,'Banana'],[15,'Peanut butter']],
 steps:['Oats and milk in a pan, 3–4 min on medium, stirring.',
   'Off the heat, then the whey. Stir it in off the heat — boiling whey turns it grainy and no amount of stirring fixes it.',
   'Banana sliced on top, peanut butter melted through.'],
 tip:'Make it in a jar the night before with cold milk if mornings are tight. Overnight oats land on identical numbers. Drop to 50 g oats for a ~600 kcal version.'},

{id:'b5',name:'Skyr puding',tag:'Night snack, no cooking',mins:2,serv:1,
 ing:[[250,'Skyr / posni sir'],[10,'Almonds, chopped'],[5,'Cocoa powder'],[100,'Frozen berries'],[2,'Cinnamon']],
 steps:['Cocoa and cinnamon stirred into the skyr first, dry, or it clumps.',
   'Berries in straight from frozen — they thaw in about ten minutes and turn the whole thing cold and thick.',
   'Almonds on top.'],
 tip:'Slow-digesting casein before bed genuinely helps overnight repair. This is the meal you drop first on rest days.'},

{id:'b6',name:'Tuna i grah',tag:'Desk lunch, zero cooking',mins:5,serv:1,
 ing:[[220,'Tuna in brine, drained'],[180,'Beans, drained'],[150,'Tomato, cucumber, onion'],
      [10,'Olive oil'],[20,'Lemon juice'],[5,'Parsley, salt, pepper']],
 steps:['Drain and rinse the beans properly — that is most of the reason tinned beans cause trouble.',
   'Everything in a bowl, oil and lemon last.'],
 tip:'67 g of protein with no pan and no fridge. Keep the tins in your desk drawer for the day the prep runs out.'},

{id:'b7',name:'Proteinske palačinke',tag:'Protein pancakes',mins:12,serv:1,
 ing:[[60,'Oats, blitzed to flour'],[30,'Whey protein'],[100,'Egg, ~2'],[150,'Skyr'],[4,'Baking powder']],
 steps:['Blitz the oats to a rough flour, then everything into one bowl. Let the batter sit 5 minutes — it thickens and holds together far better.',
   'Medium-low heat, non-stick, no oil. Small pancakes; big ones fall apart.',
   'Flip when the surface stops looking wet.'],
 tip:'Higher heat is the only way to get this wrong. They burn outside and stay raw inside.'}
];

/* ==========================================================
   RECIPE MATH
   ========================================================== */
function foodByName(n){
  const q=String(n).toLowerCase();
  return FOODS.find(f=>f[0].toLowerCase().includes(q)) ||
         FOODS.find(f=>q.includes(f[0].split(' ·')[0].toLowerCase()));
}
function recipeMacros(r){
  let k=0,p=0,c=0,f=0;
  (r.ing||[]).forEach(row=>{
    const g=+row[0]||0;
    if(row.length>=6){ k+=g*row[2]/100; p+=g*row[3]/100; c+=g*row[4]/100; f+=g*row[5]/100; return; }
    const hit=foodByName(row[1]);
    if(hit){k+=g*hit[1]/100;p+=g*hit[2]/100;c+=g*hit[3]/100;f+=g*hit[4]/100}
  });
  const s=Math.max(1,+r.serv||1);
  return {k:Math.round(k),p:Math.round(p),c:Math.round(c),f:Math.round(f),
          ks:Math.round(k/s),ps:Math.round(p/s),cs:Math.round(c/s),fs:Math.round(f/s)};
}
const allRecipes=()=>[...(S.recipes||[]).map(r=>({...r,mine:true})),...BUILTIN];

/* ==========================================================
   DRAWER
   ========================================================== */
let drawerQ='';
function openDrawer(){$('#drawer').classList.add('on');$('#scrim').classList.add('on');renderDrawer()}
function closeDrawer(){$('#drawer').classList.remove('on');$('#scrim').classList.remove('on')}
function renderDrawer(){
  const q=drawerQ.toLowerCase();
  const list=allRecipes().filter(r=>!q||r.name.toLowerCase().includes(q)||(r.tag||'').toLowerCase().includes(q));
  const mine=list.filter(r=>r.mine), theirs=list.filter(r=>!r.mine);
  const row=r=>{const m=recipeMacros(r);
    return `<button class="drow" data-id="${r.id}">
      <b>${esc(r.name)}</b><em>${esc(r.tag||'')}</em>
      <span>${m.ks} kcal · ${m.ps} g P${r.serv>1?' · per serving':''}</span></button>`};
  $('#drawerList').innerHTML=
    `<div class="dsec">Mine (${mine.length})</div>`+
    (mine.length?mine.map(row).join(''):'<div class="empty" style="padding:14px">Nothing yet. The + button below builds one.</div>')+
    `<div class="dsec">Built in (${theirs.length})</div>`+theirs.map(row).join('');
  $$('#drawerList .drow').forEach(b=>b.onclick=()=>{openRecipe(b.dataset.id);closeDrawer()});
}

/* ==========================================================
   RECIPE VIEW
   ========================================================== */
function openRecipe(id){
  const r=allRecipes().find(x=>x.id===id); if(!r)return;
  const m=recipeMacros(r), fu=U.fU();
  $('#recipeOut').innerHTML=`
    <div class="card glow-vio">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
        <div><b style="font-size:17px;letter-spacing:-.3px">${esc(r.name)}</b>
          <div class="tiny">${esc(r.tag||'')}${r.mins?' · '+r.mins+' min':''} · ${r.serv} serving${r.serv>1?'s':''}</div></div>
        ${r.mine?`<button class="btn red" style="width:auto;padding:8px 12px;font-size:12px" onclick="deleteRecipe('${r.id}')">Delete</button>`:''}
      </div>
      <div class="kpis" style="margin:12px 0 0">
        <div class="kpi"><b>${m.ks}</b><span>kcal / serv</span></div>
        <div class="kpi"><b>${m.ps} g</b><span>protein</span></div>
        <div class="kpi"><b>${m.cs} g</b><span>carbs</span></div>
        <div class="kpi"><b>${m.fs} g</b><span>fat</span></div>
      </div>
    </div>
    <h2>Ingredients${r.serv>1?' — whole batch':''}</h2>
    <div class="card">
      ${(r.ing||[]).map(x=>`<div class="ing"><span>${esc(x[1])}</span><i>${U.fOut(+x[0])} ${fu}</i></div>`).join('')}
      ${r.water?`<div class="ing"><span>${esc(r.water)}</span><i></i></div>`:''}
      <button class="btn ghost" style="margin-top:12px" onclick="recipeToShop('${r.id}')">Add ingredients to my shopping list</button>
    </div>
    ${(r.steps&&r.steps.length)?`<h2>Method</h2><div class="card">${r.steps.map((s,i)=>
      `<div style="display:flex;gap:11px;padding:9px 0;border-bottom:1px solid var(--line2)">
        <b style="color:var(--vio);min-width:16px">${i+1}</b><div style="flex:1;font-size:13px;line-height:1.55">${esc(s)}</div></div>`).join('')}</div>`:''}
    ${r.tip?`<div class="note v"><b>Worth knowing.</b> ${esc(r.tip)}</div>`:''}`;
  $('#recipeBrowse').style.display='none';
  $('#recipeEdit').style.display='none';
  $('#recipeOut').style.display='';
}
function backToRecipes(){
  $('#recipeOut').style.display='none';
  $('#recipeEdit').style.display='none';
  $('#recipeBrowse').style.display='';
  renderRecipeBrowse();
}
function renderRecipeBrowse(){
  const list=allRecipes();
  $('#recipeBrowse').innerHTML=`
    <div class="card" style="display:flex;gap:9px">
      <button class="btn neon" onclick="newRecipe()">Build a recipe</button>
      <button class="btn ghost" style="width:auto;padding:12px 15px;white-space:nowrap" onclick="openDrawer()">All ${list.length}</button>
    </div>
    ${list.map(r=>{const m=recipeMacros(r);
      return `<div class="meal"><div class="mh" onclick="openRecipe('${r.id}')">
        <div class="time">${r.mine?'MINE':'BUILT'}</div>
        <div class="t"><b>${esc(r.name)}</b><em>${esc(r.tag||'')}${r.mins?' · '+r.mins+' min':''}</em></div>
        <div class="mac">${m.ks}<span>${m.ps} g P</span></div></div></div>`}).join('')}`;
}
function deleteRecipe(id){
  if(!confirm('Delete this recipe?'))return;
  S.recipes=(S.recipes||[]).filter(r=>r.id!==id); save(); backToRecipes();
}

/* ==========================================================
   RECIPE EDITOR
   ========================================================== */
let draft=null;
function newRecipe(){
  draft={id:'u'+Date.now(),name:'',tag:'',mins:'',serv:1,ing:[],steps:[]};
  renderEditor();
}
function renderEditor(){
  $('#recipeBrowse').style.display='none';
  $('#recipeOut').style.display='none';
  const e=$('#recipeEdit'); e.style.display='';
  const m=recipeMacros(draft), fu=U.fU();
  e.innerHTML=`
    <div class="card">
      <label>Name</label><input id="rName" value="${esc(draft.name)}" placeholder="Grah s kobasicom">
      <div style="height:10px"></div>
      <div class="cmp" style="gap:10px">
        <div><label>Short description</label><input id="rTag" value="${esc(draft.tag)}" placeholder="Sunday batch, freezes well"></div>
        <div><label>Servings</label><input id="rServ" type="number" inputmode="numeric" min="1" value="${draft.serv}"></div>
      </div>
    </div>

    <h2>Ingredients</h2>
    <div class="card tight">
      ${draft.ing.length?draft.ing.map((x,i)=>`
        <div class="item"><div class="t"><b>${esc(x[1])}</b><em>${x.length>=6?'custom':'from the food table'} · ${Math.round(x[0]*(x.length>=6?x[2]:(foodByName(x[1])||[0,0])[1])/100)} kcal</em></div>
          <div class="q">${U.fOut(+x[0])} ${fu}</div>
          <button class="btn red" style="width:auto;padding:6px 10px;font-size:12px" onclick="dropIng(${i})">✕</button></div>`).join('')
        :'<div class="empty">No ingredients yet.</div>'}
    </div>

    <div class="card">
      <label>Find a food</label>
      <input id="fq" placeholder="chicken, leća, skyr…" oninput="searchFoods(this.value)">
      <div id="fres"></div>
      <div style="height:12px"></div>
      <button class="btn ghost" onclick="offSearch()">Search Open Food Facts (needs signal)</button>
      <div class="hint" style="margin-top:8px">The offline table covers raw staples. Open Food Facts covers barcoded supermarket products — useful for a specific Lidl tub, useless for "chicken breast".</div>
      <div style="height:12px"></div>
      <button class="btn ghost" onclick="manualFood()">Enter macros by hand instead</button>
    </div>

    <h2>Method</h2>
    <div class="card">
      <textarea id="rSteps" placeholder="One step per line.">${esc((draft.steps||[]).join('\n'))}</textarea>
    </div>

    <div class="card glow-lime">
      <div class="kpis" style="margin:0">
        <div class="kpi"><b>${m.ks}</b><span>kcal / serv</span></div>
        <div class="kpi"><b>${m.ps} g</b><span>protein</span></div>
        <div class="kpi"><b>${m.cs} g</b><span>carbs</span></div>
        <div class="kpi"><b>${m.fs} g</b><span>fat</span></div>
      </div>
    </div>
    <button class="btn" onclick="saveRecipe()">Save recipe</button>
    <div style="height:9px"></div>
    <button class="btn ghost" onclick="backToRecipes()">Cancel</button>`;
}
function grabDraft(){
  if(!$('#rName'))return;
  draft.name=$('#rName').value.trim(); draft.tag=$('#rTag').value.trim();
  draft.serv=Math.max(1,+$('#rServ').value||1);
  draft.steps=$('#rSteps').value.split('\n').map(s=>s.trim()).filter(Boolean);
}
function dropIng(i){grabDraft();draft.ing.splice(i,1);renderEditor()}
function searchFoods(q){
  q=q.trim().toLowerCase();
  if(!q){$('#fres').innerHTML='';return}
  const hits=FOODS.filter(f=>f[0].toLowerCase().includes(q)).slice(0,8);
  $('#fres').innerHTML=hits.length?hits.map(f=>
    `<button class="drow" style="width:100%" onclick="addIng('${esc(f[0]).replace(/'/g,"\\'")}',${f[1]},${f[2]},${f[3]},${f[4]})">
      <b>${esc(f[0])}</b><span>${f[1]} kcal · ${f[2]} P · ${f[3]} C · ${f[4]} F per 100 g</span></button>`).join('')
    :'<div class="hint" style="padding:9px 0">Nothing in the offline table. Try Open Food Facts, or enter it by hand.</div>';
}
function addIng(name,k,p,c,f){
  grabDraft();
  const g=prompt('How many grams of '+name+'?','100');
  if(g===null)return;
  const n=parseFloat(g); if(isNaN(n)||n<=0)return;
  draft.ing.push([n,name,k,p,c,f]);
  renderEditor();
}
function manualFood(){
  grabDraft();
  const name=prompt('Ingredient name'); if(!name)return;
  const g=parseFloat(prompt('Grams','100')); if(isNaN(g))return;
  const k=parseFloat(prompt('kcal per 100 g','0'))||0;
  const p=parseFloat(prompt('Protein g per 100 g','0'))||0;
  const c=parseFloat(prompt('Carbs g per 100 g','0'))||0;
  const f=parseFloat(prompt('Fat g per 100 g','0'))||0;
  draft.ing.push([g,name,k,p,c,f]);
  renderEditor();
}
function offSearch(){
  grabDraft();
  const q=prompt('Product name or barcode');
  if(!q)return;
  const box=$('#fres'); box.innerHTML='<div class="hint" style="padding:9px 0">Searching Open Food Facts…</div>';
  const isCode=/^\d{6,14}$/.test(q.trim());
  const url=isCode
    ? `https://world.openfoodfacts.org/api/v2/product/${q.trim()}.json?fields=product_name,brands,nutriments`
    : `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=10&fields=product_name,brands,nutriments`;
  fetch(url).then(r=>r.json()).then(j=>{
    const prods=isCode?(j.product?[j.product]:[]):(j.products||[]);
    const rows=prods.map(pr=>{
      const n=pr.nutriments||{};
      const k=Math.round(n['energy-kcal_100g']||0), p=+(n.proteins_100g||0), c=+(n.carbohydrates_100g||0), f=+(n.fat_100g||0);
      if(!k&&!p)return '';
      const nm=((pr.brands?pr.brands.split(',')[0]+' ':'')+(pr.product_name||'Unnamed')).slice(0,52);
      return `<button class="drow" style="width:100%" onclick="addIng('${esc(nm).replace(/'/g,"\\'")}',${k},${p},${c},${f})">
        <b>${esc(nm)}</b><span>${k} kcal · ${p} P · ${c} C · ${f} F per 100 g</span></button>`;
    }).filter(Boolean);
    box.innerHTML=rows.length?rows.join(''):'<div class="hint" style="padding:9px 0">No usable result. Crowd-sourced data — plenty of products have no nutrition filled in. Enter it by hand from the label.</div>';
  }).catch(()=>{
    box.innerHTML='<div class="hint" style="padding:9px 0">Could not reach Open Food Facts. No signal, or Brave Shields is blocking it. The offline table and manual entry both still work.</div>';
  });
}
function saveRecipe(){
  grabDraft();
  if(!draft.name){alert('Give it a name first.');return}
  if(!draft.ing.length){alert('Add at least one ingredient.');return}
  S.recipes=S.recipes||[];
  const i=S.recipes.findIndex(r=>r.id===draft.id);
  if(i>=0)S.recipes[i]=draft; else S.recipes.push(draft);
  save(); openRecipe(draft.id);
}

/* ==========================================================
   MY SHOPPING LIST
   ========================================================== */
function renderMyShop(){
  S.myshop=S.myshop||[];
  $('#myShopList').innerHTML= S.myshop.length? S.myshop.map((it,i)=>
    `<div class="item ${it.done?'on':''}" data-i="${i}"><div class="b"></div>
      <div class="t"><b>${esc(it.n)}</b>${it.note?`<em>${esc(it.note)}</em>`:''}</div>
      <div class="q">${esc(it.q||'')}${it.p?`<span>€${(+it.p).toFixed(2)}</span>`:''}</div>
      <button class="btn red" style="width:auto;padding:6px 10px;font-size:12px" onclick="dropMy(${i})">✕</button></div>`).join('')
    :'<div class="empty">Nothing added.<br>Anything you add here sits alongside the generated week list.</div>';
  $$('#myShopList .item').forEach(el=>el.onclick=ev=>{
    if(ev.target.tagName==='BUTTON')return;
    const i=+el.dataset.i; S.myshop[i].done=!S.myshop[i].done; save(); renderMyShop();
  });
  const t=S.myshop.filter(x=>!x.done).reduce((a,b)=>a+(+b.p||0),0);
  $('#myShopTotal').textContent=t?'€'+t.toFixed(2)+' still to buy':'';
}
function addMy(){
  const n=$('#myN').value.trim(); if(!n)return;
  S.myshop=S.myshop||[];
  S.myshop.push({n,q:$('#myQ').value.trim(),p:parseFloat($('#myP').value)||0,done:false});
  $('#myN').value='';$('#myQ').value='';$('#myP').value='';
  save(); renderMyShop();
}
function dropMy(i){S.myshop.splice(i,1);save();renderMyShop()}
function clearMyDone(){S.myshop=(S.myshop||[]).filter(x=>!x.done);save();renderMyShop()}
function recipeToShop(id){
  const r=allRecipes().find(x=>x.id===id); if(!r)return;
  S.myshop=S.myshop||[];
  let added=0;
  (r.ing||[]).forEach(x=>{
    if(S.myshop.some(m=>m.n.toLowerCase()===String(x[1]).toLowerCase()&&!m.done))return;
    S.myshop.push({n:x[1],q:U.fOut(+x[0])+' '+U.fU(),p:0,note:'for '+r.name,done:false}); added++;
  });
  save();
  alert(added?added+' ingredient'+(added===1?'':'s')+' added to your list.':'Everything from this recipe is already on your list.');
}

/* ==========================================================
   SETTINGS — theme and units
   ========================================================== */
function applyTheme(){
  const t=S.settings.theme;
  const dark = t==='dark' || (t==='auto' && !(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches));
  document.documentElement.setAttribute('data-theme',dark?'dark':'light');
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.setAttribute('content',dark?'#07080F':'#F3F4FA');
}
function renderSettings(){
  const seg=(id,val,opts)=>`<div class="seg" data-set="${id}">`+
    opts.map(([v,l])=>`<button data-v="${v}" class="${val===v?'on':''}">${l}</button>`).join('')+`</div>`;
  $('#settingsBox').innerHTML=
    `<label>Appearance</label>${seg('theme',S.settings.theme,[['dark','Dark'],['light','Light'],['auto','Match phone']])}
     <label style="margin-top:14px">Body weight & lifting</label>${seg('mass',S.settings.mass,[['kg','Kilograms'],['lb','Pounds']])}
     <label style="margin-top:14px">Waist & height</label>${seg('len',S.settings.len,[['cm','Centimetres'],['in','Inches']])}
     <label style="margin-top:14px">Food weights</label>${seg('food',S.settings.food,[['g','Grams'],['oz','Ounces']])}
     <div class="hint" style="margin-top:12px">Everything is stored in metric and converted on screen, so switching back and forth never corrupts what you already logged.</div>`;
  $$('#settingsBox .seg').forEach(sg=>sg.querySelectorAll('button').forEach(b=>b.onclick=()=>{
    S.settings[sg.dataset.set]=b.dataset.v; save();
    applyTheme(); renderSettings(); renderAll();
    if($('#recipeBrowse').style.display!=='none')renderRecipeBrowse();
  }));
}
