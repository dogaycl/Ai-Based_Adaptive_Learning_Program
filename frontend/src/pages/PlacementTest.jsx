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
    const user = getUserInfo();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuestions = async () => {
            const res = await API.get('/questions/placement-test');
            setQuestions(res.data);
        };
        fetchQuestions();
    }, []);

    const handleNext = async () => {
        const isCorrect = questions[currentIndex].correct_answer.toLowerCase() === currentAnswer.toLowerCase();
        const newAnswers = [...answers, isCorrect];
        setAnswers(newAnswers);

        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(currentIndex + 1);
            setCurrentAnswer('');
        } else {
            // Test bitti, sonuçları gönder
            const correctCount = newAnswers.filter(a => a).length;
            await API.post(`/auth/complete-placement/${user.id}?score=${correctCount}`);
            toast.success("Assessment completed! Your level has been determined.");
            navigate('/dashboard');
        }
    };

    if (questions.length === 0) return <div className="p-10 text-center">Preparing your diagnostic test...</div>;

    return (
        <div className="min-h-screen bg-soft-gray flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full border-t-8 border-soft-green">
                <div className="flex justify-between mb-6 text-gray-400 font-medium">
                    <span>Diagnostic Test</span>
                    <span>Question {currentIndex + 1} / {questions.length}</span>
                </div>
                
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-dark-gray">{questions[currentIndex].text}</h2>
                </div>

                <input 
                    type="text"
                    className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-soft-green focus:outline-none mb-6"
                    placeholder="Type your answer here..."
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                />

                <button 
                    onClick={handleNext}
                    className="w-full bg-soft-green text-white py-4 rounded-xl font-bold hover:bg-opacity-90 transition"
                >
                    {currentIndex + 1 === questions.length ? "Finish Assessment" : "Next Question"}
                </button>
            </div>
        </div>
    );
};

export default PlacementTest;