import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import ApplicationDetails from './pages/ApplicationDetails.jsx';
import Applications from './pages/Applications.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Interviews from './pages/Interviews.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';
import Register from './pages/Register.jsx';
import Resumes from './pages/Resumes.jsx';
import Settings from './pages/Settings.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Everything inside AppLayout requires login */}
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="applications" element={<Applications />} />
        <Route path="applications/:id" element={<ApplicationDetails />} />
        <Route path="resumes" element={<Resumes />} />
        <Route path="interviews" element={<Interviews />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
