import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import AppRoutes from "./AppRoutes";
import Header from "./components/Header/Header";
import  Footer  from './components/Footer/Footer';
import { authService } from './services/AuthService';
import Profile from './components/user/Profile';
import EditProfile from './components/user/EditProfile';
import Signup from './components/user/Signup';
import Login from './components/user/Login';
import VerifyEmail from './components/user/VerifyEmail';
import 'react-toastify/dist/ReactToastify.css';
import PasswordResetRequest from './components/user/PasswordResetRequest';
import ResetPassword from './components/user/ResetPassword';
import { UserProvider, useUser } from './UserContext';
import AuthMessage from './components/AuthMessage';
import CartProvider from "./hooks/useCart.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';


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
    <>
      <Header user={user} onLogout={handleLogout} />
      {authMessage && <AuthMessage message={authMessage.message} type={authMessage.type} />}
      <Routes>
        <Route path="/*" element={<AppRoutes />} />
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/login' element={<Login onLoginSuccess={handleLogin} />}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path='/otp/verify' element={<VerifyEmail/>}/>
        <Route path='/forget-password' element={<PasswordResetRequest/>}/>
        <Route path='/password-reset-confirm/:uid/:token' element={<ResetPassword/>}/>
      </Routes>
      <Footer/>
    </>
  );
}

function App() {
  return (
    <UserProvider>
      <CartProvider> {/* Wrap AppContent with CartProvider */}
        <AppContent />
      </CartProvider>
    </UserProvider>
  );
}

export default App;