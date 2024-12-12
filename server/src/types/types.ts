export interface IMovies {
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