# PIXEL_LOG — Product Requirements Document

**Product name:** PIXEL_LOG (strangers-log)  
**Version:** 0.1 (MVP in progress)  
**Last updated:** June 2026  
**Audience:** Bennett University students  

---

## 1. Overview

PIXEL_LOG is an anonymous, pixel-art-styled journaling platform for college students. Users write private journal entries that can be shared to a campus feed under a **pseudonym** and **non-human avatar**—never their real name. The product emphasizes safety, anonymity, and a retro “chronicle” aesthetic.

**Institution gate:** Only `@bennett.edu.in` email addresses may register or sign in.

---

## 2. Goals

| Goal | Description |
|------|-------------|
| **Safe expression** | Students journal without exposing real identity on the public feed. |
| **Campus belonging** | Shared feed and reactions create community without doxxing. |
| **Low friction** | Fast signup → pick name + avatar → write. |
| **Moderation** | AI-assisted screening before entries publish (planned / partial). |

---

## 3. Non-goals (MVP)

- Real-name profiles, photos, or custom avatar uploads  
- Age, branch, year, or other PII in profiles  
- Direct messaging between users  
- Public search by real name  

---

## 4. User personas

- **Student writer** — Logs feelings and campus life; reads others’ entries for solidarity.  
- **Student reader** — Reacts and comments under pseudonym rules.  
- **Admin** (future) — Reviews flagged content.  

---

## 5. Core user flows

### 5.1 Registration & login

1. User opens `/login` (Join Chronicle / Enter Village tabs).  
2. Must use `@bennett.edu.in` email and password (8+ chars).  
3. Must accept **community rules** (checkbox):  
   - No real names on the platform  
   - No real names in journals or comments  
   - No targeting specific people  
   - Journaling only—not gossip or call-outs  
4. Account created → auto sign-in → **onboarding**.

### 5.2 Onboarding

1. User lands on `/onboarding`.  
2. Chooses any **display name** (pseudonym, up to 32 characters).  
3. Chooses exactly one of **8 non-human avatars** (profile picture; no uploads).  
4. Redirect to `/feed`.

### 5.3 Feed & read entry

1. `/feed` shows “Today’s Journals” strip + “Explore Entries” masonry grid.  
2. Tapping any card opens `/journal/[id]` with full entry, reactions, and message board.  
3. “Back to Feed” returns to `/feed`.

### 5.4 Write entry

1. `/write` — notebook UI: title, body, toolbar (mock).  
2. **Target:** POST `/api/entries` → async moderation → publish to feed when safe.

### 5.5 Header (logged in)

- **Left:** PIXEL_LOG logo → feed  
- **Right:**  
  - Notifications bell + badge (unread reactions/comments)  
  - **Write Today** → `/write`  
  - Avatar menu: Profile, My Journals, Sign Out  

No “Sign In” when logged in. No Memories / Journal links in top nav.

### 5.6 Profile

- `/profile` — stats, memory inventory calendar (UI mock), mobile bottom nav.

---

## 6. Functional requirements

| ID | Requirement | Status |
|----|-------------|--------|
| AUTH-1 | Bennett email only on register/login | Done |
| AUTH-2 | Community rules required at signup | Done |
| AUTH-3 | Post-signup onboarding (name + avatar) | Done |
| AUTH-4 | JWT session with alias, avatarId, onboarding flag | Done |
| FEED-1 | Feed page with clickable entries | Done (mock data) |
| FEED-2 | Journal detail page per entry id | Done (mock data) |
| FEED-3 | Feed from API (`GET /api/entries`) | Planned |
| WRITE-1 | Create entry API + validation | Backend exists |
| WRITE-2 | Write UI saves to API | Planned |
| MOD-1 | Gemini moderation pipeline | Partial |
| NOTIF-1 | Unread count API + bell badge | UI done; count stub |
| PROF-1 | Profile shows user avatar & alias | Planned |

---

## 7. Community rules (canonical text)

1. Do not use your real name on this platform.  
2. Do not mention anyone's real name in journal entries or comments.  
3. Do not target or identify a specific person in your journaling.  
4. Use this space only for journaling—not gossip, call-outs, or personal attacks.  

---

## 8. Avatars (onboarding)

Users must pick one of eight non-human characters: robot, mushroom, star, ghost, cactus, moon, crystal, cloud. Stored as `avatarId` on `User`.

---

## 9. Technical stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS |
| Auth | NextAuth.js (credentials), bcrypt |
| Database | PostgreSQL (Supabase) via Prisma |
| AI | Google Gemini (moderation, mood, prompts) |
| Hosting | TBD (Vercel recommended) |

**Key routes**

- `/login`, `/register`, `/onboarding`  
- `/feed`, `/journal/[id]`, `/write`, `/profile`  
- `/api/auth/*`, `/api/entries/*`, `/api/notifications/unread`  

---

## 10. Data model (summary)

- **User** — email, password hash, optional alias, avatarId, onboardingComplete, role  
- **Entry** — content, mood, AI fields, publish/flag status  
- **Reaction** — per user per entry  
- **DailyPrompt**, **WeeklyReflection** — AI-generated  

---

## 11. Security & privacy

- Never expose `email` or `userId` on public feed APIs (alias only).  
- `.env` must not be committed; use `.env.example` as template.  
- Passwords hashed with bcrypt (cost 12).  
- Protected API routes via NextAuth session.  

---

## 12. MVP completion checklist

- [ ] Wire feed to real `GET /api/entries`  
- [ ] Wire write page to `POST /api/entries`  
- [ ] Implement notification unread count in DB  
- [ ] Profile page uses session alias + avatar  
- [ ] “My Journals” lists current user’s entries  
- [ ] Comments/reactions persistence  
- [ ] Production deploy + env vars on host  
- [ ] E2E smoke test: signup → onboard → write → see on feed  

---

## 13. Success metrics (post-launch)

- Weekly active writers (Bennett emails)  
- Entries published vs flagged ratio  
- Reaction/comment engagement per entry  
- Report rate / moderation turnaround  

---

## 14. Open questions

- Should deleted entries be soft-deleted or hard-deleted?  
- Comment moderation: same Gemini pipeline as entries?  
- Rate limits per user per day?  

---

*This PRD reflects the codebase as of the initial MVP build. Update sections 6 and 12 as features ship.*
