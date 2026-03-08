const clipboardList = document.getElementById('clipboard-list');
const searchInput = document.getElementById('search-input');
const closeBtn = document.getElementById('close-btn');
const toast = document.getElementById('toast');
const filterBtns = document.querySelectorAll('.cb-filter');

let currentFilter = 'all';
let selectedIndex = -1;
let entries = [];

// ===== Close =====
closeBtn.addEventListener('click', () => {
  window.clipboardAPI.close();
});

// ===== Filters =====
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    selectedIndex = -1;
    loadEntries();
  });
});

// ===== Search =====
let searchTimeout = null;
searchInput.addEventListener('input', () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    selectedIndex = -1;
    loadEntries();
  }, 200);
});

// ===== Load & Render =====
async function loadEntries() {
  entries = await window.clipboardAPI.getHistory({
    filter: currentFilter === 'all' ? undefined : currentFilter,
    search: searchInput.value.trim() || undefined
  });
  renderEntries();
}

function renderEntries() {
  if (!entries || !entries.length) {
    clipboardList.innerHTML = `
      <div class="cb-empty">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.3"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
        <span class="cb-empty-text">${esc(t('clipboard.empty'))}</span>
        <span class="cb-empty-hint">${esc(t('clipboard.emptyHint'))}</span>
      </div>`;
    return;
  }

  clipboardList.innerHTML = entries.map((entry, i) => {
    const badge = entry.category || 'text';
    const isSelected = i === selectedIndex;

    if (entry.type === 'image') {
      return `
        <div class="cb-entry ${isSelected ? 'selected' : ''}" data-id="${entry.id}" data-idx="${i}">
          <div class="cb-entry-main">
            <div class="cb-entry-top">
              <span class="cb-badge image">${esc(t('clipboard.images'))}</span>
              <span class="cb-time">${timeAgo(entry.timestamp)}</span>
            </div>
          </div>
          ${entry.thumbnail ? `<img class="cb-thumb" src="${entry.thumbnail}" alt="">` : ''}
          <div class="cb-actions">
            <button class="cb-action-btn ${entry.pinned ? 'pin-active' : ''}" data-action="pin" data-id="${entry.id}" title="Pin">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="${entry.pinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </button>
            <button class="cb-action-btn delete" data-action="delete" data-id="${entry.id}" title="Delete">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>`;
    }

    const contentClass = badge === 'code' ? 'cb-content code-content' : 'cb-content';
    return `
      <div class="cb-entry ${isSelected ? 'selected' : ''}" data-id="${entry.id}" data-idx="${i}">
        <div class="cb-entry-main">
          <div class="cb-entry-top">
            <span class="cb-badge ${badge}">${esc(badge)}</span>
            <span class="cb-time">${timeAgo(entry.timestamp)}</span>
          </div>
          <div class="${contentClass}">${esc(entry.content || '')}</div>
        </div>
        <div class="cb-actions">
          <button class="cb-action-btn ${entry.pinned ? 'pin-active' : ''}" data-action="pin" data-id="${entry.id}" title="Pin">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="${entry.pinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </button>
          <button class="cb-action-btn delete" data-action="delete" data-id="${entry.id}" title="Delete">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>`;
  }).join('');

  // Click to copy
  clipboardList.querySelectorAll('.cb-entry').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.cb-action-btn')) return;
      const id = el.dataset.id;
      window.clipboardAPI.copy(id);
      showToast();
    });
  });

  // Action buttons
  clipboardList.querySelectorAll('.cb-action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      if (action === 'pin') {
        window.clipboardAPI.pin(id);
      } else if (action === 'delete') {
        window.clipboardAPI.delete(id);
      }
    });
  });
}

function showToast() {
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 1200);
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5) return t('time.now');
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function esc(s) {
  const d = document.createElement('span');
  d.textContent = s;
  return d.innerHTML;
}

// ===== Keyboard Navigation =====
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    window.clipboardAPI.close();
    return;
  }

  if (document.activeElement === searchInput) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (entries.length) {
      selectedIndex = Math.min(selectedIndex + 1, entries.length - 1);
      renderEntries();
      scrollToSelected();
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (entries.length) {
      selectedIndex = Math.max(selectedIndex - 1, 0);
      renderEntries();
      scrollToSelected();
    }
  } else if (e.key === 'Enter') {
    if (selectedIndex >= 0 && entries[selectedIndex]) {
      window.clipboardAPI.copy(entries[selectedIndex].id);
      showToast();
    }
  }
});

function scrollToSelected() {
  const el = clipboardList.querySelector('.cb-entry.selected');
  if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

// ===== Theme & Language =====
function applyTheme({ vars }) {
  const root = document.documentElement;
  for (const [key, val] of Object.entries(vars)) {
    root.style.setProperty(key, val);
  }
}

window.clipboardAPI.onApplyTheme(applyTheme);
window.clipboardAPI.onLanguageChanged((lang) => {
  setLanguage(lang);
  renderEntries();
});

// ===== Updates =====
window.clipboardAPI.onClipboardUpdated(() => {
  loadEntries();
});

// ===== Initial Load =====
loadEntries();
