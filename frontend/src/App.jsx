import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { LandingPage } from './pages/LandingPage';
import { NoteDetailPage } from './pages/NoteDetailPage';
import { UploadPage } from './pages/UploadPage';
import './App.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<Layout />}>
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/note/:id" element={<NoteDetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
