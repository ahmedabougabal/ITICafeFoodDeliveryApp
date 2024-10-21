import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useUser } from '../../UserContext';
import { useFavorites } from '../../FavoritesContext';
import { toast } from 'react-toastify';
import AxiosInstance from '../../utils/AxiosInstance';
import ChatRoom from '../Chat/ChatRoom';
import { FaShoppingCart, FaHeart, FaComments, FaUser, FaBars } from 'react-icons/fa';

const Header = () => {
    const { cart, clearCart } = useCart();
    const navigate = useNavigate();
    const { user, setUser } = useUser();
    const { favorites } = useFavorites();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [messages, setMessages] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [gradientAngle, setGradientAngle] = useState(135);
interface HeaderProps {
  notificationCount: number; // Add notification count prop
}

const Header: React.FC<HeaderProps> = ({ notificationCount }) => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [gradientAngle, setGradientAngle] = useState(135);

    // Load unread count from localStorage when the page loads
    useEffect(() => {
        const savedUnreadCount = localStorage.getItem('unreadCount');
        if (savedUnreadCount) {
            setUnreadCount(parseInt(savedUnreadCount));
        }
    }, []);

    useEffect(() => {
        if (user) {
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
        }
    }, [user]);

    // Close notifications when the chat is opened
    const handleChatClick = () => {
        setIsChatOpen(!isChatOpen);
        setShowNotifications(false);
        if (unreadCount > 0) {
            setUnreadCount(0);
            localStorage.removeItem('unreadCount');
        }
    };

    // Close profile dropdown and notifications if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.profile-dropdown') && !event.target.closest('.profile-button')) {
                setIsProfileDropdownOpen(false);
            }
            if (!event.target.closest('.notifications-popup') && !event.target.closest('.notifications-trigger')) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleProfileClick = (e) => {
        e.stopPropagation();
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
        setShowNotifications(false);
    };

    const handleLogout = async () => {
        try {
            const refresh = JSON.parse(localStorage.getItem('refresh_token') || '{}');
            await AxiosInstance.post('/logout', { refresh_token: refresh });
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            localStorage.removeItem('unreadCount');
            setUser(null);
            clearCart();
            navigate('/login');
            toast.warn('Logout successful');
        } catch (error) {
            toast.error('Logout failed.');
        }
    };

    const headerStyle = {
        background: `linear-gradient(${gradientAngle}deg, #f11d71 0%, #85122c 100%)`,
    };

    return (
        <header className="shadow-lg" style={{ background: `linear-gradient(${gradientAngle}deg, #f11d71 0%, #85122c 100%)` }}>
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2 text-white hover:scale-105 transition-transform">
                            <FaShoppingCart className="text-2xl animate-[spin_10s_linear_infinite]"/>
                            <span className="text-xl font-bold">ITIFoods</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>
                                {/* Favorites */}
                                <Link to="/favorites" className="flex flex-col items-center text-white hover:scale-105 transition-transform">
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

                                {/* Chat */}
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

                                    {/* Notifications Popup */}
                                    {showNotifications && messages.length > 0 && (
                                        <div className="notifications-popup absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-50" style={{ top: '100%' }}>
                                            <div className="p-4 space-y-3">
                                                {messages.map((msg, index) => (
                                                    <div key={index} className="relative bg-red-500 text-white rounded-full px-2 py-1 text-xs font-bold flex items-center space-x-2">
                                                        <span className="text-white bg-gray-800 px-2 py-1 rounded-full">{index + 1}</span>
                                                        <span>{msg}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Cart */}
                                <Link to="/cart" className="flex flex-col items-center text-white hover:scale-105 transition-transform">
                                    <div className="relative">
                                        <FaShoppingCart className="text-xl"/>
                                        {cart.totalCount > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs font-bold">
                                                {cart.totalCount}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs mt-1">Cart</span>
                                </Link>

                                {/* Profile Dropdown */}
                                <div className="relative">
                                    <button
                                        className="profile-button flex items-center space-x-2 text-white hover:bg-white/20 px-4 py-2 rounded transition-colors"
                                        onClick={handleProfileClick}
                                    >
                                        <FaUser className="text-xl"/>
                                        <span className="hidden md:inline">{user.full_name}</span>
                                    </button>

                                    {isProfileDropdownOpen && (
                                        <div className="profile-dropdown absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50">
                                            <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                                                Profile
                                            </Link>
                                            <Link to="/active-orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
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
                                <Link to="/login" className="text-white hover:bg-white/20 px-4 py-2 rounded transition-colors">
                                    Login
                                </Link>
                                <Link to="/signup" className="text-white hover:bg-white/20 px-4 py-2 rounded transition-colors">
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <FaBars className="text-xl"/>
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 space-y-4">
                        {user ? (
                            <>
                                <Link to="/profile" className="block text-white px-4 py-2 hover:bg-white/20">
                                    Profile
                                </Link>
                                <Link to="/active-orders" className="block text-white px-4 py-2 hover:bg-white/20">
                                    Orders
                                </Link>
                                <Link to="/favorites" className="block text-white px-4 py-2 hover:bg-white/20">
                                    Favorites ({favorites.length})
                                </Link>
                                <Link to="/cart" className="block text-white px-4 py-2 hover:bg-white/20">
                                    Cart ({cart.totalCount})
                                </Link>
                                <button
                                    className="block w-full text-left text-white px-4 py-2 hover:bg-white/20"
                                    onClick={handleLogout}
                                >
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="block text-white px-4 py-2 hover:bg-white/20">
                                    Login
                                </Link>
                                <Link to="/signup" className="block text-white px-4 py-2 hover:bg-white/20">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Chat Window */}
            {isChatOpen && user && (
                <ChatRoom onClose={() => setIsChatOpen(false)} userEmail={user.email}/>
            )}
        </header>
    );
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
              <Link to="/cart" className={styles.cartLink}>
                <i className="bi bi-cart3"></i>
                <span>Cart</span>
                {cart.totalCount > 0 && (
                  <span className={styles.cartBadge}>{cart.totalCount}</span>
                )}
              </Link>
              <button onClick={toggleChat} className={styles.chatButton}>
                <i className="bi bi-chat-dots"></i>
                <span>Chat</span>
              </button>
              <Link to="/notifications" className={styles.notificationLink}>
                <i className="bi bi-bell notification-icon"></i>
                {notificationCount > 0 && (
                  <span className={styles.notificationBadge}>{notificationCount}</span>
                )}
                Notifications
              </Link>
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
