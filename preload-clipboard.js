const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('clipboardAPI', {
  getHistory: (opts) => ipcRenderer.invoke('get-clipboard-history', opts || {}),
  getEntry: (id) => ipcRenderer.invoke('get-clipboard-entry', id),
  copy: (id) => ipcRenderer.send('clipboard-copy', id),
  pin: (id) => ipcRenderer.send('clipboard-pin', id),
  delete: (id) => ipcRenderer.send('clipboard-delete', id),
  close: () => ipcRenderer.send('toggle-clipboard-window'),
  onClipboardUpdated: (cb) => ipcRenderer.on('clipboard-updated', (_, d) => cb(d)),
  onApplyTheme: (cb) => ipcRenderer.on('apply-theme', (_, d) => cb(d)),
  onLanguageChanged: (cb) => ipcRenderer.on('language-changed', (_, lang) => cb(lang))
});
