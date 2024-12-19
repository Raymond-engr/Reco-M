import { Router } from 'express';
import { saveSearchHistory, getSearchHistory, clearSearchHistory } from '../controllers/searchHistory.controller.js';

const router = Router();

router.route('/save').post(saveSearchHistory);
router.route('/').get(getSearchHistory).delete(clearSearchHistory);

export default router;