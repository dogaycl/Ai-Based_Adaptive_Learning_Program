import React, { useState } from 'react';
import API from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AddLesson = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content_text: '',
        attachment_url: '',
        difficulty: 'medium'
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // URL'den ?role=... kısmını sildik, sadece veri gönderiyoruz
            await API.post('/lessons/', formData);
            toast.success("Lesson published successfully!");
            navigate('/teacher-dashboard');
        } catch (error) {
            // Hata detayını tam olarak görebilmek için console.log ekledik
            console.error("422 Detayı:", error.response?.data?.detail);
            const errorMsg = error.response?.data?.detail?.[0]?.msg || "Check form fields.";
            toast.error(`Publish Error: ${errorMsg}`);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-10 bg-white p-8 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold text-soft-green mb-6">Create New Lesson</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                    className="w-full p-4 border rounded-xl"
                    placeholder="Lesson Title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                />
                <textarea 
                    className="w-full p-4 border rounded-xl"
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
                <textarea 
                    className="w-full p-4 border rounded-xl h-32"
                    placeholder="Lesson Content (Full Text)"
                    value={formData.content_text}
                    onChange={(e) => setFormData({...formData, content_text: e.target.value})}
                />
                <input 
                    className="w-full p-4 border rounded-xl"
                    placeholder="Attachment URL (PDF/Link)"
                    value={formData.attachment_url}
                    onChange={(e) => setFormData({...formData, attachment_url: e.target.value})}
                />
                <select 
                    className="w-full p-4 border rounded-xl"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
                <button type="submit" className="w-full bg-soft-green text-white py-4 rounded-xl font-bold">
                    Publish Lesson
                </button>
            </form>
        </div>
    );
};

export default AddLesson;