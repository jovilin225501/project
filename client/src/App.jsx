import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ResidentDashboard from './pages/ResidentDashboard.jsx';
import ReportWastePage from './pages/ReportWastePage.jsx';
import MyReportsPage from './pages/MyReportsPage.jsx';
import ReportDetailsPage from './pages/ReportDetailsPage.jsx';
import PickupRequestsPage from './pages/PickupRequestsPage.jsx';
import RewardsLeaderboardPage from './pages/RewardsLeaderboardPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminReportsPage from './pages/AdminReportsPage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import ProfileSettingsPage from './pages/ProfileSettingsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export const App = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              {/* Public Pages */}
              <Route index element={<LandingPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="rewards" element={<RewardsLeaderboardPage />} />

              {/* Resident Protected Routes */}
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <ResidentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="reports/new"
                element={
                  <ProtectedRoute>
                    <ReportWastePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="reports"
                element={
                  <ProtectedRoute>
                    <MyReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="reports/:id"
                element={
                  <ProtectedRoute>
                    <ReportDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="pickups"
                element={
                  <ProtectedRoute>
                    <PickupRequestsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <ProfileSettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/reports"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/users"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;
