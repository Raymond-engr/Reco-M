import React from 'react';
import LazyLoad from 'react-lazyload';
import SkeletonLoader from './SkeletonLoader';
import { Link } from 'react-router-dom';
import { useGlobalContext } from '../context/context';

const placeholderImage =
  'https://upload.wikimedia.org/wikipedia/commons/f/fc/No_picture_available.png';

export interface Movie {
  imdbID: string;
  Poster: string;
  Title: string;
  Year: string;
}

const Movies: React.FC = () => {
  const { movies, isLoading, loadMore } = useGlobalContext();

  if (isLoading) {
  return <SkeletonLoader count={8} />;
}

  return (
    <section className="movies grid gap-8 w-[90vw] max-w-screen-xl mx-auto pb-20 pt-12">
      {movies?.map((movie: Movie) => {
        const { imdbID: id, Poster: poster, Title: title, Year: year } = movie;

        return (
          <Link
            to={`/movies/${id}`}
            key={id}
            className="movie relative overflow-hidden rounded shadow-light hover:shadow-dark"
          >
            <article>
            <LazyLoad height={400} offset={100}>
              <img
                src={poster === 'N/A' ? placeholderImage : poster}
                alt={title}
                className="w-full h-[400px] object-cover"
              />
              </LazyLoad>
              <div className="movie-info absolute bottom-0 left-0 w-full p-2 bg-black bg-opacity-60 translate-y-full transition-transform duration-300">
                <h4 className="text-white font-bold">{title}</h4>
                <p className="text-white text-sm">{year}</p>
              </div>
            </article>
          </Link>
        );
      })}
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
