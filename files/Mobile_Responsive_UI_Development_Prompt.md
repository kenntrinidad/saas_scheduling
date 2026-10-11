# Mobile-Responsive UI — Development Prompt

**Purpose:** the current frontend (Appointments, Services, Clients, Staff,
Payments, Dashboard) was built desktop-first — a fixed sidebar, dense
multi-column tables, a staff-columns calendar grid. None of that degrades
gracefully on a phone. This document defines what "mobile-ready" means for
each screen, proposes defaults for the layout decisions that aren't
obvious, and sequences the work so the hardest screen (Appointments) isn't
a blocker for shipping the rest.

---

## 0. Scope and Non-Goals

**In scope:** responsive layout, touch-friendly controls, a mobile
navigation pattern, and graceful degradation of dense desktop UI (tables,
multi-column calendars) on narrow viewports.

**Out of scope for this pass:** a native app, offline support, or
redesigning the visual language (color `#1D5F55`, `#FAFAF8` background,
Manrope/Inter fonts stay exactly as-is — this is a layout/responsiveness
pass, not a redesign).

---

## 1. Breakpoint Strategy (proposed default)

Standard Tailwind breakpoints, used consistently across every screen rather
than each screen inventing its own:

| Breakpoint | Width | Primary target |
|---|---|---|
| (default, no prefix) | < 640px | Phones |
| `sm:` | ≥ 640px | Large phones / small tablets, landscape |
| `md:` | ≥ 768px | Tablets |
| `lg:` | ≥ 1024px | Desktop (current design, unchanged) |

**Decision needed:** is a tablet layout (`md:`) worth designing for
explicitly, or is "phone vs. desktop" (`< 768px` vs `≥ 768px`) enough for
this pass? Default assumption below treats `md:` as "mostly behaves like
desktop, just narrower," and puts the real design effort into `<640px`.

---

## 2. Global Navigation — Mobile Pattern

The current sidebar (visible in every screenshot so far — logo, business
name/tagline, then Dashboard/Appointments/Clients/Staff/Services/Payments
as a vertical list) doesn't fit on a phone.

**Proposed default:** replace the always-visible sidebar with:
- A fixed top bar on mobile (`<768px`): hamburger icon (left) + current
  page title (center) + nothing or a user/avatar icon (right)
- Tapping the hamburger opens the existing sidebar content as a slide-in
  drawer (overlay, not push) over the page content
- At `≥768px`, revert to the current always-visible sidebar — no behavior
  change above tablet width

**Alternative considered and rejected for default:** a bottom tab bar
(common in consumer mobile apps). Rejected because six nav items
(Dashboard/Appointments/Clients/Staff/Services/Payments) don't fit a
bottom bar without a "More" overflow menu, which adds complexity the
hamburger drawer avoids. **Flag if the business wants a bottom bar
instead** — that's a real product decision, not purely technical.

---

## 3. Per-Screen Requirements

### 3.1 Dashboard (newest screen, built this session)

Already a reasonable starting point — it's cards/tiles, not a dense table,
which is the easiest shape to make responsive.

- `grid-cols-1 sm:grid-cols-3` on the top metric tiles (currently
  hardcoded 3-column) — stack to one column below `sm:`
- `PeriodBreakdown`'s `grid-cols-3` (Today/Week/Month) can likely stay
  3-column even on phones — three short numbers side by side is still
  legible at narrow widths; verify at 360px width (a common small-phone
  size) before assuming
- Earnings range buttons (`Today/This Week/This Month/Custom Range`) need
  `flex-wrap` (already present) confirmed to actually wrap to 2 rows
  cleanly on a 360px-wide screen, not overflow horizontally
- Custom date range inputs: stack vertically on mobile instead of
  `flex items-end gap-3` side-by-side, since two date pickers plus a button
  side-by-side is tight below ~400px

### 3.2 Appointments (hardest screen — needs a real design decision)

The existing Day view (staff as columns, time as rows) is a spreadsheet-like
grid that fundamentally does not fit a phone screen — there's no amount of
responsive CSS that makes 5+ staff columns readable at 360px width.

**Decision needed, not just a technical fix:**

