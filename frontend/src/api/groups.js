import api from './index'

export const createGroup = (data) => api.post('/groups', data)
export const getMyGroups = () => api.get('/groups/my')
export const getGroup = (id) => api.get(`/groups/${id}`)
export const addMember = (groupId, userId) => api.post(`/groups/${groupId}/members`, { userId })
export const addMemberByEmail = (groupId, email) => api.post(`/groups/${groupId}/members/email`, { email })
export const removeMember = (groupId, userId) => api.delete(`/groups/${groupId}/members/${userId}`)
export const leaveGroup = (groupId) => api.post(`/groups/${groupId}/leave`)
