import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Layout/Navbar';
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
import LessonDetail from './pages/LessonDetail';
import Practice from './pages/Practice'; 
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProgressProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/lessons" element={<ProtectedRoute><Lessons /></ProtectedRoute>} />
                  <Route path="/lessons/:id" element={<ProtectedRoute><LessonDetail /></ProtectedRoute>} />
                  <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                </Routes>
              </main>
              <Toaster position="top-right" />
            </div>
          </Router>
        </ProgressProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;