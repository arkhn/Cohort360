import { createSelector } from '@reduxjs/toolkit'

import { RootState } from 'state'
import { SimpleChartDataType } from 'types'

const self = (state: RootState) => state

const cohortOrgaRepartitionDataSelector = createSelector(self, (state):
  | (SimpleChartDataType & { id?: string })[]
  | null => {
  const practitionerOrganizations = state.me?.organizations
  const { perimeterRepartitionData, originalPatients, cohort } = state.exploredCohort

  const groupOrganizationsCount = cohort?.characteristic?.length ?? 0
  const groupOrganizationsInPerimeterCount =
    practitionerOrganizations?.filter((orga) => perimeterRepartitionData?.find(({ id }) => id === orga.id)).length ?? 0
  const orgasOutOfPerimeterCount = groupOrganizationsCount - groupOrganizationsInPerimeterCount

  const patientsInPerimeterCount = originalPatients?.length ?? 0
  const cohortMembersCount = cohort?.member?.length ?? 0
  const patientsOutOfPerimeterCount = cohortMembersCount - patientsInPerimeterCount

  if (!practitionerOrganizations || !perimeterRepartitionData) {
    return null
  }

  return perimeterRepartitionData.map((data) => {
    const isOrgaInScope = practitionerOrganizations?.some((orga) => orga.id === data.id)
    return {
      ...data,
      value: isOrgaInScope ? data.value : Math.floor(patientsOutOfPerimeterCount / orgasOutOfPerimeterCount),
      color: isOrgaInScope ? '#16BDFF' : '#FFF4E5'
    }
  })
})

const orgaIdsOutOfPractitionerPerimeterSelector = createSelector(self, (state): string[] | null => {
  let orgaIds: string[] = []
  const practitionerOrganizations = state.me?.organizations
  const { perimeterRepartitionData } = state.exploredCohort

  if (!practitionerOrganizations || !perimeterRepartitionData) {
    return null
  }

  const cohortOrgaIds = perimeterRepartitionData.map(({ id }) => id) as string[]
  const practitionerPerimeterOrgaIds = practitionerOrganizations.map(({ id }) => id) as string[]

  orgaIds = cohortOrgaIds.filter((id) => !practitionerPerimeterOrgaIds.includes(id))

  return orgaIds
})

const areCohortOrgaAccessRequestPendingSelector = createSelector(
  [self, orgaIdsOutOfPractitionerPerimeterSelector],
  (state, orgaIdsOutOfPractitionerPerimeter): { pending: boolean; date?: Date } | null => {
    const pendingRequests = state.me?.pendingRequests

    if (!orgaIdsOutOfPractitionerPerimeter || !pendingRequests) {
      return null
    }

    for (const id of orgaIdsOutOfPractitionerPerimeter) {
      const orgaAccessPendingRequest = pendingRequests.find(
        (practitionerRole) => practitionerRole.organization?.reference === `Organization/${id}`
      )

      if (!orgaAccessPendingRequest) {
        return { pending: false }
      }
    }

    const lastUpdated = pendingRequests[0]?.meta?.lastUpdated

    return { pending: true, date: lastUpdated ? new Date(lastUpdated) : undefined }
  }
)

const showCreateAccessRequestAlertSelector = createSelector(
  [self, cohortOrgaRepartitionDataSelector, orgaIdsOutOfPractitionerPerimeterSelector],
  (state, orgaRepartitionData, orgaIdsOutOfPractitionerPerimeter) => {
    const { originalPatients, cohort } = state.exploredCohort
    const patientsInPerimeterCount = originalPatients?.length
    const cohortMembersCount = cohort?.member?.length

    if (orgaRepartitionData && orgaIdsOutOfPractitionerPerimeter) {
      for (const { id: orgaId } of orgaRepartitionData) {
        if (orgaId && orgaIdsOutOfPractitionerPerimeter.includes(orgaId)) {
          /*  If group members count differs from originalPatients count,
           *  this means there are patients out of the practitioner's perimeter */
          return patientsInPerimeterCount !== cohortMembersCount
        }
      }
    }
    return false
  }
)

export {
  cohortOrgaRepartitionDataSelector,
  orgaIdsOutOfPractitionerPerimeterSelector,
  areCohortOrgaAccessRequestPendingSelector,
  showCreateAccessRequestAlertSelector
}
