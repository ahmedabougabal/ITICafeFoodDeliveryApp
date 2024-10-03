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
    <section style={{ minHeight: '100vh', marginTop: '50px' }} className="d-flex justify-content-center align-items-center">
  <div className="container bg-light p-4 rounded shadow-sm" style={{ maxWidth: '400px', backgroundColor: '#e8e8e8' }}>
    <div className="text-center mb-4">
    </div>
    <form onSubmit={handleSubmit}>
    <h2 className="text-black">Reset password</h2>
      <input type="hidden" name="_redirect" value="https://jamstacker.studio/thankyou" />

      {/* Password Field */}
      <div className="form-group mb-4">
        <label htmlFor="password" className="form-label">Password</label>
        <input 
          type="password" 
          name="password" 
          className="form-control" 
          id="password" 
          placeholder="**********"
          value={password} 
          onChange={handleChange} 
        />
        {errors.password && (
          <p className="text-danger mt-2">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="form-group mb-4">
        <label htmlFor="confirm_password" className="form-label">Confirm password</label>
        <input 
          type="password" 
          name="confirm_password" 
          className="form-control" 
          id="confirm_password" 
          placeholder="***********"
          value={confirm_password} 
          onChange={handleChange} 
        />
        {errors.confirm_password && (
          <p className="text-danger mt-2">{errors.confirm_password}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button type="submit" className="btn btn-dark w-100 rounded-pill">
          Submit
        </button>
      </div>
    </form>
  </div>
</section>


  );
}

export default ResetPassword;



/* From Uiverse.io by emmanuelh-dev */ 






// {/* <div>
// <div className='form-container'>
//   <div className='wrapper' style={{ width: "100%" }}>
//     <h2>Enter your New Password</h2>
//     <form onSubmit={handleSubmit}>
//       <div className='form-group'>
//         <label>New Password:</label>
//         <input
//           type="password"
//           className='email-form'
//           name="password"
//           value={password}
//           onChange={handleChange}
//         />
//         {/* Display validation message for password */}
//         {errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}
//       </div>

//       <div className='form-group'>
//         <label>Confirm Password:</label>
//         <input
//           type="password"
//           className='email-form'
//           name="confirm_password"
//           value={confirm_password}
//           onChange={handleChange}
//         />
//         {/* Display validation message for confirm password */}
//         {errors.confirm_password && <p style={{ color: 'red' }}>{errors.confirm_password}</p>}
//       </div>

//       <button type='submit' className='vbtn'>Submit</button>
//     </form>
//   </div>
// </div>
// </div> */}