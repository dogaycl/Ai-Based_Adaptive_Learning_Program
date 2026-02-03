import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav style={{ padding: '10px', background: '#f4f4f4', display: 'flex', justifyContent: 'space-between' }}>
            <Link to="/" style={{ fontWeight: 'bold', textDecoration: 'none', color: '#333' }}>
                AI Adaptive Learning
            </Link>
            <div>
                {!token ? (
                    <>
                        <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                ) : (
                    <button onClick={handleLogout}>Logout</button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;