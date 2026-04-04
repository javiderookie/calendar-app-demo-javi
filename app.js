/* ── Constants ── */
const STORAGE_KEY = 'calendarEvents';
const SLOT_HEIGHT = 48;
const SLOTS_PER_DAY = 48;
const COLOR_PALETTE = ['#4A90E2', '#E67E22', '#27AE60', '#8E44AD', '#E53935', '#16A085'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ── State ── */
let state = {
  weekOffset: 0,
  events: [],
  editingId: null,
  selectedColor: COLOR_PALETTE[0]
};

/* ── Data Layer ── */
function loadEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEvents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.events));
}

function generateId() {
  return `evt_${Date.now()}_${Math.floor(Math.random() * 9000) + 1000}`;
}

function createEvent(fields) {
  const event = { id: generateId(), ...fields };
  state.events.push(event);
  saveEvents();
  return event;
}

function updateEvent(id, fields) {
  const idx = state.events.findIndex(e => e.id === id);
  if (idx !== -1) {
    state.events[idx] = { ...state.events[idx], ...fields };
    saveEvents();
  }
}

function deleteEvent(id) {
  state.events = state.events.filter(e => e.id !== id);
  saveEvents();
}

function getEventsForWeek(weekStart) {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    dates.push(formatDate(d));
  }
  return state.events.filter(e => dates.includes(e.date));
}

