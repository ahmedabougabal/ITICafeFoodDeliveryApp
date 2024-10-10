import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import './AdminLogin.css'; 
import backgroundImage1 from '../../assets/images/edit.jpg'; 
import backgroundImage2 from '../../assets/images/4.jpeg'; 

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [currentBackground, setCurrentBackground] = useState(backgroundImage1);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (localStorage.getItem('authToken')) {
      navigate('/dashboard');
    }

    // Change background image every 5 seconds
    const interval = setInterval(() => {
      setCurrentBackground((prevBackground) =>
        prevBackground === backgroundImage1 ? backgroundImage2 : backgroundImage1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/api/admin/login/', {
        email,
        password
      });

      localStorage.setItem('authToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      
      // this will Redirect to the page admin user is trying to access, or to dashboard (default)
      const { from } = location.state || { from: { pathname: "/dashboard" } };
      navigate(from);
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="admin-login-container">
      <CSSTransition
        in={true}
        appear={true}
        timeout={1000}
        classNames="background"
      >
        <div className="background-image" style={{ backgroundImage: `url(${currentBackground})` }}></div>
      </CSSTransition>
      <form onSubmit={handleLogin} className="admin-login-form">
        <h2>Admin Login</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit" className="login-button">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;