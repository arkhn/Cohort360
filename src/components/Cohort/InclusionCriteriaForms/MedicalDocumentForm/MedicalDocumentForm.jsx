import React, { useState } from 'react'
import {
  Typography,
  Paper,
  FormControl,
  Button,
  Input,
  IconButton,
  Select,
  MenuItem
} from '@material-ui/core'
import Search from '@material-ui/icons/Search'
import Close from '@material-ui/icons/Close'
import { useHistory, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import useStyles from './styles'
import { addInclusionCriteria } from '../../../../state/cohortCreation'
import criteriaSearchFields from '../../../../data/criteriaSearchField'

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

const MedicalDocumentForm = (props) => {
  const classes = useStyles()
  const { index } = useParams()
  const inclusionCriteria = useSelector((state) => {
    return index ? state.cohortCreation.inclusionCriterias[index] : undefined
  })
  const [criteriaName, setCriteriaName] = useState(
    inclusionCriteria ? inclusionCriteria.name : ''
  )
  const [searchValue, setSearchValue] = useState(
    inclusionCriteria ? inclusionCriteria.searchValue : ''
  )
  const [searchFieldCode, setSearchField] = useState(
    inclusionCriteria
      ? inclusionCriteria.searchFieldCode
      : criteriaSearchFields[0].code
  )
  const history = useHistory()
  const dispatch = useDispatch()

  const searchInputEndAdornment = (
    <div style={styles.endAdornmentContainer}>
      <IconButton
        classes={{ root: classes.iconButtonRoot }}
        onClick={() => setSearchValue('')}
      >
        <Close />
      </IconButton>
      <IconButton classes={{ root: classes.iconButtonRoot }}>
        <Search />
      </IconButton>
    </div>
  )

  return (
    <>
      <Paper component="form" classes={{ root: classes.formContainer }}>
        <div style={styles.formControlsContainer}>
          <Typography variant="subtitle1">Documents médicaux</Typography>
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
            <Input
              fullWidth
              placeholder="Rechercher"
              classes={{ root: classes.formInput }}
              disableUnderline
              onChange={(event) => {
                setSearchValue(event.target.value)
              }}
              endAdornment={searchInputEndAdornment}
              value={searchValue}
            />
          </FormControl>
          <Typography variant="subtitle2">Rechercher dans :</Typography>
          <FormControl classes={{ root: classes.formControl }}>
            <Select
              value={searchFieldCode}
              onChange={(event) => {
                setSearchField(event.target.value)
              }}
            >
              {criteriaSearchFields.map((criteriaSearchField) => (
                <MenuItem
                  key={criteriaSearchField.code}
                  value={criteriaSearchField.code}
                >
                  {criteriaSearchField.value}
                </MenuItem>
              ))}
            </Select>
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
            disabled={searchValue === ''}
            onClick={() => {
              dispatch(
                addInclusionCriteria(
                  {
                    type: 'Document médical',
                    name: criteriaName,
                    searchValue,
                    searchFieldCode
                  },
                  index
                )
              )
              history.push('/cohort/new/inclusionDiagram/')
            }}
          >
            Ajouter le critère
          </Button>
        </div>
      </Paper>
    </>
  )
}

export default MedicalDocumentForm
