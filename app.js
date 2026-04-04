/* ── Constants ── */
const STORAGE_KEY    = 'calendarEvents';
const GREETING_KEY   = 'calendarGreetingDate';
const SLOT_HEIGHT    = 48;
const SLOTS_PER_DAY  = 48;
const COLOR_PALETTE  = ['#4A90E2', '#E67E22', '#27AE60', '#8E44AD', '#E53935', '#16A085'];
const DAYS_SHORT     = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_FULL      = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_SHORT   = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL    = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];

/* ── State ── */
let state = {
  view: 'week',           // 'week' | 'month'
  weekOffset: 0,
  monthOffset: 0,
  events: [],
  editingId: null,
  selectedColor: COLOR_PALETTE[0]
};

/* ── Data Layer ── */
function loadEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
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

function getEventsForMonth(year, month) {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  return state.events.filter(e => e.date.startsWith(prefix));
}

/* ── Date Utilities ── */
function getWeekStart(offset) {
  const now = new Date();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - now.getDay() + offset * 7);
  sunday.setHours(0, 0, 0, 0);
  return sunday;
}

function getMonthDate(offset) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + offset, 1);
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
  return `${formatDisplayDate(weekStart)} – ${formatDisplayDate(weekEnd)}, ${weekEnd.getFullYear()}`;
}

