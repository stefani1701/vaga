/* ==========================================================
   PROGRAM DATA
   Plain arrays. Edit these to change the plan — no build step.
   ========================================================== */
const DAILY=[
  {k:'creatine',t:'Creatine 5 g'},
  {k:'protein',t:'Protein hit'},
  {k:'water',t:'3 L water'},
  {k:'steps',t:'8–10k steps'},
  {k:'sleep',t:'7+ h sleep'},
  {k:'log',t:'Logged the session'}
];

/* cable:true = deliberately on a cable. heavy:true = must stay free weight. */
const TRAIN={
  upperA:{name:'Upper A',sub:'chest & shoulder led',day:1,ex:[
    {n:'Barbell Bench Press',c:'Blades pinned back and down, feet planted, bar to lower chest.',s:4,r:'5–8',rest:180,heavy:1,
     why:'Stays barbell. No cable press loads heavy enough to drive the strength everything else grows on.'},
    {n:'Lat Pulldown',c:'Full stretch at the top, drive elbows down and back.',s:4,r:'6–10',rest:150,cable:1,
     why:'Cable by definition. Swap in weighted pull-ups whenever you can get 8 clean reps.'},
    {n:'Incline Dumbbell Press',c:'30–45° bench. This is the upper-chest builder.',s:3,r:'8–12',rest:120,
     why:'Cable incline press works fine here if your gym has adjustable pulleys — pick whichever feels better on the shoulder.'},
    {n:'Seated Cable Row',c:'Chest up, pull to the belly, no leaning back.',s:3,r:'10–12',rest:120,cable:1},
    {n:'Cable Lateral Raise',c:'One arm at a time, cable behind you, elbow leads.',s:4,r:'12–20',rest:70,cable:1,
     why:'Better than dumbbells here — dumbbells have almost no tension at the bottom, the cable has it everywhere.'},
    {n:'Cable Triceps Pushdown',c:'Superset with the next one to save time.',s:3,r:'10–15',rest:60,cable:1},
    {n:'Cable Crunch',c:'Kneel, rope behind the head, curl the ribs toward the hips.',s:3,r:'12–15',rest:60,cable:1,
     why:'The one ab exercise you can actually add weight to. Beats planks for building a thicker core.'}
  ]},
  lowerA:{name:'Lower A',sub:'squat led',day:2,ex:[
    {n:'Barbell Back Squat',c:'Depth first, load second.',s:4,r:'5–8',rest:180,heavy:1},
    {n:'Romanian Deadlift',c:'Leave 3 in the tank — Friday is the heavy hinge day.',s:3,r:'8–10',rest:150,heavy:1,
     why:'Cable pull-throughs are a decent alternative but the stack runs out long before your hamstrings do.'},
    {n:'Leg Press',c:'Feet mid-platform, 2 s down, no hard lockout.',s:3,r:'10–15',rest:120},
    {n:'Lying Leg Curl',c:'Slow on the way down.',s:3,r:'10–15',rest:90},
    {n:'Standing Calf Raise',c:'Full stretch at the bottom, 1 s pause at the top.',s:4,r:'10–15',rest:90},
    {n:'Cable Crunch',c:'Same as Monday — this is your loaded ab work.',s:3,r:'12–15',rest:60,cable:1}
  ]},
  upperB:{name:'Upper B',sub:'back & overhead led',day:4,ex:[
    {n:'Overhead Press',c:'Barbell or dumbbells, seated or standing. Glutes tight, no leaning back.',s:4,r:'5–8',rest:180,heavy:1},
    {n:'Chest-Supported Row',c:'Machine, or a cable row with a chest pad. Barbell row if neither exists.',s:4,r:'6–10',rest:150,cable:1,
     why:'Chest-supported removes the lower back from the equation, so the back actually gets the stimulus.'},
    {n:'Incline Cable or DB Press',c:'Different angle to Monday. Chase reps, not weight.',s:3,r:'8–12',rest:120},
    {n:'Wide-Grip Lat Pulldown',c:'Chest up, elbows down and back.',s:3,r:'10–15',rest:90,cable:1},
    {n:'Cable Face Pull',c:'High pulley, rope, pull to the forehead, thumbs back.',s:3,r:'15–20',rest:60,cable:1,
     why:'Rear delts plus posture. You sit at a desk eight hours a day — this matters more than it looks.'},
    {n:'Cable Lateral Raise',c:'Second dose of the week. Light and strict.',s:3,r:'12–20',rest:60,cable:1},
    {n:'Cable Curl → Cable Overhead Extension',c:'Superset, 3 rounds, minimal rest between the two.',s:3,r:'10–12',rest:70,cable:1,
     why:'Cables win on both — constant tension on the curl, and the overhead extension is far kinder to the elbows than a barbell.'}
  ]},
  lowerB:{name:'Lower B',sub:'hinge led',day:5,ex:[
    {n:'Deadlift',c:'Conventional or trap bar. Reset every rep, no bouncing.',s:3,r:'3–5',rest:210,heavy:1,
     why:'Trap bar is easier on the lower back and just as effective — use it if your gym has one.'},
    {n:'Bulgarian Split Squat',c:'Per leg. Brutal, humbling, best single-leg builder here.',s:3,r:'8–12',rest:120,heavy:1},
    {n:'Leg Extension',c:'1 s squeeze at the top.',s:3,r:'12–15',rest:90},
    {n:'Seated Leg Curl',c:'Trains the hamstring at longer lengths than the lying version.',s:3,r:'12–15',rest:90},
    {n:'Calf Raise',c:'Machine or seated.',s:4,r:'12–20',rest:60},
    {n:'Cable Woodchop',c:'High to low, then low to high. Rotate through the torso, not the arms.',s:3,r:'12–15',rest:60,cable:1}
  ]}
};
const DAYMAP={1:'upperA',2:'lowerA',4:'upperB',5:'lowerB'};

