import React, { useEffect, useState } from 'react';
import API from '../api/axiosConfig';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Plus, Trash2, BookOpen, Users, TrendingUp, AlertTriangle, X, Eye } from 'lucide-react';

const TeacherDashboard = () => {
    const [lessons, setLessons] = useState([]);
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
            
            setLessons(Array.isArray(lessonsRes.data) ? lessonsRes.data : []);
            setAnalytics(analyticsRes.data || { students: [], lessons: [], total_students: 0 });
            setLoading(false);
        } catch (error) {
            console.error("Dashboard Error:", error);
            setLoading(false);
            // toast.error("Veriler yüklenirken hata oluştu.");
        }
    };

    // --- SİLME FONKSİYONU (GÜNCELLENDİ) ---
    const handleDeleteLesson = async (id) => {
        if (!window.confirm("Are you sure you want to delete this lesson? All related questions and student data will be lost!")) {
            return;
        }

        try {
            await API.delete(`/lessons/${id}`);
            toast.success("Lesson deleted successfully");
            
            // Sayfayı yenilemeden listeyi güncelle (Optimistic Update)
            setLessons(lessons.filter(lesson => lesson.id !== id));
            
            // Analitikleri de güncellemek gerekebilir ama şimdilik dersi kaldırmak yeterli
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete lesson.");
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center text-soft-green font-bold animate-pulse">Loading Instructor Dashboard...</div>;

    return (
        <div className="min-h-screen bg-soft-gray py-8 px-4 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-3xl font-black text-dark-gray">Instructor Dashboard</h1>
                        <p className="text-gray-500">Manage curriculum and track student progress</p>
                    </div>
                    <Link to="/teacher/add-lesson" className="mt-4 md:mt-0 bg-soft-green text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition shadow-lg shadow-green-200">
                        <Plus size={20} /> Create New Lesson
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl"><BookOpen size={28} /></div>
                        <div>
                            <p className="text-gray-400 text-xs font-bold uppercase">Total Modules</p>
                            <p className="text-3xl font-black text-dark-gray">{lessons.length}</p>
                        </div>
                    </div>
                    <div 
                        onClick={() => setShowStudentModal(true)}
                        className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:border-soft-green transition"
                    >
                        <div className="p-4 bg-purple-50 text-purple-500 rounded-2xl"><Users size={28} /></div>
                        <div>
                            <p className="text-gray-400 text-xs font-bold uppercase">Active Students</p>
                            <p className="text-3xl font-black text-dark-gray">{analytics.total_students}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl"><TrendingUp size={28} /></div>
                        <div>
                            <p className="text-gray-400 text-xs font-bold uppercase">Avg. Pass Rate</p>
                            <p className="text-3xl font-black text-dark-gray">
                                {analytics.lessons.length > 0 
                                    ? Math.round(analytics.lessons.reduce((acc, curr) => acc + curr.passRate, 0) / analytics.lessons.length) 
                                    : 0}%
                            </p>
                        </div>
                    </div>
                </div>

                {/* Charts Area */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Lesson Performance Chart */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-dark-gray mb-6">Course Performance</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.lessons}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" hide />
                                    <YAxis />
                                    <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                                    <Bar dataKey="passRate" name="Pass Rate %" radius={[6, 6, 0, 0]}>
                                        {analytics.lessons.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.passRate < 50 ? '#EF4444' : '#4A7C44'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Lesson Management List */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-dark-gray mb-6">Manage Lessons</h3>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {lessons.map(lesson => (
                                <div key={lesson.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-12 rounded-full ${
                                            lesson.difficulty === 'hard' ? 'bg-red-400' : 
                                            lesson.difficulty === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                                        }`}></div>
                                        <div>
                                            <h4 className="font-bold text-dark-gray">{lesson.title}</h4>
                                            <p className="text-xs text-gray-400">{lesson.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => navigate(`/teacher/add-question/${lesson.id}`)}
                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                            title="Add Questions"
                                        >
                                            <Plus size={18} />
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/teacher/view-questions/${lesson.id}`)}
                                            className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition"
                                            title="View Questions"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteLesson(lesson.id)}
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                            title="Delete Lesson"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {lessons.length === 0 && (
                                <div className="text-center text-gray-400 py-8">No lessons created yet.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Student List Modal */}
            {showStudentModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-soft-green text-white">
                            <h3 className="font-bold text-xl">Enrolled Students</h3>
                            <button onClick={() => setShowStudentModal(false)} className="hover:bg-white/20 p-2 rounded-full transition">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="max-h-[60vh] overflow-y-auto p-0">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Student</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Solved</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Total XP</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Accuracy</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {analytics.students.length > 0 ? (
                                        analytics.students.map(student => (
                                            <tr key={student.id} className="hover:bg-gray-50 transition">
                                                <td className="p-4">
                                                    <p className="font-bold text-dark-gray">{student.username}</p>
                                                    <p className="text-xs text-gray-400">{student.email}</p>
                                                </td>
                                                <td className="p-4 font-medium text-gray-600">{student.total_solved}</td>
                                                <td className="p-4 font-bold text-blue-500">{student.total_xp}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                            <div 
                                                                style={{ width: `${student.accuracy}%` }} 
                                                                className={`h-full ${student.accuracy >= 50 ? 'bg-green-500' : 'bg-red-400'}`}
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