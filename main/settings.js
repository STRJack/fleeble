const path = require('path');
const fs = require('fs');
const { app } = require('electron');

const SETTINGS_PATH = path.join(app.getPath('userData'), 'settings.json');
const HISTORY_PATH = path.join(app.getPath('userData'), 'history.json');

let settings = {
  selectedScreen: 0,
  position: 'top-right',
  autoDismiss: 30,
  soundEnabled: true,
  launchAtLogin: false,
  dnd: false,
  theme: 'dark',
  notifSound: 'default',
  mascotPosition: null,
  language: null,
  approvalMode: 'manage',
  // New feature settings
  clipboardEnabled: true,
  clipboardMaxItems: 500,
  pomodoroFocusDuration: 25,
  pomodoroShortBreak: 5,
  pomodoroLongBreak: 15
};

let notificationHistory = [];

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

function saveSettings() {
  try { fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2)); } catch {}
}

function saveHistory() {
  try { fs.writeFileSync(HISTORY_PATH, JSON.stringify(notificationHistory.slice(-50))); } catch {}
}

function getSettings() {
  return settings;
}

function updateSettings(newSettings) {
  Object.assign(settings, newSettings);
}

function getNotificationHistory() {
  return notificationHistory;
}

function addToHistory(entry) {
  notificationHistory.push(entry);
  saveHistory();
}

function clearHistory() {
  notificationHistory = [];
  saveHistory();
}

module.exports = {
  loadSettings,
  getResolvedLanguage,
  saveSettings,
  saveHistory,
  getSettings,
  updateSettings,
  getNotificationHistory,
  addToHistory,
  clearHistory
};
