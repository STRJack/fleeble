const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('bubbleAPI', {
  onAddBubble: (cb) => ipcRenderer.on('add-bubble', (_, d) => cb(d)),
  onClearAllCards: (cb) => ipcRenderer.on('clear-all-cards', () => cb()),
  onRemoveCardByRequest: (cb) => ipcRenderer.on('remove-card-by-request', (_, requestId) => cb(requestId)),
  optionSelected: (data) => ipcRenderer.send('bubble-option-selected', data),
  dismissOne: (data) => ipcRenderer.send('bubble-dismiss-one', data),
  allCardsGone: () => ipcRenderer.send('bubble-all-cards-gone'),
  requestResize: (height) => ipcRenderer.send('bubble-resize', { height }),
  focusTerminal: () => ipcRenderer.send('focus-terminal'),
  openExternal: (url) => ipcRenderer.send('open-external', url),
  onApplyTheme: (cb) => ipcRenderer.on('apply-theme', (_, d) => cb(d)),
  onChangeSound: (cb) => ipcRenderer.on('change-sound', (_, file) => cb(file)),
  onLanguageChanged: (cb) => ipcRenderer.on('language-changed', (_, lang) => cb(lang)),
  onClearApprovalCards: (cb) => ipcRenderer.on('clear-approval-cards', () => cb())
});
