#!/bin/bash
# Fleeble — Cursor hook
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
# Case 1: preToolUse + Shell
#   Mode 'manage': blocking long-poll with Allow/Deny
#   Mode 'notify': fire-and-forget
# ============================================
if event == 'preToolUse' and tool == 'Shell':
    tool_input = d.get('tool_input', {})
    cmd = tool_input.get('command', '')
    desc = cmd[:120] if cmd else 'Run command'
    msg = 'Shell: ' + desc

    if approval_mode == 'manage':
        options = [{'label': 'Allow'}, {'label': 'Deny'}]
        request_id = str(uuid.uuid4())
        payload = {
            'message': msg,
            'type': 'approval',
            'source': 'cursor',
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
                result = {'decision': 'allow'}
                print(json.dumps(result))
            else:
                label = body.get('label', '')
                if label == 'Deny':
                    result = {
                        'decision': 'deny',
                        'reason': 'The user denied this action via Fleeble desktop notification.'
                    }
                    print(json.dumps(result))
                else:
                    result = {'decision': 'allow'}
                    print(json.dumps(result))
        except:
            result = {'decision': 'allow'}
            print(json.dumps(result))
    else:
        # === NOTIFY MODE: fire-and-forget ===
        payload = {
            'message': msg,
            'type': 'approval',
            'source': 'cursor',
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
# Case 2: stop event
#   -> Fire-and-forget notification
# ============================================
if event == 'stop':
    msg = 'Cursor has finished'
    payload = {
        'message': msg,
        'type': 'info',
        'source': 'cursor',
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
    sys.exit(0)

# Unknown event -> do nothing
sys.exit(0)
" <<< "$( cat )"
exit 0
