type ContextType = 'aphp' | 'arkhn'

export const {
  REACT_APP_BACK_API_URL: BACK_API_URL,
  REACT_APP_FHIR_API_URL: FHIR_API_URL,
  REACT_APP_AUTH_API_URL: AUTH_API_URL,
  REACT_APP_FILES_URL: FILES_URL
} = process.env

export const API_RESOURCE_TAG = process.env.REACT_APP_DEV_API_RESOURCE_TAG
  ? '&_tag=' + process.env.REACT_APP_DEV_API_RESOURCE_TAG
  : ''
export const CONTEXT = process.env.REACT_APP_CONTEXT as ContextType

if (!CONTEXT) throw new Error('missing REACT_APP_CONTEXT from environment')
if (CONTEXT !== 'arkhn' && CONTEXT !== 'aphp') {
  throw new Error("REACT_APP_CONTEXT must be either 'aphp' or 'arkhn")
}
export const ACCES_TOKEN = 'access'
export const REFRESH_TOKEN = 'refresh'
