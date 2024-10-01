import { useEffect, useState } from 'react';
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
        user_type: '' // Include user_type in the state
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
                        <input type="text" name="first_name" value={profileData.first_name} onChange={handleChange} />
                    </div>
                    <div className='form-group'>
                        <label>Last Name:</label>
                        <input type="text" name="last_name" value={profileData.last_name} onChange={handleChange} />
                    </div>
                    <div className='form-group'>
                        <label>Email Address:</label>
                        <input type="email" name="email" value={profileData.email} disabled />
                    </div>
                    <div className='form-group'>
                        <label>Branch:</label>
                        <select name="branch" value={profileData.branch} onChange={handleChange}>
                            {Object.keys(BRANCHES).map(branchName => (
                                <option key={branchName} value={branchName}>{BRANCHES[branchName]}</option>
                            ))}
                        </select>
                    </div>
                    <div className='form-group'>
                        <label>Phone Number:</label>
                        <input type="text" name="phone_number" value={profileData.phone_number} onChange={handleChange} />
                    </div>
                    <div className='form-group'>
                        <label>User Type:</label>
                        <select name="user_type" value={profileData.user_type} onChange={handleChange}>
                            <option value="user">User</option>
                            <option value="instructor">Instructor</option>
                        </select>
                    </div>
                    <input type="submit" value="Update" className="submitButton" />
                </form>
            </div>
        </div>
    );
};

export default EditProfile;
