import React, { useState } from 'react';
import API from '../api/axiosConfig';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { User, Mail, Lock, GraduationCap, Briefcase, CheckCircle } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'student'
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/auth/register', formData);
            toast.success("Account created successfully! Please login.");
            navigate('/login');
        } catch (error) {
            setLoading(false);
            toast.error(error.response?.data?.detail || "Registration failed.");
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-10">
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 w-full max-w-lg">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-dark-gray">Create Account</h2>
                    <p className="text-gray-400 mt-2">Join the AI-powered learning revolution.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                    
                    {/* Role Selection Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div 
                            onClick={() => setFormData({...formData, role: 'student'})}
                            className={`cursor-pointer p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition ${
                                formData.role === 'student' ? 'border-soft-green bg-soft-green/5 text-soft-green' : 'border-gray-100 text-gray-400 hover:border-gray-200'
                            }`}
                        >
                            <GraduationCap size={28} />
                            <span className="font-bold text-sm">Student</span>
                            {formData.role === 'student' && <CheckCircle size={16} className="absolute top-2 right-2" />}
                        </div>
                        <div 
                            onClick={() => setFormData({...formData, role: 'teacher'})}
                            className={`cursor-pointer p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition ${
                                formData.role === 'teacher' ? 'border-soft-green bg-soft-green/5 text-soft-green' : 'border-gray-100 text-gray-400 hover:border-gray-200'
                            }`}
                        >
                            <Briefcase size={28} />
                            <span className="font-bold text-sm">Instructor</span>
                        </div>
                    </div>

                    <div className="relative">
                        <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            className="w-full pl-12 pr-4 py-3 bg-soft-gray border-transparent focus:bg-white focus:border-soft-green focus:ring-2 focus:ring-soft-green/20 rounded-xl outline-none" 
                            placeholder="Username"
                            value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required 
                        />
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                        <input 
                            type="email" 
                            className="w-full pl-12 pr-4 py-3 bg-soft-gray border-transparent focus:bg-white focus:border-soft-green focus:ring-2 focus:ring-soft-green/20 rounded-xl outline-none" 
                            placeholder="Email Address"
                            value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required 
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                        <input 
                            type="password" 
                            className="w-full pl-12 pr-4 py-3 bg-soft-gray border-transparent focus:bg-white focus:border-soft-green focus:ring-2 focus:ring-soft-green/20 rounded-xl outline-none" 
                            placeholder="Password"
                            value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-dark-gray text-white py-4 rounded-xl font-bold text-lg hover:bg-soft-green transition shadow-lg mt-4"
                    >
                        {loading ? "Creating Account..." : "Start Learning"}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Already have an account? <Link to="/login" className="text-soft-green font-bold hover:underline">Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;