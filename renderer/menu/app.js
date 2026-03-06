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

// Hover effect: show "Disconnect" when connected
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

  // Click to select
  soundList.querySelectorAll('.sound-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.sound-preview-btn')) return;
      const name = item.dataset.sound;
      if (name === currentSound) return;
      currentSound = name;
      window.menuAPI.changeSound(name);
      renderSounds();
      // Also preview the selected sound
      previewSound(soundsData[name].file);
    });
  });

  // Click play to preview
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
  // Update active state on cards
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
      // Update active state immediately
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
    // Re-render dynamic content
    renderNotifications(state.history);
    refreshClaudeStatus();
    refreshCursorStatus();
    refreshCodexStatus();
    updateDndUI(isDnd);
  });
});

// ===== Language Changed (from main) =====
window.menuAPI.onLanguageChanged((lang) => {
  setLanguage(lang);
  renderLanguagePicker();
  renderNotifications(state.history);
  refreshClaudeStatus();
  refreshCursorStatus();
  refreshCodexStatus();
  updateDndUI(isDnd);
});

// Init language on load
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
