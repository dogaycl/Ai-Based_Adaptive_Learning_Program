import React, { useState } from 'react';
import API from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { getUserInfo } from '../utils/authUtils';

const AddLesson = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const navigate = useNavigate();
    const user = getUserInfo();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // backend expects 'role' as a query param based on your routes
            await API.post(`/lessons/?role=${user.role}`, { title, description, difficulty });
            alert("Lesson created successfully!");
            navigate('/teacher-dashboard');
        } catch (error) {
            alert("Error creating lesson: " + error.response?.data?.detail);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
            <h2>Create New Lesson</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="text" placeholder="Lesson Title" value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle}/>
                <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} style={inputStyle}/>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={inputStyle}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
                <button type="submit" style={submitBtnStyle}>Create Lesson</button>
            </form>
        </div>
    );
};

const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #ccc' };
const submitBtnStyle = { padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' };

export default AddLesson;