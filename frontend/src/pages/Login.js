import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { ProgramTypes, useAppContext } from '../context/AppContext';
import './Login.css';

const Login = () => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(ProgramTypes.STUDY);
  const navigate = useNavigate();
  const location = useLocation();
  const { loadInitialData, selectExperience } = useAppContext();

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
        selectExperience(selectedExperience);
        await loadInitialData(selectedExperience);
        const defaultPath = selectedExperience === ProgramTypes.BINGGO ? '/binggo/home' : '/home';
        const redirectPath = location.state?.from?.pathname || defaultPath;
        navigate(redirectPath, { replace: true });
      }
    } catch (error) {
      setMessage(error.message || 'エラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExperienceChange = (value) => {
    setSelectedExperience(value);
  };

  return (
    <div className="auth-container">
      <div className="auth-hero">
        <h1>BingGo!!</h1>
        <p>学習を後押しする <strong>Bing Go for Study</strong> と、ライフチャレンジに挑む <strong>Bing Go</strong> を自由に切り替えて楽しめます。</p>
        <ul>
          <li>for Study: 学習カードで毎日のチャレンジを選択し、正答率でビンゴ達成</li>
          <li>Bing Go: 7×7の月間チャレンジで季節のミッションをクリアしてポイント獲得</li>
          <li>アプリ内でいつでもモードを変更し、同じアカウントで進捗を共有</li>
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
          <div className="experience-selector">
            <p>ログイン後に利用するアプリを選択してください。</p>
            <div className="experience-selector__options">
              <button
                type="button"
                className={`experience-card ${selectedExperience === ProgramTypes.STUDY ? 'experience-card--active' : ''}`}
                onClick={() => handleExperienceChange(ProgramTypes.STUDY)}
              >
                <span className="experience-card__label">Bing Go for Study</span>
                <span className="experience-card__description">学習計画とクイズでビンゴを進める学生向けモード</span>
              </button>
              <button
                type="button"
                className={`experience-card ${selectedExperience === ProgramTypes.BINGGO ? 'experience-card--active' : ''}`}
                onClick={() => handleExperienceChange(ProgramTypes.BINGGO)}
              >
                <span className="experience-card__label">Bing Go</span>
                <span className="experience-card__description">月間49個のライフチャレンジをこなしてポイント獲得</span>
              </button>
            </div>
          </div>
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
