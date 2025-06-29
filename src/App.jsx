// src/App.jsx

import React, { useState, useEffect, useRef } from 'react';
// REMOVE BrowserRouter as Router from this import.
// Keep Routes, Route, Navigate, useNavigate
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import RealmLoginPage from './components/realm-verification';
import Dashboard from './components/Dashboard'; // Dashboard is the layout wrapper
import Home from './components/HomePage'; // The dedicated Home component (assuming you renamed HomePage to Home)
import DashboardHome from './components/DashboardHome'; // Rule Engine's overview content
import UserManagement from './components/UserManagement';
import TenantManagement from './components/TenantManagement';
import KeycloakService from './services/keycloak-service';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [selectedRealm, setSelectedRealm] = useState(sessionStorage.getItem('selectedRealm'));
  const isInitialLoadRef = useRef(true);
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    const initAuth = async () => {
      console.log("[App.jsx] initAuth called.");
      setAuthCheckComplete(false);

      if (selectedRealm) {
        console.log(`[App.jsx] Realm '${selectedRealm}' found in session. Initializing Keycloak.`);
        try {
          const kcInstance = await KeycloakService.initKeycloak(selectedRealm);

          if (kcInstance && kcInstance.authenticated) {
            setIsAuthenticated(true);
            console.log("[App.jsx] Keycloak authenticated.");

            // If authenticated, ensure user is on the Home page (/)
            if (window.location.pathname !== '/') {
              console.log("[App.jsx] Authenticated but not on home page. Navigating to /...");
              navigate('/', { replace: true });
            }

          } else {
            setIsAuthenticated(false);
            console.log("[App.jsx] Keycloak not authenticated or init failed. Clearing realm.");
            if (kcInstance === null || (kcInstance && !kcInstance.authenticated)) {
                 sessionStorage.removeItem('selectedRealm');
                 setSelectedRealm(null);
            }
          }
        } catch (error) {
          console.error('[App.jsx] Keycloak initialization failed in App useEffect:', error);
          sessionStorage.removeItem('selectedRealm');
          setSelectedRealm(null);
          setIsAuthenticated(false);
        } finally {
          setAuthCheckComplete(true);
          console.log("[App.jsx] Auth check completed.");
        }
      } else {
        setIsAuthenticated(false);
        setAuthCheckComplete(true);
        console.log("[App.jsx] No realm selected. Ready to show RealmLoginPage.");
      }
    };

    if (isInitialLoadRef.current || selectedRealm !== sessionStorage.getItem('selectedRealm')) {
        isInitialLoadRef.current = false;
        initAuth();
    }

  }, [selectedRealm, navigate]); // Added navigate to dependencies

  if (!authCheckComplete) {
    return <div className="loading-screen">Loading authentication service...</div>;
  }

  return (
    // REMOVE THE <Router> WRAPPER HERE!
    // The BrowserRouter from main.jsx is already providing the context.
    <Routes>
      {/* Route for Realm selection (if not authenticated and no realm selected) */}
      <Route path="/login" element={<RealmLoginPage />} />

      {/* Authenticated Routes - ALL of these will render inside the Dashboard layout */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Dashboard /> // Dashboard component acts as the layout for all nested routes
          ) : (
            <Navigate to="/login" replace /> // Redirect to login page if not authenticated
          )
        }
      >
        {/* Default content for '/' is the Home page */}
        <Route index element={<Home />} />
        <Route path="home" element={<Home />} /> {/* Explicit /home route also renders Home */}

        {/* Rule Engine / Dashboard's actual content */}
        <Route path="dashboard" element={<DashboardHome />} />

        {/* User management page */}
        <Route path="dashboard/user-management" element={<UserManagement />} />
        <Route path="dashboard/tenant-management" element={<TenantManagement />} />

        {/* Add other authenticated sub-routes here if needed, still nested under Dashboard */}
      </Route>

      {/* Fallback for any unmatched routes - redirects to login if not authenticated */}
      <Route path="*" element={
        isAuthenticated ? (
          <Navigate to="/" replace /> // If authenticated, redirect to home for unknown paths
        ) : (
          <Navigate to="/login" replace /> // If not authenticated, redirect to login for unknown paths
        )
      } />
    </Routes>
    // REMOVE THE CLOSING </Router> TAG HERE!
  );
}

export default App;