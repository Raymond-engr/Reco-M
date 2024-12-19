import React from 'react';
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
  const { movies, isLoading } = useGlobalContext();

  if (isLoading) {
    return <div className="loading" />;
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
              <img
                src={poster === 'N/A' ? placeholderImage : poster}
                alt={title}
                className="w-full h-[400px] object-cover"
              />
              <div className="movie-info absolute bottom-0 left-0 w-full p-2 bg-black bg-opacity-60 translate-y-full transition-transform duration-300">
                <h4 className="text-white font-bold">{title}</h4>
                <p className="text-white text-sm">{year}</p>
              </div>
            </article>
          </Link>
        );
      })}
    </section>
  );
};

export default Movies;
