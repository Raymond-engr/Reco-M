import { Router } from 'express';
import { getAiMovie } from '../controllers/aiSearch.controller.js';
import { validateSearchQuery } from '../../validators/search.validator.js';

const router = Router();

router.route('/')
  .get(validateSearchQuery, getAiMovie);

export default router;
