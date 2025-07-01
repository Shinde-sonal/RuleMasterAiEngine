// src/services/api-service.js

import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = Cookies.get("accessToken");
  const realm = Cookies.get("realm");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (realm) {
    config.headers['x-tenant-id'] = realm;
    config.headers['client_id'] = realm;
    config.headers['realm'] = realm;
  }

  if (config.method === 'get') {
    config.headers['ngrok-skip-browser-warning'] = 'true';
  }

  return config;
}, error => {
  return Promise.reject(error);
});

export const chatBot = async (realmFromArg, prompt) => {
  const response = await api.post(
    "/copilot-backend-adapter",
    { input: prompt }
  );
  return response.data;
};

export const getAllRules = async () => {
  const realm = Cookies.get("realm");

  if (!realm) {
    throw new Error("Tenant realm ID not found in cookies. Cannot fetch rules.");
  }

  const response = await api.get(`/v1/rules/${realm}`);
  return response.data;
};

export const getUserDataByRealm = async () => {
  const realm = Cookies.get("realm");

  if (!realm) {
    throw new Error("Tenant realm ID not found in cookies. Cannot fetch user data.");
  }

  const response = await api.get(`/v1/users/${realm}`);
  return response.data;
};

export const getAllRealms = async () => {
  const response = await api.get(`/v1/realms/realms`); // Adjusted path based on dashboard component
  return response.data;
};

export const deleteUser = async (userId) => {
  console.log("userId>>", userId)
  const realm = Cookies.get("realm");

  if (!realm) {
    throw new Error("Tenant realm ID not found in cookies. Cannot delete user.");
  }

  const response = await api.delete(`/v1/users/${realm}/${userId}`);
  return response.data;
};

export const deleteRealm = async (realmName) => {
  if (!realmName) {
    throw new Error("Realm name is required to delete a tenant.");
  }
  const response = await api.delete(`/realms/${realmName}`);
  return response.data;
};

export const createUser = async (userData) => {
  const realm = Cookies.get("realm");
  if (!realm) {
    throw new Error("Tenant realm ID not found in cookies. Cannot create user.");
  }
  try {
    const response = await api.post(`/v1/users/${realm}`, userData); // If realm needs to be in the URL
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const getGrades = async () => {
  try {
    const response = await api.get(`/v1/grades`);
    return response.data;
  } catch (error) {
    console.error("Error fetching grades:", error);
    throw error;
  }
};

export const createTenant = async (tenantData) => {
  try {
    const response = await api.post(`/v1/realms`, tenantData);
    return response.data;
  } catch (error) {
    console.error("Error creating tenant:", error);
    throw error;
  }
};

export default api;