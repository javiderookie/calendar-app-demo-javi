# Calendar App — Todo Checklist

## Tasks

### 1. Project Structure
- [x] Create `index.html` with full app skeleton
- [x] Create `style.css` with layout and component styles
- [x] Create `app.js` with all logic

**Acceptance criteria:**
- Opening `index.html` in a browser shows the app without errors
- All three files load correctly

---

### 2. Weekly Grid
- [x] Render 7 day columns (Sun–Sat) for the current week
- [x] Render 48 half-hour time slots per day (12:00 AM–11:30 PM)
- [x] Render time labels in left gutter (on-the-hour labels only)
- [x] Highlight today's column with a distinct background
- [x] Sticky day header row stays visible while scrolling vertically
- [x] Grid scrolls to 8:00 AM on initial load

**Acceptance criteria:**
- All 7 columns and 48 rows are visible
- Today's column is visually distinct
- Time gutter is aligned with grid rows
- Page loads already scrolled to 8 AM

---

### 3. Week Navigation
- [x] Previous (‹) and next (›) arrow buttons shift week by 7 days
- [x] "Today" button returns to the current week
- [x] Week label (e.g. "Apr 6 – Apr 12, 2026") updates on every navigation

**Acceptance criteria:**
- Clicking ‹ shows last week's dates; clicking › shows next week's dates
- "Today" always brings back the current week
- Week label is always accurate

---

### 4. Add Event (Modal)
- [x] Clicking a time slot opens the modal pre-filled with that date and time
- [x] End time defaults to start + 30 minutes
- [x] Color picker shows 6 swatches; first is pre-selected
- [x] Saving a valid event adds it to the grid and localStorage
- [x] New event block appears at the correct position in the grid

**Acceptance criteria:**
- Modal opens with correct date and time from the clicked slot
- Event appears on grid immediately after save
- Event persists after page reload

---

### 5. Edit Event
- [x] Clicking an event block opens the modal with all fields pre-filled
- [x] Modal title changes to "Edit Event"
- [x] Delete button is visible in edit mode
- [x] Saving updates the event in the grid and localStorage

**Acceptance criteria:**
- All event fields are correctly pre-populated in the modal
- Changes are reflected in the grid and persist after reload

---

### 6. Delete Event
- [x] Delete button shown only in edit mode (hidden for new events)
- [x] Clicking Delete shows a browser `confirm()` dialog
- [x] Confirming removes the event from the grid and localStorage
- [x] Cancelling leaves the event unchanged

**Acceptance criteria:**
- Event is gone from grid and localStorage after confirmed delete
- Cancelling delete leaves everything intact

---

### 7. Form Validation
- [x] "Title is required" shown when title is empty
- [x] "Date is required" shown when date is empty
- [x] "Start time is required" shown when start is empty
- [x] "End time is required" shown when end is empty
- [x] "End time must be after start time" shown when end ≤ start
- [x] Errors shown inline below each field
- [x] Errors clear when modal is re-opened or save succeeds
- [x] `aria-invalid="true"` set on invalid fields

**Acceptance criteria:**
- Form cannot be submitted with empty title
- Form cannot be submitted with end time ≤ start time
- Errors disappear after a successful save or modal close

---

### 8. localStorage Persistence
- [x] All events survive a hard page refresh
- [x] Missing or corrupted localStorage key results in empty state (no crash)
- [x] Multiple events on the same day all render correctly

**Acceptance criteria:**
- Events created in one session appear in the next
- No JavaScript errors when localStorage is empty or cleared

---

### 9. Responsive UI
- [x] Desktop (> 768px): all 7 columns fully visible, no horizontal scroll
- [x] Tablet (480–768px): day abbreviations hidden to save space
- [x] Mobile (< 480px): form time inputs stack vertically; grid allows horizontal scroll if needed
- [x] Modal never overflows the screen at any size

**Acceptance criteria:**
- App is usable at 320px, 768px, and 1280px widths
- Modal width is `min(480px, 94vw)` — no overflow on small screens

---

## Review

All tasks completed in a single implementation pass. Here is a summary of what was built:

### Files Created
| File | Lines | Purpose |
|---|---|---|
| `index.html` | ~70 | App shell, grid structure, modal form |
| `style.css` | ~350 | Layout, components, modal, responsive breakpoints |
| `app.js` | ~300 | Data layer, rendering, validation, event handlers |
| `tasks/todo.md` | — | This checklist |

### Key Decisions
- **No frameworks, no build step** — runs by opening `index.html` directly
- **Event blocks are absolutely positioned** inside `.day-column` (not inside individual slots), using pixel offsets calculated from `startTime` via `minutesToTop()`
- **Time gutter scroll sync** — the gutter scrolls in lockstep with the grid via a `scroll` listener
- **Validation is inline** — errors appear below each field with `aria-invalid` set for accessibility
- **localStorage key** is `calendarEvents` — stored as a flat JSON array; corrupted data falls back to `[]` silently
- **Today highlighting** — both the day header and column body get distinct background colors; the day number gets a filled circle
- **Minimum event height** is capped at one slot (30 min) to keep very short events clickable
