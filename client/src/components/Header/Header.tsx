import React, { useState, useEffect } from 'react';
import classes from './header.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useUser } from '../../UserContext';
import { toast } from 'react-toastify';
import AxiosInstance from "../../utils/AxiosInstance";
import ChatRoom from '../Chat/ChatRoom';
import AdminChat from '../AdminChat/AdminChat';
import { getLoggedInUsers } from '../AdminChat/apiService';


const Header: React.FC = () => {
  const { cart} = useCart(); // Make sure to implement clearCart in your cart context
  const navigate = useNavigate();
  const { user, setUser } = useUser(); // Use the user and setUser from context
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loggedInUsers, setLoggedInUsers] = useState<string[]>([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null); // State for selected user email
  const [isAdminChatOpen, setIsAdminChatOpen] = useState(false); // State for AdminChat visibility

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

  // Fetch logged-in users when the component mounts or user changes
  useEffect(() => {
    const fetchLoggedInUsers = async () => {
      if (user && user.email === 'admin@gmail.com') {
        const token = localStorage.getItem('token'); // Retrieve token from local storage
        try {
          const users = await getLoggedInUsers(token); // Pass token to the API call
          setLoggedInUsers(users);
        } catch (error) {
          console.error('Error fetching logged-in users:', error);
        }
      }
    };

    fetchLoggedInUsers();
  }, [user]);


   // Handle user click to open chat
   const handleAdminrClick = (email: string) => {
    setSelectedUserEmail(email); // Set the selected user email
    if (setIsAdminChatOpen){
      setIsAdminChatOpen(false);
    }
    setIsAdminChatOpen(true); // Open the AdminChat
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
                <Link to="/active-orders">Orders</Link>
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
  
      {user && user.email === 'admin@gmail.com' ? (
        <div className={classes.loggedInUsers}>
          <ul>
            {loggedInUsers.map((loggedInUser, index) => (
              <li key={index} onClick={() => handleAdminrClick(loggedInUser)} className={classes.loggedInUser}>
                {loggedInUser}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <button onClick={toggleChat} className={classes.chatButton}>
          Chat
        </button>
      )}

      {/* Render ChatRoom only for regular users */}
      {isChatOpen && user && !selectedUserEmail && (
        <ChatRoom onClose={toggleChat} userEmail={user.email} />
      )}

      {/* Render AdminChat for selected user */}
      {isAdminChatOpen && selectedUserEmail && (
        <AdminChat onClose={() => setIsAdminChatOpen(false)} selectedChat={selectedUserEmail} />
      )}
  
      
    </header>
  );
  
};

export default Header;
