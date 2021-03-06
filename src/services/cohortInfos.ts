import api from './api'
import apiBackCohort from './apiBackCohort'
import { getInfos, getLastEncounter } from './myPatients'

import { getOrganizations } from './perimeters'
import { CONTEXT } from '../constants'

import {
  FHIR_API_Response,
  CohortData,
  ComplexChartDataType,
  SearchByTypes,
  VitalStatus,
  Back_API_Response,
  Cohort,
  CohortComposition
} from 'types'
import {
  IGroup,
  IPatient,
  IEncounter,
  IComposition,
  PatientGenderKind,
  IDocumentReference
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
  getVisitRepartitionMapAphp,
  getPerimeterRepartitionData
} from 'utils/graphUtils'
import { searchPatient } from './searchPatient'
import { getAge } from 'utils/age'
import moment from 'moment'

import fakeGroup from '../data/fakeData/group'
import fakeFacetDeceased from '../data/fakeData/facet-deceased'
import fakeFacetAgeMonth from '../data/fakeData/facet-age-month'
import fakeFacetClassSimple from '../data/fakeData/facet-class-simple'
import fakeFacetStartDateFacet from '../data/fakeData/facet-start-date-facet'
import fakePatients from '../data/fakeData/patients'
import fakeDocuments from '../data/fakeData/documents'
// import { fetchPerimetersInfos } from './perimeters'

