const container = document.getElementById('cards-container');
const notifSound = document.getElementById('notif-sound');

const cards = [];

const SOURCE_NAMES = {
  'claude-code': 'Claude Code',
  'cursor': 'Cursor',
  'codex': 'Codex',
  'copilot': 'Copilot',
  'fleeble': 'Fleeble',
  'unknown': 'AI'
};

function getTypeConfig(type) {
  const configs = {
    'action':   { labelKey: 'type.action',   css: 'action' },
    'error':    { labelKey: 'type.error',     css: 'error' },
    'info':     { labelKey: 'type.info',      css: 'info' },
    'question': { labelKey: 'type.question',  css: 'question' },
    'approval': { labelKey: 'type.approval',  css: 'approval' }
  };
  const cfg = configs[type] || configs['action'];
  return { label: t(cfg.labelKey), css: cfg.css };
}

// === Project Colors ===
const PROJECT_PALETTE = [
  '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#ef4444', '#06b6d4', '#f97316'
];
const projectColorMap = {};
let colorIndex = 0;

function getProjectColor(project) {
  if (!project) return null;
  if (!projectColorMap[project]) {
    projectColorMap[project] = PROJECT_PALETTE[colorIndex % PROJECT_PALETTE.length];
    colorIndex++;
  }
  return projectColorMap[project];
}

// === Multi-Project Grouping ===
const projectGroups = new Map(); // project -> { header: HTMLElement, cardIds: [] }

function getOrCreateGroup(project) {
  if (!project) return null;
  if (projectGroups.has(project)) return projectGroups.get(project);

  const header = document.createElement('div');
  header.className = 'project-group-header';
  const color = getProjectColor(project);
  if (color) header.style.borderLeftColor = color;

  const nameSpan = document.createElement('span');
  nameSpan.className = 'group-name';
  nameSpan.textContent = project;
  header.appendChild(nameSpan);

  const counterSpan = document.createElement('span');
  counterSpan.className = 'group-counter';
  counterSpan.style.display = 'none';
  header.appendChild(counterSpan);

  const toggleSpan = document.createElement('span');
  toggleSpan.className = 'group-toggle';
  toggleSpan.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
  toggleSpan.style.display = 'none';
  header.appendChild(toggleSpan);

  header.addEventListener('click', () => {
    const group = projectGroups.get(project);
    if (!group || group.cardIds.length < 3) return;
    group.collapsed = !group.collapsed;
    applyGroupCollapse(project);
  });

  container.appendChild(header);

  const group = { header, cardIds: [], collapsed: false };
  projectGroups.set(project, group);
  return group;
}

function cleanupGroup(project) {
  if (!project) return;
  const group = projectGroups.get(project);
  if (!group) return;
  if (group.cardIds.length === 0) {
    group.header.remove();
    projectGroups.delete(project);
  }
}

function updateGroupUI(project) {
  if (!project) return;
  const group = projectGroups.get(project);
  if (!group) return;

  const count = group.cardIds.length;
  const counter = group.header.querySelector('.group-counter');
  const toggle = group.header.querySelector('.group-toggle');

  if (count >= 3) {
    counter.textContent = `(${count})`;
    counter.style.display = '';
    toggle.style.display = '';
    group.header.classList.add('clickable');
    // Auto-collapse when reaching exactly 3
    if (count === 3 && !group.collapsed) {
      group.collapsed = true;
    }
    applyGroupCollapse(project);
  } else {
    counter.style.display = 'none';
    toggle.style.display = 'none';
    group.header.classList.remove('clickable', 'collapsed');
    group.collapsed = false;
    // Make sure all cards are visible
    group.cardIds.forEach(id => {
      const cardEl = container.querySelector(`[data-notif-id="${id}"]`);
      if (cardEl) cardEl.classList.remove('group-hidden');
    });
  }
  recalcHeight();
}

function applyGroupCollapse(project) {
  const group = projectGroups.get(project);
  if (!group) return;

  if (group.collapsed) {
    group.header.classList.add('collapsed');
    // Hide all cards except the last (most recent)
    group.cardIds.forEach((id, i) => {
      const cardEl = container.querySelector(`[data-notif-id="${id}"]`);
      if (!cardEl) return;
      if (i < group.cardIds.length - 1) {
        cardEl.classList.add('group-hidden');
      } else {
        cardEl.classList.remove('group-hidden');
      }
    });
  } else {
    group.header.classList.remove('collapsed');
    group.cardIds.forEach(id => {
      const cardEl = container.querySelector(`[data-notif-id="${id}"]`);
      if (cardEl) cardEl.classList.remove('group-hidden');
    });
  }
  recalcHeight();
}

