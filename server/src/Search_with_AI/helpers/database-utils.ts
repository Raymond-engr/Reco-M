import MovieModel from '../models/movie.model.js';
import SearchHistoryModel from '../models/search-history.model.js';

export const createIndexes = async () => {
  try {
    // Movie collection indexes
    await MovieModel.collection.createIndexes([
      { 
        name: 'name_text_description_text', 
        key: { name: 'text', description: 'text' } 
      },
      { key: { year_released: 1 } },
      { key: { cast: 1 } }
    ]);

    // Search History collection indexes
    await SearchHistoryModel.collection.createIndexes([
      { key: { userId: 1, timestamp: -1 } },
      { key: { timestamp: 1 }, expireAfterSeconds: 30 * 24 * 60 * 60 } // 30 days retention
    ]);

    console.log('Indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};
