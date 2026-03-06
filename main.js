const { app, BrowserWindow, screen, ipcMain, Tray, nativeImage, globalShortcut, shell } = require('electron');
const { execFile } = require('child_process');
const path = require('path');
const http = require('http');
const fs = require('fs');

// Fix macOS transparent window white background (Electron bug #44884)

let overlayWindow;
let bubbleWindow;
let menuWindow;
let tray;
let httpServer;
let bubbleReady = false;
let pendingBubbleQueue = [];
let notifCounter = 0;

let settings = {
  selectedScreen: 0,
  position: 'top-right',
  autoDismiss: 30,
  soundEnabled: true,
  launchAtLogin: false,
  dnd: false,
  theme: 'dark',
  notifSound: 'default',
  mascotPosition: null,  // { x, y } or null for default top-right
  language: null,  // null = auto-detect, 'en' or 'fr'
  approvalMode: 'manage'  // 'manage' = handle in Fleeble, 'notify' = notifications only
};

const SOUNDS = {
  default:        { label: 'Default',      file: 'notif.wav' },
  'pop-alert':    { label: 'Pop Alert',    file: 'sounds/pop-alert.mp3' },
  'bell-ding':    { label: 'Bell Ding',    file: 'sounds/bell-ding.mp3' },
  'bubble-pop':   { label: 'Bubble Pop',   file: 'sounds/bubble-pop.mp3' },
  'soft-chime':   { label: 'Soft Chime',   file: 'sounds/soft-chime.mp3' },
  'correct-tone': { label: 'Correct',      file: 'sounds/correct-tone.mp3' },
  'magic-tone':   { label: 'Magic',        file: 'sounds/magic-tone.mp3' },
  'bright-bell':  { label: 'Bright Bell',  file: 'sounds/bright-bell.mp3' }
};

const THEMES = {
  dark: {
    label: 'Dark',
    vars: {
      '--bg': '#12111a',
      '--accent': '#8b5cf6',
      '--accent-rgb': '139, 92, 246',
      '--accent-light': '#a78bfa',
      '--accent-dark': '#7c3aed',
      '--accent-darker': '#6d28d9',
      '--accent-tip': '#c4b5fd',
      '--text-1': '#f1f0f5',
      '--text-2': '#a09cb0',
      '--text-3': '#5e596e',
      '--card-bg': '#1a1b2e',
      '--card-text': '#e2e8f0',
      '--card-text-rgb': '226, 232, 240',
      '--pupil': '#1e1b4b',
      '--surface': 'rgba(255, 255, 255, 0.04)',
      '--surface-hover': 'rgba(255, 255, 255, 0.07)',
      '--border': 'rgba(255, 255, 255, 0.06)',
    }
  },
  light: {
    label: 'Light',
    vars: {
      '--bg': '#f5f5f7',
      '--accent': '#7c3aed',
      '--accent-rgb': '124, 58, 237',
      '--accent-light': '#a78bfa',
      '--accent-dark': '#6d28d9',
      '--accent-darker': '#5b21b6',
      '--accent-tip': '#c4b5fd',
      '--text-1': '#1a1a2e',
      '--text-2': '#4a4560',
      '--text-3': '#8a85a0',
      '--card-bg': '#ffffff',
      '--card-text': '#1a1a2e',
      '--card-text-rgb': '26, 26, 46',
      '--pupil': '#1e1b4b',
      '--surface': 'rgba(0, 0, 0, 0.03)',
      '--surface-hover': 'rgba(0, 0, 0, 0.06)',
      '--border': 'rgba(0, 0, 0, 0.08)',
    }
  },
  midnight: {
    label: 'Midnight',
    vars: {
      '--bg': '#0a0e1a',
      '--accent': '#3b82f6',
      '--accent-rgb': '59, 130, 246',
      '--accent-light': '#60a5fa',
      '--accent-dark': '#2563eb',
      '--accent-darker': '#1d4ed8',
      '--accent-tip': '#93c5fd',
      '--text-1': '#e2e8f0',
      '--text-2': '#94a3b8',
      '--text-3': '#475569',
      '--card-bg': '#111827',
      '--card-text': '#e2e8f0',
      '--card-text-rgb': '226, 232, 240',
      '--pupil': '#0f172a',
      '--surface': 'rgba(255, 255, 255, 0.04)',
      '--surface-hover': 'rgba(255, 255, 255, 0.07)',
      '--border': 'rgba(255, 255, 255, 0.06)',
    }
  },
  rose: {
    label: 'Rose',
    vars: {
      '--bg': '#1a1018',
      '--accent': '#f472b6',
      '--accent-rgb': '244, 114, 182',
      '--accent-light': '#f9a8d4',
      '--accent-dark': '#ec4899',
      '--accent-darker': '#db2777',
      '--accent-tip': '#fbcfe8',
      '--text-1': '#fdf2f8',
      '--text-2': '#d4a0b9',
      '--text-3': '#7a5068',
      '--card-bg': '#2d1a29',
      '--card-text': '#fdf2f8',
      '--card-text-rgb': '253, 242, 248',
      '--pupil': '#1a0a18',
      '--surface': 'rgba(255, 255, 255, 0.04)',
      '--surface-hover': 'rgba(255, 255, 255, 0.07)',
      '--border': 'rgba(255, 255, 255, 0.06)',
    }
  },
  ocean: {
    label: 'Ocean',
    vars: {
      '--bg': '#0a1419',
      '--accent': '#14b8a6',
      '--accent-rgb': '20, 184, 166',
      '--accent-light': '#2dd4bf',
      '--accent-dark': '#0d9488',
      '--accent-darker': '#0f766e',
      '--accent-tip': '#99f6e4',
      '--text-1': '#ecfdf5',
      '--text-2': '#94b8ad',
      '--text-3': '#4a6e63',
      '--card-bg': '#112228',
      '--card-text': '#ecfdf5',
      '--card-text-rgb': '236, 253, 245',
      '--pupil': '#052e16',
      '--surface': 'rgba(255, 255, 255, 0.04)',
      '--surface-hover': 'rgba(255, 255, 255, 0.07)',
      '--border': 'rgba(255, 255, 255, 0.06)',
    }
  }
};

