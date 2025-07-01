// src/components/DashboardHome.jsx

import React from 'react';
import layoutStyles from '../styles/Dashboard.module.css';
import homeStyles from '../styles/DashboardHome.module.css';
import { useOutletContext } from 'react-router-dom';

function DashboardHome() {
  const { rules, isLoadingRules, errorLoadingRules, fetchRulesFromApi } = useOutletContext();

  return (
    <div className={layoutStyles.dashboardPageContent}>
      <h2 className={homeStyles.dashboardPageContentH2}>Welcome to your Dashboard!</h2>
      <p className={homeStyles.dashboardPageContentP}>Here you can view your analytics, recent activities, or quick access items. Click the floating button to launch the Rule Engine AI</p>

      <div className={homeStyles.rulesSection}>
        <h3 className={homeStyles.rulesSectionHeader}>Your Created Rules (AI-Enhanced)</h3>
        {isLoadingRules && <p className={homeStyles.messageCenter}>Loading rules...</p>}
        {errorLoadingRules && <p className={homeStyles.errorText}>Error: {errorLoadingRules}</p>}
        {!isLoadingRules && rules.length === 0 && !errorLoadingRules && (
          <p className={homeStyles.messageCenter}>No rules found. Start creating some by chatting with your custom AI!</p>
        )}
        {!isLoadingRules && rules.length > 0 && (
          <div className={homeStyles.rulesTableContainer}>
            <table className={homeStyles.rulesTable}>
              <thead>
                <tr>
                  <th className={homeStyles.rulesTableHeader}>Rule Name</th>
                  <th className={homeStyles.rulesTableHeader}>Description</th>
                  <th className={homeStyles.rulesTableHeader}>Action Type</th>
                  <th className={homeStyles.rulesTableHeader}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id} className={homeStyles.rulesTableRow}>
                    <td className={homeStyles.rulesTableCell}>{rule.name || `Rule ${rule.id}`}</td>
                    <td className={homeStyles.rulesTableCell}>{rule.description || 'No description'}</td>
                    <td className={homeStyles.rulesTableCell}>{rule.event?.type || 'N/A'}</td>
                    <td className={homeStyles.rulesTableCell}>{rule.is_active ? 'Active' : 'Inactive'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardHome;