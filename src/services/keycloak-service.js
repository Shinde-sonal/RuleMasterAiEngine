// src/keycloak/keycloakService.js

import Keycloak from 'keycloak-js';
import Cookies from 'js-cookie';

let keycloak = null;
let initialized = false;

const initKeycloak = async (realm) => {
  if (initialized || keycloak?.token) {
    console.log("[KeycloakService] Already initialized or token exists");
    return keycloak;
  }

  const isIframe = window.self !== window.top;
  const onLoadMode = isIframe ? 'check-sso' : 'login-required';
  const currentUrl = window.location.origin + window.location.pathname + window.location.search;
  const realmName = realm
  keycloak = new Keycloak({
    url: 'https://63c7-103-58-154-251.ngrok-free.app',
    realm: realmName,
    clientId: 'react-app',
  });

  try {
    const authenticated = await keycloak.init({
      onLoad: onLoadMode,
      pkceMethod: 'S256',
      checkLoginIframe: false,
      responseMode: 'query',
      redirectUri: currentUrl,
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
    });

    if (authenticated) {
      console.log("✅ Authenticated");
      initialized = true;

      const url = new URL(window.location.href);
      ['code', 'state', 'session_state', 'iss'].forEach(p => url.searchParams.delete(p));
      window.history.replaceState({}, '', url.pathname + url.search);

      Cookies.set("accessToken", keycloak.token, { expires: 1, secure: true });
      Cookies.set("refreshToken", keycloak.refreshToken, { expires: 1, secure: true });
      Cookies.set("realm", realm, { expires: 1, secure: true });
      Cookies.set("username", keycloak.tokenParsed.name, { expires: 1, secure: true });
      const groups = keycloak.tokenParsed.groups || [];

      const role = groups
        .map(g => {
          const noSlash = g.startsWith("/") ? g.substring(1) : g;
          return noSlash.split("_")[0];
        })
        .find(Boolean);

      Cookies.set("role", role || "", { expires: 1, secure: true });

      let emailToStore = keycloak.tokenParsed.email;
      if (emailToStore && emailToStore.includes('%')) {
        console.log("Encoded email from Keycloak before storing:", emailToStore);
        try {
          emailToStore = decodeURIComponent(emailToStore);
          console.log("Decoded email from Keycloak before storing:", emailToStore);
        } catch (e) {
          console.error("Error decoding email from Keycloak, storing as-is:", e);
        }
      }

      Cookies.set("email", emailToStore, { expires: 1, secure: true });

      // Auto token refresh
      setInterval(() => {
        keycloak.updateToken(70).catch(() => {
          console.warn("Token refresh failed, logging out...");
          keycloak.logout();
        });
      }, 60000);

      return keycloak;
    } else {
      console.warn("⛔ Not Authenticated – Triggering login");
      keycloak.login();
      return null;
    }

  } catch (err) {
    console.error("❌ Keycloak initialization failed:", err);
    return null;
  }
};

const getKeycloak = () => keycloak;

const logout = () => {
  console.log("[KeycloakService] Initiating Keycloak logout and clearing cookies...");

  // Define an array of all cookies set by your application (ensure 'email' is included!)
  const appCookies = ["accessToken", "refreshToken", "realm", "username", "profileComplete", "email"];

  // Iterate over the array and remove each cookie
  appCookies.forEach(cookieName => {
    Cookies.remove(cookieName);
    console.log(`[KeycloakService] Cookie '${cookieName}' removed.`); // Added for more detailed logging
  });

  if (keycloak) {
    console.log("[KeycloakService] Keycloak instance found. Calling Keycloak logout.");
    // Attempt to call Keycloak logout and add .then/.catch for outcome
    keycloak.logout({ redirectUri: window.location.origin + '/' })
      .then(() => {
        console.log("[KeycloakService] Keycloak logout initiated successfully (redirect should follow).");
      })
      .catch((error) => {
        console.error("[KeycloakService] Keycloak logout failed with an error:", error);
        // If Keycloak logout fails (e.g., server unreachable), ensure local state is cleared
        // and force a redirect to the base URL to re-trigger the login flow.
        window.location.replace(window.location.origin + '/');
      });
  } else {
    console.warn("[KeycloakService] Keycloak instance is not available. Cannot perform Keycloak logout. Cookies cleared locally.");
    // If Keycloak instance is gone, we can at least ensure they are redirected to a clean state
    window.location.replace(window.location.origin + '/');
  }
};

export default {
  initKeycloak,
  getKeycloak,
  logout,
};