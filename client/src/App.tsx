import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Header from "./components/Header/Header";
import { Footer } from './components/Footer/Footer';
import { authService } from './services/AuthService';
import Profile from './components/user/Profile';
import EditProfile from './components/user/EditProfile';
import Signup from './components/user/Signup';
import Login from './components/user/Login';
import VerifyEmail from './components/user/VerifyEmail';
import PasswordResetRequest from './components/user/PasswordResetRequest';
import ResetPassword from './components/user/ResetPassword';
import { UserProvider, useUser } from './UserContext';
import AuthMessage from './components/AuthMessage';
import CartProvider from "./hooks/useCart.tsx";
import ActiveOrders from './pages/Order/ActiveOrder.tsx';
import { FavoritesProvider } from './FavoritesContext';
import FavoritesPage from './components/FavoritesPage.tsx';
import HomePage from './pages/Home/HomePage.tsx';
import { CartPage } from "./pages/Cart/CartPage.tsx";
import ChatRoom from './components/Chat/ChatRoom.tsx';
import OrderSuccess from './pages/OrderSuccessPage.tsx';

import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import AppRoutes from "./AppRoutes.tsx";

function AppContent() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [authMessage, setAuthMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, [setUser]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setAuthMessage({ message: 'Logged out successfully', type: 'success' });
    navigate('/login');
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    setAuthMessage({ message: 'Logged in successfully', type: 'success' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={handleLogout} />
      {authMessage && <AuthMessage message={authMessage.message} type={authMessage.type} />}
      <div className="flex-grow">
        <Routes>
        <Route path="/*" element={<AppRoutes />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/login' element={<Login onLoginSuccess={handleLogin} />} />
          <Route path='/profile' element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path='/otp/verify' element={<VerifyEmail />} />
          <Route path='/forget-password' element={<PasswordResetRequest />} />
          <Route path='/password-reset-confirm/:uid/:token' element={<ResetPassword />} />
          <Route path="/active-orders" element={<ActiveOrders />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/chat" element={<ChatRoom />} />
          <Route path="/order-success" element={<OrderSuccess />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <FavoritesProvider>
          <AppContent />
        </FavoritesProvider>
      </CartProvider>
    </UserProvider>
  );
}

export default App;