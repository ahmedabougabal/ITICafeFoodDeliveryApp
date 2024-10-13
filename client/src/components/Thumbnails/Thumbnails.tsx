import React from 'react';
import {useCart} from "../../hooks/useCart.tsx";
import classes from "./thumbnails.module.css"

interface Branch {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface Food {
  id: number;
  name: string;
  price: number | string;
  description: string;
  category: Category;
  image: string;
  branch: Branch;
  is_available: boolean;
  stock: number;
  calories: number;
  allergens: string;
  time_availability_start: string;
  time_availability_end: string;
  order_count: number;
}

interface ThumbnailsProps {
  foods: Food[];
}

const Thumbnails: React.FC<ThumbnailsProps> = ({ foods }) => {
  const { addToCart } = useCart(); // Assuming this hook provides addToCart function

  if (!Array.isArray(foods) || foods.length === 0) {
    return <div>No foods available</div>;
  }

  return (
    <div className={classes.list}>
      {foods.map((food) => (
        <div key={food.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          {food.image && (
            <img src={food.image} alt={food.name} className="w-full h-48 object-cover" />
          )}
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2">{food.name}</h3>
            <p className="text-gray-600 mb-2">${Number(food.price).toFixed(2)}</p>
            <p className="text-sm text-gray-500 mb-2">{food.description}</p>
            <p className="text-sm text-gray-500 mb-1">Category: {food.category.name}</p>
            <p className="text-sm text-gray-500 mb-1">Branch: {food.branch.name}</p>
            <p className="text-sm text-gray-500 mb-1">
              Available: {food.is_available ? 'Yes' : 'No'}
            </p>
            <p className="text-sm text-gray-500 mb-1">Stock: {food.stock}</p>
            <p className="text-sm text-gray-500 mb-1">Calories: {food.calories}</p>
            {food.allergens && (
              <p className="text-sm text-gray-500 mb-2">Allergens: {food.allergens}</p>
            )}
            <button
              onClick={() => addToCart(food)}
              className={classes.button}
            >
              Add to Cart
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Thumbnails;