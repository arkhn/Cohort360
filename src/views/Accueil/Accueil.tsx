import React, { useEffect } from 'react'
import moment from 'moment'
import clsx from 'clsx'
import { Grid, Paper, Container, Typography } from '@material-ui/core'

import PerimeterCard from 'features/perimeters/PerimeterCard'
import SearchPatientCard from 'features/patients/SearchPatientCard'
import ResearchCard from '../../components/Welcome/ResearchCard/ResearchCard'

import { useAppSelector, useAppDispatch } from 'state'
import { initUserCohortsThunk } from 'state/userCohorts'

import useStyles from './styles'

const Accueil: React.FC = () => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const { practitioner, open, lastCohorts } = useAppSelector((state) => ({
    practitioner: state.me,
    open: state.drawer,
    lastCohorts: state.userCohorts.lastCohorts
  }))

  const lastConnection = practitioner?.lastConnection
    ? moment(practitioner.lastConnection).format('[Dernière connexion: ]ddd DD MMMM YYYY[, à ]HH:mm')
    : ''

  useEffect(() => {
    dispatch(initUserCohortsThunk())
  }, [dispatch])

  return practitioner ? (
    <Grid
      container
      className={clsx(classes.root, classes.appBar, {
        [classes.appBarShift]: open
      })}
    >
      <Container maxWidth="lg" className={classes.container}>
        <Typography component="h1" variant="h1" color="inherit" noWrap className={classes.title}>
          Bienvenue {practitioner.displayName}
        </Typography>
        <Typography component="h6" variant="h6" color="inherit" noWrap className={classes.title}>
          {lastConnection}
        </Typography>
      </Container>
      <Container maxWidth="lg" className={classes.container} style={{ minHeight: 'calc(100vh - 70px)' }}>
        <Grid container spacing={2} direction="column">
          <Grid item container spacing={2}>
            <Grid item xs={12} md={6}>
              <PerimeterCard />
            </Grid>
            <Grid item xs={12} md={6}>
              <SearchPatientCard />
            </Grid>
          </Grid>
          <Grid item container>
            <Grid item xs={12} md={12} lg={12}>
              <Paper className={classes.paper}>
                <ResearchCard title={'Mes dernières cohortes créées'} cohorts={lastCohorts} />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Grid>
  ) : null
}

export default Accueil
