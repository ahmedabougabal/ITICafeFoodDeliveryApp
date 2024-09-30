import React, { useState } from 'react'; 
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import AxiosInstance from "../utils/AxiosInstance";

const Login = () => {
    const navigate = useNavigate();
    const [logindata, setLogindata] = useState({
        email: "",
        password: ""
    });

    const handleOnchange = (e) => {
        setLogindata({ ...logindata, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                await navigate('/dashboard');
                toast.success('Login successful');
            }
        } catch (error) {
            if (error.response) {
                // Handle specific error messages based on the backend response
                if (error.response.status === 400) {
                    const errorMessage = error.response.data.detail || 'Email or password is incorrect';
                    toast.error(errorMessage);
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
