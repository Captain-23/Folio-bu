# Folio BU Backend Schema Spec (Claude-Ready)

Use this document to generate the backend database schema for Folio BU.

## Goal

Generate a production-ready relational schema (PostgreSQL) for an anonymous university journaling platform with:

- email/password auth (university email only),
- pseudonymous profile identity,
- journal entries with AI enrichment,
- reactions,
- follows,
- daily prompts,
- weekly reflections,
- moderation flags.

## Tech Assumptions

- Database: PostgreSQL
- ORM target: Prisma schema output preferred
- IDs: `cuid` (string IDs)
- Timestamps: `createdAt` default now
- Deletions: cascade where appropriate

## Core Privacy Rules

1. Never expose user email in public feed responses.
2. Public identity is alias + avatar only.
3. Journals can exist unpublished until moderation passes.
4. All follow relationships are between pseudonymous users.

## Enums

### `Role`
- `STUDENT`
- `ADMIN`

### `Mood`
- `happy`
- `sad`
- `stress`
- `anxious`
- `grateful`

## Models

### 1) `User`

Represents account credentials + pseudonymous profile.

Fields:
- `id String @id @default(cuid())`
- `email String @unique`
- `password String` (bcrypt hash)
- `alias String? @unique` (public display name/pseudonym)
- `avatarId String?` (one of predefined non-human avatars)
- `bio String? @db.VarChar(240)`
- `onboardingComplete Boolean @default(false)`
- `role Role @default(STUDENT)`
- `createdAt DateTime @default(now())`

Relations:
- has many `entries`
- has many `reactions`
- has many `weeklyReflection`
- has many `followers` (via `Follow` relation "UserFollowers")
- has many `following` (via `Follow` relation "UserFollowing")

Notes:
- `email` is private/auth only.
- `alias` is public handle and used in profile route lookups.

### 2) `Entry`

Represents a journal entry.

Fields:
- `id String @id @default(cuid())`
- `userId String`
- `content String @db.VarChar(1000)`
- `mood Mood?`
- `aiReflection String?`
- `isPublished Boolean @default(false)`
- `isFlagged Boolean @default(false)`
- `flagReason String?`
- `createdAt DateTime @default(now())`

Relations:
- belongs to `user` (`User`, cascade on delete)
- has many `reactions`

Indexes:
- `@@index([userId])`
- `@@index([isPublished, createdAt])`

### 3) `Reaction`

Represents a user's reaction to an entry (single anonymous reaction per user per entry).

Fields:
- `id String @id @default(cuid())`
- `entryId String`
- `userId String`

Relations:
- belongs to `entry` (cascade on delete)
- belongs to `user` (cascade on delete)

Constraints:
- `@@unique([entryId, userId])` (prevents duplicate reacting by same user)

### 4) `Follow`

Represents follower -> following user relationship.

Fields:
- `id String @id @default(cuid())`
- `followerId String`
- `followingId String`
- `createdAt DateTime @default(now())`

Relations:
- `follower User @relation("UserFollowing", fields: [followerId], references: [id], onDelete: Cascade)`
- `following User @relation("UserFollowers", fields: [followingId], references: [id], onDelete: Cascade)`

Constraints and indexes:
- `@@unique([followerId, followingId])`
- `@@index([followingId])`

Business rule:
- app layer must block self-follow (`followerId != followingId`)

### 5) `DailyPrompt`

Stores one daily journaling prompt.

Fields:
- `id String @id @default(cuid())`
- `prompt String`
- `date DateTime @unique @db.Date`
- `createdAt DateTime @default(now())`

### 6) `WeeklyReflection`

AI-generated summary for one user per week.

Fields:
- `id String @id @default(cuid())`
- `userId String`
- `content String`
- `weekStart DateTime @db.Date`
- `createdAt DateTime @default(now())`

Relations:
- belongs to `user` (cascade on delete)

Constraints:
- `@@unique([userId, weekStart])`

## Required Query Patterns (schema must support)

1. Public feed:
   - fetch `Entry` where `isPublished = true`, newest first, paginated.
   - include alias only from `User`, include reaction count.

2. Personal journal:
   - fetch all entries by `userId`, newest first.

3. Weekly digest:
   - top published entries in current week ordered by reaction count desc, then createdAt desc.

4. Profile by alias:
   - find `User` by case-insensitive alias.
   - include published entries + follower/following counts.

5. Follow toggle:
   - upsert/delete row in `Follow` for `(followerId, followingId)`.

## Validation Rules (app layer; mention in generated schema comments)

- Register: email must be from university domain.
- Password minimum length 8.
- Entry content length 1..1000.
- Bio max 240 chars.
- Alias max 32 chars and unique.
- Avatar must be from approved list.

## Output Format Requested from Claude

When generating, output:

1. Complete Prisma schema with:
   - generator,
   - datasource,
   - enums,
   - all models above,
   - indexes and unique constraints.
2. Brief migration notes:
   - commands for dev (`prisma db push`, `prisma generate`)
   - commands for prod migrations.
3. Any caveats (e.g., self-follow check done in API layer).

## Non-Goals

- Do not generate frontend code.
- Do not generate API handlers in this step.
- Do not include real-name fields.