/* ── Date Utilities ── */
function getWeekStart(offset) {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - day + offset * 7);
  sunday.setHours(0, 0, 0, 0);
  return sunday;
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(date) {
  return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`;
}

function formatWeekLabel(weekStart) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const startStr = formatDisplayDate(weekStart);
  const endStr = formatDisplayDate(weekEnd);
  const year = weekEnd.getFullYear();
  return `${startStr} – ${endStr}, ${year}`;
}

function isToday(dateStr) {
  return dateStr === formatDate(new Date());
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTop(minutes) {
  return (minutes / 30) * SLOT_HEIGHT;
}

function addMinutesToTime(timeStr, mins) {
  const total = timeToMinutes(timeStr) + mins;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatTimeDisplay(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}

/* ── Rendering ── */
function renderAll() {
  renderHeader();
  renderDayHeaders();
  renderGrid();
}

function renderHeader() {
  const weekStart = getWeekStart(state.weekOffset);
  document.getElementById('week-label').textContent = formatWeekLabel(weekStart);
}

function renderTimeGutter() {
  const gutter = document.getElementById('time-gutter');
  gutter.innerHTML = '';
  for (let i = 0; i < SLOTS_PER_DAY; i++) {
    const minutes = i * 30;
    const label = document.createElement('div');
    label.className = 'time-label';
    // Only show text on the hour (every other slot)
    if (minutes % 60 === 0) {
      label.textContent = formatTimeDisplay(`${String(minutes / 60).padStart(2, '0')}:00`);
    }
    gutter.appendChild(label);
  }
}

function renderDayHeaders() {
  const container = document.getElementById('day-headers');
  container.innerHTML = '';
  const weekStart = getWeekStart(state.weekOffset);
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const dateStr = formatDate(date);
    const div = document.createElement('div');
    div.className = 'day-header';
    div.dataset.date = dateStr;
    div.dataset.today = isToday(dateStr) ? 'true' : 'false';

    const nameEl = document.createElement('span');
    nameEl.className = 'day-name';
    nameEl.textContent = DAYS_SHORT[date.getDay()];

    const numEl = document.createElement('span');
    numEl.className = 'day-number';
    numEl.textContent = date.getDate();

    div.appendChild(nameEl);
    div.appendChild(numEl);
    container.appendChild(div);
  }
}

function renderGrid() {
  const container = document.getElementById('slots-container');
  container.innerHTML = '';
  const weekStart = getWeekStart(state.weekOffset);
  const weekEvents = getEventsForWeek(weekStart);

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const dateStr = formatDate(date);

    const column = document.createElement('div');
    column.className = 'day-column';
    column.dataset.date = dateStr;
    column.dataset.today = isToday(dateStr) ? 'true' : 'false';

    // Render 48 time slots
    for (let s = 0; s < SLOTS_PER_DAY; s++) {
      const minutes = s * 30;
      const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
      const mm = String(minutes % 60).padStart(2, '0');
      const slot = document.createElement('div');
      slot.className = 'time-slot';
      slot.dataset.date = dateStr;
      slot.dataset.time = `${hh}:${mm}`;
      if (minutes % 60 === 0) {
        slot.dataset.hourStart = 'true';
      }
      column.appendChild(slot);
    }

    // Render events for this day on top
    renderEventsForDay(column, dateStr, weekEvents);
    container.appendChild(column);
  }
}

function renderEventsForDay(columnEl, dateStr, events) {
  const dayEvents = events.filter(e => e.date === dateStr);
  dayEvents.forEach(event => {
    const block = createEventBlock(event);
    columnEl.appendChild(block);
  });
}

function createEventBlock(event) {
  const startMins = timeToMinutes(event.startTime);
  const endMins = timeToMinutes(event.endTime);
  const durationMins = Math.max(endMins - startMins, 30); // min 30-min height

  const block = document.createElement('div');
  block.className = 'event-block';
  block.dataset.id = event.id;
  block.style.background = event.color;
  block.style.top = `${minutesToTop(startMins)}px`;
  block.style.height = `${(durationMins / 30) * SLOT_HEIGHT}px`;

  const titleEl = document.createElement('span');
  titleEl.className = 'event-title';
  titleEl.textContent = event.title;

  const timeEl = document.createElement('span');
  timeEl.className = 'event-time';
  timeEl.textContent = `${formatTimeDisplay(event.startTime)} – ${formatTimeDisplay(event.endTime)}`;

  block.appendChild(titleEl);
  block.appendChild(timeEl);

  block.addEventListener('click', (e) => {
    e.stopPropagation();
    openEditModal(event.id);
  });

  return block;
}

/* ── Modal Logic ── */
function openNewModal(date, time) {
  state.editingId = null;
  clearErrors();
  document.getElementById('modal-title').textContent = 'New Event';
  document.getElementById('input-title').value = '';
  document.getElementById('input-date').value = date;
  document.getElementById('input-start').value = time;
  document.getElementById('input-end').value = addMinutesToTime(time, 30);
  document.getElementById('input-desc').value = '';
  document.getElementById('btn-delete-event').classList.add('hidden');
  setSelectedColor(COLOR_PALETTE[0]);
  showModal();
}

function openEditModal(id) {
  const event = state.events.find(e => e.id === id);
  if (!event) return;
  state.editingId = id;
  clearErrors();
  document.getElementById('modal-title').textContent = 'Edit Event';
  document.getElementById('input-title').value = event.title;
  document.getElementById('input-date').value = event.date;
  document.getElementById('input-start').value = event.startTime;
  document.getElementById('input-end').value = event.endTime;
  document.getElementById('input-desc').value = event.description || '';
  document.getElementById('btn-delete-event').classList.remove('hidden');
  setSelectedColor(event.color);
  showModal();
}

function showModal() {
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('input-title').focus(), 50);
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.body.style.overflow = '';
  state.editingId = null;
  clearErrors();
}

function setSelectedColor(hex) {
  state.selectedColor = hex;
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.classList.toggle('selected', swatch.dataset.color === hex);
  });
}

/* ── Validation ── */
function validateForm() {
  const title = document.getElementById('input-title').value.trim();
  const date = document.getElementById('input-date').value;
  const start = document.getElementById('input-start').value;
  const end = document.getElementById('input-end').value;

  const errors = {};

  if (!title) errors.title = 'Title is required';
  if (!date) errors.date = 'Date is required';
  if (!start) errors.start = 'Start time is required';
  if (!end) {
    errors.end = 'End time is required';
  } else if (start && timeToMinutes(end) <= timeToMinutes(start)) {
    errors.end = 'End time must be after start time';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

function displayErrors(errors) {
  const fields = ['title', 'date', 'start', 'end'];
  fields.forEach(field => {
    const errorEl = document.getElementById(`error-${field}`);
    const inputId = field === 'start' ? 'input-start' : field === 'end' ? 'input-end' : `input-${field}`;
    const inputEl = document.getElementById(inputId);
    if (errors[field]) {
      errorEl.textContent = errors[field];
      inputEl.setAttribute('aria-invalid', 'true');
    } else {
      errorEl.textContent = '';
      inputEl.removeAttribute('aria-invalid');
    }
  });
}

function clearErrors() {
  ['title', 'date', 'start', 'end'].forEach(field => {
    const errorEl = document.getElementById(`error-${field}`);
    if (errorEl) errorEl.textContent = '';
    const inputId = field === 'start' ? 'input-start' : field === 'end' ? 'input-end' : `input-${field}`;
    const inputEl = document.getElementById(inputId);
    if (inputEl) inputEl.removeAttribute('aria-invalid');
  });
}

/* ── Scroll Utilities ── */
function scrollToCurrentHour() {
  const container = document.getElementById('slots-container');
  container.scrollTop = minutesToTop(8 * 60);
}

function syncGutterScroll() {
  const container = document.getElementById('slots-container');
  const gutter = document.getElementById('time-gutter');
  container.addEventListener('scroll', () => {
    gutter.scrollTop = container.scrollTop;
  });
}

/* ── Color Picker Init ── */
function initColorPicker() {
  const picker = document.getElementById('color-picker');
  COLOR_PALETTE.forEach(hex => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'color-swatch';
    btn.dataset.color = hex;
    btn.style.background = hex;
    btn.setAttribute('aria-label', `Color ${hex}`);
    btn.addEventListener('click', () => setSelectedColor(hex));
    picker.appendChild(btn);
  });
}

/* ── Event Handlers ── */
function attachEventListeners() {
  // Week navigation
  document.getElementById('btn-prev-week').addEventListener('click', () => {
    state.weekOffset--;
    renderAll();
  });
  document.getElementById('btn-next-week').addEventListener('click', () => {
    state.weekOffset++;
    renderAll();
  });
  document.getElementById('btn-today').addEventListener('click', () => {
    state.weekOffset = 0;
    renderAll();
    scrollToCurrentHour();
  });

  // Slot click (event delegation)
  document.getElementById('slots-container').addEventListener('click', (e) => {
    const slot = e.target.closest('.time-slot');
    if (!slot) return;
    openNewModal(slot.dataset.date, slot.dataset.time);
  });

  // Modal close buttons
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !document.getElementById('modal-overlay').classList.contains('hidden')) {
      closeModal();
    }
  });

  // Form submit
  document.getElementById('event-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const { valid, errors } = validateForm();
    if (!valid) {
      displayErrors(errors);
      return;
    }
    const fields = {
      title: document.getElementById('input-title').value.trim(),
      date: document.getElementById('input-date').value,
      startTime: document.getElementById('input-start').value,
      endTime: document.getElementById('input-end').value,
      description: document.getElementById('input-desc').value.trim(),
      color: state.selectedColor
    };
    if (state.editingId) {
      updateEvent(state.editingId, fields);
    } else {
      createEvent(fields);
    }
    closeModal();
    renderAll();
  });

  // Delete button
  document.getElementById('btn-delete-event').addEventListener('click', () => {
    if (!confirm('Delete this event?')) return;
    deleteEvent(state.editingId);
    closeModal();
    renderAll();
  });
}

/* ── Init ── */
function init() {
  state.events = loadEvents();
  initColorPicker();
  renderTimeGutter();
  renderAll();
  scrollToCurrentHour();
  syncGutterScroll();
  attachEventListeners();
}

document.addEventListener('DOMContentLoaded', init);
