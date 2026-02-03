import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';
import { getUserInfo } from '../utils/authUtils';

const Quiz = () => {
    const { lessonId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [startTime, setStartTime] = useState(Date.now());
    const navigate = useNavigate();
    const user = getUserInfo();

    useEffect(() => {
        fetchQuestions();
    }, [lessonId]);

    const fetchQuestions = async () => {
        try {
            const res = await API.get(`/questions/lesson/${lessonId}`);
            setQuestions(res.data);
            setStartTime(Date.now());
        } catch (error) {
            alert("Error loading questions.");
            navigate('/dashboard');
        }
    };

    const handleNext = async () => {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        
        const payload = {
            question_id: questions[currentIndex].id,
            given_answer: answer,
            time_spent_seconds: timeSpent
        };

        try {
            // Your backend history endpoint expects user_id as query param
            await API.post(`/history/submit?user_id=${user.id}`, payload);
            
            if (currentIndex + 1 < questions.length) {
                setCurrentIndex(currentIndex + 1);
                setAnswer('');
                setStartTime(Date.now()); // Reset timer for next question
            } else {
                alert("Quiz completed! Well done.");
                navigate('/dashboard');
            }
        } catch (error) {
            alert("Failed to save progress.");
        }
    };

    if (questions.length === 0) return <div style={{ padding: '20px' }}>Loading questions...</div>;

    const currentQuestion = questions[currentIndex];

    return (
        <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h2>Question {currentIndex + 1} of {questions.length}</h2>
            <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #eee', fontSize: '1.2rem' }}>
                {currentQuestion.content}
            </div>
            <input 
                type="text" 
                placeholder="Type your answer here..." 
                value={answer} 
                onChange={(e) => setAnswer(e.target.value)}
                style={{ padding: '10px', width: '80%', marginBottom: '20px' }}
            />
            <br />
            <button onClick={handleNext} style={nextBtnStyle}>
                {currentIndex + 1 === questions.length ? "Finish Quiz" : "Submit & Next"}
            </button>
        </div>
    );
};

const nextBtnStyle = { padding: '10px 30px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem' };

export default Quiz;