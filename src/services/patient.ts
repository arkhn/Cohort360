import api from './api'
import { CONTEXT, API_RESOURCE_TAG } from '../constants'
import {
  CohortPatient,
  CohortComposition,
  PMSIEntry,
  FHIR_API_Response,
  ScopeTreeRow,
  PatientData
} from 'types'
import {
  // IBundle,
  IClaim,
  IComposition,
  ICondition,
  // IDiagnosticReport,
  // IDocumentReference,
  IEncounter,
  IGroup,
  IObservation,
  IPatient,
  IProcedure,
  IDiagnosticReport
} from '@ahryman40k/ts-fhir-types/lib/R4'
import { getApiResponseResources } from 'utils/apiHelpers'

export const fetchPatientsCount = async (): Promise<number | undefined> => {
  const response = await api.get<FHIR_API_Response<IPatient>>(
    'Patient?_summary=count'
  )

  if (response?.data?.resourceType === 'OperationOutcome') return undefined

  return response.data.total
}

export const fetchPatient = async (
  patientId: string
): Promise<PatientData | undefined> => {
  if (CONTEXT === 'arkhn') {
    const [
      patientResponse,
      encounterResponse,
      procedureResponse,
      compositionResponse,
      conditionResponse,
      claimResponse,
      labObservationResponse,
      groupResponse
    ] = await Promise.all([
      api.get<FHIR_API_Response<IPatient>>(
        `/Patient?_id=${patientId}${API_RESOURCE_TAG}`
      ),
      api.get<FHIR_API_Response<IEncounter>>(
        `/Encounter?subject=${patientId}${API_RESOURCE_TAG}`
      ),
      api.get<FHIR_API_Response<IProcedure>>(
        `/Procedure?subject=${patientId}${API_RESOURCE_TAG}`
      ),
      api.get<FHIR_API_Response<IComposition>>(
        `/DocumentReference?subject=${patientId}${API_RESOURCE_TAG}`
      ),
      api.get<FHIR_API_Response<ICondition>>(
        `/Condition?subject=${patientId}${API_RESOURCE_TAG}`
      ),
      api.get<FHIR_API_Response<IClaim>>(
        `/Claim?patient=${patientId}${API_RESOURCE_TAG}`
      ),
      api.get<FHIR_API_Response<IObservation>>(
        `/Observation?subject=${patientId}&category=laboratory${API_RESOURCE_TAG}`
      ),
      api.get<FHIR_API_Response<IGroup>>(
        `/Group?member=${patientId}&_summary=count${API_RESOURCE_TAG}`
      )
    ])

    const consult = getApiResponseResources(procedureResponse)
    const documents = getApiResponseResources(compositionResponse)
    const hospit = getApiResponseResources(encounterResponse)
    const ghm = getApiResponseResources(claimResponse)
    const diagnostic = getApiResponseResources(conditionResponse)
    const patient = getApiResponseResources(patientResponse)?.[0]
    const labResults = getApiResponseResources(labObservationResponse)
    const cohortPatient: CohortPatient | undefined = patient
      ? {
          ...patient,
          lastEncounter: hospit?.[0],
          lastProcedure: consult?.[0],
          mainDiagnosis: diagnostic,
          labResults,
          inclusion:
            groupResponse.data.resourceType === 'Bundle'
              ? (groupResponse.data.total || 0) > 0
              : false
        }
      : undefined

    return {
      patient: cohortPatient,
      consult:
        consult &&
        (await Promise.all(
          consult.map((c) => _ArkhnGetServiceProviderFromPMSIData(c))
        )),
      consultTotal: consult?.length,
      diagnostic:
        diagnostic &&
        (await Promise.all(
          diagnostic.map((c) => _ArkhnGetServiceProviderFromPMSIData(c))
        )),
      diagnosticTotal: diagnostic?.length,
      documents,
      documentsTotal: documents?.length,
      ghm:
        ghm &&
        (await Promise.all(
          ghm.map((c) => _ArkhnGetServiceProviderFromPMSIData(c))
        )),
      ghmTotal: ghm?.length,
      hospit
    }
  } else if (CONTEXT === 'aphp') {
    const [
      patientResponse,
      procedureResponse,
      encounterResponse,
      diagnosticResponse,
      ghmResponse,
      documentsResponse
    ] = await Promise.all([
      api.get<IPatient>(`/Patient/${patientId}`),
      api.get<FHIR_API_Response<IProcedure>>(
        `/Procedure?patient=${patientId}&_sort=-date&size=20`
      ),
      api.get<FHIR_API_Response<IEncounter>>(
        `/Encounter?patient=${patientId}&type=VISIT&status=arrived,triaged,in-progress,onleave,finished,unknown&_sort=-start-date`
      ),
      api.get<FHIR_API_Response<ICondition>>(
        `/Condition?patient=${patientId}&_sort=-recorded-date&size=20`
      ),
      api.get<FHIR_API_Response<IClaim>>(
        `/Claim?patient=${patientId}&_sort=-created&size=20`
      ),
      api.get<FHIR_API_Response<IComposition>>(
        `/Composition?patient=${patientId}&size=20&_sort=-date`
      )
    ])

    const hospit = getApiResponseResources(encounterResponse)

    const documents =
      documentsResponse.data.resourceType === 'Bundle'
        ? await fillNDAAndServiceProviderDocs(
            getApiResponseResources(documentsResponse)
          )
        : undefined

    const documentsTotal =
      documentsResponse.data.resourceType === 'Bundle'
        ? documentsResponse.data.total
        : 0

    const consult =
      procedureResponse.data.resourceType === 'Bundle'
        ? await fillNDAAndServiceProvider(
            getApiResponseResources(procedureResponse)
          )
        : undefined

    const consultTotal =
      procedureResponse.data.resourceType === 'Bundle'
        ? procedureResponse.data.total
        : 0

    const diagnostic =
      diagnosticResponse.data.resourceType === 'Bundle'
        ? await fillNDAAndServiceProvider(
            getApiResponseResources(diagnosticResponse)
          )
        : undefined

    const diagnosticTotal =
      diagnosticResponse.data.resourceType === 'Bundle'
        ? diagnosticResponse.data.total
        : 0

    const ghm =
      ghmResponse.data.resourceType === 'Bundle'
        ? await fillNDAAndServiceProvider(getApiResponseResources(ghmResponse))
        : undefined

    const ghmTotal =
      ghmResponse.data.resourceType === 'Bundle' ? ghmResponse.data.total : 0

    const patient = patientResponse.data
      ? ({
          ...patientResponse.data,
          lastEncounter: hospit?.[0],
          lastProcedure: consult?.[0],
          lastGhm: ghm?.[0],
          mainDiagnosis: diagnostic?.filter((diagnostic: any) => {
            return diagnostic.extension?.[0].valueString === 'dp'
          }),
          associatedDiagnosis: diagnostic?.filter((diagnostic: any) => {
            return diagnostic.extension?.[0].valueString === 'das'
          })
        } as CohortPatient)
      : undefined

    return {
      hospit,
      documents,
      documentsTotal,
      consult,
      consultTotal,
      diagnostic,
      diagnosticTotal,
      ghm,
      ghmTotal,
      patient
    }
  }
}

