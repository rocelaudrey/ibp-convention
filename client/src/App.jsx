import { Routes, Route, Navigate } from 'react-router-dom';
import RegistrationPage from './pages/RegistrationPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RegistrationPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/users" element={<UsersPage />} />
      <Route path="/admin/reports" element={<ReportsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
