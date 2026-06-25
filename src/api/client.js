const API_BASE = import.meta.env.VITE_API_URL || '/api';

const TOKEN_KEY = 'srm_auth_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!response.ok) {
    throw new Error(data?.error || `Request failed (${response.status})`);
  }

  return data;
}

export const api = {
  signup(body) {
    return request('/auth/signup', { method: 'POST', body: JSON.stringify(body) });
  },

  login(body) {
    return request('/auth/login', { method: 'POST', body: JSON.stringify(body) });
  },

  me() {
    return request('/auth/me');
  },

  getLostFound() {
    return request('/lost-found');
  },

  createLostFound(body) {
    return request('/lost-found', { method: 'POST', body: JSON.stringify(body) });
  },

  updateLostFound(id, body) {
    return request(`/lost-found/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  },

  deleteLostFound(id) {
    return request(`/lost-found/${id}`, { method: 'DELETE' });
  },

  getListings() {
    return request('/listings');
  },

  createListing(body) {
    return request('/listings', { method: 'POST', body: JSON.stringify(body) });
  },

  updateListing(id, body) {
    return request(`/listings/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  },

  deleteListing(id) {
    return request(`/listings/${id}`, { method: 'DELETE' });
  },
};
