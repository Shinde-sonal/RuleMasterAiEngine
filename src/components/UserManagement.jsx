// src/components/UserManagement.jsx

import React, { useState } from 'react';
import styles from '../styles/UserManagement.module.css'; // Import its own dedicated CSS module

function UserManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(''); // Changed from 'group' to 'role', no pre-selected value

  const handleCreateUser = (e) => {
    e.preventDefault(); // Prevent default form submission

    // --- Start Validation Logic ---

    // 1. Basic required field check (All fields are mandatory)
    if (!username || !firstName || !lastName || !email || !role) {
      alert('Please fill in all required fields.');
      return; // Stop the function execution if any field is empty
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Standard regex for email format
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // 3. First Name & Last Name string validation (only letters, spaces, and hyphens allowed)
    const nameRegex = /^[a-zA-Z\s-]+$/;
    if (!nameRegex.test(firstName)) {
      alert('First Name can only contain letters, spaces, and hyphens.');
      return;
    }
    if (!nameRegex.test(lastName)) {
      alert('Last Name can only contain letters, spaces, and hyphens.');
      return;
    }

    // --- End Validation Logic ---


    // If all validations pass, proceed with creating the user object
    const newUser = {
      username,
      firstName,
      lastName,
      email,
      role,
    };

    console.log("New User Data:", newUser);
    // In a real application, you would send this data to your backend API, e.g.:
    // fetch('/api/users', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     // Add authorization token if needed, e.g., 'Authorization': `Bearer ${KeycloakService.getToken()}`
    //   },
    //   body: JSON.stringify(newUser)
    // })
    // .then(response => response.json())
    // .then(data => {
    //   console.log('User created successfully:', data);
    //   alert('User created successfully!');
    //   setIsModalOpen(false); // Close the modal on success
    //   // Optionally, refresh a user list or redirect
    // })
    // .catch(error => {
    //   console.error('Error creating user:', error);
    //   alert('Failed to create user.');
    // });


    // Clear the form fields after successful submission and close the modal
    setUsername('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setRole(''); // Reset role to empty
    setIsModalOpen(false); // Close the modal
    alert('User creation initiated. Check console for data (and integrate with your backend)!'); // Simple feedback
  };

  return (
    <div className={styles.userManagementContainer}>
      <div className={styles.headerSection}>
        <h2>User Management</h2>
        <button className={styles.createUserButton} onClick={() => setIsModalOpen(true)}>
          Create New User
        </button>
      </div>

      {/* Placeholder for user list or other management content */}
      <div className={styles.userListSection}>
        <h3>Current Users</h3>
        <p>User list will be displayed here. Click 'Create New User' to add a new one.</p>
        {/* For example, user data in a table or cards */}
      </div>


      {/* Modal for User Creation Form */}
      {isModalOpen && (
        // REMOVED onClick={() => setIsModalOpen(false)} from here
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}> {/* Prevent closing modal when clicking inside */}
            <div className={styles.modalHeader}>
              <h3>Create New User</h3>
              <button className={styles.closeModalButton} onClick={() => setIsModalOpen(false)}>
                &times; {/* Close icon (multiplication sign used as a common "x") */}
              </button>
            </div>
            <form onSubmit={handleCreateUser} className={styles.userForm}>
              <div className={styles.formGroup}>
                <label htmlFor="username">Username: <span className={styles.requiredAsterisk}>*</span></label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required // HTML5 built-in validation for mandatory
                  className={styles.formInput}
                  placeholder="Enter username"
                  minLength="3" // Example: minimum 3 characters for username
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="firstName">First Name: <span className={styles.requiredAsterisk}>*</span></label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required // Mandatory
                  className={styles.formInput}
                  placeholder="Enter first name"
                  minLength="2" // Example: minimum 2 characters
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName">Last Name: <span className={styles.requiredAsterisk}>*</span></label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required // Mandatory
                  className={styles.formInput}
                  placeholder="Enter last name"
                  minLength="2" // Example: minimum 2 characters
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email: <span className={styles.requiredAsterisk}>*</span></label>
                <input
                  type="email" // HTML5 type="email" provides browser-level email validation hints
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required // Mandatory
                  className={styles.formInput}
                  placeholder="Enter email address"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="role">Role: <span className={styles.requiredAsterisk}>*</span></label> {/* Label is "Role" */}
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required // Mandatory
                  className={styles.formSelect}
                >
                  <option value="">Select Role</option> {/* Placeholder/no pre-selected value */}
                  <option value="USER">User</option>
                  {/* You can add more roles later, they would go here */}
                  {/* <option value="ADMIN">Admin</option> */}
                </select>
              </div>

              <button type="submit" className={styles.submitButton}>
                Create User
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;