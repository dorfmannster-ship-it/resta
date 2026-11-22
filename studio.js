/* Brera Restauro – small, local-first learning platform. No account or tracking. */
(() => {
  'use strict';
  const data = window.BRERA_STUDY_DATA;
  if (!data) return;
  const $ = (id) => document.getElementById(id);
  const validProfiles = ['pfp1', 'pfp2', 'pfp5'];
  const topicIds = new Set(data.topics.map(t => t.id));
  const questionIds = new Set(data.questions.map(q => q.id));
  const drillIds = new Set(data.drills.map(d => d.id));
  const idQuestion = Object.fromEntries(data.questions.map(q => [q.id, q]));
  const idDrill = Object.fromEntries(data.drills.map(d => [d.id, d]));
  const KEY = 'brera-study-platform-v1';
  const emptyState = () => ({ version:1, profile:'pfp1', topics:{}, quiz:[], drills:{}, target:'', updated:null });
  const validDate = s => typeof s === 'string' && /^\d{4}-\d\d-\d\d$/.test(s) && !Number.isNaN(Date.parse(s));
  const safeState = raw => {
    const o = emptyState();
    if (!raw || typeof raw !== 'object' || raw.version !== 1) return o;
    if (validProfiles.includes(raw.profile)) o.profile = raw.profile;
    if (raw.topics && typeof raw.topics === 'object') {
      for (const [id, value] of Object.entries(raw.topics)) {
        if (topicIds.has(id) && ['todo','doing','done'].includes(value)) o.topics[id] = value;
      }
    }
    if (Array.isArray(raw.quiz)) {
      o.quiz = raw.quiz.filter(x => x && questionIds.has(x.id) && typeof x.ok === 'boolean' && validDate(x.date))
        .slice(-600).map(x => ({ id:x.id, ok:x.ok, date:x.date }));
    }
    if (raw.drills && typeof raw.drills === 'object') {
      for (const [id, log] of Object.entries(raw.drills)) {
        if (!drillIds.has(id) || !log || typeof log !== 'object') continue;
        const checked = Array.isArray(log.checked) ? [...new Set(log.checked.filter(n => Number.isInteger(n) && n>=0 && n<4))].slice(0,4) : [];
        const notes = typeof log.notes === 'string' ? log.notes.slice(0,1200) : '';
        const count = Number.isInteger(log.count) ? Math.max(0, Math.min(9999,log.count)) : 0;
        const date = validDate(log.date) ? log.date : '';
        o.drills[id] = {checked,notes,count,date};
      }
    }
    if (validDate(raw.target)) o.target = raw.target;
    if (validDate(raw.updated)) o.updated = raw.updated;
    return o;
  };
  let state;
  let persistent = true;
  try { state = safeState(JSON.parse(localStorage.getItem(KEY))); }
  catch(e) { state=emptyState(); persistent=false; }
  const today = () => new Date().toLocaleDateString('sv-SE');
  const fmtDate = iso => {
    if (!iso || !validDate(iso)) return '—';
    const [y,m,d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };
  const save = () => {
    state.updated = today();
    try {localStorage.setItem(KEY, JSON.stringify(state));persistent = true;}
    catch (e) {persistent=false;}
  };
  const make = (tag, cls='', txt=null) => {
    const node=document.createElement(tag);
    if (cls) node.className=cls;
    if (txt !== null) node.textContent=txt;
    return node;
  };
  const allowedTopics = () => data.topics.filter(t => t.profile === 'comune' || t.profile === state.profile);
  const allowedDrills = () => data.drills.filter(d => d.profile === 'comune' || d.profile === state.profile);
  const relevantQuiz = () => state.quiz.filter(x => idQuestion[x.id]?.profile === 'comune' || idQuestion[x.id]?.profile === state.profile);
  const stats = () => {
    const tasks=allowedTopics(), completed=tasks.filter(t => state.topics[t.id] === 'done').length;
    const drills=allowedDrills(), performed=drills.filter(d => (state.drills[d.id]?.count||0)>0).length;
    const quizzes=relevantQuiz(), ok=quizzes.filter(x => x.ok).length;
    return {tasks,completed,drills,performed,quizzes,ok};
  };
  const qs = (container, selector) => container.querySelector(selector);
  let quizSession=null;
  let selectedDrill=null;
  const percent = (n,d) => d>0 ? Math.round(100*n/d) : 0;

  function renderDashboard() {
    document.querySelectorAll('input[name="study-profile"]').forEach(x => x.checked = (x.value === state.profile));
    const s = stats();
    $('metric-topics').textContent = `${s.completed} / ${s.tasks.length}`;
    $('metric-quiz').textContent = s.quizzes.length ? `${percent(s.ok,s.quizzes.length)}% (${s.ok}/${s.quizzes.length})` : 'Non ancora iniziati';
    $('metric-practice').textContent = `${s.performed} / ${s.drills.length}`;
    $('metric-last').textContent = state.updated ? fmtDate(state.updated) : 'Nessuna';
    $('dashboard-progress').value = percent(s.completed,s.tasks.length);
    const resourceLink=$('profile-resource-link');
    if(resourceLink)resourceLink.href=`#libri-${state.profile}`;
    $('dashboard-description').textContent = `${percent(s.completed,s.tasks.length)}% degli argomenti contrassegnati come studiati. È un indicatore di organizzazione, non una previsione dell’esito d’esame.`;
    const next = s.tasks.find(t => !state.topics[t.id] || state.topics[t.id] === 'doing') || s.tasks.find(t => state.topics[t.id] !== 'done');
    const box=$('next-step'); box.replaceChildren();
    if (next) {
      box.append(make('strong','',next.title));
      box.append(make('p','',`Settimana ${next.week} del piano orientativo · ${data.areaNames[next.area]}.`));
      const a=make('a','inline-arrow','Segna o aggiorna l’argomento');a.href='#progressi';box.append(a);
    } else {
      box.append(make('strong','','Hai completato tutti gli argomenti del percorso.'));
      box.append(make('p','','Consolida i concetti con quiz, esercizi e ripassi mirati.'));
    }
    if (!persistent) {
      const privacy = document.querySelector('.privacy-mini');
      if(privacy) privacy.textContent='Attenzione: il browser potrebbe impedire il salvataggio locale. Esporta periodicamente un backup.';
    }
  }
  function setProfile(id) {
    if (!validProfiles.includes(id)) return;
    state.profile=id;save();
    if (quizSession) {quizSession=null; showQuizSetup();}
    renderAll();
  }
  document.querySelectorAll('input[name="study-profile"]').forEach(el => el.addEventListener('change', () => { if(el.checked)setProfile(el.value); }));

  function shuffle(items) {
    const a=[...items];
    for (let i=a.length-1;i>0;i--) {const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    return a;
  }
  function quizPool(scope) {
    if (scope === 'common') return data.questions.filter(q => q.profile==='comune');
    if (scope === 'profile') return data.questions.filter(q => q.profile===state.profile);
    if (scope === 'mistakes') {
      // The most recent response determines whether a question belongs to the review pool.
      const last = new Map();state.quiz.forEach(x => last.set(x.id,x.ok));
      return data.questions.filter(q => (q.profile==='comune' || q.profile===state.profile) && last.get(q.id)===false);
    }
    return data.questions.filter(q => q.profile==='comune' || q.profile===state.profile);
  }
  function updateQuizAvailability() {
    const scope=$('quiz-scope').value, pool=quizPool(scope);
    $('quiz-availability').textContent = pool.length ? `${pool.length} quesiti disponibili per questa selezione. Scegli quanti affrontarne.` : 'Non ci sono ancora risposte da ripassare: prova un quiz e torna dopo aver commesso qualche errore.';
    $('quiz-start').disabled = pool.length===0;
  }
  function showQuizSetup() {
    $('quiz-workspace').hidden=true; $('quiz-settings').hidden=false;
    $('quiz-summary').hidden=true;updateQuizAvailability();
  }
  function startQuiz() {
    const pool=quizPool($('quiz-scope').value);
    if (!pool.length) return;
    const limit=$('quiz-count').value==='all' ? pool.length : Math.min(Number($('quiz-count').value)||10,pool.length);
    quizSession={ ids:shuffle(pool).slice(0,limit).map(q=>q.id), index:0, answered:false, correct:0, records:[], optionOrder:[] };
    $('quiz-settings').hidden=true; $('quiz-summary').hidden=true;$('quiz-workspace').hidden=false;
    renderQuestion();
    $('quiz-workspace').scrollIntoView({block:'start',behavior:'instant'});
  }
  function renderQuestion() {
    const sess=quizSession;if(!sess)return;
    const q=idQuestion[sess.ids[sess.index]];
    sess.answered=false;sess.optionOrder=shuffle([0,1,2,3]);
    $('quiz-position').textContent=`Domanda ${sess.index+1} di ${sess.ids.length} · ${data.areaNames[q.topic]}`;
    $('quiz-score-live').textContent=`${sess.correct} corrette finora`;
    $('quiz-progress').max=sess.ids.length;$('quiz-progress').value=sess.index;
    $('quiz-question').textContent=q.question;
    const choices=$('quiz-choices');choices.replaceChildren();
    sess.optionOrder.forEach((original,idx) => {
      const label=make('label','quiz-choice');const input=make('input');input.type='radio';input.name='quiz-option';input.value=String(original);input.id=`quiz-opt-${idx}`;
      const span=make('span','',q.options[original]);label.append(input,span);choices.append(label);
    });
    $('quiz-feedback').replaceChildren();$('quiz-answer').hidden=false;$('quiz-next').hidden=true;
    $('quiz-next').textContent=sess.index===sess.ids.length-1?'Vedi il risultato':'Prossima domanda';
    $('quiz-answer').disabled=false;
    choices.querySelector('input')?.focus();
  }
  function answerQuiz() {
    const sess=quizSession;if (!sess || sess.answered)return;
    const q=idQuestion[sess.ids[sess.index]];
    const selected=document.querySelector('input[name="quiz-option"]:checked');
    if (!selected) { $('quiz-feedback').textContent='Seleziona prima una risposta.';return; }
    const ok=Number(selected.value)===q.answer;
    sess.answered=true;sess.records.push({id:q.id,ok});if(ok)sess.correct++;
    state.quiz.push({id:q.id,ok,date:today()});state.quiz=state.quiz.slice(-600);save();
    $('quiz-choices').querySelectorAll('input').forEach(inp => {
      inp.disabled=true;
      const label=inp.closest('label');
      if(Number(inp.value)===q.answer) label.classList.add('correct-choice');
      if(inp===selected && !ok) label.classList.add('incorrect-choice');
    });
    const fb=$('quiz-feedback');fb.replaceChildren();
    fb.append(make('strong',ok?'quiz-good':'quiz-bad', ok?'Risposta corretta.':'Da ripassare.'));
    fb.append(make('p','',q.explanation));
    const link=make('a','','Apri l’approfondimento ufficiale del profilo');link.href=q.source;link.target='_blank';link.rel='noopener noreferrer';fb.append(link);
    $('quiz-answer').hidden=true;$('quiz-next').hidden=false;
    $('quiz-score-live').textContent=`${sess.correct} corrette su ${sess.index+1}`;
    $('quiz-next').focus();renderDashboard();
  }
  function finishQuiz() {
    const sess=quizSession;if(!sess)return;
    $('quiz-workspace').hidden=true;
    const summary=$('quiz-summary');summary.replaceChildren();summary.hidden=false;
    const count=sess.records.length,correct=sess.correct,wrong=count-correct;
    const h=make('h3','','Risultato dell’allenamento');
    const p=make('p','summary-score',`${correct} risposte corrette su ${count}`);
    const msg=make('p','',count?`Hai individuato ${wrong} ${wrong===1?'risposta da ripassare':'risposte da ripassare'}. Questo punteggio non corrisponde al punteggio ufficiale di ammissione.`:'Quiz interrotto prima di rispondere.');
    const panel=make('div','summary-buttons');const restart=make('button','primary-button','Fai un altro quiz');restart.type='button';restart.addEventListener('click',()=>{quizSession=null;showQuizSetup();$('quiz-settings').scrollIntoView({block:'start'});});panel.append(restart);
    if(wrong>0){const rev=make('button','outline-button','Ripassa gli errori');rev.type='button';rev.addEventListener('click',()=>{quizSession=null;$('quiz-scope').value='mistakes';showQuizSetup();startQuiz();});panel.append(rev);}
    summary.append(h,p,msg,panel);quizSession=null;renderDashboard();summary.focus();
  }
  $('quiz-start').addEventListener('click',startQuiz);
  $('quiz-scope').addEventListener('change',updateQuizAvailability);
  $('quiz-answer').addEventListener('click',answerQuiz);
  $('quiz-next').addEventListener('click',()=>{
    if(!quizSession||!quizSession.answered)return;
    quizSession.index++;
    if(quizSession.index>=quizSession.ids.length) finishQuiz();else renderQuestion();
  });
  $('quiz-abandon').addEventListener('click',()=>{if(quizSession) finishQuiz();});

  function renderDrills() {
    const choices=allowedDrills();
    if(!choices.some(d=>d.id===selectedDrill))selectedDrill=choices[0].id;
    const select=$('drill-select');select.replaceChildren();
    for(const d of choices){const opt=make('option','',`${d.profile==='comune'?'Disegno comune':d.profile.toUpperCase()} · ${d.title}`);opt.value=d.id;select.append(opt);}
    select.value=selectedDrill;
    renderDrillDetail();
  }
  function renderDrillDetail() {
    const d=idDrill[selectedDrill];if(!d)return;
    const log=state.drills[d.id]||{checked:[],notes:'',count:0,date:''};
    const panel=$('drill-panel');panel.replaceChildren();
    panel.append(make('p','eyebrow',d.profile==='comune'?'Disegno · prova comune':`${d.profile.toUpperCase()} · esercizio specifico`));
    panel.append(make('h3','',d.title));
    panel.append(make('p','exercise-duration',`Durata suggerita: ${d.duration} · non è una durata d’esame.`));
    const mat=make('p','','');mat.append(make('strong','','Materiali: '),document.createTextNode(d.materials));panel.append(mat);
    panel.append(make('h4','','Come svolgerlo'));
    const ol=make('ol','exercise-steps');d.steps.forEach(t=>ol.append(make('li','',t)));panel.append(ol);
    panel.append(make('p','exercise-note',d.note));
    const link=make('a','inline-arrow','Riferimento ufficiale per il PFP');link.href=d.source;link.rel='noopener noreferrer';link.target='_blank';panel.append(link);
    const f=make('form','drill-form');f.id='drill-form';
    const field=make('fieldset','rubric');field.append(make('legend','','Autovalutazione: quali criteri hai rispettato?'));
    d.criteria.forEach((crit,idx)=>{const label=make('label','rubric-choice');const inp=make('input');inp.type='checkbox';inp.name='rubric';inp.value=String(idx);inp.checked=log.checked.includes(idx);label.append(inp,make('span','',crit));field.append(label);});
    f.append(field);
    const lab=make('label','note-label','Appunti personali (facoltativi)');lab.htmlFor='drill-notes';f.append(lab);
    const area=make('textarea');area.id='drill-notes';area.maxLength=1200;area.rows=3;area.placeholder='Che cosa è riuscito? Che cosa riproverai?';area.value=log.notes;f.append(area);
    const actions=make('div','action-row');const saveBtn=make('button','primary-button','Salva questa esercitazione');saveBtn.type='submit';actions.append(saveBtn);f.append(actions);
    const summary=make('p','muted-note',log.count?`Sessioni registrate: ${log.count} · Ultima: ${fmtDate(log.date)} · Criteri soddisfatti: ${log.checked.length}/4`:'Nessuna sessione registrata per questa attività.');summary.id='drill-status-detail';f.append(summary);
    f.addEventListener('submit',(ev)=>{ev.preventDefault();
      const checked=Array.from(f.querySelectorAll('input[name="rubric"]:checked')).map(el=>Number(el.value));
      state.drills[d.id]={checked,notes:area.value.slice(0,1200),count:Math.min(9999,log.count+1),date:today()};
      save();$('drill-status').textContent='Esercitazione salvata su questo dispositivo.';
      renderDrillDetail();renderDashboard();
    });
    panel.append(f);
    $('drill-status').textContent=`${choicesCount()} attività disponibili per il percorso. Seleziona e svolgi su materiali di esercizio.`;
  }
  function choicesCount(){return allowedDrills().length;}
  $('drill-select').addEventListener('change',e=>{selectedDrill=e.target.value;renderDrillDetail();});

  function renderTopics() {
    const filter=$('topic-filter').value, tasks=allowedTopics();const target=$('topic-groups');
    const previous = target.querySelectorAll('details[data-week]');
    const hadPrevious=previous.length>0;
    const openWeeks=new Set(Array.from(previous).filter(d=>d.open).map(d=>Number(d.dataset.week)));
    target.replaceChildren();
    const groups=new Map([ [1,[]],[2,[]],[3,[]],[4,[]] ]);
    tasks.forEach(t=>{
      const status=state.topics[t.id]||'todo';
      if(filter==='pending'&&status==='done')return;
      if(filter==='completed'&&status!=='done')return;
      groups.get(t.week).push(t);
    });
    let shown=0;
    for(const [week,items] of groups){
      if(!items.length)continue;shown+=items.length;
      const sec=make('details','topic-week');sec.dataset.week=String(week);
      sec.open=hadPrevious?openWeeks.has(week):week===1;
      sec.append(make('summary','topic-week-summary',`Settimana ${week} · ${items.filter(t=>state.topics[t.id]==='done').length}/${items.length} studiati`));
      const list=make('div','topic-list');
      for(const t of items){const row=make('div','topic-row');row.dataset.topicId=t.id;if(state.topics[t.id]==='done')row.classList.add('is-done');
        const info=make('div','topic-info');info.append(make('strong','',t.title),make('span','topic-area',data.areaNames[t.area]));
        const label=make('label','topic-selector');const text=make('span','visually-hidden',`Stato di ${t.title}`);label.append(text);
        const sel=make('select');sel.setAttribute('aria-label',`Stato di studio: ${t.title}`);
        [['todo','Da iniziare'],['doing','In corso'],['done','Studiato']].forEach(([val,txt])=>{const opt=make('option','',txt);opt.value=val;sel.append(opt);});
        sel.value=state.topics[t.id]||'todo';
        sel.addEventListener('change',()=>{
          const value=sel.value;state.topics[t.id]=value;save();renderDashboard();renderTopics();
          const updated=Array.from(target.querySelectorAll('.topic-row')).find(r=>r.dataset.topicId===t.id);
          if(updated){const group=updated.closest('details');if(group)group.open=true;updated.querySelector('select')?.focus();}
          $('topic-save-status').textContent=`${t.title}: ${value==='done'?'studiato':value==='doing'?'in corso':'da iniziare'}. Modifica salvata.`;
        });
        label.append(sel);row.append(info,label);list.append(row);
      }
      sec.append(list);target.append(sec);
    }
    if(!shown)target.append(make('p','empty-message','Nessun argomento corrisponde al filtro. Cambia il filtro per vedere gli altri.'));
    $('target-date').value=state.target;
    if(state.target){
      const limit=new Date(`${state.target}T12:00:00`),current=new Date();current.setHours(12,0,0,0);
      const days=Math.ceil((limit-current)/86400000);
      $('target-summary').textContent=days>0?`Data obiettivo: ${fmtDate(state.target)} · ${days} giorni rimanenti. La data è una tua scelta, non quella ufficiale dell’esame.`:days===0?'La tua data obiettivo è oggi. Controlla sempre il calendario ufficiale.':`La data obiettivo scelta (${fmtDate(state.target)}) è passata. Puoi aggiornarla.`;
    }else{$('target-summary').textContent='Non hai indicato una data obiettivo. Puoi studiare senza scadenza.';}
  }
  $('topic-filter').addEventListener('change',renderTopics);
  $('target-date').addEventListener('change',e=>{
    state.target=validDate(e.target.value)?e.target.value:'';save();renderTopics();renderDashboard();
  });
  function setBackupStatus(t){$('backup-feedback').textContent=t;}
  $('export-data').addEventListener('click',()=>{
    const content=JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2);
    const blob=new Blob([content],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=make('a');a.href=url;a.download=`brera-restauro-backup-${today()}.json`;
    document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2000);
    setBackupStatus('Backup generato. Salvalo in una cartella privata che potrai ritrovare.');
  });
  $('import-data').addEventListener('change',async e=>{
    const file=e.target.files?.[0];if(!file)return;
    if(file.size>2*1024*1024){setBackupStatus('File troppo grande (massimo 2 MB).');e.target.value='';return;}
    try {
      const raw=JSON.parse(await file.text());
      if(!raw || raw.version!==1 || typeof raw!=='object')throw Error('schema');
      if(!window.confirm('Importare il backup? I progressi attuali saranno sostituiti.')){setBackupStatus('Importazione annullata.');return;}
      state=safeState(raw);save();quizSession=null;selectedDrill=null;showQuizSetup();renderAll();setBackupStatus('Backup importato. Progressi e appunti aggiornati.');
    } catch(err) {setBackupStatus('Impossibile importare: file non valido o non compatibile con questa versione.');}
    finally {e.target.value='';}
  });
  $('reset-data').addEventListener('click',()=>{
    if(!window.confirm('Azzerare definitivamente tutti i progressi locali e gli appunti? Esporta prima un backup se vuoi conservarli.'))return;
    state=emptyState();save();quizSession=null;selectedDrill=null;showQuizSetup();renderAll();setBackupStatus('I progressi locali sono stati azzerati.');
  });
  function renderAll(){renderDashboard();renderTopics();renderDrills();updateQuizAvailability();}
  renderAll();
})();
