const { ipcMain, clipboard, nativeImage, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const { getSettings } = require('./settings');

const CLIPBOARD_PATH = path.join(app.getPath('userData'), 'clipboard.json');
const MAX_TEXT_ITEMS = 500;
const MAX_IMAGE_ITEMS = 100;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

let clipboardHistory = [];
let pollingInterval = null;
let lastText = '';
let lastImageHash = '';
let skipNextPoll = false;

// ===== Categories =====

function categorize(text) {
  if (!text) return 'text';
  if (/^https?:\/\//i.test(text.trim())) return 'url';
  // Code heuristics
  const codeSignals = ['{', '}', 'function ', 'const ', 'let ', 'var ', 'import ', 'export ', 'class ', '=>', '===', '!==', 'def ', 'return '];
  const matches = codeSignals.filter(s => text.includes(s));
  if (matches.length >= 2) return 'code';
  return 'text';
}

// ===== Storage =====

function loadClipboard() {
  try {
    if (fs.existsSync(CLIPBOARD_PATH)) {
      clipboardHistory = JSON.parse(fs.readFileSync(CLIPBOARD_PATH, 'utf8'));
    }
  } catch {}
}

function saveClipboard() {
  try { fs.writeFileSync(CLIPBOARD_PATH, JSON.stringify(clipboardHistory)); } catch {}
}

// ===== Polling =====

function startPolling() {
  const settings = getSettings();
  if (!settings.clipboardEnabled) return;

  // Initialize with current clipboard content
  lastText = clipboard.readText() || '';

  pollingInterval = setInterval(() => {
    if (skipNextPoll) {
      skipNextPoll = false;
      return;
    }

    const settings = getSettings();
    if (!settings.clipboardEnabled) return;

    // Check text
    const text = clipboard.readText() || '';
    if (text && text !== lastText) {
      lastText = text;
      addEntry({
        type: 'text',
        content: text,
        category: categorize(text),
        timestamp: Date.now(),
        pinned: false
      });
    }

    // Check image
    const img = clipboard.readImage();
    if (img && !img.isEmpty()) {
      const buf = img.toPNG();
      // Simple hash: size + first few bytes
      const hash = `${buf.length}-${buf.slice(0, 32).toString('hex')}`;
      if (hash !== lastImageHash && buf.length <= MAX_IMAGE_SIZE) {
        lastImageHash = hash;
        // Create thumbnail
        const thumb = img.resize({ width: 80, height: 80 });
        addEntry({
          type: 'image',
          content: `data:image/png;base64,${buf.toString('base64')}`,
          thumbnail: `data:image/png;base64,${thumb.toPNG().toString('base64')}`,
          category: 'image',
          timestamp: Date.now(),
          pinned: false,
          size: buf.length
        });
      }
    }
  }, 1000);
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

function addEntry(entry) {
  entry.id = `clip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // Deduplicate text entries
  if (entry.type === 'text') {
    const existingIdx = clipboardHistory.findIndex(e => e.type === 'text' && e.content === entry.content);
    if (existingIdx !== -1) {
      // Move to top, update timestamp
      const [existing] = clipboardHistory.splice(existingIdx, 1);
      existing.timestamp = entry.timestamp;
      clipboardHistory.unshift(existing);
      saveClipboard();
      broadcastClipboardUpdate();
      return;
    }
  }

  clipboardHistory.unshift(entry);

  // Enforce limits
  const textItems = clipboardHistory.filter(e => e.type !== 'image');
  const imageItems = clipboardHistory.filter(e => e.type === 'image');

  if (textItems.length > MAX_TEXT_ITEMS) {
    // Remove oldest unpinned text items
    const unpinned = textItems.filter(e => !e.pinned);
    while (unpinned.length > MAX_TEXT_ITEMS) {
      const oldest = unpinned.pop();
      clipboardHistory = clipboardHistory.filter(e => e.id !== oldest.id);
    }
  }

  if (imageItems.length > MAX_IMAGE_ITEMS) {
    const unpinned = imageItems.filter(e => !e.pinned);
    while (unpinned.length > MAX_IMAGE_ITEMS) {
      const oldest = unpinned.pop();
      clipboardHistory = clipboardHistory.filter(e => e.id !== oldest.id);
    }
  }

  saveClipboard();
  broadcastClipboardUpdate();
}

function copyToClipboard(id) {
  const entry = clipboardHistory.find(e => e.id === id);
  if (!entry) return;

  skipNextPoll = true;

  if (entry.type === 'image') {
    // Decode base64 to image
    const base64 = entry.content.replace(/^data:image\/\w+;base64,/, '');
    const img = nativeImage.createFromBuffer(Buffer.from(base64, 'base64'));
    clipboard.writeImage(img);
  } else {
    clipboard.writeText(entry.content);
  }
}

function togglePin(id) {
  const entry = clipboardHistory.find(e => e.id === id);
  if (entry) {
    entry.pinned = !entry.pinned;
    saveClipboard();
    broadcastClipboardUpdate();
  }
}

function deleteEntry(id) {
  clipboardHistory = clipboardHistory.filter(e => e.id !== id);
  saveClipboard();
  broadcastClipboardUpdate();
}

function getHistory(filter, search) {
  let items = clipboardHistory;

  if (filter && filter !== 'all') {
    items = items.filter(e => e.category === filter);
  }

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(e =>
      e.type === 'text' && e.content.toLowerCase().includes(q)
    );
  }

  // Return without full image content for list view (use thumbnail instead)
  return items.map(e => {
    if (e.type === 'image') {
      return { ...e, content: undefined }; // Strip full image from list
    }
    return { ...e, content: e.content.slice(0, 500) }; // Truncate long text for preview
  });
}

function getFullEntry(id) {
  return clipboardHistory.find(e => e.id === id) || null;
}

function broadcastClipboardUpdate() {
  const windows = require('./windows');
  const menuWindow = windows.getMenuWindow();
  if (menuWindow && !menuWindow.isDestroyed()) {
    // Send summary for menu tab
    const recent = clipboardHistory.slice(0, 10).map(e => ({
      id: e.id,
      type: e.type,
      category: e.category,
      content: e.type === 'image' ? undefined : e.content.slice(0, 100),
      thumbnail: e.thumbnail,
      timestamp: e.timestamp,
      pinned: e.pinned
    }));
    menuWindow.webContents.send('clipboard-updated', recent);
  }

  const clipboardWindow = windows.getClipboardWindow();
  if (clipboardWindow && !clipboardWindow.isDestroyed()) {
    clipboardWindow.webContents.send('clipboard-updated', getHistory());
  }
}

// ===== IPC Handlers =====

function registerClipboardHandlers() {
  ipcMain.handle('get-clipboard-history', (_, { filter, search } = {}) => {
    return getHistory(filter, search);
  });

  ipcMain.handle('get-clipboard-entry', (_, id) => {
    return getFullEntry(id);
  });

  ipcMain.on('clipboard-copy', (_, id) => {
    copyToClipboard(id);
  });

  ipcMain.on('clipboard-pin', (_, id) => {
    togglePin(id);
  });

  ipcMain.on('clipboard-delete', (_, id) => {
    deleteEntry(id);
  });

  ipcMain.on('toggle-clipboard-window', () => {
    const { screen } = require('electron');
    const cursorPos = screen.getCursorScreenPoint();
    const windows = require('./windows');
    windows.toggleClipboardWindow(cursorPos);
  });
}

module.exports = {
  loadClipboard,
  startPolling,
  stopPolling,
  registerClipboardHandlers
};
