/* ===== CONFIG ===== */
const API = '';  // empty = same origin; set to 'http://localhost:5000' for dev
const TOTAL_DAYS = 28;

/* ===== TIME HELPERS ===== */
function formatTime(totalMinutes) {
  if (!totalMinutes || totalMinutes <= 0) return '0 min';
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatTimeShort(totalMinutes) {
  if (!totalMinutes || totalMinutes <= 0) return '0m';
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m > 0 ? `${h}h${m}m` : `${h}h`;
}

/* ===== STERN MESSAGES ===== */
const STERN = [
  { emoji: '😤', msg: 'Sitz. Kein Task, kein Fortschritt. Öffne die Ressource.' },
  { emoji: '🧐', msg: 'Ich warte. Die Ressource öffnet sich nicht von alleine.' },
  { emoji: '📌', msg: 'Du kannst nicht "Erledigt" klicken ohne es zu erledigen. Das ist der Sinn der App.' },
  { emoji: '🇩🇪', msg: 'Deutsch lernt sich nicht durch Knopfdrücken. Öffne den Link.' },
  { emoji: '😒', msg: 'Noch einmal — öffne zuerst die Ressource, dann klickst du "Erledigt".' },
];

const TEACHER_MESSAGES = {
  anki:    ['Anki zuerst. Jeden. Morgen. Ohne Ausnahme.', 'Karteikarten sind der Schlüssel. Nicht überspringen.', 'Review-Queue leeren. Jetzt.'],
  video:   ['Schau das Video. Mach dir mental Notizen.', 'Augen auf. Kein Multitasking.', 'Dieses Video ist deine Pflicht. Schau es.'],
  reading  : ['Lies langsam. Unbekannte Wörter in dein Heft.', 'Lesen bildet. Unbekannte Wörter aufschreiben.', 'Unterstreiche fünf schwere Wörter. Kein Vertun.'],
  grammar: ['Grammatik kommt durch Übung, nicht durch Lesen. Schreib die Sätze.', 'Zehn Sätze. Auf Papier. Nicht im Kopf.', 'Schreiben aktiviert passive Grammatik. Tu es.'],
  speaking: ['Laut sprechen. Dein Nachbar soll es hören.', 'Shadowing bedeutet: gleichzeitig mit dem Audio sprechen.', 'Mach deinen Mund auf. Das ist der Punkt.'],
};

const COMPLETION_MSGS = [
  'Gut gemacht. Ich bin… leicht beeindruckt.',
  'Alle Aufgaben erledigt. Nicht schlecht für heute.',
  'Das war ich nicht erwartet. Aber gut. Morgen wieder.',
  'Ordentlich. Weiter so. Morgen wird es schwerer.',
  'Beeindruckend. Fast. Morgen keine Ausreden mehr.',
];

/* ===== STATE ===== */
let state = {
  deviceId: null,
  progress: null,
  tasks: [],
  currentDay: 1,
  currentTaskIndex: 0,
  currentDayEntry: null,
  isCatchUp: false,
  catchUpDay: null,
  linkClicked: {},   // taskId → boolean
};

/* ===== DEVICE ID ===== */
function getDeviceId() {
  let id = localStorage.getItem('dsl_device_id');
  if (!id) {
    id = 'dsl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem('dsl_device_id', id);
  }
  return id;
}

/* ===== API CALLS ===== */
async function apiFetch(path, opts = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

async function loadProgress() {
  return apiFetch(`/api/progress/${state.deviceId}`);
}

async function loadStats() {
  return apiFetch(`/api/stats/${state.deviceId}`);
}

async function loadTasks() {
  return apiFetch('/api/tasks');
}

async function recordLinkClick(taskId, day) {
  state.linkClicked[taskId] = true;
  return apiFetch(`/api/progress/${state.deviceId}/link-click`, {
    method: 'POST',
    body: JSON.stringify({ taskId, day }),
  });
}

async function completeTask(taskId, day) {
  return apiFetch(`/api/progress/${state.deviceId}/complete-task`, {
    method: 'POST',
    body: JSON.stringify({ taskId, day }),
  });
}

/* ===== DATE HELPERS ===== */
function today() { return new Date().toISOString().split('T')[0]; }

function daysBetween(d1, d2) {
  return Math.floor((new Date(d2) - new Date(d1)) / 86400000);
}

/* ===== DETERMINE WHAT TO SHOW ===== */
function computeCurrentState(progress, allTasks) {
  const t = today();

  // Build per-day task arrays
  const tasksByDay = {};
  for (let d = 1; d <= TOTAL_DAYS; d++) {
    tasksByDay[d] = allTasks.filter(t => t.day === d).sort((a, b) => a.order - b.order);
  }

  const currentDay = progress.currentDay || 1;

  // Check if ALL 28 days done
  if (currentDay > TOTAL_DAYS) return { view: 'finished' };

  // Find the day entry for currentDay
  const dayEntry = (progress.days || []).find(d => d.day === currentDay);
  const dayTasks = tasksByDay[currentDay];

  // Check for missed days (catch-up logic)
  if (progress.lastCompletedDate) {
    const diffFromLastCompleted = daysBetween(progress.lastCompletedDate, t);
    // If last completed date was 2+ days ago AND current day isn't done today
    if (diffFromLastCompleted >= 2 && !(dayEntry && dayEntry.date === t && dayEntry.completed)) {
      // Find earliest incomplete day
      for (let d = 1; d < currentDay; d++) {
        const de = (progress.days || []).find(e => e.day === d);
        if (!de || !de.completed) {
          return { view: 'catchup', catchUpDay: d, tasksByDay, currentDay };
        }
      }
    }
  }

  // Today's day is complete → locked
  if (dayEntry && dayEntry.completed) {
    const lastDone = dayEntry.date;
    if (lastDone === t) return { view: 'locked', progress };
    // Completed on a previous date means currentDay should have advanced already
  }

  // Find next incomplete task
  let nextTaskIndex = 0;
  if (dayEntry) {
    const completedIds = new Set(dayEntry.tasks.filter(t => t.completed).map(t => t.taskId));
    nextTaskIndex = dayTasks.findIndex(t => !completedIds.has(t.id));
    if (nextTaskIndex === -1) {
      // All tasks done but dayEntry not marked complete yet → edge case
      return { view: 'locked', progress };
    }
  }

  return {
    view: 'task',
    day: currentDay,
    taskIndex: nextTaskIndex,
    dayTasks,
    dayEntry,
    isCatchUp: false,
  };
}

/* ===== INIT ===== */
async function init() {
  showScreen('loading-screen');
  createParticles();

  state.deviceId = getDeviceId();

  try {
    const [progress, allTasks] = await Promise.all([loadProgress(), loadTasks()]);
    state.progress = progress;
    state.tasks = allTasks;

    updateHeaderStats(progress);
    // Load time in background so header updates without blocking render
    loadStats().then(stats => updateTimeDisplay(stats.totalMinutesSpent || 0)).catch(() => {});

    // First time
    if (!progress.startDate || (progress.days || []).length === 0) {
      showScreen('welcome-screen');
      return;
    }

    const computed = computeCurrentState(progress, allTasks);
    renderView(computed, allTasks, progress);

  } catch (err) {
    console.error(err);
    document.getElementById('loading-screen').innerHTML = `
      <p style="color:var(--red);text-align:center;padding:40px;">
        Verbindungsfehler.<br><small>${err.message}</small><br><br>
        <button class="btn-secondary" onclick="location.reload()">Nochmal versuchen</button>
      </p>`;
  }
}

/* ===== RENDER VIEW ===== */
function renderView(computed, allTasks, progress) {
  allTasks = allTasks || state.tasks;
  progress = progress || state.progress;

  if (computed.view === 'finished') {
    showScreen('finished-screen');
    return;
  }

  if (computed.view === 'locked') {
    showScreen('locked-screen');
    startCountdown();
    document.getElementById('locked-streak').textContent = progress.streakCount || 0;
    document.getElementById('locked-total').textContent = progress.totalTasksCompleted || 0;
    // Time stats for locked screen
    loadStats().then(stats => {
      const todayEntry = (stats.days || []).find(d => d.date === today());
      document.getElementById('locked-time-today').textContent = formatTimeShort(todayEntry?.minutesSpent || 0);
      document.getElementById('locked-time-total').textContent = formatTimeShort(stats.totalMinutesSpent || 0);
    }).catch(() => {});
    return;
  }

  if (computed.view === 'catchup') {
    const { catchUpDay, tasksByDay, currentDay } = computed;
    const dayTasks = tasksByDay[catchUpDay];
    const dayEntry = (progress.days || []).find(d => d.day === catchUpDay);
    let nextIdx = 0;
    if (dayEntry) {
      const done = new Set(dayEntry.tasks.filter(t => t.completed).map(t => t.taskId));
      nextIdx = dayTasks.findIndex(t => !done.has(t.id));
      if (nextIdx === -1) nextIdx = 0;
    }
    state.isCatchUp = true;
    state.catchUpDay = catchUpDay;
    showTask(dayTasks, nextIdx, catchUpDay, true, progress);
    return;
  }

  if (computed.view === 'task') {
    state.isCatchUp = false;
    showTask(computed.dayTasks, computed.taskIndex, computed.day, false, progress);
    return;
  }
}

/* ===== SHOW TASK ===== */
function showTask(dayTasks, taskIndex, day, isCatchUp, progress) {
  state.currentDay = day;
  state.currentTaskIndex = taskIndex;

  const task = dayTasks[taskIndex];
  if (!task) return;

  showScreen('task-screen');

  // Catch-up banner
  const banner = document.getElementById('catchup-banner');
  if (isCatchUp) banner.classList.remove('hidden');
  else banner.classList.add('hidden');

  // Week label
  document.getElementById('task-week-label').textContent = `Woche ${task.week} · Fokus: ${weekFocus(task.week)}`;

  // Task card type
  const card = document.getElementById('task-card');
  card.setAttribute('data-type', task.type);
  card.style.animation = 'none';
  requestAnimationFrame(() => { card.style.animation = 'cardIn 0.5s cubic-bezier(0.34,1.56,0.64,1)'; });

  // Badge
  const icons = { anki: '🃏', video: '📺', reading: '📖', grammar: '✏️', speaking: '🎤' };
  const labels = { anki: 'Anki Review', video: 'Video', reading: 'Lesen', grammar: 'Grammatik', speaking: 'Sprechen' };
  document.getElementById('task-icon').textContent = icons[task.type] || '📌';
  document.getElementById('task-type-label').textContent = labels[task.type] || task.type;
  document.getElementById('task-duration').textContent = `⏱ ${task.duration_minutes} min`;

  document.getElementById('task-title').textContent = task.title;
  document.getElementById('task-instruction').textContent = task.instruction;

  // Resource links
  const linksContainer = document.getElementById('resource-links');
  linksContainer.innerHTML = '';

  const resources = [];
  if (task.resource_url) resources.push({ url: task.resource_url, label: task.resource_label || 'Ressource öffnen' });
  if (task.resource_url_2) resources.push({ url: task.resource_url_2, label: task.resource_label_2 || 'Zweite Ressource' });

  resources.forEach(({ url, label }) => {
    const btn = document.createElement('a');
    btn.href = url;
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.className = 'resource-btn';
    btn.dataset.taskId = task.id;
    btn.innerHTML = `<span>↗ ${label}</span><span class="ext-icon">🔗</span>`;
    btn.addEventListener('click', () => {
      setTimeout(() => {
        btn.classList.add('clicked');
        btn.innerHTML = `<span>✓ ${label}</span><span class="check-mark">✅</span>`;
        state.linkClicked[task.id] = true;
        if (task.requires_link_click) {
          checkDoneButtonState(task);
        }
        recordLinkClick(task.id, day).catch(console.error);
      }, 200);
    });
    linksContainer.appendChild(btn);
  });

  // Done button
  const doneBtn = document.getElementById('done-btn');
  const doneHint = document.getElementById('done-hint');

  const linkAlreadyClicked = state.linkClicked[task.id];
  const noLinkRequired = !task.requires_link_click || resources.length === 0;

  doneBtn.disabled = !(linkAlreadyClicked || noLinkRequired);

  if (noLinkRequired) {
    doneHint.style.display = 'none';
  } else {
    doneHint.style.display = 'block';
    doneHint.textContent = linkAlreadyClicked
      ? '✓ Ressource geöffnet — du kannst fortfahren.'
      : 'Öffne zuerst die Ressource oben.';
  }

  doneBtn.onclick = () => handleDone(task, dayTasks, day, isCatchUp, progress);

  // Progress dots
  renderDots(dayTasks, taskIndex, progress, day);

  // Teacher speech
  const msgs = TEACHER_MESSAGES[task.type] || TEACHER_MESSAGES.video;
  const msg = task.teacher_intro || msgs[Math.floor(Math.random() * msgs.length)];
  typeMessage(msg);
  setAvatarMood('normal');

  // Header
  document.getElementById('day-badge').textContent = isCatchUp
    ? `Nachholung · Tag ${day}`
    : `Tag ${day} / ${TOTAL_DAYS}`;
}

function checkDoneButtonState(task) {
  const doneBtn = document.getElementById('done-btn');
  const doneHint = document.getElementById('done-hint');
  if (state.linkClicked[task.id]) {
    doneBtn.disabled = false;
    doneHint.textContent = '✓ Ressource geöffnet — du kannst fortfahren.';
  }
}

/* ===== HANDLE DONE ===== */
async function handleDone(task, dayTasks, day, isCatchUp, progress) {
  const doneBtn = document.getElementById('done-btn');
  doneBtn.disabled = true;
  doneBtn.textContent = '…';

  try {
    const updatedProgress = await completeTask(task.id, day);
    state.progress = updatedProgress;
    updateHeaderStats(updatedProgress);

    const nextIndex = state.currentTaskIndex + 1;

    if (nextIndex >= dayTasks.length) {
      // Day complete!
      if (isCatchUp) {
        // After catch-up, reload to check if there are more catch-up days
        await loadAndRender();
        return;
      }
      showCompletion(updatedProgress, day);
    } else {
      showTask(dayTasks, nextIndex, day, isCatchUp, updatedProgress);
    }
  } catch (err) {
    console.error(err);
    doneBtn.disabled = false;
    doneBtn.textContent = '✓ Erledigt — Nächste Aufgabe';
    showStern({ emoji: '⚠️', msg: 'Verbindungsfehler. Versuche es erneut.' });
  }
}

async function loadAndRender() {
  const [progress, allTasks] = await Promise.all([loadProgress(), loadTasks()]);
  state.progress = progress;
  state.tasks = allTasks;
  updateHeaderStats(progress);
  const computed = computeCurrentState(progress, allTasks);
  renderView(computed, allTasks, progress);
}

/* ===== COMPLETION ===== */
function showCompletion(progress, day) {
  showScreen('completion-screen');
  setAvatarMood('happy');

  const msg = COMPLETION_MSGS[Math.floor(Math.random() * COMPLETION_MSGS.length)];
  document.getElementById('completion-speech-text').textContent = msg;

  document.getElementById('stat-streak').textContent = progress.streakCount || 0;
  document.getElementById('stat-total').textContent = progress.totalTasksCompleted || 0;
  document.getElementById('stat-day').textContent = day;
  document.getElementById('next-day-num').textContent = day + 1;

  const title = day === TOTAL_DAYS ? 'Tag 28 — Fertig! Glückwunsch!' : `Tag ${day} abgeschlossen!`;
  document.getElementById('completion-title').textContent = title;

  if (day === TOTAL_DAYS) {
    document.getElementById('completion-message').textContent = '28 Tage. Alle Aufgaben. Dein Deutsch ist jetzt auf einem anderen Level.';
    setTimeout(() => showScreen('finished-screen'), 4000);
  }

  // Load time stats for completion screen
  loadStats().then(stats => {
    const todayEntry = (stats.days || []).find(d => d.date === today());
    document.getElementById('stat-time-today').textContent = formatTimeShort(todayEntry?.minutesSpent || 0);
    document.getElementById('stat-time-total').textContent = formatTimeShort(stats.totalMinutesSpent || 0);
    updateTimeDisplay(stats.totalMinutesSpent || 0);
  }).catch(() => {});

  fireConfetti();
  updateHeaderStats(progress);
}

/* ===== DOTS ===== */
function renderDots(dayTasks, currentIdx, progress, day) {
  const container = document.getElementById('task-dots');
  container.innerHTML = '';

  const completedIds = new Set();
  const dayEntry = (progress?.days || []).find(d => d.day === day);
  if (dayEntry) dayEntry.tasks.filter(t => t.completed).forEach(t => completedIds.add(t.taskId));

  dayTasks.forEach((t, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot';
    if (completedIds.has(t.id)) dot.classList.add('done');
    else if (i === currentIdx) dot.classList.add('active');
    container.appendChild(dot);
  });

  const pct = Math.round(((currentIdx) / dayTasks.length) * 100);
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-label').textContent = `Aufgabe ${currentIdx + 1} von ${dayTasks.length}`;
}

/* ===== HEADER STATS ===== */
function updateHeaderStats(progress) {
  document.getElementById('streak-count').textContent = progress.streakCount || 0;
  const day = progress.currentDay || 1;
  document.getElementById('day-badge').textContent = `Tag ${Math.min(day, TOTAL_DAYS)} / ${TOTAL_DAYS}`;
  updateTimeDisplay(progress.totalMinutesSpent || 0);
}

function updateTimeDisplay(totalMinutes) {
  const el = document.getElementById('total-time-display');
  if (el) el.textContent = formatTime(totalMinutes);
}

/* ===== STERN OVERLAY ===== */
function showStern(data) {
  data = data || STERN[Math.floor(Math.random() * STERN.length)];
  document.getElementById('stern-message-text').textContent = data.msg;
  document.querySelector('.stern-emoji').textContent = data.emoji;
  document.getElementById('stern-overlay').classList.remove('hidden');
  setAvatarMood('stern');
}

window.dismissStern = function () {
  document.getElementById('stern-overlay').classList.add('hidden');
  setAvatarMood('normal');
};

/* ===== TEACHER AVATAR MOODS ===== */
function setAvatarMood(mood) {
  const wrap = document.getElementById('avatar-wrap');
  if (!wrap) return;
  wrap.className = 'teacher-avatar-wrap ' + mood;
  setTimeout(() => { wrap.className = 'teacher-avatar-wrap'; }, 1000);
}

/* ===== TYPEWRITER ===== */
let typeTimeout = null;
function typeMessage(msg) {
  const el = document.getElementById('speech-text');
  const cursor = document.getElementById('speech-cursor');
  if (!el) return;

  clearTimeout(typeTimeout);
  el.textContent = '';
  cursor.style.display = 'inline-block';

  let i = 0;
  function step() {
    if (i < msg.length) {
      el.textContent += msg[i++];
      typeTimeout = setTimeout(step, 22);
    } else {
      setTimeout(() => { cursor.style.display = 'none'; }, 1200);
    }
  }
  step();
}

/* ===== COUNTDOWN TIMER ===== */
function startCountdown() {
  function update() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;
    const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    const el = document.getElementById('next-day-time');
    if (el) el.textContent = `Nächste Aufgabe in: ${h}:${m}:${s}`;
  }
  update();
  setInterval(update, 1000);
}

/* ===== CONFETTI ===== */
function fireConfetti() {
  const colors = ['#e8c547', '#5b8dee', '#27c97a', '#e74c5a', '#a855f7'];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDuration = (1.5 + Math.random() * 2) + 's';
    el.style.animationDelay = Math.random() * 0.5 + 's';
    el.style.width = el.style.height = (6 + Math.random() * 8) + 'px';
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}

/* ===== PARTICLES ===== */
function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = (8 + Math.random() * 12) + 's';
    p.style.animationDelay = Math.random() * 10 + 's';
    p.style.width = p.style.height = (1 + Math.random() * 3) + 'px';
    p.style.opacity = 0.3 + Math.random() * 0.4;
    container.appendChild(p);
  }
}

/* ===== WEEK FOCUS ===== */
function weekFocus(week) {
  const f = {
    1: 'Präsens & Modalverben',
    2: 'Perfekt & Dativ',
    3: 'Komparativ & Konjunktiv II',
    4: 'Formal & Interview',
  };
  return f[week] || '';
}

/* ===== SHOW SCREEN ===== */
function showScreen(id) {
  document.getElementById('loading-screen').style.display = 'none';
  ['welcome-screen','task-screen','completion-screen','locked-screen','finished-screen']
    .forEach(s => {
      const el = document.getElementById(s);
      if (el) el.classList.toggle('active', el.id === id);
    });
  if (id === 'loading-screen') {
    document.getElementById('loading-screen').style.display = 'flex';
  }
}

/* ===== START BUTTON ===== */
document.getElementById('start-btn').addEventListener('click', async () => {
  // Create fresh progress entry
  await loadAndRender();
});

/* ===== WARN ON CLOSE BEFORE DONE ===== */
window.addEventListener('beforeunload', (e) => {
  const taskScreen = document.getElementById('task-screen');
  if (taskScreen && taskScreen.classList.contains('active')) {
    e.preventDefault();
    e.returnValue = '';
  }
});

/* ===== BOOT ===== */
init();
