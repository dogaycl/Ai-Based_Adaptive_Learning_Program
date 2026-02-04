import React, { useState } from 'react';
import API from '../api/axiosConfig';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
// KRİTİK EKSİK: getUserInfo import edilmeli
import { getUserInfo } from '../utils/authUtils'; 
// Arka plan görseli
import bgImage from '../assets/bg.jpg'; 

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await API.post('/auth/login', { email, password });
            
            // 1. Token'ı kaydet
            localStorage.setItem('token', response.data.access_token);
            
            // 2. Token kaydedildikten sonra bilgileri çöz
            const userInfo = getUserInfo(); 
            
            if (userInfo) {
                toast.success(`Welcome back, ${userInfo.sub.split('@')[0]}!`);
                
                // 3. Role göre kesin yönlendirme yap
                // Not: 'teacher' küçük harf geliyorsa kontrolü ona göre yapıyoruz
                if (userInfo.role === 'teacher' || userInfo.role === 'admin') {
                    navigate('/teacher-dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                throw new Error("User info could not be retrieved.");
            }
            
        } catch (error) {
            setLoading(false);
            console.error("Login Error:", error);
            toast.error(error.response?.data?.detail || "Invalid credentials.");
        }
    };

    return (
        <div className="min-h-[100vh] flex items-center justify-center relative overflow-hidden">
            
            {/* --- BACKGROUND LAYER --- */}
            <div 
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(1px)', 
                    transform: 'scale(1.1)' 
                }}
            />
            <div className="absolute inset-0 z-0 bg-black/40" />

            {/* FORM CARD */}
            <div className="bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl border border-white/50 w-full max-w-md relative z-10">
                
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-soft-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-soft-green">
                        <LogIn size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-dark-gray">Welcome Back</h2>
                    <p className="text-gray-500 mt-2">Sign in to continue your adaptive learning journey.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                            <input 
                                type="email" 
                                className="w-full pl-12 pr-4 py-3 bg-soft-gray/50 border border-gray-200 focus:bg-white focus:border-soft-green focus:ring-2 focus:ring-soft-green/20 rounded-xl outline-none transition" 
                                placeholder="name@university.edu"
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                            <input 
                                type="password" 
                                className="w-full pl-12 pr-4 py-3 bg-soft-gray/50 border border-gray-200 focus:bg-white focus:border-soft-green focus:ring-2 focus:ring-soft-green/20 rounded-xl outline-none transition" 
                                placeholder="••••••••"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-soft-green text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-soft-green/30 hover:-translate-y-1 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? "Authenticating..." : "Sign In"} 
                        {!loading && <ArrowRight size={20} />}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Don't have an account? <Link to="/register" className="text-soft-green font-bold hover:underline">Create Account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;