/**
 * @openapi
 * tags:
 *   name: Payments
 *   description: Wallet deposits and payment gateway integration
 */

/**
 * @openapi
 * /api/payment/init:
 *   post:
 *     summary: Initiate a deposit to fund the wallet
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 100
 *                 maximum: 100000
 *                 example: 5000
 *     responses:
 *       201:
 *         description: Checkout session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 paymentUrl:
 *                   type: string
 *                   example: https://checkout.flutterwave.com/v3/hosted/pay/ref...
 *                 reference:
 *                   type: string
 *                   example: Luna-1688556633221-1234
 *       400:
 *         description: Invalid amount or validation error
 *       404:
 *         description: User wallet not found
 */

/**
 * @openapi
 * /api/payment/webhook:
 *   post:
 *     summary: Flutterwave payment webhook endpoint
 *     tags: [Payments]
 *     parameters:
 *       - in: header
 *         name: verif-hash
 *         required: true
 *         schema:
 *           type: string
 *         description: Flutterwave secret verification hash
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 example: charge.completed
 *               data:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 123456
 *                   tx_ref:
 *                     type: string
 *                     example: Luna-1688556633221-1234
 *                   flw_ref:
 *                     type: string
 *                     example: FLW-MOCK-12345
 *                   amount:
 *                     type: number
 *                     example: 5000
 *                   status:
 *                     type: string
 *                     example: successful
 *     responses:
 *       200:
 *         description: Webhook received and processed successfully
 *       401:
 *         description: Invalid signature hash
 */
