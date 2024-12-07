import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Search History Schema
interface SearchHistorySchema {
  userId: string;         // To track user-specific search history
  query: string;          // Original user query
  movie: {
    name: string;
    poster: string; 
    description: string; 
    cast: string[]; 
    year_released: string;
    seasons?: string; 
    episode?: string; 
    time_duration?: string;
  };
  timestamp: Date;
  searchType: 'single' | 'selected';
}

// Mongoose Model for Search History
const SearchHistoryModel = mongoose.model<SearchHistorySchema>('SearchHistory', new mongoose.Schema<SearchHistorySchema>({
  userId: { type: String, required: true },
  query: { type: String, required: true },
  movie: {
    name: { type: String, required: true },
    poster: { type: String },
    description: { type: String },
    cast: { type: [String], default: [] },
    year_released: { type: String },
    seasons: { type: String },
    episode: { type: String },
    time_duration: { type: String }
  },
  timestamp: { type: Date, default: Date.now },
  searchType: { 
    type: String, 
    enum: ['single', 'selected'], 
    required: true 
  }
}));

// Search History Management Class
class SearchHistoryManager {
  private genAI: GoogleGenerativeAI;

  constructor() {
    // Initialize Gemini API
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  // Method to save search history for single movie result
  async saveSearchHistory(
    userId: string, 
    query: string, 
    movie: MovieSchema, 
    searchType: 'single' | 'selected'
  ): Promise<void> {
    try {
      // Validate input
      if (!userId || !query || !movie) {
        throw new Error('Incomplete search history data');
      }

      // Create and save search history entry
      const searchHistoryEntry = new SearchHistoryModel({
        userId,
        query,
        movie,
        searchType,
        timestamp: new Date()
      });

      await searchHistoryEntry.save();
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  // Method to retrieve user's search history
  async getUserSearchHistory(userId: string, limit: number = 10): Promise<SearchHistorySchema[]> {
    try {
      return await SearchHistoryModel.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit);
    } catch (error) {
      console.error('Error retrieving search history:', error);
      return [];
    }
  }

  // Method to clear user's search history
  async clearUserSearchHistory(userId: string): Promise<void> {
    try {
      await SearchHistoryModel.deleteMany({ userId });
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }
}

// Express Route Handlers for Search History
export const searchHistoryRoutes = (router: express.Router) => {
  const searchHistoryManager = new SearchHistoryManager();

  // Save search history (for frontend to call after selecting a movie)
  router.post('/save-search-history', async (req: Request, res: Response) => {
    try {
      const { userId, query, movie } = req.body;
      
      await searchHistoryManager.saveSearchHistory(
        userId, 
        query, 
        movie, 
        'selected'
      );

      res.status(200).json({ message: 'Search history saved successfully' });
    } catch (error) {
      console.error('Save search history error:', error);
      res.status(500).json({ error: 'Failed to save search history' });
    }
  });

  // Retrieve user's search history
  router.get('/search-history', async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const searchHistory = await searchHistoryManager.getUserSearchHistory(
        userId, 
        limit
      );

      res.status(200).json(searchHistory);
    } catch (error) {
      console.error('Retrieve search history error:', error);
      res.status(500).json({ error: 'Failed to retrieve search history' });
    }
  });

  // Clear user's search history
  router.delete('/search-history', async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;

      await searchHistoryManager.clearUserSearchHistory(userId);

      res.status(200).json({ message: 'Search history cleared successfully' });
    } catch (error) {
      console.error('Clear search history error:', error);
      res.status(500).json({ error: 'Failed to clear search history' });
    }
  });
};

// Integration with Previous Search Logic
class IntelligentMovieQueryHandler {
  // ... previous implementation ...

  // Modified processQuery method to handle search history for single results
  async processQuery(query: string, userId: string): Promise<MovieResponse> {
    const searchHistoryManager = new SearchHistoryManager();
    
    // Existing query processing logic...
    const result = await this.originalProcessQuery(query);

    // If single movie result, automatically save to search history
    if (result.type === 'single' && result.results.length > 0) {
      await searchHistoryManager.saveSearchHistory(
        userId, 
        query, 
        result.results[0], 
        'single'
      );
    }

    return result;
  }
}

export default SearchHistoryModel;