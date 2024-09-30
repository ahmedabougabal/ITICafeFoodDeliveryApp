import React, { useState } from 'react';
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import styled from 'styled-components';
import { FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';

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

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(135deg, #e0f7fa, #80deea);
    padding: 1rem;
    box-sizing: border-box;
`;

const FormWrapper = styled.div`
    background: white;
    padding: 1.5rem 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;

    h2 {
        margin-bottom: 1rem;
        text-align: center;
        color: #053271;
        font-family: 'Roboto', sans-serif;
        font-weight: 500;
    }
`;

const FormGroup = styled.div`
    margin-bottom: 1rem;

    label {
        display: block;
        margin-bottom: 0.3rem;
        font-weight: bold;
        font-size: 0.85rem;
        color: #053271;
    }

    input, select {
        width: 100%;
        padding: 0.5rem;
        border: 1.5px solid #80deea;
        border-radius: 6px;
        font-size: 0.9rem;
        transition: border 0.3s;

        &:focus {
            border-color: #053271;
            outline: none;
        }
    }

    button {
        background: transparent;
        border: none;
        color: #1b1b1b;
        cursor: pointer;
        font-size: 0.85rem;
        margin-top: 0.3rem;

        &:hover {
            color: #053271;
        }
    }
`;

const SubmitButton = styled.input`
    background-color: #053271;
    color: white;
    border: none;
    padding: 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    width: 100%;
    transition: background 0.3s;

    &:hover {
        background-color: #1b1b1b;
    }
`;

const LoginLink = styled.button`
    background: none;
    border: none;
    color: #053271;
    cursor: pointer;
    text-align: center;
    display: block;
    margin-top: 0.5rem;
    font-size: 0.85rem;

    &:hover {
        text-decoration: underline;
    }
`;

const GoogleButton = styled.button`
    width: 100%;
    background: #db4437;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem;
    font-size: 1rem;
    margin-top: 0.5rem;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
        background: #c13527;
    }
`;

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        first_name: "",
        last_name: "",
        branch: "",
        phone_number: "",
        password: "",
        confirm_password: "",
        user_type: "user"
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        const { email, first_name, last_name, branch, phone_number, password, confirm_password } = formData;
        if (!email || !first_name || !last_name || !branch || !phone_number || !password || !confirm_password) {
            toast.error("All fields are required.");
            return false;
        }
        if (password !== confirm_password) {
            toast.error("Passwords do not match.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const response = await axios.post('http://127.0.0.1:8000/api-auth/register', formData);
            if (response.status === 201) {
                toast.success('SignUp Successful. Verify Your Email');
                navigate("/otp/verify");
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                toast.error("Email already exists.");
            } else {
                toast.error("An unexpected error occurred.");
            }
        }
    };

    return (
        <Container>
            <FormWrapper>
                <form onSubmit={handleSubmit}>
                    <h2>Create Account</h2>
                    <FormGroup>
                        <label>First Name:</label>
                        <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} />
                    </FormGroup>
                    <FormGroup>
                        <label>Last Name:</label>
                        <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} />
                    </FormGroup>
                    <FormGroup>
                        <label>Email Address:</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} />
                    </FormGroup>
                    <FormGroup>
                        <label>Branch:</label>
                        <select name="branch" value={formData.branch} onChange={handleChange}>
                            <option value="">Select Branch</option>
                            {Object.keys(BRANCHES).map(branchName => (
                                <option key={branchName} value={branchName}>{BRANCHES[branchName]}</option>
                            ))}
                        </select>
                    </FormGroup>
                    <FormGroup>
                        <label>Phone Number:</label>
                        <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} />
                    </FormGroup>
                    <FormGroup>
                        <label>Password:</label>
                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </FormGroup>
                    <FormGroup>
                        <label>Confirm Password:</label>
                        <input type={showConfirmPassword ? "text" : "password"} name="confirm_password" value={formData.confirm_password} onChange={handleChange} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </FormGroup>
                    <SubmitButton type="submit" value="Submit" />
                    <GoogleButton>
                        <FaGoogle /> Sign up with Google
                    </GoogleButton>
                    <LoginLink onClick={() => navigate("/login")}>
                        Already have an account? Log In
                    </LoginLink>
                </form>
            </FormWrapper>
        </Container>
    );
};

export default Signup;