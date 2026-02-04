import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom'; // Link importunu unutma
import API from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { Trash2, Zap, Loader2, ArrowLeft } from 'lucide-react'; // İkonları ekle

const ViewQuestions = () => {
    const { lessonId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false); // AI yükleniyor durumu

    useEffect(() => {
        fetchQuestions();
    }, [lessonId]);

    const fetchQuestions = async () => {
        try {
            const res = await API.get(`/questions/lesson/${lessonId}`);
            setQuestions(res.data);
            setLoading(false);
        } catch (error) {
            toast.error("Error loading questions.");
            setLoading(false);
        }
    };

    // --- YENİ FONKSİYON: AI Soru Üretme ---
    const handleGenerateAI = async () => {
        setGenerating(true);
        try {
            toast.info("AI is analyzing the topic and generating questions...");
            const res = await API.post(`/questions/generate/${lessonId}`);
            toast.success(res.data.message);
            fetchQuestions(); // Listeyi yenile
        } catch (error) {
            console.error(error);
            toast.error("AI Generation failed. Check backend logs.");
        } finally {
            setGenerating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await API.delete(`/questions/${id}`);
            toast.success("Deleted.");
            fetchQuestions();
        } catch (error) {
            toast.error("Delete failed.");
        }
    };

    if (loading) return <div className="text-center py-20 font-bold text-soft-green">Loading Content...</div>;

    return (
        <div className="max-w-4xl mx-auto py-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <Link to="/teacher-dashboard" className="text-gray-400 text-sm font-bold flex items-center gap-1 hover:text-soft-green mb-2">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <h2 className="text-3xl font-black text-dark-gray">Question Bank</h2>
                    <p className="text-gray-500">Manage questions for Lesson #{lessonId}</p>
                </div>

                <div className="flex gap-3">
                    {/* --- AI BUTONU --- */}
                    <button 
                        onClick={handleGenerateAI}
                        disabled={generating}
                        className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 hover:-translate-y-1 transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {generating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                        {generating ? "AI Generating..." : "Generate with AI"}
                    </button>

                    <Link 
                        to={`/teacher/add-question/${lessonId}`} 
                        className="bg-soft-green text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-soft-green/30 hover:-translate-y-1 transition flex items-center gap-2"
                    >
                         + Add Manually
                    </Link>
                </div>
            </div>

            {/* Questions List */}
            {questions.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                    <p className="text-gray-400 mb-4">No questions yet.</p>
                    <button onClick={handleGenerateAI} className="text-purple-600 font-bold hover:underline">
                        Let AI create the first 3 questions?
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {questions.map((q) => (
                        <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition group">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-soft-gray text-gray-500 text-xs font-black px-2 py-1 rounded uppercase">
                                    Difficulty: {q.difficulty_level}
                                </span>
                                <button onClick={() => handleDelete(q.id)} className="text-gray-300 hover:text-red-500 transition">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            
                            <h3 className="text-lg font-bold text-dark-gray mb-4">{q.content}</h3>
                            
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
                                            <span className="ml-auto text-[10px] font-black uppercase text-soft-green bg-soft-green/10 px-2 py-1 rounded">CORRECT</span>
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