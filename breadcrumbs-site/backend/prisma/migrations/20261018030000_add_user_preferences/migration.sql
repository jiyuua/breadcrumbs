
-- CreateTable
CREATE TABLE "UserPreference" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "budget" INTEGER,
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "boroughs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "transportation" TEXT,
    "availableHours" INTEGER,
    "maxTravelMinutes" INTEGER,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key"
ON "UserPreference"("userId");

-- AddForeignKey
ALTER TABLE "UserPreference"
ADD CONSTRAINT "UserPreference_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
