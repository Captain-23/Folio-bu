# Folio BU — Migration Notes & Setup

---

## 1. Prerequisites

- Node.js 18+
- PostgreSQL 15+ running locally or on a hosted provider (Supabase, Railway, Neon)
- `.env` file at the root with:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/foliodb?schema=public"
```

---

## 2. Install Prisma

```bash
npm install prisma @prisma/client
npx prisma init
```

Replace the generated `prisma/schema.prisma` with the provided `schema.prisma` file.

---

## 3. Development

Push schema directly to the database (no migration files, fast for dev):

```bash
npx prisma db push
```

Regenerate the Prisma client after any schema change:

```bash
npx prisma generate
```

Open Prisma Studio to inspect data locally:

```bash
npx prisma studio
```

---

## 4. Production

Generate and apply migrations properly (creates a migration history):

```bash
# Create a named migration from schema diff
npx prisma migrate dev --name init

# Apply pending migrations in production (CI/CD safe)
npx prisma migrate deploy
```

> Never run `prisma db push` in production — it skips migration history.

---

## 5. Seeding (Optional)

Create `prisma/seed.ts` to seed:
- A set of approved `avatarId` values
- Initial `DailyPrompt` entries
- An `ADMIN` user for moderation

Add to `package.json`:
```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

Run:
```bash
npx prisma db seed
```

---

## 6. API Layer Responsibilities (not in schema)

These rules must be enforced in your route handlers — not the DB:

| Rule | Where |
|---|---|
| Email must match university domain (e.g. `@bu.edu`) | Register endpoint |
| Password minimum 8 characters | Register endpoint |
| Block self-follow (`followerId !== followingId`) | Follow toggle endpoint |
| `avatarId` must be from approved predefined list | Register + update profile |
| `email` must never be returned in any API response | All user serializers |
| `alias` lookup must be case-insensitive | Profile route |
| `wordCount` and `readTimeSecs` computed before save | Create/update entry |
| `agreedToRules` must be `true` before account activates | Register endpoint |

---

## 7. Key Query Patterns

### Public feed (newest published entries)
```ts
prisma.entry.findMany({
  where: { isPublished: true, isRemoved: false },
  orderBy: { createdAt: 'desc' },
  include: {
    user: { select: { alias: true, avatarId: true } },
    _count: { select: { reactions: true } }
  },
  take: 20,
  skip: cursor  // pagination
})
```

### Personal journal (all entries by user)
```ts
prisma.entry.findMany({
  where: { userId },
  orderBy: { createdAt: 'desc' }
})
```

### Weekly digest (top entries this week by reaction count)
```ts
prisma.entry.findMany({
  where: {
    isPublished: true,
    isRemoved: false,
    createdAt: { gte: startOfWeek, lte: endOfWeek }
  },
  orderBy: [
    { reactions: { _count: 'desc' } },
    { createdAt: 'desc' }
  ],
  take: 10
})
```

### Profile by alias (case-insensitive)
```ts
prisma.user.findFirst({
  where: { alias: { equals: alias, mode: 'insensitive' } },
  select: {
    alias: true,
    avatarId: true,
    bio: true,
    _count: { select: { followers: true, following: true } },
    entries: { where: { isPublished: true }, orderBy: { createdAt: 'desc' } }
  }
})
```

### Follow toggle (upsert / delete)
```ts
// Follow
prisma.follow.create({
  data: { followerId, followingId }
})

// Unfollow
prisma.follow.delete({
  where: { followerId_followingId: { followerId, followingId } }
})
```

### Unread notification count (bell badge)
```ts
prisma.notification.count({
  where: { userId, isRead: false }
})
```

---

## 8. Caveats & Notes

- **Self-follow** must be prevented at the API layer. The schema has no DB constraint for this — add `if (followerId === followingId) throw new Error()` before the Prisma call.
- **Email privacy** — never include `email` or `password` in `select` when returning user data to the client. Use a `safeUser` serializer that only exposes `alias`, `avatarId`, `bio`, `role`.
- **AI enrichment** — `aiReflection` on `Entry` and `WeeklyReflection.content` are written asynchronously. Trigger generation via a background job or webhook after publish, not inline in the request.
- **Avatar list** — maintain an approved `avatarId` allowlist in a config file or seed table. Reject unknown values at registration and profile update.
- **Cascade deletes** — deleting a `User` cascades to their `Entry`, `Reaction`, `Follow`, `WeeklyReflection`, and `Notification` rows. This is intentional for account deletion flows.
- **`ModerationLog`** uses `onDelete: Restrict` on the moderator relation — a moderator account cannot be deleted while audit logs reference it. Suspend instead of delete admin accounts.
