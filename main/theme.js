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

// Broadcast theme to all windows
function broadcastTheme(windows) {
  const settings = require('./settings').getSettings();
  const theme = THEMES[settings.theme] || THEMES.dark;
  const data = { name: settings.theme, vars: theme.vars };
  windows.forEach(win => {
    if (win && !win.isDestroyed()) {
      win.webContents.send('apply-theme', data);
    }
  });
}

// Broadcast language to all windows
function broadcastLanguage(windows) {
  const { getResolvedLanguage } = require('./settings');
  const lang = getResolvedLanguage();
  windows.forEach(win => {
    if (win && !win.isDestroyed()) {
      win.webContents.send('language-changed', lang);
    }
  });
}

module.exports = { THEMES, SOUNDS, broadcastTheme, broadcastLanguage };
