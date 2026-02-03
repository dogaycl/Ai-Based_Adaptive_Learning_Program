import React, { useEffect, useState } from 'react';
import API from '../api/axiosConfig';
import { getUserInfo } from '../utils/authUtils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [aiRecommendation, setAiRecommendation] = useState(null);
    const [userData, setUserData] = useState(null);
    const user = getUserInfo();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Ensure backend server is running!
                const [statusRes, statsRes, aiRes, lessonsRes] = await Promise.all([
                    API.get(`/auth/me/${user.id}`),
                    API.get(`/history/stats/${user.id}`).catch(() => ({ data: { accuracy: 0 } })),
                    API.get(`/recommendation/next-step/${user.id}`).catch(() => ({ data: null })),
                    API.get('/lessons/')
                ]);
                
                if (user.role === 'student' && !statusRes.data.is_placement_completed) {
                    navigate('/placement-test');
                    return;
                }

                setUserData(statusRes.data);
                setStats(statsRes.data);
                setAiRecommendation(aiRes.data);
                setLessons(Array.isArray(lessonsRes.data) ? lessonsRes.data : []);
            } catch (error) {
                console.error("Dashboard Error:", error);
                toast.error("Error loading dashboard data.");
            }
        };
        fetchData();
    }, []);

    if (!userData) return <div className="text-center py-20 font-bold">Synchronizing your learning path...</div>;

    return (
        <div className="space-y-8 pb-12">
            <div className="bg-white p-8 rounded-3xl shadow-sm border flex flex-col md:flex-row gap-8 items-center">
                <div className="h-20 w-20 bg-soft-green text-white rounded-full flex items-center justify-center text-2xl font-black">
                    Lvl {userData.current_level}
                </div>
                <div className="flex-grow">
                    <h1 className="text-2xl font-bold text-dark-gray">Welcome, {userData.username}!</h1>
                    <div className="h-3 w-full bg-gray-100 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-soft-green" style={{ width: `${stats?.accuracy || 0}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-gradient-to-br from-soft-green to-[#2d5a27] text-white p-8 rounded-3xl shadow-xl">
                    <h2 className="text-3xl font-black mb-2">{aiRecommendation?.recommended_action || "Start Learning"}</h2>
                    <p className="opacity-80 mb-6">{aiRecommendation?.reason || "AI is analyzing your profile."}</p>
                    <div className="bg-black/10 p-4 rounded-xl text-sm italic italic">"{aiRecommendation?.adaptive_tip || "Take a placement test to unlock tips."}"</div>
                </div>

                <div className="bg-white p-8 rounded-3xl border shadow-sm">
                    <h3 className="font-bold mb-4">Activity Log</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-gray-400">Accuracy</span><span className="font-bold">{stats?.accuracy || 0}%</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-400">Level</span><span className="font-bold">{userData.current_level}</span></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {lessons.map(lesson => (
                    <div key={lesson.id} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition">
                        <span className="text-[10px] font-black uppercase text-soft-green bg-soft-gray px-2 py-1 rounded">{lesson.difficulty}</span>
                        <h4 className="text-xl font-bold mt-3 mb-2">{lesson.title}</h4>
                        <button onClick={() => navigate(`/quiz/${lesson.id}`)} className="w-full mt-4 bg-soft-green text-white py-2 rounded-xl font-bold">Start Quiz</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;