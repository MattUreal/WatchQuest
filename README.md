# WatchQuest – movies & TV explorer (Next.js + Firebase + TMDB)

## Features
- Home carousel and rows: Trending, Latest, Popular, Upcoming (movies and TV)
- Browse pages with pagination, Search, Discover (type, genre, year, sort)
- Details page: overview, trailer, cast, similar titles
- Sign up / sign in (email + Google), profile page (name, password, email verification, delete account)
- Personal library: Favourites, Watched, Watch later (Firestore, live sync)
- Admin area (/admin): dashboard, user management, site announcement banner
- Offline banner, mobile-friendly layout, security headers

## Setup
1. `npm install` (Node 20.6+ is needed for the helper scripts)
2. Copy `.env.example` to `.env.local` and fill it in:
   - TMDB: Settings > API > **API Read Access Token** -> `TMDB_TOKEN`
   - Firebase web config: Project settings > Your apps
   - Firebase Admin: Project settings > Service accounts > Generate new private key
3. Firebase console:
   - Authentication > Sign-in method: enable **Email/Password** and **Google**
   - Create the Firestore database
   - Rules tab: paste `firestore.rules` and publish
     (**if the project already has data/apps, MERGE these rules with the existing ones, don't replace them**)
4. `npm run dev` -> http://localhost:3000

## Make yourself an admin
Sign up in the app, then run (from the project root):
```
npm run make-admin -- you@example.com
```
Sign out and back in. An "Admin" link appears in the navbar.

## Useful scripts
- `npm run make-admin -- email` – give a user the admin role
- `npm run inspect-db` – prints Firestore collection paths and field names (no values)

## Deploy (Vercel + GitHub)
1. Push to GitHub (`.env.local` is ignored by `.gitignore`; never commit it).
2. Import the repo in Vercel and add every variable from `.env.example` as an Environment Variable.
3. Firebase > Authentication > Settings > Authorized domains: add your production domain.
4. Restrict the Firebase browser API key by HTTP referrer in Google Cloud Console.

## Security notes
- `TMDB_TOKEN` and `FIREBASE_ADMIN_*` are secrets (server only, never `NEXT_PUBLIC_`).
- `NEXT_PUBLIC_FIREBASE_*` is public by design; Firestore rules protect the data.
- Admin = custom claim `admin: true`. `/api/admin/*` verifies the token on the server; the admin screens are only a convenience.

## Data model
`users/{uid}/library/{type}_{id}` -> `{ id, type, title, poster, date, rating, favorite, watched, watchLater, updatedAt }`
`settings/site` -> `{ announcement, announcementEnabled, updatedAt }`

## Folder guide
- `app/` pages and API routes, `components/` reusable UI, `lib/` helpers (TMDB, Firebase, auth, library), `scripts/` one-off Node scripts
