// src/components/DashboardHome.jsx

import React, { useState } from 'react';
import styles from '../styles/Dashboard.module.css'; // Main Dashboard styles
import popupStyles from '../styles/CopilotPopup.module.css'; // Import FAB styles
import CopilotPopup from './CopilotPopup'; // Import the popup component

function DashboardHome() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const togglePopup = () => {
    setIsPopupOpen(prev => !prev);
  };

  return (
    <div className={styles.dashboardPageContent}>
      <h2>Welcome to your Dashboard!</h2>
      <p>This is where your main application content will go.</p>

      <p>
        Here you can view your analytics, recent activities, or quick access items.
        Click the floating button to launch the Rule Engine Copilot!
      </p>

      {/* The floating action button (FAB) for the copilot */}
      <button className={popupStyles.fab} onClick={togglePopup} title="Open Rule Engine Bot">
        🤖
      </button>

      {/*
        Render the CopilotPopup component (which now contains CopilotKit's UI).
        The `isOpen` prop here controls whether the CopilotKit system is mounted/unmounted.
        Actual popup visibility might be controlled internally by CopilotKit or via their API/hooks.
        You'll need to check CopilotKit's docs for how to trigger *their* popup with your FAB.
        E.g., if they have a hook like `useCopilotChat().openChat()`
      */}
      {isPopupOpen && <CopilotPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />}

    </div>
  );
}

export default DashboardHome;