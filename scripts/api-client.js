const API_BASE_URL = '/api';

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'content-type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = isJson && payload?.error ? payload.error : response.statusText;
    throw new Error(message || 'Request failed');
  }

  return payload;
}

async function registerUser({ username, email, password, dateOfBirth }) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username,
      email,
      password,
      date_of_birth: dateOfBirth,
    }),
  });
}

async function loginUser({ email, password }) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

async function fetchRecentMusics() {
  return apiRequest('/content/recent/musics');
}

async function searchMusics(query) {
  const encoded = encodeURIComponent(query);
  return apiRequest(`/content/search/musics?q=${encoded}`);
}

window.apiClient = {
  registerUser,
  loginUser,
  fetchRecentMusics,
  searchMusics,
};
