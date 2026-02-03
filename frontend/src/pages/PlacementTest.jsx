import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import { getUserInfo } from '../utils/authUtils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const PlacementTest = () => {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [isFinished, setIsFinished] = useState(false);
    const [finalLevel, setFinalLevel] = useState(1);
    
    const user = getUserInfo();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await API.get('/questions/placement-test');
                setQuestions(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                toast.error("Failed to load diagnostic questions.");
            }
        };
        fetchQuestions();
    }, []);

    const handleNext = async () => {
        if (!currentAnswer.trim()) {
            toast.warn("Please type an answer.");
            return;
        }

        const isCorrect = questions[currentIndex].correct_answer.toLowerCase() === currentAnswer.trim().toLowerCase();
        const newAnswers = [...answers, isCorrect];
        setAnswers(newAnswers);

        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(currentIndex + 1);
            setCurrentAnswer('');
        } else {
            const correctCount = newAnswers.filter(a => a === true).length;
            const userId = user?.id;
            
            if (!userId) {
                toast.error("User session expired. Please login again.");
                return;
            }

            try {
                const res = await API.post(`/auth/complete-placement/${userId}?score=${correctCount}`);
                setFinalLevel(res.data.new_level);
                setIsFinished(true);
                toast.success("Placement test submitted!");
            } catch (err) {
                toast.error("Failed to save results.");
            }
        }
    };

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="bg-white p-10 rounded-3xl shadow-2xl text-center border-t-8 border-soft-green max-w-md w-full">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-3xl font-bold text-soft-green mb-2">Great Job!</h2>
                    <p className="text-gray-600 mb-6">You have completed the placement test.</p>
                    <div className="bg-soft-gray p-6 rounded-2xl mb-8">
                        <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">Your Initial Level</span>
                        <div className="text-5xl font-black text-soft-green mt-2">Level {finalLevel}</div>
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="w-full bg-soft-green text-white py-4 rounded-xl font-bold hover:scale-105 transition shadow-lg">
                        Go to My Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (questions.length === 0) return <div className="text-center py-20 font-medium">Preparing diagnostic test...</div>;

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="bg-white p-8 rounded-3xl shadow-xl border-t-8 border-soft-green">
                <div className="flex justify-between items-center mb-8">
                    <span className="bg-soft-gray px-4 py-1 rounded-full text-[10px] font-black text-gray-500 uppercase">Question {currentIndex + 1} / {questions.length}</span>
                </div>
                <h2 className="text-2xl font-semibold text-dark-gray mb-8">{questions[currentIndex].content}</h2>
                <input 
                    type="text" 
                    className="w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none mb-8 text-lg focus:border-soft-green" 
                    placeholder="Type your answer here..."
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                />
                <button onClick={handleNext} className="w-full py-4 rounded-2xl font-bold text-lg bg-soft-green text-white shadow-md">
                    {currentIndex + 1 === questions.length ? "Finish Assessment" : "Next Question"}
                </button>
            </div>
        </div>
    );
};

export default PlacementTest;