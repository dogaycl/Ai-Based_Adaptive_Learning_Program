import React, { useEffect, useState } from 'react';
import API from '../api/axiosConfig';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Plus, Trash2, BookOpen, Users, TrendingUp, AlertTriangle } from 'lucide-react';

const TeacherDashboard = () => {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Mock Analytics Data (Backend'de bu endpoint henüz yok, o yüzden görselleştirmek için mock veriyoruz)
    // Gerçek projede bunu backend'den çekebilirsin.
    const analyticsData = [
        { name: 'Intro AI', passRate: 85, students: 40 },
        { name: 'Neural Nets', passRate: 45, students: 38 },
        { name: 'Python Basics', passRate: 92, students: 42 },
        { name: 'Data Science', passRate: 60, students: 35 },
    ];

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        try {
            const res = await API.get('/lessons/');
            setLessons(Array.isArray(res.data) ? res.data : []);
            setLoading(false);
        } catch (error) {
            toast.error("Failed to load curriculum.");
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this lesson? All associated questions will be lost.")) return;
        try {
            await API.delete(`/lessons/${id}`);
            toast.success("Lesson deleted successfully.");
            fetchLessons(); 
        } catch (error) {
            toast.error("Could not delete lesson.");
        }
    };

    return (
        <div className="pb-20 space-y-8">
            {/* Header */}
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

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl"><Users size={24} /></div>
                        <div>
                            <div className="text-2xl font-black text-dark-gray">42</div>
                            <div className="text-sm font-bold text-gray-400 uppercase">Active Students</div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl"><AlertTriangle size={24} /></div>
                        <div>
                            <div className="text-2xl font-black text-dark-gray">Neural Nets</div>
                            <div className="text-sm font-bold text-gray-400 uppercase">Hardest Topic</div>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-soft-green"/> Class Performance (Pass Rate %)
                    </h3>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsData}>
                                <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                                <Bar dataKey="passRate" radius={[8, 8, 8, 8]} barSize={40}>
                                    {analyticsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.passRate < 50 ? '#EF4444' : '#4A7C44'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Lesson List */}
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
                                            <BookOpen size={16} /> View Questions
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
                            {lessons.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="4" className="p-10 text-center text-gray-400">No lessons found. Start by creating one!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;