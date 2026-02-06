/*
  Warnings:

  - Added the required column `background_color` to the `gym_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text_color` to the `gym_settings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "gym_settings" ADD COLUMN     "background_color" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "text_color" TEXT NOT NULL DEFAULT '';
