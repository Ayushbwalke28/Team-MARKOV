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
import Verification from './pages/Verification.tsx';
import AdminReviewDashboard from './pages/AdminReviewDashboard.tsx';
import CompanyDashboard from './pages/CompanyDashboard.tsx';
import InvestorDashboard from './pages/InvestorDashboard.tsx';
import DealRoomView from './pages/DealRoomView.tsx';

import { AuthProvider } from './context/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import ThemeToggle from './components/ThemeToggle.tsx';

export default function App() {
  return (
    <ThemeProvider>
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
                <Route path="/profile" element={<Settings />} />
                <Route path="/verify" element={<Verification />} />
                <Route path="/admin/reviews" element={<AdminReviewDashboard />} />
                <Route path="/company" element={<CompanyDashboard />} />
                <Route path="/investor" element={<InvestorDashboard />} />
                <Route path="/deal-room/:id" element={<DealRoomView />} />

                {/* Fallbacks for old paths */}
                <Route path="/dashboard" element={<Navigate to="/home" replace />} />
                <Route path="/marketplace" element={<Navigate to="/jobs" replace />} />
                <Route path="/explore" element={<Navigate to="/opportunities" replace />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ThemeToggle />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
