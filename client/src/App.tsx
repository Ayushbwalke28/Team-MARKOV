import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import LandingPage from './pages/LandingPage.tsx';
import Login from './Login.tsx';
import HomeFeed from './pages/HomeFeed.tsx';
import Jobs from './pages/Jobs.tsx';
import Events from './pages/Events.tsx';
import Opportunities from './pages/Opportunities.tsx';
import Messages from './pages/Messages.tsx';
import AIAssistant from './pages/AIAssistant.tsx';
import Analytics from './pages/Analytics.tsx';
import Settings from './pages/Settings.tsx';
import Network from './pages/Network.tsx';

import { AuthProvider } from './context/AuthContext.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';

export default function App() {
  return (
    <AuthProvider>
      <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        
        {/* SyncUp Pro Routes wrapped in Sidebar Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/home" element={<HomeFeed />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/events" element={<Events />} />
          <Route path="/network" element={<Network />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Fallbacks for old paths */}
          <Route path="/dashboard" element={<Navigate to="/home" replace />} />
          <Route path="/marketplace" element={<Navigate to="/jobs" replace />} />
            <Route path="/explore" element={<Navigate to="/opportunities" replace />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Router>
    </AuthProvider>
  );
}
