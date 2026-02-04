import React, { useEffect, useState } from 'react';
import API from '../api/axiosConfig';
import { getUserInfo } from '../utils/authUtils';
import { useNavigate } from 'react-router-dom';
import { 
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart 
} from 'recharts';
import { 
    BookOpen, Activity, Zap, TrendingUp, CheckCircle, 
    Clock, Target, BrainCircuit, ArrowRight, Star
} from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [summary, setSummary] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [aiRecommendation, setAiRecommendation] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const user = getUserInfo();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Paralel veri çekimi
                const [statusRes, statsRes, aiRes, lessonsRes, summaryRes] = await Promise.all([
                    API.get(`/auth/me/${user.id}`),
                    API.get(`/history/stats/${user.id}`).catch(() => ({ data: { accuracy: 0, total_correct: 0, total_questions: 0 } })),
                    API.get(`/recommendation/next-step/${user.id}`).catch(() => ({ data: null })),
                    API.get('/lessons/'),
                    API.get(`/history/summary/${user.id}`).catch(() => ({ data: { lesson_breakdown: {} } }))
                ]);
                
                setUserData(statusRes.data);
                setStats(statsRes.data);
                setAiRecommendation(aiRes.data);
                setLessons(lessonsRes.data);
                setSummary(summaryRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Dashboard Veri Hatası:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, [user.id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-soft-gray">
            <div className="flex flex-col items-center gap-4 animate-pulse">
                <BrainCircuit size={48} className="text-soft-green" />
                <span className="text-lg font-bold text-gray-500">Syncing with AI Coach...</span>
            </div>
        </div>
    );

    // Grafik Verisi Hazırlığı (Çizgi Grafik İçin)
    const chartData = summary?.lesson_breakdown 
        ? Object.entries(summary.lesson_breakdown).map(([name, score]) => ({ name, score })) 
        : [];

    return (
        <div className="min-h-screen bg-soft-gray py-8 px-4 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* --- 1. HOŞGELDİN & AI KOÇ KARTI --- */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Sol: Selamlama ve Özet */}
                    <div className="md:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-dark-gray mb-1">
                                Hello, {userData?.username || 'Student'}! 👋
                            </h1>
                            <p className="text-gray-500 text-sm mb-6">Ready to expand your mind today?</p>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                                    <div className="bg-white p-2 rounded-lg shadow-sm text-soft-green">
                                        <Target size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Current Level</p>
                                        <p className="font-bold text-dark-gray">Level {userData?.current_level || 1} Scholar</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                                    <div className="bg-white p-2 rounded-lg shadow-sm text-blue-500">
                                        <Star size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Total XP</p>
                                        <p className="font-bold text-dark-gray">{stats?.total_correct * 10 || 0} XP</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sağ: AI Tavsiyesi */}
                    <div className="md:col-span-2 bg-gradient-to-br from-soft-green to-green-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        
                        {aiRecommendation ? (
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-3 opacity-90">
                                        <Zap className="animate-pulse" size={20} />
                                        <span className="text-xs font-bold uppercase tracking-widest">AI Coach Insight</span>
                                    </div>
                                    <h2 className="text-3xl font-bold mb-3 leading-tight text-white">
                                        {aiRecommendation.title}
                                    </h2>
                                    <p className="text-green-100 text-lg mb-6 max-w-xl leading-relaxed">
                                        "{aiRecommendation.message}"
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-3 mb-6">
                                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-medium border border-white/10">
                                            Reason: {aiRecommendation.reason}
                                        </span>
                                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-medium border border-white/10">
                                            Tip: {aiRecommendation.adaptive_tip}
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => {
                                        const targetLesson = lessons.find(l => l.title === aiRecommendation.target_lesson);
                                        if (targetLesson) navigate(`/lesson/${targetLesson.id}`);
                                    }}
                                    className="self-start bg-white text-soft-green px-8 py-3 rounded-xl font-bold hover:bg-green-50 transition shadow-lg flex items-center gap-2 group-hover:translate-x-1 duration-300"
                                >
                                    {aiRecommendation.recommended_action} <ArrowRight size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p>AI is analyzing your learning path...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- 2. İSTATİSTİKLER VE LİSTE (ÇİZGİ GRAFİK BURADA) --- */}
                <div className="grid lg:grid-cols-3 gap-8">
                    
                    {/* Sol Kolon: Başarı Grafiği (LineChart) */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-dark-gray mb-6 flex items-center gap-2">
                            <TrendingUp className="text-soft-green" /> Performance Trends
                        </h3>
                        <div className="h-64">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4A7C44" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#4A7C44" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                        <Tooltip 
                                            cursor={{ stroke: '#4A7C44', strokeWidth: 1 }}
                                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="score" 
                                            stroke="#4A7C44" 
                                            strokeWidth={3}
                                            fillOpacity={1} 
                                            fill="url(#colorScore)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <Activity size={32} className="mb-2 opacity-50" />
                                    <p>Complete a quiz to see your analytics.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sağ Kolon: Ders Listesi */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-dark-gray flex items-center gap-2">
                                <BookOpen className="text-soft-green" /> Curriculum
                            </h3>
                            <span className="text-xs font-bold bg-green-100 text-soft-green px-2 py-1 rounded-lg">
                                {lessons.length} Modules
                            </span>
                        </div>
                        
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {lessons.map((lesson) => (
                                <div 
                                    key={lesson.id} 
                                    onClick={() => navigate(`/lesson/${lesson.id}`)}
                                    className="group p-4 rounded-2xl border border-gray-100 hover:border-soft-green hover:bg-green-50/30 transition cursor-pointer flex items-center gap-3"
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm ${
                                        lesson.difficulty === 'hard' ? 'bg-red-400' : 
                                        lesson.difficulty === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                                    }`}>
                                        {lesson.difficulty.substring(0, 1).toUpperCase()}
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-dark-gray text-sm group-hover:text-soft-green transition">
                                            {lesson.title}
                                        </h4>
                                        <p className="text-xs text-gray-400 line-clamp-1">{lesson.description}</p>
                                    </div>
                                    <div className="text-gray-300 group-hover:text-soft-green transition">
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;