const { BrowserWindow, screen, Tray, nativeImage } = require('electron');
const path = require('path');
const { getSettings } = require('./settings');
const { THEMES, SOUNDS } = require('./theme');

let overlayWindow;
let bubbleWindow;
let menuWindow;
let clipboardWindow;
let tray;
let bubbleReady = false;
let pendingBubbleQueue = [];

function getTargetScreen() {
  const settings = getSettings();
  const displays = screen.getAllDisplays();
  const idx = Math.min(settings.selectedScreen, displays.length - 1);
  return displays[idx] || screen.getPrimaryDisplay();
}

function getOverlayBounds() {
  const settings = getSettings();
  const display = getTargetScreen();
  const { x, y, width, height } = display.workArea;

  if (settings.mascotPosition) {
    const mx = Math.max(x, Math.min(settings.mascotPosition.x, x + width - 170));
    const my = Math.max(y, Math.min(settings.mascotPosition.y, y + height - 170));
    return { x: mx, y: my, width: 170, height: 170 };
  }

  return { x: x + width - 170, y: y + 6, width: 170, height: 170 };
}

function getBubbleBounds() {
  const display = getTargetScreen();
  const wa = display.workArea;
  const overlayBounds = getOverlayBounds();

  const mascotCenterX = overlayBounds.x + 170 / 2;
  const screenCenterX = wa.x + wa.width / 2;

  let bx;
  if (mascotCenterX > screenCenterX) {
    bx = overlayBounds.x + 170 - 90 - 6 - 280;
  } else {
    bx = overlayBounds.x + 90 + 6;
  }

  bx = Math.max(wa.x, Math.min(bx, wa.x + wa.width - 280));
  const by = Math.max(wa.y, overlayBounds.y + 16);

  return { x: bx, y: by, width: 280, height: 360 };
}

function getIconPath(name) {
  return path.join(__dirname, '..', 'renderer', 'assets', name);
}

function createOverlayWindow() {
  const settings = getSettings();
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
      preload: path.join(__dirname, '..', 'preload.js'),
      contextIsolation: true
    }
  });

  overlayWindow.setIgnoreMouseEvents(true, { forward: true });
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true, skipTransformProcessType: true });
  overlayWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  overlayWindow.webContents.on('did-finish-load', () => {
    const theme = THEMES[settings.theme] || THEMES.dark;
    overlayWindow.webContents.send('apply-theme', { name: settings.theme, vars: theme.vars });
  });
}

function createBubbleWindow() {
  const settings = getSettings();
  const { getResolvedLanguage } = require('./settings');
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
      preload: path.join(__dirname, '..', 'preload-bubble.js'),
      contextIsolation: true
    }
  });

  bubbleWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true, skipTransformProcessType: true });
  bubbleWindow.loadFile(path.join(__dirname, '..', 'renderer', 'bubble', 'index.html'));

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
  const settings = getSettings();
  const { getResolvedLanguage } = require('./settings');

  menuWindow = new BrowserWindow({
    width: 360,
    height: 600,
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
      preload: path.join(__dirname, '..', 'preload-menu.js'),
      contextIsolation: true
    }
  });

  menuWindow.loadFile(path.join(__dirname, '..', 'renderer', 'menu', 'index.html'));
  menuWindow.on('blur', () => menuWindow.hide());

  menuWindow.webContents.on('did-finish-load', () => {
    const theme = THEMES[settings.theme] || THEMES.dark;
    menuWindow.webContents.send('apply-theme', { name: settings.theme, vars: theme.vars });
    menuWindow.webContents.send('language-changed', getResolvedLanguage());
  });
}

function createClipboardWindow() {
  const settings = getSettings();

  clipboardWindow = new BrowserWindow({
    width: 440,
    height: 560,
    show: false,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent: true,
    hasShadow: false,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload-clipboard.js'),
      contextIsolation: true
    }
  });

  clipboardWindow.loadFile(path.join(__dirname, '..', 'renderer', 'clipboard', 'index.html'));
  clipboardWindow.on('blur', () => clipboardWindow.hide());

  clipboardWindow.webContents.on('did-finish-load', () => {
    const theme = THEMES[settings.theme] || THEMES.dark;
    clipboardWindow.webContents.send('apply-theme', { name: settings.theme, vars: theme.vars });
    const { getResolvedLanguage } = require('./settings');
    clipboardWindow.webContents.send('language-changed', getResolvedLanguage());
  });
}

function createTray(toggleMenuFn) {
  const icon = nativeImage.createFromPath(getIconPath('iconTemplate.png'));
  icon.setTemplateImage(true);
  tray = new Tray(icon);
  tray.setToolTip('Fleeble');
  tray.on('click', (event, bounds) => toggleMenuFn(bounds));
}

function updateTrayIcon(hasNotification) {
  if (!tray) return;
  const name = hasNotification ? 'icon-notif.png' : 'iconTemplate.png';
  const icon = nativeImage.createFromPath(getIconPath(name));
  if (!hasNotification) icon.setTemplateImage(true);
  tray.setImage(icon);
}

function toggleMenu(trayBounds) {
  if (menuWindow.isVisible()) { menuWindow.hide(); return; }

  const { getResolvedLanguage } = require('./settings');
  const settings = getSettings();
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

  const { getNotificationHistory } = require('./settings');
  menuWindow.webContents.send('update-state', {
    settings,
    displays,
    history: getNotificationHistory().slice(-20).reverse(),
    language: lang
  });
  menuWindow.show();
}

function toggleClipboardWindow(cursorPos) {
  if (!clipboardWindow) return;
  if (clipboardWindow.isVisible()) {
    clipboardWindow.hide();
    return;
  }
  // Position near cursor
  if (cursorPos) {
    const display = screen.getDisplayNearestPoint(cursorPos);
    const wa = display.workArea;
    let x = cursorPos.x - 220;
    let y = cursorPos.y - 280;
    x = Math.max(wa.x, Math.min(x, wa.x + wa.width - 440));
    y = Math.max(wa.y, Math.min(y, wa.y + wa.height - 560));
    clipboardWindow.setPosition(Math.round(x), Math.round(y));
  }
  clipboardWindow.show();
  clipboardWindow.focus();
}

function getOverlayWindow() { return overlayWindow; }
function getBubbleWindow() { return bubbleWindow; }
function getMenuWindow() { return menuWindow; }
function getClipboardWindow() { return clipboardWindow; }
function getTray() { return tray; }
function isBubbleReady() { return bubbleReady; }
function getPendingBubbleQueue() { return pendingBubbleQueue; }
function clearPendingBubbleQueue() { pendingBubbleQueue = []; }
function pushPendingBubble(data) { pendingBubbleQueue.push(data); }

function getAllWindows() {
  return [overlayWindow, bubbleWindow, menuWindow, clipboardWindow].filter(Boolean);
}

module.exports = {
  getTargetScreen,
  getOverlayBounds,
  getBubbleBounds,
  createOverlayWindow,
  createBubbleWindow,
  createMenuWindow,
  createClipboardWindow,
  createTray,
  updateTrayIcon,
  toggleMenu,
  toggleClipboardWindow,
  getOverlayWindow,
  getBubbleWindow,
  getMenuWindow,
  getClipboardWindow,
  getTray,
  isBubbleReady,
  getPendingBubbleQueue,
  clearPendingBubbleQueue,
  pushPendingBubble,
  getAllWindows
};
