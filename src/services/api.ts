const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api/v1';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('vyra-token');
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/admin-status')) {
    localStorage.removeItem('vyra-token');
    localStorage.removeItem('vyra-refresh-token');
  }

  const resData = await response.json();

  if (!response.ok) {
    throw new Error(resData.error?.message || resData.message || 'API request failed');
  }

  return resData;
}

export const api = {
  // 1. Authentication API
  auth: {
    getAdminStatus: async () => fetchAPI('/auth/admin-status'),
    setupFirstAdmin: async (adminData: any) => {
      const res = await fetchAPI('/auth/setup-admin', { method: 'POST', body: JSON.stringify(adminData) });
      if (res.data?.accessToken) {
        localStorage.setItem('vyra-token', res.data.accessToken);
        localStorage.setItem('vyra-refresh-token', res.data.refreshToken);
      }
      return res.data;
    },
    login: async (credentials: any) => {
      const res = await fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
      if (res.data?.accessToken) {
        localStorage.setItem('vyra-token', res.data.accessToken);
        localStorage.setItem('vyra-refresh-token', res.data.refreshToken);
      }
      return res.data;
    },
    register: async (userData: any) => {
      const res = await fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(userData) });
      if (res.data?.accessToken) {
        localStorage.setItem('vyra-token', res.data.accessToken);
        localStorage.setItem('vyra-refresh-token', res.data.refreshToken);
      }
      return res.data;
    },
    logout: async () => {
      const refreshToken = localStorage.getItem('vyra-refresh-token');
      try {
        await fetchAPI('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) });
      } catch (e) {
        console.error('Logout API call failed', e);
      }
      localStorage.removeItem('vyra-token');
      localStorage.removeItem('vyra-refresh-token');
    },
    refreshToken: async (token: string) => fetchAPI('/auth/refresh-token', { method: 'POST', body: JSON.stringify({ refreshToken: token }) }),
    forgotPassword: async (email: string) => fetchAPI('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: async (token: string, newPassword: string) => fetchAPI('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) }),
    verifyEmail: async (token: string) => fetchAPI('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) }),
    getMe: async () => fetchAPI('/auth/me'),
    changePassword: async (passwords: any) => fetchAPI('/auth/change-password', { method: 'PUT', body: JSON.stringify(passwords) }),
  },

  // 2. Users API
  users: {
    getAll: async (params: { page?: number; limit?: number } = {}) => fetchAPI(`/users?page=${params.page || 1}&limit=${params.limit || 20}`),
    getById: async (id: string) => fetchAPI(`/users/${id}`),
    getProfile: async (username: string) => fetchAPI(`/users/username/${username}`),
    updateProfile: async (username: string, updates: any) => fetchAPI('/users/profile', { method: 'PUT', body: JSON.stringify(updates) }),
    updateAvatar: async (avatarUrl: string) => fetchAPI('/users/avatar', { method: 'PUT', body: JSON.stringify({ avatarUrl }) }),
    deleteAccount: async () => fetchAPI('/users/account', { method: 'DELETE' }),
  },

  // 3. Posts API & Legacy Stories API
  posts: {
    getAll: async (params: { category?: string; search?: string; tag?: string; status?: string; page?: number } = {}) => {
      const query = new URLSearchParams();
      if (params.category) query.append('category', params.category);
      if (params.search) query.append('search', params.search);
      if (params.tag) query.append('tag', params.tag);
      if (params.status) query.append('status', params.status);
      if (params.page) query.append('page', params.page.toString());
      const res = await fetchAPI(`/posts?${query.toString()}`);
      return res.data;
    },
    getById: async (id: string) => fetchAPI(`/posts/${id}`),
    getBySlug: async (slug: string) => fetchAPI(`/posts/slug/${slug}`),
    create: async (postData: any) => fetchAPI('/posts', { method: 'POST', body: JSON.stringify(postData) }),
    update: async (id: string, updates: any) => fetchAPI(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    delete: async (id: string) => fetchAPI(`/posts/${id}`, { method: 'DELETE' }),
    publish: async (id: string) => fetchAPI(`/posts/${id}/publish`, { method: 'POST' }),
    archive: async (id: string) => fetchAPI(`/posts/${id}/archive`, { method: 'POST' }),
    duplicate: async (id: string) => fetchAPI(`/posts/${id}/duplicate`, { method: 'POST' }),
    feature: async (id: string) => fetchAPI(`/posts/${id}/feature`, { method: 'POST' }),
  },

  // Comments API
  comments: {
    getForPost: async (postId: string) => fetchAPI(`/posts/${postId}/comments`),
    create: async (postId: string, content: string, parentId?: string) => fetchAPI(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content, parentId }) }),
    delete: async (commentId: string) => fetchAPI(`/comments/${commentId}`, { method: 'DELETE' }),
    report: async (commentId: string, reason: string, details?: string) => fetchAPI(`/comments/${commentId}/report`, { method: 'POST', body: JSON.stringify({ reason, details }) }),
    toggleComments: async (postId: string) => fetchAPI(`/posts/${postId}/comments-toggle`, { method: 'PUT' }),
  },

  // Stories alias for backward compatibility
  stories: {
    getAll: async (params: { category?: string; search?: string } = {}) => {
      const query = new URLSearchParams();
      if (params.category) query.append('category', params.category);
      if (params.search) query.append('search', params.search);
      const res = await fetchAPI(`/posts?${query.toString()}`);
      return res.data;
    },
    getById: async (id: string) => fetchAPI(`/posts/${id}`),
    getBySlug: async (slug: string) => fetchAPI(`/posts/slug/${slug}`),
    create: async (postData: any) => fetchAPI('/posts', { method: 'POST', body: JSON.stringify(postData) }),
    update: async (id: string, updates: any) => fetchAPI(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    delete: async (id: string) => fetchAPI(`/posts/${id}`, { method: 'DELETE' }),
  },

  // 4. Drafts API
  drafts: {
    getAll: async () => fetchAPI('/drafts'),
    getById: async (id: string) => fetchAPI(`/drafts/${id}`),
    create: async (draftData: any) => fetchAPI('/drafts', { method: 'POST', body: JSON.stringify(draftData) }),
    update: async (id: string, draftData: any) => fetchAPI(`/drafts/${id}`, { method: 'PUT', body: JSON.stringify(draftData) }),
    delete: async (id: string) => fetchAPI(`/drafts/${id}`, { method: 'DELETE' }),
  },

  // 5. Categories API
  categories: {
    getAll: async () => {
      const res = await fetchAPI('/categories');
      return res.data;
    },
    create: async (categoryData: any) => fetchAPI('/categories', { method: 'POST', body: JSON.stringify(categoryData) }),
    update: async (id: string, categoryData: any) => fetchAPI(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(categoryData) }),
    delete: async (id: string) => fetchAPI(`/categories/${id}`, { method: 'DELETE' }),
  },

  // 6. Tags API
  tags: {
    getAll: async (search?: string) => {
      const endpoint = search ? `/tags?search=${encodeURIComponent(search)}` : '/tags';
      const res = await fetchAPI(endpoint);
      return res.data;
    },
    create: async (tagData: any) => fetchAPI('/tags', { method: 'POST', body: JSON.stringify(tagData) }),
    update: async (id: string, tagData: any) => fetchAPI(`/tags/${id}`, { method: 'PUT', body: JSON.stringify(tagData) }),
    delete: async (id: string) => fetchAPI(`/tags/${id}`, { method: 'DELETE' }),
  },

  // 7. Likes API
  likes: {
    like: async (postId: string) => fetchAPI(`/posts/${postId}/like`, { method: 'POST' }),
    unlike: async (postId: string) => fetchAPI(`/posts/${postId}/like`, { method: 'DELETE' }),
    getPostLikes: async (postId: string) => fetchAPI(`/posts/${postId}/likes`),
  },

  // 8. Bookmarks API
  bookmarks: {
    add: async (postId: string) => fetchAPI(`/bookmarks/${postId}`, { method: 'POST' }),
    remove: async (postId: string) => fetchAPI(`/bookmarks/${postId}`, { method: 'DELETE' }),
    getAll: async () => fetchAPI('/bookmarks'),
  },

  // 9. Following API
  following: {
    follow: async (userId: string) => fetchAPI(`/users/${userId}/follow`, { method: 'POST' }),
    unfollow: async (userId: string) => fetchAPI(`/users/${userId}/follow`, { method: 'DELETE' }),
    getFollowers: async (userId: string) => fetchAPI(`/users/${userId}/followers`),
    getFollowing: async (userId: string) => fetchAPI(`/users/${userId}/following`),
  },

  // 10. Notifications API
  notifications: {
    getAll: async () => fetchAPI('/notifications'),
    getUnread: async () => fetchAPI('/notifications/unread'),
    markRead: async (id: string) => fetchAPI(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: async () => fetchAPI('/notifications/read-all', { method: 'PUT' }),
    delete: async (id: string) => fetchAPI(`/notifications/${id}`, { method: 'DELETE' }),
  },

  // 11. Search API
  search: {
    unified: async (query: string) => fetchAPI(`/search?q=${encodeURIComponent(query)}`),
    posts: async (query: string, category?: string) => {
      const endpoint = category ? `/search/posts?q=${encodeURIComponent(query)}&category=${category}` : `/search/posts?q=${encodeURIComponent(query)}`;
      return fetchAPI(endpoint);
    },
    users: async (query: string) => fetchAPI(`/search/users?q=${encodeURIComponent(query)}`),
    categories: async (query: string) => fetchAPI(`/search/categories?q=${encodeURIComponent(query)}`),
    tags: async (query: string) => fetchAPI(`/search/tags?q=${encodeURIComponent(query)}`),
  },

  // 12. Media API
  media: {
    uploadImage: async (data: any) => fetchAPI('/media/image', { method: 'POST', body: JSON.stringify(data) }),
    uploadVideo: async (data: any) => fetchAPI('/media/video', { method: 'POST', body: JSON.stringify(data) }),
    uploadDocument: async (data: any) => fetchAPI('/media/document', { method: 'POST', body: JSON.stringify(data) }),
    getById: async (id: string) => fetchAPI(`/media/${id}`),
    delete: async (id: string) => fetchAPI(`/media/${id}`, { method: 'DELETE' }),
  },

  // 13. Anonymous Publishing API
  anonymous: {
    publish: async (data: any) => fetchAPI('/anonymous/publish', { method: 'POST', body: JSON.stringify(data) }),
    getPending: async () => fetchAPI('/anonymous/pending'),
    approve: async (id: string) => fetchAPI(`/anonymous/${id}/approve`, { method: 'PUT' }),
    reject: async (id: string) => fetchAPI(`/anonymous/${id}/reject`, { method: 'PUT' }),
  },

  // 14. Reports API
  reports: {
    create: async (data: any) => fetchAPI('/reports', { method: 'POST', body: JSON.stringify(data) }),
    getAll: async () => fetchAPI('/reports'),
    getById: async (id: string) => fetchAPI(`/reports/${id}`),
    update: async (id: string, data: any) => fetchAPI(`/reports/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: async (id: string) => fetchAPI(`/reports/${id}`, { method: 'DELETE' }),
  },

  // 15. Email Digest API
  emailDigest: {
    send: async (subject?: string) => fetchAPI('/email-digest/send', { method: 'POST', body: JSON.stringify({ subject }) }),
    getHistory: async () => fetchAPI('/email-digest/history'),
    updatePreferences: async (prefs: any) => fetchAPI('/email-digest/preferences', { method: 'PUT', body: JSON.stringify(prefs) }),
  },

  // 16. Analytics API
  analytics: {
    getDashboard: async () => fetchAPI('/analytics/dashboard'),
    getPosts: async () => fetchAPI('/analytics/posts'),
    getUsers: async () => fetchAPI('/analytics/users'),
    getCategories: async () => fetchAPI('/analytics/categories'),
  },

  // 17. Admin API
  admin: {
    getDashboard: async () => fetchAPI('/admin/dashboard'),
    getUsers: async () => fetchAPI('/admin/users'),
    updateUserRole: async (id: string, role: string) => fetchAPI(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
    suspendUser: async (id: string, reason?: string) => fetchAPI(`/admin/users/${id}/suspend`, { method: 'PUT', body: JSON.stringify({ reason }) }),
    activateUser: async (id: string) => fetchAPI(`/admin/users/${id}/activate`, { method: 'PUT' }),
    deleteUser: async (id: string) => fetchAPI(`/admin/users/${id}`, { method: 'DELETE' }),
    getPosts: async () => fetchAPI('/admin/posts'),
    deletePost: async (id: string) => fetchAPI(`/admin/posts/${id}`, { method: 'DELETE' }),
    getReports: async () => fetchAPI('/admin/reports'),
    getStats: async () => {
      const res = await fetchAPI('/admin/statistics');
      return res.data;
    },
  },

  // 18. Recommendations API
  recommendations: {
    getGeneral: async () => fetchAPI('/recommendations'),
    getFollowing: async () => fetchAPI('/recommendations/following'),
    getTrending: async () => fetchAPI('/recommendations/trending'),
  },

  // 19. Reading History API
  history: {
    add: async (postId: string) => fetchAPI('/history', { method: 'POST', body: JSON.stringify({ postId }) }),
    getAll: async () => fetchAPI('/history'),
    deleteItem: async (id: string) => fetchAPI(`/history/${id}`, { method: 'DELETE' }),
  },

  // 20. File Downloads API
  downloads: {
    getFileInfo: async (id: string) => fetchAPI(`/downloads/${id}`),
  },

  // 21. Homepage API
  home: {
    getData: async () => fetchAPI('/home'),
  },

  // 22. Feed API
  feed: {
    getMain: async () => fetchAPI('/feed'),
    getFollowing: async () => fetchAPI('/feed/following'),
    getTrending: async () => fetchAPI('/feed/trending'),
    getLatest: async () => fetchAPI('/feed/latest'),
  },

  // 23. Saved Searches API
  savedSearches: {
    getAll: async () => fetchAPI('/saved-searches'),
    create: async (query: string, filters?: any) => fetchAPI('/saved-searches', { method: 'POST', body: JSON.stringify({ query, filters }) }),
    delete: async (id: string) => fetchAPI(`/saved-searches/${id}`, { method: 'DELETE' }),
  },

  // 24. System API
  system: {
    getHealth: async () => fetchAPI('/health'),
    getDatabaseHealth: async () => fetchAPI('/health/database'),
    getVersion: async () => fetchAPI('/version'),
    getStatus: async () => fetchAPI('/status'),
  }
};
