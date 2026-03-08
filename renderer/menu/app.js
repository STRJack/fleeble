// Elements
const segBtns = document.querySelectorAll('.seg-btn');
const panels = document.querySelectorAll('.tab-panel');
const themeGrid = document.getElementById('theme-grid');
const displayList = document.getElementById('display-list');
const posCorners = document.querySelectorAll('.pos-corner');
const dismissSlider = document.getElementById('dismiss-slider');
const dismissValue = document.getElementById('dismiss-value');
const sliderFill = document.getElementById('slider-fill');
const testBtn = document.getElementById('test-btn');
const muteBtn = document.getElementById('mute-btn');
const clearBtn = document.getElementById('clear-btn');
const quitBtn = document.getElementById('quit-btn');
const notifList = document.getElementById('notif-list');
const statusText = document.getElementById('status-text');
const soundList = document.getElementById('sound-list');
const soundPreview = document.getElementById('sound-preview');

const languageList = document.getElementById('language-list');
const approvalModeList = document.getElementById('approval-mode-list');

let state = { settings: {}, displays: [], history: [] };
let isMuted = false;

const SOURCE_NAMES = {
  'claude-code': 'Claude Code',
  'cursor': 'Cursor',
  'codex': 'Codex',
  'copilot': 'Copilot',
  'fleeble': 'Fleeble',
  'unknown': 'AI'
};

const TYPE_MAP = {
  'action': 'action',
  'error': 'error',
  'info': 'info',
  'question': 'action',
  'approval': 'action'
};

// ===== Tabs =====
segBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    segBtns.forEach(b => b.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`panel-${btn.dataset.tab}`).classList.add('active');
  });
});

// ===== Sub-tabs (Timers) =====
document.querySelectorAll('.sub-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    const parent = btn.parentElement;
    parent.querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const panel = parent.parentElement;
    panel.querySelectorAll('.sub-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`subpanel-${btn.dataset.subtab}`).classList.add('active');
  });
});

// ===== Displays =====
function renderDisplays(displays) {
  displayList.innerHTML = displays.map((d, i) => `
    <div class="display-item ${d.selected ? 'selected' : ''}" data-idx="${i}">
      <div class="display-radio"></div>
      <div class="display-icon"></div>
      <span class="display-name">${d.label}</span>
    </div>
  `).join('');

  displayList.querySelectorAll('.display-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.dataset.idx);
      state.displays.forEach((d, i) => d.selected = i === idx);
      renderDisplays(state.displays);
      window.menuAPI.updateSettings({ selectedScreen: idx });
    });
  });
}

// ===== Position =====
function renderPosition(pos) {
  posCorners.forEach(c => c.classList.toggle('active', c.dataset.pos === pos));
}

posCorners.forEach(c => {
  c.addEventListener('click', () => {
    renderPosition(c.dataset.pos);
    window.menuAPI.updateSettings({ position: c.dataset.pos });
  });
});

// ===== Slider =====
function updateSlider() {
  const val = dismissSlider.value;
  const pct = (val - 5) / (120 - 5) * 100;
  dismissValue.textContent = `${val}s`;
  sliderFill.style.width = `${pct}%`;
}

dismissSlider.addEventListener('input', updateSlider);
dismissSlider.addEventListener('change', () => {
  window.menuAPI.updateSettings({ autoDismiss: parseInt(dismissSlider.value) });
});

// ===== Mute =====
muteBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  muteBtn.classList.toggle('muted', isMuted);
  muteBtn.querySelector('.sound-on').style.display = isMuted ? 'none' : '';
  muteBtn.querySelector('.sound-off').style.display = isMuted ? '' : 'none';
  window.menuAPI.updateSettings({ soundEnabled: !isMuted });
});

// ===== Test =====
testBtn.addEventListener('click', () => {
  window.menuAPI.testMascot();
  testBtn.style.transform = 'scale(0.88)';
  setTimeout(() => testBtn.style.transform = '', 150);
});

// ===== Notifications =====
function getTypeLabel(type) {
  const key = `type.${type || 'action'}`;
  return t(key);
}

