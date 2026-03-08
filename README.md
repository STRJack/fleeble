# Fleeble

A desktop notification companion for AI coding tools. Fleeble pops up as an animated mascot when Claude Code, Cursor, or Codex need your attention — approve actions, answer questions, and stay in the loop without leaving your workflow.

![macOS](https://img.shields.io/badge/macOS-Apple%20Silicon-8b5cf6?style=flat-square&logo=apple&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-33-47848F?style=flat-square&logo=electron&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

## How it works

Fleeble runs a local HTTP server on `127.0.0.1:7777`. AI tools send notifications via shell hooks, and Fleeble renders them as interactive floating bubbles on your desktop. You can approve, deny, or respond directly from the bubble — no terminal switching needed.

### Two approval modes

- **Manage** — Fleeble intercepts tool requests (Bash, Edit, Write, etc.) and waits for your approval before the AI proceeds. The hook blocks until you Allow or Deny from the bubble.
- **Notify** — Fire-and-forget. Fleeble shows the notification with auto-dismiss, and the AI tool handles approvals in the terminal as usual.

## Integrations

| Tool | Approval | Notify | Setup |
|------|----------|--------|-------|
| **Claude Code** | Bash, Edit, Write, NotebookEdit, AskUserQuestion | All notifications | One-click from Settings |
| **Cursor** | Shell commands | Stop events | One-click from Settings |
| **Codex CLI** | — | Agent turn summaries | One-click from Settings |

Hooks are installed automatically via the Settings menu — no manual config needed.

## Features

- **Interactive bubbles** — Markdown-rendered notifications with option buttons, free-text replies, and keyboard shortcuts (1-9, Escape)
- **Animated mascot** — Draggable character that reacts to notification types (action, error, info, question, approval)
- **Smart grouping** — Notifications from the same project auto-collapse with counters when 3+ stack up
- **5 themes** — Dark, Light, Midnight, Rose, Ocean — switch instantly from the tray menu
- **8 notification sounds** — Pick your sound or mute with Do Not Disturb
- **Multi-display** — Choose which screen shows notifications
- **Notification history** — Last 50 notifications accessible from the tray menu
- **Bilingual** — English and French, auto-detected from system locale

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
├── main.js              # Electron main process + HTTP server (port 7777)
├── cli.js               # CLI to send notifications
├── hooks/               # Shell/Python hooks for AI tool integrations
├── renderer/
│   ├── bubble/          # Notification bubble UI
│   └── menu/            # Tray menu (activity, themes, settings)
└── build/               # App icons & entitlements
```

## License

MIT
