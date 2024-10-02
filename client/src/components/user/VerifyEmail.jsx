import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import './user.css'; // Import the CSS file for styling

const VerifyEmail = () => {
    const [otp, setOtp] = useState("");
    const [isVerified, setIsVerified] = useState(false); // New state for verification status
    const [errorMessage, setErrorMessage] = useState(""); // State for error messages
    const navigate = useNavigate();

    // Validate OTP: must be 6 digits and not empty
    const validateOtp = () => {
        if (!otp) {
            setErrorMessage('Please enter the OTP code');
            return false;
        }
        if (!/^\d{6}$/.test(otp)) {
            setErrorMessage('OTP must be exactly 6 digits');
            return false;
        }
        setErrorMessage(""); // Clear any previous error messages
        return true;
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();

        if (!validateOtp()) return; // Validate before making the API call

        try {
            const res = await axios.post('http://127.0.0.1:8000/api-auth/verify-email', { otp });
            if (res.status === 200) {
                setIsVerified(true); // Set verification status to true
                toast.success('Email verified successfully');
                setTimeout(() => navigate('/login'), 2000); // Navigate after 2 seconds
            }
        } catch (error) {
            console.error("Error response:", error.response);
            if (error.response?.status === 400) {
                toast.error('Invalid OTP code');
                setErrorMessage('OTP Wrong Or Expired'); // Set error message for invalid OTP
            } else {
                toast.error(error.response?.data?.detail || 'An unexpected error occurred');
            }
        }
    };

    return (
        <div className='verify-email-container'>
            <div className='form-container'>
                {isVerified ? (
                    <h3>Email verified successfully</h3> // Message when verified
                ) : (
                    <form onSubmit={handleOtpSubmit}>
                        <div className='form-group'>
                            <label htmlFor="otp">Enter your OTP code:</label>
                            <input
                                type="text"
                                className='email-form'
                                name="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                            {errorMessage && <div className="error-message">{errorMessage}</div>} {/* Display error message */}
                        </div>
                        <button type='submit' className='vbtn'>Send</button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default VerifyEmail;
