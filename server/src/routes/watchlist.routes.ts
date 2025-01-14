import { Router } from 'express';
import { validateRequests } from '../middleware/validateRequests.js';
import { authenticateToken, rateLimiter } from '../middleware/auth.middleware.js';
import { watchlistController } from '../controllers/watchlist.controller.js';
import { watchlistSchema } from '../validators/auth.validator.js';

const router = Router();

const standardLimit = rateLimiter(20, 15 * 60 * 1000);

router.get('/watchlist', 
  authenticateToken, 
  standardLimit,
  watchlistController.getWatchlist
);

router.post('/watchlist', 
  authenticateToken, 
  standardLimit,
  validateRequests(watchlistSchema),
  watchlistController.addToWatchlist
);

router.delete('/watchlist/:movieId', 
  authenticateToken, 
  standardLimit,
  watchlistController.removeFromWatchlist
);

export default router;