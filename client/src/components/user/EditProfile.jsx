import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AxiosInstance from "../../utils/AxiosInstance";
import './profile.css';

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
        phone_number: ''
    });

    const [errorMessages, setErrorMessages] = useState({
        first_name: "",
        last_name: "",
        branch: "",
        phone_number: ""
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
        setErrorMessages({ ...errorMessages, [e.target.name]: "" }); // Clear error message on change
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = { first_name: "", last_name: "", branch: "", phone_number: "" };

        // Validate first name
        if (!profileData.first_name) {
            newErrors.first_name = 'First name is required';
            isValid = false;
        }

        // Validate last name
        if (!profileData.last_name) {
            newErrors.last_name = 'Last name is required';
            isValid = false;
        }

        // Validate branch
        if (!profileData.branch) {
            newErrors.branch = 'Branch is required';
            isValid = false;
        }

        // Validate phone number
        const phoneRegex = /^[0-9]{11}$/; // Example: Must be 10 digits
        if (!phoneRegex.test(profileData.phone_number)) {
            newErrors.phone_number = 'Phone number must be 11 digits';
            isValid = false;
        }

        setErrorMessages(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return; // Prevent submission if validation fails

        try {
            await AxiosInstance.put('/profile/update', profileData);
            toast.success('Profile updated successfully');
            navigate('/profile');
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    return (
        <div className='form-container'>
            <div className='wrapper'>
                <form onSubmit={handleSubmit}>
                    <h2>Edit Profile</h2>
                    <div className='form-group'>
                        <label>First Name:</label>
                        <input 
                            type="text" 
                            name="first_name" 
                            value={profileData.first_name} 
                            onChange={handleChange} 
                        />
                        {errorMessages.first_name && <div className="error-message">{errorMessages.first_name}</div>} {/* Display error */}
                    </div>
                    <div className='form-group'>
                        <label>Last Name:</label>
                        <input 
                            type="text" 
                            name="last_name" 
                            value={profileData.last_name} 
                            onChange={handleChange} 
                        />
                        {errorMessages.last_name && <div className="error-message">{errorMessages.last_name}</div>} {/* Display error */}
                    </div>
                    <div className='form-group'>
                        <label>Email Address:</label>
                        <input type="email" name="email" value={profileData.email} disabled />
                    </div>
                    <div className='form-group'>
                        <label>Branch:</label>
                        <select name="branch" value={profileData.branch} onChange={handleChange}>
                            <option value="">Select a branch</option>
                            {Object.keys(BRANCHES).map(branchName => (
                                <option key={branchName} value={branchName}>{BRANCHES[branchName]}</option>
                            ))}
                        </select>
                        {errorMessages.branch && <div className="error-message">{errorMessages.branch}</div>} {/* Display error */}
                    </div>
                    <div className='form-group'>
                        <label>Phone Number:</label>
                        <input 
                            type="text" 
                            name="phone_number" 
                            value={profileData.phone_number} 
                            onChange={handleChange} 
                        />
                        {errorMessages.phone_number && <div className="error-message">{errorMessages.phone_number}</div>} {/* Display error */}
                    </div>
                    <input type="submit" value="Update" className="submitButton" />
                </form>
            </div>
        </div>
    );
};

export default EditProfile;
