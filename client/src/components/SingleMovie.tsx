import React from 'react';
import { useParams, Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';

interface Movie {
  Poster: string;
  Title: string;
  Plot: string;
  Year: string;
}

const SingleMovie: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isLoading, error, data: movie } = useFetch<Movie>(`&i=${id}`);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error.show) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">{error.msg}</h1>
        <Link to="/" className="bg-primary-5 text-white rounded px-4 py-2 tracking-sm">
          Back to Movies
        </Link>
      </div>
    );
  }

  const { Poster: poster, Title: title, Plot: plot, Year: year } = movie;

  return (
    <section className="grid gap-8 w-[90vw] max-w-screen-xl mx-auto my-16 sm:grid-cols-2">
      <img src={poster} alt={title} className="w-full block rounded" />
      <div>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-base text-grey-5 leading-8 mb-4">{plot}</p>
        <h4 className="text-lg font-medium">{year}</h4>
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
