import React, { useEffect, useState } from 'react';
import API from '../api/axiosConfig';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Plus, Trash2, BookOpen, Users, TrendingUp, AlertTriangle, X } from 'lucide-react';

const TeacherDashboard = () => {
    const [lessons, setLessons] = useState([]);
    // Başlangıç değerlerini boş array olarak tanımlıyoruz ki hata vermesin
    const [analytics, setAnalytics] = useState({ students: [], lessons: [], total_students: 0 });
    const [loading, setLoading] = useState(true);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [lessonsRes, analyticsRes] = await Promise.all([
                API.get('/lessons/'),
                API.get('/history/teacher/analytics')
            ]);
            
            // Veri güvenliği kontrolü
            setLessons(Array.isArray(lessonsRes.data) ? lessonsRes.data : []);
            setAnalytics(analyticsRes.data || { students: [], lessons: [], total_students: 0 });
            setLoading(false);
        } catch (error) {
            console.error("Dashboard Error:", error);
            // Hata olsa bile sayfayı patlatma, loading'i kapat
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this lesson?")) return;
        try {
            await API.delete(`/lessons/${id}`);
            toast.success("Lesson deleted.");
            fetchDashboardData(); 
        } catch (error) {
            toast.error("Could not delete lesson.");
        }
    };

    return (
        <div className="pb-20 space-y-8 relative">
            {/* --- HEADER --- */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-dark-gray">Teacher Dashboard</h1>
                    <p className="text-gray-500">Manage curriculum and monitor student progress.</p>
                </div>
                <button 
                    onClick={() => navigate('/teacher/add-lesson')}
                    className="bg-soft-green text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-soft-green/30 hover:-translate-y-1 transition flex items-center gap-2"
                >
                    <Plus size={20} /> Create New Lesson
                </button>
            </div>

            {/* --- ANALYTICS SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Sol: İstatistik Kartları */}
                <div className="space-y-6">
                    {/* Active Students Card - TIKLANABİLİR */}
                    <div 
                        onClick={() => setShowStudentModal(true)}
                        className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:shadow-md transition group"
                    >
                        <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl group-hover:bg-blue-100 transition"><Users size={24} /></div>
                        <div>
                            <div className="text-2xl font-black text-dark-gray">{analytics.total_students}</div>
                            <div className="text-sm font-bold text-gray-400 uppercase group-hover:text-blue-500 transition">Active Students (View)</div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl"><BookOpen size={24} /></div>
                        <div>
                            <div className="text-2xl font-black text-dark-gray">{lessons.length}</div>
                            <div className="text-sm font-bold text-gray-400 uppercase">Total Lessons</div>
                        </div>
                    </div>
                </div>

                {/* Sağ: Gerçek Verili Grafik */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-soft-green"/> Class Performance (Pass Rate %)
                    </h3>
                    
                    {/* min-h-[250px] ile grafik hatasını önledik */}
                    <div className="h-64 w-full min-h-[250px]">
                        {analytics.lessons && analytics.lessons.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.lessons}>
                                    <XAxis 
                                        dataKey="name" 
                                        tick={{fontSize: 10}} 
                                        interval={0} 
                                        height={50} 
                                        angle={-15} 
                                        textAnchor="end" 
                                        axisLine={false} 
                                        tickLine={false} 
                                    />
                                    <Tooltip 
                                        cursor={{fill: 'transparent'}} 
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} 
                                        formatter={(value) => [`${value}%`, 'Pass Rate']}
                                    />
                                    <Bar dataKey="passRate" radius={[8, 8, 8, 8]} barSize={40}>
                                        {analytics.lessons.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.passRate < 50 ? '#EF4444' : '#4A7C44'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                                <AlertTriangle className="mb-2 opacity-50" size={32} />
                                No performance data yet. Wait for students to take quizzes.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- LESSON LIST --- */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-xl text-dark-gray">Curriculum Management</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-xs">
                            <tr>
                                <th className="p-6">Lesson Title</th>
                                <th className="p-6">Difficulty</th>
                                <th className="p-6">Content</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {lessons.map((lesson) => (
                                <tr key={lesson.id} className="hover:bg-gray-50 transition">
                                    <td className="p-6 font-bold text-dark-gray">{lesson.title}</td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${
                                            lesson.difficulty === 'hard' ? 'bg-red-100 text-red-500' :
                                            lesson.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-green-100 text-green-600'
                                        }`}>
                                            {lesson.difficulty}
                                        </span>
                                    </td>
                                    <td className="p-6 text-sm text-gray-500 max-w-xs truncate">{lesson.description}</td>
                                    <td className="p-6 flex justify-end gap-4">
                                        <Link 
                                            to={`/teacher/view-questions/${lesson.id}`} 
                                            className="text-soft-green font-bold text-sm hover:underline flex items-center gap-1"
                                        >
                                            <BookOpen size={16} /> Questions
                                        </Link>
                                        <Link 
                                            to={`/teacher/add-question/${lesson.id}`} 
                                            className="text-blue-500 font-bold text-sm hover:underline flex items-center gap-1"
                                        >
                                            <Plus size={16} /> Add Q
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(lesson.id)}
                                            className="text-gray-300 hover:text-red-500 transition"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- STUDENT LIST MODAL --- */}
            {showStudentModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-black text-dark-gray">Student Performance List</h2>
                                <p className="text-sm text-gray-500">Real-time stats for all registered students.</p>
                            </div>
                            <button onClick={() => setShowStudentModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        
                        <div className="max-h-[60vh] overflow-y-auto p-2">
                            <table className="w-full text-left">
                                <thead className="text-xs uppercase text-gray-400 font-bold bg-white sticky top-0">
                                    <tr>
                                        <th className="p-4">Student</th>
                                        <th className="p-4">Questions Solved</th>
                                        <th className="p-4">Total XP</th>
                                        <th className="p-4">Accuracy</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {analytics.students.length > 0 ? (
                                        analytics.students.map(student => (
                                            <tr key={student.id} className="hover:bg-gray-50 transition">
                                                <td className="p-4">
                                                    <div className="font-bold text-dark-gray">{student.username}</div>
                                                    <div className="text-xs text-gray-400">{student.email}</div>
                                                </td>
                                                <td className="p-4 font-medium text-gray-600">{student.total_solved}</td>
                                                <td className="p-4 font-black text-soft-green">{student.total_xp} XP</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                                            <div 
                                                                className={`h-1.5 rounded-full ${student.accuracy >= 50 ? 'bg-soft-green' : 'bg-red-400'}`} 
                                                                style={{width: `${student.accuracy}%`}}
                                                            ></div>
                                                        </div>
                                                        <span className={`text-xs font-bold ${student.accuracy >= 50 ? 'text-green-600' : 'text-red-500'}`}>
                                                            {student.accuracy}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-gray-400">No students found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                            <button onClick={() => setShowStudentModal(false)} className="text-gray-500 font-bold text-sm hover:text-dark-gray">
                                Close List
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;