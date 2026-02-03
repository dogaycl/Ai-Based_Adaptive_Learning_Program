import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';
import { toast } from 'react-toastify';

const AddQuestion = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        content: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        difficulty_level: 1
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Role parametresini kaldırdık, JWT token üzerinden backend hallediyor
            const payload = { ...formData, lesson_id: parseInt(lessonId) };
            await API.post('/questions/', payload);
            toast.success("Question added successfully!");
            // Formu temizle
            setFormData({
                content: '', option_a: '', option_b: '', option_c: '', option_d: '', 
                correct_answer: 'A', difficulty_level: 1 
            });
        } catch (error) {
            console.error("Hata detayı:", error.response?.data);
            toast.error("Error: " + (error.response?.data?.detail?.[0]?.msg || "Failed to add question"));
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 bg-white p-8 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold text-soft-green mb-6">Add Question to Lesson #{lessonId}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea 
                    className="w-full p-4 border rounded-xl"
                    placeholder="Question Content"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    required
                />
                <div className="grid grid-cols-2 gap-4">
                    <input className="p-3 border rounded-lg" placeholder="Option A" value={formData.option_a} onChange={(e)=>setFormData({...formData, option_a: e.target.value})} required />
                    <input className="p-3 border rounded-lg" placeholder="Option B" value={formData.option_b} onChange={(e)=>setFormData({...formData, option_b: e.target.value})} required />
                    <input className="p-3 border rounded-lg" placeholder="Option C" value={formData.option_c} onChange={(e)=>setFormData({...formData, option_c: e.target.value})} required />
                    <input className="p-3 border rounded-lg" placeholder="Option D" value={formData.option_d} onChange={(e)=>setFormData({...formData, option_d: e.target.value})} required />
                </div>
                <div className="flex gap-4 items-center">
                    <label className="font-bold text-gray-500 uppercase text-xs">Correct:</label>
                    <select className="p-2 border rounded-lg" value={formData.correct_answer} onChange={(e)=>setFormData({...formData, correct_answer: e.target.value})}>
                        <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                    </select>
                    <label className="font-bold text-gray-500 uppercase text-xs ml-auto">Difficulty (1-5):</label>
                    <input type="number" min="1" max="5" className="w-16 p-2 border rounded-lg" value={formData.difficulty_level} onChange={(e)=>setFormData({...formData, difficulty_level: parseInt(e.target.value)})}/>
                </div>
                <div className="flex gap-4 mt-6">
                    <button type="submit" className="flex-grow bg-soft-green text-white py-4 rounded-xl font-bold shadow-lg hover:bg-opacity-90">
                        Save Question
                    </button>
                    <button type="button" onClick={() => navigate('/teacher-dashboard')} className="px-6 py-4 border-2 rounded-xl text-gray-400 font-bold">
                        Finish
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddQuestion;