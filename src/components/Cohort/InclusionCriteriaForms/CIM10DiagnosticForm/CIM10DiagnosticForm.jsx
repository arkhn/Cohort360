import React, { useState, useEffect } from 'react'
import {
  Typography,
  Paper,
  Button,
  FormControl,
  Input,
  TextField,
  FormLabel,
  Select,
  MenuItem
} from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { useHistory, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import useStyles from './styles'
import { addInclusionCriteria } from '../../../../state/cohortCreation'
import * as cimData from '../../../../data/cim9_data.json'
import CIMTypes from '../../../../data/CIMTypes'

const styles = {
  formControlsContainer: {
    flex: 1,
    padding: '1em',
    display: 'flex',
    flexDirection: 'column'
  },
  buttonsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '2em',
    backgroundColor: '#F5F8FA',
    borderTop: '1px solid #CCCCCD'
  },
  endAdornmentContainer: {
    display: 'flex'
  }
}

const CIM10DiagnosticForm = (props) => {
  const classes = useStyles()
  const { index } = useParams()
  const inclusionCriteria = useSelector((state) => {
    return index ? state.cohortCreation.inclusionCriterias[index] : undefined
  })
  const [criteriaName, setCriteriaName] = useState(
    inclusionCriteria ? inclusionCriteria.name : ''
  )
  const [selectedCimDiagnosis, setSelectedCimDiagnosis] = useState(
    inclusionCriteria ? inclusionCriteria.CIMDiagnosis : null
  )
  const [selectedCimType, setCimType] = useState(
    inclusionCriteria ? inclusionCriteria.CIMTypeId : CIMTypes[0].id
  )
  const [searchValue, setSearchValue] = useState(
    inclusionCriteria ? inclusionCriteria.CIMDiagnosis['DIAGNOSIS CODE'] : ''
  )
  const history = useHistory()
  const dispatch = useDispatch()

  const [CIMData, setCIMData] = useState([])
  useEffect(() => {
    const filteredCimData = cimData.default
      .filter((data) => data['DIAGNOSIS CODE'].startsWith(searchValue))
      .slice(0, 100)
    setCIMData(filteredCimData)
  }, [searchValue])

  return (
    <>
      <Paper component="form" classes={{ root: classes.formContainer }}>
        <div style={styles.formControlsContainer}>
          <Typography variant="subtitle1">Diagnostiques CIM9/CIM10</Typography>
          <FormControl classes={{ root: classes.formControl }}>
            <Input
              fullWidth
              placeholder="Nom du critère"
              classes={{ root: classes.formInput }}
              disableUnderline
              onChange={(event) => {
                setCriteriaName(event.target.value)
              }}
              value={criteriaName}
            />
          </FormControl>
          <FormControl classes={{ root: classes.formControl }}>
            <FormLabel>Select CIM version</FormLabel>
            <Select
              value={selectedCimType}
              onChange={(event) => {
                setSelectedCimDiagnosis(null)
                setCimType(event.target.value)
              }}
            >
              {CIMTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl classes={{ root: classes.formControl }}>
            <Autocomplete
              options={CIMData}
              getOptionLabel={(option) => option['DIAGNOSIS CODE']}
              disabled={selectedCimType === CIMTypes[1].id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={`${CIMTypes.find((type) => type.id === selectedCimType).value} Diag Code`}
                  variant="outlined"
                />
              )}
              onChange={(event, value) => {
                setSelectedCimDiagnosis(value ? value : null)
              }}
              onInputChange={(event, value, reason) => {
                setSearchValue(value)
              }}
            />
            {null !== selectedCimDiagnosis && (
              <Typography>
                {selectedCimDiagnosis['LONG DESCRIPTION']}
              </Typography>
            )}
          </FormControl>
        </div>
        <div style={styles.buttonsContainer}>
          <Button
            classes={{ root: classes.cancelButton }}
            onClick={() => {
              history.push('/cohort/new/inclusionDiagram/')
            }}
          >
            Annuler
          </Button>
          <Button
            classes={{ root: classes.submitButton }}
            disabled={null === selectedCimDiagnosis}
            onClick={() => {
              dispatch(
                addInclusionCriteria(
                  {
                    type: 'Diagnostiques CIM',
                    name: criteriaName,
                    CIMTypeId: CIMTypes.find(
                      (type) => type.id === selectedCimType
                    ).id,
                    CIMDiagnosis: selectedCimDiagnosis
                  },
                  index
                )
              )
              history.push('/cohort/new/inclusionDiagram')
            }}
          >
            Ajouter le critère
          </Button>
        </div>
      </Paper>
    </>
  )
}

export default CIM10DiagnosticForm
