// src/components/DashboardHome.jsx

import React, { useState, useEffect } from 'react';
import layoutStyles from '../styles/Dashboard.module.css'; // For the .dashboardPageContent container
import homeStyles from '../styles/DashboardHome.module.css'; // For specific DashboardHome content
import { CopilotPopup } from '@copilotkit/react-ui';
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core';

function DashboardHome() {
  const sampleRulesData = [
    {
      "id": "9121403b-9882-429b-bf36-9b4d0909a2f7",
      "tenant_id": "2d20c76f-852b-47a7-b6ce-d4fcd71b34dc",
      "name": "assignGradeAplus",
      "description": "Assigns A+ grade if student score is above 90",
      "conditions": {
        "all": [
          {
            "fact": "score",
            "value": 90,
            "operator": ">"
          }
        ]
      },
      "event": {
        "type": "gradeAssignment",
        "params": {
          "grade": "A+",
          "message": "Congratulations! You have earned an A+."
        }
      },
      "is_active": true,
      "created_at": "2025-06-27T16:53:54.355487+00:00",
      "updated_at": "2025-06-27T16:53:54.355487+00:00"
    },
    {
      "id": "6daffe9a-10b4-4407-93e8-d84ec9f99f2d",
      "tenant_id": "2d20c76f-852b-47a7-b6ce-d4fcd71b34dc",
      "name": "AssignGradeB",
      "description": "Assigns grade B to students with marks between 60 and 75",
      "conditions": {
        "all": [
          {
            "fact": "marks",
            "value": 60,
            "operator": ">="
          },
          {
            "fact": "marks",
            "value": 75,
            "operator": "<="
          }
        ]
      },
      "event": {
        "type": "gradeAssignment",
        "params": {
          "grade": "B"
        }
      },
      "is_active": true,
      "created_at": "2025-06-27T16:56:37.003098+00:00",
      "updated_at": "2025-06-27T16:56:37.003098+00:00"
    },
    {
      "id": "9fb3d589-0116-4feb-8128-9f8d342509d2",
      "tenant_id": "2d20c76f-852b-47a7-b6ce-d4fcd71b34dc",
      "name": "MarkFailingStudents",
      "description": "Identifies students who scored below 50 and marks them as failed",
      "conditions": {
        "all": [
          {
            "fact": "score",
            "value": 50,
            "operator": "<"
          }
        ]
      },
      "event": {
        "type": "studentFailed",
        "params": {
          "status": "failed"
        }
      },
      "is_active": true,
      "created_at": "2025-06-27T16:57:02.956573+00:00",
      "updated_at": "2025-06-27T16:57:02.956573+00:00"
    }
  ];

  const [rules, setRules] = useState(sampleRulesData);
  const [isLoadingRules, setIsLoadingRules] = useState(false);
  const [errorLoadingRules, setErrorLoadingRules] = useState(null);

  const API_BASE_URL = 'http://localhost:3001/api';
  const RULES_API_URL = `${API_BASE_URL}/rules`;
  const CREATE_RULE_API_URL = `${API_BASE_URL}/rules/create`;

  const fetchRules = async () => {
    setIsLoadingRules(true);
    setErrorLoadingRules(null);
    try {
      const response = await fetch(RULES_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRules(data);
    } catch (error) {
      console.error("Error fetching rules:", error);
      setErrorLoadingRules(error.message);
    } finally {
      setIsLoadingRules(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  useCopilotReadable({
    description: "A list of rules currently active in the RuleMasterEngine system. This data is displayed in a table format with columns for ID, Name, Description, Conditions, Event Type, and Status.",
    value: rules.map(rule => ({
      id: rule.id,
      name: rule.name,
      description: rule.description,
      conditions_summary: rule.conditions && rule.conditions.all
        ? rule.conditions.all.map(c => `${c.fact} ${c.operator} ${c.value}`).join(', ')
        : 'N/A',
      event_summary: rule.event && rule.event.type
        ? `${rule.event.type} (params: ${JSON.stringify(rule.event.params)})`
        : 'N/A',
      is_active: rule.is_active,
      created_at: rule.created_at,
      updated_at: rule.updated_at,
    })),
  });

  useCopilotAction({
    name: "summarizeRules",
    description: "Summarizes the currently displayed rules in the table.",
    parameters: [],
    handler: async () => {
      if (rules.length === 0) {
        return "There are no rules to summarize.";
      }
      return `I have provided the list of ${rules.length} rules. Please ask me to summarize them or analyze specific aspects.`;
    },
  });

  useCopilotAction({
    name: "filterRulesByStatus",
    description: "Filters the rules table to show only active or inactive rules.",
    parameters: [
      {
        name: "status",
        type: "string",
        description: "The status to filter by: 'active' or 'inactive'.",
        enum: ["active", "inactive"],
        required: true,
      },
    ],
    handler: async ({ status }) => {
      const isActiveFilter = status === 'active';
      const filtered = rules.filter(rule => rule.is_active === isActiveFilter);
      return `I have identified ${filtered.length} ${status} rules.`
    },
  });

  useCopilotAction({
    name: "findRulesByGradeAssignment",
    description: "Finds rules related to specific grade assignments.",
    parameters: [
      {
        name: "grade",
        type: "string",
        description: "The grade to look for (e.g., 'A+', 'B', 'Failed').",
        required: true,
      }
    ],
    handler: async ({ grade }) => {
      const matchingRules = rules.filter(rule =>
        rule.event?.type === 'gradeAssignment' && rule.event.params?.grade?.toLowerCase() === grade.toLowerCase()
      );
      if (matchingRules.length > 0) {
        return `Found ${matchingRules.length} rule(s) for grade '${grade}'. The rules are: ${matchingRules.map(r => r.name).join(', ')}.`;
      } else {
        return `No rules found for grade '${grade}'.`;
      }
    }
  });

  useCopilotAction({
    name: "createRule",
    description: "Creates a new rule in the RuleMasterEngine system via the backend. The rules table on your dashboard will update automatically after creation.",
    parameters: [
      { name: "name", type: "string", description: "The name of the new rule (e.g., 'AssignHighGradeRule').", required: true },
      { name: "description", type: "string", description: "A brief description of what the rule does.", required: true },
      {
        name: "conditionsJson",
        type: "string",
        description: "A JSON string representing the rule's conditions (e.g., '{\"all\": [{\"fact\": \"score\", \"operator\": \">\", \"value\": 90}]}'). Use 'all' or 'any' for logical grouping.",
        required: true
      },
      { name: "eventType", type: "string", description: "The type of event the rule triggers (e.g., 'gradeAssignment', 'sendNotification').", required: true },
      {
        name: "eventParamsJson",
        type: "string",
        description: "An optional JSON string for parameters related to the event (e.g., '{\"grade\": \"A+\", \"message\": \"Good job!\"}'). Provide an empty object '{}' if no parameters.",
        required: false
      },
      { name: "isActive", type: "boolean", description: "Whether the rule should be active immediately upon creation (true or false).", required: true },
    ],
    handler: async ({ name, description, conditionsJson, eventType, eventParamsJson, isActive }) => {
      try {
        const conditions = JSON.parse(conditionsJson);
        const eventParams = eventParamsJson ? JSON.parse(eventParamsJson) : {};

        const ruleData = {
          name,
          description,
          conditions,
          event: {
            type: eventType,
            params: eventParams,
          },
          is_active: isActive,
        };

        console.log("Sending rule creation request to backend:", ruleData);

        const createResponse = await fetch(CREATE_RULE_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ruleData),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          throw new Error(errorData.error || `Failed to create rule: ${createResponse.status} ${createResponse.statusText}`);
        }

        console.log("Rule created successfully on backend.");
        await fetchRules();
        return `Rule '${name}' created successfully and the rules table on your dashboard has been updated!`;

      } catch (error) {
        console.error("Error creating rule via AI action:", error);
        return `Failed to create rule: ${error.message}. Please check the browser console for more details.`;
      }
    },
  });


  return (
    // This div uses layoutStyles.dashboardPageContent as it's the main content card structure
    <div className={layoutStyles.dashboardPageContent}>
      <h2 className={homeStyles.dashboardPageContentH2}>Welcome to your Dashboard!</h2>
      <p className={homeStyles.dashboardPageContentP}>Here you can view your analytics, recent activities, or quick access items. Click the floating button to launch the Rule Engine AI</p>

      {/* This div and its children use homeStyles as they are specific to DashboardHome content */}
      <div className={homeStyles.rulesSection}>
        <h3 className={homeStyles.rulesSectionHeader}>Your Created Rules (AI-Enhanced)</h3>
        {isLoadingRules && <p>Loading rules...</p>}
        {errorLoadingRules && <p className={homeStyles.errorText}>Error: {errorLoadingRules}</p>}
        {!isLoadingRules && rules.length === 0 && !errorLoadingRules && (
          <p>No rules found. Start creating some by chatting with Copilot!</p>
        )}
        {!isLoadingRules && rules.length > 0 && (
          <div className={homeStyles.rulesTableContainer}>
            <table className={homeStyles.rulesTable}>
              <thead>
                <tr>
                  <th className={homeStyles.rulesTableHeader}>Rule Name</th>
                  <th className={homeStyles.rulesTableHeader}>Description</th>
                  <th className={homeStyles.rulesTableHeader}>Conditions</th>
                  <th className={homeStyles.rulesTableHeader}>Action Type</th>
                  <th className={homeStyles.rulesTableHeader}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id} className={homeStyles.rulesTableRow}>
                    <td className={homeStyles.rulesTableCell}>{rule.name || `Rule ${rule.id}`}</td>
                    <td className={homeStyles.rulesTableCell}>{rule.description || 'No description'}</td>
                    <td className={homeStyles.rulesTableCell}>
                      {rule.conditions && rule.conditions.all
                        ? rule.conditions.all.map(c => `${c.fact} ${c.operator} ${c.value}`).join(', ')
                        : 'N/A'}
                    </td>
                    <td className={homeStyles.rulesTableCell}>{rule.event?.type || 'N/A'}</td>
                    <td className={homeStyles.rulesTableCell}>{rule.is_active ? 'Active' : 'Inactive'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CopilotPopup />

    </div>
  );
}

export default DashboardHome;