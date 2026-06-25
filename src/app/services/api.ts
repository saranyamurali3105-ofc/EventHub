// API Configuration and Services for EventsHub
const API_BASE_URL = (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 'http://localhost:3000/api';

// Store auth token
let authToken: string | null = localStorage.getItem('authToken');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => authToken;

// Generic API call function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return { success: true, ...data };
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    
    // Handle specific error types
    let errorMessage = 'Unknown error occurred';
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Cannot connect to server - using offline mode';
    } else if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout - server not responding';
      } else {
        errorMessage = error.message;
      }
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Authentication API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success) {
      if (response.token) {
        setAuthToken(response.token);
      }
      // Handle different response structures
      response.user = response.user || response.data?.user || { email, username: email.split('@')[0], isAdmin: email.includes('admin') };
    }
    
    return response;
  },

  register: async (username: string, email: string, password: string) => {
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    
    if (response.success) {
      if (response.token) {
        setAuthToken(response.token);
      }
      // Handle different response structures
      response.user = response.user || response.data?.user || { email, username, isAdmin: false };
    }
    
    return response;
  },

  logout: async () => {
    const response = await apiCall('/auth/logout', { method: 'POST' });
    setAuthToken(null);
    return response;
  },

  getCurrentUser: async () => {
    const response = await apiCall('/auth/me');
    if (response.success) {
      response.user = response.user || response.data?.user;
    }
    return response;
  },
};

// Events API
export const eventsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiCall(`/events${queryString ? `?${queryString}` : ''}`);
    if (response.success) {
      response.events = response.events || response.data || [];
    }
    return response;
  },

  getById: async (id: string) => {
    const response = await apiCall(`/events/${id}`);
    if (response.success) {
      response.event = response.event || response.data;
    }
    return response;
  },

  create: async (eventData: any) => {
    const response = await apiCall('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
    if (response.success) {
      response.event = response.event || response.data;
    }
    return response;
  },

  update: async (id: string, eventData: any) => {
    const response = await apiCall(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
    if (response.success) {
      response.event = response.event || response.data;
    }
    return response;
  },

  delete: async (id: string) => {
    return apiCall(`/events/${id}`, { method: 'DELETE' });
  },
};

// Users API
export const usersAPI = {
  getProfile: async () => {
    return apiCall('/users/profile');
  },

  updateProfile: async (profileData: any) => {
    return apiCall('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/users${queryString ? `?${queryString}` : ''}`);
  },
};

// Registrations API
export const registrationsAPI = {
  register: async (eventId: string, registrationData: any) => {
    return apiCall(`/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  },

  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/registrations${queryString ? `?${queryString}` : ''}`);
  },

  updateStatus: async (id: string, status: string) => {
    return apiCall(`/registrations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// Requests API
export const requestsAPI = {
  create: async (requestData: any) => {
    return apiCall('/requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/requests${queryString ? `?${queryString}` : ''}`);
  },

  updateStatus: async (id: string, status: string, documentUrl?: string) => {
    return apiCall(`/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, documentUrl }),
    });
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiCall(`/notifications${queryString ? `?${queryString}` : ''}`);
    if (response.success) {
      response.notifications = response.notifications || response.data || [];
    }
    return response;
  },

  getUnreadCount: async () => {
    const response = await apiCall('/notifications/unread-count');
    if (response.success) {
      response.count = response.count || response.data?.count || 0;
    }
    return response;
  },

  markAsRead: async (id: string) => {
    return apiCall(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  markAllAsRead: async () => {
    return apiCall('/notifications/mark-all-read', { method: 'PATCH' });
  },
};

// Achievers API
export const achieversAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/achievers${queryString ? `?${queryString}` : ''}`);
  },

  create: async (achieverData: any) => {
    return apiCall('/achievers', {
      method: 'POST',
      body: JSON.stringify(achieverData),
    });
  },

  update: async (id: string, achieverData: any) => {
    return apiCall(`/achievers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(achieverData),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/achievers/${id}`, { method: 'DELETE' });
  },
};

// Videos API
export const videosAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/videos${queryString ? `?${queryString}` : ''}`);
  },

  create: async (videoData: any) => {
    return apiCall('/videos', {
      method: 'POST',
      body: JSON.stringify(videoData),
    });
  },

  update: async (id: string, videoData: any) => {
    return apiCall(`/videos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(videoData),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/videos/${id}`, { method: 'DELETE' });
  },
};

// FAQ API
export const faqAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/faq${queryString ? `?${queryString}` : ''}`);
  },

  create: async (faqData: any) => {
    return apiCall('/faq', {
      method: 'POST',
      body: JSON.stringify(faqData),
    });
  },

  update: async (id: string, faqData: any) => {
    return apiCall(`/faq/${id}`, {
      method: 'PUT',
      body: JSON.stringify(faqData),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/faq/${id}`, { method: 'DELETE' });
  },
};

// Upload API
export const uploadAPI = {
  single: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiCall('/upload/single', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  },

  multiple: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    
    return apiCall('/upload/multiple', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  },
};

// Projects API
export const projectsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/projects${queryString ? `?${queryString}` : ''}`);
  },

  create: async (projectData: any) => {
    return apiCall('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  update: async (id: string, projectData: any) => {
    return apiCall(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/projects/${id}`, { method: 'DELETE' });
  },
};

// Placements API
export const placementsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/placements${queryString ? `?${queryString}` : ''}`);
  },

  create: async (placementData: any) => {
    return apiCall('/placements', {
      method: 'POST',
      body: JSON.stringify(placementData),
    });
  },

  update: async (id: string, placementData: any) => {
    return apiCall(`/placements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(placementData),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/placements/${id}`, { method: 'DELETE' });
  },
};

// Resources API
export const resourcesAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/resources${queryString ? `?${queryString}` : ''}`);
  },

  create: async (resourceData: any) => {
    return apiCall('/resources', {
      method: 'POST',
      body: JSON.stringify(resourceData),
    });
  },

  update: async (id: string, resourceData: any) => {
    return apiCall(`/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(resourceData),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/resources/${id}`, { method: 'DELETE' });
  },
};

// Clubs API
export const clubsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/clubs${queryString ? `?${queryString}` : ''}`);
  },

  create: async (clubData: any) => {
    return apiCall('/clubs', {
      method: 'POST',
      body: JSON.stringify(clubData),
    });
  },

  update: async (id: string, clubData: any) => {
    return apiCall(`/clubs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clubData),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/clubs/${id}`, { method: 'DELETE' });
  },
};

// Announcements API
export const announcementsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/announcements${queryString ? `?${queryString}` : ''}`);
  },

  create: async (announcementData: any) => {
    return apiCall('/announcements', {
      method: 'POST',
      body: JSON.stringify(announcementData),
    });
  },

  update: async (id: string, announcementData: any) => {
    return apiCall(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(announcementData),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/announcements/${id}`, { method: 'DELETE' });
  },
};

// Export all APIs as default
export default {
  auth: authAPI,
  events: eventsAPI,
  users: usersAPI,
  registrations: registrationsAPI,
  requests: requestsAPI,
  notifications: notificationsAPI,
  achievers: achieversAPI,
  videos: videosAPI,
  faq: faqAPI,
  upload: uploadAPI,
  projects: projectsAPI,
  placements: placementsAPI,
  resources: resourcesAPI,
  clubs: clubsAPI,
  announcements: announcementsAPI,
};