function renderNotifications(history) {
  if (!history || !history.length) {
    notifList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.3"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </div>
        <span class="empty-text">${esc(t('empty.title'))}</span>
        <span class="empty-hint">${esc(t('empty.hint'))}</span>
      </div>`;
    clearBtn.style.display = 'none';
    return;
  }

  clearBtn.style.display = '';
  notifList.innerHTML = history.map(h => {
    const src = SOURCE_NAMES[h.source] || h.source;
    const typeCss = TYPE_MAP[h.type] || 'action';
    const typeLabel = getTypeLabel(h.type);
    return `
      <div class="notif-item">
        <div class="notif-header">
          <span class="notif-source">${esc(src)}</span>
          <span class="notif-type ${typeCss}">${esc(typeLabel)}</span>
          <span class="notif-time">${timeAgo(h.time)}</span>
        </div>
        <div class="notif-msg">${esc(h.message)}</div>
      </div>`;
  }).join('');
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5) return t('time.now');
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// ===== Clear =====
clearBtn.addEventListener('click', () => {
  window.menuAPI.clearHistory();
  state.history = [];
  renderNotifications([]);
});

// ===== Claude Code Integration =====
const claudeBtn = document.getElementById('claude-connect-btn');
const claudeDesc = document.getElementById('claude-desc');
let claudeConnected = false;

async function refreshClaudeStatus() {
  const status = await window.menuAPI.claudeStatus();
  claudeConnected = status.connected;
  if (claudeConnected) {
    claudeBtn.textContent = t('claude.connected');
    claudeBtn.classList.add('connected');
    claudeDesc.textContent = t('claude.hooksInstalled');
    claudeDesc.classList.add('connected');
  } else {
    claudeBtn.textContent = t('claude.connect');
    claudeBtn.classList.remove('connected');
    claudeDesc.textContent = status.exists ? t('claude.notConnected') : t('claude.settingsNotFound');
    claudeDesc.classList.remove('connected');
  }
}

claudeBtn.addEventListener('click', async () => {
  if (claudeConnected) {
    await window.menuAPI.claudeDisconnect();
  } else {
    await window.menuAPI.claudeConnect();
  }
  await refreshClaudeStatus();
});

claudeBtn.addEventListener('mouseenter', () => {
  if (claudeConnected) claudeBtn.textContent = t('claude.disconnect');
});
claudeBtn.addEventListener('mouseleave', () => {
  if (claudeConnected) claudeBtn.textContent = t('claude.connected');
});

// ===== Cursor Integration =====
const cursorBtn = document.getElementById('cursor-connect-btn');
const cursorDesc = document.getElementById('cursor-desc');
let cursorConnected = false;

async function refreshCursorStatus() {
  const status = await window.menuAPI.cursorStatus();
  cursorConnected = status.connected;
  if (cursorConnected) {
    cursorBtn.textContent = t('cursor.connected');
    cursorBtn.classList.add('connected');
    cursorDesc.textContent = t('cursor.hooksInstalled');
    cursorDesc.classList.add('connected');
  } else {
    cursorBtn.textContent = t('cursor.connect');
    cursorBtn.classList.remove('connected');
    cursorDesc.textContent = status.exists ? t('cursor.notConnected') : t('cursor.settingsNotFound');
    cursorDesc.classList.remove('connected');
  }
}

cursorBtn.addEventListener('click', async () => {
  if (cursorConnected) {
    await window.menuAPI.cursorDisconnect();
  } else {
    await window.menuAPI.cursorConnect();
  }
  await refreshCursorStatus();
});

cursorBtn.addEventListener('mouseenter', () => {
  if (cursorConnected) cursorBtn.textContent = t('cursor.disconnect');
});
cursorBtn.addEventListener('mouseleave', () => {
  if (cursorConnected) cursorBtn.textContent = t('cursor.connected');
});

// ===== Codex CLI Integration =====
const codexBtn = document.getElementById('codex-connect-btn');
const codexDesc = document.getElementById('codex-desc');
let codexConnected = false;

async function refreshCodexStatus() {
  const status = await window.menuAPI.codexStatus();
  codexConnected = status.connected;
  if (codexConnected) {
    codexBtn.textContent = t('codex.connected');
    codexBtn.classList.add('connected');
    codexDesc.textContent = t('codex.configured');
    codexDesc.classList.add('connected');
  } else {
    codexBtn.textContent = t('codex.connect');
    codexBtn.classList.remove('connected');
    codexDesc.textContent = status.exists ? t('codex.notConnected') : t('codex.settingsNotFound');
    codexDesc.classList.remove('connected');
  }
}

codexBtn.addEventListener('click', async () => {
  if (codexConnected) {
    await window.menuAPI.codexDisconnect();
  } else {
    await window.menuAPI.codexConnect();
  }
  await refreshCodexStatus();
});

codexBtn.addEventListener('mouseenter', () => {
  if (codexConnected) codexBtn.textContent = t('codex.disconnect');
});
codexBtn.addEventListener('mouseleave', () => {
  if (codexConnected) codexBtn.textContent = t('codex.connected');
});

// ===== Do Not Disturb =====
const dndBtn = document.getElementById('dnd-btn');
const dndLabel = document.getElementById('dnd-label');
let isDnd = false;

function updateDndUI(dnd) {
  isDnd = dnd;
  dndBtn.classList.toggle('active', dnd);
  dndLabel.textContent = dnd ? t('dnd.on') : t('dnd.off');
}

dndBtn.addEventListener('click', () => {
  window.menuAPI.toggleDnd();
});

window.menuAPI.onDndChanged((dnd) => {
  updateDndUI(dnd);
});

// ===== Quit =====
quitBtn.addEventListener('click', () => window.menuAPI.quitApp());

// ===== IPC =====
window.menuAPI.onUpdateState((data) => {
  state = data;
  if (data.language) setLanguage(data.language);
  renderDisplays(data.displays);
  renderPosition(data.settings.position || 'top-right');
  dismissSlider.value = data.settings.autoDismiss || 30;
  updateSlider();

  isMuted = data.settings.soundEnabled === false;
  muteBtn.classList.toggle('muted', isMuted);
  muteBtn.querySelector('.sound-on').style.display = isMuted ? 'none' : '';
  muteBtn.querySelector('.sound-off').style.display = isMuted ? '' : 'none';

  renderNotifications(data.history);
  refreshClaudeStatus();
  refreshCursorStatus();
  refreshCodexStatus();
  updateDndUI(data.settings.dnd || false);
  renderLanguagePicker();

  // Load new features data
  loadClipboardData();
  loadReminders();
  loadPomodoroStatus();
  loadNotes();
});

window.menuAPI.onNewNotification((entry) => {
  state.history.unshift(entry);
  renderNotifications(state.history);
  statusText.textContent = `← ${SOURCE_NAMES[entry.source] || entry.source}`;
  setTimeout(() => { statusText.textContent = t('status.ready'); }, 4000);
});

// ===== Notification Sound =====
let currentSound = 'default';
let soundsData = null;

async function loadAndRenderSounds() {
  const { sounds, current } = await window.menuAPI.getSounds();
  soundsData = sounds;
  currentSound = current;
  renderSounds();
}

function renderSounds() {
  if (!soundsData) return;
  soundList.innerHTML = Object.entries(soundsData).map(([key, snd]) => {
    const isSelected = key === currentSound;
    return `
      <div class="sound-item ${isSelected ? 'selected' : ''}" data-sound="${key}">
        <div class="sound-icon">
          ${isSelected
            ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 13l4 4L19 7"/></svg>'
            : '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/></svg>'
          }
        </div>
        <span class="sound-name">${esc(snd.label)}</span>
        <button class="sound-preview-btn" data-file="${snd.file}" title="Preview">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </button>
      </div>`;
  }).join('');

  soundList.querySelectorAll('.sound-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.sound-preview-btn')) return;
      const name = item.dataset.sound;
      if (name === currentSound) return;
      currentSound = name;
      window.menuAPI.changeSound(name);
      renderSounds();
      previewSound(soundsData[name].file);
    });
  });

  soundList.querySelectorAll('.sound-preview-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      previewSound(btn.dataset.file);
    });
  });
}

function previewSound(file) {
  soundPreview.src = `../assets/${file}`;
  soundPreview.currentTime = 0;
  soundPreview.play().catch(() => {});
}

loadAndRenderSounds();

// ===== Themes =====
let currentTheme = 'dark';
let themesData = null;

function applyTheme({ name, vars }) {
  currentTheme = name;
  const root = document.documentElement;
  for (const [key, val] of Object.entries(vars)) {
    root.style.setProperty(key, val);
  }
  if (themeGrid) {
    themeGrid.querySelectorAll('.theme-card').forEach(card => {
      card.classList.toggle('active', card.dataset.theme === name);
    });
  }
}

async function loadAndRenderThemes() {
  const { themes, current } = await window.menuAPI.getThemes();
  themesData = themes;
  currentTheme = current;
  renderThemes();
}

function renderThemes() {
  if (!themesData) return;
  themeGrid.innerHTML = Object.entries(themesData).map(([key, theme]) => {
    const vars = theme.vars;
    const bg = vars['--bg'];
    const accent = vars['--accent'];
    const text = vars['--text-1'];
    const isActive = key === currentTheme;
    return `
      <div class="theme-card ${isActive ? 'active' : ''}" data-theme="${key}">
        <div class="theme-preview" style="background: ${bg}">
          <div class="theme-preview-dot" style="background: ${accent}"></div>
          <div class="theme-preview-lines">
            <div class="theme-preview-line" style="background: ${text}"></div>
            <div class="theme-preview-line" style="background: ${text}"></div>
          </div>
        </div>
        <div class="theme-label" style="color: ${text}; background: ${bg}">${esc(theme.label)}</div>
      </div>`;
  }).join('');

  themeGrid.querySelectorAll('.theme-card').forEach(card => {
    card.addEventListener('click', () => {
      const name = card.dataset.theme;
      if (name === currentTheme) return;
      currentTheme = name;
      window.menuAPI.applyTheme(name);
      themeGrid.querySelectorAll('.theme-card').forEach(c => {
        c.classList.toggle('active', c.dataset.theme === name);
      });
    });
  });
}

window.menuAPI.onApplyTheme(applyTheme);
loadAndRenderThemes();

// ===== Language Picker =====
function renderLanguagePicker() {
  const currentLang = getLanguage();
  languageList.querySelectorAll('.sound-item').forEach(item => {
    const isSelected = item.dataset.lang === currentLang;
    item.classList.toggle('selected', isSelected);
    item.querySelector('.sound-icon').innerHTML = isSelected
      ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 13l4 4L19 7"/></svg>'
      : '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/></svg>';
  });
}

languageList.querySelectorAll('.sound-item').forEach(item => {
  item.addEventListener('click', () => {
    const lang = item.dataset.lang;
    if (lang === getLanguage()) return;
    window.menuAPI.changeLanguage(lang);
    setLanguage(lang);
    renderLanguagePicker();
    renderNotifications(state.history);
    refreshClaudeStatus();
    refreshCursorStatus();
    refreshCodexStatus();
    updateDndUI(isDnd);
  });
});

window.menuAPI.onLanguageChanged((lang) => {
  setLanguage(lang);
  renderLanguagePicker();
  renderNotifications(state.history);
  refreshClaudeStatus();
  refreshCursorStatus();
  refreshCodexStatus();
  updateDndUI(isDnd);
});

window.menuAPI.getLanguage().then(lang => {
  setLanguage(lang);
  renderLanguagePicker();
});

// ===== Approval Mode Picker =====
let currentApprovalMode = 'manage';

function renderApprovalModePicker() {
  approvalModeList.querySelectorAll('.sound-item').forEach(item => {
    const isSelected = item.dataset.mode === currentApprovalMode;
    item.classList.toggle('selected', isSelected);
    item.querySelector('.sound-icon').innerHTML = isSelected
      ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 13l4 4L19 7"/></svg>'
      : '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/></svg>';
  });
}

approvalModeList.querySelectorAll('.sound-item').forEach(item => {
  item.addEventListener('click', () => {
    const mode = item.dataset.mode;
    if (mode === currentApprovalMode) return;
    currentApprovalMode = mode;
    window.menuAPI.changeApprovalMode(mode);
    renderApprovalModePicker();
  });
});

window.menuAPI.getApprovalMode().then(mode => {
  currentApprovalMode = mode;
  renderApprovalModePicker();
});

// ==========================================
// ===== CLIPBOARD TAB =====
// ==========================================

const clipboardList = document.getElementById('clipboard-list');
const clipboardOpenBtn = document.getElementById('clipboard-open-btn');

async function loadClipboardData() {
  const items = await window.menuAPI.getClipboardHistory({ filter: 'all' });
  renderClipboardList(items ? items.slice(0, 10) : []);
}

function renderClipboardList(items) {
  if (!items || !items.length) {
    clipboardList.innerHTML = `
      <div class="empty-state small">
        <span class="empty-text">${esc(t('clipboard.empty'))}</span>
        <span class="empty-hint">${esc(t('clipboard.emptyHint'))}</span>
      </div>`;
    return;
  }

  clipboardList.innerHTML = items.map(item => {
    const catLabel = item.category || 'text';
    if (item.type === 'image') {
      return `
        <div class="clip-item" data-id="${item.id}">
          <span class="clip-category image">${esc(t('clipboard.images'))}</span>
          ${item.thumbnail ? `<img class="clip-thumb" src="${item.thumbnail}" alt="">` : ''}
          <span class="clip-time">${timeAgo(item.timestamp)}</span>
          ${item.pinned ? '<span class="clip-pin">★</span>' : ''}
        </div>`;
    }
    return `
      <div class="clip-item" data-id="${item.id}">
        <span class="clip-category ${catLabel}">${esc(catLabel)}</span>
        <span class="clip-preview">${esc(item.content || '')}</span>
        <span class="clip-time">${timeAgo(item.timestamp)}</span>
        ${item.pinned ? '<span class="clip-pin">★</span>' : ''}
      </div>`;
  }).join('');

  clipboardList.querySelectorAll('.clip-item').forEach(item => {
    item.addEventListener('click', () => {
      window.menuAPI.clipboardCopy(item.dataset.id);
      // Brief visual feedback
      item.style.background = 'var(--accent-soft)';
      setTimeout(() => item.style.background = '', 300);
    });
  });
}

clipboardOpenBtn.addEventListener('click', () => {
  window.menuAPI.toggleClipboardWindow();
});

window.menuAPI.onClipboardUpdated((items) => {
  renderClipboardList(items);
});

// ==========================================
// ===== REMINDERS =====
// ==========================================

const reminderInput = document.getElementById('reminder-input');
const reminderList = document.getElementById('reminder-list');
const durBtns = document.querySelectorAll('.dur-btn');
let selectedDuration = 1800000; // 30min default
let reminderCountdownInterval = null;
let activeRemindersData = [];

durBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    durBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedDuration = parseInt(btn.dataset.delay);
  });
});

reminderInput.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter' && reminderInput.value.trim()) {
    await window.menuAPI.addReminder({ message: reminderInput.value.trim(), delayMs: selectedDuration });
    reminderInput.value = '';
  }
});

async function loadReminders() {
  activeRemindersData = await window.menuAPI.getActiveReminders();
  renderReminders();
}

function renderReminders() {
  if (!activeRemindersData || !activeRemindersData.length) {
    reminderList.innerHTML = `
      <div class="empty-state small">
        <span class="empty-text">${esc(t('timers.noReminders'))}</span>
      </div>`;
    stopReminderCountdown();
    return;
  }

  reminderList.innerHTML = activeRemindersData.map(r => `
    <div class="reminder-item" data-id="${r.id}">
      <span class="reminder-msg">${esc(r.message)}</span>
      <span class="reminder-countdown" data-fire-at="${r.fireAt}"></span>
      <button class="reminder-delete-btn" data-id="${r.id}" title="${t('timers.delete')}">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  `).join('');

  reminderList.querySelectorAll('.reminder-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.menuAPI.deleteReminder(btn.dataset.id);
    });
  });

  startReminderCountdown();
}

function startReminderCountdown() {
  stopReminderCountdown();
  updateReminderCountdowns();
  reminderCountdownInterval = setInterval(updateReminderCountdowns, 1000);
}

function stopReminderCountdown() {
  if (reminderCountdownInterval) {
    clearInterval(reminderCountdownInterval);
    reminderCountdownInterval = null;
  }
}

function updateReminderCountdowns() {
  const countdowns = reminderList.querySelectorAll('.reminder-countdown');
  countdowns.forEach(el => {
    const fireAt = parseInt(el.dataset.fireAt);
    const remaining = Math.max(0, fireAt - Date.now());
    el.textContent = formatCountdown(remaining);
  });
}

function formatCountdown(ms) {
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min >= 60) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h${m > 0 ? String(m).padStart(2, '0') + 'm' : ''}`;
  }
  return `${min}:${String(sec).padStart(2, '0')}`;
}

