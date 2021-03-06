import React from 'react'

import { Card, CardContent, Divider, Grid, Typography, CardActions } from '@material-ui/core'
import LockIcon from '@material-ui/icons/Lock'
import { Link } from 'react-router-dom'

import PatientSearchBar from 'components/PatientSearchBar/PatientSearchBar'
import Title from 'components/Title'
import { useAppSelector } from 'state'

const PatientSearchCard = () => {
  const deidentifiedBoolean = useAppSelector((state) => state.me?.deidentified ?? true)

  return (
    <Card>
      <CardContent>
        <Title>Chercher un patient dans votre périmètre</Title>
        <Divider />
      </CardContent>
      {deidentifiedBoolean ? (
        <CardActions>
          <Grid container justify="center">
            <LockIcon />
            <Typography variant="h6">Fonctionnalité désactivée en mode pseudonymisé.</Typography>
          </Grid>
        </CardActions>
      ) : (
        <CardActions>
          <PatientSearchBar />
          <Link to="/rechercher_patient">Recherche avancée</Link>
        </CardActions>
      )}
    </Card>
  )
}

export default PatientSearchCard
