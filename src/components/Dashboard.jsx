// src/components/Dashboard.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom'; // Import Outlet and useNavigate
import styles from '../styles/Dashboard.module.css';
import KeycloakService from '../services/keycloak-service';
import Cookies from 'js-cookie';

function Dashboard() {
  const navigate = useNavigate(); // Hook for navigation
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [userRole, setUserRole] = useState(''); // State to store the role from cookie
  const [activeLink, setActiveLink] = useState('dashboard'); // State to highlight active nav link

  // Get user information from cookies
  const username = Cookies.get('username') || 'User';
  const email = Cookies.get('email') || 'user@example.com';

  useEffect(() => {
    // Get role from cookie
    const roleFromCookie = Cookies.get('role');
    if (roleFromCookie) {
      setUserRole(roleFromCookie.toUpperCase()); // Store as uppercase for easier comparison
    } else {
      console.warn("User role cookie not found. Defaulting to USER.");
      // Handle case where role isn't available, e.g., default to USER
      setUserRole('USER');
    }

    // Set initial active link based on current path
    const currentPath = window.location.pathname;
    if (currentPath.includes('/dashboard/user-management')) {
      setActiveLink('user-management');
    } else if (currentPath.includes('/dashboard/tenant-management')) { // New check for tenant management
      setActiveLink('tenant-management');
    }
    else if (currentPath.includes('/dashboard')) {
      setActiveLink('dashboard');
    }

    // Function to handle clicking outside the dropdown to close it
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Empty dependency array means this runs once on mount

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
    // navigate('/profile'); // Example: Navigate to a user profile page
  };

  // Function to handle navigation
  const navigateTo = (path, linkName) => {
    navigate(path);
    setActiveLink(linkName);
  };

  const isAdmin = userRole === 'ADMIN';
  const isSuperUser = userRole === 'SUPERUSERS';

  return (
    <div className={styles.dashboardLayout}> {/* Main layout container */}
      <header className={styles.dashboardHeader}>
        <div className={styles.headerLeft}>
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

      <div className={styles.mainContentArea}> {/* Area for sidebar and main content */}
        <nav className={styles.sidebar}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <button
                onClick={() => navigateTo('/dashboard', 'dashboard')}
                className={`${styles.navLink} ${activeLink === 'dashboard' ? styles.activeNavLink : ''}`}
              >
                Dashboard
              </button>
            </li>
            {isAdmin && ( /* Conditionally render User Management based on ADMIN role */
              <li className={styles.navItem}>
                <button
                  onClick={() => navigateTo('/dashboard/user-management', 'user-management')}
                  className={`${styles.navLink} ${activeLink === 'user-management' ? styles.activeNavLink : ''}`}
                >
                  User Management
                </button>
              </li>
            )}
            {isSuperUser && ( /* Conditionally render Tenant Management based on SUPERUSER role */
              <li className={styles.navItem}>
                <button
                  onClick={() => navigateTo('/dashboard/tenant-management', 'tenant-management')}
                  className={`${styles.navLink} ${activeLink === 'tenant-management' ? styles.activeNavLink : ''}`}
                >
                  Tenant Management
                </button>
              </li>
            )}
            {/* Add more navigation items here */}
          </ul>
        </nav>

        <main className={styles.dashboardMainContent}>
          {/* This is where nested routes will render their content */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;