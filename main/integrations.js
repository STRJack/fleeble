const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const HOOKS_DIR = path.join(process.env.HOME || '', '.fleeble', 'hooks');
const HOOK_SOURCES = {
  'claude-code-hook.sh': path.join(__dirname, '..', 'hooks', 'claude-code-hook.sh'),
  'cursor-hook.sh': path.join(__dirname, '..', 'hooks', 'cursor-hook.sh'),
  'codex-hook.py': path.join(__dirname, '..', 'hooks', 'codex-hook.py'),
};

function ensureHook(filename) {
  const dest = path.join(HOOKS_DIR, filename);
  const src = HOOK_SOURCES[filename];
  try {
    if (!fs.existsSync(HOOKS_DIR)) fs.mkdirSync(HOOKS_DIR, { recursive: true });
    fs.copyFileSync(src, dest);
    fs.chmodSync(dest, 0o755);
  } catch {}
  return dest;
}

// ===== Claude Code Integration =====

function getClaudeSettingsPath() {
  return path.join(process.env.HOME || '', '.claude', 'settings.json');
}

function readClaudeSettings() {
  try {
    const p = getClaudeSettingsPath();
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {}
  return {};
}

function isClaudeConnected() {
  const s = readClaudeSettings();
  return JSON.stringify(s.hooks || {}).includes('claude-code-hook.sh');
}

// ===== Cursor Integration =====

function getCursorHooksPath() {
  return path.join(process.env.HOME || '', '.cursor', 'hooks.json');
}

function readCursorHooks() {
  try {
    const p = getCursorHooksPath();
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {}
  return { version: 1, hooks: {} };
}

function isCursorConnected() {
  const h = readCursorHooks();
  const hooks = h.hooks || {};
  // Support both flat format (correct) and legacy nested format
  const str = JSON.stringify(hooks);
  return str.includes('cursor-hook.sh');
}

// ===== Codex CLI Integration =====

function getCodexConfigPath() {
  return path.join(process.env.HOME || '', '.codex', 'config.toml');
}

function isCodexConnected() {
  try {
    const p = getCodexConfigPath();
    if (!fs.existsSync(p)) return false;
    const content = fs.readFileSync(p, 'utf8');
    return content.includes('codex-hook.py');
  } catch {}
  return false;
}

function registerIntegrationHandlers() {
  // Claude Code
  ipcMain.handle('claude-status', () => {
    const settingsPath = getClaudeSettingsPath();
    const exists = fs.existsSync(settingsPath);
    return { exists, connected: exists && isClaudeConnected() };
  });

  ipcMain.handle('claude-connect', () => {
    try {
      const hookPath = ensureHook('claude-code-hook.sh');
      const settingsPath = getClaudeSettingsPath();
      const s = readClaudeSettings();
      if (!s.hooks) s.hooks = {};

      s.hooks.Notification = s.hooks.Notification || [];
      s.hooks.Notification = s.hooks.Notification.filter(h => !h.hooks || !h.hooks.some(hh => hh.command && hh.command.includes('claude-code-hook.sh')));
      s.hooks.Notification.push({ matcher: '', hooks: [{ type: 'command', command: hookPath }] });

      s.hooks.PreToolUse = s.hooks.PreToolUse || [];
      s.hooks.PreToolUse = s.hooks.PreToolUse.filter(h => !h.hooks || !h.hooks.some(hh => hh.command && hh.command.includes('claude-code-hook.sh')));
      const preToolMatchers = ['AskUserQuestion', 'Bash', 'Edit', 'Write', 'NotebookEdit'];
      for (const matcher of preToolMatchers) {
        s.hooks.PreToolUse.push({ matcher, hooks: [{ type: 'command', command: hookPath }] });
      }

      fs.writeFileSync(settingsPath, JSON.stringify(s, null, 2));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle('claude-disconnect', () => {
    try {
      const settingsPath = getClaudeSettingsPath();
      const s = readClaudeSettings();
      if (!s.hooks) return { ok: true };

      for (const key of ['Notification', 'PreToolUse']) {
        if (s.hooks[key]) {
          s.hooks[key] = s.hooks[key].filter(h => !h.hooks || !h.hooks.some(hh => hh.command && hh.command.includes('claude-code-hook.sh')));
          if (!s.hooks[key].length) delete s.hooks[key];
        }
      }
      if (!Object.keys(s.hooks).length) delete s.hooks;

      fs.writeFileSync(settingsPath, JSON.stringify(s, null, 2));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  // Cursor
  ipcMain.handle('cursor-status', () => {
    const dirPath = path.join(process.env.HOME || '', '.cursor');
    const exists = fs.existsSync(dirPath);
    return { exists, connected: exists && isCursorConnected() };
  });

  ipcMain.handle('cursor-connect', () => {
    try {
      const hookPath = ensureHook('cursor-hook.sh');
      const hooksPath = getCursorHooksPath();
      const h = readCursorHooks();
      if (!h.hooks) h.hooks = {};

      // Cursor flat format: { command, type, matcher } directly in array
      if (!h.hooks.preToolUse) h.hooks.preToolUse = [];
      h.hooks.preToolUse = h.hooks.preToolUse.filter(e => !(e.command && e.command.includes('cursor-hook.sh')));
      h.hooks.preToolUse.push({ type: 'command', command: hookPath, matcher: 'Shell' });

      if (!h.hooks.stop) h.hooks.stop = [];
      h.hooks.stop = h.hooks.stop.filter(e => !(e.command && e.command.includes('cursor-hook.sh')));
      h.hooks.stop.push({ type: 'command', command: hookPath });

      const dir = path.dirname(hooksPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      fs.writeFileSync(hooksPath, JSON.stringify(h, null, 2));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle('cursor-disconnect', () => {
    try {
      const hooksPath = getCursorHooksPath();
      const h = readCursorHooks();
      if (!h.hooks) return { ok: true };

      for (const key of ['preToolUse', 'stop']) {
        if (h.hooks[key]) {
          // Filter out both flat format and legacy nested format
          h.hooks[key] = h.hooks[key].filter(e => {
            if (e.command && e.command.includes('cursor-hook.sh')) return false;
            if (e.hooks && e.hooks.some(hh => hh.command && hh.command.includes('cursor-hook.sh'))) return false;
            return true;
          });
          if (!h.hooks[key].length) delete h.hooks[key];
        }
      }

      fs.writeFileSync(hooksPath, JSON.stringify(h, null, 2));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  // Codex CLI
  ipcMain.handle('codex-status', () => {
    const dirPath = path.join(process.env.HOME || '', '.codex');
    const exists = fs.existsSync(dirPath);
    return { exists, connected: exists && isCodexConnected() };
  });

  ipcMain.handle('codex-connect', () => {
    try {
      const hookPath = ensureHook('codex-hook.py');
      const configPath = getCodexConfigPath();
      const dir = path.dirname(configPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      let content = '';
      if (fs.existsSync(configPath)) {
        content = fs.readFileSync(configPath, 'utf8');
      }

      const lines = content.split('\n').filter(l => !l.trim().startsWith('notify'));
      lines.push(`notify = ["python3", "${hookPath}"]`);

      fs.writeFileSync(configPath, lines.join('\n') + '\n');
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle('codex-disconnect', () => {
    try {
      const configPath = getCodexConfigPath();
      if (!fs.existsSync(configPath)) return { ok: true };

      let content = fs.readFileSync(configPath, 'utf8');
      const lines = content.split('\n').filter(l => !l.trim().startsWith('notify'));
      fs.writeFileSync(configPath, lines.join('\n'));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });
}

module.exports = { registerIntegrationHandlers };
