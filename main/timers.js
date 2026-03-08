const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const { getSettings, saveSettings, updateSettings, getResolvedLanguage } = require('./settings');

const REMINDERS_PATH = path.join(app.getPath('userData'), 'reminders.json');

let reminders = [];
let activeTimeouts = new Map(); // id -> timeout

// ===== Reminders =====

function loadReminders() {
  try {
    if (fs.existsSync(REMINDERS_PATH)) {
      reminders = JSON.parse(fs.readFileSync(REMINDERS_PATH, 'utf8'));
    }
  } catch {}
  // Reschedule active reminders on startup
  const now = Date.now();
  reminders = reminders.filter(r => {
    if (r.firedAt) return true; // Keep fired reminders in history
    if (r.fireAt <= now) {
      // Missed while app was closed — fire immediately
      r.firedAt = now;
      return true;
    }
    return true;
  });
  saveReminders();
  rescheduleAll();
}

function saveReminders() {
  try { fs.writeFileSync(REMINDERS_PATH, JSON.stringify(reminders, null, 2)); } catch {}
}

function rescheduleAll() {
  // Clear all existing timeouts
  for (const [id, timeout] of activeTimeouts) {
    clearTimeout(timeout);
  }
  activeTimeouts.clear();

  const now = Date.now();
  reminders.forEach(r => {
    if (r.firedAt) return; // Already fired
    const delay = Math.max(0, r.fireAt - now);
    const timeout = setTimeout(() => fireReminder(r.id), delay);
    activeTimeouts.set(r.id, timeout);
  });
}

function fireReminder(id) {
  const r = reminders.find(rem => rem.id === id);
  if (!r || r.firedAt) return;
  r.firedAt = Date.now();
  activeTimeouts.delete(id);
  saveReminders();

  // Show mascot with the reminder message
  const { showMascot } = require('./ipc-handlers');
  const lang = getResolvedLanguage();
  const snoozeLabel = lang === 'fr' ? 'Snooze 5min' : 'Snooze 5min';
  const gotItLabel = lang === 'fr' ? 'Compris !' : 'Got it!';

  showMascot(
    r.message,
    'info',
    'fleeble',
    [snoozeLabel, gotItLabel],
    null,
    null,
    { meta: { type: 'reminder', reminderId: id } }
  );

  // Broadcast update to menu
  broadcastRemindersUpdate();
}

