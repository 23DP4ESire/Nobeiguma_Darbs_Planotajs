import axiosClient from './axiosClient'

const api = {
  // Example endpoints - customize as needed
  
  // GET example
  fetchData: () => {
    return axiosClient.get('/data')
  },

  // POST example
  saveData: (data) => {
    return axiosClient.post('/save', data)
  },

  // GET by ID
  getDataById: (id) => {
    return axiosClient.get(`/data/${id}`)
  },

  // PUT example (update)
  updateData: (id, data) => {
    return axiosClient.put(`/data/${id}`, data)
  },

  // DELETE example
  deleteData: (id) => {
    return axiosClient.delete(`/data/${id}`)
  },
}

export default api