const PORT = 7777;
const SETTINGS_PATH = path.join(app.getPath('userData'), 'settings.json');
const HISTORY_PATH = path.join(app.getPath('userData'), 'history.json');
let notificationHistory = [];

// Map of requestId -> { res, timeout } for long-poll pending requests
const pendingRequests = new Map();

// ===== Settings / History =====

function loadSettings() {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      settings = { ...settings, ...JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8')) };
    }
  } catch {}
  try {
    if (fs.existsSync(HISTORY_PATH)) {
      notificationHistory = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8')).slice(-50);
    }
  } catch {}
  // Auto-detect language on first launch
  if (settings.language === null) {
    const locale = app.getLocale();
    settings.language = locale.startsWith('fr') ? 'fr' : 'en';
    saveSettings();
  }
}

function getResolvedLanguage() {
  return settings.language || 'en';
}

function broadcastLanguage() {
  const lang = getResolvedLanguage();
  [overlayWindow, bubbleWindow, menuWindow].forEach(win => {
    if (win && !win.isDestroyed()) {
      win.webContents.send('language-changed', lang);
    }
  });
}

function saveSettings() {
  try { fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2)); } catch {}
}

function saveHistory() {
  try { fs.writeFileSync(HISTORY_PATH, JSON.stringify(notificationHistory.slice(-50))); } catch {}
}

// ===== Screen / Position =====

function getTargetScreen() {
  const displays = screen.getAllDisplays();
  const idx = Math.min(settings.selectedScreen, displays.length - 1);
  return displays[idx] || screen.getPrimaryDisplay();
}

function getOverlayBounds() {
  const display = getTargetScreen();
  const { x, y, width, height } = display.workArea;

  if (settings.mascotPosition) {
    // Use saved position, clamped to screen bounds
    const mx = Math.max(x, Math.min(settings.mascotPosition.x, x + width - 170));
    const my = Math.max(y, Math.min(settings.mascotPosition.y, y + height - 170));
    return { x: mx, y: my, width: 170, height: 170 };
  }

  // Default: top-right
  // Width must be >= 170px to avoid Electron bug #44884 (transparent windows < 162px become white on macOS)
  return { x: x + width - 170, y: y + 6, width: 170, height: 170 };
}

