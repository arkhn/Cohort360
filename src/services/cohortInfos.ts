import api from './api'
import { getInfos, getLastEncounter } from './myPatients'
import { CONTEXT, API_RESOURCE_TAG } from '../constants'
import {
  FHIR_API_Response,
  CohortData,
  ComplexChartDataType,
  SearchByTypes,
  VitalStatus
} from 'types'
import {
  IGroup,
  IPatient,
  IEncounter,
  IComposition,
  PatientGenderKind
} from '@ahryman40k/ts-fhir-types/lib/R4'
import { getApiResponseResources } from 'utils/apiHelpers'
import {
  getGenderRepartitionMap,
  getGenderRepartitionMapAphp,
  getEncounterRepartitionMap,
  getEncounterRepartitionMapAphp,
  getAgeRepartitionMap,
  getAgeRepartitionMapAphp,
  getVisitRepartitionMap,
  getVisitRepartitionMapAphp
} from 'utils/graphUtils'
import { searchPatient } from './searchPatient'
import { getAge } from 'utils/age'
import { fetchPerimetersInfos } from './perimeters'

const fetchCohort = async (
  cohortId: string
): Promise<CohortData | undefined> => {
  if (CONTEXT === 'aphp') {
    const [cohortResp, patientsResp, encountersResp] = await Promise.all([
      api.get<FHIR_API_Response<IGroup>>(`/Group?_id=${cohortId}`),
      api.get<FHIR_API_Response<IPatient>>(
        `/Patient?pivotFacet=age_gender,deceased_gender&_list=${cohortId}&size=20`
      ),
      api.get<FHIR_API_Response<IEncounter>>(
        `/Encounter?pivotFacet=start-date_start-date-month_gender&facet=class&_list=${cohortId}&size=1`
      )
    ])

    const name =
      cohortResp.data.resourceType === 'Bundle'
        ? cohortResp.data.entry?.[0].resource?.name
        : '-'

    const cohort =
      cohortResp.data.resourceType === 'Bundle'
        ? cohortResp.data.entry?.[0].resource
        : undefined

    const totalPatients =
      patientsResp.data.resourceType === 'Bundle' ? patientsResp.data.total : 0

    const originalPatients = await getLastEncounter(
      getApiResponseResources(patientsResp)
    )

    const agePyramidData =
      patientsResp.data.resourceType === 'Bundle'
        ? getAgeRepartitionMapAphp(
            patientsResp.data.meta?.extension?.filter(
              (facet: any) => facet.url === 'facet-age-month'
            )?.[0].extension
          )
        : undefined

    const genderRepartitionMap =
      patientsResp.data.resourceType === 'Bundle'
        ? getGenderRepartitionMapAphp(
            patientsResp.data.meta?.extension?.filter(
              (facet: any) => facet.url === 'facet-deceased'
            )?.[0].extension
          )
        : undefined

    const monthlyVisitData =
      encountersResp.data.resourceType === 'Bundle'
        ? getVisitRepartitionMapAphp(
            encountersResp.data.meta?.extension?.filter(
              (facet: any) => facet.url === 'facet-start-date-facet'
            )?.[0].extension
          )
        : undefined

    const visitTypeRepartitionData =
      encountersResp.data.resourceType === 'Bundle'
        ? getEncounterRepartitionMapAphp(
            encountersResp.data.meta?.extension?.filter(
              (facet: any) => facet.url === 'facet-class-simple'
            )?.[0].extension
          )
        : undefined

    return {
      name,
      cohort,
      totalPatients,
      originalPatients,
      genderRepartitionMap,
      visitTypeRepartitionData,
      agePyramidData,
      monthlyVisitData
    }
  }

  if (CONTEXT === 'arkhn') {
    const cohortResult: CohortData = {}
    const cohort = getApiResponseResources(
      await api.get<FHIR_API_Response<IGroup>>(
        `/Group?_id=${cohortId}${API_RESOURCE_TAG}`
      )
    )?.[0]

    if (cohort) {
      cohortResult.cohort = cohort

      //Fetch cohort related patients & encounters
      const patientIdentifiers = cohort.member
        ?.map((m) => m.entity.identifier?.value)
        .filter((id): id is string => undefined !== id)
      const patientRefs = cohort.member
        ?.map((m) => m.entity.reference)
        .filter((ref): ref is string => undefined !== ref)

      if (!patientIdentifiers || !patientRefs) {
        return cohortResult
      }

      const [patientsResp, encountersResp] = await Promise.all([
        api.get<FHIR_API_Response<IPatient>>(
          `/Patient?identifier=${patientIdentifiers.join(
            ','
          )}${API_RESOURCE_TAG}`
        ),
        api.get<FHIR_API_Response<IEncounter>>(
          `/Encounter?subject=${patientRefs.join(',')}${API_RESOURCE_TAG}`
        )
      ])
      const patients = getApiResponseResources(patientsResp)
      const encounters = getApiResponseResources(encountersResp)

      if (!patients || !encounters) {
        return cohortResult
      }

      cohortResult.totalPatients = patientIdentifiers.length
      cohortResult.originalPatients = patients
      cohortResult.encounters = encounters
      cohortResult.genderRepartitionMap = getGenderRepartitionMap(patients)
      cohortResult.agePyramidData = getAgeRepartitionMap(patients)
      cohortResult.monthlyVisitData = getVisitRepartitionMap(
        patients,
        encounters
      )
      cohortResult.visitTypeRepartitionData = getEncounterRepartitionMap(
        encounters
      )
    }
    return cohortResult
  }
}

