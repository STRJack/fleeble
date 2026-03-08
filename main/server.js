const http = require('http');
const { getSettings } = require('./settings');

const PORT = 7777;
let httpServer;

// Map of requestId -> { res, timeout } for long-poll pending requests
const pendingRequests = new Map();

function resolvePendingRequest(requestId, response) {
  const pending = pendingRequests.get(requestId);
  if (!pending) return;
  clearTimeout(pending.timeout);
  pendingRequests.delete(requestId);
  try {
    pending.res.writeHead(200, { 'Content-Type': 'application/json' });
    pending.res.end(JSON.stringify(response));
  } catch {}
}

function cancelAllPending(reason) {
  for (const [id, pending] of pendingRequests) {
    clearTimeout(pending.timeout);
    try {
      pending.res.writeHead(200, { 'Content-Type': 'application/json' });
      pending.res.end(JSON.stringify({ dismissed: true, ...reason }));
    } catch {}
  }
  pendingRequests.clear();
}

function startServer(showMascotFn, hideAllBubblesFn) {
  const windows = require('./windows');

  httpServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

    const settings = getSettings();

    if (req.method === 'GET' && req.url === '/approval-mode') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ mode: settings.approvalMode || 'manage' }));
      return;
    }

    if (req.method === 'POST' && req.url === '/notify') {
      let body = '';
      req.on('data', c => body += c);
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const requestId = data.requestId || null;

          if (requestId) {
            const timeout = setTimeout(() => {
              pendingRequests.delete(requestId);
              try {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ dismissed: true, timeout: true }));
              } catch {}
              const bubbleWindow = windows.getBubbleWindow();
              if (windows.isBubbleReady() && bubbleWindow) {
                bubbleWindow.webContents.send('remove-card-by-request', requestId);
              }
            }, 60000);

            pendingRequests.set(requestId, { res, timeout });
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
          }

          const extra = {};
          if (data.autoDismiss) extra.autoDismiss = data.autoDismiss;

          showMascotFn(
            data.message || 'AI needs your attention!',
            data.type || 'action',
            data.source || 'unknown',
            data.options || null,
            requestId,
            data.project || null,
            extra
          );
        } catch {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
    } else if (req.method === 'POST' && req.url === '/dismiss') {
      hideAllBubblesFn();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });

  httpServer.listen(PORT, '127.0.0.1', () => {
    console.log(`Fleeble listening on http://127.0.0.1:${PORT}`);
  });
}

function stopServer() {
  if (httpServer) httpServer.close();
}

module.exports = {
  startServer,
  stopServer,
  resolvePendingRequest,
  cancelAllPending,
  pendingRequests
};
