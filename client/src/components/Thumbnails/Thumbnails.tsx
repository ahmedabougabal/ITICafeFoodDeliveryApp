import React, { useState } from 'react';
import { useCart } from "../../hooks/useCart.tsx";
import { ShoppingCart } from 'lucide-react';

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
        <p className="text-gray-600 mb-2">${Number(food.price).toFixed(2)}</p>
        {food.is_available ? (
          <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full mb-2">Available</span>
        ) : (
          <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded-full mb-2">Unavailable</span>
        )}
        <button
          onClick={() => addToCart(food)}
          className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors flex items-center justify-center"
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
      {foods.map((food) => (
        <FoodCard key={food.id} food={food} />
      ))}
    </div>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center">
          <div className="w-full md:w-1/3 text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-2xl font-bold">ITICofeFood</h2>
            <p className="mt-2">Delicious food at your fingertips</p>
          </div>
          <div className="w-full md:w-1/3 text-center mb-6 md:mb-0">
            <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
            <ul>
              <li><a href="#" className="hover:text-gray-300">Home</a></li>
              <li><a href="#" className="hover:text-gray-300">Menu</a></li>
              <li><a href="#" className="hover:text-gray-300">About Us</a></li>
              <li><a href="#" className="hover:text-gray-300">Contact</a></li>
            </ul>
          </div>
          <div className="w-full md:w-1/3 text-center md:text-right">
            <h3 className="text-lg font-semibold mb-2">Follow Us</h3>
            <div className="flex justify-center md:justify-end space-x-4">
              <a href="#" className="hover:text-gray-300"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="hover:text-gray-300"><i className="fab fa-twitter"></i></a>
              <a href="#" className="hover:text-gray-300"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p>&copy; 2024 ITICofeFood. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export { Thumbnails, Footer };