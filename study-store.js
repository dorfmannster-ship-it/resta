/* Browser storage, backups and calendar dates shared by the study tools. */
(() => {
  'use strict';

  const data = window.BRERA_STUDY_DATA;
  const profiles = ['pfp1', 'pfp2', 'pfp5'];
  const statuses = ['todo', 'doing', 'done'];
  const topicIds = new Set(data.topics.map(topic => topic.id));
  const answerKeys = new Map(data.questions.map(question => [question.id, question.answer]));
  const drillIds = new Set(data.drills.map(drill => drill.id));
  const databaseName = 'brera-restauro';
  const legacyKey = 'brera-study-platform-v1';
  const historyLimit = 600;
  const notesLimit = 1200;
  const defaultReading = Object.freeze({
    size: 1, contrast: false, quick: false, line: 'standard', spacing: 'standard', chapter: ''
  });
  const empty = () => ({
    version: 2, profile: 'pfp1', topics: {}, quiz: [], review: {}, drills: {}, drafts: {},
    target: '', updated: null, reading: { ...defaultReading }
  });

  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const calendarDay = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return null;
    const time = Date.parse(value + 'T00:00:00Z');
    return Number.isFinite(time) && new Date(time).toISOString().startsWith(value) ? time / 86400000 : null;
  };
  function today() {
    const now = new Date();
    return [now.getFullYear(), now.getMonth() + 1, now.getDate()].map((part, index) => String(part).padStart(index ? 2 : 4, '0')).join('-');
  }

  const validDate = value => calendarDay(value) !== null;
  const validChecked = value => Array.isArray(value) && value.length <= 4 &&
    new Set(value).size === value.length && value.every(n => Number.isInteger(n) && n >= 0 && n < 4);
  const validNotes = value => typeof value === 'string' && value.length <= notesLimit;
  const validEntry = item => object(item) && answerKeys.has(item.id) && typeof item.ok === 'boolean' && validDate(item.date) &&
    ((!Object.hasOwn(item, 'attempt') && !Object.hasOwn(item, 'choice')) ||
      (typeof item.attempt === 'string' && /^[a-f0-9]{32}:[0-9]{1,2}$/.test(item.attempt) &&
        Number.isInteger(item.choice) && item.choice >= 0 && item.choice < 4 && item.ok === (item.choice === answerKeys.get(item.id))));
  const validDraft = draft => object(draft) && validChecked(draft.checked) && validNotes(draft.notes);
  const validLog = log => validDraft(log) && Number.isInteger(log.count) && log.count >= 0 &&
    log.count <= 9999 && (validDate(log.date) || (log.count === 0 && log.date === ''));
  const validMap = (map, ids, predicate) => object(map) &&
    Object.entries(map).every(([id, value]) => ids.has(id) && predicate(value));
  const validReading = reading => object(reading) &&
    Number.isFinite(reading.size) && reading.size >= 0.85 && reading.size <= 1.5 &&
    typeof reading.contrast === 'boolean' && typeof reading.quick === 'boolean' &&
    ['standard', 'comoda', 'ampia'].includes(reading.line) &&
    ['standard', 'ampia'].includes(reading.spacing) &&
    typeof reading.chapter === 'string' && (reading.chapter === '' || /^tema-(0[1-9]|1[0-9]|2[01])$/.test(reading.chapter));

  function cleanCore(raw) {
    const result = empty();
    if (profiles.includes(raw.profile)) result.profile = raw.profile;
    result.topics = Object.fromEntries(Object.entries(raw.topics ?? {}).filter(([id, status]) => topicIds.has(id) && statuses.includes(status)));
    if (Array.isArray(raw.quiz)) {
      const validHistory = raw.quiz.filter(validEntry);
      result.quiz = validHistory.slice(-historyLimit).map(({ id, ok, date, attempt, choice }) =>
        ({ id, ok, date, ...(attempt ? { attempt, choice } : {}) }));
      for (const { id, ok } of validHistory) result.review[id] = ok;
    }
    result.drills = Object.fromEntries(Object.entries(raw.drills ?? {}).filter(([id, log]) => drillIds.has(id) && validLog(log))
      .map(([id, { notes, checked, count, date }]) => [id, { notes, checked, count, date }]));
    if (validDate(raw.target)) result.target = raw.target;
    if (validDate(raw.updated)) result.updated = raw.updated;
    return result;
  }

  function parseBackup(raw) {
    if (!object(raw) || ![1, 2].includes(raw.version) || !profiles.includes(raw.profile) ||
        !validMap(raw.topics, topicIds, value => statuses.includes(value)) ||
        !Array.isArray(raw.quiz) || raw.quiz.length > historyLimit || !raw.quiz.every(validEntry) ||
        !validMap(raw.drills, drillIds, validLog) ||
        !(raw.target === '' || validDate(raw.target)) || !(raw.updated === null || validDate(raw.updated))) {
      throw new Error('Formato del backup non valido');
    }
    const result = cleanCore(raw);
    if (raw.version === 2) {
      if (!validMap(raw.review, answerKeys, value => typeof value === 'boolean') ||
          !validMap(raw.drafts, drillIds, validDraft) ||
          Object.entries(result.review).some(([id, ok]) => raw.review[id] !== ok)) {
        throw new Error('Cronologia o bozze del backup non valide');
      }
      result.review = { ...raw.review };
      result.drafts = Object.fromEntries(Object.entries(raw.drafts).map(([id, { notes, checked }]) => [id, { notes, checked }]));
      if (Object.hasOwn(raw, 'reading')) {
        if (!validReading(raw.reading)) throw new Error('Preferenze di lettura non valide');
        const { size, contrast, quick, line, spacing, chapter } = raw.reading;
        result.reading = { size, contrast, quick, line, spacing, chapter };
        return { snapshot: result, includesReading: true };
      }
    }
    return { snapshot: result, includesReading: false };
  }

  function legacyRecord() {
    const record = { snapshot: empty(), recovery: null, generation: 0 };
    try {
      const raw = JSON.parse(localStorage.getItem(legacyKey));
      if (object(raw) && raw.version === 1) record.snapshot = cleanCore(raw);
    } catch {
      // The original value is left intact if a previous installation cannot be read.
    }
    try {
      const size = Number(localStorage.getItem('brera-size')) || 1;
      record.snapshot.reading.size = Math.max(0.85, Math.min(size, 1.5));
      record.snapshot.reading.contrast = localStorage.getItem('brera-contrast') === '1';
      record.snapshot.reading.quick = localStorage.getItem('brera-quick') === '1';
    } catch {
      // The default reading preferences also work in a temporary session.
    }
    return record;
  }

  const events = new EventTarget();
  let current = legacyRecord();
  let available = false;
  let conflict = false;
  let pending = [];
  let opening;
  let queue = Promise.resolve();
  let channel;
  try { channel = new BroadcastChannel(databaseName); } catch { /* Refresh on focus as a fallback. */ }

  function connect() {
    if (!opening) {
      opening = new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName, 1);
        request.onupgradeneeded = () => request.result.createObjectStore('study');
        request.onblocked = () => reject(new Error('Database in uso'));
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          db.onversionchange = () => { db.close(); opening = undefined; };
          db.onclose = () => { opening = undefined; };
          resolve(db);
        };
      }).catch(error => {
        opening = undefined;
        throw error;
      });
    }
    return opening;
  }

  async function transaction(transform) {
    const db = await connect();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('study', 'readwrite');
      const table = tx.objectStore('study');
      const request = table.get('state');
      let outcome;
      let failure;
      request.onsuccess = () => {
        try {
          const previous = request.result ?? legacyRecord();
          outcome = transform(previous);
          if (outcome !== previous || !request.result) table.put(outcome, 'state');
        } catch (error) {
          failure = error;
          tx.abort();
        }
      };
      tx.oncomplete = () => resolve(outcome);
      tx.onabort = () => reject(failure ?? tx.error ?? new Error('Scrittura annullata'));
    });
  }

  function serialize(work) {
    const run = queue.then(work);
    queue = run.catch(() => {});
    return run;
  }

  function publish(origin, broadcast = false) {
    events.dispatchEvent(new CustomEvent('change', { detail: origin }));
    if (broadcast) channel?.postMessage('update');
  }

  const refresh = () => serialize(async () => {
    if (pending.length) return;
    try {
      current = await transaction(record => record);
      available = true;
      conflict = false;
    } catch {
      available = false;
    }
    publish('remote');
  });

  function update(change) {
    const generation = current.generation;
    return serialize(async () => {
      pending.push(change);
      try {
        current = await transaction(record => {
          if (record.generation !== generation || conflict) {
            const error = new Error('Versione dello studio sostituita in un’altra scheda');
            error.name = 'StudyConflict';
            throw error;
          }
          for (const apply of pending) apply(record.snapshot);
          return { ...record };
        });
        pending = [];
        available = true;
        conflict = false;
      } catch (error) {
        if (generation !== current.generation) {
          pending.pop();
          return false;
        }
        change(current.snapshot);
        available = false;
        conflict = error.name === 'StudyConflict';
      }
      publish('local', available);
      return available;
    });
  }

  function replace(mode, backup) {
    return serialize(async () => {
      try {
        const next = await transaction(record => {
          if (mode === 'undo' && !record.recovery) throw new Error('Nessuno stato precedente');
          const previous = structuredClone(record.snapshot);
          if (record.generation === current.generation) pending.forEach(apply => apply(previous));
          const snapshot = mode === 'undo' ? record.recovery : mode === 'import' ? backup.snapshot : empty();
          if (mode === 'reset' || (mode === 'import' && !backup.includesReading)) snapshot.reading = previous.reading;
          return { snapshot, recovery: previous, generation: record.generation + 1 };
        });
        current = next;
        pending = [];
        available = true;
        conflict = false;
        publish('replace', true);
        return true;
      } catch {
        // Leave the current contents and the previous recovery copy available after a failed replacement.
        publish('replace-failed');
        return false;
      }
    });
  }

  function exportData(includeReading) {
    const { reading, ...study } = current.snapshot;
    return { ...study, ...(includeReading ? { reading } : {}), exportedAt: new Date().toISOString() };
  }

  if (channel) channel.onmessage = refresh;
  window.addEventListener('focus', refresh);
  const ready = refresh();

  window.BreraStore = {
    events, ready, update, replace, exportData, parseBackup, today, calendarDay, validDate, historyLimit, notesLimit,
    settled: () => queue,
    get snapshot() { return current.snapshot; },
    get generation() { return current.generation; },
    get hasRecovery() { return Boolean(current.recovery); },
    get available() { return available; },
    get conflict() { return conflict; }
  };
})();
