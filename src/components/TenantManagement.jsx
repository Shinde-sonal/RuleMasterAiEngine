import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/TenantManagement.module.css';
import { getAllRealms, deleteRealm } from '../services/api-service';

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

  const fetchRealms = async () => {
    setIsLoadingRealms(true);
    setErrorLoadingRealms(null);
    try {
      const data = await getAllRealms();
      console.log("Fetched Realms:", data.realms);
      // Corrected to access data.realms as per your API response structure
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

  const handleCreateTenant = (e) => {
    e.preventDefault();

    if (!tenantName || !adminFirstName || !adminLastName || !adminEmail || !adminRole) {
      alert('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      alert('Please enter a valid email address for the Tenant Admin.');
      return;
    }

    const nameRegex = /^[a-zA-Z\s-]+$/;
    if (!nameRegex.test(adminFirstName)) {
      alert('Tenant Admin First Name can only contain letters, spaces, and hyphens.');
      return;
    }
    if (!nameRegex.test(adminLastName)) {
      alert('Tenant Admin Last Name can only contain letters, spaces, and hyphens.');
      return;
    }

    const newTenantData = {
      realm: {
        name: tenantName
      },
      tenantAdmin: {
        firstName: adminFirstName,
        lastName: adminLastName,
        email: adminEmail,
        username: adminEmail
      }
    };

    console.log("New Tenant Data:", newTenantData);

    setTenantName('');
    setAdminFirstName('');
    setAdminLastName('');
    setAdminEmail('');
    setAdminRole('');
    setIsModalOpen(false);
    alert('Tenant creation initiated. Check console for data (and integrate with your backend)!');
    fetchRealms();
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
        <button className={styles.createTenantButton} onClick={() => setIsModalOpen(true)}>
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
                {/* CORRECTED: Removed whitespace between <th> tags to fix hydration warning */}
                <tr><th className={styles.realmsTableHeader}>ID</th><th className={styles.realmsTableHeader}>Realm Name</th><th className={styles.realmsTableHeader}>Enabled</th><th className={styles.realmsTableHeader}>Actions</th></tr>
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
              <button className={styles.closeModalButton} onClick={() => setIsModalOpen(false)}>
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