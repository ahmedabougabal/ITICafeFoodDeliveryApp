import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { Eye, EyeOff, Loader, XCircle } from 'lucide-react';
import axios from 'axios';
import AxiosInstance from "../../utils/AxiosInstance";
import { useUser } from '../../UserContext';

const Login = () => {
    const navigate = useNavigate();
    const { setUser } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [logindata, setLogindata] = useState({
        email: "",
        password: ""
    });
    const [errorMessages, setErrorMessages] = useState({
        email: "",
        password: ""
    });

    const handleSignInWithGoogle = async (response) => {
        try {
            setIsLoading(true);
            setLoginError('');
            const access_token = response.credential;

            const server_res = await axios.post(
                "http://127.0.0.1:8000/social-auth/google/",
                { auth_token: access_token },
                { headers: { "Content-Type": "application/json" } }
            );

            if (server_res.status === 200) {
                const { access, refresh } = server_res.data.tokens;
                const user = {
                    full_name: server_res.data.first_name + " " + server_res.data.last_name,
                    email: server_res.data.email
                };
                localStorage.setItem('token', JSON.stringify(access));
                localStorage.setItem('refresh_token', JSON.stringify(refresh));
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);
                await navigate('/');
                toast.success('Login successful');
            }
        } catch (error) {
            console.error("Error during Google sign-in:", error);
            setLoginError('Google login failed. Please try again.');
            toast.error('Google login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOnchange = (e) => {
        setLogindata({ ...logindata, [e.target.name]: e.target.value });
        setErrorMessages({ ...errorMessages, [e.target.name]: "" });
        setLoginError('');
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 8;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');
        let valid = true;

        if (!validateEmail(logindata.email)) {
            setErrorMessages((prev) => ({ ...prev, email: 'Invalid email address' }));
            valid = false;
        }

        if (!validatePassword(logindata.password)) {
            setErrorMessages((prev) => ({ ...prev, password: 'Password must be at least 8 characters' }));
            valid = false;
        }

        if (!valid) return;

        try {
            setIsLoading(true);
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
                setUser(user);
                await navigate('/');
                toast.success('Login successful');
            }
        } catch (error) {
            if (error.response?.status === 400) {
                const errorMessage = error.response.data.detail || 'Invalid email or password';
                setLoginError(errorMessage);
                if (error.response.data.detail === 'Email not verified') {
                    setErrorMessages((prev) => ({ ...prev, email: 'Email not verified' }));
                }
            } else {
                setLoginError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const loadGoogleScript = () => {
            if (window.google?.accounts?.id) {
                google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_CLIENT_ID,
                    callback: handleSignInWithGoogle,
                });
                google.accounts.id.renderButton(
                    document.getElementById('signinDiv'),
                    { theme: 'filled_blue', size: 'medium' }
                );
            } else {
                setTimeout(loadGoogleScript, 100);
            }
        };

        loadGoogleScript();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[url('/src/pages/Home/main.jpeg')] backdrop-blur-sm bg-cover bg-center p-4">
            <div className="max-w-md w-full space-y-8 p-8 rounded-xl bg-white/10 shadow-xl backdrop-blur-md border border-white/20 transform transition-all duration-300 hover:shadow-2xl">
                <div className="text-center">
                    <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
                    <p className="text-gray-200 text-lg">Please sign in to continue</p>
                </div>

                {loginError && (
                    <div className="flex items-center gap-2 p-4 text-sm rounded-lg bg-red-500/10 border border-red-500/50 text-red-200">
                        <XCircle className="h-5 w-5 flex-shrink-0" />
                        <p>{loginError}</p>
                        <button
                            onClick={() => setLoginError('')}
                            className="ml-auto hover:text-red-100 transition-colors"
                        >
                            <XCircle className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                    <div className="space-y-1">
                        <label htmlFor="email" className="text-sm font-medium text-gray-200">Email address</label>
                        <div className="relative">
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={logindata.email}
                                onChange={handleOnchange}
                                className={`w-full px-4 py-3 rounded-lg bg-white/10 border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                                    errorMessages.email ? 'border-red-500/50' : 'border-gray-300/20'
                                }`}
                                placeholder="Enter your email"
                            />
                        </div>
                        {errorMessages.email && (
                            <p className="mt-1 text-sm text-red-400">{errorMessages.email}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="password" className="text-sm font-medium text-gray-200">Password</label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={logindata.password}
                                onChange={handleOnchange}
                                className={`w-full px-4 py-3 rounded-lg bg-white/10 border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                                    errorMessages.password ? 'border-red-500/50' : 'border-gray-300/20'
                                }`}
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errorMessages.password && (
                            <p className="mt-1 text-sm text-red-400">{errorMessages.password}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <Link to="/forget-password" className="text-purple-300 hover:text-purple-400 transition-colors duration-200">
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader className="animate-spin" size={20} />
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <span>Sign in</span>
                        )}
                    </button>
                </form>

                <div className="mt-8">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300/20"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-transparent text-gray-200">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div id="signinDiv" className="w-full flex justify-center"></div>
                    </div>
                </div>

                <div className="text-center mt-6">
                    <p className="text-gray-200">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-purple-300 hover:text-purple-400 font-semibold transition-colors duration-200">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
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
