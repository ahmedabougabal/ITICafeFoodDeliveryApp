import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import AxiosInstance from "../../utils/AxiosInstance";
import './user.css';
const Profile = () => {
    const jwt = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!jwt || !user) {
            navigate('/login');
        } else {
            getUserProfile();
        }
    }, [jwt, user, navigate]);

    const getUserProfile = async () => {
        try {
            const res = await AxiosInstance.get('/profile');
            setUserData(res.data);
        } catch (error) {
            toast.error("Failed to fetch user data.");
        }
    };

    const handleLogout = async () => {
        try {
            const refresh = JSON.parse(localStorage.getItem('refresh_token'));
            await AxiosInstance.post('/logout', { 'refresh_token': refresh });
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            navigate('/login');
            toast.warn("Logout successful");
        } catch (error) {
            toast.error("Logout failed.");
        }
    };

    return (
        <div className='profile-container'>
            <p>Welcome to your profile</p>
            {userData ? (
                <div className="profile-info">
                    <p><strong>First Name:</strong> {userData.first_name}</p>
                    <p><strong>Last Name:</strong> {userData.last_name}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <p><strong>Branch:</strong> {userData.branch}</p>
                    <p><strong>Phone Number:</strong> {userData.phone_number}</p>
                </div>
            ) : (
                <p>Loading user data...</p>
            )}
            <button onClick={handleLogout} className='logout-btn'>Logout</button>
            <button onClick={() => navigate('/profile/edit')} className="edit-button">Edit Profile</button>
        </div>
    );
};

export default Profile;