function formatMonthLabel(offset) {
  const d = getMonthDate(offset);
  return `${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
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
  if (state.view === 'week') {
    document.getElementById('grid-wrapper').classList.remove('hidden');
    document.getElementById('month-grid').classList.add('hidden');
    renderDayHeaders();
    renderGrid();
  } else {
    document.getElementById('grid-wrapper').classList.add('hidden');
    document.getElementById('month-grid').classList.remove('hidden');
    renderMonth();
  }
  // Sync view toggle button states
  document.getElementById('btn-view-week').classList.toggle('active', state.view === 'week');
  document.getElementById('btn-view-month').classList.toggle('active', state.view === 'month');
}

function renderHeader() {
  document.getElementById('week-label').textContent =
    state.view === 'week'
      ? formatWeekLabel(getWeekStart(state.weekOffset))
      : formatMonthLabel(state.monthOffset);
}

function renderTimeGutter() {
  const gutter = document.getElementById('time-gutter');
  gutter.innerHTML = '';
  for (let i = 0; i < SLOTS_PER_DAY; i++) {
    const minutes = i * 30;
    const label = document.createElement('div');
    label.className = 'time-label';
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

    for (let s = 0; s < SLOTS_PER_DAY; s++) {
      const minutes = s * 30;
      const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
      const mm = String(minutes % 60).padStart(2, '0');
      const slot = document.createElement('div');
      slot.className = 'time-slot';
      slot.dataset.date = dateStr;
      slot.dataset.time = `${hh}:${mm}`;
      if (minutes % 60 === 0) slot.dataset.hourStart = 'true';
      column.appendChild(slot);
    }

    renderEventsForDay(column, dateStr, weekEvents);
    container.appendChild(column);
  }
}

function renderEventsForDay(columnEl, dateStr, events) {
  events.filter(e => e.date === dateStr).forEach(event => {
    columnEl.appendChild(createEventBlock(event));
  });
}

function createEventBlock(event) {
  const startMins   = timeToMinutes(event.startTime);
  const endMins     = timeToMinutes(event.endTime);
  const durationMins = Math.max(endMins - startMins, 30);

  const block = document.createElement('div');
  block.className = 'event-block';
  block.dataset.id = event.id;
  block.style.background = event.color;
  block.style.top    = `${minutesToTop(startMins)}px`;
  block.style.height = `${(durationMins / 30) * SLOT_HEIGHT}px`;

  const titleEl = document.createElement('span');
  titleEl.className = 'event-title';
  titleEl.textContent = event.title;

  const timeEl = document.createElement('span');
  timeEl.className = 'event-time';
  timeEl.textContent = `${formatTimeDisplay(event.startTime)} – ${formatTimeDisplay(event.endTime)}`;

  block.appendChild(titleEl);
  block.appendChild(timeEl);
  block.addEventListener('click', (e) => { e.stopPropagation(); openEditModal(event.id); });
  return block;
}

/* ── Month View Rendering ── */
function renderMonth() {
  const container = document.getElementById('month-grid');
  container.innerHTML = '';

  const monthDate  = getMonthDate(state.monthOffset);
  const year       = monthDate.getFullYear();
  const month      = monthDate.getMonth();
  const firstDay   = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Day name headers
  const namesRow = document.createElement('div');
  namesRow.className = 'month-day-names';
  DAYS_SHORT.forEach(name => {
    const el = document.createElement('div');
    el.className = 'month-day-name';
    el.textContent = name;
    namesRow.appendChild(el);
  });
  container.appendChild(namesRow);

  // Grid cells
  const cells = document.createElement('div');
  cells.className = 'month-cells';

  // Total cells: fill to complete rows of 7
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - firstDay + 1;
    const cell = document.createElement('div');
    cell.className = 'month-day-cell';

    let cellDate;
    if (dayNum < 1) {
      // Days from previous month
      cellDate = new Date(year, month, dayNum);
      cell.classList.add('other-month');
    } else if (dayNum > daysInMonth) {
      // Days from next month
      cellDate = new Date(year, month, dayNum);
      cell.classList.add('other-month');
    } else {
      cellDate = new Date(year, month, dayNum);
    }

    const dateStr = formatDate(cellDate);
    cell.dataset.date = dateStr;
    if (isToday(dateStr)) cell.classList.add('today');

    // Day number
    const numEl = document.createElement('div');
    numEl.className = 'month-day-num';
    numEl.textContent = cellDate.getDate();
    cell.appendChild(numEl);

    // Events for this day
    const dayEvents = state.events.filter(e => e.date === dateStr);
    const maxVisible = 3;
    dayEvents.slice(0, maxVisible).forEach(event => {
      const chip = document.createElement('div');
      chip.className = 'month-event-chip';
      chip.dataset.id = event.id;
      chip.style.background = event.color;
      chip.textContent = event.title;
      cell.appendChild(chip);
    });

    if (dayEvents.length > maxVisible) {
      const more = document.createElement('div');
      more.className = 'month-more-chip';
      more.textContent = `+${dayEvents.length - maxVisible} more`;
      cell.appendChild(more);
    }

    cells.appendChild(cell);
  }

  container.appendChild(cells);
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
  const date  = document.getElementById('input-date').value;
  const start = document.getElementById('input-start').value;
  const end   = document.getElementById('input-end').value;
  const errors = {};

  if (!title) errors.title = 'Title is required';
  if (!date)  errors.date  = 'Date is required';
  if (!start) errors.start = 'Start time is required';
  if (!end) {
    errors.end = 'End time is required';
  } else if (start && timeToMinutes(end) <= timeToMinutes(start)) {
    errors.end = 'End time must be after start time';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

function displayErrors(errors) {
  ['title', 'date', 'start', 'end'].forEach(field => {
    const errorEl = document.getElementById(`error-${field}`);
    const inputId = (field === 'start' || field === 'end') ? `input-${field}` : `input-${field}`;
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
    const inputEl = document.getElementById(`input-${field}`);
    if (inputEl) inputEl.removeAttribute('aria-invalid');
  });
}

/* ── Scroll Utilities ── */
function scrollToCurrentHour() {
  document.getElementById('slots-container').scrollTop = minutesToTop(8 * 60);
}

function syncGutterScroll() {
  const container = document.getElementById('slots-container');
  const gutter    = document.getElementById('time-gutter');
  container.addEventListener('scroll', () => { gutter.scrollTop = container.scrollTop; });
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

/* ── Daily Greeting (black cat) ── */
function maybeShowGreeting() {
  const today = formatDate(new Date());
  if (localStorage.getItem(GREETING_KEY) === today) return;

  const now = new Date();
  document.getElementById('greeting-message').textContent =
    `It's ${DAYS_FULL[now.getDay()]}, ${formatDisplayDate(now)}. Want to add something to your agenda today?`;

  document.getElementById('greeting-overlay').classList.remove('hidden');
  localStorage.setItem(GREETING_KEY, today);
}

function closeGreeting() {
  document.getElementById('greeting-overlay').classList.add('hidden');
}