function getBubbleBounds() {
  const display = getTargetScreen();
  const wa = display.workArea;
  const overlayBounds = getOverlayBounds();

  // Mascot center X relative to screen
  const mascotCenterX = overlayBounds.x + 170 / 2;
  const screenCenterX = wa.x + wa.width / 2;

  let bx;
  if (mascotCenterX > screenCenterX) {
    // Mascot is on right side → bubble to the left
    bx = overlayBounds.x + 170 - 90 - 6 - 280; // left of mascot body
  } else {
    // Mascot is on left side → bubble to the right
    bx = overlayBounds.x + 90 + 6; // right of mascot body
  }

  // Clamp bubble to screen
  bx = Math.max(wa.x, Math.min(bx, wa.x + wa.width - 280));
  const by = Math.max(wa.y, overlayBounds.y + 16);

  return { x: bx, y: by, width: 280, height: 360 };
}

// ===== Window Creation =====

function createOverlayWindow() {
  const bounds = getOverlayBounds();

  overlayWindow = new BrowserWindow({
    ...bounds,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    focusable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  overlayWindow.setIgnoreMouseEvents(true, { forward: true });
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true, skipTransformProcessType: true });
  overlayWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  overlayWindow.webContents.on('did-finish-load', () => {
    const theme = THEMES[settings.theme] || THEMES.dark;
    overlayWindow.webContents.send('apply-theme', { name: settings.theme, vars: theme.vars });
  });
}

function createBubbleWindow() {
  const bounds = getBubbleBounds();

  bubbleWindow = new BrowserWindow({
    ...bounds,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    show: false,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload-bubble.js'),
      contextIsolation: true
    }
  });

  bubbleWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true, skipTransformProcessType: true });
  bubbleWindow.loadFile(path.join(__dirname, 'renderer', 'bubble', 'index.html'));

  bubbleWindow.webContents.on('did-finish-load', () => {
    bubbleReady = true;
    const theme = THEMES[settings.theme] || THEMES.dark;
    bubbleWindow.webContents.send('apply-theme', { name: settings.theme, vars: theme.vars });
    const sound = SOUNDS[settings.notifSound] || SOUNDS.default;
    bubbleWindow.webContents.send('change-sound', sound.file);
    bubbleWindow.webContents.send('language-changed', getResolvedLanguage());
    if (pendingBubbleQueue.length) {
      pendingBubbleQueue.forEach(d => bubbleWindow.webContents.send('add-bubble', d));
      pendingBubbleQueue = [];
    }
  });
}

function createMenuWindow() {
  menuWindow = new BrowserWindow({
    width: 360,
    height: 540,
    show: false,
    frame: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    transparent: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload-menu.js'),
      contextIsolation: true
    }
  });

  menuWindow.loadFile(path.join(__dirname, 'renderer', 'menu', 'index.html'));
  menuWindow.on('blur', () => menuWindow.hide());

  menuWindow.webContents.on('did-finish-load', () => {
    const theme = THEMES[settings.theme] || THEMES.dark;
    menuWindow.webContents.send('apply-theme', { name: settings.theme, vars: theme.vars });
    menuWindow.webContents.send('language-changed', getResolvedLanguage());
  });
}

function getIconPath(name) {
  return path.join(__dirname, 'renderer', 'assets', name);
}

function createTray() {
  const icon = nativeImage.createFromPath(getIconPath('iconTemplate.png'));
  icon.setTemplateImage(true);
  tray = new Tray(icon);
  tray.setToolTip('Fleeble');
  tray.on('click', (event, bounds) => toggleMenu(bounds));
}

function toggleMenu(trayBounds) {
  if (menuWindow.isVisible()) { menuWindow.hide(); return; }

  const { x, y, width: tw } = trayBounds;
  const [mw] = menuWindow.getSize();
  menuWindow.setPosition(Math.round(x + tw / 2 - mw / 2), y + 4);

  const lang = getResolvedLanguage();
  const builtinLabel = lang === 'fr' ? '(Intégré)' : '(Built-in)';
  const externalLabel = lang === 'fr' ? '(Externe)' : '(External)';
  const displays = screen.getAllDisplays().map((d, i) => ({
    id: i,
    label: `${d.size.width}x${d.size.height}${d.internal ? ` ${builtinLabel}` : ` ${externalLabel}`}`,
    bounds: d.bounds,
    selected: i === settings.selectedScreen
  }));

  menuWindow.webContents.send('update-state', {
    settings,
    displays,
    history: notificationHistory.slice(-20).reverse(),
    language: getResolvedLanguage()
  });
  menuWindow.show();
}

