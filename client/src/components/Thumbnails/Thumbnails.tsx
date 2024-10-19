import React, { useState } from 'react';
import { useCart } from "../../hooks/useCart.tsx";
import { ShoppingCart } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  const notify = () => {
    toast.success(`${food.name} added to cart!`, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
    addToCart(food);
  };

  return (
    <div
      className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={food.image}
        alt={food.name}
        className="w-full h-48 object-cover transition-all duration-300 ease-in-out"
        style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out opacity-0 hover:opacity-100 flex items-center justify-center">
        <div className="text-white text-center p-4">
          <p className="font-bold">{food.category.name}</p>
          <p>Calories: {food.calories}</p>
          <p>Allergens: {food.allergens}</p>
        </div>
      </div>
      <div className="p-4 bg-white">
        <h3 className="font-bold text-lg mb-2">{food.name}</h3>
        <p className="text-gray-600 mb-2">EGP {Number(food.price).toFixed(2)}</p>
        {food.is_available ? (
          <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full mb-2">Available</span>
        ) : (
          <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded-full mb-2">Unavailable</span>
        )}
        <button
          onClick={notify}
          className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors flex items-center justify-center"
          disabled={!food.is_available}
        >
          <ShoppingCart className="mr-2" size={16} />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

const Thumbnails: React.FC<ThumbnailsProps> = ({ foods }) => {
  if (!Array.isArray(foods) || foods.length === 0) {
    return <div>No foods available</div>;
  }

  return (
    <div className="relative">
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