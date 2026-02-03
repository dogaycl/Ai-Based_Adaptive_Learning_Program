import React, { useEffect, useState } from 'react';
import API from '../api/axiosConfig';
import { getUserInfo } from '../utils/authUtils';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BookOpen, Trophy, Target, AlertCircle, Activity } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [aiRecommendation, setAiRecommendation] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const user = getUserInfo();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statusRes, statsRes, aiRes, lessonsRes] = await Promise.all([
                    API.get(`/auth/me/${user.id}`),
                    API.get(`/history/stats/${user.id}`).catch(() => ({ data: { accuracy: 0 } })),
                    API.get(`/recommendation/next-step/${user.id}`).catch(() => ({ data: null })),
                    API.get('/lessons/')
                ]);
                
                // Redirect if placement not completed
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
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user.id, navigate, user.role]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-soft-green font-bold text-xl">Loading AI Interface...</div>;

    // Chart Data Preparation
    const chartData = [
        { name: 'Accuracy', value: stats?.accuracy || 0 },
        { name: 'Target', value: 85 }, // Target goal
    ];

    return (
        <div className="space-y-8 pb-10">
            {/* 1. Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-dark-gray">
                        Welcome back, <span className="text-soft-green">{userData?.username}</span>!
                    </h1>
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                        <span className="bg-soft-green/10 text-soft-green px-3 py-1 rounded-full text-xs font-bold uppercase">
                            Level {userData?.current_level}
                        </span>
                        Your personalized learning path is ready.
                    </p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
                    <div className="text-center">
                        <div className="text-xs text-gray-400 uppercase font-bold">Total XP</div>
                        <div className="text-xl font-black text-soft-green">{(stats?.total_correct || 0) * 10}</div>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div className="text-center">
                        <div className="text-xs text-gray-400 uppercase font-bold">Accuracy</div>
                        <div className="text-xl font-black text-dark-gray">%{stats?.accuracy || 0}</div>
                    </div>
                </div>
            </div>

            {/* 2. AI Recommendation Engine Area */}
            {aiRecommendation && (
                <div className={`p-6 rounded-3xl border-l-8 shadow-sm transition-all ${
                    aiRecommendation.is_critical 
                    ? 'bg-red-50 border-red-500 shadow-red-100' 
                    : 'bg-white border-soft-green'
                }`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${aiRecommendation.is_critical ? 'bg-red-100 text-red-500' : 'bg-soft-green/10 text-soft-green'}`}>
                            {aiRecommendation.is_critical ? <AlertCircle size={24} /> : <Activity size={24} />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-bold text-lg ${aiRecommendation.is_critical ? 'text-red-600' : 'text-dark-gray'}`}>
                                    AI Insight: {aiRecommendation.recommended_action}
                                </h3>
                                {aiRecommendation.is_critical && (
                                    <span className="animate-pulse bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase">Critical</span>
                                )}
                            </div>
                            <p className="text-gray-600 mb-2">{aiRecommendation.reason}</p>
                            <div className="bg-black/5 inline-block px-3 py-1 rounded-lg text-sm font-medium text-gray-600 italic">
                                💡 Tip: {aiRecommendation.adaptive_tip}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Analytics & Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Chart Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 col-span-2">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Activity className="text-soft-green" size={20} /> Performance Analytics
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" barSize={20}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#4A7C44' : '#E5E7EB'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-soft-green text-white p-6 rounded-3xl shadow-lg flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                    <div>
                        <h3 className="font-bold opacity-90">Study Streak</h3>
                        <div className="text-5xl font-black mt-2">3 <span className="text-2xl font-medium">Days</span></div>
                    </div>
                    <button className="bg-white text-soft-green py-3 rounded-xl font-bold mt-6 hover:bg-gray-100 transition">
                        View Calendar
                    </button>
                </div>
            </div>

            {/* 4. Curriculum Grid */}
            <div>
                <h3 className="font-bold text-xl text-dark-gray mb-6 flex items-center gap-2">
                    <BookOpen size={24} className="text-soft-green" /> 
                    Your Curriculum
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lessons.map(lesson => {
                        // Check if this lesson is the target of AI recommendation
                        const isRecommended = aiRecommendation?.target_lesson === lesson.title;
                        const isCritical = isRecommended && aiRecommendation?.is_critical;

                        return (
                            <div key={lesson.id} className={`bg-white p-6 rounded-2xl border transition group relative overflow-hidden ${
                                isCritical 
                                ? 'border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] ring-1 ring-red-400' 
                                : 'border-gray-100 hover:shadow-md'
                            }`}>
                                {isCritical && (
                                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                                        Focus Here
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                                        lesson.difficulty === 'hard' ? 'bg-purple-100 text-purple-600' : 
                                        lesson.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' : 
                                        'bg-green-100 text-green-600'
                                    }`}>
                                        {lesson.difficulty}
                                    </span>
                                </div>
                                
                                <h4 className="text-lg font-bold text-dark-gray mb-2 group-hover:text-soft-green transition">{lesson.title}</h4>
                                <p className="text-gray-400 text-sm mb-6 line-clamp-2">{lesson.description}</p>
                                
                                <button 
                                    onClick={() => navigate(`/quiz/${lesson.id}`)} 
                                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                                        isCritical 
                                        ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200' 
                                        : 'bg-soft-gray text-dark-gray hover:bg-soft-green hover:text-white'
                                    }`}
                                >
                                    {isCritical ? <Target size={18} /> : <BookOpen size={18} />}
                                    {isCritical ? "Critical Practice" : "Start Lesson"}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;