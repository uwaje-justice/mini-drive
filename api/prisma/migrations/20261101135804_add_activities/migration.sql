-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "targetName" TEXT NOT NULL,
    "previousName" TEXT,
    "previousEmail" TEXT,
    "nextEmail" TEXT,
    "locationName" TEXT,
    "fromLocationName" TEXT,
    "toLocationName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Activity_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Activity_ownerId_createdAt_idx" ON "Activity"("ownerId", "createdAt");

-- Backfill creation events for files that already exist.
INSERT INTO "Activity" (
    "id",
    "ownerId",
    "action",
    "targetType",
    "targetId",
    "targetName",
    "locationName",
    "createdAt"
)
SELECT
    lower(hex(randomblob(16))),
    file."ownerId",
    'uploaded',
    'file',
    file."id",
    file."name",
    (SELECT folder."name" FROM "Folder" AS folder WHERE folder."id" = file."folderId"),
    file."createdAt"
FROM "File" AS file;

-- Backfill creation events for folders that already exist.
INSERT INTO "Activity" (
    "id",
    "ownerId",
    "action",
    "targetType",
    "targetId",
    "targetName",
    "locationName",
    "createdAt"
)
SELECT
    lower(hex(randomblob(16))),
    folder."ownerId",
    'created',
    'folder',
    folder."id",
    folder."name",
    (SELECT parent."name" FROM "Folder" AS parent WHERE parent."id" = folder."parentId"),
    folder."createdAt"
FROM "Folder" AS folder;
