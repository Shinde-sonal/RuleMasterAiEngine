// src/components/Dashboard.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';
import KeycloakService from '../services/keycloak-service';
import Cookies from 'js-cookie';

// --- ESSENTIAL: Import CopilotKit and its base styles ---
import { CopilotKit } from '@copilotkit/react-core';
import '@copilotkit/react-ui/styles.css'; // Make sure these styles are imported for CopilotKit UI components

function Dashboard() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [userRole, setUserRole] = useState('');
  const [activeLink, setActiveLink] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // New state for sidebar

  const username = Cookies.get('username') || 'User';
  const email = Cookies.get('email') || 'user@example.com';

  // --- ESSENTIAL: Define CopilotKit Runtime URL and Public API Key ---
  // This is the URL to your Node.js backend's endpoint for CopilotKit's AI runtime.
  // IMPORTANT: Ensure your CopilotKit backend is running on this port (e.g., 3001)
  const copilotKitRuntimeUrl = "http://localhost:3001/api/copilotkit-runtime";

  // If CopilotKit requires a public API key, provide it here.
  // If your backend handles authentication/API keying entirely, this might be optional.
  const copilotKitPublicApiKey = 'ck_pub_1be11f647e7c1310f80b0e151cd065de'; // Use your actual key

  useEffect(() => {
    const roleFromCookie = Cookies.get('role');
    if (roleFromCookie) {
      setUserRole(roleFromCookie.toUpperCase());
    } else {
      console.warn("User role cookie not found. Defaulting to USER.");
      setUserRole('USER');
    }

    const currentPath = window.location.pathname;
    if (currentPath.includes('/dashboard/user-management')) {
      setActiveLink('user-management');
    } else if (currentPath.includes('/dashboard/tenant-management')) {
      setActiveLink('tenant-management');
    }
    else if (currentPath.includes('/dashboard')) {
      setActiveLink('dashboard');
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const handleSignOut = () => {
    console.log("Signing out...");
    KeycloakService.logout();
  };

  const handleViewProfile = () => {
    console.log("View Profile clicked!");
    setIsDropdownOpen(false);
  };

  const navigateTo = (path, linkName) => {
    navigate(path);
    setActiveLink(linkName);
    setIsSidebarOpen(false); // Close sidebar after navigation on mobile
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const isAdmin = userRole === 'ADMIN';
  const isSuperUser = userRole === 'SUPERUSERS';

  return (
    // --- THIS IS THE CRITICAL WRAPPER FOR CopilotKit ---
    // Ensure CopilotKit wraps the entire part of your application where AI features are used.
    // In your case, it should wrap the dashboard layout.
    <CopilotKit
      runtimeUrl={copilotKitRuntimeUrl}
      publicApiKey={copilotKitPublicApiKey}
    >
      <div className={styles.dashboardLayout}>
        <header className={styles.dashboardHeader}>
          <div className={styles.headerLeft}>
            {/* Hamburger Button */}
            <button className={styles.hamburgerButton} onClick={toggleSidebar}>
              ☰
            </button>
            <span className={styles.logo}>RuleMasterEngine</span>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.profileContainer} ref={dropdownRef}>
              <button className={styles.profileIcon} onClick={toggleDropdown}>
                <span>{username.charAt(0).toUpperCase()}</span>
              </button>
              {isDropdownOpen && (
                <div className={styles.profileDropdown}>
                  <div className={styles.dropdownHeader}>
                    <p className={styles.dropdownUsername}>{username}</p>
                    <p className={styles.dropdownEmail}>{email}</p>
                  </div>
                  <button className={styles.dropdownItem} onClick={handleViewProfile}>
                    View Profile
                  </button>
                  <button className={styles.dropdownItem} onClick={handleSignOut}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className={styles.mainContentArea}>
          <nav className={`${styles.sidebar} ${isSidebarOpen ? styles.expanded : ''}`}>
            <ul className={styles.navList}>
              <li className={styles.navItem}>
                <button
                  onClick={() => navigateTo('/dashboard', 'dashboard')}
                  className={`${styles.navLink} ${activeLink === 'dashboard' ? styles.activeNavLink : ''}`}
                >
                  Dashboard
                </button>
              </li>
              {isAdmin && (
                <li className={styles.navItem}>
                  <button
                    onClick={() => navigateTo('/dashboard/user-management', 'user-management')}
                    className={`${styles.navLink} ${activeLink === 'user-management' ? styles.activeNavLink : ''}`}
                  >
                    User Management
                  </button>
                </li>
              )}
              {isSuperUser && (
                <li className={styles.navItem}>
                  <button
                    onClick={() => navigateTo('/dashboard/tenant-management', 'tenant-management')}
                    className={`${styles.navLink} ${activeLink === 'tenant-management' ? styles.activeNavLink : ''}`}
                  >
                    Tenant Management
                  </button>
                </li>
              )}
            </ul>
          </nav>

          {/* Sidebar Overlay (only visible on small screens when sidebar is open) */}
          {isSidebarOpen && <div className={styles.sidebarOverlay} onClick={toggleSidebar}></div>}

          <main className={styles.dashboardMainContent}>
            {/* The Outlet is where DashboardHome (and other sub-routes) will render. */}
            {/* Since CopilotKit wraps this whole div, DashboardHome will receive the context. */}
            <Outlet />
          </main>
        </div>
      </div>
    </CopilotKit>
  );
}

export default Dashboard;