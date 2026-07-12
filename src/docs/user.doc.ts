/**
 * @openapi
 * tags:
 *   name: User Profile
 *   description: User profiles details and Transaction PIN management
 */

/**
 * @openapi
 * /api/user:
 *   get:
 *     summary: Get logged-in user profile details
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 displayName:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 role:
 *                   type: string
 *                 tier:
 *                   type: string
 *       401:
 *         description: Unauthorized / session expired
 */

/**
 * @openapi
 * /api/user:
 *   patch:
 *     summary: Update profile details
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Johnny
 *               lastName:
 *                 type: string
 *                 example: Smith
 *               displayName:
 *                 type: string
 *                 example: johnnysmith
 *               phone:
 *                 type: string
 *                 example: "08098765432"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       409:
 *         description: Display name or phone number already taken
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/user/password:
 *   patch:
 *     summary: Change user password
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: SecureOldPassword123!
 *               newPassword:
 *                 type: string
 *                 example: SecureNewPassword123!
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       409:
 *         description: Current password is incorrect
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/user/pin:
 *   post:
 *     summary: Set or configure transaction PIN
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pin
 *               - password
 *             properties:
 *               pin:
 *                 type: string
 *                 example: "1234"
 *                 pattern: "^\d{4}$"
 *               password:
 *                 type: string
 *                 example: UserAccountPassword123!
 *     responses:
 *       200:
 *         description: Transaction PIN configured successfully
 *       401:
 *         description: Incorrect account password / Unauthorized
 */