const fetchPatientList = async (
  page: number,
  searchBy: SearchByTypes,
  searchInput: string,
  gender: PatientGenderKind,
  age: [number, number],
  vitalStatus: VitalStatus,
  groupId?: string,
  includeFacets?: boolean
): Promise<
  | {
      totalPatients: number
      originalPatients: IPatient[]
      agePyramidData?: ComplexChartDataType<
        number,
        { male: number; female: number; other?: number }
      >
      genderRepartitionMap?: ComplexChartDataType<PatientGenderKind>
    }
  | undefined
> => {
  if (CONTEXT === 'arkhn') {
    let patients: IPatient[] | undefined = []

    //TODO: Improve api request (we filter after getting all the patients)
    if (undefined !== searchInput && searchInput.trim() !== '') {
      //FIX: Request is based on all patients instead of perimeters patients
      patients = await searchPatient(searchInput, searchBy)
    } else if (groupId) {
      patients = (await fetchPerimetersInfos(groupId))?.originalPatients
    }

    if (patients) {
      const filteredPatients: IPatient[] = patients.filter((patient) => {
        const agePatient = parseInt(getAge(patient))
        const genderPatient = patient.gender
        const vitalStatusPatient = patient.deceasedDateTime
          ? VitalStatus.deceased
          : VitalStatus.alive
        const [ageMin, ageMax] = age
        let includePatient = true

        if (isNaN(agePatient) || agePatient < ageMin || agePatient > ageMax) {
          includePatient = false
        }

        if (
          vitalStatus !== VitalStatus.all &&
          vitalStatusPatient !== vitalStatus
        ) {
          includePatient = false
        }

        if (gender !== PatientGenderKind._unknown && genderPatient !== gender) {
          includePatient = false
        }

        return includePatient
      })

      return {
        totalPatients: filteredPatients.length,
        originalPatients: filteredPatients,
        agePyramidData: getAgeRepartitionMap(filteredPatients),
        genderRepartitionMap: getGenderRepartitionMap(filteredPatients)
      }
    }
  }

  if (CONTEXT === 'aphp') {
    let searchByGroup = groupId ? `&_list=${groupId}` : ''
    let search = ''
    let genderFilter = ''
    let ageFilter = ''
    let vitalStatusFilter = ''
    let facets = ''

    if (searchInput) {
      if (searchBy) {
        search = `&${searchBy}=${searchInput}`
      } else {
        search = `&_text=${searchInput}`
      }
    }

    if (gender !== PatientGenderKind._unknown) {
      genderFilter = `&gender=${gender}`
    }

    if (age !== [0, 130]) {
      const today = new Date()

      const month = today.getMonth() + 1
      let monthStr = ''
      if (month < 10) {
        monthStr = '0' + month.toString()
      } else {
        monthStr = month.toString()
      }

      const day = today.getDate()
      let dayStr = ''
      if (day < 10) {
        dayStr = '0' + day.toString()
      } else {
        dayStr = day.toString()
      }

      const date1 = `${today.getFullYear() - age[1]}-${monthStr}-${dayStr}`
      const date2 = `${today.getFullYear() - age[0]}-${monthStr}-${dayStr}`
      ageFilter = `&birthdate=ge${date1}&birthdate=le${date2}`
    }

    if (vitalStatus !== VitalStatus.all) {
      if (vitalStatus === VitalStatus.deceased) {
        vitalStatusFilter = '&deceased=true'
      } else if (vitalStatus === VitalStatus.alive) {
        vitalStatusFilter = '&deceased=false'
      }
    }

    if (includeFacets) {
      facets = 'pivotFacet=age_gender,deceased_gender&'
    }

    const patientsResp = await api.get<FHIR_API_Response<IPatient>>(
      `/Patient?${facets}size=20&offset=${
        page ? (page - 1) * 20 : 0
      }${searchByGroup}${search}${genderFilter}${vitalStatusFilter}${ageFilter}`
    )

    const totalPatients =
      patientsResp.data.resourceType === 'Bundle' ? patientsResp.data.total : 0

    const originalPatients = await getLastEncounter(
      getApiResponseResources(patientsResp)
    )

    const agePyramidData =
      patientsResp.data.resourceType === 'Bundle'
        ? getAgeRepartitionMapAphp(
            patientsResp.data.meta?.extension?.filter(
              (facet: any) => facet.url === 'facet-age-month'
            )?.[0].extension
          )
        : undefined

    const genderRepartitionMap =
      patientsResp.data.resourceType === 'Bundle'
        ? getGenderRepartitionMapAphp(
            patientsResp.data.meta?.extension?.filter(
              (facet: any) => facet.url === 'facet-deceased'
            )?.[0].extension
          )
        : undefined

    return {
      totalPatients: totalPatients ?? 0,
      originalPatients,
      genderRepartitionMap,
      agePyramidData
    }
  }
}

