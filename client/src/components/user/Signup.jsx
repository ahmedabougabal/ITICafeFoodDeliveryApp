import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import axios from "axios";
import { toast } from "react-toastify";

const BRANCHES = {
   "1": "New Capital",
    "2": "Smart Village",
    "3": "Mansoura",
    "4": "Alexandria",
    "5": "Beni Sweif",
    "6": "Assuit",
    "7": "Cairo",
    "8": "Giza",
    "9": "Port Said",
    "10": "Aswan",
    "11": "El Minya",
    "12": "Sohag",
};

const USER_TYPE_CHOICES = [
    ['user', 'User'],
    ['instructor', 'Instructor'],
];

const ModernSignup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        branch: '',
        phone_number: '',
        password: '',
        confirm_password: '',
        user_type: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Google Sign In Handler
    const handleSignInWithGoogle = async (response) => {
        try {
            const access_token = response.credential;
            console.log("Google payload: ", access_token);

            const server_res = await axios.post(
                "http://127.0.0.1:8000/social-auth/google/",
                { auth_token: access_token },
                { headers: { "Content-Type": "application/json" } }
            );

            console.log("Server Response: ", server_res.data);

            if (server_res.status === 200) {
                const { access, refresh } = server_res.data.tokens;
                const user = {
                    full_name: server_res.data.first_name + " " + server_res.data.last_name,
                    email: server_res.data.email
                };
                localStorage.setItem('token', JSON.stringify(access));
                localStorage.setItem('refresh_token', JSON.stringify(refresh));
                localStorage.setItem('user', JSON.stringify(user));
                await navigate('/');
                window.location.reload();
                toast.success('Login successful');
            }
        } catch (error) {
            console.error("Error during Google sign-in:", error);
            toast.error('Login failed. Please try again.');
        }
    };

    // Initialize Google SDK
    useEffect(() => {
        google.accounts.id.initialize({
            client_id: import.meta.env.VITE_CLIENT_ID,
            callback: handleSignInWithGoogle,
        });
        google.accounts.id.renderButton(
            document.getElementById('signinDiv'),
            { theme: 'filled_blue', size: 'large' }
        );
    }, []);

    const validateForm = () => {
        const { email, first_name, last_name, branch, phone_number, password, confirm_password, user_type } = formData;
        let newErrors = {};
        let isValid = true;

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Valid email is required.';
            isValid = false;
        }

        if (!first_name) {
            newErrors.first_name = 'First name is required.';
            isValid = false;
        }

        if (!last_name) {
            newErrors.last_name = 'Last name is required.';
            isValid = false;
        }

        if (!branch) {
            newErrors.branch = 'Branch is required.';
            isValid = false;
        }

        if (!phone_number) {
            newErrors.phone_number = 'Phone number is required.';
            isValid = false;
        }

        if (!password || password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long.';
            isValid = false;
        }

        if (!confirm_password || confirm_password !== password) {
            newErrors.confirm_password = 'Passwords do not match.';
            isValid = false;
        }

        if (!user_type) {
            newErrors.user_type = 'User type is required.';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fix the errors.');
            return;
        }

        try {
            const apiData = { ...formData };
            if (apiData.branch) {
                apiData.branch = parseInt(apiData.branch);
            }

            const response = await axios.post('http://127.0.0.1:8000/api-auth/register', apiData);
            if (response.status === 201) {
                toast.success('SignUp Successful. Verify Your Email');
                navigate('/otp/verify');
            }
        } catch (error) {
            if (error.response?.data) {
                const backendErrors = error.response.data;
                const newErrors = {};
                Object.entries(backendErrors).forEach(([key, value]) => {
                    newErrors[key] = Array.isArray(value) ? value[0] : value;
                });
                setErrors(newErrors);
                toast.error('Please correct the errors in the form.');
            } else {
                toast.error('An unexpected error occurred.');
            }
        }
    };

    return (
        <div className="min-h-screen py-6 flex flex-col justify-center relative overflow-hidden sm:py-12">
            <div className="absolute inset-0 bg-[url('/images/pg.jpg')] bg-cover bg-center"></div>
            <div className="absolute inset-0  from-rose-400/30 to-purple-600/30 backdrop-blur-sm"></div>

            <div className="relative px-6 pt-10 pb-8 bg-white/10 shadow-xl ring-1 ring-gray-900/5 sm:max-w-lg sm:mx-auto sm:rounded-lg sm:px-10 backdrop-blur-md border border-white/20">
                <div className="max-w-md mx-auto">
                    <div className="divide-y divide-gray-300/50">
                        <div className="py-8 text-base leading-7 space-y-6">
                            <h1 className="text-3xl font-bold text-white text-center mb-8">Create Account</h1>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder="First Name"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                        />
                                        {errors.first_name && <p className="text-red-300 text-sm mt-1">{errors.first_name}</p>}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder="Last Name"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                        />
                                        {errors.last_name && <p className="text-red-300 text-sm mt-1">{errors.last_name}</p>}
                                    </div>
                                </div>

                                <input
                                    type="email"
                                    placeholder="Email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                />
                                {errors.email && <p className="text-red-300 text-sm mt-1">{errors.email}</p>}

                                <input
                                    type="text"
                                    placeholder="Phone Number"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                />
                                {errors.phone_number && <p className="text-red-300 text-sm mt-1">{errors.phone_number}</p>}

                                <select
                                    name="branch"
                                    value={formData.branch}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                                >
                                    <option value="" className="text-gray-900">Select Branch</option>
                                    {Object.entries(BRANCHES).map(([key, label]) => (
                                        <option key={key} value={key} className="text-gray-900">{label}</option>
                                    ))}
                                </select>
                                {errors.branch && <p className="text-red-300 text-sm mt-1">{errors.branch}</p>}

                                <select
                                    name="user_type"
                                    value={formData.user_type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                                >
                                    <option value="" className="text-gray-900">Select User Type</option>
                                    {USER_TYPE_CHOICES.map(([value, label]) => (
                                        <option key={value} value={value} className="text-gray-900">{label}</option>
                                    ))}
                                </select>
                                {errors.user_type && <p className="text-red-300 text-sm mt-1">{errors.user_type}</p>}

                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-300 text-sm mt-1">{errors.password}</p>}

                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Confirm Password"
                                        name="confirm_password"
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60"
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {errors.confirm_password && <p className="text-red-300 text-sm mt-1">{errors.confirm_password}</p>}

                                <button
                                    type="submit"
                                    className="w-full px-4 py-2 bg-gradient-to-r from-rose-400 to-purple-500 text-white rounded-lg hover:from-rose-500 hover:to-purple-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-gray-800"
                                >
                                    Sign Up
                                </button>
                            </form>

                            <div className="text-center text-white mt-4">
                                Already have an account?
                                <Link to="/login" className="text-rose-300 hover:text-rose-400 ml-1">
                                    Log in
                                </Link>
                            </div>

                            <div id="signinDiv" className="mt-4">
                                <button
                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2">
                                    <FaGoogle/> Continue with Google
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModernSignup;


{/* <div className="containers">
<form className="forms" onSubmit={handleSubmit}>
    <header>Create Account</header>
    <div className="input-box">
        <label>First Name</label>
        <input
            type="text"
            className="input"
            name="first_name"
            placeholder="First Name"
            value={formData.first_name}
            onChange={handleChange}
        />
        {errors.first_name && <p className="alert-danger">{errors.first_name}</p>}
    </div>

    <div className="input-box">
        <label>Last Name</label>
        <input
            type="text"
            className="input"
            name="last_name"
            placeholder="Last Name"
            value={formData.last_name}
            onChange={handleChange}
        />
        {errors.last_name && <p className="alert-danger">{errors.last_name}</p>}
    </div>

    <div className="input-box">
        <label>Email</label>
        <input
            type="email"
            className="input"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
        />
        {errors.email && <p className="alert-danger">{errors.email}</p>}
    </div>

    <div className="input-box">
        <label>Phone Number</label>
        <input
            type="text"
            className="input"
            name="phone_number"
            placeholder="Phone Number"
            value={formData.phone_number}
            onChange={handleChange}
        />
        {errors.phone_number && <p className="alert-danger">{errors.phone_number}</p>}
    </div>

    <div className="input-box">
        <label>Branch</label>
        <select
            name="branch"
            className="input"
            value={formData.branch}
            onChange={handleChange}
        >
            <option value="">Select Branch</option>
            {Object.entries(BRANCHES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
            ))}
        </select>
        {errors.branch && <p className="alert-danger">{errors.branch}</p>}
    </div>

    <div className="input-box">
        <label>User Type</label>
        <select
            name="user_type"
            className="input"
            value={formData.user_type}
            onChange={handleChange}
        >
            <option value="">Select User Type</option>
            {USER_TYPE_CHOICES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
            ))}
        </select>
        {errors.user_type && <p className="alert-danger">{errors.user_type}</p>}
    </div>

    <div className="input-box password-box">
        <label>Password</label>
        <input
            type={showPassword ? 'text' : 'password'}
            className="input"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
        />
        <span
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
        >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
        {errors.password && <p className="alert-danger">{errors.password}</p>}
    </div>

    <div className="input-box password-box">
        <label>Confirm Password</label>
        <input
            type={showConfirmPassword ? 'text' : 'password'}
            className="input"
            name="confirm_password"
            placeholder="Confirm Password"
            value={formData.confirm_password}
            onChange={handleChange}
        />
        <span
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
        {errors.confirm_password && <p className="alert-danger">{errors.confirm_password}</p>}
    </div>

    <button type="submit" className="form-btn">Sign Up</button>

    <div className="sign-up-label">
        Already have an account? <Link to="/login" className="sign-up-link">Log in</Link>
    </div>

                <div className="buttons-container" id='signinDiv'>
                    <div className="google-login-button" >
                        <FaGoogle className="google-icon" /> Continue with Google
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Signup;*/}