// ===== Show / Hide =====

function showMascot(message, type = 'action', source = 'unknown', options = null, requestId = null, project = null, extra = {}) {
  const entry = { message, type, source, time: Date.now() };
  notificationHistory.push(entry);
  saveHistory();

  // DND: save history but don't show UI; auto-resolve pending request
  if (settings.dnd) {
    if (requestId) resolvePendingRequest(requestId, { dismissed: true, dnd: true });
    if (menuWindow && menuWindow.isVisible()) {
      menuWindow.webContents.send('new-notification', entry);
    }
    return;
  }

  // In 'notify' mode, clear old approval cards when a new event arrives
  if (settings.approvalMode === 'notify' && bubbleReady && bubbleWindow && !bubbleWindow.isDestroyed()) {
    bubbleWindow.webContents.send('clear-approval-cards');
  }

  // Reposition both windows
  const overlayBounds = getOverlayBounds();
  overlayWindow.setPosition(overlayBounds.x, overlayBounds.y);

  const bubbleBounds = getBubbleBounds();
  bubbleWindow.setPosition(bubbleBounds.x, bubbleBounds.y);

  // Show ghost animation
  overlayWindow.webContents.send('show-mascot', { type });

  // Generate a unique notifId for this card
  const notifId = `notif-${++notifCounter}-${Date.now()}`;

  // Show bubble with content
  const autoDismiss = extra.autoDismiss || settings.autoDismiss;
  const bubbleData = { message, type, source, options, requestId, notifId, project, autoDismiss };
  if (bubbleReady) {
    bubbleWindow.webContents.send('add-bubble', bubbleData);
  } else {
    pendingBubbleQueue.push(bubbleData);
  }
  // Reset to a reasonable height before showing to avoid brief "squeezed" appearance
  const [bw] = bubbleWindow.getSize();
  bubbleWindow.setSize(bw, 500);
  bubbleWindow.showInactive();

  // Update menu & tray
  if (menuWindow && menuWindow.isVisible()) {
    menuWindow.webContents.send('new-notification', entry);
  }
  updateTrayIcon(true);
}

function hideAllBubbles() {
  cancelAllPending({ dismissed: true });
  if (bubbleWindow) {
    bubbleWindow.webContents.send('clear-all-cards');
    bubbleWindow.hide();
  }
  if (overlayWindow) overlayWindow.webContents.send('hide-mascot');
  updateTrayIcon(false);
}

function hideBubbleWindowIfEmpty() {
  if (bubbleWindow) bubbleWindow.hide();
  if (overlayWindow) overlayWindow.webContents.send('hide-mascot');
  updateTrayIcon(false);
}

function resolvePendingRequest(requestId, response) {
  const pending = pendingRequests.get(requestId);
  if (!pending) return;
  clearTimeout(pending.timeout);
  pendingRequests.delete(requestId);
  try {
    pending.res.writeHead(200, { 'Content-Type': 'application/json' });
    pending.res.end(JSON.stringify(response));
  } catch {}
}

function cancelAllPending(reason) {
  for (const [id, pending] of pendingRequests) {
    clearTimeout(pending.timeout);
    try {
      pending.res.writeHead(200, { 'Content-Type': 'application/json' });
      pending.res.end(JSON.stringify({ dismissed: true, ...reason }));
    } catch {}
  }
  pendingRequests.clear();
}

function updateTrayIcon(hasNotification) {
  if (!tray) return;
  const name = hasNotification ? 'icon-notif.png' : 'iconTemplate.png';
  const icon = nativeImage.createFromPath(getIconPath(name));
  if (!hasNotification) icon.setTemplateImage(true);
  tray.setImage(icon);
}

// ===== HTTP Server =====

function startServer() {
  httpServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

    // Hook queries this to decide blocking vs fire-and-forget
    if (req.method === 'GET' && req.url === '/approval-mode') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ mode: settings.approvalMode || 'manage' }));
      return;
    }

    if (req.method === 'POST' && req.url === '/notify') {
      let body = '';
      req.on('data', c => body += c);
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const requestId = data.requestId || null;

          if (requestId) {
            // Long-poll: hold connection open for up to 60s
            const timeout = setTimeout(() => {
              pendingRequests.delete(requestId);
              try {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ dismissed: true, timeout: true }));
              } catch {}
              // Tell renderer to remove this card on timeout
              if (bubbleReady && bubbleWindow) {
                bubbleWindow.webContents.send('remove-card-by-request', requestId);
              }
            }, 60000);

            pendingRequests.set(requestId, { res, timeout });
          } else {
            // Fire-and-forget
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
          }

          const extra = {};
          if (data.autoDismiss) extra.autoDismiss = data.autoDismiss;

          showMascot(
            data.message || 'AI needs your attention!',
            data.type || 'action',
            data.source || 'unknown',
            data.options || null,
            requestId,
            data.project || null,
            extra
          );
        } catch {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
    } else if (req.method === 'POST' && req.url === '/dismiss') {
      hideAllBubbles();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });

  httpServer.listen(PORT, '127.0.0.1', () => {
    console.log(`AI Mascot listening on http://127.0.0.1:${PORT}`);
  });
}

// ===== Theme Broadcasting =====

function broadcastTheme() {
  const theme = THEMES[settings.theme] || THEMES.dark;
  const data = { name: settings.theme, vars: theme.vars };
  [overlayWindow, bubbleWindow, menuWindow].forEach(win => {
    if (win && !win.isDestroyed()) {
      win.webContents.send('apply-theme', data);
    }
  });
}

// ===== IPC Handlers =====

ipcMain.on('mascot-hidden', () => hideAllBubbles());

ipcMain.on('bubble-option-selected', (_, { label, index, requestId, notifId }) => {
  if (requestId) resolvePendingRequest(requestId, { label, index, dismissed: false });
  // Card removal is handled by renderer; main just resolves the request
});

ipcMain.on('bubble-dismiss-one', (_, { requestId, notifId }) => {
  if (requestId) resolvePendingRequest(requestId, { dismissed: true });
  // Card removal is handled by renderer
});

ipcMain.on('bubble-all-cards-gone', () => {
  hideBubbleWindowIfEmpty();
});

ipcMain.on('bubble-resize', (_, { height }) => {
  if (!bubbleWindow) return;
  const display = getTargetScreen();
  const maxHeight = Math.round(display.workArea.height * 0.8);
  const clampedHeight = Math.min(Math.max(height, 60), maxHeight);
  const [w] = bubbleWindow.getSize();
  bubbleWindow.setSize(w, clampedHeight);
});

ipcMain.handle('get-settings', () => settings);

ipcMain.handle('get-displays', () => {
  const lang = getResolvedLanguage();
  const builtinLabel = lang === 'fr' ? '(Intégré)' : '(Built-in)';
  const externalLabel = lang === 'fr' ? '(Externe)' : '(External)';
  return screen.getAllDisplays().map((d, i) => ({
    id: i,
    label: `${d.size.width}x${d.size.height}${d.internal ? ` ${builtinLabel}` : ` ${externalLabel}`}`,
    selected: i === settings.selectedScreen
  }));
});

ipcMain.handle('get-history', () => notificationHistory.slice(-20).reverse());

ipcMain.on('update-settings', (_, newSettings) => {
  const screenChanged = newSettings.selectedScreen !== undefined && newSettings.selectedScreen !== settings.selectedScreen;
  settings = { ...settings, ...newSettings };
  // Reset mascot position when screen changes
  if (screenChanged) {
    settings.mascotPosition = null;
  }
  saveSettings();
  const pos = getOverlayBounds();
  overlayWindow.setPosition(pos.x, pos.y);
});

ipcMain.on('test-mascot', () => {
  const msg = getResolvedLanguage() === 'fr'
    ? "Salut ! Tout fonctionne parfaitement !"
    : "Hey! Just checking in — everything's working great!";
  showMascot(msg, 'info', 'claude-code');
});

ipcMain.on('clear-history', () => {
  notificationHistory = [];
  saveHistory();
});

ipcMain.on('close-menu', () => {
  if (menuWindow) menuWindow.hide();
});

