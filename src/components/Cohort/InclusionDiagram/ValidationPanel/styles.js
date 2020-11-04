import { makeStyles } from '@material-ui/core/styles'

export default makeStyles((theme) => ({
  tabTitle: {
    minWidth: 0,
    color: '#43425D',
    backgroundColor: '#E4E4E4',
    flex: 1
  },
  selectedTabTitle: {
    color: '#43425D'
  },
  tabContainer: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  },
  disabledTabTitle: {
    color: 'white',
    backgroundColor: '#E4E4E4'
  },
  label: {
    alignItems: 'flex-start',
    flexDirection: 'column'
  },
  listRoot: {
    width: '100%'
  },
  listItemRoot: {
    justifyContent: 'space-between'
  },
  mainListItem: {
    fontWeight: 'bold',
    justifyContent: 'space-between'
  },
  itemLabel: {
    color: '#6B6B6B',
    fontWeight: 'inherit'
  },
  itemValue: {
    color: '#327EAA',
    fontWeight: 'inherit'
  },
  exclusionItemValue: {
    color: '#DA6A6B',
    fontWeight: 'inherit'
  },
  formControl: {
    padding: '1em',
    width: '100%'
  },
  formInput: {
      border: '1px solid #D7DAE3',
      borderRadius: '5px',
      padding: '0.5em'
  },
  rightPanelContainerStyle: {
    position: 'fixed',
    height: 'calc(100% - 72px)',
    bottom: '0px',
    right: '0px',
    border: '1px solid #CCCCCD',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column'
  },
  actionTabContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflowY: 'auto'
  },
  actionContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'space-between'
  }
}))
