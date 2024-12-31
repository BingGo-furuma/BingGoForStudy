import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import Login from './pages/Login';
import BingoPage from './pages/BingoPage'; // ビンゴページをインポート

function App() {
    const [showSplash, setShowSplash] = useState(true);

    return (
        <Router>
            {showSplash ? (
                <SplashScreen onComplete={() => setShowSplash(false)} />
            ) : (
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/bingo" element={<BingoPage />} /> {/* ビンゴページへのルート */}
                </Routes>
            )}
        </Router>
    );
}

export default App;
