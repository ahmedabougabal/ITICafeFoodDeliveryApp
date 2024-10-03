import React, { useEffect } from 'react';
import classes from './header.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import '../../App.css';
import { toast } from 'react-toastify'; // Assuming you're using 'react-toastify' for notifications
import AxiosInstance from '../../utils/AxiosInstance'; // Assuming AxiosInstance is configured for API requests

interface User {
  full_name: string;
  email: string;
}

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const { cart } = useCart();
  const navigate = useNavigate();

  // Logout handler function
  const handleLogout = async () => {
    try {
      const refresh = JSON.parse(localStorage.getItem('refresh_token') || '{}');
      await AxiosInstance.post('/logout', { refresh_token: refresh });
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      onLogout(); // Call the onLogout prop to update the user state
      navigate('/login');
      toast.warn("Logout successful");
    } catch (error) {
      toast.error("Logout failed.");
    }
  };

  // Effect to handle user state changes
  useEffect(() => {
    // If user is not null, reload or fetch the user profile
    if (user) {
      // Implement your profile fetching logic here if needed
      // For example, you could fetch user data from the server if it hasn't been loaded yet
      console.log("User is logged in, fetch profile if necessary.");
    }
  }, [user]); // This effect will run when the user state changes

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
                {/* Log Out link with handleLogout */}
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