export const fillNDAAndServiceProviderDocs = async (
  docs?: CohortComposition[]
) => {
  if (!docs) {
    return undefined
  }

  const listeEncounterIds: string[] = docs
    .map((e) => e.encounter?.display?.substring(10))
    .filter((s): s is string => undefined !== s)
  const noDuplicatesList: string[] = []
  for (const element of listeEncounterIds) {
    if (!noDuplicatesList.includes(element)) {
      noDuplicatesList.push(element)
    }
  }

  let itemsProcessed = 0

  const encounters = await api.get(`/Encounter?_id=${noDuplicatesList.join()}`)
  if (!encounters.data.entry) {
    return []
  }

  const listeEncounters = encounters.data.entry.map((e: any) => e.resource)

  for (let i = 0; i < docs.length; i++) {
    itemsProcessed++

    for (let j = 0; j < listeEncounters.length; j++) {
      const docEncounterId = docs[i].encounter?.display?.substring(10)
      if (docEncounterId === listeEncounters[j].id) {
        docs[i].encounterStatus = listeEncounters[j].status
        if (!listeEncounters[j].serviceProvider) {
          docs[i].serviceProvider = 'Non renseigné'
        } else {
          docs[i].serviceProvider = listeEncounters[j].serviceProvider.display
        }
        // if (this.getView().getModel().getProperty('/deidentified')) {
        //   docs[i].resource.idVisite = listeEncounters[j].resource.id
        // } else
        if (listeEncounters[j].identifier) {
          for (let k = 0; k < listeEncounters[j].identifier.length; k++) {
            if (
              listeEncounters[j].identifier[k].type.coding[0].code === 'NDA'
            ) {
              docs[i].NDA = listeEncounters[j].identifier[k].value
            }
          }
        } else {
          docs[i].NDA = '-'
        }
      }
    }

    if (itemsProcessed === docs.length) {
      return docs
    }
  }

  return []
}

export async function fillNDAAndServiceProvider<
  T extends IProcedure | ICondition | IClaim
