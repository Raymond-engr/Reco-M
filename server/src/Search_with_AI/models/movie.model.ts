import mongoose, { Document, Schema } from 'mongoose';

export interface IMovie extends Document {
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
}

const MovieSchema: Schema<IMovie> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
      index: true,
    },
    poster: {
      type: String,
      required: [true, 'Poster is required'],
      trim: true,
      match: [
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,})([/\w.-]*)*\/?$/,
        'Please enter a valid URL for the poster',
      ],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    cast: {
      type: [String],
      required: [true, 'Cast is required'],
      index: true,
    },
    year_released: {
      type: String,
      required: [true, 'Year released is required'],
      trim: true,
      match: [/^(19|20)\d{2}$/, 'Please enter a valid year for the release'],
      index: true,
    },
    seasons: {
      type: String,
    },
    episode: {
      type: String,
    },
    time_duration: {
      type: String,
    },
    metadata: {
      source: { type: String },
      genres: { type: [String] },
      ratings: {
        type: [
          {
            source: { type: String, required: true },
            value: { type: String, required: true },
          },
        ],
      },
      lastUpdated: { type: Date, default: Date.now },
      popularity: { type: Number },
      languages: { type: [String] },
      ageRating: { type: String },
      keywords: { type: [String] },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IMovie>('Movie', MovieSchema, 'Rec-train');