// src/components/TenantManagement.jsx

import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/TenantManagement.module.css';
import { getAllRealms, deleteRealm, createTenant } from '../services/api-service'; // Import createTenant

function TenantManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminRole, setAdminRole] = useState('');

  const [realms, setRealms] = useState([]);
  const [isLoadingRealms, setIsLoadingRealms] = useState(true);
  const [errorLoadingRealms, setErrorLoadingRealms] = useState(null);

  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  // NEW: State for creation message and success status within the modal
  const [creationMessage, setCreationMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const fetchRealms = async () => {
    setIsLoadingRealms(true);
    setErrorLoadingRealms(null);
    try {
      const data = await getAllRealms();
      console.log("Fetched Realms:", data.realms);
      setRealms(Array.isArray(data.realms) ? data.realms : []);
    } catch (error) {
      console.error("Error fetching realms:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load realms.";
      setErrorLoadingRealms(errorMessage);
    } finally {
      setIsLoadingRealms(false);
    }
  };

  useEffect(() => {
    fetchRealms();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // UPDATED: handleCreateTenant is now async and uses API
  const handleCreateTenant = async (e) => {
    e.preventDefault();

    setCreationMessage(''); // Clear previous messages
    setIsSuccess(false);

    // --- Validation Logic ---
    if (!tenantName || !adminFirstName || !adminLastName || !adminEmail || !adminRole) {
      setCreationMessage('Please fill in all required fields.');
      setIsSuccess(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      setCreationMessage('Please enter a valid email address for the Tenant Admin.');
      setIsSuccess(false);
      return;
    }

    const nameRegex = /^[a-zA-Z\s-]+$/;
    if (!nameRegex.test(adminFirstName)) {
      setCreationMessage('Tenant Admin First Name can only contain letters, spaces, and hyphens.');
      setIsSuccess(false);
      return;
    }
    if (!nameRegex.test(adminLastName)) {
      setCreationMessage('Tenant Admin Last Name can only contain letters, spaces, and hyphens.');
      setIsSuccess(false);
      return;
    }
    // --- End Validation Logic ---

    // Corrected payload structure as per your curl --data-raw
    const newTenantData = {
      tenantName: tenantName, // Matches 'tenantName' from curl
      admin: {
        firstName: adminFirstName,
        lastName: adminLastName,
        email: adminEmail,
        // The curl example included 'role', not 'username' here.
        // If your backend expects 'username' as well, you can add it,
        // but for now matching the curl exactly for 'admin' object.
        role: adminRole // Matches 'role' from curl
      }
    };

    console.log("New Tenant Data (to be sent to API):", newTenantData);

    try {
      // Call the createTenant API function
      const response = await createTenant(newTenantData);
      console.log('Tenant created successfully:', response);
      setCreationMessage('Tenant created successfully!');
      setIsSuccess(true);

      // Clear form fields
      setTenantName('');
      setAdminFirstName('');
      setAdminLastName('');
      setAdminEmail('');
      setAdminRole('');

      // Close modal and refresh list after a short delay
      setTimeout(() => {
        setIsModalOpen(false);
        setCreationMessage(''); // Clear message for next open
        fetchRealms(); // Refresh the list to show the newly created tenant
      }, 1500);

    } catch (error) {
      console.error('Error creating tenant:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to create tenant.";
      setCreationMessage(`Error: ${errorMessage}`);
      setIsSuccess(false);
    }
  };

  const handleDeleteTenant = async (realmName) => {
    if (window.confirm(`Are you sure you want to delete tenant: ${realmName}? This action cannot be undone.`)) {
      try {
        console.log(`Attempting to delete realm with name: ${realmName}`);
        await deleteRealm(realmName);
        alert('Tenant deleted successfully!');
        fetchRealms();
      } catch (error) {
        console.error('Error deleting tenant:', error);
        alert(`Failed to delete tenant: ${error.response?.data?.message || error.message}`);
      } finally {
        setActiveDropdownId(null);
      }
    }
  };

  return (
    <div className={styles.tenantCreationContainer}>
      <div className={styles.headerSection}>
        <h2>Tenant Management</h2>
        <button className={styles.createTenantButton} onClick={() => {
          setIsModalOpen(true);
          setCreationMessage(''); // Clear messages when opening modal
          setIsSuccess(false); // Reset success status
        }}>
          Create New Tenant
        </button>
      </div>

      <div className={styles.tenantListSection}>
        <h3>Current Tenants</h3>
        {isLoadingRealms && <p>Loading tenants...</p>}
        {errorLoadingRealms && <p className={styles.errorText}>Error: {errorLoadingRealms}</p>}
        {!isLoadingRealms && realms.length === 0 && !errorLoadingRealms && (
          <p className={styles.noTenantsMessage}>No tenants found. Click 'Create New Tenant' to add one.</p>
        )}

        {!isLoadingRealms && realms.length > 0 && (
          <div className={styles.realmsTableContainer}>
            <table className={styles.realmsTable}>
              <thead>
                <tr>
                  <th className={styles.realmsTableHeader}>ID</th>
                  <th className={styles.realmsTableHeader}>Realm Name</th>
                  <th className={styles.realmsTableHeader}>Enabled</th>
                  <th className={styles.realmsTableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {realms.map((realm) => (
                  <tr key={realm.id || realm.realm} className={styles.realmsTableRow}>
                    <td className={styles.realmsTableCell}>{realm.id}</td>
                    <td className={styles.realmsTableCell}>{realm.realm}</td>
                    <td className={styles.realmsTableCell}>{realm.enabled ? 'Yes' : 'No'}</td>
                    <td className={styles.realmsTableCell}>
                      <div
                        className={styles.actionDropdownContainer}
                        ref={activeDropdownId === realm.id ? dropdownRef : null}
                      >
                        <button
                          className={styles.actionKebabButton}
                          onClick={() => setActiveDropdownId(activeDropdownId === realm.id ? null : realm.id)}
                          aria-label="Actions"
                        >
                          &#x22EE;
                        </button>
                        {activeDropdownId === realm.id && (
                          <div className={styles.actionDropdownMenu}>
                            <button
                              className={styles.dropdownItem}
                              onClick={() => handleDeleteTenant(realm.realm)}
                            >
                              Delete Tenant
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Create New Tenant</h3>
              <button className={styles.closeModalButton} onClick={() => setIsModalOpen(false)} aria-label="Close modal">
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateTenant} className={styles.tenantForm}>
              <div className={styles.formGroup}>
                <label htmlFor="tenantName">Tenant Name: <span className={styles.requiredAsterisk}>*</span></label>
                <input
                  type="text"
                  id="tenantName"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  required
                  className={styles.formInput}
                  placeholder="Enter tenant name"
                  minLength="3"
                />
              </div>

              <h4 className={styles.subHeading}>Tenant Admin Details</h4>

              <div className={styles.formGroup}>
                <label htmlFor="adminFirstName">Admin First Name: <span className={styles.requiredAsterisk}>*</span></label>
                <input
                  type="text"
                  id="adminFirstName"
                  value={adminFirstName}
                  onChange={(e) => setAdminFirstName(e.target.value)}
                  required
                  className={styles.formInput}
                  placeholder="Enter admin first name"
                  minLength="2"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="adminLastName">Admin Last Name: <span className={styles.requiredAsterisk}>*</span></label>
                <input
                  type="text"
                  id="adminLastName"
                  value={adminLastName}
                  onChange={(e) => setAdminLastName(e.target.value)}
                  required
                  className={styles.formInput}
                  placeholder="Enter admin last name"
                  minLength="2"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="adminEmail">Admin Email: <span className={styles.requiredAsterisk}>*</span></label>
                <input
                  type="email"
                  id="adminEmail"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  className={styles.formInput}
                  placeholder="Enter admin email address"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="adminRole">Admin Role: <span className={styles.requiredAsterisk}>*</span></label>
                <select
                  id="adminRole"
                  value={adminRole}
                  onChange={(e) => setAdminRole(e.target.value)}
                  required
                  className={styles.formSelect}
                >
                  <option value="">Select Role</option>
                  <option value="ADMIN">Tenant Admin</option>
                </select>
              </div>

              {/* NEW: Display success/error message */}
              {creationMessage && (
                <p className={`${styles.formMessage} ${isSuccess ? styles.successMessage : styles.errorMessage}`}>
                  {creationMessage}
                </p>
              )}

              <button type="submit" className={styles.submitButton}>
                Create Tenant
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TenantManagement;