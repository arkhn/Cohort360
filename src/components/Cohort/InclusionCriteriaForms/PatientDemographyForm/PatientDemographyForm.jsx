import React, { useState } from 'react'
import {
  Typography,
  Paper,
  Radio,
  FormLabel,
  FormControlLabel,
  Button,
  RadioGroup,
  FormControl,
  Slider,
  Input
} from '@material-ui/core'
import { useHistory, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import useStyles from './styles'
import { addInclusionCriteria } from '../../../../state/cohortCreation'
import genders from '../../../../data/gender'

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
  },
  ageInputContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
}

const PatientDemographyForm = (props) => {
  const classes = useStyles()
  const { index } = useParams()
  const inclusionCriteria = useSelector((state) => {
    return index ? state.cohortCreation.inclusionCriterias[index] : undefined
  })
  const [criteriaName, setCriteriaName] = useState(
    inclusionCriteria ? inclusionCriteria.name : ''
  )
  const [selectedGenderId, setSelectedGender] = useState(
    inclusionCriteria ? inclusionCriteria.genderId : '3'
  )
  const [ageRange, setAgeRange] = useState(
    inclusionCriteria
      ? [inclusionCriteria.ageMin, inclusionCriteria.ageMax]
      : [0, 100]
  )
  const history = useHistory()
  const dispatch = useDispatch()

  const getThumbToolTip = (value, index) => {
    return value === 100 ? `${value.toString()}+` : value.toString()
  }

  const handleAgeInputChange = (event, isMin) => {
    const numberValue = parseInt(event.target.value)
    if (isNaN(numberValue)) {
      if (isMin) {
        setAgeRange([0, Math.max(0, ageRange[1])])
      } else {
        setAgeRange([Math.min(100, ageRange[0]), 100])
      }
    } else {
      let newAgeMin = 0
      let newAgeMax = 100
      if (isMin) {
        newAgeMin = numberValue < 0 ? 0 : numberValue > 100 ? 100 : numberValue
        newAgeMax = Math.max(ageRange[1], newAgeMin)
      } else {
        newAgeMax = numberValue > 100 ? 100 : numberValue < 0 ? 0 : numberValue
        newAgeMin = Math.min(ageRange[0], newAgeMax)
      }
      setAgeRange([newAgeMin, newAgeMax])
    }
  }

  return (
    <>
      <Paper component="form" classes={{ root: classes.formContainer }}>
        <div style={styles.formControlsContainer}>
          <Typography variant="subtitle1">Démographie patient</Typography>
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
            <FormLabel component="legend">Genre</FormLabel>
            <RadioGroup
              aria-label="gender"
              name="gender1"
              value={selectedGenderId}
              onChange={(event, value) => setSelectedGender(value)}
            >
              {genders.map((gender) => (
                <FormControlLabel
                  key={gender.id}
                  value={gender.id}
                  control={<Radio />}
                  label={gender.value}
                />
              ))}
            </RadioGroup>
          </FormControl>
          <FormControl classes={{ root: classes.formControl }}>
            <FormLabel>Fourchette d'âge</FormLabel>
            <Slider
              value={ageRange}
              onChange={(event, newValue) => setAgeRange(newValue)}
              valueLabelDisplay="auto"
              aria-labelledby="range-slider"
              valueLabelFormat={getThumbToolTip}
            />
            <div style={styles.ageInputContainer}>
              <Typography>De</Typography>
              <Input
                classes={{ root: classes.formInput }}
                type="number"
                onChange={(event) => {
                  handleAgeInputChange(event, true)
                }}
                value={ageRange[0]}
              />
              <Typography>à</Typography>
              <Input
                classes={{ root: classes.formInput }}
                type="number"
                onChange={(event) => {
                  handleAgeInputChange(event, false)
                }}
                value={ageRange[1]}
              />
            </div>
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
            onClick={() => {
              dispatch(
                addInclusionCriteria(
                  {
                    type: 'Démographie patient',
                    name: criteriaName,
                    genderId: selectedGenderId,
                    ageMin: ageRange[0],
                    ageMax: ageRange[1]
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

export default PatientDemographyForm
