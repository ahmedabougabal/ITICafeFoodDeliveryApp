import React from 'react';
import classes from './thumbnails.module.css'
import { Link } from 'react-router-dom';
import StarRating from '../StarRating/StarRating';
import Price from '../Price/Price';
import { Food } from '../../types/Food';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faHeart } from '@fortawesome/free-solid-svg-icons';

interface ThumbnailsProps {
  foods: Array<Food>; // Replace 'any' with a more specific type if you have one
}


const Thumbnails: React.FC<ThumbnailsProps> = ({ foods }) => {
  return (
    <ul className={classes.list}>

      {
        foods.map(food => (
          <li key={food.id}>
            <Link to={`/food/${food.id}`}>
              <img className={classes.image} src={`/foods/${food.imageUrl}`} alt={food.name} />

              <div className={classes.content}>
                <div className={classes.name}>{food.name}</div>
                <span className={`${classes.favourite} ${food.favourite ? '' : classes.not}`}>
                <FontAwesomeIcon icon={faHeart} />

            </span>
                <div className={classes.stars}>
                  <StarRating stars={food.stars} />
                </div>
                <div className={classes.product_item_footer}>
                  <div className={classes.origins}>
                    {
                      food.origins.map(origin =>
                        <span key={origin}>{origin}</span>

                      )
                    }
                  </div>
                  <div className={classes.cook_time}>
                    <span>🕐</span>
                    {food.cookTime}
                  </div>
                </div>
                <div className={classes.price}>
                  <Price price={food.price} />
                </div>
              </div>
            </Link>
          </li>
        ))
      }
    </ul>
  );
};

export default Thumbnails;