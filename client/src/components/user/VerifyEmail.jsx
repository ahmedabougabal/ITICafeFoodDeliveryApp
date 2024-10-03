import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import './verify.css'; // Import the CSS file for styling

const VerifyEmail = () => {
    const [otp, setOtp] = useState(Array(6).fill("")); // Create an array to hold OTP digits
    const [isVerified, setIsVerified] = useState(false); // New state for verification status
    const [errorMessage, setErrorMessage] = useState(""); // State for error messages
    const navigate = useNavigate();

    // Validate OTP: must be 6 digits and not empty
    const validateOtp = () => {
        const otpString = otp.join(''); // Convert the array back to a string
        if (!otpString) {
            setErrorMessage('Please enter the OTP code');
            return false;
        }
        if (!/^\d{6}$/.test(otpString)) {
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
            const res = await axios.post('http://127.0.0.1:8000/api-auth/verify-email', { otp: otp.join('') });
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

    const handleInputChange = (e, index) => {
        const { value } = e.target;
        
        // Ensure only digits are entered
        if (/^[0-9]$/.test(value) || value === '') {
            // Update the OTP array with the new value
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Move focus to the next input
            if (value && index < otp.length - 1) {
                document.getElementById(`input${index + 2}`).focus();
            }
        }
    };

    return (
        <div className='verify-email-container'>
            <div className='form-container'>
                {isVerified ? (
                    <h3>Email verified successfully</h3> // Message when verified
                ) : (
                    <form className="form" onSubmit={handleOtpSubmit}>
                        <div className='title'>OTP</div>
                        <div className='title'>Verification Code</div>
                        <p className='message'>We have sent a verification code to your Email Address</p>
                        <div className='inputs'>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`input${index + 1}`}
                                    type="text"
                                    maxLength="1"
                                    className='otp-input'
                                    value={digit}
                                    onChange={(e) => handleInputChange(e, index)}
                                />
                            ))}
                        </div>
                        {errorMessage && <div className="error-message">{errorMessage}</div>} {/* Display error message */}
                        <button type='submit' className='action'>Verify Me</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
