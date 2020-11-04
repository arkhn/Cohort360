import {
  IComposition,
  IPatient,
  IClaim,
  IProcedure,
  IEncounter,
  ICondition,
  IGroup,
  IBundle,
  IBundle_Entry,
  IResourceList,
  IOperationOutcome,
  PatientGenderKind,
  IObservation,
  IDocumentReference,
  IDiagnosticReport
} from '@ahryman40k/ts-fhir-types/lib/R4'

export interface TypedEntry<T extends IResourceList> extends IBundle_Entry {
  resource?: T
}

export interface TypedBundle<T extends IResourceList> extends IBundle {
  entry?: TypedEntry<T>[]
}

export type FHIR_API_Response<T extends IResourceList> =
  | TypedBundle<T>
  | IOperationOutcome

export type Back_API_Response<T> = {
  results: T[]
  count: number
}

export type CohortComposition = IComposition & {
  deidentified?: boolean
  idPatient?: string
  IPP?: string
  encounterStatus?: string
  serviceProvider?: string
  NDA?: string
}

export type CohortPatient = IPatient & {
  lastEncounter?: IEncounter
  lastEncounterName?: string
  lastProcedure?: IProcedure
  mainDiagnosis?: ICondition[]
  labResults?: IObservation[]
  inclusion?: boolean
  lastGhm?: IClaim
  associatedDiagnosis?: ICondition[]
  lastLabResults?: IObservation
}

export type PMSIEntry<
  T extends IProcedure | ICondition | IClaim | IDiagnosticReport
> = T & {
  serviceProvider?: string
  NDA?: string
}

export type Cohort = {
  uuid?: string
  fhir_groups_ids?: string
  name?: string
  result_size?: number
  created_at?: string
  modified_at?: string
  favorite?: boolean
}

export type CohortGroup = IGroup & {
  id: string
  name: string
  quantity: number
  parentId?: string
}

export enum Month {
  january = 'Janvier',
  february = 'Février',
  march = 'Mars',
  april = 'Avril',
  may = 'Mai',
  june = 'Juin',
  july = 'Juillet',
  august = 'Août',
  september = 'Septembre',
  october = 'Octobre',
  november = 'Novembre',
  december = 'Decembre'
}

export enum InclusionCriteriaTypes {
  medicalDocument = 'Document médical',
  patientDemography = 'Démographie patient',
  CIMDiagnostic = 'Diagnostiques CIM'
}

export enum SearchByTypes {
  text = '_text',
  family = 'family',
  given = 'given',
  identifier = 'identifier'
}

export enum VitalStatus {
  alive = 'alive',
  deceased = 'deceased',
  all = 'all'
}

export type InclusionCriteria =
  | MedicalDocumentInclusionCriteria
  | PatientDemographyInclusionCriteria
  | CIMDiagnosticInclusionCriteria

export type MedicalDocumentInclusionCriteria = {
  type: InclusionCriteriaTypes.medicalDocument
  name: string
  searchValue: string
  searchFieldCode: string
}

export type PatientDemographyInclusionCriteria = {
  type: InclusionCriteriaTypes.patientDemography
  name: string
  gender: PatientGenderKind
  ageMin: number
  ageMax: number
}

export type CIMDiagnosticInclusionCriteria = {
  type: InclusionCriteriaTypes.CIMDiagnostic
  name: string
  CIMTypeId: string
  CIMDiagnosis: {
    'DIAGNOSIS CODE': string
    'LONG DESCRIPTION': string
    'SHORT DESCRIPTION': string
    FIELD4: string
    FIELD5: string
  }
}

export type ScopeTreeRow = {
  resourceType?: string
  id: string
  name: string
  parentId?: string
  quantity: number
}

export type SimpleChartDataType = {
  label: string
  value: number
  color: string
}
export type ComplexChartDataType<T, V = { [key: string]: number }> = Map<T, V>

export type CohortData = {
  name?: string
  cohort?: IGroup | IGroup[]
  totalPatients?: number
  originalPatients?: IPatient[]
  totalDocs?: number
  documentsList?: CohortComposition[]
  wordcloudData?: any
  encounters?: IEncounter[]
  genderRepartitionMap?: ComplexChartDataType<PatientGenderKind>
  visitTypeRepartitionData?: SimpleChartDataType[]
  monthlyVisitData?: ComplexChartDataType<Month>
  agePyramidData?: ComplexChartDataType<
    number,
    { male: number; female: number; other?: number }
  >
}

export type PatientData = {
  patient?: CohortPatient
  hospit?: IEncounter[]
  documents?: CohortComposition[] | IDocumentReference[]
  documentsTotal?: number
  consult?: PMSIEntry<IProcedure>[]
  consultTotal?: number
  diagnostic?: PMSIEntry<ICondition>[]
  diagnosticTotal?: number
  ghm?: PMSIEntry<IClaim>[]
  ghmTotal?: number
}
