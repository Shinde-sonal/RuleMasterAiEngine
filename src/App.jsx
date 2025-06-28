// src/App.jsx

import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RealmLoginPage from './components/realm-verification';
import Dashboard from './components/Dashboard'; // Import Dashboard as the layout
import DashboardHome from './components/DashboardHome'; // Import the new DashboardHome
import UserManagement from './components/UserManagement'; // Import the new UserManagement
import TenantManagement from './components/TenantManagement'; // Import the new UserManagement
import KeycloakService from './services/keycloak-service';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [selectedRealm, setSelectedRealm] = useState(sessionStorage.getItem('selectedRealm'));

  const isInitialLoadRef = useRef(true);

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

            // If on root path and authenticated, redirect to dashboard
            if (window.location.pathname === '/') {
              console.log("[App.jsx] On root path and authenticated. Redirecting to /dashboard...");
              window.location.replace('/dashboard');
              return;
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

    return () => {};
  }, [selectedRealm]);

  if (!authCheckComplete) {
    return <div className="loading-screen">Loading authentication service...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            !selectedRealm ? (
              <RealmLoginPage />
            ) :
            !isAuthenticated ? (
                <div className="loading-screen">Authenticating for {selectedRealm}...</div>
            ) :
            (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        {/* Nested routes for the Dashboard layout */}
        <Route path="/dashboard" element={
          isAuthenticated ? (
            <Dashboard />
          ) : (
            <Navigate to="/" replace />
          )
        }>
          {/* Default dashboard content (e.g., when path is /dashboard) */}
          <Route index element={<DashboardHome />} />
          {/* User management page (e.g., when path is /dashboard/user-management) */}
          <Route path="user-management" element={<UserManagement />} />
          <Route path="tenant-management" element={<TenantManagement />} />
          {/* Add other dashboard-specific sub-routes here */}
        </Route>

        {/* Fallback for any unmatched routes - redirects to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;