/* Quizzes, guided practice, study progress and backups. */
(() => {
  'use strict';

  const data = window.BRERA_STUDY_DATA;
  const store = window.BreraStore;
  const $ = id => document.getElementById(id);
  const snapshot = () => store.snapshot;
  const profiles = ['pfp1', 'pfp2', 'pfp5'];
  const byQuestion = new Map(data.questions.map(question => [question.id, question]));
  const byDrill = new Map(data.drills.map(drill => [drill.id, drill]));
  const percentage = (part, total) => total ? Math.round(100 * part / total) : 0;
  const onProfile = (item, profile = snapshot().profile) => item.profile === 'comune' || item.profile === profile;
  const quizKey = 'brera-active-quiz';
  const notesLimit = store.notesLimit;
  const labelStatus = { todo: 'Da iniziare', doing: 'In corso', done: 'Studiato' };

  let selectedDrill;
  let displayedProfile;
  let displayedGeneration;
  let quiz;
  let answering = false;
  let backupBusy = false;
  let suggestedTopic;
  const expandedWeeks = new Set([1]);
  const stepPositions = new Map();
  const liveDrafts = new Map();

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function button(text, className, action) {
    const node = make('button', className, text);
    node.type = 'button';
    node.addEventListener('click', action);
    return node;
  }

  function text(id, value) {
    const node = $(id);
    if (node.textContent !== value) node.textContent = value;
  }

  function sourceLink(label, url) {
    const link = make('a', 'inline-arrow', label);
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  }

  function dateLabel(value) {
    return value ? value.split('-').reverse().join('/') : '—';
  }

  function activity(change) {
    const date = store.today();
    return store.update(state => {
      change(state, date);
      state.updated = date;
    });
  }

  function renderDashboard() {
    const state = snapshot();
    const topics = data.topics.filter(item => onProfile(item));
    const done = topics.filter(item => state.topics[item.id] === 'done').length;
    const drills = data.drills.filter(item => onProfile(item));
    const completedDrills = drills.filter(item => state.drills[item.id]?.count > 0).length;
    const attempts = state.quiz.filter(entry => onProfile(byQuestion.get(entry.id)));
    const correct = attempts.filter(entry => entry.ok).length;

    document.querySelectorAll('input[name="study-profile"]').forEach(input => {
      input.checked = input.value === state.profile;
    });
    text('metric-topics', `${done} / ${topics.length}`);
    text('metric-quiz', attempts.length ? `${percentage(correct, attempts.length)}% (${correct}/${attempts.length})` : 'Non ancora iniziati');
    text('metric-practice', `${completedDrills} / ${drills.length}`);
    text('metric-last', state.updated ? dateLabel(state.updated) : 'Nessuna');
    $('dashboard-progress').value = percentage(done, topics.length);
    $('profile-resource-link').hash = 'libri-' + state.profile;
    text('dashboard-description', `${percentage(done, topics.length)}% degli argomenti contrassegnati come studiati. È un indicatore di organizzazione, non una previsione dell’esito d’esame.`);

    const next = topics.find(item => state.topics[item.id] === 'doing') ?? topics.find(item => state.topics[item.id] !== 'done');
    if (suggestedTopic === (next?.id ?? null)) return;
    suggestedTopic = next?.id ?? null;
    const box = $('next-step');
    if (!next) {
      box.replaceChildren(make('strong', '', 'Hai completato tutti gli argomenti del percorso.'), make('p', '', 'Consolida i concetti con quiz, esercizi e ripassi mirati.'));
      return;
    }
    const link = make('a', 'inline-arrow', 'Apri questo argomento nel piano');
    link.href = '#argomento-' + next.id;
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (location.hash !== link.hash) history.pushState(null, '', link.hash);
      focusTopic(next.id);
    });
    box.replaceChildren(make('strong', '', next.title), make('p', '', `Settimana ${next.week} del piano orientativo · ${data.areaNames[next.area]}.`), link);
  }

  function setStorageStatus() {
    const message = store.available ? '' : store.conflict ?
      'I progressi sono stati sostituiti in un’altra scheda. Le modifiche di questa scheda restano temporanee: esporta un backup per conservarle.' :
      'Il browser non ha salvato le modifiche. Tieni aperta questa scheda ed esporta un backup per conservarle.';
    text('storage-alert', message);
    $('restore-data').hidden = !store.hasRecovery;
  }

  function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[other]] = [copy[other], copy[index]];
    }
    return copy;
  }

  function quizPool(scope) {
    return data.questions.filter(question => {
      if (scope === 'common') return question.profile === 'comune';
      if (scope === 'profile') return question.profile === snapshot().profile;
      if (scope === 'mistakes') return onProfile(question) && snapshot().review[question.id] === false;
      return onProfile(question);
    });
  }

  function updateQuizAvailability() {
    const pool = quizPool($('quiz-scope').value);
    text('quiz-availability', pool.length ?
      (pool.length === 1 ? '1 quesito disponibile.' : `${pool.length} quesiti disponibili.`) :
      'Al momento non ci sono errori da ripassare.');
    $('quiz-start').disabled = !pool.length;
  }

  function displayQuiz(view) {
    $('quiz-settings').hidden = view !== 'setup';
    $('quiz-paused').hidden = view !== 'paused';
    $('quiz-workspace').hidden = view !== 'question';
    $('quiz-summary').hidden = view !== 'summary';
    if (view === 'setup') updateQuizAvailability();
  }

  function saveQuiz() {
    try {
      if (quiz) sessionStorage.setItem(quizKey, JSON.stringify(quiz));
      else sessionStorage.removeItem(quizKey);
    } catch {
      // The current quiz remains usable in memory when browser session storage is unavailable.
    }
  }

  function resumeSavedQuiz() {
    try {
      const session = JSON.parse(sessionStorage.getItem(quizKey));
      const four = [0, 1, 2, 3];
      if (!session || session.generation !== store.generation || !/^[a-f0-9]{32}$/.test(session.run) || !profiles.includes(session.profile) ||
          !Array.isArray(session.ids) || !session.ids.length || new Set(session.ids).size !== session.ids.length ||
          !session.ids.every(id => byQuestion.has(id) && onProfile(byQuestion.get(id), session.profile)) ||
          !Number.isInteger(session.index) || session.index < 0 || session.index >= session.ids.length ||
          !Array.isArray(session.answers) || !session.answers.every(answer => four.includes(answer)) ||
          ![session.index, session.index + 1].includes(session.answers.length) ||
          !Array.isArray(session.order) || new Set(session.order).size !== 4 || session.order.length !== 4 || !session.order.every(index => four.includes(index)) ||
          !(session.selected === null || four.includes(session.selected))) return;
      quiz = session;
      const saved = snapshot().quiz.find(entry => entry.attempt === attemptId(session));
      if (saved && session.answers.length === session.index) session.answers.push(saved.choice);
      showPaused(false);
    } catch {
      // Ignore damaged or inaccessible checkpoints.
    }
  }

  function attemptId(session) {
    return `${session.run}:${session.index}`;
  }

  function beginQuiz(questionIds, profile = snapshot().profile) {
    if (answering || quiz) return;
    const pool = quizPool($('quiz-scope').value);
    const count = $('quiz-count').value;
    const size = count === 'all' ? pool.length : Math.min(Number(count), pool.length);
    const ids = questionIds ?? shuffle(pool).slice(0, size).map(question => question.id);
    if (!ids.length) return;
    const run = Array.from(crypto.getRandomValues(new Uint8Array(16)), n => n.toString(16).padStart(2, '0')).join('');
    quiz = { ids, run, generation: store.generation, profile, index: 0, answers: [], selected: null, order: shuffle([0, 1, 2, 3]) };
    saveQuiz();
    displayQuiz('question');
    renderQuestion();
  }

  function correctCount(session) {
    return session.answers.filter((answer, index) => answer === byQuestion.get(session.ids[index]).answer).length;
  }

  function updateQuizProgress() {
    text('quiz-score-live', `${correctCount(quiz)} corrette su ${quiz.answers.length} risposte`);
    $('quiz-progress').max = quiz.ids.length;
    $('quiz-progress').value = quiz.answers.length;
  }

  function renderQuestion() {
    const question = byQuestion.get(quiz.ids[quiz.index]);
    const answered = quiz.answers.length > quiz.index;
    const area = data.areaNames[question.topic];
    const profile = quiz.profile.toUpperCase();
    const context = area === profile ? profile : `${area} · ${profile}`;
    text('quiz-position', `Domanda ${quiz.index + 1} di ${quiz.ids.length} · ${context}`);
    text('quiz-question', question.question);
    updateQuizProgress();
    const choices = $('quiz-choices');
    choices.replaceChildren();
    for (const original of quiz.order) {
      const label = make('label', 'quiz-choice');
      const input = make('input');
      input.type = 'radio';
      input.name = 'quiz-option';
      input.value = String(original);
      input.checked = quiz.selected === original;
      input.addEventListener('change', () => {
        quiz.selected = original;
        saveQuiz();
      });
      label.append(input, make('span', '', question.options[original]));
      choices.append(label);
    }
    $('quiz-feedback').replaceChildren();
    $('quiz-answer').hidden = answered;
    $('quiz-answer').disabled = false;
    $('quiz-next').hidden = !answered;
    text('quiz-next', quiz.index === quiz.ids.length - 1 ? 'Vedi il risultato' : 'Prossima domanda');
    if (answered) {
      showCorrection(question, quiz.answers[quiz.index]);
      $('quiz-feedback').focus();
    } else {
      $('quiz-question').focus();
    }
  }

  function showCorrection(question, selected, saved = true) {
    const ok = question.answer === selected;
    for (const input of $('quiz-choices').querySelectorAll('input')) {
      input.disabled = true;
      const label = input.closest('label');
      const value = Number(input.value);
      if (value === question.answer) {
        label.classList.add('correct-choice');
        label.append(make('strong', 'choice-result', 'Risposta corretta'));
      } else if (value === selected) {
        label.classList.add('incorrect-choice');
        label.append(make('strong', 'choice-result', 'La tua risposta'));
      }
    }
    const feedback = $('quiz-feedback');
    feedback.replaceChildren(make('strong', ok ? 'quiz-good' : 'quiz-bad', ok ? 'Risposta corretta.' : 'Da ripassare.'));
    if (!ok) feedback.append(make('p', '', `Risposta corretta: ${question.options[question.answer]}`));
    feedback.append(make('p', '', question.explanation), sourceLink('Apri l’approfondimento ufficiale', question.source));
    if (!saved) feedback.append(make('p', '', 'Risposta registrata in questa scheda. Esporta un backup per conservarla.'));
  }

  async function answerQuiz() {
    if (!quiz || answering || quiz.answers.length > quiz.index) return;
    if (quiz.selected === null) {
      text('quiz-feedback', 'Seleziona prima una risposta.');
      $('quiz-choices').querySelector('input').focus();
      return;
    }
    const session = quiz;
    const question = byQuestion.get(session.ids[session.index]);
    const choice = session.selected;
    const id = attemptId(session);
    answering = true;
    $('quiz-choices').querySelectorAll('input').forEach(input => { input.disabled = true; });
    $('quiz-answer').disabled = true;
    const saved = await activity((state, date) => {
      if (state.quiz.some(entry => entry.attempt === id)) return;
      const ok = choice === question.answer;
      state.quiz.push({ id: question.id, ok, date, attempt: id, choice });
      state.quiz = state.quiz.slice(-store.historyLimit);
      state.review[question.id] = ok;
    });
    answering = false;
    if (quiz !== session) return;
    const recorded = snapshot().quiz.find(entry => entry.attempt === id);
    const accepted = recorded?.choice ?? choice;
    session.selected = accepted;
    session.answers.push(accepted);
    saveQuiz();
    $('quiz-choices').querySelector(`input[value="${accepted}"]`).checked = true;
    showCorrection(question, accepted, saved);
    $('quiz-answer').hidden = true;
    $('quiz-next').hidden = false;
    updateQuizProgress();
    $('quiz-feedback').focus();
    renderDashboard();
  }

  function showPaused(focus = true) {
    saveQuiz();
    displayQuiz('paused');
    text('quiz-paused-position', `Domanda ${quiz.index + 1} di ${quiz.ids.length} · ${quiz.profile.toUpperCase()} · ${quiz.answers.length} risposte date`);
    if (focus) $('quiz-paused-title').focus();
  }

  function finishQuiz() {
    if (!quiz || answering) return;
    const session = quiz;
    quiz = undefined;
    saveQuiz();
    displayQuiz('summary');
    const summary = $('quiz-summary');
    const correct = correctCount(session);
    const count = session.answers.length;
    const wrongIds = session.ids.filter((id, index) => index < count && session.answers[index] !== byQuestion.get(id).answer);
    const heading = make('h3', '', 'Risultato dell’allenamento');
    heading.tabIndex = -1;
    const actions = make('div', 'summary-buttons');
    actions.append(button('Fai un altro quiz', 'primary-button', () => {
      displayQuiz('setup');
      $('quiz-start').focus();
      if ($('quiz-start').disabled) $('quiz-scope').focus();
    }));
    // The summary reviews this session; the setup also offers the full outstanding review list.
    if (wrongIds.length) {
      actions.append(button('Ripassa gli errori di questo quiz', 'outline-button', () => {
        beginQuiz(shuffle(wrongIds), session.profile);
      }));
    }
    const score = count ? make('p', 'summary-score', `${correct} risposte corrette su ${count}`) : make('p', '', 'Quiz interrotto prima di rispondere.');
    summary.replaceChildren(heading, score);
    if (count) {
      const wrong = wrongIds.length;
      summary.append(make('p', '', `Hai individuato ${wrong} ${wrong === 1 ? 'risposta da ripassare' : 'risposte da ripassare'}. Questo punteggio non corrisponde al punteggio ufficiale di ammissione.`));
    }
    summary.append(actions);
    heading.focus();
  }

  $('quiz-start').addEventListener('click', () => beginQuiz());
  $('quiz-scope').addEventListener('change', updateQuizAvailability);
  $('quiz-answer').addEventListener('click', answerQuiz);
  $('quiz-next').addEventListener('click', () => {
    if (!quiz || answering || quiz.answers.length <= quiz.index) return;
    if (quiz.index + 1 === quiz.ids.length) {
      finishQuiz();
      return;
    }
    quiz.index++;
    quiz.selected = null;
    quiz.order = shuffle([0, 1, 2, 3]);
    saveQuiz();
    renderQuestion();
  });
  $('quiz-pause').addEventListener('click', () => { if (!answering && quiz) showPaused(); });
  $('quiz-resume').addEventListener('click', () => {
    if (!quiz) return;
    displayQuiz('question');
    renderQuestion();
  });
  $('quiz-abandon').addEventListener('click', finishQuiz);
  $('quiz-paused-end').addEventListener('click', finishQuiz);

  function renderDrillChoices() {
    const choices = data.drills.filter(item => onProfile(item));
    if (!choices.some(drill => drill.id === selectedDrill)) selectedDrill = choices[0].id;
    const select = $('drill-select');
    select.replaceChildren(...choices.map(drill => {
      const option = make('option', '', `${drill.profile === 'comune' ? 'Disegno comune' : drill.profile.toUpperCase()} · ${drill.title}`);
      option.value = drill.id;
      return option;
    }));
    select.value = selectedDrill;
    text('drill-status', `${choices.length} attività disponibili per il percorso. Seleziona e svolgi su materiali di esercizio.`);
    renderDrill();
  }

  function readDrill(id) {
    const state = snapshot();
    return { log: state.drills[id], draft: liveDrafts.get(id) ?? state.drafts[id] };
  }

  function renderDrill() {
    const drill = byDrill.get(selectedDrill);
    const { log, draft } = readDrill(drill.id);
    const initial = draft ?? log ?? { checked: [], notes: '' };
    const panel = $('drill-panel');
    const materials = make('p');
    materials.append(make('strong', '', 'Materiali: '), drill.materials);

    const instructions = make('h4', '', 'Come svolgerlo');
    instructions.id = 'drill-instructions';
    instructions.tabIndex = -1;
    const steps = make('ol', 'exercise-steps');
    steps.id = 'exercise-steps';
    const items = drill.steps.map((step, index) => {
      const item = make('li', '', step);
      item.value = index + 1;
      return item;
    });
    steps.append(...items);
    const stepControls = make('div', 'step-controls');
    const stepStatus = make('p', 'step-status');
    stepStatus.setAttribute('role', 'status');
    let activeStep = stepPositions.get(drill.id);
    const toggleSteps = button('Un passaggio alla volta', 'outline-button', () => {
      activeStep = activeStep === undefined ? 0 : undefined;
      renderSteps();
    });
    toggleSteps.setAttribute('aria-controls', 'exercise-steps');
    const previous = button('Indietro', 'outline-button', () => { if (activeStep > 0) { activeStep--; renderSteps(); } });
    const forward = button('Avanti', 'outline-button', () => { if (activeStep < items.length - 1) { activeStep++; renderSteps(); } });
    function renderSteps() {
      const single = activeStep !== undefined;
      if (single) stepPositions.set(drill.id, activeStep);
      else stepPositions.delete(drill.id);
      items.forEach((item, index) => { item.hidden = single && index !== activeStep; });
      toggleSteps.setAttribute('aria-pressed', String(single));
      stepControls.hidden = !single;
      previous.setAttribute('aria-disabled', String(activeStep === 0));
      forward.setAttribute('aria-disabled', String(activeStep === items.length - 1));
      if (single) stepStatus.textContent = `Passaggio ${activeStep + 1} di ${items.length}`;
    }
    stepControls.append(stepStatus, previous, forward);
    renderSteps();

    const form = make('form', 'drill-form');
    const field = make('fieldset', 'rubric');
    field.append(make('legend', '', 'Autovalutazione: quali criteri hai rispettato?'));
    const checks = drill.criteria.map((criterion, index) => {
      const label = make('label', 'rubric-choice');
      const input = make('input');
      input.type = 'checkbox';
      input.checked = initial.checked.includes(index);
      label.append(input, make('span', '', criterion));
      field.append(label);
      return input;
    });
    const noteLabel = make('label', 'note-label', 'Appunti personali (facoltativi)');
    noteLabel.htmlFor = 'drill-notes';
    const area = make('textarea');
    area.id = 'drill-notes';
    area.maxLength = notesLimit;
    area.rows = 3;
    area.placeholder = 'Che cosa è riuscito? Che cosa riproverai?';
    area.value = initial.notes;
    const draftStatus = make('p', 'muted-note', draft ? 'Bozza ripresa per questo esercizio.' : '');
    draftStatus.id = 'drill-draft-status';
    // Keep the draft indicator visible without announcing a new message on every keystroke.
    area.setAttribute('aria-describedby', 'drill-draft-status');
    const readForm = () => ({ notes: area.value.slice(0, notesLimit), checked: checks.flatMap((input, index) => input.checked ? [index] : []) });
    let draftRevision = 0;
    async function saveDraft() {
      const edit = readForm();
      const revision = ++draftRevision;
      liveDrafts.set(drill.id, edit);
      const saved = await store.update(state => { state.drafts[drill.id] = edit; });
      if (liveDrafts.get(drill.id) === edit) liveDrafts.delete(drill.id);
      if (revision === draftRevision) draftStatus.textContent = saved ? 'Bozza conservata per questo esercizio.' : 'Bozza temporanea in questa scheda.';
    }
    area.addEventListener('input', saveDraft);
    checks.forEach(input => input.addEventListener('change', saveDraft));

    const actions = make('div', 'action-row');
    const submit = make('button', 'primary-button', 'Salva questa esercitazione');
    submit.type = 'submit';
    const reread = make('a', 'outline-link', 'Rileggi la consegna');
    reread.href = '#drill-instructions';
    reread.addEventListener('click', event => {
      event.preventDefault();
      instructions.focus();
    });
    actions.append(submit, reread);
    const sessionDetail = make('p', 'muted-note');
    sessionDetail.id = 'drill-status-detail';
    function renderDetails(entry) {
      sessionDetail.textContent = entry?.count ?
        `Sessioni registrate: ${entry.count} · Ultima: ${dateLabel(entry.date)} · Criteri soddisfatti: ${entry.checked.length}/4` :
        'Nessuna sessione registrata per questa attività.';
    }
    renderDetails(log);
    const confirmation = make('p', 'muted-note');
    confirmation.setAttribute('role', 'status');
    let saving = false;
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (saving) return;
      saving = true;
      submit.setAttribute('aria-disabled', 'true');
      const edit = readForm();
      const revision = ++draftRevision;
      const saved = await activity((state, date) => {
        const count = Math.min(9999, (state.drills[drill.id]?.count ?? 0) + 1);
        state.drills[drill.id] = { ...edit, count, date };
        delete state.drafts[drill.id];
      });
      saving = false;
      submit.setAttribute('aria-disabled', 'false');
      if (liveDrafts.get(drill.id) === edit) liveDrafts.delete(drill.id);
      if (revision === draftRevision) draftStatus.textContent = '';
      confirmation.textContent = saved ? 'Esercitazione salvata su questo dispositivo.' : 'Esercitazione registrata in questa scheda. Esporta un backup per conservarla.';
      renderDetails(readDrill(drill.id).log);
      renderDashboard();
    });

    form.append(field, noteLabel, area, draftStatus, actions, confirmation, sessionDetail);
    panel.replaceChildren(
      make('p', 'eyebrow', drill.profile === 'comune' ? 'Disegno · prova comune' : `${drill.profile.toUpperCase()} · esercizio specifico`),
      make('h3', '', drill.title), make('p', 'exercise-duration', `Durata suggerita: ${drill.duration} · non è una durata d’esame.`),
      materials, instructions, toggleSteps, stepControls, steps, make('p', 'exercise-note', drill.note),
      sourceLink('Riferimento ufficiale per il PFP', drill.source), form
    );
  }

  $('drill-select').addEventListener('change', event => {
    selectedDrill = event.target.value;
    renderDrill();
  });

  function renderTopics() {
    const state = snapshot();
    const filter = $('topic-filter').value;
    const groups = new Map();
    for (const topic of data.topics) {
      if (!onProfile(topic)) continue;
      const status = state.topics[topic.id] ?? 'todo';
      if ((filter === 'pending' && status === 'done') || (filter === 'completed' && status !== 'done')) continue;
      if (!groups.has(topic.week)) groups.set(topic.week, []);
      groups.get(topic.week).push(topic);
    }
    const container = $('topic-groups');
    container.replaceChildren();
    for (const [week, topics] of groups) {
      const details = make('details', 'topic-week');
      details.dataset.week = String(week);
      details.open = expandedWeeks.has(week);
      details.addEventListener('toggle', () => {
        if (!details.isConnected) return;
        if (details.open) expandedWeeks.add(week);
        else expandedWeeks.delete(week);
      });
      const completed = topics.filter(topic => state.topics[topic.id] === 'done').length;
      const summary = make('summary', 'topic-week-summary', `Settimana ${week} · ${completed}/${topics.length} studiati`);
      const list = make('div', 'topic-list');
      for (const topic of topics) list.append(makeTopic(topic, state.topics[topic.id] ?? 'todo'));
      details.append(summary, list);
      container.append(details);
    }
    if (!groups.size) container.append(make('p', 'empty-message', 'Nessun argomento corrisponde al filtro. Cambia il filtro per vedere gli altri.'));
    $('target-date').value = state.target;
    let message = 'Non hai indicato una data obiettivo. Puoi studiare senza scadenza.';
    if (state.target) {
      const days = store.calendarDay(state.target) - store.calendarDay(store.today());
      message = days > 0 ? `Data obiettivo: ${dateLabel(state.target)} · ${days} ${days === 1 ? 'giorno rimanente' : 'giorni rimanenti'}. La data è una tua scelta, non quella ufficiale dell’esame.` :
        days === 0 ? 'La tua data obiettivo è oggi. Controlla sempre il calendario ufficiale.' :
          `La data obiettivo scelta (${dateLabel(state.target)}) è passata. Puoi aggiornarla.`;
    }
    text('target-summary', message);
  }

  function makeTopic(topic, status) {
    const row = make('div', 'topic-row');
    row.dataset.topicId = topic.id;
    row.id = 'argomento-' + topic.id;
    row.classList.toggle('is-done', status === 'done');
    const info = make('div', 'topic-info');
    info.append(make('strong', '', topic.title), make('span', 'topic-area', data.areaNames[topic.area]));
    const label = make('label', 'topic-selector');
    label.append(make('span', 'visually-hidden', `Stato di studio: ${topic.title}`));
    const select = make('select');
    for (const [value, label] of Object.entries(labelStatus)) {
      const option = make('option', '', label);
      option.value = value;
      select.append(option);
    }
    select.value = status;
    select.addEventListener('change', async () => {
      const value = select.value;
      const saved = await activity(state => { state.topics[topic.id] = value; });
      const hadFocus = document.activeElement === select;
      renderDashboard();
      renderTopics();
      if (hadFocus) {
        const updated = $(row.id)?.querySelector('select');
        const alternate = $('topic-groups').querySelector(`[data-week="${topic.week}"] summary`) ?? $('topic-filter');
        (updated ?? alternate).focus();
      }
      text('topic-save-status', `${topic.title}: ${labelStatus[value]}. ${saved ? 'Modifica salvata.' : 'Modifica temporanea. Esporta un backup per conservarla.'}`);
    });
    label.append(select);
    row.append(info, label);
    return row;
  }

  function focusTopic(id) {
    const topic = data.topics.find(item => item.id === id && onProfile(item));
    if (!topic) return;
    expandedWeeks.add(topic.week);
    $('topic-filter').value = 'all';
    renderTopics();
    $('argomento-' + id)?.querySelector('select').focus();
  }

  function openTopicFromHash() {
    if (location.hash.startsWith('#argomento-')) focusTopic(location.hash.slice('#argomento-'.length));
  }
  window.addEventListener('hashchange', openTopicFromHash);
  $('topic-filter').addEventListener('change', renderTopics);
  $('target-date').addEventListener('change', async event => {
    const value = store.validDate(event.target.value) ? event.target.value : '';
    const saved = await activity(state => { state.target = value; });
    renderTopics();
    renderDashboard();
    text('topic-save-status', saved ? 'Data obiettivo salvata.' : 'Data obiettivo temporanea. Esporta un backup per conservarla.');
  });

  function renderProfile() {
    displayedProfile = snapshot().profile;
    renderDashboard();
    renderTopics();
    renderDrillChoices();
    updateQuizAvailability();
  }

  for (const radio of document.querySelectorAll('input[name="study-profile"]')) {
    radio.addEventListener('change', async () => {
      if (!radio.checked) return;
      await activity(state => { state.profile = radio.value; });
      renderProfile();
    });
  }

  function setBackupStatus(message) {
    text('backup-feedback', message);
  }

  $('export-data').addEventListener('click', async () => {
    const includeReading = $('export-reading').checked;
    await store.settled();
    const blob = new Blob([JSON.stringify(store.exportData(includeReading), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = make('a');
    link.href = url;
    link.download = `brera-restauro-backup-${store.today()}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    setBackupStatus('Backup generato. Salvalo in una cartella privata che potrai ritrovare.');
  });

  async function replaceState(mode, backup, confirmMessage, success) {
    if (backupBusy) return;
    if (!window.confirm(confirmMessage)) {
      setBackupStatus('Operazione annullata.');
      return;
    }
    backupBusy = true;
    const saved = await store.replace(mode, backup);
    backupBusy = false;
    setBackupStatus(saved ? success : 'Il browser non ha salvato l’operazione. Puoi esportare i progressi di questa scheda.');
  }

  $('choose-import').addEventListener('click', () => $('import-data').click());
  $('import-data').addEventListener('change', async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setBackupStatus('File troppo grande (massimo 2 MB).');
      return;
    }
    let backup;
    try {
      backup = store.parseBackup(JSON.parse(await file.text()));
    } catch {
      setBackupStatus('Impossibile importare: il backup è incompleto, danneggiato o appartiene a una versione incompatibile.');
      return;
    }
    const state = backup.snapshot;
    const details = `Percorso ${state.profile.toUpperCase()}: ${Object.keys(state.topics).length} stati degli argomenti, ${state.quiz.length} risposte, ${Object.keys(state.drills).length} esercizi e ${Object.keys(state.drafts).length} bozze.`;
    const reading = backup.includesReading ? '\nSaranno importate anche le preferenze di lettura.' : '';
    await replaceState('import', backup,
      `Importare questo backup?\n${details}${reading}\nPotrai recuperare lo stato precedente dal pannello dei backup.`,
      'Backup importato. Puoi recuperare lo stato precedente dal pannello dei backup.');
  });

  $('reset-data').addEventListener('click', () => replaceState('reset', null,
    'Azzerare i progressi e gli appunti? Potrai recuperare lo stato precedente dal pannello dei backup.',
    'Progressi azzerati. Puoi recuperare lo stato precedente dal pannello dei backup.'));
  $('restore-data').addEventListener('click', () => replaceState('undo', null,
    'Ripristinare lo stato precedente? Lo stato attuale resterà disponibile per un nuovo ripristino.',
    'Stato precedente ripristinato.'));

  store.ready.then(() => {
    displayedGeneration = store.generation;
    renderProfile();
    resumeSavedQuiz();
    setStorageStatus();
    document.querySelectorAll('[data-study-controls]').forEach(node => { node.hidden = false; });
    openTopicFromHash();
    store.events.addEventListener('change', event => {
      setStorageStatus();
      if (store.generation !== displayedGeneration) {
        const focusedInQuiz = $('quiz').contains(document.activeElement);
        displayedGeneration = store.generation;
        quiz = undefined;
        saveQuiz();
        displayQuiz('setup');
        selectedDrill = undefined;
        stepPositions.clear();
        liveDrafts.clear();
        renderProfile();
        if (focusedInQuiz) $('quiz-scope').focus();
      } else if (event.detail === 'remote') {
        if (snapshot().profile !== displayedProfile) renderProfile();
        else {
          renderDashboard();
          if (!$('topic-groups').contains(document.activeElement) && document.activeElement !== $('target-date')) renderTopics();
          updateQuizAvailability();
        }
      }
    });
  });
})();
