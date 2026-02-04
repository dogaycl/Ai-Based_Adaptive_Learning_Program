import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';
import { BookOpen, FileText, ArrowRight, Download } from 'lucide-react';

const LessonView = () => {
    const { lessonId } = useParams();
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const res = await API.get(`/lessons/${lessonId}`);
                setLesson(res.data);
            } catch (error) {
                console.error("Ders yüklenemedi", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLesson();
    }, [lessonId]);

    if (loading) return <div className="text-center py-20 text-soft-green font-bold">Loading Content...</div>;
    if (!lesson) return <div className="text-center py-20">Lesson not found.</div>;

    // Dosya uzantısını kontrol et (Basit mantık)
    const isImage = lesson.attachment_url?.match(/\.(jpeg|jpg|gif|png)$/) != null;
    const isPDF = lesson.attachment_url?.match(/\.(pdf)$/) != null;

    return (
        <div className="max-w-4xl mx-auto py-10">
            {/* Header */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${
                        lesson.difficulty === 'hard' ? 'bg-red-100 text-red-500' :
                        lesson.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                    }`}>
                        {lesson.difficulty}
                    </span>
                    <span className="text-gray-400 text-sm">Learning Module</span>
                </div>
                <h1 className="text-4xl font-black text-dark-gray mb-4">{lesson.title}</h1>
                <p className="text-gray-600 text-lg leading-relaxed">{lesson.description}</p>
            </div>

            {/* Content Body */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sol: Metin İçeriği */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-soft-green mb-6 flex items-center gap-2">
                        <BookOpen size={24} /> Lecture Notes
                    </h2>
                    <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-loose">
                        {lesson.content_text || "No text content available."}
                    </div>
                </div>

                {/* Sağ: Ek Dosyalar ve Aksiyon */}
                <div className="space-y-6">
                    {/* Attachment Card */}
                    {lesson.attachment_url && (
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-dark-gray mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-blue-500" /> Attached Material
                            </h3>
                            
                            {/* Dosya Önizleme Mantığı */}
                            <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 mb-4">
                                {isImage ? (
                                    <img src={lesson.attachment_url} alt="Attachment" className="w-full h-48 object-cover" />
                                ) : isPDF ? (
                                    <iframe src={lesson.attachment_url} className="w-full h-64" title="PDF Preview"></iframe>
                                ) : (
                                    <div className="p-8 text-center text-gray-400 text-sm">
                                        Preview not available for this file type.
                                    </div>
                                )}
                            </div>

                            <a 
                                href={lesson.attachment_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block w-full text-center bg-blue-50 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-100 transition flex items-center justify-center gap-2"
                            >
                                <Download size={18} /> Open / Download File
                            </a>
                        </div>
                    )}

                    {/* Action Card */}
                    <div className="bg-soft-green text-white p-8 rounded-3xl shadow-lg text-center">
                        <h3 className="font-bold text-xl mb-2">Ready to Test?</h3>
                        <p className="opacity-90 text-sm mb-6">Complete the quiz to earn XP and update your AI profile.</p>
                        <button 
                            onClick={() => navigate(`/quiz/${lesson.id}`)}
                            className="w-full bg-white text-soft-green py-4 rounded-xl font-bold hover:bg-gray-100 transition flex items-center justify-center gap-2"
                        >
                            Start Quiz <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonView;