(() => {
  'use strict';
  const STORAGE_KEY='vintracker_aventura_v1';
  const state=loadState();
  const screens=['home','game','library','badges'];
  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];

  const missions=[
    {id:'detect',level:1,icon:'🔎',title:'Detectá la vinchuca',desc:'Aprendé a reconocer pistas útiles sin confundirla con otros insectos.',tone:'mint',points:150,topic:'vinchuca'},
    {id:'house',level:1,icon:'🏠',title:'Casa segura',desc:'Encontrá posibles refugios y mejorá el entorno de la vivienda.',tone:'sky',points:180,topic:'prevencion'},
    {id:'route',level:2,icon:'🧬',title:'Ruta del Chagas',desc:'Diferenciá las vías reales de transmisión de los mitos.',tone:'sand',points:180,topic:'transmision'},
    {id:'clues',level:2,icon:'🕵️',title:'Cazadores de pistas',desc:'Reconocé señales que pueden sugerir presencia de vinchucas.',tone:'rose',points:160,topic:'vinchuca'},
    {id:'truth',level:3,icon:'⚡',title:'Verdadero o falso',desc:'Poné a prueba lo que sabés con afirmaciones rápidas.',tone:'mint',points:200,topic:'general'},
    {id:'pregnancy',level:4,icon:'🤰',title:'Misión embarazo',desc:'Aprendé por qué el control y diagnóstico oportuno importan.',tone:'sand',points:190,topic:'congenito'},
    {id:'clinic',level:4,icon:'🩺',title:'Caso comunitario',desc:'Elegí decisiones seguras ante una situación cotidiana.',tone:'sky',points:220,topic:'salud'},
    {id:'final',level:5,icon:'🏆',title:'Desafío final',desc:'Combiná todo lo aprendido para convertirte en VinTracker.',tone:'rose',points:300,topic:'general'}
  ];

  const library=[
    {id:'chagas',topic:'general',icon:'🧫',title:'¿Qué es el Chagas?',unlock:'detect',text:'La enfermedad de Chagas es una infección causada por el parásito Trypanosoma cruzi. Puede atravesar una fase aguda y luego una fase crónica; muchas personas pueden no presentar síntomas durante años.',bullets:['El diagnóstico se realiza en el sistema de salud.','El tratamiento antiparasitario es más eficaz cuando se inicia tempranamente.','En la fase crónica pueden aparecer problemas cardíacos, digestivos o neurológicos en una parte de las personas infectadas.']},
    {id:'vector',topic:'vinchuca',icon:'🪲',title:'La vinchuca y los triatominos',unlock:'detect',text:'Los triatominos son insectos hematófagos. En América Latina, algunas especies pueden transmitir T. cruzi cuando sus deyecciones infectadas entran en contacto con la picadura, mucosas o lesiones de la piel.',bullets:['Suelen permanecer ocultos durante el día y salir por la noche.','No toda chinche parecida es una vinchuca: la identificación debe confirmarse.','Una foto clara y el reporte del lugar ayudan a la vigilancia.']},
    {id:'home',topic:'prevencion',icon:'🏡',title:'Prevención en la vivienda',unlock:'house',text:'Reducir refugios y mejorar la vivienda disminuye el contacto entre las personas y los vectores.',bullets:['Reparar grietas en paredes, pisos y techos.','Mantener orden y limpieza.','Ubicar gallineros y corrales lo más alejados posible de la vivienda.','Revisar techos, muebles, rincones y estructuras cercanas.']},
    {id:'signs',topic:'vinchuca',icon:'🔍',title:'Señales de presencia',unlock:'clues',text:'Además de encontrar el insecto, algunas señales pueden alertar sobre la presencia de vinchucas en la vivienda o alrededor.',bullets:['Manchas oscuras de materia fecal.','Mudas o “pelechos”.','Huevos o ejemplares en grietas y escondites.']},
    {id:'trans',topic:'transmision',icon:'🔗',title:'Formas de transmisión',unlock:'route',text:'T. cruzi puede transmitirse de distintas maneras.',bullets:['Vectorial: por contaminación con deyecciones infectadas de triatominos.','Congénita: durante el embarazo o el parto.','Oral: por alimentos o bebidas contaminados.','Transfusional, trasplantes y accidentes de laboratorio: hoy menos frecuentes donde existen controles adecuados.']},
    {id:'congenital',topic:'congenito',icon:'👶',title:'Chagas congénito',unlock:'pregnancy',text:'Una persona embarazada con infección por T. cruzi puede transmitirla durante el embarazo o el parto.',bullets:['El control durante el embarazo permite identificar situaciones de riesgo.','Los recién nacidos y otros hijos de madres infectadas deben acceder al diagnóstico según indicación sanitaria.','El diagnóstico temprano permite tratar oportunamente.']},
    {id:'diagnosis',topic:'salud',icon:'🧪',title:'Diagnóstico y atención',unlock:'clinic',text:'La app no diagnostica Chagas ni confirma si un insecto es una vinchuca. Ante riesgo o dudas, corresponde consultar al sistema de salud.',bullets:['El diagnóstico de infección se realiza con estudios específicos.','Las personas diagnosticadas necesitan evaluación, tratamiento cuando corresponda y seguimiento.','En Argentina, el diagnóstico y tratamiento están disponibles en el sistema de salud.']},
    {id:'action',topic:'prevencion',icon:'🫙',title:'Qué hacer si encontrás una vinchuca',unlock:'clinic',text:'La recomendación oficial en Argentina es evitar manipularla con la mano desnuda y, si es posible, conservarla para su identificación.',bullets:['No la pises ni la manipules directamente con la mano.','Si podés, atraparla viva usando pinza, guante o una bolsa como protección.','Guardarla en un recipiente seguro y llevarla a un centro de salud, municipio o puesto de notificación.']},
    {id:'myths',topic:'general',icon:'💬',title:'Mitos frecuentes',unlock:'truth',text:'Reconocer información incorrecta ayuda a prevenir mejor.',bullets:['El Chagas no se transmite por hablar, abrazar o compartir objetos cotidianos.','No toda persona infectada presenta síntomas visibles.','No toda chinche es una vinchuca y una app no reemplaza la identificación profesional.']},
    {id:'community',topic:'salud',icon:'🤝',title:'Vigilancia comunitaria',unlock:'final',text:'La participación comunitaria puede ayudar a detectar presencia de vectores, mejorar la educación sanitaria y acercar información útil a los equipos de salud.',bullets:['Observar y reportar no equivale a diagnosticar.','La privacidad de domicilios debe protegerse.','La educación y la comunicación son parte de las estrategias recomendadas de prevención.']}
  ];

  const badges=[
    {id:'first',icon:'🌱',title:'Primer paso',desc:'Completaste tu primera misión.',test:s=>s.completed.length>=1},
    {id:'observer',icon:'🔎',title:'Gran observador',desc:'Completaste las misiones de identificación.',test:s=>s.completed.includes('detect')&&s.completed.includes('clues')},
    {id:'guardian',icon:'🏠',title:'Guardián del hogar',desc:'Terminaste Casa segura.',test:s=>s.completed.includes('house')},
    {id:'scientist',icon:'🧬',title:'Ruta científica',desc:'Dominaste las formas de transmisión.',test:s=>s.completed.includes('route')&&s.completed.includes('truth')},
    {id:'community',icon:'🤝',title:'Comunidad que cuida',desc:'Resolviste el caso comunitario.',test:s=>s.completed.includes('clinic')},
    {id:'master',icon:'🏆',title:'VinTracker',desc:'Completaste todas las misiones.',test:s=>s.completed.length===missions.length}
  ];

  function loadState(){try{return {...{score:0,completed:[],daily:false},...JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}}catch{return {score:0,completed:[],daily:false}}}
  function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));renderAll()}
  function show(id){screens.forEach(s=>$('#'+s)?.classList.toggle('active',s===id));$$('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===id));window.scrollTo({top:0,behavior:'smooth'})}
  function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2200)}
  function completeMission(id,points){if(!state.completed.includes(id)){state.completed.push(id);state.score+=points;save();toast(`Misión completada: +${points} puntos`)}else{toast('Ya habías completado esta misión')};setTimeout(()=>show('home'),500)}
  function unlocked(info){return !info.unlock||state.completed.includes(info.unlock)}
  function renderAll(){
    $('#scoreTop').textContent=state.score;
    const unlockedBadges=badges.filter(b=>b.test(state)); $('#badgeCount').textContent=unlockedBadges.length;
    const p=Math.round(state.completed.length/missions.length*100); $('#progressBar').style.width=p+'%'; $('#percentText').textContent=p+'%'; $('#progressText').textContent=`${state.completed.length} de ${missions.length} misiones`;
    $('#missionGrid').innerHTML=missions.map(m=>`<button type="button" class="mission ${state.completed.includes(m.id)?'complete':''}" data-mission="${m.id}" data-tone="${m.tone}"><span class="mission-icon">${m.icon}</span><small>Nivel ${m.level}</small><b>${m.title}</b><p>${m.desc}</p><span class="state">${state.completed.includes(m.id)?'✓ Completa':'+'+m.points+' pts'}</span></button>`).join('');
    $$('[data-mission]').forEach(b=>b.addEventListener('click',()=>startMission(b.dataset.mission)));
    renderLibrary(); renderBadges();
    $('#dailyBtn').disabled=state.daily; $('#dailyBtn').textContent=state.daily?'Completado ✓':'Jugar';
    $('#continueBtn').textContent=state.completed.length?'Continuar aventura →':'Empezar aventura →';
  }
  function renderLibrary(topic='all'){
    const topics=[['all','Todos'],['general','General'],['vinchuca','Vinchuca'],['prevencion','Prevención'],['transmision','Transmisión'],['congenito','Congénito'],['salud','Salud']];
    $('#topicTabs').innerHTML=topics.map(([id,n])=>`<button type="button" data-topic="${id}" class="${id===topic?'active':''}">${n}</button>`).join('');
    $$('[data-topic]').forEach(b=>b.addEventListener('click',()=>renderLibrary(b.dataset.topic)));
    const items=library.filter(i=>topic==='all'||i.topic===topic);
    $('#libraryGrid').innerHTML=items.map(i=>{const ok=unlocked(i);return `<article class="info-card ${ok?'':'locked'}"><div class="info-icon">${ok?i.icon:'🔒'}</div><h3>${i.title}</h3>${ok?`<p>${i.text}</p><ul>${i.bullets.map(x=>`<li>${x}</li>`).join('')}</ul>`:`<p>Completá la misión correspondiente para desbloquear esta ficha.</p>`}</article>`}).join('');
  }
  function renderBadges(){
    $('#badgeGrid').innerHTML=badges.map(b=>{const ok=b.test(state);return `<article class="badge-card ${ok?'':'locked'}"><div class="badge-icon">${ok?b.icon:'🔒'}</div><h3>${b.title}</h3><p>${b.desc}</p></article>`}).join('')
  }

  function startMission(id){show('game'); const m=missions.find(x=>x.id===id); const c=$('#gameContainer');
    if(id==='detect') return quizGame(m,[
      ['¿Qué conviene hacer si encontrás un insecto sospechoso?',['Aplastarlo','Fotografiarlo y reportarlo','Tocarlo con la mano','Ignorarlo siempre'],1,'Una foto clara y el reporte ayudan a la vigilancia.'],
      ['¿La app puede confirmar por sí sola que es una vinchuca?',['Sí','No'],1,'La confirmación requiere revisión por personal capacitado.'],
      ['¿Cuándo suelen permanecer ocultos muchos triatominos?',['Durante el día','Solo al mediodía','Nunca se ocultan'],0,'Suelen ocultarse durante el día y salir por la noche.']
    ]);
    if(id==='house') return houseGame(m);
    if(id==='route') return classifyGame(m);
    if(id==='clues') return quizGame(m,[
      ['¿Cuál puede ser una señal de presencia de vinchucas?',['Manchas oscuras de materia fecal','Marcas de tiza','Hojas secas'],0,'Las manchas oscuras y las mudas pueden ser señales de alerta.'],
      ['¿Cómo se llaman las mudas que pueden encontrarse?',['Pelechos','Escamas','Semillas'],0,'En Argentina suelen llamarse “pelechos”.'],
      ['¿Dónde podrían encontrarse?',['Grietas y escondites','Solo dentro del agua','Únicamente en heladeras'],0,'Pueden refugiarse en grietas y otros espacios protegidos.']
    ]);
    if(id==='truth') return trueFalseGame(m);
    if(id==='pregnancy') return quizGame(m,[
      ['¿T. cruzi puede transmitirse durante el embarazo o el parto?',['Sí','No'],0,'La transmisión congénita es una vía reconocida.'],
      ['¿El diagnóstico del recién nacido puede ser importante si la madre tiene Chagas?',['Sí','No'],0,'El diagnóstico temprano permite atención y tratamiento oportunos.'],
      ['¿VinTracker reemplaza los controles de salud?',['Sí','No'],1,'La app es educativa y comunitaria; los controles corresponden al sistema de salud.']
    ]);
    if(id==='clinic') return scenarioGame(m);
    if(id==='final') return quizGame(m,[
      ['¿Qué causa el Chagas?',['Trypanosoma cruzi','Un virus','Una alergia'],0,'T. cruzi es el parásito causante.'],
      ['¿Cuál es una acción preventiva adecuada?',['Reparar grietas y ordenar el entorno','Acumular madera contra la pared','Mover gallineros dentro de la casa'],0,'Reducir refugios ayuda al control vectorial.'],
      ['¿Cuál es una vía reconocida de transmisión?',['Congénita','Abrazar a una persona','Compartir cubiertos'],0,'La transmisión congénita está reconocida.'],
      ['Si encontrás una vinchuca, ¿qué es más seguro?',['Manipularla con la mano desnuda','Conservarla de forma segura y notificar','Aplastarla inmediatamente'],1,'La recomendación oficial es evitar el contacto directo y facilitar su identificación.'],
      ['¿El mapa comunitario equivale a un mapa de diagnósticos?',['Sí','No'],1,'Los reportes comunitarios no equivalen a diagnósticos confirmados.']
    ]);
  }

  function gameHeader(m,subtitle){return `<div class="game-card"><span class="kicker">MISIÓN · NIVEL ${m.level}</span><h2 id="gameTitle">${m.icon} ${m.title}</h2><p class="game-intro">${subtitle||m.desc}</p><div id="gameBody"></div></div>`}
  function quizGame(m,questions){$('#gameContainer').innerHTML=gameHeader(m);const body=$('#gameBody');let q=0,correct=0; const draw=()=>{const [text,opts,ans,info]=questions[q];body.innerHTML=`<div class="question-card"><small>Pregunta ${q+1} de ${questions.length}</small><h3>${text}</h3><div class="options">${opts.map((o,i)=>`<button type="button" class="option" data-o="${i}">${o}</button>`).join('')}</div><div id="feedback" class="feedback" hidden></div></div>`;$$('[data-o]').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.o;if(i===ans){correct++;b.classList.add('correct')}else{b.classList.add('wrong');body.querySelector(`[data-o="${ans}"]`)?.classList.add('correct')}$$('[data-o]').forEach(x=>x.disabled=true);const fb=$('#feedback');fb.hidden=false;fb.textContent=info;setTimeout(()=>{q++;if(q<questions.length)draw();else finish(correct)},900)}))}; const finish=c=>{const passed=c>=Math.ceil(questions.length*.66);body.innerHTML=`<div class="question-card"><h3>${passed?'¡Misión superada! 🎉':'Casi. Repasemos una vez más.'}</h3><p>Respuestas correctas: <b>${c}/${questions.length}</b></p><button id="finishBtn" type="button" class="btn ${passed?'primary':'secondary'}">${passed?'Guardar progreso':'Reintentar'}</button></div>`;$('#finishBtn').addEventListener('click',()=>passed?completeMission(m.id,m.points):startMission(m.id))};draw()}

  function houseGame(m){$('#gameContainer').innerHTML=gameHeader(m,'Tocá los 4 puntos de riesgo de esta vivienda. Cada uno te explica qué conviene mejorar.');const body=$('#gameBody');body.innerHTML=`<div class="scene"><div class="house"><div class="roof"></div><div class="door"></div><div class="window"></div></div><button class="risk" data-risk="grieta" type="button">1</button><button class="risk" data-risk="techo" type="button">2</button><button class="risk" data-risk="leña" type="button">3</button><button class="risk" data-risk="corral" type="button">4</button><div class="scene-tip">Encontrados: <b id="foundCount">0/4</b></div></div><div id="riskInfo" class="feedback">Buscá los puntos marcados.</div>`;let found=new Set();const info={grieta:'Las grietas pueden ofrecer refugio. Repararlas ayuda a reducir sitios donde pueden esconderse vinchucas.',techo:'Los techos y sus uniones deben revisarse regularmente, especialmente cuando tienen materiales con muchos refugios.',leña:'Evitar acumular leña u objetos pegados a la vivienda reduce escondites cercanos.',corral:'Gallineros y corrales conviene ubicarlos lo más alejados posible de la vivienda.'};$$('[data-risk]').forEach(b=>b.addEventListener('click',()=>{found.add(b.dataset.risk);b.classList.add('found');$('#riskInfo').textContent=info[b.dataset.risk];$('#foundCount').textContent=`${found.size}/4`;if(found.size===4)setTimeout(()=>completeMission(m.id,m.points),700)}))}

  function classifyGame(m){$('#gameContainer').innerHTML=gameHeader(m,'Clasificá cada situación como vía reconocida de transmisión o como mito.');const body=$('#gameBody');const items=[['Durante embarazo o parto',1],['Deyecciones infectadas de triatominos',1],['Compartir mate o cubiertos',0],['Alimentos contaminados',1],['Abrazar a una persona con Chagas',0],['Transfusión sin control adecuado',1]];let idx=0,ok=0;const draw=()=>{if(idx>=items.length){body.innerHTML=`<div class="question-card"><h3>${ok>=5?'Excelente clasificación':'Buen intento'}</h3><p>Acertaste ${ok}/${items.length}.</p><button id="classDone" class="btn primary" type="button">${ok>=4?'Guardar progreso':'Reintentar'}</button></div>`;$('#classDone').addEventListener('click',()=>ok>=4?completeMission(m.id,m.points):classifyGame(m));return}const [text,answer]=items[idx];body.innerHTML=`<div class="question-card"><small>${idx+1} de ${items.length}</small><h3>${text}</h3><div class="sort-grid"><button class="option" data-a="1" type="button">✅ Vía reconocida</button><button class="option" data-a="0" type="button">❌ No es una vía de transmisión</button></div></div>`;$$('[data-a]').forEach(b=>b.addEventListener('click',()=>{if(+b.dataset.a===answer)ok++;idx++;draw()}))};draw()}

  function trueFalseGame(m){const qs=[['El Chagas puede no dar síntomas durante años.',true],['Toda chinche que se parece a una vinchuca transmite Chagas.',false],['Existe vacuna disponible para prevenir Chagas.',false],['La mejora de la vivienda forma parte de la prevención.',true],['La transmisión congénita es posible.',true]];quizGame(m,qs.map(([t,a])=>[t,['Verdadero','Falso'],a?0:1,a?'Correcto: esta afirmación es verdadera.':'Correcto: esta afirmación es falsa.']))}

  function scenarioGame(m){$('#gameContainer').innerHTML=gameHeader(m,'Una familia encuentra un insecto sospechoso cerca de un dormitorio. Elegí el plan más seguro.');const body=$('#gameBody');body.innerHTML=`<div class="question-card"><h3>¿Qué harías primero?</h3><div class="options"><button class="option" data-s="0" type="button">Aplastarlo y limpiar todo sin registrarlo</button><button class="option" data-s="1" type="button">Evitar tocarlo con la mano, fotografiarlo y conservarlo de forma segura si es posible</button><button class="option" data-s="2" type="button">Mandarlo por mensaje y asumir que ya está confirmado</button></div><div id="scenarioFeedback" class="feedback" hidden></div></div>`;$$('[data-s]').forEach(b=>b.addEventListener('click',()=>{const good=+b.dataset.s===1;const f=$('#scenarioFeedback');f.hidden=false;f.textContent=good?'Muy bien. Después corresponde notificar/consultar y permitir la identificación por personal capacitado.':'Esa opción puede perder información o generar una conclusión incorrecta. Probá otra.';if(good){b.classList.add('correct');setTimeout(()=>completeMission(m.id,m.points),1000)}else b.classList.add('wrong')}))}

  function daily(){if(state.daily)return;const qs=[['¿Hay una vacuna disponible contra el Chagas?',['Sí','No'],1,'Actualmente no existe vacuna.']];show('game');const m={id:'daily',level:'EXTRA',icon:'🔥',title:'Desafío relámpago',points:50};$('#gameContainer').innerHTML=gameHeader(m,'Una sola pregunta.');const body=$('#gameBody');const [t,opts,ans,info]=qs[0];body.innerHTML=`<div class="question-card"><h3>${t}</h3><div class="options">${opts.map((o,i)=>`<button class="option" type="button" data-d="${i}">${o}</button>`).join('')}</div><div id="dFeed" class="feedback" hidden></div></div>`;$$('[data-d]').forEach(b=>b.addEventListener('click',()=>{const f=$('#dFeed');f.hidden=false;if(+b.dataset.d===ans){b.classList.add('correct');f.textContent=info;state.daily=true;state.score+=50;save();setTimeout(()=>show('home'),900)}else{b.classList.add('wrong');f.textContent='No. Probá otra vez.'}}))}

  $('#homeBtn').addEventListener('click',()=>show('home'));$('#libraryBtn').addEventListener('click',()=>show('library'));$('#continueBtn').addEventListener('click',()=>{const next=missions.find(m=>!state.completed.includes(m.id));next?startMission(next.id):show('badges')});$('#dailyBtn').addEventListener('click',daily);$$('[data-go]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.go)));$$('[data-nav]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.nav)));$('#resetBtn').addEventListener('click',()=>{if(confirm('¿Querés borrar puntos, misiones e insignias y empezar de nuevo?')){localStorage.removeItem(STORAGE_KEY);location.reload()}});
  renderAll();
  if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
})();
