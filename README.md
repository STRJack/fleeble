# Fleeble

A playful desktop mascot that bridges the gap between AI coding tools and you. Fleeble pops up when your AI needs attention — approve actions, answer questions, and stay in the loop without switching windows.

![macOS](https://img.shields.io/badge/macOS-Apple%20Silicon-8b5cf6?style=flat-square&logo=apple&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-33-47848F?style=flat-square&logo=electron&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

## What is Fleeble?

When AI tools like Claude Code, Cursor, or Codex need human input — a permission to run a command, a question to answer, an error to review — Fleeble appears as an animated mascot on your screen with the notification. You can approve, deny, or respond directly from the bubble without touching your terminal.

### Supported AI tools

| Tool | Hook | Mode |
|------|------|------|
| Claude Code | `hooks/claude-code-hook.sh` | Manage (approve/deny) + Notify |
| Cursor | `hooks/cursor-hook.sh` | Notify |
| Codex | `hooks/codex-hook.py` | Notify |

## Install

### Download

Grab the latest `.dmg` from the [Releases](https://github.com/STRJack/fleeble/releases/latest) page.

### Build from source

```bash
git clone https://github.com/STRJack/fleeble.git
cd fleeble
npm install
npm run build
# DMG output in dist/
```

## Usage

### Start Fleeble

```bash
npm start
```

### Send notifications via CLI

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

### CLI options

| Flag | Description |
|------|-------------|
| `-s, --source <name>` | Source AI (`claude-code`, `cursor`, `codex`) |
| `-t, --type <type>` | Message type (`action`, `error`, `info`, `question`, `approval`) |
| `-d, --dismiss` | Dismiss the current notification |

### Hook setup

**Claude Code** — Add to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "",
        "hooks": [{ "type": "command", "command": "/path/to/fleeble/hooks/claude-code-hook.sh" }]
      }
    ],
    "Notification": [
      {
        "matcher": "",
        "hooks": [{ "type": "command", "command": "/path/to/fleeble/hooks/claude-code-hook.sh" }]
      }
    ]
  }
}
```

## Architecture

```
fleeble/
├── main.js              # Electron main process + local HTTP server (port 7777)
├── cli.js               # CLI to send notifications
├── hooks/               # AI tool integration hooks
├── renderer/
│   ├── bubble/          # Notification bubble UI
│   └── menu/            # Tray menu UI
└── build/               # App icons
```

Fleeble runs a local HTTP server on `127.0.0.1:7777`. Hooks send POST requests to `/notify`, and the Electron app renders them as animated bubbles.
