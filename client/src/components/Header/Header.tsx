import React from 'react'
import classes from './header.module.css'
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
const Header = () => {
  const logout = function(){
    console.log('logout!');
    
  }
  const user={
    name:'John'
  };

  
  const {cart} = useCart();
  return (
    <header className={classes.header}>
      <div className={classes.container}>
        <Link to="/" className={classes.logo}>
        ITIFoods
        </Link>
        <ul>
          {
            user?(
              <li className={classes.menu_container}>
                <Link to="/profile">{user.name}</Link>
                <div className={classes.menu}>
                  <Link to="/profile">Profile</Link>
                  <Link to="/orders">Orders</Link>
                  <a onClick={logout}>Log Out</a>
                </div>
              </li>
            ):(
              <Link to="/login">Login</Link>
            )
          }
          <li>
            <Link to="/cart">
            Cart
            {cart.totalCount>0 && <span className={classes.cart_count}>{cart.totalCount}</span>}
            </Link>
          </li>
        </ul>
      </div>
    </header>
  )
}

export default Header