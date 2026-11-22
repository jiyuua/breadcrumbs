BEGIN;

-- Create friendship status enum
CREATE TYPE "FriendshipStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'DECLINED'
);

-- Create Friendship table
CREATE TABLE "Friendship" (
    "id" SERIAL NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id"),

    CONSTRAINT "Friendship_no_self_request"
        CHECK ("requesterId" <> "receiverId")
);

-- Prevent duplicate requests
CREATE UNIQUE INDEX "Friendship_requesterId_receiverId_key"
ON "Friendship"("requesterId", "receiverId");

-- Prevent reverse-direction duplicate requests
CREATE UNIQUE INDEX "Friendship_unique_user_pair"
ON "Friendship" (
    LEAST("requesterId", "receiverId"),
    GREATEST("requesterId", "receiverId")
);

-- Improve query performance
CREATE INDEX "Friendship_receiverId_status_idx"
ON "Friendship"("receiverId", "status");

CREATE INDEX "Friendship_requesterId_status_idx"
ON "Friendship"("requesterId", "status");

-- Connect requester to User table
ALTER TABLE "Friendship"
ADD CONSTRAINT "Friendship_requesterId_fkey"
FOREIGN KEY ("requesterId")
REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Connect receiver to User table
ALTER TABLE "Friendship"
ADD CONSTRAINT "Friendship_receiverId_fkey"
FOREIGN KEY ("receiverId")
REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;