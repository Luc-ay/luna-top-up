-- CreateTable
CREATE TABLE "vtu_categories" (
    "id" TEXT NOT NULL,
    "flwId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vtu_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vtu_billers" (
    "id" TEXT NOT NULL,
    "billerCode" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "fee" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "markupPercent" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vtu_billers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vtu_categories_flwId_key" ON "vtu_categories"("flwId");

-- CreateIndex
CREATE UNIQUE INDEX "vtu_categories_code_key" ON "vtu_categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "vtu_billers_billerCode_itemCode_key" ON "vtu_billers"("billerCode", "itemCode");

-- AddForeignKey
ALTER TABLE "vtu_billers" ADD CONSTRAINT "vtu_billers_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "vtu_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
