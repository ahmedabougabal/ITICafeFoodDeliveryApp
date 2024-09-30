import React from 'react';

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface ThumbnailsProps {
  foods: Food[];
}

const Thumbnails: React.FC<ThumbnailsProps> = ({ foods }) => {
  return (
    <div className="thumbnails-container">
      {foods.map((food) => (
        <div key={food.id} className="food-item">
          <img src={food.image} alt={food.name} />
          <h3>{food.name}</h3>
          <p>{food.description}</p>
          <p>Price: ${food.price.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
};

export default Thumbnails;