>(pmsi?: T[]): Promise<PMSIEntry<T>[] | undefined> {
  if (!pmsi) {
    return undefined
  }

  const pmsiEntries: PMSIEntry<T>[] = pmsi
  const listeEncounterIds = pmsiEntries
    .map((e, index) =>
      e.resourceType === 'Claim'
        ? //@ts-ignore
          e.item?.[0].encounter?.[0].reference?.substring(10)
        : //@ts-ignore
          e.encounter?.reference?.substring(10)
    )
    .filter((s): s is string => undefined !== s)

  const noDuplicatesList: string[] = []
  for (const element of listeEncounterIds) {
    if (!noDuplicatesList.includes(element)) {
      noDuplicatesList.push(element)
    }
  }

  let itemsProcessed = 0

  const encounters = await api.get(`/Encounter?_id=${noDuplicatesList}`)

  if (!encounters.data.entry) {
    return
  }

  const listeEncounters = encounters.data.entry.map((e: any) => e.resource)

  for (let i = 0; i < pmsiEntries.length; i++) {
    itemsProcessed++

    for (let j = 0; j < listeEncounters.length; j++) {
      const pmsiEncounterId =
        pmsiEntries[i].resourceType === 'Claim'
          ? // @ts-ignore
            (pmsiEntries[i] as PMSIEntry<
              IClaim
            >).item?.[0].encounter?.[0].reference?.substring(10)
          : (pmsiEntries[i] as
              | IProcedure
              | ICondition).encounter?.reference?.substring(10)
      if (pmsiEncounterId === listeEncounters[j].id) {
        if (!listeEncounters[j].serviceProvider) {
          pmsiEntries[i].serviceProvider = 'Non renseigné'
        } else {
          pmsiEntries[i].serviceProvider =
            listeEncounters[j].serviceProvider.display
        }
        // if (this.getView().getModel().getProperty('/deidentified')) {
        //   pmsiEntries[i].resource.idVisite = listeEncounters[j].resource.id
        // } else
        if (listeEncounters[j].identifier) {
          for (let k = 0; k < listeEncounters[j].identifier.length; k++) {
            if (
              listeEncounters[j].identifier[k].type.coding[0].code === 'NDA'
            ) {
              pmsiEntries[i].NDA = listeEncounters[j].identifier[k].value
            }
          }
        } else {
          pmsiEntries[i].NDA = '-'
        }
      }
    }

    if (itemsProcessed === pmsiEntries.length) {
      return pmsiEntries
    }
  }
}

const _ArkhnGetServiceProviderFromPMSIData = async <
  T extends IClaim | IProcedure | IDiagnosticReport | ICondition
>(
  data: T
): Promise<PMSIEntry<T>> => {
  let serviceProvider: string | undefined
  let NDA: string | undefined
  switch (data.resourceType) {
    case 'DiagnosticReport':
    case 'Condition':
    case 'Procedure':
      //@ts-ignore
      const encounterIdentifier = data.encounter?.identifier?.value
      if (encounterIdentifier) {
        const encounter = getApiResponseResources(
          await api.get<FHIR_API_Response<IEncounter>>(
            `/Encounter?identifier=${encounterIdentifier}${API_RESOURCE_TAG}`
          )
        )?.[0]
        if (encounter) {
          serviceProvider = encounter.serviceProvider?.display
        }
      }
      break
    case 'Claim':
      break

    default:
      break
  }
  return { ...data, serviceProvider, NDA }
}

