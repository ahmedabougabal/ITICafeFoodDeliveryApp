import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import AxiosInstance from "../../utils/AxiosInstance"; // Ensure this is correctly set up
import './profile.css';

const BRANCHES = {
    "1": "New Capital",
    "2": "Mansoura",
    "3": "Cairo University",
    "4": "Assuit"
};

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
        <div className="page-content page-container" id="page-content">
            <div className="padding">
                <div className="row container d-flex justify-content-center">
                    <div className="col-xl-6 col-md-12">
                        <div className="card user-card-full">
                            <div className="row m-l-0 m-r-0">
                                <div className="col-sm-4 bg-c-lite-green user-profile">
                                    <div className="card-block text-center text-white">
                                        <div className="m-b-25">
                                            <img src="https://img.icons8.com/bubbles/100/000000/user.png" className="img-radius" alt="User-Profile-Image" />
                                        </div>
                                        <h6 className="f-w-600">{userData ? `${userData.first_name}` : "Loading..."}</h6>
                                        <p>Web Developer</p>
                                        <i className="mdi mdi-square-edit-outline feather icon-edit m-t-10 f-16" onClick={() => navigate('/profile/edit')}></i>
                                    </div>
                                </div>
                                <div className="col-sm-8">
                                    <div className="card-block">
                                        <h6 className="m-b-20 p-b-5 b-b-default f-w-600">Information</h6>
                                        <div className="row">
                                            <div className="col-sm-12">
                                                <p className="m-b-10 f-w-600">Full Name</p>
                                                <h6 className="text-muted f-w-400">{userData ? userData.first_name+" "+userData.last_name  : "Loading..."}</h6>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-8">
                                                <p className="m-b-10 f-w-600">Email</p>
                                                <h6 className="text-muted f-w-400">{userData ? userData.email : "Loading..."}</h6>
                                            </div>
                                            <div className="col-sm-4">
                                                <p className="m-b-10 f-w-600">Phone</p>
                                                <h6 className="text-muted f-w-400">{userData ? userData.phone_number : "Loading..."}</h6>
                                            </div>
                                        </div>
                                        <h6 className="m-b-20 m-t-40 p-b-5 b-b-default f-w-600">Branch</h6>
                                        <div className="row">
                                            <div className="col-12">
                                                <h6 className="text-muted f-w-400">
                                                    {userData ? BRANCHES[userData.branch] || "Unknown" : "Loading..."}
                                                </h6>
                                            </div>
                                        </div>
                                        <h6 className="m-b-20 m-t-40 p-b-5 b-b-default f-w-600">User Type</h6>
                                        <div className="row">
                                            <div className="col-12">
                                                <h6 className="text-muted f-w-400">{userData ? userData.user_type : "Loading..."}</h6>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between mt-3">
                                            <button onClick={handleLogout} className='btn btn-danger'>Logout</button>
                                            <button onClick={() => navigate('/profile/edit')} className="btn btn-primary">Edit Profile</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;