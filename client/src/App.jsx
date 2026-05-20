import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Motivation from './pages/Motivation';
import FocusSession from './pages/FocusSession';
import Summary from './pages/Summary';
import History from './pages/History';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--muted)' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/motivation" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="grid-bg" />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={
            <PublicRoute><Login /></PublicRoute>
          } />

          <Route path="/signup" element={
            <PublicRoute><Signup /></PublicRoute>
          } />

          <Route path="/motivation" element={
            <PrivateRoute><Motivation /></PrivateRoute>
          } />

          <Route path="/session" element={
            <PrivateRoute><FocusSession /></PrivateRoute>
          } />

          <Route path="/summary" element={
            <PrivateRoute><Summary /></PrivateRoute>
          } />

          <Route path="/history" element={
            <PrivateRoute><History /></PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
