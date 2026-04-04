# CatLenDar

A personal weekly/monthly calendar with a cat personality. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no build step. Secured with Netlify Identity and deployed on Netlify.

**Live:** https://prismatic-sorbet-535bd3.netlify.app

---

## Features

### Calendar
- **Weekly grid** — 7-column × 48-row layout (30-minute slots, 12 AM – 11:30 PM)
- **Monthly view** — full calendar grid with event chips per day, switchable from the header
- **Add events** — click any time slot (week) or day cell (month) to open a pre-filled modal
- **Edit events** — click any event block to modify it
- **Delete events** — remove events from the edit modal with a confirmation prompt
- **Color coding** — assign one of 6 colors per event
- **Week navigation** — prev/next arrows and a Today shortcut
- **Month navigation** — prev/next arrows shift by month when in month view
- **localStorage persistence** — events survive page reloads with no backend required
- **Form validation** — inline errors for missing fields and invalid time ranges
- **Responsive** — adapts to desktop (>768px), tablet (480–768px), and mobile (<480px)
- **Accessible** — `aria-modal`, `aria-invalid`, Escape key closes all overlays

### Cat Popups
- **Black cat** — appears every time the app loads, asks if you want to add something to today's agenda. "Add to today" pre-fills the modal with the current time slot.
- **Gray & white cat** — appears every time you navigate to a different week (prev/next), asks if you want to plan something for that week. "Add to this week" pre-fills the modal for Monday at 9 AM.

### Authentication
- **Netlify Identity** login gate — the calendar only loads after signing in
- Email + password authentication (invite-only by default)
- Logged-in user email shown in the header with a Sign out button
- Login screen features the CatLenDar brand and the black cat

---

## Getting Started (local)

```bash
git clone https://github.com/javiderookie/calendar-app-demo-javi.git
cd calendar-app-demo-javi
open index.html        # macOS
```

> Note: Netlify Identity only works on the deployed URL. Locally, the Sign In button will open the identity widget but auth will fail — use the live URL for the full experience.

---

## Deployment

The app is deployed on Netlify as a static site (no build step).

### Re-deploy after changes

```bash
netlify deploy --prod --dir .
```

### First-time Netlify Identity setup

1. Go to **app.netlify.com → your site → Identity → Enable Identity**
2. Under **Settings → Registration** → set to **Invite only**
3. Click **Invite users** → enter your email → accept the invite and set a password

---

## Project Structure

```
.
├── index.html        # App shell, login screen, modals, cat overlays
├── style.css         # All styles — layout, views, cats, login, responsive
├── app.js            # All logic — auth, data, rendering, validation, handlers
└── tasks/
    └── todo.md       # Feature checklist and acceptance criteria
```

---

## Architecture

### Authentication Flow

On `DOMContentLoaded`, `initAuth()` runs instead of `init()`:

1. Checks `netlifyIdentity.currentUser()`
2. If a session exists → hides login screen, shows app, calls `init()`
3. If no session → shows login screen
4. On successful login → same as step 2
5. On logout → hides app, shows login screen

The Netlify Identity Widget is loaded from CDN and handles all credential management, token refresh, and secure storage.

### State

```js
{
  view: 'week',        // 'week' | 'month'
  weekOffset: 0,       // 0 = current week, ±N = N weeks forward/back
  monthOffset: 0,      // 0 = current month, ±N = N months forward/back
  events: [],          // in-memory mirror of localStorage
  editingId: null,     // null = new event, string = editing existing
  selectedColor: '#4A90E2'
}
```

`view` and both offsets are independent — switching views preserves your position in the other view.

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

IDs are generated client-side (`evt_{timestamp}_{4-digit random}`). `loadEvents()` wraps `JSON.parse` in a `try/catch` — a corrupted or missing key silently returns `[]`.

### Rendering

`renderAll()` is the single entry point for UI updates. It checks `state.view` and delegates to either the week renderer or the month renderer, then syncs the toggle button state.

**Week view** — event blocks are absolutely positioned inside `.day-column` using pixel offsets:
```
top    = (startMinutes / 30) * SLOT_HEIGHT   // 48px per 30-min slot
height = (durationMinutes / 30) * SLOT_HEIGHT
```

**Month view** — a CSS grid of day cells, each showing up to 3 colored event chips. Overflow shows a "+N more" label. Clicking a chip opens the edit modal; clicking the cell background opens the new event modal for that date at 9 AM.

### CSS Cats

All three cats (black, gray/white login cat, gray week-nav cat) are drawn purely in CSS — no images, no SVGs, no external assets. Each is a `.cat-face` div with modifier classes:

| Cat | Class | Eyes | Used for |
|---|---|---|---|
| Black | `.cat-face` (default) | Yellow | Daily greeting + login screen |
| Gray/white | `.cat-face--gray` | Blue | Week navigation popup |

### Responsive Breakpoints

| Breakpoint | Behaviour |
|---|---|
| > 768px | Full grid, day names visible, full header |
| 480 – 768px | Day abbreviations hidden, narrower gutter |
| < 480px | Header wraps to two rows, form inputs stack, grid allows horizontal scroll |

---

## Keyboard & Interaction

| Action | Trigger |
|---|---|
| Add event | Click any time slot (week) or day cell (month) |
| Edit event | Click an event block or chip |
| Close modal | Escape key or click outside |
| Delete event | Delete button in edit modal → confirm dialog |
| Navigate | ‹ / › buttons (week or month), Today button |
| Switch view | Week / Month toggle in header |
| Sign out | Sign out button in header |

---

## Known Limitations

- **No drag-and-drop** — events are moved by reopening the edit modal
- **No multi-day events** — each event lives on a single date
- **No overlap handling** — concurrent events stack on top of each other
- **localStorage is per-browser** — no sync across devices (auth protects the UI but not the data layer)
- **Week starts on Sunday** — not configurable

---

## License

MIT
