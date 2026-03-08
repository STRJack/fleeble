const { ipcMain, screen, shell } = require('electron');
const { execFile } = require('child_process');
const { getSettings, updateSettings, saveSettings, getResolvedLanguage, getNotificationHistory, clearHistory: clearHistoryData } = require('./settings');
const { THEMES, SOUNDS, broadcastTheme, broadcastLanguage } = require('./theme');
const windows = require('./windows');
const { resolvePendingRequest, cancelAllPending } = require('./server');

let notifCounter = 0;

function showMascot(message, type = 'action', source = 'unknown', options = null, requestId = null, project = null, extra = {}) {
  const settings = getSettings();
  const { addToHistory } = require('./settings');
  const entry = { message, type, source, time: Date.now() };
  addToHistory(entry);

  const overlayWindow = windows.getOverlayWindow();
  const bubbleWindow = windows.getBubbleWindow();
  const menuWindow = windows.getMenuWindow();

  // DND: save history but don't show UI
  if (settings.dnd) {
    if (requestId) resolvePendingRequest(requestId, { dismissed: true, dnd: true });
    if (menuWindow && menuWindow.isVisible()) {
      menuWindow.webContents.send('new-notification', entry);
    }
    return;
  }

  // In 'notify' mode, clear old approval cards
  if (settings.approvalMode === 'notify' && windows.isBubbleReady() && bubbleWindow && !bubbleWindow.isDestroyed()) {
    bubbleWindow.webContents.send('clear-approval-cards');
  }

  // Reposition both windows
  const overlayBounds = windows.getOverlayBounds();
  overlayWindow.setPosition(overlayBounds.x, overlayBounds.y);

  const bubbleBounds = windows.getBubbleBounds();
  bubbleWindow.setPosition(bubbleBounds.x, bubbleBounds.y);

  // Show ghost animation
  overlayWindow.webContents.send('show-mascot', { type });

  // Generate unique notifId
  const notifId = `notif-${++notifCounter}-${Date.now()}`;

  // Show bubble with content
  const autoDismiss = extra.autoDismiss || settings.autoDismiss;
  const bubbleData = { message, type, source, options, requestId, notifId, project, autoDismiss };
  if (extra.meta) bubbleData.meta = extra.meta;

  if (windows.isBubbleReady()) {
    bubbleWindow.webContents.send('add-bubble', bubbleData);
  } else {
    windows.pushPendingBubble(bubbleData);
  }

  const [bw] = bubbleWindow.getSize();
  bubbleWindow.setSize(bw, 500);
  bubbleWindow.showInactive();

  // Update menu & tray
  if (menuWindow && menuWindow.isVisible()) {
    menuWindow.webContents.send('new-notification', entry);
  }
  windows.updateTrayIcon(true);
}

function hideAllBubbles() {
  cancelAllPending({ dismissed: true });
  const bubbleWindow = windows.getBubbleWindow();
  const overlayWindow = windows.getOverlayWindow();
  if (bubbleWindow) {
    bubbleWindow.webContents.send('clear-all-cards');
    bubbleWindow.hide();
  }
  if (overlayWindow) overlayWindow.webContents.send('hide-mascot');
  windows.updateTrayIcon(false);
}

function hideBubbleWindowIfEmpty() {
  const bubbleWindow = windows.getBubbleWindow();
  const overlayWindow = windows.getOverlayWindow();
  if (bubbleWindow) bubbleWindow.hide();
  if (overlayWindow) overlayWindow.webContents.send('hide-mascot');
  windows.updateTrayIcon(false);
}

