import React from 'react';
import { useGlobalContext } from '../context/context';

const SearchForm: React.FC = () => {
  const { query, setQuery, error } = useGlobalContext();

  return (
    <form
      className="w-[90vw] max-w-screen-xl mx-auto mt-20 mb-12"
      onSubmit={(e) => e.preventDefault()}
    >
      <h2 className="text-xl font-semibold mb-4">Search Movies</h2>
      <input
        type="text"
        className="w-full max-w-[600px] bg-white text-grey-3 p-4 text-base rounded border-none tracking-sm"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter movie name..."
      />
      {error.show && (
        <div className="text-red-dark capitalize pt-2 tracking-sm">
          {error.msg}
        </div>
      )}
    </form>
  );
};

export default SearchForm;
