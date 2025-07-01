// src/components/UserData.jsx

import React, { useState, useEffect } from 'react';
import styles from '../styles/UserData.module.css';
import { getGrades } from '../services/api-service';

function UserData() {
  const [grades, setGrades] = useState([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);
  const [errorLoadingGrades, setErrorLoadingGrades] = useState(null);

  // Function to fetch grades from the API
  const fetchGrades = async () => {
    setIsLoadingGrades(true);
    setErrorLoadingGrades(null); // Clear any previous errors
    try {
      const data = await getGrades(); // Call the getGrades API function
      console.log("Fetched Grades:", data); // Log the fetched data for debugging
      // Assuming 'data' is an array of grade objects
      setGrades(data);
    } catch (error) {
      console.error("Error fetching grades:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load grades.";
      setErrorLoadingGrades(errorMessage); // Set error message
    } finally {
      setIsLoadingGrades(false); // End loading
    }
  };

  // useEffect hook to fetch grades on component mount
  useEffect(() => {
    fetchGrades(); // Initial fetch when component mounts
  }, []); // Empty dependency array means this runs once on mount

  // CORRECTED: Define table headers based on the provided API response structure
  const tableHeaders = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Student Name' },
    { key: 'marks', label: 'Marks' },
    { key: 'grade', label: 'Grade' },
    { key: 'tenant_id', label: 'Tenant ID' },
  ];

  return (
    <div className={styles.userDataContainer}>
      <div className={styles.headerSection}>
        <h2>Grades Data</h2>
      </div>

      <div className={styles.gradesListSection}>
        <h3>Current Grades</h3>
        {isLoadingGrades && <p className={styles.message}>Loading grades...</p>}
        {errorLoadingGrades && <p className={styles.errorMessage}>Error: {errorLoadingGrades}</p>}
        {!isLoadingGrades && grades.length === 0 && !errorLoadingGrades && (
          <p className={styles.message}>No grades found.</p>
        )}

        {/* --- GRADES TABLE --- */}
        {!isLoadingGrades && grades.length > 0 && (
          <div className={styles.gradesTableContainer}>
            <table className={styles.gradesTable}>
              <thead>
                <tr>
                  {tableHeaders.map((header) => (
                    <th key={header.key} className={styles.gradesTableHeader}>{header.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grades.map((grade) => (
                  <tr key={grade.id} className={styles.gradesTableRow}>
                    {tableHeaders.map((header) => (
                      <td key={header.key} className={styles.gradesTableCell}>
                        {/* Access data directly using grade[header.key] */}
                        {grade[header.key] || 'N/A'} {/* Display 'N/A' for undefined/null fields */}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* --- END GRADES TABLE --- */}
      </div>
    </div>
  );
}

export default UserData;