import React, { useState } from 'react';
import API from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'student' // Default role
    });
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await API.post('/auth/register', formData);
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            alert('Registration Error: ' + (error.response?.data?.detail || 'Something went wrong'));
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
            <h2>Create Account</h2>
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '10px' }}>
                <input 
                    type="text" placeholder="Username" 
                    onChange={(e) => setFormData({...formData, username: e.target.value})} required 
                />
                <input 
                    type="email" placeholder="Email" 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} required 
                />
                <input 
                    type="password" placeholder="Password" 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} required 
                />
                <select onChange={(e) => setFormData({...formData, role: e.target.value})}>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                </select>
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;