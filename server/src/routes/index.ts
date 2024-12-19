import { Router } from 'express';
import aiSearch from '../Search_with_AI/routes/ai-search.routes.js';
import searchHistory from '../Search_with_AI/routes/searchHistory.route.js';

const router = Router();
/**
 * @openapi
 * /api/search:
 *   get:
 *     summary: Search for items
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: The search query string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 query:
 *                   type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.use('/aiSearch', aiSearch);
router.use('/search-history', searchHistory);

export default router;