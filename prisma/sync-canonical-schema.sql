-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('reaction', 'follow', 'milestone', 'weekly_reflection_ready', 'daily_nudge', 'featured', 'moderation_warning');

-- CreateEnum
CREATE TYPE "MilestoneType" AS ENUM ('first_entry', 'streak_7', 'streak_30', 'streak_100', 'entries_10', 'entries_50', 'entries_100', 'first_reaction', 'first_follow');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('real_name_mentioned', 'targeting_person', 'not_journaling', 'hate_speech', 'personal_info', 'other');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('pending', 'reviewed', 'actioned', 'dismissed');

-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('entry', 'user');

-- CreateEnum
CREATE TYPE "ModAction" AS ENUM ('removed', 'warned', 'suspended', 'reinstated', 'flagged', 'unflagged');

-- AlterTable
ALTER TABLE "DailyPrompt" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Entry" ADD COLUMN     "isRemoved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readTimeSecs" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "wordCount" INTEGER;

-- AlterTable
ALTER TABLE "Reaction" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "agreedAt" TIMESTAMP(3),
ADD COLUMN     "agreedToRules" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "alias" SET DATA TYPE VARCHAR(32);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actorId" TEXT,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "entryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "MilestoneType" NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeaturedEntry" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "featuredDate" DATE NOT NULL,
    "featuredById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeaturedEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "details" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationLog" (
    "id" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "targetType" "TargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "action" "ModAction" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Milestone_userId_idx" ON "Milestone"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Milestone_userId_type_key" ON "Milestone"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "FeaturedEntry_entryId_key" ON "FeaturedEntry"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "FeaturedEntry_featuredDate_key" ON "FeaturedEntry"("featuredDate");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "Report_entryId_idx" ON "Report"("entryId");

-- CreateIndex
CREATE INDEX "ModerationLog_targetType_targetId_idx" ON "ModerationLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "ModerationLog_moderatorId_idx" ON "ModerationLog"("moderatorId");

-- CreateIndex
CREATE INDEX "Entry_isFlagged_idx" ON "Entry"("isFlagged");

-- CreateIndex
CREATE INDEX "Follow_followerId_idx" ON "Follow"("followerId");

-- CreateIndex
CREATE INDEX "Reaction_entryId_idx" ON "Reaction"("entryId");

-- CreateIndex
CREATE INDEX "WeeklyReflection_userId_idx" ON "WeeklyReflection"("userId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeaturedEntry" ADD CONSTRAINT "FeaturedEntry_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationLog" ADD CONSTRAINT "ModerationLog_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Existing accounts: allow login under new rules
UPDATE "User" SET "agreedToRules" = true, "agreedAt" = COALESCE("agreedAt", NOW()) WHERE "agreedToRules" = false;
