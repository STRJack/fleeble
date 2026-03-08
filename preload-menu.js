const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('menuAPI', {
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  getDisplays: () => ipcRenderer.invoke('get-displays'),
  getHistory: () => ipcRenderer.invoke('get-history'),
  updateSettings: (s) => ipcRenderer.send('update-settings', s),
  testMascot: () => ipcRenderer.send('test-mascot'),
  clearHistory: () => ipcRenderer.send('clear-history'),
  closeMenu: () => ipcRenderer.send('close-menu'),
  quitApp: () => ipcRenderer.send('quit-app'),

  // Integrations
  claudeStatus: () => ipcRenderer.invoke('claude-status'),
  claudeConnect: () => ipcRenderer.invoke('claude-connect'),
  claudeDisconnect: () => ipcRenderer.invoke('claude-disconnect'),
  cursorStatus: () => ipcRenderer.invoke('cursor-status'),
  cursorConnect: () => ipcRenderer.invoke('cursor-connect'),
  cursorDisconnect: () => ipcRenderer.invoke('cursor-disconnect'),
  codexStatus: () => ipcRenderer.invoke('codex-status'),
  codexConnect: () => ipcRenderer.invoke('codex-connect'),
  codexDisconnect: () => ipcRenderer.invoke('codex-disconnect'),

  // Events
  onUpdateState: (cb) => ipcRenderer.on('update-state', (_, d) => cb(d)),
  onNewNotification: (cb) => ipcRenderer.on('new-notification', (_, d) => cb(d)),

  // DND
  toggleDnd: () => ipcRenderer.send('toggle-dnd'),
  onDndChanged: (cb) => ipcRenderer.on('dnd-changed', (_, dnd) => cb(dnd)),

  // Theme & Sound
  onApplyTheme: (cb) => ipcRenderer.on('apply-theme', (_, d) => cb(d)),
  applyTheme: (name) => ipcRenderer.send('apply-theme', name),
  getThemes: () => ipcRenderer.invoke('get-themes'),
  changeSound: (name) => ipcRenderer.send('change-sound', name),
  getSounds: () => ipcRenderer.invoke('get-sounds'),

  // Language
  getLanguage: () => ipcRenderer.invoke('get-language'),
  changeLanguage: (lang) => ipcRenderer.send('change-language', lang),
  onLanguageChanged: (cb) => ipcRenderer.on('language-changed', (_, lang) => cb(lang)),

  // Approval mode
  getApprovalMode: () => ipcRenderer.invoke('get-approval-mode'),
  changeApprovalMode: (mode) => ipcRenderer.send('change-approval-mode', mode),

  // Reminders
  addReminder: (data) => ipcRenderer.invoke('add-reminder', data),
  getActiveReminders: () => ipcRenderer.invoke('get-active-reminders'),
  deleteReminder: (id) => ipcRenderer.send('delete-reminder', id),
  snoozeReminder: (data) => ipcRenderer.send('snooze-reminder', data),
  onRemindersUpdated: (cb) => ipcRenderer.on('reminders-updated', (_, d) => cb(d)),

  // Pomodoro
  getPomodoroStatus: () => ipcRenderer.invoke('get-pomodoro-status'),
  pomodoroStart: () => ipcRenderer.send('pomodoro-start'),
  pomodoroPause: () => ipcRenderer.send('pomodoro-pause'),
  pomodoroResume: () => ipcRenderer.send('pomodoro-resume'),
  pomodoroReset: () => ipcRenderer.send('pomodoro-reset'),
  pomodoroSkip: () => ipcRenderer.send('pomodoro-skip'),
  onPomodoroUpdated: (cb) => ipcRenderer.on('pomodoro-updated', (_, d) => cb(d)),

  // Notes
  getNotes: (query) => ipcRenderer.invoke('get-notes', query),
  createNote: (data) => ipcRenderer.invoke('create-note', data),
  updateNote: (data) => ipcRenderer.invoke('update-note', data),
  deleteNote: (id) => ipcRenderer.send('delete-note', id),
  onNotesUpdated: (cb) => ipcRenderer.on('notes-updated', (_, d) => cb(d)),

  // Clipboard (summary in menu)
  getClipboardHistory: (opts) => ipcRenderer.invoke('get-clipboard-history', opts || {}),
  clipboardCopy: (id) => ipcRenderer.send('clipboard-copy', id),
  clipboardPin: (id) => ipcRenderer.send('clipboard-pin', id),
  clipboardDelete: (id) => ipcRenderer.send('clipboard-delete', id),
  toggleClipboardWindow: () => ipcRenderer.send('toggle-clipboard-window'),
  onClipboardUpdated: (cb) => ipcRenderer.on('clipboard-updated', (_, d) => cb(d)),

  // Updater
  updaterCheck: () => ipcRenderer.invoke('updater:check'),
  updaterDownload: () => ipcRenderer.invoke('updater:download'),
  updaterInstall: () => ipcRenderer.send('updater:install'),
  updaterGetStatus: () => ipcRenderer.invoke('updater:get-status'),
  onUpdaterStatus: (cb) => ipcRenderer.on('updater-status', (_, d) => cb(d))
});