ipcMain.on('quit-app', () => {
  app.quit();
});

// Theme
ipcMain.on('apply-theme', (_, name) => {
  if (!THEMES[name]) return;
  settings.theme = name;
  saveSettings();
  broadcastTheme();
});

ipcMain.handle('get-themes', () => {
  const out = {};
  for (const [key, val] of Object.entries(THEMES)) {
    out[key] = { label: val.label, vars: val.vars };
  }
  return { themes: out, current: settings.theme };
});

// Sound
ipcMain.on('change-sound', (_, name) => {
  if (!SOUNDS[name]) return;
  settings.notifSound = name;
  saveSettings();
  if (bubbleWindow && !bubbleWindow.isDestroyed()) {
    bubbleWindow.webContents.send('change-sound', SOUNDS[name].file);
  }
});

ipcMain.handle('get-sounds', () => {
  return { sounds: SOUNDS, current: settings.notifSound };
});

// Language
ipcMain.handle('get-language', () => getResolvedLanguage());

ipcMain.on('change-language', (_, lang) => {
  settings.language = (lang === 'fr') ? 'fr' : 'en';
  saveSettings();
  broadcastLanguage();
});

// DND toggle
ipcMain.on('toggle-dnd', () => {
  settings.dnd = !settings.dnd;
  saveSettings();
  if (menuWindow) menuWindow.webContents.send('dnd-changed', settings.dnd);
  updateTrayIcon(false);
});

// Focus terminal (iTerm2 or Terminal.app)
ipcMain.on('focus-terminal', () => {
  if (process.platform !== 'darwin') return;
  const script = `
    tell application "System Events"
      if exists (processes where name is "iTerm2") then
        tell application "iTerm" to activate
      else
        tell application "Terminal" to activate
      end if
    end tell
  `;
  execFile('osascript', ['-e', script], () => {});
});

// Approval mode
ipcMain.handle('get-approval-mode', () => settings.approvalMode || 'manage');

ipcMain.on('change-approval-mode', (_, mode) => {
  settings.approvalMode = (mode === 'notify') ? 'notify' : 'manage';
  saveSettings();
});

// ===== Mascot Drag & Drop =====

ipcMain.on('mascot-mouse-enter', () => {
  if (overlayWindow) overlayWindow.setIgnoreMouseEvents(false);
});

ipcMain.on('mascot-mouse-leave', () => {
  if (overlayWindow) overlayWindow.setIgnoreMouseEvents(true, { forward: true });
});

ipcMain.on('mascot-drag-move', (_, { deltaX, deltaY }) => {
  if (!overlayWindow) return;
  const [cx, cy] = overlayWindow.getPosition();
  const newX = cx + deltaX;
  const newY = cy + deltaY;
  overlayWindow.setPosition(newX, newY);

  // Update bubble position in real time
  if (bubbleWindow && bubbleWindow.isVisible()) {
    // Temporarily set mascotPosition so getBubbleBounds uses current drag pos
    const savedPos = settings.mascotPosition;
    settings.mascotPosition = { x: newX, y: newY };
    const bb = getBubbleBounds();
    settings.mascotPosition = savedPos;
    bubbleWindow.setPosition(bb.x, bb.y);
  }
});

ipcMain.on('mascot-drag-end', () => {
  if (!overlayWindow) return;
  const [fx, fy] = overlayWindow.getPosition();
  settings.mascotPosition = { x: fx, y: fy };
  saveSettings();
  // Re-enable mouse pass-through
  overlayWindow.setIgnoreMouseEvents(true, { forward: true });
});

ipcMain.on('reset-mascot-position', () => {
  settings.mascotPosition = null;
  saveSettings();
  const bounds = getOverlayBounds();
  if (overlayWindow) overlayWindow.setPosition(bounds.x, bounds.y);
  if (bubbleWindow && bubbleWindow.isVisible()) {
    const bb = getBubbleBounds();
    bubbleWindow.setPosition(bb.x, bb.y);
  }
});

// Open external links (from markdown in bubbles)
ipcMain.on('open-external', (_, url) => {
  // Only allow http/https URLs for safety
  if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
    shell.openExternal(url);
  }
});

