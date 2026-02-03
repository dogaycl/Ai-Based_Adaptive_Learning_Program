import React, { useEffect, useState } from 'react';
import API from '../api/axiosConfig';
import { Link, useNavigate } from 'react-router-dom';
import { getUserInfo } from '../utils/authUtils';
import { toast } from 'react-toastify';

const TeacherDashboard = () => {
    const [lessons, setLessons] = useState([]);
    const [report, setReport] = useState({ total_students: 84, avg_accuracy: 72, active_lessons: 0 });
    const user = getUserInfo();
    const navigate = useNavigate();

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        try {
            // Sonda bölü işaretiyle (/lessons/) çağırıyoruz
            const res = await API.get('/lessons/');
            const lessonData = Array.isArray(res.data) ? res.data : [];
            setLessons(lessonData);
            setReport(prev => ({ 
                ...prev, 
                active_lessons: lessonData.length 
            }));
        } catch (error) {
            console.error("Dersler yüklenirken hata oluştu:", error.response?.data);
            toast.error("Müfredat listelenemedi.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bu dersi silmek istediğinize emin misiniz?")) return;
        try {
            await API.delete(`/lessons/${id}`);
            toast.success("Ders başarıyla silindi.");
            fetchLessons(); 
        } catch (error) {
            toast.error("Silme işlemi başarısız.");
        }
    };

    return (
        <div className="space-y-10 pb-10">
            {/* Üst Başlık ve Buton */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-dark-gray">Eğitmen Paneli</h1>
                    <p className="text-gray-400 font-medium italic">Hoş geldiniz, {user?.sub}</p>
                </div>
                <Link to="/teacher/add-lesson" className="bg-soft-green text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition">
                    + Yeni Ders Ekle
                </Link>
            </div>

            {/* İstatistikler */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Aktif Öğrenciler</span>
                    <div className="text-4xl font-black mt-2 text-blue-500">{report.total_students}</div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Ort. Başarı</span>
                    <div className="text-4xl font-black mt-2 text-soft-green">%{report.avg_accuracy}</div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Müfredat Boyutu</span>
                    <div className="text-4xl font-black mt-2 text-purple-500">{report.active_lessons} Ders</div>
                </div>
            </div>

            {/* Müfredat Tablosu */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-6 text-sm font-bold text-gray-500 uppercase">Ders Başlığı</th>
                            <th className="p-6 text-sm font-bold text-gray-500 uppercase">Zorluk</th>
                            <th className="p-6 text-sm font-bold text-gray-500 uppercase text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {lessons.length > 0 ? (
                            lessons.map(lesson => (
                                <tr key={lesson.id} className="hover:bg-gray-50 transition">
                                    <td className="p-6">
                                        <div className="font-bold text-dark-gray">{lesson.title}</div>
                                        <div className="text-xs text-gray-400 truncate max-w-xs">{lesson.description}</div>
                                    </td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 bg-soft-gray rounded-full text-[10px] font-black uppercase text-soft-green">
                                            {lesson.difficulty}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right space-x-6">
                                        <Link 
                                            to={`/teacher/view-questions/${lesson.id}`} 
                                            className="text-blue-500 font-bold text-sm hover:underline"
                                        >
                                            Soruları Gör
                                        </Link>
                                        <Link 
                                            to={`/teacher/add-question/${lesson.id}`} 
                                            className="text-soft-green font-bold text-sm hover:underline"
                                        >
                                            + Soru Ekle
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(lesson.id)}
                                            className="text-gray-300 font-bold text-sm hover:text-red-400 transition"
                                        >
                                            Sil
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="p-10 text-center text-gray-400">Henüz ders eklenmemiş.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeacherDashboard;