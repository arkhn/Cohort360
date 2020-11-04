import React from 'react'
import clsx from 'clsx'
import { Grid, Paper, Container, Typography } from '@material-ui/core'
import SearchPatientCard from '../../components/Welcome/SearchPatientCard/SearchPatientCard'
import PatientsCard from '../../components/Welcome/PatientsCard/PatientsCard'
import NewsCard from '../../components/Welcome/NewsCard/NewsCard'
import TutorialsCard from '../../components/Welcome/TutorialsCard/TutorialsCard'
import ResearchCard from '../../components/Welcome/ResearchCard/ResearchCard'

import useStyles from './styles'
import { useAppSelector } from 'state'
import {
  fetchFavoriteCohorts,
  fetchLastCohorts
} from 'services/savedResearches'

const Accueil: React.FC = () => {
  const classes = useStyles()
  const { practitioner, open } = useAppSelector((state) => ({
    practitioner: state.me,
    open: state.drawer
  }))

  return practitioner ? (
    <Grid
      container
      className={clsx(classes.root, classes.appBar, {
        [classes.appBarShift]: open
      })}
    >
      <Container maxWidth="lg" className={classes.container}>
        <Typography
          component="h1"
          variant="h1"
          color="inherit"
          noWrap
          className={classes.title}
        >
          Bienvenue {practitioner.displayName}
        </Typography>
      </Container>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={6}>
            <Grid item>
              <Paper className={classes.paper}>
                <PatientsCard />
              </Paper>
            </Grid>
            <Grid item className={classes.pt3}>
              <Paper className={classes.paper}>
                <SearchPatientCard />
              </Paper>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <Grid item xs={12} md={12} lg={12}>
              <Paper className={classes.paper}>
                <NewsCard />
              </Paper>
            </Grid>
            <Grid item xs={12} md={12} lg={12} className={classes.pt3}>
              <Paper className={classes.paper}>
                <TutorialsCard />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
            <Paper className={classes.paper}>
              <ResearchCard
                title={'Mes cohortes favorites'}
                fetchCohort={fetchFavoriteCohorts}
              />
            </Paper>
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
            <Paper className={classes.paper}>
              <ResearchCard
                title={'Mes dernières cohortes créées'}
                fetchCohort={fetchLastCohorts}
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Grid>
  ) : null
}

export default Accueil
