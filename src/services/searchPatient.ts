import api from './api'
import { CONTEXT, API_RESOURCE_TAG } from '../constants'
import { getLastEncounter } from './myPatients'
import { IPatient } from '@ahryman40k/ts-fhir-types/lib/R4'
import { FHIR_API_Response, SearchByTypes } from 'types'
import { getApiResponseResources } from 'utils/apiHelpers'

export const searchPatient = async (input: string, searchBy: SearchByTypes) => {
  const patientSet: Set<IPatient> = new Set()

  if (CONTEXT === 'arkhn') {
    switch (searchBy) {
      case SearchByTypes.family: {
        const matchFamily = await api.get<FHIR_API_Response<IPatient>>(
          `/Patient?family=${input}${API_RESOURCE_TAG}`
        )
        getApiResponseResources(matchFamily)?.forEach((patient) =>
          patientSet.add(patient)
        )
        break
      }
      case SearchByTypes.given: {
        const matchGiven = await api.get<FHIR_API_Response<IPatient>>(
          `/Patient?given=${input}${API_RESOURCE_TAG}`
        )
        getApiResponseResources(matchGiven)?.forEach((patient) =>
          patientSet.add(patient)
        )
        break
      }
      case SearchByTypes.identifier: {
        const matchIPP = await api.get<FHIR_API_Response<IPatient>>(
          `/Patient?identifier=${input}${API_RESOURCE_TAG}`
        )
        getApiResponseResources(matchIPP)?.forEach((patient) =>
          patientSet.add(patient)
        )
        break
      }
      default: {
        const [matchIPP, matchFamily, matchGiven] = await Promise.all([
          api.get<FHIR_API_Response<IPatient>>(
            `/Patient?identifier=${input}${API_RESOURCE_TAG}`
          ),
          api.get<FHIR_API_Response<IPatient>>(
            `/Patient?family=${input}${API_RESOURCE_TAG}`
          ),
          api.get<FHIR_API_Response<IPatient>>(
            `/Patient?given=${input}${API_RESOURCE_TAG}`
          )
        ])
        getApiResponseResources(matchIPP)?.forEach((patient) =>
          patientSet.add(patient)
        )
        getApiResponseResources(matchFamily)?.forEach((patient) =>
          patientSet.add(patient)
        )
        getApiResponseResources(matchGiven)?.forEach((patient) =>
          patientSet.add(patient)
        )
        break
      }
    }

    return [...patientSet]
  } else if (CONTEXT === 'aphp') {
    const patientList = await api.get<FHIR_API_Response<IPatient>>(
      `/Patient?${searchBy}=${input}`
    )

    if (patientList.data.resourceType === 'OperationOutcome') return

    if (!patientList.data.total) {
      return []
    } else {
      if (patientList.data.entry) {
        patientList.data.entry.forEach(
          (item) => item.resource && patientSet.add(item.resource)
        )
      } else {
        return []
      }
    }

    return await getLastEncounter([...patientSet].filter(Boolean))
  }
}
