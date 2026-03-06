#!/usr/bin/env node

const http = require('http');

const args = process.argv.slice(2);

// Parse flags
let message = '';
let type = 'action';
let source = 'unknown';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--type' || args[i] === '-t') {
    type = args[++i];
  } else if (args[i] === '--source' || args[i] === '-s') {
    source = args[++i];
  } else if (args[i] === '--dismiss' || args[i] === '-d') {
    dismiss();
    process.exit(0);
  } else if (args[i] === '--help' || args[i] === '-h') {
    printHelp();
    process.exit(0);
  } else {
    message += (message ? ' ' : '') + args[i];
  }
}

if (!message && !args.includes('--dismiss') && !args.includes('-d')) {
  // Read from stdin if no message provided
  const chunks = [];
  process.stdin.setEncoding('utf8');

  if (process.stdin.isTTY) {
    printHelp();
    process.exit(1);
  }

  process.stdin.on('data', (chunk) => chunks.push(chunk));
  process.stdin.on('end', () => {
    message = chunks.join('').trim();
    if (message) {
      send(message, type, source);
    }
  });
} else if (message) {
  send(message, type, source);
}

function send(msg, type, source) {
  const data = JSON.stringify({ message: msg, type, source });

  const req = http.request({
    hostname: '127.0.0.1',
    port: 7777,
    path: '/notify',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  }, (res) => {
    let body = '';
    res.on('data', (c) => body += c);
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('🐾 Mascot notified!');
      } else {
        console.error('Error:', body);
        process.exit(1);
      }
    });
  });

  req.on('error', () => {
    console.error('❌ AI Mascot is not running. Start it with: npm start');
    process.exit(1);
  });

  req.write(data);
  req.end();
}

function dismiss() {
  const req = http.request({
    hostname: '127.0.0.1',
    port: 7777,
    path: '/dismiss',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    if (res.statusCode === 200) {
      console.log('🐾 Mascot dismissed!');
    }
  });

  req.on('error', () => {
    console.error('❌ AI Mascot is not running.');
    process.exit(1);
  });

  req.end();
}

function printHelp() {
  console.log(`
🐾 AI Mascot CLI
━━━━━━━━━━━━━━━━

Usage:
  mascot "Your message here"
  mascot -s claude-code -t action "Please approve this change"
  echo "Hello!" | mascot

Options:
  -s, --source <name>    Source AI (claude-code, cursor, codex, copilot)
  -t, --type <type>      Message type (action, error, info, question, approval)
  -d, --dismiss          Dismiss the current notification
  -h, --help             Show this help

Examples:
  mascot "Hey! I need you to review this code"
  mascot -s claude-code -t approval "Can I push to main?"
  mascot -s cursor -t error "Build failed, check the logs"
  mascot --dismiss
  `);
}
