import React, { useState } from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import InputBase from '@material-ui/core/InputBase'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

import PatientFilters from '../../Filters/PatientFilters/PatientFilters'
import TableauPatient from '../../TableauPatients/TableauPatients'

import PieChart from '../Preview/Charts/PieChart'
import BarChart from '../Preview/Charts/BarChart'
import PyramidChart from '../Preview/Charts/PyramidChart'

import { ReactComponent as SearchIcon } from '../../../assets/icones/search.svg'
import { ReactComponent as FilterList } from '../../../assets/icones/filter.svg'
import LockIcon from '@material-ui/icons/Lock'

import { fetchPatientList } from '../../../services/cohortInfos'

import useStyles from './styles'
import { IPatient, PatientGenderKind } from '@ahryman40k/ts-fhir-types/lib/R4'
import { ComplexChartDataType, SearchByTypes, VitalStatus } from 'types'
import { getGenderRepartitionSimpleData } from 'utils/graphUtils'

type PatientListProps = {
  total: number
  groupId?: string
  deidentified?: boolean
  patients: IPatient[]
  loading?: boolean
  agePyramidData?: ComplexChartDataType<
    number,
    { male: number; female: number; other?: number }
  >
  genderRepartitionMap?: ComplexChartDataType<PatientGenderKind>
}

const PatientList: React.FC<PatientListProps> = ({
  groupId,
  total,
  deidentified,
  patients,
  loading,
  ...props
}) => {
  const classes = useStyles()
  const [page, setPage] = useState(1)
  const [totalPatients, setTotalPatients] = useState(total)
  const [patientsList, setPatientsList] = useState(patients)
  const [loadingStatus, setLoadingStatus] = useState(loading)
  const [searchInput, setSearchInput] = useState('')
  const [searchBy, setSearchBy] = useState<SearchByTypes>(SearchByTypes.text)
  const [agePyramid, setAgePyramid] = useState(props.agePyramidData)
  const [patientData, setPatientData] = useState(
    getGenderRepartitionSimpleData(props.genderRepartitionMap)
  )
  const [open, setOpen] = useState(false)
  const [gender, setGender] = useState<PatientGenderKind>(
    PatientGenderKind._unknown
  )
  const [age, setAge] = useState<[number, number]>([0, 130])
  const [vitalStatus, setVitalStatus] = useState<VitalStatus>(VitalStatus.all)
  const includeFacets = true

  const handleOpenDialog = () => {
    setOpen(true)
  }

  const handleCloseDialog = () => {
    setOpen(false)
    handleChangePage()
  }

  const handleChangeSelect = (
    event: React.ChangeEvent<{
      name?: string | undefined
      value: unknown
    }>,
    child: React.ReactNode
  ) => {
    setSearchBy(event.target.value as SearchByTypes)
  }

  const handleChangeInput = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setSearchInput(event.target.value)
  }

  const fetchPatients = (pageValue: number = 1) => {
    setLoadingStatus(true)
    fetchPatientList(
      pageValue,
      searchBy,
      searchInput,
      gender,
      age,
      vitalStatus,
      groupId,
      includeFacets
    )
      .then((result) => {
        if (result) {
          const {
            totalPatients,
            originalPatients,
            genderRepartitionMap,
            agePyramidData
          } = result
          setPatientsList(originalPatients)
          setPatientData(getGenderRepartitionSimpleData(genderRepartitionMap))
          setAgePyramid(agePyramidData)
          setTotalPatients(totalPatients)
        }
      })
      .catch((error) => console.log(error))
      .finally(() => {
        setLoadingStatus(false)
      })
  }

  const handleChangePage = (
    event?: React.ChangeEvent<unknown>,
    value: number = 1
  ) => {
    setPage(value)
    //We only fetch patients if we don't already have them
    if (totalPatients > patients.length) {
      fetchPatients(value)
    }
  }

  const onSearchPatient = () => {
    setPage(1)
    fetchPatients()
  }

  const onKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      onSearchPatient()
    }
  }

  return (
    <Grid container direction="column" alignItems="center">
      <CssBaseline />
      <Grid container item xs={11} justify="space-between">
        <Typography variant="h2" className={classes.pageTitle}>
          Données patient
        </Typography>
        <Grid container>
          <Grid container item xs={12} sm={6} lg={4} justify="center">
            <Paper className={classes.chartOverlay}>
              <Grid container item className={classes.chartTitle}>
                <Typography variant="h3" color="primary">
                  Répartition par genre
                </Typography>
              </Grid>
              <BarChart data={patientData.genderData} />
            </Paper>
          </Grid>
          <Grid container item xs={12} sm={6} lg={4} justify="center">
            <Paper className={classes.chartOverlay}>
              <Grid container item className={classes.chartTitle}>
                <Typography variant="h3" color="primary">
                  Répartition par statut vital
                </Typography>
              </Grid>
              <PieChart data={patientData.vitalStatusData} />
            </Paper>
          </Grid>
          <Grid container item xs={12} sm={6} lg={4} justify="center">
            <Paper className={classes.chartOverlay}>
              <Grid container item className={classes.chartTitle}>
                <Typography variant="h3" color="primary">
                  Pyramide des âges
                </Typography>
              </Grid>
              <PyramidChart data={agePyramid} width={300} />
            </Paper>
          </Grid>
        </Grid>
        <Grid container item justify="flex-end" className={classes.tableGrid}>
          <Grid container justify="space-between" alignItems="center">
            <Typography variant="button">
              {totalPatients} / {total} patient(s)
            </Typography>
            <div className={classes.tableButtons}>
              {deidentified ? (
                <Grid container alignItems="center">
                  <LockIcon />
                  <Typography variant="h6">
                    Les données patients sont pseudonymisées.
                  </Typography>
                </Grid>
              ) : (
                <>
                  <Select
                    value={searchBy}
                    onChange={handleChangeSelect}
                    className={classes.select}
                  >
                    <MenuItem value={SearchByTypes.text}>
                      Tous les champs
                    </MenuItem>
                    <MenuItem value={SearchByTypes.family}>Nom</MenuItem>
                    <MenuItem value={SearchByTypes.given}>Prénom</MenuItem>
                    <MenuItem value={SearchByTypes.identifier}>IPP</MenuItem>
                  </Select>
                  <Grid
                    item
                    container
                    xs={10}
                    alignItems="center"
                    className={classes.searchBar}
                  >
                    <InputBase
                      placeholder="Rechercher"
                      className={classes.input}
                      value={searchInput}
                      onChange={handleChangeInput}
                      onKeyDown={onKeyDown}
                    />
                    <IconButton
                      type="submit"
                      aria-label="search"
                      onClick={onSearchPatient}
                    >
                      <SearchIcon fill="#ED6D91" height="15px" />
                    </IconButton>
                    <PatientFilters
                      open={open}
                      onClose={() => setOpen(false)}
                      onSubmit={handleCloseDialog}
                      gender={gender}
                      onChangeGender={setGender}
                      age={age}
                      onChangeAge={setAge}
                      vitalStatus={vitalStatus}
                      onChangeVitalStatus={setVitalStatus}
                    />
                  </Grid>
                </>
              )}
              <Button
                variant="contained"
                disableElevation
                startIcon={<FilterList height="15px" fill="#FFF" />}
                className={classes.searchButton}
                onClick={handleOpenDialog}
              >
                Filtrer
              </Button>
            </div>
          </Grid>
          <TableauPatient
            deidentified={deidentified}
            patients={patientsList}
            loading={loadingStatus}
            onChangePage={handleChangePage}
            page={page}
            totalPatientCount={totalPatients}
          />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default PatientList
