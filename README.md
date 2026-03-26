# The Lorenzo Files

A classified evidence archive for the **Department of Lorenzo** — a real-time, Firebase-backed web app where authenticated agents can upload, browse, search, vote on, and purge evidence files linked to a roster of suspects.

---

## Features

### Authentication & Access Control
- **Email / password sign-in and registration** via Firebase Auth
- **Google Sign-In** (requires the Universal Password for authorization)
- **Universal Password (site password)** — a shared clearance code (`VITE_SITE_PASSWORD`) required to register a new account or sign in with Google, limiting access to invited agents only
- **Email verification gate** — new accounts must verify their email address before accessing the archive; a resend link and status refresh button are provided
- All Firestore data is gated behind Firebase Auth rules — unauthenticated users cannot read or write anything

### Evidence Archive
- **Real-time file listing** powered by Firestore's `onSnapshot` listener — the archive updates live across all connected agents
- Each evidence entry stores:
  - File name, upload date, file size (human-readable + raw bytes), and status (`CLASSIFIED`)
  - One or more **suspect names** linked from a curated participant roster
  - A short **classified intel context** (up to 35 characters, displayed as redacted text)
  - A **direct download URL** from Firebase Storage
  - Upvote / downvote counts and the uploader's user ID

### File Upload
- Authenticated agents can upload any file up to **50 MB**
- An **Evidence Acquisition Protocol** modal collects:
  - One or more target suspects (searchable multi-select from the participant list)
  - A brief classified intel description
- Files are stored in **Firebase Storage** under `uploads/` and metadata is written to Firestore

### Voting System
- Each evidence file has **upvote / downvote** buttons
- Votes are deduplicated per user — voting on the same option again toggles it off; switching sides flips the vote
- Vote counts are updated via a Firestore transaction and stored in a `voters` sub-collection, preventing direct manipulation of the `upvotes`/`downvotes` fields from the client

### Search, Filter & Sort
- **Search by file name** (case-insensitive substring match)
- **Filter by suspect** — dropdown populated from the participant roster
- **Sort options**: Newest · Oldest · Most Upvotes · Least Upvotes · Biggest File · Smallest File

### File Deletion (Purge)
- The uploader of a file can **purge** it — this deletes the file from Firebase Storage and the Firestore document together
- Firestore security rules enforce that only the original uploader (`uploadedById == request.auth.uid`) can delete a record

### UI & Visual Design
- **Spy / classified document aesthetic**: dark navy background, gold (`doj-gold`) accents, monospace fonts, scanlines overlay, film grain, CONFIDENTIAL watermark, and a TOP SECRET classification banner
- **Responsive layout**: desktop shows a sortable evidence table; mobile shows individual file cards
- **Security Level indicator**: a 3-bar indicator that fills red as agents interact with redacted content — triggering it enough activates a **Security Breach** easter egg screen
- **Animated interactions** powered by Framer Motion (vote buttons, modals)
- **Vercel Analytics** integration for usage tracking

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev) + [Vite 6](https://vitejs.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Database | [Firebase Firestore](https://firebase.google.com/docs/firestore) |
| File Storage | [Firebase Storage](https://firebase.google.com/docs/storage) |
| Authentication | [Firebase Auth](https://firebase.google.com/docs/auth) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Icons | [Lucide React](https://lucide.dev) |
| Analytics | [Vercel Analytics](https://vercel.com/analytics) |
| Linting | [ESLint 9](https://eslint.org) |
| Testing | [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) |

---

## Project Structure

```
src/
├── App.jsx                        # Root component — auth gate, file listing, upload & delete logic
├── main.jsx                       # React entry point
├── index.css                      # Global styles (grain, scanlines, watermark, custom scrollbar)
├── components/
│   ├── Header.jsx                 # App header with DOL seal, status indicators, sign-out
│   ├── LoginScreen.jsx            # Email/password + Google sign-in & registration form
│   ├── EmailVerificationGate.jsx  # Blocks access until email is verified
│   ├── SearchPortal.jsx           # Search input
│   ├── FileRow.jsx                # Desktop table row for a single evidence file
│   ├── MobileFileCard.jsx         # Mobile card for a single evidence file
│   ├── UploadModal.jsx            # Evidence acquisition modal (suspect + context input)
│   ├── VoteButtons.jsx            # Upvote/downvote UI with real-time Firestore sync
│   ├── RedactedBox.jsx            # Redacted text display with click-to-reveal interaction
│   └── SecurityBreach.jsx         # Easter egg full-screen breach animation
├── lib/
│   ├── firebase.js                # Firebase app initialization and exports
│   └── voteOnFile.js              # Vote transaction logic
├── data/
│   ├── names.js                   # Participant / suspect roster
│   └── files.js                   # Static seed data
└── hooks/
    ├── useIsMobile.js             # Breakpoint detection hook
    └── useIsMobile.test.js        # Unit tests
```

---

## Setup

### Prerequisites
- Node.js 18+
- A [Firebase](https://firebase.google.com) project with **Authentication**, **Firestore**, and **Storage** enabled

### 1. Clone & Install

```bash
git clone https://github.com/levisager11-oss/The-Lorenzo-Files.git
cd The-Lorenzo-Files
npm install
```

### 2. Configure Environment Variables

Copy the example env file and fill in your Firebase project values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_SITE_PASSWORD=your_clearance_code_here
```

> **Never commit `.env.local`** — it is listed in `.gitignore`.
>
> Find your Firebase config under **Firebase Console → Project Settings → General → Your apps**.
>
> `VITE_SITE_PASSWORD` is the shared clearance code required for new agent registration and Google sign-in. Choose something strong and share it only with intended agents.

### 3. Deploy Firestore Rules

Apply the security rules from `firestore.rules` to your Firebase project:

```bash
firebase deploy --only firestore:rules
```

### 4. Run Locally

```bash
npm run dev
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |
| `npm test` | Run Vitest unit tests |

---

## Firestore Security Rules

The `firestore.rules` file enforces the following:

- **Read & Create** — any authenticated user can read all evidence files and create new ones
- **Update** — authenticated users can update evidence metadata, but **cannot directly modify `upvotes` or `downvotes`** fields (these are only updated via the voting transaction)
- **Delete** — only the user who uploaded a file (`uploadedById == request.auth.uid`) can delete it
- **Voters sub-collection** — each user can only read/write/delete their own voter document (`/evidenceFiles/{id}/voters/{uid}`)

---

## Deployment

The app is configured for deployment on [Vercel](https://vercel.com). Set the same environment variables from `.env.local` in your Vercel project settings under **Settings → Environment Variables**.
