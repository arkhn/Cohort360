import api from './api'
import { CONTEXT, API_RESOURCE_TAG } from '../constants'
import {
  IGroup,
  IPractitionerRole,
  IOrganization,
  IHealthcareService,
  IPatient
} from '@ahryman40k/ts-fhir-types/lib/R4'
import { CohortGroup, FHIR_API_Response, ScopeTreeRow } from '../types'
import { getApiResponseResources } from 'utils/apiHelpers'

//TODO: Implement
export const getScopeRows = async (
  practitionerId: string
): Promise<ScopeTreeRow[]> => {
  if (CONTEXT === 'aphp') {
    const perimeters = await getPerimeters(practitionerId)
    if (perimeters) {
      const sousGroups = await getSousGroups(perimeters)
      return sousGroups ?? []
    }
  }

  if (CONTEXT === 'arkhn') {
    let scopeRows: ScopeTreeRow[] = []
    const [
      healthcareServicesWOOrgaResp,
      organizationsResp
    ] = await Promise.all([
      api.get<FHIR_API_Response<IHealthcareService>>(
        `HealthcareService?organization:missing=true${API_RESOURCE_TAG}`
      ),
      api.get<FHIR_API_Response<IOrganization>>(
        `/Organization?${API_RESOURCE_TAG}`
      )
    ])
    const healthcareServicesWOOrga = getApiResponseResources(
      healthcareServicesWOOrgaResp
    )
    const organizations = getApiResponseResources(organizationsResp)

    if (organizations) {
      const servicesPerOrga = await Promise.all(
        organizations.map((orga) => getOrganizationServices(orga))
      )

      const flattenServices = servicesPerOrga.reduce(
        (
          acc: {
            orgaId: string | undefined
            serviceId: string | undefined
            service: IHealthcareService
          }[],
          serviceObj
        ) => {
          return [
            ...acc,
            ...serviceObj.services.map((service) => ({
              orgaId: serviceObj.orgaId,
              serviceId: service.id,
              service
            }))
          ]
        },
        []
      )
      const patientsCountPerServices = await Promise.all(
        flattenServices.map((serviceObj) =>
          getServicePatientsCount(serviceObj.service)
        )
      )

      flattenServices.forEach((serviceObj, serviceIndex) => {
        scopeRows.push({
          id: serviceObj.serviceId ?? '',
          name: serviceObj.service.name ?? '',
          quantity: patientsCountPerServices[serviceIndex].total,
          parentId: serviceObj.orgaId
        })
      })

      organizations.forEach((orga) => {
        const orgaTotalPatients = scopeRows.reduce(
          (acc, row) => (row.parentId === orga.id ? acc + row.quantity : acc),
          0
        )
        scopeRows.push({
          resourceType: orga.resourceType,
          id: orga.id ?? '',
          name: orga.name ?? '',
          //TODO get orga patient count
          quantity: orgaTotalPatients
        })
      })
    }

    if (healthcareServicesWOOrga) {
      //Add healthcare services to scopeRows
      healthcareServicesWOOrga.forEach((service) => {
        scopeRows.push({
          resourceType: service.resourceType,
          id: service.id ?? '',
          name: service.name ?? '',
          //TODO get service patient count
          quantity: 0
        })
      })
    }
    return scopeRows
  }
  return []
}

const getServicePatientsCount = async (
  service: IHealthcareService
): Promise<{ total: number; serviceId: string | undefined }> => {
  const patientsResp = await api.get<FHIR_API_Response<IPatient>>(
    `Patient?_has:Encounter:subject:service-provider=${service.id}&_summary=count${API_RESOURCE_TAG}`
  )
  return {
    total:
      patientsResp.data.resourceType === 'Bundle'
        ? patientsResp.data.total ?? 0
        : 0,
    serviceId: service.id
  }
}

const getOrganizationServices = async (
  orga: IOrganization
): Promise<{ orgaId: string | undefined; services: IHealthcareService[] }> => {
  const orgaId = orga.id
  if (!orgaId) {
    return { services: [], orgaId }
  }
  const orgaServicesResp = await api.get<FHIR_API_Response<IHealthcareService>>(
    `HealthcareService?organization:Organization=${orgaId}${API_RESOURCE_TAG}`
  )

  return { services: getApiResponseResources(orgaServicesResp) ?? [], orgaId }
}

