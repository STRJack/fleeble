#!/bin/bash
# Fleeble — Claude Code hook
# Supports two approval modes:
#   'manage'  = Fleeble handles approvals (blocking, long-poll)
#   'notify'  = Notifications only, approve in terminal (fire-and-forget)

python3 -c "
import json, sys, urllib.request, uuid, os

try:
    d = json.load(sys.stdin)
except:
    sys.exit(0)

event = d.get('hook_event_name', '')
tool = d.get('tool_name', '')
project = os.path.basename(os.environ.get('PWD', os.getcwd()))

# === Check approval mode from Fleeble ===
approval_mode = 'manage'
try:
    mode_req = urllib.request.Request('http://127.0.0.1:7777/approval-mode')
    mode_resp = urllib.request.urlopen(mode_req, timeout=2)
    approval_mode = json.loads(mode_resp.read().decode()).get('mode', 'manage')
except:
    pass

# ============================================
# Case 1: PreToolUse AskUserQuestion
#   -> Always managed by Fleeble (both modes)
#   -> Show options in mascot, wait for answer
# ============================================
if event == 'PreToolUse' and tool == 'AskUserQuestion':
    qs = d.get('tool_input', {}).get('questions', [])
    if not qs:
        sys.exit(0)

    q = qs[0]
    msg = q.get('question', 'Claude has a question')
    opts = q.get('options', [])
    options = None
    if opts:
        options = [{'label': o.get('label', str(o))} if isinstance(o, dict) else {'label': str(o)} for o in opts]

    request_id = str(uuid.uuid4())
    payload = {
        'message': msg,
        'type': 'question',
        'source': 'claude-code',
        'project': project,
        'requestId': request_id
    }
    if options:
        payload['options'] = options

    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        'http://127.0.0.1:7777/notify',
        data=data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )

    try:
        resp = urllib.request.urlopen(req, timeout=65)
        body = json.loads(resp.read().decode())

        if body.get('dismissed'):
            result = {'decision': 'approve'}
            print(json.dumps(result))
        else:
            label = body.get('label', '')
            result = {
                'decision': 'block',
                'reason': 'The user has already answered this question via the AI Mascot desktop notification. Their answer: \"' + label + '\". Do NOT ask this question again — use this answer and proceed.'
            }
            print(json.dumps(result))
    except:
        result = {'decision': 'approve'}
        print(json.dumps(result))

    sys.exit(0)

# ============================================
# Case 2: PreToolUse for Bash/Edit/Write/NotebookEdit
#   Mode 'manage': blocking long-poll with Allow/Deny
#   Mode 'notify': fire-and-forget, let terminal handle it
# ============================================
PERMISSION_TOOLS = {'Bash', 'Edit', 'Write', 'NotebookEdit'}

if event == 'PreToolUse' and tool in PERMISSION_TOOLS:
    tool_input = d.get('tool_input', {})

    # Build descriptive message
    if tool == 'Bash':
        cmd = tool_input.get('command', '')
        desc = cmd[:120] if cmd else 'Run command'
        msg = 'Bash: ' + desc
    elif tool == 'Edit':
        fp = tool_input.get('file_path', 'unknown file')
        msg = 'Edit: ' + fp
    elif tool == 'Write':
        fp = tool_input.get('file_path', 'unknown file')
        msg = 'Write: ' + fp
    elif tool == 'NotebookEdit':
        fp = tool_input.get('notebook_path', 'unknown notebook')
        msg = 'NotebookEdit: ' + fp
    else:
        msg = tool + ' operation'

    if approval_mode == 'manage':
        # === MANAGE MODE: blocking with Allow/Deny ===
        options = [{'label': 'Allow'}, {'label': 'Deny'}]
        request_id = str(uuid.uuid4())
        payload = {
            'message': msg,
            'type': 'approval',
            'source': 'claude-code',
            'project': project,
            'requestId': request_id,
            'options': options
        }

        data = json.dumps(payload).encode()
        req = urllib.request.Request(
            'http://127.0.0.1:7777/notify',
            data=data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )

        try:
            resp = urllib.request.urlopen(req, timeout=65)
            body = json.loads(resp.read().decode())

            if body.get('dismissed'):
                result = {'decision': 'approve'}
                print(json.dumps(result))
            else:
                label = body.get('label', '')
                if label == 'Deny':
                    result = {
                        'decision': 'block',
                        'reason': 'The user denied this action via Fleeble desktop notification.'
                    }
                    print(json.dumps(result))
                else:
                    result = {'decision': 'approve'}
                    print(json.dumps(result))
        except:
            result = {'decision': 'approve'}
            print(json.dumps(result))
    else:
        # === NOTIFY MODE: fire-and-forget, terminal handles approval ===
        payload = {
            'message': msg,
            'type': 'approval',
            'source': 'claude-code',
            'project': project,
            'autoDismiss': 15
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

    sys.exit(0)

# ============================================
# Case 3: Notification events
#   -> Fire-and-forget notification (no blocking)
# ============================================
if 'otification' in event:
    nt = d.get('notification_type', '')
    if nt == 'permission_prompt':
        # Already handled by PreToolUse hooks above — skip duplicate
        sys.exit(0)
    elif nt == 'idle_prompt':
        msg = 'Claude Code is waiting for your input'
        msg_type = 'action'
    else:
        msg = 'Claude Code needs your attention'
        msg_type = 'info'

    payload = {'message': msg, 'type': msg_type, 'source': 'claude-code', 'project': project}
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
    sys.exit(0)

# Unknown event -> do nothing
sys.exit(0)
" <<< "$( cat )"
exit 0
