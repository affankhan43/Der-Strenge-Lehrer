import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useProgressStore } from './store/progressStore';

import AuthPage      from './pages/AuthPage';
import LandingPage   from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import TaskPage      from './pages/TaskPage';
import HistoryPage   from './pages/HistoryPage';
import ProfilePage   from './pages/ProfilePage';
import AdminPage     from './pages/AdminPage';
import ReelsPage      from './pages/ReelsPage';
import BookmarksPage  from './pages/BookmarksPage';
import AppLayout      from './components/AppLayout';

function Protected({ children }) {
  const { user } = useAuthStore();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <AppLayout>{children}</AppLayout>;
}

function AdminProtected({ children }) {
  const { user, isAdmin } = useAuthStore();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/app" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function AuthGuard({ children }) {
  const { user } = useAuthStore();
  if (user) return <Navigate to="/app" replace />;
  return children;
}

export default function App() {
  const { restoreSession, restoreAdmin } = useAuthStore();
  const { fetchAll } = useProgressStore();

  useEffect(() => {
    restoreSession?.();
    restoreAdmin?.();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"       element={<LandingPage />} />
        <Route path="/login"  element={<AuthGuard><AuthPage /></AuthGuard>} />

        {/* Protected app — all share AppLayout sidebar */}
        <Route path="/app"
          element={<Protected><DashboardPage /></Protected>}
        />
        <Route path="/app/task"
          element={<Protected><TaskPage /></Protected>}
        />
        <Route path="/app/task/:day/:order"
          element={<Protected><TaskPage /></Protected>}
        />
        <Route path="/reels"
          element={<Protected><ReelsPage /></Protected>}
        />
        <Route path="/bookmarks"
          element={<Protected><BookmarksPage /></Protected>}
        />
        <Route path="/history"
          element={<Protected><HistoryPage /></Protected>}
        />
        <Route path="/profile"
          element={<Protected><ProfilePage /></Protected>}
        />
        <Route path="/admin"
          element={<AdminProtected><AdminPage /></AdminProtected>}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
