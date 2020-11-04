import axios from 'axios'

import { CONTEXT } from '../constants'

type Authentication = {
  status: number
  data: {
    access: string
    refresh: string
  }
}

export const authenticate = async (
  username: string,
  password: string
): Promise<Authentication> => {
  switch (CONTEXT) {
    case 'aphp':
      return axios({
        method: 'POST',
        url: '/api/jwt/',
        data: { username: username, password: password }
      })
    case 'arkhn':
      return Promise.resolve({
        status: 200,
        data: {
          // PLEASE FIX THIS
          access: '',
          refresh: ''
        }
      })
  }
}