/* ---------- 4-WEEK MEAL ROTATION ---------- */
const M=(time,name,sub,kcal,p,items,how)=>({time,name,sub,kcal,p,items,how});

const WEEKS=[
{
 name:'Week 1 · Piletina & krumpir',
 tag:'The baseline. Roast chicken, potatoes, mince and rice.',
 kcal:2425,p:193,
 note:'<b>Why this rotation exists:</b> four weeks means nothing repeats until day 29, which is roughly the point at which most people quit meal prep out of boredom. The macros are near-identical across all four weeks — only the food changes.',
 meals:[
  M('08:00','Eggs, quark and toast','Breakfast',550,43,
   [['3','Eggs, whole'],['200 g','Posni sir / skyr'],['45 g','Rye bread, 1 slice'],['1','Banana']],
   'Non-stick pan, 1 tsp oil max, low heat — pull the eggs while still slightly wet. <b>Hate eggs in the morning?</b> 70 g oats in 250 ml milk + 30 g whey + banana lands on the same numbers.'),
  M('13:00','Roast chicken & potatoes','Prepped lunch',660,57,
   [['200 g raw','Chicken breast (→150 g cooked)'],['350 g raw','Potatoes, skin on'],['200 g','Frozen veg, microwaved fresh'],['1 tbsp','Olive oil, across the tray']],
   'Roasted Sunday, chicken and potatoes on <b>separate trays</b> at 200 °C — mixed together the chicken steams instead of browning. Pull the chicken slightly early; it cooks a second time when you reheat it, and that\'s what makes prepped chicken dry. <b>Never prep the veg</b> — microwave 200 g from frozen each morning, 4 min, into the box.'),
  M('16:30','Quark, apple, honey','Pre-workout',295,25,
   [['250 g','Posni sir / skyr'],['1','Apple'],['20 g','Honey'],['5 g','Creatine, in water']],
   'Fast carbs 60–90 min before lifting measurably improve session quality. Take the creatine here — anchoring it to a fixed meal is how you stop forgetting it.'),
  M('19:45','Mince, rice, passata','Post-gym dinner',740,48,
   [['200 g raw','Mince, ≤10% fat'],['70 g dry','Rice'],['150 g','Passata + ½ onion'],['150 g','Fresh salad + 1 tsp oil']],
   '<b>Weigh the rice dry</b> — cooked weight swings wildly with how much water it took. Buying 15–20% mince? Drain the fat after browning, or add ~120 kcal. Add sauce <i>after</i> reheating, never before storage.'),
  M('21:30','Quark and walnuts','Night snack — skip on rest days',180,20,
   [['200 g','Posni sir + cinnamon'],['10 g','Walnuts or almonds']],
   'Slow protein before bed helps overnight repair. Dropping this is most of your rest-day reduction, done.')
 ],
 prep:['<b>0:00</b> Oven to 200 °C. Cut 1 kg chicken into even 3 cm pieces — even size is why it cooks evenly. Oil, paprika, garlic powder, salt.',
  '<b>0:15</b> Cut 1.75 kg potatoes, skin on, 3 cm chunks. Own bowl, own oil, own tray.',
  '<b>0:25</b> Both trays in. Meanwhile brown 1 kg mince with 2 onions, add 400 g passata, simmer 15 min. Boil 350 g dry rice in parallel.',
  '<b>0:45</b> Chicken out. Potatoes get 15–20 min more.',
  '<b>0:45–1:05</b> <b>Cool everything spread out on trays.</b> Hot food into the fridge warms everything else into the danger zone.',
  '<b>1:05</b> Box it. Label MON / TUE / WED to the fridge, <b>THU and FRI straight to the freezer.</b> Cooked chicken and rice are safe 3 days at 4 °C, not 5.']
},
{
 name:'Week 2 · Crvena leća & špinat',
 tag:'Red lentils and spinach. Cheapest week of the four.',
 kcal:2410,p:184,
 note:'<b>On lentil protein:</b> plant protein is digested slightly less efficiently than meat or dairy, so each lentil meal here is paired with rice, egg or dairy in the same sitting — that combination closes the gap completely. <b>On spinach:</b> its iron absorbs poorly on its own, so the lemon and the passata in these meals are doing real work, not garnish.',
 meals:[
  M('08:00','Oats, whey, peanut butter','Breakfast',560,42,
   [['70 g','Oats'],['250 ml','Milk'],['30 g','Whey protein'],['1','Banana'],['15 g','Peanut butter']],
   'Cook the oats in the milk, stir the whey in <b>after</b> it comes off the heat — boiling whey turns it grainy. Make it the night before in a jar if mornings are tight; overnight oats work identically.'),
  M('13:00','Red lentil & chicken thigh stew','Prepped lunch',680,52,
   [['80 g dry','Red lentils (crvena leća)'],['180 g raw','Chicken thigh, boneless'],['1','Onion + 2 cloves garlic'],['150 g','Passata'],['1 tsp','Cumin + paprika'],['½','Lemon, squeezed at the end']],
   'Red lentils need <b>no soaking and 15 minutes</b>, which is why they\'re in here. Brown the diced thigh, add onion and garlic, then lentils, passata and 500 ml water per 80 g of lentils. Simmer until it thickens. Thigh instead of breast on purpose — it reheats without going dry and it\'s ~€2.50/kg cheaper. Lemon goes in off the heat.'),
  M('16:30','Quark and fruit','Pre-workout',290,25,
   [['250 g','Posni sir / skyr'],['1','Apple or pear'],['5 g','Creatine, in water']],''),
  M('19:45','Turkey mince with spinach','Post-gym dinner',700,46,
   [['200 g raw','Turkey or beef mince'],['300 g','Frozen spinach'],['400 g raw','Potatoes'],['1 tbsp','Olive oil'],['pinch','Nutmeg, salt, black pepper']],
   'Brown the mince, add the spinach <b>straight from frozen</b> and let the water cook off — otherwise it waters the whole pan down. Nutmeg with spinach is not optional, it\'s the difference between this being good and being hospital food. 300 g of spinach is about 65 kcal and fills half the plate.'),
  M('21:30','Quark','Night snack — skip on rest days',180,20,
   [['200 g','Posni sir + cinnamon'],['10 g','Almonds']],'')
 ],
 prep:['<b>0:00</b> Start the lentil stew: brown 900 g diced chicken thigh, then onions, garlic, 400 g dry red lentils, 3 tins passata, 2.5 L water, cumin and paprika. Simmer 25 min, stirring so it doesn\'t catch.',
  '<b>0:10</b> Oven 200 °C, 2 kg potatoes in for the dinners.',
  '<b>0:25</b> Second pan: brown 1 kg turkey mince, add 1.5 kg frozen spinach, cook the water off, season with nutmeg.',
  '<b>0:45</b> Lemon into the lentils off the heat. Everything out to cool, spread flat.',
  '<b>1:05</b> Box and label. MON–WED fridge, THU–FRI freezer. Lentil stew freezes and reheats better than any other meal in this plan.']
},
{
 name:'Week 3 · Riba, grah & blitva',
 tag:'Hake, beans and chard. The omega-3 week.',
 kcal:2390,p:181,
 note:'<b>Two oily-fish meals a week</b> is the one nutritional thing this plan adds that has nothing to do with recomp — frozen skuša and oslić are cheap in Croatia and you are almost certainly under on omega-3. <b>Beans:</b> if they wreck you the first week, that settles down in about 10 days as your gut adapts. Rinse tinned beans well, or soak dried ones overnight with a pinch of soda.',
 meals:[
  M('08:00','Eggs, tomato, bread','Breakfast',540,40,
   [['3','Eggs'],['200 g','Posni sir'],['1','Tomato'],['45 g','Bread']],''),
  M('13:00','Baked hake with blitva','Prepped lunch',640,52,
   [['250 g','Oslić / hake fillet, frozen'],['350 g raw','Potatoes'],['250 g','Blitva (chard) or spinach'],['2 cloves','Garlic'],['1 tbsp','Olive oil + lemon']],
   'Blitva sa krumpirom, basically. Boil the potatoes and chard together, drain, crush roughly with garlic and olive oil. Bake the hake <b>from frozen</b>, 200 °C, 20–22 min, lemon and salt only. <b>Prep this one only 2–3 days ahead</b> — fish holds worse than chicken, so cook Sunday for Mon–Wed and do a 15-minute Wednesday repeat for Thu–Fri.'),
  M('16:30','Tuna and quark','Pre-workout',300,30,
   [['1 tin','Tuna in brine, drained'],['150 g','Posni sir'],['1','Apple'],['5 g','Creatine']],''),
  M('19:45','Chicken with grah','Post-gym dinner',730,47,
   [['200 g raw','Chicken breast'],['180 g drained','Beans (grah), tinned or soaked'],['1','Onion, carrot, bay leaf'],['150 g','Salad + 1 tsp oil'],['1 tsp','Sweet paprika']],
   'Classic base: soften onion and carrot, paprika off the heat so it doesn\'t burn, beans, bay, water to cover, 20 min. Chicken cooked separately and stirred in at the end so it doesn\'t shred. Roughly 12 g of fibre per portion, which is about half your day — this is the meal that fixes the constipation problem high-protein diets cause.'),
  M('21:30','Quark','Night snack — skip on rest days',180,20,
   [['200 g','Posni sir + cinnamon'],['10 g','Walnuts']],'')
 ],
 prep:['<b>0:00</b> Oven 200 °C. 1.75 kg potatoes + 1.25 kg blitva on to boil together.',
  '<b>0:10</b> Grah on: onion, carrot, paprika, 900 g drained beans, bay, water. 25 min.',
  '<b>0:20</b> Hake for <b>Mon–Wed only</b> (750 g) into the oven from frozen, 22 min.',
  '<b>0:30</b> Poach or bake 600 g chicken breast for the grah portions.',
  '<b>0:45</b> Crush potatoes and chard with garlic and oil. Cool everything flat.',
  '<b>Wednesday, 15 min:</b> bake the remaining 500 g hake and boil the rest of the potatoes for Thu–Fri. Fish does not want to sit five days.']
},
{
 name:'Week 4 · Slanutak & puretina',
 tag:'Chickpeas, turkey and spinach curry.',
 kcal:2430,p:186,
 note:'<b>This is the week that tastes least like a diet,</b> which is deliberate — week 4 is where adherence usually collapses, so it gets the best food. Then you loop back to week 1 and the rotation starts again feeling almost new.',
 meals:[
  M('08:00','Skyr, oats, apple','Breakfast',545,41,
   [['250 g','Skyr / posni sir'],['50 g','Oats, raw, stirred in'],['1','Apple, grated'],['15 g','Peanut butter'],['1 tsp','Cinnamon']],
   'No cooking at all. Assemble it the night before and it turns into something closer to dessert by morning.'),
  M('13:00','Chickpea, spinach & chicken curry','Prepped lunch',690,53,
   [['180 g raw','Chicken breast or turkey'],['180 g drained','Chickpeas (slanutak)'],['200 g','Frozen spinach'],['150 ml','Passata + 50 ml milk'],['1 tbsp','Curry powder, cumin, garlic'],['60 g dry','Rice']],
   'Bloom the spices in the oil for 30 seconds before anything else goes in — that single step is most of the flavour difference between this and a bland version. Chickpeas, spinach and passata, simmer 15 min, milk at the end for body. Freezes and reheats better than almost anything else here.'),
  M('16:30','Eggs and fruit','Pre-workout',300,22,
   [['2','Boiled eggs'],['150 g','Skyr'],['1','Banana'],['5 g','Creatine']],
   'Boil a dozen eggs on Sunday and leave them in the fridge in the shell — they keep the full week that way.'),
  M('19:45','Mince, pasta, spinach','Post-gym dinner',720,50,
   [['200 g raw','Mince, ≤10%'],['80 g dry','Pasta (tjestenina)'],['200 g','Frozen spinach'],['150 g','Passata'],['15 g','Grated cheese']],
   'Same principle as the bolognese in week 1 but the spinach goes in with the passata and disappears completely into the sauce — an easy 200 g of vegetables you won\'t notice eating.'),
  M('21:30','Quark','Night snack — skip on rest days',175,20,
   [['200 g','Posni sir'],['10 g','Almonds']],'')
 ],
 prep:['<b>0:00</b> Bloom 3 tbsp curry powder, cumin and garlic in oil. Add 900 g diced chicken, 900 g chickpeas, 1 kg frozen spinach, 750 ml passata. Simmer 20 min, milk at the end.',
  '<b>0:15</b> Boil 300 g dry rice for the lunches. Boil 12 eggs in a second pan.',
  '<b>0:30</b> Second pan: 1 kg mince, 2 onions, 750 g passata, 1 kg frozen spinach. Simmer.',
  '<b>0:45</b> Cook 400 g dry pasta <b>just under</b> al dente — it finishes cooking when you reheat it, and that\'s the difference between pasta and paste on Wednesday.',
  '<b>1:00</b> Cool flat, box, label. MON–WED fridge, THU–FRI freezer.']
}
];

