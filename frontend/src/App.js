import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import Login from './pages/Login';
import BingoPage from './pages/BingoPage';
import BingoBoardPage from './pages/BingoBoardPage';
import Search from './pages/Search';
import Home from './pages/Home';
import Insights from './pages/Insights';
import Planner from './pages/Planner';
import BingGoHome from './pages/BingGoHome';
import BingGoArchive from './pages/BingGoArchive';
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
                <Route path="/insights" element={<Insights />} />
                <Route path="/planner" element={<Planner />} />
                <Route path="/bingo" element={<BingoPage />} />
                <Route path="/bingo/:cardId" element={<BingoBoardPage />} />
                <Route path="/binggo/home" element={<BingGoHome />} />
                <Route path="/binggo/archive" element={<BingGoArchive />} />
                <Route path="/binggo/:cardId" element={<BingoBoardPage />} />
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
