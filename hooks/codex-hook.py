#!/usr/bin/env python3
# Fleeble — Codex CLI hook
# Codex passes JSON as CLI argument (sys.argv[1]), not stdin.
# Event: agent-turn-complete -> fire-and-forget notification

import json, sys, urllib.request, os

if len(sys.argv) < 2:
    sys.exit(0)

try:
    d = json.loads(sys.argv[1])
except:
    sys.exit(0)

project = os.path.basename(os.environ.get('PWD', os.getcwd()))

# Extract last assistant message from the JSON
last_msg = d.get('last-assistant-message', '')
if not last_msg:
    last_msg = 'Codex finished'

# Truncate long messages
if len(last_msg) > 200:
    last_msg = last_msg[:200] + '...'

msg = 'Codex finished: ' + last_msg

payload = {
    'message': msg,
    'type': 'info',
    'source': 'codex',
    'project': project
}

data = json.dumps(payload).encode()
req = urllib.request.Request(
    'http://127.0.0.1:7777/notify',
    data=data,
    headers={'Content-Type': 'application/json'},
    method='POST'
)

try:
    urllib.request.urlopen(req, timeout=3)
except:
    pass
