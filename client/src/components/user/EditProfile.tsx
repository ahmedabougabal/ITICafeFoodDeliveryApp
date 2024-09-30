// EditProfile.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AxiosInstance from "../../utils/AxiosInstance";

const BRANCHES = {
    "New Capital": "NEW Capital",
    "Mansoura": "Mansoura",
    "Cairo University": "Cairo University",
    "Smart Village": "Smart Village",
    "Aswan": "Aswan",
    "Asuit": "Asuit",
    "Qena": "Qena",
    "Menia": "Menia",
    "Menofia": "Menofia",
    "Beni Suef": "Beni Suef",
    "Sohag": "Sohag",
    "Asmalilia": "Asmalilia",
    "Alexandria": "Alexandria"
};

const EditProfile = () => {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        branch: '',
        phone_number: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await AxiosInstance.get('/profile');
                setProfileData(response.data);
            } catch (error) {
                toast.error('Failed to fetch profile data');
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await AxiosInstance.put('/profile/update', profileData);
            toast.success('Profile updated successfully');
            navigate('/profile'); // Redirect to profile after updating
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    return (
        <div className="form-container">
            <div className="wrapper">
                <h2>Edit Profile</h2>
                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label>First Name:</label>
                        <input
                            type="text"
                            name="first_name"
                            value={profileData.first_name}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='form-group'>
                        <label>Last Name:</label>
                        <input
                            type="text"
                            name="last_name"
                            value={profileData.last_name}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='form-group'>
                        <label>Branch:</label>
                        <select
                            name="branch"
                            value={profileData.branch}
                            onChange={handleChange}
                        >
                            <option value="">Select a branch</option>
                            {Object.entries(BRANCHES).map(([key, value]) => (
                                <option key={key} value={key}>
                                    {value}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='form-group'>
                        <label>Phone Number:</label>
                        <input
                            type="text"
                            name="phone_number"
                            value={profileData.phone_number}
                            onChange={handleChange}
                        />
                    </div>
                    <input type="submit" value="Save Changes" className="submitButton" />
                </form>
            </div>
        </div>
    );
};

export default EditProfile;
