const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  };
};

export const api = {
  // Auth
  login: (email, password) => {
    return fetch(API_BASE_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(res => res.json());
  },

  register: (username, email, password) => {
    return fetch(API_BASE_URL + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    }).then(res => res.json());
  },

  getUser: () => {
    return fetch(API_BASE_URL + '/auth/me', {
      headers: getAuthHeader()
    }).then(res => res.json());
  },

  // Groups
  getMyGroups: () => {
    return fetch(API_BASE_URL + '/groups/my', {
      headers: getAuthHeader()
    }).then(res => res.json());
  },

  getGroup: (groupId) => {
    return fetch(API_BASE_URL + '/groups/' + groupId, {
      headers: getAuthHeader()
    }).then(res => res.json());
  },

  createGroup: (data) => {
    return fetch(API_BASE_URL + '/groups', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    }).then(res => res.json());
  },

  addMember: (groupId, userId) => {
    return fetch(API_BASE_URL + '/groups/' + groupId + '/members', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ userId })
    }).then(res => res.json());
  },

  removeMember: (groupId, userId) => {
    return fetch(API_BASE_URL + '/groups/' + groupId + '/members/' + userId, {
      method: 'DELETE',
      headers: getAuthHeader()
    }).then(res => res.json());
  },

  // Expenses
  getGroupExpenses: (groupId) => {
    return fetch(API_BASE_URL + '/expenses/group/' + groupId, {
      headers: getAuthHeader()
    }).then(res => res.json());
  },

  createExpense: (data) => {
    return fetch(API_BASE_URL + '/expenses', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    }).then(res => res.json());
  },

  // Settlements
  getGroupBalances: (groupId) => {
    return fetch(API_BASE_URL + '/settlements/balances/' + groupId, {
      headers: getAuthHeader()
    }).then(res => res.json());
  },

  getSettlementSuggestions: (groupId) => {
    return fetch(API_BASE_URL + '/settlements/suggestions/' + groupId, {
      headers: getAuthHeader()
    }).then(res => res.json());
  },

  recordSettlement: (data) => {
    return fetch(API_BASE_URL + '/settlements', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    }).then(res => res.json());
  },

  getGroupSettlements: (groupId) => {
    return fetch(API_BASE_URL + '/settlements/group/' + groupId, {
      headers: getAuthHeader()
    }).then(res => res.json());
  },

  // Friends
  sendFriendRequest: (email) => {
    return fetch(API_BASE_URL + '/friends/request', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ email })
    }).then(res => res.json());
  },

  acceptFriendRequest: (requestId) => {
    return fetch(API_BASE_URL + '/friends/accept/' + requestId, {
      method: 'POST',
      headers: getAuthHeader()
    }).then(res => res.json());
  },

  declineFriendRequest: (requestId) => {
    return fetch(API_BASE_URL + '/friends/decline/' + requestId, {
      method: 'POST',
      headers: getAuthHeader()
    }).then(res => res.json());
  },

  getFriends: () => {
    return fetch(API_BASE_URL + '/friends', {
      headers: getAuthHeader()
    }).then(res => res.json());
  },

  getPendingRequests: () => {
    return fetch(API_BASE_URL + '/friends/pending', {
      headers: getAuthHeader()
    }).then(res => res.json());
  },

  // Invitations
  createInvitation: (groupId, invitedEmail) => {
    return fetch(API_BASE_URL + '/invitations', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ groupId, invitedEmail })
    }).then(res => res.json());
  },

  acceptInvitation: (code) => {
    return fetch(API_BASE_URL + '/invitations/accept/' + code, {
      method: 'POST',
      headers: getAuthHeader()
    }).then(res => res.json());
  },

  getGroupInvitations: (groupId) => {
    return fetch(API_BASE_URL + '/invitations/group/' + groupId, {
      headers: getAuthHeader()
    }).then(res => res.json());
  },

  getMyInvitations: () => {
    return fetch(API_BASE_URL + '/invitations/my', {
      headers: getAuthHeader()
    }).then(res => res.json());
  },

  // Comments
  addComment: (expenseId, text) => {
    return fetch(API_BASE_URL + '/comments', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ expenseId, text })
    }).then(res => res.json());
  },

  getExpenseComments: (expenseId) => {
    return fetch(API_BASE_URL + '/comments/expense/' + expenseId, {
      headers: getAuthHeader()
    }).then(res => res.json());
  },

  getMyComments: () => {
    return fetch(API_BASE_URL + '/comments/my', {
      headers: getAuthHeader()
    }).then(res => res.json());
  },

  deleteComment: (commentId) => {
    return fetch(API_BASE_URL + '/comments/' + commentId, {
      method: 'DELETE',
      headers: getAuthHeader()
    }).then(res => res.json());
  },

  // Activity
  getMyActivities: () => {
    return fetch(API_BASE_URL + '/activities/my', {
      headers: getAuthHeader()
    }).then(res => res.json());
  },

  getGroupActivities: (groupId) => {
    return fetch(API_BASE_URL + '/activities/group/' + groupId, {
      headers: getAuthHeader()
    }).then(res => res.json());
  },

  getEntityActivities: (entityType, entityId) => {
    return fetch(API_BASE_URL + '/activities/' + entityType + '/' + entityId, {
      headers: getAuthHeader()
    }).then(res => res.json());
  },

  // CSV Import
  importExpenses: (groupId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    return fetch(API_BASE_URL + '/expenses/import/' + groupId, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: formData
    }).then(res => res.json());
  }
};

export default api;