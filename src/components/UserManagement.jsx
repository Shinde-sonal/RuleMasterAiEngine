// src/components/UserManagement.jsx

import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/UserManagement.module.css';
// Ensure createUser is imported from api-service.js
import { getUserDataByRealm, deleteUser, createUser } from '../services/api-service';

function UserManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [creationMessage, setCreationMessage] = useState(''); // State for success/error message in modal
  const [isSuccess, setIsSuccess] = useState(false); // State to track if creation was successful

  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [errorLoadingUsers, setErrorLoadingUsers] = useState(null);

  // State to manage which dropdown is open (stores the ID of the user whose dropdown is open)
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  // Ref for detecting clicks outside dropdowns to close them
  const dropdownRef = useRef(null);

  // Function to fetch users from the API
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setErrorLoadingUsers(null); // Clear any previous errors
    try {
      const data = await getUserDataByRealm();
      console.log("Fetched Users:", data); // Log the fetched data for debugging
      setUsers(data); // Set the fetched users to state
    } catch (error) {
      console.error("Error fetching users:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load users.";
      setErrorLoadingUsers(errorMessage); // Set error message
    } finally {
      setIsLoadingUsers(false); // End loading
    }
  };

  // useEffect hook to fetch users on component mount and set up click-outside listener
  useEffect(() => {
    fetchUsers(); // Initial fetch when component mounts

    // --- Click outside handler for dropdowns ---
    const handleClickOutside = (event) => {
      // If the dropdown ref exists and the click is outside the dropdown, close it
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownId(null); // Close any open dropdown by setting id to null
      }
    };

    // Add event listener for clicks outside the dropdown
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Empty dependency array means this runs once on mount

  // Handler for creating a new user (form submission)
  const handleCreateUser = async (e) => { // Made async to await API call
    e.preventDefault(); // Prevent default form submission behavior

    setCreationMessage(''); // Clear previous messages before new submission
    setIsSuccess(false);

    // --- Validation Logic ---
    if (!firstName || !lastName || !email || !role) {
      setCreationMessage('Please fill in all required fields.');
      setIsSuccess(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setCreationMessage('Please enter a valid email address.');
      setIsSuccess(false);
      return;
    }

    const nameRegex = /^[a-zA-Z\s-]+$/;
    if (!nameRegex.test(firstName)) {
      setCreationMessage('First Name can only contain letters, spaces, and hyphens.');
      setIsSuccess(false);
      return;
    }
    if (!nameRegex.test(lastName)) {
      setCreationMessage('Last Name can only contain letters, spaces, and hyphens.');
      setIsSuccess(false);
      return;
    }
    // --- End Validation Logic ---

    // Construct the new user object
    const newUser = {
      firstName,
      lastName,
      email,
      role,
    };

    console.log("New User Data (to be sent to API):", newUser);

    try {
      // --- CALL THE POST API HERE ---
      const response = await createUser(newUser); // Call the createUser API function
      console.log('User created successfully:', response);
      setCreationMessage('User created successfully!');
      setIsSuccess(true);

      // Clear form fields immediately after successful submission
      setFirstName('');
      setLastName('');
      setEmail('');
      setRole('');

      // After a short delay, close the modal and refresh users
      setTimeout(() => {
        setIsModalOpen(false);
        setCreationMessage(''); // Clear message for next modal open
        fetchUsers(); // Refresh the list to show the newly created user
      }, 1500); // Wait 1.5 seconds for user to see success message

    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to create user.";
      setCreationMessage(`Error: ${errorMessage}`);
      setIsSuccess(false);
    }
  };

  // --- Function to handle user deletion ---
  const handleDeleteUser = async (userId, userEmail) => {
    // Show a confirmation dialog before proceeding with deletion
    if (window.confirm(`Are you sure you want to delete user: ${userEmail}? This action cannot be undone.`)) {
      try {
        console.log(`Attempting to delete user with ID: ${userId} and email: ${userEmail}`);
        // Call the deleteUser API function from api-service.js
        await deleteUser(userId);
        alert('User deleted successfully!'); // You could replace this with a more integrated notification
        fetchUsers(); // Refresh the user list after successful deletion
      } catch (error) {
        console.error('Error deleting user:', error);
        // Provide more specific error feedback if available from the backend
        alert(`Failed to delete user: ${error.response?.data?.message || error.message}`);
      } finally {
        setActiveDropdownId(null); // Always close the dropdown after an action
      }
    }
  };
  // --- End New Function ---

  return (
    <div className={styles.userManagementContainer}>
      <div className={styles.headerSection}>
        <h2>User Management</h2>
        <button className={styles.createUserButton} onClick={() => {
          setIsModalOpen(true);
          setCreationMessage(''); // Clear any old messages when opening for new creation
          setIsSuccess(false); // Reset success state
        }}>
          Create New User
        </button>
      </div>

      <div className={styles.userListSection}>
        <h3>Current Users</h3>
        {isLoadingUsers && <p className={styles.noUsersMessage}>Loading users...</p>}
        {errorLoadingUsers && <p className={styles.errorText}>Error: {errorLoadingUsers}</p>}
        {!isLoadingUsers && users.length === 0 && !errorLoadingUsers && (
          <p className={styles.noUsersMessage}>No users found for this realm. Click 'Create New User' to add one.</p>
        )}

        {/* --- USER TABLE --- */}
        {!isLoadingUsers && users.length > 0 && (
          <div className={styles.usersTableContainer}>
            <table className={styles.usersTable}>
              <thead>
                <tr>
                  <th className={styles.usersTableHeader}>First Name</th>
                  <th className={styles.usersTableHeader}>Last Name</th>
                  <th className={styles.usersTableHeader}>Email</th>
                  <th className={styles.usersTableHeader}>Enabled</th>
                  <th className={styles.usersTableHeader}>Created</th>
                  <th className={styles.usersTableHeader}>Actions</th> {/* New Action Header */}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={styles.usersTableRow}>
                    <td className={styles.usersTableCell}>{user.firstName}</td>
                    <td className={styles.usersTableCell}>{user.lastName}</td>
                    <td className={styles.usersTableCell}>{user.email}</td>
                    <td className={styles.usersTableCell}>{user.enabled ? 'Yes' : 'No'}</td>
                    <td className={styles.usersTableCell}>
                      {user.createdTimestamp ? new Date(user.createdTimestamp).toLocaleDateString() : 'N/A'}
                    </td>
                    {/* Action Column */}
                    <td className={styles.usersTableCell}>
                      <div
                        className={styles.actionDropdownContainer}
                        // Only attach the ref to the currently active dropdown's container
                        ref={activeDropdownId === user.id ? dropdownRef : null}
                      >
                        <button
                          className={styles.actionKebabButton}
                          onClick={() => setActiveDropdownId(activeDropdownId === user.id ? null : user.id)}
                          aria-label="Actions"
                        >
                          &#x22EE; {/* Unicode character for vertical ellipsis (three dots) */}
                        </button>
                        {/* Conditionally render the dropdown menu */}
                        {activeDropdownId === user.id && (
                          <div className={styles.actionDropdownMenu}>
                            <button
                              className={styles.dropdownItem}
                              onClick={() => handleDeleteUser(user.id, user.email)}
                            >
                              Delete User
                            </button>
                            {/* You can add more action items here (e.g., Edit, View Details) */}
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

      {/* Modal for User Creation Form */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Create New User</h3>
              <button className={styles.closeModalButton} onClick={() => setIsModalOpen(false)} aria-label="Close modal">
                &times; {/* Close icon (multiplication sign used as a common "x") */}
              </button>
            </div>
            <form onSubmit={handleCreateUser} className={styles.userForm}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName">First Name: <span className={styles.requiredAsterisk}>*</span></label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className={styles.formInput}
                  placeholder="Enter first name"
                  minLength="2"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName">Last Name: <span className={styles.requiredAsterisk}>*</span></label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className={styles.formInput}
                  placeholder="Enter last name"
                  minLength="2"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email: <span className={styles.requiredAsterisk}>*</span></label>
                <input
                  type="email" // HTML5 type="email" provides browser-level email validation hints
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={styles.formInput}
                  placeholder="Enter email address"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="role">Role: <span className={styles.requiredAsterisk}>*</span></label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className={styles.formSelect}
                >
                  <option value="">Select Role</option> {/* Placeholder/no pre-selected value */}
                  <option value="USER">User</option>
                  {/* You can add more roles later, they would go here */}
                  {/* <option value="ADMIN">Admin</option> */}
                </select>
              </div>

              {/* Display success/error message */}
              {creationMessage && (
                <p className={`${styles.formMessage} ${isSuccess ? styles.successMessage : styles.errorMessage}`}>
                  {creationMessage}
                </p>
              )}

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