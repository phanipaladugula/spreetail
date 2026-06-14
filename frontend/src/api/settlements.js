import api from './index'

export const getGroupBalances = (groupId) => api.get(`/settlements/balances/${groupId}`)
export const getSettlementSuggestions = (groupId) => api.get(`/settlements/suggestions/${groupId}`)
export const recordSettlement = (data) => api.post('/settlements', data)
export const getGroupSettlements = (groupId) => api.get(`/settlements/group/${groupId}`)
