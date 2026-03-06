const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mascotAPI', {
  onShowMascot: (cb) => ipcRenderer.on('show-mascot', (_, d) => cb(d)),
  onHideMascot: (cb) => ipcRenderer.on('hide-mascot', () => cb()),
  mascotHidden: () => ipcRenderer.send('mascot-hidden'),
  onApplyTheme: (cb) => ipcRenderer.on('apply-theme', (_, d) => cb(d)),
  mascotMouseEnter: () => ipcRenderer.send('mascot-mouse-enter'),
  mascotMouseLeave: () => ipcRenderer.send('mascot-mouse-leave'),
  mascotDragMove: (delta) => ipcRenderer.send('mascot-drag-move', delta),
  mascotDragEnd: () => ipcRenderer.send('mascot-drag-end')
});
