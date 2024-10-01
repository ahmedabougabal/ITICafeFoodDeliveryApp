import React, { useState } from 'react';
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import './signup.css';

const BRANCHES = {
    "New Capital": "NEW Capital",
    "Mansoura": "Mansoura",
    "Cairo University": "Cairo University",
    "Smart Village": "Smart Village",
    "Aswan": "Aswan",
    "Asuit": "Asuit",
    "Qena": "Qena",
    "Menia": "Menia",
    "Menofia": "Menofia",
    "Beni Suef": "Beni Suef",
    "Sohag": "Sohag",
    "Asmalilia": "Asmalilia",
    "Alexandria": "Alexandria"
};

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        first_name: "",
        last_name: "",
        branch: "",
        phone_number: "",
        password: "",
        confirm_password: "",
        user_type: "user"
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({}); // Error state

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' }); // Clear error on change
    };

    const validateForm = () => {
        const { email, first_name, last_name, branch, phone_number, password, confirm_password } = formData;
        let newErrors = {}; // Object to hold error messages
        let isValid = true;

        // Check for empty fields
        if (!email) {
            newErrors.email = "Email is required.";
            isValid = false;
        }
        if (!first_name) {
            newErrors.first_name = "First name is required.";
            isValid = false;
        }
        if (!last_name) {
            newErrors.last_name = "Last name is required.";
            isValid = false;
        }
        if (!branch) {
            newErrors.branch = "Branch is required.";
            isValid = false;
        }
        if (!phone_number) {
            newErrors.phone_number = "Phone number is required.";
            isValid = false;
        }
        if (!password) {
            newErrors.password = "Password is required.";
            isValid = false;
        }
        if (!confirm_password) {
            newErrors.confirm_password = "Confirm password is required.";
            isValid = false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            newErrors.email = "Invalid email address.";
            isValid = false;
        }

        // Password validation
        if (password && (password.length < 8 || !/\d/.test(password))) {
            newErrors.password = "Password must be at least 8 characters long and contain digits.";
            isValid = false;
        }

        // Confirm password match
        if (password !== confirm_password) {
            newErrors.confirm_password = "Passwords do not match.";
            isValid = false;
        }

        setErrors(newErrors); // Set the error state
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the errors.");
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:8000/api-auth/register', formData);
            if (response.status === 201) {
                toast.success('SignUp Successful. Verify Your Email');
                navigate("/otp/verify");
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setErrors(prevErrors => ({ ...prevErrors, email: "Email already exists." }));
            } else {
                toast.error("An unexpected error occurred.");
            }
        }
    };

    return (
        <div className="container">
            <div className="form-wrapper">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <h2>Create Account</h2>
                        <label>First Name:</label>
                        <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} />
                        {errors.first_name && <p className="error-message">{errors.first_name}</p>}
                    </div>
                    <div className="form-group">
                        <label>Last Name:</label>
                        <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} />
                        {errors.last_name && <p className="error-message">{errors.last_name}</p>}
                    </div>
                    <div className="form-group">
                        <label>Email Address:</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} />
                        {errors.email && <p className="error-message">{errors.email}</p>}
                    </div>
                    <div className="form-group">
                        <label>Branch:</label>
                        <select name="branch" value={formData.branch} onChange={handleChange}>
                            <option value="">Select Branch</option>
                            {Object.keys(BRANCHES).map(branchName => (
                                <option key={branchName} value={branchName}>{BRANCHES[branchName]}</option>
                            ))}
                        </select>
                        {errors.branch && <p className="error-message">{errors.branch}</p>}
                    </div>
                    <div className="form-group">
                        <label>Phone Number:</label>
                        <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} />
                        {errors.phone_number && <p className="error-message">{errors.phone_number}</p>}
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        {errors.password && <p className="error-message">{errors.password}</p>}
                    </div>
                    <div className="form-group">
                        <label>Confirm Password:</label>
                        <input type={showConfirmPassword ? "text" : "password"} name="confirm_password" value={formData.confirm_password} onChange={handleChange} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        {errors.confirm_password && <p className="error-message">{errors.confirm_password}</p>}
                    </div>
                    <input type="submit" className="submit-button" value="Submit" />
                    <button className="google-button">
                        <FaGoogle /> Sign up with Google
                    </button>
                    <button className="login-link" onClick={() => navigate("/login")}>
                        Already have an account? Log In
                    </button>
                </form>
            </div>
        </div>
    );    
};

export default Signup;
