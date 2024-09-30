import { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import AppRoutes from "./AppRoutes";
import Header from "./components/Header/Header";
// import Login from "./components/Login";
// import Register from "./components/Register";
import { authService } from './services/AuthService';
import Profile from './components/user/Profile';
import EditProfile from './components/user/EditProfile';
import Signup from './components/user/Signup';
import Login from './components/user/Login';
import VerifyEmail from './components/user/VerifyEmail';
// import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PasswordResetRequest from './components/user/PasswordResetRequest';
import ResetPassword from './components/user/ResetPassword';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);


  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  return (
    <>
      <Header user={user} onLogout={handleLogout} />
      <Routes>
        <Route
          path="/*"
          element={<AppRoutes />}
        />
         <Route path='/signup' element={<Signup/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path='/otp/verify' element={<VerifyEmail/>}/>
        <Route path='/forget-password' element={<PasswordResetRequest/>}/>
        <Route path='/password-reset-confirm/:uid/:token' element={<ResetPassword/>}/>
      </Routes>
    </>
  );
}

export default App;