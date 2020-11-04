import React, { useState, useEffect } from 'react'
import Title from '../../Title'
import { Grid, Link } from '@material-ui/core'
import useStyles from './styles'

import ResearchTable from '../../SavedResearch/ResearchTable/ResearchTable'
import { setFavorite } from '../../../services/savedResearches'

type ResearchCardProps = {
  simplified?: boolean
  onClickRow?: (props: any) => void
  title?: string
  fetchCohort: () => Promise<
    | {
        formattedCohort: any
      }
    | undefined
  >
}

const ResearchCard: React.FC<ResearchCardProps> = ({
  onClickRow,
  simplified,
  title,
  fetchCohort
}) => {
  const classes = useStyles()
  const [researches, setResearches] = useState<{ researchId: string }[]>([])

  const page = 1
  const researchLines = 5 // Number of desired lines in the document array

  const onDeleteCohort = async (cohortId: string) => {
    setResearches(researches.filter((r) => r.researchId !== cohortId))
  }

  const onSetCohortFavorite = async (cohortId: string, favStatus: boolean) => {
    setFavorite(cohortId, favStatus)
      .then(() => fetchCohort())
      .then((result) => {
        if (result) {
          setResearches(result.formattedCohort)
        }
      })
  }

  useEffect(() => {
    fetchCohort()
      .then((result) => {
        if (result) {
          setResearches(result.formattedCohort)
        }
      })
  }, []) // eslint-disable-line

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={9}>
          <Title>{title}</Title>
        </Grid>
        <Grid item container xs={3} justify="flex-end">
          <Link
            underline="always"
            className={classes.link}
            href="/recherche_sauvegarde"
          >
            Voir toutes mes cohortes
          </Link>
        </Grid>
      </Grid>
      <Grid item xs={12} className={classes.tableContainer}>
        <ResearchTable
          simplified={simplified}
          researchLines={researchLines}
          researchData={researches}
          onDeleteCohort={onDeleteCohort}
          onSetCohortFavorite={onSetCohortFavorite}
          onClickRow={onClickRow}
          page={page}
        />
      </Grid>
    </>
  )
}

export default ResearchCard
