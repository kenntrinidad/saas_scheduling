# Appointments / Booking Calendar — integration notes

## Files
Matches your existing structure — drop these into `app/(protected)/appointments/`,
replacing the placeholder folder that's already there:
```
app/(protected)/appointments/
├── page.tsx
├── types.ts
├── api.ts
├── mock-data.ts
└── components/
    ├── CalendarGrid.tsx      (Day view + Week view, time-slot grid)
    ├── ListView.tsx
    ├── StaffFilter.tsx
    └── NewAppointmentModal.tsx
```
This sits under your `(protected)` route group, so it renders inside the
`layout.tsx` you already have there (which presumably renders `Sidebar.tsx`
and runs through `AuthGuard.tsx`). `page.tsx` no longer forces its own
`min-h-screen` background — it assumes that layout already provides the
page chrome and just needs the content area.

## Assumptions I made (flagging per usual)
1. **Tailwind CSS** — assumed since you didn't specify a styling approach. If you're
   not on Tailwind, say so and I'll port this to CSS Modules.
2. **`NEXT_PUBLIC_API_URL`** env var pointing at your FastAPI base, defaulting to
   `http://127.0.0.1:8000/api/v1` — matches your README's dev setup.
3. **Auth token in `localStorage.getItem("token")`** — I don't have visibility
   into `AuthGuard.tsx`, so this is a guess. Check how that component reads the
   JWT (context, cookie, localStorage key name) and update `getToken()` in
   `api.ts` to match exactly — otherwise every request here will 401.
4. **Appointments are mocked** (`mock-data.ts`) because `GET /appointments` (a list
   endpoint) doesn't exist yet per your README's Known Gaps. Everything else —
   staff, services, clients, availability, and creating an appointment — hits
   your real endpoints already.

## Fonts
The design uses Manrope (headings) + Inter (body). Easiest way in Next.js:

```tsx
// app/layout.tsx
import { Manrope, Inter } from "next/font/google";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// add `${manrope.variable} ${inter.variable}` to your <body> className
```
Then in `tailwind.config.ts`:
```ts
fontFamily: {
  sans: ["var(--font-inter)"],
  heading: ["var(--font-manrope)"],
}
```
(and swap `font-[Manrope]` in `page.tsx` for `font-heading` once that's set up)

## What's next once you add `GET /appointments`
In `page.tsx`, replace the `mockAppointments` initial state and the empty
`handleCreated` with a real fetch:
```ts
const refresh = () =>
  appointmentsApi.listAppointments(fromISO, toISO).then(setAppointments);

useEffect(() => { refresh(); }, [view, refDate]);
// call refresh() inside handleCreated() too
```

## Known trade-offs
- Week view aggregates all filtered staff into one column per day (not one
  column per staff-per-day) to keep the grid readable on a laptop screen —
  fine for a small team, but worth revisiting if you have 5+ staff.
- The double-booking race condition your README flags is a backend concern;
  the modal here surfaces the resulting 4xx as "that slot was just taken."
