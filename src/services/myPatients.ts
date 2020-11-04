import api from './api'
import { CONTEXT, API_RESOURCE_TAG } from '../constants'
import {
  IComposition,
  IPatient,
  IEncounter
} from '@ahryman40k/ts-fhir-types/lib/R4'
import {
  CohortComposition,
  CohortPatient,
  FHIR_API_Response,
  CohortData
} from '../types'
import { getApiResponseResources } from 'utils/apiHelpers'
import {
  getGenderRepartitionMap,
  getGenderRepartitionMapAphp,
  getAgeRepartitionMap,
  getAgeRepartitionMapAphp,
  getEncounterRepartitionMap,
  getEncounterRepartitionMapAphp,
  getVisitRepartitionMap,
  getVisitRepartitionMapAphp
} from 'utils/graphUtils'

export const fetchMyPatients = async (): Promise<CohortData | undefined> => {
  if (CONTEXT === 'aphp') {
    const [myPatientsResp, myPatientsEncounters] = await Promise.all([
      api.get<FHIR_API_Response<IPatient>>(
        '/Patient?pivotFacet=age_gender,deceased_gender&size=20'
      ),
      api.get<FHIR_API_Response<IEncounter>>(
        '/Encounter?pivotFacet=start-date_start-date-month_gender&facet=class&size=1'
      )
    ])

    const totalPatients =
      myPatientsResp.data.resourceType === 'Bundle'
        ? myPatientsResp.data.total
        : 0

    const originalPatients = await getLastEncounter(
      getApiResponseResources(myPatientsResp)
    )

    const agePyramidData =
      myPatientsResp.data.resourceType === 'Bundle'
        ? await getAgeRepartitionMapAphp(
            myPatientsResp.data.meta?.extension?.filter(
              (facet: any) => facet.url === 'facet-age-month'
            )?.[0].extension
          )
        : undefined

    const genderRepartitionMap =
      myPatientsResp.data.resourceType === 'Bundle'
        ? await getGenderRepartitionMapAphp(
            myPatientsResp.data.meta?.extension?.filter(
              (facet: any) => facet.url === 'facet-deceased'
            )?.[0].extension
          )
        : undefined

    const monthlyVisitData =
      myPatientsEncounters.data.resourceType === 'Bundle'
        ? await getVisitRepartitionMapAphp(
            myPatientsEncounters.data.meta?.extension?.filter(
              (facet: any) => facet.url === 'facet-start-date-facet'
            )?.[0].extension
          )
        : undefined

    const visitTypeRepartitionData =
      myPatientsEncounters.data.resourceType === 'Bundle'
        ? await getEncounterRepartitionMapAphp(
            myPatientsEncounters.data.meta?.extension?.filter(
              (facet: any) => facet.url === 'facet-class-simple'
            )?.[0].extension
          )
        : undefined

    return {
      totalPatients,
      originalPatients,
      // totalDocs,
      // documentsList,
      // wordcloudData,
      genderRepartitionMap,
      visitTypeRepartitionData,
      agePyramidData,
      monthlyVisitData
    }
  }

  if (CONTEXT === 'arkhn') {
    const cohortData: CohortData = {
      name: 'Mes Patients'
    }
    const patients = getApiResponseResources(
      await api.get<FHIR_API_Response<IPatient>>(
        `/Patient?_count=700${API_RESOURCE_TAG}`
      )
    )

    if (patients && patients.length > 0) {
      cohortData.totalPatients = patients.length
      cohortData.originalPatients = patients
      cohortData.agePyramidData = getAgeRepartitionMap(patients)
      cohortData.genderRepartitionMap = getGenderRepartitionMap(patients)

      const patientsIds = patients.map((p) => p.id ?? '').filter(Boolean)
      const encounters = getApiResponseResources(
        await api.get<FHIR_API_Response<IEncounter>>(
          `/Encounter?subject:Patient=${patientsIds.join(
            ','
          )}&_count=700${API_RESOURCE_TAG}`
        )
      )
      if (encounters) {
        cohortData.encounters = encounters
        cohortData.monthlyVisitData = getVisitRepartitionMap(
          patients,
          encounters
        )
        cohortData.visitTypeRepartitionData = getEncounterRepartitionMap(
          encounters
        )
      }
    }
    return cohortData
  }
}

