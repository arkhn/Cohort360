import React, { useState } from 'react'
import useStyles from './styles'
import PropTypes from 'prop-types'
import {
  Container,
  Paper,
  Typography,
  IconButton,
  Button,
  Divider,
  InputBase
} from '@material-ui/core'
import Close from '@material-ui/icons/Close'
import ArrowBack from '@material-ui/icons/ArrowBack'
import Search from '@material-ui/icons/Search'
import { Route, Switch, useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { setPopulationSource } from '../../../../state/cohortCreation'
import ScopeTree from '../../../ScopeTree/ScopeTree'
import MedicalDocumentForm from '../../InclusionCriteriaForms/MedicalDocumentForm/MedicalDocumentForm'
import PatientDemographyForm from '../../InclusionCriteriaForms/PatientDemographyForm/PatientDemographyForm'
import CIM10DiagnosticForm from '../../InclusionCriteriaForms/CIM10DiagnosticForm/CIM10DiagnosticForm'

const rightPanelContainerStyle = (large) => {
  return {
    position: 'fixed',
    height: '100vh',
    width: large ? '800px' : '500px',
    top: '0px',
    right: '0px',
    border: '1px solid #CCCCCD',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'scroll'
  }
}
const headerRightStyle = {
  display: 'flex',
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginLeft: '1em',
  alignItems: 'center'
}

const RightPanel = ({ back, title, content, large, ...props }) => {
  const classes = useStyles()
  const history = useHistory()
  return (
    <div style={rightPanelContainerStyle(large)}>
      <Paper classes={{ root: classes.headerRoot }} square>
        {back && (
          <>
            <IconButton
              classes={{ root: classes.icon }}
              onClick={history.goBack}
            >
              <ArrowBack />
            </IconButton>
            <Divider
              orientation="vertical"
              classes={{ root: classes.dividerRoot }}
            />
          </>
        )}
        <div style={headerRightStyle}>
          <Typography>{title}</Typography>
          <IconButton
            classes={{ root: classes.icon }}
            onClick={() => {
              history.push('/cohort/new/inclusionDiagram')
            }}
          >
            <Close />
          </IconButton>
        </div>
      </Paper>
      {content}
    </div>
  )
}
RightPanel.propTypes = {
  back: PropTypes.bool,
  title: PropTypes.string.isRequired,
  content: PropTypes.node.isRequired,
  large: PropTypes.bool
}

const PopulationSelectionPanel = (props) => {
  const history = useHistory()
  const dispatch = useDispatch()

  const submitPerimeters = (selectedPopulations) => {
    const onlyParents = new Set()
    selectedPopulations.forEach((element) => {
      let found
      for (const e of selectedPopulations) {
        if (e.id === element.parentId) {
          found = true
        }
      }

      if (!element.parentId || !found) {
        onlyParents.add(element)
      }
    })

    dispatch(setPopulationSource([...onlyParents]))

    history.push('/cohort/new/inclusionDiagram')
  }

  return (
    <RightPanel
      title="Selectionner une population source"
      content={<ScopeTree submit={submitPerimeters} />}
      large
    />
  )
}

const ActionSelectionPanel = (props) => {
  const classes = useStyles()
  const actionContent = (
    <Container classes={{ root: classes.subContainerRoot }}>
      <ActionButton
        url="/cohort/new/inclusionDiagram/addAction/addInclusionCriteria"
        leftColor="#317EAA"
        title={"Ajouter un critère d'inclusion"}
      />
      <ActionButton
        leftColor="#317EAA"
        disabled
        title={"Ajouter un groupe de critères d'inclusion"}
      />
      <ActionButton
        leftColor="#FFC543"
        disabled
        title={"Ajouter un évènement d'entrée"}
      />
      <ActionButton
        leftColor="#FFC543"
        disabled
        title={'Ajouter un évènement de sortie'}
      />
    </Container>
  )
  return <RightPanel title="Sélectionner une action" content={actionContent} />
}

const ActionButton = ({ url, title, leftColor, disabled, ...props }) => {
  const classes = useStyles()
  const history = useHistory()
  return (
    <Button
      classes={{ root: classes.buttonRoot }}
      variant="outlined"
      disabled={disabled}
      onClick={() => {
        history.push(url)
      }}
    >
      <div
        style={{
          backgroundColor: leftColor,
          height: '100%',
          padding: '1rem',
          marginRight: '1rem'
        }}
      />
      <Typography>{title}</Typography>
    </Button>
  )
}

ActionButton.propTypes = {
  title: PropTypes.string,
  url: PropTypes.string,
  leftColor: PropTypes.string,
  disabled: PropTypes.bool
}

const InclusionCriteriaPanel = (props) => {
  const classes = useStyles()
  const history = useHistory()
  const [searchValue, setSearchValue] = useState('')
  const searchIconButton = (
    <IconButton
      classes={{ root: classes.searchIcon }}
      onClick={() => console.log(searchValue)}
    >
      <Search />
    </IconButton>
  )
  const criteriaPanelContent = (
    <Container classes={{ root: classes.subContainerRoot }}>
      <InputBase
        classes={{ root: classes.searchBar }}
        placeholder="Rechercher un critère"
        endAdornment={searchIconButton}
        fullWidth
        onChange={(event) => {
          setSearchValue(event.target.value)
        }}
      />
      <Typography classes={{ root: classes.panelSubTitle }}>
        Type de critère
      </Typography>
      {/* <CriteriaTypeButton
        label="Prise en charge"
        leftColor="#317EAA"
        onClick={() => {
          console.log('')
        }}
      /> */}
      <CriteriaTypeButton
        label="Démographie patient"
        leftColor="#317EAA"
        onClick={() => {
          history.push(
            '/cohort/new/inclusionDiagram/addAction/addInclusionCriteria/patientDemography'
          )
        }}
      />
      <CriteriaTypeButton
        label="Diagnostiques CIM10"
        leftColor="#317EAA"
        onClick={() => {
          history.push(
            '/cohort/new/inclusionDiagram/addAction/addInclusionCriteria/cimDiagnostic'
          )
        }}
      />
      {/* <CriteriaTypeButton
        label="Actes CCAM"
        leftColor="#317EAA"
        onClick={() => {
          console.log('')
        }}
      /> */}
      {/* <CriteriaTypeButton
        label="Résultats de laboratoire"
        leftColor="#317EAA"
        onClick={() => {
          console.log('')
        }}
      /> */}
      {/* <CriteriaTypeButton
        label="Prescription"
        leftColor="#317EAA"
        onClick={() => {
          console.log('')
        }}
      /> */}
      <CriteriaTypeButton
        label="Documents médicaux"
        leftColor="#317EAA"
        onClick={() => {
          history.push(
            '/cohort/new/inclusionDiagram/addAction/addInclusionCriteria/medicalDoc'
          )
        }}
      />
    </Container>
  )
  return (
    <RightPanel
      title={"Ajouter un critère d'inclusion"}
      back
      content={criteriaPanelContent}
    />
  )
}

const CriteriaTypeButton = ({ label, onClick, leftColor, ...props }) => {
  const classes = useStyles()
  return (
    <Button classes={{ root: classes.criteriaButtonRoot }} onClick={onClick}>
      <div
        style={{
          backgroundColor: leftColor,
          height: '100%',
          padding: '1rem',
          marginRight: '1rem',
          borderRadius: '10px'
        }}
      />
      <Typography>{label}</Typography>
    </Button>
  )
}
CriteriaTypeButton.propTypes = {
  label: PropTypes.string,
  onClick: PropTypes.func,
  leftColor: PropTypes.string
}

const InclusionDiagramRightPanel = () => {
  return (
    <Switch>
      <Route path={'/cohort/new/inclusionDiagram/selectPopulation'}>
        <PopulationSelectionPanel />
      </Route>
      <Route exact path={'/cohort/new/inclusionDiagram/addAction'}>
        <ActionSelectionPanel />
      </Route>
      <Route
        exact
        path={'/cohort/new/inclusionDiagram/addAction/addInclusionCriteria'}
      >
        <InclusionCriteriaPanel />
      </Route>
      <Route
        path={
          '/cohort/new/inclusionDiagram/addAction/addInclusionCriteria/medicalDoc/:index'
        }
      >
        <RightPanel
          title={"Modifier un critère d'inclusion"}
          back
          content={<MedicalDocumentForm />}
        />
      </Route>
      <Route
        path={
          '/cohort/new/inclusionDiagram/addAction/addInclusionCriteria/medicalDoc'
        }
      >
        <RightPanel
          title={"Ajouter un critère d'inclusion"}
          back
          content={<MedicalDocumentForm />}
        />
      </Route>
      <Route
        path={
          '/cohort/new/inclusionDiagram/addAction/addInclusionCriteria/patientDemography/:index'
        }
      >
        <RightPanel
          title={"Modifier un critère d'inclusion"}
          back
          content={<PatientDemographyForm />}
        />
      </Route>
      <Route
        path={
          '/cohort/new/inclusionDiagram/addAction/addInclusionCriteria/patientDemography'
        }
      >
        <RightPanel
          title={"Ajouter un critère d'inclusion"}
          back
          content={<PatientDemographyForm />}
        />
      </Route>
      <Route
        path={
          '/cohort/new/inclusionDiagram/addAction/addInclusionCriteria/cimDiagnostic/:index'
        }
      >
        <RightPanel
          title={"Modifier un critère d'inclusion"}
          back
          content={<CIM10DiagnosticForm />}
        />
      </Route>
      <Route
        path={
          '/cohort/new/inclusionDiagram/addAction/addInclusionCriteria/cimDiagnostic'
        }
      >
        <RightPanel
          title={"Ajouter un critère d'inclusion"}
          back
          content={<CIM10DiagnosticForm />}
        />
      </Route>
    </Switch>
  )
}

export default InclusionDiagramRightPanel
