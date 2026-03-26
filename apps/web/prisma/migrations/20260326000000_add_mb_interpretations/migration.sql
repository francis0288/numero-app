-- CreateTable
CREATE TABLE "interpretations" (
    "id" SERIAL NOT NULL,
    "number_key" VARCHAR(10) NOT NULL,
    "category" VARCHAR(30) NOT NULL,
    "cat_vi" VARCHAR(50),
    "keywords_en" TEXT,
    "text_en" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interpretations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interpretations_number_key_category_key" ON "interpretations"("number_key", "category");
