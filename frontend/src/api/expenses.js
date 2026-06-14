import api from './index'

export const createExpense = (data) => api.post('/expenses', data)
export const getExpense = (id) => api.get(`/expenses/${id}`)
export const getGroupExpenses = (groupId) => api.get(`/expenses/group/${groupId}`)
export const getMyExpenses = () => api.get('/expenses/my')
