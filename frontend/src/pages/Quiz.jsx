import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';
import { getUserInfo } from '../utils/authUtils';
import { toast } from 'react-toastify';

const Quiz = () => {
    const { lessonId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState('');
    const [timeLeft, setTimeLeft] = useState(30); // Her soru için 30 saniye
    const [showHint, setShowHint] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const navigate = useNavigate();
    const user = getUserInfo();

    useEffect(() => {
        fetchQuestions();
    }, [lessonId]);

    // Sayaç Mantığı
    useEffect(() => {
        if (timeLeft <= 0) {
            handleNext('TIMEOUT');
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const fetchQuestions = async () => {
        try {
            const res = await API.get(`/questions/lesson/${lessonId}`);
            setQuestions(res.data);
            setStartTime(Date.now());
        } catch (error) {
            toast.error("Error loading questions.");
            navigate('/dashboard');
        }
    };

    const handleNext = async (timeoutAnswer = null) => {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        const currentQuestion = questions[currentIndex];
        const finalAnswer = timeoutAnswer === 'TIMEOUT' ? 'NONE' : selectedOption;

        const isCorrect = finalAnswer.toUpperCase() === currentQuestion.correct_answer.toUpperCase();

        if (!isCorrect && timeoutAnswer !== 'TIMEOUT') {
            setShowHint(true); // Yanlışsa ipucunu göster
            return; // Pop-up kapanana kadar ilerleme
        }

        await submitResult(finalAnswer, timeSpent);
    };

    const submitResult = async (ans, time) => {
        try {
            await API.post(`/history/submit?user_id=${user.id}`, {
                question_id: questions[currentIndex].id,
                given_answer: ans,
                time_spent_seconds: time
            });
            
            if (currentIndex + 1 < questions.length) {
                setCurrentIndex(currentIndex + 1);
                setSelectedOption('');
                setTimeLeft(30);
                setStartTime(Date.now());
                setShowHint(false);
            } else {
                toast.success("Quiz completed! Returning to dashboard...");
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error("Failed to save progress.");
        }
    };

    if (questions.length === 0) return <div className="text-center py-20">Loading questions...</div>;

    const q = questions[currentIndex];

    return (
        <div className="max-w-3xl mx-auto py-10 relative">
            {/* AI Hint Pop-up (Modal) */}
            {showHint && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
                        <div className="text-5xl mb-4">💡</div>
                        <h3 className="text-xl font-bold text-soft-green mb-2">AI Adaptive Tip</h3>
                        <p className="text-gray-600 mb-6 italic">
                            "Almost there! Review the lesson content one more time. Focus on the core definitions mentioned in the text."
                        </p>
                        <button 
                            onClick={() => {
                                setShowHint(false);
                                submitResult(selectedOption, Math.floor((Date.now() - startTime) / 1000));
                            }}
                            className="w-full bg-soft-green text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition"
                        >
                            Got it, Next Question
                        </button>
                    </div>
                </div>
            )}

            {/* Quiz UI */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-soft-green p-6 text-white flex justify-between items-center">
                    <div>
                        <span className="text-sm opacity-80 uppercase tracking-widest font-bold">Question</span>
                        <div className="text-2xl font-black">{currentIndex + 1} / {questions.length}</div>
                    </div>
                    <div className={`h-16 w-16 rounded-full border-4 flex items-center justify-center text-xl font-bold ${timeLeft < 10 ? 'border-red-400 animate-pulse' : 'border-white/30'}`}>
                        {timeLeft}s
                    </div>
                </div>

                <div className="p-8">
                    <h2 className="text-2xl font-medium text-dark-gray mb-10 leading-relaxed">
                        {q.content}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: 'A', text: q.option_a },
                            { label: 'B', text: q.option_b },
                            { label: 'C', text: q.option_c },
                            { label: 'D', text: q.option_d }
                        ].map((opt) => (
                            <button
                                key={opt.label}
                                onClick={() => setSelectedOption(opt.label)}
                                className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-4 ${
                                    selectedOption === opt.label 
                                    ? 'border-soft-green bg-soft-green/5 ring-4 ring-soft-green/10' 
                                    : 'border-gray-100 hover:border-soft-green/30 hover:bg-gray-50'
                                }`}
                            >
                                <span className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold ${
                                    selectedOption === opt.label ? 'bg-soft-green text-white' : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {opt.label}
                                </span>
                                <span className="font-medium text-dark-gray">{opt.text}</span>
                            </button>
                        ))}
                    </div>

                    <button 
                        disabled={!selectedOption}
                        onClick={() => handleNext()}
                        className={`w-full mt-10 py-4 rounded-2xl font-bold text-lg transition shadow-lg ${
                            selectedOption 
                            ? 'bg-soft-green text-white hover:scale-[1.02] active:scale-95' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {currentIndex + 1 === questions.length ? "Complete Quiz" : "Confirm Answer"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Quiz;