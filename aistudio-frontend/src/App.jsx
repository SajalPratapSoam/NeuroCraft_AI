import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ContentGenerator from './pages/ContentGenerator';
import FileTools from './pages/FileTools';
import Pricing from './pages/Pricing';

function getAuthState() {
  return Boolean(localStorage.getItem('token'));
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(getAuthState);

  useEffect(() => {
    const syncAuth = () => setIsAuthenticated(getAuthState());

    window.addEventListener('auth:changed', syncAuth);
    window.addEventListener('storage', syncAuth);

    return () => {
      window.removeEventListener('auth:changed', syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />} />

        <Route element={isAuthenticated ? <Layout /> : <Navigate to="/" replace />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/content-gen" element={<ContentGenerator />} />
          <Route path="/file-tools" element={<FileTools />} />
          <Route path="/pricing" element={<Pricing />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
