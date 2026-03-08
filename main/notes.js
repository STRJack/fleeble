const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

const NOTES_PATH = path.join(app.getPath('userData'), 'notes.json');

let notes = [];

function loadNotes() {
  try {
    if (fs.existsSync(NOTES_PATH)) {
      notes = JSON.parse(fs.readFileSync(NOTES_PATH, 'utf8'));
    }
  } catch {}
}

function saveNotes() {
  try { fs.writeFileSync(NOTES_PATH, JSON.stringify(notes, null, 2)); } catch {}
}

function createNote(title = '', content = '') {
  const note = {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    content,
    created: Date.now(),
    updated: Date.now()
  };
  notes.unshift(note);
  saveNotes();
  broadcastNotesUpdate();
  return note;
}

function updateNote(id, updates) {
  const note = notes.find(n => n.id === id);
  if (!note) return null;
  if (updates.title !== undefined) note.title = updates.title;
  if (updates.content !== undefined) note.content = updates.content;
  note.updated = Date.now();
  saveNotes();
  broadcastNotesUpdate();
  return note;
}

function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  saveNotes();
  broadcastNotesUpdate();
}

function getNotes() {
  return notes;
}

function searchNotes(query) {
  if (!query) return notes;
  const q = query.toLowerCase();
  return notes.filter(n =>
    (n.title && n.title.toLowerCase().includes(q)) ||
    (n.content && n.content.toLowerCase().includes(q))
  );
}

function broadcastNotesUpdate() {
  const windows = require('./windows');
  const menuWindow = windows.getMenuWindow();
  if (menuWindow && !menuWindow.isDestroyed()) {
    menuWindow.webContents.send('notes-updated', notes);
  }
}

function registerNoteHandlers() {
  ipcMain.handle('get-notes', (_, query) => {
    return query ? searchNotes(query) : getNotes();
  });

  ipcMain.handle('create-note', (_, { title, content }) => {
    return createNote(title, content);
  });

  ipcMain.handle('update-note', (_, { id, title, content }) => {
    return updateNote(id, { title, content });
  });

  ipcMain.on('delete-note', (_, id) => {
    deleteNote(id);
  });
}

module.exports = { loadNotes, registerNoteHandlers };