function attachGreetingListeners() {
  document.getElementById('btn-greeting-dismiss').addEventListener('click', closeGreeting);

  document.getElementById('btn-greeting-add').addEventListener('click', () => {
    closeGreeting();
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = now.getMinutes() < 30 ? '00' : '30';
    openNewModal(formatDate(now), `${hh}:${mm}`);
  });

  document.getElementById('greeting-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('greeting-overlay')) closeGreeting();
  });
}

/* ── Week Navigation Cat (gray cat) ── */
function showWeekCat() {
  const weekStart = getWeekStart(state.weekOffset);
  document.getElementById('week-cat-message').textContent =
    `${formatWeekLabel(weekStart)}. Anything you want to plan for this week?`;
  document.getElementById('week-cat-overlay').classList.remove('hidden');
}

function closeWeekCat() {
  document.getElementById('week-cat-overlay').classList.add('hidden');
}

function attachWeekCatListeners() {
  document.getElementById('btn-week-cat-dismiss').addEventListener('click', closeWeekCat);

  document.getElementById('btn-week-cat-add').addEventListener('click', () => {
    closeWeekCat();
    // Open modal for Monday of the displayed week at 09:00
    const weekStart = getWeekStart(state.weekOffset);
    const monday = new Date(weekStart);
    monday.setDate(monday.getDate() + 1); // Monday = Sunday + 1
    openNewModal(formatDate(monday), '09:00');
  });

  document.getElementById('week-cat-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('week-cat-overlay')) closeWeekCat();
  });
}

/* ── Event Handlers ── */
function attachEventListeners() {
  // Week / month navigation
  document.getElementById('btn-prev-week').addEventListener('click', () => {
    if (state.view === 'week') {
      state.weekOffset--;
      renderAll();
      showWeekCat();
    } else {
      state.monthOffset--;
      renderAll();
    }
  });

  document.getElementById('btn-next-week').addEventListener('click', () => {
    if (state.view === 'week') {
      state.weekOffset++;
      renderAll();
      showWeekCat();
    } else {
      state.monthOffset++;
      renderAll();
    }
  });

  document.getElementById('btn-today').addEventListener('click', () => {
    state.weekOffset  = 0;
    state.monthOffset = 0;
    renderAll();
    if (state.view === 'week') scrollToCurrentHour();
  });

  // View toggle
  document.getElementById('btn-view-week').addEventListener('click', () => {
    if (state.view === 'week') return;
    state.view = 'week';
    renderAll();
    scrollToCurrentHour();
  });

  document.getElementById('btn-view-month').addEventListener('click', () => {
    if (state.view === 'month') return;
    state.view = 'month';
    renderAll();
  });

  // Week view: slot click
  document.getElementById('slots-container').addEventListener('click', (e) => {
    const slot = e.target.closest('.time-slot');
    if (!slot) return;
    openNewModal(slot.dataset.date, slot.dataset.time);
  });

  // Month view: cell and chip clicks
  document.getElementById('month-grid').addEventListener('click', (e) => {
    const chip = e.target.closest('.month-event-chip');
    if (chip) { openEditModal(chip.dataset.id); return; }
    const cell = e.target.closest('.month-day-cell');
    if (cell && cell.dataset.date) openNewModal(cell.dataset.date, '09:00');
  });

  // Modal close
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });

  // Escape key closes any open overlay
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!document.getElementById('modal-overlay').classList.contains('hidden'))   closeModal();
    if (!document.getElementById('greeting-overlay').classList.contains('hidden')) closeGreeting();
    if (!document.getElementById('week-cat-overlay').classList.contains('hidden')) closeWeekCat();
  });

  // Form submit
  document.getElementById('event-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const { valid, errors } = validateForm();
    if (!valid) { displayErrors(errors); return; }
    const fields = {
      title:       document.getElementById('input-title').value.trim(),
      date:        document.getElementById('input-date').value,
      startTime:   document.getElementById('input-start').value,
      endTime:     document.getElementById('input-end').value,
      description: document.getElementById('input-desc').value.trim(),
      color:       state.selectedColor
    };
    state.editingId ? updateEvent(state.editingId, fields) : createEvent(fields);
    closeModal();
    renderAll();
  });

  // Delete
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
  attachGreetingListeners();
  attachWeekCatListeners();
  maybeShowGreeting();
}

document.addEventListener('DOMContentLoaded', init);
