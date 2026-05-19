import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './layouts/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomeFeed from './pages/HomeFeed';
import Trending from './pages/Trending';
import LoginRegister from './pages/LoginRegister';
import ResetPassword from './pages/ResetPassword';
import UserProfile from './pages/UserProfile';
import ArticleDetails from './pages/ArticleDetails';
import CreateEditArticle from './pages/CreateEditArticle';
import Notifications from './pages/Notifications';
import SearchResults from './pages/SearchResults';
import Bookmarks from './pages/Bookmarks';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomeFeed />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/enter" element={<LoginRegister />} />
            <Route path="/resetpassword/:token" element={<ResetPassword />} />
            <Route path="/u/:username" element={<UserProfile />} />
            <Route path="/posts/:slug" element={<ArticleDetails />} />
            <Route path="/search" element={<SearchResults />} />

            {/* Protected User Routes */}
            <Route
              path="/new"
              element={
                <ProtectedRoute>
                  <CreateEditArticle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <ProtectedRoute>
                  <CreateEditArticle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookmarks"
              element={
                <ProtectedRoute>
                  <Bookmarks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
