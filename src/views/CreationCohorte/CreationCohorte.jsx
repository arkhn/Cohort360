import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { useSelector } from 'react-redux'

import TopBar from '../../components/TopBar/TopBar'
import InclusionDiagram from '../../components/Cohort/InclusionDiagram/InclusionDiagram'
import useStyles from './styles'

import api from '../../services/api'

const fetchPatientNumber = async () => {
  const response = await api.get('Patient?_summary=count')
  if (!response) return 0

  return response.data ? response.data.total : 0
}

const CreationCohorte = () => {
  const [patientNb, setPatientNb] = useState(undefined)
  const classes = useStyles()

  useEffect(() => {
    fetchPatientNumber().then((patientNumber) => setPatientNb(patientNumber))
  }, [])

  const open = useSelector((state) => state.drawer)

  return (
    <div position="fixed" className={clsx(classes.appBar, { [classes.appBarShift]: open })}>
      <TopBar
        status="Création de cohorte"
        patientsNb={patientNb}
        access="Nominatif"
        fav
        save
      />
      <div className={classes.tabContainer}>
        <InclusionDiagram />
      </div>
    </div>
  )
}

export default CreationCohorte
