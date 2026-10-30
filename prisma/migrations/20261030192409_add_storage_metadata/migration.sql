-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_File" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameKey" TEXT NOT NULL,
    "storageProvider" TEXT NOT NULL DEFAULT 'local',
    "storageKey" TEXT NOT NULL,
    "storageUrl" TEXT,
    "storageFormat" TEXT,
    "storageResourceType" TEXT,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "ownerId" TEXT NOT NULL,
    "folderId" TEXT,
    "folderKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "File_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "File_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_File" ("createdAt", "folderId", "folderKey", "id", "mimeType", "name", "nameKey", "ownerId", "size", "storageKey") SELECT "createdAt", "folderId", "folderKey", "id", "mimeType", "name", "nameKey", "ownerId", "size", "storageKey" FROM "File";
DROP TABLE "File";
ALTER TABLE "new_File" RENAME TO "File";
CREATE UNIQUE INDEX "File_storageKey_key" ON "File"("storageKey");
CREATE INDEX "File_ownerId_folderId_idx" ON "File"("ownerId", "folderId");
CREATE UNIQUE INDEX "File_ownerId_folderKey_nameKey_key" ON "File"("ownerId", "folderKey", "nameKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
