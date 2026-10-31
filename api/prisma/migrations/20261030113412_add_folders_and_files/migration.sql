-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameKey" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "parentId" TEXT,
    "parentKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Folder_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Folder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameKey" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "ownerId" TEXT NOT NULL,
    "folderId" TEXT,
    "folderKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "File_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "File_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Folder_ownerId_parentId_idx" ON "Folder"("ownerId", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Folder_ownerId_parentKey_nameKey_key" ON "Folder"("ownerId", "parentKey", "nameKey");

-- CreateIndex
CREATE UNIQUE INDEX "File_storageKey_key" ON "File"("storageKey");

-- CreateIndex
CREATE INDEX "File_ownerId_folderId_idx" ON "File"("ownerId", "folderId");

-- CreateIndex
CREATE UNIQUE INDEX "File_ownerId_folderKey_nameKey_key" ON "File"("ownerId", "folderKey", "nameKey");
