import React, { useEffect, useState } from 'react';
import API from '../api/axiosConfig';
import { getUserInfo } from '../utils/authUtils';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [aiRecommendation, setAiRecommendation] = useState(null);
    const user = getUserInfo();
    const navigate = useNavigate();

    // Dashboard.jsx içinde:
// Dashboard.jsx içindeki useEffect
useEffect(() => {
    const checkAndFetch = async () => {
        try {
            // 1. Önce kullanıcının durumunu kontrol et
            const statusRes = await API.get(`/auth/me/${user.id}`);
            
            if (user.role === 'student' && !statusRes.data.is_placement_completed) {
                // Test çözülmemişse direkt yönlendir
                navigate('/placement-test');
                return;
            }

            // 2. Test çözülmüşse verileri getir
            const [statsRes, aiRes, lessonsRes] = await Promise.all([
                API.get(`/history/stats/${user.id}`),
                API.get(`/recommendation/next-step/${user.id}`),
                API.get('/lessons/')
            ]);
            
            setStats(statsRes.data);
            setAiRecommendation(aiRes.data);
            setLessons(lessonsRes.data);
            
        } catch (error) {
            console.error("Dashboard error:", error);
            // Eğer istatistik yoksa (yeni kullanıcı) stats'ı boş bir obje yap ki loading'den çıksın
            setStats({ accuracy: 0, total_solved: 0, total_time_seconds: 0 });
        }
    };

    if (user && user.id) {
        checkAndFetch();
    }
}, [user, navigate]);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, aiRes, lessonsRes] = await Promise.all([
                API.get(`/history/stats/${user.id}`),
                API.get(`/recommendation/next-step/${user.id}`),
                API.get('/lessons/')
            ]);
            setStats(statsRes.data);
            setAiRecommendation(aiRes.data);
            setLessons(lessonsRes.data);
        } catch (error) {
            console.error("Error fetching dashboard data", error);
        }
    };

    const startQuiz = (lessonId) => {
        navigate(`/quiz/${lessonId}`);
    };

    if (!stats) return <div style={{ padding: '20px' }}>Loading your progress...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
            <h1>Welcome back, {user.sub}!</h1>
            
            <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div style={cardStyle}><h3>Accuracy</h3><p style={statValue}>{stats.accuracy.toFixed(1)}%</p></div>
                <div style={cardStyle}><h3>Solved</h3><p style={statValue}>{stats.total_solved}</p></div>
                <div style={cardStyle}><h3>Study Time</h3><p style={statValue}>{Math.floor(stats.total_time_seconds / 60)} min</p></div>
            </section>

            {aiRecommendation && (
                <section style={aiSectionStyle}>
                    <h2 style={{ color: '#1976d2' }}>🤖 AI Learning Assistant</h2>
                    <p><strong>Recommendation:</strong> {aiRecommendation.recommended_action}</p>
                    <p><strong>Reason:</strong> {aiRecommendation.reason}</p>
                </section>
            )}

            <h2 style={{ marginTop: '30px' }}>Available Lessons</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {lessons.map(lesson => (
                    <div key={lesson.id} style={lessonCardStyle}>
                        <h4>{lesson.title}</h4>
                        <p>{lesson.description}</p>
                        <small>Difficulty: {lesson.difficulty}</small>
                        <button onClick={() => startQuiz(lesson.id)} style={startBtnStyle}>Start Quiz</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const cardStyle = { padding: '15px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' };
const aiSectionStyle = { backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '10px', borderLeft: '5px solid #2196f3' };
const statValue = { fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' };
const lessonCardStyle = { padding: '15px', border: '1px solid #ccc', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '5px' };
const startBtnStyle = { marginTop: '10px', padding: '8px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default Dashboard;