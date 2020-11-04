import React from 'react'

import {
  Button,
  IconButton,
  InputBase,
  Grid,
  MenuItem,
  Select,
  SvgIcon,
  Typography
} from '@material-ui/core'

import { ReactComponent as FilterList } from '../../../../assets/icones/filter.svg'
import { ReactComponent as ArrowRightIcon } from '../../../../assets/icones/angle-right.svg'
import { ReactComponent as SearchIcon } from '../../../../assets/icones/search.svg'

import PatientFilters from '../../../Filters/PatientFilters/PatientFilters'

import { PatientGenderKind } from '@ahryman40k/ts-fhir-types/lib/R4'
import { SearchByTypes, VitalStatus } from 'types'

import useStyles from './styles'

type PatientSidebarHeaderTypes = {
  searchBy: string
  onChangeSelect: (searchBy: SearchByTypes) => void
  onClickFilterButton: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void
  open: boolean
  onCloseFilterDialog: () => void
  onSubmitDialog: () => void
  gender: PatientGenderKind
  onChangeGender: (gender: PatientGenderKind) => void
  age: [number, number]
  onChangeAge: (newAge: [number, number]) => void
  vitalStatus: VitalStatus
  onChangeVitalStatus: (status: VitalStatus) => void
  searchInput: string
  onChangeSearchInput: (event: {
    target: { value: React.SetStateAction<string> }
  }) => void
  onKeyDownSearchInput: (e: {
    keyCode: number
    preventDefault: () => void
  }) => void
  onSearchPatient: () => void
  onCloseButtonClick: () => void
}
const PatientSidebarHeader: React.FC<PatientSidebarHeaderTypes> = (props) => {
  const classes = useStyles()

  const _onChangeSelect = (
    event: React.ChangeEvent<{
      name?: string | undefined
      value: unknown
    }>,
    child: React.ReactNode
  ) => {
    props.onChangeSelect(event.target.value as SearchByTypes)
  }

  return (
    <div className={classes.root}>
      <Typography variant="h6">Rechercher par :</Typography>
      <Grid container item>
        <Grid container item xs={6}>
          <Select value={props.searchBy} onChange={_onChangeSelect}>
            <MenuItem value={SearchByTypes.text}>Tous les champs</MenuItem>
            <MenuItem value={SearchByTypes.family}>Nom</MenuItem>
            <MenuItem value={SearchByTypes.given}>Prénom</MenuItem>
            <MenuItem value={SearchByTypes.identifier}>IPP</MenuItem>
          </Select>
        </Grid>
        <Grid container item xs={6} justify="flex-end">
          <Button
            variant="contained"
            disableElevation
            startIcon={<FilterList height="15px" fill="#FFF" />}
            className={classes.searchButton}
            onClick={props.onClickFilterButton}
          >
            Filtrer
          </Button>
          <PatientFilters
            open={props.open}
            onClose={props.onCloseFilterDialog}
            onSubmit={props.onSubmitDialog}
            gender={props.gender}
            onChangeGender={props.onChangeGender}
            age={props.age}
            onChangeAge={props.onChangeAge}
            vitalStatus={props.vitalStatus}
            onChangeVitalStatus={props.onChangeVitalStatus}
          />
        </Grid>
      </Grid>
      <Grid container item alignItems="center">
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
            value={props.searchInput}
            onChange={props.onChangeSearchInput}
            onKeyDown={props.onKeyDownSearchInput}
          />
          <IconButton
            type="submit"
            aria-label="search"
            onClick={props.onSearchPatient}
          >
            <SearchIcon fill="#ED6D91" height="15px" />
          </IconButton>
        </Grid>
        <IconButton onClick={props.onCloseButtonClick} aria-label="Fermer">
          <SvgIcon
            component={ArrowRightIcon}
            viewBox="0 0 192 512"
            htmlColor="#5BC5F2"
          />
        </IconButton>
      </Grid>
    </div>
  )
}

export default PatientSidebarHeader
