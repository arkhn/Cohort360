import { CriteriaItemType } from 'types'

// Components
import DemographicFrom from './DiagramView/components/GroupCard/components/CriteriaRightPanel/DemographicFrom/DemographicFrom'
import DocumentsForm from './DiagramView/components/GroupCard/components/CriteriaRightPanel/DocumentsForm/DocumentsForm'
import SupportedForm from './DiagramView/components/GroupCard/components/CriteriaRightPanel/SupportedForm/SupportedForm'
import CCAMForm from './DiagramView/components/GroupCard/components/CriteriaRightPanel/CCAM'
import Cim10Form from './DiagramView/components/GroupCard/components/CriteriaRightPanel/Cim10Form'
import GhmForm from './DiagramView/components/GroupCard/components/CriteriaRightPanel/GHM'

// Fetcher
import {
  fetchAdmissionModes,
  fetchEntryModes,
  fetchExitModes,
  fetchPriseEnChargeType,
  fetchTypeDeSejour,
  fetchOnSaitPas,
  fetchFileStatus
} from '../../../services/cohortCreation/fetchEncounter'
import { fetchGender, fetchStatus } from '../../../services/cohortCreation/fetchDemographic'
import {
  fetchStatusDiagnostic,
  fetchDiagnosticTypes,
  fetchCim10Diagnostic,
  fetchCim10Hierarchy
} from '../../../services/cohortCreation/fetchCondition'
import { fetchCcamData, fetchCcamHierarchy } from '../../../services/cohortCreation/fetchProcedure'
import { fetchGhmData, fetchGhmHierarchy } from '../../../services/cohortCreation/fetchClaim'
import { fetchDocTypes } from '../../../services/cohortCreation/fetchComposition'

// ├── Mes variables
// ├── Patients
// ├── Visites
// ├── Documents cliniques
// ├── PMSI
// │   ├── Diagnostics
// │   ├── Actes
// │   ├── GHM
// ├── Biologie/Microbiologie
// │   ├── Biologie
// │   ├── Microbiologie
// ├── Physiologie
// ├── Médicaments
// │   ├── Prescription - Dispension - Administration

const criteriaList: CriteriaItemType[] = [
  // {
  //   id: 'mes_variables',
  //   title: 'Mes variables',
  //   color: '#808080',
  //   disabled: true,
  //   data: null,
  //   components: null
  // },
  {
    id: 'Patient',
    title: 'Démographie',
    color: '#0063AF',
    components: DemographicFrom,
    data: { gender: 'loading', status: 'loading' },
    fetch: { fetchGender, fetchStatus }
  },
  {
    disabled: true,
    id: 'Encounter',
    title: 'Visites',
    color: '#808080',
    components: SupportedForm,
    data: {
      admissionModes: 'loading',
      entryModes: 'loading',
      exitModes: 'loading',
      priseEnChargeType: 'loading',
      typeDeSejour: 'loading',
      onSaitPas: 'loading',
      fileStatus: 'loading'
    },
    fetch: {
      fetchAdmissionModes,
      fetchEntryModes,
      fetchExitModes,
      fetchPriseEnChargeType,
      fetchTypeDeSejour,
      fetchOnSaitPas,
      fetchFileStatus
    }
  },
  {
    id: 'Composition',
    title: 'Documents cliniques',
    color: '#0063AF',
    components: DocumentsForm,
    data: { docTypes: 'loading' },
    fetch: { fetchDocTypes }
  },
  {
    id: 'pmsi',
    title: 'PMSI',
    color: '#0063AF',
    components: null,
    subItems: [
      {
        id: 'Condition',
        title: 'Diagnostics',
        color: '#0063AF',
        components: Cim10Form,
        data: {
          statusDiagnostic: 'loading',
          diagnosticTypes: 'loading',
          cim10Diagnostic: 'loading',
          cim10Hierarchy: 'loading'
        },
        fetch: { fetchStatusDiagnostic, fetchDiagnosticTypes, fetchCim10Diagnostic, fetchCim10Hierarchy }
      },
      {
        disabled: true,
        id: 'Procedure',
        title: 'Actes',
        color: '#808080',
        components: CCAMForm,
        data: { ccamData: 'loading', ccamHierarchy: 'loading' },
        fetch: { fetchCcamData, fetchCcamHierarchy }
      },
      {
        disabled: true,
        id: 'Claim',
        title: 'GHM',
        color: '#808080',
        components: GhmForm,
        data: { ghmData: 'loading', ghmHierarchy: 'loading' },
        fetch: { fetchGhmData, fetchGhmHierarchy }
      }
    ]
  },
  {
    id: 'biologie_microbiologie',
    title: 'Biologie/Microbiologie',
    color: '#808080',
    components: null,
    subItems: [
      {
        id: 'biologie',
        title: 'Biologie',
        color: '#808080',
        disabled: true,
        data: null,
        components: null
      },
      {
        id: 'microbiologie',
        title: 'Microbiologie',
        components: null,
        color: '#808080',
        disabled: true,
        data: null
      }
    ]
  },
  {
    id: 'physiologie',
    title: 'Physiologie',
    color: '#808080',
    disabled: true,
    data: null,
    components: null
  },
  {
    id: 'médicaments',
    title: 'Médicaments',
    color: '#808080',
    components: null,
    subItems: [
      {
        id: 'prescription_dispension_administration',
        title: 'Prescription - Dispension - Administration',
        components: null,
        color: '#808080',
        disabled: true,
        data: null
      }
    ]
  }
]

const constructCriteriaList: () => CriteriaItemType[] = () => criteriaList

export default constructCriteriaList
