import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getUserInfo } from '../utils/authUtils';
// 1. Logoyu import ediyoruz
import logo from '../assets/logo.jpg';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = getUserInfo();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav className="bg-soft-green text-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    
                    {/* --- LOGO VE BAŞLIK KISMI --- */}
                    <Link to="/" className="flex items-center gap-3 group">
                        {/* Logo Resmi */}
                        <img 
                            src={logo} 
                            alt="Logo" 
                            className="h-10 w-10 rounded-xl object-cover border-2 border-white/20 group-hover:border-white transition"
                        />
                        
                        {/* Yazı Alanı */}
                        <div className="flex flex-col">
                            <span className="text-lg font-bold tracking-tight font-mono leading-none">
                                Learn Software
                            </span>
                            <span className="text-xs font-medium text-green-100 font-mono tracking-wider">
                                with AI
                            </span>
                        </div>
                    </Link>

                    {/* --- MENÜ LİNKLERİ --- */}
                    <div className="hidden md:flex items-center gap-8">
                        {token ? (
                            <>
                                {user?.role === 'teacher' ? (
                                    <>
                                        <Link to="/teacher-dashboard" className="hover:text-gray-200 transition font-medium">Dashboard</Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/dashboard" className="hover:text-gray-200 transition font-medium">My Dashboard</Link>
                                    </>
                                )}
                            </>
                        ) : null}
                    </div>

                    {/* --- SAĞ KISIM (USER & LOGOUT) --- */}
                    <div className="flex items-center gap-4">
                        {token ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium bg-white/10 px-4 py-1.5 rounded-full capitalize border border-white/10">
                                    {user?.role === 'teacher' ? '👨‍🏫 Instructor' : '🎓 Student'}
                                </span>
                                <button 
                                    onClick={handleLogout}
                                    className="bg-white text-soft-green px-4 py-1.5 rounded-lg font-bold hover:bg-gray-100 transition shadow-sm"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                <Link to="/login" className="hover:text-gray-200 font-medium">Login</Link>
                                <Link to="/register" className="bg-white text-soft-green px-4 py-1.5 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg shadow-green-900/20">Sign Up</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;