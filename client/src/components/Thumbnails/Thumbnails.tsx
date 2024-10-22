import React, { useState } from 'react';
import { useCart } from "../../hooks/useCart";
import { ShoppingCart, Heart } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useFavorites } from '../../FavoritesContext';

interface Food {
  id: number;
  name: string;
  price: number | string;
  description: string;
  category: { name: string };
  image: string;
  branch: { name: string };
  is_available: boolean;
  stock: number;
  calories: number;
  allergens: string;
}

interface ThumbnailsProps {
  foods: Food[];
}

const FoodCard: React.FC<{ food: Food }> = ({ food }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const isFavorite = favorites.includes(food.id);

  const notify = (message: string) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  const handleAddToCart = () => {
    addToCart(food);
    notify(`${food.name} added to cart!`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite) {
      removeFromFavorites(food.id);
      notify('Removed from favorites');
    } else {
      addToFavorites(food.id);
      notify('Added to favorites');
    }
  };

  return (
    <div
      className="relative flex flex-col h-[400px] rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={handleFavoriteClick}
        className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-all duration-200"
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart
          size={16}
          className={`transition-colors duration-200 ${
            isFavorite ? 'fill-red-500 stroke-red-500' : 'stroke-gray-400'
          }`}
        />
      </button>

      {/* Rest of the component remains the same */}
      <div className="relative h-48 overflow-hidden rounded-t-xl">
        <img
          src={food.image}
          alt={food.name}
          className="w-full h-full object-cover transition-transform duration-300 ease-in-out"
          style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out opacity-0 hover:opacity-100 flex items-center justify-center">
          <div className="text-white text-center p-4">
            <p className="font-bold">{food.category.name}</p>
            <p>Calories: {food.calories}</p>
            <p>Allergens: {food.allergens}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-grow p-6">
        <h3 className="font-bold text-xl mb-2 text-gray-800">{food.name}</h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2 flex-grow">{food.description}</p>
        <div className="space-y-3">
          <p className="text-gray-600 font-medium">EGP {Number(food.price).toFixed(2)}</p>
          <div className="flex items-center gap-2">
            {food.is_available ? (
              <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Available
              </span>
            ) : (
              <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                Unavailable
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="w-full bg-red-500 text-white px-4 py-2.5 rounded-md hover:bg-red-600 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            // disabled={!food.is_available}
            disabled={food.stock <= 0} // Disable if stock is 0
          >
            <ShoppingCart className="mr-2" size={16} />
            {food.stock > 0 ? "Add to Cart" : "Out of Stock"}
            {/* Add to Cart */}
          </button>
        </div>
      </div>
    </div>
  );
};

const Thumbnails: React.FC<ThumbnailsProps> = ({ foods }) => {
  if (!Array.isArray(foods) || foods.length === 0) {
    return <div>No foods available</div>;
  }

  return (
    <div className="relative min-h-screen pb-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
        {foods.map((food) => (
          <FoodCard key={food.id} food={food} />
        ))}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export { Thumbnails };