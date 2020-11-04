import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import {
  CircularProgress,
  Tabs,
  Tab,
  Typography,
  Button,
  Divider,
  FormControl,
  Input
} from '@material-ui/core'

import { buildFhirCohort } from '../../../../services/cohortCreation'
import {
  resetCohortCreation,
  setCohortName
} from '../../../../state/cohortCreation'
import useStyles from './styles'

// const styles = {
//   rightPanelContainerStyle: {
//     position: 'fixed',
//     height: 'calc(100% - 72px)',
//     bottom: '0px',
//     right: '0px',
//     border: '1px solid #CCCCCD',
//     backgroundColor: 'white',
//     display: 'flex',
//     flexDirection: 'column'
//   },
//   actionTabContainer: {
//     display: 'flex',
//     flexDirection: 'column',
//     flex: 1,
//     overflowY: 'auto'
//   },
//   actionContainer: {
//     display: 'flex',
//     flexDirection: 'column',
//     flex: 1,
//     justifyContent: 'space-between'
//   }
// }

const TabContentWrapper = (props) => {
  const { children, value, index, ...other } = props

  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && children}
    </div>
  )
}

TabContentWrapper.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
}

const ActionPanel = () => {
  const history = useHistory()
  const classes = useStyles()
  const dispatch = useDispatch()
  const cohortName = useSelector((state) => state.cohortCreation.cohortName)
  const populationSources = useSelector(
    (state) => state.cohortCreation.populationSources
  )
  const inclusionCriteria = useSelector(
    (state) => state.cohortCreation.inclusionCriterias
  )
  const practitioner = useSelector((state) => state.practitioner)
  const [isCreatingCohort, setIsCreatingCohort] = useState(false)

  const buildCohort = useCallback(async () => {
    setIsCreatingCohort(true)
    const cohort = await buildFhirCohort(
      practitioner,
      inclusionCriteria,
      populationSources,
      cohortName
    )
    setIsCreatingCohort(false)
    dispatch(resetCohortCreation())
    return cohort
  }, [populationSources, inclusionCriteria, cohortName]) // eslint-disable-line

  return (
    <div className={classes.actionContainer}>
      <div>
        <div>
          <FormControl classes={{ root: classes.formControl }}>
            <Input
              fullWidth
              placeholder="Nom de la cohorte"
              classes={{ root: classes.formInput }}
              disableUnderline
              onChange={(event) => {
                dispatch(setCohortName(event.target.value))
              }}
              value={cohortName}
            />
          </FormControl>
        </div>
        <Divider />
        {/* <div>
          <Button startIcon={<PlayIcon />} size="large" fullWidth>
            Exécuter la requête de sélection
          </Button>
        </div> */}
        <Divider />
        <div>
          <Button
            classes={{ label: classes.label }}
            size="large"
            fullWidth
            onClick={async () => {
              const groupResp = await buildCohort()
              history.push(`/cohort/${groupResp.id}/apercu`)
            }}
            disabled={isCreatingCohort}
          >
            {isCreatingCohort ? (
              <CircularProgress size={20} />
            ) : (
              <Typography variant="button">Créer une cohorte</Typography>
            )}
            {/* <Typography variant="caption">Temps estimé: 1h32</Typography> */}
          </Button>
        </div>
        <Divider />
        {/* <div style={{ margin: '1em' }}>
          <Typography variant="subtitle1">Mise à jour automatique</Typography>
          <Select value={'0'} disabled fullWidth>
            <MenuItem value={'0'}>Non</MenuItem>
            <MenuItem value={'1'}>Oui</MenuItem>
          </Select>
        </div> */}
      </div>
      {/* <div style={{ backgroundColor: '#F7F7F7' }}>
        <Grid container>
          <List classes={{ root: classes.listRoot }}>
            <ListItem classes={{ root: classes.mainListItem }}>
              <Typography
                classes={{ root: classes.itemLabel }}
                variant="subtitle1"
              >
                Patients inclus
              </Typography>
              <Typography
                classes={{ root: classes.itemValue }}
                variant="subtitle1"
              >
                3567
              </Typography>
            </ListItem>
            <ListItem classes={{ root: classes.listItemRoot }}>
              <Typography classes={{ root: classes.itemLabel }} variant="body1">
                Par requête
              </Typography>
              <Typography classes={{ root: classes.itemValue }} variant="body1">
                +3555
              </Typography>
            </ListItem>
            <ListItem classes={{ root: classes.listItemRoot }}>
              <Typography classes={{ root: classes.itemLabel }} variant="body1">
                Inclusion manuelle
              </Typography>
              <Typography classes={{ root: classes.itemValue }} variant="body1">
                +266
              </Typography>
            </ListItem>
            <ListItem classes={{ root: classes.listItemRoot }}>
              <Typography classes={{ root: classes.itemLabel }} variant="body1">
                Exclusion manuelle
              </Typography>
              <Typography
                classes={{ root: classes.exclusionItemValue }}
                variant="body1"
              >
                -5
              </Typography>
            </ListItem>
          </List>
        </Grid>
        <Grid container>
          <List classes={{ root: classes.listRoot }}>
            <ListItem classes={{ root: classes.listItemRoot }}>
              <Typography classes={{ root: classes.itemLabel }} variant="body1">
                Patients vivants
              </Typography>
              <Typography classes={{ root: classes.itemValue }} variant="body1">
                1234
              </Typography>
            </ListItem>
            <ListItem classes={{ root: classes.listItemRoot }}>
              <Typography classes={{ root: classes.itemLabel }} variant="body1">
                Patients décédés
              </Typography>
              <Typography classes={{ root: classes.itemValue }} variant="body1">
                849
              </Typography>
            </ListItem>
            <ListItem classes={{ root: classes.listItemRoot }}>
              <Typography classes={{ root: classes.itemLabel }} variant="body1">
                Nombre de femmes
              </Typography>
              <Typography classes={{ root: classes.itemValue }} variant="body1">
                2310
              </Typography>
            </ListItem>
            <ListItem classes={{ root: classes.listItemRoot }}>
              <Typography classes={{ root: classes.itemLabel }} variant="body1">
                Nombre d'hommes
              </Typography>
              <Typography classes={{ root: classes.itemValue }} variant="body1">
                1549
              </Typography>
            </ListItem>
          </List>
        </Grid>
      </div> */}
    </div>
  )
}

const ValidationPanel = () => {
  const classes = useStyles()
  const [selectedTab, selectTab] = useState('0')

  const handleTabChange = (event, newValue) => {
    selectTab(newValue)
  }

  return (
    <div className={classes.rightPanelContainerStyle}>
      <Tabs value={selectedTab} onChange={handleTabChange}>
        <Tab
          classes={{
            root: classes.tabTitle,
            selected: classes.selectedTabTitle
          }}
          label="ACTIONS"
          value="0"
        />
        <Tab
          classes={{
            root: classes.tabTitle,
            selected: classes.selectedTabTitle,
            disabled: classes.disabledTabTitle
          }}
          label="COMMENTAIRES"
          value="1"
          disabled
        />
      </Tabs>
      <TabContentWrapper
        index={'0'}
        value={selectedTab}
        className={classes.actionTabContainer}
      >
        <ActionPanel />
      </TabContentWrapper>
    </div>
  )
}

export default ValidationPanel