export const fetchPMSI = async (
  page: number,
  patientId: string,
  selectedTab: 'CIM10' | 'CCAM' | 'GHM',
  searchInput: string,
  nda: string,
  code: string
): Promise<{
  pmsiData?: PMSIEntry<IClaim | ICondition | IProcedure | IDiagnosticReport>[]
  pmsiTotal?: number
}> => {
  if (CONTEXT === 'arkhn') {
    let resource = ''
    let search = ''
    let dateName = ''
    let ndaFilter = ''
    let codeName = ''
    let codeFilter = ''
    let searchParam = ''

    switch (selectedTab) {
      case 'CIM10':
        resource = '/DiagnosticReport'
        dateName = '-recorded-date'
        searchParam = 'subject'
        codeName = 'code'
        break
      case 'CCAM':
        resource = '/Procedure'
        dateName = '-date'
        searchParam = 'subject'
        codeName = 'code'
        break
      case 'GHM':
        resource = '/Claim'
        dateName = '-created'
        searchParam = 'patient'
        codeName = 'diagnosis'
        break
      default:
        resource = '/DiagnosticReport'
        dateName = '-recorded-date'
        searchParam = ''
        codeName = 'code'
    }
    if (searchInput) {
      search = `&_text=${searchInput}`
    }

    if (code !== '') {
      codeFilter = `&${codeName}=${code}`
    }
    // if (nda !== '') {
    //   ndaFilter = `&encounter.identifier=${nda}`
    // }

    const pmsiDataResp = getApiResponseResources(
      await api.get<FHIR_API_Response<IClaim | IProcedure | IDiagnosticReport>>(
        `${resource}?${searchParam}=${patientId}${search}${ndaFilter}${codeFilter}${API_RESOURCE_TAG}`
      )
    )
    const pmsiData =
      pmsiDataResp &&
      (await Promise.all(
        pmsiDataResp.map((data) => _ArkhnGetServiceProviderFromPMSIData(data))
      ))
    return {
      pmsiData,
      pmsiTotal: pmsiData?.length ?? 0
    }
  }
  if (CONTEXT === 'aphp') {
    let resource = ''
    let search = ''
    let dateName = ''
    let ndaFilter = ''
    let codeName = ''
    let codeFilter = ''

    switch (selectedTab) {
      case 'CIM10':
        resource = '/Condition'
        dateName = '-recorded-date'
        codeName = 'code'
        break
      case 'CCAM':
        resource = '/Procedure'
        dateName = '-date'
        codeName = 'code'
        break
      case 'GHM':
        resource = '/Claim'
        dateName = '-created'
        codeName = 'diagnosis'
        break
      default:
        resource = '/Condition'
        dateName = '-recorded-date'
        codeName = 'code'
    }

    if (searchInput) {
      search = `&_text=${searchInput}`
    }

    if (nda !== '') {
      ndaFilter = `&encounter.identifier=${nda}`
    }

    if (code !== '') {
      codeFilter = `&${codeName}=${code}`
    }

    const pmsiResp = await api.get<
      FHIR_API_Response<IClaim | IProcedure | ICondition>
    >(
      `${resource}?patient=${patientId}&_sort=${dateName}&size=20&offset=${
        (page - 1) * 20
      }${search}${ndaFilter}${codeFilter}`
    )

    const pmsiData =
      pmsiResp.data.resourceType === 'Bundle'
        ? await fillNDAAndServiceProvider(getApiResponseResources(pmsiResp))
        : undefined

    const pmsiTotal =
      pmsiResp.data.resourceType === 'Bundle' ? pmsiResp.data.total : 0

    return {
      pmsiData,
      pmsiTotal
    }
  }

  return {}
}

export const fetchDocuments = async (
  page: number,
  patientId: string,
  searchInput: string,
  selectedDocTypes: string[],
  nda: string
) => {
  if (CONTEXT === 'aphp') {
    let search = ''
    let docTypesFilter = ''
    let ndaFilter = ''

    if (searchInput) {
      search = `&_text=${searchInput}`
    }

    if (!selectedDocTypes.includes('all')) {
      docTypesFilter = `&type=${selectedDocTypes.join()}`
    }

    if (nda) {
      ndaFilter = `&encounter.identifier=${nda}`
    }

    const docsList = await api.get(
      `/Composition?patient=${patientId}&_sort=-date&size=20&offset=${
        page ? (page - 1) * 20 : 0
      }${search}${docTypesFilter}${ndaFilter}`
    )

    if (!docsList.data.total) {
      return null
    } else {
      return {
        docsTotal: docsList.data.total,
        docsList: await fillNDAAndServiceProviderDocs(
          getApiResponseResources(docsList)
        )
      }
    }
  }

  if (CONTEXT === 'arkhn') {
    //TODO
  }
}

export const getPatientsFromPerimeter = async (
  providers: ScopeTreeRow[]
): Promise<IPatient[]> => {
  const patientResponses = await Promise.all(
    providers
      .filter((provider) => provider.resourceType === 'HealthcareService')
      .map((provider) =>
        api.get<FHIR_API_Response<IPatient>>(
          `/Patient?_has:Encounter:subject:serviceProvider.reference=HealthcareService/${provider.id}&_count=10000`
        )
      )
  )

  const patients = patientResponses.reduce((acc: IPatient[], response) => {
    const responsePatients = getApiResponseResources(response)
    return responsePatients ? [...acc, ...responsePatients] : acc
  }, [])

  return patients
}

export const getPatientsFromCohortId = async (
  cohortId: string
): Promise<IPatient[] | undefined> => {
  const cohort = getApiResponseResources(
    await api.get<FHIR_API_Response<IGroup>>(`/Group/${cohortId}`)
  )?.[0]
  const patientReferences = cohort?.member?.map((groupMember) =>
    groupMember.entity?.reference?.replace('Patient/', '')
  )

  const patients = getApiResponseResources(
    await api.get<FHIR_API_Response<IPatient>>(
      `/Patient?id=${patientReferences?.join(',')}&_count=10000`
    )
  )

  return patients
}
