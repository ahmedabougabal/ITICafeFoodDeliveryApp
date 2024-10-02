import React, { useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import AxiosInstance from '../../utils/AxiosInstance';
import './user.css'
const ResetPassword = () => {
  const navigate = useNavigate();
  const { uid, token } = useParams();
  const [newPasswords, setNewPassword] = useState({
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({ password: '', confirm_password: '' });

  const { password, confirm_password } = newPasswords;

  const handleChange = (e) => {
    setNewPassword({ ...newPasswords, [e.target.name]: e.target.value });
  };

  const validatePasswords = () => {
    const newErrors = { password: '', confirm_password: '' };

    if (!password) {
      newErrors.password = 'Password cannot be empty.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }

    if (!confirm_password) {
      newErrors.confirm_password = 'Confirm password cannot be empty.';
    } else if (password !== confirm_password) {
      newErrors.confirm_password = 'Passwords do not match.';
    }

    setErrors(newErrors);

    // If both errors are empty, validation passed
    return !newErrors.password && !newErrors.confirm_password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswords()) {
      return;
    }

    const data = {
      password,
      confirm_password,
      uidb64: uid,
      token,
    };

    try {
      const res = await AxiosInstance.put('/set-new-password', data);
      const response = res.data;

      if (res.status === 200) {
        navigate('/login');
        toast.success(response.message);
      }
    } catch (error) {
      toast.error("Failed to reset password. Please try again.");
    }
  };

  return (
    <div>
      <div className='form-container'>
        <div className='wrapper' style={{ width: "100%" }}>
          <h2>Enter your New Password</h2>
          <form onSubmit={handleSubmit}>
            <div className='form-group'>
              <label>New Password:</label>
              <input
                type="password"
                className='email-form'
                name="password"
                value={password}
                onChange={handleChange}
              />
              {/* Display validation message for password */}
              {errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}
            </div>

            <div className='form-group'>
              <label>Confirm Password:</label>
              <input
                type="password"
                className='email-form'
                name="confirm_password"
                value={confirm_password}
                onChange={handleChange}
              />
              {/* Display validation message for confirm password */}
              {errors.confirm_password && <p style={{ color: 'red' }}>{errors.confirm_password}</p>}
            </div>

            <button type='submit' className='vbtn'>Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
