import React, { useState } from 'react'; 
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import AxiosInstance from "../../utils/AxiosInstance";
// client/src/UserContext.tsx
import {useUser} from '../../UserContext';
import './login.css';

const Login = () => {
    const navigate = useNavigate();
    const { setUser } = useUser(); // Use the setUser function from context
    const [logindata, setLogindata] = useState({
        email: "",
        password: ""
    });
    const [errorMessages, setErrorMessages] = useState({
        email: "",
        password: ""
    });

    const handleOnchange = (e) => {
        setLogindata({ ...logindata, [e.target.name]: e.target.value });
        setErrorMessages({ ...errorMessages, [e.target.name]: "" }); // Clear error message on change
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 8; // Example validation: password must be at least 6 characters
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let valid = true;

        // Validate email
        if (!validateEmail(logindata.email)) {
            setErrorMessages((prev) => ({ ...prev, email: 'Invalid email address' }));
            valid = false;
        }

        // Validate password
        if (!validatePassword(logindata.password)) {
            setErrorMessages((prev) => ({ ...prev, password: 'Password must be at least 8 characters' }));
            valid = false;
        }

        if (!valid) return; 

         try {
            const res = await AxiosInstance.post('/login', logindata);
            const response = res.data;
            const user = {
                'full_name': response.full_name,
                'email': response.email
            };

            if (res.status === 200) {
                localStorage.setItem('token', JSON.stringify(response.access_token));
                localStorage.setItem('refresh_token', JSON.stringify(response.refresh_token));
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user); // Update the user in context
                await navigate('/');
                toast.success('Login successful');
            }
        } catch (error) {
            if (error.response) {
                // Handle specific error messages based on the backend response
                if (error.response.status === 400) {
                    const errorMessage = error.response.data.detail || 'Email or password is incorrect';
                    toast.error(errorMessage);
                    if (error.response.data.detail === 'Email not verified') {
                        setErrorMessages((prev) => ({ ...prev, email: 'Email not verified' }));
                    }
                } else {
                    toast.error(error.response.data.detail || 'An unexpected error occurred');
                }
            } else {
                toast.error('An unexpected error occurred');
            }
        }
    };

    return (
        <form className="form_main" onSubmit={handleSubmit}>
    <p className="heading">Login</p>
    <div className="inputContainer">
        <svg viewBox="0 0 16 16" fill="#2e2e2e" height="16" width="16" xmlns="http://www.w3.org/2000/svg" className="inputIcon">
        <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z"></path>
        </svg>
    <input  placeholder="Email" 
            id="username" className="inputField" 
            type="email"  value={logindata.email} 
            name="email"
            onChange={handleOnchange}/>
   {errorMessages.email && (
    <div className="alert alert-danger" role="alert">
        {errorMessages.email}
    </div>
)}
    </div>
    
<div className="inputContainer">
    <svg viewBox="0 0 16 16" fill="#2e2e2e" height="16" width="16" xmlns="http://www.w3.org/2000/svg" className="inputIcon">
    <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"></path>
    </svg>
    <input placeholder="Password" id="password" className="inputField" type="password"
    value={logindata.password}
    name="password"
    onChange={handleOnchange}/>
{errorMessages.password && (
    <div className="alert alert-danger" role="alert">
        {errorMessages.password}
    </div>
)}
</div>
{/* <button id="button">Submit</button> */}
<input type="submit" value="Login" className="submitButton" id="button"/>
    <div className="signupContainer">
        <p className='pass-link'><Link to={'/forget-password'}>Forgot Password?</Link></p>
        <p>Don't have any account?</p>
        <Link to={"/"}>Sign up</Link>
    </div>
</form>

    );
};

export default Login;



// <div>
// <div className='form-container'>
//     <div style={{ width: "100%" }} className='wrapper'>
//         <h2>Login into your account</h2>
//         <form onSubmit={handleSubmit}>
//             <div className='form-group'>
//                 <label>Email Address:</label>
//                 <input
//                     type="text"
//                     className='email-form'
//                     value={logindata.email}
//                     name="email"
//                     onChange={handleOnchange}
//                 />
//                 {errorMessages.email && <div className="error-message">{errorMessages.email}</div>} {/* Display email error */}
//             </div>
//             <div className='form-group'>
//                 <label>Password:</label>
//                 <input
//                     type="password" 
//                     className='email-form'
//                     value={logindata.password}
//                     name="password"
//                     onChange={handleOnchange}
//                 />
//                 {errorMessages.password && <div className="error-message">{errorMessages.password}</div>} {/* Display password error */}
//             </div>
//             <input type="submit" value="Login" className="submitButton" />
//             <p className='pass-link'><Link to={'/forget-password'}>Forgot Password?</Link></p>
//         </form>
//     </div>
// </div>
// </div>
