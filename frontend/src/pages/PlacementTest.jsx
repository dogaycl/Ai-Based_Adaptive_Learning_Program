import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import { getUserInfo } from '../utils/authUtils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CheckCircle, ArrowRight, Zap, Target, XCircle } from 'lucide-react';

const PlacementTest = () => {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [assignedLevel, setAssignedLevel] = useState(1);
    const [loading, setLoading] = useState(true);
    
    // YENİ: Geri bildirim için state'ler
    const [selectedOption, setSelectedOption] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const user = getUserInfo();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await API.get('/questions/placement-test');
                setQuestions(res.data);
            } catch (err) {
                toast.error("Failed to load diagnostic questions.");
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    const handleAnswer = async (optionKey) => {
        if (isProcessing) return; // Çift tıklamayı engelle
        
        const currentQ = questions[currentIndex];
        const isCorrect = optionKey === currentQ.correct_answer;
        
        setSelectedOption(optionKey);
        setIsProcessing(true);

        // Puanı güncelle
        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        // 1 saniye bekle (Öğrencinin sonucu görmesi için)
        setTimeout(async () => {
            if (currentIndex + 1 < questions.length) {
                setCurrentIndex(prev => prev + 1);
                setSelectedOption(null);
                setIsProcessing(false);
            } else {
                // Test bittiğinde son puanı gönder
                const finalScore = score + (isCorrect ? 1 : 0);
                await submitPlacement(finalScore);
            }
        }, 1000);
    };

    const submitPlacement = async (finalScore) => {
        try {
            const res = await API.post(`/auth/complete-placement/${user.id}?score=${finalScore}`);
            setAssignedLevel(res.data.new_level);
            setIsFinished(true);
            toast.success("AI Analysis Complete!");
        } catch (error) {
            toast.error("Could not save diagnostic results.");
        }
    };

    if (loading) return <div className="text-center py-20 text-soft-green font-bold animate-pulse">Initializing AI Diagnostic...</div>;

    if (isFinished) {
        return (
            <div className="max-w-md mx-auto mt-20 text-center p-10 bg-white rounded-3xl shadow-xl border border-soft-green/20">
                <div className="w-20 h-20 bg-soft-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-soft-green" size={40} />
                </div>
                <h2 className="text-3xl font-black text-dark-gray mb-2">Analysis Complete</h2>
                <p className="text-gray-500 mb-8">AI has determined your starting point.</p>
                <div className="bg-soft-gray p-6 rounded-2xl mb-8 border border-gray-100">
                    <span className="block text-xs uppercase font-bold text-gray-400 mb-1">Your Starting Level</span>
                    <span className="text-4xl font-black text-soft-green">LEVEL {assignedLevel}</span>
                </div>
                <button onClick={() => navigate('/dashboard')} className="w-full bg-soft-green text-white py-4 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2">
                    Go to My Dashboard <ArrowRight size={20} />
                </button>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="max-w-2xl mx-auto py-10">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <span className="text-soft-green font-black text-xs uppercase tracking-widest flex items-center gap-1">
                        <Zap size={14} /> AI Diagnostic Mode
                    </span>
                    <h1 className="text-xl font-bold text-dark-gray">Assess Your Skills</h1>
                </div>
                <span className="text-gray-400 font-bold text-sm">{currentIndex + 1} / {questions.length}</span>
            </div>
            
            <div className="w-full bg-gray-200 h-2 rounded-full mb-8 overflow-hidden">
                <div className="bg-soft-green h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                <h2 className="text-2xl font-bold text-dark-gray mb-10 leading-relaxed">
                    {currentQuestion.content}
                </h2>
                
                <div className="grid grid-cols-1 gap-4">
                    {[
                        { key: 'A', text: currentQuestion.option_a },
                        { key: 'B', text: currentQuestion.option_b },
                        { key: 'C', text: currentQuestion.option_c },
                        { key: 'D', text: currentQuestion.option_d }
                    ].map((opt) => {
                        // Stil Mantığı
                        let buttonStyle = "border-gray-100 hover:border-soft-green hover:bg-soft-green/5";
                        const isCorrect = opt.key === currentQuestion.correct_answer;
                        const isSelected = opt.key === selectedOption;

                        if (isProcessing) {
                            if (isCorrect) {
                                buttonStyle = "border-green-500 bg-green-50 ring-2 ring-green-200";
                            } else if (isSelected) {
                                buttonStyle = "border-red-500 bg-red-50 ring-2 ring-red-200";
                            } else {
                                buttonStyle = "border-gray-50 opacity-50";
                            }
                        }

                        return (
                            <button
                                key={opt.key}
                                disabled={isProcessing}
                                onClick={() => handleAnswer(opt.key)}
                                className={`w-full p-5 rounded-2xl border-2 transition-all group flex items-center gap-4 ${buttonStyle}`}
                            >
                                <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-colors ${
                                    isProcessing && isCorrect ? 'bg-green-500 text-white' : 
                                    isProcessing && isSelected ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {opt.key}
                                </span>
                                <span className="font-semibold text-gray-700 flex-grow">{opt.text}</span>
                                
                                {isProcessing && isCorrect && <CheckCircle className="text-green-500" size={24} />}
                                {isProcessing && isSelected && !isCorrect && <XCircle className="text-red-500" size={24} />}
                            </button>
                        );
                    })}
                </div>
            </div>

            <p className="text-center text-gray-400 text-sm mt-8 flex items-center justify-center gap-2">
                <Target size={16} /> Instant feedback enabled for calibration.
            </p>
        </div>
    );
};

export default PlacementTest;