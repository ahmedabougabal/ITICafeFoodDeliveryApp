import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const VerifyEmail = () => {
    const [otp, setOtp] = useState("");
    const [isVerified, setIsVerified] = useState(false); // New state for verification status
    const navigate = useNavigate();

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        if (otp) {
            try {
                const res = await axios.post('http://127.0.0.1:8000/api-auth/verify-email', { otp });
                if (res.status === 200) {
                    setIsVerified(true); // Set verification status to true
                    toast.success('Email verified successfully');
                    navigate('/login'); // Optionally navigate after a short delay
                }
            } catch (error) {
                console.error("Error response:", error.response);
                if (error.response?.status === 400) {
                    toast.error('Invalid OTP code');
                } else {
                    toast.error(error.response?.data?.detail || 'An unexpected error occurred');
                }
            }
        } else {
            toast.error('Please enter the OTP code');
        }
    };

    return (
        <div>
            <div className='form-container'>
                {isVerified ? (
                    <h3>Email verified successfully</h3> // Message when verified
                ) : (
                    <form action="" style={{ width: "30%" }} onSubmit={handleOtpSubmit}>
                        <div className='form-group'>
                            <label htmlFor="">Enter your OTP code:</label>
                            <input type="text"
                                className='email-form'
                                name="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>
                        <button type='submit' className='vbtn'>Send</button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default VerifyEmail;