| Option | What it looks like on mobile | Tradeoff |
|---|---|---|
| **A — Single-staff-at-a-time view (proposed default)** | Day view becomes one vertical staff list; tap a staff name to see just their time column, full-width | Loses the "see everyone at once" overview; matches how most mobile booking apps actually work |
| **B — Horizontal scroll** | Keep the grid exactly as-is, let it scroll sideways | Simplest to build, but staff columns scrolling off-screen with no visible indicator is a common real usability complaint |
| **C — Collapse to List view by default on mobile** | The existing List view (already built, per the project's "Day view, Week view, and List view" structure) becomes the default on `<768px`, Day/Week grid views hidden behind a "switch view" option | Reuses an existing component instead of building new UI; List view inherently handles arbitrary staff counts since it's not a grid |

**Recommended default: Option C.** It needs the least new UI work (List
view is confirmed to already exist) and avoids inventing a new interaction
pattern. Confirm before building — if staff genuinely need the
side-by-side comparison view on mobile (e.g. a receptionist checking who's
free right now while standing at the front desk), Option A is worth the
extra effort instead.

- Staff filter chips (already built): these should scroll horizontally in
  a single row on mobile rather than wrap to multiple rows, which eats
  vertical space fast with 5+ staff
- New Appointment modal: confirm it already expands to full-screen (or
  near-full-screen) on mobile rather than staying a small centered dialog
  — small centered modals with multiple form fields are a common mobile
  usability failure

### 3.3 Clients (dense table → card list)

The current "searchable dense table with inline add/edit" is the classic
responsive-table problem. Two real options, not purely a styling fix:

- **Proposed default:** below `md:`, replace the `<table>` rendering
  entirely with a stacked card list — one card per client, name as the
  card title, phone/email as secondary lines, tapping the card opens the
  existing edit modal (already built) rather than inline-editing in place
- Inline editing *within* a card list is harder to make usable at small
  widths than tapping into the existing modal — recommend disabling
  inline-edit specifically on mobile, modal-only, even if desktop keeps
  inline edit
- Search input: already full-width in the existing layout per earlier
  screenshots — should need no change
- The `+ Add client` button: confirm it stays reachable without scrolling
  on mobile (consider a fixed/sticky position at small widths if the
  client list is long)

### 3.4 Staff (card grid)

Already the closest to mobile-ready of the five original screens — card
grids are naturally responsive. Mainly needs:
- Grid column count tied to breakpoint (`grid-cols-1 sm:grid-cols-2
  lg:grid-cols-3` or similar) rather than a fixed column count
- Confirm card content (initials avatar, name, role/contact) doesn't
  truncate awkwardly at the narrowest card width

### 3.5 Services (price menu list)

Likely the simplest screen — a list layout should already stack naturally.
Verify:
- Price alignment (right-aligned prices are common in list layouts) still
  looks correct when the name text wraps to two lines on a narrow screen
- No horizontal scroll introduced by a fixed-width element somewhere in
  the row

### 3.6 Payments

Currently still mocked per the project notes — build its mobile layout
*after* it's wired to the real backend (flat `/payments` endpoints,
resolved earlier this project), not before, so effort isn't spent twice on
a screen that's still changing underneath.

---

## 4. Cross-Cutting Requirements

- **Touch target size:** every tappable element (buttons, table rows that
  act as links, chips, nav items) needs a minimum ~44×44px hit area —
  several existing buttons (e.g. the small `×` close button in
  `ClientFormModal`, sized `text-xl leading-none` with no explicit padding)
  should be checked against this and given more tap padding on mobile if
  they fall short
- **Forms:** all modal forms (Client, Staff, Service, Appointment) should
  use full-width inputs stacked vertically on mobile — this likely already
  matches their current single-column layout, but confirm none assume
  horizontal space for side-by-side fields
- **Font sizes:** confirm nothing drops below ~14px (`text-sm`) on mobile
  body text — several existing components use `text-xs` for secondary
  text (timestamps, labels), which is borderline small for phone reading
  and worth a deliberate check, not an assumption
- **Horizontal scroll audit:** after the above changes, test every screen
  at exactly 320px width (the narrowest common phone size, e.g. older
  small Android devices) specifically looking for *any* horizontal scroll
  appearing — that's almost always an unintended overflow bug, not a
  deliberate design choice, anywhere in this app

---

## 5. Testing Checklist

- [ ] Every screen tested at 320px, 375px (iPhone SE/standard), 414px
      (larger phones), 768px (tablet), and 1024px+ (desktop, unchanged)
- [ ] Mobile nav drawer opens/closes correctly, doesn't trap focus
      incorrectly for keyboard/screen-reader users
- [ ] All five original screens plus Dashboard checked individually — this
      is six separate screens, each needs its own pass, not one global fix
- [ ] No horizontal scroll anywhere at 320px except where explicitly
      intended (e.g. staff filter chips, if those are deliberately
      horizontal-scrolling)
- [ ] Modals are usable one-handed on a phone (reachable buttons, not
      requiring awkward reach to the top of a tall modal)
- [ ] Real device test, not just browser dev-tools resize — at least one
      pass on an actual phone before calling this done, since dev-tools
      viewport simulation doesn't catch every real touch-interaction issue

---

## 6. Sequencing

1. **Global nav pattern** (Section 2) — everything else depends on this
   existing, since every screen sits inside it
2. **Dashboard** — newest, smallest surface area, good first real test of
   the breakpoint strategy
3. **Staff, Services** — already closest to responsive; low effort, quick wins
4. **Clients** — table → card list is a real but well-scoped change
5. **Appointments** — biggest decision (Section 3.2) and biggest effort;
   sequence last so the decision has time to be made deliberately rather
   than rushed to unblock other work
6. **Payments** — after its backend integration is finished, not before

---

## 7. Open Decisions Requiring Confirmation Before/During Build

- Bottom tab bar vs. hamburger drawer for navigation (Section 2)
- Appointments mobile strategy: List-view-default vs. single-staff view vs.
  horizontal scroll (Section 3.2)
- Whether a dedicated tablet (`md:`) layout is worth the extra design
  effort, or whether phone/desktop is sufficient for this pass (Section 1)
- Inline-edit vs. modal-only editing for Clients on mobile (Section 3.3)
