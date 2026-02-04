import React, { useState } from 'react';
import API from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UploadCloud, FileText, CheckCircle, Loader2 } from 'lucide-react';

const AddLesson = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content_text: '',
        attachment_url: '',
        difficulty: 'medium'
    });
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    // Dosya Seçildiğinde Çalışır
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        setUploading(true);
        try {
            const res = await API.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // Backend'den gelen URL'i forma yaz
            setFormData({ ...formData, attachment_url: res.data.url });
            toast.success("File uploaded successfully!");
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("File upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/lessons/', formData);
            toast.success("Lesson published successfully!");
            navigate('/teacher-dashboard');
        } catch (error) {
            const errorMsg = error.response?.data?.detail?.[0]?.msg || "Check form fields.";
            toast.error(`Publish Error: ${errorMsg}`);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-10">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                <h2 className="text-3xl font-bold text-soft-green mb-2">Create New Lesson</h2>
                <p className="text-gray-400 mb-8">Add educational content to the AI curriculum.</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Lesson Title</label>
                        <input 
                            className="w-full p-4 bg-soft-gray border-transparent focus:bg-white focus:border-soft-green border-2 rounded-xl outline-none transition"
                            placeholder="e.g. Introduction to Neural Networks"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Description</label>
                        <input 
                            className="w-full p-4 bg-soft-gray border-transparent focus:bg-white focus:border-soft-green border-2 rounded-xl outline-none transition"
                            placeholder="Short summary for the dashboard card"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Full Content (Reading Material)</label>
                        <textarea 
                            className="w-full p-4 bg-soft-gray border-transparent focus:bg-white focus:border-soft-green border-2 rounded-xl outline-none transition h-40"
                            placeholder="Paste the full lecture notes here..."
                            value={formData.content_text}
                            onChange={(e) => setFormData({...formData, content_text: e.target.value})}
                        />
                    </div>

                    {/* FILE UPLOAD SECTION */}
                    <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-soft-green transition group">
                        <label className="block text-sm font-bold text-gray-700 mb-4 uppercase">Lesson Attachment (PDF / Video)</label>
                        
                        <div className="flex items-center gap-4">
                            {/* Hidden File Input */}
                            <label className="cursor-pointer bg-dark-gray text-white px-6 py-3 rounded-xl font-bold hover:bg-soft-green transition flex items-center gap-2">
                                {uploading ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
                                {uploading ? "Uploading..." : "Choose File"}
                                <input type="file" className="hidden" onChange={handleFileUpload} />
                            </label>

                            <span className="text-gray-400 text-sm font-medium">OR</span>

                            {/* URL Input */}
                            <input 
                                className="flex-grow p-3 bg-white border border-gray-200 rounded-xl text-sm"
                                placeholder="Paste external link or upload file..."
                                value={formData.attachment_url}
                                onChange={(e) => setFormData({...formData, attachment_url: e.target.value})}
                            />
                        </div>

                        {/* Success Indicator */}
                        {formData.attachment_url && formData.attachment_url.includes('uploads/') && (
                            <div className="mt-4 flex items-center gap-2 text-soft-green text-sm font-bold bg-soft-green/10 p-2 rounded-lg inline-block">
                                <CheckCircle size={16} /> File attached successfully
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Difficulty Level</label>
                            <select 
                                className="w-full p-4 bg-soft-gray border-transparent focus:bg-white focus:border-soft-green border-2 rounded-xl outline-none transition"
                                value={formData.difficulty}
                                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                            >
                                <option value="easy">Easy (Beginner)</option>
                                <option value="medium">Medium (Intermediate)</option>
                                <option value="hard">Hard (Advanced)</option>
                            </select>
                        </div>
                        <div className="w-1/2 flex items-end">
                             <button type="submit" className="w-full bg-soft-green text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-soft-green/30 transition flex items-center justify-center gap-2">
                                <FileText size={20} /> Publish Lesson
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLesson;