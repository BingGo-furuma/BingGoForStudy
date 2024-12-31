// SplashScreen.js
import React, { useEffect, useState } from 'react';
import './SplashScreen.css'; // ロゴデザイン用のCSS

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return <div className="splash-screen">BingGo!!</div>;
};

export default SplashScreen;
