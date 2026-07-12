/**
 * @openapi
 * tags:
 *   name: Wallet
 *   description: User wallet management and peer-to-peer transfers
 */

/**
 * @openapi
 * /api/wallet:
 *   get:
 *     summary: Fetch user wallet account balances
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user wallet accounts and current balances
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   account_type:
 *                     type: string
 *                   balance:
 *                     type: string
 *                     example: "15000.00"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: No wallet accounts found
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/wallet/transfer:
 *   post:
 *     summary: Perform a peer-to-peer wallet-to-wallet transfer
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientEmail
 *               - amount
 *               - transactionPin
 *             properties:
 *               recipientEmail:
 *                 type: string
 *                 format: email
 *                 example: recipient@example.com
 *               amount:
 *                 type: number
 *                 minimum: 10
 *                 example: 2500
 *               transactionPin:
 *                 type: string
 *                 example: "1234"
 *               description:
 *                 type: string
 *                 example: Payment for dinner
 *     responses:
 *       200:
 *         description: Wallet transfer completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Wallet transfer completed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactionId:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     recipient:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *       400:
 *         description: Self-transfer, insufficient balance, or incorrect PIN
 *       404:
 *         description: Sender, recipient, or wallet not found
 *       401:
 *         description: Unauthorized
 */
