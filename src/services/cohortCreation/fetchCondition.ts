import { memoize } from 'lodash'

import { CONDITION_VS_URL, CONTEXT } from '../../constants'
import api from '../../services/api'
import apiRequest from '../../services/apiRequest'
import { capitalizeFirstLetter } from '../../utils/capitalize'
import { fakeValueSetCIM10, fakeValueSetDiagnosticType } from '../../data/fakeData/cohortCreation/condition'
import { alphabeticalSort } from 'utils/alphabeticalSort'
import type { IValueSet } from '@ahryman40k/ts-fhir-types/lib/R4'
import { FHIR_API_Response } from '../../types'
import { getApiResponseResources } from '../../utils/apiHelpers'

const DEFAULT_DIAGNOSTIC_TYPES = [
  {
    code: 'mp',
    display: 'manifestation morbide principale'
  },
  {
    code: 'fp',
    display: 'finalité principale de prise en charge'
  },
  {
    code: 'dp',
    display: 'diagnostic principal'
  },
  {
    code: 'das',
    display: 'diagnostic associé significatif'
  },
  {
    code: 'dr',
    display: 'diagnostic relié'
  },
  {
    code: 'ae',
    display: 'affection étiologique'
  },
  {
    code: 'dad',
    display: 'donnée à visée documentaire'
  }
]

export const fetchStatusDiagnostic = async () => {
  return [
    {
      id: 'actif',
      label: 'Actif'
    },
    {
      id: 'supp',
      label: 'Supprimé'
    }
  ]
}

export const fetchDiagnosticTypes = async () => {
  if (CONTEXT === 'arkhn') {
    return null
  } else if (CONTEXT === 'fakedata') {
    return fakeValueSetDiagnosticType && fakeValueSetDiagnosticType.length > 0
      ? fakeValueSetDiagnosticType.map((_fakeValueSetDiagnosticType: { code: string; display: string }) => ({
          id: _fakeValueSetDiagnosticType.code,
          label: capitalizeFirstLetter(_fakeValueSetDiagnosticType.display)
        }))
      : []
  } else {
    const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-condition_status`)

    const diagnosticKinds =
      res && res.data && res.data.entry && res.data.entry[0]
        ? res.data.entry[0].resource.compose.include[0].concept
        : DEFAULT_DIAGNOSTIC_TYPES

    return diagnosticKinds && diagnosticKinds.length > 0
      ? diagnosticKinds.sort(alphabeticalSort).map((cimType: any) => ({
          id: cimType.code,
          label: `${cimType.code} - ${cimType.display}`
        }))
      : []
  }
}

type Code = {
  id?: string
  label?: string
}

const fetchConditionValueSet = memoize(
  async (): Promise<Code[]> => {
    const response = await api.get<FHIR_API_Response<IValueSet>>(`/ValueSet?url=${CONDITION_VS_URL}`)
    const valueSetList = getApiResponseResources(response)
    const codeSet = valueSetList?.[0]?.compose?.include[0]?.concept

    if (!codeSet) return []
    return codeSet
      .map((value) => ({
        id: value.code,
        label: `${value.code} - ${value.display}`
      }))
      .sort((a, b) => (a.label && b.label ? a.label.localeCompare(b.label) : 0))
  }
)

// todo: check if the data syntax is correct when available
export const fetchCim10Diagnostic = async (searchValue?: string) => {
  if (CONTEXT === 'arkhn') {
    return fetchConditionValueSet()
  } else if (CONTEXT === 'fakedata') {
    return fakeValueSetCIM10 && fakeValueSetCIM10.length > 0
      ? fakeValueSetCIM10.map((_fakeValueSetCIM10: { code: string; display: string }) => ({
          id: _fakeValueSetCIM10.code,
          label: capitalizeFirstLetter(_fakeValueSetCIM10.display)
        }))
      : []
  } else {
    if (!searchValue) {
      return []
    }
    const _searchValue = searchValue ? `&_text=${searchValue}` : ''
    const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-cim${_searchValue}`)

    let cim10List =
      res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
        ? res.data.entry[0].resource.compose.include[0].concept
        : []

    cim10List =
      cim10List && cim10List.length > 0
        ? cim10List.sort(alphabeticalSort).map((cimData: any) => ({
            id: cimData.code,
            label: `${cimData.code} - ${cimData.display}`
          }))
        : []
    return cim10List
  }
}

export const fetchCim10Hierarchy = async (cim10Parent: string) => {
  if (CONTEXT === 'arkhn') {
    return null
  } else if (CONTEXT === 'fakedata') {
    return null
  } else {
    if (!cim10Parent) {
      const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-cim`)

      let cim10List =
        res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
          ? res.data.entry[0].resource.compose.include[0].concept
          : []

      cim10List =
        cim10List && cim10List.length > 0
          ? cim10List.sort(alphabeticalSort).map((cimData: any) => ({
              id: cimData.code,
              label: `${cimData.code} - ${cimData.display}`
            }))
          : []
      return cim10List
    } else {
      const json = {
        resourceType: 'ValueSet',
        url: 'https://terminology.eds.aphp.fr/aphp-orbis-cim-',
        compose: {
          include: [
            {
              filter: [
                {
                  op: 'is-a',
                  value: cim10Parent ?? ''
                }
              ]
            }
          ]
        }
      }

      const res = await apiRequest.post(`/ValueSet/$expand`, JSON.stringify(json))

      let cim10List =
        res && res.data && res.data.expansion && res.data.expansion.contains && res.data.resourceType === 'ValueSet'
          ? res.data.expansion.contains
          : []

      cim10List =
        cim10List && cim10List.length > 0
          ? cim10List.sort(alphabeticalSort).map((cimData: any) => ({
              id: cimData.code,
              label: `${cimData.code} - ${cimData.display}`
            }))
          : []
      return cim10List
    }
  }
}
