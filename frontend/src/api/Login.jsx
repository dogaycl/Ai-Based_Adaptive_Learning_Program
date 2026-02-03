import React, { useState } from 'react';
import API from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await API.post('/auth/login', { email, password });
            localStorage.setItem('token', response.data.access_token);
            alert('Giriş Başarılı!');
            navigate('/dashboard'); // Başarılı girişte yönlendirilecek sayfa
        } catch (error) {
            alert('Giriş Hatası: ' + (error.response?.data?.detail || 'Bilinmeyen hata'));
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
            <h2>Giriş Yap</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
                <input type="email" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit" style={{ marginTop: '10px' }}>Giriş Yap</button>
            </form>
        </div>
    );
};

export default Login;