import express from 'express';
import { AISearchController } from '../controllers/ai-search.controller';

export const setupAISearchRoutes = (app: express.Application) => {
  const router = express.Router();
  const aiSearchController = new AISearchController();

  // AI-powered search route
  router.post('/searchai', aiSearchController.aiSearch);

  // Attach the router to the main app
  app.use('/api', router);
};
