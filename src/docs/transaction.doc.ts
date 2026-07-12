/**
 * @openapi
 * tags:
 *   name: Transactions
 *   description: User transaction histories and accounting ledger entries
 */

/**
 * @openapi
 * /api/transaction:
 *   get:
 *     summary: Get paginated transaction history
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (starts at 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by transaction status (e.g. pending, success, failed)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by transaction type (e.g. airtime, data, wallet_fund, wallet_transfer)
 *     responses:
 *       200:
 *         description: Transaction list and pagination metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       amount:
 *                         type: string
 *                       type:
 *                         type: string
 *                       status:
 *                         type: string
 *                       providerReference:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       ledgerEntries:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             amount:
 *                               type: string
 *                             description:
 *                               type: string
 *                             createdAt:
 *                               type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/transaction/{id}:
 *   get:
 *     summary: Get detailed transaction information by ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique transaction ID
 *     responses:
 *       200:
 *         description: Full transaction logs and detailed ledger distribution entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 amount:
 *                   type: string
 *                 type:
 *                   type: string
 *                 status:
 *                   type: string
 *                 providerReference:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 ledgerEntries:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       amount:
 *                         type: string
 *                       description:
 *                         type: string
 *                       sourceAccount:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           account_type:
 *                             type: string
 *                       destAccount:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           account_type:
 *                             type: string
 *                       createdAt:
 *                         type: string
 *       404:
 *         description: Transaction not found
 *       401:
 *         description: Unauthorized to view this transaction
 */
