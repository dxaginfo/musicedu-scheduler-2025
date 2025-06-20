import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Materials from './pages/Materials';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import { useAppSelector } from './redux/hooks';

const App: React.FC = () => {
  // This would normally be connected to an auth state
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<Layout />}>
          <Route path="/" element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
          } />
          <Route path="/calendar" element={
            isAuthenticated ? <Calendar /> : <Navigate to="/login" replace />
          } />
          <Route path="/students" element={
            isAuthenticated ? <Students /> : <Navigate to="/login" replace />
          } />
          <Route path="/teachers" element={
            isAuthenticated ? <Teachers /> : <Navigate to="/login" replace />
          } />
          <Route path="/materials" element={
            isAuthenticated ? <Materials /> : <Navigate to="/login" replace />
          } />
          <Route path="/reports" element={
            isAuthenticated ? <Reports /> : <Navigate to="/login" replace />
          } />
          <Route path="/settings" element={
            isAuthenticated ? <Settings /> : <Navigate to="/login" replace />
          } />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Box>
  );
};

export default App;
