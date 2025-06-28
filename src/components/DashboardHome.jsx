// src/components/DashboardHome.jsx

import React from 'react';
import styles from '../styles/Dashboard.module.css'; // Reuse Dashboard styles for consistency

function DashboardHome() {
  return (
    <div className={styles.dashboardPageContent}> {/* Use a specific class for page content styling */}
      <h2>Welcome to your Dashboard!</h2>
      <p>This is where your main application content will go.</p>
      {/* Add more dashboard specific content here */}
    </div>
  );
}

export default DashboardHome;