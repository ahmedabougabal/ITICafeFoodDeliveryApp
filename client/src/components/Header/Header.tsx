import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useUser } from '../../UserContext';
import { useFavorites } from '../../FavoritesContext';
import { toast } from 'react-toastify';
import AxiosInstance from '../../utils/AxiosInstance';
import ChatRoom from '../Chat/ChatRoom';
import {
  FaShoppingCart,
  FaHeart,
  FaComments,
  FaUser,
  FaBars,
  FaBell
} from 'react-icons/fa';

interface HeaderProps {
  notificationCount?: number;
}

interface User {
  email: string;
  full_name: string;
}

const Header: React.FC<HeaderProps> = ({ notificationCount = 0 }) => {
  // State Management
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const { favorites } = useFavorites();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [gradientAngle] = useState(135);

  // Load unread count from localStorage
  useEffect(() => {
    const savedUnreadCount = localStorage.getItem('unreadCount');
    if (savedUnreadCount) {
      setUnreadCount(parseInt(savedUnreadCount));
    }
  }, []);

  // WebSocket connection for chat notifications
  useEffect(() => {
    if (!user?.email) return;

    const notificationRoomName = `${user.email}_admin@gmail.com`;
    const wsNotification = new WebSocket(`ws://localhost:8000/ws/rooms/${notificationRoomName}/`);

    wsNotification.onopen = () => {
      console.log('WebSocket connection opened.');
    };

    wsNotification.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.sender === 'admin@gmail.com') {
        setUnreadCount(prev => {
          const newCount = prev + 1;
          localStorage.setItem('unreadCount', newCount.toString());
          return newCount;
        });
        setMessages(prev => [...prev, data.message]);
      }
    };

    return () => {
      wsNotification.close();
    };
  }, [user?.email]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-dropdown') && !target.closest('.profile-button')) {
        setIsProfileDropdownOpen(false);
      }
      if (!target.closest('.notifications-popup') && !target.closest('.notifications-trigger')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Event Handlers
  const handleChatClick = () => {
    setIsChatOpen(!isChatOpen);
    setShowNotifications(false);
    if (unreadCount > 0) {
      setUnreadCount(0);
      localStorage.removeItem('unreadCount');
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    setShowNotifications(false);
  };

  const handleLogout = async () => {
    try {
      const refresh = JSON.parse(localStorage.getItem('refresh_token') || '{}');
      await AxiosInstance.post('/logout', { refresh_token: refresh });

      // Clear all local storage items
      ['token', 'refresh_token', 'user', 'unreadCount'].forEach(item =>
        localStorage.removeItem(item)
      );

      setUser(null);
      clearCart();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed. Please try again.');
    }
  };

  // Styles
  const headerStyle = {
    background: `linear-gradient(${gradientAngle}deg, #f11d71 0%, #85122c 100%)`,
  };

  const renderNavLinks = () => (
    <>
      {user ? (
        <>
          <Link
            to="/favorites"
            className="flex flex-col items-center text-white hover:scale-105 transition-transform"
          >
            <div className="relative">
              <FaHeart className="text-xl" />
              {favorites.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-pink-600 rounded-full px-2 py-1 text-xs font-bold">
                  {favorites.length}
                </span>
              )}
            </div>
            <span className="text-xs mt-1">Favorites</span>
          </Link>

          <div className="relative">
            <button
              onClick={handleChatClick}
              className="notifications-trigger flex flex-col items-center text-white hover:scale-105 transition-transform"
              onMouseEnter={() => messages.length > 0 && setShowNotifications(true)}
              onMouseLeave={() => setShowNotifications(false)}
            >
              <div className="relative">
                <FaComments className="text-xl" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-cyan-400 text-white rounded-full px-2 py-1 text-xs font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">Chat</span>
            </button>

            {showNotifications && messages.length > 0 && (
              <div className="notifications-popup absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-50">
                <div className="p-4 space-y-3">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className="relative bg-red-500 text-white rounded-full px-2 py-1 text-xs font-bold flex items-center space-x-2"
                    >
                      <span className="text-white bg-gray-800 px-2 py-1 rounded-full">
                        {index + 1}
                      </span>
                      <span>{msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link
            to="/cart"
            className="flex flex-col items-center text-white hover:scale-105 transition-transform"
          >
            <div className="relative">
              <FaShoppingCart className="text-xl" />
              {cart.totalCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs font-bold">
                  {cart.totalCount}
                </span>
              )}
            </div>
            <span className="text-xs mt-1">Cart</span>
          </Link>

          <Link
            to="/notifications"
            className="flex flex-col items-center text-white hover:scale-105 transition-transform"
          >
            <div className="relative">
              <FaBell className="text-xl" />
              {notificationCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 rounded-full px-2 py-1 text-xs font-bold">
                  {notificationCount}
                </span>
              )}
            </div>
            <span className="text-xs mt-1">Notifications</span>
          </Link>

          <div className="relative">
            <button
              className="profile-button flex items-center space-x-2 text-white hover:bg-white/20 px-4 py-2 rounded transition-colors"
              onClick={handleProfileClick}
            >
              <FaUser className="text-xl" />
              <span className="hidden md:inline">{user.full_name}</span>
            </button>

            {isProfileDropdownOpen && (
              <div className="profile-dropdown absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </Link>
                <Link
                  to="/active-orders"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <Link
            to="/login"
            className="text-white hover:bg-white/20 px-4 py-2 rounded transition-colors"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="text-white hover:bg-white/20 px-4 py-2 rounded transition-colors"
          >
            Register
          </Link>
        </>
      )}
    </>);

  return (
    <header className="shadow-lg"
            style={headerStyle}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-2 text-white hover:scale-105 transition-transform"
            >
              <FaShoppingCart className="text-2xl animate-[spin_10s_linear_infinite]" />
              <span className="text-xl font-bold">ITIFoods</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {renderNavLinks()}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <FaBars className="text-xl" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block text-white px-4 py-2 hover:bg-white/20"
                >
                  Profile
                </Link>
                <Link
                  to="/active-orders"
                  className="block text-white px-4 py-2 hover:bg-white/20"
                >
                  Orders
                </Link>
                <Link
                  to="/favorites"
                  className="block text-white px-4 py-2 hover:bg-white/20"
                >
                  Favorites ({favorites.length})
                </Link>
                <Link
                  to="/cart"
                  className="block text-white px-4 py-2 hover:bg-white/20"
                >
                  Cart ({cart.totalCount})
                </Link>
                <Link
                  to="/notifications"
                  className="block text-white px-4 py-2 hover:bg-white/20"
                >
                  Notifications {notificationCount > 0 && `(${notificationCount})`}
                </Link>
                <button
                  onClick={handleChatClick}
                  className="block w-full text-left text-white px-4 py-2 hover:bg-white/20"
                >
                  Chat {unreadCount > 0 && `(${unreadCount})`}
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-white px-4 py-2 hover:bg-white/20"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-white px-4 py-2 hover:bg-white/20"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block text-white px-4 py-2 hover:bg-white/20"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {/* Chat Window */}
      {isChatOpen && user && (
        <ChatRoom
          onClose={() => setIsChatOpen(false)}
          userEmail={user.email}
        />
      )}
    </header>
  );
};

export default Header;
