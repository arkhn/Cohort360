import React from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import {
  Card,
  CardHeader,
  IconButton,
  CardContent,
  Typography
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import EditIcon from '@material-ui/icons/Edit'
import { useHistory } from 'react-router'

import criteriaSearchFields from '../../../../data/criteriaSearchField'
import genders from '../../../../data/gender'
import CIMTypes from '../../../../data/CIMTypes'
import { getInclusionCriteriaUrl } from '../../../../utils/url'
import { removeInclusionCriteria } from '../../../../state/cohortCreation'

import useStyles from './styles'

const InclusionCriteriaCard = ({ inclusionCriteria, index }) => {
  const classes = useStyles()
  const history = useHistory()
  const dispatch = useDispatch()

  return (
    <Card classes={{ root: classes.rootCard }}>
      <CardHeader
        title={`C${index + 1} - ${
          inclusionCriteria.name
            ? inclusionCriteria.name
            : "Critère d'inclusion"
        }`}
        classes={{ root: classes.rootCardHeader }}
        action={
          <>
            <IconButton
              onClick={() =>
                history.push(getInclusionCriteriaUrl(inclusionCriteria, index))
              }
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={() => dispatch(removeInclusionCriteria(index))}
            >
              <CloseIcon />
            </IconButton>
          </>
        }
      />
      <CardContent classes={{ root: classes.rootCardContent }}>
        <Typography>{`Dans ${inclusionCriteria.type},`}</Typography>
        {inclusionCriteria.type === 'Document médical' &&
          inclusionCriteria.searchValue &&
          inclusionCriteria.searchFieldCode && (
            <Typography>
              {`Recherche textuelle "${inclusionCriteria.searchValue}" dans "${
                criteriaSearchFields.find(
                  (crit) => crit.code === inclusionCriteria.searchFieldCode
                ).value
              }"`}
            </Typography>
          )}
        {inclusionCriteria.type === 'Démographie patient' &&
          inclusionCriteria.genderId &&
          undefined !== inclusionCriteria.ageMin &&
          undefined !== inclusionCriteria.ageMax && (
            <>
              <Typography>
                {`Genre sélectionné : "${
                  genders.find(
                    (gender) => gender.id === inclusionCriteria.genderId
                  ).value
                }"`}
              </Typography>
              <Typography>
                {inclusionCriteria.ageMin !== inclusionCriteria.ageMax
                  ? `Fourchette d'âge comprise entre ${
                      inclusionCriteria.ageMin
                    } et ${inclusionCriteria.ageMax} ans ${
                      inclusionCriteria.ageMax === 100 ? 'ou plus.' : '.'
                    }`
                  : `Age sélectionné: ${inclusionCriteria.ageMin} ans ${
                      inclusionCriteria.ageMin === 100 ? 'ou plus.' : '.'
                    }`}
              </Typography>
            </>
          )}
        {inclusionCriteria.type === 'Diagnostiques CIM' && (
          <>
            <Typography>
              {`Type CIM sélectionné : ${
                CIMTypes.find((type) => type.id === inclusionCriteria.CIMTypeId)
                  .value
              }`}
            </Typography>
            <Typography>
              {`Diagnostique CIM sélectionné : ${inclusionCriteria.CIMDiagnosis['LONG DESCRIPTION']}`}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  )
}
InclusionCriteriaCard.propType = {
  inclusionCriteria: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired
}

export default InclusionCriteriaCard
