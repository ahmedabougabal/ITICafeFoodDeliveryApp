import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import AxiosInstance from "../../utils/AxiosInstance";
import { useUser } from '../../UserContext';

interface LoginProps {
  onLoginSuccess: (userData: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    const { setUser } = useUser();
    const [logindata, setLogindata] = useState({
        email: "",
        password: ""
    });

    const handleOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLogindata({ ...logindata, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
        const res = await AxiosInstance.post('/api-auth/login', logindata);
        const response = res.data;
        console.log('Login response:', response);

        if (response.status === 'success') {
            localStorage.setItem('token', JSON.stringify(response.access_token));
            localStorage.setItem('refresh_token', JSON.stringify(response.refresh_token));
            const userData = {
                full_name: response.full_name,
                email: response.email
            };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            onLoginSuccess(userData);

            AxiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.access_token}`;

            navigate('/');
        } else {
            toast.error(response.detail || 'Login failed');
        }
    } catch (error: any) {
        console.error('Login error:', error);
        if (error.response) {
            console.error('Error response:', error.response);
            console.error('Error response data:', error.response.data);
            const errorMessage = error.response.data.detail || 'An error occurred during login';
            toast.error(errorMessage);
        } else if (error.request) {
            console.error('Error request:', error.request);
            toast.error('No response received from the server. Please check your connection.');
        } else {
            console.error('Error message:', error.message);
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