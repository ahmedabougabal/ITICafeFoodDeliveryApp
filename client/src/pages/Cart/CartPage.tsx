import classes from './cartpage.module.css';
import { useCart } from '../../hooks/useCart';
import { Title } from '../../components/Title/Title';
import { ConfigProvider, InputNumber, message } from 'antd';
import { Link } from 'react-router-dom';
import Price from '../../components/Price/Price';

export const CartPage = () => {
    const { cart, createOrder, changeQuantity, removeFromCart } = useCart();
    let counter=1

    const handleCheckout = async () => {
        try {
            await createOrder();
            message.success('Order placed successfully!');
        } catch (error: any) {
            console.error('Checkout error:', error);
            message.error(`Failed to place order: ${error.response?.data?.detail || error.message}`);
        }
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#ffbbbb',
                },
            }}
        >
            <Title title='Cart Page' margin='1.5rem 0 0 2.5rem' />

            {cart && cart.items.length > 0 ? (
                <div className={classes.container}>
                    <ul className={classes.list}>
                        {cart.items.map((item: any) => (
                            <li key={item.food.id}>
                                <span className={classes.cart_count}>{counter++}</span>
                                <div>
                                    <img src={`${item.food.image}`} alt={item.food.name} />
                                </div>
                                <div>
                                    <Link to={`/food/${item.food.id}`}>{item.food.name}</Link>
                                </div>
                                <div>
                                    <InputNumber
                                        min={1}
                                        max={10}
                                        value={item.quantity}
                                        onChange={(value) => changeQuantity(item, Number(value))}
                                    />
                                </div>
                                <div>
                                    <Price price={item.price} />
                                </div>
                                <div>
                                    <button className={classes.remove_button} onClick={() => removeFromCart(item.food.id)}>
                                        Remove
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className={classes.checkout}>
                        <div>
                            <div className={classes.food_count}>{cart.totalCount}</div>
                            <div className={classes.total_price}>
                                <Price price={cart.totalPrice} />
                            </div>
                        </div>
                        <button onClick={handleCheckout} className={classes.checkout_button}>
                            Proceed To Checkout
                        </button>
                    </div>
                </div>
            ) : (
                <div className={classes.empty_cart}>
                    <p>Your cart is empty.</p>
                    <Link to="/" className={classes.continue_shopping}>
                        Continue Shopping
                    </Link>
                </div>
            )}
        </ConfigProvider>
    );
};