-- CreateTable
CREATE TABLE "photos"."Photo" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "bytes" INTEGER NOT NULL,
    "format" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos"."Comment" (
    "id" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Photo_publicId_key" ON "photos"."Photo"("publicId");

-- CreateIndex
CREATE INDEX "Photo_ownerId_createdAt_idx" ON "photos"."Photo"("ownerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Comment_photoId_createdAt_idx" ON "photos"."Comment"("photoId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "photos"."Comment" ADD CONSTRAINT "Comment_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "photos"."Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
