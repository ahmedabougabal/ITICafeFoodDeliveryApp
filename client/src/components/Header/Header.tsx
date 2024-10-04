import React from 'react';
import classes from './header.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import {useUser} from '../../UserContext';
import '../../App.css';
import { toast } from 'react-toastify';
// client/src/utils/AxiosInstance.jsx
import AxiosInstance from "../../utils/AxiosInstance";

const Header: React.FC = () => {
  const { cart } = useCart();
  const navigate = useNavigate();
  const { user, setUser } = useUser(); // Use the user and setUser from context

  const handleLogout = async () => {
    try {
      const refresh = JSON.parse(localStorage.getItem('refresh_token') || '{}');
      await AxiosInstance.post('/logout', { refresh_token: refresh });
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null); // Update the user in context
      navigate('/login');
      toast.warn("Logout successful");
    } catch (error) {
      toast.error("Logout failed.");
    }
  };


  return (
    <header className={classes.header}>
      <div className={classes.container}>
        <Link to="/" className={classes.logo}>
          ITIFoods
        </Link>
        <ul>
          {user ? (
            <li className={classes.menu_container}>
              <Link to="#">{user.full_name}</Link>
              <div className={classes.menu}>
                <Link to="/profile">Profile</Link>
                <Link to="/orders">Orders</Link>
                <a onClick={handleLogout} className={classes.logout}>
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
