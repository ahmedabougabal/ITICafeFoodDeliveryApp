import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const EmptyCart = () => {
  const [videoError, setVideoError] = useState(false);

  // Handle video loading errors
  const handleVideoError = () => {
    console.error('Error loading video');
    setVideoError(true);
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <div className="relative w-64 mb-8">
        {!videoError ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full rounded-lg"
            style={{ maxWidth: '250px' }}
            onError={handleVideoError}
          >
            <source src="/cleanDuck.gif" type="image/gif" />
            {/* Fallback text */}
            <img
              src="/cleanDuck.gif"
              alt="Animated duck"
              className="w-full h-full rounded-lg"
            />
          </video>
        ) : (
          // Fallback image if video fails
          <img
            src="/cleanDuck.gif"
            alt="Animated duck doing house chores lol"
            className="w-full h-full rounded-lg"
          />
        )}
      </div>

      <div className="text-center max-w-md mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Those bugs make you hungry, I know! Why not order some food? Debugging can't be easier!
        </h2>

        <p className="text-gray-600 leading-relaxed">
          Your cart is empty! Discover our mouthwatering selection of dishes
          and treat yourself to something special today. Your taste buds (and your code) will thank you!
        </p>
      </div>

      <Link
        to="/"
        className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white
                  transition-all duration-300 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full
                  hover:from-pink-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-pink-400
                  focus:ring-offset-2 shadow-md hover:shadow-lg"
      >
        <span className="relative">Explore Menu</span>
      </Link>
    </div>
  );
};

export default EmptyCart;