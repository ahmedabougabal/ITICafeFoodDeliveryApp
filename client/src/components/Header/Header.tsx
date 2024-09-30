import React from 'react';
import classes from './header.module.css';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import '../../App.css'
interface User {
  name: string;
}

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const { cart } = useCart();

  return (
    <header className={classes.header}>
      <div className={classes.container}>
        <Link to="/" className={classes.logo}>
          ITIFoods
        </Link>
        <ul>
          {user ? (
            <li className={classes.menu_container}>
              <Link to="/profile">{user.name}</Link>
              <div className={classes.menu}>
                <Link to="/profile">Profile</Link>
                <Link to="/orders">Orders</Link>
                <a onClick={onLogout} className={classes.logout}>
                  Log Out
                </a>
              </div>
            </li>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/signup">Register</Link></li>
            </>
          )}
          <li>
            <Link to="/cart">
              Cart
              {cart.totalCount > 0 && (
                <span className={classes.cart_count}>{cart.totalCount}</span>
              )}
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
