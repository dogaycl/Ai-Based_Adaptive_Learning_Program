import React, { useState } from 'react';
import API from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('student'); // Default role
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await API.post('/auth/login', { email, password });
            localStorage.setItem('token', response.data.access_token);
            toast.success("Welcome back! Loading your dashboard...");
            
            // Backend'den dönen role göre yönlendirme
            if (selectedRole === 'teacher') {
                navigate('/teacher-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.detail || "Login failed. Please check your credentials.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative">
            <div className="bg-school-blur"></div>
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-soft-green">Adaptive Learning</h1>
                    <p className="text-gray-500">Please select your role and sign in</p>
                </div>

                {/* Role Selection Buttons */}
                <div className="flex gap-4 mb-6">
                    <button 
                        onClick={() => setSelectedRole('student')}
                        className={`flex-1 py-2 rounded-xl border-2 transition ${selectedRole === 'student' ? 'border-soft-green bg-soft-green/10 text-soft-green' : 'border-gray-200 text-gray-400'}`}
                    >
                        Student
                    </button>
                    <button 
                        onClick={() => setSelectedRole('teacher')}
                        className={`flex-1 py-2 rounded-xl border-2 transition ${selectedRole === 'teacher' ? 'border-soft-green bg-soft-green/10 text-soft-green' : 'border-gray-200 text-gray-400'}`}
                    >
                        Teacher
                    </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input 
                            type="email" 
                            className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-soft-green focus:border-soft-green" 
                            placeholder="name@university.edu"
                            value={email} onChange={(e) => setEmail(e.target.value)} required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input 
                            type="password" 
                            className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-soft-green focus:border-soft-green" 
                            placeholder="••••••••"
                            value={password} onChange={(e) => setPassword(e.target.value)} required 
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-soft-green text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition shadow-lg"
                    >
                        Sign In as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;