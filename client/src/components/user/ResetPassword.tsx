import React, { useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import AxiosInstance from '../../utils/AxiosInstance';
const ResetPassword = () => {
  const navigate = useNavigate();
  const { uid, token } = useParams();
  const [newPasswords, setNewPassword] = useState({
    password: "",
    confirm_password: "",
  });
  const { password, confirm_password } = newPasswords;

  const handleChange = (e) => {
    setNewPassword({ ...newPasswords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Check if password meets criteria
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirm_password) {
      toast.error("Passwords do not match.");
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
              <label htmlFor="">New Password:</label>
              <input
                type="password" // Change type to password for better security
                className='email-form'
                name="password"
                value={password}
                onChange={handleChange}
              />
            </div>
            <div className='form-group'>
              <label htmlFor="">Confirm Password</label>
              <input
                type="password" // Change type to password for better security
                className='email-form'
                name="confirm_password"
                value={confirm_password}
                onChange={handleChange}
              />
            </div>
            <button type='submit' className='vbtn'>Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