/* ---------- SHOPPING LISTS ---------- */
const SHOP=[
[['Protein',[['Chicken breast or thighs','1.5 kg',9.0,'Thighs ~€2.50/kg cheaper and reheat better'],['Mljeveno meso ≤10%','1.2 kg',8.2,''],['Posni sir / skyr','3.0 kg',10.0,'Buy 1 kg tubs — ~30% cheaper per kg'],['Jaja','30',5.0,''],['Tuna u vlastitom soku','4 tins',4.0,'Emergency desk lunches'],['Mlijeko','3 L',3.0,'']]],
 ['Carbs',[['Krumpir','3 kg',3.0,'The 5 kg sack is cheaper per kg'],['Riža','1 kg',2.0,''],['Zobene pahuljice','1 kg',1.5,''],['Kruh, raženi','1 loaf',1.8,'']]],
 ['Veg, fruit & fats',[['Smrznuto povrće','4 × 450 g',4.5,'No waste, half the price of fresh'],['Banane','1.5 kg',2.5,''],['Jabuke','1.5 kg',2.0,''],['Salata, rajčica, krastavac','mixed',4.0,''],['Luk','1 kg',1.2,''],['Passata','3 tins',2.5,''],['Ulje — maslinovo + suncokretovo','',2.5,'Sunflower to roast, olive for salads'],['Orasi / bademi + kikiriki maslac','',3.5,'Weigh these, don\'t spoon freely'],['Med','',1.5,''],['Začini','rotating',1.5,'']]]],

[['Protein',[['Chicken thighs, boneless','1.6 kg',8.0,'Thigh on purpose this week — it holds up in the stew'],['Turkey or beef mince','1.2 kg',8.2,''],['Posni sir / skyr','2.5 kg',8.5,''],['Whey protein','~200 g of a tub',4.0,'A 1–2 kg tub is the cheapest protein per gram you can buy'],['Mlijeko','4 L',4.0,''],['Jaja','20',3.5,'']]],
 ['Carbs & pulses',[['Crvena leća','800 g',2.0,'No soaking, 15 min to cook, ~24 g protein per 100 g dry'],['Krumpir','3 kg',3.0,''],['Zobene pahuljice','1 kg',1.5,''],['Riža','500 g',1.0,'']]],
 ['Veg, fruit & fats',[['Smrznuti špinat','4 × 450 g',5.0,'Frozen is nutritionally identical and a third of the price'],['Passata','5 tins',4.0,''],['Luk + češnjak','1 kg + 2 heads',2.5,''],['Limun','3',1.5,'Goes in the lentils off the heat — also helps you absorb the iron'],['Banane + jabuke','2.5 kg',4.0,''],['Salata','mixed',3.0,''],['Kikiriki maslac','1 jar',3.0,''],['Kumin, paprika, muškatni oraščić','',2.0,'']]]],

[['Protein',[['Oslić / hake fillets, frozen','1.3 kg',9.5,'Bake from frozen — never thaw it first'],['Chicken breast','1.0 kg',6.5,''],['Posni sir','2.5 kg',8.5,''],['Jaja','20',3.5,''],['Tuna u vlastitom soku','5 tins',5.0,''],['Skuša, frozen','2 fillets',3.0,'Optional — cheapest omega-3 in the shop']]],
 ['Carbs & pulses',[['Grah — tinned or dry','1 kg',3.0,'Dry is half the price if you remember to soak it'],['Krumpir','3.5 kg',3.5,''],['Kruh','1 loaf',1.8,''],['Riža ili ječam','500 g',1.5,'']]],
 ['Veg, fruit & fats',[['Blitva','1.3 kg',4.0,'Or frozen spinach if blitva is expensive that week'],['Češnjak','2 heads',1.5,''],['Mrkva + luk','1.5 kg',2.5,''],['Rajčica + salata','mixed',4.0,''],['Limun','4',2.0,''],['Jabuke + banane','2.5 kg',4.0,''],['Maslinovo ulje','',3.0,'This week actually uses it — buy decent oil'],['Lovorov list, slatka paprika','',1.5,'']]]],

[['Protein',[['Chicken breast or turkey','1.6 kg',9.5,''],['Mljeveno meso ≤10%','1.2 kg',8.2,''],['Skyr / posni sir','3.0 kg',10.0,''],['Jaja','30',5.0,'Boil a dozen Sunday, leave them in the shell'],['Ribani sir','200 g',2.5,'']]],
 ['Carbs & pulses',[['Slanutak','1 kg',3.0,''],['Tjestenina','500 g',1.2,''],['Riža','700 g',1.5,''],['Zobene pahuljice','700 g',1.2,'']]],
 ['Veg, fruit & fats',[['Smrznuti špinat','5 × 450 g',6.0,''],['Passata','5 tins',4.0,''],['Luk + češnjak','1 kg + 2 heads',2.5,''],['Jabuke + banane','2.5 kg',4.0,''],['Salata','mixed',3.5,''],['Kikiriki maslac','1 jar',3.0,''],['Curry, kumin, cimet','',2.5,''],['Ulje','',2.5,'']]]]
];
