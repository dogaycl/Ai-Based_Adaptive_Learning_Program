import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getUserInfo } from '../utils/authUtils';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = getUserInfo();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Aktif sayfa kontrolü (CSS için)
    const isActive = (path) => location.pathname === path ? 'border-b-2 border-white' : '';

    return (
        <nav className="bg-soft-green text-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-tight">AI LEARN</span>
                        <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                    </Link>

                    {/* Menü Linkleri */}
                    <div className="hidden md:flex items-center gap-8">
                        {token ? (
                            <>
                                {user?.role === 'teacher' ? (
                                    <>
                                        <Link to="/teacher-dashboard" className={`hover:text-gray-200 transition ${isActive('/teacher-dashboard')}`}>
                                            Teacher Panel
                                        </Link>
                                        <Link to="/teacher/add-lesson" className={`hover:text-gray-200 transition ${isActive('/teacher/add-lesson')}`}>
                                            Add Lesson
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/dashboard" className={`hover:text-gray-200 transition ${isActive('/dashboard')}`}>
                                            My Dashboard
                                        </Link>
                                        <Link to="/placement-test" className={`hover:text-gray-200 transition ${isActive('/placement-test')}`}>
                                            Level Test
                                        </Link>
                                    </>
                                )}
                            </>
                        ) : null}
                    </div>

                    {/* Sağ Kısım (User & Logout) */}
                    <div className="flex items-center gap-4">
                        {token ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full capitalize">
                                    {user?.role}: {user?.sub?.split('@')[0]}
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
                                <Link to="/register" className="bg-white text-soft-green px-4 py-1.5 rounded-lg font-bold hover:bg-gray-100">Sign Up</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;