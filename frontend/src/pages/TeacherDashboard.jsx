import React, { useEffect, useState } from 'react';
import API from '../api/axiosConfig';
import { Link } from 'react-router-dom';
import { getUserInfo } from '../utils/authUtils';

const TeacherDashboard = () => {
    const [lessons, setLessons] = useState([]);
    const user = getUserInfo();

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        try {
            const res = await API.get('/lessons/');
            setLessons(res.data);
        } catch (error) {
            console.error("Error fetching lessons", error);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Teacher Management Panel</h1>
                <Link to="/teacher/add-lesson" style={addBtnStyle}>+ Add New Lesson</Link>
            </div>
            
            <p>Welcome, Instructor {user?.sub}. Here you can manage your curriculum.</p>

            <table style={tableStyle}>
                <thead>
                    <tr style={{ backgroundColor: '#f4f4f4' }}>
                        <th style={thStyle}>Lesson Title</th>
                        <th style={thStyle}>Difficulty</th>
                        <th style={thStyle}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {lessons.map(lesson => (
                        <tr key={lesson.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={tdStyle}>{lesson.title}</td>
                            <td style={tdStyle}>{lesson.difficulty.toUpperCase()}</td>
                            <td style={tdStyle}>
                                <Link to={`/teacher/add-question/${lesson.id}`} style={actionLinkStyle}>Add Questions</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Styles
const addBtnStyle = { padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', textDecoration: 'none', borderRadius: '5px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
const thStyle = { padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' };
const tdStyle = { padding: '12px' };
const actionLinkStyle = { color: '#2196f3', textDecoration: 'none', fontWeight: 'bold' };

export default TeacherDashboard;