const fetchCohort = async (cohortId: string | undefined): Promise<CohortData | undefined> => {
  if (CONTEXT === 'fakedata') {
    const name = 'Fausse cohorte'
    const requestId = '123456789'
    const totalPatients = 3

    const cohort = fakeGroup as IGroup

    const originalPatients = fakePatients as IPatient[]

    const agePyramidData = getAgeRepartitionMapAphp(fakeFacetAgeMonth)

    const genderRepartitionMap = getGenderRepartitionMapAphp(fakeFacetDeceased)

    const monthlyVisitData = getVisitRepartitionMapAphp(fakeFacetStartDateFacet)

    const visitTypeRepartitionData = getEncounterRepartitionMapAphp(fakeFacetClassSimple)

    return {
      name,
      cohort,
      totalPatients,
      originalPatients,
      genderRepartitionMap,
      visitTypeRepartitionData,
      agePyramidData,
      monthlyVisitData,
      requestId
    }
  }
  if (CONTEXT === 'aphp') {
    const [cohortInfo, cohortResp, patientsResp, encountersResp] = await Promise.all([
      apiBackCohort.get<Back_API_Response<Cohort>>(`/explorations/cohorts/?fhir_group_id=${cohortId}`),
      api.get<FHIR_API_Response<IGroup>>(`/Group?_id=${cohortId}`),
      api.get<FHIR_API_Response<IPatient>>(
        `/Patient?pivotFacet=age_gender,deceased_gender&_list=${cohortId}&size=20&_sort=given&_elements=gender,name,birthDate,deceased,identifier,extension`
      ),
      api.get<FHIR_API_Response<IEncounter>>(
        `/Encounter?pivotFacet=start-date_start-date-month_gender&facet=class&_list=${cohortId}&size=0&type=VISIT`
      )
    ])

    let name = ''
    let requestId = ''

    if (cohortInfo.data.results && cohortInfo.data.results.length === 1) {
      name = cohortInfo.data.results[0].name ?? ''
      requestId = cohortInfo.data.results[0].request_id ?? ''
    }

    if (!name) {
      name = cohortResp.data.resourceType === 'Bundle' ? cohortResp.data.entry?.[0].resource?.name ?? '-' : '-'
    }

    const cohort = cohortResp.data.resourceType === 'Bundle' ? cohortResp.data.entry?.[0].resource : undefined

    const totalPatients = patientsResp.data.resourceType === 'Bundle' ? patientsResp.data.total : 0

    const originalPatients = await getLastEncounter(getApiResponseResources(patientsResp))

    const agePyramidData =
      patientsResp.data.resourceType === 'Bundle'
        ? getAgeRepartitionMapAphp(
            patientsResp.data.meta?.extension?.find((facet: any) => facet.url === 'facet-age-month')?.extension
          )
        : undefined

    const genderRepartitionMap =
      patientsResp.data.resourceType === 'Bundle'
        ? getGenderRepartitionMapAphp(
            patientsResp.data.meta?.extension?.find((facet: any) => facet.url === 'facet-deceased')?.extension
          )
        : undefined

    const monthlyVisitData =
      encountersResp.data.resourceType === 'Bundle'
        ? getVisitRepartitionMapAphp(
            encountersResp.data.meta?.extension?.find((facet: any) => facet.url === 'facet-start-date-facet')?.extension
          )
        : undefined

    const visitTypeRepartitionData =
      encountersResp.data.resourceType === 'Bundle'
        ? getEncounterRepartitionMapAphp(
            encountersResp.data.meta?.extension?.find((facet: any) => facet.url === 'facet-class-simple')?.extension
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
      monthlyVisitData,
      requestId
    }
  }

  if (CONTEXT === 'arkhn') {
    const cohortResult: CohortData = {}
    const [patientsAndEncountersResp, groupResp] = await Promise.all([
      api.get<FHIR_API_Response<IEncounter | IPatient>>(
        `/Patient?_has:Group:member:_id=${cohortId}&_revinclude=Group:member&_revinclude=Encounter:patient&_count=500`
      ),
      api.get<FHIR_API_Response<IGroup>>(`/Group?_id=${cohortId}`)
    ])

    const patientsAndEncounters = getApiResponseResources(patientsAndEncountersResp)
    const cohort = getApiResponseResources(groupResp)?.[0]

    if (cohort) {
      const cohortOrganizationIds = (cohort.characteristic
        ?.filter(({ valueReference }) => valueReference?.type === 'Organization')
        .map(({ valueReference }) => valueReference?.reference?.split('/')[1]) ?? []) as string[]

      const patients: IPatient[] =
        (patientsAndEncounters?.filter((resource) => resource.resourceType === 'Patient') as IPatient[]) ?? []
      const encounters: IEncounter[] =
        (patientsAndEncounters?.filter((resource) => resource.resourceType === 'Encounter') as IEncounter[]) ?? []
      const organizations = await getOrganizations(cohortOrganizationIds)

      cohortResult.name = cohort.name
      cohortResult.cohort = cohort
      cohortResult.totalPatients = cohort.member ? cohort.member.length : patients.length
      cohortResult.originalPatients = patients
      cohortResult.encounters = encounters
      cohortResult.genderRepartitionMap = getGenderRepartitionMap(patients)
      cohortResult.agePyramidData = getAgeRepartitionMap(patients)
      cohortResult.monthlyVisitData = getVisitRepartitionMap(patients, encounters)
      cohortResult.visitTypeRepartitionData = getEncounterRepartitionMap(encounters)
      cohortResult.perimeterRepartitionData = getPerimeterRepartitionData(organizations, encounters)
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
  sortBy: string,
  sortDirection: string,
  groupId?: string,
  includeFacets?: boolean
): Promise<
  | {
      totalPatients: number
      originalPatients: IPatient[]
      agePyramidData?: ComplexChartDataType<number, { male: number; female: number; other?: number }>
      genderRepartitionMap?: ComplexChartDataType<PatientGenderKind>
    }
  | undefined
> => {
  if (CONTEXT === 'fakedata') {
    const totalPatients = 3

    const originalPatients = fakePatients as IPatient[]

    const agePyramidData = getAgeRepartitionMapAphp(fakeFacetAgeMonth)

    const genderRepartitionMap = getGenderRepartitionMapAphp(fakeFacetDeceased)

    return {
      totalPatients,
      originalPatients,
      genderRepartitionMap,
      agePyramidData
    }
  }
  if (CONTEXT === 'arkhn') {
    //TODO: Improve api request (we filter after getting all the patients)
    const nominativeGroupsIds: any[] = []

    const patientsResp = await searchPatient(
      nominativeGroupsIds,
      page,
      sortBy,
      sortDirection,
      searchInput,
      searchBy,
      groupId
    )

    if (patientsResp) {
      const filteredPatients: IPatient[] = patientsResp.patientList.filter((patient) => {
        const agePatient = parseInt(getAge(patient))
        const genderPatient = patient.gender
        const vitalStatusPatient = patient.deceasedDateTime ? VitalStatus.deceased : VitalStatus.alive
        const [ageMin, ageMax] = age
        let includePatient = true

        if (isNaN(agePatient) || agePatient < ageMin || agePatient > ageMax) {
          includePatient = false
        }

        if (vitalStatus !== VitalStatus.all && vitalStatusPatient !== vitalStatus) {
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
    const facets = includeFacets ? 'pivotFacet=age_gender,deceased_gender&' : ''
    const searchByGroup = groupId ? `&_list=${groupId}` : ''
    const _sortDirection = sortDirection === 'desc' ? '-' : ''
    let ageFilter = ''
    let genderFilter = ''
    let search = ''
    let vitalStatusFilter = ''

    if (gender !== PatientGenderKind._unknown) {
      genderFilter = gender === PatientGenderKind._other ? `&gender=other,unknown` : `&gender=${gender}`
    }

    if (searchInput.trim() !== '') {
      let _searchInput = ''

      if (searchBy !== '_text') {
        search = `&${searchBy}=${searchInput.trim()}`
      } else {
        const searches = searchInput
          .trim() // Remove space before/after search
          .split(' ') // Split by space (= ['mot1', 'mot2' ...])
          .filter((elem: string) => elem) // Filter if you have ['mot1', '', 'mot2'] (double space)

        for (const _search of searches) {
          _searchInput = _searchInput ? `${_searchInput} AND "${_search}"` : `"${_search}"`
        }
        search = `&_text=${_searchInput}`
      }
    }

    if (age[0] !== 0 || age[1] !== 130) {
      const date1 = moment()
        .subtract(age[1] + 1, 'years')
        .add(1, 'days')
        .format('YYYY-MM-DD') //`${today.getFullYear() - age[1]}-${monthStr}-${dayStr}`
      const date2 = moment().subtract(age[0], 'years').format('YYYY-MM-DD') //`${today.getFullYear() - age[0]}-${monthStr}-${dayStr}`
      ageFilter = `&birthdate=ge${date1}&birthdate=le${date2}`
    }

    if (vitalStatus !== VitalStatus.all) {
      if (vitalStatus === VitalStatus.deceased) {
        vitalStatusFilter = '&deceased=true'
      } else if (vitalStatus === VitalStatus.alive) {
        vitalStatusFilter = '&deceased=false'
      }
    }

    const patientsResp = await api.get<FHIR_API_Response<IPatient>>(
      `/Patient?${facets}size=20&offset=${
        page ? (page - 1) * 20 : 0
      }&_sort=${_sortDirection}${sortBy}&_elements=gender,name,birthDate,deceased,identifier,extension${searchByGroup}${search}${genderFilter}${vitalStatusFilter}${ageFilter}`
    )

    const totalPatients = patientsResp.data.resourceType === 'Bundle' ? patientsResp.data.total : 0

    const originalPatients = await getLastEncounter(getApiResponseResources(patientsResp))

    const agePyramidData =
      patientsResp.data.resourceType === 'Bundle'
        ? getAgeRepartitionMapAphp(
            patientsResp.data.meta?.extension?.filter((facet: any) => facet.url === 'facet-age-month')?.[0].extension
          )
        : undefined

    const genderRepartitionMap =
      patientsResp.data.resourceType === 'Bundle'
        ? getGenderRepartitionMapAphp(
            patientsResp.data.meta?.extension?.filter((facet: any) => facet.url === 'facet-deceased')?.[0].extension
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

export const fetchDocumentContent = async (compositionId: string) => {
  const documentResp = await api.get<IComposition>(`/Composition/${compositionId}`)

  return documentResp.data.section ?? []
}

const fetchDocuments = async (
  deidentifiedBoolean: boolean,
  sortBy: string,
  sortDirection: string,
  page: number,
  searchInput: string,
  selectedDocTypes: string[],
  nda: string,
  startDate?: string | null,
  endDate?: string | null,
  groupId?: string,
  encounterIds?: string[]
) => {
  if (CONTEXT === 'fakedata') {
    const totalDocs = 2
    const totalAllDocs = 2

    const documentsList = fakeDocuments as CohortComposition[]

    return {
      totalDocs: totalDocs ?? 0,
      totalAllDocs,
      documentsList
      // wordcloudData
    }
  }

  // FIXME: commented because of typing incompatibility
  // if (CONTEXT === 'aphp') {
  //   const searchByGroup = groupId ? `&_list=${groupId}` : ''
  //   const search = searchInput ? `&_text=${searchInput}` : ''
  //   const docTypesFilter = selectedDocTypes.length > 0 ? `&type=${selectedDocTypes.join()}` : ''
  //   const ndaFilter = nda ? `&encounter.identifier=${nda}` : ''
  //   const _sortDirection = sortDirection === 'desc' ? '-' : ''
  //   let dateFilter = ''
  //   let elements = ''
  //
  //   if (startDate || endDate) {
  //     if (startDate && endDate) {
  //       dateFilter = `&date=ge${startDate}&date=le${endDate}`
  //     } else if (startDate) {
  //       dateFilter = `&date=ge${startDate}`
  //     } else if (endDate) {
  //       dateFilter = `&date=le${endDate}`
  //     }
  //   }
  //
  //   if (!search) {
  //     elements = '&_elements=status,type,subject,encounter,date,title'
  //   }
  //
  //   const [
  //     // wordCloudRequest,
  //     docsList,
  //     allDocsList
  //   ] = await Promise.all([
  //     // api.get<FHIR_API_Response<IComposition>>(
  //     //   `/Composition?facet=cloud&size=0&_sort=${_sortDirection}${sortBy}&status=final${elements}${searchByGroup}${search}${docTypesFilter}${ndaFilter}${dateFilter}`
  //     // ),
  //     api.get<FHIR_API_Response<IComposition>>(
  //       `/Composition?size=20&_sort=${_sortDirection}${sortBy}&offset=${
  //         page ? (page - 1) * 20 : 0
  //       }&status=final${elements}${searchByGroup}${search}${docTypesFilter}${ndaFilter}${dateFilter}`
  //     ),
  //     search
  //       ? api.get<FHIR_API_Response<IComposition>>(
  //           `/Composition?_sort=${_sortDirection}${sortBy}&status=final${searchByGroup}${docTypesFilter}${ndaFilter}${dateFilter}&size=0`
  //         )
  //       : null
  //   ])
  //
  //   const totalDocs = docsList?.data?.resourceType === 'Bundle' ? docsList.data.total : 0
  //   const totalAllDocs = search
  //     ? allDocsList?.data?.resourceType === 'Bundle'
  //       ? allDocsList.data.total
  //       : 0
  //     : totalDocs
  //
  //   const documentsList = await getInfos(deidentifiedBoolean, getApiResponseResources(docsList), groupId)
  //
  //   // const wordcloudData =
  //   //   wordCloudRequest.data.resourceType === 'Bundle'
  //   //     ? wordCloudRequest.data.meta?.extension?.find((facet: any) => facet.url === 'facet-cloud')?.extension
  //   //     : []
  //
  //   return {
  //     totalDocs: totalDocs ?? 0,
  //     totalAllDocs,
  //     documentsList
  //     // wordcloudData
  //   }
  // }

  if (CONTEXT === 'arkhn') {
    // FIXME: $regex operation should support case-insensitive searches
    // https://github.com/arkhn/jpaltime/issues/10
    const search = searchInput ? `/$regex?pattern=${searchInput.toLowerCase()}&` : '?'

    const docTypesFilter = selectedDocTypes.length > 0 ? `&type=${selectedDocTypes.join()}` : ''
    const ndaFilter = nda ? `&encounter.identifier=${nda}` : ''
    // const _sortDirection = sortDirection === 'desc' ? '-' : ''
    let dateFilter = ''

    if (startDate || endDate) {
      if (startDate && endDate) {
        dateFilter = `&date=ge${startDate}&date=le${endDate}`
      } else if (startDate) {
        dateFilter = `&date=ge${startDate}`
      } else if (endDate) {
        dateFilter = `&date=le${endDate}`
      }
    }

    const searchByGroup = encounterIds ? `&encounter=${encounterIds.join(',')}` : ''

    const [
      // wordCloudRequest,
      docsList,
      allDocsList
    ] = await Promise.all([
      // api.get<FHIR_API_Response<IComposition>>(
      //   `/Composition?facet=cloud&size=0&_sort=${_sortDirection}${sortBy}&status=final${elements}${searchByGroup}${search}${docTypesFilter}${ndaFilter}${dateFilter}`
      // ),
      // When trying to sort on the `date` search param, the api returns 0 resources.
      // See https://github.com/arkhn/Cohort360/issues/113
      api.get<FHIR_API_Response<IDocumentReference>>(
        `/DocumentReference${search}_count=10000&_getpagesoffset=${
          page ? (page - 1) * 20 : 0
        }${searchByGroup}${docTypesFilter}${ndaFilter}${dateFilter}`
      ),
      search !== '?'
        ? api.get<FHIR_API_Response<IDocumentReference>>(
            // When trying to sort on the `date` search param, the api returns 0 resources.
            // See https://github.com/arkhn/Cohort360/issues/113
            // `/DocumentReference?_sort=${_sortDirection}${sortBy}${searchByGroup}${docTypesFilter}${ndaFilter}${dateFilter}&_summary=count`
            `/DocumentReference?${searchByGroup}${docTypesFilter}${ndaFilter}${dateFilter}&_summary=count`
          )
        : null
    ])

    const totalDocs = docsList?.data?.resourceType === 'Bundle' ? docsList.data.entry?.length ?? 0 : 0
    const totalAllDocs =
      search !== '?' ? (allDocsList?.data?.resourceType === 'Bundle' ? allDocsList.data.total : 0) : totalDocs

    const documentsList = await getInfos(deidentifiedBoolean, getApiResponseResources(docsList), groupId)
    // const wordcloudData =
    //   wordCloudRequest.data.resourceType === 'Bundle'
    //     ? wordCloudRequest.data.meta?.extension?.find((facet: any) => facet.url === 'facet-cloud')?.extension
    //     : []

    return {
      totalDocs: totalDocs ?? 0,
      totalAllDocs,
      documentsList
      // wordcloudData
    }
  }
}

export { fetchCohort, fetchPatientList, fetchDocuments }