window.menuAPI.onRemindersUpdated((reminders) => {
  activeRemindersData = reminders;
  renderReminders();
});

// ==========================================
// ===== POMODORO =====
// ==========================================

const pomoRing = document.getElementById('pomo-ring');
const pomoTime = document.getElementById('pomo-time');
const pomoPhase = document.getElementById('pomo-phase');
const pomoCycles = document.getElementById('pomo-cycles');
const pomoMainBtn = document.getElementById('pomo-main-btn');
const pomoResetBtn = document.getElementById('pomo-reset-btn');
const pomoSkipBtn = document.getElementById('pomo-skip-btn');

const RING_CIRCUMFERENCE = 2 * Math.PI * 52; // ~326.726
let pomodoroData = { phase: 'idle', remainingMs: 0, totalMs: 0, cycleCount: 0, totalCycles: 4, isPaused: false };
let pomodoroInterval = null;

async function loadPomodoroStatus() {
  pomodoroData = await window.menuAPI.getPomodoroStatus();
  renderPomodoro();
}

function renderPomodoro() {
  const { phase, remainingMs, totalMs, cycleCount, totalCycles, isPaused } = pomodoroData;

  // Time display
  const totalSec = Math.ceil(remainingMs / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  pomoTime.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

  // Phase label
  const phaseKeys = { idle: 'pomodoro.idle', focus: 'pomodoro.focus', 'short-break': 'pomodoro.shortBreak', 'long-break': 'pomodoro.longBreak' };
  pomoPhase.textContent = t(phaseKeys[phase] || 'pomodoro.idle');

  // Ring progress
  if (phase === 'idle' || totalMs === 0) {
    pomoRing.style.strokeDashoffset = '0';
  } else {
    const progress = 1 - (remainingMs / totalMs);
    pomoRing.style.strokeDashoffset = String(progress * RING_CIRCUMFERENCE);
  }

  // Cycle dots
  const dots = pomoCycles.querySelectorAll('.cycle-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('completed', i < cycleCount);
  });

  // Button states
  if (phase === 'idle') {
    pomoMainBtn.textContent = t('pomodoro.start');
    pomoMainBtn.onclick = () => window.menuAPI.pomodoroStart();
  } else if (isPaused) {
    pomoMainBtn.textContent = t('pomodoro.resume');
    pomoMainBtn.onclick = () => window.menuAPI.pomodoroResume();
  } else {
    pomoMainBtn.textContent = t('pomodoro.pause');
    pomoMainBtn.onclick = () => window.menuAPI.pomodoroPause();
  }

  // Start/stop local countdown for smooth updates
  if (phase !== 'idle' && !isPaused) {
    startPomodoroCountdown();
  } else {
    stopPomodoroCountdown();
  }
}

