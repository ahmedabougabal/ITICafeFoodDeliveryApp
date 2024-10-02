import React, { useState } from 'react'; 
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import AxiosInstance from "../../utils/AxiosInstance";
import './user.css'; // Import the CSS file for styling

const Login = () => {
    const navigate = useNavigate();
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
        <div>
            <div className='form-container'>
                <div style={{ width: "100%" }} className='wrapper'>
                    <h2>Login into your account</h2>
                    <form onSubmit={handleSubmit}>
                        <div className='form-group'>
                            <label>Email Address:</label>
                            <input
                                type="text"
                                className='email-form'
                                value={logindata.email}
                                name="email"
                                onChange={handleOnchange}
                            />
                            {errorMessages.email && <div className="error-message">{errorMessages.email}</div>} {/* Display email error */}
                        </div>
                        <div className='form-group'>
                            <label>Password:</label>
                            <input
                                type="password" 
                                className='email-form'
                                value={logindata.password}
                                name="password"
                                onChange={handleOnchange}
                            />
                            {errorMessages.password && <div className="error-message">{errorMessages.password}</div>} {/* Display password error */}
                        </div>
                        <input type="submit" value="Login" className="submitButton" />
                        <p className='pass-link'><Link to={'/forget-password'}>Forgot Password?</Link></p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
