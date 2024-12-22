import React from 'react';
import { useParams, Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';

export interface Movie {
  Poster: string;
  Title: string;
  Plot: string;
  Year: string;
  Genre: string;
  Director: string;
  Actors: string;
  Ratings: Array<{ Source: string; Value: string }>;
}

const placeholderImage =
  'https://upload.wikimedia.org/wikipedia/commons/f/fc/No_picture_available.png';

const SingleMovie: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isLoading, error, data: movie } = useFetch(`&i=${id}`);

  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (error.show) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">{error.msg}</h1>
        <p className="text-sm mb-4">The movie could not be found. Please check the ID or try again later.</p>
        <Link to="/" className="bg-primary-5 text-white rounded px-4 py-2 tracking-sm">
          Back to Movies
        </Link>
      </div>
    );
  }

  if (!movie || Array.isArray(movie)) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">Movie not found</h1>
        <p className="text-sm mb-4">The movie could not be found. Please check the ID or try again later.</p>
        <Link to="/" className="bg-primary-5 text-white rounded px-4 py-2 tracking-sm">
          Back to Movies
        </Link>
      </div>
    );
  }

  const { Poster: poster, Title: title, Plot: plot, Year: year, Genre: genre, Director: director, Actors: actors, Ratings: ratings } = movie;

  return (
    <section className="grid gap-8 w-[90vw] max-w-screen-xl mx-auto my-16 sm:grid-cols-2 xl:grid-cols-3">
      <img
        src={poster === 'N/A' ? placeholderImage : poster}
        alt={title}
        className="w-full block rounded-lg"
      />
      <div className="movie-details space-y-4">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-base text-gray-500 leading-8 mb-4">{plot}</p>
        <div className="flex flex-wrap gap-4">
          <span className="bg-blue-100 text-blue-800 rounded px-3 py-1">{year}</span>
          <span className="bg-green-100 text-green-800 rounded px-3 py-1">{genre}</span>
        </div>
        <h4 className="text-lg font-medium">Directed by: {director}</h4>
        <h4 className="text-lg font-medium">Starring: {actors}</h4>
        <div className="ratings mt-4">
          {ratings.map((rating) => (
            <div key={rating.Source} className="flex justify-between">
              <span className="font-semibold">{rating.Source}:</span>
              <span>{rating.Value}</span>
            </div>
          ))}
        </div>
        <Link
          to="/"
          className="bg-primary-5 text-white rounded px-4 py-2 mt-4 inline-block tracking-sm"
        >
          Back to Movies
        </Link>
      </div>
    </section>
  );
};

export default SingleMovie;