const container = document.getElementById('mascot-container');
const mascot = document.getElementById('mascot');
const notifBadge = document.getElementById('notif-badge');

const MOOD_TYPES = ['action', 'error', 'info', 'question', 'approval'];

function show({ type = 'action' }) {
  notifBadge.classList.add('active');

  // Remove old mood classes, add new one
  MOOD_TYPES.forEach(m => mascot.classList.remove(`mood-${m}`));
  mascot.classList.add(`mood-${type}`);

  container.classList.add('visible');

  mascot.classList.remove('entering', 'excited');
  void mascot.offsetWidth; // force reflow
  mascot.classList.add('entering', 'excited');

  setTimeout(() => mascot.classList.remove('entering'), 700);
  setTimeout(() => mascot.classList.remove('excited'), 2800);
}

function hide() {
  notifBadge.classList.remove('active');
  container.classList.remove('visible');
  MOOD_TYPES.forEach(m => mascot.classList.remove(`mood-${m}`));
}

function applyTheme({ vars }) {
  const root = document.documentElement;
  for (const [key, val] of Object.entries(vars)) {
    root.style.setProperty(key, val);
  }
}

// ===== Drag & Drop =====
let isDragging = false;
let isHovering = false;
let lastMouseX = 0;
let lastMouseY = 0;

// Hit test: check if mouse is over the mascot element (90x120 area)
const mascotContainer = document.getElementById('mascot-container');

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const deltaX = e.screenX - lastMouseX;
    const deltaY = e.screenY - lastMouseY;
    lastMouseX = e.screenX;
    lastMouseY = e.screenY;
    window.mascotAPI.mascotDragMove({ deltaX, deltaY });
    return;
  }

  // Hit test for hover (the mascot area)
  const rect = mascotContainer.getBoundingClientRect();
  const inMascot = e.clientX >= rect.left && e.clientX <= rect.right
                && e.clientY >= rect.top && e.clientY <= rect.bottom;

  if (inMascot && !isHovering) {
    isHovering = true;
    mascot.classList.add('hoverable');
    window.mascotAPI.mascotMouseEnter();
  } else if (!inMascot && isHovering && !isDragging) {
    isHovering = false;
    mascot.classList.remove('hoverable');
    window.mascotAPI.mascotMouseLeave();
  }
});

document.addEventListener('mousedown', (e) => {
  if (!isHovering) return;
  isDragging = true;
  lastMouseX = e.screenX;
  lastMouseY = e.screenY;
  mascot.classList.add('dragging');
  mascot.classList.remove('hoverable');
});

document.addEventListener('mouseup', () => {
  if (!isDragging) return;
  isDragging = false;
  mascot.classList.remove('dragging');
  isHovering = false;
  window.mascotAPI.mascotDragEnd();
});

window.mascotAPI.onShowMascot(show);
window.mascotAPI.onHideMascot(hide);
window.mascotAPI.onApplyTheme(applyTheme);
