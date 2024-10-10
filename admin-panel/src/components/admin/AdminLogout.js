import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const signOut = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      // Make a request to the backend to invalidate the token
      const response = await axios.post('http://localhost:8000/api/admin/logout/', {
        refresh_token: refreshToken
      });
      console.log('Logout response:', response.data);
    } else {
      console.log('No refresh token found in local storage');
    }
    
    // Remove the auth tokens from local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    
    // Display a logout message
    toast.success('Logged out successfully!', {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    
    // this line delays the redirection to ensure the toast message is visible
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 5000); // 5000ms (5 seconds) delay to match the autoClose duration of the toast
  } catch (error) {
    console.error('Error during sign out:', error.response ? error.response.data : error.message);
    // Even if the logout request fails, we should still clear local storage and redirect
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    
    // Display an error message
    toast.error('Logout failed. Please try again.', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    
    // this line delays the redirection to ensure the toast message is visible (UI)
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 2000); 
  }
};

export default signOut;