const fetchDocuments = async (
  page: number,
  searchInput: string,
  selectedDocTypes: string[],
  nda: string,
  groupId?: string
) => {
  if (CONTEXT === 'aphp') {
    const searchByGroup = groupId ? `&_list=${groupId}` : ''
    const search = searchInput ? `&_text=${searchInput}` : ''
    const docTypesFilter = !selectedDocTypes.includes('all')
      ? `&type=${selectedDocTypes.join()}`
      : ''
    const ndaFilter = nda ? `&encounter.identifier=${nda}` : ''

    const [docsList, allDocsList] = await Promise.all([
      api.get<FHIR_API_Response<IComposition>>(
        `/Composition?facet=cloud-medium&size=20&_sort=-date&offset=${
          page ? (page - 1) * 20 : 0
        }${searchByGroup}${search}${docTypesFilter}${ndaFilter}`
      ),
      search
        ? api.get<FHIR_API_Response<IComposition>>(
            `/Composition?facet=cloud-medium&_sort=-date&${searchByGroup}${docTypesFilter}${ndaFilter}`
          )
        : null
    ])

    const totalDocs =
      docsList?.data?.resourceType === 'Bundle' ? docsList.data.total : 0
    const totalAllDocs = search
      ? allDocsList?.data?.resourceType === 'Bundle'
        ? allDocsList.data.total
        : 0
      : totalDocs

    const documentsList = await getInfos(getApiResponseResources(docsList))

    const wordcloudData =
      docsList.data.resourceType === 'Bundle'
        ? docsList.data.meta?.extension
        : []

    if (totalDocs === 0) {
      return null
    } else {
      return {
        totalDocs,
        totalAllDocs,
        documentsList,
        wordcloudData
      }
    }
  }

  if (CONTEXT === 'arkhn') {
    //TODO
  }
}

export { fetchCohort, fetchPatientList, fetchDocuments }