function startPomodoroCountdown() {
  stopPomodoroCountdown();
  pomodoroInterval = setInterval(() => {
    if (pomodoroData.remainingMs > 0) {
      pomodoroData.remainingMs = Math.max(0, pomodoroData.remainingMs - 1000);
      renderPomodoro();
    }
  }, 1000);
}

function stopPomodoroCountdown() {
  if (pomodoroInterval) {
    clearInterval(pomodoroInterval);
    pomodoroInterval = null;
  }
}

pomoResetBtn.addEventListener('click', () => window.menuAPI.pomodoroReset());
pomoSkipBtn.addEventListener('click', () => window.menuAPI.pomodoroSkip());

window.menuAPI.onPomodoroUpdated((data) => {
  pomodoroData = data;
  renderPomodoro();
});

// ==========================================
// ===== NOTES =====
// ==========================================

const notesListView = document.getElementById('notes-list-view');
const notesEditView = document.getElementById('notes-edit-view');
const notesSearch = document.getElementById('notes-search');
const notesList = document.getElementById('notes-list');
const notesNewBtn = document.getElementById('notes-new-btn');
const notesBackBtn = document.getElementById('notes-back-btn');
const notesDeleteBtn = document.getElementById('notes-delete-btn');
const noteTitleInput = document.getElementById('note-title-input');
const noteContentInput = document.getElementById('note-content-input');