// ===== Hook Scripts =====
// When packaged, __dirname is inside app.asar which is not executable by the shell.
// We copy hook scripts to ~/.fleeble/hooks/ so they live at real filesystem paths.

const HOOKS_DIR = path.join(process.env.HOME || '', '.fleeble', 'hooks');
const HOOK_SOURCES = {
  'claude-code-hook.sh': path.join(__dirname, 'hooks', 'claude-code-hook.sh'),
  'cursor-hook.sh': path.join(__dirname, 'hooks', 'cursor-hook.sh'),
  'codex-hook.py': path.join(__dirname, 'hooks', 'codex-hook.py'),
};

function ensureHook(filename) {
  const dest = path.join(HOOKS_DIR, filename);
  const src = HOOK_SOURCES[filename];
  try {
    if (!fs.existsSync(HOOKS_DIR)) fs.mkdirSync(HOOKS_DIR, { recursive: true });
    fs.copyFileSync(src, dest);
    fs.chmodSync(dest, 0o755);
  } catch {}
  return dest;
}

// Resolve hook paths (copied to real filesystem on first use)
function getHookPath(filename) {
  return path.join(HOOKS_DIR, filename);
}

// ===== Claude Code Integration =====

function getClaudeSettingsPath() {
  return path.join(process.env.HOME || '', '.claude', 'settings.json');
}

