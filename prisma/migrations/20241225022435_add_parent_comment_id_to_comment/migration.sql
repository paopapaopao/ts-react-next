-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "parentCommentId" INTEGER;

-- CreateIndex
CREATE INDEX "Comment_parentCommentId_idx" ON "Comment"("parentCommentId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
