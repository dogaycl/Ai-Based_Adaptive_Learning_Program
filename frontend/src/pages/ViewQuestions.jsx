import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axiosConfig';
import { toast } from 'react-toastify';

const ViewQuestions = () => {
    const { lessonId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuestions();
    }, [lessonId]);

    const fetchQuestions = async () => {
        try {
            const res = await API.get(`/questions/lesson/${lessonId}`);
            setQuestions(res.data);
            setLoading(false);
        } catch (error) {
            toast.error("Sorular yüklenirken bir hata oluştu.");
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bu soruyu silmek istediğinize emin misiniz?")) return;
        try {
            await API.delete(`/questions/${id}`);
            toast.success("Soru silindi.");
            fetchQuestions();
        } catch (error) {
            toast.error("Soru silinemedi.");
        }
    };

    if (loading) return <div className="text-center py-20">Sorular yükleniyor...</div>;

    return (
        <div className="max-w-4xl mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-dark-gray">Soru Bankası: Ders #{lessonId}</h2>
                <Link to="/teacher-dashboard" className="text-soft-green font-bold hover:underline">
                    ← Paneli Dön
                </Link>
            </div>

            {questions.length === 0 ? (
                <div className="bg-white p-10 rounded-3xl text-center shadow-sm border">
                    <p className="text-gray-400">Bu derse henüz soru eklenmemiş.</p>
                    <Link to={`/teacher/add-question/${lessonId}`} className="text-soft-green font-bold block mt-4">+ İlk Soruyu Ekle</Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {questions.map((q, index) => (
                        <div key={q.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative group">
                            <div className="flex justify-between items-start mb-4">
                                <span className="h-8 w-8 bg-soft-gray rounded-full flex items-center justify-center font-bold text-soft-green">
                                    {index + 1}
                                </span>
                                <button 
                                    onClick={() => handleDelete(q.id)}
                                    className="text-gray-300 hover:text-red-500 transition font-bold text-sm"
                                >
                                    Soruyu Sil
                                </button>
                            </div>
                            
                            <p className="text-lg font-medium text-dark-gray mb-6">{q.content}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    { key: 'A', text: q.option_a },
                                    { key: 'B', text: q.option_b },
                                    { key: 'C', text: q.option_c },
                                    { key: 'D', text: q.option_d }
                                ].map((opt) => (
                                    <div 
                                        key={opt.key}
                                        className={`p-3 rounded-xl border flex items-center gap-3 ${
                                            q.correct_answer === opt.key 
                                            ? 'border-soft-green bg-soft-green/5 ring-1 ring-soft-green' 
                                            : 'border-gray-100'
                                        }`}
                                    >
                                        <span className={`font-bold ${q.correct_answer === opt.key ? 'text-soft-green' : 'text-gray-400'}`}>
                                            {opt.key}:
                                        </span>
                                        <span className={q.correct_answer === opt.key ? 'font-bold text-dark-gray' : 'text-gray-600'}>
                                            {opt.text}
                                        </span>
                                        {q.correct_answer === opt.key && (
                                            <span className="ml-auto text-[10px] font-black uppercase text-soft-green bg-soft-green/10 px-2 py-1 rounded">DOĞRU CEVAP</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViewQuestions;