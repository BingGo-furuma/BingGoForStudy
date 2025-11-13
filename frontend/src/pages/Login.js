import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAppContext } from '../context/AppContext';
import './Login.css';

const Login = () => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { loadInitialData } = useAppContext();

  const isRegister = mode === 'register';
  const title = useMemo(() => (isRegister ? 'BingGo アカウントを作成' : 'ログインして学習を始める'), [isRegister]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    try {
      if (isRegister) {
        await api.register({ email: form.email, password: form.password, name: form.name });
        setMessage('アカウントを作成しました。登録したメールアドレスでログインしてください。');
        setMode('login');
      } else {
        await api.login(form.email, form.password);
        await loadInitialData();
        const redirectPath = location.state?.from?.pathname || '/home';
        navigate(redirectPath, { replace: true });
      }
    } catch (error) {
      setMessage(error.message || 'エラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-hero">
        <h1>BingGo!!</h1>
        <p>学習の進捗をビンゴ形式で可視化し、志望校合格までの道のりを楽しく管理できます。</p>
        <ul>
          <li>学習カードで毎日のチャレンジを選択</li>
          <li>マスを開けてポイントとバッジを獲得</li>
          <li>ホーム画面で志望校・支払い情報を管理</li>
        </ul>
      </div>
      <div className="auth-panel">
        <h2>{title}</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <label>
              お名前
              <input
                type="text"
                name="name"
                placeholder="例）三木 さくら"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>
          )}
          <label>
            メールアドレス
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            パスワード
            <input
              type="password"
              name="password"
              placeholder="英数字8文字以上"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </label>
          <button type="submit" disabled={isLoading}>
            {isLoading ? '処理中…' : isRegister ? '無料で登録' : 'ログイン'}
          </button>
        </form>
        {message && <p className="auth-message">{message}</p>}
        <div className="auth-switch">
          {isRegister ? (
            <p>
              すでにアカウントをお持ちですか？{' '}
              <button type="button" onClick={() => setMode('login')}>
                ログイン画面へ
              </button>
            </p>
          ) : (
            <p>
              はじめて利用しますか？{' '}
              <button type="button" onClick={() => setMode('register')}>
                アカウント登録
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