function registerIpcHandlers() {
  // ===== Bubble Interaction =====
  ipcMain.on('mascot-hidden', () => hideAllBubbles());

  ipcMain.on('bubble-option-selected', (_, { label, index, requestId, notifId }) => {
    if (requestId) resolvePendingRequest(requestId, { label, index, dismissed: false });
  });

  ipcMain.on('bubble-dismiss-one', (_, { requestId, notifId }) => {
    if (requestId) resolvePendingRequest(requestId, { dismissed: true });
  });

  ipcMain.on('bubble-all-cards-gone', () => {
    hideBubbleWindowIfEmpty();
  });

  ipcMain.on('bubble-resize', (_, { height }) => {
    const bubbleWindow = windows.getBubbleWindow();
    if (!bubbleWindow) return;
    const display = windows.getTargetScreen();
    const maxHeight = Math.round(display.workArea.height * 0.8);
    const clampedHeight = Math.min(Math.max(height, 60), maxHeight);
    const [w] = bubbleWindow.getSize();
    bubbleWindow.setSize(w, clampedHeight);
  });

  // ===== Settings =====
  ipcMain.handle('get-settings', () => getSettings());

  ipcMain.handle('get-displays', () => {
    const lang = getResolvedLanguage();
    const builtinLabel = lang === 'fr' ? '(Intégré)' : '(Built-in)';
    const externalLabel = lang === 'fr' ? '(Externe)' : '(External)';
    return screen.getAllDisplays().map((d, i) => ({
      id: i,
      label: `${d.size.width}x${d.size.height}${d.internal ? ` ${builtinLabel}` : ` ${externalLabel}`}`,
      selected: i === getSettings().selectedScreen
    }));
  });

  ipcMain.handle('get-history', () => getNotificationHistory().slice(-20).reverse());

  ipcMain.on('update-settings', (_, newSettings) => {
    const settings = getSettings();
    const screenChanged = newSettings.selectedScreen !== undefined && newSettings.selectedScreen !== settings.selectedScreen;
    updateSettings(newSettings);
    if (screenChanged) {
      updateSettings({ mascotPosition: null });
    }
    saveSettings();
    const overlayWindow = windows.getOverlayWindow();
    const pos = windows.getOverlayBounds();
    overlayWindow.setPosition(pos.x, pos.y);
  });

  ipcMain.on('test-mascot', () => {
    const msg = getResolvedLanguage() === 'fr'
      ? "Salut ! Tout fonctionne parfaitement !"
      : "Hey! Just checking in — everything's working great!";
    showMascot(msg, 'info', 'claude-code');
  });

  ipcMain.on('clear-history', () => {
    clearHistoryData();
  });

  ipcMain.on('close-menu', () => {
    const menuWindow = windows.getMenuWindow();
    if (menuWindow) menuWindow.hide();
  });

  ipcMain.on('quit-app', () => {
    const { app } = require('electron');
    app.quit();
  });

  // ===== Theme =====
  ipcMain.on('apply-theme', (_, name) => {
    if (!THEMES[name]) return;
    updateSettings({ theme: name });
    saveSettings();
    broadcastTheme(windows.getAllWindows());
  });

  ipcMain.handle('get-themes', () => {
    const out = {};
    for (const [key, val] of Object.entries(THEMES)) {
      out[key] = { label: val.label, vars: val.vars };
    }
    return { themes: out, current: getSettings().theme };
  });

  // ===== Sound =====
  ipcMain.on('change-sound', (_, name) => {
    if (!SOUNDS[name]) return;
    updateSettings({ notifSound: name });
    saveSettings();
    const bubbleWindow = windows.getBubbleWindow();
    if (bubbleWindow && !bubbleWindow.isDestroyed()) {
      bubbleWindow.webContents.send('change-sound', SOUNDS[name].file);
    }
  });

  ipcMain.handle('get-sounds', () => {
    return { sounds: SOUNDS, current: getSettings().notifSound };
  });

  // ===== Language =====
  ipcMain.handle('get-language', () => getResolvedLanguage());

  ipcMain.on('change-language', (_, lang) => {
    updateSettings({ language: (lang === 'fr') ? 'fr' : 'en' });
    saveSettings();
    broadcastLanguage(windows.getAllWindows());
  });

  // ===== DND =====
  ipcMain.on('toggle-dnd', () => {
    const settings = getSettings();
    updateSettings({ dnd: !settings.dnd });
    saveSettings();
    const menuWindow = windows.getMenuWindow();
    if (menuWindow) menuWindow.webContents.send('dnd-changed', getSettings().dnd);
    windows.updateTrayIcon(false);
  });

  // ===== Focus Terminal =====
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

  // ===== Approval Mode =====
  ipcMain.handle('get-approval-mode', () => getSettings().approvalMode || 'manage');

  ipcMain.on('change-approval-mode', (_, mode) => {
    updateSettings({ approvalMode: (mode === 'notify') ? 'notify' : 'manage' });
    saveSettings();
  });

  // ===== Mascot Drag & Drop =====
  ipcMain.on('mascot-mouse-enter', () => {
    const overlayWindow = windows.getOverlayWindow();
    if (overlayWindow) overlayWindow.setIgnoreMouseEvents(false);
  });

  ipcMain.on('mascot-mouse-leave', () => {
    const overlayWindow = windows.getOverlayWindow();
    if (overlayWindow) overlayWindow.setIgnoreMouseEvents(true, { forward: true });
  });

  ipcMain.on('mascot-drag-move', (_, { deltaX, deltaY }) => {
    const overlayWindow = windows.getOverlayWindow();
    if (!overlayWindow) return;
    const [cx, cy] = overlayWindow.getPosition();
    const newX = cx + deltaX;
    const newY = cy + deltaY;
    overlayWindow.setPosition(newX, newY);

    const bubbleWindow = windows.getBubbleWindow();
    if (bubbleWindow && bubbleWindow.isVisible()) {
      const settings = getSettings();
      const savedPos = settings.mascotPosition;
      updateSettings({ mascotPosition: { x: newX, y: newY } });
      const bb = windows.getBubbleBounds();
      updateSettings({ mascotPosition: savedPos });
      bubbleWindow.setPosition(bb.x, bb.y);
    }
  });

  ipcMain.on('mascot-drag-end', () => {
    const overlayWindow = windows.getOverlayWindow();
    if (!overlayWindow) return;
    const [fx, fy] = overlayWindow.getPosition();
    updateSettings({ mascotPosition: { x: fx, y: fy } });
    saveSettings();
    overlayWindow.setIgnoreMouseEvents(true, { forward: true });
  });

  ipcMain.on('reset-mascot-position', () => {
    updateSettings({ mascotPosition: null });
    saveSettings();
    const overlayWindow = windows.getOverlayWindow();
    const bounds = windows.getOverlayBounds();
    if (overlayWindow) overlayWindow.setPosition(bounds.x, bounds.y);
    const bubbleWindow = windows.getBubbleWindow();
    if (bubbleWindow && bubbleWindow.isVisible()) {
      const bb = windows.getBubbleBounds();
      bubbleWindow.setPosition(bb.x, bb.y);
    }
  });

  // ===== Open External =====
  ipcMain.on('open-external', (_, url) => {
    if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
      shell.openExternal(url);
    }
  });
}

module.exports = { registerIpcHandlers, showMascot, hideAllBubbles };