export const getPerimeters = async (practitionerId: string) => {
  if (CONTEXT === 'aphp') {
    const practitionerRole = await api.get<
      FHIR_API_Response<IPractitionerRole>
    >(`/PractitionerRole?practitioner=${practitionerId}&_elements=organization`)

    if (practitionerRole.data.resourceType === 'OperationOutcome') {
      return undefined
    }

    if (practitionerRole.data.entry) {
      const perimetersIds = practitionerRole.data.entry
        .map((e: any) => e.resource.organization.reference.substring(13))
        .join()

      const perimeters = await api.get<FHIR_API_Response<IGroup>>(
        `/Group?managing-entity=${perimetersIds}&_elements=name,quantity,managingEntity`
      )

      return getApiResponseResources(perimeters)
    }
  }

  if (CONTEXT === 'arkhn') {
    const responsePractitionerRole = await api.get<
      FHIR_API_Response<IPractitionerRole>
    >(
      `/PractitionerRole?practitioner.identifier=${practitionerId}&_elements=organization`
    )
    const practitionerRole = getApiResponseResources(responsePractitionerRole)

    if (undefined === practitionerRole) {
      return undefined
    }

    const perimetersIds = practitionerRole
      .map((p) => p.organization?.reference?.substring(13))
      .join()
    const responsePerimeters = await api.get<FHIR_API_Response<IGroup>>(
      `/Group?managing-entity=${perimetersIds}&_elements=name,quantity,managingEntity`
    )
    return getApiResponseResources(responsePerimeters)
  }
}

export const getSousGroups = async (
  perimeters: IGroup[]
): Promise<CohortGroup[] | undefined> => {
  const cohortGroups: CohortGroup[] = []
  const perimetersGroupsIds = perimeters.map((e) =>
    e.managingEntity?.display?.substring(13)
  )
  const perimetersLength = perimetersGroupsIds.length
  let itemsProcessed = 0
  for (let i = 0; i < perimetersLength; i++) {
    itemsProcessed++
    const currentPerimeter = perimeters[i]
    cohortGroups.push({
      ...currentPerimeter,
      id: currentPerimeter.id ?? '',
      name: currentPerimeter.name ?? '',
      quantity: currentPerimeter.quantity ?? 0
    })
    const organization = await api.get<FHIR_API_Response<IOrganization>>(
      `/Organization?partof=${perimetersGroupsIds[i]}&_elements=id`
    )
    const organizationIds = getApiResponseResources(organization)
      ?.map((org) => org.id ?? '')
      .filter((id) => '' !== id)
    if (organizationIds) {
      const sousGroupsRequest = await api.get<FHIR_API_Response<IGroup>>(
        `/Group?managing-entity=${organizationIds}&_elements=name,quantity,managingEntity`
      )
      const sousGroups = getApiResponseResources(sousGroupsRequest)
      if (sousGroups) {
        sousGroups.forEach(async (element) => {
          cohortGroups.push({
            ...element,
            id: element.id ?? '',
            name: element.name ?? '',
            quantity: element.quantity ?? 0,
            parentId: currentPerimeter.id
          })
        })
        const sousGroupsOrganizationsId = sousGroups.map((e) =>
          e.managingEntity?.display?.substring(13)
        )
        for (let j = 0; j < sousGroupsOrganizationsId.length; j++) {
          const sousOrganizationResponse = await api.get<
            FHIR_API_Response<IOrganization>
          >(`/Organization?partof=${sousGroupsOrganizationsId[j]}&_elements=id`)
          const sousOrganizationIds = getApiResponseResources(
            sousOrganizationResponse
          )
            ?.map((org) => org.id ?? '')
            .filter((id) => '' !== id)
          if (sousOrganizationIds) {
            const sousSousGroupsRequest = await api.get<
              FHIR_API_Response<IGroup>
            >(
              `/Group?managing-entity=${sousOrganizationIds}&_elements=name,quantity,managingEntity`
            )
            const sousSousGroups = getApiResponseResources(
              sousSousGroupsRequest
            )
            if (sousSousGroups) {
              sousSousGroups.forEach((element) => {
                cohortGroups.push({
                  ...element,
                  id: element.id ?? '',
                  name: element.name ?? '',
                  quantity: element.quantity ?? 0,
                  parentId: sousGroups[j].id
                })
              })
            }
          }
        }
      }
    }
    if (itemsProcessed === perimetersLength) {
      cohortGroups.forEach((cohortGroup) => {
        cohortGroup.name = cohortGroup.name.replace('Patients passés par: ', '')
      })
      return cohortGroups
    }
  }
}
