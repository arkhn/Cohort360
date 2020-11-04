import React, { useState } from 'react'

import {
  CircularProgress,
  Divider,
  Drawer,
  Grid,
  List,
  Typography
} from '@material-ui/core'
import Pagination from '@material-ui/lab/Pagination'

import PatientSidebarHeader from './PatientSidebarHeader/PatientSidebarHeader'
import PatientSidebarItem from './PatientSidebarItem/PatientSidebarItem'

import { getAge } from '../../../utils/age'
import { fetchPatientList } from '../../../services/cohortInfos'
import { PatientGenderKind } from '@ahryman40k/ts-fhir-types/lib/R4'
import { CohortPatient, SearchByTypes, VitalStatus } from 'types'

import useStyles from './styles'

type PatientSidebarTypes = {
  total: number
  patients?: CohortPatient[]
  groupId?: string
  openDrawer: boolean
  onClose: () => void
}
const PatientSidebar: React.FC<PatientSidebarTypes> = ({
  total,
  patients,
  groupId,
  openDrawer,
  onClose
}) => {
  const classes = useStyles()

  const [page, setPage] = useState(1)
  const [totalPatients, setTotalPatients] = useState(total)
  const [patientsList, setPatientsList] = useState(patients)
  const [open, setOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchBy, setSearchBy] = useState(SearchByTypes.text)
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [gender, setGender] = useState(PatientGenderKind._unknown)
  const [age, setAge] = useState<[number, number]>([0, 130])
  const [vitalStatus, setVitalStatus] = useState(VitalStatus.all)

  const documentLines = 20 // Number of desired lines in the document array

  const handleChangePage = (
    event?: React.ChangeEvent<unknown>,
    value: number = 1
  ) => {
    setPage(value)
    setLoadingStatus(true)
    fetchPatientList(
      value,
      searchBy,
      searchInput,
      gender,
      age,
      vitalStatus,
      groupId
    )
      .then((patientsResp) => {
        setPatientsList(patientsResp?.originalPatients ?? [])
        setTotalPatients(patientsResp?.totalPatients ?? 0)
      })
      .catch((error) => console.log(error))
      .then(() => {
        setLoadingStatus(false)
      })
  }

  const handleChangeSearchInput = (event: {
    target: { value: React.SetStateAction<string> }
  }) => {
    setSearchInput(event.target.value)
  }

  const onKeyDown = async (e: {
    keyCode: number
    preventDefault: () => void
  }) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      onSearchPatient()
    }
  }

  // eslint-disable-next-line
  const handleChangeSelect = (
    event: React.ChangeEvent<{
      value: SearchByTypes
    }>
  ) => {
    setSearchBy(event.target.value)
  }

  const onSearchPatient = async () => {
    handleChangePage()
  }

  const handleCloseDialog = () => {
    setOpen(false)
    handleChangePage()
  }

  return (
    <Drawer
      anchor="right"
      classes={{ paper: classes.paper }}
      variant="persistent"
      open={openDrawer}
    >
      <PatientSidebarHeader
        onCloseButtonClick={onClose}
        searchInput={searchInput}
        onChangeSearchInput={handleChangeSearchInput}
        onKeyDownSearchInput={onKeyDown}
        searchBy={searchBy}
        onChangeSelect={setSearchBy}
        onSearchPatient={onSearchPatient}
        onClickFilterButton={() => setOpen(true)}
        open={open}
        onCloseFilterDialog={() => setOpen(false)}
        onSubmitDialog={handleCloseDialog}
        gender={gender}
        onChangeGender={setGender}
        age={age}
        onChangeAge={setAge}
        vitalStatus={vitalStatus}
        onChangeVitalStatus={setVitalStatus}
      />
      <Divider />
      <List className={classes.patientList} disablePadding>
        {loadingStatus ? (
          <Grid container justify="center" className={classes.loading}>
            <CircularProgress />
          </Grid>
        ) : patientsList ? (
          patientsList.map((patient) => (
            <PatientSidebarItem
              key={patient.id}
              firstName={patient.name?.[0].given?.[0] ?? ''}
              lastName={patient.name?.map((e) => e.family).join(' ') ?? ''}
              age={getAge(patient)}
              gender={patient.gender}
              deceased={patient.deceasedDateTime}
              id={patient.id}
            />
          ))
        ) : (
          <Grid container justify="center">
            <Typography variant="h6">Aucun patient à afficher</Typography>
          </Grid>
        )}
      </List>
      <Pagination
        className={classes.pagination}
        count={Math.ceil(totalPatients / documentLines)}
        shape="rounded"
        onChange={handleChangePage}
        page={page}
      />
    </Drawer>
  )
}

export default PatientSidebar