let notesData = [];
let editingNoteId = null;
let autoSaveTimeout = null;

async function loadNotes() {
  notesData = await window.menuAPI.getNotes();
  renderNotesList();
}

function renderNotesList() {
  if (!notesData || !notesData.length) {
    notesList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <span class="empty-text">${esc(t('notes.empty'))}</span>
        <span class="empty-hint">${esc(t('notes.emptyHint'))}</span>
      </div>`;
    return;
  }

  notesList.innerHTML = notesData.map(n => {
    const title = n.title || t('notes.untitled');
    const preview = (n.content || '').slice(0, 60);
    const date = new Date(n.updated).toLocaleDateString();
    return `
      <div class="note-card" data-id="${n.id}">
        <div class="note-card-title">${esc(title)}</div>
        ${preview ? `<div class="note-card-preview">${esc(preview)}</div>` : ''}
        <div class="note-card-date">${date}</div>
      </div>`;
  }).join('');

  notesList.querySelectorAll('.note-card').forEach(card => {
    card.addEventListener('click', () => openNoteEditor(card.dataset.id));
  });
}

function openNoteEditor(noteId) {
  const note = notesData.find(n => n.id === noteId);
  if (!note) return;
  editingNoteId = noteId;
  noteTitleInput.value = note.title || '';
  noteContentInput.value = note.content || '';
  notesListView.style.display = 'none';
  notesEditView.style.display = 'block';
}

function closeNoteEditor() {
  if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
  editingNoteId = null;
  notesEditView.style.display = 'none';
  notesListView.style.display = 'block';
  loadNotes();
}

notesNewBtn.addEventListener('click', async () => {
  const note = await window.menuAPI.createNote({ title: '', content: '' });
  if (note) {
    notesData.unshift(note);
    openNoteEditor(note.id);
  }
});

notesBackBtn.addEventListener('click', closeNoteEditor);

notesDeleteBtn.addEventListener('click', () => {
  if (editingNoteId) {
    window.menuAPI.deleteNote(editingNoteId);
    closeNoteEditor();
  }
});

function scheduleAutoSave() {
  if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    if (editingNoteId) {
      window.menuAPI.updateNote({
        id: editingNoteId,
        title: noteTitleInput.value,
        content: noteContentInput.value
      });
    }
  }, 1000);
}

noteTitleInput.addEventListener('input', scheduleAutoSave);
noteContentInput.addEventListener('input', scheduleAutoSave);

let notesSearchTimeout = null;
notesSearch.addEventListener('input', () => {
  if (notesSearchTimeout) clearTimeout(notesSearchTimeout);
  notesSearchTimeout = setTimeout(async () => {
    const query = notesSearch.value.trim();
    notesData = await window.menuAPI.getNotes(query || undefined);
    renderNotesList();
  }, 300);
});

window.menuAPI.onNotesUpdated((notes) => {
  notesData = notes;
  if (!editingNoteId) renderNotesList();
});
