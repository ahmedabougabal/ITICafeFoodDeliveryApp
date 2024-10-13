import HomePage from './pages/Home/HomePage';
import FoodPage from './pages/Food/FoodPage';
import { CartPage } from './pages/Cart/CartPage';
import OrderSuccessPage from './pages/OrderSuccessPage'; // Import the new success page
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Profile from './components/user/Profile';
import EditProfile from './components/user/EditProfile';
import Signup from './components/user/Signup';
import Login from './components/user/Login';
import VerifyEmail from './components/user/VerifyEmail';
import PasswordResetRequest from './components/user/PasswordResetRequest';
import ResetPassword from './components/user/ResetPassword';
import Orders from './pages/Orders/Orders';

const AppRoutes = () => {
  return (
    <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/search/:searchTerm' element={<HomePage />} />
        <Route path='/food/:id' element={<FoodPage />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/order-success' element={<OrderSuccessPage />} />
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path='/otp/verify' element={<VerifyEmail/>}/>
        <Route path='/forget-password' element={<PasswordResetRequest/>}/>
        <Route path='/password-reset-confirm/:uid/:token' element={<ResetPassword/>}/>
        <Route path='/orders' element={<Orders/>}/>

    </Routes>
  );
};

export default AppRoutes;