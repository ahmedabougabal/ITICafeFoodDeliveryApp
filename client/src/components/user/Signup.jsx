import React, { useState } from 'react';
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import './signup.css';

const BRANCHES = {
    "1": "New Capital",
    "2": "Mansoura",
    "3": "Cairo University",
    "4": "Assuit",
};


const USER_TYPE_CHOICES = [
    ['user', 'User'],
    ['instructor', 'Instructor'],
];

const Signup = () => {
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
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validateForm = () => {
        const { email, first_name, last_name, branch, phone_number, password, confirm_password, user_type } = formData;
        let newErrors = {};
        let isValid = true;

        // Email validation
        if (!email) {
            newErrors.email = 'Email is required.';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid.';
            isValid = false;
        }

        // First name validation
        if (!first_name) {
            newErrors.first_name = 'First name is required.';
            isValid = false;
        }

        // Last name validation
        if (!last_name) {
            newErrors.last_name = 'Last name is required.';
            isValid = false;
        }

        // Branch validation
        if (!branch) {
            newErrors.branch = 'Branch is required.';
            isValid = false;
        }

        // Phone number validation
        if (!phone_number) {
            newErrors.phone_number = 'Phone number is required.';
            isValid = false;
        }

        // Password validation
        if (!password) {
            newErrors.password = 'Password is required.';
            isValid = false;
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long.';
            isValid = false;
        }

        // Confirm password validation
        if (!confirm_password) {
            newErrors.confirm_password = 'Confirm password is required.';
            isValid = false;
        } else if (confirm_password !== password) {
            newErrors.confirm_password = 'Passwords do not match.';
            isValid = false;
        }

        // User type validation
        if (!user_type) {
            newErrors.user_type = 'User type is required.';
            isValid = false;
        } else if (!USER_TYPE_CHOICES.some(([value]) => value === user_type)) {
            newErrors.user_type = 'Invalid user type selected.';
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

            console.log('Sending data to backend:', apiData); // For debugging

            const response = await axios.post('http://127.0.0.1:8000/api-auth/register', apiData);
            if (response.status === 201) {
                toast.success('SignUp Successful. Verify Your Email');
                navigate('/otp/verify');
            }
        } catch (error) {
            console.error('Registration error:', error.response?.data); // For debugging

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
        <div className="containers">
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

                <div className="buttons-container">
                    <div className="google-login-button">
                        <FaGoogle className="google-icon" /> Sign Up with Google
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Signup;