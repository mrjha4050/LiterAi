import { Routes, Route } from 'react-router-dom';
import React from 'react';
import LandingPage from './components/landingPage';
import LiterAI from './components/literAi';
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<LiterAI />} />
    </Routes>
  );
}

export default App;