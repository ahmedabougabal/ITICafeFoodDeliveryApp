import React, { useState } from 'react';
import { toast } from 'react-toastify';
import AxiosInstance from '../../utils/AxiosInstance';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './user.css'
const PasswordResetRequest = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize navigate

  // Email validation regex pattern
  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate if email is empty
    if (!email) {
      setError('Email is required');
      toast.error('Please enter your email');
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      setError('Invalid email format');
      toast.error('Please enter a valid email address');
      return;
    }

    // Clear error if validation passes
    setError('');

    try {
      const res = await AxiosInstance.post('/password-reset', { email });

      if (res.status === 200) {
        console.log(res.data);
        toast.success('A link to reset your password has been sent to your email');
        setEmail('');

        // Redirect to login page after successful submission
        setTimeout(() => {
          navigate('/login'); // Redirect to login page
        }, 2000); // Adding a 2-second delay before redirecting
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again later.');
    }
  };

  return (
    <div>
      <h2>Enter your registered email</h2>
      <div className="wrapper">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address:</label>
            <input
              type="text"
              className={`email-form ${error ? 'is-invalid' : ''}`} // Optional styling for invalid input
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {/* Display error message under the field */}
            {error && <p className="error-message" style={{ color: 'red', marginTop: '5px' }}>{error}</p>}
          </div>
          <button className="vbtn">Send</button>
        </form>
      </div>
    </div>
  );
};

export default PasswordResetRequest;
