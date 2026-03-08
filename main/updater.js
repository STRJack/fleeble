const { autoUpdater } = require('electron-updater');
const { ipcMain, app } = require('electron');

let state = { status: 'idle', version: null, progress: 0, error: null };
let menuWindow = null;

function broadcast() {
  if (menuWindow && !menuWindow.isDestroyed()) {
    menuWindow.webContents.send('updater-status', state);
  }
}

function setState(patch) {
  Object.assign(state, patch);
  broadcast();
}

function initUpdater(getMenuWindow) {
  menuWindow = typeof getMenuWindow === 'function' ? getMenuWindow() : getMenuWindow;

  // Config
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  // Events
  autoUpdater.on('checking-for-update', () => {
    setState({ status: 'checking', error: null });
  });

  autoUpdater.on('update-available', (info) => {
    setState({ status: 'available', version: info.version, error: null });
  });

  autoUpdater.on('update-not-available', () => {
    setState({ status: 'up-to-date', error: null });
  });

  autoUpdater.on('download-progress', (prog) => {
    setState({ status: 'downloading', progress: Math.round(prog.percent) });
  });

  autoUpdater.on('update-downloaded', () => {
    setState({ status: 'ready', progress: 100 });
  });

  autoUpdater.on('error', (err) => {
    setState({ status: 'error', error: err?.message || 'Unknown error' });
  });

  // IPC handlers
  ipcMain.handle('updater:check', async () => {
    try {
      await autoUpdater.checkForUpdates();
    } catch (err) {
      setState({ status: 'error', error: err?.message || 'Check failed' });
    }
    return state;
  });

  ipcMain.handle('updater:download', async () => {
    try {
      await autoUpdater.downloadUpdate();
    } catch (err) {
      setState({ status: 'error', error: err?.message || 'Download failed' });
    }
    return state;
  });

  ipcMain.on('updater:install', () => {
    autoUpdater.quitAndInstall();
  });

  ipcMain.handle('updater:get-status', () => {
    return state;
  });

  // Auto-check after 10s delay
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(() => {});
  }, 10000);
}

module.exports = { initUpdater };
