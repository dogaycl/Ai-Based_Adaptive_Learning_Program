import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import { getUserInfo } from '../utils/authUtils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CheckCircle, ArrowRight } from 'lucide-react';

const PlacementTest = () => {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [isFinished, setIsFinished] = useState(false);
    const [assignedLevel, setAssignedLevel] = useState(1);
    
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

        // Check answer
        const isCorrect = questions[currentIndex].correct_answer.toLowerCase() === currentAnswer.trim().toLowerCase();
        if (isCorrect) setScore(prev => prev + 1);

        // Move to next or finish
        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(prev => prev + 1);
            setCurrentAnswer('');
        } else {
            // Finish Logic
            const finalScore = score + (isCorrect ? 1 : 0);
            await submitPlacement(finalScore);
        }
    };

    const submitPlacement = async (finalScore) => {
        try {
            const res = await API.post(`/auth/complete-placement/${user.id}?score=${finalScore}`);
            setAssignedLevel(res.data.assigned_level);
            setIsFinished(true);
            toast.success("Assessment Complete!");
        } catch (error) {
            console.error("Placement Error", error);
            toast.error("Could not save results.");
        }
    };

    if (isFinished) {
        return (
            <div className="max-w-md mx-auto mt-20 text-center p-10 bg-white rounded-3xl shadow-xl border border-soft-green/20">
                <div className="w-20 h-20 bg-soft-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-soft-green" size={40} />
                </div>
                <h2 className="text-3xl font-bold text-dark-gray mb-2">Analysis Complete</h2>
                <p className="text-gray-500 mb-8">AI has analyzed your performance.</p>
                
                <div className="bg-soft-gray p-6 rounded-2xl mb-8">
                    <span className="block text-xs uppercase font-bold text-gray-400 mb-1">Assigned Level</span>
                    <span className="text-4xl font-black text-soft-green">LEVEL {assignedLevel}</span>
                </div>

                <button 
                    onClick={() => {
                        window.location.href = '/dashboard'; // Force reload to update navbar/state
                    }} 
                    className="w-full bg-soft-green text-white py-4 rounded-xl font-bold hover:bg-opacity-90 transition flex items-center justify-center gap-2"
                >
                    Go to My Dashboard <ArrowRight size={20} />
                </button>
            </div>
        );
    }

    if (questions.length === 0) return <div className="text-center py-20 font-medium text-gray-400">Loading AI Diagnostic Engine...</div>;

    const progress = ((currentIndex) / questions.length) * 100;

    return (
        <div className="max-w-2xl mx-auto py-10">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 h-2 rounded-full mb-8 overflow-hidden">
                <div className="bg-soft-green h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                    <span className="bg-soft-gray px-4 py-1.5 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-wider">
                        Question {currentIndex + 1} / {questions.length}
                    </span>
                    <span className="text-xs font-bold text-soft-green">DIAGNOSTIC MODE</span>
                </div>
                
                <h2 className="text-2xl font-bold text-dark-gray mb-8 leading-relaxed">
                    {questions[currentIndex].content}
                </h2>
                
                <input 
                    type="text" 
                    className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none mb-8 text-lg focus:border-soft-green focus:bg-white transition" 
                    placeholder="Type your answer here..."
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    autoFocus
                />
                
                <button 
                    onClick={handleNext} 
                    className="w-full py-4 rounded-2xl font-bold text-lg bg-dark-gray text-white hover:bg-soft-green transition shadow-lg"
                >
                    {currentIndex + 1 === questions.length ? "Finish Assessment" : "Next Question"}
                </button>
            </div>
        </div>
    );
};

export default PlacementTest;