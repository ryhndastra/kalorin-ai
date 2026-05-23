/*
  Warnings:

  - Added the required column `day` to the `DailyLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "DailyLog_userId_date_idx";

-- AlterTable
ALTER TABLE "DailyLog" ADD COLUMN     "day" TEXT NOT NULL,
ADD COLUMN     "foodId" INTEGER,
ADD COLUMN     "foodName" TEXT,
ADD COLUMN     "mealType" TEXT,
ADD COLUMN     "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "DailyInsight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyInsight_userId_idx" ON "DailyInsight"("userId");

-- CreateIndex
CREATE INDEX "DailyLog_userId_day_idx" ON "DailyLog"("userId", "day");

-- CreateIndex
CREATE INDEX "DailyLog_foodId_idx" ON "DailyLog"("foodId");

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE SET NULL ON UPDATE CASCADE;
