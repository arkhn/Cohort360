import React from 'react'
import PropTypes from 'prop-types'
import {
  Container,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  CardActions,
  IconButton
} from '@material-ui/core'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import EditIcon from '@material-ui/icons/Edit'
import AddIcon from '@material-ui/icons/Add'

import useStyles from './styles'
import InclusionDiagramRightPanel from './InclusionDiagramRightPanel/InclusionDiagramRightPanel'
import InclusionCriteriaCard from './InclusionDiagramCriteriaCard/InclusionDiagramCriteriaCard'
import ValidationPanel from './ValidationPanel/ValidationPanel'

const PopulationSourceCard = ({ selectedPopulations }) => {
  const classes = useStyles()
  const history = useHistory()

  if (selectedPopulations.length === 0) {
    return (
      <Card classes={{ root: classes.rootCard }}>
        <CardHeader
          title="Population Source"
          classes={{ root: classes.rootCardHeader }}
        />
        <CardContent classes={{ root: classes.rootCardContent }}>
          <Typography>
            Sur quelle population source souhaitez-vous baser votre
            requête/cohorte ?
          </Typography>
        </CardContent>
        <CardActions classes={{ root: classes.rootCardContent }}>
          <Button
            classes={{ root: classes.rootButton }}
            variant="contained"
            onClick={() => {
              history.push('/cohort/new/inclusionDiagram/selectPopulation')
            }}
          >
            Définir une population source
          </Button>
        </CardActions>
      </Card>
    )
  } else {
    return (
      <Card classes={{ root: classes.rootCard }}>
        <CardHeader
          title="Population Source"
          classes={{ root: classes.rootCardHeader }}
          action={
            <IconButton
              onClick={() =>
                history.push('/cohort/new/inclusionDiagram/selectPopulation')
              }
            >
              <EditIcon />
            </IconButton>
          }
        />
        <CardContent classes={{ root: classes.rootCardContent }}>
          <Typography>Patients ayant été pris en charge à :</Typography>
          {selectedPopulations.map((pop, index) => (
            <Typography key={index}>{pop.name}</Typography>
          ))}
        </CardContent>
      </Card>
    )
  }
}
PopulationSourceCard.propType = {
  selectedPopulations: PropTypes.array.isRequired
}

const CardDivider = () => {
  return (
    <div
      style={{
        minHeight: '50px',
        width: '100%',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <div
        style={{ border: '1px solid #C2C2C7', width: '0px', minHeight: '100%' }}
      />
    </div>
  )
}

const InclusionDiagram = (props) => {
  const classes = useStyles()
  const history = useHistory()
  const selectedPopulations = useSelector((state) => {
    return state.cohortCreation.populationSources
  })
  const selectedInclusionCriterias = useSelector((state) => {
    return state.cohortCreation.inclusionCriterias
  })
  return (
    <>
      <Container maxwidth="xs" className={classes.rootContainer}>
        <PopulationSourceCard selectedPopulations={selectedPopulations} />
        {selectedPopulations.length > 0 && (
          <>
            {selectedInclusionCriterias.map((inclCriteria, index) => {
              return (
                <div key={index}>
                  <CardDivider />
                  <InclusionCriteriaCard
                    index={index}
                    inclusionCriteria={inclCriteria}
                  />
                </div>
              )
            })}
            <CardDivider />
            <Button
              classes={{ root: classes.rootButton }}
              variant="contained"
              onClick={() => {
                history.push('/cohort/new/inclusionDiagram/addAction')
              }}
            >
              <AddIcon />
            </Button>
          </>
        )}
      </Container>
      <ValidationPanel />
      <InclusionDiagramRightPanel />
    </>
  )
}

export default InclusionDiagram
