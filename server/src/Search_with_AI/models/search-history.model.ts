import mongoose, { Document, Schema } from 'mongoose';

export interface ISearchHistory extends Document {
  userId: string;
  query: string;
  //Shorten this entire movie section using only the  Imovies type instead of the entire field type
  movie: {
    name: string;
    poster: string; 
    description: string; 
    cast: string[]; 
    year_released: string;
    seasons?: string; 
    episode?: string; 
    time_duration?: string;
    metadata?: {
      source?: string;
      genres?: string[];
      ratings?: {
        source: string;
        value: string;
      }[];
      lastUpdated: Date;
      popularity?: number;
      languages?: string[];
      ageRating?: string;
      keywords?: string[];
    };
  };
  timestamp: Date;
  searchType: 'single' | 'selected';
}

const SearchHistorySchema: Schema<ISearchHistory> = new Schema({
  userId: { 
    type: String, 
    required: [true, 'User ID is required'],
    trim: true 
  },
  query: { 
    type: String, 
    required: [true, 'Search query is required'],
    trim: true,
    maxlength: [200, 'Search query cannot be more than 200 characters']
  },
  movie: {
    name: { 
      type: String, 
      required: [true, 'Movie name is required'],
      trim: true,
      maxlength: [100, 'Movie name cannot be more than 100 characters']
    },
    poster: { 
      type: String,
      trim: true,
      match: [
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,})([/\w.-]*)*\/?$/,
        'Please enter a valid URL for the poster'
      ]
    },
    description: { 
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    cast: { 
      type: [String], 
      default: [] 
    },
    year_released: { 
      type: String,
      trim: true,
      match: [/^(19|20)\d{2}$/, 'Please enter a valid year for the release']
    },
    seasons: { type: String },
    episode: { type: String },
    time_duration: { type: String },
    metadata: {
      source: { type: String },
      genres: { type: [String] },
      ratings: {
        type: [{
          source: { type: String, required: true },
          value: { type: String, required: true }
        }]
      },
      lastUpdated: { type: Date, default: Date.now },
      popularity: { type: Number },
      languages: { type: [String] },
      ageRating: { type: String },
      keywords: { type: [String] }
    }
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  searchType: { 
    type: String, 
    enum: ['single', 'selected'], 
    required: [true, 'Search type is required'] 
  }
}, { timestamps: true }); 

export default mongoose.model<ISearchHistory>('SearchHistory', SearchHistorySchema, 'Search-History');