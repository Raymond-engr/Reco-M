import { Router } from 'express';
import { getAiMovie } from '../controllers/aiSearch.controller.js';
import { validateSearchQuery } from '../../middleware/searchValidator.js';

const router = Router();

router.route('/')
  .get(validateSearchQuery, getAiMovie);

export default router;
