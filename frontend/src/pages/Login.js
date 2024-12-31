import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockApi } from '../utils/mockApi'; // モックAPIを使用

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await mockApi.login(email, password); // モックAPIを呼び出し
            const { access, refresh } = response;

            // トークンをローカルストレージに保存
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            alert('Login successful!');
            navigate('/bingo'); // 成功後にビンゴ画面へ遷移
        } catch (error) {
            console.error('Login failed:', error);
            alert('Invalid credentials!');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
};

export default Login;
