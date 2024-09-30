import React, { useState } from 'react';
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

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
    const [formdata, setFormdata] = useState({
        email: "",
        first_name: "",
        last_name: "",
        branch: "",
        phone_number: "",
        password: "",
        confirm_password: ""
    });
    const [error] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleOnchange = (e) => {
        setFormdata({ ...formdata, [e.target.name]: e.target.value });
    };

    const { email, first_name, last_name, branch, phone_number, password, confirm_password } = formdata;

    const validateForm = () => {
        if (!email || !first_name || !last_name || !branch || !phone_number || !password || !confirm_password) {
            toast.error("All fields are required.");
            return false;
        }
        if (password !== confirm_password) {
            toast.error("Passwords do not match.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const response = await axios.post('http://127.0.0.1:8000/api-auth/register', formdata);
            if (response.status === 201) {
                toast.success('SignUp Successfully Verify Your Email');
                navigate("/otp/verify");
                toast.success(response.data.message);
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                toast.error("Email already exists.");
            } else {
                toast.error("An unexpected error occurred.");
            }
        }
    };

    return (
        <div>
            <div className='form-container'>
                <div style={{ width: "100%" }} className='wrapper'>
                    <form onSubmit={handleSubmit}>
                        <h2>Create Account</h2>
                        <div className='form-group'>
                            <label>First Name:</label>
                            <input
                                type="text"
                                className='email-form'
                                name="first_name"
                                value={first_name}
                                onChange={handleOnchange}
                            />
                        </div>
                        <div className='form-group'>
                            <label>Last Name:</label>
                            <input
                                type="text"
                                className='email-form'
                                name="last_name"
                                value={last_name}
                                onChange={handleOnchange}
                            />
                        </div>
                        <div className='form-group'>
                            <label>Email Address:</label>
                            <input
                                type="text"
                                className='email-form'
                                name="email"
                                value={email}
                                onChange={handleOnchange}
                            />
                        </div>
                        <div className='form-group'>
                            <label>Branch:</label>
                            <select
                                className='email-form'
                                name="branch"
                                value={branch}
                                onChange={handleOnchange}
                            >
                                <option value="">Select Branch</option>
                                {Object.keys(BRANCHES).map(branchName => (
                                    <option key={branchName} value={branchName}>{BRANCHES[branchName]}</option>
                                ))}
                            </select>
                        </div>
                        <div className='form-group'>
                            <label>Phone Number:</label>
                            <input
                                type="text"
                                className='email-form'
                                name="phone_number"
                                value={phone_number}
                                onChange={handleOnchange}
                            />
                        </div>
                        <div className='form-group'>
                            <label>Password:</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className='email-form'
                                    name="password"
                                    value={password}
                                    onChange={handleOnchange}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '10px' }}>
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>
                        <div className='form-group'>
                            <label>Confirm Password:</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className='email-form'
                                    name="confirm_password"
                                    value={confirm_password}
                                    onChange={handleOnchange}
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '10px', top: '10px' }}>
                                    {showConfirmPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>
                        <input type="submit" value="Submit" className="submitButton" />
                        {error && <p className='error-message'>{error}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