function readClaudeSettings() {
  try {
    const p = getClaudeSettingsPath();
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {}
  return {};
}

function isClaudeConnected() {
  const s = readClaudeSettings();
  return JSON.stringify(s.hooks || {}).includes('claude-code-hook.sh');
}

ipcMain.handle('claude-status', () => {
  const settingsPath = getClaudeSettingsPath();
  const exists = fs.existsSync(settingsPath);
  return { exists, connected: exists && isClaudeConnected() };
});

ipcMain.handle('claude-connect', () => {
  try {
    const hookPath = ensureHook('claude-code-hook.sh');
    const settingsPath = getClaudeSettingsPath();
    const s = readClaudeSettings();
    if (!s.hooks) s.hooks = {};

    s.hooks.Notification = s.hooks.Notification || [];
    // Remove old entries (may point to stale asar paths)
    s.hooks.Notification = s.hooks.Notification.filter(h => !h.hooks || !h.hooks.some(hh => hh.command && hh.command.includes('claude-code-hook.sh')));
    s.hooks.Notification.push({ matcher: '', hooks: [{ type: 'command', command: hookPath }] });

    s.hooks.PreToolUse = s.hooks.PreToolUse || [];
    // Remove old fleeble PreToolUse entries to avoid duplicates on re-connect
    s.hooks.PreToolUse = s.hooks.PreToolUse.filter(h => !h.hooks || !h.hooks.some(hh => hh.command && hh.command.includes('claude-code-hook.sh')));
    // Add PreToolUse hooks for AskUserQuestion + permission-requiring tools
    const preToolMatchers = ['AskUserQuestion', 'Bash', 'Edit', 'Write', 'NotebookEdit'];
    for (const matcher of preToolMatchers) {
      s.hooks.PreToolUse.push({ matcher, hooks: [{ type: 'command', command: hookPath }] });
    }

    fs.writeFileSync(settingsPath, JSON.stringify(s, null, 2));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

ipcMain.handle('claude-disconnect', () => {
  try {
    const settingsPath = getClaudeSettingsPath();
    const s = readClaudeSettings();
    if (!s.hooks) return { ok: true };

    for (const key of ['Notification', 'PreToolUse']) {
      if (s.hooks[key]) {
        s.hooks[key] = s.hooks[key].filter(h => !h.hooks || !h.hooks.some(hh => hh.command && hh.command.includes('claude-code-hook.sh')));
        if (!s.hooks[key].length) delete s.hooks[key];
      }
    }
    if (!Object.keys(s.hooks).length) delete s.hooks;

    fs.writeFileSync(settingsPath, JSON.stringify(s, null, 2));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

// ===== Cursor Integration =====

function getCursorHooksPath() {
  return path.join(process.env.HOME || '', '.cursor', 'hooks.json');
}

function readCursorHooks() {
  try {
    const p = getCursorHooksPath();
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {}
  return { version: 1, hooks: {} };
}

function isCursorConnected() {
  const h = readCursorHooks();
  return JSON.stringify(h.hooks || {}).includes('cursor-hook.sh');
}

ipcMain.handle('cursor-status', () => {
  const dirPath = path.join(process.env.HOME || '', '.cursor');
  const exists = fs.existsSync(dirPath);
  return { exists, connected: exists && isCursorConnected() };
});

ipcMain.handle('cursor-connect', () => {
  try {
    const hookPath = ensureHook('cursor-hook.sh');
    const hooksPath = getCursorHooksPath();
    const h = readCursorHooks();
    if (!h.hooks) h.hooks = {};

    // Add preToolUse hook for Shell
    if (!h.hooks.preToolUse) h.hooks.preToolUse = [];
    h.hooks.preToolUse = h.hooks.preToolUse.filter(e => !e.hooks || !e.hooks.some(hh => hh.command && hh.command.includes('cursor-hook.sh')));
    h.hooks.preToolUse.push({ matcher: 'Shell', hooks: [{ type: 'command', command: hookPath }] });

    // Add stop hook
    if (!h.hooks.stop) h.hooks.stop = [];
    h.hooks.stop = h.hooks.stop.filter(e => !e.hooks || !e.hooks.some(hh => hh.command && hh.command.includes('cursor-hook.sh')));
    h.hooks.stop.push({ matcher: '', hooks: [{ type: 'command', command: hookPath }] });

    // Ensure parent directory exists
    const dir = path.dirname(hooksPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(hooksPath, JSON.stringify(h, null, 2));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

ipcMain.handle('cursor-disconnect', () => {
  try {
    const hooksPath = getCursorHooksPath();
    const h = readCursorHooks();
    if (!h.hooks) return { ok: true };

    for (const key of ['preToolUse', 'stop']) {
      if (h.hooks[key]) {
        h.hooks[key] = h.hooks[key].filter(e => !e.hooks || !e.hooks.some(hh => hh.command && hh.command.includes('cursor-hook.sh')));
        if (!h.hooks[key].length) delete h.hooks[key];
      }
    }

    fs.writeFileSync(hooksPath, JSON.stringify(h, null, 2));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

// ===== Codex CLI Integration =====

function getCodexConfigPath() {
  return path.join(process.env.HOME || '', '.codex', 'config.toml');
}

function isCodexConnected() {
  try {
    const p = getCodexConfigPath();
    if (!fs.existsSync(p)) return false;
    const content = fs.readFileSync(p, 'utf8');
    return content.includes('codex-hook.py');
  } catch {}
  return false;
}

ipcMain.handle('codex-status', () => {
  const dirPath = path.join(process.env.HOME || '', '.codex');
  const exists = fs.existsSync(dirPath);
  return { exists, connected: exists && isCodexConnected() };
});

ipcMain.handle('codex-connect', () => {
  try {
    const hookPath = ensureHook('codex-hook.py');
    const configPath = getCodexConfigPath();
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let content = '';
    if (fs.existsSync(configPath)) {
      content = fs.readFileSync(configPath, 'utf8');
    }

    // Remove existing notify line if present
    const lines = content.split('\n').filter(l => !l.trim().startsWith('notify'));
    // Add our notify line
    lines.push(`notify = ["python3", "${hookPath}"]`);

    fs.writeFileSync(configPath, lines.join('\n') + '\n');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

ipcMain.handle('codex-disconnect', () => {
  try {
    const configPath = getCodexConfigPath();
    if (!fs.existsSync(configPath)) return { ok: true };

    let content = fs.readFileSync(configPath, 'utf8');
    const lines = content.split('\n').filter(l => !l.trim().startsWith('notify'));
    fs.writeFileSync(configPath, lines.join('\n'));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

// ===== App Lifecycle =====

app.whenReady().then(() => {
  loadSettings();
  createOverlayWindow();
  createBubbleWindow();
  createMenuWindow();
  createTray();
  startServer();
  if (process.platform === 'darwin') app.dock.hide();

  // Global shortcut: Cmd+Shift+P to dismiss all bubbles
  globalShortcut.register('CmdOrCtrl+Shift+P', hideAllBubbles);
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (httpServer) httpServer.close();
  app.quit();
});

app.on('before-quit', () => {
  cancelAllPending({ shutdown: true });
  if (httpServer) httpServer.close();
});