export const getInfos = async (documents?: IComposition[]) => {
  const docsComplets = await getPatientInfos(documents).then(
    async (docs) => await getEncounterInfos(docs)
  )

  return docsComplets
}

export const getLastEncounter = async (patients?: IPatient[]) => {
  if (!patients) {
    return []
  }

  const cohortPatients = patients as CohortPatient[]

  const encounters = await Promise.all(
    cohortPatients.map((patient) =>
      api.get<FHIR_API_Response<IEncounter>>(
        `/Encounter?patient=${patient.id}&_sort=-start-date&size=1&_elements=subject,serviceProvider`
      )
    )
  )

  const encountersVisits = encounters
    .map((encounter) => getApiResponseResources(encounter))
    .filter((encounter) => {
      if (encounter) {
        return encounter.length > 0
      }
    })

  for (const patient of cohortPatients) {
    for (const encounter of encountersVisits) {
      if (patient.id === encounter?.[0].subject?.reference?.substring(8)) {
        patient.lastEncounterName = encounter?.[0].serviceProvider?.display
        break
      } else {
        patient.lastEncounterName = 'Non renseigné'
      }
    }
  }

  return cohortPatients
}

const getEncounterInfos = async (documents?: IComposition[]) => {
  if (!documents) {
    return []
  }

  const cohortDocuments = documents as CohortComposition[]
  var listeEncounterIds = cohortDocuments
    .map((e) => e.encounter?.display?.substring(10))
    .join()

  let itemsProcessed = 0

  const encounters = await api.get(`/Encounter?_id=${listeEncounterIds}`)

  if (!encounters.data.entry) {
    return []
  }

  var listeEncounters = encounters.data.entry.map((e: any) => e.resource)

  for (var i = 0; i < cohortDocuments.length; i++) {
    itemsProcessed++

    for (var j = 0; j < listeEncounters.length; j++) {
      if (
        cohortDocuments[i].encounter?.display?.substring(10) ===
        listeEncounters[j].id
      ) {
        cohortDocuments[i].encounterStatus = listeEncounters[j].status

        if (!listeEncounters[j].serviceProvider) {
          cohortDocuments[i].serviceProvider = 'Non renseigné'
        } else {
          cohortDocuments[i].serviceProvider =
            listeEncounters[j].serviceProvider.display
        }

        if (!listeEncounters[j].identifier) {
          cohortDocuments[i].NDA = 'Inconnu'
        } else {
          for (var k = 0; k < listeEncounters[j].identifier.length; k++) {
            if (
              listeEncounters[j].identifier[k].type.coding[0].code === 'NDA'
            ) {
              cohortDocuments[i].NDA = listeEncounters[j].identifier[k].value
            }
          }
        }
      }
    }

    if (itemsProcessed === cohortDocuments.length) {
      return cohortDocuments
    }
  }

  return []
}

const getPatientInfos = async (documents?: IComposition[]) => {
  if (!documents) {
    return []
  }
  const cohortDocuments = documents as CohortComposition[]
  let itemsProcessed = 0

  var listePatientsIds = cohortDocuments
    .map((e) => e.subject?.display?.substring(8))
    .join()

  const patients = await api.get(
    `/Patient?_id=${listePatientsIds}&_elements=extension,id,identifier`
  )

  var listePatients = patients?.data?.entry
    ? patients?.data?.entry.map((e: any) => e.resource)
    : []

  for (var i = 0; i < cohortDocuments.length; i++) {
    itemsProcessed++

    for (var j = 0; j < listePatients.length; j++) {
      cohortDocuments[i].deidentified =
        listePatients[j].extension[0].valueBoolean

      if (
        cohortDocuments[i].subject?.display?.substring(8) ===
        listePatients[j].id
      ) {
        cohortDocuments[i].idPatient = listePatients[j].id

        if (!listePatients[j].identifier) {
          cohortDocuments[i].IPP = 'Inconnu'
        } else {
          for (var k = 0; k < listePatients[j].identifier.length; k++) {
            if (listePatients[j].identifier[k].type.coding[0].code === 'IPP') {
              cohortDocuments[i].IPP = listePatients[j].identifier[k].value
            }
          }
        }
      }
    }

    if (itemsProcessed === cohortDocuments.length) {
      return cohortDocuments
    }
  }

  return []
}
