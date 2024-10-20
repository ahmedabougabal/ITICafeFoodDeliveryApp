import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useUser } from '../../UserContext';
import { useFavorites } from '../../FavoritesContext';
import { toast } from 'react-toastify';
import AxiosInstance from "../../utils/AxiosInstance";
import ChatRoom from '../Chat/ChatRoom';
import styles from './header.module.css';
import { FaShoppingCart, FaHeart } from 'react-icons/fa';

const Header: React.FC = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const { favorites } = useFavorites();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [gradientAngle, setGradientAngle] = useState(135);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setGradientAngle((prevAngle) => (prevAngle + 1) % 360);
    }, 50);

    return () => clearInterval(intervalId);
  }, []);

  const toggleChat = () => setIsChatOpen(!isChatOpen);

  const handleLogout = async () => {
    try {
      const refresh = JSON.parse(localStorage.getItem('refresh_token') || '{}');
      await AxiosInstance.post('/logout', { refresh_token: refresh });
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      clearCart();
      navigate('/login');
      toast.warn("Logout successful");
    } catch (error) {
      toast.error("Logout failed.");
    }
  };

  const headerStyle = {
    background: `linear-gradient(${gradientAngle}deg, #f11d71 0%, #85122c 100%)`,
  };

   return (
    <header className={styles.header} style={headerStyle}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <Link to="/" className={styles.logo}>
            <FaShoppingCart className={styles.logoIcon} />
            <span>ITIFoods</span>
          </Link>
        </div>
        <nav className={styles.rightSection}>
          {user ? (
            <>
              <div className={styles.userMenu}>
                <button className={styles.userButton}>
                  {user.full_name}
                  <i className="bi bi-chevron-down"></i>
                </button>
                <ul className={styles.dropdown}>
                  <li><Link to="/profile">Profile</Link></li>
                  <li><Link to="/active-orders">Orders</Link></li>
                  <li><button onClick={handleLogout}>Log Out</button></li>
                </ul>
              </div>
              <Link to="/favorites" className={styles.favoritesLink}>
                <FaHeart />
                <span>Favorites</span>
                {favorites.length > 0 && (
                  <span className={styles.favoriteBadge}>{favorites.length}</span>
                )}
              </Link>
              <Link to="/cart" className={styles.cartLink}>
                <FaShoppingCart />
                <span>Cart</span>
                {cart.totalCount > 0 && (
                  <span className={styles.cartBadge}>{cart.totalCount}</span>
                )}
              </Link>
              <button onClick={toggleChat} className={styles.chatButton}>
                <i className="bi bi-chat-dots"></i>
                <span>Chat</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.authLink}>Login</Link>
              <Link to="/signup" className={styles.authLink}>Register</Link>
            </>
          )}
        </nav>
      </div>
      {isChatOpen && user && (
        <ChatRoom onClose={toggleChat} userEmail={user.email} />
      )}
    </header>
  );
};

export default Header;