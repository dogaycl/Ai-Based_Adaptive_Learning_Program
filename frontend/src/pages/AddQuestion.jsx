import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';
import { getUserInfo } from '../utils/authUtils';

const AddQuestion = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const user = getUserInfo();
    const [formData, setFormData] = useState({
        content: '',
        correct_answer: '',
        difficulty_level: 1
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData, lesson_id: parseInt(lessonId) };
            await API.post(`/questions/?role=${user.role}`, payload);
            alert("Question added!");
            setFormData({ content: '', correct_answer: '', difficulty_level: 1 });
        } catch (error) {
            alert("Error adding question.");
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
            <h2>Add Question to Lesson #{lessonId}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <textarea placeholder="Question Content" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} required style={inputStyle}/>
                <input type="text" placeholder="Correct Answer" value={formData.correct_answer} onChange={(e) => setFormData({...formData, correct_answer: e.target.value})} required style={inputStyle}/>
                <label>Difficulty (1-5): {formData.difficulty_level}</label>
                <input type="range" min="1" max="5" value={formData.difficulty_level} onChange={(e) => setFormData({...formData, difficulty_level: parseInt(e.target.value)})} />
                <button type="submit" style={submitBtnStyle}>Add Question</button>
                <button type="button" onClick={() => navigate('/teacher-dashboard')} style={{backgroundColor: '#666', color: 'white', border: 'none', padding: '10px'}}>Back to Dashboard</button>
            </form>
        </div>
    );
};

const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #ccc' };
const submitBtnStyle = { padding: '10px', backgroundColor: '#2196f3', color: 'white', border: 'none', cursor: 'pointer' };

export default AddQuestion;