import React, { useEffect, useState } from 'react';
import classes from './foodpage.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import { getById } from '../../services/FoodService';
import { Food } from '../../types/Food';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import StarRating from '../../components/StarRating/StarRating';
import Price from '../../components/Price/Price';
import { useCart } from '../../hooks/useCart';

const FoodPage: React.FC = () => {
    const [food, setFood] = useState<Food|null>(null);
    const { id } = useParams<{ id: string }>();
    const {addToCart} = useCart()
    const nav = useNavigate();

    // const handleAddToCart = ()=>{
    //     addToCart(food)
    //     nav('/cart')
    // }

    // console.log('Food ID from URL:', id); 

    const handleAddToCart = () => {
        if (food && food.stock > 0) {
            addToCart(food);
            nav('/cart');
        }
    };

    // useEffect(() => {
    //     const fetchFood = async () => {
    //         console.log('Fetching food with ID:', id);
    //         try {
    //             const fetchedFood = await getById(id);
    //             console.log('Fetched Food:', fetchedFood); 
    //             if (fetchedFood) {
    //                 setFood({ ...fetchedFood, id: fetchedFood.id });
    //             } else {
    //                 console.warn('No food found with the given ID:', id); 
    //             }
    //         } catch (error) {
    //             console.error('Error fetching food:', error); 
    //         }
    //     };

    //     fetchFood();
    // }, [id]);

    useEffect(() => {
        const fetchFood = async () => {
            const fetchedFood = await getById(id);
            console.log('Fetched Food:', fetchedFood);
            if (fetchedFood) setFood({ ...fetchedFood, id: fetchedFood.id });
        };
    
        fetchFood();
    }, [id]);
    
    if (!food) {
        return <div>Loading...</div>;
    }

    const isOutOfStock = food.stock === 0; 

    return (
        <div className={classes.container}>
            <img 
            className={classes.image}
            src={`/foods/${food.imageUrl}`}
            alt={food.name}/>
            <div className={classes.details}>
                <div className={classes.header}>
                    <span className={classes.name}>{food.name}</span>
                    <span className={`${classes.favourite} ${food.favourite? '' : classes.not}`}>
                    <FontAwesomeIcon icon={faHeart} />
                    </span>
                </div>
                <div className={classes.rating}>
                    <StarRating stars={food.stars}  size={25}/>

                </div>
                <div className={classes.origins}>
                    {
                        food.origins?.map(origin=> (
                            <span key={origin}>{origin}</span>
                        ))
                    }
                </div>
                <div className={classes.cook_time}>
                    <span>
                        Time to cook about <strong>{food.cookTime} </strong>minutes
                    </span>
                </div>
                <div className={classes.price}>
                    <Price price={food.price} />
                </div>

                {/* <button onClick={handleAddToCart}>Add To Cart</button> */}
                <button 
                    onClick={handleAddToCart} 
                    disabled={isOutOfStock} 
                    className={isOutOfStock ? classes.disabled : ''}
                >
                    {isOutOfStock ? "Out of Stock" : "Add To Cart"}
                </button>

            </div>

        </div>
    );
};

export default FoodPage;
