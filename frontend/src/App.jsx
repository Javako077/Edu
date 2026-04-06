import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Quiz from './pages/Quiz';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Feedback from './pages/Feedback';

function Protected({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Sidebar>{children}</Sidebar>;
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"         element={<Home />} />
            <Route path="/login"    element={<Login />} />
            <Route path="/signup"   element={<Signup />} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/chat"      element={<Protected><Chat /></Protected>} />
            <Route path="/quiz"      element={<Protected><Quiz /></Protected>} />
            <Route path="/progress"  element={<Protected><Progress /></Protected>} />
            <Route path="/profile"   element={<Protected><Profile /></Protected>} />
            <Route path="/settings"  element={<Protected><Settings /></Protected>} />
            <Route path="/feedback"  element={<Protected><Feedback /></Protected>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </SettingsProvider>
  );
}
