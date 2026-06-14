import api from './index'

export const importCSV = (groupId, file, preview = false) => {
  const formData = new FormData()
  formData.append('file', file)
  const endpoint = preview ? `/expenses/import/${groupId}/preview` : `/expenses/import/${groupId}`
  return api.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
