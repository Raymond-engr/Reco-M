import React from 'react';
import { Link } from 'react-router-dom';
import LazyLoad from 'react-lazyload';
import SkeletonLoader from './SkeletonLoader';

const placeholderImage =
  'https://upload.wikimedia.org/wikipedia/commons/f/fc/No_picture_available.png';

export interface Movie {
  imdbID: string;
  Poster: string;
  Title: string;
  Year: string;
}

const MovieCard: React.FC<{ movie: Movie }> = ({ movie }) => {
  const { imdbID: id, Poster: poster, Title: title, Year: year } = movie;

  return (
    <Link to={`/movies/${id}`} className="movie relative overflow-hidden rounded-lg shadow-lg group transition-all duration-300">
      <div className="movie-image relative">
        <LazyLoad height={400} offset={100}
        placeholder={<SkeletonLoader count={1} />}>
          <img
            src={poster === 'N/A' ? placeholderImage : poster}
            alt={title}
            className="w-full h-[300px] object-cover rounded-t-lg group-hover:scale-105 transition-transform"
          />
        </LazyLoad>
        <div className="movie-info absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent group-hover:translate-y-0 translate-y-full transition-all duration-300">
          <h4 className="text-white font-bold text-lg">{title}</h4>
          <p className="text-white text-sm">{year}</p>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;