function addReminder(message, delayMs) {
  const id = `rem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const r = {
    id,
    message,
    createdAt: Date.now(),
    fireAt: Date.now() + delayMs,
    firedAt: null
  };
  reminders.push(r);
  saveReminders();

  const timeout = setTimeout(() => fireReminder(id), delayMs);
  activeTimeouts.set(id, timeout);

  broadcastRemindersUpdate();
  return r;
}

function snoozeReminder(id, delayMs = 5 * 60 * 1000) {
  const r = reminders.find(rem => rem.id === id);
  if (!r) return;
  r.firedAt = null;
  r.fireAt = Date.now() + delayMs;
  saveReminders();

  const timeout = setTimeout(() => fireReminder(id), delayMs);
  activeTimeouts.set(id, timeout);

  broadcastRemindersUpdate();
}

function deleteReminder(id) {
  const timeout = activeTimeouts.get(id);
  if (timeout) clearTimeout(timeout);
  activeTimeouts.delete(id);
  reminders = reminders.filter(r => r.id !== id);
  saveReminders();
  broadcastRemindersUpdate();
}

function getActiveReminders() {
  return reminders.filter(r => !r.firedAt).map(r => ({
    ...r,
    remainingMs: Math.max(0, r.fireAt - Date.now())
  }));
}

function getFiredReminders() {
  return reminders.filter(r => r.firedAt).slice(-20).reverse();
}

// ===== Pomodoro =====

let pomodoroState = {
  phase: 'idle', // idle, focus, short-break, long-break
  startedAt: null,
  pausedAt: null,
  pausedRemaining: null,
  cycleCount: 0,
  totalCycles: 4
};

let pomodoroTimeout = null;

function getPomodoroPhaseMs() {
  const settings = getSettings();
  switch (pomodoroState.phase) {
    case 'focus': return (settings.pomodoroFocusDuration || 25) * 60 * 1000;
    case 'short-break': return (settings.pomodoroShortBreak || 5) * 60 * 1000;
    case 'long-break': return (settings.pomodoroLongBreak || 15) * 60 * 1000;
    default: return 0;
  }
}

function getPomodoroRemaining() {
  if (pomodoroState.phase === 'idle') return 0;
  if (pomodoroState.pausedAt) return pomodoroState.pausedRemaining || 0;
  const elapsed = Date.now() - pomodoroState.startedAt;
  const total = getPomodoroPhaseMs();
  return Math.max(0, total - elapsed);
}

function pomodoroStart() {
  if (pomodoroState.phase !== 'idle') return;
  pomodoroState.phase = 'focus';
  pomodoroState.startedAt = Date.now();
  pomodoroState.pausedAt = null;
  pomodoroState.pausedRemaining = null;
  pomodoroState.cycleCount = 0;
  schedulePomodoroTransition();
  broadcastPomodoroUpdate();
}

function pomodoroPause() {
  if (pomodoroState.phase === 'idle' || pomodoroState.pausedAt) return;
  pomodoroState.pausedRemaining = getPomodoroRemaining();
  pomodoroState.pausedAt = Date.now();
  if (pomodoroTimeout) { clearTimeout(pomodoroTimeout); pomodoroTimeout = null; }
  broadcastPomodoroUpdate();
}

function pomodoroResume() {
  if (!pomodoroState.pausedAt) return;
  pomodoroState.startedAt = Date.now() - (getPomodoroPhaseMs() - pomodoroState.pausedRemaining);
  pomodoroState.pausedAt = null;
  pomodoroState.pausedRemaining = null;
  schedulePomodoroTransition();
  broadcastPomodoroUpdate();
}

function pomodoroReset() {
  if (pomodoroTimeout) { clearTimeout(pomodoroTimeout); pomodoroTimeout = null; }
  pomodoroState = { phase: 'idle', startedAt: null, pausedAt: null, pausedRemaining: null, cycleCount: 0, totalCycles: 4 };
  broadcastPomodoroUpdate();
}

function pomodoroSkip() {
  if (pomodoroState.phase === 'idle') return;
  if (pomodoroTimeout) { clearTimeout(pomodoroTimeout); pomodoroTimeout = null; }
  transitionPomodoro();
}

function schedulePomodoroTransition() {
  if (pomodoroTimeout) clearTimeout(pomodoroTimeout);
  const remaining = getPomodoroRemaining();
  pomodoroTimeout = setTimeout(() => transitionPomodoro(), remaining);
}

function transitionPomodoro() {
  pomodoroTimeout = null;
  const { showMascot } = require('./ipc-handlers');
  const lang = getResolvedLanguage();

  if (pomodoroState.phase === 'focus') {
    pomodoroState.cycleCount++;
    if (pomodoroState.cycleCount >= pomodoroState.totalCycles) {
      pomodoroState.phase = 'long-break';
      const msg = lang === 'fr' ? 'Bravo ! Longue pause de 15 minutes.' : 'Great work! Take a 15-minute break.';
      showMascot(msg, 'info', 'fleeble');
    } else {
      pomodoroState.phase = 'short-break';
      const msg = lang === 'fr' ? `Pause courte ! (${pomodoroState.cycleCount}/${pomodoroState.totalCycles})` : `Short break! (${pomodoroState.cycleCount}/${pomodoroState.totalCycles})`;
      showMascot(msg, 'info', 'fleeble');
    }
  } else if (pomodoroState.phase === 'short-break') {
    pomodoroState.phase = 'focus';
    const msg = lang === 'fr' ? 'C\'est reparti ! Concentration.' : 'Back to focus!';
    showMascot(msg, 'info', 'fleeble');
  } else if (pomodoroState.phase === 'long-break') {
    pomodoroState.phase = 'focus';
    pomodoroState.cycleCount = 0;
    const msg = lang === 'fr' ? 'Nouveau cycle ! C\'est reparti.' : 'New cycle! Let\'s go.';
    showMascot(msg, 'info', 'fleeble');
  }

  pomodoroState.startedAt = Date.now();
  pomodoroState.pausedAt = null;
  pomodoroState.pausedRemaining = null;
  schedulePomodoroTransition();
  broadcastPomodoroUpdate();
}

function getPomodoroStatus() {
  return {
    phase: pomodoroState.phase,
    remainingMs: getPomodoroRemaining(),
    totalMs: getPomodoroPhaseMs(),
    cycleCount: pomodoroState.cycleCount,
    totalCycles: pomodoroState.totalCycles,
    isPaused: !!pomodoroState.pausedAt
  };
}

// ===== Broadcasting =====

function broadcastRemindersUpdate() {
  const windows = require('./windows');
  const menuWindow = windows.getMenuWindow();
  if (menuWindow && !menuWindow.isDestroyed()) {
    menuWindow.webContents.send('reminders-updated', getActiveReminders());
  }
}

function broadcastPomodoroUpdate() {
  const windows = require('./windows');
  const menuWindow = windows.getMenuWindow();
  if (menuWindow && !menuWindow.isDestroyed()) {
    menuWindow.webContents.send('pomodoro-updated', getPomodoroStatus());
  }
}

// ===== IPC Handlers =====

function registerTimerHandlers() {
  // Reminders
  ipcMain.handle('add-reminder', (_, { message, delayMs }) => {
    return addReminder(message, delayMs);
  });

  ipcMain.handle('get-active-reminders', () => getActiveReminders());

  ipcMain.on('delete-reminder', (_, id) => {
    deleteReminder(id);
  });

  ipcMain.on('snooze-reminder', (_, { id, delayMs }) => {
    snoozeReminder(id, delayMs);
  });

  // Pomodoro
  ipcMain.handle('get-pomodoro-status', () => getPomodoroStatus());
  ipcMain.on('pomodoro-start', () => pomodoroStart());
  ipcMain.on('pomodoro-pause', () => pomodoroPause());
  ipcMain.on('pomodoro-resume', () => pomodoroResume());
  ipcMain.on('pomodoro-reset', () => pomodoroReset());
  ipcMain.on('pomodoro-skip', () => pomodoroSkip());
}

module.exports = {
  loadReminders,
  registerTimerHandlers,
  snoozeReminder,
  getPomodoroStatus,
  getActiveReminders
};
