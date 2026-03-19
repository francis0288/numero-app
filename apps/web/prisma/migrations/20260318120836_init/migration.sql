-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "brandingFooter" TEXT,
    "defaultLanguage" TEXT NOT NULL DEFAULT 'en',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "birthCertName" TEXT NOT NULL,
    "currentName" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "shareToken" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reading" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "profileJSON" TEXT NOT NULL,
    "aiNarrative" TEXT,
    "editedNarrative" TEXT,
    "tone" TEXT NOT NULL DEFAULT 'warm',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reading_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "readingId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "question" TEXT,
    "answer" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_readingId_fkey" FOREIGN KEY ("readingId") REFERENCES "Reading" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Interpretation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numberKey" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "baseText" TEXT NOT NULL,
    "editedText" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_shareToken_key" ON "Client"("shareToken");

-- CreateIndex
CREATE UNIQUE INDEX "Interpretation_numberKey_locale_key" ON "Interpretation"("numberKey", "locale");
