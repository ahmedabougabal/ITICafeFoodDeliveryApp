import HomePage from './pages/Home/HomePage'
import FoodPage from './pages/Food/FoodPage'
import { CartPage } from './pages/Cart/CartPage'
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Profile from './components/user/Profile';
import EditProfile from './components/user/EditProfile';
import Signup from './components/user/Signup';
import Login from './components/user/Login';
import VerifyEmail from './components/user/VerifyEmail';
// import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PasswordResetRequest from './components/user/PasswordResetRequest';
import ResetPassword from './components/user/ResetPassword';

const AppRoutes = () => {
  return (
    <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/search/:searchTerm' element={<HomePage />} />
        <Route path='/food/:id' element={<FoodPage />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path='/otp/verify' element={<VerifyEmail/>}/>
        <Route path='/forget-password' element={<PasswordResetRequest/>}/>
        <Route path='/password-reset-confirm/:uid/:token' element={<ResetPassword/>}/>
    </Routes>
  )
}

export default AppRoutes