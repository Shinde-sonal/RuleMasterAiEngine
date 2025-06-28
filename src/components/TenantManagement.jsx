// src/components/TenantManagement.jsx

import React, { useState } from 'react';
import styles from '../styles/TenantManagement.module.css'; // Use its own dedicated CSS module

function TenantManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [tenantName, setTenantName] = useState(''); // Renamed from username for tenant context
  const [adminFirstName, setAdminFirstName] = useState(''); // Admin's first name
  const [adminLastName, setAdminLastName] = useState(''); // Admin's last name
  const [adminEmail, setAdminEmail] = useState(''); // Admin's email
  const [adminRole, setAdminRole] = useState(''); // State for the admin role dropdown

  const handleCreateTenant = (e) => {
    e.preventDefault(); // Prevent default form submission

    // --- Start Validation Logic ---

    // 1. Basic required field check (All fields are mandatory)
    if (!tenantName || !adminFirstName || !adminLastName || !adminEmail || !adminRole) {
      alert('Please fill in all required fields.');
      return; // Stop the function execution if any field is empty
    }

    // 2. Email format validation for Tenant Admin's email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Standard regex for email format
    if (!emailRegex.test(adminEmail)) {
      alert('Please enter a valid email address for the Tenant Admin.');
      return;
    }

    // 3. First Name & Last Name string validation for Tenant Admin (only letters, spaces, and hyphens allowed)
    const nameRegex = /^[a-zA-Z\s-]+$/;
    if (!nameRegex.test(adminFirstName)) {
      alert('Tenant Admin First Name can only contain letters, spaces, and hyphens.');
      return;
    }
    if (!nameRegex.test(adminLastName)) {
      alert('Tenant Admin Last Name can only contain letters, spaces, and hyphens.');
      return;
    }

    // --- End Validation Logic ---


    // If all validations pass, proceed with creating the tenant object
    // --- THIS IS THE UPDATED DATA STRUCTURE ---
    const newTenantData = {
      realm: {
        name: tenantName // Tenant Name goes into realm.name
      },
      tenantAdmin: { // Renamed from 'admin' to 'tenantAdmin'
        firstName: adminFirstName,
        lastName: adminLastName,
        email: adminEmail,
        username: adminEmail // Added username, which is the same as adminEmail
      }
      // 'adminRole' is intentionally omitted from the final payload as per your desired structure
    };
    // --- END OF UPDATED DATA STRUCTURE ---

    console.log("New Tenant Data:", newTenantData);
    // In a real application, you would send this data to your backend API, e.g.:
    // fetch('/api/tenants', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     // Add authorization token if needed
    //   },
    //   body: JSON.stringify(newTenantData)
    // })
    // .then(response => response.json())
    // .then(data => {
    //   console.log('Tenant created successfully:', data);
    //   alert('Tenant created successfully!');
    //   setIsModalOpen(false); // Close the modal on success
    // })
    // .catch(error => {
    //   console.error('Error creating tenant:', error);
    //   alert('Failed to create tenant.');
    // });


    // Clear the form fields after successful submission and close the modal
    setTenantName('');
    setAdminFirstName('');
    setAdminLastName('');
    setAdminEmail('');
    setAdminRole(''); // Reset role to empty
    setIsModalOpen(false); // Close the modal
    alert('Tenant creation initiated. Check console for data (and integrate with your backend)!'); // Simple feedback
  };

  return (
    <div className={styles.tenantCreationContainer}>
      <div className={styles.headerSection}>
        <h2>Tenant Management</h2>
        <button className={styles.createTenantButton} onClick={() => setIsModalOpen(true)}>
          Create New Tenant
        </button>
      </div>

      {/* Placeholder for tenant list or other management content */}
      <div className={styles.tenantListSection}>
        <h3>Current Tenants</h3>
        <p>Tenant list will be displayed here. Click 'Create New Tenant' to add a new one.</p>
        {/* For example, tenant data in a table or cards */}
      </div>


      {/* Modal for Tenant Creation Form */}
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

              {/* Tenant Admin Details */}
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