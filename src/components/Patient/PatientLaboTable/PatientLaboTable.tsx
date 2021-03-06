import React, { useState } from 'react'
import Grid from '@material-ui/core/Grid'
import TableContainer from '@material-ui/core/TableContainer'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Pagination from '@material-ui/lab/Pagination'

// import InputBase from '@material-ui/core/InputBase'
// import IconButton from '@material-ui/core/IconButton'
// import Button from '@material-ui/core/Button'

// import { ReactComponent as SearchIcon } from '../../../assets/icones/search.svg'
// import { ReactComponent as FilterList } from '../../../assets/icones/filter.svg'
import useStyles from './styles'
import { CohortPatient } from 'types'
import { IObservation } from '@ahryman40k/ts-fhir-types/lib/R4'

type PatientLaboTableProps = {
  patient: CohortPatient
}

const PatientLaboTable = ({ patient }: PatientLaboTableProps) => {
  const classes = useStyles()

  const [page, setPage] = useState(1)

  const labResultValue = (res: IObservation): string => {
    if (res.valueQuantity) return `${res.valueQuantity.value} ${res.valueQuantity.unit}`
    if (res.valueBoolean) return `${res.valueBoolean}`
    if (res.valueString) return res.valueString
    if (res.valueTime) return res.valueTime
    if (res.valueDateTime) return res.valueDateTime
    if (res.valueInteger) return res.valueInteger.toString()
    if (res.valueRange?.low || res.valueRange?.high)
      return `${res.valueRange.low?.value} ${res.valueRange.low?.unit} - ${res.valueRange.high?.value} ${res.valueRange.high?.unit}`
    if (res.valuePeriod) return `${res.valuePeriod.start} - ${res.valuePeriod.end}`
    if (res.valueRatio?.numerator || res.valueRatio?.denominator)
      return `${res.valueRatio.numerator?.value} ${res.valueRatio.numerator?.unit} / ${res.valueRatio.denominator?.value} ${res.valueRatio.denominator?.unit}`
    if (res.valueCodeableConcept?.text) return res.valueCodeableConcept.text
    return '-'
  }

  const patientLabResults =
    patient.labResults?.map((labResult) => ({
      id: labResult.id,
      type: labResult.code.coding?.[0].display,
      sampleType: labResult.bodySite ? labResult.bodySite.coding?.[0].code : '-',
      date: labResult.effectiveDateTime ? new Date(labResult.effectiveDateTime).toLocaleDateString('fr-FR') : '-',
      value: labResultValue(labResult),
      interpretation: labResult.interpretation?.[0].coding?.[0].code
    })) ?? []

  const labItemNumber = 5 //Number of desired lines in the lab item array
  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  return (
    <Grid container item xs={11} justify="flex-end" className={classes.labTable}>
      {
        // Filtering feature is hidden
        /* <div className={classes.labButtons}>
        <Grid item container xs={10} alignItems="center" className={classes.searchBar}>
          <InputBase placeholder="Rechercher" className={classes.input} disabled />
          <IconButton type="submit" aria-label="search" disabled>
            <SearchIcon fill="#ED6D91" height="15px" />
          </IconButton>
        </Grid>
        <Button
          variant="contained"
          disableElevation
          startIcon={<FilterList height="15px" fill="#FFF" />}
          className={classes.searchButton}
          disabled
        >
          Filtrer
        </Button>
      </div> */
      }
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead className={classes.tableHead}>
            <TableRow>
              <TableCell align="left" className={classes.tableHeadCell}>
                Type d'analyse
              </TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                Type de prélèvement
              </TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                Date
              </TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                Valeur
              </TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                Interprétation
              </TableCell>
              {/* It would be possible to add information about practitioner here */}
            </TableRow>
          </TableHead>
          <TableBody>
            {patientLabResults.slice((page - 1) * labItemNumber, page * labItemNumber).map((res) => {
              return (
                <TableRow className={classes.tableBodyRows} key={res.id}>
                  <TableCell align="left">{res.type}</TableCell>
                  <TableCell align="center">{res.sampleType}</TableCell>
                  <TableCell align="center">{res.date}</TableCell>
                  <TableCell align="center">{res.value}</TableCell>
                  <TableCell align="center">{res.interpretation ?? '-'}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        className={classes.pagination}
        count={Math.ceil(patientLabResults.length / labItemNumber)}
        shape="rounded"
        onChange={handleChange}
      />
    </Grid>
  )
}

export default PatientLaboTable
