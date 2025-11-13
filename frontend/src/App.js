import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import Login from './pages/Login';
import BingoPage from './pages/BingoPage';
import BingoBoardPage from './pages/BingoBoardPage';
import Search from './pages/Search';
import Home from './pages/Home';
import AppLayout from './components/AppLayout';
import RequireAuth from './components/RequireAuth';
import { AppProvider } from './context/AppContext';
import './App.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AppProvider>
      <Router>
        {showSplash ? (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        ) : (
          <Routes>
            <Route path="/" element={<Login />} />
            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route path="/home" element={<Home />} />
                <Route path="/bingo" element={<BingoPage />} />
                <Route path="/bingo/:cardId" element={<BingoBoardPage />} />
                <Route path="/search" element={<Search />} />
              </Route>
            </Route>
          </Routes>
        )}
      </Router>
    </AppProvider>
  );
}

export default App;
