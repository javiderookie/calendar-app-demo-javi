# Calendar App

A lightweight weekly calendar built with vanilla HTML, CSS, and JavaScript. No frameworks, no build step, no dependencies — open `index.html` and it works.

## Features

- **Weekly grid** — 7-column × 48-row layout (30-minute slots, 12 AM – 11:30 PM)
- **Add events** — click any time slot to open a pre-filled modal
- **Edit events** — click any event block to modify it
- **Delete events** — remove events from the edit modal with a confirmation prompt
- **Color coding** — assign one of 6 colors per event
- **localStorage persistence** — events survive page reloads with no backend required
- **Week navigation** — prev/next arrows and a Today shortcut
- **Form validation** — inline errors for missing fields and invalid time ranges
- **Responsive** — adapts to desktop, tablet, and mobile viewports
- **Accessible** — `aria-modal`, `aria-invalid`, keyboard dismiss (Escape)

## Getting Started

```bash
git clone https://github.com/javiderookie/calendar-app-demo-javi.git
cd calendar-app-demo-javi
open index.html        # macOS
# or just double-click index.html in your file explorer
```

No install step. No server required.

## Project Structure

```
.
├── index.html        # App shell and modal markup
├── style.css         # All styles — layout, components, responsive breakpoints
├── app.js            # All logic — data layer, rendering, validation, handlers
└── tasks/
    └── todo.md       # Feature checklist and acceptance criteria
```

## Architecture

### Data Model

Events are stored in `localStorage` under the key `calendarEvents` as a JSON array:

```json
{
  "id": "evt_1712345678901_4821",
  "title": "Team Standup",
  "date": "2026-04-06",
  "startTime": "09:00",
  "endTime": "09:30",
  "description": "Optional notes",
  "color": "#4A90E2"
}
```

IDs are generated client-side (`evt_{timestamp}_{4-digit random}`) — no collision risk at this scale, and no server round-trip needed.

### Rendering

The grid is rebuilt on every state change (`renderAll()`). This is intentional: the dataset is small (all events for one week), DOM diffing would add complexity for no measurable gain, and a full re-render keeps the code easy to follow.

Event blocks are absolutely positioned inside their `.day-column` using pixel offsets derived from start time:

```
top    = (startMinutes / 30) * SLOT_HEIGHT
height = (durationMinutes / 30) * SLOT_HEIGHT
```

`SLOT_HEIGHT` is defined once in both CSS (`--slot-height: 48px`) and JS (`const SLOT_HEIGHT = 48`) — if you change the slot height, update both.

### State

A single top-level `state` object holds everything:

```js
{
  weekOffset: 0,       // 0 = current week, ±N = N weeks forward/back
  events: [],          // in-memory mirror of localStorage
  editingId: null,     // null = new event, string = editing existing
  selectedColor: '#4A90E2'
}
```

No reactive framework — mutations are explicit and always followed by a `renderAll()` call.

### localStorage

`loadEvents()` wraps `JSON.parse` in a `try/catch` so a corrupted or missing key silently returns `[]`. `saveEvents()` always writes the full array — fine for a local personal tool; would need a smarter diff/patch strategy if the dataset were large.

## Responsive Breakpoints

| Breakpoint | Behaviour |
|---|---|
| > 768px | Full grid, day names visible |
| 480 – 768px | Day abbreviations hidden, narrower time gutter |
| < 480px | Form inputs stack vertically, grid allows horizontal scroll |

The modal is always `min(480px, 94vw)` — it never overflows the viewport.

## Keyboard & Interaction

| Action | Trigger |
|---|---|
| Add event | Click any time slot |
| Edit event | Click an event block |
| Close modal | Escape key or click outside modal |
| Delete event | Delete button in edit modal → confirm dialog |
| Navigate weeks | ‹ / › buttons, or Today |

## Known Limitations & Potential Improvements

- **No drag-and-drop** — events are moved by reopening the edit modal and changing the time
- **No multi-day events** — each event lives on a single date
- **No overlap handling** — two events at the same time stack on top of each other
- **Single user, local only** — no sync, no accounts, no server
- **Week starts on Sunday** — not configurable

If this were to grow into a production app, the natural next steps would be: a proper backend (events keyed per user), conflict detection and visual overlap layout (the Overlap Columns algorithm), drag-to-create and drag-to-move interactions, and recurring event support.

## License

MIT
