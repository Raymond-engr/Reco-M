import { Router } from 'express';
import { getAiMovie } from '../controllers/aiSearch.controller';
import { validateSearchQuery } from '../../middleware/searchValidator';

const router = Router();

router.route('/')
  .get(validateSearchQuery, getAiMovie);

export default router;
