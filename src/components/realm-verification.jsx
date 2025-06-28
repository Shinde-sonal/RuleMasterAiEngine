// src/components/RealmLoginPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/realm-verification.css';
import KeycloakService from '../services/keycloak-service'; // Ensure this import is present and correct

const RealmLoginPage = () => {
  const [realmName, setRealmName] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // realmVerification is commented out as requested.
  // This function is no longer called in handleRealmSubmit.
  /*
  const realmVerification = async (orgName) => {
    console.log(`MOCKING: Verifying realm '${orgName}' (always returning success)...`);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          data: {
            tenantVerficationResponse: {
              success: true,
              realmName: orgName,
              meta: {
                code: 200,
                message: `Realm '${orgName}' found successfully (MOCKED - ALWAYS TRUE).`
              }
            }
          }
        });
      }, 500); // 500ms delay
    }).then(mockResponse => {
      return mockResponse.data?.tenantVerficationResponse?.success === true;
    });
    // --- END MOCK RESPONSE ---

    /* --- ORIGINAL AXIOS CALL (Currently commented out) ---
    try {
      const actualApiUrl = 'YOUR_ACTUAL_BACKEND_SERVER_URL/YOUR_VERIFICATION_ENDPOINT';
      const response = await axios.post(actualApiUrl, {
        realm: orgName
      });
      return response.data?.tenantVerficationResponse?.success === true;
    } catch (error) {
      console.error("API Error during realm verification:", error);
      throw error;
    }
    */
  //};

  // Handles the form submission when the user clicks "Next"
  const handleRealmSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    if (!realmName.trim()) {
      setErrorMessage('Organization name cannot be empty.');
      setIsLoading(false);
      return;
    }

    try {
      // --- START: Keycloak Initialization Logic (UNCOMMENTED) ---
      // The realm verification step is explicitly skipped as per your request.
      // We directly store the entered realm and proceed to Keycloak initialization.

      console.log(`Realm '${realmName}' received. Storing to session.`);
      sessionStorage.setItem('selectedRealm', realmName);
      
      console.log("Initializing Keycloak with the selected realm...");
      const kcInstance = await KeycloakService.initKeycloak(realmName);

      if (kcInstance && kcInstance.authenticated) {
        console.log("Keycloak initialized and authenticated. Navigating to /dashboard...");
        navigate('/dashboard', { replace: true });
      } else if (kcInstance) {
        // This means Keycloak was initialized but not immediately authenticated.
        // It likely initiated the login flow on its own (e.g., login-required).
        // No explicit navigation needed here; Keycloak handles the redirect to its login page.
        // App.jsx will take over when Keycloak redirects back to the app.
        console.log("Keycloak initialized, but not authenticated (login flow likely initiated).");
      } else {
        // This case means initKeycloak returned null (e.g., an error occurred during its setup)
        setErrorMessage("Failed to initialize authentication service.");
      }
      // --- END: Keycloak Initialization Logic (UNCOMMENTED) ---

    } catch (error) {
      // Catch any errors from Keycloak initialization
      // Note: error.response might not exist if it's not an API error (e.g., network issue or Keycloak config error)
      const specificErrorMessage = error.message || 'An unexpected error occurred during authentication setup.';
      setErrorMessage(specificErrorMessage);
      console.error("Keycloak initialization failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="realm-login-page">
      <header className="rlp-header">
        <div className="rlp-header-logo">
          RuleMasterEngine
        </div>
      </header>

      <main className="rlp-main-container">
        <div className="rlp-login-card">
          <div className="rlp-console-logo">
            <div className="rlp-console-logo-text">
                <span className="rlp-console-name">RuleMasterEngine</span>
            </div>
          </div>

          <form className="rlp-form" onSubmit={handleRealmSubmit}>
            <label htmlFor="realmName">Enter your organization name</label>
            <input
              type="text"
              id="realmName"
              name="realmName"
              autoComplete="off"
              value={realmName}
              onChange={(e) => setRealmName(e.target.value)}
              disabled={isLoading}
            />
            {errorMessage && (
              <p className="rlp-error-message">{errorMessage}</p>
            )}
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Next'} {/* Changed text to reflect skipping verification */}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default RealmLoginPage;