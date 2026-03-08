const { app, globalShortcut, screen } = require('electron');

// ===== Modules =====
const settings = require('./main/settings');
const windows = require('./main/windows');
const server = require('./main/server');
const { registerIpcHandlers, showMascot, hideAllBubbles } = require('./main/ipc-handlers');
const { registerIntegrationHandlers } = require('./main/integrations');
const { loadReminders, registerTimerHandlers } = require('./main/timers');
const { loadNotes, registerNoteHandlers } = require('./main/notes');
const { loadClipboard, startPolling, stopPolling, registerClipboardHandlers } = require('./main/clipboard-manager');

// ===== App Lifecycle =====

app.whenReady().then(() => {
  // Load persistent state
  settings.loadSettings();
  loadReminders();
  loadNotes();
  loadClipboard();

  // Register all IPC handlers
  registerIpcHandlers();
  registerIntegrationHandlers();
  registerTimerHandlers();
  registerNoteHandlers();
  registerClipboardHandlers();

  // Create windows & tray
  windows.createOverlayWindow();
  windows.createBubbleWindow();
  windows.createMenuWindow();
  windows.createClipboardWindow();
  windows.createTray((bounds) => windows.toggleMenu(bounds));

  // Start services
  server.startServer(showMascot, hideAllBubbles);
  startPolling();

  // Hide dock on macOS
  if (process.platform === 'darwin') app.dock.hide();

  // Global shortcuts
  globalShortcut.register('CmdOrCtrl+Shift+P', hideAllBubbles);
  globalShortcut.register('CmdOrCtrl+Shift+V', () => {
    const cursorPos = screen.getCursorScreenPoint();
    windows.toggleClipboardWindow(cursorPos);
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  stopPolling();
  server.stopServer();
  app.quit();
});

app.on('before-quit', () => {
  server.cancelAllPending({ shutdown: true });
  stopPolling();
  server.stopServer();
});