function escHtml(s) {
  const d = document.createElement('span');
  d.textContent = s;
  return d.innerHTML;
}

function recalcHeight() {
  requestAnimationFrame(() => {
    const height = container.scrollHeight + 32;
    window.bubbleAPI.requestResize(height);
  });
}

function addCard({ message, type = 'action', source = 'unknown', options = null, requestId = null, notifId, project = null, autoDismiss = 30 }) {
  const tc = getTypeConfig(type);
  const hasOptions = options && options.length;
  const projectColor = getProjectColor(project);

  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.notifId = notifId;
  if (type === 'approval' && !requestId) card.dataset.approvalNotify = 'true';
  if (projectColor) card.style.borderColor = projectColor;

  // Header
  const header = document.createElement('div');
  header.className = 'card-header';
  const projectBadgeHtml = project
    ? `<span class="project-badge" title="${escHtml(project)}" style="background: ${projectColor}22; color: ${projectColor}">${escHtml(project)}</span>`
    : '';
  header.innerHTML = `
    <span class="source-badge">${escHtml(SOURCE_NAMES[source] || source)}</span>
    <span class="type-badge ${tc.css}">${escHtml(tc.label)}</span>
    ${projectBadgeHtml}
  `;
  card.appendChild(header);

  // Message (with markdown rendering)
  const msg = document.createElement('div');
  msg.className = 'card-message';
  msg.innerHTML = renderMarkdown(message);
  // Handle link clicks — open in external browser
  msg.addEventListener('click', (e) => {
    const link = e.target.closest('.md-link');
    if (link && link.dataset.href) {
      e.preventDefault();
      window.bubbleAPI.openExternal(link.dataset.href);
    }
  });
  card.appendChild(msg);

  // Options
  if (hasOptions) {
    const optList = document.createElement('div');
    optList.className = 'options-list';
    options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      const label = typeof opt === 'string' ? opt : (opt.label || String(opt));
      btn.innerHTML = `<span class="option-num">${i + 1}</span><span class="option-label">${escHtml(label)}</span>`;
      btn.addEventListener('click', () => {
        window.bubbleAPI.optionSelected({ label, index: i, requestId, notifId });
        removeCard(notifId);
      });
      optList.appendChild(btn);
    });
    card.appendChild(optList);
  }

  // Free text reply (when has options and requestId)
  if (hasOptions && requestId) {
    const input = document.createElement('input');
    input.className = 'free-reply-input';
    input.type = 'text';
    input.placeholder = t('replyPlaceholder');
    input.addEventListener('keydown', (e) => {
      e.stopPropagation(); // prevent keyboard shortcuts
      if (e.key === 'Enter' && input.value.trim()) {
        window.bubbleAPI.optionSelected({ label: input.value.trim(), index: -1, requestId, notifId });
        removeCard(notifId);
      }
    });
    card.appendChild(input);
  }

  // Dismiss button
  const dismissBtn = document.createElement('button');
  dismissBtn.className = hasOptions ? 'dismiss-btn dismiss-secondary' : 'dismiss-btn';
  if (hasOptions) {
    dismissBtn.innerHTML = `<span>${escHtml(t('dismiss'))}</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  } else {
    dismissBtn.innerHTML = `<span>${escHtml(t('gotIt'))}</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 13l4 4L19 7"/></svg>`;
  }
  dismissBtn.addEventListener('click', () => {
    window.bubbleAPI.dismissOne({ requestId, notifId });
    removeCard(notifId);
  });
  card.appendChild(dismissBtn);

  // Focus Terminal button
  const termBtn = document.createElement('button');
  termBtn.className = 'terminal-btn';
  termBtn.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg> ${escHtml(t('openTerminal'))}`;
  termBtn.addEventListener('click', () => {
    window.bubbleAPI.focusTerminal();
  });
  card.appendChild(termBtn);

  // Timer bar (auto-dismiss for cards without requestId)
  let timerId = null;
  if (!requestId && autoDismiss > 0) {
    const timerBar = document.createElement('div');
    timerBar.className = 'timer-bar';
    const timerFill = document.createElement('div');
    timerFill.className = 'timer-fill';
    timerFill.style.animationDuration = `${autoDismiss}s`;
    timerBar.appendChild(timerFill);
    card.appendChild(timerBar);

    timerId = setTimeout(() => {
      window.bubbleAPI.dismissOne({ requestId: null, notifId });
      removeCard(notifId);
    }, autoDismiss * 1000);
  }

  // Add to group or container
  const group = getOrCreateGroup(project);
  if (group) {
    // Insert after the group header
    const lastCardInGroup = group.cardIds.length > 0
      ? container.querySelector(`[data-notif-id="${group.cardIds[group.cardIds.length - 1]}"]`)
      : null;
    if (lastCardInGroup && lastCardInGroup.nextSibling) {
      container.insertBefore(card, lastCardInGroup.nextSibling);
    } else {
      container.appendChild(card);
    }
    group.cardIds.push(notifId);
    updateGroupUI(project);
  } else {
    container.appendChild(card);
  }

  cards.push({ notifId, requestId, el: card, timerId, project, options });

  // Animate in
  requestAnimationFrame(() => {
    card.classList.add('visible');
    recalcHeight();
    // Recalc again after animation settles to get final size
    setTimeout(recalcHeight, 400);
  });

  // Play sound
  notifSound.currentTime = 0;
  notifSound.play().catch(() => {});
}

function removeCard(notifId) {
  const idx = cards.findIndex(c => c.notifId === notifId);
  if (idx === -1) return;
  const card = cards[idx];

  // Clear timer
  if (card.timerId) clearTimeout(card.timerId);

  card.el.classList.add('removing');
  card.el.classList.remove('visible');
  cards.splice(idx, 1);

  // Clean up group
  if (card.project) {
    const group = projectGroups.get(card.project);
    if (group) {
      const gIdx = group.cardIds.indexOf(notifId);
      if (gIdx !== -1) group.cardIds.splice(gIdx, 1);
      updateGroupUI(card.project);
      cleanupGroup(card.project);
    }
  }

  card.el.addEventListener('transitionend', () => {
    card.el.remove();
    recalcHeight();
    if (cards.length === 0) {
      window.bubbleAPI.allCardsGone();
    }
  }, { once: true });

  // Fallback if transition doesn't fire
  setTimeout(() => {
    if (card.el.parentNode) {
      card.el.remove();
      recalcHeight();
      if (cards.length === 0) {
        window.bubbleAPI.allCardsGone();
      }
    }
  }, 400);
}

function removeCardByRequestId(requestId) {
  const card = cards.find(c => c.requestId === requestId);
  if (card) removeCard(card.notifId);
}

function clearAll() {
  cards.forEach(c => {
    if (c.timerId) clearTimeout(c.timerId);
    c.el.remove();
  });
  cards.length = 0;
  // Clear all groups
  for (const [, group] of projectGroups) {
    group.header.remove();
  }
  projectGroups.clear();
  recalcHeight();
}

function clearApprovalCards() {
  const approvalCards = cards.filter(c => c.el.dataset.approvalNotify === 'true');
  approvalCards.forEach(c => removeCard(c.notifId));
}

// === Keyboard Shortcuts ===
document.addEventListener('keydown', (e) => {
  // Guard: don't handle if focus is in an input
  if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

  // Escape: dismiss the last card
  if (e.key === 'Escape') {
    if (cards.length > 0) {
      const last = cards[cards.length - 1];
      window.bubbleAPI.dismissOne({ requestId: last.requestId, notifId: last.notifId });
      removeCard(last.notifId);
    }
    return;
  }

  // 1-9: pick option on the last card that has options
  const num = parseInt(e.key);
  if (num >= 1 && num <= 9) {
    // Find last card with options
    for (let i = cards.length - 1; i >= 0; i--) {
      const c = cards[i];
      if (c.options && c.options.length >= num) {
        const opt = c.options[num - 1];
        const label = typeof opt === 'string' ? opt : (opt.label || String(opt));
        window.bubbleAPI.optionSelected({ label, index: num - 1, requestId: c.requestId, notifId: c.notifId });
        removeCard(c.notifId);
        return;
      }
    }
  }
});

function applyTheme({ vars }) {
  const root = document.documentElement;
  for (const [key, val] of Object.entries(vars)) {
    root.style.setProperty(key, val);
  }
}

function changeSound(file) {
  notifSound.src = `../assets/${file}`;
  notifSound.load();
}

window.bubbleAPI.onAddBubble(addCard);
window.bubbleAPI.onClearAllCards(clearAll);
window.bubbleAPI.onRemoveCardByRequest(removeCardByRequestId);
window.bubbleAPI.onApplyTheme(applyTheme);
window.bubbleAPI.onChangeSound(changeSound);
window.bubbleAPI.onClearApprovalCards(clearApprovalCards);
window.bubbleAPI.onLanguageChanged((lang) => {
  setLanguage(lang);
});
