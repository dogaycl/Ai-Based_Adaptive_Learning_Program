import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';
import { getUserInfo } from '../utils/authUtils';
import { toast } from 'react-toastify';
import { Clock, CheckCircle, XCircle, Award, ArrowRight, BookOpen } from 'lucide-react';

const Quiz = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const user = getUserInfo();

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isFinished, setIsFinished] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // UI States for feedback
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswerProcessed, setIsAnswerProcessed] = useState(false); // Prevent double clicks

    useEffect(() => {
        fetchQuestions();
    }, [lessonId]);

    // Timer Logic
    useEffect(() => {
        if (timeLeft === 0 && !isAnswerProcessed) {
            handleAnswer(null); // Time's up treated as wrong
        }
        if (isFinished || isAnswerProcessed) return;

        const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, isFinished, isAnswerProcessed]);

    const fetchQuestions = async () => {
        try {
            const res = await API.get(`/questions/lesson/${lessonId}`);
            setQuestions(res.data);
            setLoading(false);
        } catch (error) {
            toast.error("Could not load lesson content.");
            navigate('/dashboard');
        }
    };

    const handleAnswer = async (optionKey) => {
        if (isAnswerProcessed) return;
        setIsAnswerProcessed(true);
        setSelectedOption(optionKey);

        const currentQuestion = questions[currentIndex];
        const isCorrect = optionKey === currentQuestion.correct_answer;
        const timeSpent = 30 - timeLeft;

        // Calculate Score
        if (isCorrect) setScore((prev) => prev + 1);

        // Send logic to backend (Silent background sync)
        try {
            await API.post(`/history/submit?user_id=${user.id}`, {
                question_id: currentQuestion.id,
                given_answer: optionKey || "TIMEOUT",
                time_spent_seconds: timeSpent
            });
        } catch (err) {
            console.error("Failed to save progress");
        }

        // Delay for visual feedback before next question
        setTimeout(() => {
            if (currentIndex + 1 < questions.length) {
                setCurrentIndex((prev) => prev + 1);
                setTimeLeft(30);
                setSelectedOption(null);
                setIsAnswerProcessed(false);
            } else {
                setIsFinished(true);
            }
        }, 1200); // 1.2 second delay to see the color
    };

    if (loading) return <div className="text-center py-20 text-soft-green font-bold">Loading Learning Module...</div>;
    
    if (questions.length === 0) return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-400">No questions available for this lesson yet.</h2>
            <button onClick={() => navigate('/dashboard')} className="mt-4 text-soft-green font-bold underline">Go Back</button>
        </div>
    );

    // --- RESULT SCREEN ---
    if (isFinished) {
        const accuracy = Math.round((score / questions.length) * 100);
        return (
            <div className="max-w-md mx-auto py-10">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
                    <div className="w-24 h-24 bg-soft-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Award className="text-soft-green" size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-dark-gray mb-2">Lesson Complete!</h2>
                    <p className="text-gray-500 mb-8">AI is updating your learning profile.</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-soft-gray p-4 rounded-2xl">
                            <div className="text-xs uppercase font-bold text-gray-400">Score</div>
                            <div className="text-2xl font-black text-soft-green">{score} / {questions.length}</div>
                        </div>
                        <div className="bg-soft-gray p-4 rounded-2xl">
                            <div className="text-xs uppercase font-bold text-gray-400">Accuracy</div>
                            <div className="text-2xl font-black text-dark-gray">%{accuracy}</div>
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate('/dashboard')} 
                        className="w-full py-4 rounded-xl font-bold bg-soft-green text-white shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
                    >
                         Return to Dashboard <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="max-w-3xl mx-auto py-8">
            {/* Header: Progress & Timer */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-gray-500 font-bold">
                    <BookOpen size={20} className="text-soft-green"/>
                    <span>Question {currentIndex + 1}</span>
                    <span className="text-gray-300">/ {questions.length}</span>
                </div>
                <div className={`flex items-center gap-2 font-black px-4 py-2 rounded-full ${timeLeft < 10 ? 'bg-red-100 text-red-500' : 'bg-soft-gray text-soft-green'}`}>
                    <Clock size={18} />
                    {timeLeft}s
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 h-2 rounded-full mb-8 overflow-hidden">
                <div className="bg-soft-green h-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
            </div>

            {/* Question Card */}
            <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-gray-100 relative overflow-hidden">
                <h2 className="text-2xl md:text-3xl font-bold text-dark-gray mb-10 leading-snug">
                    {currentQuestion.content}
                </h2>

                <div className="space-y-4">
                    {[
                        { key: 'A', text: currentQuestion.option_a },
                        { key: 'B', text: currentQuestion.option_b },
                        { key: 'C', text: currentQuestion.option_c },
                        { key: 'D', text: currentQuestion.option_d }
                    ].map((opt) => {
                        let statusClass = "border-gray-100 hover:border-soft-green hover:bg-soft-green/5"; // Default
                        
                        if (isAnswerProcessed) {
                            if (opt.key === currentQuestion.correct_answer) {
                                statusClass = "bg-green-100 border-green-500 text-green-700 ring-2 ring-green-200"; // Correct
                            } else if (opt.key === selectedOption) {
                                statusClass = "bg-red-50 border-red-300 text-red-400"; // Wrong selection
                            } else {
                                statusClass = "opacity-50 border-gray-100 grayscale"; // Others
                            }
                        }

                        return (
                            <button
                                key={opt.key}
                                disabled={isAnswerProcessed}
                                onClick={() => handleAnswer(opt.key)}
                                className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-4 group ${statusClass}`}
                            >
                                <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${
                                    isAnswerProcessed && opt.key === currentQuestion.correct_answer ? 'bg-green-500 text-white' : 
                                    'bg-gray-100 text-gray-500 group-hover:bg-soft-green group-hover:text-white'
                                }`}>
                                    {opt.key}
                                </span>
                                <span className="font-medium text-lg">{opt.text}</span>
                                
                                {/* Icons for result */}
                                {isAnswerProcessed && opt.key === currentQuestion.correct_answer && <CheckCircle className="ml-auto text-green-600" />}
                                {isAnswerProcessed && opt.key === selectedOption && opt.key !== currentQuestion.correct_answer && <XCircle className="ml-auto text-red-500" />}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default Quiz;