# Fleeble

A desktop companion for developers. Fleeble lives in your menu bar as an animated mascot — it relays notifications from AI coding tools, manages your clipboard history, tracks timers and pomodoro sessions, and keeps quick notes.

![macOS](https://img.shields.io/badge/macOS-Apple%20Silicon-8b5cf6?style=flat-square&logo=apple&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-33-47848F?style=flat-square&logo=electron&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

## Features

### AI Notifications

Fleeble runs a local HTTP server on `127.0.0.1:7777`. AI tools send notifications via shell hooks, and Fleeble renders them as interactive floating bubbles on your desktop.

- **Interactive bubbles** — Markdown-rendered notifications with option buttons, free-text replies, and keyboard shortcuts (1-9, Escape)
- **Animated mascot** — Draggable character that reacts to notification types (action, error, info, question, approval)
- **Smart grouping** — Notifications from the same project auto-collapse with counters when 3+ stack up
- **Two approval modes** — *Manage* intercepts tool requests and waits for your approval; *Notify* is fire-and-forget with auto-dismiss

### Clipboard Manager

Press `Cmd+Shift+V` to open a popup clipboard history near your cursor.

- **Auto-capture** — Monitors text and images every second
- **Smart categories** — URLs, code snippets, plain text, and images are auto-detected
- **Search & filter** — Filter by category or search across all entries
- **Pin favorites** — Star entries to keep them at the top
- **Images** — Captures screenshots and copied images with thumbnail previews
- **Limits** — 500 text entries, 100 images (configurable)

### Reminders & Timers

Set quick reminders from the tray menu. When a reminder fires, the mascot pops up with options to dismiss or snooze.

- **Quick durations** — 5 min, 15 min, 30 min, 1 hour
- **Persistent** — Reminders survive app restarts
- **Snooze** — Snooze for 5 more minutes from the notification bubble
- **Live countdown** — See remaining time in the tray menu

### Pomodoro Timer

Built-in pomodoro timer with visual progress tracking.

- **Full cycle** — 25 min focus → 5 min short break → repeat 4x → 15 min long break
- **Configurable** — Adjust focus, short break, and long break durations in settings
- **Visual ring** — SVG progress ring in the tray menu with live countdown
- **Mascot alerts** — The mascot announces each phase transition (break time, focus time, long break)

### Quick Notes

Lightweight note-taking directly from the tray menu.

- **Create & edit** — Title + content with auto-save (1s debounce)
- **Search** — Filter notes by title and content
- **Persistent** — Saved to disk, available across restarts

### General

- **5 themes** — Dark, Light, Midnight, Rose, Ocean — switch instantly from the tray
- **8 notification sounds** — Pick your sound or mute with Do Not Disturb
- **Multi-display** — Choose which screen shows notifications
- **Notification history** — Last 50 notifications accessible from the tray menu
- **Bilingual** — English and French, auto-detected from system locale
- **6-tab tray menu** — Activity, Clipboard, Timers, Notes, Themes, Config

## Integrations

| Tool | Approval | Notify | Setup |
|------|----------|--------|-------|
| **Claude Code** | Bash, Edit, Write, NotebookEdit, AskUserQuestion | All notifications | One-click from Settings |
| **Cursor** | Shell commands | Stop events | One-click from Settings |
| **Codex CLI** | — | Agent turn summaries | One-click from Settings |

Hooks are installed automatically via the Settings menu — no manual config needed.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+V` | Toggle clipboard manager |
| `Cmd+Shift+P` | Dismiss all notifications |
| `1-9` | Pick option on the latest notification |
| `Escape` | Dismiss the latest notification |

## Install

### Download

Grab the latest `.dmg` from the [Releases](https://github.com/STRJack/fleeble/releases/latest) page.

### Build from source

```bash
git clone https://github.com/STRJack/fleeble.git
cd fleeble
npm install
npm run build        # unsigned
npm run build:signed # signed + notarized (requires Apple credentials in .env)
```

## CLI

Fleeble includes a CLI to send notifications from any script:

```bash
# Simple message
mascot "Hey! Review this code"

# With source and type
mascot -s claude-code -t approval "Can I push to main?"

# From stdin
echo "Build complete" | mascot

# Dismiss current notification
mascot --dismiss
```

| Flag | Description |
|------|-------------|
| `-s, --source <name>` | Source (`claude-code`, `cursor`, `codex`) |
| `-t, --type <type>` | Type (`action`, `error`, `info`, `question`, `approval`) |
| `-d, --dismiss` | Dismiss the current notification |

## Architecture

```
fleeble/
├── main.js              # Electron lifecycle & global shortcuts
├── main/
│   ├── settings.js      # Settings load/save, language detection
│   ├── theme.js         # Themes, sounds, broadcasting
│   ├── windows.js       # Window creation, tray, positioning
│   ├── server.js        # HTTP server (port 7777)
│   ├── integrations.js  # Claude/Cursor/Codex hook management
│   ├── ipc-handlers.js  # Core IPC handlers, showMascot()
│   ├── clipboard-manager.js  # Clipboard monitoring & storage
│   ├── timers.js        # Reminders & Pomodoro state machine
│   └── notes.js         # Quick notes CRUD
├── cli.js               # CLI to send notifications
├── hooks/               # Shell/Python hooks for AI tool integrations
├── renderer/
│   ├── bubble/          # Notification bubble UI
│   ├── menu/            # Tray menu (6 tabs)
│   ├── clipboard/       # Clipboard manager popup
│   └── i18n.js          # EN/FR translations
└── build/               # App icons & entitlements
```

## License

MIT
