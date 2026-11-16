BEGIN;

CREATE TYPE "MemoryVisibility" AS ENUM ('PRIVATE', 'FRIENDS');

ALTER TABLE "Memory"
ADD COLUMN "visibility" "MemoryVisibility"
NOT NULL DEFAULT 'PRIVATE';

CREATE INDEX "Memory_userId_visibility_idx"
ON "Memory"("userId", "visibility");

COMMIT;