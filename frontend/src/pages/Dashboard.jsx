import React, { useEffect, useState } from 'react';
import API from '../api/axiosConfig';
import { getUserInfo } from '../utils/authUtils';
import { useNavigate } from 'react-router-dom';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
    LineChart, Line, CartesianGrid, Legend 
} from 'recharts';
import { BookOpen, Activity, AlertCircle, TrendingUp, CheckCircle, Clock, Zap } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [summary, setSummary] = useState(null);
    const [trend, setTrend] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [aiRecommendation, setAiRecommendation] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const user = getUserInfo();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statusRes, statsRes, aiRes, lessonsRes, summaryRes, trendRes] = await Promise.all([
                    API.get(`/auth/me/${user.id}`),
                    API.get(`/history/stats/${user.id}`).catch(() => ({ data: { accuracy: 0 } })),
                    API.get(`/recommendation/next-step/${user.id}`).catch(() => ({ data: null })),
                    API.get('/lessons/'),
                    API.get(`/history/summary/${user.id}`).catch(() => ({ data: {} })),
                    API.get(`/history/trend/${user.id}`).catch(() => ({ data: [] }))
                ]);
                
                if (user.role === 'student' && !statusRes.data.is_placement_completed) {
                    navigate('/placement-test');
                    return;
                }

                setUserData(statusRes.data);
                setStats(statsRes.data);
                setAiRecommendation(aiRes.data);
                setLessons(Array.isArray(lessonsRes.data) ? lessonsRes.data : []);
                setSummary(summaryRes.data);
                setTrend(trendRes.data);
            } catch (error) {
                console.error("Dashboard Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user.id, navigate, user.role]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-soft-green font-bold text-xl">Loading AI Interface...</div>;

    // Grafik için veriyi hazırla
    const chartData = [
        { name: 'Accuracy', value: stats?.accuracy || 0 },
        { name: 'Target', value: 85 },
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
                
                {/* SAĞ ÜST KÖŞE: XP ve ACCURACY */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
                    <div className="text-center">
                        <div className="text-xs text-gray-400 uppercase font-bold">Total XP</div>
                        <div className="text-xl font-black text-soft-green">{(stats?.total_correct || 0) * 10}</div>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div className="text-center">
                        <div className="text-xs text-gray-400 uppercase font-bold">Accuracy</div>
                        {/* BURASI GÜNCELLENDİ: .toFixed(2) EKLENDİ */}
                        <div className="text-xl font-black text-dark-gray">
                            %{stats?.accuracy ? Number(stats.accuracy).toFixed(2) : '0.00'}
                        </div>
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

            {/* 3. Analytics Grid (Matrix & Trend) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* SOL: AI Performance Matrix (Tablo) */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <TrendingUp className="text-blue-500" size={20} /> AI Performance Matrix
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-400 font-bold">
                                <tr>
                                    <th className="p-3 rounded-tl-xl">Topic</th>
                                    <th className="p-3">Level</th>
                                    <th className="p-3 rounded-tr-xl">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {summary?.lesson_breakdown && Object.keys(summary.lesson_breakdown).length > 0 ? (
                                    Object.entries(summary.lesson_breakdown).map(([title, score], index) => {
                                        let statusBadge;
                                        if (score >= 80) statusBadge = <span className="text-green-600 bg-green-50 px-2 py-1 rounded font-bold text-xs">Mastered</span>;
                                        else if (score >= 50) statusBadge = <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded font-bold text-xs">Learning</span>;
                                        else statusBadge = <span className="text-red-500 bg-red-50 px-2 py-1 rounded font-bold text-xs">Critical</span>;

                                        return (
                                            <tr key={index} className="border-b border-gray-50 last:border-0">
                                                <td className="p-3 font-bold text-dark-gray">{title}</td>
                                                <td className="p-3">
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5 w-16">
                                                        <div className={`h-1.5 rounded-full ${score < 50 ? 'bg-red-400' : 'bg-soft-green'}`} style={{width: `${score}%`}}></div>
                                                    </div>
                                                </td>
                                                <td className="p-3">{statusBadge}</td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr><td colSpan="3" className="p-4 text-center text-gray-400 italic">No data yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SAĞ: Learning Progress Trend (Çizgi Grafik) */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Zap className="text-yellow-500" size={20} /> Learning Velocity
                    </h3>
                    <div className="h-64 w-full min-h-[250px]">
                        {trend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tick={{fontSize: 10}} stroke="#9CA3AF" />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                                        formatter={(value, name, props) => [`${value} pts`, props.payload.lesson]}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="score" 
                                        stroke="#4A7C44" 
                                        strokeWidth={3} 
                                        dot={{r: 4, fill: '#4A7C44', strokeWidth: 2, stroke: '#fff'}} 
                                        activeDot={{r: 6}}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                                <Activity size={32} className="mb-2 opacity-20" />
                                Not enough data for trend analysis.
                            </div>
                        )}
                    </div>
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
                                    onClick={() => navigate(`/lesson/${lesson.id}`)} 
                                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                                        isCritical 
                                        ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200' 
                                        : 'bg-soft-gray text-dark-gray hover:bg-soft-green hover:text-white'
                                    }`}
                                >
                                    {isCritical ? <Activity size={18} /> : <BookOpen size={18} />}
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