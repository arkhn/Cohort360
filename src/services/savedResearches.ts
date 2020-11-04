import api from './api'
import apiBackCohort from './apiBackCohort'
import { CONTEXT } from '../constants'
// import { IGroup } from '@ahryman40k/ts-fhir-types/lib/R4'
import {
  Cohort,
  // FHIR_API_Response,
  Back_API_Response
} from '../types'

export const fetchCohorts = async (searchInput?: string, page?: number) => {
  if (CONTEXT === 'arkhn') {
    // const cohortResp = await api.get<FHIR_API_Response<IGroup>>(
    //   '/Group?&_sort=-meta.lastUpdated'
    // )

    return {
      formattedCohort: [],
      total: 0
    }

    // return {
    //   formattedCohort: cohortResp.data.entry
    //     .map((group) => {
    //       if (group.resource.error) {
    //         return null
    //       }
    //       // TODO refactor
    //       return {
    //         researchId: group.resource.id,
    //         dossier: 'test',
    //         titre: group.resource.name || 'Nom de la recherche',
    //         statut: 'Actif',
    //         nPatients: group.resource.member ? group.resource.member.length : 0,
    //         date: '05/06/2020',
    //         perimetre: '-'
    //       }
    //     })
    //     .filter(Boolean)
    // }
  } else if (CONTEXT === 'aphp') {
    let searchByText = ''
    let offset = ''

    if (searchInput) {
      searchByText = `&search=${searchInput}`
    }

    if (page) {
      offset = `&offset=${(page - 1) * 20}`
    }

    const cohortResp = await apiBackCohort.get<Back_API_Response<Cohort>>(
      `/cohorts/?ordering=-favorite&type=IMPORT_I2B2${searchByText}&limit=20${offset}`
    )

    return {
      formattedCohort: cohortResp.data.results
        .map((cohort) => ({
          researchId: cohort.uuid,
          fhir_groups_ids: cohort.fhir_groups_ids,
          titre: cohort.name,
          statut: 'Cohorte i2b2',
          nPatients: cohort.result_size,
          date: cohort.created_at,
          perimetre: '-',
          favorite: cohort.favorite
        }))
        .filter(Boolean),
      total: cohortResp.data.count
    }
  }
}

export const fetchFavoriteCohorts = async () => {
  if (CONTEXT === 'aphp') {
    const cohortResp = await apiBackCohort.get<Back_API_Response<Cohort>>(
      '/cohorts/?favorite=true&type=IMPORT_I2B2'
    )

    return {
      formattedCohort: cohortResp.data.results
        .map((cohort: Cohort) => {
          return {
            researchId: cohort.uuid,
            fhir_groups_ids: cohort.fhir_groups_ids,
            titre: cohort.name,
            statut: 'Cohorte i2b2',
            nPatients: cohort.result_size,
            date: cohort.created_at,
            perimetre: '-',
            favorite: cohort.favorite
          }
        })
        .filter(Boolean)
    }
  }
}

export const fetchLastCohorts = async () => {
  if (CONTEXT === 'aphp') {
    const cohortResp = await apiBackCohort.get<Back_API_Response<Cohort>>(
      '/cohorts/?limit=5&type=IMPORT_I2B2&ordering=-created_at'
    )

    return {
      formattedCohort: cohortResp.data.results
        .map((cohort: Cohort) => {
          return {
            researchId: cohort.uuid,
            fhir_groups_ids: cohort.fhir_groups_ids,
            titre: cohort.name,
            statut: 'Cohorte i2b2',
            nPatients: cohort.result_size,
            date: cohort.created_at,
            perimetre: '-',
            favorite: cohort.favorite
          }
        })
        .filter(Boolean)
    }
  }
}

export const setFavorite = async (cohortId: string, favStatus: boolean) => {
  if (CONTEXT === 'aphp') {
    await apiBackCohort.patch(`/cohorts/${cohortId}/`, { favorite: !favStatus })
  }
}

export const onRemoveCohort = async (selectedCohort: string) => {
  if (CONTEXT === 'arkhn') {
    await api.delete(`/Group/${selectedCohort}`)
  } else if (CONTEXT === 'aphp') {
    await apiBackCohort.delete(`/cohorts/${selectedCohort}/`)
  }
}
