import React from 'react'
import classes from './cartpage.module.css'
import { useCart } from '../../hooks/useCart';
import { Title } from '../../components/Title/Title';
import { ConfigProvider, InputNumber } from 'antd';
import { Food } from '../../types/Food';
import { Link } from 'react-router-dom';
import Price from '../../components/Price/Price';
export const CartPage = () => {
    const {cart,removeFromCart,changeQuantity} = useCart();
  return (
    <ConfigProvider
    theme={{
      token: {
        // Seed Token
        colorPrimary: '#ffbbbb',
        

        
      },
    }}
  >
    <Title title='Cart Page' margin='1.5rem 0 0 2.5rem' />
    
    
            {cart&&cart.items.length>0&&
            <div className={classes.container}>
                <ul className={classes.list}>
                    {
                        cart.items.map((item:any) => (
                            <li key={item.food.id}>
                                <div>
                                    <img src={`/foods/${item.food.imageUrl}`} alt={item.food.name} />
                                </div>
                                <div>
                                    <Link to={`/food/${item.food.id}`}>{item.food.name}</Link>
                                </div>
                                <div>
                                <InputNumber min={1} max={10} color='#ffbbbb'  value={item.quantity} onChange={e=>changeQuantity(item,Number(e))} />
                                </div>
                                <div>
                                    <Price price={item.price} />
                                </div>
                                <div>
                                    <button className={classes.remove_button} onClick={()=>removeFromCart(item.food.id)}>
                                        Remove
                                    </button>
                                </div>
                            </li>
                        ))
                    }
                </ul>
                <div className={classes.checkout}>
                    <div>
                        <div className={classes.food_count}>{cart.totalCount}</div>
                        <div className={classes.total_price}>
                            <Price price={cart.totalPrice} />
                        </div>
                    </div>
                    <Link to="/checkouot">Proceed To Checkout</Link>
                </div>
            </div>
           }
        
    
        </ConfigProvider>
  )
}
