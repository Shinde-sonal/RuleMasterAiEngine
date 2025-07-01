// src/components/Dashboard.jsx - FIX: CustomChatPopup moved inside RuleProvider

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';
import KeycloakService from '../services/keycloak-service';
import Cookies from 'js-cookie';

import CustomChatPopup from './CopilotPopup'; // Assuming 'CopilotPopup' is the correct file name for CustomChatPopup

import { RuleProvider } from '../contexts/RuleContext';
import { getAllRules } from '../services/api-service';

function Dashboard({ onUserRoleChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [userRole, setUserRole] = useState('');
  const [activeLink, setActiveLink] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const username = Cookies.get('username') || 'User';
  const email = Cookies.get('email') || 'user@example.com';

  const [rules, setRules] = useState([]);
  const [isLoadingRules, setIsLoadingRules, ] = useState(false);
  const [errorLoadingRules, setErrorLoadingRules] = useState(null);

  const fetchRulesFromApi = useCallback(async () => {
    setIsLoadingRules(true);
    setErrorLoadingRules(null);
    try {
      const data = await getAllRules();
      setRules(data);
    } catch (error) {
      console.error("Error fetching rules:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load rules.";
      setErrorLoadingRules(errorMessage);
    } finally {
      setIsLoadingRules(false);
    }
  }, []);

  useEffect(() => {
    if (location.pathname === '/' || location.pathname.startsWith('/dashboard')) {
        fetchRulesFromApi();
    }
  }, [location.pathname, fetchRulesFromApi]);

  useEffect(() => {
    const roleFromCookie = Cookies.get('role');
    let determinedRole = 'USER';
    if (roleFromCookie) {
      determinedRole = roleFromCookie.toUpperCase();
    } else {
      console.warn("User role cookie not found. Defaulting to USER.");
    }
    setUserRole(determinedRole);
    if (onUserRoleChange) {
      onUserRoleChange(determinedRole);
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
    } else if (currentPath.startsWith('/dashboard/user-data')) {
      setActiveLink('user-data');
    }
    else {
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
  }, [location.pathname, onUserRoleChange]);

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
    if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const isAdmin = userRole === 'ADMIN';
  const isUser = userRole === 'USER';
  const isSuperUser = userRole === 'SUPERUSERS';

  const scrollableContentWrapperClass = `${styles.scrollableContentWrapper} ${!isSidebarOpen ? styles.collapsedSidebarShift : ''}`;


  return (
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
          {userRole !== 'SUPERUSERS' && (
            <li className={styles.navItem}>
              <button
                onClick={() => navigateTo('/dashboard', 'rule-engine')}
                className={`${styles.navLink} ${activeLink === 'rule-engine' ? styles.activeNavLink : ''}`}
              >
                <span className={styles.navIcon}>⚙️</span> Rule Engine
              </button>
            </li>
          )}
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

          {(isAdmin || isUser) && (
            <li className={styles.navItem}>
              <button
                onClick={() => navigateTo('/dashboard/user-data', 'user-data')}
                className={`${styles.navLink} ${activeLink === 'user-data' ? styles.activeNavLink : ''}`}
              >
                <span className={styles.navIcon}>📊</span> Grades Data
              </button>
            </li>
          )}

        </ul>
      </nav>

      <RuleProvider fetchRules={fetchRulesFromApi}>
        {/* CustomChatPopup is NOW INSIDE the RuleProvider */}
        {(isAdmin || isUser) && (
          <CustomChatPopup />
        )}

        <div className={scrollableContentWrapperClass}>
          {isSidebarOpen && window.innerWidth <= 768 && (
            <div className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.expanded : ''}`} onClick={toggleSidebar}></div>
          )}
          <main className={styles.dashboardMainContent}>
            <Outlet context={{ rules, isLoadingRules, errorLoadingRules, fetchRulesFromApi }} />
          </main>
        </div>
      </RuleProvider>

      <footer className={styles.footer}>
        <p>&copy; 2025 RuleMaster AI. All rights reserved.</p>
        <p>Solution Name: RuleMaster AI | Version: 1.0 | Date: June 24, 2025</p>
      </footer>
    </div>
  );
}

export default Dashboard;