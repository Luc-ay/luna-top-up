/**
 * @openapi
 * tags:
 *   name: VTU Services
 *   description: Mobile top-up services, product listings, and purchasing
 */

/**
 * @openapi
 * /api/vtu:
 *   get:
 *     summary: Get all active VTU categories
 *     tags: [VTU Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   flwId:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   code:
 *                     type: string
 *                   description:
 *                     type: string
 *                   isActive:
 *                     type: boolean
 */

/**
 * @openapi
 * /api/vtu/{categoryCode}:
 *   get:
 *     summary: Get active billers for a category
 *     tags: [VTU Services]
 *     parameters:
 *       - in: path
 *         name: categoryCode
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique category code (e.g. airtime, internet)
 *     responses:
 *       200:
 *         description: List of category billers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   flwId:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   biller_code:
 *                     type: string
 *                   description:
 *                     type: string
 *                   short_name:
 *                     type: string
 *                   logo:
 *                     type: string
 *       404:
 *         description: Category code not found
 */

/**
 * @openapi
 * /api/vtu/bill/{flwId}:
 *   get:
 *     summary: Fetch specific items/packages for a biller from Flutterwave
 *     tags: [VTU Services]
 *     parameters:
 *       - in: path
 *         name: flwId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Flutterwave unique biller ID
 *     responses:
 *       200:
 *         description: Biller data packages and item plans retrieved successfully
 *       404:
 *         description: Biller not found
 */

/**
 * @openapi
 * /api/vtu/purchase:
 *   post:
 *     summary: Execute a VTU purchase (Airtime, Data, etc.)
 *     tags: [VTU Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - flwId
 *               - amount
 *               - phoneNumber
 *               - transactionPin
 *             properties:
 *               flwId:
 *                 type: integer
 *                 example: 1
 *                 description: The unique Flutterwave ID of the biller
 *               itemCode:
 *                 type: string
 *                 example: MD404
 *                 description: Required for Data bundles/fixed utility bill packages
 *               amount:
 *                 type: number
 *                 minimum: 50
 *                 example: 1000
 *               phoneNumber:
 *                 type: string
 *                 example: "08012345678"
 *               transactionPin:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Purchase completed successfully (or marked as processing)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: VTU purchase completed successfully
 *                 reference:
 *                   type: string
 *                   example: Luna-VTU-1688556633221-5678
 *                 providerReference:
 *                   type: string
 *                   example: FLW-MOCK-998877
 *                 status:
 *                   type: string
 *                   example: SUCCESS
 *       400:
 *         description: Insufficient wallet balance, incorrect transaction PIN, or failed provider call
 *       404:
 *         description: Product, category, or user wallet not found
 */
