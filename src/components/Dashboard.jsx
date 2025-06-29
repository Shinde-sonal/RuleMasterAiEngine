// src/components/Dashboard.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';
import KeycloakService from '../services/keycloak-service';
import Cookies from 'js-cookie';

import { CopilotKit } from '@copilotkit/react-core';
import '@copilotkit/react-ui/styles.css';

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [userRole, setUserRole] = useState('');
  const [activeLink, setActiveLink] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const username = Cookies.get('username') || 'User';
  const email = Cookies.get('email') || 'user@example.com';

  const copilotKitRuntimeUrl = "http://localhost:3001/api/copilotkit-runtime";
  const copilotKitPublicApiKey = 'ck_pub_1be11f647e7c1310f80b0e151cd065de';

  useEffect(() => {
    const roleFromCookie = Cookies.get('role');
    if (roleFromCookie) {
      setUserRole(roleFromCookie.toUpperCase());
    } else {
      console.warn("User role cookie not found. Defaulting to USER.");
      setUserRole('USER');
    }

    const currentPath = location.pathname;
    if (currentPath === '/') {
      setActiveLink('home');
    } else if (currentPath === '/dashboard') {
      setActiveLink('rule-engine');
    } else if (currentPath.startsWith('/dashboard/user-management')) {
      setActiveLink('user-management');
    } else if (currentPath.startsWith('/dashboard/tenant-management')) {
      setActiveLink('tenant-management');
    } else {
      setActiveLink('');
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
  }, [location.pathname]);

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
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const isAdmin = userRole === 'ADMIN';
  const isSuperUser = userRole === 'SUPERUSERS';

  return (
    <CopilotKit
      runtimeUrl={copilotKitRuntimeUrl}
      publicApiKey={copilotKitPublicApiKey}
    >
      <div className={styles.dashboardLayout}>
        <header className={styles.dashboardHeader}>
          <div className={styles.headerLeft}>
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
                  onClick={() => navigateTo('/', 'home')}
                  className={`${styles.navLink} ${activeLink === 'home' ? styles.activeNavLink : ''}`}
                >
                  <span className={styles.navIcon}>🏠</span> Home
                </button>
              </li>
              <li className={styles.navItem}>
                <button
                  onClick={() => navigateTo('/dashboard', 'rule-engine')}
                  className={`${styles.navLink} ${activeLink === 'rule-engine' ? styles.activeNavLink : ''}`}
                >
                  <span className={styles.navIcon}>⚙️</span> Rule Engine
                </button>
              </li>
              {isAdmin && (
                <li className={styles.navItem}>
                  <button
                    onClick={() => navigateTo('/dashboard/user-management', 'user-management')}
                    className={`${styles.navLink} ${activeLink === 'user-management' ? styles.activeNavLink : ''}`}
                  >
                    <span className={styles.navIcon}>👥</span> User Management
                  </button>
                </li>
              )}
              {isSuperUser && (
                <li className={styles.navItem}>
                  <button
                    onClick={() => navigateTo('/dashboard/tenant-management', 'tenant-management')}
                    className={`${styles.navLink} ${activeLink === 'tenant-management' ? styles.activeNavLink : ''}`}
                  >
                    <span className={styles.navIcon}>🏢</span> Tenant Management
                  </button>
                </li>
              )}
            </ul>
          </nav>

          {isSidebarOpen && <div className={styles.sidebarOverlay} onClick={toggleSidebar}></div>}

          <main className={styles.dashboardMainContent}>
            <Outlet />
          </main>
        </div>

        <footer className={styles.footer}>
          <p>&copy; 2025 RuleMaster AI. All rights reserved.</p>
          <p>Solution Name: RuleMaster AI | Version: 1.0 | Date: June 24, 2025</p>
        </footer>

      </div>
    </CopilotKit>
  );
}

export default Dashboard;