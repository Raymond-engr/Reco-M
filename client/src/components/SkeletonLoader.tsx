import React from 'react';

const SkeletonLoader: React.FC<{ count: number }> = ({ count }) => {
  return (
    <div className="skeleton-grid grid gap-8 w-[90vw] max-w-screen-xl mx-auto pb-20 pt-12">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="skeleton-card w-full h-[400px] bg-gray-300 dark:bg-gray-700 rounded animate-pulse"
        ></div>
      ))}
    </div>
  );
};

export default SkeletonLoader;