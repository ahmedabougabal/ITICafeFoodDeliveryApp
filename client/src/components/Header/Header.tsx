
import React, { useState, useEffect } from 'react';
import classes from './header.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useUser } from '../../UserContext';
import { toast } from 'react-toastify';
import AxiosInstance from "../../utils/AxiosInstance";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import ChatRoom from '../Chat/ChatRoom';



const Header: React.FC = () => {
  const { cart} = useCart(); // Make sure to implement clearCart in your cart context
  const navigate = useNavigate();
  const { user, setUser } = useUser(); // Use the user and setUser from context
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleLogout = async () => {
    try {
      const refresh = JSON.parse(localStorage.getItem('refresh_token') || '{}');
      await AxiosInstance.post('/logout', { refresh_token: refresh });
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      clearCart(); // Clear the cart when logging out
      navigate('/login');
      toast.warn("Logout successful");
    } catch (error) {
      toast.error("Logout failed.");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link to="/" className="navbar-brand">ITIFoods</Link>
          <ul className="navbar-nav ms-auto">
            {user ? (
              <>
                <li className="nav-item dropdown">
                  <Link to="#" className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    {user.full_name}
                  </Link>
                  <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                    <li><Link to="/profile" className="dropdown-item">Profile</Link></li>
                    <li><Link to="/active-orders" className="dropdown-item">Orders</Link></li>
                    <li><a onClick={handleLogout} className="dropdown-item" style={{ cursor: 'pointer' }}>Log Out</a></li>
                  </ul>
                </li>
                {/* Cart link appears only when the user is logged in */}
                <li className="nav-item">
                  <Link to="/cart" className="nav-link">
                    <i className="bi bi-cart" style={{ fontSize: '1.2rem' }}></i>
                    Cart
                    {cart.totalCount > 0 && (
                      <span className="badge bg-danger ms-1">{cart.totalCount}</span>
                    )}
                  </Link>
                </li>
                <button onClick={toggleChat} className={classes.chatButton}>
                  Chat
                </button>
                
                {/* Render ChatRoom only for regular users */}
                {isChatOpen && user && (
                  <ChatRoom onClose={toggleChat} userEmail={user.email} />
                )}        
              </>
            ) : (
              <>
                <li className="nav-item"><Link to="/login" className="nav-link">Login</Link></li>
                <li className="nav-item"><Link to="/signup" className="nav-link">Register</Link></li>
              </>
            )}
          </ul>
        </div>
    </nav>
  );
  
};

export default Header;
