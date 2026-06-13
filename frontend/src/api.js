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
  }
};