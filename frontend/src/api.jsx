const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  };
};

const handleApiResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!response.ok) {
    if (isJson) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || 'An error occurred');
    }
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (isJson) {
    const data = await response.json();
    // Handle standardized response format
    if (data.success !== undefined) {
      if (data.success) {
        return data.data !== undefined ? data.data : data;
      } else {
        throw new Error(data.message || 'Request failed');
      }
    }
    return data;
  }

  return response.text();
};

export const api = {
  // Auth
  login: async (email, password) => {
    const response = await fetch(API_BASE_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleApiResponse(response);
  },

  register: async (username, email, password) => {
    const response = await fetch(API_BASE_URL + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    return handleApiResponse(response);
  },

  getUser: async () => {
    const response = await fetch(API_BASE_URL + '/auth/me', {
      headers: getAuthHeader()
    });
    return handleApiResponse(response);
  },

  // Groups
  getMyGroups: async () => {
    const response = await fetch(API_BASE_URL + '/groups/my', {
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return Array.isArray(data) ? data : (data.data || []);
  },

  getGroup: async (groupId) => {
    const response = await fetch(API_BASE_URL + '/groups/' + groupId, {
      headers: getAuthHeader()
    });
    return handleApiResponse(response);
  },

  createGroup: async (data) => {
    const response = await fetch(API_BASE_URL + '/groups', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    return handleApiResponse(response);
  },

  addMember: async (groupId, userId) => {
    const response = await fetch(API_BASE_URL + '/groups/' + groupId + '/members', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ userId })
    });
    return handleApiResponse(response);
  },

  removeMember: async (groupId, userId) => {
    const response = await fetch(API_BASE_URL + '/groups/' + groupId + '/members/' + userId, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleApiResponse(response);
  },

  // Expenses
  getGroupExpenses: async (groupId) => {
    const response = await fetch(API_BASE_URL + '/expenses/group/' + groupId, {
      headers: getAuthHeader()
    });
    return handleApiResponse(response);
  },

  createExpense: async (data) => {
    const response = await fetch(API_BASE_URL + '/expenses', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    return handleApiResponse(response);
  },

  // Settlements
  getGroupBalances: async (groupId) => {
    const response = await fetch(API_BASE_URL + '/settlements/balances/' + groupId, {
      headers: getAuthHeader()
    });
    return handleApiResponse(response);
  },

  getSettlementSuggestions: async (groupId) => {
    const response = await fetch(API_BASE_URL + '/settlements/suggestions/' + groupId, {
      headers: getAuthHeader()
    });
    return handleApiResponse(response);
  },

  recordSettlement: async (data) => {
    const response = await fetch(API_BASE_URL + '/settlements', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    return handleApiResponse(response);
  },

  getGroupSettlements: async (groupId) => {
    const response = await fetch(API_BASE_URL + '/settlements/group/' + groupId, {
      headers: getAuthHeader()
    });
    return handleApiResponse(response);
  },

  // Friends
  sendFriendRequest: async (email) => {
    const response = await fetch(API_BASE_URL + '/friends/request', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ email })
    });
    return handleApiResponse(response);
  },

  acceptFriendRequest: async (requestId) => {
    const response = await fetch(API_BASE_URL + '/friends/accept/' + requestId, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleApiResponse(response);
  },

  declineFriendRequest: async (requestId) => {
    const response = await fetch(API_BASE_URL + '/friends/decline/' + requestId, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleApiResponse(response);
  },

  getFriends: async () => {
    const response = await fetch(API_BASE_URL + '/friends', {
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return Array.isArray(data) ? data : (data.data || []);
  },

  getPendingRequests: async () => {
    const response = await fetch(API_BASE_URL + '/friends/pending', {
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return Array.isArray(data) ? data : (data.data || []);
  },

  // Invitations
  createInvitation: async (groupId, invitedEmail) => {
    const response = await fetch(API_BASE_URL + '/invitations', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ groupId, invitedEmail })
    });
    return handleApiResponse(response);
  },

  acceptInvitation: async (code) => {
    const response = await fetch(API_BASE_URL + '/invitations/accept/' + code, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleApiResponse(response);
  },

  getGroupInvitations: async (groupId) => {
    const response = await fetch(API_BASE_URL + '/invitations/group/' + groupId, {
      headers: getAuthHeader()
    });
    return handleApiResponse(response);
  },

  getMyInvitations: async () => {
    const response = await fetch(API_BASE_URL + '/invitations/my', {
      headers: getAuthHeader()
    });
    return handleApiResponse(response);
  },

  // Comments
  addComment: async (expenseId, text) => {
    const response = await fetch(API_BASE_URL + '/comments', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ expenseId, text })
    });
    return handleApiResponse(response);
  },

  getExpenseComments: async (expenseId) => {
    const response = await fetch(API_BASE_URL + '/comments/expense/' + expenseId, {
      headers: getAuthHeader()
    });
    return handleApiResponse(response);
  },

  getMyComments: async () => {
    const response = await fetch(API_BASE_URL + '/comments/my', {
      headers: getAuthHeader()
    });
    return handleApiResponse(response);
  },

  deleteComment: async (commentId) => {
    const response = await fetch(API_BASE_URL + '/comments/' + commentId, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleApiResponse(response);
  },

  // Activity
  getMyActivities: async () => {
    const response = await fetch(API_BASE_URL + '/activities/my', {
      headers: getAuthHeader()
    });
    return handleApiResponse(response);
  },

  getGroupActivities: async (groupId) => {
    const response = await fetch(API_BASE_URL + '/activities/group/' + groupId, {
      headers: getAuthHeader()
    });
    return handleApiResponse(response);
  },

  getEntityActivities: async (entityType, entityId) => {
    const response = await fetch(API_BASE_URL + '/activities/' + entityType + '/' + entityId, {
      headers: getAuthHeader()
    });
    return handleApiResponse(response);
  },

  // CSV Import
  importExpenses: async (groupId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(API_BASE_URL + '/expenses/import/' + groupId, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: formData
    });
    return handleApiResponse(response);
  }
};

export default api;