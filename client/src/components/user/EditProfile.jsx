import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AxiosInstance from "../../utils/AxiosInstance";
//client/src/UserContext.tsx
import {useUser} from '../../UserContext';
import './EditProfile.css';

const BRANCHES = {
    "1": "New Capital",
    "2": "Smart Village",
    "3": "Mansoura",
    "4": "Alexandria",
    "5": "Beni Sweif",
    "6": "Assuit",
    "7": "Cairo",
    "8": "Giza",
    "9": "Port Said",
    "10": "Aswan",
    "11": "El Minya",
    "12": "Sohag",
};

const EditProfile = () => {
    const navigate = useNavigate();
    const { setUser } = useUser(); // Use setUser from context
    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        branch: '',
        phone_number: ''
    });

    const [errorMessages, setErrorMessages] = useState({});

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
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: name === 'branch' ? value : value
        }));
        setErrorMessages(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!profileData.first_name) newErrors.first_name = 'First name is required';
        if (!profileData.last_name) newErrors.last_name = 'Last name is required';
        if (!profileData.branch) newErrors.branch = 'Branch is required';
        if (!/^[0-9]{11}$/.test(profileData.phone_number)) {
            newErrors.phone_number = 'Phone number must be 11 digits';
        }
        setErrorMessages(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const apiData = { ...profileData };
            if (apiData.branch) {
                apiData.branch = parseInt(apiData.branch);
            }
            const response = await AxiosInstance.put('/profile/update', apiData);

            // Update the user context with the new data
            setUser({
                full_name: `${apiData.first_name} ${apiData.last_name}`,
                email: response.data.email // Assuming the email is returned in the response
            });

            toast.success('Profile updated successfully');
            navigate('/profile');
        } catch (error) {
            if (error.response?.data) {
                const backendErrors = error.response.data;
                const newErrors = {};
                Object.entries(backendErrors).forEach(([key, value]) => {
                    newErrors[key] = Array.isArray(value) ? value[0] : value;
                });
                setErrorMessages(newErrors);
                toast.error('Please correct the errors in the form.');
            } else {
                toast.error('Failed to update profile');
            }
        }
    };

    return (
        <div className="container-xl px-4 mt-4">
            <hr className="mt-0 mb-4" />
            <div className="row">
                <div className="col-xl-4">
                    {/* Profile picture card */}
                    <div className="card mb-4 mb-xl-0">
                        <div className="card-header">Profile Picture</div>
                        <div className="card-body text-center">
                            <img className="img-account-profile rounded-circle mb-2" src="http://bootdey.com/img/Content/avatar/avatar1.png" alt="" />
                        </div>
                    </div>
                </div>
                <div className="col-xl-8">
                    {/* Account details card */}
                    <div className="card mb-4">
                        <div className="card-header">Account Details</div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>First Name:</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={profileData.first_name}
                                        onChange={handleChange}
                                        className="form-control"
                                    />
                                    {errorMessages.first_name && <div className="error-message text-danger">{errorMessages.first_name}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Last Name:</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={profileData.last_name}
                                        onChange={handleChange}
                                        className="form-control"
                                    />
                                    {errorMessages.last_name && <div className="error-message text-danger">{errorMessages.last_name}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Email Address:</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileData.email}
                                        disabled
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Branch:</label>
                                    <select
                                        name="branch"
                                        value={profileData.branch}
                                        onChange={handleChange}
                                        className="form-control"
                                    >
                                        <option value="">Select a branch</option>
                                        {Object.entries(BRANCHES).map(([key, value]) => (
                                            <option key={key} value={key}>{value}</option>
                                        ))}
                                    </select>
                                    {errorMessages.branch && <div className="error-message text-danger">{errorMessages.branch}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Phone Number:</label>
                                    <input
                                        type="text"
                                        name="phone_number"
                                        value={profileData.phone_number}
                                        onChange={handleChange}
                                        className="form-control"
                                    />
                                    {errorMessages.phone_number && <div className="error-message text-danger">{errorMessages.phone_number}</div>}
                                </div>
                                <input type="submit" value="Update" className="btn btn-primary mt-3" />
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;