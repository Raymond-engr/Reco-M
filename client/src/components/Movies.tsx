import React from 'react';
import { Link } from 'react-router-dom';
import { useGlobalContext } from '../context/context';
import SkeletonLoader from './SkeletonLoader';
import MovieCard from './MovieCard';

const Movies: React.FC = () => {
  const { movies, isLoading, loadMore } = useGlobalContext();

  if (isLoading) {
    return <SkeletonLoader count={8} />;
  }

  return (
    <section className="movies grid gap-8 w-[90vw] max-w-screen-xl mx-auto pb-20 pt-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.isArray(movies) && (
        movies.map((movie) => (
          <Link
            to={`/movies/${movie.imdbID}`}
            key={movie.imdbID}
            className="block"
          >
            <MovieCard movie={movie} />
          </Link>
        ))
      )}
      <div className="w-full flex justify-center mt-8">
        <button
          onClick={loadMore}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Load More
        </button>
      </div>
    </section>
  );
};

export default Movies;