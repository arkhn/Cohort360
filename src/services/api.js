import axios from 'axios'
import { FHIR_API_URL, PRACTITIONER_ID, FHIR_API_ADMIN_TOKEN } from '../constants'
import { removeTokens } from './arkhnAuth/oauth/tokenManager'

const api = axios.create({
  baseURL: FHIR_API_URL,
  headers: {
    Accept: 'application/fhir+json'
  }
})

api.interceptors.request.use((config) => {
  config.headers.Authorization = localStorage.getItem(PRACTITIONER_ID) || FHIR_API_ADMIN_TOKEN
  return config
})

api.interceptors.response.use(
  (response) => {
    return response
  },
  async function (error) {
    if ((401 || 400) === error.response.status) {
      localStorage.clear()
      window.location = '/'
    }

    if (error.response.status === 401) {
      removeTokens()
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

export default api
