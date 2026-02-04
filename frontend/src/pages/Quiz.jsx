import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';
import { getUserInfo } from '../utils/authUtils';
import { toast } from 'react-toastify';
import { 
    Clock, CheckCircle, XCircle, Award, ArrowRight, 
    Target, Zap, Activity, Home, AlertCircle
} from 'lucide-react';

const Quiz = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const user = getUserInfo();

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30); 
    
    // UI Durumları
    const [loading, setLoading] = useState(true);
    const [isFinished, setIsFinished] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // AI Analiz Verisi
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, [lessonId]);

    // Sayaç Mantığı
    useEffect(() => {
        if (isFinished || isProcessing) return;
        if (questions.length === 0) return; // Soru yoksa sayaç çalışma
        if (timeLeft === 0) {
            handleAnswer(null);
        }
        const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, isFinished, isProcessing, questions.length]);

    const fetchQuestions = async () => {
        try {
            const res = await API.get(`/questions/lesson/${lessonId}`);
            setQuestions(res.data || []); // Boş gelirse boş array ata
            setLoading(false);
        } catch (error) {
            toast.error("Failed to load questions.");
            setQuestions([]);
            setLoading(false);
        }
    };

    const handleAnswer = async (optionKey) => {
        if (isProcessing) return;
        setIsProcessing(true);
        setSelectedOption(optionKey);

        const currentQ = questions[currentIndex];
        // Güvenlik kontrolü
        if (!currentQ) return;

        const isCorrect = optionKey === currentQ.correct_answer;

        if (isCorrect) setScore(prev => prev + 1);

        try {
            await API.post(`/history/submit?user_id=${user.id}`, {
                question_id: currentQ.id,
                given_answer: optionKey || "EMPTY",
                time_spent_seconds: 30 - timeLeft
            });
        } catch (error) {
            console.error("Cevap kaydedilemedi", error);
        }

        setTimeout(async () => {
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setTimeLeft(30);
                setSelectedOption(null);
                setIsProcessing(false);
            } else {
                finishQuiz(isCorrect ? score + 1 : score);
            }
        }, 1500);
    };

    const finishQuiz = async (finalScore) => {
        setIsFinished(true);
        setAnalyzing(true);
        try {
            const res = await API.get(`/recommendation/next-step/${user.id}`);
            setAiAnalysis(res.data);
        } catch (error) {
            console.error("Analiz alınamadı", error);
        } finally {
            setAnalyzing(false);
        }
    };

    // --- RENDER: YÜKLENİYOR ---
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center text-soft-green animate-pulse font-bold text-xl">
            Preparing your personalized quiz...
        </div>
    );

    // --- RENDER: SORU YOK (BUG DÜZELTMESİ BURADA) ---
    if (!loading && questions.length === 0) {
        return (
            <div className="min-h-screen bg-soft-gray flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md text-center">
                    <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-500">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-dark-gray mb-2">No Questions Found</h2>
                    <p className="text-gray-500 mb-6">
                        This lesson doesn't have any questions yet. The instructor or AI hasn't generated content for this module.
                    </p>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-soft-green text-white py-3 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                        <Home size={20} /> Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // --- RENDER: SONUÇ EKRANI ---
    if (isFinished) {
        return (
            <div className="min-h-screen bg-soft-gray py-10 px-4 flex items-center justify-center">
                <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
                    
                    <div className="bg-soft-green text-white p-10 text-center relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
                            <div className="text-6xl font-black mb-2">{score} / {questions.length}</div>
                            <p className="opacity-90 font-medium">Accuracy: {Math.round((score / questions.length) * 100)}%</p>
                        </div>
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    </div>

                    <div className="p-8">
                        {analyzing ? (
                            <div className="flex flex-col items-center py-10 text-gray-500 gap-4">
                                <Activity className="animate-spin text-soft-green" size={40} />
                                <p>AI Coach is analyzing your performance...</p>
                            </div>
                        ) : aiAnalysis ? (
                            <div className="space-y-6">
                                <div className="bg-green-50 border-l-4 border-soft-green p-6 rounded-r-xl">
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                                        <Award className="text-soft-green" /> 
                                        {aiAnalysis.title}
                                    </h3>
                                    <p className="text-gray-600 italic">"{aiAnalysis.message}"</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-2 mb-3 text-gray-800 font-bold">
                                            <Target size={20} className="text-blue-500" /> Analysis
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">{aiAnalysis.reason}</p>
                                    </div>

                                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-2 mb-3 text-gray-800 font-bold">
                                            <Zap size={20} className="text-yellow-500" /> Coach Tip
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">{aiAnalysis.adaptive_tip}</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    className="w-full bg-dark-gray text-white py-4 rounded-xl font-bold text-lg hover:bg-soft-green transition flex items-center justify-center gap-3 shadow-lg group"
                                >
                                    <Home size={20} /> Back to Dashboard
                                </button>
                            </div>
                        ) : (
                            <div className="text-center text-red-400">Analysis could not be loaded.</div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER: SORU EKRANI ---
    const currentQ = questions[currentIndex];
    
    // Ekstra Güvenlik Kontrolü: Eğer render sırasında currentQ undefined ise patlama
    if (!currentQ) return <div className="p-10 text-center">Loading Question Data...</div>;

    const progress = ((currentIndex) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-soft-gray py-8 px-4 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6 px-2">
                    <div className="flex items-center gap-4 flex-grow mr-8">
                        <span className="text-sm font-bold text-gray-400">Question {currentIndex + 1}/{questions.length}</span>
                        <div className="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden">
                            <div style={{ width: `${progress}%` }} className="h-full bg-soft-green transition-all duration-500"></div>
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 font-mono font-bold text-xl ${timeLeft < 10 ? 'text-red-500' : 'text-soft-green'}`}>
                        <Clock size={24} /> {timeLeft}s
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden min-h-[400px] flex flex-col justify-center">
                    <div className="absolute top-0 right-0 bg-gray-100 px-6 py-2 rounded-bl-2xl font-bold text-xs text-gray-500 uppercase tracking-wider">
                        Level {currentQ.difficulty_level}
                    </div>

                    <h2 className="text-2xl font-bold text-dark-gray mb-10 leading-snug">
                        {currentQ.content}
                    </h2>

                    <div className="grid gap-4">
                        {[
                            { key: 'A', text: currentQ.option_a },
                            { key: 'B', text: currentQ.option_b },
                            { key: 'C', text: currentQ.option_c },
                            { key: 'D', text: currentQ.option_d }
                        ].map((opt) => {
                            let statusClass = "bg-gray-50 border-transparent hover:border-soft-green hover:bg-green-50";
                            if (isProcessing) {
                                if (opt.key === currentQ.correct_answer) statusClass = "bg-green-100 border-green-500 ring-2 ring-green-200"; 
                                else if (opt.key === selectedOption) statusClass = "bg-red-100 border-red-500 ring-2 ring-red-200"; 
                                else statusClass = "opacity-50 grayscale"; 
                            }

                            return (
                                <button
                                    key={opt.key}
                                    disabled={isProcessing}
                                    onClick={() => handleAnswer(opt.key)}
                                    className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-4 group ${statusClass}`}
                                >
                                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${
                                        isProcessing && opt.key === currentQ.correct_answer ? 'bg-green-500 text-white' : 
                                        'bg-white text-gray-500 shadow-sm'
                                    }`}>
                                        {opt.key}
                                    </span>
                                    <span className="font-medium text-lg text-gray-700 flex-grow">{opt.text}</span>
                                    
                                    {isProcessing && opt.key === currentQ.correct_answer && <CheckCircle className="text-green-600 animate-bounce" />}
                                    {isProcessing && opt.key === selectedOption && opt.key !== currentQ.correct_answer && <XCircle className="text-red-500 animate-pulse" />}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Quiz;